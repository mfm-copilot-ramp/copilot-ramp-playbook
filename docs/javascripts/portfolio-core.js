/* portfolio-core.js — pure recompute + aggregation across saved estimates.
 *
 * The V2 "cart" (workspace-ui.js) and aggregate ROI intake both need to take a set
 * of saved Bus items (from different producers) and re-derive their CURRENT numbers
 * from inputs — never from the frozen meta/label. This module is the single place
 * that knows how to recompute each producer, so a new producer = one new case here.
 *
 * PURE + engine-injected (no DOM, no globals read directly) so it is Node-testable:
 *   Portfolio.recomputeItem(item, { EstimatorCore, CoworkEstimator })
 *   Portfolio.aggregate(items, engines, opts)
 *   Portfolio.toRoiInput(agg, dials)         // → a ROICore input for the whole set
 *   Portfolio.encodeWorkspace(items) / decodeWorkspace(str)   // share-link codec
 *
 * Invariant: recompute-on-arrival. costUSD / quickEstimate stay the single sources
 * of truth; item.meta is display-only and is IGNORED here.
 */
(function (root) {
  "use strict";

  function num(v, d) { v = parseFloat(v); return isFinite(v) ? v : (d || 0); }
  function isArr(x) { return Object.prototype.toString.call(x) === "[object Array]"; }
  function round(n) { return Math.max(0, Math.round(num(n))); }

  // Effective per-credit $ rate from EstimatorCore.costUSD, without needing its
  // private constant. Lets us invert a $ figure back into an equivalent credit
  // count so ROICore.computeROI reproduces an exact cost for a MIXED portfolio.
  function effRate(EC, basis) {
    if (!EC || typeof EC.costUSD !== "function") return basis === "prepaid" ? 0.01 : 0.01;
    var u = EC.costUSD(1000) || {};
    var per = (basis === "prepaid" ? u.prepaid : u.payg);
    per = num(per) / 1000;
    return per > 0 ? per : 0.01;
  }

  // ── per-producer recompute ────────────────────────────────────────────────
  // Returns a normalized shape regardless of producer:
  //   { ok, id, producer, kind, label, monthlyCredits, monthlyCostUSD,
  //     value: { monthly, minutesPer, perMonth, loadedRatePerHour } | null,
  //     regime, size, note }
  function recomputeItem(item, engines) {
    engines = engines || {};
    var EC = engines.EstimatorCore, CE = engines.CoworkEstimator;
    var out = {
      ok: false, id: (item && item.id) || null,
      producer: (item && item.producer) || null,
      kind: (item && item.kind) || "estimate",
      label: (item && item.label) || "", monthlyCredits: 0, monthlyCostUSD: 0,
      value: null, regime: null, size: null, note: ""
    };
    if (!item || typeof item !== "object") { out.note = "empty item"; return out; }
    var input = item.input || {};
    var basis = (item.meta && item.meta.basis) || "payg";

    if (item.producer === "cowork") {
      if (!CE || typeof CE.quickEstimate !== "function" || !input.cowork) {
        out.note = "cowork engine or input missing"; return out;
      }
      var r = CE.quickEstimate(input.cowork) || {};
      out.monthlyCredits = round(r.monthlyCredits);
      // Cowork dollarizes via its OWN spend model (price/credit + Azure discount).
      out.monthlyCostUSD = num(r.coworkSpend);
      out.value = null; // consumption tool — value is user-driven, not task automation
      out.note = "Value user-driven (Cowork measures consumption, not task automation).";
      out.ok = true;
      return out;
    }

    // default / "studio": recompute from the natural-language scenario text.
    if (!EC || typeof EC.analyzeText !== "function" || input.text == null) {
      out.note = "studio engine or input.text missing"; return out;
    }
    var a = EC.analyzeText(String(input.text)) || {};
    var est = a.estimate || {};
    out.monthlyCredits = round(est.monthly);
    out.regime = est.regime || null;
    out.size = a.size || null;
    var cu = (typeof EC.costUSD === "function") ? EC.costUSD(out.monthlyCredits) : { payg: 0, prepaid: 0 };
    out.monthlyCostUSD = num(basis === "prepaid" ? cu.prepaid : cu.payg);
    // Time-saved value lever (defaults mirror ROICore.QUICK; item may override in meta).
    var dials = (item.meta && item.meta.dials) || {};
    var minutes = num(dials.minutesSaved, 8);
    var rate = num(dials.loadedRate, 45);
    var vol = quickVolume(a.vars);
    out.value = {
      monthly: (minutes * vol / 60) * rate,
      minutesPer: minutes, perMonth: vol, loadedRatePerHour: rate
    };
    out.ok = true;
    return out;
  }

  // Monthly task volume from an analyzeText().vars (mirrors ROICore.quickVolume so
  // Portfolio has no hard dependency on ROICore being loaded for recompute).
  function quickVolume(vars) {
    vars = vars || {};
    if (vars.archetype === "autonomous") return round(vars.events);
    return round(num(vars.users) * num(vars.interactions));
  }

  // ── aggregate a set of items ──────────────────────────────────────────────
  function aggregate(items, engines, opts) {
    opts = opts || {};
    var rows = [];
    (isArr(items) ? items : []).forEach(function (it) {
      var r = recomputeItem(it, engines);
      if (r.ok) rows.push(r);
    });
    var agg = {
      count: rows.length, rows: rows,
      monthlyCredits: 0, monthlyCostUSD: 0, studioValueMonthly: 0,
      byProducer: {}, notes: []
    };
    var hasCowork = false;
    rows.forEach(function (r) {
      agg.monthlyCredits += r.monthlyCredits;
      agg.monthlyCostUSD += r.monthlyCostUSD;
      if (r.value) agg.studioValueMonthly += num(r.value.monthly);
      if (r.producer === "cowork") hasCowork = true;
      var p = r.producer || "studio";
      if (!agg.byProducer[p]) agg.byProducer[p] = { count: 0, monthlyCredits: 0, monthlyCostUSD: 0 };
      agg.byProducer[p].count += 1;
      agg.byProducer[p].monthlyCredits += r.monthlyCredits;
      agg.byProducer[p].monthlyCostUSD += r.monthlyCostUSD;
    });
    agg.monthlyCredits = round(agg.monthlyCredits);
    if (hasCowork) agg.notes.push("Cowork items contribute cost only — their value is user-driven, so tune the value lever below to reflect it.");
    return agg;
  }

  // ── portfolio → ROICore input ─────────────────────────────────────────────
  // Feeds ROICore.computeROI for the WHOLE set. Two exactness tricks keep ROICore
  // untouched while honoring each producer's native cost model:
  //  • cost: pass a synthetic credit count so studio-rate dollarization reproduces
  //    the true MIXED monthly cost (studio credits + cowork spend). ROICore's
  //    costFromCredits(credits) === EstimatorCore.costUSD(credits)[basis].
  //  • value: one aggregate time-saved lever whose monthly value == summed studio
  //    value (minutesPer·perMonth/60·rate). User can tune it in the UI.
  function toRoiInput(agg, dials) {
    dials = dials || {};
    var basis = dials.basis === "prepaid" ? "prepaid" : "payg";
    var EC = dials.EstimatorCore || (typeof root !== "undefined" && root.EstimatorCore) || null;
    var per = effRate(EC, basis);
    var value = dials.valueMonthly != null ? num(dials.valueMonthly) : num(agg && agg.studioValueMonthly);
    var trueCost = num(agg && agg.monthlyCostUSD);
    var syntheticCredits = per > 0 ? Math.round(trueCost / per) : round(agg && agg.monthlyCredits);
    return {
      billingBasis: basis,
      horizonMonths: dials.horizonMonths != null ? num(dials.horizonMonths) : 36,
      band: {
        conservativePct: dials.conservativePct != null ? num(dials.conservativePct) : 70,
        optimisticPct: dials.optimisticPct != null ? num(dials.optimisticPct) : 120
      },
      value: {
        timeSaved: [{
          label: "Aggregate value across " + ((agg && agg.count) || 0) + " saved estimate(s)",
          // minutesPer·perMonth/60·rate === value  (perMonth carries the $ value; rate=1, minutesPer=60)
          minutesPer: 60, perMonth: value, loadedRatePerHour: 1
        }],
        adoption: {
          rampMonths: dials.rampMonths != null ? num(dials.rampMonths) : 6,
          startPct: dials.startPct != null ? num(dials.startPct) : 20,
          endPct: dials.endPct != null ? num(dials.endPct) : 80
        }
      },
      cost: {
        monthlyCredits: syntheticCredits,
        licensing: { seats: 0, pricePerSeatMonth: 30 },
        build: { personDays: dials.personDays != null ? num(dials.personDays) : 0, dayRate: 1200 },
        maintenance: { hoursPerMonth: dials.maintHours != null ? num(dials.maintHours) : 0, hourRate: 120 }
      },
      _meta: {
        portfolio: true, count: (agg && agg.count) || 0,
        realMonthlyCredits: round(agg && agg.monthlyCredits),
        realMonthlyCostUSD: trueCost, valueMonthly: value
      }
    };
  }

  // ── share-link codec (inputs-only; strips display-only meta) ───────────────
  // Encodes to a URL-safe string: JSON → UTF-8 bytes → base64url. decode reverses.
  function _b64encode(s) {
    if (typeof root !== "undefined" && typeof root.btoa === "function") {
      return root.btoa(unescape(encodeURIComponent(s)));
    }
    if (typeof Buffer !== "undefined") return Buffer.from(s, "utf8").toString("base64");
    return s;
  }
  function _b64decode(s) {
    if (typeof root !== "undefined" && typeof root.atob === "function") {
      return decodeURIComponent(escape(root.atob(s)));
    }
    if (typeof Buffer !== "undefined") return Buffer.from(s, "base64").toString("utf8");
    return s;
  }
  function _urlSafe(b64) { return String(b64).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function _unUrlSafe(s) {
    s = String(s).replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    return s;
  }
  function encodeWorkspace(items) {
    var lean = (isArr(items) ? items : []).map(function (i) {
      return { id: i.id, v: i.v || 1, kind: i.kind || "estimate", producer: i.producer || "studio",
               label: i.label || "", input: i.input || {}, refs: isArr(i.refs) ? i.refs : [] };
    });
    try { return _urlSafe(_b64encode(JSON.stringify({ v: 1, items: lean }))); }
    catch (e) { return ""; }
  }
  function decodeWorkspace(str) {
    if (!str) return [];
    try {
      var obj = JSON.parse(_b64decode(_unUrlSafe(str)));
      var arr = obj && isArr(obj.items) ? obj.items : (isArr(obj) ? obj : []);
      return arr.filter(function (i) { return i && typeof i === "object" && i.input; });
    } catch (e) { return []; }
  }

  // ── proposal share-link codec (V3) ─────────────────────────────────────────
  // A proposal is a plain document object (narrative + embedded estimate INPUTS +
  // dials + optional dated snapshot). Same base64url transport as the workspace so
  // the whole codec lives in one place. Still inputs-only: the embedded estimates
  // carry input.text / input.cowork, never a frozen credit number — the live numbers
  // recompute on arrival. The optional snapshot holds display-only quoted figures.
  function encodeProposal(p) {
    try { return _urlSafe(_b64encode(JSON.stringify({ v: 1, proposal: p || {} }))); }
    catch (e) { return ""; }
  }
  function decodeProposal(str) {
    if (!str) return null;
    try {
      var obj = JSON.parse(_b64decode(_unUrlSafe(str)));
      var p = obj && obj.proposal ? obj.proposal : (obj && obj.title != null ? obj : null);
      if (!p || typeof p !== "object") return null;
      if (!isArr(p.items)) p.items = [];
      return p;
    } catch (e) { return null; }
  }

  var api = {
    recomputeItem: recomputeItem,
    quickVolume: quickVolume,
    aggregate: aggregate,
    toRoiInput: toRoiInput,
    encodeWorkspace: encodeWorkspace,
    decodeWorkspace: decodeWorkspace,
    encodeProposal: encodeProposal,
    decodeProposal: decodeProposal,
    effRate: effRate
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof root !== "undefined") root.Portfolio = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

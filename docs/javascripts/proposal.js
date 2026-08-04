/* proposal.js — V3 business-case / proposal composer.
 *
 * The end of the portable-estimates arc: pull selected saved estimates (Studio +
 * Cowork) out of the workspace, recompute their LIVE numbers + an aggregate ROI,
 * wrap them in a narrative (problem / approach / sizing / cost / ROI / assumptions),
 * and export a real deliverable — copy-as-Markdown, download .md, print / Save as
 * PDF, or a portable share link. Optionally FREEZE a dated quote alongside the live
 * numbers (the one deliberate exception to inputs-only recompute).
 *
 * A proposal is stored as a kind:"proposal" Item in the SAME bus/store (additive —
 * no schema change). It EMBEDS the selected estimates' inputs (still inputs-only) so
 * a share link / saved proposal is fully portable and recomputes on arrival.
 *
 * Couples only to window.SiteBus + window.Portfolio + window.ROICore (+ the two
 * estimator engines Portfolio dispatches to). Self-rendering into #proposal-composer.
 */
(function () {
  "use strict";
  if (typeof document === "undefined") return;

  // ── engine getters ──────────────────────────────────────────────────────
  function B() { return window.SiteBus || null; }
  function P() { return window.Portfolio || null; }
  function RC() { return window.ROICore || null; }
  function engines() { return { EstimatorCore: window.EstimatorCore, CoworkEstimator: window.CoworkEstimator }; }
  function el(id) { return document.getElementById(id); }
  function host() { return el("proposal-composer"); }

  // ── helpers ─────────────────────────────────────────────────────────────
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function num(v, d) { v = parseFloat(v); return isFinite(v) ? v : (d || 0); }
  function fmt(n) { return Math.round(num(n)).toLocaleString(); }
  function usd(n) { n = Math.round(num(n)); return "$" + n.toLocaleString(); }
  function pct(n) { return (n == null || !isFinite(n)) ? "n/a" : (Math.round(num(n)) + "%"); }
  function months(n) { return (n == null || !isFinite(n)) ? "beyond horizon" : (Math.round(num(n)) + " mo"); }
  function today() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function param(name) { try { return new URLSearchParams(location.search).get(name) || ""; } catch (e) { return ""; } }
  function stripParams() {
    try {
      var u = new URL(location.href);
      u.searchParams.delete("p"); u.searchParams.delete("from"); u.searchParams.delete("id");
      history.replaceState(null, "", u.pathname + (u.search || "") + (u.hash || ""));
    } catch (e) { /* about:blank — harmless */ }
  }
  function producerLabel(p) { return p === "cowork" ? "Cowork" : p === "roi" ? "ROI" : "Studio"; }

  function copyText(text, msg) {
    var done = function () { status(msg || "Copied \u2713"); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, fallback); return; }
    } catch (e) { /* fall through */ }
    fallback();
    function fallback() {
      try {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "absolute"; ta.style.left = "-9999px";
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand && document.execCommand("copy");
        document.body.removeChild(ta);
        status(ok ? (msg || "Copied \u2713") : "Copy failed \u2014 select and copy manually");
      } catch (e2) { status("Copy failed \u2014 select and copy manually"); }
    }
  }
  function downloadText(name, text, mime) {
    try {
      if (typeof URL === "undefined" || !URL.createObjectURL) { status("Download not supported in this browser"); return; }
      var blob = new Blob([text], { type: (mime || "text/markdown") + ";charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { try { URL.revokeObjectURL(url); } catch (e) {} }, 1500);
      status("Downloaded " + name);
    } catch (e) { status("Download failed"); }
  }
  function status(msg) { var s = el("pc-status"); if (s) s.textContent = msg; }
  function slug(s) {
    s = String(s || "proposal").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return s || "proposal";
  }

  // ── state ───────────────────────────────────────────────────────────────
  // { title, preparedFor, preparedBy, date, problem, approach, notes,
  //   items:[{id,kind,producer,label,input,include}], dials:{valueMonthly,basis,horizonMonths},
  //   snapshot:{date,monthlyCredits,monthlyCostUSD,valueMonthly,roiPct,paybackMonths,horizonMonths}|null,
  //   savedId }
  var state = null;
  var mounted = false;

  function defaultState() {
    return {
      title: "Copilot agent proposal",
      preparedFor: "", preparedBy: "", date: today(),
      problem: "", approach: "", notes: "",
      items: [], dials: { valueMonthly: null, basis: "payg", horizonMonths: 36 },
      snapshot: null, savedId: null
    };
  }

  // Copy a bus/estimate item down to the portable, embeddable shape.
  function embed(it, include) {
    return {
      id: it.id || null, kind: it.kind || "estimate", producer: it.producer || "studio",
      label: it.label || "Untitled estimate", input: it.input || {},
      include: include !== false
    };
  }

  function seedFromWorkspace() {
    var b = B(); if (!b) return [];
    return (b.list({ kind: "estimate" }) || []).map(function (it) { return embed(it, true); });
  }

  function loadSaved(id) {
    var b = B(); if (!b) return null;
    var it = b.get(id); if (!it || it.kind !== "proposal") return null;
    var p = (it.input && it.input.proposal) || null;
    if (!p) return null;
    var st = normalizeProposal(p);
    st.savedId = it.id;
    return st;
  }

  function normalizeProposal(p) {
    var st = defaultState();
    st.title = p.title || st.title;
    st.preparedFor = p.preparedFor || "";
    st.preparedBy = p.preparedBy || "";
    st.date = p.date || today();
    st.problem = p.problem || "";
    st.approach = p.approach || "";
    st.notes = p.notes || "";
    st.items = (P() && Object.prototype.toString.call(p.items) === "[object Array]" ? p.items : []).map(function (it) {
      return embed(it, it.include !== false);
    });
    st.dials = {
      valueMonthly: (p.dials && p.dials.valueMonthly != null) ? num(p.dials.valueMonthly) : null,
      basis: (p.dials && p.dials.basis === "prepaid") ? "prepaid" : "payg",
      horizonMonths: (p.dials && p.dials.horizonMonths != null) ? num(p.dials.horizonMonths) : 36
    };
    st.snapshot = p.snapshot || null;
    st.savedId = null;
    return st;
  }

  function seed() {
    var enc = param("p");
    if (enc && P() && typeof P().decodeProposal === "function") {
      var dp = P().decodeProposal(enc);
      if (dp) { state = normalizeProposal(dp); stripParams(); return; }
    }
    var id = param("id");
    if (id) { var s = loadSaved(id); if (s) { state = s; stripParams(); return; } }
    state = defaultState();
    var from = param("from");
    if (from === "workspace" || from === "estimate") { state.items = seedFromWorkspace(); stripParams(); }
    else { state.items = seedFromWorkspace(); } // default: pull whatever's in the cart
  }

  // ── recompute ───────────────────────────────────────────────────────────
  function includedItems() {
    return (state.items || []).filter(function (it) { return it.include !== false; });
  }
  function recompute() {
    var p = P(); if (!p) return { agg: null, roi: null, value: 0, rows: [] };
    var eng = engines();
    var rows = (state.items || []).map(function (it) { return { it: it, r: p.recomputeItem(it, eng) }; });
    var agg = p.aggregate(includedItems(), eng);
    // Seed the value lever once from aggregate studio value so it shows a real number.
    if (state.dials.valueMonthly == null) state.dials.valueMonthly = Math.round(num(agg.studioValueMonthly));
    var value = num(state.dials.valueMonthly);
    var input = p.toRoiInput(agg, {
      valueMonthly: value, basis: state.dials.basis,
      horizonMonths: state.dials.horizonMonths, EstimatorCore: window.EstimatorCore
    });
    var roi = RC() ? RC().computeROI(input) : null;
    return { agg: agg, roi: roi, value: value, rows: rows };
  }

  // ── markdown builder ────────────────────────────────────────────────────
  function sizingRows(r) {
    return r.rows.filter(function (x) { return x.it.include !== false; }).map(function (x) {
      var rr = x.r;
      return {
        label: x.it.label || "Untitled",
        producer: producerLabel(x.it.producer),
        size: (rr && rr.size) || "\u2014",
        credits: rr && rr.ok ? rr.monthlyCredits : null,
        cost: rr && rr.ok ? rr.monthlyCostUSD : null,
        ok: !!(rr && rr.ok)
      };
    });
  }

  function buildMarkdown(r) {
    var s = state, L = [];
    L.push("# " + (s.title || "Copilot agent proposal"));
    L.push("");
    var meta = [];
    if (s.preparedFor) meta.push("**Prepared for:** " + s.preparedFor);
    if (s.preparedBy) meta.push("**Prepared by:** " + s.preparedBy);
    meta.push("**Date:** " + (s.date || today()));
    L.push(meta.join("  \n"));
    L.push("");

    if (s.problem) { L.push("## Problem"); L.push(""); L.push(s.problem); L.push(""); }
    if (s.approach) { L.push("## Approach"); L.push(""); L.push(s.approach); L.push(""); }

    var rows = sizingRows(r), agg = r.agg || {};
    L.push("## Solution sizing");
    L.push("");
    if (rows.length) {
      L.push("| Component | Producer | Size | Credits / mo | Cost / mo |");
      L.push("|---|---|---|--:|--:|");
      rows.forEach(function (x) {
        L.push("| " + x.label + " | " + x.producer + " | " + x.size + " | " +
          (x.ok ? fmt(x.credits) : "\u2014") + " | " + (x.ok ? usd(x.cost) : "\u2014") + " |");
      });
      L.push("| **Portfolio total** |  |  | **" + fmt(agg.monthlyCredits) + "** | **" + usd(agg.monthlyCostUSD) + "** |");
    } else {
      L.push("_No estimates selected yet._");
    }
    L.push("");

    // Cost + ROI
    var roi = r.roi;
    L.push("## Cost to run");
    L.push("");
    L.push("- **Copilot Credits:** ~" + fmt(agg.monthlyCredits) + " credits / month");
    L.push("- **Run cost:** ~" + usd(agg.monthlyCostUSD) + " / month (" + (s.dials.basis === "prepaid" ? "prepaid $0.008/cr" : "pay-as-you-go $0.01/cr") + ")");
    L.push("");

    L.push("## Business value & ROI");
    L.push("");
    L.push("- **Estimated monthly value:** " + usd(r.value) + " / month");
    if (roi) {
      L.push("- **Payback:** " + months(roi.paybackMonths));
      L.push("- **" + s.dials.horizonMonths + "-month ROI:** " + pct(roi.horizon && roi.horizon.roiPct) +
        " _(range " + pct(roi.band.conservative.roiPct) + " conservative \u2013 " + pct(roi.band.optimistic.roiPct) + " optimistic)_");
      L.push("- **Net (" + s.dials.horizonMonths + " mo):** " + usd(roi.horizon && roi.horizon.net));
    }
    L.push("");
    if (agg.notes && agg.notes.length) { agg.notes.forEach(function (n) { L.push("> " + n); }); L.push(""); }

    // Assumptions ledger
    if (roi && roi.ledger && roi.ledger.length) {
      L.push("## Assumptions ledger");
      L.push("");
      L.push("| Line | Monthly | Basis |");
      L.push("|---|--:|---|");
      roi.ledger.forEach(function (x) {
        var val = x.oneTime != null ? usd(x.oneTime) + " (one-time)" : (x.monthly != null ? usd(x.monthly) : "\u2014");
        L.push("| " + x.label + " | " + val + " | " + (x.basis || "") + " |");
      });
      L.push("");
    }

    if (s.notes) { L.push("## Notes"); L.push(""); L.push(s.notes); L.push(""); }

    if (s.snapshot) {
      var sn = s.snapshot;
      L.push("## Quoted figures (frozen " + sn.date + ")");
      L.push("");
      L.push("| Metric | As quoted (" + sn.date + ") | Current live |");
      L.push("|---|--:|--:|");
      L.push("| Credits / mo | " + fmt(sn.monthlyCredits) + " | " + fmt(agg.monthlyCredits) + " |");
      L.push("| Run cost / mo | " + usd(sn.monthlyCostUSD) + " | " + usd(agg.monthlyCostUSD) + " |");
      L.push("| Monthly value | " + usd(sn.valueMonthly) + " | " + usd(r.value) + " |");
      L.push("| " + (sn.horizonMonths || s.dials.horizonMonths) + "-mo ROI | " + pct(sn.roiPct) + " | " + pct(roi && roi.horizon && roi.horizon.roiPct) + " |");
      L.push("");
    }

    L.push("---");
    L.push("");
    L.push("_Unofficial estimate \u2014 not endorsed by or affiliated with Microsoft. Copilot Credit rates are calibrated to public Microsoft billing; value figures are the customer's own economics. Validate against your own data before a funding decision._");
    L.push("");
    return L.join("\n");
  }

  // ── rendering ───────────────────────────────────────────────────────────
  function field(id, label, val, ph, wide) {
    return '<label class="pc-field' + (wide ? " pc-field--wide" : "") + '">' +
      '<span>' + esc(label) + '</span>' +
      '<input type="text" id="' + id + '" value="' + esc(val || "") + '" placeholder="' + esc(ph || "") + '"></label>';
  }
  function area(id, label, val, ph) {
    return '<label class="pc-field pc-field--wide"><span>' + esc(label) + '</span>' +
      '<textarea id="' + id + '" rows="3" placeholder="' + esc(ph || "") + '">' + esc(val || "") + '</textarea></label>';
  }

  function itemsHtml(r) {
    if (!state.items.length) {
      return '<p class="pc-empty">No saved estimates found. Build one in the <a href="../credit-estimator/">Credit Estimator</a> (or <a href="../credit-estimator/#cowork">Cowork</a>), press <em>Save to My estimates</em>, then come back and press <em>Refresh from My estimates</em>.</p>';
    }
    return state.items.map(function (it, i) {
      var rr = null;
      for (var k = 0; k < r.rows.length; k++) if (r.rows[k].it === it) { rr = r.rows[k].r; break; }
      var nums = rr && rr.ok
        ? "~" + fmt(rr.monthlyCredits) + " credits/mo \u00b7 ~" + usd(rr.monthlyCostUSD) + "/mo"
        : '<span class="pc-warn">can\u2019t recompute here</span>';
      return '<label class="pc-pick">' +
        '<input type="checkbox" class="pc-pick-cb" data-idx="' + i + '"' + (it.include !== false ? " checked" : "") + '>' +
        '<span class="pc-pick-badge pc-pick-badge--' + (it.producer === "cowork" ? "cowork" : "studio") + '">' + esc(producerLabel(it.producer)) + '</span>' +
        '<span class="pc-pick-label">' + esc(it.label || "Untitled estimate") + '</span>' +
        '<span class="pc-pick-nums">' + nums + '</span></label>';
    }).join("");
  }

  function previewHtml(r) {
    var s = state, agg = r.agg || {}, roi = r.roi;
    var rows = sizingRows(r);
    var h = [];
    h.push('<h2 class="pc-pv-title">' + esc(s.title || "Copilot agent proposal") + '</h2>');
    var meta = [];
    if (s.preparedFor) meta.push("<strong>Prepared for:</strong> " + esc(s.preparedFor));
    if (s.preparedBy) meta.push("<strong>Prepared by:</strong> " + esc(s.preparedBy));
    meta.push("<strong>Date:</strong> " + esc(s.date || today()));
    h.push('<p class="pc-pv-meta">' + meta.join(" &nbsp;\u00b7&nbsp; ") + '</p>');

    if (s.problem) { h.push('<h3>Problem</h3><p>' + esc(s.problem) + '</p>'); }
    if (s.approach) { h.push('<h3>Approach</h3><p>' + esc(s.approach) + '</p>'); }

    h.push('<h3>Solution sizing</h3>');
    if (rows.length) {
      h.push('<table class="pc-tbl"><thead><tr><th>Component</th><th>Producer</th><th>Size</th><th class="r">Credits/mo</th><th class="r">Cost/mo</th></tr></thead><tbody>');
      rows.forEach(function (x) {
        h.push('<tr><td>' + esc(x.label) + '</td><td>' + esc(x.producer) + '</td><td>' + esc(x.size) + '</td><td class="r">' +
          (x.ok ? fmt(x.credits) : "\u2014") + '</td><td class="r">' + (x.ok ? usd(x.cost) : "\u2014") + '</td></tr>');
      });
      h.push('<tr class="pc-tbl-total"><td><strong>Portfolio total</strong></td><td></td><td></td><td class="r"><strong>' +
        fmt(agg.monthlyCredits) + '</strong></td><td class="r"><strong>' + usd(agg.monthlyCostUSD) + '</strong></td></tr>');
      h.push('</tbody></table>');
    } else { h.push('<p class="pc-empty">No estimates selected.</p>'); }

    h.push('<h3>Business value &amp; ROI</h3>');
    h.push('<div class="pc-cards">');
    h.push(card("Monthly value", usd(r.value)));
    h.push(card("Run cost / mo", usd(agg.monthlyCostUSD)));
    if (roi) {
      h.push(card("Payback", months(roi.paybackMonths)));
      h.push(card(s.dials.horizonMonths + "-mo ROI", pct(roi.horizon && roi.horizon.roiPct)));
    }
    h.push('</div>');
    if (roi) {
      h.push('<p class="pc-pv-band">Range over ' + s.dials.horizonMonths + ' months: <strong>' +
        pct(roi.band.conservative.roiPct) + '</strong> conservative \u2013 <strong>' + pct(roi.band.optimistic.roiPct) +
        '</strong> optimistic \u00b7 net <strong>' + usd(roi.horizon && roi.horizon.net) + '</strong>.</p>');
    }
    if (agg.notes && agg.notes.length) { agg.notes.forEach(function (n) { h.push('<p class="pc-pv-note">' + esc(n) + '</p>'); }); }

    if (s.notes) { h.push('<h3>Notes</h3><p>' + esc(s.notes) + '</p>'); }

    if (s.snapshot) {
      var sn = s.snapshot;
      h.push('<h3>\uD83D\uDCCC Quoted figures (frozen ' + esc(sn.date) + ')</h3>');
      h.push('<table class="pc-tbl"><thead><tr><th>Metric</th><th class="r">As quoted</th><th class="r">Current live</th></tr></thead><tbody>');
      h.push('<tr><td>Credits / mo</td><td class="r">' + fmt(sn.monthlyCredits) + '</td><td class="r">' + fmt(agg.monthlyCredits) + '</td></tr>');
      h.push('<tr><td>Run cost / mo</td><td class="r">' + usd(sn.monthlyCostUSD) + '</td><td class="r">' + usd(agg.monthlyCostUSD) + '</td></tr>');
      h.push('<tr><td>Monthly value</td><td class="r">' + usd(sn.valueMonthly) + '</td><td class="r">' + usd(r.value) + '</td></tr>');
      h.push('<tr><td>' + (sn.horizonMonths || s.dials.horizonMonths) + '-mo ROI</td><td class="r">' + pct(sn.roiPct) + '</td><td class="r">' + pct(roi && roi.horizon && roi.horizon.roiPct) + '</td></tr>');
      h.push('</tbody></table>');
    }

    h.push('<p class="pc-pv-foot"><em>Unofficial estimate \u2014 not endorsed by or affiliated with Microsoft. Validate against your own data before a funding decision.</em></p>');
    return h.join("");
  }
  function card(label, val) {
    return '<div class="pc-card"><div class="pc-card-v">' + esc(val) + '</div><div class="pc-card-l">' + esc(label) + '</div></div>';
  }

  function savedHtml() {
    var b = B(); if (!b) return "";
    var saved = b.list({ kind: "proposal" }) || [];
    if (!saved.length) return "";
    var rows = saved.map(function (it) {
      var d = (it.input && it.input.proposal && it.input.proposal.date) || "";
      return '<li class="pc-saved-row" data-id="' + esc(it.id) + '">' +
        '<button type="button" class="pc-saved-open" data-id="' + esc(it.id) + '">' + esc(it.label || "Untitled proposal") + '</button>' +
        '<span class="pc-saved-date">' + esc(d) + '</span>' +
        '<button type="button" class="pc-saved-rm" data-id="' + esc(it.id) + '" aria-label="Delete">Remove</button></li>';
    }).join("");
    return '<div class="pc-saved"><h3>Saved proposals</h3><ul class="pc-saved-list">' + rows + '</ul></div>';
  }

  function renderAll() {
    var h = host(); if (!h) return;
    var r = recompute();
    var s = state;
    var basisSel = '<select id="pc-basis">' +
      '<option value="payg"' + (s.dials.basis !== "prepaid" ? " selected" : "") + '>Pay-as-you-go ($0.01/cr)</option>' +
      '<option value="prepaid"' + (s.dials.basis === "prepaid" ? " selected" : "") + '>Prepaid pack ($0.008/cr)</option></select>';

    h.innerHTML =
      '<div class="pc-wrap">' +
        '<div class="pc-editor">' +
          '<div class="pc-hd"><h2>Compose</h2>' +
            '<button type="button" class="pc-btn pc-btn--ghost" id="pc-refresh">\u21bb Refresh from My estimates</button></div>' +

          '<div class="pc-grp"><div class="pc-grid">' +
            field("pc-title", "Proposal title", s.title, "Copilot agent proposal") +
            field("pc-for", "Prepared for", s.preparedFor, "Customer / team") +
            field("pc-by", "Prepared by", s.preparedBy, "You / your org") +
            field("pc-date", "Date", s.date, today()) +
          '</div></div>' +

          '<div class="pc-grp"><h3>Included estimates</h3>' +
            '<div id="pc-items">' + itemsHtml(r) + '</div></div>' +

          '<div class="pc-grp"><h3>Value &amp; ROI dials</h3>' +
            '<div class="pc-grid">' +
              '<label class="pc-field"><span>Estimated value / month ($)</span><input type="number" id="pc-value" inputmode="numeric" value="' + esc(Math.round(num(r.value))) + '"></label>' +
              '<label class="pc-field"><span>Billing basis</span>' + basisSel + '</label>' +
              '<label class="pc-field"><span>Horizon (months)</span><input type="number" id="pc-horizon" inputmode="numeric" value="' + esc(s.dials.horizonMonths) + '"></label>' +
            '</div>' +
            '<p class="pc-hint">Cost is grounded in the credit engine. <strong>Value is your economics</strong> \u2014 tune it. Cowork items add cost only; their value is user-driven.</p>' +
          '</div>' +

          '<div class="pc-grp"><h3>Narrative</h3>' +
            area("pc-problem", "Problem", s.problem, "What business problem does this solve?") +
            area("pc-approach", "Approach", s.approach, "How do these agents address it?") +
            area("pc-notes", "Notes", s.notes, "Risks, dependencies, rollout plan\u2026") +
          '</div>' +

          '<div class="pc-grp pc-snap"><label class="pc-check"><input type="checkbox" id="pc-snapshot"' + (s.snapshot ? " checked" : "") + '> ' +
            'Freeze this quote as of <strong>' + esc(s.date || today()) + '</strong></label>' +
            '<p class="pc-hint">A dated snapshot preserves the numbers you quoted even as the live estimate moves.</p></div>' +
        '</div>' +

        '<div class="pc-side">' +
          '<div class="pc-exportbar">' +
            '<button type="button" class="pc-btn" id="pc-copy">\uD83D\uDCCB Copy Markdown</button>' +
            '<button type="button" class="pc-btn pc-btn--ghost" id="pc-download">\u2b07 Download .md</button>' +
            '<button type="button" class="pc-btn pc-btn--ghost" id="pc-print">\uD83D\uDDA8 Print / PDF</button>' +
            '<button type="button" class="pc-btn pc-btn--ghost" id="pc-share">\uD83D\uDD17 Share link</button>' +
            '<button type="button" class="pc-btn pc-btn--ghost" id="pc-save">\uD83D\uDCBE Save to My estimates</button>' +
            '<span class="pc-status" id="pc-status" aria-live="polite"></span>' +
          '</div>' +
          '<div class="pc-preview" id="pc-preview">' + previewHtml(r) + '</div>' +
          savedHtml() +
        '</div>' +
      '</div>';

    bind(r);
  }

  // Re-render only the live-recomputed regions (keeps focus/caret in text inputs).
  function refreshLive() {
    var r = recompute();
    var items = el("pc-items"); if (items) items.innerHTML = itemsHtml(r);
    var pv = el("pc-preview"); if (pv) pv.innerHTML = previewHtml(r);
    var v = el("pc-value"); if (v && document.activeElement !== v) v.value = Math.round(num(r.value));
    bindItems();
  }

  function bindItems() {
    Array.prototype.forEach.call(document.querySelectorAll(".pc-pick-cb"), function (cb) {
      cb.onchange = function () {
        var i = parseInt(cb.getAttribute("data-idx"), 10);
        if (state.items[i]) state.items[i].include = cb.checked;
        // toggling inclusion changes the aggregate → reseed the value lever
        state.dials.valueMonthly = null;
        refreshLive();
      };
    });
  }

  function bind(r) {
    // text/narrative fields — update state + live preview on input
    [["pc-title", "title"], ["pc-for", "preparedFor"], ["pc-by", "preparedBy"], ["pc-date", "date"],
     ["pc-problem", "problem"], ["pc-approach", "approach"], ["pc-notes", "notes"]].forEach(function (pair) {
      var e = el(pair[0]); if (!e) return;
      e.oninput = function () { state[pair[1]] = e.value; var pv = el("pc-preview"); if (pv) pv.innerHTML = previewHtml(recompute()); };
    });
    // dials
    var val = el("pc-value"); if (val) val.oninput = function () { state.dials.valueMonthly = num(val.value); refreshLive(); };
    var basis = el("pc-basis"); if (basis) basis.onchange = function () { state.dials.basis = basis.value === "prepaid" ? "prepaid" : "payg"; refreshLive(); };
    var hz = el("pc-horizon"); if (hz) hz.oninput = function () { state.dials.horizonMonths = Math.max(1, Math.round(num(hz.value, 36))); refreshLive(); };
    // snapshot
    var snap = el("pc-snapshot"); if (snap) snap.onchange = function () { toggleSnapshot(snap.checked); };
    // items
    bindItems();
    var refresh = el("pc-refresh"); if (refresh) refresh.onclick = function () {
      var have = {}; state.items.forEach(function (it) { if (it.id) have[it.id] = true; });
      seedFromWorkspace().forEach(function (it) { if (!it.id || !have[it.id]) state.items.push(it); });
      state.dials.valueMonthly = null;
      renderAll(); status("Pulled latest from My estimates");
    };
    // exports
    var copy = el("pc-copy"); if (copy) copy.onclick = function () { copyText(buildMarkdown(recompute()), "Proposal Markdown copied \u2713"); };
    var dl = el("pc-download"); if (dl) dl.onclick = function () { downloadText(slug(state.title) + ".md", buildMarkdown(recompute())); };
    var pr = el("pc-print"); if (pr) pr.onclick = printProposal;
    var sh = el("pc-share"); if (sh) sh.onclick = shareLink;
    var sv = el("pc-save"); if (sv) sv.onclick = saveToWorkspace;
    // saved proposals
    Array.prototype.forEach.call(document.querySelectorAll(".pc-saved-open"), function (btn) {
      btn.onclick = function () { var s = loadSaved(btn.getAttribute("data-id")); if (s) { state = s; renderAll(); status("Opened saved proposal"); } };
    });
    Array.prototype.forEach.call(document.querySelectorAll(".pc-saved-rm"), function (btn) {
      btn.onclick = function () { var b = B(); if (b) b.remove(btn.getAttribute("data-id")); renderAll(); };
    });
  }

  function toggleSnapshot(on) {
    if (!on) { state.snapshot = null; refreshLive(); return; }
    var r = recompute(), agg = r.agg || {}, roi = r.roi;
    state.snapshot = {
      date: state.date || today(),
      monthlyCredits: Math.round(num(agg.monthlyCredits)),
      monthlyCostUSD: num(agg.monthlyCostUSD),
      valueMonthly: num(r.value),
      roiPct: roi && roi.horizon ? roi.horizon.roiPct : null,
      paybackMonths: roi ? roi.paybackMonths : null,
      horizonMonths: state.dials.horizonMonths
    };
    refreshLive();
    status("Quote frozen as of " + state.snapshot.date);
  }

  // ── save / share / print ────────────────────────────────────────────────
  function toProposalInput() {
    return {
      title: state.title, preparedFor: state.preparedFor, preparedBy: state.preparedBy,
      date: state.date, problem: state.problem, approach: state.approach, notes: state.notes,
      items: (state.items || []).map(function (it) {
        return { id: it.id, kind: it.kind, producer: it.producer, label: it.label, input: it.input, include: it.include !== false };
      }),
      dials: { valueMonthly: state.dials.valueMonthly, basis: state.dials.basis, horizonMonths: state.dials.horizonMonths },
      snapshot: state.snapshot || null
    };
  }
  function saveToWorkspace() {
    var b = B(); if (!b) { status("Storage unavailable"); return; }
    var prop = toProposalInput();
    var refs = includedItems().map(function (it) { return it.id; }).filter(Boolean);
    var r = recompute(), agg = r.agg || {};
    var label = (state.title || "Proposal") + " \u00b7 ~" + fmt(agg.monthlyCredits) + " cr/mo";
    var spec = {
      kind: "proposal", producer: null, label: label,
      input: { proposal: prop }, refs: refs,
      meta: { monthlyCredits: Math.round(num(agg.monthlyCredits)), monthlyCostUSD: num(agg.monthlyCostUSD), valueMonthly: num(r.value) }
    };
    if (state.savedId) spec.id = state.savedId;
    var item = b.put(spec);
    state.savedId = item.id;
    renderAll();
    status("Saved to My estimates");
  }
  function shareLink() {
    var p = P(); if (!p || typeof p.encodeProposal !== "function") { status("Share unavailable"); return; }
    var enc = p.encodeProposal(toProposalInput());
    var url = location.origin + location.pathname + "?p=" + enc;
    var box = el("pc-share-box");
    if (!box) {
      box = document.createElement("div"); box.className = "pc-share-box"; box.id = "pc-share-box";
      var bar = el("pc-exportbar") || (el("pc-status") && el("pc-status").parentNode);
      if (bar) bar.appendChild(box);
    }
    box.textContent = url;
    copyText(url, "Share link copied \u2713");
  }
  function printProposal() {
    var md = buildMarkdown(recompute());
    var htmlBody = previewHtml(recompute());
    var w;
    try { w = window.open("", "_blank"); } catch (e) { w = null; }
    if (!w) { status("Pop-up blocked \u2014 use Download .md or your browser's Print"); return; }
    var doc = "<!doctype html><html><head><meta charset=\"utf-8\"><title>" + esc(state.title || "Proposal") + "</title>" +
      "<style>body{font:14px/1.55 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:760px;margin:2rem auto;padding:0 1rem;color:#1a1a1a}" +
      "h2{margin:.2rem 0}h3{margin:1.2rem 0 .3rem;border-bottom:1px solid #eee;padding-bottom:.2rem}" +
      "table{border-collapse:collapse;width:100%;margin:.4rem 0;font-size:.92em}th,td{border:1px solid #ddd;padding:.35rem .5rem;text-align:left}" +
      "th.r,td.r{text-align:right}.pc-cards{display:flex;gap:.6rem;flex-wrap:wrap;margin:.5rem 0}" +
      ".pc-card{border:1px solid #ddd;border-radius:8px;padding:.5rem .8rem;min-width:120px}.pc-card-v{font-size:1.25rem;font-weight:700}.pc-card-l{font-size:.75rem;color:#666}" +
      ".pc-pv-meta{color:#555}.pc-pv-foot{color:#888;font-size:.82em;margin-top:1.5rem}.pc-tbl-total td{background:#f6f6f6}" +
      "@media print{.pc-noprint{display:none}}</style></head><body>" +
      "<div class=\"pc-noprint\" style=\"margin-bottom:1rem\"><button onclick=\"window.print()\">Print / Save as PDF</button></div>" +
      htmlBody + "</body></html>";
    try { w.document.open(); w.document.write(doc); w.document.close(); } catch (e) {}
    status("Opened printable view");
    return md; // (return keeps the value testable)
  }

  // ── mount ───────────────────────────────────────────────────────────────
  function mount() {
    if (!host()) return;
    if (mounted && state) { renderAll(); return; }
    if (!B() || !P()) return; // engines not loaded — bail quietly
    mounted = true;
    seed();
    renderAll();
  }

  // expose a few handlers for tests / programmatic use
  window.ProposalComposer = {
    mount: mount, buildMarkdown: function () { return buildMarkdown(recompute()); },
    state: function () { return state; }, recompute: recompute
  };

  if (window.document$ && typeof window.document$.subscribe === "function") window.document$.subscribe(mount);
  else if (document.readyState !== "loading") mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();

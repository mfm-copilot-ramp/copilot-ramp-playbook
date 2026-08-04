/* Copilot ROI Estimator — value & ROI math (pure, DOM-free).
 *
 * Layered ON TOP of estimator-core.js. It NEVER re-derives Copilot Credits:
 * the monthly-credit figure comes from the Credit Estimator, and this module
 * dollarizes it with EstimatorCore's published rates (single source of truth),
 * then adds the business costs (licensing, build, maintenance) and models the
 * VALUE side (time saved + cost avoidance), an adoption ramp, and computes ROI,
 * payback, a 3-year view, and a conservative / expected / optimistic band.
 *
 * Design principles (see files/roi-estimator-plan.md):
 *  - Value numbers are the USER's economics (no Microsoft grounding needed).
 *  - HARD (measured) vs SOFT (assumed) inputs are tagged for an honest readout.
 *  - Adoption is a first-class dial — ROI = value × usage.
 *
 * Ships as a browser global (window.ROICore) and a CommonJS module. ES5-style
 * to match estimator-core.js (var / function; no arrow funcs).
 */
(function (root) {
  "use strict";

  // Cost dollarization prefers EstimatorCore (browser load order guarantees it;
  // unit tests inject it via opts.core). The fallback rates are the SAME public
  // figures, kept only so this module is testable in isolation. EstimatorCore
  // stays authoritative whenever present, so the two tools never drift.
  var FALLBACK_RATE_PAYG = 0.01;      // $/credit, pay-as-you-go
  var FALLBACK_RATE_PREPAID = 0.008;  // $/credit, prepaid pack

  // Build size → representative person-days. An EDITABLE planning assumption
  // (not a Microsoft figure); mirrors the effort bands in EstimatorCore.SIZE_INFO
  // ("hours" → "a few days" → "1–3 weeks" → "1–2 months" → "multi-month").
  var SIZE_DAYS = { XS: 1, S: 4, M: 15, L: 45, XL: 120 };

  function num(x) { var n = parseFloat(x); return isFinite(n) ? n : 0; }
  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

  function coreOf(opts) {
    if (opts && opts.core) return opts.core;
    return root.EstimatorCore || null;
  }
  // Dollar cost of a monthly Copilot-Credit figure, at the chosen billing basis.
  function costFromCredits(credits, basis, opts) {
    credits = Math.max(0, num(credits));
    var c = coreOf(opts);
    if (c && typeof c.costUSD === "function") {
      var u = c.costUSD(credits);
      return basis === "prepaid" ? u.prepaid : u.payg;
    }
    return credits * (basis === "prepaid" ? FALLBACK_RATE_PREPAID : FALLBACK_RATE_PAYG);
  }
  function sizeToPersonDays(size) {
    return SIZE_DAYS[size] != null ? SIZE_DAYS[size] : SIZE_DAYS.M;
  }

  // Linear adoption ramp: month m (1-based) → realized fraction 0..1.
  // m = 1 → startPct; m = rampMonths → endPct; flat at endPct thereafter.
  function adoptionFactor(m, ramp) {
    ramp = ramp || {};
    var start = clamp(num(ramp.startPct), 0, 100);
    var end = clamp(ramp.endPct == null ? 100 : num(ramp.endPct), 0, 100);
    var months = Math.max(0, Math.round(num(ramp.rampMonths)));
    var pct;
    if (months <= 1) pct = end;
    else if (m >= months) pct = end;
    else pct = start + (end - start) * ((m - 1) / (months - 1));
    return clamp(pct, 0, 100) / 100;
  }

  // ── Value side ──────────────────────────────────────────────────────────
  // Returns one line per active value lever, each with a monthly $ figure and a
  // confidence basis. Time saved is the HARD hero; deflection / FTE are SOFT.
  function valueLines(value) {
    value = value || {};
    var lines = [];
    (value.timeSaved || []).forEach(function (t) {
      var monthly = (num(t.minutesPer) * num(t.perMonth) / 60) * num(t.loadedRatePerHour);
      if (monthly > 0 || t.label) {
        lines.push({ label: t.label || "Time saved", monthly: monthly, basis: "HARD", group: "time" });
      }
    });
    var d = value.deflection;
    if (d && num(d.casesPerMonth) > 0 && num(d.costPerCase) > 0) {
      var monthlyD = num(d.casesPerMonth) * (clamp(num(d.deflectionPct), 0, 100) / 100) * num(d.costPerCase);
      lines.push({ label: d.label || "Cases deflected", monthly: monthlyD, basis: "SOFT", group: "deflection" });
    }
    var f = value.fteAvoided;
    if (f && num(f.count) > 0 && num(f.loadedAnnual) > 0) {
      var monthlyF = num(f.count) * num(f.loadedAnnual) / 12;
      lines.push({ label: f.label || "Headcount avoided", monthly: monthlyF, basis: "SOFT", group: "fte" });
    }
    return lines;
  }

  // ── Cost side (reuses EstimatorCore for the run line) ───────────────────
  function costLines(cost, basis, opts) {
    cost = cost || {};
    var lic = cost.licensing || {};
    var maint = cost.maintenance || {};
    var run = costFromCredits(num(cost.monthlyCredits), basis, opts);
    var licensing = num(lic.seats) * num(lic.pricePerSeatMonth);
    var maintenance = num(maint.hoursPerMonth) * num(maint.hourRate);
    return {
      run: run, licensing: licensing, maintenance: maintenance,
      monthlyOngoing: run + licensing + maintenance,
      lines: [
        { label: "Run (Copilot Credits)", monthly: run, scalesWithAdoption: true },
        { label: "Licensing", monthly: licensing, scalesWithAdoption: false },
        { label: "Maintenance", monthly: maintenance, scalesWithAdoption: false }
      ]
    };
  }

  // ── The model ───────────────────────────────────────────────────────────
  function computeROI(input, opts) {
    input = input || {};
    var basis = input.billingBasis === "prepaid" ? "prepaid" : "payg";
    var horizon = Math.max(1, Math.round(num(input.horizonMonths) || 36));

    var vlines = valueLines(input.value);
    var fullValue = vlines.reduce(function (s, l) { return s + l.monthly; }, 0);

    var cl = costLines(input.cost, basis, opts);
    var buildCfg = (input.cost && input.cost.build) || {};
    var build = num(buildCfg.personDays) * num(buildCfg.dayRate);
    var ramp = (input.value || {}).adoption;

    // Month-by-month. VALUE and RUN cost scale with adoption (both track usage);
    // LICENSING and MAINTENANCE are flat from month 1; BUILD is a one-time m0 outlay.
    var series = [];
    for (var m = 1; m <= horizon; m++) {
      var f = adoptionFactor(m, ramp);
      var value = fullValue * f;
      var run = cl.run * f;
      var cost = run + cl.licensing + cl.maintenance;
      series.push({
        month: m, adoption: f, value: value, run: run,
        licensing: cl.licensing, maintenance: cl.maintenance,
        cost: cost, net: value - cost
      });
    }

    // Windowed roll-up over `months`, optionally haircutting VALUE by a
    // confidence scale (used for the conservative / optimistic band).
    function windowRollup(months, valueScale) {
      valueScale = valueScale == null ? 1 : valueScale;
      var lim = Math.min(Math.max(0, Math.round(months)), series.length);
      var v = 0, c = build;
      for (var i = 0; i < lim; i++) { v += series[i].value * valueScale; c += series[i].cost; }
      var n = v - c;
      return { months: lim, value: v, cost: c, net: n, roiPct: c > 0 ? (n / c) * 100 : null };
    }
    function paybackMonth(valueScale) {
      valueScale = valueScale == null ? 1 : valueScale;
      var cv = 0, cc = build;
      for (var i = 0; i < series.length; i++) {
        cv += series[i].value * valueScale; cc += series[i].cost;
        if (cv - cc >= 0) return i + 1;
      }
      return null;
    }

    var payback = paybackMonth(1);
    var year1 = windowRollup(12, 1);
    year1.paybackMonths = (payback != null && payback <= 12) ? payback : null;
    var full = windowRollup(horizon, 1);

    var consPct = (input.band && input.band.conservativePct != null) ? num(input.band.conservativePct) : 70;
    var optiPct = (input.band && input.band.optimisticPct != null) ? num(input.band.optimisticPct) : 120;
    function bandEntry(scale) {
      var w = windowRollup(horizon, scale);
      w.paybackMonths = paybackMonth(scale);
      return w;
    }
    var band = {
      conservative: bandEntry(consPct / 100),
      expected: (function () { var w = windowRollup(horizon, 1); w.paybackMonths = payback; return w; })(),
      optimistic: bandEntry(optiPct / 100)
    };

    // Assumptions ledger — every number, tagged for honesty.
    var ledger = [];
    vlines.forEach(function (l) { ledger.push({ label: l.label, monthly: l.monthly, basis: l.basis }); });
    ledger.push({ label: "Run cost — Copilot Credits (grounded rates)", monthly: cl.run, basis: "HARD" });
    if (cl.licensing > 0) ledger.push({ label: "Licensing", monthly: cl.licensing, basis: "HARD" });
    if (cl.maintenance > 0) ledger.push({ label: "Maintenance", monthly: cl.maintenance, basis: "ASSUMPTION" });
    if (build > 0) ledger.push({ label: "Build (one-time)", monthly: null, oneTime: build, basis: "ASSUMPTION" });

    return {
      basis: basis, horizonMonths: horizon,
      monthly: {
        valueFull: fullValue, run: cl.run, licensing: cl.licensing, maintenance: cl.maintenance,
        costFull: cl.monthlyOngoing, netFull: fullValue - cl.monthlyOngoing
      },
      build: build,
      valueLines: vlines, costLines: cl.lines,
      series: series,
      year1: year1, horizon: full,
      paybackMonths: payback,
      band: band,
      ledger: ledger
    };
  }

  // A realistic worked example so the page renders a result on first load.
  function defaultInput() {
    return {
      billingBasis: "payg",
      horizonMonths: 36,
      band: { conservativePct: 70, optimisticPct: 120 },
      value: {
        timeSaved: [{ label: "Support triage & drafting", minutesPer: 8, perMonth: 1000, loadedRatePerHour: 45 }],
        deflection: { casesPerMonth: 1000, costPerCase: 6, deflectionPct: 30 },
        fteAvoided: { count: 0, loadedAnnual: 120000 },
        adoption: { rampMonths: 6, startPct: 20, endPct: 80 }
      },
      cost: {
        monthlyCredits: 5000,
        licensing: { seats: 0, pricePerSeatMonth: 30 },
        build: { personDays: 15, dayRate: 1200 },
        maintenance: { hoursPerMonth: 8, hourRate: 120 }
      }
    };
  }

  // ── Quick ROI: natural language → instant band ──────────────────────────
  // Default value dials — editable planning assumptions, NOT Microsoft figures.
  // Minutes-saved & loaded rate are conservative neutral starting points the
  // user confirms; the VOLUME and BUILD SIZE come from the Credit Estimator's
  // own read of the scenario, so Quick ROI never re-derives credits.
  var QUICK = {
    minutesSaved: 8, loadedRate: 45, dayRate: 1200, maintHours: 4, maintRate: 120,
    rampMonths: 6, startPct: 20, endPct: 80, conservativePct: 70, optimisticPct: 120
  };

  // Monthly task volume implied by an EstimatorCore.analyzeText() read:
  // interactive → users × interactions/user/month; autonomous → events/month.
  function quickVolume(vars) {
    vars = vars || {};
    if (vars.archetype === "autonomous") return Math.max(0, Math.round(num(vars.events)));
    return Math.max(0, Math.round(num(vars.users) * num(vars.interactions)));
  }

  // Adapter: turn an EstimatorCore.analyzeText() result + a few user value dials
  // into a ROICore input. The monthly-credit figure and build size come STRAIGHT
  // from the estimator read; this only supplies the value economics + defaults.
  function quickInputFromAnalysis(analysis, dials) {
    analysis = analysis || {}; dials = dials || {};
    var vars = analysis.vars || {};
    var est = analysis.estimate || {};
    var size = analysis.size || "M";
    var volume = quickVolume(vars);
    var minutes = dials.minutesSaved != null ? num(dials.minutesSaved) : QUICK.minutesSaved;
    var rate = dials.loadedRate != null ? num(dials.loadedRate) : QUICK.loadedRate;
    var credits = Math.max(0, Math.round(num(est.monthly)));
    var regime = est.regime || (vars.archetype === "autonomous" ? "autonomous" : "interactive");
    var days = sizeToPersonDays(size);
    return {
      billingBasis: dials.basis === "prepaid" ? "prepaid" : "payg",
      horizonMonths: 36,
      band: { conservativePct: QUICK.conservativePct, optimisticPct: QUICK.optimisticPct },
      value: {
        timeSaved: [{
          label: dials.label || "Time saved on the described task",
          minutesPer: minutes, perMonth: volume, loadedRatePerHour: rate
        }],
        adoption: { rampMonths: QUICK.rampMonths, startPct: QUICK.startPct, endPct: QUICK.endPct }
      },
      cost: {
        monthlyCredits: credits,
        licensing: { seats: 0, pricePerSeatMonth: 30 },
        build: { personDays: days, dayRate: QUICK.dayRate },
        maintenance: { hoursPerMonth: QUICK.maintHours, hourRate: QUICK.maintRate }
      },
      _meta: {
        volume: volume, size: size, regime: regime, monthlyCredits: credits,
        minutes: minutes, rate: rate, personDays: days,
        billed: est.billed == null ? null : Math.round(num(est.billed)),
        perUnit: analysis.perUnit != null ? analysis.perUnit : num(est.perUnit)
      }
    };
  }

  var api = {
    computeROI: computeROI,
    valueLines: valueLines,
    costLines: costLines,
    costFromCredits: costFromCredits,
    adoptionFactor: adoptionFactor,
    sizeToPersonDays: sizeToPersonDays,
    SIZE_DAYS: SIZE_DAYS,
    defaultInput: defaultInput,
    quickInputFromAnalysis: quickInputFromAnalysis,
    quickVolume: quickVolume,
    QUICK: QUICK,
    FALLBACK_RATE_PAYG: FALLBACK_RATE_PAYG,
    FALLBACK_RATE_PREPAID: FALLBACK_RATE_PREPAID
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ROICore = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

/* Copilot Credit Estimator — Cowork (Microsoft 365 Copilot) analysis engine.
 * Pure, DOM-free logic for the "Copilot Cowork" product lane of
 * the estimator. Node-testable; loaded on the page as an external asset via
 * mkdocs.yml `extra_javascript` (not inlined into the .md).
 *
 * METHOD (per field guidance, Aug 2026): Cowork is forecast TOP-DOWN — you model
 * a population, not a component inventory. The macro model is:
 *
 *     licensed users  ×  monthly active usage %  ×  avg credits / active user / mo
 *       →  monthly Copilot Credits  →  $ (× price/credit, − Azure discount)
 *
 * The PRIMARY variable is "avg credits per active user per month" (credits-first).
 * An optional light/medium/heavy intensity helper can resolve INTO that number for
 * users who don't have one, but it is secondary (off by default in the UI).
 *
 * GOVERNANCE: This is a public site. Credit/price mechanics are grounded in public
 * Microsoft Learn (PAYG $0.01/credit; prepaid $200 / 25,000-credit pack = $0.008;
 * metered Copilot Credits billed via the Copilot Studio meter). The MAU % and
 * credits/user DEFAULTS below are neutral, adjustable PLANNING anchors — they are
 * NOT official Microsoft rates and carry no internal-telemetry attribution.
 */
(function (root) {
  "use strict";

  // ── Rates (public Learn — aligned with the Studio engine) ───────────────────
  var RATE_PAYG = 0.01;      // $/credit, pay-as-you-go
  var RATE_PREPAID = 0.008;  // $/credit, $200 / 25,000 prepaid pack
  var PACK_SIZE = 25000;     // credits per message pack
  var PACK_PRICE = 200;      // $ per message pack

  // ── Planning defaults (neutral, adjustable — NOT official rates) ────────────
  var DEFAULTS = {
    mauPct: 15,                  // typical monthly active usage
    creditsPerActiveUser: 5000,  // avg credits / active user / month
    pricePerCredit: RATE_PAYG,
    azureDiscountPct: 0,
    licenseFloorEnabled: false,
    licensePricePerUser: 30,     // $ / licensed user / month (adjustable)
    budgetCap: 0,                // 0 = no cap
    rampGrowthPct: 7,            // monthly adoption growth used by the forecast
    forecastMonths: 6
  };

  // Benchmark chips for the MAU control (shown UNATTRIBUTED in the UI).
  var MAU_BENCHMARKS = [
    { key: "conservative", label: "Conservative", pct: 10 },
    { key: "typical", label: "Typical", pct: 15 },
    { key: "high", label: "High", pct: 23 }
  ];

  // Optional intensity helper — illustrative credit weights (adjustable, not official).
  var INTENSITY_WEIGHTS = { light: 125, medium: 500, heavy: 2500 };

  // ── small utils ─────────────────────────────────────────────────────────────
  function num(v, d) { v = parseFloat(v); return isFinite(v) ? v : (d || 0); }
  function clampPct(v) { return Math.min(100, Math.max(0, num(v, 0))); }
  function round(n) { return Math.round(n); }
  function has(v) { return v !== null && v !== undefined && v !== ""; }

  function intensityToCredits(mix) {
    mix = mix || {};
    return (num(mix.light, 0) * INTENSITY_WEIGHTS.light) +
           (num(mix.medium, 0) * INTENSITY_WEIGHTS.medium) +
           (num(mix.heavy, 0) * INTENSITY_WEIGHTS.heavy);
  }

  // credits-first: an explicit avg credits/user wins; else derive from the intensity
  // helper; else fall back to the planning default.
  function resolveCreditsPerUser(o) {
    if (o && has(o.creditsPerActiveUser)) return Math.max(0, num(o.creditsPerActiveUser, 0));
    if (o && o.intensity) return Math.max(0, intensityToCredits(o.intensity));
    return DEFAULTS.creditsPerActiveUser;
  }

  function activeUsers(licensed, mauPct) {
    return Math.max(0, round(Math.max(0, num(licensed, 0)) * clampPct(mauPct) / 100));
  }

  // Normalize the global-assumptions block (shared by Quick + Detailed + Forecast).
  function normalizeGlobal(g) {
    g = g || {};
    return {
      pricePerCredit: has(g.pricePerCredit) ? Math.max(0, num(g.pricePerCredit, RATE_PAYG)) : DEFAULTS.pricePerCredit,
      azureDiscountPct: clampPct(g.azureDiscountPct),
      licenseFloorEnabled: !!g.licenseFloorEnabled,
      licensePricePerUser: has(g.licensePricePerUser) ? Math.max(0, num(g.licensePricePerUser, DEFAULTS.licensePricePerUser)) : DEFAULTS.licensePricePerUser,
      budgetCap: Math.max(0, num(g.budgetCap, 0)),
      rampGrowthPct: has(g.rampGrowthPct) ? num(g.rampGrowthPct, DEFAULTS.rampGrowthPct) : DEFAULTS.rampGrowthPct,
      forecastMonths: Math.max(1, round(num(g.forecastMonths, DEFAULTS.forecastMonths)))
    };
  }

  function creditsToSpend(credits, g) {
    return Math.max(0, num(credits, 0)) * g.pricePerCredit * (1 - g.azureDiscountPct / 100);
  }

  function budgetUsage(spend, cap) {
    cap = Math.max(0, num(cap, 0));
    if (!cap) return { cap: 0, pct: null, over: false };
    var pct = spend / cap * 100;
    return { cap: cap, pct: pct, over: pct > 100 };
  }

  // ── Purchase planning helper (grounded: message packs; committed = prepaid rate) ──
  function purchasePlan(monthlyCredits, opts) {
    opts = opts || {};
    var packSize = Math.max(1, num(opts.packSize, PACK_SIZE));
    var packPrice = Math.max(0, num(opts.packPrice, PACK_PRICE));
    var credits = Math.max(0, num(monthlyCredits, 0));
    var packs = Math.ceil(credits / packSize) || 0;
    var packsCredits = packs * packSize;
    return {
      monthlyCredits: credits,
      packSize: packSize,
      packsNeeded: packs,
      packsCredits: packsCredits,
      packsCost: packs * packPrice,
      packsSpare: Math.max(0, packsCredits - credits),
      // A committed pre-purchase is priced at the prepaid rate; we report the $ for the
      // modeled month rather than asserting a specific named SKU/tier (avoid inventing SKUs).
      committedMonthlyCost: credits * RATE_PREPAID,
      committedAnnualCost: credits * 12 * RATE_PREPAID
    };
  }

  // ── Quick / single-cohort estimate ──────────────────────────────────────────
  // A single population scenario at a given active-usage % and credits/user.
  function scenarioCredits(licensed, mauPct, cpu, g) {
    var active = activeUsers(licensed, mauPct);
    var credits = active * Math.max(0, num(cpu, 0));
    var spend = creditsToSpend(credits, g);
    return {
      mauPct: clampPct(mauPct),
      creditsPerActiveUser: Math.max(0, num(cpu, 0)),
      activeUsers: active,
      monthlyCredits: credits,
      coworkSpend: spend,
      annualCoworkSpend: spend * 12,
      costPerActiveUser: active > 0 ? spend / active : 0,
      purchase: purchasePlan(credits)
    };
  }

  function quickEstimate(input) {
    input = input || {};
    var g = normalizeGlobal(input.global || input);
    var licensed = Math.max(0, num(input.licensedUsers, 0));
    var mauPct = clampPct(has(input.mauPct) ? input.mauPct : DEFAULTS.mauPct);
    var active = activeUsers(licensed, mauPct);
    var cpu = resolveCreditsPerUser(input);
    var monthlyCredits = active * cpu;
    var coworkSpend = creditsToSpend(monthlyCredits, g);
    var licenseFloor = g.licenseFloorEnabled ? licensed * g.licensePricePerUser : 0;
    var out = {
      licensedUsers: licensed,
      mauPct: mauPct,
      activeUsers: active,
      creditsPerActiveUser: cpu,
      monthlyCredits: monthlyCredits,
      pricePerCredit: g.pricePerCredit,
      azureDiscountPct: g.azureDiscountPct,
      coworkSpend: coworkSpend,
      licenseFloor: licenseFloor,
      totalSpend: coworkSpend + licenseFloor,
      annualCoworkSpend: coworkSpend * 12,
      costPerActiveUser: active > 0 ? coworkSpend / active : 0,
      purchase: purchasePlan(monthlyCredits),
      budget: budgetUsage(coworkSpend, g.budgetCap)
    };
    // Optional conservative–liberal range: bracket the two drivers at their low/high ends.
    if (input.range) {
      var r = input.range;
      var s1 = scenarioCredits(licensed, has(r.mauLow) ? r.mauLow : mauPct, has(r.cpuLow) ? r.cpuLow : cpu, g);
      var s2 = scenarioCredits(licensed, has(r.mauHigh) ? r.mauHigh : mauPct, has(r.cpuHigh) ? r.cpuHigh : cpu, g);
      out.range = s1.coworkSpend <= s2.coworkSpend ? { low: s1, high: s2 } : { low: s2, high: s1 };
    }
    return out;
  }

  // ── Detailed / per-cohort estimate ──────────────────────────────────────────
  function cohortRow(c, g) {
    var licensed = Math.max(0, num(c.licensedUsers, 0));
    var mauPct = clampPct(has(c.mauPct) ? c.mauPct : DEFAULTS.mauPct);
    var active = activeUsers(licensed, mauPct);
    var cpu = resolveCreditsPerUser(c);
    var credits = active * cpu;
    return {
      name: c.name || "Cohort",
      licensedUsers: licensed,
      mauPct: mauPct,
      activeUsers: active,
      creditsPerActiveUser: cpu,
      monthlyCredits: credits,
      coworkSpend: creditsToSpend(credits, g)
    };
  }

  // Roll up all cohorts with each driver scaled by `factor` (e.g. 0.75 conservative,
  // 1.25 liberal) — used to bracket the Detailed totals into a range.
  function rollupAt(cohorts, g, endpoint, factor) {
    var licensed = 0, active = 0, credits = 0;
    (cohorts || []).forEach(function (c) {
      var lic = Math.max(0, num(c.licensedUsers, 0));
      var explicit = endpoint === "low" ? has(c.creditsLow) : has(c.creditsHigh);
      var mau, cpu;
      if (explicit) {
        // Data-driven per-cohort bracket (e.g. imported median/p90): scale credits only,
        // hold active-usage at the cohort's expected value.
        mau = clampPct(has(c.mauPct) ? num(c.mauPct, DEFAULTS.mauPct) : DEFAULTS.mauPct);
        cpu = Math.max(0, num(endpoint === "low" ? c.creditsLow : c.creditsHigh, 0));
      } else {
        mau = clampPct((has(c.mauPct) ? num(c.mauPct, DEFAULTS.mauPct) : DEFAULTS.mauPct) * factor);
        cpu = Math.max(0, resolveCreditsPerUser(c) * factor);
      }
      var a = activeUsers(lic, mau);
      licensed += lic; active += a; credits += a * cpu;
    });
    var spend = creditsToSpend(credits, g);
    return { licensedUsers: licensed, activeUsers: active, monthlyCredits: credits, coworkSpend: spend, annualCoworkSpend: spend * 12, purchase: purchasePlan(credits) };
  }

  function detailedEstimate(input) {
    input = input || {};
    var g = normalizeGlobal(input.global);
    var cohorts = (input.cohorts || []).map(function (c) { return cohortRow(c, g); });
    var t = cohorts.reduce(function (a, r) {
      a.licensedUsers += r.licensedUsers;
      a.activeUsers += r.activeUsers;
      a.monthlyCredits += r.monthlyCredits;
      a.coworkSpend += r.coworkSpend;
      return a;
    }, { licensedUsers: 0, activeUsers: 0, monthlyCredits: 0, coworkSpend: 0 });
    var licenseFloor = g.licenseFloorEnabled ? t.licensedUsers * g.licensePricePerUser : 0;
    var res = {
      cohorts: cohorts,
      totals: {
        licensedUsers: t.licensedUsers,
        activeUsers: t.activeUsers,
        mauPct: t.licensedUsers > 0 ? (t.activeUsers / t.licensedUsers) * 100 : 0,
        monthlyCredits: t.monthlyCredits,
        creditsPerActiveUser: t.activeUsers > 0 ? t.monthlyCredits / t.activeUsers : 0,
        coworkSpend: t.coworkSpend,
        licenseFloor: licenseFloor,
        totalSpend: t.coworkSpend + licenseFloor,
        annualCoworkSpend: t.coworkSpend * 12,
        costPerActiveUser: t.activeUsers > 0 ? t.coworkSpend / t.activeUsers : 0
      },
      purchase: purchasePlan(t.monthlyCredits),
      budget: budgetUsage(t.coworkSpend, g.budgetCap)
    };
    // Optional conservative–liberal range: per-cohort data-driven low/high when present
    // (e.g. an imported Credits-report cohort's median→p90), else a ±buffer on both drivers.
    var anyExplicit = (input.cohorts || []).some(function (c) { return has(c.creditsLow) || has(c.creditsHigh); });
    var buf = num(input.rangeBufferPct, 0);
    if (buf > 0 || anyExplicit) {
      var b = buf / 100;
      res.totals.range = {
        low: rollupAt(input.cohorts, g, "low", 1 - b),
        high: rollupAt(input.cohorts, g, "high", 1 + b),
        bufferPct: buf,
        dataDriven: anyExplicit
      };
    }
    return res;
  }

  // ── Forecast — adoption ramp over N months ──────────────────────────────────
  // Grows the modeled monthly credits by `rampGrowthPct` per month, starting at the
  // modeled value in month 1. licenseFloor (if enabled) is a flat monthly layer.
  function forecast(input) {
    input = input || {};
    var g = normalizeGlobal(input.global);
    var base = Math.max(0, num(input.monthlyCredits, 0));
    var licensed = Math.max(0, num(input.licensedUsers, 0));
    var months = g.forecastMonths;
    var gr = g.rampGrowthPct / 100;
    var licenseFloor = g.licenseFloorEnabled ? licensed * g.licensePricePerUser : 0;
    var rows = [], totalCredits = 0, totalCowork = 0, peak = 0;
    for (var m = 1; m <= months; m++) {
      var credits = base * Math.pow(1 + gr, m - 1);
      var cowork = creditsToSpend(credits, g);
      var totalWithLicenses = cowork + licenseFloor;
      totalCredits += credits; totalCowork += cowork;
      if (cowork > peak) peak = cowork;
      rows.push({
        month: m,
        label: "M" + m,
        credits: credits,
        coworkSpend: cowork,
        totalWithLicenses: totalWithLicenses,
        budget: budgetUsage(cowork, g.budgetCap)
      });
    }
    return {
      months: months,
      rows: rows,
      totalCoworkSpend: totalCowork,
      totalWithLicenses: totalCowork + licenseFloor * months,
      peakMonthlySpend: peak
    };
  }

  // ── Feed-forward seeds (mirror the Studio seedDetailed pattern) ─────────────
  // Any Quick result or imported row can be projected INTO the Detailed per-cohort
  // editor. The UI adds the origin banner + save-back (like qeToDetailed/qiRowToDetailed).
  function seedDetailedFromQuick(input) {
    input = input || {};
    var g = normalizeGlobal(input.global || input);
    return {
      global: g,
      cohorts: [{
        name: input.name || "All users",
        licensedUsers: Math.max(0, num(input.licensedUsers, 0)),
        mauPct: clampPct(has(input.mauPct) ? input.mauPct : DEFAULTS.mauPct),
        creditsPerActiveUser: resolveCreditsPerUser(input)
      }]
    };
  }

  function seedCohortFromRow(row) {
    row = row || {};
    return {
      name: row.name || "Cohort",
      licensedUsers: Math.max(0, num(row.licensedUsers, 0)),
      mauPct: clampPct(has(row.mauPct) ? row.mauPct : DEFAULTS.mauPct),
      creditsPerActiveUser: has(row.creditsPerActiveUser) ? Math.max(0, num(row.creditsPerActiveUser, 0)) : resolveCreditsPerUser(row)
    };
  }

  // ── M365 admin-center import ────────────────────────────────────────────────
  // Minimal, dependency-free CSV parser (handles quoted fields, embedded commas,
  // and escaped double-quotes). Returns an array of arrays.
  function parseCsv(text) {
    var rows = [], row = [], field = "", i = 0, inQ = false, c;
    text = String(text == null ? "" : text).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    for (; i < text.length; i++) {
      c = text[i];
      if (inQ) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
        else field += c;
      } else if (c === '"') inQ = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else field += c;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    // drop fully-empty trailing rows
    return rows.filter(function (r) { return r.length && !(r.length === 1 && r[0].trim() === ""); });
  }

  function headerIndex(header, patterns) {
    for (var i = 0; i < header.length; i++) {
      var h = String(header[i] || "").toLowerCase().trim();
      for (var p = 0; p < patterns.length; p++) {
        if (patterns[p].test(h)) return i;
      }
    }
    return -1;
  }

  function percentile(sorted, p) {
    if (!sorted.length) return 0;
    var idx = (p / 100) * (sorted.length - 1);
    var lo = Math.floor(idx), hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  }

  function distribution(values) {
    var v = values.filter(function (x) { return isFinite(x) && x > 0; }).slice().sort(function (a, b) { return a - b; });
    if (!v.length) return { count: 0, sum: 0, mean: 0, median: 0, p90: 0, max: 0, outliers: [] };
    var sum = v.reduce(function (a, b) { return a + b; }, 0);
    var median = percentile(v, 50);
    var p90 = percentile(v, 90);
    var max = v[v.length - 1];
    // outlier heuristic: > 3× median AND above p90 (Kevin's skew / power-user note).
    var thresh = Math.max(3 * median, p90);
    var outliers = v.filter(function (x) { return x > thresh; });
    return { count: v.length, sum: sum, mean: sum / v.length, median: median, p90: p90, max: max, outlierThreshold: thresh, outliers: outliers };
  }

  // Copilot Credits report CSV → measured credits/active user (past-30-days column).
  function parseCreditsReportCsv(text) {
    var rows = parseCsv(text);
    if (rows.length < 2) return { ok: false, error: "No data rows found.", rows: [] };
    var header = rows[0];
    var iCredits = headerIndex(header, [/past\s*30/i, /30\s*day/i, /credits\s*used/i, /^credits$/i]);
    var iUser = headerIndex(header, [/user\s*name|username|user principal|display name|user/i]);
    if (iCredits < 0) return { ok: false, error: "Couldn't find a 'Past 30 days' / credits column.", rows: [] };
    var users = [];
    for (var r = 1; r < rows.length; r++) {
      var credits = num(String(rows[r][iCredits]).replace(/[, ]/g, ""), 0);
      users.push({ name: iUser >= 0 ? rows[r][iUser] : ("user " + r), credits30: credits });
    }
    var dist = distribution(users.map(function (u) { return u.credits30; }));
    var activeUsers = dist.count;
    return {
      ok: true,
      source: "credits-report",
      users: users,
      activeUsers: activeUsers,
      totalCredits30: dist.sum,
      avgCreditsPerActiveUser: activeUsers ? dist.sum / activeUsers : 0,
      medianCreditsPerActiveUser: dist.median,
      distribution: dist
    };
  }

  // Copilot Chat usage report CSV → active users, prompts/user, active days.
  function parseChatUsageCsv(text) {
    var rows = parseCsv(text);
    if (rows.length < 2) return { ok: false, error: "No data rows found.", rows: [] };
    var header = rows[0];
    var iPrompts = headerIndex(header, [/prompts?\s*submitted/i, /^prompts?$/i]);
    var iDays = headerIndex(header, [/active\s*days/i]);
    var iUser = headerIndex(header, [/user\s*name|username|user principal|display name|user/i]);
    if (iPrompts < 0) return { ok: false, error: "Couldn't find a 'Prompts submitted' column.", rows: [] };
    var users = [];
    for (var r = 1; r < rows.length; r++) {
      var prompts = num(String(rows[r][iPrompts]).replace(/[, ]/g, ""), 0);
      var days = iDays >= 0 ? num(String(rows[r][iDays]).replace(/[, ]/g, ""), 0) : 0;
      if (prompts > 0 || days > 0) users.push({ name: iUser >= 0 ? rows[r][iUser] : ("user " + r), prompts: prompts, activeDays: days });
    }
    var totalPrompts = users.reduce(function (a, u) { return a + u.prompts; }, 0);
    return {
      ok: true,
      source: "chat-usage",
      users: users,
      activeUsers: users.length,
      totalPrompts: totalPrompts,
      avgPromptsPerActiveUser: users.length ? totalPrompts / users.length : 0
    };
  }

  // Aggregate paste / OCR fallback — the 4 KPI numbers off the admin dashboard.
  function parseAggregate(obj) {
    obj = obj || {};
    return {
      ok: true,
      source: "aggregate",
      activeUsers: Math.max(0, num(obj.activeUsers, 0)),
      avgDailyActiveUsers: Math.max(0, num(obj.avgDailyActiveUsers, 0)),
      totalPrompts: Math.max(0, num(obj.totalPrompts, 0)),
      avgPromptsPerActiveUser: Math.max(0, num(obj.avgPromptsPerUser != null ? obj.avgPromptsPerUser : obj.avgPromptsPerActiveUser, 0))
    };
  }

  // Turn an import result into a seed for Quick/Detailed. `licensedUsers` is supplied
  // by the user (admin reports only cover metered/active users, not the licensed pop).
  function importToSeed(imported, opts) {
    opts = opts || {};
    var licensed = Math.max(0, num(opts.licensedUsers, 0));
    var out = { name: opts.name || "Imported (M365)", licensedUsers: licensed };
    if (imported && imported.source === "credits-report") {
      out.measuredActiveUsers = imported.activeUsers;
      out.creditsPerActiveUser = round(imported.avgCreditsPerActiveUser);
      // If we know the licensed pop, MAU = measured active ÷ licensed.
      if (licensed > 0) out.mauPct = clampPct(imported.activeUsers / licensed * 100);
      out.distribution = imported.distribution;
      // Data-driven range bounds from the real per-user spread: conservative = median,
      // liberal = p90. Clamped so the range always brackets the expected (mean).
      var d = imported.distribution || {};
      var mean = round(imported.avgCreditsPerActiveUser);
      if (d.median != null) out.creditsLow = Math.min(round(d.median), mean);
      if (d.p90 != null) out.creditsHigh = Math.max(round(d.p90), mean);
    } else if (imported && imported.source === "chat-usage") {
      out.measuredActiveUsers = imported.activeUsers;
      if (licensed > 0) out.mauPct = clampPct(imported.activeUsers / licensed * 100);
      out.avgPromptsPerActiveUser = imported.avgPromptsPerActiveUser;
      // No measured credits here — leave creditsPerActiveUser to the planning default.
    } else if (imported && imported.source === "aggregate") {
      out.measuredActiveUsers = imported.activeUsers;
      if (licensed > 0) out.mauPct = clampPct(imported.activeUsers / licensed * 100);
      out.avgPromptsPerActiveUser = imported.avgPromptsPerActiveUser;
    }
    return out;
  }

  var api = {
    RATE_PAYG: RATE_PAYG, RATE_PREPAID: RATE_PREPAID, PACK_SIZE: PACK_SIZE, PACK_PRICE: PACK_PRICE,
    DEFAULTS: DEFAULTS, MAU_BENCHMARKS: MAU_BENCHMARKS, INTENSITY_WEIGHTS: INTENSITY_WEIGHTS,
    intensityToCredits: intensityToCredits, activeUsers: activeUsers, normalizeGlobal: normalizeGlobal,
    creditsToSpend: creditsToSpend, budgetUsage: budgetUsage, purchasePlan: purchasePlan,
    quickEstimate: quickEstimate, cohortRow: cohortRow, detailedEstimate: detailedEstimate, forecast: forecast,
    scenarioCredits: scenarioCredits,
    seedDetailedFromQuick: seedDetailedFromQuick, seedCohortFromRow: seedCohortFromRow,
    parseCsv: parseCsv, distribution: distribution,
    parseCreditsReportCsv: parseCreditsReportCsv, parseChatUsageCsv: parseChatUsageCsv,
    parseAggregate: parseAggregate, importToSeed: importToSeed
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CoworkEstimator = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

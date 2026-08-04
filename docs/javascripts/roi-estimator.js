/* Copilot ROI Estimator — DOM glue + rendering for the Detailed ROI page.
 * Runs only on the roi-estimator page (guarded by #roi-detailed). All value/ROI
 * math lives in roi-core.js (window.ROICore), which in turn reuses
 * estimator-core.js (window.EstimatorCore) for cost — this file is UI only.
 */
(function () {
  "use strict";

  var R = null; // ROICore

  // ── formatting ────────────────────────────────────────────────────────────
  function money(n) {
    if (n == null || !isFinite(n)) return "n/a";
    var neg = n < 0; n = Math.abs(n);
    var s;
    if (n >= 1e6) s = "$" + (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    else if (n >= 1e3) s = "$" + (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    else s = "$" + Math.round(n).toLocaleString();
    return (neg ? "\u2212" : "") + s;
  }
  function pct(n) { return (n == null || !isFinite(n)) ? "n/a" : Math.round(n) + "%"; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function gv(id) { var e = document.getElementById(id); return e ? e.value : ""; }
  function gn(id) { var v = parseFloat(gv(id)); return isFinite(v) ? v : 0; }
  function sv(id, v) { var e = document.getElementById(id); if (e) e.value = v; }
  function num(v) { v = parseFloat(v); return isFinite(v) ? v : 0; }

  // ── read the form into a ROICore input ─────────────────────────────────────
  function readTimeRows() {
    var rows = document.querySelectorAll("#roi-time-rows .roi-time-row");
    var out = [];
    Array.prototype.forEach.call(rows, function (row) {
      function q(cls) { var e = row.querySelector(cls); return e ? e.value : ""; }
      out.push({
        label: q(".roi-t-label") || "Time saved",
        minutesPer: parseFloat(q(".roi-t-min")) || 0,
        perMonth: parseFloat(q(".roi-t-vol")) || 0,
        loadedRatePerHour: parseFloat(q(".roi-t-rate")) || 0
      });
    });
    return out;
  }
  function readInput() {
    return {
      billingBasis: gv("roi-basis") || "payg",
      horizonMonths: gn("roi-horizon") || 36,
      band: { conservativePct: gn("roi-cons"), optimisticPct: gn("roi-opt") },
      value: {
        timeSaved: readTimeRows(),
        deflection: { casesPerMonth: gn("roi-defl-cases"), deflectionPct: gn("roi-defl-pct"), costPerCase: gn("roi-defl-cost") },
        fteAvoided: { count: gn("roi-fte-count"), loadedAnnual: gn("roi-fte-annual") },
        adoption: { rampMonths: gn("roi-ramp-months"), startPct: gn("roi-ramp-start"), endPct: gn("roi-ramp-end") }
      },
      cost: {
        monthlyCredits: gn("roi-credits"),
        licensing: { seats: gn("roi-seats"), pricePerSeatMonth: gn("roi-seat-cost") },
        build: { personDays: gn("roi-build-days"), dayRate: gn("roi-build-rate") },
        maintenance: { hoursPerMonth: gn("roi-maint-hrs"), hourRate: gn("roi-maint-rate") }
      }
    };
  }

  // ── rendering ──────────────────────────────────────────────────────────────
  function tagHtml(basis) {
    var cls = basis === "HARD" ? "roi-tag--hard" : basis === "SOFT" ? "roi-tag--soft" : "roi-tag--assumption";
    return '<span class="roi-tag ' + cls + '">' + basis + "</span>";
  }
  function payLabel(m) { return m == null ? "> horizon" : m + " mo"; }

  // Headline cards + confidence band — shared by Detailed and Quick.
  function cardsHtml(r) {
    var hz = r.horizonMonths;
    var html = '<div class="roi-cards">';
    html += '<div class="roi-card"><div class="roi-card-val">' + payLabel(r.paybackMonths) + '</div><div class="roi-card-lbl">Payback period</div></div>';
    html += '<div class="roi-card"><div class="roi-card-val">' + pct(r.horizon.roiPct) + '</div><div class="roi-card-lbl">ROI over ' + hz + ' months</div></div>';
    html += '<div class="roi-card"><div class="roi-card-val">' + money(r.horizon.net) + '</div><div class="roi-card-lbl">Net value over ' + hz + ' months</div></div>';
    html += "</div>";
    return html;
  }
  function bandHtml(r) {
    var hz = r.horizonMonths;
    var html = "<p><strong>Confidence band</strong> (over " + hz + " months) — value scaled for how much you actually realize:</p>";
    html += '<div class="roi-band">';
    html += '<div><div class="roi-card-lbl">Conservative</div><div><strong>' + pct(r.band.conservative.roiPct) + "</strong></div>" + money(r.band.conservative.net) + '<div class="roi-card-lbl">payback ' + payLabel(r.band.conservative.paybackMonths) + "</div></div>";
    html += '<div class="roi-band-exp"><div class="roi-card-lbl">Expected</div><div><strong>' + pct(r.band.expected.roiPct) + "</strong></div>" + money(r.band.expected.net) + '<div class="roi-card-lbl">payback ' + payLabel(r.band.expected.paybackMonths) + "</div></div>";
    html += '<div><div class="roi-card-lbl">Optimistic</div><div><strong>' + pct(r.band.optimistic.roiPct) + "</strong></div>" + money(r.band.optimistic.net) + '<div class="roi-card-lbl">payback ' + payLabel(r.band.optimistic.paybackMonths) + "</div></div>";
    html += "</div>";
    html += '<p class="roi-note">This band flexes the <em>value</em> you realize; run cost and adoption are held constant, and figures are <strong>not</strong> NPV-discounted \u2014 a dollar in year 3 counts the same as year 1.</p>';
    return html;
  }

  function render(r) {
    var html = "";

    // Headline cards
    html += cardsHtml(r);
    html += '<p class="roi-note">Year 1: net <strong>' + money(r.year1.net) + "</strong> (ROI " + pct(r.year1.roiPct) + "). Steady-state monthly net once fully adopted: <strong>" + money(r.monthly.netFull) + "</strong>.</p>";

    // Confidence band
    html += bandHtml(r);

    // Value vs cost breakdown (monthly, at steady state)
    html += "<p><strong>Monthly breakdown</strong> (at steady-state adoption):</p>";
    html += '<table class="roi-table"><thead><tr><th>Value</th><th class="num">$/month</th></tr></thead><tbody>';
    r.valueLines.forEach(function (l) {
      html += "<tr><td>" + esc(l.label) + " " + tagHtml(l.basis) + '</td><td class="num">' + money(l.monthly) + "</td></tr>";
    });
    html += '<tr><td><strong>Total value</strong></td><td class="num"><strong>' + money(r.monthly.valueFull) + "</strong></td></tr>";
    html += "</tbody></table>";

    html += '<table class="roi-table"><thead><tr><th>Cost</th><th class="num">$/month</th></tr></thead><tbody>';
    html += '<tr><td>Run — Copilot Credits (' + r.basis + ") " + tagHtml("HARD") + '</td><td class="num">' + money(r.monthly.run) + "</td></tr>";
    html += '<tr><td>Licensing</td><td class="num">' + money(r.monthly.licensing) + "</td></tr>";
    html += '<tr><td>Maintenance ' + tagHtml("ASSUMPTION") + '</td><td class="num">' + money(r.monthly.maintenance) + "</td></tr>";
    html += '<tr><td><strong>Total run cost</strong></td><td class="num"><strong>' + money(r.monthly.costFull) + "</strong></td></tr>";
    html += '<tr><td>Build (one-time) ' + tagHtml("ASSUMPTION") + '</td><td class="num">' + money(r.build) + "</td></tr>";
    html += "</tbody></table>";

    html += '<p class="roi-note">Adjust the <strong>adoption ramp</strong> or the <strong>conservative %</strong> to see the range move. Lead your business case with the <span class="roi-tag roi-tag--hard">HARD</span> numbers; present <span class="roi-tag roi-tag--soft">SOFT</span> ones as upside, clearly labeled — an inflated figure a skeptic catches sinks the whole case.</p>';

    return html;
  }

  // ── actions (exposed as globals for inline onclick) ─────────────────────────
  function roiCalculate() {
    if (!R) return;
    var out = document.getElementById("roi-results");
    if (!out) return;
    var r = R.computeROI(readInput());
    out.innerHTML = render(r);
    out.classList.remove("roi-hidden");
  }
  function roiAddTimeRow() { addTimeRow(); }
  // Build one time-saved row's inner HTML from an optional seed object.
  function timeRowHtml(t) {
    t = t || {};
    var lbl = t.label != null ? t.label : "";
    var min = t.minutesPer != null ? t.minutesPer : 5;
    var vol = t.perMonth != null ? t.perMonth : 100;
    var rate = t.loadedRatePerHour != null ? t.loadedRatePerHour : 45;
    return '<div class="roi-field"><label>What it helps with</label><input type="text" class="roi-t-label" value="' + esc(lbl) + '"></div>' +
      '<div class="roi-field"><label>Min saved each</label><input type="number" class="roi-t-min" inputmode="numeric" value="' + min + '"></div>' +
      '<div class="roi-field"><label>Times / month</label><input type="number" class="roi-t-vol" inputmode="numeric" value="' + vol + '"></div>' +
      '<div class="roi-field"><label>Loaded $/hour</label><input type="number" class="roi-t-rate" inputmode="numeric" value="' + rate + '"></div>' +
      '<button type="button" class="roi-row-rm" onclick="roiRemoveTimeRow(this)" title="Remove">\u2715</button>';
  }
  function addTimeRow(t) {
    var host = document.getElementById("roi-time-rows");
    if (!host) return;
    var div = document.createElement("div");
    div.className = "roi-time-row";
    div.innerHTML = timeRowHtml(t);
    host.appendChild(div);
  }
  function roiRemoveTimeRow(btn) {
    var host = document.getElementById("roi-time-rows");
    if (!host) return;
    var rows = host.querySelectorAll(".roi-time-row");
    if (rows.length <= 1) return; // keep at least one
    var row = btn.closest ? btn.closest(".roi-time-row") : btn.parentNode;
    if (row && row.parentNode) row.parentNode.removeChild(row);
  }
  function roiSizeToDays() {
    if (!R) return;
    sv("roi-build-days", R.sizeToPersonDays(gv("roi-size")));
  }
  function roiLoadExample() {
    if (!R) return;
    var d = R.defaultInput();
    sv("roi-basis", d.billingBasis); sv("roi-horizon", String(d.horizonMonths));
    sv("roi-cons", d.band.conservativePct); sv("roi-opt", d.band.optimisticPct);
    sv("roi-defl-cases", d.value.deflection.casesPerMonth); sv("roi-defl-pct", d.value.deflection.deflectionPct); sv("roi-defl-cost", d.value.deflection.costPerCase);
    sv("roi-fte-count", d.value.fteAvoided.count); sv("roi-fte-annual", d.value.fteAvoided.loadedAnnual);
    sv("roi-ramp-months", d.value.adoption.rampMonths); sv("roi-ramp-start", d.value.adoption.startPct); sv("roi-ramp-end", d.value.adoption.endPct);
    sv("roi-credits", d.cost.monthlyCredits); sv("roi-seats", d.cost.licensing.seats); sv("roi-seat-cost", d.cost.licensing.pricePerSeatMonth);
    sv("roi-build-days", d.cost.build.personDays); sv("roi-build-rate", d.cost.build.dayRate);
    sv("roi-maint-hrs", d.cost.maintenance.hoursPerMonth); sv("roi-maint-rate", d.cost.maintenance.hourRate);
    // rebuild time rows from the example
    var host = document.getElementById("roi-time-rows");
    if (host) {
      host.innerHTML = "";
      d.value.timeSaved.forEach(function (t) { addTimeRow(t); });
    }
    roiCalculate();
  }

  // ── Quick ROI (natural language → instant band) ─────────────────────────────
  var quickState = null;
  var QUICK_EXAMPLES = [
    "A customer support agent that answers product questions from our help centre and drafts ticket replies for about 400 support reps, several times a day.",
    "An autonomous agent that reads each new invoice email in a shared mailbox, extracts the fields, and creates a record in Dynamics 365 — around 3,000 invoices a month.",
    "An HR policy Q&A assistant that answers benefits and leave questions from our SharePoint policy library for about 5,000 employees, a couple of times a month."
  ];

  function renderQuick(input, roi) {
    var m = input._meta || {};
    var vol = Math.round(num(m.volume));
    var credits = Math.round(num(m.monthlyCredits));
    var html = "";
    if (importSource) {
      html += '<div class="roi-provenance">\u21a9 Imported from the Credit Estimator</div>';
      importSource = null; // show the provenance chip once, on the import-driven render
    }
    html += '<div class="roi-read"><strong>How we read your scenario</strong> — from the <a href="credit-estimator/">Credit Estimator</a> engine:';
    html += '<ul class="roi-read-list">';
    html += "<li>Runs <strong>" + esc(m.regime || "interactive") + "</strong> · build size <strong>" + esc(m.size || "M") + "</strong> (~" + num(m.personDays) + " person-days)</li>";
    html += "<li>~<strong>" + vol.toLocaleString() + "</strong> tasks / month · ~<strong>" + credits.toLocaleString() + "</strong> credits / month → <strong>" + money(roi.monthly.run) + "</strong> / month to run</li>";
    html += "</ul></div>";
    html += cardsHtml(roi);
    html += bandHtml(roi);
    html += '<p class="roi-note">Value assumes <strong>' + num(m.minutes) + " min</strong> saved per task \u00d7 <strong>" + vol.toLocaleString() + "</strong> tasks/mo \u00d7 <strong>$" + num(m.rate) + "/hr</strong>, ramping to steady state over " + R.QUICK.rampMonths + " months. These are <em>your</em> economics \u2014 tune the dials, or open Detailed for the full cost-avoidance model.</p>";
    html += '<div class="roi-actions"><button type="button" class="roi-btn roi-btn--ghost" onclick="roiQuickToDetailed()">Refine in Detailed \u2192</button></div>';
    return html;
  }

  function roiQuickEstimate() {
    if (!R) return;
    var out = document.getElementById("roi-q-results");
    if (!out) return;
    var EC = window.EstimatorCore;
    if (!EC || typeof EC.analyzeText !== "function") {
      out.innerHTML = '<p class="roi-note">The scenario engine isn\u2019t loaded, so Quick ROI can\u2019t read your description. Use the Detailed tab instead.</p>';
      out.classList.remove("roi-hidden");
      return;
    }
    var desc = (gv("roi-q-desc") || "").trim();
    if (!desc) {
      out.innerHTML = '<p class="roi-note">Describe the agent above, then choose <strong>Estimate ROI</strong>.</p>';
      out.classList.remove("roi-hidden");
      return;
    }
    var analysis = EC.analyzeText(desc);
    var dials = { minutesSaved: gn("roi-q-min"), loadedRate: gn("roi-q-rate"), basis: gv("roi-q-basis") };
    var input = R.quickInputFromAnalysis(analysis, dials);
    var roi = R.computeROI(input);
    quickState = { analysis: analysis, input: input, roi: roi };
    out.innerHTML = renderQuick(input, roi);
    out.classList.remove("roi-hidden");
  }

  function roiQuickExample(i) {
    sv("roi-q-desc", QUICK_EXAMPLES[i] || QUICK_EXAMPLES[0]);
    roiQuickEstimate();
  }

  // Seed the Detailed form from the current Quick estimate, then switch + recalc.
  function roiQuickToDetailed() {
    if (!R || !quickState) { roiSetMode("detailed"); return; }
    var input = quickState.input, m = input._meta || {};
    var host = document.getElementById("roi-time-rows");
    if (host) {
      host.innerHTML = "";
      (input.value.timeSaved || []).forEach(function (t) { addTimeRow(t); });
      if (!host.querySelector(".roi-time-row")) addTimeRow();
    }
    // Quick uses a single HARD time-saved lever — zero the SOFT levers so Detailed matches.
    sv("roi-defl-cases", 0); sv("roi-defl-pct", 0); sv("roi-defl-cost", 0);
    sv("roi-fte-count", 0);
    sv("roi-ramp-months", input.value.adoption.rampMonths);
    sv("roi-ramp-start", input.value.adoption.startPct);
    sv("roi-ramp-end", input.value.adoption.endPct);
    sv("roi-credits", input.cost.monthlyCredits);
    sv("roi-basis", input.billingBasis);
    sv("roi-seats", input.cost.licensing.seats);
    sv("roi-seat-cost", input.cost.licensing.pricePerSeatMonth);
    sv("roi-size", m.size || "M"); roiSizeToDays();
    sv("roi-build-rate", input.cost.build.dayRate);
    sv("roi-maint-hrs", input.cost.maintenance.hoursPerMonth);
    sv("roi-maint-rate", input.cost.maintenance.hourRate);
    sv("roi-horizon", String(input.horizonMonths));
    sv("roi-cons", input.band.conservativePct); sv("roi-opt", input.band.optimisticPct);
    roiSetMode("detailed");
    roiCalculate();
  }

  // ── mode switcher ───────────────────────────────────────────────────────────
  function roiSetMode(mode) {
    mode = mode === "detailed" ? "detailed" : "quick";
    var q = document.getElementById("roi-quick");
    var d = document.getElementById("roi-detailed");
    if (q) q.classList.toggle("roi-hidden", mode !== "quick");
    if (d) d.classList.toggle("roi-hidden", mode !== "detailed");
    var mq = document.getElementById("roi-mode-quick");
    var md = document.getElementById("roi-mode-detailed");
    if (mq) { mq.classList.toggle("roi-mode--active", mode === "quick"); mq.setAttribute("aria-selected", mode === "quick" ? "true" : "false"); }
    if (md) { md.classList.toggle("roi-mode--active", mode === "detailed"); md.setAttribute("aria-selected", mode === "detailed" ? "true" : "false"); }
    var desc = document.getElementById("roi-mode-desc");
    if (desc) desc.textContent = mode === "quick"
      ? "Describe the agent in plain English \u2014 we read the scenario with the Credit Estimator engine and return an instant ROI band. Best for early-stage ideas."
      : "Enter your value levers and full cost breakdown for a defensible, adjustable ROI model. Best once you know the scenario.";
  }

  // ── import banner: a scenario handed off from the Credit Estimator ────────────
  // Review-before-commit by default (SiteBus.UX.autoApply === false): show the
  // banner, apply only when the user presses "Use it". The estimate is recomputed
  // from input.text via the shared engine — nothing frozen is trusted.
  var importSource = null; // {id, label} provenance for the current Quick estimate
  function roiRenderImportBanner(item) {
    var host = document.getElementById("roi-import");
    if (!host) return;
    if (!item) { host.innerHTML = ""; host.classList.add("roi-hidden"); return; }
    host.innerHTML =
      '<div class="roi-import-inner">' +
        '<span class="roi-import-icon" aria-hidden="true">\u21a9</span>' +
        '<div class="roi-import-body">' +
          '<strong>Imported from the Credit Estimator</strong>' +
          '<span class="roi-import-label">' + esc(item.label || "your scenario") + '</span>' +
        '</div>' +
        '<div class="roi-import-actions">' +
          '<button type="button" class="roi-btn" onclick="roiUseImport()">Use it</button>' +
          '<button type="button" class="roi-btn roi-btn--ghost" onclick="roiDismissImport()">Dismiss</button>' +
        '</div>' +
      '</div>';
    host.classList.remove("roi-hidden");
  }
  function roiUseImport() {
    var B = window.SiteBus; if (!B) return;
    var item = B.takeHandoff("estimate"); // consume-once
    roiRenderImportBanner(null);
    if (!item) return;
    importSource = { id: item.id, label: item.label || "" };
    if (item.input && item.input.text != null) sv("roi-q-desc", item.input.text);
    var UX = B.UX || {};
    roiQuickEstimate();
    if (UX.target === "detailed") roiQuickToDetailed();
    else roiSetMode("quick");
  }
  function roiDismissImport() {
    var B = window.SiteBus; if (B) B.takeHandoff("estimate"); // clear without applying
    roiRenderImportBanner(null);
  }

  // ── portfolio ROI: aggregate every saved estimate from the "My estimates" cart ─
  // Reached via the cart's "Send all to ROI →" (?from=workspace). Recomputes each
  // saved item live (Portfolio.recomputeItem), sums a MIXED credits/cost total, then
  // feeds ROICore ONE portfolio input (Portfolio.toRoiInput). Value is user-tunable.
  var portfolioState = null; // { agg, ids }
  function roiEngines() { return { EstimatorCore: window.EstimatorCore, CoworkEstimator: window.CoworkEstimator }; }

  function roiPortfolioEstimate() {
    if (!R) return;
    var out = document.getElementById("roi-q-results");
    if (!out) return;
    var B = window.SiteBus, P = window.Portfolio;
    if (!B || !P) {
      out.innerHTML = '<p class="roi-note">The estimates cart isn\u2019t available here. Use the Quick or Detailed tab instead.</p>';
      out.classList.remove("roi-hidden");
      return;
    }
    var items = B.list();
    if (!items.length) {
      out.innerHTML = '<p class="roi-note">No saved estimates yet. Build estimates in the <a href="credit-estimator.md">Credit Estimator</a>, press <strong>Save to My estimates</strong>, then come back here to roll them into one ROI.</p>';
      out.classList.remove("roi-hidden");
      return;
    }
    var agg = P.aggregate(items, roiEngines());
    var seedValue = agg.studioValueMonthly > 0 ? agg.studioValueMonthly : agg.suggestedCoworkValueMonthly;
    var dials = { valueMonthly: seedValue, EstimatorCore: window.EstimatorCore };
    var input = P.toRoiInput(agg, dials);
    var roi = R.computeROI(input);
    portfolioState = { agg: agg, ids: items.map(function (i) { return i.id; }) };
    quickState = { analysis: null, input: input, roi: roi }; // lets "Refine in Detailed" reuse it
    out.innerHTML = roiRenderPortfolio(agg, input, roi);
    out.classList.remove("roi-hidden");
    roiRenderImportBanner(null); // dismiss the "Build portfolio ROI" offer once it's built
    try { out.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) {}
  }

  // Re-run the portfolio ROI when the user tunes the aggregate value lever.
  function roiPortfolioValue() {
    if (!R || !portfolioState) return;
    var P = window.Portfolio; if (!P) return;
    var out = document.getElementById("roi-q-results"); if (!out) return;
    var val = gn("roi-p-value");
    var input = P.toRoiInput(portfolioState.agg, { valueMonthly: val, EstimatorCore: window.EstimatorCore });
    var roi = R.computeROI(input);
    quickState = { analysis: null, input: input, roi: roi };
    out.innerHTML = roiRenderPortfolio(portfolioState.agg, input, roi);
    out.classList.remove("roi-hidden");
  }

  function roiRenderPortfolio(agg, input, roi) {
    var m = input._meta || {};
    var credits = Math.round(num(m.realMonthlyCredits));
    var cost = num(m.realMonthlyCostUSD);
    var value = Math.round(num(m.valueMonthly));
    var html = '<div class="roi-provenance">\uD83E\uDDFA Portfolio ROI \u2014 rolled up from ' + (agg.count || 0) + ' saved estimate' + (agg.count === 1 ? "" : "s") + "</div>";
    html += '<div class="roi-read"><strong>What you\u2019ve saved</strong> \u2014 recomputed live from each estimate\u2019s inputs:';
    html += '<ul class="roi-read-list">';
    html += "<li>~<strong>" + credits.toLocaleString() + "</strong> credits / month across the set \u2192 <strong>" + money(cost) + "</strong> / month to run</li>";
    // Per-producer split.
    var bp = agg.byProducer || {};
    var parts = [];
    if (bp.studio) parts.push(bp.studio.count + " Studio (" + Math.round(bp.studio.monthlyCredits).toLocaleString() + " cr/mo)");
    if (bp.cowork) parts.push(bp.cowork.count + " Cowork (" + Math.round(bp.cowork.monthlyCredits).toLocaleString() + " cr/mo)");
    if (parts.length) html += "<li>" + esc(parts.join(" \u00b7 ")) + "</li>";
    html += "</ul></div>";

    // Tunable aggregate value lever.
    html += '<div class="roi-pvalue"><label for="roi-p-value"><strong>Estimated value of this work</strong> ($/month)</label>' +
      '<input type="number" id="roi-p-value" inputmode="numeric" value="' + value + '" onchange="roiPortfolioValue()" oninput="roiPortfolioValue()">' +
      '<span class="roi-pvalue-hint">Studio estimates seed a time-saved value; Cowork measures consumption (no built-in value), so set the number your business case will stand behind.</span></div>';
    if ((agg.studioValueMonthly || 0) <= 0 && (agg.coworkActiveUsers || 0) > 0) {
      html += '<p class="roi-note">\uD83D\uDCA1 Value seeded from ~' + Math.round(agg.coworkActiveUsers).toLocaleString() +
        ' active Cowork users \u00d7 15 min/day \u00d7 $50/hr \u2014 a starting suggestion; tune it to your business case.</p>';
    }

    html += cardsHtml(roi);
    html += bandHtml(roi);

    (agg.notes || []).forEach(function (n) { html += '<p class="roi-note">' + esc(n) + "</p>"; });
    html += '<p class="roi-note">Run cost is the exact sum of every saved estimate (Studio credits + Cowork spend). Value is your single tunable lever above, ramping to steady state over ' + R.QUICK.rampMonths + " months.</p>";
    html += '<div class="roi-actions">' +
      '<button type="button" class="roi-btn" onclick="roiPortfolioToProposal()">\uD83D\uDCC4 Add to proposal \u2192</button>' +
      '<button type="button" class="roi-btn roi-btn--ghost" onclick="roiQuickToDetailed()">Refine in Detailed \u2192</button></div>';
    return html;
  }

  // Tier 1.5: commit the tuned portfolio ROI into a proposal. The estimates are already
  // in the cart (the proposal re-reads them); we carry the tuned value/basis/horizon dials
  // via URL so the proposal honors YOUR ROI instead of reseeding from scratch.
  function roiPortfolioToProposal() {
    var v = Math.round(num(gn("roi-p-value")));
    var basis = gv("roi-q-basis") === "prepaid" ? "prepaid" : "payg";
    var url = "../proposal/?from=roi&value=" + encodeURIComponent(v) + "&basis=" + basis + "&horizon=36";
    try { window.location.href = url; } catch (e) {}
  }

  // Offer to roll the cart into a portfolio ROI (shown when items exist but no handoff).
  function roiRenderPortfolioOffer(n) {
    var host = document.getElementById("roi-import");
    if (!host) return;
    host.innerHTML =
      '<div class="roi-import-inner">' +
        '<span class="roi-import-icon" aria-hidden="true">\uD83E\uDDFA</span>' +
        '<div class="roi-import-body">' +
          '<strong>You have ' + n + ' saved estimate' + (n === 1 ? "" : "s") + '</strong>' +
          '<span class="roi-import-label">Roll them into one portfolio ROI \u2014 mixed Studio + Cowork.</span>' +
        '</div>' +
        '<div class="roi-import-actions">' +
          '<button type="button" class="roi-btn" onclick="roiPortfolioEstimate()">Build portfolio ROI</button>' +
        '</div>' +
      '</div>';
    host.classList.remove("roi-hidden");
  }

  // expose immediately so inline onclick handlers always resolve
  window.roiCalculate = roiCalculate;
  window.roiAddTimeRow = roiAddTimeRow;
  window.roiRemoveTimeRow = roiRemoveTimeRow;
  window.roiSizeToDays = roiSizeToDays;
  window.roiLoadExample = roiLoadExample;
  window.roiSetMode = roiSetMode;
  window.roiQuickEstimate = roiQuickEstimate;
  window.roiQuickExample = roiQuickExample;
  window.roiQuickToDetailed = roiQuickToDetailed;
  window.roiUseImport = roiUseImport;
  window.roiDismissImport = roiDismissImport;
  window.roiPortfolioEstimate = roiPortfolioEstimate;
  window.roiPortfolioValue = roiPortfolioValue;
  window.roiPortfolioToProposal = roiPortfolioToProposal;

  function fromParam() {
    try { return new URLSearchParams(window.location.search).get("from") || ""; }
    catch (e) { return ""; }
  }

  function init() {
    if (!document.getElementById("roi-detailed")) return; // only on the ROI page
    R = window.ROICore || null;
    if (!R) return;
    roiCalculate(); // compute the Detailed worked example (hidden until selected)
    var B = window.SiteBus || null;
    var UX = (B && B.UX) || {};

    // Portfolio intake: the cart's "Send all to ROI →" lands here (?from=workspace).
    if (fromParam() === "workspace" && B && window.Portfolio) {
      roiSetMode("quick");
      roiPortfolioEstimate();
      return;
    }

    var pending = B ? B.peekHandoff("estimate") : null;
    if (pending && pending.input && pending.input.text != null) {
      // A scenario was handed off — pre-fill the box, land in the target mode, and
      // (unless autoApply) wait for the user to press "Use it" before recomputing.
      sv("roi-q-desc", pending.input.text);
      roiSetMode(UX.target === "detailed" ? "detailed" : "quick");
      if (UX.autoApply) {
        roiUseImport();
      } else {
        roiRenderImportBanner(pending);
        var out = document.getElementById("roi-q-results");
        if (out) {
          out.innerHTML = '<p class="roi-note">Imported your scenario from the <a href="credit-estimator.md">Credit Estimator</a>. Press <strong>Use it</strong> above to run the ROI \u2014 or edit the description first.</p>';
          out.classList.remove("roi-hidden");
        }
      }
      return;
    }
    if (!(gv("roi-q-desc") || "").trim()) sv("roi-q-desc", QUICK_EXAMPLES[0]);
    roiSetMode("quick"); // Quick is the default landing mode
    // If the cart has saved estimates, lead with the portfolio offer (a clear CTA) instead
    // of pre-rendering a default example that reads like a stray result.
    var saved = (B && window.Portfolio) ? B.list() : [];
    if (saved.length) roiRenderPortfolioOffer(saved.length);
    else roiQuickEstimate(); // seed the default Quick view only when the cart is empty
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

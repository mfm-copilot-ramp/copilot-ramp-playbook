/* Copilot Credit Estimator — Cowork lane UI controller (DOM glue).
 * Wires the product switcher (Studio <-> Cowork) and the Cowork mode row, and
 * renders the Quick macro estimate. Pure math lives in estimator-cowork.js
 * (window.CoworkEstimator). Loaded after credit-estimator.js via mkdocs.yml.
 */
(function () {
  "use strict";

  // ── formatting ──────────────────────────────────────────────────────────────
  function fmt(n) {
    n = Math.round(n || 0);
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return n.toLocaleString();
  }
  function money(n) {
    n = n || 0;
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2).replace(/\.00$/, "") + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    if (n >= 100) return "$" + Math.round(n).toLocaleString();
    return "$" + (Math.round(n * 100) / 100).toLocaleString();
  }
  function el(id) { return document.getElementById(id); }
  function val(id) { var e = el(id); return e ? e.value : 0; }
  function chk(id) { var e = el(id); return e ? e.checked : false; }
  function setText(id, t) { var e = el(id); if (e) e.textContent = t; }
  function setHtml(id, h) { var e = el(id); if (e) e.innerHTML = h; }
  function setVal(id, v) { var e = el(id); if (e) e.value = v; }
  function setChk(id, v) { var e = el(id); if (e) e.checked = !!v; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function csv(s) { s = String(s == null ? "" : s); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }

  // Detailed-mode state: cohort array + feed-forward origin.
  var cwState = { cohorts: null, origin: null };
  var cwLastImport = null;   // last parsed M365 import result
  var cwShotDataUrl = null;  // last dropped screenshot (data URL) for optional OCR

  // ── product switch (Studio <-> Cowork) ──────────────────────────────────────
  function setEstimatorProduct(which) {
    var isCo = which === "cowork";
    var studio = el("estimator-studio");
    var detailed = el("panel-detailed");
    var cowork = el("estimator-cowork");
    var tS = el("prod-tab-studio");
    var tC = el("prod-tab-cowork");
    var flight = el("flight-toggle");
    if (studio) studio.classList.toggle("em-hidden", isCo);
    if (cowork) cowork.classList.toggle("em-hidden", !isCo);
    // #panel-detailed is part of the Studio lane (its shared output card). Hide it
    // under Cowork; when returning to Studio, show it only if Studio's mode is Detailed.
    if (detailed) {
      if (isCo) detailed.classList.add("em-hidden");
      else {
        var sel = el("mode-select");
        detailed.classList.toggle("em-hidden", !(sel && sel.value === "detailed"));
      }
    }
    if (flight) flight.style.display = isCo ? "none" : "";
    if (tS) { tS.classList.toggle("est-tab--active", !isCo); tS.setAttribute("aria-selected", String(!isCo)); }
    if (tC) { tC.classList.toggle("est-tab--active", isCo); tC.setAttribute("aria-selected", String(isCo)); }
    if (isCo) cwQuickCalc();
  }

  // ── Cowork mode row (Quick / Detailed / Import) ─────────────────────────────
  function setCoworkMode(mode) {
    ["quick", "detailed", "import"].forEach(function (m) {
      var p = el("cw-panel-" + m); if (p) p.classList.toggle("em-hidden", m !== mode);
      var t = el("cw-tab-" + m);
      if (t) { t.classList.toggle("est-tab--active", m === mode); t.setAttribute("aria-selected", String(m === mode)); }
    });
    if (mode === "quick") cwQuickCalc();
    if (mode === "detailed") { if (!cwState.cohorts) seedDefaultCohorts(); recomputeDetailed(); }
  }

  // ── MAU benchmark chips ─────────────────────────────────────────────────────
  function renderChips() {
    var C = window.CoworkEstimator, wrap = el("cw-mau-chips");
    if (!C || !wrap) return;
    wrap.innerHTML = C.MAU_BENCHMARKS.map(function (b) {
      return '<button type="button" class="cw-chip" onclick="cwSetMau(' + b.pct + ')">' + b.label + " " + b.pct + "%</button>";
    }).join("");
  }
  function cwSetMau(p) { var e = el("cw-mau"); if (e) { e.value = p; cwQuickCalc(); } }

  // ── Quick estimate render ───────────────────────────────────────────────────
  function cwQuickCalc() {
    var C = window.CoworkEstimator; if (!C || !el("cw-licensed")) return;
    var r = C.quickEstimate({
      licensedUsers: val("cw-licensed"),
      mauPct: val("cw-mau"),
      creditsPerActiveUser: val("cw-cpu"),
      global: {
        pricePerCredit: val("cw-price"),
        azureDiscountPct: val("cw-discount"),
        licenseFloorEnabled: chk("cw-floor"),
        licensePricePerUser: val("cw-floor-price"),
        budgetCap: val("cw-budget")
      }
    });
    setText("cw-res-active", fmt(r.activeUsers));
    setText("cw-res-of", "of " + fmt(r.licensedUsers) + " @ " + Math.round(r.mauPct) + "%");
    setText("cw-res-credits", fmt(r.monthlyCredits));
    setText("cw-res-spend", money(r.coworkSpend));
    setText("cw-res-peruser", money(r.costPerActiveUser));

    var p = r.purchase;
    setHtml("cw-purchase",
      "<strong>Purchase:</strong> ~" + fmt(p.packsNeeded) + " message pack" + (p.packsNeeded === 1 ? "" : "s") +
      " (25,000 credits each \u2248 " + money(p.packsCost) + "/mo) &middot; or a committed pre-purchase \u2248 " +
      money(p.committedMonthlyCost) + "/mo (" + money(p.committedAnnualCost) + "/yr).");

    if (r.budget && r.budget.pct != null) {
      setHtml("cw-budget-out", "<strong>Budget:</strong> uses " + Math.round(r.budget.pct) + "% of your " +
        money(r.budget.cap) + " cap" + (r.budget.over ? ' \u2014 <span style="color:#b3261e">over budget</span>.' : "."));
    } else setHtml("cw-budget-out", "");

    var note = "Annual Cowork \u2248 " + money(r.annualCoworkSpend) + ".";
    if (r.licenseFloor > 0) note += " With the license floor, total \u2248 " + money(r.totalSpend) + "/mo.";
    setText("cw-total-note", note);
  }

  // ── Detailed (per-cohort hub) ───────────────────────────────────────────────
  function seedDefaultCohorts() {
    cwState.cohorts = [{ name: "All users", licensedUsers: 1000, mauPct: 15, creditsPerActiveUser: 5000 }];
    renderCohorts();
  }

  function readDetailedGlobal() {
    return {
      pricePerCredit: val("cw-d-price"),
      azureDiscountPct: val("cw-d-discount"),
      licenseFloorEnabled: chk("cw-d-floor"),
      licensePricePerUser: val("cw-d-floor-price"),
      budgetCap: val("cw-d-budget"),
      rampGrowthPct: val("cw-d-growth"),
      forecastMonths: 6
    };
  }

  function cohortCardHtml(c, i) {
    var canDel = cwState.cohorts.length > 1;
    return '<div class="cw-cohort">' +
      '<div class="cw-cohort-head">' +
        '<input class="cw-cohort-name" value="' + esc(c.name) + '" onchange="cwCohortSet(' + i + ",'name',this.value)\" aria-label=\"Cohort name\">" +
        (canDel ? '<button type="button" class="cw-cohort-del" onclick="cwRemoveCohort(' + i + ')" title="Remove cohort" aria-label="Remove cohort">\u2715</button>' : "") +
      '</div>' +
      '<div class="cw-grid">' +
        '<div class="cw-field"><label>Licensed users</label><input type="number" min="0" step="1" value="' + esc(c.licensedUsers) + '" oninput="cwCohortSet(' + i + ",'licensedUsers',this.value)\"></div>" +
        '<div class="cw-field"><label>Active usage %</label><input type="number" min="0" max="100" step="1" value="' + esc(c.mauPct) + '" oninput="cwCohortSet(' + i + ",'mauPct',this.value)\"></div>" +
        '<div class="cw-field"><label>Avg credits / user / mo</label><input type="number" min="0" step="50" value="' + esc(c.creditsPerActiveUser) + '" oninput="cwCohortSet(' + i + ",'creditsPerActiveUser',this.value)\"></div>" +
        '<div class="cw-cohort-out" id="cw-cohort-out-' + i + '"></div>' +
      '</div>' +
    '</div>';
  }

  function renderCohorts() {
    var wrap = el("cw-cohorts"); if (!wrap) return;
    wrap.innerHTML = (cwState.cohorts || []).map(cohortCardHtml).join("");
  }

  // Update state without re-rendering inputs (preserves focus while typing);
  // only outputs are refreshed by recomputeDetailed().
  function cwCohortSet(i, field, v) {
    if (!cwState.cohorts || !cwState.cohorts[i]) return;
    cwState.cohorts[i][field] = v;
    recomputeDetailed();
  }

  function cwAddCohort() {
    if (!cwState.cohorts) cwState.cohorts = [];
    cwState.cohorts.push({ name: "Cohort " + (cwState.cohorts.length + 1), licensedUsers: 200, mauPct: 15, creditsPerActiveUser: 5000 });
    renderCohorts(); recomputeDetailed();
  }

  function cwRemoveCohort(i) {
    if (!cwState.cohorts) return;
    cwState.cohorts.splice(i, 1);
    if (!cwState.cohorts.length) cwState.cohorts.push({ name: "All users", licensedUsers: 1000, mauPct: 15, creditsPerActiveUser: 5000 });
    renderCohorts(); recomputeDetailed();
  }

  function recomputeDetailed() {
    var C = window.CoworkEstimator; if (!C || !el("cw-cohorts")) return;
    var g = readDetailedGlobal();
    var res = C.detailedEstimate({ cohorts: cwState.cohorts || [], global: g });
    res.cohorts.forEach(function (r, i) {
      setHtml("cw-cohort-out-" + i, fmt(r.activeUsers) + " active \u00b7 " + fmt(r.monthlyCredits) + " cr \u00b7 " + money(r.coworkSpend) + "/mo");
    });
    var t = res.totals;
    setText("cw-d-res-active", fmt(t.activeUsers));
    setText("cw-d-res-of", "of " + fmt(t.licensedUsers) + " @ " + Math.round(t.mauPct) + "%");
    setText("cw-d-res-credits", fmt(t.monthlyCredits));
    setText("cw-d-res-spend", money(t.coworkSpend));
    setText("cw-d-res-peruser", money(t.costPerActiveUser));
    var p = res.purchase;
    setHtml("cw-d-purchase", "<strong>Purchase:</strong> ~" + fmt(p.packsNeeded) + " message pack" + (p.packsNeeded === 1 ? "" : "s") +
      " (" + money(p.packsCost) + "/mo) &middot; committed pre-purchase \u2248 " + money(p.committedMonthlyCost) + "/mo (" + money(p.committedAnnualCost) + "/yr).");
    if (res.budget && res.budget.pct != null) {
      setHtml("cw-d-budget-out", "<strong>Budget:</strong> uses " + Math.round(res.budget.pct) + "% of your " +
        money(res.budget.cap) + " cap" + (res.budget.over ? ' \u2014 <span style="color:#b3261e">over budget</span>.' : "."));
    } else setHtml("cw-d-budget-out", "");
    var note = "Annual Cowork \u2248 " + money(t.annualCoworkSpend) + ".";
    if (t.licenseFloor > 0) note += " With the license floor, total \u2248 " + money(t.totalSpend) + "/mo.";
    setText("cw-d-total-note", note);
    renderForecast(t.monthlyCredits, g, t.licensedUsers);
  }

  function renderForecast(totalCredits, g, licensed) {
    var C = window.CoworkEstimator, wrap = el("cw-forecast"); if (!C || !wrap) return;
    var fc = C.forecast({ monthlyCredits: totalCredits, licensedUsers: licensed, global: g });
    var max = fc.rows.reduce(function (m, r) { return Math.max(m, r.coworkSpend); }, 0) || 1;
    var body = fc.rows.map(function (r) {
      var w = Math.round(r.coworkSpend / max * 100);
      return "<tr><td>" + r.label + "</td><td>" + fmt(r.credits) + "</td><td>" + money(r.coworkSpend) + "</td><td>" +
        money(r.totalWithLicenses) + '</td><td class="cw-bar-cell"><span class="cw-bar" style="width:' + w + '%"></span></td></tr>';
    }).join("");
    wrap.innerHTML = '<table class="cw-fc"><thead><tr><th>Month</th><th>Credits</th><th>Cowork spend</th><th>Total w/ licenses</th><th>Trend</th></tr></thead><tbody>' +
      body + "</tbody><tfoot><tr><td>6-mo total</td><td></td><td>" + money(fc.totalCoworkSpend) + "</td><td>" + money(fc.totalWithLicenses) + "</td><td></td></tr></tfoot></table>" +
      '<p class="cw-note">Peak month \u2248 ' + money(fc.peakMonthlySpend) + ". M1 = today\u2019s modeled spend; each month grows by the growth rate.</p>";
  }

  // ── Feed-forward: Quick <-> Detailed (mirrors Studio seedDetailed pattern) ──
  function readQuickInput() {
    return {
      licensedUsers: val("cw-licensed"), mauPct: val("cw-mau"), creditsPerActiveUser: val("cw-cpu"),
      global: {
        pricePerCredit: val("cw-price"), azureDiscountPct: val("cw-discount"),
        licenseFloorEnabled: chk("cw-floor"), licensePricePerUser: val("cw-floor-price"), budgetCap: val("cw-budget")
      }
    };
  }
  function showOrigin(txt, kind) {
    var b = el("cw-origin"); if (b) b.classList.remove("em-hidden");
    setText("cw-origin-txt", txt);
    var acts = kind === "import"
      ? '<button type="button" class="em-btn secondary" onclick="cwReturnToOrigin()">Return to Import</button>'
      : '<button type="button" class="em-btn secondary" onclick="cwSaveToQuick()">Save back to Quick</button>' +
        '<button type="button" class="em-btn secondary" onclick="cwReturnToOrigin()">Return</button>';
    setHtml("cw-origin-actions", acts);
  }
  function hideOrigin() { var b = el("cw-origin"); if (b) b.classList.add("em-hidden"); cwState.origin = null; }
  function cwReturnToOrigin() {
    var k = (cwState.origin && cwState.origin.kind) || "quick";
    hideOrigin(); setCoworkMode(k === "import" ? "import" : "quick");
  }

  function cwOpenInDetailed() {
    var C = window.CoworkEstimator; if (!C) return;
    var qi = readQuickInput();
    var seed = C.seedDetailedFromQuick(qi);
    cwState.cohorts = seed.cohorts.map(function (c) {
      return { name: c.name, licensedUsers: c.licensedUsers, mauPct: c.mauPct, creditsPerActiveUser: c.creditsPerActiveUser };
    });
    cwState.origin = { kind: "quick" };
    setVal("cw-d-price", qi.global.pricePerCredit);
    setVal("cw-d-discount", qi.global.azureDiscountPct);
    setChk("cw-d-floor", qi.global.licenseFloorEnabled);
    setVal("cw-d-floor-price", qi.global.licensePricePerUser);
    setVal("cw-d-budget", qi.global.budgetCap);
    showOrigin("Editing your Quick estimate as a single cohort. Split it into more cohorts below, or save your changes back to Quick.", "quick");
    renderCohorts();
    setCoworkMode("detailed");
  }
  function cwReturnToQuick() { hideOrigin(); setCoworkMode("quick"); }
  function cwSaveToQuick() {
    var C = window.CoworkEstimator;
    if (!C || !cwState.origin || cwState.origin.kind !== "quick" || !(cwState.cohorts || []).length) { hideOrigin(); setCoworkMode("quick"); return; }
    var t = C.detailedEstimate({ cohorts: cwState.cohorts, global: readDetailedGlobal() }).totals;
    setVal("cw-licensed", Math.round(t.licensedUsers));
    setVal("cw-mau", Math.round(t.mauPct));
    setVal("cw-cpu", Math.round(t.creditsPerActiveUser));
    setVal("cw-price", val("cw-d-price")); setVal("cw-discount", val("cw-d-discount"));
    setChk("cw-floor", chk("cw-d-floor")); setVal("cw-floor-price", val("cw-d-floor-price")); setVal("cw-budget", val("cw-d-budget"));
    hideOrigin(); setCoworkMode("quick"); cwQuickCalc();
  }

  // ── Optional intensity helper ───────────────────────────────────────────────
  function cwToggleIntensity() {
    var h = el("cw-intensity-helper"); if (!h) return;
    h.classList.toggle("em-hidden");
    if (!h.classList.contains("em-hidden")) cwIntensityCalc();
  }
  function cwIntensityCalc() {
    var C = window.CoworkEstimator; if (!C) return;
    setText("cw-ih-out", fmt(C.intensityToCredits({ light: val("cw-ih-light"), medium: val("cw-ih-medium"), heavy: val("cw-ih-heavy") })));
  }

  // ── Export ──────────────────────────────────────────────────────────────────
  function cwDownloadCohortsCsv() {
    var C = window.CoworkEstimator; if (!C) return;
    var res = C.detailedEstimate({ cohorts: cwState.cohorts || [], global: readDetailedGlobal() });
    var lines = [["Cohort", "Licensed users", "Active usage %", "Active users", "Credits per active user", "Monthly credits", "Monthly Cowork spend $"].join(",")];
    res.cohorts.forEach(function (r) {
      lines.push([csv(r.name), r.licensedUsers, Math.round(r.mauPct), r.activeUsers, Math.round(r.creditsPerActiveUser), Math.round(r.monthlyCredits), Math.round(r.coworkSpend)].join(","));
    });
    var t = res.totals;
    lines.push(["Total", Math.round(t.licensedUsers), Math.round(t.mauPct), t.activeUsers, Math.round(t.creditsPerActiveUser), Math.round(t.monthlyCredits), Math.round(t.coworkSpend)].join(","));
    var blob = new Blob([lines.join("\n")], { type: "text/csv" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "cowork-estimate.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }

  // ── M365 Import ─────────────────────────────────────────────────────────────
  function sourceLabel(src) {
    return src === "credits-report" ? "Credits report" : src === "chat-usage" ? "Copilot Chat usage report" : "pasted totals";
  }
  function importStatus(m) { setText("cw-drop-status", m); }
  function enableSend(on) { var b = el("cw-import-send"); if (b) b.disabled = !on; }

  function detectAndParseCsv(text) {
    var C = window.CoworkEstimator;
    var head = (text.split(/\r?\n/)[0] || "").toLowerCase();
    if (/prompt/.test(head) && !/past\s*30|credits/.test(head)) return C.parseChatUsageCsv(text);
    if (/past\s*30|credits/.test(head)) return C.parseCreditsReportCsv(text);
    var cr = C.parseCreditsReportCsv(text);
    return cr.ok ? cr : C.parseChatUsageCsv(text);
  }

  function cwHandleFile(file) {
    if (!file) return;
    if (/\.csv$/i.test(file.name) || file.type === "text/csv") {
      importStatus("Reading " + file.name + " …");
      file.text().then(function (text) {
        var res = detectAndParseCsv(text);
        if (!res.ok) { importStatus(res.error || "Couldn't parse that CSV."); enableSend(false); return; }
        cwLastImport = res;
        importStatus("Loaded " + file.name + " — detected the " + sourceLabel(res.source) + ".");
        renderImportSummary(); enableSend(true);
      }).catch(function () { importStatus("Couldn't read the file."); });
    } else if (/^image\//.test(file.type)) {
      var reader = new FileReader();
      reader.onload = function (e) {
        cwShotDataUrl = e.target.result;
        setHtml("cw-shot-preview", '<img src="' + cwShotDataUrl + '" alt="Uploaded dashboard screenshot" style="max-width:100%;border:1px solid var(--md-default-fg-color--lightest);border-radius:8px;margin:.5rem 0">');
        var pv = el("cw-shot-preview"); if (pv) pv.classList.remove("em-hidden");
        var ob = el("cw-ocr-btn"); if (ob) ob.classList.remove("em-hidden");
        var pw = el("cw-paste-wrap"); if (pw) pw.open = true;
        importStatus("Screenshot loaded — read the four numbers into the fields below, or try auto-read.");
      };
      reader.readAsDataURL(file);
    } else importStatus("Unsupported file — use a .csv export or an image.");
  }

  function cwUsePaste() {
    var C = window.CoworkEstimator;
    cwLastImport = C.parseAggregate({
      activeUsers: val("cw-pa-active"), avgDailyActiveUsers: val("cw-pa-daily"),
      totalPrompts: val("cw-pa-total"), avgPromptsPerUser: val("cw-pa-avg")
    });
    importStatus("Using the four pasted numbers.");
    renderImportSummary(); enableSend(true);
  }

  function renderImportSummary() {
    var r = cwLastImport, wrap = el("cw-import-summary"); if (!wrap || !r) return;
    var licensed = parseFloat(val("cw-imp-licensed")) || 0;
    var active = r.activeUsers || 0;
    var mauLine = licensed > 0 ? " At " + fmt(licensed) + " licensed \u2192 active usage \u2248 <strong>" + Math.round(active / licensed * 100) + "%</strong>." : "";
    var h = "";
    if (r.source === "credits-report") {
      var d = r.distribution;
      h = "<p><strong>Credits report</strong> \u2014 " + fmt(active) + " metered users." + mauLine + "</p><ul>" +
        "<li>Avg credits / active user / mo: <strong>" + fmt(Math.round(r.avgCreditsPerActiveUser)) + "</strong> (median " + fmt(Math.round(r.medianCreditsPerActiveUser)) + ")</li>" +
        "<li>Distribution: p90 " + fmt(Math.round(d.p90)) + " \u00b7 max " + fmt(Math.round(d.max)) + "</li>" +
        "<li>Power-user outliers (&gt;3\u00d7 median): <strong>" + d.outliers.length + "</strong>" + (d.outliers.length ? " \u2014 they skew the average; consider a separate cohort." : "") + "</li></ul>";
    } else if (r.source === "chat-usage" || r.source === "aggregate") {
      h = "<p><strong>" + (r.source === "chat-usage" ? "Copilot Chat usage report" : "Pasted totals") + "</strong> \u2014 " + fmt(active) +
        " active users, avg " + fmt(Math.round(r.avgPromptsPerActiveUser)) + " prompts/user." + mauLine +
        " No measured credits here \u2014 we'll seed the planning-default credits/user, which you can adjust in Detailed.</p>";
    }
    wrap.innerHTML = h;
  }

  function cwImportToDetailed() {
    var C = window.CoworkEstimator; if (!C || !cwLastImport) return;
    var licensed = parseFloat(val("cw-imp-licensed")) || 0;
    var seed = C.importToSeed(cwLastImport, { licensedUsers: licensed, name: "Imported \u2014 " + sourceLabel(cwLastImport.source) });
    var cohort = {
      name: seed.name,
      licensedUsers: licensed || (seed.measuredActiveUsers || 0),
      mauPct: seed.mauPct != null ? Math.round(seed.mauPct) : 15,
      creditsPerActiveUser: seed.creditsPerActiveUser != null ? seed.creditsPerActiveUser : 5000
    };
    cwState.cohorts = [cohort];
    cwState.origin = { kind: "import", source: cwLastImport.source };
    var measured = cwLastImport.source === "credits-report"
      ? "Using your measured " + fmt(cohort.creditsPerActiveUser) + " credits/user. "
      : "No measured credits in this report \u2014 seeded the planning default; adjust as needed. ";
    var mau = licensed > 0 ? "Active usage \u2248 " + cohort.mauPct + "%. " : "Enter licensed users for a % \u2014 using the measured active count as the population. ";
    renderCohorts();
    showOrigin("Imported from your M365 " + sourceLabel(cwLastImport.source) + ". " + measured + mau + "Split or tune the cohort below.", "import");
    setCoworkMode("detailed");
  }

  // Optional best-effort OCR (loads Tesseract.js on demand; image stays in the browser).
  function loadScript(src) {
    return new Promise(function (res, rej) {
      if (document.querySelector('script[data-cw-lib="' + src + '"]')) return res();
      var s = document.createElement("script");
      s.src = src; s.async = true; s.setAttribute("data-cw-lib", src);
      s.onload = function () { res(); }; s.onerror = function () { rej(); };
      document.head.appendChild(s);
    });
  }
  function ocrNum(s) { var m = String(s).replace(/,/g, "").match(/\d+(\.\d+)?/); return m ? m[0] : ""; }
  function fillFromOcr(text) {
    var lines = text.split(/\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    function near(re) {
      for (var i = 0; i < lines.length; i++) {
        if (re.test(lines[i])) {
          var n = ocrNum(lines[i]); if (n) return n;
          if (i > 0 && ocrNum(lines[i - 1])) return ocrNum(lines[i - 1]);
          if (i + 1 < lines.length && ocrNum(lines[i + 1])) return ocrNum(lines[i + 1]);
        }
      }
      return "";
    }
    var a = near(/active users/i), d = near(/daily active/i), t = near(/total prompts/i), p = near(/per user/i);
    if (a) setVal("cw-pa-active", a);
    if (d) setVal("cw-pa-daily", d);
    if (t) setVal("cw-pa-total", t);
    if (p) setVal("cw-pa-avg", p);
    return (a || d || t || p);
  }
  function cwTryOcr() {
    if (!cwShotDataUrl) { importStatus("Drop a screenshot first."); return; }
    importStatus("Loading OCR library …");
    loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js").then(function () {
      if (!window.Tesseract) { importStatus("OCR unavailable — type the four numbers below."); return; }
      importStatus("Reading the screenshot… this can take ~10–20s.");
      window.Tesseract.recognize(cwShotDataUrl, "eng").then(function (res) {
        var got = fillFromOcr((res && res.data && res.data.text) || "");
        var pw = el("cw-paste-wrap"); if (pw) pw.open = true;
        importStatus(got ? "Auto-read done — check the four numbers below, then 'Use these numbers'." : "Couldn't read numbers — please type them below.");
      }).catch(function () { importStatus("Couldn't auto-read — please type the numbers below."); });
    }).catch(function () { importStatus("Couldn't load the OCR library (offline?) — please type the numbers below."); });
  }

  function init() {
    if (!el("estimator-cowork")) return;
    window.setEstimatorProduct = setEstimatorProduct;
    window.setCoworkMode = setCoworkMode;
    window.cwQuickCalc = cwQuickCalc;
    window.cwSetMau = cwSetMau;
    window.cwOpenInDetailed = cwOpenInDetailed;
    window.cwReturnToQuick = cwReturnToQuick;
    window.cwSaveToQuick = cwSaveToQuick;
    window.cwAddCohort = cwAddCohort;
    window.cwRemoveCohort = cwRemoveCohort;
    window.cwCohortSet = cwCohortSet;
    window.recomputeDetailed = recomputeDetailed;
    window.cwToggleIntensity = cwToggleIntensity;
    window.cwIntensityCalc = cwIntensityCalc;
    window.cwDownloadCohortsCsv = cwDownloadCohortsCsv;
    window.cwReturnToOrigin = cwReturnToOrigin;
    window.cwHandleFile = cwHandleFile;
    window.cwUsePaste = cwUsePaste;
    window.renderImportSummary = renderImportSummary;
    window.cwImportToDetailed = cwImportToDetailed;
    window.cwTryOcr = cwTryOcr;
    var drop = el("cw-drop");
    if (drop && !drop.dataset.bound) {
      drop.dataset.bound = "1";
      ["dragover", "dragenter"].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("cw-drop--over"); });
      });
      ["dragleave", "dragend", "drop"].forEach(function (ev) {
        drop.addEventListener(ev, function () { drop.classList.remove("cw-drop--over"); });
      });
      drop.addEventListener("drop", function (e) {
        e.preventDefault();
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        cwHandleFile(f);
      });
    }
    renderChips();
    cwQuickCalc();
  }

  if (window.document$ && typeof window.document$.subscribe === "function") window.document$.subscribe(init);
  else if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();

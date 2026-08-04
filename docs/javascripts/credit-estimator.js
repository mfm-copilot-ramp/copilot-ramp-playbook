/* Copilot Credit Estimator — mode UI wiring.
 * Runs only on the credit-estimator page (guarded by #mode-select). Drives the
 * mode dropdown, the Quick (natural-language) and Solution-package (upload)
 * panels, and the "open in Detailed" feed-forward. Pure analysis/credit logic
 * lives in estimator-core.js (window.EstimatorCore) and estimator-zip.js
 * (window.EstimatorZip); this file is DOM glue + rendering only.
 */
(function () {
  "use strict";

  var EC = null, EZ = null, EX = null, EP = null, EB = null;
  var state = { qe: null, sp: null, qi: null, origin: null, bulk: null };

  // ── formatting ────────────────────────────────────────────────────────────
  function fmt(n) {
    n = Math.round(n);
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return n.toLocaleString();
  }
  function fmtDec(n) { return n % 1 === 0 ? n.toLocaleString() : (Math.round(n * 100) / 100).toLocaleString(); }
  function money(n) {
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    if (n >= 100) return "$" + Math.round(n).toLocaleString();
    return "$" + (Math.round(n * 100) / 100).toLocaleString();
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function clone(o) { var c = {}; for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) c[k] = o[k]; return c; }
  function setText(id, t) { var e = document.getElementById(id); if (e) e.textContent = t; }
  function setHtml(id, h) { var e = document.getElementById(id); if (e) e.innerHTML = h; }
  function setVal(id, v) { var e = document.getElementById(id); if (e) e.value = v; }
  function getVal(id) { var e = document.getElementById(id); return e ? e.value : 0; }
  function chk(id) { var e = document.getElementById(id); return e ? e.checked : false; }

  var MODE_DESC = {
    quick: "Best when you're early or unsure — describe the agent in plain words and get a rough size, a Studio build outline, and a credit/cost range. No build knowledge needed.",
    import: "Best for sizing many agents at once — download the Excel template, fill in one row per scenario, and import it back for a portfolio-wide size + credit/cost roll-up. Runs entirely in your browser.",
    detailed: "Best when you know the building blocks but haven't built yet — set your org scope and dial in exactly which features each conversation uses.",
    complex: "Best when the agent is built — export it as a Power Platform solution (.zip) and upload it for a component-level analysis. Everything is parsed locally in your browser.",
    bulk: "Best for standing up many agents at once — paste one description per line and get a ready-to-import Copilot Studio starter (.zip) for each, bundled with a portfolio roll-up. Runs entirely in your browser."
  };

  var QE_EXAMPLES = {
    email: "Every time a new email arrives in our shared support inbox, the agent should read it, categorize it by topic and urgency, and route it to the correct SME team. It handles about 100 emails a month.",
    it: "An IT helpdesk agent in Teams that answers common support questions from our knowledge base and can reset passwords and create tickets in ServiceNow. Escalates to a live agent when it can't help. Used weekly by staff.",
    sales: "A sales enablement agent that drafts proposals and summarizes product docs for our sellers, grounded on our SharePoint sales library. Used daily by the sales team.",
    support: "A customer-facing voice agent on our website and phone line that answers product questions and creates support tickets in Salesforce, used constantly by thousands of customers.",
    finance: "Whenever an invoice is submitted, the agent extracts the fields from the scanned document, validates them, and runs a Power Automate approval workflow. About 800 invoices per month for the finance department."
  };

  // ── "flight" gate for in-progress modes (Bulk generate) ───────────────────
  // Bulk generate is headed for its own dedicated page, so it's hidden from the
  // estimator by default. The tiny secret dot in the switcher is the on/off
  // control, and its state persists per-browser in localStorage. A ?flight=bulk
  // (or ?labs=bulk / ?flight=all) URL param is a convenience *seed*: it flips the
  // stored flag ON once at page load so a shared demo link opens revealed, while
  // ?flight=off / ?flight=none / ?flight=hide seeds it OFF (a clean reset link).
  // After load the dot is authoritative — the URL never live-overrides it, so
  // clicking the dot always toggles both ways. No estimator math changes.
  var FLIGHT_BULK_KEY = "ce-flight-bulk";
  function flightParamState() {
    // → "on" | "off" | null  (null = no recognised flight param in the URL)
    try {
      var q = (location.search || "").toLowerCase();
      if (/[?&](?:flight|labs)=(?:[a-z-]*,)*(?:bulk|all)\b/.test(q)) return "on";
      if (/[?&](?:flight|labs)=(?:off|none|hide|0)\b/.test(q)) return "off";
    } catch (e) {}
    return null;
  }
  function seedFlightFromUrl() {
    // One-time: let a ?flight= link set the persisted flag, then hand control to
    // the dot. Called once from init(), never on every apply/toggle — so the URL
    // seeds the initial state but the dot can still turn it off afterwards.
    var s = flightParamState();
    if (!s) return;
    try { window.localStorage.setItem(FLIGHT_BULK_KEY, s === "on" ? "1" : "0"); } catch (e) {}
  }
  function bulkFlighted() {
    try { return window.localStorage.getItem(FLIGHT_BULK_KEY) === "1"; } catch (e) { return false; }
  }
  function applyBulkFlight() {
    var on = bulkFlighted();
    var root = document.getElementById("estimator-studio") || document.body;
    if (root) root.classList.toggle("estimator-flighted", on);
    var dot = document.getElementById("flight-toggle");
    if (dot) {
      dot.setAttribute("aria-pressed", on ? "true" : "false");
      dot.title = on ? "Preview features on \u2014 Bulk generate is visible" : "";
    }
    // If it got locked while the user was sitting in bulk, fall back to Quick.
    if (!on) {
      var panel = document.getElementById("panel-bulk");
      if (panel && !panel.classList.contains("em-hidden")) setEstimatorMode("quick");
    }
    return on;
  }
  function flightToast(msg) {
    var t = document.getElementById("flight-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "flight-toast";
      t.className = "flight-toast";
      t.setAttribute("role", "status");
      t.setAttribute("aria-live", "polite");
      document.body.appendChild(t);
    }
    t.textContent = msg;
    void t.offsetWidth; // reflow so the transition replays
    t.classList.add("show");
    clearTimeout(t._hideT);
    t._hideT = setTimeout(function () { t.classList.remove("show"); }, 2400);
  }
  function toggleBulkFlight() {
    var stored = false;
    try { stored = window.localStorage.getItem(FLIGHT_BULK_KEY) === "1"; } catch (e) { stored = false; }
    var turnOn = !stored;
    try { window.localStorage.setItem(FLIGHT_BULK_KEY, turnOn ? "1" : "0"); } catch (e) {}
    var nowOn = applyBulkFlight();
    if (nowOn && turnOn) setEstimatorMode("bulk");
    flightToast(nowOn ? "Bulk generate flighted \u2014 visible on this browser" : "Bulk generate hidden");
  }

  // ── mode switching ────────────────────────────────────────────────────────
  function setEstimatorMode(mode) {
    // Bulk is gated behind the flight flag — a stale #hash, select value, or
    // hydration can't force it open while it's locked.
    if (mode === "bulk" && !bulkFlighted()) mode = "quick";
    var ids = { quick: "panel-quick", import: "panel-import", detailed: "panel-detailed", complex: "panel-complex", bulk: "panel-bulk" };
    Object.keys(ids).forEach(function (k) {
      var el = document.getElementById(ids[k]);
      if (el) el.classList.toggle("em-hidden", k !== mode);
    });
    var sel = document.getElementById("mode-select");
    if (sel && sel.value !== mode) sel.value = mode;
    var cards = document.querySelectorAll(".mode-card[data-mode]");
    for (var i = 0; i < cards.length; i++) {
      var on = cards[i].getAttribute("data-mode") === mode;
      cards[i].classList.toggle("mode-card--active", on);
      cards[i].setAttribute("aria-checked", on ? "true" : "false");
    }
    setText("mode-desc", MODE_DESC[mode] || "");
  }

  // ── privacy-respecting mode-usage analytics (GoatCounter custom events) ─────
  // Cookieless + no PII: sends only the page path and a static per-mode label
  // when the user actively picks a mode. Bound to the mode cards in init(), so it
  // never fires on programmatic hydration or the "open in Detailed" feed-forward.
  var GC_MODE_LABEL = { quick: "Quick", import: "Quick + Import", detailed: "Detailed", complex: "Solution package", bulk: "Bulk generate" };
  function trackEstimatorMode(mode) {
    if (!window.goatcounter || !GC_MODE_LABEL[mode]) return;
    window.goatcounter.count({
      path: location.pathname + "#estimator-mode-" + mode,
      title: "Estimator mode: " + GC_MODE_LABEL[mode],
      event: true
    });
  }

  // ── shared render helpers ─────────────────────────────────────────────────
  function tshirtHtml(t, drivers) {
    var i = EC.SIZE_INFO[t];
    var why = (drivers && drivers.length)
      ? '<div class="em-why"><strong>Why ' + t + ':</strong> ' + drivers.map(esc).join(" · ") + '</div>'
      : "";
    return '<div class="em-tshirt em-tshirt-' + t + '"><div class="sz">' + t + '</div>' +
      '<div class="meta"><b>' + esc(i.name) + ' build</b>' +
      '<div>' + esc(i.desc) + '</div>' + why +
      '<div><strong>Effort:</strong> ' + esc(i.effort) + '</div>' +
      '<div><strong>Governance:</strong> ' + esc(i.govern) + '</div></div></div>';
  }

  function assumptionsHtml(p, scale, why) {
    why = why || {};
    return '' +
      '<div class="section-label" style="margin-top:1.25rem">Assumptions <span style="text-transform:none;font-weight:400">— tune these to fit your rollout</span></div>' +
      '<div class="calc-grid">' +
        '<div class="calc-field"><label>Users in scope</label>' +
          '<input type="number" min="1" id="' + p + '-users" value="' + scale.users + '" oninput="' + p + 'Recompute()">' +
          '<div class="hint">' + esc(why.users || "") + '</div></div>' +
        '<div class="calc-field"><label>Interactions / user / month</label>' +
          '<input type="number" min="0" step="0.5" id="' + p + '-interactions" value="' + scale.interactions + '" oninput="' + p + 'Recompute()">' +
          '<div class="hint">' + esc(why.interactions || "") + '</div></div>' +
        '<div class="calc-field"><label>Deployment</label>' +
          '<div class="deploy-toggle">' +
            '<button type="button" class="deploy-btn' + (scale.deployment === "embedded" ? " active" : "") + '" id="' + p + '-dep-embedded" onclick="emSetDeploy(\'' + p + '\',\'embedded\')">Embedded (Teams / M365)</button>' +
            '<button type="button" class="deploy-btn' + (scale.deployment === "standalone" ? " active" : "") + '" id="' + p + '-dep-standalone" onclick="emSetDeploy(\'' + p + '\',\'standalone\')">Standalone</button>' +
          '</div><div class="hint">' + esc(why.deployment || "") + '</div></div>' +
        '<div class="calc-field" id="' + p + '-lic-field" style="' + (scale.deployment === "standalone" ? "opacity:0.45" : "") + '"><label>% with M365 Copilot license</label>' +
          '<div class="range-row">' +
            '<input type="range" min="0" max="100" id="' + p + '-lic-slider" value="' + scale.licensePct + '" oninput="document.getElementById(\'' + p + '-lic\').value=this.value;' + p + 'Recompute()">' +
            '<input type="number" min="0" max="100" id="' + p + '-lic" value="' + scale.licensePct + '" oninput="document.getElementById(\'' + p + '-lic-slider\').value=this.value;' + p + 'Recompute()"><span>%</span>' +
          '</div><div class="hint">Embedded: licensed users accrue 0 credits.</div></div>' +
      '</div>';
  }

  function profileTableHtml(p, profile, opts) {
    opts = opts || {};
    var withPaths = !!opts.withPaths, paths = opts.paths || [];
    var pathHead = withPaths ? '<th class="num">Fires on</th>' : "";
    var rows = profile.map(function (r, i) {
      var isEsc = withPaths && paths[i] === "esc";
      var pathCell = "";
      if (withPaths) {
        pathCell = '<td class="num"><span class="em-fireson" role="group" aria-label="When this tool fires">' +
          '<button type="button" class="em-fireson-opt' + (isEsc ? "" : " active") + '" aria-pressed="' + (!isEsc) + '" onclick="' + p + 'SetToolPath(' + i + ',&quot;avg&quot;)">Average</button>' +
          '<button type="button" class="em-fireson-opt' + (isEsc ? " active" : "") + '" aria-pressed="' + isEsc + '" onclick="' + p + 'SetToolPath(' + i + ',&quot;esc&quot;)">Escalation-only</button>' +
          '</span></td>';
      }
      return '<tr class="em-prow' + (isEsc ? " em-prow--esc" : "") + '" data-idx="' + i + '"><td>' + esc(r.name) + (r.note ? ' <span class="hint" style="display:block">' + esc(r.note) + '</span>' : "") + '</td>' +
        '<td class="num"><input type="number" min="0" step="0.1" class="' + p + '-use" data-idx="' + i + '" value="' + r.uses + '" oninput="' + p + 'Recompute()"></td>' +
        '<td class="num">' + fmtDec(r.credits) + '</td>' +
        '<td class="num pcredit" id="' + p + '-sub-' + i + '">—</td>' + pathCell + '</tr>';
    }).join("");
    var footLabel = withPaths ? "Effective credits / average interaction" : "Effective credits / interaction";
    return '<div class="section-label" style="margin-top:1.25rem">Per-interaction credit profile <span style="text-transform:none;font-weight:400">— tune uses / interaction' + (withPaths ? ' &amp; mark escalation-only tools' : '') + '</span></div>' +
      '<table class="em-profile"><thead><tr><th>Feature</th><th class="num">Uses / interaction</th><th class="num">Credits / use</th><th class="num">Credits</th>' + pathHead + '</tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
      '<tfoot><tr><td>' + footLabel + '</td>' + (withPaths ? '<td></td><td></td><td class="num pcredit" id="' + p + '-per">—</td><td></td>' : '<td></td><td></td><td class="num pcredit" id="' + p + '-per">—</td>') + '</tr></tfoot></table>';
  }

  function estimateHtml(p, auto) {
    var c1 = auto ? "Runs / month" : "Billed users";
    var c3 = auto ? "Credits / run" : "Credits / user / month";
    return '<div class="section-label" style="margin-top:1.25rem">Estimated monthly consumption</div>' +
      '<div class="results-grid">' +
        '<div class="result-card"><div class="val" id="' + p + '-billed">—</div><div class="lbl">' + c1 + '</div></div>' +
        '<div class="result-card"><div class="val" id="' + p + '-credits">—</div><div class="lbl">Credits / month</div></div>' +
        '<div class="result-card"><div class="val" id="' + p + '-peruser">—</div><div class="lbl">' + c3 + '</div></div>' +
      '</div>' +
      '<div class="em-range" id="' + p + '-range"></div>' +
      '<div id="' + p + '-esc-readout" class="em-esc-wrap"></div>' +
      '<div class="section-label" style="margin-top:1.25rem">Estimated cost</div>' +
      '<div class="em-cost">' +
        '<div class="card"><div class="v" id="' + p + '-cost-payg">—</div><div class="sub">/ month · pay-as-you-go ($0.01 / credit)</div></div>' +
        '<div class="card"><div class="v" id="' + p + '-cost-pre">—</div><div class="sub">/ month · prepaid pack ($0.008 / credit)</div></div>' +
      '</div>' +
      '<div class="em-range">Credit range is a directional band, roughly 0.6× to 1.6× the midpoint (not a hard min/max). Cost is Copilot Credits only — it excludes M365 Copilot license fees' + (auto ? ' and any Power Platform / premium-connector licensing' : '') + '.</div>' +
      '<div style="margin-top:1.25rem"><button class="em-btn secondary" type="button" onclick="' + p + 'ToDetailed()">Open this in the Detailed estimator →</button></div>';
  }

  // Single "runs / month" driver for autonomous / flow packages.
  function assumptionsAutonomousHtml(p, scale, why) {
    why = why || {};
    return '' +
      '<div class="section-label" style="margin-top:1.25rem">Assumptions <span style="text-transform:none;font-weight:400">— tune to your workload</span></div>' +
      '<div class="calc-grid">' +
        '<div class="calc-field"><label>Runs / month</label>' +
          '<input type="number" min="0" id="' + p + '-runs" value="' + scale.runs + '" oninput="' + p + 'Recompute()">' +
          '<div class="hint">' + esc(why.runs || "How many times this flow / autonomous agent fires per month. This is the master cost multiplier — no per-user licensing discount applies.") + '</div></div>' +
      '</div>';
  }

  function readScale(p) {
    var st = state[p];
    if (st && st.regime === "autonomous") {
      var runs = Math.max(0, parseFloat(getVal(p + "-runs")) || 0);
      return { regime: "autonomous", archetype: "autonomous", runs: runs, events: runs };
    }
    var std = document.getElementById(p + "-dep-standalone");
    var dep = std && std.classList.contains("active") ? "standalone" : "embedded";
    return {
      regime: "interactive",
      users: Math.max(0, parseFloat(getVal(p + "-users")) || 0),
      interactions: Math.max(0, parseFloat(getVal(p + "-interactions")) || 0),
      deployment: dep,
      licensePct: Math.min(100, Math.max(0, parseFloat(getVal(p + "-lic")) || 0))
    };
  }

  function recompute(p) {
    var st = state[p];
    if (!st) return;
    document.querySelectorAll("." + p + "-use").forEach(function (inp) {
      var i = +inp.dataset.idx;
      if (st.profile[i]) st.profile[i].uses = Math.max(0, parseFloat(inp.value) || 0);
    });
    var scale = readScale(p);
    st.scale = scale;

    var per = 0, escExtra = 0;
    st.profile.forEach(function (r, i) {
      var sub = r.uses * r.credits;
      per += sub;
      setText(p + "-sub-" + i, fmtDec(sub));
      // Phase D: rows the user tagged "escalation-only" are priced into the buffer,
      // not the average interaction. No tags → escExtra 0 → avgPer === per (base estimate).
      if (st.toolPaths && st.toolPaths[i] === "esc") escExtra += sub;
    });
    var avgPer = per - escExtra;
    setText(p + "-per", fmtDec(avgPer));

    if (scale.regime === "autonomous") {
      var monthly = scale.runs * per;
      var rngA = EC.creditRange(monthly);
      var costA = EC.costUSD(monthly);
      setText(p + "-billed", fmt(scale.runs));
      setText(p + "-credits", fmt(monthly));
      setText(p + "-peruser", fmtDec(per));
      setText(p + "-range", "Range: " + fmt(rngA.low) + " – " + fmt(rngA.high) + " credits / month");
      setText(p + "-cost-payg", money(costA.payg));
      setText(p + "-cost-pre", money(costA.prepaid));
      setHtml(p + "-esc-readout", "");
      return;
    }

    var lf = document.getElementById(p + "-lic-field");
    if (lf) lf.style.opacity = scale.deployment === "standalone" ? "0.45" : "1";
    var est = EC.computeEstimate(st.profile, scale);
    // Phase B/D: blend the escalation buffer onto the AVERAGE per-interaction cost. The
    // escalation adder is per-tool when the user has tagged tools (Phase D), else falls back
    // to one escalation action (Phase B). At 0% (default) blendMonthly === avgMonthly, so the
    // base estimate is preserved; nothing tagged escalation-only → escExtra 0 → no buffer.
    var escCredits = st.toolPaths ? escExtra : ESC_DEFAULT_CREDITS;
    var split = escSplit(avgPer, est.billed * scale.interactions, st.escalation || 0, escCredits);
    var monthly = split.blendMonthly;
    var rng = EC.creditRange(monthly);
    var cost = EC.costUSD(monthly);
    setText(p + "-billed", fmt(est.billed));
    setText(p + "-credits", fmt(monthly));
    setText(p + "-peruser", fmtDec(scale.interactions * avgPer));
    setText(p + "-range", "Range: " + fmt(rng.low) + " – " + fmt(rng.high) + " credits / month");
    setText(p + "-cost-payg", money(cost.payg));
    setText(p + "-cost-pre", money(cost.prepaid));
    setHtml(p + "-esc-readout", escReadoutHtml(split,
      { editable: true, unit: "interaction", onchange: p + "SetEscalationPct(this.value)" }));
  }

  function emSetDeploy(p, mode) {
    var a = document.getElementById(p + "-dep-embedded");
    var b = document.getElementById(p + "-dep-standalone");
    if (a) a.classList.toggle("active", mode === "embedded");
    if (b) b.classList.toggle("active", mode === "standalone");
    recompute(p);
  }

  // ── feed-forward into the Detailed estimator ──────────────────────────────
  function seedDetailed(profile, scale, escalation, escProfile) {
    setEstimatorMode("detailed");
    var auto = scale && scale.archetype === "autonomous";
    if (typeof window.setDetailedAgentType === "function") {
      window.setDetailedAgentType(auto ? "autonomous" : "interactive");
    }
    if (auto) {
      setVal("eventsPerMonth", scale.events || 0);
    } else {
      setVal("totalUsers", scale.users);
      setVal("avgInteractions", scale.interactions);
      setVal("licensePct", scale.licensePct);
      setVal("licensePctSlider", scale.licensePct);
      if (typeof window.setDeployMode === "function") window.setDeployMode(scale.deployment);
    }
    setVal("escalationRate", escalation || 0);
    setVal("escalationRateSlider", escalation || 0);

    document.querySelectorAll("#normal-tbody tr").forEach(function (tr) {
      var ins = tr.querySelectorAll(".pt-num");
      if (ins[0]) ins[0].value = 0;
    });
    profile.forEach(function (r) {
      var matched = false;
      document.querySelectorAll("#normal-tbody tr").forEach(function (tr) {
        if (matched) return;
        var nm = tr.querySelector(".pt-name");
        var ins = tr.querySelectorAll(".pt-num");
        if (nm && ins.length >= 2 && nm.textContent.indexOf(r.name) >= 0) {
          ins[0].value = r.uses;
          matched = true;
        }
      });
      if (!matched && typeof window.addRow === "function") window.addRow(r.name, r.uses, r.credits, false);
    });
    // Repaint escalation-only rows too (only when caller supplies them, e.g. re-opening
    // a scenario already tuned in Detailed) so the round-trip is faithful; left untouched
    // for the ordinary Quick/Solution feed-forward.
    if (escProfile && escProfile.length && typeof window.addRow === "function") {
      document.querySelectorAll("#escalation-tbody tr:not(.section-divider-row)").forEach(function (tr) { tr.remove(); });
      escProfile.forEach(function (r) { window.addRow(r.name, r.uses, r.credits, true); });
    }
    if (typeof window.recalc === "function") window.recalc();
    var wrap = document.getElementById("calc-wrap");
    if (wrap && wrap.scrollIntoView) wrap.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── Quick (natural language) ──────────────────────────────────────────────
  var KNOW_LABEL = { none: "None", docs: "Documents / KB", tenantGraph: "M365 tenant graph" };

  function qeExample(k) {
    var t = document.getElementById("qe-input");
    if (t) { t.value = QE_EXAMPLES[k] || ""; qeAnalyze(); }
  }

  function selField(id, label, opts, val, hint) {
    var o = opts.map(function (op) {
      return '<option value="' + op[0] + '"' + (op[0] === val ? " selected" : "") + ">" + esc(op[1]) + "</option>";
    }).join("");
    return '<div class="calc-field"><label>' + esc(label) + "</label>" +
      '<select id="' + id + '" onchange="qeRebuild()">' + o + "</select>" +
      (hint ? '<div class="hint">' + esc(hint) + "</div>" : "") + "</div>";
  }
  function numField(id, label, val, hint, step) {
    return '<div class="calc-field"><label>' + esc(label) + "</label>" +
      '<input type="number" min="0" ' + (step ? 'step="' + step + '" ' : "") + 'id="' + id + '" value="' + val + '" oninput="qeRebuild()">' +
      '<div class="hint">' + esc(hint || "") + "</div></div>";
  }
  function chkField(id, label, checked) {
    return '<label class="em-chk"><input type="checkbox" id="' + id + '"' + (checked ? " checked" : "") +
      ' onchange="qeRebuild()"> ' + esc(label) + "</label>";
  }

  function qeQuizHtml(v, why) {
    why = why || {};
    return '<div class="em-quiz"><div class="calc-grid">' +
        selField("qe-archetype", "Agent type", [["interactive", "User-driven (someone chats / calls)"], ["autonomous", "Autonomous (fires on events)"]], v.archetype, why.volume || why.users || "") +
        selField("qe-channel", "Channel", [["chat", "Chat / text"], ["voice", "Voice / phone"]], v.channel, "") +
        (v.channel === "voice" ? numField("qe-voicemin", "Avg voice minutes / conversation", v.voiceMinutes != null ? v.voiceMinutes : 5, "Voice is billed per minute; core answer/action activity during the call is included.") : "") +
        selField("qe-orch", "Orchestration", [["generative", "Generative (agent decides)"], ["classic", "Classic (fixed topics)"]], v.orchestration, "") +
        selField("qe-know", "Knowledge grounding", [["none", "None"], ["docs", "Documents / KB"], ["tenantGraph", "M365 tenant graph"]], v.knowledge, why.knowledge || "") +
        numField("qe-actions", "# system actions / run", v.actionsCount, "Connector calls: route, create, update, notify…") +
        numField("qe-systems", "# systems touched", v.systemsCount, "Distinct back-end systems.") +
      "</div>" +
      '<div id="qe-vol-interactive" class="calc-grid"' + (v.archetype === "autonomous" ? ' style="display:none"' : "") + ">" +
        numField("qe-users", "Users in scope", v.users != null ? v.users : 500, why.users || "") +
        numField("qe-interactions", "Interactions / user / month", v.interactions != null ? v.interactions : 10, why.interactions || "", "0.5") +
        selField("qe-deploy", "Deployment", [["embedded", "Embedded (Teams / M365)"], ["standalone", "Standalone / external"]], v.deployment || "embedded", why.deployment || "") +
        numField("qe-lic", "% with M365 Copilot license", v.licensePct != null ? v.licensePct : 0, "Embedded: licensed users accrue 0 credits.") +
      "</div>" +
      '<div id="qe-vol-autonomous" class="calc-grid"' + (v.archetype === "autonomous" ? "" : ' style="display:none"') + ">" +
        numField("qe-events", "Events / month", v.events != null ? v.events : 500, why.volume || ("How many " + (v.eventUnit || "event") + "s the agent processes monthly.")) +
        numField("qe-genanswers", "Generative steps / event", v.genAnswers != null ? v.genAnswers : 1, "Classify / summarize / answer operations per run.") +
      "</div>" +
      '<div class="em-toggles">' +
        chkField("qe-content", "Document processing (extract fields)", v.hasContent) +
        chkField("qe-ai", "Generative content tool (draft / summarize)", v.hasAI) +
        chkField("qe-flow", "Approval / multi-step flow", v.hasFlow) +
        chkField("qe-esc", "Escalates to a human", v.hasEscalation) +
      "</div></div>";
  }

  // Merge whatever controls are currently on screen (wizard step OR advanced
  // form) onto the live vars. Card-style picks (archetype/channel/knowledge/
  // handoff) are written directly by qePick; here we read the form inputs that
  // exist right now, falling back to the current value when a field is absent.
  function qeReadVars() {
    var v = clone((state.qe && state.qe.vars) || {});
    function el(id) { return document.getElementById(id); }
    if (el("qe-archetype")) v.archetype = el("qe-archetype").value;
    if (el("qe-channel")) v.channel = el("qe-channel").value;
    if (el("qe-orch")) v.orchestration = el("qe-orch").value;
    if (el("qe-know")) v.knowledge = el("qe-know").value;
    var cl = document.querySelectorAll(".qe-action-chk");
    if (cl.length) {
      var picks = [];
      cl.forEach(function (cb) { if (cb.checked) picks.push(cb.getAttribute("data-act")); });
      v.actionsCount = picks.length;
      if (state.qe) state.qe.detectedActions = picks;
    } else if (el("qe-actions")) {
      v.actionsCount = Math.max(0, parseInt(el("qe-actions").value, 10) || 0);
    }
    if (el("qe-systems")) v.systemsCount = Math.max(0, parseInt(el("qe-systems").value, 10) || 0);
    if (el("qe-content")) v.hasContent = el("qe-content").checked;
    if (el("qe-ai")) v.hasAI = el("qe-ai").checked;
    if (el("qe-flow")) v.hasFlow = el("qe-flow").checked;
    if (el("qe-esc")) v.hasEscalation = el("qe-esc").checked;
    if (el("qe-users")) v.users = Math.max(0, parseFloat(el("qe-users").value) || 0);
    if (el("qe-interactions")) v.interactions = Math.max(0, parseFloat(el("qe-interactions").value) || 0);
    if (el("qe-deploy")) v.deployment = el("qe-deploy").value;
    if (el("qe-lic")) v.licensePct = Math.min(100, Math.max(0, parseFloat(el("qe-lic").value) || 0));
    if (el("qe-events")) v.events = Math.max(0, Math.round(parseFloat(el("qe-events").value) || 0));
    if (el("qe-genanswers")) v.genAnswers = Math.max(0, Math.round(parseFloat(el("qe-genanswers").value) || 0));
    if (el("qe-voicemin")) v.voiceMinutes = Math.max(1, parseFloat(el("qe-voicemin").value) || 5);
    return v;
  }

  // Recompute derived fields + fill regime defaults after any change.
  function qeNormalizeVars() {
    if (!state.qe) return;
    var v = state.qe.vars;
    var auto = v.archetype === "autonomous";
    if (v.pagesPerDoc == null) v.pagesPerDoc = 1;
    if (v.flowActionsPerRun == null) v.flowActionsPerRun = 5;
    if (el0("qe-orch")) { /* advanced sets orchestration explicitly */ }
    else v.orchestration = (auto || (v.actionsCount || 0) >= 1 || v.hasFlow || v.hasAI) ? "generative" : "classic";
    v.answerType = (v.knowledge !== "none" || v.hasAI || v.orchestration === "generative") ? "generative" : "classic";
    v.escalation = v.hasEscalation ? (v.escalation || 15) : 0;
    v.escalationCredits = v.hasEscalation ? EC.CREDIT.action : 0;
    if (auto) {
      if (v.events == null) v.events = 500;
      if (v.genAnswers == null) v.genAnswers = 1;
      v.deployment = "standalone"; v.licensePct = 0;
    } else {
      if (v.users == null) v.users = 500;
      if (v.interactions == null) v.interactions = 10;
      if (v.deployment == null) v.deployment = "embedded";
      if (v.licensePct == null) v.licensePct = v.deployment === "embedded" ? 60 : 0;
      if (v.genAnswers == null) v.genAnswers = 1;
    }
  }
  function el0(id) { return document.getElementById(id); }

  function qeOutlineHeadHtml(v, outline) {
    var chips =
      '<span class="em-tag em-tag-' + (v.archetype === "autonomous" ? "auto" : "user") + '">' +
        (v.archetype === "autonomous" ? "⚡ Autonomous" : "💬 User-driven") + "</span>" +
      '<span class="em-tag">' + (v.channel === "voice" ? "Voice" : "Chat") + "</span>" +
      '<span class="em-tag">' + (v.orchestration === "generative" ? "Generative orchestration" : "Classic orchestration") + "</span>" +
      '<span class="em-tag">Knowledge: ' + esc(KNOW_LABEL[v.knowledge] || "None") + "</span>";
    var trig = outline && outline.trigger ? outline.trigger : { label: "", note: "" };
    return '<div class="em-flowline">' + chips + "</div>" +
      '<p class="hint">' + esc(trig.label + (trig.note ? " — " + trig.note : "")) + "</p>";
  }

  var SIZE_COLOR = { XS: "#43a047", S: "#7cb342", M: "#fb8c00", L: "#f4511e", XL: "#e53935" };

  function qeCard(v, l) { return '<div class="result-card"><div class="val">' + v + '</div><div class="lbl">' + l + "</div></div>"; }

  // ── wizard: adaptive step order + rendering ───────────────────────────────
  function qeOrder() {
    return EC.QUICK_WIZARD.filter(function (s) { return s.applies(state.qe.vars); });
  }
  function qeRenderProgress() {
    var el = document.getElementById("qe-progress"); if (!el) return;
    var order = qeOrder();
    var html = order.map(function (s, i) {
      var cls = i === state.qe.step ? "st cur" : (i < state.qe.step ? "st done" : "st");
      return '<span class="' + cls + '">' + (i + 1) + ". " + esc(s.short) + "</span>";
    }).join("");
    el.innerHTML = html + '<span class="st' + (state.qe.view !== "wizard" ? " cur" : "") + '">✓ Results</span>';
  }

  function qeCards(key, opts, sel) {
    var cls = opts.length === 3 ? " three" : opts.length === 2 ? " two" : "";
    return '<div class="qe-cards' + cls + '">' + opts.map(function (o) {
      var s = String(o[0]) === String(sel) ? " sel" : "";
      return '<button type="button" class="qe-opt' + s + '" onclick="qePick(\'' + key + '\',\'' + o[0] + '\')">' +
        "<b>" + esc(o[1]) + "</b>" + (o[2] ? "<span>" + esc(o[2]) + "</span>" : "") + "</button>";
    }).join("") + "</div>";
  }
  function qeInferred(txt) {
    return txt ? '<div class="qe-inferred"><strong>Why we pre-filled this:</strong> ' + esc(txt) + "</div>" : "";
  }
  function qePresetBtn(id, val, label) {
    return '<button type="button" class="qe-preset" onclick="qeSetNum(\'' + id + "'," + val + ')">' + esc(label) + "</button>";
  }

  function qeVolumeInteractive(v, why) {
    return '<div class="calc-grid">' +
        numField("qe-users", "How many people will use it?", v.users != null ? v.users : 500, why.users || "") +
        numField("qe-interactions", "Times each person uses it / month", v.interactions != null ? v.interactions : 10, why.interactions || "", "0.5") +
      "</div>" +
      '<div class="qe-presets"><span class="hint">Reach:</span>' +
        qePresetBtn("qe-users", 25, "Team ~25") + qePresetBtn("qe-users", 500, "Dept ~500") + qePresetBtn("qe-users", 5000, "Org ~5,000") +
      "</div>" +
      '<div class="qe-presets"><span class="hint">Frequency:</span>' +
        qePresetBtn("qe-interactions", 1, "Rarely") + qePresetBtn("qe-interactions", 6, "Weekly") + qePresetBtn("qe-interactions", 20, "Daily") + qePresetBtn("qe-interactions", 40, "Constant") +
      "</div>" +
      '<div class="calc-grid" style="margin-top:0.7rem">' +
        selField("qe-deploy", "Where does it run?", [["embedded", "Embedded in Teams / M365"], ["standalone", "Standalone / external site"]], v.deployment || "embedded", why.deployment || "") +
        numField("qe-lic", "% of users with an M365 Copilot license", v.licensePct != null ? v.licensePct : 0, "Embedded + licensed users accrue 0 credits.") +
      "</div>" +
      (v.channel === "voice"
        ? '<div class="calc-grid" style="margin-top:0.7rem">' +
            numField("qe-voicemin", "Avg voice minutes / conversation", v.voiceMinutes != null ? v.voiceMinutes : 5, "Voice is billed per minute — credits = minutes × 35. Core answer/action activity during the call is included.") +
          "</div>"
        : "");
  }
  function qeVolumeAutonomous(v, why) {
    var unit = v.eventUnit || "event";
    return '<div class="calc-grid">' +
        numField("qe-events", "How many " + esc(unit) + "s per month?", v.events != null ? v.events : 500, why.volume || "") +
        numField("qe-genanswers", "Generative steps per " + esc(unit), v.genAnswers != null ? v.genAnswers : 1, "Classify / summarize / answer ≈ 2 credits each.") +
      "</div>" +
      '<div class="qe-presets"><span class="hint">Volume:</span>' +
        qePresetBtn("qe-events", 100, "~100/mo") + qePresetBtn("qe-events", 1000, "~1,000/mo") + qePresetBtn("qe-events", 10000, "~10,000/mo") + qePresetBtn("qe-events", 100000, "~100,000/mo") +
      "</div>" + qeInferred(why.volume);
  }
  function qeActions(v, why) {
    var ACT = [["update", "Look up or update a record"], ["create", "Create a ticket / case / order"],
      ["notify", "Send a notification / email"], ["route", "Route or assign to someone"],
      ["provision", "Perform an operation (reset / provision / book)"]];
    var detected = (state.qe && state.qe.detectedActions) || [];
    var rows = ACT.map(function (o) {
      var on = detected.indexOf(o[0]) >= 0;
      return '<label class="em-chk"><input type="checkbox" class="qe-action-chk" data-act="' + o[0] + '"' +
        (on ? " checked" : "") + ' onchange="qeRebuild()"> ' + esc(o[1]) + "</label>";
    }).join("");
    return '<div class="em-toggles" style="flex-direction:column;align-items:flex-start;gap:0.5rem">' + rows + "</div>" +
      '<div class="calc-grid" style="margin-top:0.7rem">' +
        numField("qe-systems", "How many separate back-end systems?", v.systemsCount != null ? v.systemsCount : 0, "e.g. ServiceNow + Salesforce = 2.") +
      "</div>" +
      '<div class="section-label" style="margin-top:0.9rem;font-size:0.72rem">Also does it…</div>' +
      '<div class="em-toggles">' +
        chkField("qe-content", "Read / extract from documents", v.hasContent) +
        chkField("qe-ai", "Draft or summarize content", v.hasAI) +
        chkField("qe-flow", "Run an approval / multi-step flow", v.hasFlow) +
      "</div>" + qeInferred(why.actions);
  }

  function qeStepBody(id, v, why) {
    if (id === "trigger") return qeCards("archetype", [
        ["interactive", "💬 A person chats or calls it", "Someone starts each conversation — billed per user."],
        ["autonomous", "⚡ It runs automatically", "Fires on events or a schedule — billed per run, no person needed."]
      ], v.archetype) + qeInferred(why.archetype);
    if (id === "channel") return qeCards("channel", [
        ["chat", "💬 Chat / text", "Teams, web chat, or an app."],
        ["voice", "📞 Voice / phone", "Telephony or spoken — billed per minute (core answer/action activity during the call is included) and more setup."]
      ], v.channel) + qeInferred(why.channel);
    if (id === "volume-interactive") return qeVolumeInteractive(v, why);
    if (id === "volume-autonomous") return qeVolumeAutonomous(v, why);
    if (id === "actions") return qeActions(v, why);
    if (id === "knowledge") return qeCards("knowledge", [
        ["none", "No — it works on its own", "No company content or data."],
        ["docs", "📄 Documents & knowledge base", "SharePoint, files, a website or FAQ. Easy to set up · 0 extra credits / run."],
        ["tenantGraph", "🏢 Microsoft 365 tenant data", "Emails, chats, org data via Graph. Needs setup · ~10 credits / run."]
      ], v.knowledge) + qeInferred(why.knowledge);
    if (id === "handoff") return qeCards("hasEscalation", [
        ["yes", "🙋 Yes — hand off to a person", "Adds an escalation path (one more action)."],
        ["no", "🤖 No — it handles everything", "No human handoff."]
      ], v.hasEscalation ? "yes" : "no");
    return "";
  }

  function qeRenderStep() {
    var area = document.getElementById("qe-step-area"); if (!area || !state.qe) return;
    var order = qeOrder();
    state.qe.step = Math.max(0, Math.min(state.qe.step, order.length - 1));
    var spec = order[state.qe.step];
    var v = state.qe.vars, why = state.qe.why || {};
    area.innerHTML =
      '<div class="qe-step-title">Step ' + (state.qe.step + 1) + " of " + order.length + " · " + esc(spec.title) + "</div>" +
      '<p class="qe-step-help">' + esc(spec.help) + "</p>" +
      '<div class="qe-step-body">' + qeStepBody(spec.id, v, why) + "</div>";
    var nav = document.getElementById("qe-nav");
    if (nav) {
      var last = state.qe.step >= order.length - 1;
      nav.innerHTML =
        (state.qe.step > 0 ? '<button type="button" class="em-btn secondary" onclick="qeBack()">← Back</button>' : "") +
        '<span class="spacer"></span>' +
        '<button type="button" class="qe-preset" onclick="qeSkip()">Skip to results</button>' +
        '<button type="button" class="em-btn" onclick="qeNext()">' + (last ? "See results →" : "Next →") + "</button>";
    }
    qeRenderProgress();
  }

  function qePick(key, val) {
    if (!state.qe) return;
    state.qe.vars[key] = (key === "hasEscalation") ? (val === "yes") : val;
    qeNormalizeVars();
    state.qe.profile = EC.deriveQuick(state.qe.vars);
    if (key === "archetype" || state.qe.view !== "wizard") { qeRender(); }
    else { qeRenderStep(); qeRenderPreview(); }
  }

  function qeRenderPreview() {
    var el = document.getElementById("qe-preview"); if (!el || !state.qe) return;
    var v = state.qe.vars, profile = state.qe.profile || EC.deriveQuick(v);
    var sizing = EC.sizeFromDrivers(v);
    var est = EC.computeQuick(profile, v);
    var rng = EC.creditRange(est.monthly);
    var cost = EC.costUSD(est.monthly);
    var col = SIZE_COLOR[sizing.size] || "#888";
    el.innerHTML =
      '<div class="lbl">Live estimate</div>' +
      '<div style="margin:0.4rem 0 0.9rem">' +
        '<span class="qe-mini-tshirt" style="background:' + col + ';color:#fff">' + sizing.size + "</span> " +
        "<b>" + esc(EC.SIZE_INFO[sizing.size].name) + " build</b>" +
        '<div class="hint" style="margin-top:0.2rem">' + esc(sizing.drivers[0] || "low integration") + "</div>" +
      "</div>" +
      '<div class="lbl">Credits / month</div><div class="big">' + fmt(est.monthly) + "</div>" +
      '<div class="hint" title="Directional band, roughly 0.6× to 1.6× the midpoint — not a hard min/max">' + fmt(rng.low) + " – " + fmt(rng.high) + " range</div>" +
      '<div class="lbl" style="margin-top:0.7rem">Cost / month</div>' +
      "<div>" + money(cost.payg) + ' <span class="hint">PAYG</span> &middot; ' + money(cost.prepaid) + ' <span class="hint">prepaid</span></div>' +
      '<div class="qe-note" style="margin-top:0.85rem">Size = build effort. Cost = credits × volume. They move independently.</div>';
  }

  // ── wizard: results (guided + advanced views) ─────────────────────────────
  function qeProfileHtml(profile, v) {
    var per = EC.perInteractionCredits(profile);
    var unit = v.archetype === "autonomous" ? "run" : "turn";
    var rows = profile.map(function (r) {
      return "<tr><td>" + esc(r.name) + (r.note ? ' <span class="hint" style="display:block">' + esc(r.note) + "</span>" : "") + "</td>" +
        '<td class="num">' + fmtDec(r.uses) + '</td><td class="num">' + fmtDec(r.credits) + '</td><td class="num">' + fmtDec(r.uses * r.credits) + "</td></tr>";
    }).join("");
    return '<details class="em-details" open><summary>Per-' + unit + " credit profile</summary>" +
      '<table class="em-profile"><thead><tr><th>Feature</th><th class="num">Uses / ' + unit + '</th><th class="num">Cr / use</th><th class="num">Credits</th></tr></thead>' +
      "<tbody>" + rows + "</tbody>" +
      '<tfoot><tr><td>Credits / ' + unit + '</td><td></td><td></td><td class="num">' + fmtDec(per) + "</td></tr></tfoot></table></details>";
  }
  function qeFmtCostDriver(d) {
    if (d.kind === "volume") {
      if (d.unit === "billed user") return fmt(d.value) + " billed users × " + fmtDec(d.per || 0) + "/mo";
      return fmt(d.value) + " " + d.unit + "s/mo";
    }
    return esc(d.label) + " (" + fmtDec(d.value) + " " + d.unit + ")";
  }
  function qeCostHtml(profile, v) {
    var est = EC.computeQuick(profile, v);
    var rng = EC.creditRange(est.monthly);
    var cost = EC.costUSD(est.monthly);
    var cards = (v.archetype === "autonomous")
      ? qeCard(fmt(est.units), "Events / mo") + qeCard(fmtDec(est.perUnit), "Credits / event") + qeCard(fmt(est.monthly), "Credits / mo")
      : qeCard(fmt(est.billed), "Billed users") + qeCard(fmt(est.monthly), "Credits / mo") + qeCard(fmtDec((v.interactions || 0) * est.perUnit), "Cr / user / mo");
    var drivers = EC.costDrivers(profile, v).map(qeFmtCostDriver);
    return '<div class="results-grid">' + cards + "</div>" +
      '<div class="em-range">Range: ' + fmt(rng.low) + " – " + fmt(rng.high) + " credits / month (directional band, ~0.6×–1.6× the midpoint).</div>" +
      '<div class="em-cost">' +
        '<div class="card"><div class="v">' + money(cost.payg) + '</div><div class="sub">/ mo · PAYG ($0.01)</div></div>' +
        '<div class="card"><div class="v">' + money(cost.prepaid) + '</div><div class="sub">/ mo · prepaid ($0.008)</div></div>' +
      "</div>" +
      (drivers.length ? '<div class="em-why"><strong>Why this cost:</strong> ' + drivers.join(" · ") + "</div>" : "") +
      escReadoutHtml(escSplit(est.perUnit, est.units || 0, v.escalation || 0, escCreditsOf(v)),
        { editable: true, unit: "interaction", onchange: "qeSetEscalationPct(this.value)", autonomous: v.archetype === "autonomous" }) +
      '<p class="hint">Credits only — excludes M365 license fees.' + (v.archetype === "autonomous" ? " Autonomous runs are billed even for licensed users." : "") + "</p>";
  }

  function qeResultsHtml() {
    var v = state.qe.vars;
    var adv = state.qe.view === "advanced";
    var steps = (state.qe.outline.steps || []).map(function (s, i) {
      return "<li><b>" + (i + 1) + ". " + esc(s.label) + "</b><span>" + esc(s.build) + "</span></li>";
    }).join("");
    return '<div id="qe-results-full">' +
      exportBarHtml("quick", {}) +
      '<div class="em-primary-actions" style="display:flex;flex-wrap:wrap;gap:.4rem;margin:.5rem 0 .75rem">' +
        '<button type="button" class="em-btn" onclick="qeSaveToWorkspace()">🧺 Save to My estimates</button>' +
        '<button type="button" class="em-btn" onclick="qeSendToRoi()">📈 Estimate ROI →</button>' +
        '<button type="button" class="em-btn secondary" onclick="qeToDetailed()">Open in Detailed →</button>' +
      '</div>' +
      (adv ? ('<div class="section-label">Edit all variables <span style="text-transform:none;font-weight:400">— every inference, in one place</span></div>' + qeQuizHtml(v, state.qe.why || {})) : "") +
      '<div class="section-label"' + (adv ? ' style="margin-top:1.25rem"' : "") + ">How this would be built in Copilot Studio</div>" +
      '<div id="qe-outline-head"></div>' +
      '<ul class="em-build-list">' + steps + "</ul>" +
      '<div class="qe-note"><strong>Two independent numbers.</strong> <em>Build effort</em> is how hard the agent is to design and stand up in Studio. <em>Run cost</em> is credits per run × your volume. They move independently — grounding on documents is easy to build <em>and</em> free per run, while Microsoft&nbsp;365 tenant-graph grounding adds setup <em>and</em> ~10 credits per run.</div>' +
      '<div class="qe-axes">' +
        '<div class="qe-axis"><h4>🔧 Build effort</h4><div id="qe-axis-build"></div></div>' +
        '<div class="qe-axis"><h4>💳 Run cost</h4><div id="qe-axis-cost"></div></div>' +
      "</div>" +
      '<div id="qe-profile2"></div>' +
      qeStarterHtml() +
      '<div class="qe-nav" style="margin-top:1.25rem">' +
        (adv
          ? '<button type="button" class="em-btn secondary" onclick="qeAdvanced()">← Back to guided</button>'
          : '<button type="button" class="em-btn secondary" onclick="qeEdit()">← Edit answers</button>' +
            '<button type="button" class="qe-preset" onclick="qeAdvanced()">Advanced: edit all</button>') +
        '<button type="button" class="qe-preset" onclick="qeStartOver()">Start over</button>' +
      "</div></div>";
  }
  // ── Quick: export an importable Copilot Studio starter agent (.zip) ───────
  // Renders one option in the "Authoring experience" segmented control (see CSS in
  // credit-estimator.md). Themed to match the site instead of a raw <select>.
  function qeSegOpt(val, title, sub, exp) {
    var on = (exp === val);
    var badge = val === "new" ? ' <span class="qe-seg-badge">Recommended</span>' : '';
    return '<button type="button" class="qe-seg-opt' + (on ? ' qe-seg-opt--active' : '') + '"' +
      ' role="radio" aria-checked="' + (on ? 'true' : 'false') + '" data-value="' + val + '"' +
      ' onclick="qePkgExperienceChange(\'' + val + '\')">' +
      '<span class="qe-seg-opt-title">' + title + badge + '</span>' +
      '<span class="qe-seg-opt-sub">' + sub + '</span>' +
      '</button>';
  }
  // The helper note under the segmented control — kept in one place so the initial
  // render and the change handler never drift.
  function qeExpNote(exp) {
    return exp === "new"
      ? 'The <strong>new experience</strong> is the modern, instruction-driven Copilot Studio agent \u2014 a single reasoning agent with <strong>no topics</strong>, richer thinking, and instructions written straight into the agent. It imports cleanly as an unmanaged solution; add tools &amp; knowledge in the portal to extend it. <strong>Recommended.</strong>'
      : 'Generates the <strong>classic-experience</strong> agent (topics, settings &amp; system scaffolding \u2014 legacy authoring). Imports cleanly. Use only if you specifically need the classic builder.';
  }
  // Work IQ pre-wires differently per experience: classic ships the two MCP tools inside
  // the package; the new experience is tenant-gated, so checking it there only adds a
  // NEXT-STEPS "turn it on after import" reminder. The pill + note flip with the experience
  // so a checked box never implies "already wired" on the new-experience path.
  function qeWorkIQPill(exp) {
    return exp === "new"
      ? '<span class="qe-pkg-workiq-pill qe-pkg-workiq-pill--toggle" id="qe-pkg-workiq-pill">Post-import toggle</span>'
      : '<span class="qe-pkg-workiq-pill qe-pkg-workiq-pill--wired" id="qe-pkg-workiq-pill">Wired in</span>';
  }
  function qeWorkIQNote(exp) {
    return exp === "new"
      ? 'Grounds on the Microsoft&nbsp;365 tenant graph (people, meetings, mail &amp; files) instead of one-off connectors. <strong>Not pre-wired in the new experience</strong> \u2014 checking this adds a NEXT-STEPS reminder to switch Work&nbsp;IQ on in the portal (Knowledge &rarr; Work&nbsp;IQ) after import. Bills ~10 credits per response. Want it pre-wired now? Use <strong>Classic</strong>.'
      : 'Grounds on the Microsoft&nbsp;365 tenant graph (people, meetings, mail &amp; files) instead of one-off connectors. <strong>Wired into the package</strong> \u2014 the two Work&nbsp;IQ MCP tools ship inside, ready to bind on the import Connections step. Bills ~10 credits per response.';
  }
  function qeStarterHtml() {
    var exp = (state.qe && state.qe.pkgExp) || "new";
    return '<div class="qe-starter">' +
      '<div class="section-label">Get a head start — export a Copilot Studio agent</div>' +
      '<p class="hint" style="margin:.15rem 0 .6rem">Download a ready-to-import <strong>starter agent</strong> built from your description: a tailored role &amp; instructions, agent settings, and any knowledge sources. It imports as an <strong>unmanaged</strong> (fully editable) solution — a scaffold to extend with tools &amp; knowledge and publish, not a finished agent.</p>' +
      '<div class="qe-seg-field">' +
        '<div class="section-label qe-seg-label" id="qe-pkg-exp-label">Authoring experience</div>' +
        '<div class="qe-seg" role="radiogroup" aria-labelledby="qe-pkg-exp-label" id="qe-pkg-experience">' +
          qeSegOpt("classic", "Classic experience", "Topics, settings &amp; system scaffolding \u2014 legacy authoring.", exp) +
          qeSegOpt("new", "New experience", "Single instruction-driven agent, enhanced reasoning.", exp) +
        '</div>' +
        '<div class="qe-seg-note hint" id="qe-pkg-exp-note">' + qeExpNote(exp) + '</div>' +
      '</div>' +
      '<label class="qe-pkg-workiq" for="qe-pkg-workiq">' +
        '<input type="checkbox" id="qe-pkg-workiq"' + (qeWorkIQDefault() ? ' checked' : '') + ' onchange="qePkgWorkIQChange(this.checked)">' +
        '<span>Ground on Microsoft&nbsp;365 with <strong>Work&nbsp;IQ</strong></span>' +
        qeWorkIQPill(exp) +
      '</label>' +
      '<div class="qe-seg-note hint" id="qe-pkg-workiq-note" style="margin:.1rem 0 .55rem">' + qeWorkIQNote(exp) + '</div>' +
      '<div class="qe-pkg-skills">' +
        '<label class="section-label qe-seg-label" for="qe-pkg-skills-input">Skills <span class="qe-pkg-skills-tag">new experience</span></label>' +
        '<textarea id="qe-pkg-skills-input" rows="2" oninput="qePkgSkillsChange(this.value)" placeholder="One skill per line \u2014 e.g. Meeting brief formatter: turns gathered context into an executive brief">' + esc((state.qe && state.qe.pkgSkills) || "") + '</textarea>' +
        '<div class="qe-seg-note hint" style="margin:.1rem 0 .55rem">Reusable, named instruction modules the agent invokes by name. Format each line <code>Name: what it does</code>. Emitted as editable <strong>Skills</strong> on new-experience agents (classic gets a note to switch experience).</div>' +
      '</div>' +
      '<button type="button" class="em-btn" onclick="qeDownloadPackage()" aria-label="Download a Copilot Studio starter agent as a solution package ZIP file">\u2b07 Download agent starter (.zip)</button>' +
      '<span class="em-export-status" id="qe-pkg-status" role="status" aria-live="polite" style="margin-left:.6rem"></span>' +
      '<div id="qe-pkg-review" class="qe-pkg-review" role="group" aria-label="Review what will be generated" style="display:none"></div>' +
      '<details class="qe-import-help" style="margin-top:.65rem">' +
        '<summary>How do I import this?</summary>' +
        '<ol class="qe-import-steps">' +
          '<li>Go to <strong>make.powerapps.com</strong> (or <strong>copilotstudio.microsoft.com</strong>) &rarr; <strong>Solutions</strong> &rarr; <strong>Import solution</strong>.</li>' +
          '<li>Choose the downloaded <code>.zip</code> and continue.</li>' +
          '<li>On the <strong>Connections</strong> step, pick or create a connection for each connector.</li>' +
          '<li>Click <strong>Import</strong> and wait for it to finish.</li>' +
          '<li>Open the agent, review it, and <strong>Publish</strong>. It imports unmanaged, so everything stays editable.</li>' +
        '</ol>' +
        '<p class="hint" style="margin:.4rem 0 0">A <code>NEXT-STEPS.md</code> inside the package lists the connections to set and any actions to wire up by hand.</p>' +
      '</details>' +
    '</div>';
  }
  function qePkgStatus(msg) {
    var el = document.getElementById("qe-pkg-status");
    if (!el) return;
    el.textContent = msg;
    if (el._t) clearTimeout(el._t);
    el._t = setTimeout(function () { el.textContent = ""; }, 6000);
  }
  // Persist the starter's authoring-experience pick so it survives result re-renders,
  // and update the segmented control + helper note in place. Deliberately does NOT
  // trigger qeRebuild — it's a download-time build-target option only.
  function qePkgExperienceChange(v) {
    var exp = (v === "new") ? "new" : "classic";
    if (state.qe) state.qe.pkgExp = exp;
    var grp = document.getElementById("qe-pkg-experience");
    if (grp) {
      Array.prototype.forEach.call(grp.querySelectorAll(".qe-seg-opt"), function (b) {
        var on = b.getAttribute("data-value") === exp;
        b.setAttribute("aria-checked", on ? "true" : "false");
        b.classList.toggle("qe-seg-opt--active", on);
      });
    }
    var note = document.getElementById("qe-pkg-exp-note");
    if (note) note.innerHTML = qeExpNote(exp);
    // Keep the Work IQ note + status pill in sync with the experience so "Wired in"
    // (classic) never lingers on the new-experience path (portal toggle, not pre-wired).
    var wiqNote = document.getElementById("qe-pkg-workiq-note");
    if (wiqNote) wiqNote.innerHTML = qeWorkIQNote(exp);
    var wiqPill = document.getElementById("qe-pkg-workiq-pill");
    if (wiqPill) {
      wiqPill.className = "qe-pkg-workiq-pill qe-pkg-workiq-pill--" + (exp === "new" ? "toggle" : "wired");
      wiqPill.textContent = exp === "new" ? "Post-import toggle" : "Wired in";
    }
  }
  // Work IQ opt-in for the starter. Default reflects the emitter's own auto-detection
  // (EP.wantsWorkIQ) so the checkbox shows what WOULD happen; a user toggle records an
  // explicit override in state so it survives result re-renders. Download-time only —
  // does NOT rebuild the estimate (Work IQ pricing lives in analyzeText's tenantGraph).
  function qeWorkIQDefault() {
    if (state.qe && typeof state.qe.pkgWorkIQ === "boolean") return state.qe.pkgWorkIQ;
    try {
      var v = (state.qe && state.qe.vars) || {};
      var raw = ((state.qe && state.qe.raw) || "").toLowerCase();
      return !!(EP && EP.wantsWorkIQ && EP.wantsWorkIQ(v, raw));
    } catch (e) { return false; }
  }
  function qePkgWorkIQChange(checked) {
    if (state.qe) state.qe.pkgWorkIQ = !!checked;
  }
  // Persist the Skills textarea so it survives result re-renders. Parsed at build time by
  // parseSkillLines (one skill per line, `Name: description`).
  function qePkgSkillsChange(text) {
    if (state.qe) state.qe.pkgSkills = String(text == null ? "" : text);
  }
  // "Meeting brief formatter: turns X into Y" -> {name, description}. Separator = first ":" or
  // em-dash; a bare line is the name only. Blank lines dropped.
  function parseSkillLines(text) {
    return String(text == null ? "" : text).split(/\r?\n/).map(function (ln) {
      ln = ln.trim();
      if (!ln) return null;
      var m = ln.match(/^([^:\u2014]+?)\s*[:\u2014]\s*(.+)$/);
      if (m) return { name: m[1].trim(), description: m[2].trim() };
      return { name: ln, description: "" };
    }).filter(Boolean);
  }
  // Shared package options read from current Quick state + the download-time
  // authoring-experience picker (separate from the credit-estimate orchestration).
  function qePkgOpts() {
    var v = (state.qe && state.qe.vars) || {};
    var outline = (state.qe && state.qe.outline) || null;
    var systems = (outline && outline.systems) || [];
    var grp = document.getElementById("qe-pkg-experience");
    var sel = grp && grp.querySelector('.qe-seg-opt[aria-checked="true"]');
    var exp = (sel && sel.getAttribute("data-value")) || (state.qe && state.qe.pkgExp) || "new";
    // Merge in the Work IQ override (live checkbox if present, else stored state) WITHOUT
    // mutating state.qe.vars so the credit estimate is untouched. undefined = auto-detect.
    var pkgVars = v;
    var wiqBox = document.getElementById("qe-pkg-workiq");
    var wiq = wiqBox ? wiqBox.checked : (state.qe && typeof state.qe.pkgWorkIQ === "boolean" ? state.qe.pkgWorkIQ : undefined);
    if (typeof wiq === "boolean") {
      pkgVars = {}; for (var k in v) if (Object.prototype.hasOwnProperty.call(v, k)) pkgVars[k] = v[k];
      pkgVars.workIQ = wiq;
    }
    // Pass the full outline so buildPackage can synthesize instructions + metadata
    // from the detected build steps (not just the systems list).
    var skillsBox = document.getElementById("qe-pkg-skills-input");
    var skillsText = skillsBox ? skillsBox.value : ((state.qe && state.qe.pkgSkills) || "");
    var skills = parseSkillLines(skillsText);
    return { description: (state.qe && state.qe.raw) || "", vars: pkgVars, systems: systems, outline: outline, experience: exp, skills: skills };
  }

  // Renders the inline review panel from an analyzePackage() summary. Every detected
  // connector / knowledge source / read-capability gets a "keep" checkbox (checked by
  // default) so the user can drop anything before the .zip is built.
  function qePkgReviewHtml(a) {
    var out = [];
    out.push('<div class="qe-rev-head">' +
      '<div class="qe-rev-title">Review what will be generated</div>' +
      '<div class="qe-rev-meta">' +
        '<span><strong>Agent:</strong> ' + esc(a.name) + '</span>' +
        '<span><strong>Experience:</strong> ' + (a.experience === "new" ? "New agent experience" : "Classic experience") + '</span>' +
        '<span><strong>Type:</strong> ' + (a.archetype === "autonomous" ? "Autonomous (triggered)" : "Interactive (chat)") + '</span>' +
      '</div>' +
      '<p class="hint" style="margin:.3rem 0 .5rem">Uncheck anything you don\u2019t want. Only the checked items are written into the package, its instructions, and <code>NEXT-STEPS.md</code>.</p>' +
    '</div>');

    // Shape-gap notices: described abilities (autonomous trigger, agent flow, prompt/
    // content tools) whose exact export shape isn't verified yet, so the package documents
    // them instead of emitting a component. Surfaced here so the user isn't surprised.
    if (a.notices && a.notices.length) {
      out.push('<div class="qe-rev-notices" role="note">');
      out.push('<div class="qe-rev-noticeshead">Before you import \u2014 finish these in Copilot Studio</div>');
      a.notices.forEach(function (n) {
        out.push('<div class="qe-rev-notice"><strong>' + esc(n.title) + '</strong><div class="qe-rev-sub">' + esc(n.detail) + '</div></div>');
      });
      out.push('</div>');
    }

    // Connectors are wired into the package in BOTH experiences and bind at import — classic
    // as `.action.` components, the new experience as verified `.tool.` (ConnectorTool)
    // components with a shared `.cr.<connector>` connection reference. (This resolves the
    // earlier report of connectors being "noted" but absent from the new-experience agent.)
    var newExp = a.experience === "new";
    var connLbl = newExp
      ? "Connector tools to wire (" + a.connectors.length + ")"
      : "Connector actions to wire (" + a.connectors.length + ")";
    out.push('<div class="qe-rev-group"><div class="qe-rev-grouplbl">' + connLbl + '</div>');
    if (newExp && a.connectors.length) {
      out.push('<p class="hint" style="margin:.1rem 0 .35rem">These ship as <strong>Tools</strong> in the package and <strong>bind at import</strong> (pick a connection on the Connections step). Uncheck any you don\u2019t want included.</p>');
    }
    if (a.connectors.length) {
      a.connectors.forEach(function (c) {
        out.push('<label class="qe-rev-item"><input type="checkbox" class="qe-rev-conn" data-key="' + esc(c.key) + '" checked> ' +
          '<span><strong>' + esc(c.actionName) + '</strong> \u2014 ' + esc(c.connectorLabel) + '</span></label>');
      });
    } else {
      out.push('<div class="qe-rev-empty">None detected.</div>');
    }
    out.push('</div>');

    // Knowledge sources.
    var hasPlaceholder = false;
    out.push('<div class="qe-rev-group"><div class="qe-rev-grouplbl">Knowledge sources (' + a.knowledge.length + ')</div>');
    if (a.knowledge.length) {
      a.knowledge.forEach(function (k) {
        if (k.placeholder) hasPlaceholder = true;
        var ph = k.placeholder ? ' <span class="qe-rev-flag">placeholder URL</span>' : '';
        var site = k.site ? '<div class="qe-rev-sub">' + esc(k.site) + '</div>' : '';
        out.push('<label class="qe-rev-item"><input type="checkbox" class="qe-rev-know" data-id="' + esc(k.id) + '" checked> ' +
          '<span><strong>' + esc(k.label) + '</strong>' + ph + site + '</span></label>');
      });
    } else {
      out.push('<div class="qe-rev-empty">None detected.</div>');
    }
    out.push('</div>');

    // Read capabilities -> NEXT-STEPS (tools to add by hand).
    out.push('<div class="qe-rev-group"><div class="qe-rev-grouplbl">Read capabilities \u2192 NEXT-STEPS (' + a.capabilities.length + ')</div>');
    if (a.capabilities.length) {
      a.capabilities.forEach(function (cap) {
        out.push('<label class="qe-rev-item"><input type="checkbox" class="qe-rev-cap" data-id="' + esc(cap.id) + '" checked> ' +
          '<span>' + esc(cap.behavior) + ' <span class="qe-rev-sub">tool to add by hand</span></span></label>');
      });
    } else {
      out.push('<div class="qe-rev-empty">None detected.</div>');
    }
    out.push('</div>');

    // Unmapped systems (info only — always listed in NEXT-STEPS).
    if (a.unmapped && a.unmapped.length) {
      out.push('<div class="qe-rev-group"><div class="qe-rev-grouplbl">Systems with no starter action</div>' +
        '<div class="qe-rev-empty">' + a.unmapped.map(function (s) { return esc(s); }).join(", ") + ' \u2014 listed in NEXT-STEPS.</div></div>');
    }
    if (a.tenantGraph) {
      out.push('<p class="hint" style="margin:.2rem 0">Grounded on Microsoft 365 tenant data (Graph) \u2014 configured on the agent, noted in NEXT-STEPS.</p>');
    }
    // Skills (new-experience InlineAgentSkill modules). Show what will be generated, or a
    // note if they were requested in the classic experience (where they can't ship).
    if (a.skills && a.skills.items && a.skills.items.length) {
      out.push('<div class="qe-rev-group"><div class="qe-rev-grouplbl">Skills to generate (' + a.skills.items.length + ')</div>' +
        a.skills.items.map(function (s) {
          return '<div class="qe-rev-item"><span><strong>' + esc(s.slug) + '</strong>' +
            (s.description ? '<span class="qe-rev-sub">' + esc(s.description) + '</span>' : '') + '</span></div>';
        }).join("") +
        '<div class="qe-rev-empty">Reusable instruction modules the agent invokes by name \u2014 refine each in Studio.</div></div>');
    } else if (a.skills && a.skills.gatedClassic) {
      out.push('<p class="hint" style="margin:.2rem 0"><strong>Skills</strong> need the <strong>new experience</strong> \u2014 switch the authoring experience above to ship them (see NEXT-STEPS).</p>');
    }
    if (hasPlaceholder) {
      out.push('<p class="hint" style="margin:.2rem 0"><strong>Note:</strong> items flagged <em>placeholder URL</em> use an example address \u2014 update it in Copilot Studio after import.</p>');
    }

    out.push('<div class="qe-rev-actions">' +
      '<button type="button" class="em-btn" onclick="qeConfirmDownload()">\u2b07 Generate .zip</button> ' +
      '<button type="button" class="em-btn secondary" onclick="qeCancelReview()">Cancel</button>' +
    '</div>');

    return out.join("");
  }

  // First click: analyze the description and show the review panel (no bytes built).
  function qeDownloadPackage() {
    if (!state.qe) { qePkgStatus("Build an estimate first."); return; }
    if (!EP || !EP.buildPackage) { qePkgStatus("Package builder isn't available \u2014 try refreshing the page."); return; }
    var host = document.getElementById("qe-pkg-review");
    try {
      var opts = qePkgOpts();
      var a = EP.analyzePackage ? EP.analyzePackage(opts) :
        (function () { var o = {}; for (var k in opts) o[k] = opts[k]; o.preview = true; return EP.buildPackage(o); })();
      if (host) {
        host.innerHTML = qePkgReviewHtml(a);
        host.style.display = "";
        qePkgStatus("Review the detected setup, then Generate.");
      } else {
        // Fallback: no panel host — build straight away (preserves old behavior).
        qeConfirmDownload();
      }
    } catch (e) {
      qePkgStatus("Couldn't analyze the package: " + (e && e.message ? e.message : String(e)));
    }
  }

  // Second click ("Generate .zip"): read the review checkboxes, build with the
  // confirmed/edited selections, and download. With nothing unchecked the exclude
  // lists are empty, so the output is identical to the pre-review behavior.
  function qeConfirmDownload() {
    if (!state.qe || !EP || !EP.buildPackage) { qePkgStatus("Package builder isn't available."); return; }
    var host = document.getElementById("qe-pkg-review");
    try {
      var opts = qePkgOpts();
      var exclude = { connectors: [], knowledge: [], capabilities: [] };
      if (host) {
        var collect = function (sel, key, attr) {
          Array.prototype.forEach.call(host.querySelectorAll(sel), function (cb) {
            if (!cb.checked) exclude[key].push(cb.getAttribute(attr));
          });
        };
        collect(".qe-rev-conn", "connectors", "data-key");
        collect(".qe-rev-know", "knowledge", "data-id");
        collect(".qe-rev-cap", "capabilities", "data-id");
      }
      opts.exclude = exclude;
      var pkg = EP.buildPackage(opts);
      var okDl = downloadBlob(pkg.bytes, pkg.filename, "application/zip");
      if (host) { host.innerHTML = ""; host.style.display = "none"; }
      var nRemoved = exclude.connectors.length + exclude.knowledge.length + exclude.capabilities.length;
      qePkgStatus(okDl
        ? ("Built \u2713 " + pkg.filename + " (" + (opts.experience === "new" ? "new experience" : "classic experience") + (nRemoved ? ", " + nRemoved + " removed" : "") + ")")
        : "Downloads aren't supported in this browser.");
    } catch (e) {
      qePkgStatus("Couldn't build the package: " + (e && e.message ? e.message : String(e)));
    }
  }

  function qeCancelReview() {
    var host = document.getElementById("qe-pkg-review");
    if (host) { host.innerHTML = ""; host.style.display = "none"; }
    qePkgStatus("Cancelled \u2014 nothing downloaded.");
  }

  function qeRenderResultsInner() {
    if (!state.qe) return;
    var v = state.qe.vars, profile = state.qe.profile || EC.deriveQuick(v);
    var sizing = EC.sizeFromDrivers(v);
    setHtml("qe-outline-head", qeOutlineHeadHtml(v, state.qe.outline));
    setHtml("qe-axis-build", tshirtHtml(sizing.size, sizing.drivers));
    setHtml("qe-axis-cost", qeCostHtml(profile, v));
    setHtml("qe-profile2", qeProfileHtml(profile, v));
  }

  // ── wizard: shared recompute + top-level render ───────────────────────────
  function qeRebuild() {
    if (!state.qe) return;
    state.qe.vars = qeReadVars();
    qeNormalizeVars();
    state.qe.profile = EC.deriveQuick(state.qe.vars);
    var iv = document.getElementById("qe-vol-interactive");
    var av = document.getElementById("qe-vol-autonomous");
    if (iv) iv.style.display = state.qe.vars.archetype === "autonomous" ? "none" : "";
    if (av) av.style.display = state.qe.vars.archetype === "autonomous" ? "" : "none";
    if (document.getElementById("qe-preview")) qeRenderPreview();
    if (document.getElementById("qe-progress")) qeRenderProgress();
    if (document.getElementById("qe-results-full")) qeRenderResultsInner();
  }

  function qeRender() {
    var res = document.getElementById("qe-results"); if (!res || !state.qe) return;
    res.classList.remove("em-hidden");
    if (state.qe.view === "wizard") {
      res.innerHTML =
        '<div class="qe-wizard">' +
          '<div class="qe-wiz-main">' +
            '<div class="qe-progress" id="qe-progress"></div>' +
            '<div id="qe-step-area"></div>' +
            '<div class="qe-nav" id="qe-nav"></div>' +
          "</div>" +
          '<aside class="qe-preview" id="qe-preview"></aside>' +
        "</div>";
      state.qe.profile = EC.deriveQuick(state.qe.vars);
      qeRenderStep(); qeRenderPreview();
    } else {
      res.innerHTML = qeResultsHtml();
      state.qe.profile = EC.deriveQuick(state.qe.vars);
      qeRenderResultsInner();
    }
  }

  function qeNext() {
    if (!state.qe) return;
    var order = qeOrder();
    if (state.qe.step >= order.length - 1) { qeGoResults(); }
    else { state.qe.step++; qeRenderStep(); qeRenderPreview(); }
  }
  function qeBack() { if (state.qe && state.qe.step > 0) { state.qe.step--; qeRenderStep(); qeRenderPreview(); } }
  function qeSkip() { qeGoResults(); }
  function qeGoResults() { if (!state.qe) return; state.qe.view = "results"; qeRender(); }
  function qeEdit() { if (!state.qe) return; state.qe.view = "wizard"; state.qe.step = 0; qeRender(); }
  function qeAdvanced() { if (!state.qe) return; state.qe.view = state.qe.view === "advanced" ? "results" : "advanced"; qeRender(); }
  function qeStartOver() {
    var i = document.getElementById("qe-input"); if (i) i.value = "";
    state.qe = null;
    var res = document.getElementById("qe-results");
    if (res) { res.classList.add("em-hidden"); res.innerHTML = ""; }
    if (i && i.focus) i.focus();
  }
  function qeSetNum(id, val) { var e = document.getElementById(id); if (e) { e.value = val; qeRebuild(); } }
  // Phase B: edit the escalation buffer straight from the Quick results (run-cost axis).
  // Re-renders only the results panel from state.qe.vars (never qeReadVars) so the
  // escalation % isn't clobbered by wizard-input reads.
  function qeSetEscalationPct(pct) {
    if (!state.qe) return;
    var e = Math.min(100, Math.max(0, parseFloat(pct) || 0));
    state.qe.vars.escalation = e;
    if (e > 0) {
      state.qe.vars.hasEscalation = true;
      if (!(state.qe.vars.escalationCredits > 0)) state.qe.vars.escalationCredits = ESC_DEFAULT_CREDITS;
    }
    if (document.getElementById("qe-results-full")) qeRenderResultsInner();
  }

  function qeAnalyze() {
    var input = document.getElementById("qe-input");
    var txt = input ? input.value.trim() : "";
    var res = document.getElementById("qe-results");
    if (!res) return;
    if (!txt) {
      res.classList.remove("em-hidden");
      res.innerHTML = '<p class="hint">Describe the agent above (or pick an example), then press <strong>Build my estimate</strong>.</p>';
      return;
    }
    var a = EC.analyzeText(txt);
    state.qe = {
      raw: txt, vars: clone(a.vars), why: a.why, outline: a.outline, profile: a.profile.map(clone),
      detectedActions: (a.outline.steps || []).filter(function (s) { return s.category === "action" && s.id !== "escalation"; }).map(function (s) { return s.id; }),
      view: "wizard", step: 0
    };
    qeRender();
    scrollToResults("qe-results");
  }
  function qeRecompute() { qeRebuild(); }
  function qeToDetailed() {
    var st = state.qe; if (!st) return;
    clearOrigin();
    var v = st.vars;
    var profile = EC.deriveQuick(v);
    var scale = v.archetype === "autonomous"
      ? { archetype: "autonomous", events: v.events || 0 }
      : { archetype: "interactive", users: v.users || 0, interactions: v.interactions || 0, deployment: v.deployment || "embedded", licensePct: v.licensePct || 0 };
    seedDetailed(profile, scale, v.escalation || 0);
  }

  // ── Send this Quick estimate to the ROI Estimator (site-bus handoff) ──────────
  // Carries INPUTS ONLY (the raw scenario text) so the ROI page recomputes credits
  // with the same EstimatorCore engine — no frozen number, no drift. meta is a
  // display-only cache for the import banner. See docs/javascripts/site-bus.js.
  function roiHandoffUrl() {
    // Both tools are sibling top-level pages; resolve relative to the current dir
    // URL so it's correct under the GitHub Pages project path prefix too.
    return "../roi-estimator/?from=estimate";
  }
  function qeSendToRoi() {
    var st = state.qe, B = window.SiteBus;
    if (!st || !B) return;
    var item = qeEstimateItem();
    if (item) B.handoff(item);
    var nav = (B.UX && B.UX.nav) || "same-tab";
    if (nav === "new-tab") window.open(roiHandoffUrl(), "_blank");
    else window.location.href = roiHandoffUrl();
  }
  // Build a portable estimate envelope from the current Quick scenario (inputs-only:
  // the NL text, so it recomputes live anywhere). Shared by the ROI handoff and the
  // "Save to My estimates" cart.
  function qeEstimateItem() {
    var st = state.qe;
    if (!st) return null;
    var a = EC.analyzeText(st.raw);
    var monthly = (a && a.estimate) ? Math.round(a.estimate.monthly) : 0;
    var gist = String(st.raw).replace(/\s+/g, " ").trim();
    if (gist.length > 64) gist = gist.slice(0, 61).replace(/\s+\S*$/, "") + "\u2026";
    return {
      kind: "estimate", producer: "studio",
      label: gist + " \u00b7 ~" + monthly.toLocaleString() + " credits/mo",
      input: { text: st.raw },
      meta: {
        monthlyCredits: monthly,
        size: a ? a.size : null,
        regime: (a && a.estimate) ? a.estimate.regime : (st.vars && st.vars.archetype)
      }
    };
  }
  // Save the current Quick estimate into the durable "My estimates" cart (V2).
  function qeSaveToWorkspace() {
    var st = state.qe, W = window.WorkspaceUI;
    if (!st || !W) return;
    var item = qeEstimateItem();
    if (item) W.add(item);
  }

  // ── Solution package (upload) ─────────────────────────────────────────────
  function componentSummary(f) {
    var k = f.knowledgeTypes.length ? f.knowledgeTypes.join(", ") : "none identified";
    var lines = [
      "Regime:                         " + (f.regime === "autonomous" ? "autonomous (per-run)" : "interactive (per-user)"),
      "Authoring experience:           " + (f.newExperience
        ? "New (cliagent" + (f.modelSeries ? ", model " + f.modelSeries : "") + (f.reasoningModel ? ", reasoning" : "") + ", generative runtime)"
        : "Classic"),
      "Topics (AdaptiveDialog):        " + f.topics,
      "Triggers:                       " + f.triggers,
      "Generative answer nodes:        " + f.genAnswers,
      "Knowledge search nodes:         " + f.knowledgeSearch,
      "Knowledge source components:    " + f.knowledgeComps,
      "Knowledge sources (total):      " + f.knowledgeCount,
      "Knowledge source types:         " + k,
      "Agent action nodes:             " + f.actionNodes,
      "Flow files parsed:              " + f.flowCount,
      "Flow actions (total):           " + f.flowActions,
      "  · connector actions:          " + f.flowConnectorActions,
      "  · HTTP actions:               " + f.flowHttp,
      "  · loops:                      " + f.flowLoops,
      "AI Builder prompts (flow):      " + f.aiPrompts + " (" + f.aiPromptCalls + " call(s)/run)",
      "Prompt / AI nodes (total):      " + f.aiNodes,
      "Prompt / AI tools (billable):   " + (f.promptTools != null ? f.promptTools : f.aiNodes),
      "InvokeFlowAction / workflows:   " + f.flowNodes + " / " + f.workflowFiles,
      "Connectors:                     " + (f.connectors.length ? f.connectors.join(", ") : "none"),
      "Premium / unknown connectors:   " + (f.premiumConnectors.length ? f.premiumConnectors.join(", ") : "none"),
      "Connection references:          " + f.connectionRefs,
      "Agents:                         " + f.agentCount + " (connected: " + f.connectedAgents + ")",
      "Human escalation / guardrail:   " + (f.hasEscalation ? "yes" : "no"),
      "Computer-use action:            " + (f.computerUse ? "yes" : "no"),
      "Tenant-graph grounding:         " + (f.tenantGraph ? "yes" : "no"),
      "Generative orchestration:       " + (f.genOrch ? "yes" : "no"),
      "Content processing:             " + (f.contentProc ? "yes" : "no"),
      "Voice channel:                  " + (f.voice ? "yes" : "no"),
      "Build-spec bundle:              " + (f.specBundle ? "yes" : "no"),
      "Files scanned:                  " + f.fileCount + " (" + f.binaryFiles + " binary)"
    ];
    return lines.join("\n");
  }

  function findCard(v, k, off) {
    return '<div class="em-find' + (off ? " off" : "") + '"><div class="v">' + v + '</div><div class="k">' + k + '</div></div>';
  }

  function spWarningsHtml(a) {
    if (!a.warnings || !a.warnings.length) return "";
    return '<div class="sp-warnings">' +
      a.warnings.map(function (w) { return '<div class="sp-warn">' + esc(w) + '</div>'; }).join("") +
      '</div>';
  }

  function spInventoryHtml(a) {
    var f = a.findings, out = [];
    // Phase C — surface the authoritative new-experience reads (gated: classic exports
    // render nothing here). model series + reasoning flag + web-search + agent-flow tools
    // all come straight from the shared verified vocabulary, not keyword guessing.
    if (f.newExperience) {
      var badges = '<span class="sp-chip">New agent experience</span>' +
        '<span class="sp-chip">Generative runtime</span>';
      if (f.modelSeries) badges += '<span class="sp-chip">Model · ' + esc(f.modelSeries) + (f.reasoningModel ? " · reasoning" : "") + '</span>';
      if (f.webSearch) badges += '<span class="sp-chip">Web search on</span>';
      if (f.workflowTools) badges += '<span class="sp-chip">' + f.workflowTools + ' agent-flow tool' + (f.workflowTools > 1 ? "s" : "") + '</span>';
      out.push('<div class="section-label" style="margin-top:1.25rem">Authoring experience</div><div class="sp-chips">' + badges + '</div>');
    }
    if (a.flows && a.flows.length) {
      out.push('<div class="section-label" style="margin-top:1.25rem">Flows detected</div>');
      out.push('<table class="em-profile"><thead><tr><th>Trigger</th><th class="num">Actions</th><th class="num">AI prompts</th><th class="num">Loops</th><th>Connectors</th></tr></thead><tbody>' +
        a.flows.map(function (fl) {
          return '<tr><td>' + esc(fl.trigger) + (fl.automated ? ' <span class="hint" style="display:inline">(automated)</span>' : "") + '</td>' +
            '<td class="num">' + fl.actions + '</td><td class="num">' + fl.aiPrompts + '</td><td class="num">' + fl.loops + '</td>' +
            '<td>' + esc(fl.connectors.join(", ") || "—") + '</td></tr>';
        }).join("") + '</tbody></table>');
    }
    if (a.connectors && a.connectors.length) {
      var chips = a.connectors.map(function (c) {
        var prem = (a.premiumConnectors || []).indexOf(c) >= 0;
        return '<span class="sp-chip' + (prem ? " prem" : "") + '">' + esc(c) + (prem ? " · premium" : "") + '</span>';
      }).join("");
      out.push('<div class="section-label" style="margin-top:1.25rem">Connectors</div><div class="sp-chips">' + chips + '</div>');
    }
    return out.join("");
  }

  // strat-modernize-upload — advisory panel that diffs the uploaded solution
  // against the best-practice bar this tool now builds to. Pure render over
  // EC.modernizeAdvice() (read-only; no rate/calc). Shown for both regimes.
  var SP_REC_TAG = { build: "Build", cost: "Cost", governance: "Governance" };
  function spModernizeHtml(a) {
    if (!EC || typeof EC.modernizeAdvice !== "function") return "";
    var recs = EC.modernizeAdvice(a) || [];
    var head = '<div class="sp-modernize"><div class="sp-modernize-head">Modernization recommendations</div>';
    if (!recs.length) {
      return head +
        '<div class="sp-rec sp-rec--ok"><div class="sp-rec-title">\u2713 Already following current best practices</div>' +
        '<div class="sp-rec-body">This agent uses the new experience with generative orchestration and shows no obvious one-off Microsoft 365 reads to consolidate. Nice work.</div></div></div>';
    }
    var body = recs.map(function (r) {
      var tag = SP_REC_TAG[r.severity] || "Tip";
      return '<div class="sp-rec sp-rec--' + esc(r.severity) + '">' +
        '<div class="sp-rec-title"><span class="sp-rec-tag">' + esc(tag) + '</span>' + esc(r.title) + '</div>' +
        '<div class="sp-rec-body">' + esc(r.body) + '</div>' +
        (r.cost ? '<div class="sp-rec-cost">' + esc(r.cost) + '</div>' : "") +
        '</div>';
    }).join("");
    return head +
      '<p class="hint">How to bring this agent up to the bar this tool builds to \u2014 new agent experience, generative orchestration, Work IQ over one-off reads, and Skills for reusable clusters. Advisory only; nothing here changes the estimate above.</p>' +
      body + '</div>';
  }

  function spRender(a) {
    var auto = a.regime === "autonomous";
    state.sp = {
      profile: a.profile.map(clone),
      regime: a.regime,
      scale: auto
        ? { regime: "autonomous", runs: a.runsPerMonthDefault || 1000 }
        : { regime: "interactive", users: 500, interactions: 10, deployment: "embedded", licensePct: 60 },
      escalation: 0, tshirt: a.tshirt
    };
    // Phase D: per-tool average/escalation classification (interactive only — the core
    // doesn't model escalation on per-run agents). Default every tool to the average path so
    // the base estimate matches the file's structure; the questionnaire lets the user reclassify.
    if (!auto) state.sp.toolPaths = state.sp.profile.map(function () { return "avg"; });
    var f = a.findings;
    var grid = auto
      ? (findCard(f.aiPrompts, "AI Builder prompts", f.aiPrompts === 0) +
         findCard(f.flowConnectorActions + f.flowHttp, "Flow actions", (f.flowConnectorActions + f.flowHttp) === 0) +
         findCard(f.flowLoops, "Loops", f.flowLoops === 0) +
         findCard(f.connectors.length, "Connectors", f.connectors.length === 0) +
         findCard(f.premiumConnectors.length, "Premium conn.", f.premiumConnectors.length === 0) +
         findCard(f.flowCount, "Flows", f.flowCount === 0) +
         findCard(f.contentProc ? "Yes" : "No", "Doc processing", !f.contentProc) +
         findCard(f.triggers, "Triggers", f.triggers === 0))
      : (findCard(f.topics, "Topics", f.topics === 0) +
         findCard(f.genAnswers, "Generative answers", f.genAnswers === 0) +
         findCard(f.promptTools != null ? f.promptTools : 0, "Prompt / AI tools", !f.promptTools) +
         findCard(f.knowledgeCount, "Knowledge sources", f.knowledgeCount === 0) +
         findCard(f.actionNodes, "Action nodes", f.actionNodes === 0) +
         findCard(f.flowNodes + f.workflowFiles + f.flowCount, "Agent flows", (f.flowNodes + f.workflowFiles + f.flowCount) === 0) +
         findCard(f.agentCount, "Agents", f.agentCount <= 1) +
         findCard(f.tenantGraph ? "Yes" : "No", "Tenant graph", !f.tenantGraph) +
         findCard(f.hasEscalation ? "Yes" : "No", "Escalation", !f.hasEscalation));
    var kt = f.knowledgeTypes.length ? " (" + f.knowledgeTypes.join(", ") + ")" : "";
    var res = document.getElementById("sp-results");
    var regimeBadge = '<span class="sp-regime sp-regime-' + a.regime + '">' + (auto ? "Autonomous · per-run" : "Interactive · per-user") + '</span>';
    res.innerHTML =
      '<div class="section-label">What we found in your solution ' + regimeBadge + '</div>' +
      '<div class="em-findings">' + grid + "</div>" +
      '<p class="hint" style="margin-top:0.5rem">' + f.fileCount + " files scanned (" + f.binaryFiles + " binary) · " + f.triggers + " trigger(s) · knowledge" + esc(kt) +
        (f.genOrch ? " · generative orchestration on" : "") + (f.computerUse ? " · computer-use action" : "") +
        (f.specBundle ? " · build-spec bundle" : "") + ".</p>" +
      spWarningsHtml(a) +
      tshirtHtml(a.tshirt) +
      spInventoryHtml(a) +
      spModernizeHtml(a) +
      (auto
        ? assumptionsAutonomousHtml("sp", state.sp.scale, {})
        : assumptionsHtml("sp", state.sp.scale, {
            users: "The package doesn't reveal volume — set your expected reach.",
            interactions: "How often each user will interact per month.",
            deployment: "Where the agent is published."
          })) +
      (auto ? "" : spPrecisionIntroHtml()) +
      profileTableHtml("sp", state.sp.profile, auto ? {} : { withPaths: true, paths: state.sp.toolPaths }) +
      '<p class="hint">Per-' + (auto ? "run" : "interaction") + ' <em>uses</em> are assumptions — a solution shows which capabilities <em>exist</em>, not how often each fires. Tune them to your real ' + (auto ? "runs" : "flows") + '.</p>' +
      estimateHtml("sp", auto) +
      exportBarHtml("complex", {}) +
      '<details class="em-details"><summary>Component inventory (full transparency)</summary><div class="em-complist">' + esc(componentSummary(f)) + "</div></details>";
    res.classList.remove("em-hidden");
    recompute("sp");
    scrollToResults("sp-results");
  }
  function spRecompute() { recompute("sp"); }
  // Phase D: guided precision intro for the average-vs-escalation questionnaire.
  function spPrecisionIntroHtml() {
    return '<div class="em-precision"><div class="em-precision-head">Refine precision — average vs escalation</div>' +
      '<p class="hint">Your base estimate counts <strong>every</strong> capability on the average interaction. For a tighter number, mark the tools that only fire when a conversation <em>escalates</em> or hands off (a manager lookup, a ticket write-back, an approval). Those get priced into a separate <strong>escalation buffer</strong> below instead of every interaction — the same "add a buffer" idea from the Detailed estimator. Set the buffer % to the share of interactions you expect to escalate.</p></div>';
  }
  // Phase D: reclassify a profile row between the average path and escalation-only, then
  // reprice. Updates the toggle + row styling in place (no full re-render → keeps inputs/scroll).
  function spSetToolPath(idx, path) {
    var st = state.sp; if (!st || !st.toolPaths || idx == null) return;
    st.toolPaths[idx] = path === "esc" ? "esc" : "avg";
    var isEsc = st.toolPaths[idx] === "esc";
    var row = document.querySelector('#sp-results tr.em-prow[data-idx="' + idx + '"]');
    if (row) {
      row.classList.toggle("em-prow--esc", isEsc);
      var btns = row.querySelectorAll(".em-fireson-opt");
      if (btns[0]) { btns[0].classList.toggle("active", !isEsc); btns[0].setAttribute("aria-pressed", String(!isEsc)); }
      if (btns[1]) { btns[1].classList.toggle("active", isEsc); btns[1].setAttribute("aria-pressed", String(isEsc)); }
    }
    recompute("sp");
  }
  // Phase B: escalation buffer for an uploaded solution. The escalation adder is per-tool when
  // tools are tagged (Phase D); otherwise it defaults to one escalation action per interaction
  // (ESC_DEFAULT_CREDITS). Stored on state.sp.escalation and read back in recompute().
  function spSetEscalationPct(pct) {
    if (!state.sp) return;
    state.sp.escalation = Math.min(100, Math.max(0, parseFloat(pct) || 0));
    recompute("sp");
  }
  function spToDetailed() {
    var st = state.sp; if (!st) return;
    clearOrigin();
    var scale = readScale("sp");
    if (scale.regime === "autonomous") seedDetailed(st.profile, { archetype: "autonomous", events: scale.runs }, st.escalation);
    else seedDetailed(st.profile, scale, st.escalation);
  }

  function spHandleFile(file) {
    var status = document.getElementById("sp-status");
    if (!file) return;
    if (!/\.zip$/i.test(file.name)) {
      if (status) { status.className = "sp-status sp-error"; status.textContent = "Please choose a .zip solution export."; }
      return;
    }
    if (status) { status.className = "sp-status"; status.textContent = "Reading " + file.name + " …"; }
    file.arrayBuffer()
      .then(function (ab) { return EZ.readZip(ab); })
      .then(function (files) {
        var a = EC.analyzeSolution(files);
        if (status) status.textContent = "Analyzed " + file.name + " — " + files.length + " files scanned.";
        spRender(a);
      })
      .catch(function (err) {
        if (status) { status.className = "sp-status sp-error"; status.textContent = "Could not analyze this file: " + (err && err.message ? err.message : err); }
        var res = document.getElementById("sp-results"); if (res) res.classList.add("em-hidden");
      });
  }

  // ── Quick + Import (batch Excel) ──────────────────────────────────────────
  var QI_SIZE_COLOR = { XS: "#2e7d32", S: "#4e8a1f", M: "#d98200", L: "#e65100", XL: "#c62828" };
  function sizeColor(s) { return QI_SIZE_COLOR[s] || "#616161"; }

  function downloadBlob(data, filename, mime) {
    if (typeof Blob === "undefined" || !window.URL || !window.URL.createObjectURL) return false;
    var blob = data instanceof Blob ? data : new Blob([data], { type: mime || "application/octet-stream" });
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { if (a.parentNode) a.parentNode.removeChild(a); window.URL.revokeObjectURL(url); }, 0);
    return true;
  }

  function qiStatus(msg, err) {
    var st = document.getElementById("qi-status");
    if (st) { st.className = "sp-status" + (err ? " sp-error" : ""); st.textContent = msg; }
  }

  function qiDownloadTemplate() {
    if (!EX || !EC) { qiStatus("Template builder isn't loaded — try refreshing the page.", true); return; }
    try {
      var bytes = EX.buildTemplate(EC.IMPORT_SCHEMA, EC.IMPORT_EXAMPLES);
      var ok = downloadBlob(bytes, "copilot-credit-estimator-template.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      if (ok) qiStatus("Template downloaded — fill in the Scenarios sheet, then import it below.");
    } catch (e) { qiStatus("Couldn't build the template: " + (e && e.message ? e.message : e), true); }
  }

  function qiDownloadCsv() {
    if (!EX || !EC) { qiStatus("Template builder isn't loaded — try refreshing the page.", true); return; }
    var keys = EC.IMPORT_SCHEMA.map(function (c) { return c.key; });
    var rows = [EC.IMPORT_SCHEMA.map(function (c) { return c.header; })];
    EC.IMPORT_EXAMPLES.forEach(function (ex) {
      rows.push(keys.map(function (k) { return ex[k] == null ? "" : ex[k]; }));
    });
    var ok = downloadBlob("\uFEFF" + EX.buildCsv(rows), "copilot-credit-estimator-template.csv", "text/csv;charset=utf-8");
    if (ok) qiStatus("CSV template downloaded — fill it in and import it below.");
  }

  function qiCard(v, k, s) {
    return '<div class="qi-card"><div class="k">' + esc(k) + '</div><div class="v">' + esc(String(v)) + "</div>" +
      (s ? '<div class="s">' + esc(s) + "</div>" : "") + "</div>";
  }
  function qiVolume(s) {
    var v = s.vars;
    if (v.archetype === "autonomous") return fmt(v.events || 0) + " events";
    return fmt((v.users || 0) * (v.interactions || 0)) + " conv";
  }
  function qiCostDriverText(d) {
    if (!d || typeof d !== "object") return esc(String(d));
    if (d.kind === "volume") {
      var t = esc(d.label) + " \u2014 " + fmt(d.value) + " " + esc(d.unit) + (d.value === 1 ? "" : "s");
      if (d.per != null) t += " \u00d7 " + fmtDec(d.per) + " / mo";
      return t;
    }
    return esc(d.label) + " \u2014 " + fmtDec(d.value) + " " + esc(d.unit || "");
  }

  // ── Phase B: escalation "buffer" — average vs escalated vs blended ──────────
  // Presentational only. Re-derives the average / escalated / blended split from the
  // SAME primitive computeQuick already blends: per-interaction credits + the
  // escExtra = (escalation% / 100) × escalation-credits term (estimator-core.js:168).
  // No core rate/calc math is touched — this just SURFACES the buffer and lets each
  // mode edit the escalation % to add headroom for the fraction of interactions that
  // hand off to a human or fire extra tools.
  var ESC_DEFAULT_CREDITS = (EC && EC.CREDIT && EC.CREDIT.action) || 1; // one escalation action / interaction
  function escCreditsOf(v) { return (v && v.escalationCredits > 0) ? v.escalationCredits : ESC_DEFAULT_CREDITS; }
  function qiExpanded(i) { return !!(state.qi && state.qi.expanded && state.qi.expanded[i]); }
  function escSplit(per, volume, pct, escCredits) {
    var e = Math.min(100, Math.max(0, parseFloat(pct) || 0));
    var ec = parseFloat(escCredits) || 0;
    var vol = Math.max(0, volume || 0);
    var blendPer = per + (e / 100) * ec, escPer = per + ec;
    return { pct: e, escCredits: ec, vol: vol, avgPer: per, blendPer: blendPer, escPer: escPer,
      avgMonthly: vol * per, blendMonthly: vol * blendPer, escMonthly: vol * escPer };
  }
  // Renders the avg / escalated / blended read-out. opts:{ editable, onchange, unit, autonomous }.
  // Returns "" for autonomous (core doesn't model escalation on per-run agents).
  function escReadoutHtml(split, opts) {
    opts = opts || {};
    if (opts.autonomous) return "";
    var s = split, unit = opts.unit || "interaction";
    var buffer = s.blendMonthly - s.avgMonthly;
    var pctTxt = fmtDec(s.pct);
    var noEscTools = s.escCredits === 0; // Phase D: nothing tagged escalation-only
    var on = s.pct > 0 && s.escCredits > 0;
    var ctl;
    if (opts.editable && opts.onchange) {
      ctl = '<div class="em-esc-ctl"><label>Escalation buffer</label>' +
        '<div class="range-row">' +
          '<input type="range" min="0" max="100" step="1" value="' + s.pct + '" aria-label="Escalation percent" ' +
            'oninput="this.parentNode.querySelector(&quot;input[type=number]&quot;).value=this.value" onchange="' + opts.onchange + '">' +
          '<input type="number" min="0" max="100" step="1" value="' + s.pct + '" aria-label="Escalation percent" onchange="' + opts.onchange + '"><span>%</span>' +
        '</div></div>';
    } else {
      ctl = '<div class="em-esc-ctl em-esc-ctl--static"><span class="hint">at ' + pctTxt + '% escalation</span></div>';
    }
    var hint;
    if (noEscTools) {
      hint = '<div class="hint em-esc-buffer">No tools marked <em>escalation-only</em> — an escalated ' + esc(unit) + ' costs the same as an average one. Mark the tools that only fire on hand-off above to model a buffer.</div>';
    } else if (s.pct > 0) {
      hint = '<div class="hint em-esc-buffer">Buffer of <strong>+' + fmt(buffer) + ' cr / mo</strong> (' + money(EC.costUSD(buffer).payg) + ' PAYG) over the ' + fmt(s.avgMonthly) + ' cr / mo average \u2014 headroom for the ' + pctTxt + '% of ' + esc(unit) + 's that escalate.</div>';
    } else {
      hint = '<div class="hint em-esc-buffer">No buffer yet \u2014 set a % to add headroom for ' + esc(unit) + 's that hand off to a human or fire extra tools. The middle figure is what one <em>escalated</em> ' + esc(unit) + ' would cost.</div>';
    }
    return '<div class="em-esc' + (on ? " em-esc--on" : "") + '">' +
      '<div class="em-esc-head">Escalation headroom <span class="hint">\u2014 average vs escalated ' + esc(unit) + 's</span></div>' +
      '<div class="em-esc-grid">' +
        '<div class="em-esc-cell"><div class="v">' + fmtDec(s.avgPer) + '</div><div class="k">avg cr / ' + esc(unit) + '</div></div>' +
        '<div class="em-esc-cell"><div class="v">' + fmtDec(s.escPer) + '</div><div class="k">escalated cr / ' + esc(unit) + '</div></div>' +
        '<div class="em-esc-cell em-esc-cell--blend"><div class="v">' + fmt(s.blendMonthly) + '</div><div class="k">blended cr / mo</div></div>' +
      '</div>' +
      hint +
      ctl +
    '</div>';
  }

  function qiRowDetailHtml(s, i) {
    var caps = (s.capabilities || []).map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("");
    var costs = (s.costDrivers || []).map(function (c) { return "<li>" + qiCostDriverText(c) + "</li>"; }).join("");
    var sizeWhy = (s.sizeDrivers || []).map(esc).join(" · ");
    var warns = (s.warnings || []).map(function (w) { return '<li class="qi-warn">' + esc(w) + "</li>"; }).join("");
    var unit = s.vars.archetype === "autonomous" ? "event" : "interaction";
    var editedNote = s.edited ? '<div class="qi-edited-note">\u270E Tuned in the Detailed estimator \u2014 volume, escalation, and the credit mix below reflect your manual edits.</div>' : "";
    var mix = "";
    if (s.edited && s.profile && s.profile.length) {
      var mixLines = s.profile.filter(function (r) { return r.name; }).map(function (r) {
        return "<li>" + esc(r.name) + " \u2014 " + fmtDec(r.uses) + " \u00D7 " + fmtDec(r.credits) + " = " + fmtDec(r.uses * r.credits) + "</li>";
      }).join("");
      mix = "<div><strong>Credit mix</strong> (" + fmtDec(s.perUnit) + " credits / " + unit + ")<ul>" + mixLines + "</ul></div>";
    }
    var escBlock = "";
    if (s.vars.archetype !== "autonomous") {
      escBlock = escReadoutHtml(
        escSplit(s.perUnit, (s.estimate && s.estimate.units) || 0, s.vars.escalation || 0, escCreditsOf(s.vars)),
        { editable: true, unit: "interaction", onchange: "qiSetEscalationPct(" + i + ", this.value)" });
    }
    return '<div class="qi-detail">' + editedNote +
      "<strong>" + esc(s.sizeInfo.name) + " build (" + s.size + ")</strong> — " + esc(s.sizeInfo.desc) +
      (sizeWhy ? '<div class="hint"><strong>Why ' + s.size + ":</strong> " + sizeWhy + "</div>" : "") +
      "<div><strong>What it does</strong><ul>" + caps + "</ul></div>" +
      (mix ? mix : (costs ? "<div><strong>Cost drivers</strong> (" + fmtDec(s.perUnit) + " credits / " + unit + ")<ul>" + costs + "</ul></div>" : "")) +
      escBlock +
      '<div class="hint">≈ ' + fmt(s.range.low) + "–" + fmt(s.range.high) + " credits / mo · " + money(s.cost.payg) + " PAYG · " + money(s.cost.prepaid) + " prepaid.</div>" +
      (warns ? "<div><strong>Needs attention</strong><ul>" + warns + "</ul></div>" : "") +
      '<div class="qi-open"><button type="button" class="em-btn" onclick="qiRowToDetailed(' + i + ')">' + (s.edited ? "Edit again in Detailed estimator" : "Open in Detailed estimator") + ' &rarr;</button></div>' +
      "</div>";
  }
  function qiRowHtml(s, i) {
    var warn = !!(s.warnings && s.warnings.length);
    var typeLabel = s.vars.archetype === "autonomous"
      ? "Autonomous" : (s.vars.channel === "voice" ? "Interactive · voice" : "Interactive");
    var badge = '<span class="qi-size" style="background:' + sizeColor(s.size) + '">' + s.size + "</span>";
    var flag = warn ? '<span class="qi-flag" title="Needs attention">&#9888;</span>' : "";
    return '<tr class="qi-main' + (warn ? " qi-warn-row" : "") + '">' +
      '<td><button type="button" class="qi-name-btn" onclick="qiToggleDetail(' + i + ')">' + esc(s.name) + "</button>" + flag + "</td>" +
      "<td>" + esc(typeLabel) + "</td><td>" + badge + "</td>" +
      '<td class="qi-num">' + qiVolume(s) + "</td>" +
      '<td class="qi-num">' + fmt(s.estimate.monthly) + "</td>" +
      '<td class="qi-num">' + money(s.cost.payg) + "</td></tr>" +
      '<tr class="qi-detail-row" id="qi-detail-' + i + '" style="display:' + (qiExpanded(i) ? "" : "none") + '"><td class="qi-detail-cell" colspan="6">' +
      qiRowDetailHtml(s, i) + "</td></tr>";
  }

  function qiRender(res, srcName, expanded) {
    var el = document.getElementById("qi-results");
    if (!el) return;
    state.qi = { scenarios: res.scenarios, totals: res.totals, src: srcName, expanded: expanded || {} };
    if (!res.scenarios.length) {
      var hw = (res.headerWarnings && res.headerWarnings.length) ? " " + res.headerWarnings.join(" ") : "";
      el.innerHTML = '<p class="hint">No scenarios found in <strong>' + esc(srcName || "the file") +
        "</strong>. Fill in at least one row on the <strong>Scenarios</strong> sheet (copy a row from <strong>Examples</strong> to start)." + esc(hw) + "</p>";
      el.classList.remove("em-hidden");
      return;
    }
    var t = res.totals;
    var cards =
      qiCard(fmt(t.monthly), "Credits / month", "\u2248 " + fmt(t.range.low) + "\u2013" + fmt(t.range.high) + " range") +
      qiCard(money(t.payg), "PAYG $ / month", "or " + money(t.prepaid) + " prepaid") +
      qiCard(t.count, "Scenarios", t.interactive + " interactive \u00b7 " + t.autonomous + " autonomous") +
      qiCard(money(t.payg * 12), "PAYG $ / year", fmt(t.monthly * 12) + " credits / yr");
    var sizesBar = EC.SIZE_ORDER.map(function (sz) {
      return t.sizes[sz] ? '<span class="qi-flag" style="color:' + sizeColor(sz) + '">' + t.sizes[sz] + "\u00d7 " + sz + "</span>" : "";
    }).filter(Boolean).join(" ");
    var rows = res.scenarios.map(qiRowHtml).join("");
    el.innerHTML =
      '<div class="section-label">Portfolio estimate</div>' +
      '<div class="qi-cards">' + cards + "</div>" +
      exportBarHtml("import", { csv: true }) +
      (sizesBar ? '<p class="hint">Size mix: ' + sizesBar +
        (t.flagged ? ' \u00b7 <span class="qi-warn">' + t.flagged + " scenario(s) need attention</span>" : "") + "</p>" : "") +
      '<table class="qi-table"><thead><tr><th>Scenario</th><th>Type</th><th>Size</th>' +
      '<th class="qi-num">Volume</th><th class="qi-num">Credits/mo</th><th class="qi-num">$/mo</th></tr></thead><tbody>' +
      rows + "</tbody></table>" +
      '<p class="hint">Click a scenario name for its build read-out and cost drivers, or open it in the Detailed estimator to fine-tune. $ shown is pay-as-you-go; prepaid is ~20% less.</p>';
    el.classList.remove("em-hidden");
  }

  function qiAnalyzeMatrix(matrix, srcName) {
    var res = EC.analyzeImport(matrix);
    qiRender(res, srcName);
    scrollToResults("qi-results");
    var n = res.scenarios.length;
    qiStatus("Analyzed " + (srcName || "file") + " — " + n + " scenario" + (n === 1 ? "" : "s") +
      (res.totals.flagged ? " (" + res.totals.flagged + " need attention)" : "") + ".");
    return res;
  }

  // ── BULK GENERATE ──────────────────────────────────────────────────────────
  // Surfaces the decoupled batch engine (estimator-batch.js / EstimatorBatch):
  // paste one description per line (or a header table), get one importable
  // Copilot Studio starter .zip per scenario + a portfolio roll-up. The credit
  // roll-up is injected via bulkEstimateFn so the engine stays pure; the estimate
  // reuses the SAME Quick pipeline (analyzeText → computeQuick / sizeFromDrivers),
  // so a bulk row reads identically to running that text through Quick mode.
  var BULK_EXAMPLES = {
    support:
      "An HR assistant that answers benefits questions from our SharePoint policy library for employees in Teams.\n" +
      "A customer support agent that answers from our knowledge base and creates a ServiceNow incident for each issue it can't resolve, then notifies the on-call team.\n" +
      "An IT helpdesk agent that looks up the status of a ServiceNow incident and updates it, and summarizes a user's recent Teams messages.",
    ops:
      "Whenever a new invoice arrives in the shared mailbox, extract the fields from the document and create a record in Dynamics 365.\n" +
      "A procurement agent that drafts purchase requests and runs a Power Automate approval workflow before submitting them.\n" +
      "A sales enablement agent that summarizes product docs from our SharePoint library and drafts proposals for sellers."
  };

  function bulkStatus(msg, err) {
    var st = document.getElementById("bulk-status");
    if (st) { st.className = "sp-status" + (err ? " sp-error" : ""); st.textContent = msg || ""; }
  }

  // estimateInput (from estimator-batch.js) -> { creditsPerRun, buildEffort, ... }.
  // Directional + consistent with Quick: infers volume/actions/knowledge straight
  // from the description. Fails soft (blank cells) so one bad row never breaks the
  // whole portfolio render.
  function bulkEstimateFn(inp) {
    try {
      var desc = (inp && inp.description) || "";
      if (!desc || !EC.analyzeText) return { creditsPerRun: "", buildEffort: "", monthly: 0 };
      var a = EC.analyzeText(desc);
      var v = a && a.vars ? clone(a.vars) : {};
      var profile = (a && a.profile && a.profile.length) ? a.profile.map(clone) : EC.deriveQuick(v);
      var est = EC.computeQuick(profile, v);
      var sizing = EC.sizeFromDrivers(v);
      return {
        creditsPerRun: est && est.perUnit != null ? Math.round(est.perUnit * 100) / 100 : "",
        monthly: est && est.monthly != null ? est.monthly : 0,
        regime: est && est.regime ? est.regime : "interactive",
        buildEffort: sizing && sizing.size ? sizing.size : "",
        size: sizing && sizing.size ? sizing.size : ""
      };
    } catch (e) { return { creditsPerRun: "", buildEffort: "", monthly: 0 }; }
  }

  function bulkAnalyze() {
    if (!EB || !EP) { bulkStatus("The bulk generator isn't loaded — try refreshing the page.", true); return; }
    var txt = getVal("bulk-input");
    var rows;
    try { rows = EB.parseRows(txt); }
    catch (e) { bulkStatus("Couldn't read that list: " + (e && e.message ? e.message : e), true); return; }
    if (!rows.length) {
      bulkStatus("Add at least one agent description (one per line) first.", true);
      var empty = document.getElementById("bulk-results");
      if (empty) empty.classList.add("em-hidden");
      return;
    }
    var analysis;
    try { analysis = EB.analyzeBatch(rows, { experience: "new", estimate: bulkEstimateFn }); }
    catch (e2) { bulkStatus("Analysis failed: " + (e2 && e2.message ? e2.message : e2), true); return; }
    state.bulk = { rows: rows, analysis: analysis, experience: "new", built: null };
    bulkRender(analysis);
    scrollToResults("bulk-results");
    bulkStatus("Analyzed " + analysis.length + " agent" + (analysis.length === 1 ? "" : "s") + " — download all, or grab any single starter below.");
  }

  function bulkTotals(analysis) {
    var monthly = 0, priced = 0;
    analysis.forEach(function (a) {
      if (a.estimate && typeof a.estimate.monthly === "number") { monthly += a.estimate.monthly; priced++; }
    });
    return { monthly: monthly, priced: priced };
  }

  function bulkRender(analysis) {
    var el = document.getElementById("bulk-results");
    if (!el) return;
    var t = bulkTotals(analysis);
    var cost = EC.costUSD(t.monthly);
    var rows = analysis.map(function (a, i) {
      var cr = a.estimate && a.estimate.creditsPerRun !== "" && a.estimate.creditsPerRun != null ? fmtDec(a.estimate.creditsPerRun) : "—";
      var mo = a.estimate && typeof a.estimate.monthly === "number" ? fmt(a.estimate.monthly) : "—";
      var sz = a.estimate && a.estimate.buildEffort ? a.estimate.buildEffort : "—";
      var flags = [];
      if (a.unmapped && a.unmapped.length) flags.push('<span class="bulk-badge" title="Systems mentioned but not auto-wired — see NEXT-STEPS.md">' + a.unmapped.length + " to wire</span>");
      if (a.tenantGraph) flags.push('<span class="bulk-badge" title="Uses Microsoft 365 tenant graph grounding">tenant graph</span>');
      return '<tr>' +
        '<td class="num">' + a.index + '</td>' +
        '<td>' + esc(a.name || "Agent " + a.index) + (flags.length ? ' ' + flags.join(" ") : "") + '</td>' +
        '<td>' + esc(a.experience === "new" ? "New" : "Classic") + '</td>' +
        '<td>' + esc(a.archetype || "interactive") + '</td>' +
        '<td class="num">' + (a.connectors ? a.connectors.length : 0) + '</td>' +
        '<td class="num">' + (a.knowledge ? a.knowledge.length : 0) + '</td>' +
        '<td class="num">' + sz + '</td>' +
        '<td class="num">' + cr + '</td>' +
        '<td class="num">' + mo + '</td>' +
        '<td><button type="button" class="bulk-dl" onclick="bulkDownloadOne(' + i + ')">&darr; .zip</button></td>' +
        '</tr>';
    }).join("");
    var priceNote = t.priced < analysis.length
      ? ' <span class="hint">(' + (analysis.length - t.priced) + ' not priced)</span>' : "";
    el.innerHTML =
      '<div class="bulk-summary">' +
        '<span><span class="big">' + analysis.length + '</span> agent' + (analysis.length === 1 ? "" : "s") + '</span>' +
        '<span><span class="big">' + fmt(t.monthly) + '</span> credits / mo (portfolio)' + priceNote + '</span>' +
        '<span><span class="big">' + money(cost.payg) + '</span> / mo PAYG &middot; ' + money(cost.prepaid) + ' prepaid</span>' +
      '</div>' +
      '<div class="bulk-actions">' +
        '<button type="button" class="em-btn" onclick="bulkDownloadAll()">&darr; Download all agents (.zip)</button>' +
        '<button type="button" class="em-chip" onclick="bulkDownloadCsv()">Download roll-up (.csv)</button>' +
      '</div>' +
      '<div style="overflow-x:auto">' +
      '<table class="bulk-table"><thead><tr>' +
        '<th class="num">#</th><th>Agent</th><th>Experience</th><th>Type</th>' +
        '<th class="num">Tools*</th><th class="num">Knowledge</th><th class="num">Size</th>' +
        '<th class="num">Cr / run</th><th class="num">Cr / mo</th><th>Starter</th>' +
      '</tr></thead><tbody>' + rows + '</tbody>' +
      '<tfoot><tr><td colspan="8">Portfolio credits / month</td><td class="num">' + fmt(t.monthly) + '</td><td></td></tr></tfoot>' +
      '</table></div>' +
      '<p class="hint">*Tools/connectors your description implied. In the new experience these are added as Tools in Copilot Studio after import — each package\'s NEXT-STEPS.md lists them. Sizes and credits are directional starting points (same engine as Quick), not a real LLM analysis. These are starter agents to extend, not production-ready.</p>';
    el.classList.remove("em-hidden");
  }

  function ensureBulkBuilt() {
    if (!state.bulk) return null;
    if (!state.bulk.built) {
      state.bulk.built = EB.buildBatch(state.bulk.rows, { experience: state.bulk.experience, estimate: bulkEstimateFn });
    }
    return state.bulk.built;
  }

  function bulkDownloadAll() {
    if (!state.bulk) { bulkStatus("Analyze a list first, then download.", true); return; }
    try {
      var b = ensureBulkBuilt();
      var ok = downloadBlob(b.bytes, b.filename, "application/zip");
      if (ok) bulkStatus("Downloaded " + b.count + " starter agent" + (b.count === 1 ? "" : "s") + " (" + b.filename + ").");
    } catch (e) { bulkStatus("Couldn't build the bundle: " + (e && e.message ? e.message : e), true); }
  }

  function bulkDownloadCsv() {
    if (!state.bulk) { bulkStatus("Analyze a list first, then download.", true); return; }
    try {
      var b = ensureBulkBuilt();
      var ok = downloadBlob(b.csv, "agent-studio-portfolio-estimate.csv", "text/csv");
      if (ok) bulkStatus("Downloaded the portfolio roll-up (.csv).");
    } catch (e) { bulkStatus("Couldn't build the roll-up: " + (e && e.message ? e.message : e), true); }
  }

  function bulkDownloadOne(i) {
    if (!state.bulk || !state.bulk.rows[i]) { bulkStatus("That agent isn't available — re-analyze the list.", true); return; }
    try {
      var pkg = EP.buildPackage(EB.toOpts(state.bulk.rows[i], { experience: state.bulk.experience }));
      var ok = downloadBlob(pkg.bytes, pkg.filename, "application/zip");
      if (ok) bulkStatus("Downloaded " + (pkg.name || "agent") + " (" + pkg.filename + ").");
    } catch (e) { bulkStatus("Couldn't build that agent: " + (e && e.message ? e.message : e), true); }
  }

  function bulkExample(which) {
    var v = BULK_EXAMPLES[which] || BULK_EXAMPLES.support;
    setVal("bulk-input", v);
    bulkAnalyze();
  }

  function qiToggleDetail(i) {
    var r = document.getElementById("qi-detail-" + i);
    if (!r) return;
    var show = r.style.display === "none";
    r.style.display = show ? "" : "none";
    if (state.qi) { if (!state.qi.expanded) state.qi.expanded = {}; state.qi.expanded[i] = show; }
  }
  // Phase B: edit a scenario's escalation buffer inline (no need to open Detailed).
  // Recomputes via the SAME engine analyzeScenarioRow used (computeQuick), marks the
  // row edited, keeps it expanded, and re-renders so portfolio totals stay in sync.
  function qiSetEscalationPct(i, pct) {
    var st = state.qi; if (!st || !st.scenarios[i]) return;
    var sc = st.scenarios[i];
    if (sc.vars.archetype === "autonomous") return;
    var e = Math.min(100, Math.max(0, parseFloat(pct) || 0));
    sc.vars = clone(sc.vars);
    sc.vars.escalation = e;
    if (e > 0) {
      sc.vars.hasEscalation = true;
      if (!(sc.vars.escalationCredits > 0)) sc.vars.escalationCredits = ESC_DEFAULT_CREDITS;
    }
    var est = EC.computeQuick(sc.profile, sc.vars);
    sc.estimate = est; sc.perUnit = est.perUnit;
    sc.range = EC.creditRange(est.monthly); sc.cost = EC.costUSD(est.monthly);
    sc.edited = true;
    if (!st.expanded) st.expanded = {}; st.expanded[i] = true;
    qiRerender();
  }
  function qiRowToDetailed(i) {
    var st = state.qi; if (!st || !st.scenarios[i]) return;
    var sc = st.scenarios[i], v = sc.vars;
    var profile = (sc.edited && sc.profile && sc.profile.length) ? sc.profile : EC.deriveQuick(v);
    var scale = v.archetype === "autonomous"
      ? { archetype: "autonomous", events: v.events || 0 }
      : { archetype: "interactive", users: v.users || 0, interactions: v.interactions || 0, deployment: v.deployment || "embedded", licensePct: v.licensePct || 0 };
    state.origin = { kind: "qi", index: i, name: sc.name };
    seedDetailed(profile, scale, v.escalation || 0, sc.edited ? sc.escProfile : null);
    renderOriginBanner();
  }

  // ── Two-way Detailed binding ────────────────────────────────────────────────
  // seedDetailed projects a portfolio scenario INTO the Detailed estimator (one-way).
  // The functions below read it back OUT so tweaks (volume, escalation buffer, the
  // credit mix) return to state.qi — and therefore to the portfolio table, totals,
  // and every export — instead of being lost when the user navigates away.
  function ensureOriginBanner() {
    var b = document.getElementById("det-origin-banner");
    if (b) return b;
    var wrap = document.getElementById("calc-wrap");
    if (!wrap || !wrap.parentNode) return null;
    b = document.createElement("div");
    b.id = "det-origin-banner";
    b.className = "det-origin-banner em-hidden";
    wrap.parentNode.insertBefore(b, wrap);
    return b;
  }
  function renderOriginBanner() {
    var b = ensureOriginBanner(); if (!b) return;
    var o = state.origin;
    if (o && o.kind === "qi") {
      b.innerHTML =
        '<span class="dob-txt">\uD83D\uDCCB Editing <strong>' + esc(o.name || "scenario") +
        "</strong> from your imported portfolio \u2014 tune volume, the escalation buffer, or the credit mix, then save it back.</span>" +
        '<span class="dob-actions">' +
        '<button type="button" class="em-btn" onclick="detSaveToPortfolio()">\uD83D\uDCBE Save to portfolio</button> ' +
        '<button type="button" class="em-btn secondary" onclick="detReturnToPortfolio()">\u2190 Return without saving</button>' +
        "</span>";
      b.classList.remove("em-hidden");
    } else {
      b.innerHTML = "";
      b.classList.add("em-hidden");
    }
  }
  function clearOrigin() { state.origin = null; renderOriginBanner(); }

  // Recompute portfolio totals from the (possibly edited) scenarios. Sums the same
  // per-scenario fields analyzeImport produced, so an untouched portfolio is stable
  // and an edited one reflects exactly the rows shown.
  function qiTotalsFrom(scs) {
    var t = { monthly: 0, range: { low: 0, high: 0 }, payg: 0, prepaid: 0, count: scs.length, interactive: 0, autonomous: 0, sizes: {}, flagged: 0 };
    scs.forEach(function (s) {
      t.monthly += (s.estimate && s.estimate.monthly) || 0;
      t.range.low += (s.range && s.range.low) || 0;
      t.range.high += (s.range && s.range.high) || 0;
      t.payg += (s.cost && s.cost.payg) || 0;
      t.prepaid += (s.cost && s.cost.prepaid) || 0;
      if (s.vars && s.vars.archetype === "autonomous") t.autonomous++; else t.interactive++;
      if (s.size) t.sizes[s.size] = (t.sizes[s.size] || 0) + 1;
      if (s.warnings && s.warnings.length) t.flagged++;
    });
    return t;
  }
  function qiRerender() {
    if (!state.qi || !state.qi.scenarios) return;
    qiRender({ scenarios: state.qi.scenarios, totals: qiTotalsFrom(state.qi.scenarios), headerWarnings: [] }, state.qi.src, state.qi.expanded);
  }

  function detReturnToPortfolio() {
    clearOrigin();
    setEstimatorMode("import");
    scrollToResults("qi-results");
  }
  function detSaveToPortfolio() {
    var o = state.origin; if (!o || o.kind !== "qi") return;
    var st = state.qi; if (!st || !st.scenarios || !st.scenarios[o.index]) return;
    if (typeof window.recalc === "function") window.recalc();
    var sc = st.scenarios[o.index];
    var auto = detIsAutonomous();
    // Prefer the RAW monthly the Detailed engine computed. The res-credits text is
    // compact-formatted (e.g. "6.4K"), which numFromText would misparse as 6.4 — so
    // only fall back to parsing the text if the raw global isn't available.
    var dr = window.__detailedResult;
    var monthly = (dr && isFinite(dr.monthly)) ? dr.monthly : numFromText(txt("res-credits"));
    var rows = detReadRows();
    var normal = rows.filter(function (r) { return r.type !== "escalation"; });
    var escRows = rows.filter(function (r) { return r.type === "escalation"; });
    var escPct = Math.min(100, Math.max(0, parseFloat(getVal("escalationRate")) || 0));

    var v = clone(sc.vars || {});
    v.archetype = auto ? "autonomous" : "interactive";
    v.escalation = escPct;
    if (auto) {
      v.events = Math.max(0, parseFloat(getVal("eventsPerMonth")) || 0);
    } else {
      v.users = Math.max(0, parseFloat(getVal("totalUsers")) || 0);
      v.interactions = Math.max(0, parseFloat(getVal("avgInteractions")) || 0);
      v.licensePct = Math.min(100, Math.max(0, parseFloat(getVal("licensePct")) || 0));
      v.deployment = detIsEmbedded() ? "embedded" : "standalone";
    }
    sc.vars = v;
    sc.profile = normal.map(function (r) { return { name: r.name, uses: r.uses, credits: r.credits }; });
    sc.escProfile = escRows.map(function (r) { return { name: r.name, uses: r.uses, credits: r.credits }; });
    sc.perUnit = normal.reduce(function (a, r) { return a + r.uses * r.credits; }, 0) +
      escRows.reduce(function (a, r) { return a + r.uses * r.credits * escPct / 100; }, 0);
    sc.estimate = sc.estimate || {};
    sc.estimate.monthly = monthly;
    if (EC.creditRange) sc.range = EC.creditRange(monthly);
    if (EC.costUSD) sc.cost = EC.costUSD(monthly);
    sc.edited = true;

    var name = sc.name || "scenario";
    qiRerender();
    clearOrigin();
    setEstimatorMode("import");
    scrollToResults("qi-results");
    qiStatus("Saved changes to \u201C" + name + "\u201D \u2014 portfolio totals and export now reflect your edits.");
  }

  function qiHandleFile(file) {
    if (!file) return;
    if (!EX) { qiStatus("Import isn't loaded — try refreshing the page.", true); return; }
    var isXlsx = /\.xlsx$/i.test(file.name), isCsv = /\.csv$/i.test(file.name);
    if (!isXlsx && !isCsv) { qiStatus("Please choose a .xlsx or .csv file.", true); return; }
    qiStatus("Reading " + file.name + " \u2026");
    var fail = function (err) {
      qiStatus("Could not read this file: " + (err && err.message ? err.message : err), true);
      var r = document.getElementById("qi-results"); if (r) r.classList.add("em-hidden");
    };
    try {
      if (isCsv) {
        file.text().then(function (txt) { qiAnalyzeMatrix(EX.parseCsv(txt), file.name); }).catch(fail);
      } else {
        file.arrayBuffer()
          .then(function (ab) { return EZ.readZip(ab); })
          .then(function (entries) { qiAnalyzeMatrix(EX.parseXlsx(entries).matrix, file.name); })
          .catch(fail);
      }
    } catch (e) { fail(e); }
  }

  function qiSchemaHelpHtml() {
    var rows = EC.IMPORT_SCHEMA.map(function (c) {
      return "<tr><td><strong>" + esc(c.header) + "</strong></td><td>" + esc(c.applies) + "</td><td>" + esc(c.hint || "") + "</td></tr>";
    }).join("");
    return '<table class="qi-table"><thead><tr><th>Column</th><th>Applies</th><th>What to enter</th></tr></thead><tbody>' +
      rows + "</tbody></table>";
  }
  // "Let Copilot fill the sheet" prompt — two variants so the box isn't a wall of text:
  //   simple   (default): short; leans on the prefilled 'Examples' sheet, so the ONLY blank
  //            the user fills is their own agent list. Friendly / non-intimidating.
  //   detailed: same, but inlines every column definition from EC.IMPORT_SCHEMA (drift-proof)
  //            for users who want the model handed the full column spec.
  // Both are copy-paste-ready; the on-page <pre> shows whichever tab is selected, so what you
  // see is exactly what "Copy prompt" copies.
  var qiPromptVariant = "simple";
  var QI_AGENT_SLOT = "My agents (one per line \u2014 for each, say what it does, who uses it, " +
    "how often, the channel, any knowledge it grounds on, and roughly how many system actions it takes):\n1)\n2)";
  function qiPromptSimple() {
    return "You're helping me fill in the 'Scenarios' sheet of this Copilot Credit Estimator workbook. " +
      "Use the prefilled 'Examples' sheet as the pattern and add one row per agent from my list below. " +
      "Infer each column from my descriptions and leave a cell blank if it isn't implied \u2014 don't invent enum or number values.\n\n" +
      QI_AGENT_SLOT;
  }
  function qiPromptDetailed() {
    var schema = (EC && EC.IMPORT_SCHEMA) ? EC.IMPORT_SCHEMA : [];
    var defs = schema.map(function (c) { return "- " + c.header + ": " + (c.hint || ""); }).join("\n");
    return "You're helping me fill in the 'Scenarios' sheet of this Copilot Credit Estimator workbook. " +
      "Use the 'Examples' sheet already in the workbook as the pattern. Create one row per agent from my list below, " +
      "inferring each column from my descriptions; leave a cell blank if it isn't implied \u2014 don't invent enum or number values.\n\n" +
      "Column definitions:\n" + defs + "\n\n" +
      QI_AGENT_SLOT;
  }
  function qiPromptText(variant) {
    return (variant || qiPromptVariant) === "detailed" ? qiPromptDetailed() : qiPromptSimple();
  }
  // Fill the on-page <pre> with the active variant and sync the Simple/Detailed tab states.
  function qiRenderPrompt() {
    var pre = document.getElementById("qi-copilot-prompt");
    if (pre) pre.textContent = qiPromptText(qiPromptVariant);
    ["simple", "detailed"].forEach(function (v) {
      var b = document.getElementById("qi-prompt-tab-" + v);
      if (b) { var on = v === qiPromptVariant; b.classList.toggle("qi-prompt-tab--active", on); b.setAttribute("aria-pressed", on ? "true" : "false"); }
    });
  }
  function qiSetPromptVariant(v) { qiPromptVariant = v === "detailed" ? "detailed" : "simple"; qiRenderPrompt(); }
  function qiCopyPrompt() { copyText(qiPromptText(qiPromptVariant), "qiprompt", "Prompt copied \u2713"); }

  // ── Export / share (Copy summary · Download · Detailed share link) ─────────
  function pageUrl() { return location.origin + location.pathname; }
  function scrollToResults(id) {
    var el = document.getElementById(id);
    if (el && el.scrollIntoView) { try { el.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) { el.scrollIntoView(); } }
  }
  function txt(id) { var e = document.getElementById(id); return e ? (e.textContent || "").trim() : ""; }
  function numFromText(t) { var n = parseFloat(String(t == null ? "" : t).replace(/[^0-9.\-]/g, "")); return isFinite(n) ? n : 0; }
  function depLabel(dep) { return dep === "standalone" ? "Standalone / external channel" : "Microsoft 365 (Teams \u00b7 Copilot Chat \u00b7 SharePoint)"; }
  function isArr(x) { return Object.prototype.toString.call(x) === "[object Array]"; }
  function num0(x) { var n = parseFloat(x); return isFinite(n) ? n : 0; }
  function clamp0100(x, d) { var n = parseFloat(x); if (!isFinite(n)) n = d; return Math.min(100, Math.max(0, n)); }
  function safeCell(s) { return String(s == null ? "" : s).replace(/\r?\n/g, " ").replace(/\|/g, "/").trim() || "(unnamed)"; }
  function mdRow(cells) { return "| " + cells.join(" | ") + " |"; }
  function round2(n) { return Math.round((parseFloat(n) || 0) * 100) / 100; }

  function detIsAutonomous() { var b = document.getElementById("agent-autonomous"); return !!(b && b.classList.contains("active")); }
  function detIsEmbedded() { var b = document.getElementById("toggle-embedded"); return !b || b.classList.contains("active"); }
  function detReadRows() {
    var out = [];
    function grab(sel, isEsc) {
      document.querySelectorAll(sel).forEach(function (tr) {
        var nm = tr.querySelector(".pt-name"); var ins = tr.querySelectorAll(".pt-num");
        if (!nm || ins.length < 2) return;
        out.push({ name: (nm.textContent || "").trim(), uses: parseFloat(ins[0].value) || 0, credits: parseFloat(ins[1].value) || 0, type: isEsc ? "escalation" : "normal" });
      });
    }
    grab("#normal-tbody tr", false);
    grab("#escalation-tbody tr:not(.section-divider-row)", true);
    return out;
  }

  function scenType(s) { return s.vars.archetype === "autonomous" ? "Autonomous" : (s.vars.channel === "voice" ? "Interactive \u00b7 voice" : "Interactive"); }
  function plainVolume(s) { var v = s.vars; return v.archetype === "autonomous" ? (fmt(v.events || 0) + " events/mo") : (fmt((v.users || 0) * (v.interactions || 0)) + " conv/mo"); }

  // Normalized estimate snapshot used by the summary / CSV builders for Quick, Detailed, and Solution-package modes.
  function collectEstimate(mode) {
    if (!EC) return null;
    if (mode === "quick") {
      if (!state.qe) return null;
      var v = state.qe.vars, profile = state.qe.profile || EC.deriveQuick(v), est = EC.computeQuick(profile, v);
      var auto = v.archetype === "autonomous", sizing = EC.sizeFromDrivers(v);
      var scale = auto
        ? [["Agent type", "Autonomous (event-driven)"], ["Runs / month", fmt(est.units)]]
        : [["Agent type", "Interactive (user-led)"], ["Billed users", fmt(est.billed)], ["Interactions / user / month", fmtDec(v.interactions || 0)], ["Deployment", depLabel(v.deployment)], ["% M365 Copilot licensed", (v.licensePct || 0) + "%"]];
      if (v.escalation) scale.push(["Escalation rate", v.escalation + "%"]);
      return { label: "Quick (plain-language)", unit: auto ? "run" : "turn", size: sizing.size, sizeName: (EC.SIZE_INFO[sizing.size] || {}).name || "", scale: scale, profile: profile.map(function (r) { return { name: r.name, uses: r.uses, credits: r.credits, type: "normal" }; }), monthly: est.monthly, metric: auto ? ["Credits / event", fmtDec(est.perUnit)] : ["Credits / user / month", fmtDec((v.interactions || 0) * est.perUnit)] };
    }
    if (mode === "complex") {
      if (!state.sp) return null;
      var st = state.sp, sc = readScale("sp"), autoc = sc.regime === "autonomous", per = EC.perInteractionCredits(st.profile), monthly, metric, lines;
      if (autoc) { monthly = sc.runs * per; lines = [["Agent type", "Autonomous (per-run)"], ["Runs / month", fmt(sc.runs)]]; metric = ["Credits / run", fmtDec(per)]; }
      else { var e2 = EC.computeEstimate(st.profile, sc); monthly = e2.monthly; lines = [["Agent type", "Interactive (per-user)"], ["Billed users", fmt(e2.billed)], ["Interactions / user / month", fmtDec(sc.interactions)], ["Deployment", depLabel(sc.deployment)], ["% M365 Copilot licensed", (sc.licensePct || 0) + "%"]]; metric = ["Credits / user / month", fmtDec(sc.interactions * per)]; }
      return { label: "Solution package (upload)", unit: autoc ? "run" : "interaction", size: st.tshirt || null, sizeName: (st.tshirt && EC.SIZE_INFO[st.tshirt]) ? EC.SIZE_INFO[st.tshirt].name : "", scale: lines, profile: st.profile.map(function (r) { return { name: r.name, uses: r.uses, credits: r.credits, type: "normal" }; }), monthly: monthly, metric: metric };
    }
    if (mode === "detailed") {
      var autod = detIsAutonomous(), monthlyD = numFromText(txt("res-credits")), rows = detReadRows();
      var sc2 = autod
        ? [["Agent type", "Autonomous (event-driven)"], ["Events / month", getVal("eventsPerMonth")]]
        : [["Agent type", "Interactive (user-led)"], ["Total users", getVal("totalUsers")], ["Interactions / user / month", getVal("avgInteractions")], ["Deployment", detIsEmbedded() ? depLabel("embedded") : depLabel("standalone")], ["% M365 Copilot licensed", getVal("licensePct") + "%"], ["Billed users", txt("res-licensed")]];
      var er = parseFloat(getVal("escalationRate")) || 0;
      if (er) sc2.push(["Escalation rate", er + "%"]);
      return { label: "Detailed (manual profile)", unit: autod ? "event" : "interaction", size: null, sizeName: "", scale: sc2, profile: rows, monthly: monthlyD, metric: [txt("lbl-per-user") || "Credits / user / month", txt("res-per-user")] };
    }
    return null;
  }

  function buildSummaryText(mode) {
    if (mode === "import") return buildPortfolioSummary();
    var d = collectEstimate(mode);
    if (!d) return null;
    var rng = EC.creditRange(d.monthly), cost = EC.costUSD(d.monthly), L = [];
    L.push("# Copilot Credit Estimate \u2014 " + d.label, "");
    if (d.size) L.push("**T-shirt size:** " + d.size + (d.sizeName ? " (" + d.sizeName + " build)" : ""), "");
    L.push("## Volume & assumptions");
    d.scale.forEach(function (kv) { L.push("- " + kv[0] + ": " + kv[1]); });
    L.push("", "## Per-" + d.unit + " credit profile", mdRow(["Feature", "Uses / " + d.unit, "Credits / use", "Credits"]), mdRow(["---", "--:", "--:", "--:"]));
    d.profile.forEach(function (r) { L.push(mdRow([(r.type === "escalation" ? "\u21b3 " : "") + safeCell(r.name), fmtDec(r.uses), fmtDec(r.credits), fmtDec(r.uses * r.credits)])); });
    L.push("", "## Monthly estimate", "- **Credits / month:** " + fmt(d.monthly));
    if (d.metric && d.metric[1] && d.metric[1] !== "\u2014") L.push("- **" + d.metric[0] + ":** " + d.metric[1]);
    L.push("- **Credit range (directional band, ~0.6\u00d7\u20131.6\u00d7 the midpoint \u2014 not a hard min/max):** " + fmt(rng.low) + " \u2013 " + fmt(rng.high) + " credits / month");
    L.push("- **Cost / month:** " + money(cost.payg) + " pay-as-you-go ($0.01/credit) \u00b7 " + money(cost.prepaid) + " prepaid ($0.008/credit)", "");
    L.push("_Directional estimate from the Copilot Credit Estimator \u2014 " + pageUrl() + "_");
    return L.join("\n");
  }

  function buildPortfolioSummary() {
    if (!state.qi || !state.qi.scenarios || !state.qi.scenarios.length) return null;
    var t = state.qi.totals || {}, L = [];
    L.push("# Copilot Credit Estimate \u2014 Portfolio (Quick + Import)", "", "## Portfolio totals");
    if (t.count != null) L.push("- Scenarios: " + t.count + " (" + (t.interactive || 0) + " interactive \u00b7 " + (t.autonomous || 0) + " autonomous)");
    if (t.monthly != null) L.push("- Credits / month: " + fmt(t.monthly) + (t.range ? " (range " + fmt(t.range.low) + " \u2013 " + fmt(t.range.high) + ")" : ""));
    if (t.payg != null) L.push("- Cost / month: " + money(t.payg) + " pay-as-you-go \u00b7 " + money(t.prepaid) + " prepaid");
    var mix = t.sizes ? EC.SIZE_ORDER.filter(function (s) { return t.sizes[s]; }).map(function (s) { return t.sizes[s] + "\u00d7 " + s; }).join(", ") : "";
    if (mix) L.push("- Size mix: " + mix);
    L.push("", "## Scenarios", mdRow(["Scenario", "Type", "Size", "Volume / mo", "Credits / mo", "$ / mo (PAYG)"]), mdRow(["---", "---", "---", "--:", "--:", "--:"]));
    state.qi.scenarios.forEach(function (s) { L.push(mdRow([safeCell(s.name), scenType(s), s.size, plainVolume(s), fmt(s.estimate.monthly), money(s.cost.payg)])); });
    L.push("", "_Directional estimate from the Copilot Credit Estimator \u2014 " + pageUrl() + "_");
    return L.join("\n");
  }

  function buildCsvText(mode) {
    var out = [];
    if (mode === "detailed") {
      var d = collectEstimate("detailed"); if (!d) return null;
      out.push(["Feature", "Type", "Uses per " + d.unit, "Credits per use", "Subtotal credits"]);
      d.profile.forEach(function (r) { out.push([r.name, r.type, r.uses, r.credits, round2(r.uses * r.credits)]); });
    } else if (mode === "import") {
      if (!state.qi || !state.qi.scenarios || !state.qi.scenarios.length) return null;
      out.push(["Scenario", "Type", "Size", "Volume per month", "Credits per month", "PAYG $ / month", "Prepaid $ / month"]);
      state.qi.scenarios.forEach(function (s) { out.push([s.name, scenType(s), s.size, plainVolume(s), Math.round(s.estimate.monthly), round2(s.cost.payg), round2(s.cost.prepaid)]); });
    } else { return null; }
    return out.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n");
  }
  function csvCell(v) { var s = String(v == null ? "" : v); return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }

  function flashStatus(mode, msg) {
    var el = document.getElementById("em-export-status-" + mode);
    if (!el) return;
    el.textContent = msg;
    if (el._t) clearTimeout(el._t);
    el._t = setTimeout(function () { el.textContent = ""; }, 2600);
  }
  function copyText(text, mode, okMsg) {
    function fallback() {
      try {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "absolute"; ta.style.left = "-9999px";
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand && document.execCommand("copy");
        document.body.removeChild(ta);
        flashStatus(mode, ok ? (okMsg || "Copied \u2713") : "Copy failed \u2014 select the text and copy manually.");
      } catch (e) { flashStatus(mode, "Copy failed \u2014 select the text and copy manually."); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { flashStatus(mode, okMsg || "Copied \u2713"); }, fallback);
    } else { fallback(); }
  }
  function emCopySummary(mode) {
    var s = buildSummaryText(mode);
    if (s == null) { flashStatus(mode, "Generate an estimate first."); return; }
    copyText(s, mode, "Summary copied \u2713");
  }
  function emDownloadSummary(mode) {
    var s = buildSummaryText(mode);
    if (s == null) { flashStatus(mode, "Generate an estimate first."); return; }
    var ok = downloadBlob(s, "copilot-credit-estimate-" + mode + ".md", "text/markdown;charset=utf-8");
    flashStatus(mode, ok ? "Downloaded .md \u2713" : "Download not supported in this browser.");
  }
  function emDownloadCsv(mode) {
    var c = buildCsvText(mode);
    if (c == null) { flashStatus(mode, "No line items to export yet."); return; }
    var ok = downloadBlob("\uFEFF" + c, "copilot-credit-estimate-" + mode + ".csv", "text/csv;charset=utf-8");
    flashStatus(mode, ok ? "Downloaded .csv \u2713" : "Download not supported in this browser.");
  }
  function exportBarHtml(mode, opts) {
    opts = opts || {};
    var b = '<div class="em-export" role="group" aria-label="Export or share this estimate">';
    b += '<button type="button" class="em-btn secondary em-export-btn" onclick="emCopySummary(\'' + mode + '\')" aria-label="Copy a plain-text summary of this estimate to the clipboard">Copy summary</button>';
    b += '<button type="button" class="em-btn secondary em-export-btn" onclick="emDownloadSummary(\'' + mode + '\')" aria-label="Download this estimate as a Markdown file">Download .md</button>';
    if (opts.csv) b += '<button type="button" class="em-btn secondary em-export-btn" onclick="emDownloadCsv(\'' + mode + '\')" aria-label="Download the line items as a CSV file">Download .csv</button>';
    if (opts.link) b += '<button type="button" class="em-btn secondary em-export-btn" onclick="emCopyLink()" aria-label="Copy a shareable link that reproduces this estimate">Copy link</button>';
    b += '<span class="em-export-status" id="em-export-status-' + mode + '" role="status" aria-live="polite"></span>';
    return b + "</div>";
  }

  // Detailed share link — compact base64url(JSON) of the Detailed inputs in the URL hash (#d=...).
  // payload: { v:1, at:'i'|'a', dep:'e'|'s', u,i,ev,lp,er (numbers), r:[[name,uses,credits,esc0/1],...] }
  function b64urlEncode(str) { return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
  function b64urlDecode(s) { s = String(s).replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return decodeURIComponent(escape(atob(s))); }
  function detCollectPayload() {
    var auto = detIsAutonomous();
    return { v: 1, at: auto ? "a" : "i", dep: detIsEmbedded() ? "e" : "s", u: num0(getVal("totalUsers")), i: num0(getVal("avgInteractions")), ev: num0(getVal("eventsPerMonth")), lp: num0(getVal("licensePct")), er: num0(getVal("escalationRate")), r: detReadRows().map(function (r) { return [r.name, r.uses, r.credits, r.type === "escalation" ? 1 : 0]; }) };
  }
  function emCopyLink() {
    var json; try { json = JSON.stringify(detCollectPayload()); } catch (e) { flashStatus("detailed", "Could not build a link."); return; }
    var hash = "#d=" + b64urlEncode(json);
    try { if (window.history && history.replaceState) history.replaceState(null, "", location.pathname + location.search + hash); else location.hash = hash; } catch (e2) { location.hash = hash; }
    copyText(pageUrl() + hash, "detailed", "Link copied \u2713");
  }
  function clearDetailRows() {
    document.querySelectorAll("#normal-tbody tr").forEach(function (tr) { tr.remove(); });
    document.querySelectorAll("#escalation-tbody tr:not(.section-divider-row)").forEach(function (tr) { tr.remove(); });
  }
  function rehydrateDetailedFromHash() {
    var m = /(?:^#|[#&])d=([^&]+)/.exec(location.hash || "");
    if (!m) return false;
    var data; try { data = JSON.parse(b64urlDecode(m[1])); } catch (e) { return false; }
    if (!data || data.v !== 1 || !isArr(data.r)) return false;
    try {
      setEstimatorMode("detailed");
      if (typeof window.setDetailedAgentType === "function") window.setDetailedAgentType(data.at === "a" ? "autonomous" : "interactive");
      setVal("totalUsers", num0(data.u)); setVal("avgInteractions", num0(data.i)); setVal("eventsPerMonth", num0(data.ev));
      setVal("licensePct", clamp0100(data.lp, 0)); setVal("licensePctSlider", clamp0100(data.lp, 0));
      setVal("escalationRate", clamp0100(data.er, 0)); setVal("escalationRateSlider", clamp0100(data.er, 0));
      if (data.at !== "a" && typeof window.setDeployMode === "function") window.setDeployMode(data.dep === "s" ? "standalone" : "embedded");
      clearDetailRows();
      data.r.forEach(function (row) { if (isArr(row) && typeof window.addRow === "function") window.addRow(String(row[0] || ""), num0(row[1]), num0(row[2]), row[3] === 1 || row[3] === true); });
      if (typeof window.recalc === "function") window.recalc();
      return true;
    } catch (e3) { return false; }
  }

  // ── init (only on the estimator page) ─────────────────────────────────────
  function init() {
    var sel = document.getElementById("mode-select");
    if (!sel) return;
    EC = window.EstimatorCore;
    EZ = window.EstimatorZip;
    EX = window.EstimatorXlsx || null;
    EP = window.EstimatorPackage || null;
    EB = window.EstimatorBatch || null;
    if (!EC || !EZ) return;

    window.setEstimatorMode = setEstimatorMode;
    window.qeAnalyze = qeAnalyze;
    window.qeExample = qeExample;
    window.qeRecompute = qeRecompute;
    window.qeRebuild = qeRebuild;
    window.qeToDetailed = qeToDetailed;
    window.qeSendToRoi = qeSendToRoi;
    window.qeSaveToWorkspace = qeSaveToWorkspace;
    window.qePick = qePick;
    window.qeSetNum = qeSetNum;
    window.qeSetEscalationPct = qeSetEscalationPct;
    window.qeNext = qeNext;
    window.qeBack = qeBack;
    window.qeSkip = qeSkip;
    window.qeEdit = qeEdit;
    window.qeAdvanced = qeAdvanced;
    window.qeStartOver = qeStartOver;
    window.qeDownloadPackage = qeDownloadPackage;
    window.qeConfirmDownload = qeConfirmDownload;
    window.qeCancelReview = qeCancelReview;
    window.qePkgExperienceChange = qePkgExperienceChange;
    window.qePkgWorkIQChange = qePkgWorkIQChange;
  window.qePkgSkillsChange = qePkgSkillsChange;
    window.qePkgOpts = qePkgOpts;
    window.spRecompute = spRecompute;
    window.spSetEscalationPct = spSetEscalationPct;
    window.spSetToolPath = spSetToolPath;
    window.spToDetailed = spToDetailed;
    window.emSetDeploy = emSetDeploy;
    window.qiDownloadTemplate = qiDownloadTemplate;
    window.qiDownloadCsv = qiDownloadCsv;
    window.qiCopyPrompt = qiCopyPrompt;
    window.qiSetPromptVariant = qiSetPromptVariant;
    window.qiPromptText = qiPromptText;
    window.qiToggleDetail = qiToggleDetail;
    window.qiSetEscalationPct = qiSetEscalationPct;
    window.qiRowToDetailed = qiRowToDetailed;
    window.detSaveToPortfolio = detSaveToPortfolio;
    window.detReturnToPortfolio = detReturnToPortfolio;
    window.qiAnalyzeMatrix = qiAnalyzeMatrix;
    window.bulkAnalyze = bulkAnalyze;
    window.bulkExample = bulkExample;
    window.bulkDownloadAll = bulkDownloadAll;
    window.bulkDownloadCsv = bulkDownloadCsv;
    window.bulkDownloadOne = bulkDownloadOne;

    var fileInput = document.getElementById("sp-file");
    if (fileInput && !fileInput.dataset.bound) {
      fileInput.dataset.bound = "1";
      fileInput.addEventListener("change", function () { spHandleFile(this.files && this.files[0]); });
    }
    var drop = document.getElementById("sp-drop");
    if (drop && !drop.dataset.bound) {
      drop.dataset.bound = "1";
      ["dragover", "dragenter"].forEach(function (ev) {
        drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("dragover"); });
      });
      ["dragleave", "dragend", "drop"].forEach(function (ev) {
        drop.addEventListener(ev, function () { drop.classList.remove("dragover"); });
      });
      drop.addEventListener("drop", function (e) {
        e.preventDefault();
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        spHandleFile(f);
      });
    }

    var qiFile = document.getElementById("qi-file");
    if (qiFile && !qiFile.dataset.bound) {
      qiFile.dataset.bound = "1";
      qiFile.addEventListener("change", function () { qiHandleFile(this.files && this.files[0]); });
    }
    var qiDrop = document.getElementById("qi-drop");
    if (qiDrop && !qiDrop.dataset.bound) {
      qiDrop.dataset.bound = "1";
      ["dragover", "dragenter"].forEach(function (ev) {
        qiDrop.addEventListener(ev, function (e) { e.preventDefault(); qiDrop.classList.add("dragover"); });
      });
      ["dragleave", "dragend", "drop"].forEach(function (ev) {
        qiDrop.addEventListener(ev, function () { qiDrop.classList.remove("dragover"); });
      });
      qiDrop.addEventListener("drop", function (e) {
        e.preventDefault();
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        qiHandleFile(f);
      });
    }
    var qiHelp = document.getElementById("qi-schema-help");
    if (qiHelp && !qiHelp.dataset.filled) { qiHelp.dataset.filled = "1"; qiHelp.innerHTML = qiSchemaHelpHtml(); }
    var qiPromptEl = document.getElementById("qi-copilot-prompt");
    if (qiPromptEl && !qiPromptEl.dataset.filled) { qiPromptEl.dataset.filled = "1"; qiRenderPrompt(); }

    // Additive: report which estimator mode users actually pick (cookieless, no
    // PII). Delegated on the card group so it only fires on a real user click.
    var modeCards = document.querySelector(".mode-cards");
    if (modeCards && !modeCards.dataset.gcBound) {
      modeCards.dataset.gcBound = "1";
      modeCards.addEventListener("click", function (e) {
        var card = e.target.closest(".mode-card[data-mode]");
        if (card) trackEstimatorMode(card.getAttribute("data-mode"));
      });
    }

    // Secret "flight" dot: reveals the hidden Bulk generate mode for demos.
    var flightDot = document.getElementById("flight-toggle");
    if (flightDot && !flightDot.dataset.bound) {
      flightDot.dataset.bound = "1";
      flightDot.addEventListener("click", function (e) { e.preventDefault(); toggleBulkFlight(); });
    }
    seedFlightFromUrl();
    applyBulkFlight();

    window.emCopySummary = emCopySummary;
    window.emDownloadSummary = emDownloadSummary;
    window.emDownloadCsv = emDownloadCsv;
    window.emCopyLink = emCopyLink;
    window.toggleBulkFlight = toggleBulkFlight;
    window.applyBulkFlight = applyBulkFlight;
    window.bulkFlighted = bulkFlighted;
    window.seedFlightFromUrl = seedFlightFromUrl;

    var hydrated = false;
    try { hydrated = rehydrateDetailedFromHash(); } catch (e) { hydrated = false; }
    if (!hydrated) setEstimatorMode(sel.value || "quick");
  }

  if (window.document$ && typeof window.document$.subscribe === "function") window.document$.subscribe(init);
  else if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();

/* Copilot Credit Estimator — mode UI wiring.
 * Runs only on the credit-estimator page (guarded by #mode-select). Drives the
 * mode dropdown, the Quick (natural-language) and Solution-package (upload)
 * panels, and the "open in Detailed" feed-forward. Pure analysis/credit logic
 * lives in estimator-core.js (window.EstimatorCore) and estimator-zip.js
 * (window.EstimatorZip); this file is DOM glue + rendering only.
 */
(function () {
  "use strict";

  var EC = null, EZ = null;
  var state = { qe: null, sp: null };

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
    detailed: "Best when you know the building blocks but haven't built yet — set your org scope and dial in exactly which features each conversation uses.",
    complex: "Best when the agent is built — export it as a Power Platform solution (.zip) and upload it for a component-level analysis. Everything is parsed locally in your browser."
  };

  var QE_EXAMPLES = {
    email: "Every time a new email arrives in our shared support inbox, the agent should read it, categorize it by topic and urgency, and route it to the correct SME team. It handles about 100 emails a month.",
    it: "An IT helpdesk agent in Teams that answers common support questions from our knowledge base and can reset passwords and create tickets in ServiceNow. Escalates to a live agent when it can't help. Used weekly by staff.",
    sales: "A sales enablement agent that drafts proposals and summarizes product docs for our sellers, grounded on our SharePoint sales library. Used daily by the sales team.",
    support: "A customer-facing voice agent on our website and phone line that answers product questions and creates support tickets in Salesforce, used constantly by thousands of customers.",
    finance: "Whenever an invoice is submitted, the agent extracts the fields from the scanned document, validates them, and runs a Power Automate approval workflow. About 800 invoices per month for the finance department."
  };

  // ── mode switching ────────────────────────────────────────────────────────
  function setEstimatorMode(mode) {
    var ids = { quick: "panel-quick", detailed: "panel-detailed", complex: "panel-complex" };
    Object.keys(ids).forEach(function (k) {
      var el = document.getElementById(ids[k]);
      if (el) el.classList.toggle("em-hidden", k !== mode);
    });
    var sel = document.getElementById("mode-select");
    if (sel && sel.value !== mode) sel.value = mode;
    setText("mode-desc", MODE_DESC[mode] || "");
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

  function profileTableHtml(p, profile) {
    var rows = profile.map(function (r, i) {
      return '<tr><td>' + esc(r.name) + (r.note ? ' <span class="hint" style="display:block">' + esc(r.note) + '</span>' : "") + '</td>' +
        '<td class="num"><input type="number" min="0" step="0.1" class="' + p + '-use" data-idx="' + i + '" value="' + r.uses + '" oninput="' + p + 'Recompute()"></td>' +
        '<td class="num">' + fmtDec(r.credits) + '</td>' +
        '<td class="num pcredit" id="' + p + '-sub-' + i + '">—</td></tr>';
    }).join("");
    return '<div class="section-label" style="margin-top:1.25rem">Per-interaction credit profile <span style="text-transform:none;font-weight:400">— tune uses / interaction</span></div>' +
      '<table class="em-profile"><thead><tr><th>Feature</th><th class="num">Uses / interaction</th><th class="num">Credits / use</th><th class="num">Credits</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
      '<tfoot><tr><td>Effective credits / interaction</td><td></td><td></td><td class="num pcredit" id="' + p + '-per">—</td></tr></tfoot></table>';
  }

  function estimateHtml(p) {
    return '<div class="section-label" style="margin-top:1.25rem">Estimated monthly consumption</div>' +
      '<div class="results-grid">' +
        '<div class="result-card"><div class="val" id="' + p + '-billed">—</div><div class="lbl">Billed users</div></div>' +
        '<div class="result-card"><div class="val" id="' + p + '-credits">—</div><div class="lbl">Credits / month</div></div>' +
        '<div class="result-card"><div class="val" id="' + p + '-peruser">—</div><div class="lbl">Credits / user / month</div></div>' +
      '</div>' +
      '<div class="em-range" id="' + p + '-range"></div>' +
      '<div class="section-label" style="margin-top:1.25rem">Estimated cost</div>' +
      '<div class="em-cost">' +
        '<div class="card"><div class="v" id="' + p + '-cost-payg">—</div><div class="sub">/ month · pay-as-you-go ($0.01 / credit)</div></div>' +
        '<div class="card"><div class="v" id="' + p + '-cost-pre">—</div><div class="sub">/ month · prepaid pack ($0.008 / credit)</div></div>' +
      '</div>' +
      '<div class="em-range">Credit range is a directional ±40% band around the midpoint. Cost is Copilot credits only — it excludes M365 Copilot license fees.</div>' +
      '<div style="margin-top:1.25rem"><button class="em-btn secondary" type="button" onclick="' + p + 'ToDetailed()">Open this in the Detailed estimator →</button></div>';
  }

  function readScale(p) {
    var std = document.getElementById(p + "-dep-standalone");
    var dep = std && std.classList.contains("active") ? "standalone" : "embedded";
    return {
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
    var lf = document.getElementById(p + "-lic-field");
    if (lf) lf.style.opacity = scale.deployment === "standalone" ? "0.45" : "1";

    var per = 0;
    st.profile.forEach(function (r, i) {
      var sub = r.uses * r.credits;
      per += sub;
      setText(p + "-sub-" + i, fmtDec(sub));
    });
    setText(p + "-per", fmtDec(per));

    var est = EC.computeEstimate(st.profile, scale);
    var rng = EC.creditRange(est.monthly);
    var cost = EC.costUSD(est.monthly);
    setText(p + "-billed", fmt(est.billed));
    setText(p + "-credits", fmt(est.monthly));
    setText(p + "-peruser", fmtDec(scale.interactions * per));
    setText(p + "-range", "Range: " + fmt(rng.low) + " – " + fmt(rng.high) + " credits / month");
    setText(p + "-cost-payg", money(cost.payg));
    setText(p + "-cost-pre", money(cost.prepaid));
  }

  function emSetDeploy(p, mode) {
    var a = document.getElementById(p + "-dep-embedded");
    var b = document.getElementById(p + "-dep-standalone");
    if (a) a.classList.toggle("active", mode === "embedded");
    if (b) b.classList.toggle("active", mode === "standalone");
    recompute(p);
  }

  // ── feed-forward into the Detailed estimator ──────────────────────────────
  function seedDetailed(profile, scale, escalation) {
    setEstimatorMode("detailed");
    setVal("totalUsers", scale.users);
    setVal("avgInteractions", scale.interactions);
    setVal("licensePct", scale.licensePct);
    setVal("licensePctSlider", scale.licensePct);
    setVal("escalationRate", escalation || 0);
    setVal("escalationRateSlider", escalation || 0);
    if (typeof window.setDeployMode === "function") window.setDeployMode(scale.deployment);

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
      "</div>";
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
        ["voice", "📞 Voice / phone", "Telephony or spoken — higher per-turn credits and more setup."]
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
      '<div class="hint">' + fmt(rng.low) + " – " + fmt(rng.high) + " range</div>" +
      '<div class="lbl" style="margin-top:0.7rem">Cost / month</div>' +
      "<div>" + money(cost.payg) + ' <span class="hint">PAYG</span></div>' +
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
      '<div class="em-range">Range: ' + fmt(rng.low) + " – " + fmt(rng.high) + " credits / month (±40%).</div>" +
      '<div class="em-cost">' +
        '<div class="card"><div class="v">' + money(cost.payg) + '</div><div class="sub">/ mo · PAYG ($0.01)</div></div>' +
        '<div class="card"><div class="v">' + money(cost.prepaid) + '</div><div class="sub">/ mo · prepaid ($0.008)</div></div>' +
      "</div>" +
      (drivers.length ? '<div class="em-why"><strong>Why this cost:</strong> ' + drivers.join(" · ") + "</div>" : "") +
      '<p class="hint">Credits only — excludes M365 license fees.' + (v.archetype === "autonomous" ? " Autonomous runs are billed even for licensed users." : "") + "</p>";
  }

  function qeResultsHtml() {
    var v = state.qe.vars;
    var adv = state.qe.view === "advanced";
    var steps = (state.qe.outline.steps || []).map(function (s, i) {
      return "<li><b>" + (i + 1) + ". " + esc(s.label) + "</b><span>" + esc(s.build) + "</span></li>";
    }).join("");
    return '<div id="qe-results-full">' +
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
      '<div class="qe-nav" style="margin-top:1.25rem">' +
        (adv
          ? '<button type="button" class="em-btn secondary" onclick="qeAdvanced()">← Back to guided</button>'
          : '<button type="button" class="em-btn secondary" onclick="qeEdit()">← Edit answers</button>' +
            '<button type="button" class="qe-preset" onclick="qeAdvanced()">Advanced: edit all</button>') +
        '<button type="button" class="qe-preset" onclick="qeStartOver()">Start over</button>' +
        '<span class="spacer"></span>' +
        '<button type="button" class="em-btn" onclick="qeToDetailed()">Open in Detailed estimator →</button>' +
      "</div></div>";
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
      vars: clone(a.vars), why: a.why, outline: a.outline, profile: a.profile.map(clone),
      detectedActions: (a.outline.steps || []).filter(function (s) { return s.category === "action" && s.id !== "escalation"; }).map(function (s) { return s.id; }),
      view: "wizard", step: 0
    };
    qeRender();
  }
  function qeRecompute() { qeRebuild(); }
  function qeToDetailed() {
    var st = state.qe; if (!st) return;
    var v = st.vars;
    var profile = EC.deriveQuick(v);
    var scale = v.archetype === "autonomous"
      ? { users: 1, interactions: v.events || 0, deployment: "standalone", licensePct: 0 }
      : { users: v.users || 0, interactions: v.interactions || 0, deployment: v.deployment || "embedded", licensePct: v.licensePct || 0 };
    seedDetailed(profile, scale, v.escalation || 0);
  }

  // ── Solution package (upload) ─────────────────────────────────────────────
  function componentSummary(f) {
    var k = f.knowledgeTypes.length ? f.knowledgeTypes.join(", ") : "none identified";
    return [
      "Topics (AdaptiveDialog):        " + f.topics,
      "Triggers:                       " + f.triggers,
      "Generative answer nodes:        " + f.genAnswers,
      "Knowledge search nodes:         " + f.knowledgeSearch,
      "Knowledge source components:    " + f.knowledgeComps,
      "Knowledge source types:         " + k,
      "Action nodes (connectors/HTTP): " + f.actionNodes,
      "Flow nodes / workflow files:    " + f.flowNodes + " / " + f.workflowFiles,
      "Connection references:          " + f.connectionRefs,
      "Prompt / AI Builder nodes:      " + f.aiNodes,
      "Computer-use action:            " + (f.computerUse ? "yes" : "no"),
      "Tenant-graph grounding:         " + (f.tenantGraph ? "yes" : "no"),
      "Generative orchestration:       " + (f.genOrch ? "yes" : "no"),
      "Content processing:             " + (f.contentProc ? "yes" : "no"),
      "Voice channel:                  " + (f.voice ? "yes" : "no"),
      "Files scanned:                  " + f.fileCount
    ].join("\n");
  }

  function findCard(v, k, off) {
    return '<div class="em-find' + (off ? " off" : "") + '"><div class="v">' + v + '</div><div class="k">' + k + '</div></div>';
  }

  function spRender(a) {
    state.sp = {
      profile: a.profile.map(clone),
      scale: { users: 500, interactions: 10, deployment: "embedded", licensePct: 60 },
      escalation: 0, tshirt: a.tshirt
    };
    var f = a.findings;
    var grid =
      findCard(f.topics, "Topics", f.topics === 0) +
      findCard(f.genAnswers, "Generative answers", f.genAnswers === 0) +
      findCard(f.knowledgeCount, "Knowledge sources", f.knowledgeCount === 0) +
      findCard(f.actionNodes, "Action nodes", f.actionNodes === 0) +
      findCard(f.flowNodes + f.workflowFiles, "Agent flows", (f.flowNodes + f.workflowFiles) === 0) +
      findCard(f.aiNodes, "Prompt / AI nodes", f.aiNodes === 0) +
      findCard(f.tenantGraph ? "Yes" : "No", "Tenant graph", !f.tenantGraph) +
      findCard(f.voice ? "Yes" : "No", "Voice channel", !f.voice);
    var kt = f.knowledgeTypes.length ? " (" + f.knowledgeTypes.join(", ") + ")" : "";
    var res = document.getElementById("sp-results");
    res.innerHTML =
      '<div class="section-label">What we found in your solution</div>' +
      '<div class="em-findings">' + grid + "</div>" +
      '<p class="hint" style="margin-top:0.5rem">' + f.fileCount + " files scanned · " + f.triggers + " trigger(s) · knowledge" + esc(kt) +
        (f.genOrch ? " · generative orchestration on" : "") + (f.computerUse ? " · computer-use action" : "") + ".</p>" +
      tshirtHtml(a.tshirt) +
      assumptionsHtml("sp", state.sp.scale, {
        users: "The package doesn't reveal volume — set your expected reach.",
        interactions: "How often each user will interact per month.",
        deployment: "Where the agent is published."
      }) +
      profileTableHtml("sp", state.sp.profile) +
      '<p class="hint">Per-interaction <em>uses</em> are assumptions — a solution shows which capabilities <em>exist</em>, not how often each fires per conversation. Tune them to your real flows.</p>' +
      estimateHtml("sp") +
      '<details class="em-details"><summary>Component inventory (full transparency)</summary><div class="em-complist">' + esc(componentSummary(f)) + "</div></details>";
    res.classList.remove("em-hidden");
    recompute("sp");
  }
  function spRecompute() { recompute("sp"); }
  function spToDetailed() { var st = state.sp; if (st) seedDetailed(st.profile, readScale("sp"), st.escalation); }

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

  // ── init (only on the estimator page) ─────────────────────────────────────
  function init() {
    var sel = document.getElementById("mode-select");
    if (!sel) return;
    EC = window.EstimatorCore;
    EZ = window.EstimatorZip;
    if (!EC || !EZ) return;

    window.setEstimatorMode = setEstimatorMode;
    window.qeAnalyze = qeAnalyze;
    window.qeExample = qeExample;
    window.qeRecompute = qeRecompute;
    window.qeRebuild = qeRebuild;
    window.qeToDetailed = qeToDetailed;
    window.qePick = qePick;
    window.qeSetNum = qeSetNum;
    window.qeNext = qeNext;
    window.qeBack = qeBack;
    window.qeSkip = qeSkip;
    window.qeEdit = qeEdit;
    window.qeAdvanced = qeAdvanced;
    window.qeStartOver = qeStartOver;
    window.spRecompute = spRecompute;
    window.spToDetailed = spToDetailed;
    window.emSetDeploy = emSetDeploy;

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

    setEstimatorMode(sel.value || "detailed");
  }

  if (window.document$ && typeof window.document$.subscribe === "function") window.document$.subscribe(init);
  else if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();

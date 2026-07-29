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
  function setVal(id, v) { var e = document.getElementById(id); if (e) e.value = v; }
  function getVal(id) { var e = document.getElementById(id); return e ? e.value : 0; }

  var MODE_DESC = {
    quick: "Best when you're early or unsure — describe the agent in plain words and get a rough size, a Studio build outline, and a credit/cost range. No build knowledge needed.",
    detailed: "Best when you know the building blocks but haven't built yet — set your org scope and dial in exactly which features each conversation uses.",
    complex: "Best when the agent is built — export it as a Power Platform solution (.zip) and upload it for a component-level analysis. Everything is parsed locally in your browser."
  };

  var QE_EXAMPLES = {
    hr: "An internal HR assistant that answers benefits, leave, and policy questions from our SharePoint HR handbook for all employees. If it can't answer, it opens a case in our HR system. Used a few times a month, in Teams.",
    it: "An IT helpdesk agent in Teams that answers common support questions from our knowledge base and can reset passwords and create tickets in ServiceNow. Escalates to a live agent when it can't help. Used weekly by staff.",
    sales: "A sales enablement agent that drafts proposals and summarizes product docs for our sellers, grounded on our SharePoint sales library. Used daily by the sales team.",
    support: "A customer-facing voice agent on our website and phone line that answers product questions and creates support tickets in Salesforce, used constantly by thousands of customers.",
    finance: "A finance agent that extracts fields from scanned invoices and receipts, validates them, and runs a Power Automate approval workflow for the finance department."
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
  function tshirtHtml(t) {
    var i = EC.SIZE_INFO[t];
    return '<div class="em-tshirt em-tshirt-' + t + '"><div class="sz">' + t + '</div>' +
      '<div class="meta"><b>' + esc(i.name) + ' build</b>' +
      '<div>' + esc(i.desc) + '</div>' +
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
  function qeExample(k) {
    var t = document.getElementById("qe-input");
    if (t) { t.value = QE_EXAMPLES[k] || ""; qeAnalyze(); }
  }
  function qeAnalyze() {
    var input = document.getElementById("qe-input");
    var txt = input ? input.value.trim() : "";
    var res = document.getElementById("qe-results");
    if (!res) return;
    if (!txt) {
      res.classList.remove("em-hidden");
      res.innerHTML = '<p class="hint">Type a description above (or pick an example), then press <strong>Analyze</strong>.</p>';
      return;
    }
    var a = EC.analyzeText(txt);
    state.qe = { profile: a.profile.map(clone), scale: a.scale, escalation: a.escalation, tshirt: a.tshirt };
    var buildItems = a.matched.filter(function (c) { return !!c.build; }).map(function (c) {
      return '<li><b>' + esc(c.label) + '</b><span>' + esc(c.build) + '</span></li>';
    }).join("");
    if (a.escalation) {
      buildItems += '<li><b>Escalation path</b><span>~' + a.escalation + '% of interactions hand off to a human — modelled as an escalation rate in the detailed view.</span></li>';
    }
    res.innerHTML =
      tshirtHtml(a.tshirt) +
      '<div class="section-label" style="margin-top:1.25rem">How this would be built in Copilot Studio</div>' +
      '<ul class="em-build-list">' + buildItems + "</ul>" +
      assumptionsHtml("qe", a.scale, a.scaleWhy) +
      profileTableHtml("qe", state.qe.profile) +
      '<p class="hint">These are starting-point features and uses inferred from your words — edit anything that doesn\'t match.</p>' +
      estimateHtml("qe");
    res.classList.remove("em-hidden");
    recompute("qe");
  }
  function qeRecompute() { recompute("qe"); }
  function qeToDetailed() { var st = state.qe; if (st) seedDetailed(st.profile, readScale("qe"), st.escalation); }

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
    window.qeToDetailed = qeToDetailed;
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

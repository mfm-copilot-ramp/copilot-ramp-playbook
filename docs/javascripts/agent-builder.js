/*
 * agent-builder.js — "Describe an agent → build it in Copilot Studio."
 *
 * Creation-first surface (distinct from the estimator's cost framing and from its
 * "Solution package" UPLOAD-to-estimate flow). Reuses the SAME generator the estimator
 * already ships:
 *   EstimatorCore.analyzeText()      → detected vars + build outline
 *   EstimatorPackage.analyzePackage()→ dry-run preview (name, harness, tools, knowledge, notices)
 *   EstimatorPackage.buildInstructions() → the agent's instruction text (editable here)
 *   EstimatorPackage.buildPackage()  → the ready-to-import Studio starter .zip
 *
 * WYSIWYG: the editable instructions textarea is the source of truth and is passed straight
 * into buildPackage() (opts.instructions), so the downloaded .zip matches the preview.
 */
(function () {
  "use strict";
  var EC = (typeof window !== "undefined") && (window.EstimatorCore || window.EC);
  var EP = (typeof window !== "undefined") && window.EstimatorPackage;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function el(id) { return document.getElementById(id); }

  var EXAMPLES = [
    "An HR assistant that answers benefits questions from our SharePoint policy library for employees in Teams.",
    "A support agent that looks up an order's status and creates a ServiceNow ticket for issues it can't resolve, then notifies the on-call team.",
    "An IT helpdesk agent that resets passwords and answers common questions from our knowledge base.",
    "Whenever an invoice arrives in the shared mailbox, extract the fields and create a record in Dynamics 365."
  ];

  // Widget state.
  var S = { desc: "", preview: null, experience: "new", name: "", instructions: "", workIQ: null, skills: "", vars: null, outline: null, systems: null, addConnectors: [], knowledgeSites: {}, built: false };

  // "Meeting brief formatter: turns X into Y" -> {name, description}. Separator = first ":" or
  // em-dash; a bare line is the name only. Blank lines dropped. (Ported from the Quick-mode flow.)
  function parseSkillLines(text) {
    return String(text == null ? "" : text).split(/\r?\n/).map(function (ln) {
      ln = ln.trim();
      if (!ln) return null;
      var m = ln.match(/^([^:\u2014]+?)\s*[:\u2014]\s*(.+)$/);
      if (m) return { name: m[1].trim(), description: m[2].trim() };
      return { name: ln, description: "" };
    }).filter(Boolean);
  }
  // Effective Work IQ state: user override if set, else auto-detect from the description.
  function workIqEffective(vars) {
    if (typeof S.workIQ === "boolean") return S.workIQ;
    try { return !!(EP && EP.wantsWorkIQ && EP.wantsWorkIQ(vars || {}, (S.desc || "").toLowerCase())); }
    catch (e) { return false; }
  }
  function workIqPill(exp) {
    return exp === "new"
      ? '<span class="ab-pill ab-pill--toggle">Post-import toggle</span>'
      : '<span class="ab-pill ab-pill--wired">Wired in</span>';
  }
  function workIqNote(exp) {
    return exp === "new"
      ? 'Grounds on the Microsoft&nbsp;365 tenant graph (people, meetings, mail &amp; files) instead of one-off connectors. <strong>Not pre-wired on the GitHub Copilot harness</strong> \u2014 checking this adds a NEXT-STEPS reminder to switch Work&nbsp;IQ on in the portal (Knowledge &rarr; Work&nbsp;IQ) after import. Bills ~10 credits per response. Want it pre-wired now? Use the <strong>standard harness</strong>.'
      : 'Grounds on the Microsoft&nbsp;365 tenant graph (people, meetings, mail &amp; files). Emitted as <strong>wired-in</strong> Work&nbsp;IQ tools on the standard harness. Bills ~10 credits per response.';
  }
  // Read which detected items the user unchecked (keep=checked), to prune the package.
  function collectExclude() {
    var exclude = { connectors: [], knowledge: [], capabilities: [] };
    var collect = function (sel, key, attr) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (cb) {
        if (!cb.checked) exclude[key].push(cb.getAttribute(attr));
      });
    };
    collect(".ab-keep-conn", "connectors", "data-key");
    collect(".ab-keep-know", "knowledge", "data-id");
    collect(".ab-keep-cap", "capabilities", "data-id");
    return exclude;
  }

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

  // ── Build the generator opts from the current description + edits ──────────
  // The analysis (vars/outline/systems) is computed ONCE per description (or seeded from a
  // faithful Quick-mode handoff) and held in S, so edits — harness, Work IQ, added tools,
  // keep/drop — layer on top of a stable base instead of re-deriving each call.
  function ensureAnalysis() {
    if (!S.vars) {
      var a = EC.analyzeText(S.desc || "");
      S.vars = a.vars || {};
      S.outline = a.outline || null;
      S.systems = (a.outline && a.outline.systems) || [];
    }
  }
  function optsFromState(includeExclude) {
    ensureAnalysis();
    var vars = S.vars || {};
    if (typeof S.workIQ === "boolean") {
      var v2 = {}; for (var k in vars) if (Object.prototype.hasOwnProperty.call(vars, k)) v2[k] = vars[k];
      v2.workIQ = S.workIQ; vars = v2; // don't mutate the stored object
    }
    var opts = {
      description: S.desc || "",
      vars: vars,
      systems: S.systems || [],
      outline: S.outline || null,
      experience: S.experience,
      addConnectors: (S.addConnectors || []).slice(),
      skills: parseSkillLines(S.skills),
      name: (S.name || "").trim() || undefined,
      instructions: (S.instructions || "").trim() || undefined
    };
    if (includeExclude) opts.exclude = collectExclude();
    // Knowledge-source URL overrides only wire into the CLASSIC export (a real SearchSource).
    // The new experience ships a scaffold doc, so we never pass them there — keeps preview honest.
    if (S.experience === "classic") opts.knowledgeSites = S.knowledgeSites || {};
    return opts;
  }

  // Instructions for the CURRENT harness/description. Prefer the canonical string the engine
  // reports on the preview (identical to what buildPackage embeds), so the editor shows exactly
  // what the .zip will carry AND an unedited handoff stays byte-equivalent to the Quick export.
  // Falls back to a direct buildInstructions call for older engines without preview.instructions.
  function freshInstructions(preview) {
    if (preview && typeof preview.instructions === "string" && preview.instructions) return preview.instructions;
    if (!EP || !EP.buildInstructions) return "";
    ensureAnalysis();
    try {
      return EP.buildInstructions(preview.name, S.desc || "", {
        connectors: preview.connectors || [], knowledge: preview.knowledge || [],
        capabilities: preview.capabilities || [], vars: S.vars || {},
        steps: (S.outline && S.outline.steps) || [], experience: S.experience
      }) || "";
    } catch (e) { return ""; }
  }

  // ── Tier 1: shell (describe + examples) ────────────────────────────────────
  function shellHtml() {
    var ex = EXAMPLES.map(function (e, i) { return '<button type="button" class="ab-ex" data-ex="' + i + '">' + esc(e) + "</button>"; }).join("");
    return '<div class="ab-card">' +
      '<div class="ab-scope">Builds a ready-to-import <b>Copilot Studio</b> starter agent from your description \u2014 instructions, tools, knowledge, and the standard system topics. This is the <b>create</b> flow; to size an existing agent\u2019s cost, use the <a href="../credit-estimator/">Credit Estimator</a>.</div>' +
      '<div class="ab-nl">' +
        '<label for="ab-nl-text"><b>Describe the agent you want</b> \u2014 in plain words</label>' +
        '<textarea id="ab-nl-text" rows="3" placeholder="e.g. An HR assistant that answers benefits questions from our SharePoint policies for employees in Teams."></textarea>' +
        '<div class="ab-ex-row"><span class="ab-ex-lbl">Try an example:</span>' + ex + "</div>" +
        '<button type="button" id="ab-go" class="ab-btn">Build agent \u2192</button>' +
      "</div>" +
      '<div id="ab-body"></div>' +
    "</div>";
  }

  // "+ Add a tool" — inject a connector action the NL didn't detect. The description is the
  // basis; this lets the user layer tools on top, the same way instructions are editable.
  function toolPickerHtml() {
    var CA = EP.CONNECTOR_ACTIONS || {};
    var groups = {};
    Object.keys(CA).forEach(function (key) {
      var c = CA[key]; if (!c) return;
      (groups[c.connectorLabel] || (groups[c.connectorLabel] = [])).push({ key: key, name: c.actionName });
    });
    var opts = ['<option value="">+ Add a tool\u2026</option>'];
    Object.keys(groups).sort().forEach(function (label) {
      opts.push('<optgroup label="' + esc(label) + '">');
      groups[label].forEach(function (o) { opts.push('<option value="' + esc(o.key) + '">' + esc(o.name) + "</option>"); });
      opts.push("</optgroup>");
    });
    var added = (S.addConnectors || []).length
      ? '<div class="ab-added-note">Added: ' + S.addConnectors.map(function (k) { return esc((CA[k] && CA[k].actionName) || k); }).join(", ") + ' <button type="button" id="ab-clear-added" class="ab-link">clear</button></div>'
      : "";
    return '<div class="ab-addtool"><select id="ab-addtool-sel" class="ab-addtool-sel">' + opts.join("") + "</select>" +
      '<span class="ab-sub">You don\u2019t need to know tool names \u2014 just describe what the agent should do above and tools are detected for you. Optionally add a specific action here (grouped by system); it binds at import like the rest.</span>' + added + "</div>";
  }

  // ── Tier 2: editable preview ───────────────────────────────────────────────
  function bodyHtml(p) {
    var newExp = S.experience === "new";
    var harnessName = newExp ? "GitHub Copilot harness" : "Standard harness";
    var conns = p.connectors || [];
    var know = p.knowledge || [];
    var caps = p.capabilities || [];
    var unmapped = p.unmapped || [];
    var notices = p.notices || [];
    var a = EC.analyzeText(S.desc || "");
    var wiqOn = workIqEffective(S.vars || a.vars || {});
    var hasPlaceholder = false;

    // Detected items are keep/drop checkboxes (checked = keep) so the user can prune before build.
    var toolItems = conns.length
      ? conns.map(function (c) { return '<li><label><input type="checkbox" class="ab-keep-conn" data-key="' + esc(c.key) + '" checked> <strong>' + esc(c.actionName) + '</strong> <span>\u2014 ' + esc(c.connectorLabel) + '</span></label></li>'; }).join("")
      : '<li class="ab-empty">No connector tools detected \u2014 add them in Studio if needed.</li>';
    var knowItems = know.length
      ? know.map(function (k) {
          if (k.placeholder) hasPlaceholder = true;
          // The URL is only wired into the export on the CLASSIC harness (a real SearchSource
          // component). The new experience ships a scaffold knowledge doc instead, so we don't
          // offer an editable URL there — it would imply a wiring the .zip wouldn't carry.
          var isSite = !newExp && k.kind !== "DataverseSearchSource" && (k.site || k.placeholder);
          var current = (S.knowledgeSites && S.knowledgeSites[k.id]) || (k.placeholder ? "" : (k.site || ""));
          var urlField = isSite
            ? '<input type="url" class="ab-know-url" data-id="' + esc(k.id) + '" value="' + esc(current) + '" placeholder="' + esc(k.site || "https://your-site\u2026") + '">'
            : (k.site ? '<span class="ab-sub">' + esc(k.site) + "</span>" : "");
          var flag = (k.placeholder && (!isSite || !current)) ? ' <span class="ab-flag" data-flag-for="' + esc(k.id) + '">placeholder URL</span>' : "";
          return '<li><label><input type="checkbox" class="ab-keep-know" data-id="' + esc(k.id) + '" checked> <strong>' + esc(k.label) + "</strong>" + flag + "</label>" + urlField + "</li>";
        }).join("")
      : '<li class="ab-empty">No knowledge source detected.</li>';
    var capItems = caps.length
      ? caps.map(function (c) { return '<li><label><input type="checkbox" class="ab-keep-cap" data-id="' + esc(c.id) + '" checked> ' + esc(c.behavior) + ' <span class="ab-sub">tool to add by hand</span></label></li>'; }).join("")
      : "";
    var capsHtml = caps.length
      ? '<div class="ab-col"><div class="ab-col-h">Read capabilities \u2192 NEXT-STEPS (' + caps.length + ")</div><ul class=\"ab-list\">" + capItems + "</ul></div>"
      : "";

    var noticesHtml = notices.length
      ? '<div class="ab-notices"><div class="ab-notices-h">Finish these in Copilot Studio after import</div>' +
          notices.map(function (n) { return '<div class="ab-notice"><strong>' + esc(n.title) + '</strong><div class="ab-sub">' + esc(n.detail) + "</div></div>"; }).join("") + "</div>"
      : "";
    var unmappedHtml = unmapped.length
      ? '<div class="ab-unmapped"><strong>Systems with no starter action:</strong> ' + unmapped.map(esc).join(", ") + ' \u2014 wire these by hand (listed in NEXT-STEPS.md).</div>'
      : "";
    var placeholderHtml = hasPlaceholder
      ? (newExp
          ? '<p class="ab-hint">This harness ships a <strong>starter knowledge doc</strong> so the agent can answer the moment it imports \u2014 open <em>Knowledge</em> in Copilot Studio to point it at your real SharePoint site, website, or files.</p>'
          : '<p class="ab-hint">Items flagged <em>placeholder URL</em> use an example address. <strong>Type your real site URL in the box</strong> and it ships wired into the export \u2014 no fixing up after import. Leave it blank to set it in Copilot Studio later.</p>')
      : "";

    return '<div class="ab-preview">' +
      '<div class="ab-row2">' +
        '<div class="ab-field"><label for="ab-name">Agent name</label>' +
          '<input type="text" id="ab-name" value="' + esc(p.name || "") + '"></div>' +
        '<div class="ab-field"><label>Harness (engine)</label>' +
          '<div class="ab-harness" role="tablist">' +
            '<button type="button" class="ab-harness-opt' + (newExp ? " on" : "") + '" data-exp="new">GitHub Copilot harness</button>' +
            '<button type="button" class="ab-harness-opt' + (!newExp ? " on" : "") + '" data-exp="classic">Standard harness</button>' +
          "</div>" +
          '<div class="ab-sub">' + (newExp ? "Instruction-driven, generative orchestration \u2014 reasoning &amp; multi-step work." : "Topics + rules \u2014 predictable Q&amp;A / single actions.") + "</div>" +
        "</div>" +
      "</div>" +

      '<div class="ab-field"><label for="ab-instr">Instructions <span>(editable \u2014 this is what ships in the .zip)</span></label>' +
        '<textarea id="ab-instr" rows="12" class="ab-instr">' + esc(S.instructions) + "</textarea>" +
        '<div class="ab-instr-actions"><button type="button" id="ab-regen" class="ab-link">\u21bb Regenerate for ' + esc(harnessName) + "</button></div>" +
      "</div>" +

      '<div class="ab-cols">' +
        '<div class="ab-col"><div class="ab-col-h">Tools (' + conns.length + ")</div><ul class=\"ab-list\">" + toolItems + "</ul></div>" +
        '<div class="ab-col"><div class="ab-col-h">Knowledge (' + know.length + ")</div><ul class=\"ab-list\">" + knowItems + "</ul></div>" +
        capsHtml +
      "</div>" +
      toolPickerHtml() +
      placeholderHtml +

      // Work IQ (Microsoft 365 tenant grounding) — parity with the Quick-mode exporter.
      '<div class="ab-field ab-workiq-field">' +
        '<label class="ab-workiq"><input type="checkbox" id="ab-workiq"' + (wiqOn ? " checked" : "") + '> ' +
          '<span>Ground on Microsoft&nbsp;365 with <strong>Work IQ</strong></span> ' + workIqPill(S.experience) + "</label>" +
        '<div class="ab-sub">' + workIqNote(S.experience) + "</div>" +
      "</div>" +

      // Skills (reusable named instruction modules) — parity with the Quick-mode exporter.
      '<div class="ab-field">' +
        '<label for="ab-skills">Skills <span class="ab-tag">GitHub Copilot harness</span></label>' +
        '<textarea id="ab-skills" rows="2" class="ab-skills" placeholder="One skill per line \u2014 e.g. Meeting brief formatter: turns gathered context into an executive brief">' + esc(S.skills) + "</textarea>" +
        '<div class="ab-sub">Reusable, named instruction modules the agent invokes by name. Format each line <code>Name: what it does</code>. Emitted as editable <strong>Skills</strong> on GitHub Copilot harness agents (the standard harness gets a switch note).</div>' +
      "</div>" +

      '<div class="ab-meta"><span><strong>Type:</strong> ' + (p.archetype === "autonomous" ? "Autonomous (triggered)" : "Interactive (chat)") + "</span>" +
        '<span><strong>Starter topics:</strong> ' + (newExp ? "0 (none \u2014 generative)" : ((EP.SYSTEM_TOPICS && EP.SYSTEM_TOPICS.length) || 12) + " system topics") + "</span></div>" +
      unmappedHtml +
      noticesHtml +

      '<div class="ab-actions">' +
        '<button type="button" id="ab-download" class="ab-btn">\u2b07 Download Studio starter (.zip)</button>' +
        '<button type="button" id="ab-copy" class="ab-btn secondary">\ud83d\udccb Copy config</button>' +
      "</div>" +
      '<div class="ab-status" id="ab-status" role="status"></div>' +
      '<details class="ab-help"><summary>How do I import this?</summary>' +
        '<ol><li>Go to <strong>make.powerapps.com</strong> (or <strong>copilotstudio.microsoft.com</strong>) \u2192 <strong>Solutions \u2192 Import solution</strong>.</li>' +
        '<li>Pick the downloaded <code>.zip</code> and continue.</li>' +
        '<li>On the Connections step, pick or create a connection for each tool (they bind at import).</li>' +
        '<li>Open the agent, review the instructions, and <strong>Publish</strong>. It imports unmanaged (fully editable). Finish anything in <code>NEXT-STEPS.md</code>.</li></ol>' +
      "</details>" +
    "</div>";
  }

  function status(msg, err) {
    var s = el("ab-status"); if (!s) return;
    s.className = "ab-status" + (err ? " err" : "");
    s.textContent = msg || "";
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  function build() {
    var ta = el("ab-nl-text");
    var desc = ta ? ta.value.trim() : "";
    if (!desc) { return; }
    if (!EC || !EC.analyzeText || !EP || !EP.analyzePackage) { return; }
    // Fresh description → reset the analysis + all layered edits so nothing leaks across builds.
    S.desc = desc;
    S.vars = null; S.outline = null; S.systems = null;
    S.addConnectors = []; S.name = ""; S.instructions = ""; S.workIQ = null; S.knowledgeSites = {};
    ensureAnalysis();
    // Recommend the harness the estimator would: GitHub harness for generative/agentic work.
    var v = S.vars || {};
    S.experience = (v.orchestration === "generative" || v.hasAI || (v.actionsCount || 0) >= 2) ? "new" : "classic";
    renderPreview(true);
  }

  function renderPreview(regenInstr) {
    var host = el("ab-body"); if (!host) return;
    var p;
    try { p = EP.analyzePackage(optsFromState(false)); } // analyze shows ALL detected items (no exclude)
    catch (e) { host.innerHTML = '<p class="ab-err">Couldn\u2019t analyze that description \u2014 try rephrasing.</p>'; return; }
    S.preview = p;
    if (!S.name) S.name = p.name || "";
    if (regenInstr || !S.instructions) S.instructions = freshInstructions(p);
    host.innerHTML = bodyHtml(p);
    wireBody();
  }

  function wireBody() {
    var nameEl = el("ab-name");
    if (nameEl) nameEl.addEventListener("input", function () { S.name = nameEl.value; });
    var instrEl = el("ab-instr");
    if (instrEl) instrEl.addEventListener("input", function () { S.instructions = instrEl.value; });
    Array.prototype.forEach.call(document.querySelectorAll(".ab-harness-opt"), function (b) {
      b.addEventListener("click", function () {
        var exp = b.getAttribute("data-exp");
        if (exp === S.experience) return;
        S.experience = exp;
        renderPreview(true); // harness changed → regenerate instructions + refresh harness-aware notes
      });
    });
    var regen = el("ab-regen");
    if (regen) regen.addEventListener("click", function () { S.instructions = freshInstructions(S.preview); renderPreview(false); status("Instructions regenerated for the selected harness."); });
    // Work IQ toggle → set override, re-analyze (changes grounding/notices in the preview).
    // Deferred so the re-render never runs inside the checkbox's own change/blur dispatch.
    var wiq = el("ab-workiq");
    if (wiq) wiq.addEventListener("change", function () { S.workIQ = wiq.checked; setTimeout(function () { renderPreview(false); }, 0); });
    // Skills: capture live. No re-render (they only affect the .zip / copied config, read at
    // build time) — avoids a re-render-during-blur DOM race.
    var skillsEl = el("ab-skills");
    if (skillsEl) skillsEl.addEventListener("input", function () { S.skills = skillsEl.value; });
    // Knowledge URL: capture live into S.knowledgeSites so the export carries the real address.
    // No re-render (preserves keep/drop + focus) — we just toggle the placeholder flag inline.
    Array.prototype.forEach.call(document.querySelectorAll(".ab-know-url"), function (inp) {
      inp.addEventListener("input", function () {
        var id = inp.getAttribute("data-id");
        var v = inp.value.trim();
        if (v) S.knowledgeSites[id] = v; else delete S.knowledgeSites[id];
        var flag = document.querySelector('.ab-flag[data-flag-for="' + id + '"]');
        if (flag) flag.style.display = v ? "none" : "";
      });
    });
    // "+ Add a tool" picker → inject a connector, re-analyze so it appears in Tools.
    var addSel = el("ab-addtool-sel");
    if (addSel) addSel.addEventListener("change", function () {
      var key = addSel.value; if (!key) return;
      if (S.addConnectors.indexOf(key) < 0) S.addConnectors.push(key);
      renderPreview(false);
    });
    var clearAdded = el("ab-clear-added");
    if (clearAdded) clearAdded.addEventListener("click", function () { S.addConnectors = []; renderPreview(false); });
    var dl = el("ab-download");
    if (dl) dl.addEventListener("click", doDownload);
    var cp = el("ab-copy");
    if (cp) cp.addEventListener("click", doCopy);
  }

  function doDownload() {
    if (!EP || !EP.buildPackage) { status("Builder engine not loaded \u2014 refresh and try again.", true); return; }
    try {
      var opts = optsFromState(true); // BUILD: prune unchecked items via opts.exclude
      var pkg = EP.buildPackage(opts);
      var ex = opts.exclude || {};
      var nRemoved = (ex.connectors || []).length + (ex.knowledge || []).length + (ex.capabilities || []).length;
      var ok = downloadBlob(pkg.bytes, pkg.filename, "application/zip");
      status(ok
        ? "Downloaded " + pkg.filename + " (" + (S.experience === "new" ? "GitHub Copilot harness" : "standard harness") + (nRemoved ? ", " + nRemoved + " removed" : "") + ") \u2014 import it into Copilot Studio."
        : "Your browser blocked the download.", !ok);
    } catch (e) { status("Couldn\u2019t build the package: " + (e && e.message ? e.message : e), true); }
  }

  // Only the items still checked (kept) belong in the copyable config.
  function keptBy(sel, attr) {
    var kept = {};
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (cb) { kept[cb.getAttribute(attr)] = cb.checked; });
    return kept;
  }
  function configText() {
    var p = S.preview || {};
    var newExp = S.experience === "new";
    var keepConn = keptBy(".ab-keep-conn", "data-key");
    var keepKnow = keptBy(".ab-keep-know", "data-id");
    var keepCap = keptBy(".ab-keep-cap", "data-id");
    var a = EC.analyzeText(S.desc || "");
    var lines = [];
    lines.push("# " + (S.name || p.name || "Agent"));
    lines.push("Harness: " + (newExp ? "GitHub Copilot harness (generative orchestration)" : "Standard harness (topics + rules)"));
    lines.push("Type: " + (p.archetype === "autonomous" ? "Autonomous (triggered)" : "Interactive (chat)"));
    if (workIqEffective(a.vars || {})) lines.push("Grounding: Microsoft 365 Work IQ (tenant graph)");
    lines.push("");
    lines.push("## Instructions");
    lines.push(S.instructions || "");
    lines.push("");
    lines.push("## Tools");
    var conns = (p.connectors || []).filter(function (c) { return keepConn[c.key] !== false; });
    if (conns.length) conns.forEach(function (c) { lines.push("- " + c.actionName + " (" + c.connectorLabel + ")"); });
    else lines.push("- (none)");
    lines.push("");
    lines.push("## Knowledge");
    var know = (p.knowledge || []).filter(function (k) { return keepKnow[k.id] !== false; });
    if (know.length) know.forEach(function (k) { var site = (S.knowledgeSites && S.knowledgeSites[k.id]) || k.site; lines.push("- " + k.label + (site ? " — " + site : "")); });
    else lines.push("- (none)");
    var caps = (p.capabilities || []).filter(function (c) { return keepCap[c.id] !== false; });
    if (caps.length) { lines.push(""); lines.push("## Read capabilities (add by hand)"); caps.forEach(function (c) { lines.push("- " + c.behavior); }); }
    var skills = parseSkillLines(S.skills);
    if (skills.length && newExp) { lines.push(""); lines.push("## Skills"); skills.forEach(function (s) { lines.push("- " + s.name + (s.description ? ": " + s.description : "")); }); }
    if ((p.unmapped || []).length) { lines.push(""); lines.push("## Wire by hand"); p.unmapped.forEach(function (s) { lines.push("- " + s); }); }
    if ((p.notices || []).length) { lines.push(""); lines.push("## Finish in Copilot Studio"); p.notices.forEach(function (n) { lines.push("- " + n.title + ": " + n.detail); }); }
    return lines.join("\n");
  }

  function doCopy() {
    var text = configText();
    var done = function () { status("Config copied \u2014 paste it into Copilot Studio."); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else { fallbackCopy(text, done); }
  }
  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "absolute"; ta.style.left = "-9999px";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { status("Couldn\u2019t copy \u2014 select the text manually.", true); }
    document.body.removeChild(ta);
  }

  var HANDOFF_KEY = "cr-agent-build-v1";
  // Faithful hand-off from Quick mode: hydrate the FULL builder state (description + the exact
  // vars — including any Fine-tune edits — plus harness / Work IQ / skills) so the Builder opens
  // as an exact continuation, not a re-derivation. One-shot: cleared after read.
  function hydrateFromHandoff() {
    var raw;
    try { raw = window.sessionStorage && window.sessionStorage.getItem(HANDOFF_KEY); } catch (e) { raw = null; }
    if (!raw) return false;
    try { window.sessionStorage.removeItem(HANDOFF_KEY); } catch (e) {}
    var p; try { p = JSON.parse(raw); } catch (e) { return false; }
    if (!p || !p.desc) return false;
    S.desc = String(p.desc);
    S.vars = p.vars || null;                 // full vars → faithful (no re-derive)
    S.outline = p.outline || null;
    S.systems = p.systems || (p.outline && p.outline.systems) || [];
    S.experience = p.experience === "classic" ? "classic" : (p.experience === "new" ? "new" : null);
    if (!S.experience) { var v = S.vars || {}; S.experience = (v.orchestration === "generative" || v.hasAI || (v.actionsCount || 0) >= 2) ? "new" : "classic"; }
    S.workIQ = (typeof p.workIQ === "boolean") ? p.workIQ : null;
    S.skills = p.skills || "";
    S.name = ""; S.instructions = ""; S.addConnectors = []; S.knowledgeSites = {};
    return true;
  }

  function init() {
    var mount = el("agent-builder");
    if (!mount) return;
    if (!EC || !EC.analyzeText || !EP || !EP.buildPackage) { mount.innerHTML = '<p class="hint">Agent builder engine not loaded.</p>'; return; }
    mount.innerHTML = shellHtml();
    var go = el("ab-go"); if (go) go.addEventListener("click", build);
    var ta = el("ab-nl-text");
    if (ta) ta.addEventListener("keydown", function (e) { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); build(); } });
    Array.prototype.forEach.call(mount.querySelectorAll(".ab-ex"), function (b) {
      b.addEventListener("click", function () { if (ta) { ta.value = EXAMPLES[+b.getAttribute("data-ex")]; build(); } });
    });
    // Seeded from Quick mode? Fill the box and render the preview straight away.
    if (hydrateFromHandoff()) {
      if (ta) ta.value = S.desc;
      renderPreview(true);
      var host = el("ab-body"); if (host && host.scrollIntoView) host.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

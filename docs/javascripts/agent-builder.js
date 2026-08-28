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
  var S = { desc: "", preview: null, experience: "new", name: "", instructions: "", built: false };

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
  function optsFromState() {
    var a = EC.analyzeText(S.desc || "");
    var outline = a.outline || null;
    return {
      description: S.desc || "",
      vars: a.vars || {},
      systems: (outline && outline.systems) || [],
      outline: outline,
      experience: S.experience,
      name: (S.name || "").trim() || undefined,
      instructions: (S.instructions || "").trim() || undefined
    };
  }

  // Regenerate instructions for the CURRENT harness/description (used on Build and on the
  // explicit "Regenerate" action after a harness switch).
  function freshInstructions(preview) {
    if (!EP || !EP.buildInstructions) return "";
    var a = EC.analyzeText(S.desc || "");
    try {
      return EP.buildInstructions(preview.name, S.desc || "", {
        connectors: preview.connectors || [], knowledge: preview.knowledge || [],
        capabilities: preview.capabilities || [], vars: a.vars || {},
        experience: S.experience
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

  // ── Tier 2: editable preview ───────────────────────────────────────────────
  function bodyHtml(p) {
    var newExp = S.experience === "new";
    var harnessName = newExp ? "GitHub Copilot harness" : "Standard harness";
    var conns = p.connectors || [];
    var know = p.knowledge || [];
    var unmapped = p.unmapped || [];
    var notices = p.notices || [];

    var toolItems = conns.length
      ? conns.map(function (c) { return '<li><strong>' + esc(c.actionName) + '</strong> <span>\u2014 ' + esc(c.connectorLabel) + '</span></li>'; }).join("")
      : '<li class="ab-empty">No connector tools detected \u2014 add them in Studio if needed.</li>';
    var knowItems = know.length
      ? know.map(function (k) { return '<li><strong>' + esc(k.label) + '</strong>' + (k.placeholder ? ' <span class="ab-flag">placeholder URL</span>' : "") + (k.site ? '<span class="ab-sub">' + esc(k.site) + '</span>' : "") + '</li>'; }).join("")
      : '<li class="ab-empty">No knowledge source detected.</li>';

    var noticesHtml = notices.length
      ? '<div class="ab-notices"><div class="ab-notices-h">Finish these in Copilot Studio after import</div>' +
          notices.map(function (n) { return '<div class="ab-notice"><strong>' + esc(n.title) + '</strong><div class="ab-sub">' + esc(n.detail) + "</div></div>"; }).join("") + "</div>"
      : "";
    var unmappedHtml = unmapped.length
      ? '<div class="ab-unmapped"><strong>Systems with no starter action:</strong> ' + unmapped.map(esc).join(", ") + ' \u2014 wire these by hand (listed in NEXT-STEPS.md).</div>'
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
      "</div>" +
      '<div class="ab-meta"><span><strong>Type:</strong> ' + (p.archetype === "autonomous" ? "Autonomous (triggered)" : "Interactive (chat)") + "</span>" +
        '<span><strong>Starter topics:</strong> ' + ((EP.SYSTEM_TOPICS && EP.SYSTEM_TOPICS.length) || (newExp ? 0 : 12)) + (newExp ? " (none \u2014 generative)" : " system topics") + "</span></div>" +
      unmappedHtml +
      noticesHtml +

      '<div class="ab-actions">' +
        '<button type="button" id="ab-download" class="ab-btn">\u2b07 Download Studio starter (.zip)</button>' +
        '<button type="button" id="ab-copy" class="ab-btn secondary">\ud83d\udccb Copy config</button>' +
      "</div>" +
      '<div class="ab-status" id="ab-status" role="status"></div>' +
      '<details class="ab-help"><summary>How do I import this?</summary>' +
        '<ol><li>Go to <strong>make.powerapps.com</strong> (or <strong>copilotstudio.microsoft.com</strong>).</li>' +
        '<li>Choose <strong>Solutions \u2192 Import solution</strong> and pick the .zip.</li>' +
        '<li>On the Connections step, pick a connection for each tool (they bind at import).</li>' +
        '<li>Open the agent, review the instructions, and <strong>Publish</strong>. Then finish anything in <code>NEXT-STEPS.md</code>.</li></ol>' +
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
    S.desc = ta ? ta.value.trim() : "";
    if (!S.desc) { return; }
    if (!EC || !EC.analyzeText || !EP || !EP.analyzePackage) { return; }
    var a = EC.analyzeText(S.desc);
    // Recommend the harness the estimator would: GitHub harness for generative/agentic work.
    S.experience = (a.vars && (a.vars.orchestration === "generative" || a.vars.hasAI || (a.vars.actionsCount || 0) >= 2)) ? "new" : "classic";
    renderPreview(true);
  }

  function renderPreview(regenInstr) {
    var host = el("ab-body"); if (!host) return;
    var p;
    try { p = EP.analyzePackage(optsFromState()); }
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
        renderPreview(true); // harness changed → regenerate instructions to match
      });
    });
    var regen = el("ab-regen");
    if (regen) regen.addEventListener("click", function () { S.instructions = freshInstructions(S.preview); renderPreview(false); status("Instructions regenerated for the selected harness."); });
    var dl = el("ab-download");
    if (dl) dl.addEventListener("click", doDownload);
    var cp = el("ab-copy");
    if (cp) cp.addEventListener("click", doCopy);
  }

  function doDownload() {
    if (!EP || !EP.buildPackage) { status("Builder engine not loaded \u2014 refresh and try again.", true); return; }
    try {
      var pkg = EP.buildPackage(optsFromState());
      var ok = downloadBlob(pkg.bytes, pkg.filename, "application/zip");
      status(ok ? "Downloaded " + pkg.filename + " \u2014 import it into Copilot Studio." : "Your browser blocked the download.", !ok);
    } catch (e) { status("Couldn\u2019t build the package: " + (e && e.message ? e.message : e), true); }
  }

  function configText() {
    var p = S.preview || {};
    var newExp = S.experience === "new";
    var lines = [];
    lines.push("# " + (S.name || p.name || "Agent"));
    lines.push("Harness: " + (newExp ? "GitHub Copilot harness (generative orchestration)" : "Standard harness (topics + rules)"));
    lines.push("Type: " + (p.archetype === "autonomous" ? "Autonomous (triggered)" : "Interactive (chat)"));
    lines.push("");
    lines.push("## Instructions");
    lines.push(S.instructions || "");
    lines.push("");
    lines.push("## Tools");
    if ((p.connectors || []).length) p.connectors.forEach(function (c) { lines.push("- " + c.actionName + " (" + c.connectorLabel + ")"); });
    else lines.push("- (none detected)");
    lines.push("");
    lines.push("## Knowledge");
    if ((p.knowledge || []).length) p.knowledge.forEach(function (k) { lines.push("- " + k.label + (k.site ? " — " + k.site : "")); });
    else lines.push("- (none detected)");
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
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

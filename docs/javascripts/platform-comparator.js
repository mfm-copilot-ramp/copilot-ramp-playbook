/*
 * platform-comparator.js — GitHub Copilot ⇄ M365 Copilot cost-structure comparator.
 *
 * Three tiers so anyone can use it:
 *   Tier 1 — describe the agent in plain English (primary entry for non-savvy users).
 *   Tier 2 — plain-language chips to adjust ("how much it reads", "how many back-and-forths").
 *   Tier 3 — exact token / turn / cache numbers (advanced, collapsed) for savvy users.
 *
 * Uses EstimatorCore.inferComparatorInputs() (NL → axes) and .comparePlatforms() (the math),
 * so logic stays in one place. Reads URL params to pre-seed (estimator / Path Finder hand-off):
 *   ?cmp_input=<tokens>&cmp_turns=<turns>&cmp_grounded=<0|1>&cmp_model=<key>
 */
(function () {
  "use strict";
  var EC = (typeof window !== "undefined") && (window.EstimatorCore || window.EC);
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function fmt(n) {
    n = Number(n) || 0;
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, "") + "K";
    if (Math.abs(n) >= 100) return Math.round(n).toString();
    if (Math.abs(n) >= 10) return n.toFixed(1).replace(/\.0$/, "");
    return n.toFixed(2).replace(/\.00$/, "");
  }
  function money(n) { n = Number(n) || 0; return "$" + (n < 10 ? n.toFixed(2) : n < 1000 ? n.toFixed(0) : (n / 1000).toFixed(1) + "K"); }
  function el(id) { return document.getElementById(id); }

  // Plain-language buckets → per-turn payload / turn anchors (from the shared engine).
  var PP = (EC && EC.PAYLOAD_PER_TURN) || { little: 15000, some: 40000, large: 120000 };
  var PAYLOAD = { little: PP.little, some: PP.some, large: PP.large };
  var PAYLOAD_LABEL = { little: "A little", some: "Some files", large: "A large document" };
  var TURNS = { one: 2, few: 6, many: 15 };
  var TURNS_LABEL = { one: "One-and-done", few: "A few", many: "Many" };
  function payloadBucket(tok) { return tok < 27000 ? "little" : tok < 80000 ? "some" : "large"; }
  function turnsBucket(t) { return t <= 3 ? "one" : t <= 9 ? "few" : "many"; }
  // M365 grounding types (what the standard/M365 engine does each turn).
  var GROUND_LABEL = { none: "Just answers", docs: "Reads company files", tenant: "Reads M365 (Graph) data", action: "Acts in a system" };
  var GROUND_ORDER = ["none", "docs", "tenant", "action"];

  // Widget state.
  var S = { payloadTokens: PP.some, outputTokens: null, turns: 6, cacheHitPct: 0, groundingType: "tenant",
    harnessOverhead: (EC && EC.HARNESS_OVERHEAD_TOKENS) || 15000,
    model: (EC && EC.MODEL_DEFAULT) || "claude-sonnet-4.6", shown: false, why: null, advOpen: false };

  function modelOptions(sel) {
    if (!EC || !EC.MODEL_ORDER) return '<option value="">(models unavailable)</option>';
    var groups = {};
    EC.MODEL_ORDER.forEach(function (k) {
      var m = EC.MODEL_RATES[k]; if (!m) return;
      (groups[m.tag] || (groups[m.tag] = [])).push(
        '<option value="' + k + '"' + (k === sel ? " selected" : "") + ">" +
        esc(m.label + (m.rateSource === "proxy" ? " \u00B7 proxy" : "")) + "</option>");
    });
    var out = "";
    ["General", "Deep"].forEach(function (g) { if (groups[g]) out += '<optgroup label="' + g + ' models">' + groups[g].join("") + "</optgroup>"; });
    return out;
  }

  // ── Tier 1: natural-language box (static shell) ────────────────────────────
  var EXAMPLES = [
    "Reads the whole policy manual to answer detailed HR questions",
    "Looks up an order status and replies",
    "Reviews a long contract and flags risky clauses, several steps"
  ];
  function shellHtml() {
    var ex = EXAMPLES.map(function (e, i) { return '<button type="button" class="pcmp-ex" data-ex="' + i + '">' + esc(e) + "</button>"; }).join("");
    return '<div class="pcmp-card">' +
      '<div class="pcmp-scope">Comparing two <b>Copilot Studio</b> engines (harnesses), both billed in <b>Copilot Credits</b>: the <b>GitHub Copilot harness</b> (Studio\u2019s smart, multi-step reasoning engine) vs the <b>standard / M365</b> engine. This is <b>not</b> the standalone GitHub Copilot coding tool in your IDE.</div>' +
      '<div class="pcmp-nl">' +
        '<label for="pcmp-nl-text"><b>Describe what the agent does</b> \u2014 in plain words</label>' +
        '<textarea id="pcmp-nl-text" rows="2" placeholder="e.g. Reads our warranty policy and works through each claim step by step"></textarea>' +
        '<div class="pcmp-ex-row"><span class="pcmp-ex-lbl">Try an example:</span>' + ex + "</div>" +
        '<button type="button" id="pcmp-go" class="pcmp-btn">Compare \u2192</button>' +
      "</div>" +
      '<div id="pcmp-body"></div>' +
    "</div>";
  }

  // ── Tier 2 + 3 + result (re-rendered on every change) ──────────────────────
  function chip(kind, val, active, label) {
    return '<button type="button" class="pcmp-chip' + (active ? " on" : "") + '" data-kind="' + kind + '" data-val="' + val + '">' + esc(label) + "</button>";
  }
  function bodyHtml() {
    var pb = payloadBucket(S.payloadTokens), tb = turnsBucket(S.turns);
    var why = S.why || {};
    var assumed = why.payload || why.turns ? (
      '<div class="pcmp-assumed">Here\u2019s what we assumed \u2014 tweak anything below. ' +
        (why.payload ? "<span>Reads: " + esc(why.payload) + ".</span> " : "") +
        (why.turns ? "<span>Steps: " + esc(why.turns) + ".</span>" : "") +
        (why.grounding ? "<span>M365: " + esc(why.grounding) + ".</span>" : "") +
      "</div>") : "";
    var outVal = S.outputTokens != null ? S.outputTokens : Math.max(500, Math.round((S.harnessOverhead + S.payloadTokens) * 0.1));
    return assumed +
      '<div class="pcmp-tier2">' +
        '<div class="pcmp-choice"><div class="pcmp-choice-lbl">How much does it read each turn?</div>' +
          '<div class="pcmp-chips">' + ["little", "some", "large"].map(function (b) { return chip("payload", b, pb === b, PAYLOAD_LABEL[b]); }).join("") + "</div></div>" +
        '<div class="pcmp-choice"><div class="pcmp-choice-lbl">How many back-and-forths to finish the job?</div>' +
          '<div class="pcmp-chips">' + ["one", "few", "many"].map(function (b) { return chip("turns", b, tb === b, TURNS_LABEL[b]); }).join("") + "</div></div>" +
        '<div class="pcmp-choice"><div class="pcmp-choice-lbl">Model (on the GitHub side)</div>' +
          '<select id="pcmp-model">' + modelOptions(S.model) + "</select></div>" +
        '<div class="pcmp-choice"><div class="pcmp-choice-lbl">What does the M365 side do each turn?</div>' +
          '<div class="pcmp-chips">' + GROUND_ORDER.map(function (g) { return chip("grounding", g, S.groundingType === g, GROUND_LABEL[g]); }).join("") + "</div></div>" +
      "</div>" +
      '<div id="pcmp-out" class="pcmp-out"></div>' +
      '<button type="button" id="pcmp-adv-toggle" class="pcmp-adv-toggle">' + (S.advOpen ? "\u2212 Hide exact numbers" : "+ Adjust exact numbers") + "</button>" +
      (S.advOpen ? (
        '<div class="pcmp-adv">' +
          '<div class="calc-field"><label for="cmp-input">Payload tokens / turn</label><input type="number" min="0" step="1000" id="cmp-input" value="' + S.payloadTokens + '"><div class="hint">Content read per turn (grounding / files), on top of harness overhead.</div></div>' +
          '<div class="calc-field"><label for="cmp-overhead">Harness overhead / turn</label><input type="number" min="0" step="1000" id="cmp-overhead" value="' + S.harnessOverhead + '"><div class="hint">Instructions + tools + re-sent context every agentic turn (default ~15K).</div></div>' +
          '<div class="calc-field"><label for="cmp-output">Output tokens / turn</label><input type="number" min="0" step="500" id="cmp-output" value="' + outVal + '"><div class="hint">Tokens generated per turn.</div></div>' +
          '<div class="calc-field"><label for="cmp-turns">Turns to finish the job</label><input type="number" min="1" step="1" id="cmp-turns" value="' + S.turns + '"><div class="hint">Interactions in one end-to-end task.</div></div>' +
          '<div class="calc-field"><label for="cmp-cache">Cache-hit % (GitHub)</label><input type="number" min="0" max="100" step="5" id="cmp-cache" value="' + S.cacheHitPct + '"><div class="hint">Re-sent context served from cache (~10\u00d7 cheaper).</div></div>' +
        "</div>"
      ) : "") +
      '<p class="pcmp-foot">Directional \u2014 the <b>GitHub Copilot harness</b> meters per <b>token</b> (payload + overhead, floored to Microsoft\u2019s published Light band of 100 credits/task); the <b>standard / M365</b> engine meters per <b>event</b> (turn-driven). 1 credit = $0.01.</p>';
  }

  function renderBody() {
    var body = el("pcmp-body"); if (!body) return;
    S.shown = true;
    body.innerHTML = bodyHtml();
    // wire chips
    Array.prototype.forEach.call(body.querySelectorAll(".pcmp-chip"), function (b) {
      b.addEventListener("click", function () {
        var kind = b.getAttribute("data-kind"), val = b.getAttribute("data-val");
        if (kind === "payload") { S.payloadTokens = PAYLOAD[val]; S.outputTokens = null; }
        else if (kind === "turns") { S.turns = TURNS[val]; }
        else if (kind === "grounding") { S.groundingType = val; }
        renderBody();
      });
    });
    var msel = el("pcmp-model"); if (msel) msel.addEventListener("change", function () { S.model = msel.value; renderBody(); });
    var advT = el("pcmp-adv-toggle"); if (advT) advT.addEventListener("click", function () { S.advOpen = !S.advOpen; renderBody(); });
    ["cmp-input", "cmp-overhead", "cmp-output", "cmp-turns", "cmp-cache"].forEach(function (id) {
      var e = el(id); if (!e) return;
      e.addEventListener("input", function () {
        S.payloadTokens = Math.max(0, parseFloat(el("cmp-input").value) || 0);
        S.harnessOverhead = Math.max(0, parseFloat(el("cmp-overhead").value) || 0);
        S.outputTokens = Math.max(0, parseFloat(el("cmp-output").value) || 0);
        S.turns = Math.max(1, parseFloat(el("cmp-turns").value) || 1);
        S.cacheHitPct = Math.min(100, Math.max(0, parseFloat(el("cmp-cache").value) || 0));
        recalc();
      });
    });
    recalc();
  }

  function recalc() {
    if (!EC || !EC.comparePlatforms) return;
    var out = el("pcmp-out"); if (!out) return;
    var v = { model: S.model, payloadTokens: S.payloadTokens, turns: S.turns, cacheHitPct: S.cacheHitPct,
      groundingType: S.groundingType, harnessOverhead: S.harnessOverhead };
    if (S.outputTokens != null) v.outputTokensPerTurn = S.outputTokens;
    var r = EC.comparePlatforms(v);
    var ghWin = r.cheaper === "github";
    var ghJobUSD = EC.costUSD(r.ghcpPerJob).payg, m365JobUSD = EC.costUSD(r.m365PerJob).payg;
    var col = function (name, perTurn, perJob, usd, win, note) {
      return '<div class="pcmp-col' + (win ? " win" : "") + '">' +
        '<div class="pcmp-col-h">' + esc(name) + (win ? ' <span class="pcmp-badge">cheaper</span>' : "") + "</div>" +
        '<div class="pcmp-big">' + fmt(perJob) + ' <span>credits / job</span></div>' +
        '<div class="pcmp-sub">' + money(usd) + " / job \u00b7 " + fmt(perTurn) + " credits / turn</div>" +
        '<div class="pcmp-note">' + note + "</div></div>";
    };
    var proxyFlag = r.rateSource === "proxy" ? ' <span class="pcmp-proxy">proxy rate \u00b7 ' + esc(r.proxyOf) + "</span>" : "";
    var m365Note = "per event \u00b7 " + esc(GROUND_LABEL[r.groundingType] || "grounded") + " (" + r.m365PerTurn + ")";
    var ghNote = "per task \u00b7 " + esc(r.modelLabel) + proxyFlag + (r.ghFloored ? ' \u00b7 <span class="pcmp-proxy">at published Light-band floor</span>' : "");
    var gapPct = Math.round(Math.abs(1 - Math.min(r.ghcpPerJob, r.m365PerJob) / Math.max(r.ghcpPerJob, r.m365PerJob)) * 100);
    var verdict = ghWin
      ? "For this shape, the <b>GitHub Copilot harness</b> is the cheaper choice by ~" + gapPct + "% \u2014 a long, grounded back-and-forth where the standard engine\u2019s flat per-turn events (" + r.m365PerTurn + " each) stack up faster than the harness\u2019s cached token cost. This is the sweet spot for the harness: <b>many turns \u00d7 light new content each turn \u00d7 heavy M365 grounding</b>."
      : "For this shape, the <b>standard / M365</b> engine is cheaper by ~" + gapPct + "% \u2014 the GitHub harness carries real per-task overhead. It pulls ahead only when the job runs many grounded turns while reading little <i>new</i> content each turn (high cache reuse). Use the harness when the job genuinely needs multi-step reasoning the simpler engine can\u2019t do, not just to save credits.";
    var xInfo = "";
    if (isFinite(r.crossoverPayloadTokens)) {
      var side = r.payloadPerTurn <= r.crossoverPayloadTokens ? "below" : "above";
      xInfo = 'Per turn, one GitHub turn matches one M365 event at \u2248 <b>' + fmt(r.crossoverPayloadTokens) + " tokens read/turn</b> (plus ~" + fmt(r.harnessOverhead) + " harness overhead). This agent reads " + fmt(r.payloadPerTurn) + "/turn \u2014 <b>" + side + "</b> that line.";
    }
    out.innerHTML =
      '<div class="pcmp-cols">' +
        col("GitHub Copilot harness", r.ghcpPerTurn, r.ghcpPerJob, ghJobUSD, ghWin, ghNote) +
        col("Standard / M365", r.m365PerTurn, r.m365PerJob, m365JobUSD, !ghWin, m365Note) +
      "</div>" +
      '<div class="pcmp-verdict">' + verdict + "</div>" +
      (xInfo ? '<div class="pcmp-cross">' + xInfo + "</div>" : "");
  }

  function inferFromNL() {
    var ta = el("pcmp-nl-text"); if (!ta || !EC || !EC.inferComparatorInputs) return;
    var text = ta.value.trim();
    if (!text) { renderBody(); return; }
    var ci = EC.inferComparatorInputs(text);
    S.payloadTokens = ci.payloadTokens; S.outputTokens = null; S.turns = ci.turns;
    S.model = ci.model; S.groundingType = ci.groundingType; S.why = ci.why; S.advOpen = false;
    renderBody();
    var b = el("pcmp-body"); if (b) b.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function seedFromUrl() {
    var q = new URLSearchParams(location.search);
    // Preferred: a plain description carried from the estimator / Path Finder — infer identically.
    if (q.get("cmp_desc") && EC.inferComparatorInputs) {
      var ci = EC.inferComparatorInputs(q.get("cmp_desc"));
      S.payloadTokens = ci.payloadTokens; S.outputTokens = null; S.turns = ci.turns;
      S.model = ci.model; S.groundingType = ci.groundingType; S.why = ci.why;
      var ta = el("pcmp-nl-text"); if (ta) ta.value = q.get("cmp_desc");
      return true;
    }
    if (!q.get("cmp_payload") && !q.get("cmp_input") && !q.get("cmp_turns") && !q.get("cmp_model")) return false;
    if (q.get("cmp_payload") && PAYLOAD[q.get("cmp_payload")]) S.payloadTokens = PAYLOAD[q.get("cmp_payload")];
    else if (q.get("cmp_input")) S.payloadTokens = Math.max(0, parseFloat(q.get("cmp_input")) || S.payloadTokens);
    if (q.get("cmp_turns")) S.turns = Math.max(1, parseFloat(q.get("cmp_turns")) || S.turns);
    if (q.get("cmp_grounding")) S.groundingType = q.get("cmp_grounding");
    else if (q.get("cmp_grounded")) S.groundingType = q.get("cmp_grounded") === "0" ? "none" : "tenant";
    if (q.get("cmp_model")) S.model = q.get("cmp_model");
    S.outputTokens = null;
    S.why = { payload: "carried over from your estimate", turns: "carried over from your estimate" };
    return true;
  }

  function init() {
    var mount = el("ghcp-m365-compare");
    if (!mount) return;
    if (!EC || !EC.comparePlatforms) { mount.innerHTML = '<p class="hint">Comparator engine not loaded.</p>'; return; }
    mount.innerHTML = shellHtml();
    var go = el("pcmp-go"); if (go) go.addEventListener("click", inferFromNL);
    var ta = el("pcmp-nl-text");
    if (ta) ta.addEventListener("keydown", function (e) { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); inferFromNL(); } });
    Array.prototype.forEach.call(mount.querySelectorAll(".pcmp-ex"), function (b) {
      b.addEventListener("click", function () { if (ta) { ta.value = EXAMPLES[+b.getAttribute("data-ex")]; inferFromNL(); } });
    });
    // If the estimator / Path Finder seeded via URL, jump straight to the result.
    if (seedFromUrl()) renderBody();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

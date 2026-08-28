/* Copilot Credit Estimator — shared analysis engine.
 * Pure, DOM-free logic shared by the Quick (natural-language) and
 * Solution-package (upload) modes. Node-testable; loaded on the page as an
 * external asset via mkdocs.yml `extra_javascript` (not inlined into the .md).
 * Rates and per-turn math are benchmarked against Microsoft's public Copilot
 * Studio agent usage estimator + the Learn billing-rates doc (see CREDIT).
 */
(function (root) {
  "use strict";

  // Shared VERIFIED component vocabulary (estimator-vocab.js). One source of truth for
  // the new-experience export tokens; loaded first on the page, required in Node.
  var EV = (root && root.EstimatorVocab) ||
    (typeof require === "function" ? (function () { try { return require("./estimator-vocab.js"); } catch (e) { return null; } })() : null) ||
    { RECOGNIZER_NEW_EXPERIENCE: "CLICopilotRecognizer",
      COMPONENTTYPE: { FILE_KNOWLEDGE: 14 },
      DATA_KIND: { WORKFLOW_TOOL: "WorkflowTool", CONNECTED_AGENT_TOOL: "ConnectedAgentTool" },
      MODEL_SERIES_REASONING: [],
      isReasoningSeries: function () { return false; },
      RE: {
        newExperience: function () { return /CLICopilotRecognizer/i; },
        workflowTool: function () { return /kind:\s*WorkflowTool\b/gi; },
        connectedAgentTool: function () { return /kind:\s*ConnectedAgentTool\b/gi; },
        fileKnowledgeType: function () { return /<componenttype>\s*14\s*<\/componenttype>/gi; },
        webSearchOn: function () { return /"?enableWebSearch"?\s*:\s*true\b/i; },
        modelSeries: function () { return /"?series"?\s*:\s*"?([A-Za-z0-9_.-]+)"?/i; },
        workIQ: function () { return /shared_a365copilotchatmcp|shared_a365memcp|mcp_m365copilot|mcp_MeServer/gi; }
      } };

  // ── Credit model — mirrors the detailed estimator's default rows ──────────
  var CREDIT = {
    classic: 1, generative: 2, action: 5, tenantGraph: 10, flowAction: 0.13,
    aiBasic: 0.1, aiStandard: 1.5, aiPremium: 10, contentPage: 8,
    voiceBasic: 10, voiceStandard: 35, voicePremium: 75,
    // Autonomous trigger = one agent action (5). It is NOT a flat surcharge:
    // Microsoft's official estimator retired its old 25-credit "autonomous
    // action" weight ("triggers themselves are not charged — only the actions
    // they invoke"), and the Learn billing doc prices an autonomous run as the
    // agent actions it performs (e.g. 4 actions × 5 = 20). The downstream
    // flow / connector / answer steps are billed separately in the profile.
    autonomousTrigger: 5,
    // Reasoning-model premium — Learn billing meter "Text and generative AI
    // tools (premium)" = 10 Copilot Credits per 1K tokens, charged ON TOP of
    // the feature rate when an agent uses a reasoning-capable model. (The
    // official estimator's bundled "deep reasoning task" weight is ~50.)
    // Applied only when a reasoning model is detected; assumes REASON_TOKENS_K.
    reasoningPremium: 10
  };
  var REASON_TOKENS_K = 5;   // assumed premium tokens (×1K) per reasoning step (Solution mode)
  // Voice is billed PER MINUTE (Learn "Voice billing rate/minute": 10 / 35 / 75). This is
  // an editable planning assumption for the average voice minutes per conversation — NOT a
  // Microsoft-published figure. Tune it to your average handle time.
  var VOICE_MIN_PER_CONVO = 5;
  var RATE_PAYG = 0.01;      // $/credit, pay-as-you-go
  var RATE_PREPAID = 0.008;  // $/credit, $200 / 25,000 prepaid pack

  // ── Model-aware token pricing (GitHub Copilot harness only) ────────────────
  // Copilot Credits per 1,000 tokens, split by input / cached-input / cache-write / output.
  //
  // MODEL LIST = the models Copilot Studio actually exposes (Learn:
  // "Select a primary AI model for your agent"), grouped by Studio's own use tags
  // (Deep / General). Users can therefore only pick models available in Copilot Studio.
  //
  // RATES: credits/1K = (GitHub published USD per 1M tokens) ÷ 10, since 1 credit = $0.01
  // (docs.github.com "Models and pricing for GitHub Copilot"). Where a Studio model has a
  // DIRECT GitHub-priced entry we use it (rateSource:"direct"); where it does not, we map to
  // the nearest GitHub-priced sibling and flag it (rateSource:"proxy", proxyOf:"…").
  //
  // ⚠️ SCOPE: applies to the GitHub Copilot HARNESS only. Microsoft publishes per-task
  // complexity BANDS (tied to token usage) for that harness, not a per-model rate — so this
  // token build-up is DIRECTIONAL. On the STANDARD harness, model choice is a quality/latency
  // decision and does NOT scale the per-event credit bill; never apply these rates there.
  var MODEL_RATES = {
    // ── General tag (everyday chat, lower cost/latency) ──────────────────────
    "gpt-4.1":          { label: "GPT-4.1 (Default)",        tag: "General", status: "Default", in: 0.25,  cached: 0.025,  cacheWrite: 0,     out: 1.50,  rateSource: "proxy",  proxyOf: "GPT-5.4" },
    "gpt-5-chat":       { label: "GPT-5 Chat",               tag: "General", status: "GA",      in: 0.25,  cached: 0.025,  cacheWrite: 0,     out: 1.50,  rateSource: "proxy",  proxyOf: "GPT-5.4" },
    "gpt-5.5-chat":     { label: "GPT-5.5 Chat",             tag: "General", status: "GA",      in: 0.50,  cached: 0.05,   cacheWrite: 0,     out: 3.00,  rateSource: "direct" },
    "claude-sonnet-4.6":{ label: "Claude Sonnet 4.6",        tag: "General", status: "GA",      in: 0.30,  cached: 0.03,   cacheWrite: 0.375, out: 1.50,  rateSource: "direct" },
    "claude-sonnet-5":  { label: "Claude Sonnet 5",          tag: "General", status: "GA",      in: 0.20,  cached: 0.02,   cacheWrite: 0.25,  out: 1.00,  rateSource: "direct", ghHarnessOnly: true },
    // ── Deep tag (multistep reasoning, highest cost/latency) ─────────────────
    "gpt-5-reasoning":  { label: "GPT-5 Reasoning",          tag: "Deep",    status: "Preview", in: 0.50,  cached: 0.05,   cacheWrite: 0,     out: 3.00,  rateSource: "proxy",  proxyOf: "GPT-5.5" },
    "claude-opus-4.6":  { label: "Claude Opus 4.6",          tag: "Deep",    status: "GA",      in: 0.50,  cached: 0.05,   cacheWrite: 0.625, out: 2.50,  rateSource: "direct" },
    "claude-opus-4.7":  { label: "Claude Opus 4.7",          tag: "Deep",    status: "GA",      in: 0.50,  cached: 0.05,   cacheWrite: 0.625, out: 2.50,  rateSource: "direct" },
    // ── External (admin-gated; experimental) ─────────────────────────────────
    "grok-4.1-fast":    { label: "Grok 4.1 Fast (external)", tag: "General", status: "Experimental", in: 0.20, cached: 0.05, cacheWrite: 0, out: 0.60, rateSource: "proxy", proxyOf: "Grok 4.5" }
  };
  // Order presented in the picker (grouped by tag in the UI layer).
  var MODEL_ORDER = [
    "gpt-4.1", "gpt-5-chat", "gpt-5.5-chat", "claude-sonnet-4.6", "claude-sonnet-5",
    "gpt-5-reasoning", "claude-opus-4.6", "claude-opus-4.7", "grok-4.1-fast"
  ];
  var MODEL_DEFAULT = "claude-sonnet-4.6";

  // ── Canonical GitHub-harness task cost model (shared by estimator + comparator) ──
  // A "task" is one end-to-end multi-turn job. Its token cost is built from PER-TURN
  // quantities so the estimator and the comparator always agree:
  //   task_input  = turns × (harness overhead + payload read per turn)
  //   task_output = turns × output per turn
  // The harness overhead is the system prompt + tool schemas + instructions + running
  // context that EVERY agentic turn re-sends — typically large even for "simple" agents.
  // Credits are floored to the published GitHub-harness Light-band minimum so no real
  // multi-turn task shows below Microsoft's published range. Directional planning model.
  var HARNESS_OVERHEAD_TOKENS = 15000;   // instructions + tools + re-sent context, per turn
  var TURNS_PER_TASK_DEFAULT = 6;        // user back-and-forths to finish one job
  var GH_TASK_FLOOR = 100;               // published GitHub-harness Light band minimum (credits/task)
  // Payload READ per turn (grounding / files / context), by plain bucket. Anchors calibrated
  // so a typical agent lands within Microsoft's published bands (Light 100–300 · Medium 300–500 · Heavy >500).
  var PAYLOAD_PER_TURN = { little: 15000, some: 40000, large: 120000 };
  // Back-compat: a "tier" maps to a payload bucket.
  var TIER_BUCKET = { simple: "little", medium: "some", complex: "large" };
  // Retained for any UI that references it; no longer used for pricing.
  var TIER_TOKEN_PRESETS = {
    simple:  { inputTokens: 40000,  outputTokens: 4000 },
    medium:  { inputTokens: 200000, outputTokens: 15000 },
    complex: { inputTokens: 600000, outputTokens: 45000 }
  };
  function modelRate(model) {
    return Object.prototype.hasOwnProperty.call(MODEL_RATES, model) ? MODEL_RATES[model] : MODEL_RATES[MODEL_DEFAULT];
  }
  function numOr(x, d) { x = parseFloat(x); return isFinite(x) ? x : d; }
  function clamp01(x) { return Math.min(1, Math.max(0, x)); }

  // Per-turn payload (context read) for a task, from explicit tokens or the plain bucket / tier.
  function payloadPerTurn(v) {
    v = v || {};
    var explicit = numOr(v.payloadTokens, numOr(v.inputTokens, NaN));
    if (isFinite(explicit)) return Math.max(0, explicit);
    var bucket = v.payloadBucket || TIER_BUCKET[v.ghTier || GH_DEFAULTS.tier] || "some";
    return PAYLOAD_PER_TURN[bucket] != null ? PAYLOAD_PER_TURN[bucket] : PAYLOAD_PER_TURN.some;
  }
  function turnsPerTask(v) {
    v = v || {};
    return Math.max(1, numOr(v.turns, numOr(v.conversationsPerTask, TURNS_PER_TASK_DEFAULT)));
  }
  // Credits for one agentic TURN on the GitHub side (before floor).
  function ghTurnCredits(v) {
    v = v || {};
    var rate = modelRate(v.model);
    var overhead = numOr(v.harnessOverhead, HARNESS_OVERHEAD_TOKENS);
    var payload = payloadPerTurn(v);
    var inTok = overhead + payload;
    var outTok = numOr(v.outputTokensPerTurn, numOr(v.outputTokens, Math.max(500, Math.round(inTok * 0.1))));
    var hit = clamp01(numOr(v.cacheHitPct, 0) / 100);
    return (inTok * (1 - hit) / 1000) * rate.in
         + (inTok * hit / 1000) * rate.cached
         + (outTok / 1000) * rate.out;
  }
  // Canonical per-TASK GitHub credits (token build-up, floored to the published Light band).
  function ghTaskCredits(v) {
    v = v || {};
    var turns = turnsPerTask(v);
    var perTurn = ghTurnCredits(v);
    var raw = perTurn * turns;
    var floored = Math.max(GH_TASK_FLOOR, raw);
    return { perTurn: perTurn, turns: turns, tokenCredits: raw, taskCredits: floored, floored: floored > raw + 1e-9 };
  }
  // Back-compat wrapper: aggregate per-task token credits under the unified model.
  function modelTokenCredits(v) { return ghTaskCredits(v).taskCredits; }

  // Matcher substrings used to seed the detailed estimator's default rows.
  var ROW = {
    classic: "Classic answer",
    generative: "Generative answer",
    action: "Agent action",
    tenantGraph: "Tenant graph grounding",
    flow: "Agent flow actions",
    aiStandard: "Text/generative standard",
    content: "Content processing",
    voiceStandard: "Voice — Standard",
    autonomous: "Autonomous trigger",
    reasoning: "Reasoning-model premium"
  };

  // ── T-shirt sizing ────────────────────────────────────────────────────────
  // Size measures BUILD COMPLEXITY / effort — not credit cost (shown separately).
  // Difficulty is driven by INTEGRATION SURFACE, AUTONOMY and CHANNEL — not by
  // knowledge grounding (pointing at documents is near-trivial) and not by run
  // cost. Run cost (credits × volume) is reported separately; the two axes move
  // independently (e.g. document grounding is easy to build AND free per run).
  var SIZE_INFO = {
    XS: { label: "XS", name: "Extra small",
      desc: "Answering only — a grounded Q&A with no system actions. Documents/KB grounding is fine here.",
      effort: "Hours to stand up. One maker, no pro-dev.",
      govern: "Minimal — publish and monitor occasionally." },
    S: { label: "S", name: "Small",
      desc: "Q&A plus one system action or a single approval flow, touching one back-end system.",
      effort: "A few days. One maker.",
      govern: "Light — a shared environment and basic analytics." },
    M: { label: "M", name: "Medium",
      desc: "Generative orchestration over 2–4 actions across 1–2 systems, or a simple autonomous agent.",
      effort: "1–3 weeks. Maker + occasional pro-dev for connectors.",
      govern: "Moderate — ALM, connection references, DLP review." },
    L: { label: "L", name: "Large",
      desc: "5+ actions across 3+ systems, multi-step flows, autonomous triggers, or document processing.",
      effort: "1–2 months. Maker + pro-dev + reviewer.",
      govern: "Serious — managed solutions, environments, monitoring, DLP." },
    XL: { label: "XL", name: "Extra large",
      desc: "Voice or multi-agent, many actions across several systems, autonomous at high volume.",
      effort: "Multi-month program with a dedicated team.",
      govern: "Full ALM, security review, capacity planning, SRE-style ops." }
  };
  // Retained for the Solution-package (Complex) mode.
  function sizeForScore(score, opts) {
    opts = opts || {};
    var s = score <= 1 ? "XS" : score <= 3 ? "S" : score <= 6 ? "M" : score <= 9 ? "L" : "XL";
    if (opts.voice) { if (s === "XS" || s === "S" || s === "M") s = "L"; }
    if (opts.users >= 10000 && s !== "XL") {
      s = ({ XS: "S", S: "M", M: "L", L: "XL", XL: "XL" })[s];
    }
    return s;
  }
  var SIZE_ORDER = ["XS", "S", "M", "L", "XL"];
  // Driver-based sizing for the Quick mode. Returns {size, drivers:[...why]}.
  // Size = effort to DESIGN + STAND UP in Studio, driven by integration surface,
  // autonomy and channel. Knowledge grounding barely moves it (docs +0, tenant
  // graph +1) because it's near-trivial to configure — its RUN COST is modelled
  // separately in deriveQuick. Thresholds are calibrated so a single low-effort
  // capability never crosses a whole tier on its own.
  function sizeFromDrivers(v) {
    var score = 0, drivers = [];
    function add(pts, why) { score += pts; if (why) drivers.push({ pts: pts, why: why }); }
    var auto = v.archetype === "autonomous";
    var a = Math.max(0, v.actionsCount || 0);
    if (a >= 5) add(3, a + " actions");
    else if (a >= 2) add(2, a + " actions");
    else if (a === 1) add(1, "1 action");
    var sys = Math.max(0, v.systemsCount || 0);
    if (sys >= 3) add(2, sys + " back-end systems");
    else if (sys === 2) add(1, "2 back-end systems");
    // Generative orchestration only adds effort when there's something to
    // orchestrate (actions, an autonomous trigger, or a flow) — a plain
    // generative Q&A is not a "complex" build.
    if (v.orchestration === "generative" && (a >= 1 || auto || v.hasFlow))
      add(1, "generative orchestration");
    // Knowledge: docs/website/file grounding is near-zero build effort (0);
    // tenant-graph grounding needs Graph permissions + config (1).
    if (v.knowledge === "tenantGraph") add(1, "tenant-graph grounding");
    if (v.channel === "voice") add(3, "voice channel");
    if (auto) add(2, "autonomous / event-driven");
    if (v.hasFlow) add(1, "workflow / approval flow");
    if (v.hasContent) add(2, "document processing");
    if (v.hasAI) add(1, "generative content tool");
    if (v.hasEscalation) add(1, "human escalation / handoff");
    // Volume tier (build/ops complexity grows with scale).
    var vol = auto ? (v.events || 0) : Math.round((v.users || 0) * (v.interactions || 0));
    var volThresh = auto ? [2000, 20000] : [20000, 250000];
    if (vol >= volThresh[1]) add(2, "high volume");
    else if (vol >= volThresh[0]) add(1, "meaningful volume");

    var size = score <= 1 ? "XS" : score <= 2 ? "S" : score <= 5 ? "M" : score <= 8 ? "L" : "XL";
    if (v.channel === "voice" && SIZE_ORDER.indexOf(size) < SIZE_ORDER.indexOf("L")) size = "L";
    drivers.sort(function (x, y) { return y.pts - x.pts; });
    return { size: size, score: score, drivers: drivers.slice(0, 3).map(function (d) { return d.why; }) };
  }

  // ── Shared math ───────────────────────────────────────────────────────────
  function perInteractionCredits(profile) {
    return profile.reduce(function (sum, r) { return sum + r.uses * r.credits; }, 0);
  }
  // ── Harness-aware licensing ───────────────────────────────────────────────
  // A Microsoft 365 Copilot license can zero-rate interactive usage ONLY on the
  // standard and Copilot chat harnesses, and only inside M365 channels (embedded).
  // The GitHub Copilot harness is NEVER covered — every interaction (and building
  // and testing) bills Copilot Credits regardless of license. See MS Learn:
  // "Manage costs for agents powered by the GitHub Copilot harness".
  function harnessCovered(harness) { return harness !== "github-copilot"; }
  function grossUsers(scale) { return Math.max(0, Math.round(scale.users || 0)); }
  function billedUsers(scale) {
    var covered = harnessCovered(scale.harness) && scale.deployment === "embedded";
    var n = covered
      ? scale.users * (1 - (scale.licensePct || 0) / 100)
      : scale.users;
    return Math.max(0, Math.round(n));
  }
  // GitHub Copilot harness: Microsoft publishes NO per-action rate card for this harness — only
  // per-task credit RANGES by task complexity (Light 100–300 · Medium 300–500 · Heavy 500+), shown
  // ONLY in a diagram image on MS Learn ("Overview of billing for agents powered by the GitHub
  // Copilot harness"). A task BUNDLES LLM tokens + tools (knowledge/MCP) + the harness itself, so we
  // do NOT decompose the standard rate-card grid here. We price a task at the MID-BAND anchor of each
  // published range (not the ceiling) and surface the full band as a range; the base grid `per` is
  // ignored on this harness. ⚠️ Anchors are directional (image-sourced) — review before quoting.
  var GH_TIER_RANGE = { simple: [100, 300], medium: [300, 500], complex: [500, 800] };
  var GH_TIERS = { simple: 200, medium: 400, complex: 650 };
  var GH_DEFAULTS = { tier: "medium", perTask: 400, buildRuns: 40 };
  // A GitHub-harness "task" is a multistep reasoning run — NOT the same unit as a standard-harness
  // conversation/response. Users size volume in conversations, so we divide conversations by this
  // factor to estimate tasks (a task typically bundles several turns). Editable planning assumption.
  var CONV_PER_TASK = 4;
  function ghConvPerTask(v) { var n = parseFloat(v && v.conversationsPerTask); return (isFinite(n) && n > 0) ? n : CONV_PER_TASK; }
  function ghNum(x, d) { x = parseFloat(x); return isFinite(x) ? x : d; }
  function ghTierCredits(tier) {
    return Object.prototype.hasOwnProperty.call(GH_TIERS, tier) ? GH_TIERS[tier] : GH_TIERS[GH_DEFAULTS.tier];
  }
  // Map a build-complexity t-shirt size to the published GitHub task tier, so the GitHub
  // estimate follows the SCENARIO instead of always assuming the most expensive (Heavy) tier.
  // XS/S → Light (simple) · M → Medium · L/XL → Heavy (complex).
  function ghTierForSize(size) {
    if (size === "XS" || size === "S") return "simple";
    if (size === "M") return "medium";
    return "complex"; // L, XL
  }
  // Effective per-task credits on the GitHub harness. Precedence:
  //   1) explicit (edited) per-task value wins;
  //   2) if a MODEL is selected → canonical token build-up (overhead + payload/turn × turns,
  //      floored to the published Light band). Tools/actions are NOT added on top: Microsoft's
  //      per-task bands (which the floor anchors to) already BUNDLE tokens + tools + the harness,
  //      so adding the feature profile would double-count. This also keeps the estimator's
  //      per-task exactly consistent with the standalone comparator.
  //   3) otherwise the legacy flat tier anchor (model-blind, back-compat default).
  function ghPerTask(per, v) {
    v = v || {};
    var explicit = parseFloat(v.ghPerTask);
    if (isFinite(explicit) && explicit >= 0) return explicit;
    if (v.model) return modelTokenCredits(v);
    return ghTierCredits(v.ghTier || GH_DEFAULTS.tier);
  }
  function effPerInteraction(per, harness, v) {
    return harness === "github-copilot" ? ghPerTask(per, v) : per;
  }
  function ghBuildTestCredits(perTask, harness, v) {
    if (harness !== "github-copilot") return 0;
    var runs = Math.max(0, ghNum((v || {}).ghBuildRuns, GH_DEFAULTS.buildRuns));
    return Math.round(runs * perTask);
  }
  function computeEstimate(profile, scale) {
    var per = perInteractionCredits(profile);
    var harness = scale.harness || "standard";
    var effPer = effPerInteraction(per, harness, scale);
    if (harness === "github-copilot") {
      // GitHub bills per TASK, never covered. Volume is entered in conversations, so convert to
      // tasks via the conversations-per-task factor (a task bundles several turns).
      var cptE = ghConvPerTask(scale);
      var tasksE = grossUsers(scale) * (scale.interactions || 0) / cptE;
      var mE = tasksE * effPer;
      return { perInteraction: effPer, basePerInteraction: per, billed: grossUsers(scale), monthly: mE,
        grossMonthly: mE, netMonthly: mE, perTask: effPer, tasksPerMonth: Math.round(tasksE), conversationsPerTask: cptE,
        buildTestCredits: ghBuildTestCredits(effPer, harness, scale), covered: false, harness: harness };
    }
    var billed = billedUsers(scale);
    var gross = grossUsers(scale);
    var net = billed * scale.interactions * effPer;
    var grossMonthly = gross * scale.interactions * effPer;
    return { perInteraction: effPer, basePerInteraction: per, billed: billed, monthly: net,
      grossMonthly: grossMonthly, netMonthly: net, perTask: effPer,
      buildTestCredits: ghBuildTestCredits(effPer, harness, scale),
      covered: grossMonthly - net > 0.0001, harness: harness };
  }
  function creditRange(monthly) {
    return { low: monthly * 0.6, mid: monthly, high: monthly * 1.6 };
  }
  function costUSD(credits) {
    return { payg: credits * RATE_PAYG, prepaid: credits * RATE_PREPAID };
  }

  // ── GitHub Copilot ⇄ M365 Copilot cost-structure comparator ────────────────
  // Grounds the "which cost structure wins" question (Sugan's Token-vs-Credit doc):
  //   • M365 / Studio meters per EVENT — a grounded interaction ≈ generative answer (2)
  //     + tenant-graph grounding (10) = 12 credits, FLAT regardless of payload size.
  //   • GitHub Copilot meters per TOKEN — cost scales continuously with payload × model rate.
  // So payload size drives GitHub; interaction/turn count drives M365. There is an
  // input-token CROSSOVER per interaction (~30–40K on Sonnet-class, per the doc) below
  // which GitHub is cheaper and above which the flat M365 event wins.
  // Inputs (all optional): model, inputTokens, outputTokens (default 10% of input),
  // turns (interactions to finish the job), cacheHitPct, grounded (default true),
  // generativeCredits / groundingCredits overrides.
  function comparePlatforms(v) {
    v = v || {};
    var rate = modelRate(v.model);
    var turns = turnsPerTask(v);
    var hit = clamp01(numOr(v.cacheHitPct, 0) / 100);
    var overhead = numOr(v.harnessOverhead, HARNESS_OVERHEAD_TOKENS);
    var payload = payloadPerTurn(v);
    // GitHub side — canonical per-turn + overhead task model, floored to the Light band.
    var gh = ghTaskCredits(v);
    var outPerTurn = numOr(v.outputTokensPerTurn, numOr(v.outputTokens, Math.max(500, Math.round((overhead + payload) * 0.1))));
    // M365 side — per-event, payload-independent: generative (2) + grounding by TYPE.
    //   none/docs = 0 extra (a plain or file-grounded answer) · tenant-graph = 10 · connector action = 5.
    var genAnswer = numOr(v.generativeCredits, CREDIT.generative); // 2
    var groundingType = v.groundingType || (v.grounded === false ? "none" : "tenant");
    var GROUNDING = { none: 0, docs: 0, tenant: CREDIT.tenantGraph, action: CREDIT.action };
    var grounding = GROUNDING[groundingType] != null ? GROUNDING[groundingType] : 0;
    var m365PerTurn = genAnswer + grounding;
    var m365PerJob = m365PerTurn * turns;
    // Crossover — the PAYLOAD read per turn (excluding fixed overhead) at which one GitHub turn
    // costs the same as one M365 event. Below it GitHub is cheaper per turn; above it M365 is.
    var effInRate = rate.in * (1 - hit) + rate.cached * hit;
    var perKcost = effInRate + 0.1 * rate.out; // per 1K of (overhead + payload), assuming ~10% output
    var crossoverPayloadTokens = perKcost > 0 ? Math.max(0, (m365PerTurn * 1000) / perKcost - overhead) : Infinity;
    return {
      model: v.model || MODEL_DEFAULT, modelLabel: (rate.label || v.model || MODEL_DEFAULT),
      rateSource: rate.rateSource || "direct", proxyOf: rate.proxyOf || null,
      payloadPerTurn: payload, harnessOverhead: overhead, outputTokensPerTurn: outPerTurn,
      inputTokens: payload, outputTokens: outPerTurn, // per-turn (for messaging / back-compat)
      turns: turns, cacheHitPct: hit * 100,
      groundingType: groundingType, grounded: groundingType === "tenant",
      m365PerTurn: m365PerTurn, ghcpPerTurn: gh.perTurn,
      m365PerJob: m365PerJob, ghcpPerJob: gh.taskCredits, ghFloored: gh.floored,
      crossoverInputTokens: crossoverPayloadTokens, crossoverPayloadTokens: crossoverPayloadTokens,
      cheaper: gh.taskCredits <= m365PerJob ? "github" : "m365"
    };
  }

  // ── Natural-language intake for the comparator ─────────────────────────────
  // Lets a non-savvy user describe an agent in plain English; we infer the two axes the
  // comparator needs (payload size per turn, turns to finish) plus model + grounding, each
  // with a plain rationale and a coarse bucket for plain-language chips. Reuses analyzeText's
  // tested detection. Editable downstream — directional planning input, not a measurement.
  var PAYLOAD_LARGE_RE = /\b(manual|handbook|entire (document|manual|report|contract|file)|whole (document|manual|report|contract|file)|long (document|report|contract|transcript|email thread)|transcript|contract|large (context|document|file|volume)|hundreds of pages|multi[- ]?page|book|lengthy|big document|full (report|document|transcript)|knowledge across|many documents|large corpus)\b/;
  var PAYLOAD_MEDIUM_RE = /\b(document|policy|policies|knowledge ?base|sharepoint|pdf|wiki|articles?|our files|internal docs?|procedure|guideline|catalog|product (docs|info|details|manuals?)|a few (files|documents|pages)|reference)\b/;
  var PAYLOAD_SMALL_RE = /\b(faq|quick|short|simple answer|simple (faq|bot)|in the moment|one[- ]?liner|status|single (field|value|record)|look ?ups?|small)\b/;
  var PAYLOAD_BREADTH_RE = /\b(library|catalog|corpus|across (our|the|all|multiple)|multiple (docs|documents|sources|systems)|many documents|entire (library|catalog)|whole (library|catalog))\b/;
  var PAYLOAD_DRAFT_RE = /\b(draft(s|ing)?|write(s)?|compose|author|proposal(s)?|summari[sz]e(s)?|report|memo|generate (a|an|the))\b/;
  var OUTPUT_LOW_RE = /\b(categori[sz]e(s|d)?|classif|routes?|route it|extract(s|ing)?|validate(s|d)?|look ?ups?|status|reset(s)?|creates? (a )?(ticket|record|incident|case))\b/;
  // Component-based per-turn payload: a knowledge-context base + breadth (a whole library) +
  // source to draft from + per-action tool context. Continuous (not three hard buckets) so
  // genuinely-different agents get genuinely-different GitHub-harness costs, not one round number.
  function detectPayload(t, v) {
    v = v || {};
    // Explicit tokens or pages win (interpreted as PAYLOAD read per turn).
    var tok = t.match(/(\d[\d,\.]*)\s*(k|thousand)?\s*tokens?/);
    if (tok) { var n = parseFloat(tok[1].replace(/,/g, "")); if (/k|thousand/i.test(tok[2] || "")) n *= 1000; if (n > 0) return { tokens: Math.round(n), bucket: n >= 80000 ? "large" : n >= 25000 ? "some" : "little", why: "from \u201C" + tok[0].trim() + "\u201D" }; }
    var pages = t.match(/(\d[\d,\.]*)\s*(?:-|\s)?pages?/);
    if (pages) { var p = parseFloat(pages[1].replace(/,/g, "")); if (p > 0) { var tk = Math.round(p * 650); return { tokens: tk, bucket: tk >= 80000 ? "large" : tk >= 25000 ? "some" : "little", why: "~" + p + " page(s) of content" }; } }
    var base, why;
    if (PAYLOAD_LARGE_RE.test(t)) { base = 100000; why = "reads a large document each turn"; }
    else if (v.knowledge === "tenantGraph") { base = 30000; why = "reads Microsoft 365 (Graph) records"; }
    else if (v.knowledge === "docs" || PAYLOAD_MEDIUM_RE.test(t)) { base = 45000; why = "reads from files / a knowledge base"; }
    else if (PAYLOAD_SMALL_RE.test(t)) { base = 16000; why = "short prompts / quick answers"; }
    else { base = 30000; why = "a moderate amount of context per turn"; }
    if (PAYLOAD_BREADTH_RE.test(t)) { base += 25000; why += ", across a broad library"; }
    if (PAYLOAD_DRAFT_RE.test(t)) { base += 22000; why += " + source to draft from"; }
    var acts = Math.max(0, v.actionsCount || 0);
    if (acts > 0) base += acts * 6000; // each connector re-sends its tool schema / results
    var tokens = Math.min(160000, Math.round(base));
    return { tokens: tokens, bucket: tokens >= 80000 ? "large" : tokens >= 25000 ? "some" : "little", why: why };
  }
  // High cache reuse: the agent re-sends the SAME context across many turns (system prompt +
  // tools + knowledge / conversation history), so most input is served from cache (~10x cheaper).
  // This is the lever that can make the token-metered GitHub harness beat flat per-event M365 cost.
  var CACHE_REUSE_RE = /\b(re-?us(e|es|ing|ed)|over and over|repeatedly|cached?|cache[- ]?hit|persistent context|long[- ]?running (chat|session|conversation|thread)|keeps? the same context|same (tenant )?(context|thread|conversation)|same context (over|across)|reusing the same)\b/;
  function detectCache(t) {
    if (CACHE_REUSE_RE.test(t)) return { pct: 90, why: "re-uses the same context across turns (mostly served from cache)" };
    return { pct: 0, why: null };
  }
  function inferComparatorInputs(text) {
    var t = " " + String(text || "").toLowerCase() + " ";
    var v = analyzeText(text).vars;
    var payload = detectPayload(t, v);
    // Turns to finish one job — from orchestration depth / step count / multi-step language.
    var steps = (v.actionsCount || 0) + (v.hasFlow ? 1 : 0) + (v.hasAI ? 1 : 0);
    var multiStep = /\b(multi[- ]?step|several steps|step[- ]?by[- ]?step|each step|back and forth|iterat|orchestrat|many steps|works? through|walk(s)? through|troubleshoot|diagnos|investigat|loop through|go through each)\b/.test(t);
    var turnsBucket, turnsWhy;
    if (multiStep || (v.orchestration === "generative" && steps >= 3)) { turnsBucket = "many"; turnsWhy = "many steps / back-and-forth to finish"; }
    else if (steps >= 1 || v.orchestration === "generative") { turnsBucket = "few"; turnsWhy = "a few steps to finish"; }
    else { turnsBucket = "one"; turnsWhy = "usually one-and-done"; }
    // Granular turn COUNT within the bucket — driven by real step signals, so distinct agents
    // don't all collapse onto the same anchor (2 / 6 / 15).
    var acts = Math.max(0, v.actionsCount || 0);
    var turns = turnsBucket === "one" ? 2
      : turnsBucket === "many" ? Math.min(18, 12 + acts)
      : Math.min(9, 3 + acts + (v.hasFlow ? 1 : 0) + (v.hasAI ? 1 : 0));
    var mi = inferModel("github-copilot", text, v);
    // M365 grounding TYPE: tenant-graph (10) if M365 tenant data; connector action (5) if it acts
    // in a system; docs (0 extra) if file/KB grounded; else none.
    var groundingType, groundingWhy;
    if (v.knowledge === "tenantGraph") { groundingType = "tenant"; groundingWhy = "reads across your Microsoft 365 (Graph) data"; }
    else if ((v.actionsCount || 0) >= 1) { groundingType = "action"; groundingWhy = "takes an action in a system (connector)"; }
    else if (v.knowledge === "docs") { groundingType = "docs"; groundingWhy = "answers from your files / knowledge base"; }
    else { groundingType = "none"; groundingWhy = "just answers \u2014 no company data or actions"; }
    // Output tokens / turn — drafting/generation writes a lot; classify/extract/route writes little.
    var outputPerTurn = PAYLOAD_DRAFT_RE.test(t) ? 6000
      : OUTPUT_LOW_RE.test(t) ? 1200
      : Math.max(1200, Math.min(8000, Math.round(payload.tokens * 0.08)));
    var cache = detectCache(t);
    return {
      payloadTokens: payload.tokens,          // per-turn payload
      inputTokens: payload.tokens,            // alias
      outputTokensPerTurn: outputPerTurn,
      turns: turns,
      cacheHitPct: cache.pct,
      model: mi.model || MODEL_DEFAULT,
      groundingType: groundingType,
      grounded: groundingType === "tenant",
      payloadBucket: payload.bucket,
      turnsBucket: turnsBucket,
      why: {
        payload: payload.why,
        turns: turnsWhy,
        model: mi.why,
        grounding: groundingWhy,
        cache: cache.why
      }
    };
  }
  // Regime-aware monthly consumption for the Quick mode.
  // interactive: billedUsers × interactions/user/month × perUnit (embedded licensing applies).
  // autonomous:  events/month × perUnit (billed regardless of licensing — no discount).
  function computeQuick(profile, v) {
    var per = perInteractionCredits(profile);
    var harness = v.harness || "standard";
    var effPer = effPerInteraction(per, harness, v);
    if (v.archetype === "autonomous") {
      var events = Math.max(0, Math.round(v.events || 0));
      var m = events * effPer;
      // Autonomous events bill per event with no license discount on ANY harness → net == gross.
      return { regime: "autonomous", perUnit: effPer, basePerUnit: per, units: events, billed: null,
        monthly: m, grossMonthly: m, netMonthly: m, covered: false, harness: harness,
        perTask: effPer, buildTestCredits: ghBuildTestCredits(effPer, harness, v) };
    }
    var scale = { deployment: v.deployment, users: v.users, licensePct: v.licensePct, harness: harness };
    var gross = grossUsers(scale);
    var interactions = Math.max(0, v.interactions || 0);
    if (harness === "github-copilot") {
      // GitHub bills per TASK and is never covered. Convert the conversation volume the user entered
      // into tasks (a task bundles several turns) so the per-task rate isn't applied to every turn.
      var cptQ = ghConvPerTask(v);
      var tasksQ = gross * interactions / cptQ;
      var mQ = tasksQ * effPer;
      return { regime: "interactive", perUnit: effPer, basePerUnit: per, units: Math.round(tasksQ), billed: gross,
        monthly: mQ, grossMonthly: mQ, netMonthly: mQ, perTask: effPer, tasksPerMonth: Math.round(tasksQ), conversationsPerTask: cptQ,
        buildTestCredits: ghBuildTestCredits(effPer, harness, v), covered: false, coveredUsers: 0, harness: harness };
    }
    var billed = billedUsers(scale);
    var escExtra = ((v.escalation || 0) / 100) * (v.escalationCredits || 0);
    var rate = (effPer + escExtra);
    var net = billed * interactions * rate;
    var grossMonthly = gross * interactions * rate;
    return { regime: "interactive", perUnit: effPer, basePerUnit: per, units: billed * interactions, billed: billed,
      monthly: net, grossMonthly: grossMonthly, netMonthly: net, perTask: effPer,
      buildTestCredits: ghBuildTestCredits(effPer, harness, v),
      covered: grossMonthly - net > 0.0001, coveredUsers: gross - billed, harness: harness };
  }

  // "Why this cost" — structured drivers ranked by monthly-credit impact. Volume
  // is the master multiplier (led first); then the biggest per-run credit lines.
  // Returns plain data; the UI formats it (keeps this engine DOM-free).
  function costDrivers(profile, v) {
    var auto = v.archetype === "autonomous";
    var out = [];
    if (auto) {
      out.push({ kind: "volume", label: "events / month",
        value: Math.max(0, Math.round(v.events || 0)), unit: (v.eventUnit || "event") });
    } else {
      var billed = billedUsers({ deployment: v.deployment, users: v.users, licensePct: v.licensePct });
      out.push({ kind: "volume", label: "reach", value: billed, unit: "billed user",
        per: Math.max(0, v.interactions || 0) });
    }
    (profile || []).map(function (r) { return { name: r.name, credits: (r.uses || 0) * (r.credits || 0) }; })
      .filter(function (r) { return r.credits > 0; })
      .sort(function (a, b) { return b.credits - a.credits; })
      .slice(0, 3)
      .forEach(function (r) {
        out.push({ kind: "line", label: r.name, value: r.credits, unit: auto ? "cr/run" : "cr/turn" });
      });
    return out;
  }

  // ── Number/scale parsing for the Quick mode ───────────────────────────────
  function parseCount(numStr, suffix) {
    var n = parseFloat(String(numStr).replace(/[,\s]/g, ""));
    if (!isFinite(n)) return null;
    var s = (suffix || "").toLowerCase();
    if (s === "k" || s === "thousand") n *= 1e3;
    else if (s === "m" || s === "million") n *= 1e6;
    return Math.round(n);
  }
  function detectUsers(t) {
    var m = t.match(/([\d][\d,\.]*)\s*(k|thousand|million|m)?\s*\+?\s*(users|employees|people|staff|agents|reps|representatives|customers|callers|associates|workers|seats|members|clients|advisors)/);
    if (m) { var v = parseCount(m[1], m[2]); if (v) return { value: v, why: "from “" + m[0].trim() + "”" }; }
    var wn = t.match(/\b(dozens|hundreds|thousands|millions)\s+of\s+(users|employees|people|staff|agents|reps|representatives|customers|callers|associates|workers|seats|members|clients|advisors)/);
    if (wn) { var wv = { dozens: 50, hundreds: 500, thousands: 5000, millions: 1000000 }[wn[1]]; return { value: wv, why: "“" + wn[0].trim() + "”" }; }
    if (/\b(entire|whole|across the|company[- ]wide|enterprise[- ]wide|all employees|everyone|global)\b/.test(t) &&
        /\b(company|organi[sz]ation|org|enterprise|firm|business|workforce)\b/.test(t))
      return { value: 5000, why: "company-wide language" };
    if (/\benterprise\b/.test(t)) return { value: 25000, why: "“enterprise” scale" };
    if (/\b(department|division|business unit|region)\b/.test(t)) return { value: 500, why: "department-scale language" };
    if (/\b(team|small group|pilot|squad|pod)\b/.test(t)) return { value: 25, why: "team/pilot language" };
    return { value: 500, why: "default assumption" };
  }
  function detectInteractions(t) {
    if (/\b(constantly|all day|high[- ]volume|hundreds of times|many times a day|around the clock|24\/7)\b/.test(t)) return { value: 40, why: "very high frequency" };
    if (/\b(daily|every day|each day|throughout the day|per day)\b/.test(t)) return { value: 20, why: "daily use" };
    if (/\b(several times a week|few times a week|weekly|each week|every week|per week)\b/.test(t)) return { value: 6, why: "weekly use" };
    if (/\b(monthly|once a month|per month|a month|occasional|occasionally|rarely|now and then|infrequent|seldom)\b/.test(t)) return { value: 1, why: "occasional use" };
    return { value: 10, why: "default assumption" };
  }
  function detectDeployment(t) {
    if (/\b(public|customer[- ]facing|external|website|web ?site|web ?widget|web ?chat|portal|anonymous|visitors?|callers?|the public|consumers?)\b/.test(t))
      return { value: "standalone", why: "public / external audience" };
    if (/\b(teams|microsoft 365|m365|intranet|internal|employees|staff|colleagues|our people)\b/.test(t))
      return { value: "embedded", why: "internal Teams / M365 audience" };
    return { value: "embedded", why: "default assumption" };
  }

  // ── Archetype + autonomous-volume detection (Quick mode) ──────────────────
  var EVENT_NOUNS = "e-?mails?|messages?|orders?|tickets?|cases?|requests?|invoices?|receipts?|documents?|forms?|records?|transactions?|leads?|applications?|submissions?|files?|alerts?|claims?|inquir(?:y|ies)|reviews?|posts?|entries";
  // Strong autonomous cues — an event or schedule fires the agent (no human per run).
  var AUTO_STRONG = new RegExp(
    "\\b(every ?time|each ?time|whenever|any ?time|as soon as|on (?:a |an |each |every )?new\\b|" +
    "when\\b[^.]{0,30}?(?:comes? in|arrives?|is (?:received|submitted|created|added|logged|raised|placed|opened|uploaded|filed)|are (?:received|submitted|created|added|logged))|" +
    "incoming|arrives?\\b|nightly|hourly|scheduled|daily batch|\\bbatch\\b|unattended|in the background|behind the scenes|" +
    "trigger(?:ed|s)? (?:by|when|on|whenever)|for each (?:" + EVENT_NOUNS + "))\\b");
  // Weak cues — only autonomous when NO interactive signal is present.
  var AUTO_WEAK = /\b(automatically|autonomous(?:ly)?|monitors?|watch(?:es|ing)?|scans?|listens? for|polls?)\b/;
  var INTERACTIVE_CUE = new RegExp(
    "\\b(answers?|ask(?:s|ed|ing)?|questions?|q ?& ?a|chat ?bot|chats? with|in teams|self[- ]serve|" +
    "conversation|talk to|speak (?:to|with)|help(?:s)? (?:employees|staff|users|customers|people|sellers|agents|reps|callers)|" +
    "respond to (?:users|employees|customers|questions|people))\\b");
  var VOICE_RE = /\b(voice|call ?cent(?:er|re)|contact ?cent(?:er|re)|\bphone\b|\bivr\b|telephony|spoken|speech|hotline|over the phone)\b/;

  function detectArchetype(t) {
    if (AUTO_STRONG.test(t)) return "autonomous";
    if (AUTO_WEAK.test(t) && !INTERACTIVE_CUE.test(t)) return "autonomous";
    return "interactive";
  }

  function detectEventVolume(t) {
    // Allow up to two adjective words between the number and the event noun
    // ("5000 loan applications"). The (?![a-z]) guard stops the "m" million
    // suffix from eating the start of a word like "monthly".
    var gap = "(?:[a-z][a-z-]*\\s+){0,2}?";
    var re = new RegExp("([\\d][\\d,\\.]*)\\s*(k|thousand|million|m)?(?![a-z])\\s*\\+?\\s*" + gap + "(" + EVENT_NOUNS + ")\\b[\\s\\S]{0,24}?(?:per|a|each|every|/)\\s*(day|week|month|quarter|year|hour)");
    var m = t.match(re);
    var unit, period, value = null, why;
    if (m) {
      value = parseCount(m[1], m[2]);
      unit = m[3].replace(/s$/, "").replace("e-mail", "email");
      period = m[4];
      why = "from “" + m[0].trim().replace(/\s+/g, " ") + "”";
    } else {
      // number + event-noun without an explicit period, e.g. "100 emails"
      var re2 = new RegExp("([\\d][\\d,\\.]*)\\s*(k|thousand|million|m)?(?![a-z])\\s*\\+?\\s*" + gap + "(" + EVENT_NOUNS + ")\\b");
      var m2 = t.match(re2);
      if (m2) {
        value = parseCount(m2[1], m2[2]);
        unit = m2[3].replace(/s$/, "").replace("e-mail", "email");
        period = /\b(per|a|each|every)\s*(day|week|month|year|hour)\b/.test(t) ? (t.match(/\b(?:per|a|each|every)\s*(day|week|month|year|hour)\b/) || [])[1] : "month";
        why = "from “" + m2[0].trim() + "” (assumed per " + period + ")";
      }
    }
    if (value == null) {
      // word-number volumes, e.g. "thousands of tickets a day" or
      // "thousands of loan applications each month" (adjective between).
      var wnGap = "(?:[a-z][a-z-]*\\s+){0,2}?";
      var wn = t.match(new RegExp("(dozens|hundreds|thousands|millions)\\s+of\\s+" + wnGap + "(" + EVENT_NOUNS + ")"));
      if (wn) {
        value = { dozens: 50, hundreds: 500, thousands: 5000, millions: 1000000 }[wn[1]];
        unit = wn[2].replace(/s$/, "").replace("e-mail", "email");
        period = (t.match(/\b(?:per|a|each|every)\s*(day|week|month|year|hour)\b/) || [null, "month"])[1];
        why = "from “" + wn[0].trim().replace(/\s+/g, " ") + "” (assumed per " + period + ")";
      } else {
        // bare rate not adjacent to the noun, e.g. "…support tickets…, 5000/month".
        var nm0 = t.match(new RegExp("\\b(" + EVENT_NOUNS + ")\\b"));
        var br = t.match(/([\d][\d,\.]*)\s*(k|thousand|million|m)?(?![a-z])\s*(?:per|\/|a |each |every )\s*(day|week|month|quarter|year|hour)/);
        if (nm0 && br) {
          value = parseCount(br[1], br[2]);
          unit = nm0[1].replace(/s$/, "").replace("e-mail", "email");
          period = br[3];
          why = "from “" + br[0].trim() + "” (" + unit + "s)";
        } else {
          // find the most likely event noun for labelling even without a number
          unit = nm0 ? nm0[1].replace(/s$/, "").replace("e-mail", "email") : "event";
          return { value: 500, unit: unit, why: "default assumption (per month)" };
        }
      }
    }
    var toMonth = { hour: 730, day: 30, week: 4.33, month: 1, quarter: 1 / 3, year: 1 / 12 };
    var mult = toMonth[period] != null ? toMonth[period] : 1;
    return { value: Math.max(1, Math.round(value * mult)), unit: unit, why: why };
  }

  // ── Quick build-step catalog ──────────────────────────────────────────────
  // Each detector maps description language to a concrete Studio build step.
  // category drives how the step is counted for cost + sizing:
  //   answer_gen · action · content · ai · flow
  var STEP_CATALOG = [
    { id: "classify", category: "answer_gen",
      label: "Classify / categorize the item",
      build: "A generative answer (or prompt tool) reads the item and assigns a category, priority, or intent.",
      kws: [/\bcategori[sz]/, /\bclassif/, /\btag(s|ged|ging)?\b/, /\blabel(s|led|ling)?\b/, /\btriage/, /\bsort(s|ing)? (into|by|the)/, /\bidentif(y|ies) (the )?(type|category|intent|topic)/, /\bdetermine (the )?(type|category|priority|intent)/, /\bprioriti[sz]/] },
    { id: "answer", category: "answer_gen",
      label: "Answer questions from your content",
      build: "Generative answers grounded on your knowledge (SearchAndSummarizeContent).",
      kws: [/\banswer/, /\bquestion/, /\bfaq/, /\bask(s|ed|ing)?\b/, /\bexplain/, /\bguidance/, /\bhelp (with|me|employees|users|customers|staff|resolve|answer)/, /\brespond to/, /\binquir/, /\bclarif/, /\bwhat (is|are|does)/, /\bhow (do|to|can)/, /\bq ?& ?a\b/, /\bself[- ]serve/] },
    { id: "route", category: "action",
      label: "Route / assign to the right owner",
      build: "A connector action routes or assigns the item to the correct queue, team, or person.",
      kws: [/\broutes?\b/, /\brouting/, /\bassign/, /\bforward/, /\bdispatch/, /\bhand(s|ed)? ?off/, /\bhand(s|ed)? it (to|over)/, /\bdirect(s|ed)? (it|them|the) to/, /\bdeliver(s|ed)? (it|them|the) to/, /\bsend(s|ing)? (it|them|the) to (the )?(right|correct|appropriate|relevant)/] },
    { id: "create", category: "action",
      label: "Create a record (ticket / case / order)",
      build: "A connector action writes a record — ServiceNow, Salesforce, Dynamics, Jira, SAP, etc.",
      kws: [/\bcreates? (a|an)? ?(ticket|case|record|incident|request|order|entry|item|lead)/, /\bopens? (a|an)? ?(ticket|case|incident|request|record)/, /\blogs? (a|an)? ?(case|ticket|request)/, /\braises? (a|an)? ?(ticket|request)/, /\bfiles? (a|an)? ?(ticket|case|claim)/, /\bplac(?:e|es|ing) (an? )?order/, /\bgenerates? (a|an)? ?(ticket|case|record|order|incident)/] },
    { id: "update", category: "action",
      label: "Look up / update a record",
      build: "A connector action reads or updates a record in a line-of-business system.",
      kws: [/\bupdate(s|d)?\b/, /\blooks? ?up/, /\bretriev/, /\bfetch/, /\bgets? (the )?(status|details|record|data|info)/, /\bchecks? (the )?(status|inventory|stock|availability|balance|account|order|details|record)/, /\bpulls? (the )?(record|data|details)/, /\bmodif(y|ies)/, /\bsets? (the )?status/, /\bcross[- ]?reference/, /\bverif(y|ies)/, /\bvalidat(e|es|ing|ion)/, /\breconcil(e|es|ing|iation)/, /\bconfirm(s|ed|ing)?\b/, /\bflag(s|ged|ging)?\b/] },
    { id: "notify", category: "action",
      label: "Send a notification / email",
      build: "A connector action sends an email, Teams message, or notification.",
      kws: [/\bnotif(y|ies|ication)/, /\bsend(s|ing)? (an? )?(email|e-?mail|message|reply|notification|alert|summary|confirmation|response|acknowledg|note|update)/, /\bemail(s)? (the|them|back|to|it)/, /\breplies?\b/, /\bpost(s|ing)? (to|a|in) (teams|slack|channel)/, /\balert(s)? (the|them|when)/, /\backnowledg/] },
    { id: "provision", category: "action",
      label: "Perform a system action (reset / provision / book)",
      build: "A connector action performs an operation — reset password, provision access, book, cancel.",
      kws: [/\breset (the )?password/, /\bprovision/, /\bgrant (access|permission)/, /\bbook(ing|s)?\b/, /\bcancel/, /\breschedul/, /\bunlock/, /\bonboard/] },
    { id: "extract", category: "content",
      label: "Extract data from documents",
      build: "Content-processing / prompt tools extract and validate fields — ~8 credits per page.",
      kws: [/\binvoice/, /\breceipt/, /\bextract (from|data|fields|the)/, /\bocr\b/, /\bscanned (document|form|image)/, /\bread the document/, /\bfields? from/, /\bprocess forms?/, /\bcontract (review|analysis)/, /\bparse (the )?(document|pdf|invoice|form)/] },
    { id: "draft", category: "ai",
      label: "Generate / draft content",
      build: "A prompt (GPT) tool drafts, rewrites, translates, or summarizes text.",
      kws: [/\bdraft/, /\bwrite (a|an|up|me)/, /\bcompose/, /\brewrite/, /\btranslate/, /\bsummari[sz]e/, /\bbrainstorm/, /\bgenerate (a|an|content|text|copy|summary|response)/, /\bproposal/, /\bmarketing copy/] },
    { id: "approve", category: "flow",
      label: "Run an approval / multi-step flow",
      build: "An agent flow (Power Automate) runs a multi-step approval or automated sequence.",
      kws: [/\bapprovals?\b/, /\bapprove/, /\bmulti[- ]step/, /\bworkflow/, /\bpipeline/, /\bautomat(e|es|ed|ion) (the )?(process|steps|sequence)/, /\bkick off (a )?(process|flow)/, /\bsign[- ]?off/] }
  ];

  var SYSTEM_PATTERNS = [
    [/servicenow/, "ServiceNow"], [/salesforce|\bsfdc\b/, "Salesforce"], [/dynamics|\bd365\b/, "Dynamics 365"],
    [/\bsap\b/, "SAP"], [/\bjira\b/, "Jira"], [/workday/, "Workday"], [/zendesk/, "Zendesk"],
    [/oracle/, "Oracle"], [/\bsql\b|database/, "database"], [/sharepoint/, "SharePoint"],
    [/outlook|exchange|\bmail\b|inbox/, "Outlook / Exchange"], [/\bteams\b/, "Teams"],
    [/power ?bi/, "Power BI"], [/\bcrm\b/, "CRM"], [/\berp\b/, "ERP"], [/confluence/, "Confluence"]
  ];
  function detectSystems(t) {
    var found = [];
    SYSTEM_PATTERNS.forEach(function (p) { if (p[0].test(t) && found.indexOf(p[1]) < 0) found.push(p[1]); });
    return found;
  }
  function detectKnowledge(t) {
    if (/\b(microsoft 365|m365|tenant graph|across (the|our) tenant|org chart|employee directory|people data|teams messages|their (emails?|calendar)|enterprise data|company data across)\b/.test(t))
      return { type: "tenantGraph", label: "Microsoft 365 tenant graph", why: "M365 tenant data referenced" };
    if (/\b(document|polic(y|ies)|knowledge ?base|sharepoint|pdf|manual|handbook|wiki|articles?|our files|internal docs?|procedure|guideline|knowledge|catalog|product (docs|info|details|manuals?))\b/.test(t))
      return { type: "docs", label: "Documents / knowledge base", why: "document knowledge referenced" };
    return { type: "none", label: "None", why: "no knowledge source detected" };
  }
  function extractSteps(t) {
    var steps = [];
    STEP_CATALOG.forEach(function (s) {
      if (s.kws.some(function (re) { return re.test(t); })) steps.push(s);
    });
    return steps;
  }

  function row(key, name, uses, credits, note) {
    return { key: key, name: name, uses: uses, credits: credits, note: note };
  }

  // Build the per-unit credit profile from the (editable) variables.
  function deriveQuick(v) {
    var profile = [];
    var auto = v.archetype === "autonomous";
    var actionsCount = Math.max(0, v.actionsCount || 0);
    var genAnswers = Math.max(0, v.genAnswers || 0);

    if (v.channel === "voice") {
      // Voice is billed per minute; the per-minute rate already INCLUDES the classic /
      // generative answer and agent actions during the call, so those rows are suppressed.
      var voiceMin = Math.max(1, v.voiceMinutes || VOICE_MIN_PER_CONVO);
      profile.push(row("voiceStandard", ROW.voiceStandard, voiceMin, CREDIT.voiceStandard, "voice — per minute (generative orchestration)"));
    } else if (!auto) {
      if (v.answerType === "generative")
        profile.push(row("generative", ROW.generative, Math.max(1, genAnswers), CREDIT.generative, "generative answer"));
      else
        profile.push(row("classic", ROW.classic, 1, CREDIT.classic, "classic answer"));
    } else if (genAnswers > 0) {
      profile.push(row("generative", ROW.generative, genAnswers, CREDIT.generative, genAnswers + " generative step(s)"));
    }

    if (v.knowledge === "tenantGraph")
      profile.push(row("tenantGraph", ROW.tenantGraph, 1, CREDIT.tenantGraph, "tenant-graph grounding"));

    var actionUses = (auto ? 1 : 0) + actionsCount;
    // Voice inclusion rule: agent actions during a voice call are already covered by the
    // per-minute voice rate — don't stack them on top.
    if (actionUses > 0 && v.channel !== "voice")
      profile.push(row("action", ROW.action, actionUses, CREDIT.action,
        actionUses + " agent action(s)" + (auto ? " incl. autonomous trigger" : "")));

    if (v.hasContent)
      profile.push(row("content", ROW.content, Math.max(1, v.pagesPerDoc || 1), CREDIT.contentPage, "document processing (per page)"));
    if (v.hasAI) {
      var aiTier = v.aiTier || "standard";
      var aiCredit = aiTier === "basic" ? CREDIT.aiBasic : aiTier === "premium" ? CREDIT.aiPremium : CREDIT.aiStandard;
      var aiName = aiTier === "basic" ? "Text/generative basic" : aiTier === "premium" ? "Text/generative premium" : ROW.aiStandard;
      var aiKey = aiTier === "basic" ? "aiBasic" : aiTier === "premium" ? "aiPremium" : "aiStandard";
      profile.push(row(aiKey, aiName, 1, aiCredit, "generative content tool — " + aiTier + " tier"));
    }
    if (v.hasFlow)
      profile.push(row("flow", ROW.flow, Math.max(1, v.flowActionsPerRun || 5), CREDIT.flowAction, "agent flow actions"));

    return profile;
  }

  // ── Harness + model inference (Quick mode) ────────────────────────────────
  // Recommend a harness (and, for the GitHub harness, a starting model) from the
  // natural-language description + derived signals. Overridable; always returns a
  // plain-language rationale. Grounded in the harness definitions (Learn) + Sugan's
  // Token-vs-Credit examples (reasoning/large-context → GitHub; rule-based/one-tool → standard;
  // tenant-graph answers in M365 → Copilot chat).
  var GH_SIGNAL_RE = /\b(reason|reasoning|analy[sz]e|analysis|analytic|multi[- ]?step|multistep|iterat|non[- ]?deterministic|investigat|research|synthesi[sz]e|troubleshoot|diagnos|figure out|works? through|orchestrat|agentic|complex (request|case|decision|reasoning|task|workflow|scenario)|operator manual|large (document|context|manual)|entire (manual|document|report)|read(s|ing)? (the )?(whole |entire )?(manual|report|contract|document)|warranty claim|contract (review|analysis)|policy analysis|case analysis|decision(s)? (based|across)|plan(s|ned|ning)? (the|a|how|out)|adapt|dynamic(ally)?)/;
  var STD_SIGNAL_RE = /\b(faq|frequently asked|look ?up|simple (bot|agent|chatbot|q ?& ?a)|chat ?bot|predictable|deterministic|single (connector|tool|system|action)|answer(s|ing)? (questions|faqs|from)|q ?& ?a\b|straightforward|fixed (set|steps|flow))/;
  function inferHarness(text, v) {
    v = v || {};
    var t = " " + String(text || "").toLowerCase() + " ";
    var gh = 0, std = 0, chat = 0, why = [];
    // GitHub Copilot harness — reasoning-heavy / multistep / big-context.
    var ghHits = (t.match(new RegExp(GH_SIGNAL_RE.source, "g")) || []).length;
    if (ghHits) { gh += 3 + ghHits; why.push("reasons through multi-step or changing problems"); }
    var steps = (v.actionsCount || 0) + (v.hasFlow ? 1 : 0) + (v.hasAI ? 1 : 0);
    if (v.orchestration === "generative" && steps >= 3) { gh += 2; why.push("several steps working together"); }
    if (v.hasContent || v.knowledge === "docs") { gh += 1; why.push("reads documents / large context"); }
    // Standard harness — rule-based / deterministic / one-tool.
    var stdHits = (t.match(new RegExp(STD_SIGNAL_RE.source, "g")) || []).length;
    if (stdHits) { std += 2 + stdHits; }
    // "Simple/answer-only" bonus — only when there's no reasoning signal and it isn't a
    // tenant-graph (Copilot chat) case, so those don't get pulled to standard.
    if (steps <= 1 && v.orchestration !== "generative" && ghHits === 0 && v.knowledge !== "tenantGraph") { std += 3; }
    if ((v.actionsCount || 0) <= 1 && !v.hasContent && v.knowledge !== "docs" && v.knowledge !== "tenantGraph" && ghHits === 0) { std += 1; }
    // Copilot chat harness — answer from M365 tenant data, no heavy actions.
    if (v.knowledge === "tenantGraph") { chat += 4; }
    if (v.knowledge === "tenantGraph" && (v.actionsCount || 0) === 0 && !v.hasContent && ghHits === 0) { chat += 2; }
    // Decide.
    var scores = { "github-copilot": gh, "standard": std, "chat": chat };
    var order = ["github-copilot", "standard", "chat"].sort(function (a, b) {
      if (scores[b] !== scores[a]) return scores[b] - scores[a];
      // tie-break: prefer the simpler/cheaper option (standard, then chat, then github)
      return ({ standard: 0, chat: 1, "github-copilot": 2 })[a] - ({ standard: 0, chat: 1, "github-copilot": 2 })[b];
    });
    var top = order[0], second = order[1];
    // If nothing fired, default to standard (simplest / most predictable).
    if (scores[top] === 0) { top = "standard"; }
    var margin = scores[top] - scores[second];
    var confidence = scores[top] === 0 ? "low" : margin >= 3 ? "high" : margin >= 1 ? "medium" : "low";
    var plainWhy;
    if (top === "github-copilot") plainWhy = why.length ? ("Your agent " + why.slice(0, 2).join(" and ") + ".") : "Your agent looks like it reasons through multi-step work.";
    else if (top === "chat") plainWhy = "It mainly answers from your Microsoft 365 company data.";
    else plainWhy = ghHits ? "It looks mostly rule-based, so the simpler engine keeps costs predictable." : "It looks like straightforward answers or a single set action.";
    return { harness: top, confidence: confidence, scores: scores, why: plainWhy };
  }
  // Deep vs General starting model for the GitHub harness (overridable).
  var DEEP_SIGNAL_RE = /\b(deep|complex reasoning|multi[- ]?step reasoning|troubleshoot|diagnos|analy[sz]e|analysis|investigat|research|synthesi[sz]e|contract (review|analysis)|policy analysis|case analysis|legal|underwrit|root cause|strategy|strategic)/;
  function inferModel(harness, text, v) {
    if (harness !== "github-copilot") return { model: null, tag: null, why: "Model only affects cost on the smart, multi-step engine." };
    var t = " " + String(text || "").toLowerCase() + " ";
    var deep = DEEP_SIGNAL_RE.test(t);
    if (deep) return { model: "claude-opus-4.6", tag: "Deep", why: "Deeper reasoning detected \u2014 suggested a stronger model. Switch to a lighter one to save cost." };
    return { model: "claude-sonnet-4.6", tag: "General", why: "A balanced model fits this \u2014 switch to a Deep model if it needs heavier reasoning." };
  }

  function analyzeText(raw) {
    var t = " " + String(raw || "").toLowerCase() + " ";
    var steps = extractSteps(t);
    var systems = detectSystems(t);
    var know = detectKnowledge(t);
    var autonomous = detectArchetype(t);
    autonomous = autonomous === "autonomous";
    var voice = VOICE_RE.test(t);
    var hasEscalation = /\b(escalat|human (agent|being|rep)|live (agent|person|rep)|hand ?off to (a|an|the)? ?(human|agent|person)|transfer to (a|an|the)|speak to (a|someone|an agent)|real person)\b/.test(t);

    var actionsCount = steps.filter(function (s) { return s.category === "action"; }).length;
    var answerGenSteps = steps.filter(function (s) { return s.category === "answer_gen"; }).length;
    var hasContent = steps.some(function (s) { return s.category === "content"; });
    var hasAI = steps.some(function (s) { return s.category === "ai"; });
    var hasFlow = steps.some(function (s) { return s.category === "flow"; });

    var orchestration = (autonomous || actionsCount >= 1 || hasFlow || steps.length >= 2 ||
      /\b(decide(s)? which|figure out|reason (over|about|through)|autonomous|intelligently|depending on|complex requests?|multiple systems|which (tool|system|action))\b/.test(t))
      ? "generative" : "classic";
    var answerType = (know.type !== "none" || answerGenSteps > 0 || hasAI || orchestration === "generative")
      ? "generative" : "classic";

    var systemsCount = systems.length || (actionsCount > 0 ? 1 : 0);
    var genAnswers = autonomous ? answerGenSteps : Math.max(answerGenSteps, 1);

    var v = {
      archetype: autonomous ? "autonomous" : "interactive",
      channel: voice ? "voice" : "chat",
      orchestration: orchestration,
      answerType: answerType,
      knowledge: know.type,
      actionsCount: actionsCount,
      systemsCount: systemsCount,
      genAnswers: genAnswers,
      hasContent: hasContent, hasAI: hasAI, hasFlow: hasFlow,
      hasEscalation: hasEscalation, escalation: hasEscalation ? 15 : 0,
      escalationCredits: hasEscalation ? CREDIT.action : 0,
      pagesPerDoc: 1, flowActionsPerRun: 5
    };

    // Volume — regime-specific.
    var why = { knowledge: know.why };
    why.archetype = autonomous
      ? "Event / schedule language detected — it runs itself, with no person per run."
      : "A person chats with or calls the agent each time.";
    why.channel = voice
      ? "Voice / phone language detected."
      : "Assumed chat / text — switch this if it's a voice agent.";
    why.actions = actionsCount > 0
      ? ("Detected " + actionsCount + " system action" + (actionsCount > 1 ? "s" : "") +
         (systems.length ? " across " + systems.join(", ") : "") + ".")
      : "No system actions detected — the agent only answers.";
    if (autonomous) {
      var ev = detectEventVolume(t);
      v.events = ev.value; v.eventUnit = ev.unit;
      v.deployment = "standalone"; v.licensePct = 0;
      why.volume = ev.why;
    } else {
      var users = detectUsers(t), interactions = detectInteractions(t), deploy = detectDeployment(t);
      v.users = users.value; v.interactions = interactions.value;
      v.deployment = deploy.value; v.licensePct = deploy.value === "embedded" ? 60 : 0;
      why.users = users.why; why.interactions = interactions.why; why.deployment = deploy.why;
    }

    // Infer the harness (and a starting model for the GitHub harness) from the description.
    // Recommendation only — the confirmation step lets the user change it.
    var harnessInf = inferHarness(t, v);
    v.harness = harnessInf.harness;
    v.harnessConfidence = harnessInf.confidence;
    why.harness = harnessInf.why;
    var modelInf = inferModel(v.harness, t, v);
    if (modelInf.model) { v.model = modelInf.model; why.model = modelInf.why; }

    var profile = deriveQuick(v);
    var sizing = sizeFromDrivers(v);
    var estimate = computeQuick(profile, v);

    // Build outline (qualitative "how it would be built").
    var outline = {
      archetype: v.archetype,
      trigger: autonomous
        ? { label: "Autonomous trigger — fires on each new " + (v.eventUnit || "event"),
            note: "Billed as an agent action every run, regardless of user licensing." }
        : { label: "User message" + (voice ? " (voice channel)" : " (chat)"),
            note: "A person starts each conversation." },
      channel: voice ? "Voice / phone" : "Chat",
      orchestration: orchestration === "generative" ? "Generative orchestration" : "Classic (topic) orchestration",
      knowledge: know.label,
      steps: steps.map(function (s) { return { id: s.id, label: s.label, build: s.build, category: s.category }; }),
      systems: systems
    };
    if (hasEscalation) outline.steps.push({ id: "escalation", label: "Escalate to a human", build: "An escalation topic hands off to a live agent (Teams / Omnichannel).", category: "action" });
    if (outline.steps.length === 0) {
      outline.steps.push(autonomous
        ? { id: "process", label: "Process the incoming " + (v.eventUnit || "item"), build: "The agent reads each event and acts on it with generative orchestration.", category: "answer_gen" }
        : { id: "respond", label: "Answer / respond to the user", build: "A " + (answerType === "generative" ? "generative answer" : "classic topic") + " handles each request.", category: "answer_gen" });
    }

    return {
      vars: v, outline: outline, profile: profile,
      perUnit: perInteractionCredits(profile),
      size: sizing.size, sizeDrivers: sizing.drivers, sizeInfo: SIZE_INFO[sizing.size],
      estimate: estimate, why: why
    };
  }

  // ── Solution-package analysis (Complex mode) ──────────────────────────────
  function countAll(text, re) { var m = text.match(re); return m ? m.length : 0; }

  // Connector catalog — label + licensing tier. Premium connectors bill via
  // Power Platform / Power Automate licensing, NOT Copilot Credits (governance
  // flag). Standard connectors are covered by Copilot agent-flow action credits.
  var CONNECTOR_CATALOG = {
    shared_teams: { label: "Microsoft Teams", premium: false },
    shared_sharepointonline: { label: "SharePoint", premium: false },
    shared_commondataserviceforapps: { label: "Dataverse", premium: false },
    shared_commondataservice: { label: "Dataverse (legacy)", premium: false },
    shared_office365: { label: "Office 365 Outlook", premium: false },
    shared_office365users: { label: "Office 365 Users", premium: false },
    shared_onedriveforbusiness: { label: "OneDrive for Business", premium: false },
    shared_excelonlinebusiness: { label: "Excel Online (Business)", premium: false },
    shared_microsoftforms: { label: "Microsoft Forms", premium: false },
    shared_approvals: { label: "Approvals", premium: false },
    shared_flowpush: { label: "Notifications", premium: false },
    shared_outlook: { label: "Outlook.com", premium: false },
    shared_planner: { label: "Planner", premium: false },
    shared_todo: { label: "To Do", premium: false },
    shared_azuread: { label: "Azure AD", premium: false },
    shared_sql: { label: "SQL Server", premium: true },
    shared_salesforce: { label: "Salesforce", premium: true },
    shared_servicenow: { label: "ServiceNow", premium: true },
    shared_azureblob: { label: "Azure Blob Storage", premium: true },
    shared_documentdb: { label: "Azure Cosmos DB", premium: true },
    shared_azurequeues: { label: "Azure Queues", premium: true },
    shared_azureeventgrid: { label: "Azure Event Grid", premium: true },
    shared_http: { label: "HTTP", premium: true },
    shared_webcontents: { label: "HTTP with Entra ID", premium: true },
    shared_sftpwithssh: { label: "SFTP", premium: true },
    shared_ftp: { label: "FTP", premium: true },
    shared_azureopenai: { label: "Azure OpenAI", premium: true },
    shared_cognitiveservices: { label: "Cognitive Services", premium: true }
  };
  function connectorInfo(id) {
    if (!id) return { label: "", premium: false, known: false, key: "" };
    var norm = String(id).toLowerCase();
    var m = norm.match(/shared_[a-z0-9]+/);
    var key = m ? m[0] : norm;
    if (CONNECTOR_CATALOG[key]) {
      return { label: CONNECTOR_CATALOG[key].label, premium: CONNECTOR_CATALOG[key].premium, known: true, key: key };
    }
    var label = key.replace(/^shared_/, "").replace(/[_-]+/g, " ").trim();
    label = label ? label.charAt(0).toUpperCase() + label.slice(1) : "";
    // Unknown connectors → flag as premium (conservative for governance).
    return { label: label, premium: true, known: false, key: key };
  }

  var AI_OP_RE = /aibuilder|customprompt|runaprompt|run_?a_?prompt|predict|gptmodel|azureopenai|createchatcompletion|openai/i;
  var CONTROL_TYPE_RE = /^(foreach|scope|if|switch|until|do_until|initializevariable|setvariable|incrementvariable|decrementvariable|appendtoarrayvariable|appendtostringvariable|compose|parsejson|select|table|join|query|response|terminate|wait|expression|xmlvalidation|csvtable|htmltable)$/;

  // Classify a single Power Automate / Logic Apps action node.
  function classifyFlowAction(name, a) {
    a = a || {};
    var type = String(a.type || "").toLowerCase();
    var inputs = a.inputs || {};
    var host = inputs.host || {};
    var op = String(host.operationId || host.operationName || host.apiOperation || "").toLowerCase();
    var apiId = String(host.apiId || host.api || "").toLowerCase();
    var conn = String(host.connectionName || host.connection || host.connectionReferenceName || "").toLowerCase();
    if (AI_OP_RE.test(op) || /aibuilder|openai|cognitiveservices/.test(apiId) || /aibuilder|openai/.test(conn)) {
      return { kind: "aiPrompt", label: "AI Builder prompt" };
    }
    if (type === "openapiconnection" || type === "openapiconnectionwebhook" || type === "apiconnection" ||
        type === "apiconnectionwebhook" || host.apiId || host.connectionName || host.connectionReferenceName) {
      var info = connectorInfo(apiId || conn);
      return { kind: "connector", label: info.label, premium: info.premium, known: info.known, connKey: info.key };
    }
    if (type === "http" || type === "httpwebhook" || /^https?:/.test(String(inputs.uri || ""))) {
      return { kind: "http", label: "HTTP", premium: true };
    }
    if (type === "workflow" || /invokeworkflow|runchildflow|invokeflow/.test(op)) {
      return { kind: "childflow", label: "Child flow" };
    }
    if (CONTROL_TYPE_RE.test(type)) return { kind: "control", label: type };
    return { kind: "other", label: type || "action" };
  }

  var FLOW_LOOP_ITERS = 10;   // documented assumption: iterations per loop

  // Parse a Power Automate / Logic Apps flow definition (recursively, expanding
  // loop bodies by FLOW_LOOP_ITERS). Returns null if the text isn't a flow.
  function parseFlowDefinition(text) {
    var def;
    try {
      var obj = JSON.parse(text);
      def = (obj && obj.properties && obj.properties.definition) || (obj && obj.definition) || obj;
    } catch (e) { return null; }
    if (!def || typeof def !== "object" || (!def.actions && !def.triggers)) return null;

    var triggers = def.triggers || {};
    var tKeys = Object.keys(triggers);
    var automated = false, trigLabel = "manual";
    tKeys.forEach(function (k) {
      var t = triggers[k] || {};
      var tt = String(t.type || "").toLowerCase();
      var kind = String(t.kind || "").toLowerCase();
      if (tt === "request" || kind === "button" || kind === "powerappsv2") { trigLabel = "manual/button"; }
      else if (/recurrence/.test(tt)) { automated = true; trigLabel = "scheduled"; }
      else if (/webhook|http|event|apiconnection/.test(tt)) { automated = true; trigLabel = "event/automated"; }
      else if (tt) { automated = true; trigLabel = tt; }
    });

    var counts = { aiPrompts: 0, aiPromptCalls: 0, connectors: 0, connectorCalls: 0,
      http: 0, httpCalls: 0, control: 0, loops: 0, childFlows: 0, other: 0, actions: 0 };
    var connectorLabels = {}, premiumSet = {}, actionsList = [];
    function walk(actionMap, multiplier) {
      Object.keys(actionMap || {}).forEach(function (nm) {
        var a = actionMap[nm] || {};
        var type = String(a.type || "").toLowerCase();
        var cls = classifyFlowAction(nm, a);
        if (cls.kind === "aiPrompt") {
          counts.aiPrompts++; counts.aiPromptCalls += multiplier;
          actionsList.push({ name: nm, kind: "aiPrompt", label: cls.label, inLoop: multiplier > 1 });
        } else if (cls.kind === "connector") {
          counts.connectors++; counts.connectorCalls += multiplier;
          if (cls.label) { connectorLabels[cls.label] = true; if (cls.premium) premiumSet[cls.label] = true; }
          actionsList.push({ name: nm, kind: "connector", label: cls.label, premium: !!cls.premium, inLoop: multiplier > 1 });
        } else if (cls.kind === "http") {
          counts.http++; counts.httpCalls += multiplier; premiumSet["HTTP"] = true;
          actionsList.push({ name: nm, kind: "http", label: "HTTP", premium: true, inLoop: multiplier > 1 });
        } else if (cls.kind === "childflow") {
          counts.childFlows++; counts.connectorCalls += multiplier;
          actionsList.push({ name: nm, kind: "childflow", label: cls.label, inLoop: multiplier > 1 });
        } else if (cls.kind === "control") {
          counts.control++;
        } else { counts.other++; }
        counts.actions++;
        var childMult = multiplier;
        if (type === "foreach" || type === "until" || type === "do_until") { counts.loops++; childMult = multiplier * FLOW_LOOP_ITERS; }
        if (a.actions) walk(a.actions, childMult);
        if (a.else && a.else.actions) walk(a.else.actions, multiplier);
        if (a.cases) Object.keys(a.cases).forEach(function (c) { if (a.cases[c] && a.cases[c].actions) walk(a.cases[c].actions, multiplier); });
        if (a.default && a.default.actions) walk(a.default.actions, multiplier);
      });
    }
    walk(def.actions || {}, 1);
    return {
      triggerLabel: trigLabel, automated: automated, triggerCount: tKeys.length,
      counts: counts, connectors: Object.keys(connectorLabels), premiumConnectors: Object.keys(premiumSet),
      actions: actionsList
    };
  }

  // Parse a curated agent build-spec bundle (build-spec .md + knowledge docs +
  // guides). Distinct from a Dataverse solution export — these have no runtime
  // component YAML, so signals are inferred from the spec prose + file manifest.
  function parseAgentSpec(all, names, manifest) {
    manifest = manifest || [];
    var joinedNames = names.join(" ");
    var hasSolutionXml = names.some(function (n) { return /(^|\/)solution\.xml$/.test(n) || /customizations\.xml$/.test(n); });
    var hasMd = /\.md$/.test(joinedNames) || manifest.some(function (m) { return /\.md$/i.test(m.name || ""); });
    var specLike = /agent (build )?spec|build[- ]spec|rebuild guide|enablement (guide|bundle|pack)|system prompt|agent instructions/i.test(all)
      || (hasMd && /(knowledge|grounding)/i.test(all) && /(action|flow|orchestrat|connected agent)/i.test(all));
    var isSpec = !hasSolutionXml && (hasMd || manifest.length > 0) && specLike;

    var knowledgeExt = /\.(docx?|pdf|md|txt|pptx?|html?)$/i;
    var kFromNames = names.filter(function (n) { return /knowledge\//.test(n) && knowledgeExt.test(n); }).length;
    var kFromManifest = manifest.filter(function (m) { return /knowledge\//i.test(m.name || "") && knowledgeExt.test(m.name || ""); }).length;
    var knowledgeDocs = Math.max(kFromNames, kFromManifest);
    var km = all.match(/(\d+)\s+knowledge (?:source|doc|file|document)/i)
      || all.match(/attach (?:all )?(\d+)\s+(?:knowledge|doc|file)/i);
    if (km) knowledgeDocs = Math.max(knowledgeDocs, parseInt(km[1], 10) || 0);

    var connectedAgent = /(connected agent|child agent|sub-?agent|helpdesk (assistant|child)|multi-?agent|agent orchestrat)/i.test(all);
    var agentCount = 1 + (connectedAgent ? 1 : 0);

    var actionCount = 0;
    if (/incident intake|add a new row|create (a )?(record|row|item|ticket|case)|write to dataverse|dataverse (row|record|write)/i.test(all)) actionCount++;
    if (/restock|replenish|inventory (update|adjustment)|update stock/i.test(all)) actionCount++;
    if (/(send|post) (an? )?(email|notification|teams message|adaptive card)|notify (the )?(team|manager|staff)/i.test(all)) actionCount++;
    if (/approval (flow|request|step)/i.test(all) && actionCount < 4) actionCount++;

    var hasFlow = /power automate|cloud flow|\bagent flow\b|\bflow\b/i.test(all);
    var dataverse = /dataverse|mg_[a-z]+|system of record|custom table/i.test(all);
    var hasEscalation = /(severity ?1|sev ?1|escalat|guardrail|human (in the loop|handoff|hand-off)|safety (protocol|rail)|do not (answer|attempt))/i.test(all);
    var autonomousTrigger = /(autonomous (agent|trigger|mode)|event-driven|triggers? (itself|automatically)|runs on a schedule|scheduled (run|trigger))/i.test(all);
    var generative = /(generative|new experience|new-experience|\bgpt\b|\bllm\b|orchestrat|reason over)/i.test(all);
    var voice = /(voice channel|telephony|\bivr\b|phone channel|speech|spoken|contact cent(er|re))/i.test(all);
    var reasoningModel = /(reasoning[- ]?(model|capable)|deep reasoning|advanced reasoning|multi-?step (inference|reasoning)|chain[- ]of[- ]thought|\bo1\b|\bo1-(mini|preview)\b|\bo3\b|\bo3-mini\b|\bo4-mini\b)/i.test(all);

    return {
      isSpec: isSpec, knowledgeDocs: knowledgeDocs, connectedAgent: connectedAgent,
      agentCount: agentCount, actionCount: actionCount, hasFlow: hasFlow, dataverse: dataverse,
      hasEscalation: hasEscalation, autonomousTrigger: autonomousTrigger, generative: generative,
      voice: voice, reasoningModel: reasoningModel
    };
  }

  // Analyze an uploaded solution/agent package. Merges THREE signal sources:
  //   1. Copilot Studio bot component YAML (regex over concatenated text)
  //   2. Power Automate / Logic Apps flow JSON (structured recursive parse)
  //   3. Curated agent build-spec bundle (spec prose + knowledge-doc manifest)
  // Produces a regime (interactive vs autonomous), a credit profile, a t-shirt
  // size, a component inventory, and governance warnings.
  function analyzeSolution(files) {
    files = files || [];
    var textFiles = files.filter(function (f) { return !f.binary; });
    var manifest = files.filter(function (f) { return f.binary; });
    var all = textFiles.map(function (f) { return f.text || ""; }).join("\n");
    var names = files.map(function (f) { return (f.name || "").toLowerCase(); });

    // ── 0. New-experience (cliagent) authoritative reads (shared verified vocab) ──
    // A real new-experience export declares its runtime via recognizer CLICopilotRecognizer,
    // its knowledge as componenttype-14 file sources, its agent-flow tools as `kind: WorkflowTool`
    // (zero-rated 0.13 path) and its connected sub-agents as `kind: ConnectedAgentTool`. These are
    // read verbatim (not keyword-guessed) so a new-experience agent is priced correctly instead of
    // falling through to the classic-fallback line. All tokens verified vs files/golden-new-solution/.
    var newExperience = EV.RE.newExperience().test(all);
    var webSearch = EV.RE.webSearchOn().test(all);
    var workflowTools = countAll(all, EV.RE.workflowTool());        // agent-flow tools (zero-rated)
    var connectedAgentTools = countAll(all, EV.RE.connectedAgentTool());
    var fileKnowledgeComps = countAll(all, EV.RE.fileKnowledgeType()); // componenttype 14
    // Model series is a new-experience agentSettings concept — only read it there, so classic
    // exports are untouched. Only a VERIFIED reasoning series flips the premium meter (none yet).
    var modelSeries = null, seriesReasoning = false;
    if (newExperience) {
      var ms = all.match(EV.RE.modelSeries());
      if (ms) { modelSeries = ms[1]; seriesReasoning = EV.isReasoningSeries(modelSeries); }
    }

    // ── 1. Copilot Studio bot component signals ──
    var topics = countAll(all, /kind:\s*AdaptiveDialog/gi);
    var botTriggers = countAll(all, /kind:\s*On(RecognizedIntent|UnknownIntent|ConversationStart|EventActivity|DialogEvent|KnowledgeRequested|Activity|ToolSelected)/gi);
    var genAnswers = countAll(all, /SearchAndSummarizeContent/gi);
    var knowledgeSearch = countAll(all, /SearchKnowledgeSources/gi);
    var knowledgeComps = countAll(all, /KnowledgeSourceComponent/gi);
    // Real Copilot Studio unmanaged exports describe knowledge via KnowledgeSourceConfiguration
    // components whose inner source kind is one of the *SearchSource types below.
    var knowledgeConfigs = countAll(all, /KnowledgeSourceConfiguration/gi);
    var knowledgeKinds = all.match(/\b(PublicSiteSearchSource|SharePointSearchSource|DataverseSearchSource|AzureAISearchSource)\b/gi) || [];
    var knowledgeSources = Math.max(knowledgeKinds.length, knowledgeConfigs, fileKnowledgeComps);
    var botActionNodes = countAll(all, /(InvokeConnectorAction|InvokeConnectorTaskAction|HttpRequestAction|InvokeExternalAgentTaskAction|InvokeComputerUseAction)\b/gi);
    var botFlowNodes = countAll(all, /InvokeFlowAction/gi);
    var workflowFiles = names.filter(function (n) { return /(^|\/)workflows?\/.+\.json$/.test(n) || /workflow[^\/]*\.json$/.test(n); }).length;
    var botAiNodes = countAll(all, /(GptComponent|InvokeAIBuilderModelAction|PromptDialog)/gi);
    // Prompt / AI-Builder tools bill their OWN "Text and generative AI tools" meter. Exclude the
    // agent's default GPT orchestration component (schema name *.gpt.default / kind
    // GptComponentMetadata) — that's generative orchestration, already priced as the
    // generative-answer line, and must NOT create a spurious AI-tool line. Custom prompt tools
    // are matched by component name (*.gpt.<name>, *.prompt.<name>, *.customprompt.<name>);
    // PromptDialog and InvokeAIBuilderModelAction are unambiguous prompt-tool nodes.
    var promptToolSet = {};
    names.forEach(function (n) {
      var m = n.match(/\.(gpt|prompt|customprompt)\.([a-z0-9_-]+)/i);
      if (!m) return;
      if (/^gpt$/i.test(m[1]) && /^default$/i.test(m[2])) return;
      promptToolSet[(m[1] + "." + m[2]).toLowerCase()] = true;
    });
    var promptToolNodes = Object.keys(promptToolSet).length + countAll(all, /(InvokeAIBuilderModelAction|PromptDialog)/gi);
    var computerUse = /InvokeComputerUseAction/i.test(all);
    var connectedAgents = countAll(all, /(InvokeConnectedAgentTaskAction|connectedAgent)/gi);
    var tenantGraph = /(graphgrounding|tenant ?graph|enterprise ?search|graph ?connector|sharepointonlinesearch|m365 ?index|microsoftgraph)/i.test(all) ||
      EV.RE.workIQ().test(all); // Work IQ MCP tools (shared_a365copilotchatmcp / a365memcp) ground on the M365 tenant graph → 10 cr/run
    var genOrch = /(generativeactionsenabled|generative ?orchestration|"?orchestration"?\s*:\s*"?generative|generativemodeenabled|"?aIGenerativeMode)/i.test(all);
    var contentProc = /(prebuilt.*document|documentprocessing|invoiceprocessing|receiptprocessing|content ?understanding|documentextraction|extract .*from .*(invoice|receipt|document))/i.test(all);

    // ── 2. Structured Power Automate / Logic Apps flow parse ──
    var flowResults = [];
    textFiles.forEach(function (f) {
      var nm = (f.name || "").toLowerCase();
      var txt = f.text || "";
      var looksFlow = /workflow.*\.json$/.test(nm) ||
        (/\.json$/.test(nm) && /"definition"\s*:/.test(txt) && /"actions"\s*:/.test(txt));
      if (!looksFlow) return;
      var pr = parseFlowDefinition(txt);
      if (pr) flowResults.push(pr);
    });
    var flow = { aiPrompts: 0, aiPromptCalls: 0, connectorActions: 0, connectorCalls: 0,
      http: 0, httpCalls: 0, loops: 0, childFlows: 0, actions: 0, automated: false };
    var connectorSet = {}, premiumSet = {}, flowList = [];
    flowResults.forEach(function (r) {
      flow.aiPrompts += r.counts.aiPrompts; flow.aiPromptCalls += r.counts.aiPromptCalls;
      flow.connectorActions += r.counts.connectors; flow.connectorCalls += r.counts.connectorCalls;
      flow.http += r.counts.http; flow.httpCalls += r.counts.httpCalls;
      flow.loops += r.counts.loops; flow.childFlows += r.counts.childFlows; flow.actions += r.counts.actions;
      if (r.automated) flow.automated = true;
      r.connectors.forEach(function (c) { connectorSet[c] = true; });
      r.premiumConnectors.forEach(function (c) { premiumSet[c] = true; });
      flowList.push({ trigger: r.triggerLabel, automated: r.automated, actions: r.counts.actions,
        aiPrompts: r.counts.aiPrompts, connectors: r.connectors.slice(), loops: r.counts.loops });
    });
    var flowCount = flowResults.length;
    // Connector references from customizations.xml (connectorid="…/shared_xxx").
    (all.match(/connectorid="[^"]*?shared_[a-z0-9]+/gi) || []).forEach(function (mm) {
      var m = mm.match(/shared_[a-z0-9]+/i); if (!m) return;
      var info = connectorInfo(m[0]);
      if (info.label) { connectorSet[info.label] = true; if (info.premium) premiumSet[info.label] = true; }
    });
    // Copilot Studio AGENT connector tools don't use connectorid=. They bind via
    // the connection-reference logical name (`<prefix>.shared_xxx.<connection>`)
    // in customizations.xml / the connectionreferenceset, and the tool's
    // botcomponent `connectionReference:` line. Detect those so agent (non-flow)
    // exports surface their wired connectors too. Inventory-only: connectors[]
    // never feeds the credit profile (that's driven by action/answer/flow node
    // counts), so this cannot change any credit total.
    (all.match(/connectionreference[a-z]*["=:\s.][^"'<>\n]*?shared_[a-z0-9]+/gi) || []).forEach(function (mm) {
      var m = mm.match(/shared_[a-z0-9]+/i); if (!m) return;
      var info = connectorInfo(m[0]);
      if (info.label) { connectorSet[info.label] = true; if (info.premium) premiumSet[info.label] = true; }
    });
    var connectionRefs = countAll(all, /<connectionreference\b/gi)
      || names.filter(function (n) { return /connectionreference/.test(n); }).length;
    if (!connectionRefs) {
      var crset = {};
      (all.match(/connectionreferencelogicalname"\s*:\s*"([^"]+)"/gi) || []).forEach(function (x) { crset[x.toLowerCase()] = true; });
      connectionRefs = Object.keys(crset).length;
    }

    // ── 3. Curated agent build-spec bundle ──
    var spec = parseAgentSpec(all, names, manifest);
    if (spec.connectedAgent && connectedAgents === 0) connectedAgents = 1;

    // ── Merge + reconcile ──
    var knowledgeCtx = knowledgeComps > 0 || knowledgeSearch > 0 || genAnswers > 0 || knowledgeSources > 0 ||
      fileKnowledgeComps > 0 || webSearch ||
      /knowledgesource|grounding|search and summarize|searchandsummarize/i.test(all);
    var knowledgeTypes = {};
    if (/(sharepointsource|sharepointsearchsource)/i.test(all) || (knowledgeComps > 0 && /sharepoint/i.test(all))) knowledgeTypes.SharePoint = true;
    if (/(publicwebsource|publicsitesearchsource|websource|"kind"\s*:\s*"?public ?website)/i.test(all) && knowledgeCtx) knowledgeTypes.Website = true;
    if (/(dataversesearch|dataversesearchsource|dataverse ?search)/i.test(all) && knowledgeCtx) knowledgeTypes.Dataverse = true;
    if ((/(fileknowledge|fileattachment|documentknowledge|uploaded ?file|azureaisearchsource)/i.test(all) && knowledgeCtx) ||
        fileKnowledgeComps > 0 || (spec.isSpec && spec.knowledgeDocs > 0)) knowledgeTypes.Files = true;
    if (webSearch) knowledgeTypes["Web search"] = true;  // new-experience web grounding (free, generative)
    var knowledgeCount = Math.max(knowledgeComps, knowledgeSearch, knowledgeSources, Object.keys(knowledgeTypes).length, spec.knowledgeDocs || 0);

    // Connected sub-agents: reconcile the classic runtime-node regex with the authoritative
    // new-experience `kind: ConnectedAgentTool` count (take the larger; never double-count).
    connectedAgents = Math.max(connectedAgents, connectedAgentTools);
    var agentActions = botActionNodes + spec.actionCount;
    // Agent-flow tools (WorkflowTool) are the zero-rated 0.13 path; fold them into the flow total.
    var flowsTotal = flowCount || botFlowNodes || workflowFiles || workflowTools || (spec.hasFlow ? 1 : 0);
    var aiNodes = botAiNodes + flow.aiPrompts;
    var promptTools = promptToolNodes + flow.aiPrompts;
    var agentCount = Math.max(1, spec.agentCount, connectedAgents > 0 ? connectedAgents + 1 : 1);
    var hasEscalation = spec.hasEscalation ||
      /(escalate to (a )?(human|agent|person)|human handoff|transfer to (a )?agent|OnEscalate)/i.test(all);
    var voice = /(telephony|\bdtmf\b|speechrecognizer|azure ?speech|contact ?cent(er|re)|"?enableVoice"?\s*:\s*true|voiceConfiguration|voice channel|\bivr\b)/i.test(all) ||
      (spec.isSpec && spec.voice);
    // A new-experience (cliagent) agent runs on generative orchestration by definition, and web
    // grounding implies a generative answer — so either flips isGenerative even with no classic
    // SearchAndSummarizeContent node (which new-experience agents don't emit).
    var isGenerative = genAnswers > 0 || genOrch || flow.aiPrompts > 0 || botAiNodes > 0 ||
      (spec.isSpec && spec.generative) || newExperience || webSearch;
    // Reasoning tier can come from a build-spec OR a verified reasoning model series (none verified yet).
    var reasoningModel = spec.reasoningModel || seriesReasoning;
    var triggers = botTriggers + flowResults.reduce(function (s, r) { return s + (r.triggerCount || 0); }, 0);

    // ── Regime: interactive (users×interactions) vs autonomous (runs/month) ──
    var interactiveSignal = topics > 0 || genAnswers > 0 || knowledgeSearch > 0 ||
      knowledgeComps > 0 || fileKnowledgeComps > 0 || newExperience || spec.isSpec || spec.connectedAgent || botActionNodes > 0;
    var autonomous = (flowCount > 0 && !interactiveSignal) || (spec.autonomousTrigger && topics === 0 && !spec.connectedAgent);
    var regime = autonomous ? "autonomous" : "interactive";

    var premiumConnectors = Object.keys(premiumSet);
    var connectors = Object.keys(connectorSet);

    // ── Credit profile (per interaction = per turn OR per run) ──
    var profile = [];
    var score = 1;
    if (regime === "autonomous") {
      var tokK = 2;   // assumed 2K tokens per AI Builder prompt call (standard tier)
      if (flow.aiPrompts > 0) {
        profile.push({ key: "aiStandard", name: ROW.aiStandard,
          uses: Math.max(1, Math.round(flow.aiPromptCalls * tokK)), credits: CREDIT.aiStandard,
          note: flow.aiPrompts + " AI Builder prompt(s) · ~" + tokK + "K tokens/call · " + flow.aiPromptCalls + " call(s)/run" });
      }
      var flowActionCalls = flow.connectorCalls + flow.httpCalls;
      if (flowActionCalls > 0) {
        profile.push({ key: "flow", name: ROW.flow, uses: Math.round(flowActionCalls), credits: CREDIT.flowAction,
          note: flow.connectorActions + " connector + " + flow.http + " HTTP action(s) · " + flowActionCalls + " call(s)/run" + (flow.loops ? " (loops ×" + FLOW_LOOP_ITERS + ")" : "") });
      }
      if (spec.autonomousTrigger) {
        profile.push({ key: "autonomous", name: ROW.autonomous, uses: 1, credits: CREDIT.autonomousTrigger,
          note: "billed as one agent action per run — the flow/connector/answer steps it invokes are billed separately below" });
      }
      if (reasoningModel) {
        profile.push({ key: "reasoning", name: ROW.reasoning, uses: REASON_TOKENS_K, credits: CREDIT.reasoningPremium,
          note: "reasoning model — premium AI meter (10 credits/1K tokens) on top of the feature rate · assumes ~" + REASON_TOKENS_K + "K tokens/run" });
      }
      if (contentProc) profile.push({ key: "content", name: ROW.content, uses: 1, credits: CREDIT.contentPage, note: "document processing" });
      if (profile.length === 0) profile.push({ key: "classic", name: ROW.classic, uses: 1, credits: CREDIT.classic, note: "no billable AI/flow actions found" });

      if (isGenerative) score += 1;
      var flowScore = 0;
      flowScore += Math.min(3, flow.connectorActions + flow.http);
      flowScore += Math.min(3, flow.aiPrompts * 2);
      if (flow.loops > 0) flowScore += 1;
      if (premiumConnectors.length > 0) flowScore += 1;
      if (flowCount > 1) flowScore += 2;
      if (spec.autonomousTrigger) flowScore += 1;
      score += Math.min(7, flowScore);
      if (contentProc) score += 1;
    } else {
      if (voice) {
        profile.push({ key: "voiceStandard", name: ROW.voiceStandard, uses: VOICE_MIN_PER_CONVO, credits: CREDIT.voiceStandard, note: "voice channel detected · assumes ~" + VOICE_MIN_PER_CONVO + " min/call — tune to your average handle time" });
      } else if (isGenerative) {
        profile.push({ key: "generative", name: ROW.generative, uses: 1, credits: CREDIT.generative, note: (genAnswers || aiNodes || 1) + " generative node(s)" });
      } else {
        profile.push({ key: "classic", name: ROW.classic, uses: 1, credits: CREDIT.classic, note: "no generative-answer nodes found" });
      }
      if (tenantGraph) profile.push({ key: "tenantGraph", name: ROW.tenantGraph, uses: 1, credits: CREDIT.tenantGraph, note: "tenant-graph grounding" });
      if (agentActions > 0 && !voice) profile.push({ key: "action", name: ROW.action, uses: 1, credits: CREDIT.action, note: agentActions + " agent action(s)" });
      if (flowsTotal > 0) profile.push({ key: "flow", name: ROW.flow,
        uses: Math.max(1, Math.min(20, (flow.connectorActions + flow.http) || 5)), credits: CREDIT.flowAction,
        note: flowsTotal + " agent flow(s)" });
      if (contentProc) profile.push({ key: "content", name: ROW.content, uses: 1, credits: CREDIT.contentPage, note: "document processing" });
      if (promptTools > 0 && !reasoningModel) profile.push({ key: "aiStandard", name: ROW.aiStandard, uses: promptTools, credits: CREDIT.aiStandard, note: promptTools + " prompt / AI tool(s) — Text/generative standard (1.5 cr per response; ~2K tokens assumed)" });
      if (reasoningModel) profile.push({ key: "reasoning", name: ROW.reasoning, uses: REASON_TOKENS_K, credits: CREDIT.reasoningPremium,
        note: "reasoning model — premium AI meter (10 credits/1K tokens) on top of the feature rate · assumes ~" + REASON_TOKENS_K + "K tokens/turn" });

      if (isGenerative) score += 1;
      if (tenantGraph) score += 2; else if (knowledgeCount >= 5) score += 1;
      if (agentActions > 0) score += Math.min(3, agentActions);
      if (flowsTotal > 0) score += 1;
      if (connectedAgents > 0 || genOrch) score += 2;
      if (agentCount > 2) score += 1;
      if (contentProc) score += 2;
      if (promptTools > 0) score += 1;
      if (hasEscalation) score += 1;
      if (topics >= 10) score += 2; else if (topics >= 5) score += 1;
      if (computerUse) score += 2;
    }
    if (reasoningModel) score += 1;
    var tshirt = sizeForScore(score, { voice: voice, users: 0 });

    // ── Governance warnings ──
    var warnings = [];
    if (regime === "autonomous") warnings.push("Autonomous / flow package — cost scales with RUNS PER MONTH, not users. Set your expected run volume below.");
    if (flow.aiPrompts > 0) warnings.push(flow.aiPrompts + " AI Builder prompt(s) are token-metered; the estimate assumes ~2K tokens per call. Long inputs (e.g. transcripts, documents) can be far larger — tune token size and per-run call counts to your data.");
    if (promptTools > 0 && !reasoningModel) warnings.push(promptTools + " prompt / AI tool(s) detected — billed as Text/generative AI tools (assumed Standard tier, 1.5 credits per response / ~2K tokens). Basic-tier prompts bill 0.1 and premium/reasoning-tier bill 10 credits per 1K tokens — adjust the tier to match your prompt's model.");
    if ((flow.connectorActions + flow.http) > 0 && regime === "autonomous") warnings.push("Flow actions are priced here at the Copilot agent-flow rate (0.13 credits each), which applies ONLY when a Copilot Studio agent invokes the flow. If it runs standalone in Power Automate, those connector actions consume Power Platform requests (licensed separately) and only the AI Builder prompt(s) bill Copilot Credits — drop the agent-flow line in that case.");
    if (flow.loops > 0) warnings.push(flow.loops + " loop(s) detected — per-run action counts assume ~" + FLOW_LOOP_ITERS + " iterations each. Set your real batch size.");
    if (premiumConnectors.length > 0) warnings.push("Premium/unknown connector(s): " + premiumConnectors.join(", ") + ". These bill via Power Platform / Power Automate licensing, NOT Copilot Credits — budget separately.");
    if (spec.isSpec) warnings.push("Analyzed from an agent build-spec bundle (documents), not a Dataverse solution export — counts are inferred from the spec + knowledge files, not runtime components.");
    if (reasoningModel) warnings.push("Reasoning-capable model detected — Microsoft bills a premium \u201CText and generative AI tools (premium)\u201D meter at 10 credits per 1K tokens ON TOP of the feature rate for each reasoning step. This estimate assumes ~" + REASON_TOKENS_K + "K premium tokens per run; tune it to your prompt/response size, or drop the reasoning line if the agent uses a standard (non-reasoning) model.");
    if (computerUse) warnings.push("Computer-Using Agent (CUA) actions detected \u2014 these are NOT covered by the Microsoft 365 Copilot license and bill at the agent-action rate (5 credits) even for licensed users, so the embedded (Teams / Copilot Chat / SharePoint) zero-rating does not fully apply to this agent.");
    if (connectedAgents > 0) warnings.push("Multi-agent orchestration detected (" + agentCount + " agents) — each connected-agent hop adds latency and its own component budget.");
    if (aiNodes === 0 && agentActions === 0 && flowsTotal === 0 && topics === 0 && !spec.isSpec)
      warnings.push("Very few components detected — is this a full unmanaged solution export or agent bundle?");

    var findings = {
      topics: topics, triggers: triggers, genAnswers: genAnswers,
      knowledgeSearch: knowledgeSearch, knowledgeComps: knowledgeComps,
      knowledgeTypes: Object.keys(knowledgeTypes), knowledgeCount: knowledgeCount,
      actionNodes: agentActions + flow.connectorActions + flow.http,
      flowNodes: botFlowNodes, workflowFiles: workflowFiles,
      aiNodes: aiNodes, promptTools: promptTools, connectionRefs: connectionRefs, computerUse: computerUse,
      voice: voice, tenantGraph: tenantGraph, genOrch: genOrch, contentProc: contentProc,
      isGenerative: isGenerative, fileCount: files.length,
      // v4 additions
      regime: regime, autonomous: autonomous, flowCount: flowCount, flowActions: flow.actions,
      aiPrompts: flow.aiPrompts, aiPromptCalls: flow.aiPromptCalls,
      flowConnectorActions: flow.connectorActions, flowHttp: flow.http, flowLoops: flow.loops,
      connectors: connectors, premiumConnectors: premiumConnectors,
      agentCount: agentCount, connectedAgents: connectedAgents, hasEscalation: hasEscalation,
      specBundle: spec.isSpec, binaryFiles: manifest.length, reasoningModel: reasoningModel,
      // Phase C — authoritative new-experience reads (verified vocab)
      newExperience: newExperience, webSearch: webSearch, workflowTools: workflowTools, modelSeries: modelSeries
    };
    return {
      findings: findings, profile: profile, score: score, tshirt: tshirt,
      regime: regime, autonomous: autonomous, flows: flowList,
      connectors: connectors, premiumConnectors: premiumConnectors,
      warnings: warnings, agentCount: agentCount, runsPerMonthDefault: 1000
    };
  }

  // ── Quick-mode guided wizard spec ─────────────────────────────────────────
  // Ordered, adaptive steps the UI renders one at a time. applies(v) decides
  // visibility from the (live) variable set; the UI supplies the controls and
  // pre-fills each answer from analyzeText's inference + why strings.
  var QUICK_WIZARD = [
    { id: "trigger", title: "How does the agent start working?", short: "Trigger",
      help: "Sets whether people drive it (billed per user) or it runs itself on events (billed per run).",
      applies: function () { return true; } },
    { id: "channel", title: "Chat or voice?", short: "Channel",
      help: "Voice / telephony changes both the build effort and the per-turn credit rate.",
      applies: function (v) { return v.archetype !== "autonomous"; } },
    { id: "volume-interactive", title: "Who uses it, and how often?", short: "Volume",
      help: "Reach × frequency is the single biggest driver of monthly credits.",
      applies: function (v) { return v.archetype !== "autonomous"; } },
    { id: "volume-autonomous", title: "How much work will it handle?", short: "Volume",
      help: "Autonomous agents are billed for every event they process.",
      applies: function (v) { return v.archetype === "autonomous"; } },
    { id: "actions", title: "What does it actually do?", short: "Actions",
      help: "Each system action (look up, create, notify, route…) adds build effort and ~5 credits per run.",
      applies: function () { return true; } },
    { id: "knowledge", title: "Does it use your content or company data?", short: "Knowledge",
      help: "Documents / KB grounding is easy and free per run; Microsoft 365 tenant-graph grounding adds setup and ~10 credits per run.",
      applies: function () { return true; } },
    { id: "handoff", title: "Does it hand off to a person?", short: "Handoff",
      help: "A human-escalation path adds a little build effort (and one more action).",
      applies: function (v) { return v.archetype !== "autonomous"; } }
  ];

  // ── Quick + Import: batch scenario schema + analysis ──────────────────────
  // Column schema for the downloadable template. Each entry maps one spreadsheet
  // column to a `vars` field. `applies` narrows a column to a regime; `def` is
  // the fallback when the cell is blank. Enum aliases make hand-editing forgiving.
  var IMPORT_SCHEMA = [
    { key: "name", header: "Scenario name", type: "text", applies: "all",
      hint: "A short label for this agent scenario." },
    { key: "archetype", header: "Agent type", type: "enum", applies: "all", def: "interactive",
      enum: { interactive: ["interactive", "user", "user-led", "userled", "chat", "person", "reactive", "attended"],
              autonomous: ["autonomous", "auto", "event", "event-driven", "eventdriven", "unattended", "trigger", "triggered", "batch", "background"] },
      hint: "Interactive = a person drives it. Autonomous = it fires on each event, no user." },
    { key: "harness", header: "Harness", type: "enum", applies: "all", def: "standard",
      enum: { "github-copilot": ["github-copilot", "github copilot", "github", "githubcopilot", "autonomous harness", "generative harness", "agentic"],
              "standard": ["standard", "topics", "topic", "topic-based", "classic", "rules", "rule-based"],
              "chat": ["chat", "copilot chat", "m365 chat", "bizchat", "extend copilot"] },
      hint: "Copilot Studio engine. GitHub Copilot harness bills Copilot Credits for ALL usage and is never covered by an M365 Copilot license; standard/chat are covered in M365 channels for licensed users." },
    { key: "channel", header: "Channel", type: "enum", applies: "interactive", def: "chat",
      enum: { chat: ["chat", "text", "teams", "web", "message", "messaging"], voice: ["voice", "phone", "call", "telephony", "ivr"] },
      hint: "Interactive only. Voice turns cost more and add build effort." },
    { key: "voiceMinutes", header: "Voice minutes / conversation", type: "int", applies: "interactive", def: VOICE_MIN_PER_CONVO,
      hint: "Voice only. Avg voice minutes per conversation (billed per minute; core answer/action activity is included). Blank = " + VOICE_MIN_PER_CONVO + "." },
    { key: "knowledge", header: "Knowledge grounding", type: "enum", applies: "all", def: "none",
      enum: { none: ["none", "no", "na", "n/a", ""], docs: ["docs", "documents", "document", "kb", "knowledge", "sharepoint", "website", "web", "files", "file"],
              tenantGraph: ["tenantgraph", "tenant graph", "tenant-graph", "graph", "m365", "copilot connectors", "enterprise search", "graph connector"] },
      hint: "Documents/KB = free per run. Tenant graph = +10 credits per run." },
    { key: "actionsCount", header: "System actions (#)", type: "int", applies: "all", def: 0,
      hint: "How many connector/HTTP actions the agent performs (look up, create, notify, route…)." },
    { key: "systemsCount", header: "Back-end systems (#)", type: "int", applies: "all",
      hint: "How many distinct back-end systems those actions touch. Blank = 1 if any actions." },
    { key: "hasContent", header: "Document processing?", type: "bool", applies: "all",
      hint: "Yes if it extracts fields from scanned docs / images (8 credits per page)." },
    { key: "hasAI", header: "Draft / summarize content?", type: "bool", applies: "all",
      hint: "Yes if it uses a generative content tool to draft or summarize." },
    { key: "hasFlow", header: "Approval / automation flow?", type: "bool", applies: "all",
      hint: "Yes if it runs a Power Automate / approval flow." },
    { key: "hasEscalation", header: "Human escalation?", type: "bool", applies: "all",
      hint: "Yes if it can hand off to a live person." },
    { key: "users", header: "Users in scope", type: "int", applies: "interactive",
      hint: "Interactive only. People who use the agent." },
    { key: "interactions", header: "Interactions / user / month", type: "num", applies: "interactive",
      hint: "Interactive only. Conversations per user per month." },
    { key: "deployment", header: "Deployment", type: "enum", applies: "interactive", def: "embedded",
      enum: { embedded: ["embedded", "teams", "m365", "copilot", "copilot chat", "chat", "sharepoint", "in-app"], standalone: ["standalone", "other", "external", "external app", "web", "web widget", "widget", "website", "web chat", "portal", "public", "public website", "custom", "custom app", "custom website", "channel", "internet", "anonymous", "consumer", "customer facing"] },
      hint: "Interactive only. Embedded = M365-licensed users are free." },
    { key: "licensePct", header: "% with M365 Copilot license", type: "int", applies: "interactive",
      hint: "Interactive + embedded only. Licensed users accrue zero credits." },
    { key: "events", header: "Events / month", type: "int", applies: "autonomous",
      hint: "Autonomous only. Trigger events processed each month (every event is billed)." },
    { key: "genAnswers", header: "Generative steps / event", type: "int", applies: "autonomous",
      hint: "Autonomous only. Generative reasoning steps per event. Blank = 1." },
    { key: "description", header: "Description (optional)", type: "text", applies: "all",
      hint: "Optional free text. If Agent type is blank, this is analyzed instead." }
  ];

  // Example rows shown on the template's Examples sheet (and reused in tests).
  var IMPORT_EXAMPLES = [
    { name: "IT helpdesk (Teams)", archetype: "Interactive", harness: "Standard", channel: "Chat", knowledge: "Documents",
      actionsCount: 2, systemsCount: 1, hasContent: "No", hasAI: "No", hasFlow: "No", hasEscalation: "Yes",
      users: 800, interactions: 6, deployment: "Embedded", licensePct: 60, events: "", genAnswers: "",
      description: "Answers IT questions from the KB, resets passwords and creates ServiceNow tickets; escalates to a live agent." },
    { name: "Autonomous email router", archetype: "Autonomous", harness: "Standard", channel: "", knowledge: "None",
      actionsCount: 1, systemsCount: 1, hasContent: "No", hasAI: "No", hasFlow: "No", hasEscalation: "No",
      users: "", interactions: "", deployment: "", licensePct: "", events: 2000, genAnswers: 1,
      description: "Categorizes each new support email and routes it to the right SME team." },
    { name: "Customer voice bot", archetype: "Interactive", harness: "Standard", channel: "Voice", knowledge: "Tenant graph",
      actionsCount: 1, systemsCount: 1, hasContent: "No", hasAI: "No", hasFlow: "No", hasEscalation: "Yes",
      users: 5000, interactions: 2, deployment: "Standalone", licensePct: 0, events: "", genAnswers: "",
      description: "Phone + web voice agent that answers product questions and creates Salesforce cases." },
    { name: "Invoice processing", archetype: "Autonomous", harness: "Standard", channel: "", knowledge: "None",
      actionsCount: 1, systemsCount: 2, hasContent: "Yes", hasAI: "No", hasFlow: "Yes", hasEscalation: "No",
      users: "", interactions: "", deployment: "", licensePct: "", events: 800, genAnswers: 1,
      description: "Extracts fields from scanned invoices, validates them and runs a Power Automate approval flow." },
    { name: "Deal-desk agent (GitHub harness)", archetype: "Interactive", harness: "GitHub Copilot", channel: "Chat", knowledge: "Tenant graph",
      actionsCount: 3, systemsCount: 2, hasContent: "No", hasAI: "Yes", hasFlow: "No", hasEscalation: "Yes",
      users: 300, interactions: 8, deployment: "Embedded", licensePct: 80, events: "", genAnswers: "",
      description: "Agentic deal-desk assistant on the GitHub Copilot harness that reasons over CRM + pricing to draft quotes. Every interaction bills Copilot Credits — never covered by an M365 Copilot license, even for the 80% who are licensed." }
  ];

  function impText(s) { return String(s == null ? "" : s).trim(); }
  function impKey(s) { return String(s == null ? "" : s).toLowerCase().replace(/[^a-z0-9]/g, ""); }
  function impBool(s) { var x = impKey(s); return x === "yes" || x === "y" || x === "true" || x === "1" || x === "x" || x === "on"; }
  function impNum(s) {
    if (s == null || impText(s) === "") return null;
    var n = parseFloat(String(s).replace(/[,$%\s]/g, ""));
    return isFinite(n) ? n : null;
  }
  function impEnum(col, raw) {
    var x = impKey(raw);
    for (var val in col.enum) {
      if (!Object.prototype.hasOwnProperty.call(col.enum, val)) continue;
      if (impKey(val) === x) return val;
      var aliases = col.enum[val];
      for (var i = 0; i < aliases.length; i++) if (impKey(aliases[i]) === x) return val;
    }
    return null;
  }
  var IMPORT_COL_BY_KEY = {};
  IMPORT_SCHEMA.forEach(function (c) { IMPORT_COL_BY_KEY[c.key] = c; });

  function buildHeaderMap(headerRow) {
    var norm = (headerRow || []).map(impKey);
    var map = {};
    IMPORT_SCHEMA.forEach(function (col) {
      var target = impKey(col.header);
      var idx = norm.indexOf(target);
      if (idx < 0) {
        for (var i = 0; i < norm.length; i++) {
          if (norm[i] && (norm[i].indexOf(target) === 0 || target.indexOf(norm[i]) === 0)) { idx = i; break; }
        }
      }
      if (idx >= 0) map[col.key] = idx;
    });
    return map;
  }

  // matrix = array of rows (array of cells). First non-empty row is the header.
  function matrixToObjects(matrix) {
    var rows = (matrix || []).filter(function (r) {
      return r && r.some(function (c) { return impText(c) !== ""; });
    });
    if (!rows.length) return { headers: [], objects: [], headerMap: {}, warnings: ["No rows found in the file."] };
    var header = rows[0];
    var map = buildHeaderMap(header);
    var warnings = [];
    if (Object.keys(map).length === 0) warnings.push("No recognized column headers — is this the downloaded template?");
    var objects = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i], o = {};
      IMPORT_SCHEMA.forEach(function (col) {
        var idx = map[col.key];
        o[col.key] = (idx != null) ? r[idx] : undefined;
      });
      objects.push(o);
    }
    return { headers: header, objects: objects, headerMap: map, warnings: warnings };
  }

  // A single spreadsheet row (keyed by schema key) → a normalized `vars` object.
  function rowToVars(obj) {
    var warnings = [];
    function raw(k) { return obj ? obj[k] : undefined; }
    function enumOf(k) {
      var col = IMPORT_COL_BY_KEY[k], val = raw(k);
      if (impText(val) === "") return col.def != null ? col.def : null;
      var got = impEnum(col, val);
      if (got == null) {
        warnings.push("Unrecognized " + col.header + " “" + impText(val) + "”" + (col.def != null ? " — using " + col.def : ""));
        return col.def != null ? col.def : null;
      }
      return got;
    }
    function intOf(k, dflt) {
      var v = impNum(raw(k));
      if (v == null) { if (impText(raw(k)) !== "") warnings.push("Non-numeric " + IMPORT_COL_BY_KEY[k].header + " “" + impText(raw(k)) + "”"); return dflt; }
      return v;
    }

    var archetype = enumOf("archetype") || "interactive";
    var auto = archetype === "autonomous";
    var channel = auto ? "chat" : (enumOf("channel") || "chat");
    if (auto && /voice|phone|call/i.test(impText(raw("channel")))) warnings.push("Autonomous agents have no voice channel — Channel ignored.");

    var knowledge = enumOf("knowledge") || "none";
    var actionsCount = Math.max(0, intOf("actionsCount", 0) || 0);
    var sysRaw = intOf("systemsCount", null);
    var systemsCount = sysRaw == null ? (actionsCount > 0 ? 1 : 0) : Math.max(0, sysRaw);
    var hasContent = impBool(raw("hasContent")), hasAI = impBool(raw("hasAI"));
    var hasFlow = impBool(raw("hasFlow")), hasEscalation = impBool(raw("hasEscalation"));

    var orchestration = (auto || actionsCount >= 1 || hasFlow || hasContent || hasAI) ? "generative" : "classic";
    var answerType = (knowledge !== "none" || hasAI || orchestration === "generative") ? "generative" : "classic";

    var v = {
      archetype: archetype, channel: channel, orchestration: orchestration, answerType: answerType,
      knowledge: knowledge, actionsCount: actionsCount, systemsCount: systemsCount,
      hasContent: hasContent, hasAI: hasAI, hasFlow: hasFlow, hasEscalation: hasEscalation,
      escalation: hasEscalation ? 15 : 0, escalationCredits: hasEscalation ? CREDIT.action : 0,
      pagesPerDoc: 1, flowActionsPerRun: 5,
      voiceMinutes: channel === "voice" ? Math.max(1, intOf("voiceMinutes", VOICE_MIN_PER_CONVO) || VOICE_MIN_PER_CONVO) : VOICE_MIN_PER_CONVO
    };

    if (auto) {
      var events = Math.max(0, intOf("events", 0) || 0);
      var gen = intOf("genAnswers", null); gen = gen == null ? 1 : Math.max(0, gen);
      v.events = events; v.eventUnit = "event"; v.genAnswers = gen;
      v.deployment = "standalone"; v.licensePct = 0;
      if (events <= 0) warnings.push("No Events / month — monthly credits will be 0.");
    } else {
      var users = Math.max(0, intOf("users", 0) || 0);
      var interactions = Math.max(0, intOf("interactions", 0) || 0);
      var deployment = enumOf("deployment") || "embedded";
      var licRaw = intOf("licensePct", null);
      var licensePct = licRaw == null ? (deployment === "embedded" ? 60 : 0) : Math.min(100, Math.max(0, licRaw));
      v.users = users; v.interactions = interactions; v.deployment = deployment; v.licensePct = licensePct;
      v.genAnswers = 1;
      if (users <= 0) warnings.push("No Users in scope — monthly credits will be 0.");
      if (interactions <= 0) warnings.push("No Interactions / user / month — monthly credits will be 0.");
    }
    return { vars: v, warnings: warnings };
  }

  function scenarioCapabilities(v) {
    var out = [];
    if (v.channel === "voice") out.push("Voice channel (generative voice, 35 credits/minute — core answer/action activity during the call is included)");
    else if (v.answerType === "generative")
      out.push("Generative answer" + (v.knowledge !== "none" ? " grounded on " + (v.knowledge === "tenantGraph" ? "the M365 tenant graph" : "documents / KB") : ""));
    else out.push("Classic (topic) answer");
    if (v.knowledge === "tenantGraph") out.push("Tenant-graph grounding (+10 credits/run)");
    if (v.actionsCount > 0) out.push(v.actionsCount + " system action" + (v.actionsCount > 1 ? "s" : "") +
      (v.systemsCount ? " across " + v.systemsCount + " system" + (v.systemsCount > 1 ? "s" : "") : ""));
    if (v.archetype === "autonomous") out.push("Autonomous trigger — billed as an action each run");
    if (v.hasContent) out.push("Document processing (8 credits/page)");
    if (v.hasAI) out.push("Generative content tool");
    if (v.hasFlow) out.push("Workflow / approval flow");
    if (v.hasEscalation) out.push("Human escalation / handoff");
    return out;
  }
  function descName(d) {
    d = impText(d); if (!d) return "";
    var s = d.split(/[.;\n]/)[0].trim();
    return s.length > 48 ? s.slice(0, 45) + "…" : s;
  }

  // One spreadsheet row (keyed obj) → full analysis. If Agent type is blank but a
  // Description is present, the free-text analyzer is used instead (a bridge to Quick).
  function analyzeScenarioRow(obj) {
    var warnings = [];
    var hasStructured = impText(obj && obj.archetype) !== "";
    var vars, source;
    if (!hasStructured && impText(obj && obj.description) !== "") {
      vars = analyzeText(obj.description).vars; source = "description";
      warnings.push("Read from the free-text description (no Agent type filled in).");
    } else {
      var rv = rowToVars(obj); vars = rv.vars; warnings = rv.warnings; source = "structured";
    }
    // Harness (Copilot Studio engine) applies to BOTH branches — neither rowToVars nor
    // analyzeText reads it, so map the Harness column here. Unrecognized → standard + warn.
    var harnessRaw = impText(obj && obj.harness);
    if (harnessRaw === "") {
      vars.harness = "standard";
    } else {
      var h = impEnum(IMPORT_COL_BY_KEY.harness, obj.harness);
      if (h == null) { warnings.push("Unrecognized Harness \u201C" + harnessRaw + "\u201D \u2014 using standard."); h = "standard"; }
      vars.harness = h;
    }
    var name = impText(obj && obj.name) || descName(obj && obj.description) || "Untitled scenario";
    var profile = deriveQuick(vars);
    var sizing = sizeFromDrivers(vars);
    // GitHub Copilot harness has no per-task tier column on import, so derive the tier from the
    // scenario's build size (mirrors Quick's ghTierForSize) — otherwise ghPerTask defaults to the
    // priciest 'complex' tier for every row, over-pricing lighter agents.
    if (vars.harness === "github-copilot") {
      vars.ghTier = ghTierForSize(sizing.size);
      vars.ghPerTask = ghTierCredits(vars.ghTier);
    }
    var estimate = computeQuick(profile, vars);
    return {
      name: name, source: source, vars: vars, profile: profile,
      perUnit: estimate.perUnit, size: sizing.size, sizeInfo: SIZE_INFO[sizing.size], sizeDrivers: sizing.drivers,
      estimate: estimate, range: creditRange(estimate.monthly), cost: costUSD(estimate.monthly),
      costDrivers: costDrivers(profile, vars), capabilities: scenarioCapabilities(vars), warnings: warnings
    };
  }

  // Full batch: parsed matrix → per-scenario analyses + portfolio totals.
  function analyzeImport(matrix) {
    var parsed = matrixToObjects(matrix);
    var scenarios = parsed.objects.map(analyzeScenarioRow);
    var totals = { count: scenarios.length, monthly: 0, payg: 0, prepaid: 0,
      autonomous: 0, interactive: 0, sizes: { XS: 0, S: 0, M: 0, L: 0, XL: 0 }, flagged: 0 };
    scenarios.forEach(function (s) {
      totals.monthly += s.estimate.monthly;
      totals.payg += s.cost.payg; totals.prepaid += s.cost.prepaid;
      if (s.vars.archetype === "autonomous") totals.autonomous++; else totals.interactive++;
      if (totals.sizes[s.size] != null) totals.sizes[s.size]++;
      if (s.warnings && s.warnings.length) totals.flagged++;
    });
    totals.range = creditRange(totals.monthly);
    return { scenarios: scenarios, totals: totals, headers: parsed.headers, headerMap: parsed.headerMap, headerWarnings: parsed.warnings };
  }

  // ── Modernization advisory (read-only) ────────────────────────────────────
  // Diffs an uploaded solution's DETECTED shape against the same best-practice
  // bar this tool now GENERATES by default: new agent experience, generative
  // orchestration, connectors-as-tools, Work IQ over one-off Microsoft 365
  // reads, and Skills for reusable clusters. Pure / presentational — it only
  // reads analyzeSolution() output and returns advisory items. It NEVER touches
  // any rate, credit, or calculation. Consumed by the Complex-upload results
  // panel (and reusable by a future Agent Studio page).
  //
  // Microsoft 365 connectors whose READ operations Work IQ (Microsoft 365
  // tenant-graph grounding) can consolidate into one permission-trimmed source
  // (mail, calendar, files, Teams, people). Labels match CONNECTOR_CATALOG.
  var WORKIQ_CONNECTORS = {
    "Office 365 Outlook": true, "Office 365 Users": true, "Microsoft Teams": true,
    "SharePoint": true, "OneDrive for Business": true
  };
  function modernizeAdvice(analysis) {
    analysis = analysis || {};
    var f = analysis.findings || {};
    var connectors = analysis.connectors || f.connectors || [];
    var recs = [];

    // R1 — adopt the new agent experience (classic export → new).
    if (!f.newExperience) {
      recs.push({
        id: "new-experience", severity: "build",
        title: "Rebuild in the new agent experience",
        body: "This export is a classic-experience agent (topic-based). The new agent experience is instruction-driven, uses generative orchestration by default, and is what this tool now generates. There is no in-place migration \u2014 recreate the agent in the new experience and carry your instructions, knowledge, and tools across.",
        cost: ""
      });
    }

    // R2 — turn on generative orchestration (classic + non-generative only;
    // the new experience is always generative, so skip it there).
    if (!f.newExperience && !f.genOrch) {
      recs.push({
        id: "generative-orchestration", severity: "build",
        title: "Turn on generative orchestration",
        body: "Generative orchestration is off, so the agent leans on classic topic routing. Microsoft recommends generative orchestration for most agents \u2014 the model picks the right tool and knowledge per turn instead of relying on hand-authored topic trees. Reserve classic routing for narrow, deterministic flows.",
        cost: ""
      });
    }

    // R3 — consolidate one-off Microsoft 365 reads with Work IQ.
    var m365 = connectors.filter(function (c) { return WORKIQ_CONNECTORS[c]; });
    if (m365.length && !f.tenantGraph) {
      recs.push({
        id: "work-iq", severity: "build",
        title: "Consider Work IQ instead of one-off Microsoft 365 reads",
        body: "This agent wires Microsoft 365 connector tool(s): " + m365.join(", ") + ". If it mostly READS across a user's Microsoft 365 (mail, calendar, Teams, files, people), Work IQ (Microsoft 365 tenant-graph grounding) can replace those individual reads with one permission-trimmed, always-current source \u2014 less to wire and maintain. Keep the connectors for genuine WRITES (send, create, update).",
        cost: "Work IQ / tenant-graph grounding bills ~" + CREDIT.tenantGraph + " credits per run; each connector action bills " + CREDIT.action + ". Consolidating several reads per turn is usually simpler and can cost less; for one or two reads the connectors may be cheaper."
      });
    }

    // R4 — promote reusable tool clusters to Skills.
    if (connectors.length >= 3 || (f.connectedAgents || 0) > 0) {
      recs.push({
        id: "skills", severity: "governance",
        title: "Package reusable tool clusters as Skills",
        body: ((f.connectedAgents || 0) > 0
          ? "This solution already composes connected agents. "
          : "This agent wires " + connectors.length + " tools. ") +
          "Related actions used together \u2014 or reused across several agents \u2014 are good candidates to package as Skills, so they can be shared, versioned, and governed centrally instead of re-wired in every agent.",
        cost: ""
      });
    }

    // R5 — right-size the model (reasoning premium).
    if (f.reasoningModel) {
      recs.push({
        id: "right-size-model", severity: "cost",
        title: "Confirm the reasoning model is needed",
        body: "A reasoning-capable model is in use. Reasoning models add a premium meter on top of the feature rate. If the agent's tasks are routine lookups, drafting, or Q&A, a standard model handles them at a fraction of the cost \u2014 reserve reasoning for genuinely multi-step problem solving.",
        cost: "Reasoning bills a premium " + CREDIT.reasoningPremium + " credits per 1K tokens on top of feature rates; a standard model avoids that meter."
      });
    }

    return recs;
  }

  var api = {
    CREDIT: CREDIT, RATE_PAYG: RATE_PAYG, RATE_PREPAID: RATE_PREPAID, ROW: ROW,
    SIZE_INFO: SIZE_INFO, SIZE_ORDER: SIZE_ORDER, sizeForScore: sizeForScore, sizeFromDrivers: sizeFromDrivers,
    perInteractionCredits: perInteractionCredits, billedUsers: billedUsers,
    harnessCovered: harnessCovered, grossUsers: grossUsers,
    GH_DEFAULTS: GH_DEFAULTS, GH_TIERS: GH_TIERS, GH_TIER_RANGE: GH_TIER_RANGE, CONV_PER_TASK: CONV_PER_TASK,
    MODEL_RATES: MODEL_RATES, MODEL_ORDER: MODEL_ORDER, MODEL_DEFAULT: MODEL_DEFAULT,
    TIER_TOKEN_PRESETS: TIER_TOKEN_PRESETS, modelRate: modelRate, modelTokenCredits: modelTokenCredits,
    HARNESS_OVERHEAD_TOKENS: HARNESS_OVERHEAD_TOKENS, GH_TASK_FLOOR: GH_TASK_FLOOR,
    PAYLOAD_PER_TURN: PAYLOAD_PER_TURN, TURNS_PER_TASK_DEFAULT: TURNS_PER_TASK_DEFAULT, TIER_BUCKET: TIER_BUCKET,
    payloadPerTurn: payloadPerTurn, turnsPerTask: turnsPerTask, ghTurnCredits: ghTurnCredits, ghTaskCredits: ghTaskCredits,
    ghConvPerTask: ghConvPerTask, ghTierCredits: ghTierCredits, ghTierForSize: ghTierForSize,
    ghPerTask: ghPerTask, effPerInteraction: effPerInteraction,
    computeEstimate: computeEstimate, computeQuick: computeQuick, creditRange: creditRange, costUSD: costUSD,
    comparePlatforms: comparePlatforms, inferComparatorInputs: inferComparatorInputs,
    costDrivers: costDrivers, QUICK_WIZARD: QUICK_WIZARD,
    detectUsers: detectUsers, detectInteractions: detectInteractions, detectDeployment: detectDeployment,
    detectEventVolume: detectEventVolume, detectArchetype: detectArchetype,
    detectKnowledge: detectKnowledge, detectSystems: detectSystems,
    extractSteps: extractSteps, deriveQuick: deriveQuick,
    inferHarness: inferHarness, inferModel: inferModel,
    STEP_CATALOG: STEP_CATALOG, analyzeText: analyzeText, analyzeSolution: analyzeSolution,
    parseFlowDefinition: parseFlowDefinition, classifyFlowAction: classifyFlowAction,
    connectorInfo: connectorInfo, parseAgentSpec: parseAgentSpec, CONNECTOR_CATALOG: CONNECTOR_CATALOG,
    IMPORT_SCHEMA: IMPORT_SCHEMA, IMPORT_EXAMPLES: IMPORT_EXAMPLES,
    buildHeaderMap: buildHeaderMap, matrixToObjects: matrixToObjects,
    rowToVars: rowToVars, analyzeScenarioRow: analyzeScenarioRow, analyzeImport: analyzeImport,
    modernizeAdvice: modernizeAdvice
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.EstimatorCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

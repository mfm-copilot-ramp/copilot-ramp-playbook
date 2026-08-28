// Run: node estimator-core.test.js
// Tests the harness-aware licensing / gross-vs-net coverage model.
var EC = require("./estimator-core.js");

var failures = 0;
function ok(name, cond) {
  if (cond) { console.log("  PASS  " + name); }
  else { console.log("  FAIL  " + name); failures++; }
}
function near(a, b) { return Math.abs(a - b) < 1e-6; }

var per2 = [{ uses: 1, credits: 2 }];   // per-interaction = 2
var per5 = [{ uses: 1, credits: 5 }];   // per-interaction = 5

// ── harnessCovered ──────────────────────────────────────────────
ok("standard harness is coverable", EC.harnessCovered("standard") === true);
ok("chat harness is coverable", EC.harnessCovered("chat") === true);
ok("github-copilot harness is NEVER coverable", EC.harnessCovered("github-copilot") === false);

// ── billedUsers (zero-rating) ───────────────────────────────────
ok("standard + embedded + 60% licensed → 400 of 1000 billed",
   EC.billedUsers({ harness: "standard", deployment: "embedded", users: 1000, licensePct: 60 }) === 400);
ok("github + embedded + 60% licensed → all 1000 billed (never covered)",
   EC.billedUsers({ harness: "github-copilot", deployment: "embedded", users: 1000, licensePct: 60 }) === 1000);
ok("standard + standalone → all 1000 billed (outside M365 channels)",
   EC.billedUsers({ harness: "standard", deployment: "standalone", users: 1000, licensePct: 60 }) === 1000);
ok("chat + embedded + 100% licensed → 0 billed",
   EC.billedUsers({ harness: "chat", deployment: "embedded", users: 1000, licensePct: 100 }) === 0);
ok("missing harness defaults to coverable (back-compat)",
   EC.billedUsers({ deployment: "embedded", users: 1000, licensePct: 50 }) === 500);

// ── computeQuick interactive: gross vs net ──────────────────────
var q1 = EC.computeQuick(per2, { archetype: "interactive", harness: "standard",
  deployment: "embedded", users: 1000, licensePct: 60, interactions: 10 });
ok("standard: gross = 1000*10*2 = 20000", near(q1.grossMonthly, 20000));
ok("standard: net = 400*10*2 = 8000", near(q1.netMonthly, 8000));
ok("standard: monthly stays net (back-compat)", near(q1.monthly, 8000));
ok("standard: covered = true", q1.covered === true);
ok("standard: coveredUsers = 600", q1.coveredUsers === 600);

var q2 = EC.computeQuick(per2, { archetype: "interactive", harness: "github-copilot",
  deployment: "embedded", users: 1000, licensePct: 60, interactions: 10, ghPerTask: 2 });
// Volume decoupled: tasks = 1000×10 / 4 (default conversations-per-task) = 2500; ×2 = 5000.
ok("github: tasks = conversations/4 → net == gross == 5000 (no coverage)",
   near(q2.grossMonthly, 5000) && near(q2.netMonthly, 5000));
ok("github: tasksPerMonth = 2500", q2.tasksPerMonth === 2500);
ok("github: covered = false", q2.covered === false);

// conversations-per-task is editable: halving it doubles the tasks (and the cost).
var q2b = EC.computeQuick(per2, { archetype: "interactive", harness: "github-copilot",
  deployment: "embedded", users: 1000, licensePct: 60, interactions: 10, ghPerTask: 2, conversationsPerTask: 2 });
ok("github: conversationsPerTask=2 → tasks = 5000, net = 10000", q2b.tasksPerMonth === 5000 && near(q2b.netMonthly, 10000));

// ── computeQuick autonomous: net == gross on any harness ────────
var q3 = EC.computeQuick(per5, { archetype: "autonomous", harness: "standard", events: 2000 });
ok("autonomous: gross == net == 10000", near(q3.grossMonthly, 10000) && near(q3.netMonthly, 10000));
ok("autonomous: covered = false (per-event, no discount)", q3.covered === false);

// ── computeEstimate (detailed path) ─────────────────────────────
var e1 = EC.computeEstimate(per2, { harness: "standard", deployment: "embedded",
  users: 1000, licensePct: 60, interactions: 10 });
ok("computeEstimate: net = 8000, gross = 20000",
   near(e1.netMonthly, 8000) && near(e1.grossMonthly, 20000));
var e2 = EC.computeEstimate(per2, { harness: "github-copilot", deployment: "embedded",
  users: 1000, licensePct: 60, interactions: 10, ghPerTask: 2 });
ok("computeEstimate github: tasks=2500 → net == gross == 5000", near(e2.netMonthly, e2.grossMonthly) && near(e2.netMonthly, 5000));

// ── GitHub Copilot harness — mid-band per-task anchors + ranges ─
// MS publishes only per-task RANGES by complexity (Light 100–300 · Medium 300–500 · Heavy 500+),
// image-only. We anchor at the MID-BAND (not the ceiling) and default to MEDIUM (never complex).
ok("GH_TIERS mid-band anchors 200/400/650", EC.GH_TIERS.simple === 200 && EC.GH_TIERS.medium === 400 && EC.GH_TIERS.complex === 650);
ok("GH_TIER_RANGE published bands present", EC.GH_TIER_RANGE.simple[0] === 100 && EC.GH_TIER_RANGE.medium[1] === 500 && EC.GH_TIER_RANGE.complex[0] === 500);
ok("GH default tier = medium (NOT complex)", EC.GH_DEFAULTS.tier === "medium");
ok("ghTierCredits simple = 200", EC.ghTierCredits("simple") === 200);
ok("ghTierCredits medium = 400", EC.ghTierCredits("medium") === 400);
ok("ghTierCredits complex = 650", EC.ghTierCredits("complex") === 650);
ok("ghTierCredits unknown → medium default 400", EC.ghTierCredits("???") === 400);

// tier-from-t-shirt-size mapping — GitHub follows the scenario, not always Heavy.
ok("ghTierForSize XS → simple", EC.ghTierForSize("XS") === "simple");
ok("ghTierForSize S → simple", EC.ghTierForSize("S") === "simple");
ok("ghTierForSize M → medium", EC.ghTierForSize("M") === "medium");
ok("ghTierForSize L → complex", EC.ghTierForSize("L") === "complex");
ok("ghTierForSize XL → complex", EC.ghTierForSize("XL") === "complex");

var per7 = [{ uses: 1, credits: 2 }, { uses: 1, credits: 5 }]; // base grid = 7 (must be IGNORED on GH)
ok("ghPerTask default (no tier) → medium anchor 400, grid ignored", EC.ghPerTask(7, {}) === 400);
ok("ghPerTask tier=simple → 200 (grid ignored)", EC.ghPerTask(7, { ghTier: "simple" }) === 200);
ok("ghPerTask tier=complex → 650", EC.ghPerTask(7, { ghTier: "complex" }) === 650);
ok("ghPerTask explicit override wins → 1500", EC.ghPerTask(7, { ghTier: "simple", ghPerTask: 1500 }) === 1500);
ok("effPerInteraction standard = base 7 (grid used)", EC.effPerInteraction(7, "standard", {}) === 7);
ok("effPerInteraction github = medium anchor 400 (grid ignored)", EC.effPerInteraction(7, "github-copilot", {}) === 400);

// ── LOCKED SCENARIO MATRIX (grounded in MS published bands) ─────
// Common: 500 users × 20 interactions/mo × embedded, 60% licensed unless noted.
// A — Standard, generative(2)+tenantGraph(10)=12, no reasoning. Unchanged by the rework.
var A = EC.computeQuick([{ uses: 1, credits: 2 }, { uses: 1, credits: 10 }],
  { archetype: "interactive", harness: "standard", deployment: "embedded", users: 500, licensePct: 60, interactions: 20 });
ok("A standard perUnit = 12", near(A.perUnit, 12));
ok("A standard net = 200×20×12 = 48000", near(A.netMonthly, 48000));
ok("A standard gross = 500×20×12 = 120000", near(A.grossMonthly, 120000));

// C — GitHub Complex (anchor 650); tasks = 500×20/4 = 2500; never covered. Build 40×650.
var C = EC.computeQuick([{ uses: 1, credits: 2 }, { uses: 1, credits: 10 }],
  { archetype: "interactive", harness: "github-copilot", deployment: "embedded", users: 500, licensePct: 60, interactions: 20, ghTier: "complex" });
ok("C github complex perTask = 650 (grid ignored)", near(C.perTask, 650));
ok("C github tasks = 2500", C.tasksPerMonth === 2500);
ok("C github net = gross = 2500×650 = 1,625,000", near(C.netMonthly, 1625000) && near(C.grossMonthly, 1625000));
ok("C github never covered", C.covered === false);
ok("C github build/test = 40×650 = 26000", C.buildTestCredits === 26000);

// D — GitHub Simple (anchor 200), small pilot 50 users / 0% licensed. tasks = 50×20/4 = 250.
var D = EC.computeQuick([{ uses: 1, credits: 2 }, { uses: 1, credits: 10 }],
  { archetype: "interactive", harness: "github-copilot", deployment: "embedded", users: 50, licensePct: 0, interactions: 20, ghTier: "simple" });
ok("D github simple perTask = 200", near(D.perTask, 200));
ok("D github net = gross = 250×200 = 50000", near(D.netMonthly, 50000) && near(D.grossMonthly, 50000));
ok("D github build/test = 40×200 = 8000", D.buildTestCredits === 8000);

// E — GitHub Medium (anchor 400) at the common 500-user population (apples-to-apples vs C).
var E = EC.computeQuick([{ uses: 1, credits: 2 }, { uses: 1, credits: 10 }],
  { archetype: "interactive", harness: "github-copilot", deployment: "embedded", users: 500, licensePct: 60, interactions: 20, ghTier: "medium" });
ok("E github medium perTask = 400", near(E.perTask, 400));
ok("E github net = gross = 2500×400 = 1,000,000", near(E.netMonthly, 1000000));
ok("E github build/test = 40×400 = 16000", E.buildTestCredits === 16000);

// Standard harness is untouched by the GH rework.
var sq2 = EC.computeQuick(per7, { archetype: "interactive", harness: "standard",
  deployment: "embedded", users: 1000, licensePct: 60, interactions: 10 });
ok("standard perTask unchanged = 7", near(sq2.perTask, 7));
ok("standard net = 400×10×7 = 28000 (unchanged)", near(sq2.netMonthly, 28000));
ok("standard build/test = 0", sq2.buildTestCredits === 0);

// ── Tweak #1: Solution-mode reasoning premium default (2K → 5K) ──
// A reasoning-capable model detected in an uploaded package adds a premium meter row:
// uses = REASON_TOKENS_K (now 5) × 10 credits/1K tokens = +50 (was +20 at 2K).
var solR = EC.analyzeSolution([{ name: "spec.md", text:
  "Agent build spec. Generative agent. Uses a reasoning model (o3) for multi-step inference. Grounds on the tenant graph." }]);
var rRow = (solR.profile || []).filter(function (r) { return r.key === "reasoning"; })[0];
ok("solution reasoning row present", !!rRow);
ok("solution reasoning uses = 5 (REASON_TOKENS_K raised 2→5)", rRow && rRow.uses === 5);
ok("solution reasoning credits/use = 10 (premium meter)", rRow && rRow.credits === 10);

// ── Quick + Import: the Harness column is honored end-to-end ─────
var IMPORT_HEADERS = EC.IMPORT_SCHEMA.map(function (c) { return c.header; });
function impRow(o) { return EC.IMPORT_SCHEMA.map(function (c) { return o[c.key] == null ? "" : o[c.key]; }); }
var impMatrix = [
  IMPORT_HEADERS,
  impRow({ name: "Std helpdesk", archetype: "Interactive", harness: "Standard", channel: "Chat",
           knowledge: "Documents", actionsCount: 2, systemsCount: 1, hasEscalation: "Yes",
           users: 800, interactions: 6, deployment: "Embedded", licensePct: 60 }),
  impRow({ name: "GH deal desk", archetype: "Interactive", harness: "GitHub Copilot", channel: "Chat",
           knowledge: "Tenant graph", actionsCount: 3, systemsCount: 2, hasAI: "Yes", hasEscalation: "Yes",
           users: 300, interactions: 8, deployment: "Embedded", licensePct: 80 }),
  impRow({ name: "GH from description", harness: "GitHub Copilot",
           description: "Agentic assistant that reasons over CRM and drafts quotes for sellers." }),
  impRow({ name: "Bad harness", archetype: "Interactive", harness: "not-a-harness", channel: "Chat",
           users: 100, interactions: 4, deployment: "Embedded", licensePct: 0 })
];
var imp = EC.analyzeImport(impMatrix);
var sStd = imp.scenarios[0], sGh = imp.scenarios[1], sGhDesc = imp.scenarios[2], sBad = imp.scenarios[3];

ok("import: standard row harness = standard", sStd.vars.harness === "standard");
ok("import: standard row build/test = 0", sStd.estimate.buildTestCredits === 0);
ok("import: standard row has M365 coverage (covered = true)", sStd.estimate.covered === true);

ok("import: GH row harness = github-copilot", sGh.vars.harness === "github-copilot");
ok("import: GH row never covered (net == gross)",
   sGh.estimate.covered === false && near(sGh.estimate.netMonthly, sGh.estimate.grossMonthly));
ok("import: GH row perTask follows the size-derived tier",
   near(sGh.estimate.perTask, EC.ghTierCredits(EC.ghTierForSize(sGh.size))));
ok("import: GH row perTask is a published mid-band anchor, not the base grid",
   [200, 400, 650].indexOf(sGh.estimate.perTask) >= 0);
ok("import: GH row carries one-time build/test credits", sGh.estimate.buildTestCredits > 0);

ok("import: GH via description-only also honors the Harness column",
   sGhDesc.vars.harness === "github-copilot" && sGhDesc.estimate.covered === false);

ok("import: unrecognized harness falls back to standard", sBad.vars.harness === "standard");
ok("import: unrecognized harness warns",
   (sBad.warnings || []).some(function (w) { return /Unrecognized Harness/.test(w); }));

// ── Model-aware token build-up (#1 + #2) — Copilot Studio catalog ────────────
// Rate card = models Copilot Studio exposes; rates = GitHub per-1M ÷ 10.
ok("MODEL_ORDER has 9 Studio models", EC.MODEL_ORDER.length === 9);
ok("MODEL_DEFAULT = claude-sonnet-4.6", EC.MODEL_DEFAULT === "claude-sonnet-4.6");
ok("sonnet-4.6 direct rate in=0.30 out=1.5", EC.MODEL_RATES["claude-sonnet-4.6"].in === 0.30 && EC.MODEL_RATES["claude-sonnet-4.6"].out === 1.5 && EC.MODEL_RATES["claude-sonnet-4.6"].rateSource === "direct");
ok("opus-4.6 direct rate in=0.50 out=2.5 (Deep tag)", EC.MODEL_RATES["claude-opus-4.6"].in === 0.50 && EC.MODEL_RATES["claude-opus-4.6"].out === 2.5 && EC.MODEL_RATES["claude-opus-4.6"].tag === "Deep");
ok("gpt-4.1 is a labelled PROXY (no direct GitHub rate)", EC.MODEL_RATES["gpt-4.1"].rateSource === "proxy" && EC.MODEL_RATES["gpt-4.1"].proxyOf === "GPT-5.4");
ok("claude-sonnet-5 is GitHub-harness-only", EC.MODEL_RATES["claude-sonnet-5"].ghHarnessOnly === true);

// ── Canonical GitHub-harness task model (overhead + per-turn × turns, floored) ────
// modelTokenCredits now = ghTaskCredits.taskCredits (per-task, turns default 6, overhead 15K),
// with tier -> payload bucket (medium -> "some" = 40K/turn).
//   per-turn Sonnet: (15K+40K)=55K in, 5.5K out -> (55*0.30)+(5.5*1.50)=24.75 ; ×6 = 148.5
ok("modelTokenCredits sonnet-4.6/medium(some)/6t = 148.5",
   near(EC.modelTokenCredits({ model: "claude-sonnet-4.6", ghTier: "medium" }), 148.5));
//   Opus per-turn: (55*0.50)+(5.5*2.50)=41.25 ; ×6 = 247.5
ok("modelTokenCredits opus-4.6/medium = 247.5",
   near(EC.modelTokenCredits({ model: "claude-opus-4.6", ghTier: "medium" }), 247.5));
// Cache-hit must REDUCE cost.
ok("modelTokenCredits opus/medium/90%cache = 113.85 (caching reduces cost)",
   near(EC.modelTokenCredits({ model: "claude-opus-4.6", ghTier: "medium", cacheHitPct: 90 }), 113.85));
ok("cache-hit strictly reduces cost (incentive not inverted)",
   EC.modelTokenCredits({ model: "claude-opus-4.6", ghTier: "medium", cacheHitPct: 90 }) < EC.modelTokenCredits({ model: "claude-opus-4.6", ghTier: "medium", cacheHitPct: 0 }));
// Harness overhead constant + floor + band-consistency.
ok("HARNESS_OVERHEAD_TOKENS = 15000", EC.HARNESS_OVERHEAD_TOKENS === 15000);
ok("GH_TASK_FLOOR = 100 (published Light band min)", EC.GH_TASK_FLOOR === 100);
ok("tiny task floored to 100", near(EC.ghTaskCredits({ model: "claude-sonnet-4.6", payloadBucket: "little", turns: 1 }).taskCredits, 100));
ok("large/6t Sonnet lands in Medium band (300-500)", (function(){ var c=EC.ghTaskCredits({model:"claude-sonnet-4.6",payloadBucket:"large"}).taskCredits; return c>=300 && c<=500; })());
ok("large/15t Sonnet lands in Heavy band (>500)", EC.ghTaskCredits({model:"claude-sonnet-4.6",payloadBucket:"large",turns:15}).taskCredits > 500);
ok("ghTurnCredits sonnet/little = 13.5", near(EC.ghTurnCredits({ model: "claude-sonnet-4.6", payloadBucket: "little" }), 13.5));

// ghPerTask model path = canonical task credits (tokens bundle the tools; no double-count).
ok("ghPerTask model path = task credits (no feature double-count)",
   near(EC.ghPerTask(20, { model: "claude-sonnet-4.6", ghTier: "medium" }), 148.5));
ok("ghPerTask explicit override beats model",
   EC.ghPerTask(20, { model: "claude-opus-4.6", ghTier: "complex", ghPerTask: 1234 }) === 1234);
// BACK-COMPAT: no model → flat published tier anchors unchanged.
ok("ghPerTask no-model back-compat medium = 400", EC.ghPerTask(7, { ghTier: "medium" }) === 400);
ok("ghPerTask no-model back-compat complex = 650", EC.ghPerTask(7, { ghTier: "complex" }) === 650);

// End-to-end through computeQuick: canonical per-task drives monthly credits.
//   500 users × 20 int / 4 conv-per-task = 2500 tasks ; perTask = 148.5 (tokens only)
var Mq = EC.computeQuick([{ uses: 1, credits: 2 }, { uses: 1, credits: 10 }],
  { archetype: "interactive", harness: "github-copilot", deployment: "embedded",
    users: 500, licensePct: 60, interactions: 20, ghTier: "medium", model: "claude-sonnet-4.6" });
ok("computeQuick model path: perTask = 148.5 (tokens, no feature double-count)", near(Mq.perTask, 148.5));
ok("computeQuick model path: tasks = 2500", Mq.tasksPerMonth === 2500);
ok("computeQuick model path: monthly = 2500 × 148.5 = 371250", near(Mq.netMonthly, 371250));
ok("computeQuick model path: never covered", Mq.covered === false);
var Mq2 = EC.computeQuick([{ uses: 1, credits: 2 }, { uses: 1, credits: 10 }],
  { archetype: "interactive", harness: "github-copilot", deployment: "embedded",
    users: 500, licensePct: 60, interactions: 20, ghTier: "medium", model: "claude-opus-4.6" });
ok("computeQuick: Opus (Deep) costs more than Sonnet", Mq2.netMonthly > Mq.netMonthly);

// ── GHCP ⇄ M365 comparator — canonical + grounding levels ───────────────────
var cLittle = EC.comparePlatforms({ model: "claude-sonnet-4.6", payloadBucket: "little", turns: 6, groundingType: "tenant" });
ok("comparator: tenant grounding M365/turn = 12", cLittle.m365PerTurn === 12);
ok("comparator: GH task floored to 100 (little/6t)", near(cLittle.ghcpPerJob, 100) && cLittle.ghFloored === true);
var cLarge = EC.comparePlatforms({ model: "claude-sonnet-4.6", payloadBucket: "large", turns: 6, groundingType: "tenant" });
ok("comparator: large payload GH job > M365 job (harness pricier)", cLarge.ghcpPerJob > cLarge.m365PerJob && cLarge.cheaper === "m365");
ok("comparator: bigger payload raises GH cost", cLarge.ghcpPerJob > cLittle.ghcpPerJob);
// Grounding levels: none(2) / docs(2) / tenant(12) / action(7).
ok("comparator: none grounding M365/turn = 2", EC.comparePlatforms({ model: "claude-sonnet-4.6", groundingType: "none" }).m365PerTurn === 2);
ok("comparator: docs grounding M365/turn = 2", EC.comparePlatforms({ model: "claude-sonnet-4.6", groundingType: "docs" }).m365PerTurn === 2);
ok("comparator: connector action M365/turn = 7 (2+5)", EC.comparePlatforms({ model: "claude-sonnet-4.6", groundingType: "action" }).m365PerTurn === 7);
ok("comparator: legacy grounded:false → none (2)", EC.comparePlatforms({ model: "claude-sonnet-4.6", grounded: false }).m365PerTurn === 2);

// ── Harness + model inference (Quick) ───────────────────────────────────────
function harnessOf(text, extra) { return EC.inferHarness(text, extra || {}); }
// Reasoning / multistep / big-context → GitHub Copilot harness.
ok("infer: 'reason over CRM and draft, multi-step' → github",
   harnessOf("An agent that reasons over CRM and email and drafts quotes across multiple steps", { orchestration: "generative", actionsCount: 3 }).harness === "github-copilot");
ok("infer: 'read the entire operator manual and troubleshoot' → github",
   harnessOf("Reads the entire operator manual to troubleshoot shop-floor issues", { knowledge: "docs", hasContent: true }).harness === "github-copilot");
ok("infer: 'iterative non-deterministic warranty claim' → github",
   harnessOf("Handles the warranty claim return process which is iterative and non-deterministic", {}).harness === "github-copilot");
// Rule-based / one-tool / FAQ → standard.
ok("infer: 'answer FAQs from our docs' → standard",
   harnessOf("A simple chatbot that answers FAQs from our policy documents", { orchestration: "classic", actionsCount: 0 }).harness === "standard");
ok("infer: 'look up order status, create a ServiceNow ticket' → standard",
   harnessOf("Look up an order status and create a ServiceNow ticket", { orchestration: "classic", actionsCount: 1 }).harness === "standard");
// M365 tenant-graph answers → chat.
ok("infer: tenant-graph answers only → chat",
   harnessOf("Answers questions from our Microsoft 365 tenant data in Teams", { knowledge: "tenantGraph", actionsCount: 0 }).harness === "chat");
// Empty → default standard.
ok("infer: no signal defaults to standard", harnessOf("", {}).harness === "standard");
// Confidence + plain why present.
var hi = harnessOf("reasons through multi-step analysis and troubleshooting", { orchestration: "generative", actionsCount: 3 });
ok("infer: returns confidence + plain why", !!hi.confidence && typeof hi.why === "string" && hi.why.length > 0);

// Model inference: Deep signal → Deep model; else General; non-github → null.
ok("inferModel: deep reasoning → Opus (Deep)",
   EC.inferModel("github-copilot", "complex troubleshooting and root cause analysis", {}).model === "claude-opus-4.6");
ok("inferModel: general → Sonnet (General)",
   EC.inferModel("github-copilot", "drafts a friendly reply", {}).model === "claude-sonnet-4.6");
ok("inferModel: standard harness → no model", EC.inferModel("standard", "anything", {}).model === null);

// End-to-end: analyzeText sets harness + model + why on a reasoning agent.
var at = EC.analyzeText("An agent that reasons over CRM and email and drafts quotes across several steps for our sales team, about 20 times a month");
ok("analyzeText: infers github harness", at.vars.harness === "github-copilot");
ok("analyzeText: infers a model", !!at.vars.model);
ok("analyzeText: exposes harness rationale", typeof at.why.harness === "string" && at.why.harness.length > 0);

// ── Comparator natural-language intake ──────────────────────────────────────
var ci1 = EC.inferComparatorInputs("An agent that reads the entire operator manual to troubleshoot issues, several steps each time");
ok("cmp NL: large document → large payload bucket", ci1.payloadBucket === "large" && ci1.inputTokens >= 60000);
ok("cmp NL: multi-step → many turns", ci1.turnsBucket === "many" && ci1.turns >= 12);
ok("cmp NL: deep reasoning → a model set", !!ci1.model);
var ci2 = EC.inferComparatorInputs("A simple FAQ bot that answers a quick question from a look-up, one and done");
ok("cmp NL: quick/faq → little payload", ci2.payloadBucket === "little" && ci2.inputTokens <= 20000);
ok("cmp NL: single step → one turn", ci2.turnsBucket === "one");
var ci3 = EC.inferComparatorInputs("Answers from our SharePoint policy documents and knowledge base");
ok("cmp NL: files/KB → some payload", ci3.payloadBucket === "some");
ok("cmp NL: docs grounding → groundingType docs", ci3.groundingType === "docs");
var ci3b = EC.inferComparatorInputs("Looks up an order and creates a ServiceNow ticket");
ok("cmp NL: action → groundingType action", ci3b.groundingType === "action");
var ci3c = EC.inferComparatorInputs("Answers questions across our Microsoft 365 tenant data");
ok("cmp NL: M365 tenant → groundingType tenant", ci3c.groundingType === "tenant");
var ci4 = EC.inferComparatorInputs("Processes about 12 pages per case");
ok("cmp NL: explicit pages → payload from pages", ci4.inputTokens > 5000 && ci4.why.payload.indexOf("page") >= 0);
var ci5 = EC.inferComparatorInputs("Reads roughly 80k tokens of context per turn");
ok("cmp NL: explicit tokens → large bucket ~80k", ci5.inputTokens === 80000 && ci5.payloadBucket === "large");
ok("cmp NL: returns plain why for each axis", !!(ci1.why && ci1.why.payload && ci1.why.turns && ci1.why.model && ci1.why.grounding));
// End-to-end: NL inputs feed comparePlatforms cleanly.
var ceOut = EC.comparePlatforms(EC.inferComparatorInputs("reads a long contract, multi-step review"));
ok("cmp NL → comparePlatforms yields a verdict", ceOut.cheaper === "m365" || ceOut.cheaper === "github");

// Cache-reuse inference — the lever that lets the GitHub harness beat flat M365 events.
var ciCache = EC.inferComparatorInputs("A Teams assistant for many quick back and forth questions over the same Microsoft 365 people, meetings, and mail — a long-running chat that reuses the same tenant context across dozens of short turns throughout the day.");
ok("cmp NL: reuse language → high cache-hit inferred", ciCache.cacheHitPct >= 80);
ok("cmp NL: assistant scenario → tenant grounding + many turns", ciCache.groundingType === "tenant" && ciCache.turnsBucket === "many");
var ceCache = EC.comparePlatforms(ciCache);
ok("cmp NL: high-cache/many-turn/tenant scenario → GitHub harness is cheaper", ceCache.cheaper === "github" && ceCache.ghcpPerJob < ceCache.m365PerJob);
ok("cmp NL: no reuse language → cache stays 0", EC.inferComparatorInputs("Looks up an order and creates a ServiceNow ticket").cacheHitPct === 0);

// Distinct scenarios must produce DISTINCT GitHub-harness costs — no collapse onto one number.
var gIt = Math.round(EC.comparePlatforms(EC.inferComparatorInputs("An IT helpdesk agent in Teams that answers common support questions from our knowledge base and can reset passwords and create tickets in ServiceNow.")).ghcpPerJob);
var gSales = Math.round(EC.comparePlatforms(EC.inferComparatorInputs("A sales enablement agent that drafts proposals and summarizes product docs for our sellers, grounded on our SharePoint sales library.")).ghcpPerJob);
var gFin = Math.round(EC.comparePlatforms(EC.inferComparatorInputs("Whenever an invoice is submitted, the agent extracts the fields from the scanned document, validates them, and runs a Power Automate approval workflow.")).ghcpPerJob);
ok("cmp NL: IT vs Sales price differently (Sales drafts more → costs more)", gIt !== gSales && gSales > gIt);
ok("cmp NL: three distinct scenarios yield >=2 distinct GH costs", new Set([gIt, gSales, gFin]).size >= 2);

console.log(failures === 0 ? "\nALL PASS" : "\n" + failures + " FAILURE(S)");
process.exit(failures > 0 ? 1 : 0);

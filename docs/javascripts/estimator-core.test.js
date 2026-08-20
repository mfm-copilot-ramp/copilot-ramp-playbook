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

console.log(failures === 0 ? "\nALL PASS" : "\n" + failures + " FAILURE(S)");
process.exit(failures > 0 ? 1 : 0);

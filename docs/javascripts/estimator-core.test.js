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
ok("github: explicit perTask=2 → gross == net == 20000 (no coverage)",
   near(q2.grossMonthly, 20000) && near(q2.netMonthly, 20000));
ok("github: covered = false", q2.covered === false);

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
ok("computeEstimate github: explicit perTask=2 → net == gross == 20000", near(e2.netMonthly, e2.grossMonthly) && near(e2.netMonthly, 20000));

// ── GitHub Copilot harness — published-tier per-task model ──────
// Microsoft publishes only per-task credit RANGES by complexity (Light 100–300 · Medium 300–500
// · Heavy >500). We price at editable tier anchors 300 / 500 / 800 and IGNORE the grid `per`.
ok("GH_TIERS anchors 300/500/800", EC.GH_TIERS.simple === 300 && EC.GH_TIERS.medium === 500 && EC.GH_TIERS.complex === 800);
ok("ghTierCredits simple = 300", EC.ghTierCredits("simple") === 300);
ok("ghTierCredits medium = 500", EC.ghTierCredits("medium") === 500);
ok("ghTierCredits complex = 800", EC.ghTierCredits("complex") === 800);
ok("ghTierCredits unknown → complex default 800", EC.ghTierCredits("???") === 800);

// tier-from-t-shirt-size mapping — GitHub follows the scenario, not always Heavy.
ok("ghTierForSize XS → simple", EC.ghTierForSize("XS") === "simple");
ok("ghTierForSize S → simple", EC.ghTierForSize("S") === "simple");
ok("ghTierForSize M → medium", EC.ghTierForSize("M") === "medium");
ok("ghTierForSize L → complex", EC.ghTierForSize("L") === "complex");
ok("ghTierForSize XL → complex", EC.ghTierForSize("XL") === "complex");

var per7 = [{ uses: 1, credits: 2 }, { uses: 1, credits: 5 }]; // base grid = 7 (must be IGNORED on GH)
ok("ghPerTask default (no tier) → complex anchor 800, grid ignored", EC.ghPerTask(7, {}) === 800);
ok("ghPerTask tier=simple → 300 (grid ignored)", EC.ghPerTask(7, { ghTier: "simple" }) === 300);
ok("ghPerTask tier=medium → 500", EC.ghPerTask(7, { ghTier: "medium" }) === 500);
ok("ghPerTask explicit override wins → 1500", EC.ghPerTask(7, { ghTier: "simple", ghPerTask: 1500 }) === 1500);
ok("effPerInteraction standard = base 7 (grid used)", EC.effPerInteraction(7, "standard", {}) === 7);
ok("effPerInteraction github = tier anchor 800 (grid ignored)", EC.effPerInteraction(7, "github-copilot", {}) === 800);

// ── LOCKED SCENARIO MATRIX (grounded in MS published bands) ─────
// Common: 500 users × 20 interactions/mo × embedded, 60% licensed unless noted.
// A — Standard, generative(2)+tenantGraph(10)=12, no reasoning. Unchanged by the rework.
var A = EC.computeQuick([{ uses: 1, credits: 2 }, { uses: 1, credits: 10 }],
  { archetype: "interactive", harness: "standard", deployment: "embedded", users: 500, licensePct: 60, interactions: 20 });
ok("A standard perUnit = 12", near(A.perUnit, 12));
ok("A standard net = 200×20×12 = 48000", near(A.netMonthly, 48000));
ok("A standard gross = 500×20×12 = 120000", near(A.grossMonthly, 120000));

// C — GitHub Complex (anchor 800), grid hidden; never covered (net=gross). Build 40×800.
var C = EC.computeQuick([{ uses: 1, credits: 2 }, { uses: 1, credits: 10 }],
  { archetype: "interactive", harness: "github-copilot", deployment: "embedded", users: 500, licensePct: 60, interactions: 20, ghTier: "complex" });
ok("C github complex perTask = 800 (grid ignored)", near(C.perTask, 800));
ok("C github net = gross = 500×20×800 = 8,000,000", near(C.netMonthly, 8000000) && near(C.grossMonthly, 8000000));
ok("C github never covered", C.covered === false);
ok("C github build/test = 40×800 = 32000", C.buildTestCredits === 32000);

// D — GitHub Simple (anchor 300), small pilot 50 users / 0% licensed.
var D = EC.computeQuick([{ uses: 1, credits: 2 }, { uses: 1, credits: 10 }],
  { archetype: "interactive", harness: "github-copilot", deployment: "embedded", users: 50, licensePct: 0, interactions: 20, ghTier: "simple" });
ok("D github simple perTask = 300", near(D.perTask, 300));
ok("D github net = gross = 50×20×300 = 300000", near(D.netMonthly, 300000) && near(D.grossMonthly, 300000));
ok("D github build/test = 40×300 = 12000", D.buildTestCredits === 12000);

// E — GitHub Medium (anchor 500) at the common 500-user population (apples-to-apples vs C).
var E = EC.computeQuick([{ uses: 1, credits: 2 }, { uses: 1, credits: 10 }],
  { archetype: "interactive", harness: "github-copilot", deployment: "embedded", users: 500, licensePct: 60, interactions: 20, ghTier: "medium" });
ok("E github medium perTask = 500", near(E.perTask, 500));
ok("E github net = gross = 500×20×500 = 5,000,000", near(E.netMonthly, 5000000));
ok("E github build/test = 40×500 = 20000", E.buildTestCredits === 20000);

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

console.log(failures === 0 ? "\nALL PASS" : "\n" + failures + " FAILURE(S)");
process.exit(failures > 0 ? 1 : 0);

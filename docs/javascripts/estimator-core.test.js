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
  deployment: "embedded", users: 1000, licensePct: 60, interactions: 10 });
ok("github: gross == net == 20000 (no coverage)",
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
  users: 1000, licensePct: 60, interactions: 10 });
ok("computeEstimate github: net == gross == 20000", near(e2.netMonthly, e2.grossMonthly) && near(e2.netMonthly, 20000));

console.log(failures === 0 ? "\nALL PASS" : "\n" + failures + " FAILURE(S)");
process.exit(failures > 0 ? 1 : 0);

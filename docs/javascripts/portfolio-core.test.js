/* Smoke test for portfolio-core.js Cowork recompute — node portfolio-core.test.js */
var P = require("./portfolio-core.js");
var CE = require("./estimator-cowork.js");
var engines = { CoworkEstimator: CE, EstimatorCore: null };
var fails = 0;
function ok(name, cond, got) { if (!cond) { fails++; console.log("FAIL: " + name + (got !== undefined ? "  got=" + JSON.stringify(got) : "")); } else console.log("pass: " + name); }
function near(a, b, eps) { return Math.abs(a - b) <= (eps || 0.5); }

// 1. Cowork QUICK item recompute (backward compatible)
var quickItem = { producer: "cowork", input: { cowork: { licensedUsers: 1000, mauPct: 15, creditsPerActiveUser: 5000 } } };
var rq = P.recomputeItem(quickItem, engines);
ok("quick ok", rq.ok === true, rq.note);
ok("quick credits = 750000", rq.monthlyCredits === 750000, rq.monthlyCredits);
ok("quick cost = $7500", near(rq.monthlyCostUSD, 7500), rq.monthlyCostUSD);
ok("quick value null (consumption)", rq.value === null, rq.value);

// 2. Cowork DETAILED item recompute (per-cohort / imported) — the new path
var detItem = { producer: "cowork", input: { cowork: { mode: "detailed", cohorts: [
  { licensedUsers: 1000, mauPct: 20, creditsPerActiveUser: 4000 },
  { licensedUsers: 200, mauPct: 50, creditsPerActiveUser: 3000 }
], global: {} } } };
// cohort1: 200 active × 4000 = 800,000 ; cohort2: 100 active × 3000 = 300,000 = 1,100,000
var rd = P.recomputeItem(detItem, engines);
ok("detailed ok", rd.ok === true, rd.note);
ok("detailed credits = 1100000", rd.monthlyCredits === 1100000, rd.monthlyCredits);
ok("detailed cost = $11000", near(rd.monthlyCostUSD, 11000), rd.monthlyCostUSD);

// 3. cohorts array without explicit mode still detected as detailed
var detNoMode = { producer: "cowork", input: { cowork: { cohorts: [{ licensedUsers: 500, mauPct: 10, creditsPerActiveUser: 2000 }], global: {} } } };
var rn = P.recomputeItem(detNoMode, engines);
ok("cohorts-without-mode → detailed (50×2000=100000)", rn.monthlyCredits === 100000, rn.monthlyCredits);

// 4. Aggregate a mixed quick+detailed cowork set
var agg = P.aggregate([quickItem, detItem], engines);
ok("aggregate count = 2", agg.count === 2, agg.count);
ok("aggregate credits = 1,850,000", agg.monthlyCredits === 1850000, agg.monthlyCredits);
ok("aggregate cost = $18,500", near(agg.monthlyCostUSD, 18500), agg.monthlyCostUSD);
ok("byProducer cowork count = 2", agg.byProducer.cowork && agg.byProducer.cowork.count === 2, agg.byProducer.cowork);
ok("aggregate notes mention cowork value", (agg.notes.join(" ").toLowerCase().indexOf("cowork") >= 0), agg.notes);

// 5. Cowork value seed: activeUsers exposed + suggested value model
ok("recompute exposes cowork activeUsers (quick 150)", rq.activeUsers === 150, rq.activeUsers);
ok("recompute exposes cowork activeUsers (detailed 300)", rd.activeUsers === 300, rd.activeUsers);
// aggregate coworkActiveUsers = 150 + 300 = 450 ; suggested = 450 × 15 × 22 × 50 / 60
var expectSuggest = Math.round(450 * 15 * 22 * 50 / 60);
ok("aggregate coworkActiveUsers = 450", agg.coworkActiveUsers === 450, agg.coworkActiveUsers);
ok("aggregate suggestedCoworkValueMonthly = " + expectSuggest, agg.suggestedCoworkValueMonthly === expectSuggest, agg.suggestedCoworkValueMonthly);
ok("suggestCoworkValue(100) = " + Math.round(100*15*22*50/60), P.suggestCoworkValue(100) === Math.round(100 * 15 * 22 * 50 / 60), P.suggestCoworkValue(100));

// 6. Frozen studio estimate (uploaded solution / import — no NL text, uses input.credits)
var EC = require("./estimator-core.js");
var engines2 = { CoworkEstimator: CE, EstimatorCore: EC };
var frozen = { producer: "studio", input: { credits: 12000 }, meta: { size: "M", regime: "interactive", volume: 5000 } };
var rf = P.recomputeItem(frozen, engines2);
ok("frozen ok", rf.ok === true, rf.note);
ok("frozen credits = 12000", rf.monthlyCredits === 12000, rf.monthlyCredits);
ok("frozen cost = $120 (payg)", near(rf.monthlyCostUSD, 120), rf.monthlyCostUSD);
ok("frozen value from meta.volume (8min×5000/60×45=30000)", near(rf.value.monthly, 8 * 5000 / 60 * 45, 1), rf.value.monthly);
ok("frozen size passthrough", rf.size === "M", rf.size);
var agg2 = P.aggregate([frozen, quickItem], engines2);
ok("aggregate studio(frozen)+cowork credits = 762000", agg2.monthlyCredits === 762000, agg2.monthlyCredits);
ok("byProducer studio present", !!agg2.byProducer.studio, agg2.byProducer);

console.log("\n" + (fails === 0 ? "ALL PASSED" : (fails + " FAILED")));
process.exit(fails === 0 ? 0 : 1);

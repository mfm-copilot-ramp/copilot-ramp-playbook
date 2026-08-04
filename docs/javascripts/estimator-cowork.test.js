/* Smoke test for estimator-cowork.js — run: node estimator-cowork.test.js */
var C = require("./estimator-cowork.js");
var fails = 0;
function ok(name, cond, got) { if (!cond) { fails++; console.log("FAIL: " + name + (got !== undefined ? "  got=" + JSON.stringify(got) : "")); } else console.log("pass: " + name); }
function near(a, b, eps) { return Math.abs(a - b) <= (eps || 0.5); }

// 1. Quick macro — Austin's AA-style example: 1000 licensed × 10% × 5000 credits
var q = C.quickEstimate({ licensedUsers: 1000, mauPct: 10, creditsPerActiveUser: 5000 });
ok("quick active users = 100", q.activeUsers === 100, q.activeUsers);
ok("quick monthly credits = 500000", q.monthlyCredits === 500000, q.monthlyCredits);
ok("quick cowork spend = $5000", near(q.coworkSpend, 5000), q.coworkSpend);
ok("quick annual ~ $60k", near(q.annualCoworkSpend, 60000), q.annualCoworkSpend);
ok("quick cost/active user = $50", near(q.costPerActiveUser, 50), q.costPerActiveUser);
ok("quick packs = 20 (500k/25k)", q.purchase.packsNeeded === 20, q.purchase.packsNeeded);

// 2. Defaults kick in when credits/mau omitted
var qd = C.quickEstimate({ licensedUsers: 1000 });
ok("default mau 15%", qd.mauPct === 15, qd.mauPct);
ok("default credits/user 5000", qd.creditsPerActiveUser === 5000, qd.creditsPerActiveUser);

// 3. Azure discount + license floor
var qg = C.quickEstimate({ licensedUsers: 1000, mauPct: 10, creditsPerActiveUser: 5000,
  global: { azureDiscountPct: 20, licenseFloorEnabled: true, licensePricePerUser: 30 } });
ok("discount 20% → $4000 cowork", near(qg.coworkSpend, 4000), qg.coworkSpend);
ok("license floor = 1000×30 = 30000", qg.licenseFloor === 30000, qg.licenseFloor);
ok("total = 34000", near(qg.totalSpend, 34000), qg.totalSpend);

// 4. Intensity helper resolves to credits when no explicit number
var qi = C.quickEstimate({ licensedUsers: 100, mauPct: 100, intensity: { light: 10, medium: 5, heavy: 1 } });
// 10*125 + 5*500 + 1*2500 = 1250+2500+2500 = 6250
ok("intensity → 6250 credits/user", qi.creditsPerActiveUser === 6250, qi.creditsPerActiveUser);

// 5. Detailed roll-up (two cohorts)
var det = C.detailedEstimate({ cohorts: [
  { name: "Knowledge", licensedUsers: 800, mauPct: 25, creditsPerActiveUser: 2000 },
  { name: "Managers", licensedUsers: 200, mauPct: 40, creditsPerActiveUser: 3000 }
] });
// active: 200 & 80 ; credits: 400000 & 240000 = 640000
ok("detailed total active = 280", det.totals.activeUsers === 280, det.totals.activeUsers);
ok("detailed total credits = 640000", det.totals.monthlyCredits === 640000, det.totals.monthlyCredits);
ok("detailed cowork = $6400", near(det.totals.coworkSpend, 6400), det.totals.coworkSpend);
ok("detailed blended credits/active ~2285.7", near(det.totals.creditsPerActiveUser, 640000 / 280, 0.1), det.totals.creditsPerActiveUser);

// 6. Forecast ramp (6 months, 7% growth)
var fc = C.forecast({ monthlyCredits: 500000, licensedUsers: 1000, global: { forecastMonths: 6, rampGrowthPct: 7 } });
ok("forecast has 6 rows", fc.rows.length === 6, fc.rows.length);
ok("forecast M1 = base 500000", near(fc.rows[0].credits, 500000, 1), fc.rows[0].credits);
ok("forecast M6 = 500000×1.07^5", near(fc.rows[5].credits, 500000 * Math.pow(1.07, 5), 1), fc.rows[5].credits);
ok("forecast peak = M6 spend", near(fc.peakMonthlySpend, fc.rows[5].coworkSpend, 0.01), fc.peakMonthlySpend);

// 7. Credits report CSV import + distribution/outliers
var creditsCsv = "Username,Display name,Past 7 days,Past 30 days,Last activity date\n" +
  "a@x.com,A,100,1000,2026-08-01\n" +
  "b@x.com,B,50,500,2026-08-01\n" +
  "c@x.com,C,80,800,2026-08-01\n" +
  "d@x.com,D,5000,50000,2026-08-01\n";  // d is a clear power-user outlier
var cr = C.parseCreditsReportCsv(creditsCsv);
ok("credits import ok", cr.ok === true, cr.ok);
ok("credits import 4 active users", cr.activeUsers === 4, cr.activeUsers);
ok("credits import total 30d = 52300", cr.totalCredits30 === 52300, cr.totalCredits30);
ok("credits import flags outlier d (50000)", cr.distribution.outliers.indexOf(50000) >= 0, cr.distribution.outliers);

// 8. Chat usage CSV import
var chatCsv = "Username,Display name,Prompts submitted,Active days,Last activity date (UTC)\n" +
  "a@x.com,A,40,10,2026-08-01\n" +
  "b@x.com,B,20,5,2026-08-01\n";
var ch = C.parseChatUsageCsv(chatCsv);
ok("chat import 2 active users", ch.activeUsers === 2, ch.activeUsers);
ok("chat import avg prompts = 30", ch.avgPromptsPerActiveUser === 30, ch.avgPromptsPerActiveUser);

// 9. importToSeed computes MAU from licensed + measured active, carries measured credits/user
var seed = C.importToSeed(cr, { licensedUsers: 40, name: "Imported" });
ok("importToSeed mau = 10% (4/40)", near(seed.mauPct, 10, 0.01), seed.mauPct);
ok("importToSeed credits/user = round(avg)", seed.creditsPerActiveUser === Math.round(cr.avgCreditsPerActiveUser), seed.creditsPerActiveUser);

// 10. Feed-forward: quick → detailed seed → detailed estimate matches quick credits
var qq = C.quickEstimate({ licensedUsers: 1000, mauPct: 10, creditsPerActiveUser: 5000 });
var seededDetailed = C.seedDetailedFromQuick({ licensedUsers: 1000, mauPct: 10, creditsPerActiveUser: 5000 });
var back = C.detailedEstimate(seededDetailed);
ok("feed-forward preserves credits", back.totals.monthlyCredits === qq.monthlyCredits, back.totals.monthlyCredits);
ok("feed-forward single cohort named 'All users'", seededDetailed.cohorts[0].name === "All users", seededDetailed.cohorts[0].name);

// 11. Chat-usage import → importToSeed leaves credits/user unset (falls to default downstream)
var chSeed = C.importToSeed(C.parseChatUsageCsv(chatCsv), { licensedUsers: 20 });
ok("chat importToSeed mau = 10% (2/20)", near(chSeed.mauPct, 10, 0.01), chSeed.mauPct);
ok("chat importToSeed has no measured credits", chSeed.creditsPerActiveUser === undefined, chSeed.creditsPerActiveUser);

// 12. Aggregate parse
var agg = C.parseAggregate({ activeUsers: 300, avgDailyActiveUsers: 90, totalPrompts: 9000, avgPromptsPerUser: 30 });
ok("aggregate active users = 300", agg.activeUsers === 300, agg.activeUsers);
ok("aggregate avg prompts = 30", agg.avgPromptsPerActiveUser === 30, agg.avgPromptsPerActiveUser);

// 13. Detailed license floor rolls into totals
var floorDet = C.detailedEstimate({ cohorts: [{ name: "x", licensedUsers: 100, mauPct: 50, creditsPerActiveUser: 1000 }],
  global: { licenseFloorEnabled: true, licensePricePerUser: 30 } });
// active 50 × 1000 = 50000 cr × $0.01 = $500 cowork; floor 100×30 = 3000; total 3500
ok("detailed license floor = 3000", floorDet.totals.licenseFloor === 3000, floorDet.totals.licenseFloor);
ok("detailed total spend = 3500", near(floorDet.totals.totalSpend, 3500), floorDet.totals.totalSpend);

// 14. purchasePlan zero credits is safe
var zero = C.purchasePlan(0);
ok("purchasePlan(0) packs = 0", zero.packsNeeded === 0, zero.packsNeeded);

// 15. Range: conservative–liberal bracket on the two drivers
var rng = C.quickEstimate({ licensedUsers: 1000, mauPct: 15, creditsPerActiveUser: 5000,
  range: { mauLow: 10, mauHigh: 20, cpuLow: 4000, cpuHigh: 6000 } });
ok("range low credits = 400000", rng.range.low.monthlyCredits === 400000, rng.range.low.monthlyCredits);
ok("range high credits = 1200000", rng.range.high.monthlyCredits === 1200000, rng.range.high.monthlyCredits);
ok("range low spend = $4000", near(rng.range.low.coworkSpend, 4000), rng.range.low.coworkSpend);
ok("range high spend = $12000", near(rng.range.high.coworkSpend, 12000), rng.range.high.coworkSpend);
ok("range brackets the expected (750000)", rng.range.low.monthlyCredits <= rng.monthlyCredits && rng.monthlyCredits <= rng.range.high.monthlyCredits, [rng.range.low.monthlyCredits, rng.monthlyCredits, rng.range.high.monthlyCredits]);
ok("no range key when not requested", C.quickEstimate({ licensedUsers: 100 }).range === undefined, "ok");

console.log("\n" + (fails === 0 ? "ALL PASSED" : (fails + " FAILED")));
process.exit(fails === 0 ? 0 : 1);

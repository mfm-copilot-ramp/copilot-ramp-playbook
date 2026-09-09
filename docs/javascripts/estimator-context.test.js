/* Tests for estimator-context.js — agnostic free text → multi use-case portfolio.
   Run: node estimator-context.test.js */
var Ctx = require("./estimator-context.js");
var fails = 0;
function ok(name, cond, got) { if (!cond) { fails++; console.log("FAIL: " + name + (got !== undefined ? "  got=" + JSON.stringify(got) : "")); } else console.log("pass: " + name); }

// ── segmentation ─────────────────────────────────────────────────────────────
var bullets = "- An HR assistant answering benefits questions\n- A support agent that files ServiceNow tickets\n- Roll Copilot out to 500 sales reps";
ok("segments bullets into 3", Ctx.segment(bullets).length === 3, Ctx.segment(bullets).length);

var prose = "We want to build an agent that summarizes support tickets for our 80 reps. We'd also like to roll M365 Copilot out to 500 sellers for daily productivity.";
var segP = Ctx.segment(prose);
ok("connective split → 2", segP.length === 2, segP);

var single = "An HR assistant that answers benefits questions from our SharePoint policies for employees in Teams.";
ok("single stays single", Ctx.segment(single).length === 1, Ctx.segment(single).length);

// ── labels ───────────────────────────────────────────────────────────────────
ok("label strips lead-ins", /HR assistant/i.test(Ctx.labelFor("We want to build an HR assistant that answers benefits")), Ctx.labelFor("We want to build an HR assistant that answers benefits"));

// ── end-to-end: mixed portfolio ──────────────────────────────────────────────
var mixed =
  "For our 4,000-employee bank: first, turn on Copilot for our 300 relationship managers, daily, grounded in our SharePoint policies. " +
  "Also build an autonomous agent for our 80 support reps that drafts a reply to every ticket from our knowledge base.";
var r = Ctx.estimateContext(mixed);
ok("e2e ok", r.ok === true, r.ok);
ok("e2e 2 use cases", r.useCaseCount === 2, r.useCaseCount);
var products = r.useCases.map(function (u) { return u.product; }).sort();
ok("e2e one cowork + one studio", products[0] === "cowork" && products[1] === "studio", products);
var cw = r.useCases.filter(function (u) { return u.product === "cowork"; })[0];
ok("e2e cowork scoped to 300", cw.drivers.licensedUsers === 300, cw.drivers.licensedUsers);
ok("e2e portfolio credits = sum of items", r.portfolio.monthlyCredits === r.useCases.reduce(function (a, u) { return a + u.monthlyCredits; }, 0), [r.portfolio.monthlyCredits]);
ok("e2e portfolio $ > 0", r.portfolio.monthlyCostUSD > 0, r.portfolio.monthlyCostUSD);
ok("e2e byProducer has both", r.portfolio.byProducer.studio && r.portfolio.byProducer.cowork, Object.keys(r.portfolio.byProducer));
ok("e2e annual = monthly×12", Math.abs(r.portfolio.annualCostUSD - r.portfolio.monthlyCostUSD * 12) < 1, r.portfolio.annualCostUSD);
ok("e2e suggestions present", r.suggestions.length > 0, r.suggestions.length);
ok("e2e copilot prompt present", /extract each DISTINCT use case/.test(r.copilotPrompt), true);

// ── single-use-case pure Cowork ──────────────────────────────────────────────
var coworkOnly = "Roll M365 Copilot out to all 1,200 employees for general productivity; most would use it a few times a week.";
var r2 = Ctx.estimateContext(coworkOnly);
ok("cowork-only single use case", r2.useCaseCount === 1, r2.useCaseCount);
ok("cowork-only is cowork", r2.useCases[0].product === "cowork", r2.useCases[0].product);
ok("cowork-only pop = 1200", r2.useCases[0].drivers.licensedUsers === 1200, r2.useCases[0].drivers.licensedUsers);

// ── editable re-feed: tune a driver, re-aggregate ────────────────────────────
var items = r2.items;
items[0].input.cowork.mauPct = 30; // seller bumps active %
var r3 = Ctx.estimateContext(coworkOnly, { items: items });
ok("re-feed respects edited mau (credits change)", r3.useCases[0].monthlyCredits !== r2.useCases[0].monthlyCredits, [r2.useCases[0].monthlyCredits, r3.useCases[0].monthlyCredits]);

// ── guard ─────────────────────────────────────────────────────────────────────
ok("short input rejected", Ctx.estimateContext("nope").ok === false);

// ── reclassify round-trip is loss-free (the flip-back regression) ────────────
// Start from the mixed portfolio's cowork item, capture its original credits,
// flip cowork→studio→cowork and confirm the ORIGINAL estimate is restored.
var rt = Ctx.estimateContext(mixed);
var cwIdx = rt.items.map(function (it) { return it.producer; }).indexOf("cowork");
ok("reclassify: found a cowork item", cwIdx >= 0, cwIdx);
var origCredits = rt.useCases[cwIdx].monthlyCredits;
var origLic = rt.items[cwIdx].input.cowork.licensedUsers;
var flipped = Ctx.reclassifyItem(rt.items[cwIdx], "studio");
ok("reclassify: flip to studio switches producer", flipped.producer === "studio", flipped.producer);
var back = Ctx.reclassifyItem(flipped, "cowork");
ok("reclassify: flip back is cowork", back.producer === "cowork", back.producer);
ok("reclassify: licensed users restored", back.input.cowork.licensedUsers === origLic, [origLic, back.input.cowork.licensedUsers]);
var backItems = rt.items.slice(); backItems[cwIdx] = back;
var rBack = Ctx.estimateContext(mixed, { items: backItems });
ok("reclassify: restored credits match original", rBack.useCases[cwIdx].monthlyCredits === origCredits, [origCredits, rBack.useCases[cwIdx].monthlyCredits]);

// user-edited drivers also survive a flip round-trip
var edited = Ctx.estimateContext(coworkOnly);
edited.items[0].input.cowork.mauPct = 42;
var editedCredits = Ctx.estimateContext(coworkOnly, { items: edited.items }).useCases[0].monthlyCredits;
var e2 = Ctx.reclassifyItem(edited.items[0], "studio");
var e3 = Ctx.reclassifyItem(e2, "cowork");
ok("reclassify: user edit (mau=42) preserved", e3.input.cowork.mauPct === 42, e3.input.cowork.mauPct);
var eBackCredits = Ctx.estimateContext(coworkOnly, { items: [e3] }).useCases[0].monthlyCredits;
ok("reclassify: edited credits restored after round-trip", eBackCredits === editedCredits, [editedCredits, eBackCredits]);

console.log("\n--- sample: mixed portfolio ---");
r.useCases.forEach(function (u) {
  console.log("  [" + u.product + "] " + u.label + " — " + u.monthlyCredits.toLocaleString() + " cr/mo ($" + Math.round(u.monthlyCostUSD).toLocaleString() + "/mo)");
});
console.log("  PORTFOLIO: " + r.portfolio.monthlyCredits.toLocaleString() + " cr/mo  ≈ $" + Math.round(r.portfolio.monthlyCostUSD).toLocaleString() + "/mo  ($" + Math.round(r.portfolio.annualCostUSD).toLocaleString() + "/yr)");

console.log(fails === 0 ? "\nALL PASSED" : "\n" + fails + " FAILED");
process.exit(fails === 0 ? 0 : 1);

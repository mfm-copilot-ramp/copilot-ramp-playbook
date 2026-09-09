/* QA battery for estimator-context.js + estimator-conversation.js.
   Invariant checks across diverse/adversarial inputs + targeted correctness.
   Run: node estimator-context.qa.test.js */
var Ctx = require("./estimator-context.js");
var Conv = require("./estimator-conversation.js");
var fails = 0;
function ok(name, cond, got) { if (!cond) { fails++; console.log("FAIL: " + name + (got !== undefined ? "  got=" + JSON.stringify(got) : "")); } else console.log("pass: " + name); }
function fin(n) { return typeof n === "number" && isFinite(n) && !isNaN(n); }

// ── invariant battery ─────────────────────────────────────────────────────────
var battery = {
  "single cowork": "Roll M365 Copilot out to all 1,200 employees for daily productivity.",
  "single studio": "An autonomous agent that files a ServiceNow ticket for each incident using our runbooks.",
  "mixed": "Turn on Copilot for our 300 relationship managers daily, grounded in SharePoint. Also build an agent that triages every inbound warranty email.",
  "3 bullets": "- HR assistant over SharePoint policies\n- Support agent filing ServiceNow tickets\n- Roll Copilot out to 500 sellers",
  "no headcount": "We want an agent that answers product questions from our knowledge base.",
  "huge pop": "Roll Copilot out to 2 million users worldwide for productivity.",
  "2k shorthand": "Deploy Copilot to 2k field engineers who use it daily.",
  "zero pop": "Roll it out to 0 users to start.",
  "pilot subset": "We have 10,000 employees; pilot with 500 in the contact center first.",
  "trailing question": "Customer wants Copilot for their 150 field engineers, daily, from SharePoint manuals. Separately an agent to triage warranty emails. Can we size both?",
  "email thread": "Hi team — following our call, the customer wants to pilot Copilot for their 150 field engineers who'd use it daily to pull answers from equipment manuals in SharePoint. Separately they asked about an agent that automatically triages inbound warranty emails.",
  "garbage-ish": "some vague notes about maybe doing something with ai eventually",
  "messy caps/space": "   ROLL   COPILOT  out to  250   REPS ,  daily   use  ",
  "long repeated": Array(8).fill("Build an agent that summarizes tickets for 100 support reps.").join(" Also ")
};

var totals = {};
Object.keys(battery).forEach(function (k) {
  var r = Ctx.estimateContext(battery[k]);
  ok(k + ": ok", r.ok === true, r.error);
  if (!r.ok) return;
  ok(k + ": 1..6 use cases", r.useCaseCount >= 1 && r.useCaseCount <= 6, r.useCaseCount);
  var sumC = 0, sumU = 0, bad = false;
  r.useCases.forEach(function (u) {
    if (!fin(u.monthlyCredits) || u.monthlyCredits < 0) bad = true;
    if (!fin(u.monthlyCostUSD) || u.monthlyCostUSD < 0) bad = true;
    if (u.product === "cowork" && u.drivers) {
      if (u.drivers.mauPct < 0 || u.drivers.mauPct > 100) bad = true;
      if (u.activeUsers != null && u.drivers.licensedUsers != null && u.activeUsers > u.drivers.licensedUsers + 1) bad = true;
      // credits ≈ active × cpu
      if (u.activeUsers != null && Math.abs(u.monthlyCredits - u.activeUsers * u.drivers.creditsPerActiveUser) > 2) bad = true;
    }
    sumC += u.monthlyCredits; sumU += u.monthlyCostUSD;
  });
  ok(k + ": all numbers finite & non-negative & consistent", !bad);
  ok(k + ": portfolio credits = sum of items", r.portfolio.monthlyCredits === Math.round(sumC), [r.portfolio.monthlyCredits, Math.round(sumC)]);
  ok(k + ": annual = monthly×12", Math.abs(r.portfolio.annualCostUSD - r.portfolio.monthlyCostUSD * 12) < 1, r.portfolio.annualCostUSD);
  totals[k] = r.portfolio.monthlyCredits;
});

// ── distinctness: different scenarios → different totals (Sugan's credibility bar) ─
ok("single cowork ≠ single studio total", totals["single cowork"] !== totals["single studio"], [totals["single cowork"], totals["single studio"]]);
ok("huge pop > pilot subset total", totals["huge pop"] > totals["pilot subset"], [totals["huge pop"], totals["pilot subset"]]);
ok("zero pop cowork = 0 credits for that item",
  Ctx.estimateContext(battery["zero pop"]).useCases[0].monthlyCredits === 0, Ctx.estimateContext(battery["zero pop"]).useCases[0].monthlyCredits);

// ── targeted correctness ──────────────────────────────────────────────────────
ok("2k → 2000 users", Conv.extractPopulation("deploy to 2k field engineers").value === 2000, Conv.extractPopulation("deploy to 2k field engineers").value);
ok("pilot subset picks 500 not 10000", Conv.extractPopulation("We have 10,000 employees; pilot with 500 in the contact center.").value === 500, Conv.extractPopulation("We have 10,000 employees; pilot with 500 in the contact center.").value);
ok("clear studio classified studio", Conv.detectProduct("an autonomous agent in Copilot Studio that files tickets").product === "studio");
ok("clear cowork classified cowork", Conv.detectProduct("roll M365 Copilot out to all employees").product === "cowork");
ok("trailing question dropped (2 use cases, not 3)", Ctx.estimateContext(battery["trailing question"]).useCaseCount === 2, Ctx.estimateContext(battery["trailing question"]).useCaseCount);
ok("email thread → 2 use cases", Ctx.estimateContext(battery["email thread"]).useCaseCount === 2, Ctx.estimateContext(battery["email thread"]).useCaseCount);
ok("long repeated capped at 6", Ctx.estimateContext(battery["long repeated"]).useCaseCount <= 6, Ctx.estimateContext(battery["long repeated"]).useCaseCount);

// ── label quality (no leading article, non-empty) ─────────────────────────────
var lbl = Ctx.estimateContext(battery["mixed"]).useCases.map(function (u) { return u.label; });
ok("labels non-empty", lbl.every(function (l) { return l && l.length > 2; }), lbl);
ok("labels don't start with 'An '/'A '/'The '", lbl.every(function (l) { return !/^(an?|the)\s/i.test(l); }), lbl);

console.log("\n--- totals by scenario ($/mo) ---");
Object.keys(totals).forEach(function (k) {
  var r = Ctx.estimateContext(battery[k]);
  console.log("  " + k.padEnd(20) + " " + r.useCaseCount + " uc  $" + Math.round(r.portfolio.monthlyCostUSD).toLocaleString() + "/mo");
});

console.log(fails === 0 ? "\nALL PASSED" : "\n" + fails + " FAILED");
process.exit(fails === 0 ? 0 : 1);

/* Regression tests for issues found in the engine logic review.
   Run: node estimator-context.review.test.js */
var Ctx = require("./estimator-context.js");
var Conv = require("./estimator-conversation.js");
var fails = 0;
function ok(name, cond, got) { if (!cond) { fails++; console.log("FAIL: " + name + (got !== undefined ? "  got=" + JSON.stringify(got) : "")); } else console.log("pass: " + name); }

// #1 rollout regex must not treat non-headcount numbers as users
ok("#1 '2 million invoices, used by 100 employees' → 100",
  Conv.extractPopulation("Build an agent for our 2 million invoices, used by 100 employees.").value === 100,
  Conv.extractPopulation("Build an agent for our 2 million invoices, used by 100 employees.").value);

// #2 single line breaks must NOT create fake use cases
var nl = "Customer has 5,000 employees.\nThey want Copilot to help draft emails every day.";
ok("#2 single newline → 1 use case", Ctx.estimateContext(nl).useCaseCount === 1, Ctx.estimateContext(nl).useCaseCount);

// #3 obvious Studio workloads must not default to Cowork
ok("#3 customer-service agent routing tickets → studio", Conv.detectProduct("Build a customer-service agent to route tickets.").product === "studio", Conv.detectProduct("Build a customer-service agent to route tickets.").product);
ok("#3 'Automating invoice routing for AP' → studio", Conv.detectProduct("Automating invoice routing for AP.").product === "studio", Conv.detectProduct("Automating invoice routing for AP.").product);
ok("#3 'coworkers' does NOT force cowork", Conv.detectProduct("Build a bot to answer coworkers' HR questions.").product === "studio", Conv.detectProduct("Build a bot to answer coworkers' HR questions.").product);

// #4 targeted team inside a company must size the team
var t4 = Conv.extractPopulation("Pilot with a team of 25 in a company of 10,000.");
ok("#4 team-of-25 pilot → 25", t4.value === 25, t4.value);
ok("#4 team-of-25 marked targeted", t4.targeted === true, t4.targeted);

// #5 connective after semicolon splits; reconciliation not deleted
ok("#5 '; also build' → 2 use cases", Ctx.estimateContext("Build an HR agent for benefits questions; also build an IT agent that resets passwords.").useCaseCount === 2, Ctx.estimateContext("Build an HR agent for benefits questions; also build an IT agent that resets passwords.").useCaseCount);
var t5 = Ctx.estimateContext("First, reconcile purchase orders against receipts. Separately, automate invoice routing for AP.");
ok("#5 reconcile + automate → 2 use cases", t5.useCaseCount === 2, t5.useCaseCount);
ok("#5 reconciliation kept (a label mentions reconcile)", t5.useCases.some(function (u) { return /reconcile/i.test(u.label + u.sourceText); }), t5.useCases.map(function(u){return u.label;}));

// #6 explicit population of exactly 1000 not overwritten
var t6 = Ctx.estimateContext("- Roll Copilot out to 1,000 sellers for daily use\n- Give Copilot to 5,000 employees company-wide");
var sellers = t6.useCases.find(function (u) { return /seller/i.test(u.label + u.sourceText); });
ok("#6 1,000-seller item stays 1000 (not 5000)", sellers && sellers.drivers && sellers.drivers.licensedUsers === 1000, sellers && sellers.drivers && sellers.drivers.licensedUsers);

// #7 decimal / zero / negative usage %
ok("#7 '12.5% active usage' → 12.5", Conv.extractUsage("12.5% active usage", null).mauPct === 12.5, Conv.extractUsage("12.5% active usage", null).mauPct);
ok("#7 'active usage is 12.5%' → 12.5", Conv.extractUsage("active usage is 12.5%", null).mauPct === 12.5, Conv.extractUsage("active usage is 12.5%", null).mauPct);
ok("#7 '0% active usage' → 0", Conv.extractUsage("0% active usage", null).mauPct === 0, Conv.extractUsage("0% active usage", null).mauPct);
ok("#7 '-10% active usage' → clamped 0", Conv.extractUsage("-10% active usage", null).mauPct === 0, Conv.extractUsage("-10% active usage", null).mauPct);

// #8 ranges + hyphenated employee
ok("#8 '50-100 employees' → 75", Conv.extractPopulation("Roll it out to 50-100 employees.").value === 75, Conv.extractPopulation("Roll it out to 50-100 employees.").value);
ok("#8 '4,000-employee company' → 4000", Conv.extractPopulation("We are a 4,000-employee company.").value === 4000, Conv.extractPopulation("We are a 4,000-employee company.").value);

// #10 malformed re-feed must not crash
ok("#10 {items:{}} → ok:false", Ctx.estimateContext("valid enough text here", { items: {} }).ok === false);
ok("#10 {items:[null]} → ok:false", Ctx.estimateContext("valid enough text here", { items: [null] }).ok === false);

console.log(fails === 0 ? "\nALL PASSED" : "\n" + fails + " FAILED");
process.exit(fails === 0 ? 0 : 1);

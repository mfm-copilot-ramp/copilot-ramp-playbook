/* Tests for estimator-conversation.js — bottom-up Cowork from pasted text.
   Run: node estimator-conversation.test.js */
var Conv = require("./estimator-conversation.js");
var fails = 0;
function ok(name, cond, got) { if (!cond) { fails++; console.log("FAIL: " + name + (got !== undefined ? "  got=" + JSON.stringify(got) : "")); } else console.log("pass: " + name); }

// ── number-word parsing ──────────────────────────────────────────────────────
ok("parseCount 2,000", Conv.parseCount("2,000") === 2000, Conv.parseCount("2,000"));
ok("parseCount 2k", Conv.parseCount("2k") === 2000, Conv.parseCount("2k"));
ok("parseCount 3 thousand", Conv.parseCount("3 thousand") === 3000, Conv.parseCount("3 thousand"));
ok("parseCount 500", Conv.parseCount("500") === 500, Conv.parseCount("500"));

// ── population extraction & scope ────────────────────────────────────────────
var p1 = Conv.extractPopulation("We have about 5,000 employees but want to roll it out to 250 reps in the call center first.");
ok("pop prefers rollout-scoped 250", p1.value === 250, p1.value);
ok("pop flags targeted", p1.targeted === true, p1.targeted);

var p2 = Conv.extractPopulation("Our organization of 1,200 people would all use this.");
ok("pop org read = 1200", p2.value === 1200, p2.value);

var p3 = Conv.extractPopulation("No numbers here, just vibes.");
ok("pop defaults when none", p3.value === null && p3.defaulted === true, [p3.value, p3.defaulted]);

// ── usage inference ──────────────────────────────────────────────────────────
var u1 = Conv.extractUsage("everyone will use it daily", { targeted: true });
ok("usage targeted+daily+everyone = 75", u1.mauPct === 75, u1.mauPct);
var u2 = Conv.extractUsage("we expect about 30% adoption across the company", null);
ok("usage explicit 30%", u2.mauPct === 30, u2.mauPct);
var u3 = Conv.extractUsage("just a small pilot to start", null);
ok("usage pilot = 10", u3.mauPct === 10, u3.mauPct);
var u4 = Conv.extractUsage("nothing about frequency", null);
ok("usage default = 15", u4.mauPct === 15, u4.mauPct);

// ── intensity inference ──────────────────────────────────────────────────────
var i1 = Conv.extractIntensity("it should draft a reply to every email using our SharePoint policies, automatically");
ok("intensity high-volume grounded+autonomous → big cpu", i1.creditsPerActiveUser > 20000, i1.creditsPerActiveUser);
ok("intensity flags grounded+autonomous", i1.signals.indexOf("grounded") >= 0 && i1.signals.indexOf("autonomous") >= 0, i1.signals);
var i2 = Conv.extractIntensity("employees ask it a few questions a week");
ok("intensity weekly simple → modest cpu", i2.creditsPerActiveUser < 3000, i2.creditsPerActiveUser);

// ── product detection ────────────────────────────────────────────────────────
ok("detect studio agent", Conv.detectProduct("we want to build an autonomous agent in Copilot Studio").product === "studio");
ok("detect cowork adoption", Conv.detectProduct("roll M365 Copilot out to all employees for productivity").product === "cowork");

// ── end-to-end: realistic SSP transcript → milestone-ready number ─────────────
var transcript =
  "Customer: We're a regional bank with about 4,000 employees. For a first phase we'd turn on Copilot " +
  "for our 300 relationship managers. They'd use it daily to summarize client emails and pull answers " +
  "from our SharePoint policy library. If it works we'd expand from there.";
var r = Conv.estimateFromConversation(transcript);
ok("e2e ok", r.ok === true, r.ok);
ok("e2e product = cowork", r.product === "cowork", r.product);
ok("e2e licensed = 300 (rollout scope)", r.drivers.licensedUsers === 300, r.drivers.licensedUsers);
ok("e2e mau = 60 (targeted daily)", r.drivers.mauPct === 60, r.drivers.mauPct);
ok("e2e estimate present", r.estimate && r.estimate.monthlyCredits > 0, r.estimate && r.estimate.monthlyCredits);
ok("e2e 4 assumptions surfaced", r.assumptions.length === 4, r.assumptions.length);
ok("e2e has disclaimer", /Directional/.test(r.disclaimer), r.disclaimer);

// monthly spend sanity: 300 × 60% = 180 active; cpu from daily+grounded; spend = credits × $0.01
var active = Math.round(300 * 0.6);
ok("e2e active users = 180", r.estimate.activeUsers === active, r.estimate.activeUsers);
ok("e2e spend = credits × 0.01", Math.abs(r.estimate.coworkSpend - r.estimate.monthlyCredits * 0.01) < 1, [r.estimate.coworkSpend, r.estimate.monthlyCredits]);

// ── override path (seller tuned a field) ─────────────────────────────────────
var r2 = Conv.estimateFromConversation(transcript, { mauPct: 50, licensedUsers: 300 });
ok("override mau applied", r2.drivers.mauPct === 50, r2.drivers.mauPct);

// ── too-short guard ──────────────────────────────────────────────────────────
ok("short input rejected", Conv.estimateFromConversation("hi").ok === false);

console.log("\n--- sample output ---");
console.log(r.useCaseLine);
r.assumptions.forEach(function (a) { console.log("  " + a.field + ": " + a.value + "  — " + a.basis); });
console.log("  → " + r.estimate.monthlyCredits.toLocaleString() + " credits/mo  ≈ $" + Math.round(r.estimate.coworkSpend).toLocaleString() + "/mo  ($" + Math.round(r.estimate.annualCoworkSpend).toLocaleString() + "/yr)");

console.log(fails === 0 ? "\nALL PASSED" : "\n" + fails + " FAILED");
process.exit(fails === 0 ? 0 : 1);

/* Real-admin-header validation for the Cowork M365 import.
   Uses the EXACT column names from Microsoft Learn (verified 2026-09):
   Credits report:  Username, Display name, Past seven days, Past 30 days, Last activity date (UTC)
   Chat usage:      Username, Display name, Prompts submitted, Active days, Last activity date (UTC)
   Run: node estimator-cowork.realheaders.test.js */
var C = require("./estimator-cowork.js");
var fails = 0;
function ok(name, cond, got) { if (!cond) { fails++; console.log("FAIL: " + name + (got !== undefined ? "  got=" + JSON.stringify(got) : "")); } else console.log("pass: " + name); }

// Replicate the UI's detectAndParseCsv (lives in estimator-cowork-ui.js) so we test routing too.
function detect(text) {
  var head = (text.split(/\r?\n/)[0] || "").toLowerCase();
  if (/prompt/.test(head) && !/past\s*30|credits/.test(head)) return C.parseChatUsageCsv(text);
  if (/past\s*30|credits/.test(head)) return C.parseCreditsReportCsv(text);
  var hint = C.unsupportedReportHint && C.unsupportedReportHint(text);
  if (hint) return { ok: false, error: hint, source: "unsupported" };
  var cr = C.parseCreditsReportCsv(text); return cr.ok ? cr : C.parseChatUsageCsv(text);
}

// 1. Credits report — exact real headers, comma CSV
var credits = [
  "Username,Display name,Past seven days,Past 30 days,Last activity date (UTC)",
  "alice@contoso.com,Alice A,120,510,2026-09-01",
  "bob@contoso.com,Bob B,300,1450,2026-09-02",
  "carol@contoso.com,Carol C,80,240,2026-08-30",
  "dave@contoso.com,Dave D,5000,52000,2026-09-03"
].join("\n");
var r1 = detect(credits);
ok("credits: routed to credits-report", r1.source === "credits-report", r1.source);
ok("credits: 4 active users", r1.activeUsers === 4, r1.activeUsers);
ok("credits: total 30d = 54200", r1.totalCredits30 === 54200, r1.totalCredits30);
ok("credits: did NOT grab 'Past seven days'", r1.totalCredits30 !== (120+300+80+5000), r1.totalCredits30);

// 2. Chat usage — exact real headers, comma CSV
var chat = [
  "Username,Display name,Prompts submitted,Active days,Last activity date (UTC)",
  "alice@contoso.com,Alice A,40,12,2026-09-01",
  "bob@contoso.com,Bob B,20,8,2026-09-02"
].join("\n");
var r2 = detect(chat);
ok("chat: routed to chat-usage", r2.source === "chat-usage", r2.source);
ok("chat: 2 active users", r2.activeUsers === 2, r2.activeUsers);
ok("chat: avg prompts = 30", r2.avgPromptsPerActiveUser === 30, r2.avgPromptsPerActiveUser);

// 3. Credits report with UTF-8 BOM on the first header cell
var bom = "\uFEFF" + credits;
var r3 = detect(bom);
ok("BOM credits: routed to credits-report", r3.source === "credits-report", r3.source);
ok("BOM credits: still 4 users", r3.activeUsers === 4, r3.activeUsers);

// 4. Anonymized export — Username/Display name columns present but redacted
var anon = [
  "Username,Display name,Past seven days,Past 30 days,Last activity date (UTC)",
  ",,120,510,2026-09-01",
  ",,300,1450,2026-09-02"
].join("\n");
var r4 = detect(anon);
ok("anon credits: routed + parsed", r4.ok && r4.source === "credits-report", r4.source);
ok("anon credits: total 30d = 1960", r4.totalCredits30 === 1960, r4.totalCredits30);

// 5. CRLF line endings (Windows export)
var crlf = credits.replace(/\n/g, "\r\n");
var r5 = detect(crlf);
ok("CRLF credits: 4 users", r5.activeUsers === 4, r5.activeUsers);

// 6. Thousands separators / quoted numeric ("1,450")
var quoted = [
  "Username,Display name,Past seven days,Past 30 days,Last activity date (UTC)",
  "alice@contoso.com,Alice A,120,\"1,450\",2026-09-01"
].join("\n");
var r6 = detect(quoted);
ok("quoted-thousands: parsed 1450", r6.totalCredits30 === 1450, r6.totalCredits30);

// 7. importToSeed end-to-end at a stated licensed pop
var seed = C.importToSeed(r1, { licensedUsers: 500 });
ok("seed: mauPct = 0.8% (4/500)", Math.abs(seed.mauPct - 0.8) < 0.01, seed.mauPct);
ok("seed: creditsPerActiveUser = round(54200/4)=13550", seed.creditsPerActiveUser === 13550, seed.creditsPerActiveUser);

// 8. Real-but-UNSUPPORTED report: the Microsoft 365 Copilot usage (adoption) report has per-app
//    activity-date columns, not credits/prompts. It must be rejected with a HELPFUL hint that
//    names the right report — not a generic "column not found" (real-world drop-the-wrong-file case).
var adoption = [
  "reportRefreshDate,userPrincipalName,displayName,department,lastActivityDate,copilotChatLastActivityDate,wordCopilotLastActivityDate",
  "2026-07-27,user001@x.onmicrosoft.com,User 001,HR,2026-07-19,2026-07-15,2026-07-19",
  "2026-07-27,user002@x.onmicrosoft.com,User 002,Finance,,,"
].join("\n");
var hint = C.unsupportedReportHint(adoption);
ok("adoption report recognized (hint returned)", !!hint, hint);
ok("adoption hint names the Credits report", /credits report/i.test(hint || ""), hint);
var r8 = detect(adoption);
ok("adoption routed to 'unsupported' (not silently parsed)", r8.ok === false && r8.source === "unsupported", r8.source);
ok("supported Credits report is NOT flagged unsupported", C.unsupportedReportHint(credits) === null);
ok("supported Chat usage is NOT flagged unsupported", C.unsupportedReportHint(chat) === null);

console.log(fails === 0 ? "\nALL REAL-HEADER TESTS PASSED" : "\n" + fails + " FAILED");
process.exit(fails === 0 ? 0 : 1);

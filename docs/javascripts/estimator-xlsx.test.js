/* Quick + Import (M3) — .xlsx/.csv read-path coverage.
   Round-trips the real import pipeline: buildWorkbook -> EstimatorZip.readZip -> parseXlsx -> analyzeImport,
   and validates the CSV fallback. Previously the .xlsx read path had NO test despite real customers
   filling the template in Excel (which re-saves with a sharedStrings table).
   Run: node estimator-xlsx.test.js */
var EZ = require("./estimator-zip.js");
var EX = require("./estimator-xlsx.js");
var EC = require("./estimator-core.js");

var fails = 0;
function ok(name, cond, got) { if (!cond) { fails++; console.log("FAIL: " + name + (got !== undefined ? "  got=" + JSON.stringify(got) : "")); } else console.log("pass: " + name); }

var HEADERS = ["Scenario name", "Agent type", "Harness", "Users in scope", "Interactions / user / month", "Deployment", "% with M365 Copilot license"];

(async function () {
  // ── CSV parse path ──────────────────────────────────────────────
  var csv = HEADERS.join(",") + "\nStd helpdesk,Interactive,Standard,800,6,Embedded,60";
  var cm = EX.parseCsv(csv);
  ok("csv: 2 rows parsed", cm.length === 2, cm.length);
  ok("csv: header cell 0 = 'Scenario name'", cm[0][0] === "Scenario name", cm[0][0]);
  ok("csv: data cell 0 = 'Std helpdesk'", cm[1][0] === "Std helpdesk", cm[1][0]);

  // ── XLSX round-trip (writer -> reader) ──────────────────────────
  var rows = [
    HEADERS,
    ["Std helpdesk", "Interactive", "Standard", 800, 6, "Embedded", 60],
    ["Auto router", "Autonomous", "Standard", "", "", "", ""]
  ];
  var bytes = EX.buildWorkbook([{ name: "Scenarios", rows: rows, opts: {} }]);
  ok("xlsx: writer produced bytes", bytes && bytes.length > 0, bytes && bytes.length);
  var ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  var entries = await EZ.readZip(ab);
  var parsed = EX.parseXlsx(entries);
  var m = parsed.matrix || [];
  ok("xlsx: round-trip yields 3 rows", m.length === 3, m.length);
  ok("xlsx: header preserved (first + last cell)", m[0] && m[0][0] === "Scenario name" && m[0][6] === "% with M365 Copilot license", m[0]);
  ok("xlsx: string data cell preserved", m[1] && m[1][0] === "Std helpdesk", m[1] && m[1][0]);
  ok("xlsx: numeric data cell preserved (users=800)", m[1] && String(m[1][3]) === "800", m[1] && m[1][3]);

  // ── End-to-end: matrix -> analyzeImport ─────────────────────────
  var a = EC.analyzeImport(m);
  var sc = a.scenarios || [];
  ok("xlsx: analyzeImport parses 2 scenarios", sc.length === 2, sc.length);
  ok("xlsx: scenario names carried through", sc.map(function (s) { return s.name; }).join("|") === "Std helpdesk|Auto router", sc.map(function (s) { return s.name; }));
  ok("xlsx: every scenario has a finite estimate", sc.every(function (s) { return s.estimate && isFinite(s.estimate.netMonthly); }));

  console.log(fails === 0 ? "\nALL XLSX (M3) TESTS PASSED" : "\n" + fails + " FAILED");
  process.exit(fails === 0 ? 0 : 1);
})().catch(function (e) { console.log("THREW (not graceful): " + (e && e.message || e)); process.exit(1); });

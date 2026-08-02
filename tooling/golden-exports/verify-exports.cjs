/* Golden-export verification harness for the Quick-mode agent package builder.
 *
 * Run from the repo root:  node tooling/golden-exports/verify-exports.cjs
 *
 * Part 1 (ALWAYS, CI-safe): build several packages with buildPackage() — including the
 *   autonomous invoice example — re-parse each through the shipped reader
 *   (docs/javascripts/estimator-zip.js), and assert the structural import invariants
 *   (one <?xml?> prolog on [Content_Types].xml only; one <Override> per extensionless
 *   `data` part; the archive re-parses). Needs no golden exports.
 * Part 2 (only when exports are present): scan the four capability subfolders, readZip
 *   each real export, print a shape report, validate OUR structural rules against the
 *   real export, and diff any REGISTERED candidate builder against its golden shape.
 * Part 3: print the VERIFIED_*_SHAPE flag matrix.
 *
 * Exit code is non-zero ONLY if a Part-1 invariant fails or a *registered* candidate
 * builder disagrees with its golden export. Absent/garbage golden exports never fail.
 */
"use strict";
const path = require("path");
const fs = require("fs");

const JS_DIR = path.resolve(__dirname, "..", "..", "docs", "javascripts");
const EP = require(path.join(JS_DIR, "estimator-package.js"));
const Z = require(path.join(JS_DIR, "estimator-zip.js"));

let failures = 0;
function log() { console.log.apply(console, arguments); }
function pass(msg) { log("  \u2713 " + msg); }
function fail(msg) { failures++; log("  \u2717 FAIL: " + msg); }
function assert(cond, msg) { cond ? pass(msg) : fail(msg); }

function toArrayBuffer(u8) {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
}
function fileText(pkg, name) {
  var v = pkg.files[name];
  return typeof v === "string" ? v : (v ? Buffer.from(v).toString("utf8") : "");
}
function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

// ── Part 1 cases (the invoice-autonomous example is REQUIRED by the prompt) ──────────
const CASES = [
  {
    label: "autonomous invoice \u2192 Dynamics 365 (STEP-B fallback)",
    opts: {
      description: "Whenever a new invoice arrives in the shared mailbox, extract the fields and create a record in Dynamics 365.",
      vars: { archetype: "autonomous", hasContent: true },
      systems: ["Dynamics 365"]
    }
  },
  {
    label: "interactive Q&A (SharePoint knowledge)",
    opts: {
      description: "An HR assistant that answers benefits questions from our SharePoint policy library.",
      vars: { knowledge: "docs" },
      systems: ["SharePoint"]
    }
  },
  {
    label: "action agent (ServiceNow incident + email summary)",
    opts: {
      description: "A support agent that opens a ServiceNow incident and emails the user a summary.",
      vars: {},
      systems: ["ServiceNow"]
    }
  },
  {
    label: "autonomous flow + content + AI (all fallbacks)",
    opts: {
      description: "When a new file lands in the document library, run a multi-step approval and extract and summarize the document fields.",
      vars: { archetype: "autonomous", hasFlow: true, hasContent: true, hasAI: true },
      systems: []
    }
  }
];

async function part1() {
  log("\u2500\u2500 Part 1 \u2014 round-trip through estimator-zip.js + import invariants \u2500\u2500");
  for (const c of CASES) {
    log("\u2022 " + c.label);
    const pkg = EP.buildPackage(c.opts);

    // Invariant A: exactly one <?xml prolog, and only on [Content_Types].xml.
    let prologFiles = [];
    Object.keys(pkg.files).forEach(function (n) {
      if (/^\uFEFF?\s*<\?xml/.test(fileText(pkg, n))) prologFiles.push(n);
    });
    assert(prologFiles.length === 1 && prologFiles[0] === "[Content_Types].xml",
      "one <?xml prolog, on [Content_Types].xml (got " + prologFiles.length + " on [" + prologFiles.join(", ") + "])");

    // Invariant B: one <Override> per extensionless `data` part, PartName matching exactly.
    const dataParts = pkg.entries.filter(function (n) { return /(^|\/)data$/.test(n); });
    const ct = fileText(pkg, "[Content_Types].xml");
    const overrides = (ct.match(/<Override\b/g) || []).length;
    assert(overrides === dataParts.length,
      "<Override> count (" + overrides + ") == extensionless data parts (" + dataParts.length + ")");
    const missing = dataParts.filter(function (n) {
      return !(new RegExp('<Override PartName="/' + reEsc(n) + '"')).test(ct);
    });
    assert(missing.length === 0,
      "every data part has a matching <Override PartName>" + (missing.length ? " (missing: " + missing[0] + ")" : ""));

    // Invariant C: the archive re-parses through the shipped reader.
    let parsed = [];
    try { parsed = await Z.readZip(toArrayBuffer(pkg.bytes)); }
    catch (e) { fail("re-parse through estimator-zip.js threw: " + (e && e.message)); }
    const names = parsed.map(function (e) { return e.name; });
    assert(names.indexOf("[Content_Types].xml") >= 0, "re-parsed archive contains [Content_Types].xml");
    assert(names.indexOf("solution.xml") >= 0 && names.indexOf("customizations.xml") >= 0,
      "re-parsed archive contains solution.xml + customizations.xml");

    // System-topic count: while the autonomous shape is gated OFF, autonomous packages
    // keep all 12 interactive topics (current import-safe behavior); a VERIFIED autonomous
    // shape would drop the interactive-only ones.
    const topicCount = pkg.entries.filter(function (n) {
      return /\.topic\.[^/]+\/botcomponent\.xml$/.test(n);
    }).length;
    const autoVerified = EP.shapeFlags.autonomous && c.opts.vars.archetype === "autonomous";
    if (autoVerified) assert(topicCount < 12, "verified-autonomous drops interactive topics (got " + topicCount + ")");
    else assert(topicCount === 12, "system topics == 12 (autonomous shape gated off) [got " + topicCount + "]");

    // Fallback notices + NEXT-STEPS content when a capability is gated off.
    const noticeIds = EP.shapeNotices(c.opts.vars).map(function (x) { return x.id; });
    const ns = fileText(pkg, "NEXT-STEPS.md");
    if (c.opts.vars.archetype === "autonomous" && !EP.shapeFlags.autonomous) {
      assert(noticeIds.indexOf("autonomous-trigger") >= 0, "autonomous-trigger fallback notice present");
      assert(/Make this run automatically/.test(ns), "NEXT-STEPS has the autonomous run-mode section");
    }
    if (c.opts.vars.hasFlow && !EP.shapeFlags.flow) {
      assert(noticeIds.indexOf("agent-flow") >= 0, "agent-flow fallback notice present");
      assert(/When an agent calls the flow/.test(ns), "NEXT-STEPS flow item cites the zero-rated trigger");
    }
    if (c.opts.vars.hasContent && !EP.shapeFlags.contentTool) {
      assert(noticeIds.indexOf("content-tool") >= 0, "content-tool fallback notice present");
    }
  }
}

// ── Part 2 — golden export scan + shape report ──────────────────────────────────────
// Register a candidate builder here once its shape is authored, e.g.:
//   CANDIDATES["autonomous-agent"] = function () { return { name, data } of the component we emit };
// While empty, Part 2 records the real shape but never fails the run.
const CANDIDATES = {};

const SUBFOLDERS = ["autonomous-agent", "agent-flow-tool", "prompt-tool", "content-tool"];

function componentTypesOf(entries) {
  const types = {};
  entries.forEach(function (e) {
    const m = /botcomponent\.xml$/.test(e.name) && /<componenttype>(\d+)<\/componenttype>/.exec(e.text || "");
    if (m) types[m[1]] = (types[m[1]] || 0) + 1;
  });
  return types;
}
function dataKinds(entries) {
  const kinds = [];
  entries.forEach(function (e) {
    if (/(^|\/)data$/.test(e.name)) {
      const m = /^\s*kind:\s*([A-Za-z0-9_.]+)/m.exec(e.text || "");
      kinds.push((e.name.split("/").slice(-2, -1)[0] || e.name) + " \u2192 " + (m ? m[1] : "(no kind:)"));
    }
  });
  return kinds;
}

async function part2() {
  log("");
  log("\u2500\u2500 Part 2 \u2014 golden export shape report \u2500\u2500");
  let anyFound = false;
  for (const sub of SUBFOLDERS) {
    const dir = path.join(__dirname, sub);
    let zips = [];
    try {
      zips = fs.readdirSync(dir).filter(function (f) { return /\.zip$/i.test(f); });
    } catch (e) { /* folder may not exist */ }
    if (!zips.length) { log("\u2022 " + sub + ": none found (drop a scrubbed real export here to verify its shape)"); continue; }
    anyFound = true;
    for (const zf of zips) {
      log("\u2022 " + sub + "/" + zf);
      let entries;
      try {
        const ab = toArrayBuffer(new Uint8Array(fs.readFileSync(path.join(dir, zf))));
        entries = await Z.readZip(ab);
      } catch (e) {
        log("    (could not read: " + (e && e.message) + ") \u2014 skipped, not a failure");
        continue;
      }
      const types = componentTypesOf(entries);
      log("    componenttypes: " + JSON.stringify(types));
      dataKinds(entries).forEach(function (k) { log("    data kind: " + k); });
      const triggerish = entries.filter(function (e) {
        return /trigger|OnRun|Recurrence|schedule|autonomous/i.test((e.name + " " + (e.text || "")).slice(0, 4000));
      }).map(function (e) { return e.name; });
      if (triggerish.length) log("    trigger/flow markers in: " + triggerish.slice(0, 6).join(", "));

      // Validate OUR structural rules hold on the real export too (informational).
      const prolog = entries.filter(function (e) { return /^\uFEFF?\s*<\?xml/.test(e.text || ""); }).map(function (e) { return e.name; });
      log("    <?xml prolog on: " + (prolog.length ? prolog.join(", ") : "(none captured \u2014 reader keeps text entries only)"));

      // Diff a registered candidate builder against this golden export, if any.
      if (CANDIDATES[sub]) {
        try {
          const cand = CANDIDATES[sub](entries);
          const golden = entries.filter(function (e) { return (cand.match || /(^|\/)data$/).test(e.name); });
          const match = golden.some(function (g) { return (g.text || "").indexOf(cand.dataSnippet || "\u0000") >= 0; });
          assert(match, sub + ": registered candidate builder matches golden shape");
        } catch (e) { fail(sub + ": candidate builder threw: " + (e && e.message)); }
      } else {
        log("    (no candidate builder registered yet \u2014 shape recorded, capability still gated)");
      }
    }
  }
  if (!anyFound) log("  (no golden exports present \u2014 Part 2 is a no-op; this is expected and not a failure)");
}

function part3() {
  log("");
  log("\u2500\u2500 Part 3 \u2014 verified-shape flag matrix \u2500\u2500");
  const f = EP.shapeFlags;
  log("  autonomous trigger / unattended : " + (f.autonomous ? "VERIFIED (emitting)" : "gated OFF (fallback + NEXT-STEPS + UI note)"));
  log("  agent flow tool                 : " + (f.flow ? "VERIFIED (emitting)" : "gated OFF (fallback + NEXT-STEPS + UI note)"));
  log("  prompt / content tool           : " + (f.contentTool ? "VERIFIED (emitting)" : "gated OFF (fallback + NEXT-STEPS + UI note)"));
  log("  To flip a flag: drop a real export in the matching folder, author the component");
  log("  builder to match its shape, register it as a candidate above, then set the flag.");
}

(async function main() {
  log("=== Quick-mode agent package \u2014 golden-export verification harness ===");
  await part1();
  await part2();
  part3();
  log("");
  if (failures) { log("RESULT: " + failures + " failure(s)."); process.exit(1); }
  log("RESULT: all Part-1 invariants passed; no registered-candidate mismatches.");
})();

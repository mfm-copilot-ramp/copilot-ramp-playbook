/* Handoff-equivalence harness: proves the standalone Agent Builder (/build/), when seeded
 * from a Quick-mode handoff with NO further edits, produces a package whose CONTENT is
 * identical to the one the Quick-mode exporter would have produced for the same description.
 *
 * Run from the repo root:  node tooling/golden-exports/verify-handoff-equivalence.cjs
 *
 * Why not a byte diff? buildPackage() stamps a fresh solution/schema GUID per call, so two
 * builds of the SAME opts differ at the byte level. The meaningful invariant is normalized
 * CONTENT equivalence: unpack pkg.files, map each distinct volatile GUID / schema token to a
 * stable placeholder (first-seen order), then compare the resulting file trees.
 *
 * The two paths reconstructed here mirror the shipped UI exactly:
 *   Quick  (credit-estimator.js qePkgOpts)      : {description, vars, systems, outline,
 *                                                  experience, skills}  -- no name/instructions
 *   Build  (agent-builder.js optsFromState,      : Quick opts + {name, instructions,
 *           seeded via cr-agent-build-v1, no edit)  addConnectors:[], exclude:{empty}}
 *          where name = analyzePackage(quickOpts).name and instructions = buildInstructions(...)
 *          exactly as renderPreview()/freshInstructions() compute them on first seed.
 *
 * Exit code is non-zero if the determinism baseline or any equivalence case fails.
 */
"use strict";
const path = require("path");

const JS_DIR = path.resolve(__dirname, "..", "..", "docs", "javascripts");
const EP = require(path.join(JS_DIR, "estimator-package.js"));
const EC = require(path.join(JS_DIR, "estimator-core.js"));

let failures = 0;
function log() { console.log.apply(console, arguments); }
function pass(msg) { log("  \u2713 " + msg); }
function fail(msg) { failures++; log("  \u2717 FAIL: " + msg); }

// Descriptions spanning the shape matrix: generative + connectors + knowledge (new harness),
// a simple FAQ (classic harness), an autonomous invoice flow, and an action agent.
const CASES = [
  { experience: "new",     desc: "A procurement helpdesk agent that answers policy questions from a SharePoint site, looks up purchase orders in Dynamics 365, creates approval requests, and escalates complex cases to a human buyer." },
  { experience: "new",     desc: "An HR assistant that answers benefits questions from our SharePoint policy library for employees in Teams." },
  { experience: "classic", desc: "An HR assistant that answers benefits questions from our SharePoint policy library for employees in Teams." },
  { experience: "new",     desc: "A support agent that opens a ServiceNow incident and emails the user a summary." },
  { experience: "new",     desc: "Whenever a new invoice arrives in the shared mailbox, extract the fields and create a record in Dynamics 365." }
];

// Reconstruct the two shipped opts paths for one description + harness.
function opts(desc, experience) {
  const a = EC.analyzeText(desc || "");
  const vars = a.vars || {};
  const outline = a.outline || null;
  const systems = (outline && outline.systems) || [];
  const quickOpts = { description: desc, vars: vars, systems: systems, outline: outline, experience: experience, skills: [] };
  // /build/ seeds name + instructions from the analysis on first render (renderPreview ->
  // freshInstructions), which now returns the engine's canonical preview.instructions:
  const prev = EP.analyzePackage(quickOpts);
  const name = prev.name;
  const instructions = prev.instructions || "";
  const buildOpts = {
    description: desc, vars: vars, systems: systems, outline: outline, experience: experience, skills: [],
    name: name, instructions: instructions,
    addConnectors: [], exclude: { connectors: [], knowledge: [], capabilities: [] }
  };
  return { quickOpts: quickOpts, buildOpts: buildOpts, name: name };
}

// Coerce a pkg.files value (string | Uint8Array | Buffer) to text.
function asText(v) {
  if (typeof v === "string") return v;
  if (v == null) return "";
  try { return Buffer.from(v).toString("utf8"); } catch (e) { return String(v); }
}

const GUID_RE = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;
// Component folders carry a random suffix (_<rand3> on tools, _<rand5> on file/knowledge
// parts; see rand3()/rand5() in estimator-package.js). The same token is echoed inside
// [Content_Types].xml, the component's botcomponent.xml, and the connection-reference set.
// It is the ONLY volatile token besides GUIDs, so canonicalize it exactly like a GUID.
const SUFFIX_SEG_RE = /\.(?:tool|file|topic|gpt|flow|dfa)\.[A-Za-z0-9]+_([A-Za-z0-9]{3}|[A-Za-z0-9]{5})$/;

// Build a stable scrubber for one package: schema token -> SCHEMA, each random component
// suffix -> _R<n> (first-seen over sorted keys), each GUID -> G<n> (first-seen). Two
// structurally-identical packages produce the same scrubbed text regardless of the random
// tokens/GUIDs each run stamps.
function makeScrubber(pkg) {
  const schema = pkg.schema ? String(pkg.schema) : null;
  const tokens = [];
  const tokenSeen = Object.create(null);
  Object.keys(pkg.files).sort().forEach(function (k) {
    const kk = schema ? k.split(schema).join("SCHEMA") : k;
    kk.split("/").forEach(function (seg) {
      const m = seg.match(SUFFIX_SEG_RE);
      if (m && !(m[1] in tokenSeen)) { tokenSeen[m[1]] = 1; tokens.push(m[1]); }
    });
  });
  const guidMap = Object.create(null);
  let g = 0;
  return function scrub(s) {
    let t = s == null ? "" : String(s);
    if (schema) t = t.split(schema).join("SCHEMA");
    for (let i = 0; i < tokens.length; i++) t = t.split("_" + tokens[i]).join("_R" + (i + 1));
    return t.replace(GUID_RE, function (x) {
      if (!(x in guidMap)) guidMap[x] = "G" + (++g);
      return guidMap[x];
    });
  };
}

// Normalize a package into a stable, volatile-token-free serialization.
function normalize(pkg) {
  const scrub = makeScrubber(pkg);
  const tree = {};
  Object.keys(pkg.files).forEach(function (k) { tree[scrub(k)] = scrub(asText(pkg.files[k])); });
  return Object.keys(tree).sort().map(function (k) { return k + "\u0000" + tree[k]; }).join("\u0001");
}

// First point at which two normalized trees diverge (which file + a short context window).
function firstDiff(qPkg, bPkg) {
  const scrubQ = makeScrubber(qPkg), scrubB = makeScrubber(bPkg);
  const qTree = {}; Object.keys(qPkg.files).forEach(function (k) { qTree[scrubQ(k)] = scrubQ(asText(qPkg.files[k])); });
  const bTree = {}; Object.keys(bPkg.files).forEach(function (k) { bTree[scrubB(k)] = scrubB(asText(bPkg.files[k])); });
  const qKeys = Object.keys(qTree).sort(), bKeys = Object.keys(bTree).sort();
  if (qKeys.join("|") !== bKeys.join("|")) {
    const qs = new Set(qKeys), bs = new Set(bKeys);
    return {
      kind: "keyset",
      onlyQuick: qKeys.filter(function (x) { return !bs.has(x); }).slice(0, 8),
      onlyBuild: bKeys.filter(function (x) { return !qs.has(x); }).slice(0, 8)
    };
  }
  for (const k of qKeys) {
    const a = qTree[k], b = bTree[k];
    if (a !== b) {
      let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
      return { kind: "content", file: k, atChar: i, quick: a.slice(Math.max(0, i - 40), i + 80), build: b.slice(Math.max(0, i - 40), i + 80) };
    }
  }
  return null;
}

log("=== Agent Builder handoff-equivalence harness ===");

// Determinism baseline: same opts twice must normalize equal (validates our GUID scrub).
log("\u2500\u2500 Determinism baseline (normalize scrubs per-call GUIDs) \u2500\u2500");
{
  const o = opts(CASES[0].desc, CASES[0].experience).quickOpts;
  const p1 = EP.buildPackage(o), p2 = EP.buildPackage(o);
  const bytesDiffer = Buffer.compare(Buffer.from(p1.bytes), Buffer.from(p2.bytes)) !== 0;
  log("  raw bytes differ across two identical builds : " + bytesDiffer + " (expected true \u2014 per-call GUID)");
  if (normalize(p1) === normalize(p2)) pass("normalized content is identical across two identical builds");
  else { fail("normalization is not stable across identical builds \u2014 volatile token unhandled"); const d = firstDiff(p1, p2); log("    " + JSON.stringify(d, null, 2)); }
}

log("");
log("\u2500\u2500 Quick-export  \u2261  seeded /build/ (no edits) \u2500\u2500");
for (const c of CASES) {
  const built = opts(c.desc, c.experience);
  const pkgQ = EP.buildPackage(built.quickOpts);
  const pkgB = EP.buildPackage(built.buildOpts);
  const label = "[" + c.experience + "] " + built.name + " \u2014 \"" + c.desc.slice(0, 46) + "\u2026\"";
  if (normalize(pkgQ) === normalize(pkgB)) {
    pass(label);
  } else {
    fail(label);
    const d = firstDiff(pkgQ, pkgB);
    log("    diff: " + JSON.stringify(d, null, 2));
  }
}

log("");
if (failures) { log("RESULT: " + failures + " equivalence failure(s)."); process.exit(1); }
log("RESULT: Quick-export and seeded /build/ are content-equivalent across all cases.");

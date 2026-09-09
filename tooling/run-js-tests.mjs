#!/usr/bin/env node
/* Runs every estimator/portfolio smoke test in docs/javascripts.
   Each test file is self-contained (plain `node file.test.js`, exits non-zero on failure).
   This aggregator fails the process if any suite fails, so CI can gate on it.
   Run locally: node tooling/run-js-tests.mjs */
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const jsDir = join(here, "..", "docs", "javascripts");
const tests = readdirSync(jsDir).filter((f) => f.endsWith(".test.js")).sort();

let failed = 0;
for (const t of tests) {
  const res = spawnSync(process.execPath, [join(jsDir, t)], { encoding: "utf8" });
  const out = (res.stdout || "") + (res.stderr || "");
  if (res.status !== 0) {
    failed++;
    console.log(`\u2717 FAIL  ${t}`);
    console.log(out.split("\n").filter((l) => /FAIL|Error|not ok/i.test(l)).join("\n") || out.slice(-500));
  } else {
    const passes = (out.match(/pass:/g) || []).length;
    console.log(`\u2713 ok    ${t}${passes ? `  (${passes} assertions)` : ""}`);
  }
}
console.log(`\n${tests.length} suites, ${failed} failed`);
process.exit(failed ? 1 : 0);

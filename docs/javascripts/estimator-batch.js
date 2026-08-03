/* Agent Studio — batch generate engine (Phase 2, decoupled).
 *
 * Turns a table/list of scenarios into ONE download per scenario, bundled as a
 * container .zip (zip-of-zips) + an index manifest + a portfolio-estimate CSV.
 *
 * DEPENDENCY BOUNDARY: this module only *consumes* estimator-package.js
 * (EstimatorPackage.buildPackage / analyzePackage / zipStore). It never touches
 * the estimator engine, credit rates, or buildPackage's internals — so richer
 * per-agent packages (Work IQ / Skills / wired connector tools, once verified)
 * are inherited for free. Dependency-free; runs in the browser and under node.
 *
 * The credit roll-up is injected (opts.estimate) rather than hard-wired to
 * estimator-core.js, keeping this engine pure and testable. The Agent Studio
 * page will pass the real estimate fn; tests pass a stub.
 */
(function (root) {
  "use strict";

  function resolvePackage() {
    if (typeof module !== "undefined" && module.exports) return require("./estimator-package.js");
    if (root && root.EstimatorPackage) return root.EstimatorPackage;
    throw new Error("estimator-batch.js requires estimator-package.js (EstimatorPackage) to be loaded first.");
  }
  var EP = resolvePackage();

  // Columns recognized when the pasted table has a header row. `description` is
  // the only required column; everything else is optional and falls back to the
  // batch defaults. Aliases keep real-world spreadsheets forgiving.
  var COLUMN_ALIASES = {
    name: "name", agent: "name", "agent name": "name", title: "name",
    description: "description", desc: "description", prompt: "description", scenario: "description",
    experience: "experience", exp: "experience",
    archetype: "archetype", type: "archetype",
    knowledge: "knowledge",
    workiq: "workIQ", "work iq": "workIQ",
    skills: "skills", skill: "skills",
    systems: "systems"
  };
  var ROW_COLUMNS = ["name", "description", "experience", "archetype", "knowledge", "workIQ", "skills", "systems"];

  // ── input parsing ─────────────────────────────────────────────────────────
  // Robust rule: only split a line into columns when a HEADER row naming known
  // columns is present. Without a header, every non-empty line is treated as a
  // single description (descriptions routinely contain commas — never guess).
  function parseCsvLine(line, delim) {
    var out = [], cur = "", inq = false, i;
    for (i = 0; i < line.length; i++) {
      var ch = line.charAt(i);
      if (inq) {
        if (ch === '"') { if (line.charAt(i + 1) === '"') { cur += '"'; i++; } else inq = false; }
        else cur += ch;
      } else if (ch === '"') { inq = true; }
      else if (ch === delim) { out.push(cur); cur = ""; }
      else cur += ch;
    }
    out.push(cur);
    return out.map(function (s) { return s.trim(); });
  }

  function detectDelimiter(line) {
    if (line.indexOf("\t") >= 0) return "\t";
    if (line.indexOf(",") >= 0) return ",";
    return null;
  }

  function mapHeader(cells) {
    var map = [], seenDesc = false;
    for (var i = 0; i < cells.length; i++) {
      var key = COLUMN_ALIASES[cells[i].toLowerCase()] || null;
      if (key === "description") seenDesc = true;
      map.push(key);
    }
    return seenDesc ? map : null; // no description column => not a usable header
  }

  function normalizeExperience(v) {
    v = String(v || "").toLowerCase();
    if (v === "new" || v === "modern" || v.indexOf("new") >= 0) return "new";
    if (v === "classic" || v === "legacy" || v.indexOf("classic") >= 0) return "classic";
    return null;
  }
  function normalizeArchetype(v) {
    v = String(v || "").toLowerCase();
    if (v.indexOf("auto") >= 0 || v.indexOf("trigger") >= 0 || v.indexOf("unattend") >= 0) return "autonomous";
    if (v.indexOf("inter") >= 0 || v.indexOf("chat") >= 0) return "interactive";
    return null;
  }
  function truthy(v) {
    v = String(v == null ? "" : v).toLowerCase().trim();
    return v === "1" || v === "true" || v === "yes" || v === "y" || v === "on";
  }
  function splitList(v) {
    return String(v || "").split(/[;|]/).map(function (s) { return s.trim(); }).filter(Boolean);
  }

  // text -> [{ name?, description, experience?, vars{archetype?,knowledge?}, systems[], workIQ, skills[] }]
  function parseRows(text) {
    var lines = String(text == null ? "" : text).replace(/\r\n?/g, "\n").split("\n");
    var nonEmpty = lines.map(function (l) { return l.replace(/\s+$/, ""); }).filter(function (l) { return l.trim() !== ""; });
    if (!nonEmpty.length) return [];

    var delim = detectDelimiter(nonEmpty[0]);
    var header = null;
    if (delim) header = mapHeader(parseCsvLine(nonEmpty[0], delim));

    if (!header) {
      // description-per-line mode
      return nonEmpty.map(function (l) { return { description: l.trim(), vars: {}, systems: [], skills: [] }; });
    }

    var rows = [];
    for (var r = 1; r < nonEmpty.length; r++) {
      var cells = parseCsvLine(nonEmpty[r], delim);
      var row = { vars: {}, systems: [], skills: [] };
      for (var c = 0; c < header.length; c++) {
        var key = header[c]; if (!key) continue;
        var val = cells[c] == null ? "" : cells[c];
        if (key === "experience") { var e = normalizeExperience(val); if (e) row.experience = e; }
        else if (key === "archetype") { var a = normalizeArchetype(val); if (a) row.vars.archetype = a; }
        else if (key === "knowledge") { if (val) row.vars.knowledge = val.toLowerCase(); }
        else if (key === "workIQ") { row.workIQ = truthy(val); }
        else if (key === "skills") { row.skills = splitList(val); }
        else if (key === "systems") { row.systems = splitList(val); }
        else if (key === "name") { if (val) row.name = val; }
        else if (key === "description") { row.description = val; }
      }
      if (row.description && row.description.trim()) rows.push(row);
    }
    return rows;
  }

  // ── row -> buildPackage opts ────────────────────────────────────────────────
  function toOpts(row, defaults) {
    defaults = defaults || {};
    var vars = {};
    var k;
    if (defaults.vars) for (k in defaults.vars) if (has(defaults.vars, k)) vars[k] = defaults.vars[k];
    if (row.vars) for (k in row.vars) if (has(row.vars, k)) vars[k] = row.vars[k];
    var opts = { description: row.description, vars: vars };
    if (row.name) opts.name = row.name;
    opts.experience = row.experience || defaults.experience || "new";
    if (row.systems && row.systems.length) opts.systems = row.systems.slice();
    return opts;
  }
  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

  // Stable shape handed to an injected estimate fn (from either an analysis
  // summary or a built package), so the caller's estimator sees one contract.
  function estimateInput(x, row) {
    return {
      name: x.name, experience: x.experience,
      archetype: x.archetype || (x.vars && x.vars.archetype) || "interactive",
      description: (row && row.description) || "",
      connectors: (x.connectors || []).length,
      knowledge: (x.knowledge || []).length,
      capabilities: (x.capabilities || []).length,
      tenantGraph: !!x.tenantGraph,
      workIQ: (row && row.workIQ) || false,
      skills: ((row && row.skills) || []).length
    };
  }

  // ── analyze (no bytes): the portfolio preview ───────────────────────────────
  function analyzeBatch(rows, defaults) {
    defaults = defaults || {};
    return rows.map(function (row, i) {
      var s = EP.analyzePackage(toOpts(row, defaults));
      var summary = {
        index: i + 1, name: s.name, experience: s.experience, orchestrator: s.orchestrator,
        archetype: s.archetype, connectors: s.connectors, knowledge: s.knowledge,
        capabilities: s.capabilities, unmapped: s.unmapped, tenantGraph: s.tenantGraph,
        workIQ: row.workIQ || false, skills: row.skills || []
      };
      if (typeof defaults.estimate === "function") summary.estimate = defaults.estimate(estimateInput(summary, row));
      return summary;
    });
  }

  // ── build (bytes): one zip per scenario + container + manifest + CSV ─────────
  function buildBatch(rows, opts) {
    opts = opts || {};
    var counts = {};
    function uniqueName(fname) {
      if (counts[fname] == null) { counts[fname] = 1; return fname; }
      counts[fname] += 1;
      return fname.replace(/\.zip$/i, "") + "-" + counts[fname] + ".zip";
    }

    var agents = rows.map(function (row, i) {
      var pkg = EP.buildPackage(toOpts(row, opts));
      var a = {
        index: i + 1, filename: uniqueName(pkg.filename), bytes: pkg.bytes,
        name: pkg.name, experience: pkg.experience, orchestrator: pkg.orchestrator,
        archetype: pkg.archetype, connectors: pkg.connectors, knowledge: pkg.knowledge,
        capabilities: pkg.capabilities, unmapped: pkg.unmapped, tenantGraph: pkg.tenantGraph,
        workIQ: row.workIQ || false, skills: row.skills || []
      };
      if (typeof opts.estimate === "function") a.estimate = opts.estimate(estimateInput(a, row));
      return a;
    });

    var container = [];
    agents.forEach(function (a) { container.push({ name: "agents/" + a.filename, data: a.bytes }); });
    container.push({ name: "index.md", data: toManifest(agents) });
    container.push({ name: "portfolio-estimate.csv", data: toCsv(agents) });
    container.push({ name: "README.txt", data: README });

    return {
      bytes: EP.zipStore(container),
      filename: (opts.bundleName || "agent-studio-batch") + "-" + agents.length + ".zip",
      count: agents.length,
      agents: agents,                 // each carries its own .bytes for individual download
      manifest: toManifest(agents),
      csv: toCsv(agents)
    };
  }

  // ── renderers ───────────────────────────────────────────────────────────────
  function count(x) { return (x || []).length; }
  function estCredits(a) { return a.estimate && a.estimate.creditsPerRun != null ? a.estimate.creditsPerRun : ""; }
  function estEffort(a) { return a.estimate && a.estimate.buildEffort != null ? a.estimate.buildEffort : ""; }

  function csvCell(v) {
    v = v == null ? "" : String(v);
    return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }
  function toCsv(agents) {
    var head = ["#", "name", "experience", "orchestrator", "archetype", "connectors", "knowledge",
      "capabilities", "tenantGraph", "workIQ", "skills", "creditsPerRun", "buildEffort", "file"];
    var rows = agents.map(function (a) {
      return [a.index, a.name, a.experience, a.orchestrator, a.archetype, count(a.connectors),
        count(a.knowledge), count(a.capabilities), a.tenantGraph ? "yes" : "no",
        a.workIQ ? "yes" : "no", count(a.skills), estCredits(a), estEffort(a), a.filename]
        .map(csvCell).join(",");
    });
    return head.join(",") + "\n" + rows.join("\n") + "\n";
  }

  function mdCell(v) { return String(v == null ? "" : v).replace(/\|/g, "\\|").replace(/\n/g, " "); }
  function toManifest(agents) {
    var lines = [];
    lines.push("# Agent Studio — batch (" + agents.length + " agent" + (agents.length === 1 ? "" : "s") + ")");
    lines.push("");
    lines.push("Generated by the Copilot Credit Estimator. Each row below is an **independent, importable**");
    lines.push("unmanaged Copilot Studio solution under `agents/`. Import each `.zip` via **Solutions →");
    lines.push("Import solution**; every agent carries its own `NEXT-STEPS.md` inside its package.");
    lines.push("");
    lines.push("| # | Agent | Experience | Type | Connectors | Knowledge | Work IQ | Skills | File |");
    lines.push("|---|-------|-----------|------|-----------|-----------|---------|--------|------|");
    agents.forEach(function (a) {
      lines.push("| " + [a.index, mdCell(a.name), a.experience, a.archetype, count(a.connectors),
        count(a.knowledge), a.workIQ ? "on" : "—", count(a.skills), "`agents/" + mdCell(a.filename) + "`"].join(" | ") + " |");
    });
    lines.push("");
    lines.push("_See `portfolio-estimate.csv` for the machine-readable roll-up._");
    lines.push("");
    return lines.join("\n");
  }

  var README =
    "Agent Studio — batch bundle\n" +
    "===========================\n\n" +
    "This .zip contains one importable Copilot Studio agent per scenario, under agents/.\n\n" +
    "How to use:\n" +
    "  1. Unzip this bundle.\n" +
    "  2. For each agents/<name>.zip, go to make.powerapps.com (or copilotstudio.microsoft.com)\n" +
    "     -> Solutions -> Import solution, choose the .zip, set connections, and Import.\n" +
    "  3. Open each imported agent, review its NEXT-STEPS.md, extend, and Publish.\n\n" +
    "index.md            human-readable list of every agent in this bundle.\n" +
    "portfolio-estimate.csv  machine-readable roll-up (counts + optional credit estimate).\n\n" +
    "These are directional STARTER agents, not production-ready. Review before publishing.\n";

  var api = {
    parseRows: parseRows,
    toOpts: toOpts,
    analyzeBatch: analyzeBatch,
    buildBatch: buildBatch,
    toCsv: toCsv,
    toManifest: toManifest,
    ROW_COLUMNS: ROW_COLUMNS
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.EstimatorBatch = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

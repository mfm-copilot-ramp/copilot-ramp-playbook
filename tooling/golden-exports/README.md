# Golden exports — verified-shape corpus for the Quick-mode agent package builder

The Quick-mode package builder (`docs/javascripts/estimator-package.js`) follows a
**hard rule**: it never emits a Copilot Studio component whose exact solution-export
serialization we can't verify against a **real** export. Four capabilities are currently
**gated off** for exactly this reason (see the `VERIFIED_*_SHAPE` flags in the builder):

| Capability | Flag | What we need to see in a real export |
| --- | --- | --- |
| Autonomous / triggered agent | `VERIFIED_AUTONOMOUS_SHAPE` | the trigger component type + the unattended run config on the bot |
| Agent flow used as a tool | `VERIFIED_FLOW_SHAPE` | how the flow is wrapped as a `botcomponent` and referenced as a tool (the "When an agent calls the flow" trigger) |
| Prompt tool | `VERIFIED_CONTENT_TOOL_SHAPE` | the prompt-tool `botcomponent` `data` (`kind:` + fields) |
| Document / content-processing tool | `VERIFIED_CONTENT_TOOL_SHAPE` | the content-tool `botcomponent` `data` shape |

Until a real export proves each shape, the builder keeps its **import-safe fallback**
(an interactive chat agent + a clear `NEXT-STEPS.md` note + a UI flag) instead of shipping
a broken component. This folder is where you drop the real exports that let us flip a flag.

## How to capture a real export

1. In **Copilot Studio** (`copilotstudio.microsoft.com`), open or build the smallest agent
   that exercises the capability you want to verify:
   - **autonomous-agent** — an agent with an **autonomous trigger** (e.g. *When a new email
     arrives*, *When a row is added*, or a scheduled/recurrence trigger) set to run unattended.
   - **agent-flow-tool** — an agent that calls an **agent flow** as a tool (add a flow via
     *Tools → Add a tool → Flow*, using the **"When an agent calls the flow"** trigger).
   - **prompt-tool** — an agent with a **Prompt** tool (*Tools → Add a tool → Prompt*).
   - **content-tool** — an agent with a **document / content-processing** tool.
2. Export it as an **unmanaged** solution: **Solutions → (your solution) → Export → Unmanaged**.
   (Unmanaged keeps the component XML/YAML fully readable.)
3. **Scrub tenant data.** These exports can contain environment IDs, connection references,
   user emails, org names, and sample content. Before you place a file here, remove or
   redact anything sensitive. **Never commit a real export** — the `.gitignore` in this
   folder ignores `*.zip` and the four capability subfolders so they can't be committed by
   accident. The corpus is for **local / trusted-CI verification only**.
4. Drop the `.zip` into the matching subfolder:
   ```
   tooling/golden-exports/
     autonomous-agent/   <your-autonomous-export>.zip
     agent-flow-tool/    <your-flow-tool-export>.zip
     prompt-tool/        <your-prompt-tool-export>.zip
     content-tool/       <your-content-tool-export>.zip
   ```

## How the harness consumes them

Run the harness from the repo root:

```
node tooling/golden-exports/verify-exports.cjs
```

It has three parts:

- **Part 1 — round-trip (always runs, CI-safe).** Builds several packages with
  `buildPackage()` — including the autonomous invoice example — re-parses each through the
  shipped reader (`docs/javascripts/estimator-zip.js`), and asserts the structural import
  invariants (exactly one `<?xml?>` prolog, on `[Content_Types].xml` only; one `<Override>`
  per extensionless `data` part; the archive re-parses). This needs no golden exports and is
  the part CI depends on.
- **Part 2 — golden shape report (only when exports are present).** For each `.zip` found in
  the four subfolders it prints a shape report (component types, the `kind:` of each
  `botcomponent` `data`, trigger/flow markers), validates our structural rules against the
  real export, and — once a candidate component builder is registered in the harness — diffs
  our generated shape against the golden one. With no exports present it simply prints
  "none found" and skips.
- **Part 3 — flag matrix.** Prints the current `VERIFIED_*_SHAPE` state so it's obvious which
  capabilities are still gated.

**Exit code:** non-zero only if a Part-1 invariant fails or a *registered* candidate builder
disagrees with its golden export. Absent golden exports never fail the run.

## The flip checklist (per capability)

1. Drop a scrubbed real export into the right subfolder.
2. `node tooling/golden-exports/verify-exports.cjs` and read the shape report.
3. Author the component builder in `estimator-package.js` to match that shape exactly.
4. Register the builder as a harness candidate so Part 2 diffs it green.
5. Flip the capability's `VERIFIED_*_SHAPE` flag to `true`.
6. Re-run the harness + the full test suite; the fallback path in `NEXT-STEPS.md` / the UI
   auto-disappears for that capability (both are driven by the same flags).

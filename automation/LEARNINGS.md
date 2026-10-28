# Automation Learnings Registry

> **Append-only.** The Auditor automation appends entries here when it discovers recurring issues,
> successful patterns, or fixes that should compound across future runs. Humans may also add entries.
> **Never delete or reorder existing entries** — this is a log, not a living document.

---

## Format

Each entry follows this template:

```
### YYYY-MM-DD — [Category] Short title

**Issue:** What went wrong or what pattern was observed.
**Root cause:** Why it happened.
**Fix / guideline:** What to do differently going forward.
**Applies to:** Watcher | Reconciler | Author | Auditor | All
```

### Categories

- `accuracy` — A product claim was wrong or outdated
- `duplication` — The same signal was processed more than once
- `scope-creep` — An automation exceeded its per-run caps
- `style` — Content didn't match CONTENT-MODEL.md conventions
- `source` — A monitored source changed structure or went stale
- `process` — A procedural gap in the pipeline itself

---

## Entries

### 2026-10-28 — [process] Watcher silently stopped filing issues for two months

**Issue:** From 2026-08-21 every daily Watcher run failed at "Commit state file", so the
assess step never ran. Cowork GA follow-ups, the Scout → Autopilot rename and the billing
changes were all missed and had to be found by hand.
**Root cause:** The workflow pushed its seen-state straight to `main`, which requires PRs and a
passing `build` check. Separately, the Tech Community Copilot blog feed started returning 404 and
the Foundry what's-new URL moved, and nothing flagged either.
**Fix / guideline:** Automations must never push to `main`. Watcher state now lives on the
unprotected `automation-state` branch. Sources that fail 3 runs in a row open a tracking issue.
Broad feeds carry `match` filters, and new sources are baselined silently instead of flooding
the backlog.
**Applies to:** All

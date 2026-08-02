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

*(None yet — the Auditor will append the first entry after its initial run.)*

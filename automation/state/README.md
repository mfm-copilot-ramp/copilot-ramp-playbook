# automation/state/ — Watcher State Directory

This directory stores **per-source state files** that track what the Watcher has already seen.

## How it works

Each time the Watcher runs, it:

1. Reads the state file for each source (e.g., `state/m365-copilot-learn-hub.json`)
2. Fetches current content from the source
3. Diffs against the stored state to identify new/changed items
4. Creates backlog issues for genuinely new signals
5. **Commits the updated state file** back to this directory

## Why commit state?

- **Idempotency** — if the Watcher runs twice, it won't create duplicate issues because it knows
  what it already processed.
- **Auditability** — git history shows exactly when each item was first seen and what changed
  between runs.
- **Reproducibility** — any contributor can inspect state to understand what the automation has
  already detected.

## File format

Each state file is JSON with this shape:

```json
{
  "source": "source-name-from-sources.yml",
  "last_checked": "2026-08-02T12:00:00Z",
  "seen_items": [
    {
      "id": "unique-identifier-for-item",
      "title": "Item title",
      "url": "https://...",
      "first_seen": "2026-08-02T12:00:00Z"
    }
  ]
}
```

## Do not manually edit

These files are automation-managed. If you need to reset a source (e.g., to re-scan), delete its
state file and the next Watcher run will treat everything as new.

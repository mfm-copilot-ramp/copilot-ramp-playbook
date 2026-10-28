# automation/state/ — Automation State

Runtime outputs of the content-ops automations. The JSON files here are generated on each run and
are git-ignored on `main`.

## Where the Watcher's state lives

The Watcher's memory of what it has already seen is saved on the **`automation-state` branch**, not
on `main`. `main` only accepts changes through pull requests with passing checks, so an automation
can't push to it. The `automation-state` branch is unprotected and holds nothing but state.

Each Watcher run:

1. Restores `watcher-seen.json` from the `automation-state` branch into this folder.
2. Fetches every source in `automation/sources.yml` and keeps only relevant items.
3. Diffs against the seen-state to find new or changed items.
4. Files backlog issues (at most 10 per run).
5. Commits the updated state back to the `automation-state` branch.

The branch history is the audit trail: one small commit per day.

## Files

| File | What it holds |
|------|---------------|
| `watcher-seen.json` | Per source: item ID → content hash, plus `hash_version`, `config_hash`, `last_checked`, `consecutive_failures`, `last_error` |
| `watcher-new-items.json` | Items reported by the latest run |
| `watcher-health.json` | Sources that have failed 3 or more runs in a row |

Pages are tracked one top-level section at a time (h2, or h3 if the page has none), so an edit
anywhere in a section changes its hash. Feeds are tracked one entry at a time.

## Idempotency and baselining

- A source with no saved state is **baselined**: its current items are recorded silently and only
  later changes are reported. Adding a source or resetting state never floods the backlog.
- Changing `HASH_VERSION` in `fetch_diff.py`, or a source's `url`, `feed`, `match` or
  `section_level`, re-baselines that source the same way.
- Items over the per-run issue cap are removed from the seen-state, so the next run reports them.
- A further change to an item that already has an open issue becomes a comment on that issue.

## Do not manually edit

To re-scan a source from scratch, delete its key from `watcher-seen.json` on the `automation-state`
branch. The next run baselines it again.

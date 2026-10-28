# Content-Ops Automation Pipeline

> Automated content intelligence for the Copilot Ramp Cookbook.
> Keeps the site accurate, up-to-date, and growing — without compromising the
> "unofficial, community-built" ethos or introducing unverified claims.

---

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SENSE (read-only)                                    │
│                                                                             │
│   ┌───────────┐     detects new/changed      ┌──────────────────────┐      │
│   │  Watcher  │ ──── official sources ──────▶ │  Backlog Issues      │      │
│   └───────────┘     (sources.yml)             │  (labeled, triaged)  │      │
│                                               └──────────┬───────────┘      │
├──────────────────────────────────────────────────────────┼──────────────────┤
│                         MUTATE (PRs)                      │                  │
│                                                          ▼                  │
│   ┌──────────────┐                        ┌──────────────────────┐         │
│   │  Reconciler  │◀── accuracy-risk ──────│  Issue backlog       │         │
│   │  (fix prose) │                        │                      │         │
│   └──────┬───────┘                        │                      │         │
│          │ PR                             │                      │         │
│          ▼                                │                      │         │
│   ┌──────────────┐                        │                      │         │
│   │   Author     │◀── new-resource /  ────│                      │         │
│   │ (new content)│    new-usecase         │                      │         │
│   └──────┬───────┘                        └──────────────────────┘         │
│          │ PR                                                               │
├──────────┼──────────────────────────────────────────────────────────────────┤
│          │            GOVERN (quality gates)                                 │
│          ▼                                                                  │
│   ┌──────────────┐     ┌─────────────┐                                     │
│   │   Auditor    │────▶│  CI checks  │  (mkdocs build --strict,            │
│   │  (review)    │     │             │   check-content.py, CONTENT-MODEL)   │
│   └──────────────┘     └─────────────┘                                     │
│          │                                                                  │
│          ▼                                                                  │
│   LEARNINGS.md (curated by maintainers; Auditor files issues, never pushes) │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Core Design Principles

### Sense vs. Mutate Separation

The pipeline strictly separates **sensing** (detecting changes) from **mutating** (editing content):

- **Watcher** only creates *issues*. It never touches `docs/` files directly.
- **Reconciler** and **Author** only create *PRs* — one logical change per PR, linked to a backlog
  issue.
- This separation ensures every content change is reviewable and traceable to a signal.

### Grounding Contract

No automation may describe a Microsoft product from memory. Every claim must cite an official
Microsoft URL fetched *that run*, with a retrieval date, in the PR body.

### Idempotency

Before creating an issue or PR, automations search for an existing open one on the same item and
update it rather than duplicating.

### No Auto-Merge

All PRs carry labels `automation` + `needs-human-review`. Structural changes (stage renames,
journey reordering) open `intel:framing-major` discussion issues instead of PRs.

---

## Label Taxonomy

| Category | Labels | Purpose |
|----------|--------|---------|
| **Type** | `intel:accuracy-risk`, `intel:new-resource`, `intel:new-usecase`, `intel:governance`, `intel:framing-major` | What kind of signal |
| **Status** | `intel:triage`, `intel:ready`, `intel:in-progress`, `intel:done`, `intel:wontfix` | Lifecycle stage |
| **Priority** | `intel:p1`, `intel:p2`, `intel:p3` | Urgency |
| **Ops** | `automation`, `needs-human-review` | Cross-cutting |

See `.github/labels.yml` for the full definitions and colors.

---

## Scope Caps (per run)

| Automation | Cap |
|-----------|-----|
| Watcher | ≤ 10 new issues (overflow carries to the next run) |
| Reconciler | ≤ 3 files OR 1 logical change per PR |
| Author | ≤ 1 new walkthrough OR 1 new solution template |

---

## Watcher sources, filters and state

- **Sources** are listed in `sources.yml`. Broad feeds (the M365 Roadmap, the Official Microsoft
  Blog, the Power Platform blog, the GitHub changelog) carry a `match` keyword list so only
  Copilot, Cowork, Autopilot, Studio, credits and billing items are tracked.
- **New sources are baselined silently.** Only changes after the first run are reported.
- **Stale feed copies are ignored.** A feed older than the last copy seen is refetched, then
  skipped for the run if it stays stale, so old posts are never re-filed as news.
- **State lives on the `automation-state` branch**, never on protected `main`. See
  `state/README.md`.
- **Dead sources are flagged.** A source that fails 3 runs in a row gets one
  `⚠️ Watcher source failing` issue so a moved URL doesn't go quiet.

## Reconciler, Author and Auditor

- **PRs need a repo setting.** Reconciler and Author open PRs with the workflow `GITHUB_TOKEN`, which
  only works when *Settings → Actions → General → Allow GitHub Actions to create and approve pull
  requests* is on. If it's off, the run fails (red) and deletes the branch it pushed, so the item is
  retried next run instead of being silently skipped.
- **Accuracy-risk issues get one verification comment.** The Reconciler comments once, then adds
  `needs-human-review` and stops picking the issue up. Remove the label to have it re-checked.
- **Author skips issues it can't place on a stage.** Stage comes from the issue's Category, then
  product names in the title/summary (Cowork, Autopilot, Copilot Studio, Foundry, Agent Builder),
  then any "Stage N" hint.
- **Auditor only files issues.** Section order is checked against the template in
  `CONTENT-MODEL.md`; a walkthrough with frontmatter that isn't valid YAML is flagged p2 because it
  renders as raw text on the page. Duplicates are matched on exact title.

---

## Directory Layout

```
automation/
├── README.md          ← you are here
├── sources.yml        ← registry of monitored Microsoft sources (+ relevance filters)
├── LEARNINGS.md       ← curated knowledge base for recurring issues (maintainer-edited)
├── watcher/           ← fetch_diff.py + assess_and_file.py
├── reconciler/        ← select_issues.py + edit_and_pr.py
├── author/            ← select_work.py + write_and_pr.py
├── auditor/           ← audit.py
└── state/             ← runtime outputs (git-ignored on main)
    └── README.md      ← state format; Watcher state persists on the automation-state branch
```

---

## Existing CI / Dispatch Patterns

The repo uses these workflows (defined in `.github/workflows/`):

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `deploy.yml` | `push` to `main` + `workflow_dispatch` | Build site (`mkdocs build --strict`) + deploy to Pages |
| `linkcheck.yml` | `schedule` (weekly Mon 09:00 UTC) + `workflow_dispatch` | Check external links with lychee |

Future automation workflows should follow the same patterns:
- Use `schedule` (cron) for recurring runs
- Include `workflow_dispatch` for manual triggers
- Run quality gates (`check-content.py` + `mkdocs build --strict`) in every PR workflow

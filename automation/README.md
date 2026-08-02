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
│   LEARNINGS.md (append findings for compounding knowledge)                  │
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
| Watcher | ≤ 25 new issues |
| Reconciler | ≤ 3 files OR 1 logical change per PR |
| Author | ≤ 1 new walkthrough OR 1 new solution template |

---

## Directory Layout

```
automation/
├── README.md          ← you are here
├── sources.yml        ← registry of monitored Microsoft sources
├── LEARNINGS.md       ← append-only knowledge base for recurring issues
└── state/             ← committed watcher state (last-seen per source)
    ├── .gitkeep
    └── README.md      ← explains state file format and idempotency model
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

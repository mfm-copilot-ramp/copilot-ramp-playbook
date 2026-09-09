---
title: "Solution Template: Deployment & Release Notes Agent"
description: A Copilot Studio solution template for drafting release notes from merged changes and a team change log, ready for engineer review before publishing.
tags: [copilot-studio, engineering, release-notes, deployment, changelog, review, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: Deployment & Release Notes Agent

> **What this builds.** A Copilot Studio agent that turns merged changes or a team change log into clean release notes, a deployment summary, and a review checklist in the team's format — keeping engineers in control before anything is published.

**Pattern:** Collect release context → Group merged changes → Draft notes and deployment summary → Route for engineer review

---

!!! info "Which harness? Built for the standard harness"
    This template's system prompt and topic specs target the **standard harness** — predictable, rules-based,
    and covered by a Microsoft 365 Copilot license inside Microsoft 365 channels. If your scenario needs the
    agent to **reason through a multi-step task on its own**, step up to the **GitHub Copilot harness**
    (autonomous; bills **Copilot Credits for all usage**, and a license never covers it).
    [Compare the engines](../pick-the-engine.md).

## What the agent does

| Capability | Detail |
|---|---|
| Release intake | Captures release version, date, audience, source change log, and template expectations |
| Change grouping | Groups merged changes into features, fixes, reliability, security, breaking changes, and internal notes |
| Audience rewrite | Converts engineering language into customer, operator, or internal stakeholder wording |
| Deployment summary | Drafts scope, services, timing, validation, monitoring, risk, and rollback notes |
| Review discipline | Marks assumptions, gaps, and items that need engineer confirmation |
| Draft-only safety | Never publishes or announces release notes without human review |

---

## System prompt — copy and adapt

```
You are the Deployment & Release Notes agent for [Company Name]'s engineering team.

Your job is to turn confirmed merged changes, change-log entries, or deployment
notes into clear release notes and a deployment summary that follow the team's
approved format. You are a drafting assistant; the engineer owns the final text.

When a user asks for release notes:
1. Ask for the release name or version, release date or window, target audience,
   and source material if any of those are missing.
2. Use only merged changes, approved change-log entries, linked work items, and
   the team's release-note template as source material.
3. Group changes using the team format. If no format is provided, use: Highlights,
   New or changed behaviour, Fixes, Operational notes, Breaking changes, Known
   issues, and Verification.
4. Rewrite technical details for the chosen audience:
   - Customer-facing: benefits, changed behaviour, action required.
   - Operators: deployment timing, monitoring, rollback, known risks.
   - Internal engineering: services, migrations, dependencies, validation.
5. Draft a deployment summary with scope, services affected, release window,
   rollout plan, validation checks, monitoring signals, risks, and rollback owner.

Rules:
- Draft-only. Never publish, send, post, tag a release, or mark a deployment as
  complete. End with a clear review reminder.
- Do not invent customer impact, compatibility, risk, or fix details. If the
  source material is vague, mark the gap as "Needs engineer confirmation".
- Do not include secrets, incident-sensitive details, internal codenames, customer
  names, or vulnerability details unless the approved template explicitly allows
  them for that audience.
- Preserve important caveats such as migrations, feature flags, phased rollout,
  data backfills, and manual validation steps.
- If a change looks like a breaking change or customer action is required, call it
  out prominently even if it was buried in the source notes.

Tone: clear, specific, and economical. Prefer release-note language that a busy
reader can scan, with bullets over long paragraphs.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Release-note template | Required headings, tone examples, audience rules, sign-off checklist | Old templates no longer used by the team |
| Merged change log | PR summaries, work-item titles, labels, owners, release version, validation notes | Unmerged work, abandoned branches, experimental notes |
| Deployment runbook | Rollout sequence, validation checks, monitoring dashboards, rollback steps | Credentials, break-glass procedures, sensitive incident notes |
| Product and support guidance | Customer-safe feature wording, known issue phrasing, support escalation paths | Roadmap promises or unapproved launch messaging |
| Engineering taxonomy | Service names, component owners, change categories, risk labels | Internal codenames that should not appear in notes |

!!! tip "Start simple"
    Start with one team's release-note template and a curated change log. Add integrations to repositories or work tracking only after the draft format is stable.

---

## Topics to configure

### Topic 1 — Release intake

Collects the context that shapes the draft before any rewriting starts.

**Trigger phrases:** "release notes", "deployment summary", "change log", "what changed", "draft notes"

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "What release name or version should I draft notes for?" | Version |
| 2 | "Who is the audience — customers, operators, support, or internal engineering?" | Audience |
| 3 | "Paste the merged changes or point me to the approved change log." | Source material |
| 4 | "Do you want the standard team format or a specific template?" | Format choice |

---

### Topic 2 — Release notes draft

Turns source changes into an audience-ready draft while marking gaps.

**Trigger phrases:** "draft the notes", "summarise these PRs", "make this customer-ready", "turn this into release notes"

**Response:** Group the changes by the selected template, rewrite each item for the audience, mark missing impact or validation details as needing confirmation, and end with a short review checklist. Keep sensitive internal details out of customer-facing drafts.

---

### Topic 3 — Deployment summary

Creates a deployment-focused companion summary for engineers and operators.

**Trigger phrases:** "deployment summary", "rollout notes", "release readiness", "what should ops know"

**Response:** Draft scope, services affected, release window, rollout approach, validation checks, monitoring signals, risks, dependencies, rollback path, and named review owner placeholders. If the source lacks evidence for any item, flag it instead of filling it in.

---

## Starter prompts

- "Draft customer-facing notes from this merged change log."
- "Turn these PR summaries into an internal deployment summary."
- "Rewrite these technical changes for support readiness."
- "What gaps do engineers need to confirm before we publish these notes?"
- "Create release notes for version 2.8 using our standard format."

---

## Conversation variables

Use these to keep the draft consistent across follow-up edits.

| Variable | Set from | Used in |
|---|---|---|
| `release_name` | User input | Title, summary, and review checklist |
| `release_window` | User input or deployment notes | Deployment summary and timing caveats |
| `target_audience` | User input | Tone, detail level, and sensitive-detail filtering |
| `source_material` | Pasted or linked change log | Release-note and deployment-summary draft |
| `team_template` | Knowledge source or user choice | Heading order and required sections |
| `review_gaps` | Agent analysis | Engineer review checklist |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | Merged change log plus customer audience | Drafts customer-ready notes with no internal codenames | |
| 2 | PR list with vague impact | Marks impact as needing engineer confirmation | |
| 3 | Deployment runbook provided | Produces scope, validation, monitoring, and rollback summary | |
| 4 | Unmerged or speculative change included | Excludes it or flags it as not release-ready | |
| 5 | Security-sensitive detail in source | Omits unsafe detail and suggests approved wording | |
| 6 | Breaking change buried in notes | Surfaces it prominently with action required | |
| 7 | User asks to publish | Refuses to publish and reminds that engineer review is required | |
| 8 | No team template available | Uses fallback headings and asks for template later | |

---

## Deployment checklist

- [ ] Team release-note template connected and reviewed with engineering and product owners
- [ ] Approved source of merged changes agreed and documented
- [ ] Sensitive-detail rules reviewed for customer, support, operator, and internal audiences
- [ ] Draft-only boundary tested so the agent cannot publish or announce releases
- [ ] Deployment summary format validated with the on-call or operations team
- [ ] All 8 test cases pass
- [ ] Pilot run compared against a manually written release note
- [ ] Feedback loop established for unclear change-log entries

---

## What to build next

- **Repository connector** — retrieve merged PR summaries for a selected release tag or date range
- **Support-readiness handoff** — generate a support FAQ from the approved release notes
- **Post-deployment recap** — draft a short summary from validation results and rollout observations

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Add knowledge sources](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)

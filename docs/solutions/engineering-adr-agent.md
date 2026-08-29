---
title: "Solution Template: Architecture Decision Record Agent"
description: A Copilot Studio solution template for an ADR agent that helps engineers find existing decisions and draft new records from team templates.
tags: [copilot-studio, engineering, adr, architecture, decisions, knowledge, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: Architecture Decision Record Agent

> **What this builds.** A Copilot Studio agent that helps engineers find existing Architecture Decision Records and draft new ADRs from the team's template, guiding them through context, options, decision, and consequences without making the decision for them.

**Pattern:** Search existing decisions → Collect ADR context → Draft from template → Route for engineering review

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
| ADR search | Finds existing decisions by topic, service, architecture area, technology, or decision status |
| Related-decision context | Summarises relevant ADRs, conflicts, superseded decisions, and owners |
| Guided drafting | Asks for context, options, decision, consequences, status, and review owner |
| Template discipline | Produces the team's ADR headings, naming convention, and metadata placeholders |
| Review support | Highlights assumptions, open questions, missing evidence, and likely reviewers |
| Governance boundary | Helps document decisions but never approves, supersedes, or rejects them |

---

## System prompt — copy and adapt

```
You are the Architecture Decision Record agent for [Company Name]'s engineering team.

Your job is to help engineers find existing ADRs and draft new ADRs using the
team's approved template. You make decision documentation easier, but you do not
make or approve architecture decisions.

At the start of a conversation, determine whether the engineer wants to:
1. Find an existing ADR.
2. Draft a new ADR.
3. Update or supersede an existing ADR.

For ADR search:
- Ask for the topic, service, technology, or decision area if the query is broad.
- Search the approved ADR repository and architecture knowledge sources.
- Return the most relevant ADRs with title, status, date, owner if available, and
  one-sentence relevance.
- Call out superseded decisions, conflicts, or missing coverage instead of hiding
  them.

For ADR drafting:
1. Collect the problem context, constraints, goals, non-goals, options considered,
   proposed decision, consequences, reversibility, review owner, and target status.
2. Use the team's ADR template exactly. If no template is available, use: Title,
   Status, Context, Decision, Options considered, Consequences, Alternatives not
   chosen, Follow-ups, and Reviewers.
3. Include related ADRs and explain how the new decision aligns, conflicts, or
   supersedes them.
4. Mark uncertain claims as assumptions or open questions. Do not fill gaps with
   invented rationale.

Rules:
- Never approve, reject, or supersede an ADR on behalf of the team.
- Do not present a draft as final. End with "Review with [architecture owner /
  team lead] before accepting this ADR."
- Keep trade-offs balanced. Include downsides and operational consequences, not
  just the preferred option.
- Avoid confidential customer names, secrets, or unreleased roadmap commitments
  unless the ADR repository is approved for that audience.

Tone: rigorous but helpful. Ask crisp questions, then produce a clean draft that
an engineer can edit rather than a generic essay.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| ADR repository | Current, accepted, proposed, deprecated, and superseded ADRs with metadata | Personal drafts or abandoned decision notes not meant for reuse |
| ADR template | Required headings, numbering rules, status values, review expectations | Old templates that conflict with current governance |
| Architecture principles | Team standards, trade-off guidance, security and reliability principles | Aspirational principles not adopted by the team |
| Service catalogue | Service owners, dependencies, platform boundaries, runtime constraints | Secrets, credentials, or restricted customer environment details |
| Engineering standards | Coding, data, cloud, security, and operational standards referenced by ADRs | Policy text engineers are not authorised to rely on |

!!! tip "Start simple"
    Start with search over the accepted ADR repository and the current template. Add drafting once the team agrees how proposed ADRs should be reviewed.

---

## Topics to configure

### Topic 1 — Find an existing ADR

Helps engineers discover whether a decision has already been made.

**Trigger phrases:** "find ADR", "decision record", "why did we choose", "architecture decision", "what did we decide"

**Response:** Ask for the topic or service if the query is broad. Return relevant ADRs with title, status, date, owner, and why each matched. Include superseded or conflicting ADRs when they affect the answer, and say when no ADR covers the topic.

---

### Topic 2 — Draft a new ADR

Guides the engineer through the decision structure before producing a draft.

**Trigger phrases:** "draft an ADR", "new decision record", "write an architecture decision", "document this decision"

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "What decision are you documenting, and which service or architecture area does it affect?" | Decision scope |
| 2 | "What context or constraints drove the decision?" | Context |
| 3 | "What options were considered, including the one you do not prefer?" | Options |
| 4 | "What decision is proposed, and what consequences or follow-ups should reviewers see?" | Decision and consequences |
| 5 | "Who should review it, and should the status be Proposed, Accepted, or Superseded?" | Review owner and status |

---

### Topic 3 — Review or supersede an ADR

Supports safe updates without changing the repository directly.

**Trigger phrases:** "update an ADR", "supersede", "is this still valid", "ADR review", "replace this decision"

**Response:** Find the existing ADR, summarise its current status and rationale, ask what changed, and draft a proposed update or superseding ADR section. Do not mark the original as superseded; route the draft to the owning team for review.

---

## Starter prompts

- "Find ADRs about event sourcing in the order platform."
- "Draft an ADR for choosing managed PostgreSQL over self-hosted databases."
- "Do we already have a decision on message queue retention?"
- "Help me turn these trade-offs into our ADR template."
- "This ADR may be obsolete — draft a superseding proposal."

---

## Conversation variables

Use these to keep the search results and draft consistent during iteration.

| Variable | Set from | Used in |
|---|---|---|
| `adr_mode` | User intent | Route to search, draft, or update flow |
| `decision_scope` | User input | Search query, title, and context section |
| `related_adrs` | ADR search results | Cross-references and conflict notes |
| `options_considered` | User input | Options and alternatives sections |
| `proposed_decision` | User input | Decision section and review summary |
| `adr_status` | User input or template default | Metadata and review workflow |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | Broad ADR search | Asks for topic or service before searching | |
| 2 | Specific technology search | Returns relevant ADRs with status, date, and relevance | |
| 3 | No matching ADR | Says no ADR found and offers to draft one | |
| 4 | Draft request with missing options | Asks for alternatives before producing the ADR | |
| 5 | Draft with related ADR conflict | Calls out conflict and marks it for reviewer attention | |
| 6 | User asks agent to approve ADR | Refuses and routes to architecture owner review | |
| 7 | Supersede request | Drafts superseding proposal without changing the original | |
| 8 | Sensitive customer detail included | Removes or generalises unsafe detail in the draft | |

---

## Deployment checklist

- [ ] Current ADR repository connected and old private drafts excluded
- [ ] Team ADR template, naming convention, and status values reviewed
- [ ] Architecture owners identified for review routing
- [ ] Search behaviour tested for accepted, proposed, deprecated, and superseded ADRs
- [ ] Draft-only boundary tested so the agent cannot approve or modify ADR records
- [ ] All 8 test cases pass
- [ ] Pilot includes at least one new ADR and one search-heavy design discussion
- [ ] Feedback loop established for missing metadata and search quality

---

## What to build next

- **ADR review checklist** — generate reviewer questions based on the draft's risks and assumptions
- **Decision dependency map** — show which ADRs reference or supersede one another
- **Standards alignment check** — compare a proposed ADR against approved engineering standards

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Add knowledge sources](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)

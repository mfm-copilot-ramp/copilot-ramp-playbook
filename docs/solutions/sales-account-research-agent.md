---
title: "Solution Template: Account Research & Briefing Agent"
description: A Copilot Studio solution template for a sales briefing agent that drafts account research from approved internal sources before customer meetings.
tags: [copilot-studio, sales, account-research, briefing, knowledge, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: Account Research & Briefing Agent

> **What this builds.** A Copilot Studio agent that prepares draft account briefs for sellers before customer meetings, using approved internal sources for account background, recent activity, open opportunities, relevant case studies, and suggested talking points without fabricating external claims.

**Pattern:** Identify account and meeting → Gather approved facts → Draft briefing → Flag gaps and next steps

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
| Builds draft account briefs | Produces a structured pre-meeting brief for a named account and meeting purpose |
| Uses approved sources only | Grounds account background, opportunities, activity, and case studies in internal sales sources |
| Summarises recent activity | Pulls together recent notes, relationship context, support signals, and open follow-ups when available |
| Highlights open opportunities | Identifies relevant opportunities, stage, next step, and risks from approved pipeline data |
| Suggests talking points | Drafts customer-specific questions and themes, clearly labelled as suggestions |
| Flags evidence gaps | Calls out missing or stale information rather than filling gaps with invented claims |

---

## System prompt — copy and adapt

```
You are the Account Research & Briefing agent for [Company Name].

Your job is to help sellers prepare for customer meetings by drafting a concise, evidence-grounded account brief from approved internal sources.

The brief may include:
- Account snapshot and business context
- Relationship history and recent activity
- Open opportunities, renewal moments, risks, and next steps
- Relevant products, workloads, or solution areas already in the account record
- Approved case studies or customer stories that match the account's situation
- Suggested discovery questions and talking points

This is a draft-only assistant. You do not send messages to customers, update CRM,
change opportunity records, commit pricing, or claim that a meeting outcome is known.

Before drafting a brief, ask for:
1. Account name or account ID
2. Meeting date or timeframe
3. Meeting purpose, such as discovery, renewal, executive briefing, or proposal review
4. Audience or stakeholder roles if known
5. Any specific solution area, product, or opportunity the seller wants prioritised

Use only configured approved sources. Do not browse the public web unless the
implementation has explicitly added an approved web source. Never invent external
news, financial results, market claims, customer strategy, executive names, or
case-study outcomes.

When source information is missing, stale, or conflicting, say so directly in a
"Gaps to verify" section. Recommend what the seller should verify with the
account team or CRM owner.

Structure every brief like this:
1. Meeting objective
2. Account snapshot
3. Recent internal activity
4. Open opportunities or renewal moments
5. Relevant proof points or case studies
6. Suggested talking points and discovery questions
7. Risks, gaps, and items to verify

For open opportunities, include stage, estimated close timeframe, next step,
owner, and risk only when present in the approved source. If a field is absent,
write "not found in approved sources" rather than guessing.

For case studies, only recommend stories from the approved case-study library.
Explain why each story may be relevant, but do not claim the customer will have
the same result.

Tone: commercially useful, concise, and balanced. Help the seller be prepared,
not overconfident. Make uncertainty visible.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| CRM account and opportunity views | Account owner, industry, segment, open opportunities, renewal dates, stage, next steps, forecast notes, activity summaries | Private compensation data, unapproved forecast exports, confidential legal notes |
| Account plan SharePoint site | Account priorities, stakeholder map, whitespace themes, approved account strategy, relationship notes | Drafts marked confidential to a restricted team |
| Meeting notes repository | Recent customer conversations, action items, objections, support context, decisions, and follow-ups | Personal notes not intended for the sales team |
| Case-study library | Approved customer stories, proof points, solution areas, industries, and usage constraints | Unapproved slides, obsolete claims, customer names without permission |
| Product and industry briefs | Approved positioning, discovery questions, and value themes by industry or solution area | Public web content unless explicitly approved and curated |

!!! tip "Start simple"
    Start with CRM opportunity summaries, the account plan, and an approved case-study library. Add meeting notes after owners agree what content is appropriate for seller preparation.

---

## Topics to configure

### Topic 1 — Create account brief

Fires when a seller asks for a pre-meeting account briefing.

**Trigger phrases:** "brief me on", "account brief", "prep for my meeting", "research this account", "customer briefing", "meeting prep"

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "Which account should I brief you on?" | Account name or ID |
| 2 | "What is the meeting purpose and who is attending, if you know?" | Purpose and audience |
| 3 | "Any solution area, opportunity, or topic you want me to prioritise?" | Focus area |
| 4 | Draft structured account brief with source-grounded sections and gaps | — |
| 5 | "Would you like a shorter executive version or a discovery-question version?" | Preferred format |

---

### Topic 2 — Opportunity and risk summary

Fires when the seller wants the brief focused on pipeline or deal context.

**Trigger phrases:** "open opportunities", "pipeline summary", "deal risks", "renewal", "next steps", "forecast notes"

**Response:** Summarise only the opportunities and renewal moments found in approved CRM or account-plan sources. Include stage, owner, next step, customer need, timing, and risk when present. If data is absent or stale, add it to "Gaps to verify".

---

### Topic 3 — Case-study and talking-point suggestions

Fires when the seller asks for proof points, customer stories, or suggested conversation themes.

**Trigger phrases:** "case studies", "proof points", "talking points", "what should I ask", "discovery questions", "customer story"

**Response:** Recommend only approved case studies that match the account's industry, solution area, or stated challenge. Label all talking points as suggestions, connect each to a source-backed account fact, and include a caution when relevance is uncertain.

---

## Starter prompts

- "Brief me on [account] for a renewal meeting next week."
- "What open opportunities should I know about before meeting [account]?"
- "Suggest talking points for an executive briefing with [account]."
- "Which approved case studies are relevant to [account's] priorities?"
- "Create a short account snapshot for my discovery call."

---

## Conversation variables

Use these to tailor the briefing and make missing context visible.

| Variable | Set from | Used in |
|---|---|---|
| `account_name` | Seller input | Account lookup and briefing title |
| `meeting_purpose` | Clarifying question | Prioritising brief sections and talking points |
| `meeting_date` | Seller input when provided | Framing urgency and recency checks |
| `audience_roles` | Seller input | Adjusting level of detail and suggested questions |
| `solution_focus` | Seller input | Filtering opportunities, proof points, and case studies |
| `information_gaps` | Missing or stale source checks | Final gaps and verification section |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | "Brief me on [account] for tomorrow's executive meeting" | Collects missing purpose or audience and drafts structured brief | |
| 2 | "What open opportunities exist for [account]?" | Summarises only approved CRM opportunities and flags missing fields | |
| 3 | "Add recent news about [account]" | Refuses to invent external claims unless an approved source is configured | |
| 4 | "Give me case studies for a healthcare data meeting" | Recommends only approved relevant case studies with why they fit | |
| 5 | "What should I ask in discovery?" | Provides source-linked suggested questions, labelled as suggestions | |
| 6 | Account has stale activity notes | Includes stale-data warning in gaps to verify | |
| 7 | Seller asks agent to email customer | Reminds user it is draft-only and does not send external messages | |
| 8 | Conflicting opportunity details appear | Calls out conflict and recommends verifying with opportunity owner | |

---

## Deployment checklist

- [ ] CRM account and opportunity fields approved for seller-facing use
- [ ] Account-plan site permissions reviewed
- [ ] Case-study library curated with usage rules and current proof points
- [ ] Meeting notes source reviewed for confidentiality and recency
- [ ] Draft-only behaviour tested so the agent does not send or update records
- [ ] Gaps-to-verify wording approved by sales operations
- [ ] All 8 test cases pass
- [ ] Account team feedback loop scheduled after launch

---

## What to build next

- **CRM note drafting** — create a draft follow-up note that the seller can review before saving to CRM
- **Executive summary mode** — produce a one-page leadership-ready version of the account brief
- **Relationship map companion** — add a specialist agent that organises approved stakeholder and influence-map information
- **Post-meeting follow-up checklist** — turn agreed next steps into a seller review list

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Knowledge sources](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)

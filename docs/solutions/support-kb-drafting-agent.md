---
title: "Solution Template: Knowledge Article Drafting Agent"
description: A Copilot Studio solution template that helps support agents turn resolved tickets into reviewed, reusable knowledge-base articles.
tags: [copilot-studio, support, knowledge, articles, drafting, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: Knowledge Article Drafting Agent

> **What this builds.** A Copilot Studio agent that helps support agents turn a resolved ticket into a clean, reusable knowledge-base draft — pulling out the customer problem, the verified fix, prerequisites, edge cases, and internal review notes without publishing anything until a human approves it.

**Pattern:** Capture resolved ticket → Extract reusable knowledge → Draft KB article → Route for human review

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
| Ticket-to-article intake | Captures the resolved ticket, resolution notes, product area, audience, and article type |
| Reusable fix extraction | Separates the repeatable troubleshooting steps from one-off customer context |
| KB style alignment | Drafts in the team's article structure, tone, terminology, and formatting rules |
| Gap detection | Flags missing prerequisites, version details, permissions, evidence to add, or unverified steps |
| Review readiness | Produces an editor checklist and suggested owner before the article is published |
| Guardrails | Never publishes, changes policy, or turns sensitive customer data into article content |

---

## System prompt — copy and adapt

```
You are the Knowledge Article Drafting agent for [Company Name]'s support team.

Your job is to help support agents convert resolved support tickets into draft
knowledge-base articles that a human editor reviews before publishing.

When a support agent asks you to draft an article:
1. Ask for the resolved ticket summary, final resolution, affected product or
   service, customer-visible symptoms, and the audience for the article.
2. Identify what is reusable across future cases and what is specific to the
   original customer. Do not include customer names, account IDs, contract terms,
   or private troubleshooting notes in the public article draft.
3. Classify the article type as one of: how-to, troubleshooting, known issue,
   FAQ, configuration guidance, or internal-only support note.
4. Draft the article using this structure unless the team provides a different
   template: title, summary, symptoms, cause, prerequisites, resolution steps,
   verification, related articles, and review notes.
5. Mark any uncertain or missing information with [Needs review: ...] instead of
   guessing. Common gaps include product version, permission level, region,
   platform, error text, and whether the fix was verified on a clean case.
6. Finish with an editor checklist: facts to verify, sensitive details removed,
   links to add, owner, and suggested review group.

Rules:
- Draft only. You never publish, approve, archive, or overwrite KB content.
- Use approved KB style and terminology from the connected knowledge sources.
- Do not invent root causes, product limits, policy statements, or steps that
  were not grounded in the ticket or approved support content.
- Preserve the agent's uncertainty. If the ticket resolution is ambiguous, ask a
  clarifying question or label the gap for review.
- Keep the tone clear, practical, and concise. Write for support agents or
  customers according to the selected audience.
- If the ticket contains security, legal, billing, or customer-specific content,
  route the draft for specialist review before suggesting it is publication-ready.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| KB style guide | Required article structure, tone rules, terminology, title patterns, metadata guidance | Old templates no longer accepted by the content team |
| Published knowledge base | Current articles, reusable phrasing, related-article patterns, taxonomy | Retired articles, duplicate drafts, customer-private notes |
| Resolved ticket fields | Problem statement, verified resolution, product area, environment, final support notes | Customer names, account IDs, personal data, commercial terms |
| Review and ownership matrix | Which team reviews each product area and article type | Individual approver names that change frequently |

!!! tip "Start simple"
    Start with one article type, such as troubleshooting, and one product area. Connect the style guide and a small set of high-quality published articles before expanding to every queue.

---

## Topics to configure

### Topic 1 — Resolved ticket intake

Collects the minimum context needed before any article draft is written.

**Trigger phrases:** "draft a KB article", "turn this ticket into an article", "create knowledge from this case", "write up this fix"

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "I'll help draft a reviewed KB article. Paste the resolved ticket summary or link." | Ticket summary or reference |
| 2 | "What was the verified resolution, and who is the article for: customers, support agents, or both?" | Resolution and audience |
| 3 | "Which product, feature, version, or environment does this apply to?" | Scope details |
| 4 | "Is this a how-to, troubleshooting article, FAQ, known issue, or internal support note?" | Article type |

---

### Topic 2 — Draft article in KB format

Creates the structured draft and clearly marks anything that still needs review.

**Trigger phrases:** "draft the article", "format it for the KB", "write the troubleshooting article", "make this reusable"

**Response:** Produce a draft with title, summary, symptoms, cause, prerequisites, resolution steps, verification, related articles, and review notes. Remove customer-specific details, cite source material where available, and use [Needs review: ...] for missing facts.

---

### Topic 3 — Review handoff

Prepares the article for the human editor and routes specialist cases to the right reviewer.

**Trigger phrases:** "ready for review", "who should review this", "prepare handoff", "what still needs checking"

**Response:** Summarise the draft status, list open review items, name the required review group from the ownership matrix, and state why specialist review is needed for security, legal, billing, or customer-specific content.

---

## Starter prompts

- "Turn this resolved VPN ticket into a troubleshooting article"
- "Draft a customer-facing KB article from this password reset case"
- "Create an internal support note for this recurring configuration issue"
- "What information is missing before this ticket can become a KB article?"
- "Prepare this draft for content review"

---

## Conversation variables

Use these throughout the session to keep the draft scoped and reviewable.

| Variable | Set from | Used in |
|---|---|---|
| `ticket_reference` | Ticket link, ID, or pasted summary | Traceability and source citation in review notes |
| `article_audience` | Intake question | Tone, sensitivity filtering, and whether content is customer-facing |
| `product_scope` | Product, feature, version, region, or environment | Title, prerequisites, and applicability notes |
| `article_type` | User selection or agent classification | Article structure and required sections |
| `review_group` | Ownership matrix | Review handoff and deployment checklist |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | Resolved ticket with clear fix | Drafts structured article with reusable steps | |
| 2 | Ticket includes customer names and account IDs | Removes sensitive details from draft | |
| 3 | Missing product version | Marks [Needs review: product version] instead of guessing | |
| 4 | Ambiguous root cause | Asks a clarifying question or flags review gap | |
| 5 | Customer-facing article requested | Uses plain customer-safe language | |
| 6 | Security-related workaround | Routes to specialist review before publication | |
| 7 | Internal-only troubleshooting note | Keeps internal context but marks audience correctly | |
| 8 | Editor asks for handoff | Returns review checklist and owner group | |

---

## Deployment checklist

- [ ] KB style guide connected and approved by the content owner
- [ ] Published-article examples reviewed for current tone and structure
- [ ] Sensitive-data removal rule tested with real ticket examples
- [ ] Review and ownership matrix agreed with support leadership
- [ ] [Needs review: ...] markers tested for missing facts and ambiguity
- [ ] "Draft only, never publish" boundary confirmed
- [ ] All 8 test cases pass
- [ ] Pilot run completed with a small group of support agents and KB editors

---

## What to build next

- **Duplicate detection** — check whether a similar article already exists before drafting
- **Monthly gap report** — summarise repeated tickets that still have no reusable article
- **Editor feedback loop** — collect reviewer changes so future drafts better match the KB style

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Add knowledge sources](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)

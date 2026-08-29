---
title: "Solution Template: Deal Desk & Pricing Approval Agent"
description: A Copilot Studio solution template for a deal desk agent that explains discount policy, approval thresholds, documentation, and escalation.
tags: [copilot-studio, sales, deal-desk, pricing, approvals, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: Deal Desk & Pricing Approval Agent

> **What this builds.** A Copilot Studio agent that guides sellers through pricing and discount policy, explains approval thresholds, checks required deal documentation, and routes exceptions to the deal desk without making approval decisions itself.

**Pattern:** Classify deal request → Explain policy → Check documentation → Route approval or exception

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
| Explains pricing policy | Interprets approved discount, margin, term, and exception guidance for sellers |
| Identifies approval path | Maps deal attributes to the required approver roles or deal desk queue |
| Checks documentation | Lists required business justification, competitor context, value proof, and commercial terms |
| Guides exception routing | Tells sellers when a non-standard deal needs deal desk review and what to include |
| Keeps approvals human-owned | Provides guidance and routing only; never approves, rejects, or promises a discount |
| Supports seller preparation | Produces a concise approval-request summary the seller can review and submit |

---

## System prompt — copy and adapt

```
You are the Deal Desk & Pricing Approval agent for [Company Name].

Your job is to help sellers understand approved pricing, discount, and approval policy so they can prepare complete deal desk submissions.

You can help with:
- Discount threshold guidance
- Approval role or queue identification
- Required deal documentation and justification
- Non-standard term, margin, payment, or procurement exception routing
- Renewal, expansion, pilot, or competitive displacement policy guidance
- Draft approval-request summaries for seller review

You are not an approver. Do not approve, reject, commit, or promise pricing, discounts, concessions, legal terms, delivery capacity, or contract outcomes.
All approvals must remain with the named approver, approval workflow, or deal desk.

Before giving guidance, collect the minimum deal context needed:
1. Opportunity or deal name
2. Customer account
3. Product, service, or solution area
4. Deal motion, such as new logo, renewal, expansion, pilot, or competitive takeout
5. Proposed discount or exception type
6. Contract term, region, and close timeframe when policy depends on them
7. Whether required documents are already prepared

Answer only from approved pricing policy, deal desk guidance, and sales process documentation.
Do not invent thresholds, approver names, commercial exceptions, or legal requirements. If policy is missing or ambiguous, route to deal desk.

For every policy answer:
- State the relevant rule in plain language.
- Explain what approval path appears to apply based on the provided facts.
- List required documentation and evidence.
- Call out assumptions and missing facts.
- Tell the seller what to do next.

Required documentation may include: business justification, customer need, competitive context, pricing rationale, value proof, executive sponsor, close plan, procurement timeline, legal terms, and finance impact.
Include only the items required by the configured policy sources.

Escalate to [deal desk queue / approval workflow] when:
- The request exceeds standard discount or margin thresholds
- A non-standard legal, payment, implementation, or renewal term is requested
- The policy source is missing, stale, or conflicting
- The seller asks for approval or a commitment
- The seller indicates the deal is high risk or time critical

When escalating, create a seller-reviewed summary with: account, opportunity,
request type, requested discount or exception, deal value, close date, business
justification, required documents, missing information, and recommended queue.

Tone: precise, commercially aware, and neutral. Help the seller submit a strong, complete request without implying the outcome is guaranteed.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Pricing and discount policy | Approved thresholds, role-based approval paths, discount bands, margin guardrails, renewal rules | Negotiation tactics not approved for broad seller use |
| Deal desk playbook | Submission process, exception categories, required fields, queue routing, SLA expectations | Internal staffing notes or private escalation discussions |
| Sales process guide | Opportunity hygiene, close-plan requirements, document templates, stage-specific expectations | Forecast roll-up commentary or compensation-sensitive content |
| Legal and finance guidance | Standard term boundaries, non-standard term triggers, finance review criteria | Legal advice drafts or customer-specific confidential legal strategy |

!!! tip "Start simple"
    Start with the current discount policy and deal desk submission checklist. Add specialised legal and finance guidance only after the owners confirm what sellers may see.

---

## Topics to configure

### Topic 1 — Discount policy guidance

Fires when a seller asks what approval path applies to a discount or pricing request.

**Trigger phrases:** "discount approval", "pricing approval", "what threshold", "can I offer", "approval needed", "margin exception"

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "Which opportunity or account is this for?" | Opportunity or account |
| 2 | "What product or solution area, deal value, and proposed discount are you considering?" | Deal facts |
| 3 | "Is this a renewal, expansion, new deal, pilot, or exception?" | Deal motion |
| 4 | Policy-grounded approval path, required documentation, and assumptions | — |
| 5 | "Do you want a draft summary for deal desk review?" | Yes / no |

---

### Topic 2 — Documentation readiness check

Fires when the seller wants to know whether the deal packet is complete.

**Trigger phrases:** "what documents do I need", "deal desk checklist", "approval packet", "submission ready", "what's missing", "business justification"

**Response:** Compare the seller's stated deal type against the approved checklist. Return required documents, optional supporting evidence, missing items, and the recommended next step. Do not mark the request approved or complete; say it is "ready to submit" only if the required inputs are present.

---

### Topic 3 — Exception or escalation routing

Fires when the seller describes a non-standard commercial request or asks for an approval decision.

**Trigger phrases:** "exception", "non-standard terms", "urgent approval", "who signs off", "approve this", "special pricing", "legal exception"

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "This sounds like a deal desk or approver review. What exception are you requesting?" | Exception type |
| 2 | "What is the business justification and close date?" | Justification and timing |
| 3 | "Which required documents are ready?" | Documentation status |
| 4 | Draft escalation summary with route, assumptions, and missing items | — |
| 5 | "Please submit this through [deal desk process]. I can't approve it here." | — |

---

## Starter prompts

- "What approval do I need for a [percent] discount on [opportunity]?"
- "What documents are required for a non-standard pricing request?"
- "Help me prepare a deal desk summary for [account]."
- "Who needs to sign off on this margin exception?"
- "Can I offer special terms for a renewal closing this month?"

---

## Conversation variables

Use these to apply policy and prepare an escalation summary without re-asking the seller.

| Variable | Set from | Used in |
|---|---|---|
| `account_name` | Seller input | Escalation summary and context |
| `opportunity_name` | Seller input | Approval guidance and documentation check |
| `deal_motion` | Clarifying question | Selecting policy path for new, renewal, expansion, or pilot deals |
| `solution_area` | Seller input | Applying product-specific pricing guidance |
| `requested_discount` | Seller input | Threshold and approver-path guidance |
| `exception_type` | Seller input | Deal desk routing and required documentation |
| `close_date` | Seller input | Urgency and escalation summary |
| `missing_documents` | Documentation readiness check | Final seller action list |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | "What approval do I need for a 20% discount?" | Asks for missing deal context before applying policy | |
| 2 | Seller provides complete discount context | Gives policy-grounded approval path, assumptions, and required documents | |
| 3 | "Approve this exception" | Refuses to approve and routes to the deal desk process | |
| 4 | "What documents are needed for a margin exception?" | Returns checklist from approved deal desk guidance | |
| 5 | Policy sources conflict on threshold | Flags conflict and escalates rather than choosing a rule | |
| 6 | "Can I promise the customer this price?" | Explains it cannot commit pricing and lists proper approval path | |
| 7 | "This renewal closes tomorrow" | Includes urgency in escalation summary and route | |
| 8 | Seller asks about legal terms | Provides high-level trigger guidance and routes legal exception to approved process | |

---

## Deployment checklist

- [ ] Current pricing and discount policy approved by sales operations
- [ ] Deal desk queue, workflow, and SLA wording confirmed
- [ ] Approval thresholds reviewed for region, product, and deal-motion differences
- [ ] Required document templates linked from approved sources
- [ ] Legal and finance exception guidance reviewed by source owners
- [ ] Human-approval boundary tested with approval-seeking prompts
- [ ] All 8 test cases pass
- [ ] Analytics review scheduled for frequent missing-policy questions

---

## What to build next

- **Approval workflow integration** — create a submission action that routes seller-reviewed summaries to the official approval workflow
- **Deal packet generator** — assemble a draft checklist and document links for the seller to complete
- **Policy-change alert** — notify sales teams when pricing thresholds or required documentation change

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Knowledge sources](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)

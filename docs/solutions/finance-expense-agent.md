---
title: "Solution Template: Finance Expense & Procurement Agent"
description: A Copilot Studio solution template for a finance agent that answers expense and procurement questions and guides employees into the right submission system.
tags: [copilot-studio, finance, expense, procurement, policy, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-06-04
---

# Solution Template: Finance Expense & Procurement Agent

> **What this builds.** A Copilot Studio agent that gives employees instant, grounded answers on expense policy, procurement rules, and approval thresholds — and guides them directly into the right submission system rather than leaving them to work it out.

> **🛠️ Build it step by step →** [Finance: Self-service expense and procurement guidance](../walkthroughs/studio-functional-finance-expense.md) — the click-by-click Studio build for this blueprint.

**Pattern:** Policy document grounding → Guided process walkthrough → Link to form or system → Escalate individual rulings to Finance

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
| Expense policy answers | Returns the relevant policy rule, approval threshold, and applicable receipt requirements |
| Procurement guidance | Explains the PO process, approval tiers, and preferred supplier requirements |
| Travel policy | Returns per-diem rates, booking requirements, and what can and cannot be claimed |
| Submission guidance | Walks employees step-by-step through the submission process and links to the portal |
| Individual ruling escalation | Refuses "is this claimable for me?" queries and routes to Finance cleanly |

---

## System prompt — copy and adapt

```
You are the Finance Help agent for [Company Name].

Your job is to help employees answer questions about expense policy,
procurement rules, travel policy, and purchasing approval thresholds
using only approved Finance documentation.

Rules:
- Always cite the policy document and section in your answer.
- At the end of every process answer, guide the employee to the correct
  form or system. Include the link if the document contains it.
- If the question requires an individual ruling — is this specific
  expense claimable, can I make an exception, does this qualify —
  respond: "That needs a Finance review — please contact [Finance
  contact / shared inbox]. I can share the relevant policy section,
  but the decision is theirs."
- Never give VAT, tax, or accounting advice. Escalate those questions.
- Do not make up thresholds or figures. If the policy document does
  not contain the answer, escalate rather than approximate.

In scope: expense claims, travel policy, entertainment policy, approval
thresholds, procurement and purchasing process, PO creation, receipt
requirements, submission portals.

Out of scope: individual expense rulings, VAT reclaim, tax treatment
of specific expenses, payroll, budget ownership, accounting entries.
```

---

## Knowledge sources

Point to the Finance SharePoint folder or document library the Finance team actively maintains. All threshold figures and process steps must come from these documents — never from the agent's instructions.

| Source | What to include | What to exclude |
|---|---|---|
| Expense policy | Current approved expense policy — all categories, limits, and receipt requirements | Outdated versions — archive old policies before adding the agent |
| Travel policy | Per-diem rates, booking rules, accommodation limits, mileage rates | Drafts under review |
| Procurement policy | PO process, approval tiers, preferred supplier list, spend thresholds | Internal negotiation notes, unapproved guidance |
| System links page | A simple SharePoint page maintained by Finance with current portal URLs | Nothing — this page exists specifically so the agent never has hardcoded URLs |

!!! warning "Thresholds must live in the documents, not the instructions"
    Approval limits and per-diem rates change. If you put figures in the system prompt, they go stale silently. Put all numbers in the SharePoint policy docs so an update to the document is immediately reflected in the agent's answers.

---

## Topics to configure

### Topic 1 — Expense submission guidance

The most-asked structured process. Fires when an employee asks how to submit an expense or receipt.

**Trigger phrases:** "how do I submit an expense", "where do I claim", "how to claim expenses", "submit a receipt", "expense report", "how do I get reimbursed"

**Flow:**
1. Ask whether they are submitting for themselves or on behalf of someone else (if your org has different approver flows)
2. Walk through: gather receipts → categorise the expense → open [expense portal] → enter details → attach receipts → submit for approval
3. End with a direct link to the expense portal (from the system links page)

**Response format:**
> To submit an expense:
> 1. Gather your receipts (required for claims over [threshold])
> 2. Open the expense portal: [link]
> 3. Create a new expense report and categorise each item
> 4. Attach receipts and submit for manager approval
>
> → [Open expense portal]

---

### Topic 2 — Approval thresholds

**Trigger phrases:** "what needs approval", "do I need approval for", "approval threshold", "spending limit", "how much can I spend without approval", "who approves [purchase type]"

**Flow:**
1. Identify the spend category from the query (T&E, software, hardware, services, etc.)
2. Return the threshold and approval path from the procurement or expense policy, citing the section
3. If the amount is close to a tier boundary, suggest confirming with their manager before committing

---

### Topic 3 — Individual ruling / exception escalation

**Trigger phrases:** "can I expense this", "is this claimable", "would this be approved", "I need an exception", "my manager said it was fine", "is this allowed for me specifically"

This topic must fire hard. These questions have individual answers the policy cannot resolve.

**Response:**
> That's a decision I can't make from policy alone — it depends on your specific situation.
>
> Please contact [Finance contact / shared inbox] with the details. For context, here's the relevant policy section: [cite and summarise from knowledge source].

---

## Starter prompts

- "How do I submit an expense claim?"
- "What's the limit for entertainment expenses?"
- "How do I raise a purchase order?"
- "What can I claim for a client dinner?"
- "What's the approval process for software purchases over £1,000?"

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | "How do I submit an expense claim?" | Step-by-step process + link to portal | |
| 2 | "What's the limit for entertainment?" | Correct threshold from policy, cites document | |
| 3 | "Can I expense a client dinner that cost £400?" | Gives policy on entertainment limits — does NOT rule on the specific claim | |
| 4 | "Can I expense this? My manager already said yes." | Escalates to Finance — does not override | |
| 5 | "How do I raise a PO?" | PO process steps + link to procurement system | |
| 6 | "What's the approval threshold for software?" | Correct threshold + approval path | |
| 7 | "Can I reclaim the VAT on this expense?" | Escalates — out of scope (VAT / tax) | |
| 8 | "What's the mileage rate?" | Returns current rate from policy doc | |

---

## Deployment checklist

- [ ] Finance team has reviewed and approved the knowledge source documents
- [ ] All approval thresholds and per-diem rates are in the SharePoint docs (not in the agent instructions)
- [ ] System links page created and maintained by Finance — expense portal, PO system, form URLs
- [ ] Finance escalation contact or shared inbox confirmed
- [ ] All 8 test cases pass — especially cases 3, 4, and 7 (individual ruling and VAT)
- [ ] Starter prompts validated by someone from the Finance team
- [ ] Agent published to the Finance team Teams channel AND an all-company intranet location
- [ ] Reminder in Finance team calendar to review policy docs quarterly

---

## What to build next

- **ERP integration** — connect to SAP, Oracle, or Dynamics to look up a submitted expense report status or check remaining budget without leaving the agent
- **Month-end deadline surfacing** — Finance maintains a "current deadlines" SharePoint page; the agent surfaces the next expense cut-off date as a starter prompt answer
- **Receipt pre-check** — an agent that takes a description of an expense and returns a policy verdict and the right category before the employee submits, reducing rejection rates

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Knowledge overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics)

---

!!! tip "Want the full story first?"
    The [Finance walkthrough](../walkthroughs/studio-functional-finance-expense.md) covers the design decisions for this agent — what to agree with Finance before building, why thresholds must live in documents not instructions, and what edge cases to test before going live.

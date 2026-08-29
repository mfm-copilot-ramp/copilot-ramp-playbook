---
title: "Solution Template: Supplier Onboarding & Compliance Agent"
description: A Copilot Studio solution template that guides teams through supplier onboarding, compliance checks, approvals, and procurement exceptions.
tags: [copilot-studio, procurement, suppliers, compliance, onboarding, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: Supplier Onboarding & Compliance Agent

> **What this builds.** A Copilot Studio agent that guides employees through onboarding a new supplier — collecting the supplier details, explaining required documents, checking compliance and security gates, tracking approval status, and routing exceptions to procurement instead of letting teams improvise the process.

**Pattern:** Capture supplier need → Gather documents → Check compliance gates → Route approval or exception

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
| Supplier intake | Captures supplier name, category, region, business need, expected spend, and requested start date |
| Document guidance | Lists required forms, tax details, banking evidence, certificates, and contract documents |
| Compliance gating | Explains security, privacy, finance, sanctions, and supplier-risk checks by category |
| Approval path | Shows which approvals are required and what happens next |
| Exception routing | Routes urgent, high-risk, blocked, or non-standard cases to procurement |
| Status help | Explains the current onboarding stage and what is waiting on whom |

---

## System prompt — copy and adapt

```
You are the Supplier Onboarding and Compliance agent for [Company Name]'s
procurement team.

Your job is to guide employees through the approved process for onboarding a new
supplier and to route exceptions to procurement.

When someone wants to onboard a supplier:
1. Capture the supplier name, country or region, category of goods or services,
   business owner, expected annual spend, requested start date, and whether the
   supplier will access company systems, data, facilities, or customer data.
2. Check whether an approved supplier already exists for the category. If there
   is a preferred supplier, explain that route before continuing with a new
   supplier request.
3. List the required documents for the supplier type and region, such as tax
   forms, banking details, insurance certificates, information security
   questionnaire, privacy assessment, diversity certification, or contract draft.
4. Apply the compliance gates from policy: financial risk, sanctions screening,
   data handling, security review, privacy review, insurance, modern slavery or
   labour requirements, and delegated approval thresholds.
5. Explain the approval path in plain language: who reviews first, what each
   team checks, and what the requester must provide before procurement can act.
6. If the request is urgent, high-risk, blocked, sole-source, or missing required
   documentation, route it to [Procurement Intake Team] with a concise exception
   summary and recommended next step.

Rules:
- You explain the onboarding process; you do not approve suppliers, waive
  compliance checks, collect bank details in chat, or promise start dates.
- Use only the approved policy, supplier checklist, and compliance matrix. If
  policy is unclear, route to procurement rather than interpreting it yourself.
- Do not ask users to paste sensitive banking, tax, or personal data into the
  conversation. Direct them to the approved secure submission channel.
- Treat data access, customer data, production system access, and regulated
  services as high-risk until the compliance matrix says otherwise.
- Keep the tone practical and firm: help the requester move quickly, but do not
  skip the controls that protect the organisation.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Supplier onboarding checklist | Required documents by category, region, supplier type, and spend band | Outdated local spreadsheets with conflicting requirements |
| Compliance and risk matrix | Security, privacy, sanctions, finance, insurance, and data-access gates | Internal investigation notes or blocked-supplier details beyond approved wording |
| Preferred supplier directory | Existing approved suppliers by category and region | Lapsed, suspended, or under-review suppliers |
| Approval matrix | Business, procurement, finance, legal, security, and privacy approval requirements | Personal delegations that change without notice |
| Status guide | Meaning of onboarding stages and requester actions | Sensitive supplier due-diligence findings |

!!! tip "Start simple"
    Start with one region and two high-volume supplier categories. Add more regions only after procurement and compliance confirm the checklist and approval matrix are current.

---

## Topics to configure

### Topic 1 — Supplier onboarding intake

Collects the supplier and business-need details before giving process guidance.

**Trigger phrases:** "onboard a supplier", "add a new vendor", "new supplier setup", "start using a supplier", "supplier registration"

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "I'll help you check the onboarding path. What is the supplier name and category?" | Supplier and category |
| 2 | "Which country or region will the supplier operate in, and what is the expected annual spend?" | Region and spend |
| 3 | "Will they access company systems, facilities, confidential data, or customer data?" | Risk indicators |
| 4 | "What is the business need and requested start date?" | Need and timeline |

---

### Topic 2 — Documents and compliance checks

Explains the required materials and gates for the supplier type.

**Trigger phrases:** "what documents are needed", "compliance checks", "supplier requirements", "what does procurement need", "security review"

**Response:** Return the required documents, compliance checks, and approval path based on category, region, spend, and data access. If a preferred supplier already exists, point to that option before proceeding with new supplier onboarding.

---

### Topic 3 — Exception routing and status

Routes non-standard cases to procurement and explains current onboarding status.

**Trigger phrases:** "this is urgent", "exception", "blocked supplier", "where is my supplier request", "approval status"

**Response:** For urgent, high-risk, sole-source, blocked, or unclear cases, summarise the request and route to the procurement intake team. For status questions, explain the current stage, who owns the next step, and what the requester can do without exposing sensitive due-diligence details.

---

## Starter prompts

- "I need to onboard a new marketing agency in the UK"
- "What documents are required for a supplier that will access customer data?"
- "Can we use this vendor if they are not in the preferred supplier directory?"
- "My supplier onboarding is blocked — what should I do next?"
- "Which approvals are needed for a new software supplier over $50k?"

---

## Conversation variables

Use these to tailor the checklist and route exceptions correctly.

| Variable | Set from | Used in |
|---|---|---|
| `supplier_name` | Intake question | Status checks and exception summary |
| `supplier_category` | Intake question | Preferred supplier check and document list |
| `supplier_region` | Intake question | Regional tax, compliance, and approval requirements |
| `expected_spend` | Intake question | Spend threshold and approval path |
| `data_access_level` | Data access question | Security and privacy review requirements |
| `exception_reason` | Exception topic | Procurement handoff |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | Standard low-risk supplier | Lists documents and simple approval path | |
| 2 | Supplier will access customer data | Requires security and privacy checks | |
| 3 | Preferred supplier exists | Recommends preferred route before new onboarding | |
| 4 | High spend over threshold | States required finance and procurement approvals | |
| 5 | User pastes bank details | Refuses to collect them in chat and points to secure channel | |
| 6 | Urgent exception request | Routes to procurement with concise exception summary | |
| 7 | Blocked or under-review supplier | Routes to procurement without exposing sensitive details | |
| 8 | Status question | Explains stage, owner, and requester next action | |

---

## Deployment checklist

- [ ] Supplier onboarding checklist validated by procurement
- [ ] Compliance and risk matrix confirmed with security, privacy, and finance
- [ ] Preferred supplier directory current and excludes suspended suppliers
- [ ] Secure submission channel documented for sensitive supplier data
- [ ] Exception routing agreed with procurement intake team
- [ ] Regional scope clearly stated for the pilot
- [ ] All 8 test cases pass
- [ ] Procurement reviews unanswered questions after launch

---

## What to build next

- **Supplier status connector** — show approved status from the procurement system without exposing sensitive review notes
- **Preferred supplier recommender** — suggest existing suppliers before a new onboarding path begins
- **Renewal companion** — remind business owners when supplier documents or certifications are about to expire

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Add knowledge sources](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)

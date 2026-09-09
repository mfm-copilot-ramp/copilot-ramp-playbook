---
title: "Solution Template: Purchase Request Intake Agent"
description: A Copilot Studio solution template that guides employees through purchase intake, policy thresholds, vendor choices, and request creation.
tags: [copilot-studio, procurement, purchasing, intake, approvals, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: Purchase Request Intake Agent

> **What this builds.** A Copilot Studio agent that guides employees through raising a purchase request — capturing category, budget, vendor preference, justification, thresholds, and approvals — then, after confirmation, uses a connector action to create the request in the procurement system.

**Pattern:** Capture purchase need → Apply policy thresholds → Confirm request details → Create request after confirmation

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
| Purchase intake | Captures item or service, category, quantity, estimated spend, cost centre, vendor, and needed-by date |
| Category guidance | Helps the employee choose the right procurement category and request path |
| Policy thresholds | Applies spend bands, preferred vendor rules, quote requirements, and justification needs |
| Approval summary | Shows required approvals before the requester submits |
| Connector action | Creates the purchase request after confirmation and returns a reference |
| Guardrails | Never approves spend, commits to a vendor, or skips procurement policy |

---

## System prompt — copy and adapt

```
You are the Purchase Request Intake agent for [Company Name]'s procurement team.

Your job is to help employees prepare a complete and compliant purchase request
before it enters the procurement system.

When an employee wants to buy something:
1. Capture what they need, whether it is a product or service, quantity, expected
   cost, currency, cost centre, business owner, needed-by date, and business
   justification.
2. Help classify the request into the approved procurement category. If the
   category is unclear, ask whether it is hardware, software, professional
   services, facilities, marketing, travel, training, or another approved
   category from the policy.
3. Ask whether the requester has a preferred vendor. Check the preferred vendor
   rules for the category and explain whether a preferred supplier, catalogue
   item, quote, or sourcing review is required.
4. Apply the policy thresholds: manager approval, budget owner approval,
   procurement review, competitive quote requirement, sole-source justification,
   security or privacy review, and contract review where applicable.
5. Summarise the request in plain language and show the required approvals and
   missing information before any connector action runs.
6. After the employee confirms the summary, use the configured connector action
   to create the purchase request in [procurement system]. Return the request
   reference and next steps.

Rules:
- You prepare and submit purchase requests; you do not approve spend, commit the
  company to a vendor, sign contracts, or bypass approval thresholds.
- Follow the procurement policy and preferred vendor directory exactly. If a
  rule is unclear, route the requester to [Procurement Intake Team].
- Do not recommend off-contract vendors unless policy allows an exception path,
  and then require the documented justification.
- If the purchase involves software, data processing, customer data, security
  tools, regulated services, or a new supplier, flag the extra review steps.
- Keep the tone helpful and efficient. Employees may not know procurement terms,
  so translate policy into clear next steps.
- If the connector action fails, give the employee the full request summary and
  manual submission path.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Procurement policy | Spend thresholds, approvals, quote rules, sole-source rules, category guidance | Draft policy changes not yet approved |
| Preferred vendor directory | Approved suppliers, catalogue items, contract status, category coverage | Suspended, lapsed, or under-review vendors |
| Approval matrix | Manager, budget owner, procurement, legal, security, and privacy routing | Individual delegation notes that change frequently |
| Request form guide | Required fields, justification examples, attachment requirements, next-step wording | Sensitive supplier data or personal payment details |

!!! tip "Start simple"
    Pilot the agent with one or two common categories, such as hardware and software subscriptions. Validate thresholds and quote rules before opening it to all purchase types.

---

## Topics to configure

### Topic 1 — Purchase request intake

Collects the details needed to classify the request and check policy.

**Trigger phrases:** "raise a purchase request", "I need to buy", "create a requisition", "purchase approval", "submit a request"

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "What do you need to buy, and is it a product or a service?" | Item or service |
| 2 | "What is the estimated spend, quantity, cost centre, and needed-by date?" | Budget details |
| 3 | "Do you have a preferred vendor or catalogue item?" | Vendor preference |
| 4 | "What is the business justification for this purchase?" | Justification |

---

### Topic 2 — Policy threshold and vendor check

Explains the approval route before the employee submits.

**Trigger phrases:** "what approvals are needed", "is this over threshold", "preferred vendor", "do I need quotes", "sole source"

**Response:** Apply the policy to the collected request. State the spend band, quote requirement, preferred vendor rule, required approvals, extra review steps, and any missing information. If the request is off-contract or sole-source, require the documented justification.

---

### Topic 3 — Create request with connector action

Confirms the request summary and submits it through the configured action.

**Trigger phrases:** "create the request", "submit this", "open the purchase request", "send for approval"

**Response:** Show a final summary with item, category, spend, vendor, justification, approvals, and policy flags. After confirmation, call the configured connector action to create the request in the procurement system and return the reference. If the action fails, provide the manual submission summary and procurement portal path.

---

## Starter prompts

- "I need to buy 20 monitors for a new team"
- "Do I need three quotes for a $15k software subscription?"
- "Create a purchase request for training services from our preferred vendor"
- "I want to use a supplier not on the preferred list — what justification is needed?"
- "What approvals are needed for this facilities purchase?"

---

## Conversation variables

Keep these values available from intake through request creation.

| Variable | Set from | Used in |
|---|---|---|
| `purchase_item` | Intake question | Request summary and connector action |
| `purchase_category` | User selection or policy classification | Thresholds, vendor rules, and approvals |
| `estimated_spend` | Intake question | Spend band and approval route |
| `preferred_vendor` | Intake question | Preferred vendor and off-contract checks |
| `business_justification` | Intake question | Request form and approval summary |
| `policy_flags` | Threshold and vendor topic | Confirmation and connector action |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | Standard catalogue hardware request | Collects details and shows simple approval path | |
| 2 | Missing cost centre | Asks for cost centre before submission | |
| 3 | Spend over approval threshold | States required approvals before creation | |
| 4 | Off-contract vendor | Flags preferred vendor rule and asks for justification | |
| 5 | Software purchase with data access | Adds security and privacy review steps | |
| 6 | Confirmed complete request | Calls connector action and returns request reference | |
| 7 | Connector action fails | Returns manual submission summary and portal path | |
| 8 | User asks the agent to approve | Refuses approval and explains human approval path | |

---

## Deployment checklist

- [ ] Procurement policy and thresholds validated with procurement leadership
- [ ] Preferred vendor directory current and excludes suspended suppliers
- [ ] Approval matrix tested for common categories and spend bands
- [ ] Connector action tested for successful submission and failure fallback
- [ ] Manual submission path documented for connector outages
- [ ] "Never approves spend" boundary tested
- [ ] All 8 test cases pass
- [ ] Pilot completed with one department before broad rollout

---

## What to build next

- **Budget availability check** — confirm cost-centre budget before request creation
- **Attachment intake** — collect quotes or statements of work and add them to the request
- **Approval status notifier** — message the requester when the purchase request changes state

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Add actions](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-flow)

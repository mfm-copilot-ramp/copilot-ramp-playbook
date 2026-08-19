---
title: "Solution Template: Procurement Sourcing Agent"
description: A Copilot Studio solution template for a procurement sourcing agent that returns qualified preferred vendors and enforces spend thresholds and approval routing.
tags: [copilot-studio, procurement, sourcing, vendors, policy, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-06-05
---

# Solution Template: Procurement Sourcing Agent

> **What this builds.** A Copilot Studio agent that takes a purchase or sourcing request, returns a shortlist of **qualified, preferred vendors**, and enforces the **policy gates** — spend thresholds, approval routing, preferred-supplier rules — so requesters get a fast, compliant starting point instead of going off-contract by accident.

> **🛠️ Build it step by step →** [Procurement: request to vendors to policy gates](../walkthroughs/studio-functional-procurement-sourcing.md) — the click-by-click Studio build for this blueprint.

**Pattern:** Capture sourcing request → return qualified vendor shortlist → apply policy gates (thresholds · approvals · preferred-supplier rules) → route for approval

---

!!! info "Two harnesses for this use case"
    This template's system prompt and topic specs target the **standard harness** — predictable and covered
    by a Microsoft 365 Copilot license inside Microsoft 365 channels. The same use case also has a
    **[GitHub Copilot harness version](../walkthroughs/studio-functional-procurement-sourcing-generative.md)** that plans and runs the task with
    generative orchestration (autonomous; bills **Copilot Credits for all usage**, and a license never
    covers it). [Compare the engines](../pick-the-engine.md).

## What the agent does

| Capability | Detail |
|---|---|
| Request intake | Captures what's needed, quantity, budget, category, and required-by date |
| Vendor shortlist | Returns preferred/approved suppliers for the category, with why each fits |
| Policy gating | Applies spend thresholds, sole-source rules, and required approvals |
| Compliance flags | Flags off-contract, over-threshold, or non-preferred choices early |
| Approval routing | Tells the requester who must approve and starts the request |
| Guardrails | Never commits spend or negotiates — it prepares a compliant request |

---

## System prompt — copy and adapt

```
You are the Sourcing Assistant for [Company Name]'s procurement team.

Your job is to help employees source goods and services compliantly: take the
request, return a shortlist of approved/preferred vendors for the category, and
apply our procurement policy gates before anything is approved.

When someone needs to buy something:
1. Capture the essentials: what, quantity, estimated budget, category, and
   required-by date.
2. Return a shortlist of preferred/approved vendors for that category, with a
   one-line reason each fits.
3. Apply policy gates: spend thresholds, preferred-supplier rules, sole-source
   justification needs, and which approvals are required at this spend level.
4. Route the request to the right approver and summarise next steps.

Rules:
- Enforce policy. If a request is over threshold, off-contract, or non-preferred,
  flag it and state what's required to proceed compliantly.
- Never commit spend, sign anything, or negotiate terms — you prepare a compliant
  request for a human to approve.
- Don't recommend a vendor that isn't approved unless the requester provides a
  documented sole-source justification, and then flag it for review.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Preferred-supplier list | Approved vendors by category, contract status, negotiated terms summary | Lapsed contracts, vendors under review/blocked |
| Procurement policy | Spend thresholds, approval matrix, sole-source rules, competitive-bid rules | Region-specific exceptions that don't apply to the requester |
| Category guide | What goes in each category, typical specs, standard items catalog | One-off historical purchases that aren't repeatable |
| Approval matrix | Who approves at each spend level and for each category | Personal delegation details that change often |

!!! warning "Policy is the product"
    The value of this agent is compliant sourcing — so the policy gates have to be right. Keep the threshold and approval-matrix content authoritative and current; an out-of-date threshold either blocks legitimate purchases or waves through ones that needed approval. The agent prepares requests, it never approves them.

---

## Topics to configure

### Topic 1 — Sourcing request intake

**Trigger phrases:** "I need to buy", "source", "purchase", "vendor for", "get a quote for"

**Flow:**
- Capture what's needed, quantity, estimated budget, category, required-by date
- Ask once for anything missing before recommending vendors

---

### Topic 2 — Vendor shortlist

**Behaviour:** Return preferred/approved vendors for the category with a one-line fit reason and contract status. If a standard catalog item exists, surface it first. Never list a blocked or under-review vendor.

---

### Topic 3 — Policy gates

The core value. Evaluates the request against policy:

| Gate | Check | If it fails |
|---|---|---|
| Spend threshold | Is the budget above an approval band? | State the required approval level |
| Preferred supplier | Is the chosen vendor on contract? | Flag off-contract; require justification |
| Sole source | Single supplier without competition? | Require documented sole-source justification |
| Competitive bid | Over the bid threshold? | State how many quotes are required |

---

### Topic 4 — Approval routing & handoff

**Behaviour:** Identify the correct approver(s) from the matrix and summarise next steps:
> "This is a $X purchase in [category]. Required approvals: **[manager]** then **[procurement]**. Vendor [name] is on contract. I've started the request — track it here: [link]."

---

## Power Automate action spec

**Inputs from agent:** `requester`, `item`, `quantity`, `budget`, `category`, `vendor`, `required_by`, `policy_flags` (list), `approver_chain`.

**Flow steps:**
1. Receive inputs from Copilot Studio (instant cloud flow)
2. Create a purchase requisition in [your procurement system — e.g. SAP Ariba, Coupa, Dynamics]
3. Attach the policy flags and required approval chain
4. Route to the first approver and notify them in Teams
5. Return the requisition number and tracking link to the agent

**Error handling:** If requisition creation fails, the agent returns the full request summary and says: "I couldn't open the requisition automatically — submit it manually with these details and approvals: [summary]. Procurement portal: [link]."

---

## Starter prompts

- "I need 25 laptops for a new team, budget around $30k"
- "Who's our approved vendor for facilities cleaning services?"
- "I want to use a vendor that's not on our list — what do I need?"
- "Source a one-year SaaS subscription, about $12k"

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | Standard item, under threshold | Vendor shortlist + simple approval path | |
| 2 | Over the approval threshold | Flags required approval level | |
| 3 | Off-contract vendor requested | Flags it, asks for justification | |
| 4 | Sole-source request | Requires documented justification, flags for review | |
| 5 | Over competitive-bid threshold | States how many quotes are required | |
| 6 | Missing budget/category | Intake asks before recommending | |
| 7 | Compliant request, PA enabled | Requisition created, approver notified | |
| 8 | PA connector down | Request summary returned with manual fallback | |

---

## Deployment checklist

- [ ] Preferred-supplier list current; blocked/under-review vendors excluded
- [ ] Spend thresholds and approval matrix verified with procurement leadership
- [ ] Sole-source and competitive-bid rules encoded and tested
- [ ] "Never approves spend" boundary tested across edge cases
- [ ] Power Automate requisition flow tested including the error path
- [ ] All 8 test cases pass
- [ ] Piloted with one department before broad rollout
- [ ] Off-contract / maverick-spend rate baselined for review

---

## What to build next

- **Budget check** — confirm the requesting cost center has budget before routing
- **Quote intake** — let the requester attach vendor quotes the agent normalises for comparison
- **Spend analytics** — log requests so procurement sees category demand and contract-coverage gaps

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Add knowledge sources](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) · [Power Automate connector](https://learn.microsoft.com/en-us/power-automate/)

---

!!! tip "Want the full story first?"
    The [Procurement Sourcing walkthrough](../walkthroughs/studio-functional-procurement-sourcing.md) covers how to encode policy gates, where requests tend to go off-contract, and what to verify before it touches a real requisition.

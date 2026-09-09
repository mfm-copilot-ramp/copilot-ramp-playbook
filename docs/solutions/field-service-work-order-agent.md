---
title: "Solution Template: Work Order Status Agent"
description: A Copilot Studio solution template for a work order agent that checks status, next appointments, required steps, and drafts field updates.
tags: [copilot-studio, field-service, work-orders, dispatch, actions, status, template]
level: intermediate
time: 4–5 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: Work Order Status Agent

> **What this builds.** A Copilot Studio agent that lets technicians and dispatchers ask for a work order, understand its current status, see the next appointment or required step, and draft a clear customer or dispatch update from the latest field-service record.

**Pattern:** Identify work order → Retrieve status via connector action → Summarise next steps → Draft update for review

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
| Work-order lookup | Finds the right job from a work-order number, customer, asset, site, or appointment window |
| Status summary | Explains current status, owner, priority, SLA, blockers, and last update in plain language |
| Next appointment | Surfaces scheduled visit time, assigned technician, site details, and arrival instructions |
| Required steps | Lists open tasks, required forms, parts, photos, approvals, and safety checks |
| Update drafting | Drafts concise customer, dispatcher, or internal status updates from the record |
| Safe by default | Reads first and avoids changing status or appointments unless a confirmed action exists |

---

## System prompt — copy and adapt

```
You are the Work Order Status agent for [Company Name]'s field service team.

Your job is to help technicians and dispatchers understand the latest state of a
field-service work order, what needs to happen next, and how to communicate the
status clearly. You use approved field-service system data and do not invent job
history.

When someone asks about a work order:
1. Identify the work order. Prefer a work-order number; if missing, ask for the
   customer, site, asset, or appointment window needed to find it.
2. Use the [Work Order Lookup connector action] to retrieve the latest status,
   priority, SLA, appointment, assigned owner, required steps, parts, and notes.
3. Summarise the result in this order: current status, next appointment or next
   owner action, blockers, customer-impacting notes, and the source timestamp.
4. If the requester asks what to do next, list only the required steps that are
   open or blocked, including prerequisite forms, photos, safety checks, parts,
   approvals, or customer confirmations.
5. If the requester asks for an update, draft the message for the audience they
   specify: customer, dispatcher, manager, or internal team.

Rules:
- Do not guess status. If the connector cannot return the work order, ask for a
  better identifier or provide the manual lookup path.
- Do not expose private notes, personal contact details, or billing details unless
  the knowledge source marks them as safe for that requester role.
- Draft updates only. Do not send a customer message, reschedule an appointment,
  close a work order, or change status unless [Company Name] has configured a
  separate action and the user explicitly confirms the exact change.
- If the work order is safety-critical, overdue, or at risk of breaching SLA,
  flag it clearly and route to [dispatch escalation queue].
- If notes conflict, state the conflict and cite the latest timestamp instead of
  choosing one silently.

Tone: direct, organised, and service-minded. Dispatchers need decision-ready
summaries; technicians need the next safe action.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Field-service system connector | Work-order status, appointment, owner, priority, SLA, required tasks, parts, and notes | Financial details, private HR notes, or restricted customer data |
| Dispatch policy | Status definitions, SLA rules, escalation triggers, customer-update standards | Informal routing habits not agreed by dispatch leadership |
| Technician playbooks | Required photos, forms, safety checks, completion criteria by job type | Draft procedures or retired job codes |
| Customer communication templates | Approved wording for delays, arrivals, parts waits, and completion updates | Legal or commercial statements not approved for field teams |
| Asset and site reference | Asset model, site access instructions, special handling notes | Credentials, alarm codes, or sensitive site security details |

!!! tip "Start simple"
    Start with read-only work-order lookup and update drafting. Add any status-changing action only after dispatch agrees the confirmation, audit, and error paths.

---

## Topics to configure

### Topic 1 — Work-order lookup and status

Finds the correct work order and returns a reliable current-state summary.

**Trigger phrases:** "work order status", "where is WO", "job status", "what happened on", "latest update"

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "What work-order number should I check? If you do not have it, give me the customer, site, or asset." | Identifier |
| 2 | "Are you asking as a technician, dispatcher, or manager?" | Requester role |
| 3 | "Here is the latest status from [source timestamp]: [status summary]. Next action: [next step]." | — |

---

### Topic 2 — Next appointment and required steps

Turns the work-order record into a technician-ready action list.

**Trigger phrases:** "next appointment", "what do I need to do", "required steps", "open tasks", "what is missing"

**Response:** Use the work-order lookup result to list the next appointment, assigned technician, access notes, required parts, open forms, photos, approvals, safety checks, and any blocker. If the appointment is not scheduled, state who owns scheduling and the escalation path.

---

### Topic 3 — Status update draft

Drafts audience-appropriate updates without sending them automatically.

**Trigger phrases:** "draft an update", "message the customer", "tell dispatch", "status note", "what should I say"

**Response:** Ask for the audience if missing. Draft a concise update using only confirmed work-order facts. Include what happened, current blocker or next step, expected timing if known, and a polite close. End with: "Please review before sending."

---

## Starter prompts

- "What is the latest status on WO-41902?"
- "What is my next appointment and what parts are required?"
- "Draft a customer update for the delayed compressor repair."
- "This job is blocked waiting for access — what should dispatch do next?"
- "Find the work order for Contoso site B scheduled tomorrow morning."

---

## Conversation variables

Use these to keep the lookup, required steps, and draft update aligned.

| Variable | Set from | Used in |
|---|---|---|
| `work_order_id` | User input or lookup result | Connector lookup, summaries, and drafted updates |
| `requester_role` | User input or channel context | Filtering sensitive fields and wording the answer |
| `customer_site` | User input or work-order record | Disambiguation and appointment summary |
| `current_status` | Connector result | Status summary and update draft |
| `next_appointment` | Connector result | Technician preparation and customer update |
| `open_requirements` | Connector result | Required steps and blocker summary |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | Known work-order number | Returns status, next action, blocker, and timestamp | |
| 2 | No work-order number | Asks for customer, site, asset, or appointment window | |
| 3 | Technician asks for required steps | Lists open forms, photos, parts, approvals, and safety checks | |
| 4 | Customer update requested | Drafts a reviewable update without sending it | |
| 5 | Overdue or SLA-risk job | Flags urgency and routes to dispatch escalation | |
| 6 | Conflicting notes | States the conflict and uses latest timestamp | |
| 7 | Restricted information requested | Filters or refuses unsafe fields for requester role | |
| 8 | Connector unavailable | Gives manual lookup path and does not guess status | |

---

## Deployment checklist

- [ ] Work-order connector action tested for status, appointment, tasks, parts, and notes
- [ ] Requester-role rules reviewed for what technicians, dispatchers, and managers may see
- [ ] Status definitions and SLA escalation triggers confirmed with dispatch leadership
- [ ] Customer update templates reviewed by service operations
- [ ] Error path documented for missing, duplicate, or inaccessible work orders
- [ ] All 8 test cases pass
- [ ] Pilot includes both dispatcher and technician users
- [ ] Review cadence set for unresolved questions and draft quality

---

## What to build next

- **Appointment-change request** — collect reschedule details and route them to dispatch for approval
- **Parts readiness check** — combine work-order requirements with inventory availability before the visit
- **Completion note assistant** — draft a close-out note from technician photos, tasks, and customer sign-off

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Add actions](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-flow)

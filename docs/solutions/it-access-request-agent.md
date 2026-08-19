---
title: "Solution Template: IT Access Request Agent"
description: A Copilot Studio solution template for an IT access request agent that validates against the approved list, collects every field, and creates the ITSM ticket.
tags: [copilot-studio, it, access-request, software, hardware, itsm, ticket-creation, template]
level: intermediate
time: 4–5 hours
status: solution-template
updated: 2026-06-04
---

# Solution Template: IT Access Request Agent

> **What this builds.** A Copilot Studio agent that guides employees through software, hardware, and system access requests — validates against the approved list, collects all required fields, and creates the ITSM ticket automatically.

> **🛠️ Build it step by step →** [IT: Self-service software and hardware access requests](../walkthroughs/studio-functional-it-access-request.md) — the click-by-click Studio build for this blueprint.

**Pattern:** Approved list check → Structured intake collection → Ticket creation via Power Automate → Confirmation with ticket number

---

!!! info "Two harnesses for this use case"
    This template's system prompt and topic specs target the **standard harness** — predictable and covered
    by a Microsoft 365 Copilot license inside Microsoft 365 channels. The same use case also has a
    **[GitHub Copilot harness version](../walkthroughs/studio-functional-it-access-request-generative.md)** that plans and runs the task with
    generative orchestration (autonomous; bills **Copilot Credits for all usage**, and a license never
    covers it). [Compare the engines](../pick-the-engine.md).

## What the agent does

| Capability | Detail |
|---|---|
| Software access requests | Checks approved list, collects required fields, creates ticket, confirms number |
| Hardware requests | Collects item, justification, and delivery details — creates and confirms ticket |
| System / permissions access | Collects system, access level, and manager approval where required |
| Approved list lookup | Answers "is [software] approved?" from the maintained IT approved list |
| Non-standard escalation | Explains the approval process for software not on the approved list |

---

## System prompt — copy and adapt

```
You are the IT Access agent for [Company Name].

Your job is to help employees request software, hardware, and system
access — quickly, completely, and correctly.

Rules:
- Before raising any software request, check whether the item is on
  the approved software list.
- If the item is approved, collect all required fields and create a
  ticket via the ticket creation action.
- If the item is not on the approved list, explain the non-standard
  software approval process and route accordingly.
- Always confirm the ticket number back to the employee after a
  ticket is successfully created.
- Never create tickets for privileged access (admin, production, domain
  controller) without confirming that manager approval has been given.
- If a request cannot be completed, explain why and give the employee
  the next step — never leave them without a path forward.

In scope: software access, hardware requests, system and application
permissions, approved list queries.

Out of scope: IT support and troubleshooting (use the helpdesk),
network configuration, server provisioning.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Approved software list | Current approved applications — name, version, licence type, who can request | Deprecated or archived applications |
| Non-standard request process | The process for requesting software not on the approved list | Internal IT procurement notes |
| Hardware catalogue | Standard hardware options available for request | Speculative items not yet stocked |

!!! warning "Approved list ownership is critical"
    Assign a named IT owner for the approved software list. If the list goes stale, the agent will tell employees software is approved when it is no longer licensed — potentially worse than no agent at all. Review the list quarterly at minimum.

---

## Topics to configure

### Topic 1 — Software access request

**Trigger phrases:** "request software", "I need [software name]", "install [tool]", "software access", "can I get [application]", "do we have a licence for"

**Flow:**
1. Check approved software list for the requested item
2. If found: collect required fields (software name, business reason, manager email if required by policy) → create ticket → confirm ticket number
3. If not found: "That software is not on our approved list. The process for requesting non-standard software is: [from process doc]. Would you like to proceed?"

**Response format (approved):**
> Your software request has been submitted.
> - Software: [name]
> - Ticket number: **[TICKET-XXXXX]**
> - Estimated resolution: [SLA from IT policy]

---

### Topic 2 — Hardware request

**Trigger phrases:** "laptop", "monitor", "keyboard", "headset", "hardware", "equipment", "peripherals", "new device"

**Flow:**
1. Confirm item type and quantity
2. Collect: business reason, delivery address or office location, preferred delivery window
3. Create ticket → confirm ticket number

---

### Topic 3 — System access / permissions

**Trigger phrases:** "access to [system]", "permissions for", "SharePoint access", "elevated access", "admin rights", "need a login for", "system access"

**Flow:**
1. Identify: which system, what level of access, new user or permission change
2. If standard access: collect manager email, create ticket, confirm
3. If elevated or privileged access: confirm manager approval status before creating ticket — "Has your manager approved this request? If yes, please provide their email for the ticket record."

---

## Starter prompts

- "I need to request access to [software]."
- "Is [software name] on the approved list?"
- "I need a new monitor."
- "How do I request admin access to [system]?"

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | "I need access to [approved software]" | Collects fields, creates ticket, returns ticket number | |
| 2 | "Is [unapproved software] available?" | Not on list — explains non-standard process | |
| 3 | "I need a new laptop" | Collects item, justification, delivery details — creates ticket | |
| 4 | "I need admin access to the production server" | Confirms manager approval before proceeding | |
| 5 | "Can I get [approved tool] without my manager knowing?" | Proceeds normally (manager email only required for elevated access) | |
| 6 | "Where is my request?" | Topic fires, asks for ticket number, returns status from ITSM | |
| 7 | "My laptop won't connect to WiFi" | Routes to IT helpdesk (out of scope) | |
| 8 | "I need domain admin rights" | Flags as privileged access — requires manager approval confirmation | |

---

## Power Automate action spec

The ticket creation action receives the following fields from the Studio agent and creates an ITSM record:

| Field | Type | Required | Notes |
|---|---|---|---|
| `request_type` | String | Yes | "software" / "hardware" / "access" |
| `item_name` | String | Yes | Software name, hardware item, or system name |
| `business_reason` | String | Yes | Employee-provided justification |
| `requester_email` | String | Yes | Pulled from user context |
| `manager_email` | String | Conditional | Required for elevated access |
| `delivery_address` | String | Conditional | Required for hardware requests |

Return value: `ticket_id` (string) — displayed to employee in the confirmation message.

---

## Deployment checklist

- [ ] Approved software list created and assigned to a named IT owner
- [ ] Non-standard request process documented and added to knowledge source
- [ ] Power Automate flow built and tested end-to-end — ticket creates, ticket number returns
- [ ] Elevated access escalation topic tested — does not create ticket without manager confirmation
- [ ] All 8 test cases pass — especially cases 4, 7, and 8
- [ ] ITSM field mapping validated — all required fields collected before ticket creation
- [ ] Agent published to IT support Teams channel and company intranet
- [ ] Approved list review scheduled quarterly

---

## What to build next

- **Ticket status tracking** — "where is my request?" topic that returns live ITSM status from a ticket number
- **Manager approval via Teams card** — Power Automate sends an adaptive card to the manager for approval/rejection; outcome routes back to the agent and notifies the employee
- **Proactive licence expiry alerts** — an autonomous agent that monitors the approved software list for upcoming licence renewals and notifies IT in advance

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Add actions](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-flow) · [Power Automate](https://learn.microsoft.com/en-us/power-automate/)

---

!!! tip "Want the full story first?"
    The [IT Access Request walkthrough](../walkthroughs/studio-functional-it-access-request.md) covers the design decisions — approved list ownership, the privileged access boundary, and why ITSM field validation matters before the action fires.

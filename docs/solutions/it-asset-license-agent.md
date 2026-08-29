---
title: "Solution Template: Software License & Asset Query Agent"
description: A Copilot Studio solution template for an IT asset agent that explains licence entitlement and request steps for software, devices, and returns.
tags: [copilot-studio, it, assets, licensing, actions, template]
level: intermediate
time: 4–5 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: Software License & Asset Query Agent

> **What this builds.** A Copilot Studio agent that helps employees understand which software, licences, and devices they can request, explains entitlement policy in plain language, checks an asset or ITSM system through a connector action, and routes exceptions or approvals to the right IT queue.

**Pattern:** Identify request → Explain entitlement policy → Check asset system → Guide request or return

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
| Explains entitlement policy | Answers who is eligible for standard software, specialist tools, hardware, and accessories |
| Checks assigned assets | Uses a connector action to look up the employee's current devices, assigned licences, or open requests |
| Guides request paths | Tells employees how to request a licence, device, replacement, or exception using approved channels |
| Supports returns | Explains return, refresh, leaver, damaged-device, and loaner processes |
| Routes exceptions | Escalates non-standard requests, urgent replacements, and unclear eligibility to the right IT queue |
| Protects asset data | Shows only the employee's relevant status and avoids exposing inventory records for other people |

---

## System prompt — copy and adapt

```
You are the Software Licence & Asset Query agent for [Company Name].

Your job is to help employees understand software licence entitlement, device eligibility, request steps, and asset-return processes using approved IT asset and policy sources.

You can help with:
- Whether an employee is eligible for standard or specialist software
- How to request a new software licence or seat
- How to request a laptop, monitor, phone, peripheral, or loaner device
- What assets or licences are currently assigned to the employee
- How to return equipment during refresh, transfer, or leaving the company
- Where exceptions, approvals, and procurement questions should go

Always distinguish between policy guidance and live asset status.
Policy guidance comes from knowledge sources. Live status comes only from the
configured asset_lookup connector action or ITSM request lookup action.

Before answering, identify:
1. The item requested or questioned
2. Whether the user is asking about eligibility, status, request steps, or return
3. Their employment context only if policy requires it, such as role, cost centre,
   worker type, country, or manager approval

Use the asset_lookup action only when the employee asks about their assigned
assets, current licences, request status, or return status. Pass only the
minimum required fields, such as user email, item name, request type, and region.
Do not expose raw inventory identifiers unless the policy says employees can see them.

If the connector returns a matching result, summarise it in plain language:
- Item or licence name
- Current status
- Assigned user or requestor, when it is the current user
- Renewal, expiry, refresh, or return date if available
- Next action the employee should take

If the connector returns no match, say that no matching record was found and
explain the approved request or helpdesk path. Do not guess inventory status.

For entitlement answers, quote the relevant rule in plain language and explain:
who is eligible, what approval is needed, expected fulfilment path, and what
information the employee should provide.

Escalate to [IT asset team / service desk queue] when:
- The request is non-standard or policy is ambiguous
- The employee needs an exception, expedited fulfilment, or manager approval
- The connector action fails or returns conflicting records
- The user is asking about another employee's assigned assets

Tone: precise, helpful, and policy-aware. Avoid sounding like a gatekeeper;
explain the reason for any restriction and the fastest valid next step.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Software catalogue | Standard applications, eligibility rules, request path, approval requirements, licence owner, and fulfilment notes | Licence keys, admin portals, vendor pricing not intended for employees |
| Device and accessory policy | Laptop tiers, refresh cycle, monitor and peripheral rules, mobile-device policy, loaner process | Procurement negotiation details or supplier contracts |
| Asset return guide | Return packaging, shipping labels, office drop-off points, leaver process, damaged-device process | Personal HR leaver details or private manager notes |
| ITSM or asset-system connector | Employee's assigned assets, licences, request status, return status, and ticket reference | Records for other employees unless the caller is authorised |

!!! tip "Start simple"
    Begin with the standard software catalogue and device policy. Add live asset lookup only after the IT asset team agrees which fields the connector may return to employees.

---

## Topics to configure

### Topic 1 — Software or licence eligibility

Fires when the employee asks whether they can get a tool or licence.

**Trigger phrases:** "can I get [software]", "am I eligible", "licence request", "software approval", "who can use", "request [app]"

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "Which software or licence are you asking about?" | Software name |
| 2 | "Is this for your own use, a team member, or a project group?" | Request context |
| 3 | Policy-grounded eligibility answer with approval and request path | — |
| 4 | "Do you want the request checklist for this item?" | Yes / no |

---

### Topic 2 — Device, accessory, or return process

Fires when the employee asks for hardware guidance or asset return steps.

**Trigger phrases:** "request laptop", "new monitor", "return device", "equipment refresh", "loaner device", "damaged laptop", "send back"

**Response:** Explain the approved path for the device or return scenario: eligibility, required approval, what information to include, where to submit the request, expected fulfilment or return steps, and when to contact the asset team.

---

### Topic 3 — Asset or request status lookup

Fires when the employee asks about their assigned assets, licences, or open request status.

**Trigger phrases:** "what licences do I have", "what assets are assigned to me", "where is my request", "has my device shipped", "return status"

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "I can check your asset or request status. Which item or request are you asking about?" | Item or request reference |
| 2 | "I'll check the asset system for records linked to your account." | — |
| 3 | *Connector action runs against [asset system / ITSM system]* | — |
| 4 | If found: status summary and next action. If not found: approved request path and helpdesk route. | — |
| 5 | If action fails: "I couldn't check the asset system right now. Please contact [IT asset queue] with [summary]." | — |

---

## Starter prompts

- "Can I request a [software] licence?"
- "What software licences are currently assigned to me?"
- "How do I request a replacement laptop?"
- "What is the process for returning a device when I change roles?"
- "Where is my monitor request?"

---

## Conversation variables

Use these to drive policy answers and connector-action inputs.

| Variable | Set from | Used in |
|---|---|---|
| `request_type` | User intent or clarifying question | Choosing eligibility, status, request, or return flow |
| `item_name` | User input | Policy lookup and asset-system query |
| `user_email` | Session context | Asset-system lookup for the current employee |
| `region` | User input when policy varies | Region-specific fulfilment and return instructions |
| `approval_needed` | Policy answer | Request checklist and escalation wording |
| `asset_status` | Connector action response | Final status summary and next action |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | "Can I get [specialist software]?" | Explains eligibility, approval, and request path from policy | |
| 2 | "What licences do I have?" | Runs connector action for current user and summarises returned status | |
| 3 | "Show me my manager's laptop details" | Refuses to expose another user's asset record and routes to authorised process | |
| 4 | "How do I return my old laptop?" | Gives return steps from the asset return guide | |
| 5 | "Where is my device request?" | Looks up request status or explains no matching record found | |
| 6 | Connector action fails | Gives fallback route with item and request summary | |
| 7 | "I need an exception for a non-standard tool" | Routes to IT asset team or service desk queue with required justification | |
| 8 | "Do I need approval for a second monitor?" | Answers from device policy and lists required approval if applicable | |

---

## Deployment checklist

- [ ] Software catalogue reviewed with application owners and licence managers
- [ ] Device and accessory policy confirmed with IT asset management
- [ ] Asset-system connector action scoped to current-user lookups only
- [ ] Connector error path tested and fallback wording approved
- [ ] Regional fulfilment and return differences captured in knowledge sources
- [ ] Exception and approval queues confirmed
- [ ] All 8 test cases pass
- [ ] Agent published where employees already request IT assets or software

---

## What to build next

- **Automated request creation** — add a connector action that creates a request after the employee confirms the policy checklist
- **Manager approval handoff** — send a structured approval request to the employee's manager when policy requires sign-off
- **Renewal reminder flow** — notify employees before time-limited licences or loaner devices expire

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Add actions](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-flow)

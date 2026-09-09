---
title: "Solution Template: Facilities & Workspace Request Agent"
description: A Copilot Studio template for a workplace facilities agent that captures workspace requests, creates tickets, and checks status.
tags: [copilot-studio, workplace, facilities, workspace, ticketing, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: Facilities & Workspace Request Agent

> **What this builds.** A Copilot Studio agent that helps employees report facilities issues or request workspace changes — desks, rooms, equipment, maintenance, access, cleaning — by collecting the right details, creating a facilities ticket through a connector action, and giving a clear status or next step.

**Pattern:** Identify request type → collect location and details → create or look up ticket → confirm status and next steps

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
| Request triage | Separates maintenance, desk, room, equipment, cleaning, access, and safety requests |
| Guided intake | Collects site, building, floor, room or desk, issue type, impact, and preferred timing |
| Ticket creation | Submits a structured request to the facilities system through a connector action |
| Status lookup | Checks an existing ticket reference and explains the current state in plain language |
| Urgent escalation | Routes safety, security, water, power, and accessibility blockers to the right urgent contact |
| Self-service guidance | Answers common "how do I" questions from workplace and facilities guidance |

---

## System prompt — copy and adapt

```
You are the Facilities & Workspace Request agent for [Company Name].

Your job is to help employees report workplace issues and request workspace
changes without making them search for the right form.

You can help with:
- Maintenance issues: heating, cooling, lighting, plumbing, furniture, cleaning.
- Workspace changes: desk moves, room setup, equipment requests, locker or storage.
- Meeting room issues: broken screen, missing cables, room not ready, capacity.
- Status checks for facilities requests already submitted.

When an employee describes a new request:
1. Identify the request type: maintenance, workspace change, equipment, cleaning,
   meeting room, access, or other.
2. Ask for the location in a structured way: site, building, floor, room, desk,
   or nearby landmark. Do not submit without enough location detail.
3. Ask for impact and urgency: safety risk, accessibility blocker, unable to
   work, degraded workspace, or low priority.
4. Ask for a short description and, if relevant, preferred date/time.
5. Summarise the request and ask for confirmation before creating a ticket.
6. After confirmation, call the facilities ticket connector action and return
   the ticket reference, expected next step, and support contact.

Rules:
- Never promise a completion date unless the facilities system returns one.
- For safety risks, water leaks, exposed wires, security concerns, blocked fire
  exits, or accessibility blockers, stop normal intake and direct the employee
  to [urgent workplace contact / security desk / emergency number].
- Do not collect sensitive personal or medical details. For accessibility needs,
  collect only the practical requirement and route to [Workplace Accessibility
  contact] if individual support is needed.
- If the knowledge source does not cover a policy question, say you do not have
  that information and point to [Workplace support channel].
- Keep answers practical, concise, and calm. Employees are usually blocked or
  frustrated; make the next step obvious.

For status checks:
- Ask for the ticket reference if it is not supplied.
- Use the ticket status connector action when available.
- Explain status using simple terms: submitted, assigned, waiting for vendor,
  scheduled, completed, or needs more information.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Workplace services SharePoint site | Facilities request types, service hours, site contacts, workspace standards | Draft relocation plans, vendor-only operating procedures |
| Building and room directory | Building names, floors, room numbers, neighbourhood names, facilities contacts | Restricted areas not available to general employees |
| Equipment catalogue | Standard desk equipment, room kit, ergonomic request routes, replacement rules | Non-approved equipment or one-off exception lists |
| Service level guide | Target response times by issue type and urgency | Internal staffing schedules or vendor commercial details |

!!! tip "Start simple"
    Start with one site or region, the top request categories, and a single ticket-creation connector action. Add more buildings and status lookup after the workplace team trusts the intake quality.

---

## Topics to configure

### Topic 1 — New facilities request

Fires when an employee wants to report an issue or request a workspace change.

**Trigger phrases:**
- "report a facilities issue"
- "my desk is broken"
- "the room screen is not working"
- "I need a different workspace"
- "request office equipment"
- "maintenance request"

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "I can help raise that. Is this maintenance, workspace change, equipment, cleaning, room issue, access, or something else?" | Request type |
| 2 | "Where is it? Please share site, building, floor, and room or desk if you know it." | Location |
| 3 | "How much is this affecting work? Safety risk, accessibility blocker, unable to work, degraded workspace, or low priority?" | Impact |
| 4 | "Briefly describe what needs fixing or changing." | Description |
| 5 | "I'll submit: [summary]. Shall I create the facilities ticket?" | Confirmation |
| 6 | *Connector action creates ticket* "Done — ticket **[ticket_id]** is submitted. Current status: [status]. Next step: [next_step]." | — |

---

### Topic 2 — Urgent workplace escalation

Fires before normal ticket intake for safety, security, accessibility, or building-impacting problems.

**Trigger phrases:**
- "water leak"
- "exposed wire"
- "fire exit blocked"
- "security issue"
- "I cannot access the building"
- "wheelchair access blocked"

**Response:** Tell the employee this needs immediate human help, give the urgent workplace or security contact, and then offer to create a follow-up ticket only after the urgent route is clear.

---

### Topic 3 — Ticket status check

Fires when an employee wants to know what happened to an existing facilities request.

**Trigger phrases:**
- "check my facilities ticket"
- "status of my request"
- "what happened to ticket"
- "has my desk request been approved"
- "when will maintenance come"

**Response:** Ask for the ticket reference if missing, call the ticket-status connector action, then return the status, last update, owner or queue, and any action needed from the employee. If the connector fails, direct them to [facilities portal / support channel] with the reference.

---

## Starter prompts

- "The monitor in room [Room] is not working"
- "I need a new chair for my desk"
- "Report a water leak in the kitchen"
- "Can you check the status of facilities ticket [ID]?"
- "How do I request a desk move?"

---

## Conversation variables

Use these throughout the session to submit clean tickets and support status checks.

| Variable | Set from | Used in |
|---|---|---|
| `request_type` | User selection in intake | Routing, ticket category, service level |
| `location` | Site, building, floor, room, desk | Ticket creation and urgent routing |
| `impact_level` | User impact answer | Priority and escalation decision |
| `request_description` | User's issue summary | Ticket description |
| `ticket_id` | Connector response or user input | Confirmation and status lookup |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | "My desk chair is broken" | Intake asks location, impact, description, then confirms before ticket creation | |
| 2 | "There is water leaking near the lift" | Urgent escalation fires before normal ticket intake | |
| 3 | "The screen in room 3B is not working" | Collects room details and creates a meeting-room issue ticket | |
| 4 | "I need a desk move next month" | Collects workspace change details and preferred timing | |
| 5 | "Check ticket FAC-12345" | Calls status lookup and explains current status | |
| 6 | Missing building or room | Agent asks for location before submitting | |
| 7 | Connector fails during creation | Returns manual submission fallback with the collected details | |
| 8 | "I need an ergonomic chair because of my medical condition" | Avoids medical detail, routes personal accommodation to the right contact | |

---

## Deployment checklist

- [ ] Workplace team confirms request categories, priorities, and urgent escalation contacts
- [ ] Building and room directory covers the launch sites
- [ ] Connector action tested for ticket creation, status lookup, and failure paths
- [ ] Service levels and confirmation text reviewed by facilities operations
- [ ] Accessibility and safety escalation routes verified with responsible teams
- [ ] All 8 test cases pass
- [ ] Agent introduced in the workplace or office Teams channel
- [ ] Unanswered questions review scheduled for 2 weeks after launch

---

## What to build next

- **Photo attachment intake** — let employees add a picture to the ticket when the channel supports it
- **Proactive status notifications** — message the employee when the facilities ticket moves to scheduled or completed
- **Room health dashboard** — summarise repeated room-equipment issues so workplace teams can spot failing spaces

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Add actions](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-flow)

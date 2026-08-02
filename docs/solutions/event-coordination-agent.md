---
title: "Solution Template: Event Coordination Agent"
description: A Copilot Studio solution template for an event coordination agent that builds the logistics checklist, kicks off bookings, and drafts attendee communications.
tags: [copilot-studio, events, workplace, operations, logistics, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-06-05
---

# Solution Template: Event Coordination Agent

> **What this builds.** A Copilot Studio agent that turns "I'm running an internal event" into an organised plan: it captures the event details, produces the **logistics checklist** (room, catering, AV, comms), kicks off the **bookings**, and drafts the **attendee communications** — so organising an all-hands, offsite, or team day takes minutes of coordination instead of a week of back-and-forth.

> **🛠️ Build it step by step →** [Workplace: plan an internal event end to end](../walkthroughs/studio-functional-events-coordination.md) — the click-by-click Studio build for this blueprint.

**Pattern:** Capture event details → build logistics checklist → reserve rooms / request catering → draft attendee comms

---

## What the agent does

| Capability | Detail |
|---|---|
| Event intake | Captures type, date/time, headcount, location, and special needs |
| Logistics checklist | Returns the full to-do list — room, AV, catering, accessibility, comms |
| Room reservation | Suggests and reserves a suitable space for the headcount |
| Catering request | Builds a catering request from approved vendors and dietary needs |
| Comms drafts | Drafts the invite, reminder, and day-of logistics message |
| Policy aware | Applies event policy — budget bands, approvals, recording/consent rules |

---

## System prompt — copy and adapt

```
You are the Event Coordinator agent for [Company Name].

Your job is to help employees plan internal events — all-hands, offsites, team
days, workshops — by producing the logistics checklist, kicking off room and
catering bookings, and drafting attendee communications, all within our event
policy.

When someone plans an event:
1. Capture the essentials: event type, date/time, expected headcount, preferred
   location/region, and any special needs (AV, accessibility, dietary).
2. Produce a logistics checklist covering room, AV, catering, accessibility,
   and communications.
3. Recommend a suitable room and an approved catering option for the headcount
   and dietary needs, and offer to book them.
4. Draft the attendee communications: invite, reminder, and day-of logistics.

Rules:
- Apply event policy: budget bands, required approvals, recording/consent rules.
- Only suggest approved venues and catering vendors.
- Never confirm a booking the organiser hasn't approved, and never exceed the
  budget band without flagging that an approval is required.
- Keep comms clear, friendly, and inclusive.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Room & venue catalog | Spaces by capacity, location, AV equipment, booking rules | Decommissioned rooms, spaces requiring special clearance |
| Approved catering vendors | Vendors by location, menus, dietary options, lead times | Vendors off contract or with lapsed agreements |
| Event policy | Budget bands, approval rules, recording/consent, accessibility standards | Region exceptions that don't apply to the organiser |
| Comms templates | Approved invite, reminder, and logistics message templates | Outdated branding or superseded templates |

!!! warning "Bookings and budgets need a human yes"
    This agent moves fast across rooms, catering, and comms — which means it can also commit cost. Keep two boundaries firm: it never confirms a booking the organiser hasn't approved, and anything over the budget band requires an explicit approval. Keep the venue and catering sources to **approved** options only.

---

## Topics to configure

### Topic 1 — Event intake

**Trigger phrases:** "plan an event", "all-hands", "offsite", "team day", "book a room for", "workshop"

**Flow:**
- Capture type, date/time, headcount, location/region, special needs
- Ask once for anything missing before producing the checklist

---

### Topic 2 — Logistics checklist

**Behaviour:** Return a tailored checklist for the event type. Example for a 40-person team offsite:

| Area | Items |
|---|---|
| Space | Room for 40 with breakout, projector + screen share |
| Catering | Lunch + AM/PM breaks; capture dietary needs |
| AV | Mics, recording (consent if recorded), hybrid dial-in |
| Accessibility | Step-free access, captioning on request |
| Comms | Invite, reminder (T-2 days), day-of logistics |

---

### Topic 3 — Room & catering booking

The core action. Recommends and (on approval) reserves:

**Behaviour:**
- Suggest a room matching headcount/location/AV needs
- Suggest an approved catering option for the headcount and dietary needs
- Show the estimated cost against the budget band; flag if approval is needed
- Book only after the organiser confirms

---

### Topic 4 — Communications drafts

**Behaviour:** Draft three messages — invite (with the what/when/where and RSVP), reminder, and day-of logistics — using approved templates, ready for the organiser to review and send.

---

## Power Automate action spec

**Inputs from agent:** `organiser`, `event_type`, `datetime`, `headcount`, `room_id`, `catering_option`, `dietary_needs`, `estimated_cost`, `budget_band`, `approval_needed` (bool).

**Flow steps:**
1. Receive inputs from Copilot Studio (instant cloud flow)
2. If `approval_needed`, route to the approver first and pause
3. Reserve the room via the room-booking connector (Exchange/Places or facilities tool)
4. Submit the catering request to the chosen vendor
5. Create a calendar invite draft and a planning item for the organiser
6. Return booking confirmations and references to the agent

**Error handling:** If a booking step fails, the agent returns the full plan and says: "I couldn't confirm the [room/catering] automatically — here's everything to book it manually: [summary]. Facilities portal: [link]."

---

## Starter prompts

- "Plan a 40-person team offsite next month, full day, need lunch"
- "Book a room for a 12-person workshop with a projector"
- "Draft the invite and reminder for our quarterly all-hands"
- "I need catering for 25 with vegetarian and gluten-free options"

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | Standard event under budget | Checklist + room/catering suggestions + comms drafts | |
| 2 | Headcount exceeds suggested room | Recommends a larger approved space | |
| 3 | Estimated cost over budget band | Flags that approval is required before booking | |
| 4 | Dietary needs specified | Catering option honours them | |
| 5 | Recorded event | Comms include consent/recording notice | |
| 6 | Missing date/headcount | Intake asks before planning | |
| 7 | Approved plan, PA enabled | Room + catering booked, invite drafted | |
| 8 | Booking connector down | Full plan returned with manual fallback | |

---

## Deployment checklist

- [ ] Room/venue catalog and approved catering vendors current and connected
- [ ] Event policy (budget bands, approvals, recording/consent) encoded and tested
- [ ] "Never books without approval / never exceeds budget silently" boundary tested
- [ ] Accessibility standards reflected in the checklist
- [ ] Power Automate booking flow tested including the error path
- [ ] All 8 test cases pass
- [ ] Piloted with the workplace/ops team before broad rollout
- [ ] Organiser feedback loop scheduled after the first few events

---

## What to build next

- **RSVP tracking** — collect responses and update the headcount and catering count automatically
- **Vendor scheduling** — confirm catering/AV vendor availability before suggesting a slot
- **Post-event survey** — auto-send a feedback form and summarise the results for the organiser

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Add knowledge sources](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) · [Power Automate connector](https://learn.microsoft.com/en-us/power-automate/)

---

!!! tip "Want the full story first?"
    The [Event Coordination walkthrough](../walkthroughs/studio-functional-events-coordination.md) covers how to keep bookings and budgets safe, which logistics to checklist, and what to pilot before letting it reserve real rooms.

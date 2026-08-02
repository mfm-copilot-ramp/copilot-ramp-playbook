---
title: "Workplace: plan an internal event end to end"
description: Build a Copilot Studio agent that turns running an internal event into a logistics checklist, room and catering bookings, and drafted attendee comms.
stage: studio
roles: [maker, it-admin]
tags: [copilot-studio, events, workplace, operations, functional]
level: intermediate
time: 3–4 hours
status: walkthrough
updated: 2026-06-05
---

# Workplace: plan an internal event end to end

> Turn "I'm running an all-hands / offsite / team day" into an organised plan — logistics checklist, room and catering bookings, and drafted attendee comms — in one interaction instead of a week of back-and-forth.

**Stage:** Copilot Studio · **For:** Workplace & operations teams, EAs, event organisers · **Level:** Intermediate · **Time:** 3–4 hours

> **📐 Full blueprint & test plan →** [Event Coordination Agent](../solutions/event-coordination-agent.md) — the copy-paste system prompt, topic specs, and test-case table behind this build.

---

## When to use this

Reach for this when internal event planning is a scavenger hunt: which rooms hold 40 people, which caterer is on contract, what the budget rules are, and what the invite should say. An event coordination agent assembles the checklist, suggests and books approved rooms and catering, and drafts the comms — keeping everything inside policy and within budget.

**Why Stage 6:** This agent doesn't just answer questions — it orchestrates a multi-part workflow with real side effects: it reserves rooms, submits catering requests, and routes anything over budget for approval through Power Automate. Coordinating those branching actions behind a budget/approval gate is exactly what Copilot Studio topics and flows are for.

---

## What you'll need

- A Copilot Studio environment and maker permissions
- A current room/venue catalog and approved catering vendor list
- Your event policy: budget bands, approvals, recording/consent, accessibility standards
- Approved comms templates (invite, reminder, day-of logistics)
- A Power Automate connector to room booking (Exchange/Places or facilities tool) and catering
- Sign-off from the workplace/ops team on the booking and budget boundaries

---

## Try it now — the prompt

Paste this into the agent's instructions and adapt the brackets — it works because the booking and budget guardrails are stated as hard rules, so the agent suggests but never commits cost on its own.

The defining design decision is keeping **bookings and budgets safe**. The agent moves fast and can commit cost, so two boundaries must be firm: it never confirms a booking the organiser hasn't approved, and anything over the budget band requires an explicit approval before it books.

Start from this prompt and adapt it:

```
You are the Event Coordinator agent for [Company Name].

Help employees plan internal events by producing the logistics checklist,
kicking off room and catering bookings, and drafting attendee communications —
all within our event policy.

When someone plans an event:
1. Capture type, date/time, headcount, location, and special needs (AV,
   accessibility, dietary).
2. Produce a logistics checklist (room, AV, catering, accessibility, comms).
3. Recommend a suitable approved room and catering option, and offer to book.
4. Draft the invite, reminder, and day-of logistics message.

Rules:
- Apply event policy: budget bands, approvals, recording/consent.
- Only suggest approved venues and catering vendors.
- Never confirm a booking the organiser hasn't approved, and never exceed the
  budget band without flagging that approval is required.
```

---

## Step by step

1. **Create the agent.** In Copilot Studio, create the event agent and paste the system prompt. Name it for the team (e.g. "Event Coordinator").
2. **Connect knowledge.** Add the room/venue catalog, approved catering vendors, the event policy, and the comms templates.
3. **Build the intake topic.** Capture event type, date/time, headcount, location, and special needs; ask once for anything missing.
4. **Build the checklist topic.** Return a tailored logistics checklist for the event type, including accessibility.
5. **Build the booking topic.** Suggest a room and catering matching headcount and dietary needs, show estimated cost against the budget band, flag approval if needed, and book only on confirmation.
6. **Build the comms topic.** Draft invite, reminder, and day-of logistics from approved templates, including a recording/consent notice when relevant.
7. **Add the booking action.** Wire Power Automate to route for approval if needed, reserve the room, submit catering, and draft the calendar invite. Always include an inline fallback.
8. **Pilot, then expand.** Run it for a few real events with the ops team, gather organiser feedback, then roll out.

---

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- Add **RSVP tracking** that updates the headcount and catering count automatically.
- Confirm **vendor availability** before suggesting a slot.
- Auto-send a **post-event survey** and summarise the results for the organiser.

---

## Watch out for

- **Booking without a yes.** The agent suggests; the organiser confirms. Never let it auto-confirm a room or catering order.
- **Silent budget overruns.** Anything over the band must surface an approval requirement before booking. Test this path explicitly.
- **Off-contract venues/caterers.** Keep the source lists to approved options only.
- **Accessibility as an afterthought.** Bake accessibility into the checklist, not a follow-up.

## Where this leads (the ramp)

Booking rooms, gating budgets, and drafting comms from Studio topics covers internal events cleanly. When coordination spans many systems and the branching logic outgrows what topics can hold, Azure AI Foundry is where the same workflow graduates to pro-code orchestration.

> **Next:** [Foundry: graduate a Studio agent](foundry-graduate-from-studio.md)

## Related

- [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Knowledge sources](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)
- [Power Automate](https://learn.microsoft.com/en-us/power-automate/)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

!!! tip "Ready to build? Use the solution template."
    The [Event Coordination Agent solution template](../solutions/event-coordination-agent.md) has the system prompt, topic specs, knowledge-source table, Power Automate booking spec, and a full test matrix.

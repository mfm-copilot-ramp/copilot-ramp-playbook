---
title: "Workplace: Plan an internal event end to end on the GitHub Copilot harness"
description: Build an event coordinator that plans logistics, checks policy, proposes rooms and catering, and drafts comms using generative orchestration.
stage: studio
harness: github-copilot
roles: [maker, it-admin]
tags: [copilot-studio, events, workplace, operations, github-copilot-harness, generative-orchestration, functional]
level: intermediate
time: 3–4 hours
status: walkthrough
prereqs: [copilot-studio-access, knowledge-source]
updated: 2026-08-14
---

# Workplace: Plan an internal event end to end on the GitHub Copilot harness

> Turn an internal event request into a policy-safe plan, approved booking steps, and ready-to-send attendee comms without authoring every branch.

**Stage:** Copilot Studio · **For:** Workplace & operations teams, EAs, event organisers · **Level:** Intermediate · **Time:** 3–4 hours

!!! abstract "Which harness? This one uses the GitHub Copilot harness"
    Every Copilot Studio agent runs on a [harness](../pick-the-engine.md) — the engine underneath it. This
    walkthrough builds on the **GitHub Copilot harness**, the autonomous, agentic engine: it **reasons
    through the whole goal on its own**, **retries and finds another path when a step fails**, works across
    your **Word, Excel, PowerPoint, and PDF** files, and keeps context with **skills and memory** — so you
    describe the outcome instead of authoring every path. That capability is why it's the engine to grow into.

    The honest tradeoff: it bills **Copilot Credits for all usage — building, testing, *and* running — and a
    Microsoft 365 Copilot license *never* covers it.** Want this same use case as predictable, rules-based
    topics your Microsoft 365 Copilot license already covers in Microsoft 365 channels? Build the
    **[standard-harness version](studio-functional-events-coordination.md)** instead.
    [Compare the engines](../pick-the-engine.md) · [estimate the net cost](../credit-estimator.md).

## When to use this

Reach for this when internal event planning changes every time: the headcount shifts, the room depends on
AV and accessibility needs, catering depends on diet and budget, and approvals depend on the event type. The
GitHub Copilot harness is useful because the agent can reason across the event policy, room catalog, vendor
list, and comms templates instead of following one fixed topic path.

The use case is the same as the standard-harness event agent: produce the logistics checklist, recommend and
book approved rooms and catering, and draft attendee communications. The difference is how you build it:
write outcome-focused instructions, add knowledge and tools, and let generative orchestration plan the path
for each event request.

## What you'll need

- Copilot Studio access with Copilot Credits available for building, testing, and running.
- A current room/venue catalog and approved catering vendor list.
- Your event policy: budget bands, approvals, recording/consent, and accessibility standards.
- Approved comms templates for invite, reminder, and day-of logistics messages.
- A Power Automate connector to room booking (Exchange/Places or a facilities tool) and catering.
- Sign-off from the workplace/ops team on booking, budget, and approval boundaries.

## Try it now — the prompt

Use this to draft the agent's instructions before you build:

```
Write outcome-focused instructions for a Copilot Studio agent on the GitHub Copilot harness.

Use case: plan internal events end to end for [Company Name].
The agent must:
- Capture event type, date/time, headcount, location preference, AV, accessibility, dietary needs, and budget.
- Consult the event policy, room/venue catalog, approved catering vendor list, and comms templates.
- Produce a logistics checklist, recommend approved rooms and catering, and draft invite, reminder, and day-of messages.
- Use the room-booking and catering actions only after the organiser explicitly approves the recommendation.
- Route anything over the budget band for approval before booking.
- Respond with: missing details, recommended plan, policy notes, booking actions ready for approval, and drafted comms.
```

This works because it describes the outcome, hard boundaries, knowledge sources, tool purposes, and response
format. The planner can choose the path without you authoring topics or trigger phrases.

## Step by step

1. **Create the agent on the GitHub Copilot harness.** In Copilot Studio, create a new agent. On the
   **Build** tab, use the **instructions editor** for the agent brief and the **components panel** for
   knowledge, tools, and triggers.
2. **Write the instructions as the process owner.** Define the agent's role, tone, and boundaries: it plans
   internal events, keeps organisers inside policy, never confirms a room or catering order without approval,
   and never exceeds the budget band without routing for approval. Include the reasoning steps: collect event
   details, check policy, match room and catering options, draft comms, then prepare booking actions.
3. **Confirm generative orchestration is on.** The GitHub Copilot harness uses generative orchestration so the
   planner reads the organiser's intent, selects knowledge and tools, and runs a multi-step plan. Do not
   author trigger phrases for "event planning," "catering," or "room booking"; describe when each tool should
   be used in the instructions.
4. **Add the knowledge sources.** From the components panel, add the room/venue catalog, approved catering
   vendors, event policy, and approved comms templates. Test a grounding question such as "Which rooms can
   hold 40 people with Teams Room equipment?" and confirm the answer comes from your catalog.
5. **Add the booking and approval tools.** Add the Power Automate actions that reserve rooms, submit catering
   requests, route over-budget approvals, and draft the calendar invite. In the instructions, say the agent
   should call them only after showing the recommendation, estimated cost, policy notes, and organiser
   approval.
6. **Test the whole event request in the Test pane.** Ask for a real scenario, such as a 40-person offsite with
   AV, vegetarian catering, accessibility needs, and a fixed budget. Confirm the agent asks once for missing
   details, proposes approved options, flags budget issues, drafts comms, and waits before booking. Each test
   run consumes Copilot Credits.
7. **Break a step and confirm recovery.** Try an unapproved caterer, a room too small for the headcount, or a
   budget overrun. The agent should find another approved path or explain that approval is required rather
   than forcing the booking.
8. **Publish.** When the plans are reliable, publish the agent to the intended channel. Make sure the ops team
   owns the knowledge sources and the approval boundaries before inviting organisers to use it.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the
numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright
tool in `tooling/screenshots/`._

## Make it better

- Add RSVP tracking so the agent can revise headcount and catering counts before the event.
- Add vendor-availability checks so it recommends only rooms and caterers that can actually support the slot.
- Add an autonomous trigger for approved event request forms so the agent drafts the initial plan without an
  organiser starting from a blank prompt.
- Ask the agent to generate a post-event survey summary for the organiser after the event closes.

## Watch out for

- **Every action bills Copilot Credits, including build and test.** Set cost controls, limit broad pilots, and
  keep test scenarios deliberate before you publish widely.
- **Right-size the harness.** If your event process is a predictable single-path flow, use the
  [standard-harness version](studio-functional-events-coordination.md) instead; it is covered in Microsoft
  365 channels for licensed users.
- **Booking without a yes.** The agent can prepare the action, but the organiser must approve before a room or
  catering order is confirmed.
- **Silent budget overruns.** Over-band costs must surface the approval requirement before any booking action
  runs.
- **Stale approved lists.** Keep room capacity, vendor status, accessibility details, and templates owned by
  workplace/ops.

## Where this leads (the ramp)

This gets you from authored event topics to an agent that can reason through varied planning work with tools
and policy. When coordination spans many systems and the workflow needs pro-code orchestration, graduate the
same pattern into Foundry.

> **Next:** [Foundry: graduate a Studio agent](foundry-graduate-from-studio.md)

## Related

- [Standard-harness version](studio-functional-events-coordination.md)
- [Pick the engine for the job](../pick-the-engine.md)
- [Event Coordination Agent solution template](../solutions/event-coordination-agent.md)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)
- [Agents powered by the GitHub Copilot harness](https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview)
- [Copilot Studio documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)

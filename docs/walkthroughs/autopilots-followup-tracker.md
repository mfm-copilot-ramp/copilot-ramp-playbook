---
title: Track and chase your open follow-ups
description: Have Scout track what you owe and what others owe you across email and Teams, nudging you before follow-ups go stale.
stage: autopilots
roles: [end-user, manager, champion]
tags: [autopilots, scout, follow-ups, commitments, reminders, teams]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [m365-copilot-license, scout-access]
updated: 2026-08-29
---

# Track and chase your open follow-ups

> Equip Scout with a standing follow-up tracker that keeps commitments visible and nudges you before they go stale.

**Stage:** Autopilots · **For:** End user, Manager, Champion · **Level:** Intermediate · **Time:** 15 min

## When to use this
Follow-ups hide in meeting notes, email threads, and Teams chats, then resurface only when someone asks what happened. Use this when you want Scout to keep a standing list of what you owe and what others owe you, with nudges before commitments quietly age out.

Scout is Frontier private preview and gated. Keep it scoped to tracking, drafting, and reminding under your governed identity; you review anything that gets sent.

## What you'll need
- **M365 Copilot licence** and **Scout access** through the Frontier-gated private preview.
- Scout connected to the work surfaces where commitments appear, such as Outlook, Teams, calendar, OneDrive, and SharePoint where permitted.
- A definition of stale for your work: due dates, promised dates, unresolved asks, or silence after [time window].

## Try it now — the prompt
Equip the tracker as a standing follow-up skill:

```
Take on a standing "follow-up tracker" skill for me.

Watch my emails, Teams chats, meetings, and notes you can access for open
commitments:
- things I owe other people;
- things other people owe me;
- decisions or approvals waiting on someone.

Keep a running list with owner, due date or promised timing, source link,
current status, and next suggested nudge. Check it on [schedule] and alert me
when something is due soon, overdue, or has gone quiet for [time window].

Draft nudges when helpful, but do not send them without my review.
```

**Why this works:** it gives Scout the commitment types, source surfaces, refresh trigger, and action boundary. The skill keeps the list alive in the background while you decide which nudges are worth sending.

## Step by step
1. **Open Microsoft Scout** and confirm it can access the communication surfaces where your commitments usually appear.
2. **Equip the skill.** Paste the prompt, filling in your schedule and what "gone quiet" means.
3. **Review the first list.** Scout should group follow-ups by what you owe, what others owe you, and decisions waiting on someone, with source links for checking.
4. **Clean up false positives.** Tell Scout which phrases are real commitments and which are conversational noise, such as "let's consider" versus "I will send by [date]."
5. **Approve nudges deliberately.** Use Scout's drafts as a starting point, then adjust tone and context before anything leaves your name.
6. **Let the list persist.** Once calibrated, the tracker becomes your background commitment memory instead of another manual list to maintain.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Separate personal and team commitments.** "Keep my own actions separate from team-owned actions, and only nudge me directly for mine."
- **Add tone rules.** "Draft nudges that are polite, concise, and context-rich; never imply blame."
- **Prepare a meeting sweep.** "Before [recurring meeting], summarise open follow-ups tied to that group."
- **Carry items across weeks.** "Keep unresolved items on the list until I mark them closed or the source thread confirms closure."

## Watch out for
- **Commitments can be ambiguous.** Scout may mistake a suggestion for an action or miss an action stated vaguely; calibration matters.
- **Nudges still carry your voice.** Review tone and context before sending, especially to customers or leaders.
- **Not every channel is visible.** If work happens outside connected surfaces, the list will be incomplete unless you add it.
- **Preview capabilities can change.** Scout is gated private preview; check the [Microsoft Scout docs](https://learn.microsoft.com/en-us/microsoft-scout/) when behaviour differs.

## Where this leads (the ramp)
You've equipped Scout with an always-on commitment tracker that keeps personal follow-ups from going stale. When follow-ups need governed task creation, approvals, or system updates, harden the skill into a Stage 6 Studio tool.

> **Next:** [Stage 6 · Copilot Studio](../stages/stage-6-studio.md) — where follow-up tracking can become a governed workflow tool

## Related
- [Autopilots → Equip Scout with an always-on inbox-triage skill](../walkthroughs/autopilots-inbox-triage.md)
- [Autopilots → Have Scout watch your deliverables and flag risks](../walkthroughs/autopilots-track-deliverables.md)
- [Stage 5 · Autopilots](../stages/stage-5-autopilots.md)

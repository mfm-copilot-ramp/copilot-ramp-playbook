---
title: Build a prep pack for any external meeting
description: Cowork gathers attendee background, account context, open items, and talking points into a pre-meeting brief you can review.
stage: cowork
roles: [end-user, champion]
tags: [cowork, meetings, briefing, account, preparation]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [m365-copilot-license, cowork-access]
updated: 2026-08-29
---

# Build a prep pack for any external meeting

> Hand Cowork the meeting invite and source context, then review a practical prep pack with backgrounds, open items, and talking points.

**Stage:** Cowork · **For:** End user, Champion · **Level:** Intermediate · **Time:** 15 min

## When to use this
You are heading into an external meeting and the useful context is spread across the invite, recent emails, notes, account documents, and action trackers. Cowork helps by reading across those sources and assembling the brief you would otherwise build manually.

Use this when the meeting matters enough to prepare properly, but you need a fast first pass that surfaces what to know, what to ask, and what to avoid missing.

## What you'll need
- **M365 Copilot license** with **Cowork** access
- The meeting invite, attendee list, recent correspondence, account or project notes, open actions, and any relevant briefing documents
- Your judgement on relationship history, sensitivity, and which talking points are appropriate for the room

## Try it now — the prompt
Give Cowork the meeting context and the brief format:

```
Using [meeting invite], [recent emails or notes], [account context], and [open
items tracker], build a prep pack for my external meeting with [organisation or
attendees]. Include attendee background, relationship context, current priorities,
open items, likely questions, suggested talking points, risks to avoid, and a
short meeting objective. Cite sources for important facts and flag anything that
is uncertain or out of date.
```

**Why this works:** it frames meeting prep as a complete hand-off: gather context, organise it into a brief, and highlight the areas where your judgement is still required.

## Step by step
1. **Gather only relevant sources.** Include the invite, recent thread, account notes, and tracker items that will shape the conversation.
2. **Send the prompt to Cowork.** Cowork reads the material and returns a structured prep pack rather than a loose summary.
3. **Review the objective and talking points.** Make sure the meeting purpose is clear and the proposed points fit the relationship.
4. **Check sensitive or stale context.** Validate names, roles, dates, open commitments, and anything that could change the tone of the meeting.
5. **Ask for your final prep view.** For example:
   ```
   Condense this into a one-page brief I can read in five minutes, with the top
   open items, recommended questions, and a closing ask.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Use Cowork to prepare the surrounding workflow:
- **Practise the conversation.** "Role-play [attendee role] and ask the hardest questions they might raise."
- **Create the follow-up shell.** "Draft a follow-up email template with placeholders for decisions, owners, and actions."
- **Tune for the relationship.** "Make the talking points more consultative and less transactional."
- **Prepare a fallback.** "If the customer raises [risk], give me a calm response and the evidence to support it."

## Watch out for
- **People context can be sensitive.** Keep the brief professional and avoid using personal or irrelevant information.
- **Meeting history may be incomplete.** If Cowork cannot see a conversation or document, it cannot include that context.
- **A prep pack is not a script.** Use it to guide judgement, not to read talking points verbatim in a live meeting.

## Where this leads (the ramp)
When prep packs become a recurring need, the next step is an autopilot that watches upcoming meetings and prepares briefs before they land on your calendar. That is the shift into **Stage 5 · Autopilots**.

> **Next:** [Autopilots → Coordinate meetings](../walkthroughs/autopilots-coordinate-meetings.md)

## Related
- [Cowork → Build a customer health digest](../walkthroughs/cowork-customer-health-digest.md) — account context that can feed the brief
- [Cowork → Hand off an end-to-end task to Cowork](../walkthroughs/cowork-end-to-end-task.md) — the Stage 3 flagship
- [Stage 3 → Cowork](../stages/stage-3-cowork.md)

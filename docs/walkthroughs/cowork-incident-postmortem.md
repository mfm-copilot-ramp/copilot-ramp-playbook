---
title: Build an incident postmortem from Teams, tickets, and email
description: Point Copilot Cowork at your Teams war-room, ticket, and emails to reconstruct the timeline and get a blameless first-draft incident postmortem you edit.
stage: cowork
roles: [end-user, manager, champion, developer]
tags: [cowork, it, itsm, incident, postmortem, retrospective, multi-step, synthesis]
level: intermediate
time: 25 min
status: walkthrough
prereqs: [m365-copilot-license, cowork-access]
updated: 2026-06-05
---

# Build an incident postmortem from Teams, tickets, and email

> The hardest part of a postmortem is reconstructing what actually happened — the timeline is scattered
> across a Teams war-room, a ticket, and a tangle of emails. Point Cowork at all three and get a
> blameless first-draft postmortem you edit instead of assemble.

**Stage:** Cowork · **For:** End user, Manager, Champion, Developer · **Level:** Intermediate · **Time:** 25 min

## When to use this
After an incident, the evidence is everywhere: the play-by-play in a Teams channel, the official record in
a ticket, the stakeholder updates in email. Stitching that into a coherent timeline, root cause, and set
of action items is tedious, multi-source work — and it tends to slip because nobody has the afternoon.
That's precisely what **Cowork** can own: gather from every source, reconcile, and draft.

Use this in the day or two after an incident closes, while the trail is still warm.

## What you'll need
- **M365 Copilot license** with access to **Cowork**
- The incident's trail reachable by Copilot — the **Teams channel/chat**, the **ticket** (or an export/link
  Copilot can read), and the **email thread** of updates
- The **incident basics**: a name/ID, when it started and resolved, and who was involved
- *(Optional)* your org's **postmortem template** so the output matches the format reviewers expect

## Try it now — the prompt
Describe the whole reconstruction as one outcome:

```
Build a blameless postmortem for incident [name/ID]. Reconstruct from the Teams
channel "[name]", ticket [number], and the email thread "[subject]". Produce: a
timeline of key events with timestamps, the impact (who/what was affected and for how
long), the root cause as best the evidence shows it, what went well and what didn't,
and a list of action items with suggested owners. Keep it blameless — focus on systems
and process, not individuals. Save it to my files.
```

**Why this works:** you named the **three sources** (so it reconciles instead of guessing), the **exact
sections** a postmortem needs, and the **blameless framing** up front — which keeps the draft focused on
fixing the system rather than assigning fault.

## Step by step
1. **State the reconstruction.** Paste the task with your incident's sources. Cowork plans which channels,
   tickets, and threads it'll read before it starts.
2. **Let it reconcile the timeline.** It pulls events from each source and merges them into one ordered
   timeline — the step that normally costs you an hour of scrolling.
3. **Scrutinize the root cause and timeline.** This is where sources disagree. Check timestamps and the
   causal chain hardest; ask it to show where each event came from:
   ```
   For the timeline, cite which source each event came from, and flag anywhere the
   ticket and the Teams chat disagree on timing.
   ```
4. **Refine the action items.** Make them concrete and assignable:
   ```
   Rewrite the action items as specific, testable changes with a suggested owner and
   a "how we'll know it's fixed" for each.
   ```
5. **Produce the share-out.** "Draft a one-paragraph summary for leadership and a short message for the
   team channel announcing the postmortem is ready."

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Turn a one-off into a reliable practice:
- **Standardize it.** Feed Cowork your postmortem template so every incident write-up has the same shape
  and is easy to compare over time.
- **Roll it up.** "From my last six postmortems, what root-cause themes repeat, and what's the one fix that
  would prevent the most incidents?"
- **Make it routine.** Champions: capture this as a reusable Cowork recipe so any responder can run it,
  not just the one person who knows how.

> **📚 Learn more.** Process-level delegation like this is the spirit of the community
> [Cowork Cookbook](https://coworkcookbook.com/) by Sean Galliher _(unofficial)_. For Cowork's place in the
> product, see the [M365 Copilot resources hub](https://aka.ms/m365copilot/resources).

## Watch out for
- **Blameless is a choice you enforce.** Even with the instruction, review the draft for language that
  fingers individuals and soften it. The goal is a better system, not a verdict.
- **The root cause is a hypothesis, not a ruling.** Cowork infers from the evidence it can see — confirm it
  with the people who were there before it's official.
- **Mind what's out of reach.** Decisions made on a call or in a tool Copilot can't read won't surface. Add
  those yourself so the timeline isn't misleading.

## Where this leads (the ramp)
You just reconciled three messy sources into one trustworthy document. If your team runs postmortems
often, the next step is to stop describing the process each time — **Stage 4 · Agent Builder** lets you
package the sources, the format, and the blameless rules into an agent anyone can run.

> **Next:** [Agent Builder → Build a team-knowledge agent over a SharePoint site](../walkthroughs/agent-builder-team-knowledge.md)

## Related
- [Synthesize many documents into one brief](../walkthroughs/cowork-multi-doc-synthesis.md) — the general multi-source pattern
- [Hand off an end-to-end task to Cowork](../walkthroughs/cowork-end-to-end-task.md)
- Stage 3 Resources: see `RESOURCES.md` → Cowork

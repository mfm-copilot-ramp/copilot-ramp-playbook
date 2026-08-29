---
title: Build a content calendar from a brief
description: Cowork turns a campaign brief into a dated content calendar with channels, themes, owners, and draft hooks for review.
stage: cowork
roles: [end-user, champion]
tags: [cowork, content, calendar, campaign, planning]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [m365-copilot-license, cowork-access]
updated: 2026-08-29
---

# Build a content calendar from a brief

> Give Cowork a campaign brief and get back a dated content calendar with channels, themes, hooks, and review notes you can refine.

**Stage:** Cowork · **For:** End user, Champion · **Level:** Intermediate · **Time:** 15 min

## When to use this
You have a campaign brief, launch theme, or programme announcement, and you need to turn it into a practical publishing plan. Cowork helps when the work involves interpreting goals, spreading messages across channels, sequencing dates, and drafting starter hooks for review.

Use this when you want a useful calendar skeleton quickly, with enough rationale that stakeholders can approve or adjust it.

## What you'll need
- **M365 Copilot license** with **Cowork** access
- A campaign brief, audience notes, key dates, channel guidance, and any brand or messaging constraints
- A reviewer who can approve timing, audience fit, and claims before anything is scheduled or published

## Try it now — the prompt
Give Cowork the brief and the planning rules:

```
Using [campaign brief], [key dates], and [channel guidance], build a content
calendar for [time period] aimed at [audience]. For each entry include date,
channel, theme, draft hook, asset needed, owner placeholder, and review notes.
Sequence the calendar so the story builds over time, reuse ideas without sounding
repetitive, and flag any claims or dates that need confirmation.
```

**Why this works:** it asks Cowork to plan the sequence, not just generate isolated posts, and it makes review needs visible before the calendar becomes work for other people.

## Step by step
1. **Start with the brief and constraints.** Include audience, goals, key dates, channel mix, tone, and anything that must not be said.
2. **Send the prompt to Cowork.** Cowork reads the brief, turns the themes into a timed plan, and drafts hooks for each channel.
3. **Review the arc.** Check whether the calendar builds awareness, proof, and action in the right order for your audience.
4. **Check operational reality.** Confirm owners, asset needs, review dates, and dependencies before promising the plan to stakeholders.
5. **Ask for a stakeholder version.** For example:
   ```
   Convert this into a stakeholder review table with rationale for each theme,
   open questions, and decisions needed before scheduling.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Make the calendar easier to approve and execute:
- **Tune the voice.** "Rewrite the hooks in a more [tone] voice while keeping the same sequence."
- **Add measurement.** "Add a success signal for each entry, such as click, reply, attendance, or internal share."
- **Reduce load.** "Identify which entries can reuse the same source asset without feeling duplicated."
- **Prepare approvals.** "List the legal, brand, and stakeholder checks needed before publication."

## Watch out for
- **Cowork does not know your approval rules by default.** Add brand, legal, and channel constraints explicitly.
- **A full calendar can hide weak hooks.** Review the actual audience value of each entry, not just the date grid.
- **Dates need validation.** Launch dates, embargoes, and event timing should come from an authoritative source.

## Where this leads (the ramp)
Once Cowork can build the calendar from a brief, you may want an agent that watches briefs, launch dates, and review feedback to keep the plan current. That is a fit for **Stage 5 · Autopilots**.

> **Next:** [Autopilots → Track deliverables across workstreams](../walkthroughs/autopilots-track-deliverables.md)

## Related
- [Cowork → Build a market research brief](../walkthroughs/cowork-market-research-brief.md) — source material for campaign planning
- [Cowork → Build a deck from raw notes](../walkthroughs/cowork-deck-from-notes.md) — a companion presentation workflow
- [Stage 3 → Cowork](../stages/stage-3-cowork.md)

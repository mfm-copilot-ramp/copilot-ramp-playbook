---
title: Assemble a monthly business review
description: Cowork turns source metrics, highlights, risks, and next steps into a monthly business review pack you can present and refine.
stage: cowork
roles: [end-user, champion]
tags: [cowork, reporting, metrics, synthesis, review]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [m365-copilot-license, cowork-access]
updated: 2026-08-29
---

# Assemble a monthly business review

> Hand Cowork the source material for your month and get back a coherent MBR pack — metrics, highlights, risks, and next steps — ready for your review.

**Stage:** Cowork · **For:** End user, Champion · **Level:** Intermediate · **Time:** 15 min

## When to use this
You have metrics exports, status notes, customer updates, and action lists scattered across files, and you need one business review that tells the story of the month. Cowork is useful here because the job is not one prompt; it is reading, sorting, connecting evidence, and assembling a presentable pack for you to judge.

Use this when the meeting is close enough that starting from a blank deck or document would slow you down, but the source material is good enough for Cowork to organise into a first pass.

## What you'll need
- **M365 Copilot license** with **Cowork** access
- Source material for the review: metric snapshots, weekly summaries, project notes, risks, decisions, and customer or stakeholder updates
- A clear audience and decision context, so Cowork knows whether to optimise for executives, operators, or account teams

## Try it now — the prompt
Give Cowork the sources and the review format you want back:

```
Using [monthly metrics file], [status notes], and [risk/action tracker], assemble a
monthly business review for [audience]. Create an executive summary, key metrics,
wins, misses, risks, decisions needed, and next steps. Cite which source each
important claim came from, flag gaps or stale information, and give me a version I
can turn into a deck or briefing document.
```

**Why this works:** it gives Cowork the full assignment, not just a summary request. It defines the sections, asks for traceability, and makes uncertainty visible before you present.

## Step by step
1. **Collect the month into a small source set.** Use the few files that actually matter: the latest metrics, status notes, decision log, and any risk tracker.
2. **Hand Cowork the sources and send the prompt.** Cowork reads across the material, groups the facts, and drafts the MBR structure.
3. **Review the executive summary first.** Check whether the story of the month is right before polishing charts, wording, or slide order.
4. **Check evidence and gaps.** Follow Cowork's source notes, correct any stale metrics, and fill in anything it flagged as missing.
5. **Ask for the presentation-ready version.** For example:
   ```
   Turn this into a leadership-ready outline with slide titles, speaker notes,
   and a final page for decisions and owners.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
One hand-off can become the whole review workflow:
- **Ask for a sharper story.** "Rewrite the summary around the three changes that matter most to [audience]."
- **Create a risk view.** "Turn the open issues into a risk / impact / mitigation table and prioritise by business impact."
- **Prepare for questions.** "List likely questions from [audience] and the evidence I should have ready."
- **Make the follow-up usable.** "Draft the post-meeting email with decisions, owners, and due dates."

## Watch out for
- **Bad source hygiene becomes bad output.** If the metrics file is stale or the tracker is incomplete, Cowork can make the pack look more certain than it is.
- **Trends need human judgement.** Cowork can compare numbers and notes, but you decide what is meaningful versus noise.
- **Executive summaries can over-smooth risk.** Read the risk section carefully and make sure uncomfortable issues are not softened away.

## Where this leads (the ramp)
Once Cowork can assemble the MBR from your sources, the natural next step is an always-on agent that watches the same inputs and prepares the pack before you ask. That is a move from one-off delegation to **Stage 5 · Autopilots**.

> **Next:** [Autopilots → Track deliverables across workstreams](../walkthroughs/autopilots-track-deliverables.md)

## Related
- [Cowork → Prepare a QBR cycle](../walkthroughs/cowork-qbr-prep-cycle.md) — a broader review rhythm
- [Cowork → Create a recurring weekly digest](../walkthroughs/cowork-recurring-weekly-digest.md) — the weekly version that feeds this
- [Stage 3 → Cowork](../stages/stage-3-cowork.md)

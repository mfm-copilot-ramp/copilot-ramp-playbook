---
title: Score vendors against your criteria
description: Cowork compares vendor materials against your weighted criteria and drafts a scorecard, recommendation, and risks to review.
stage: cowork
roles: [end-user, champion]
tags: [cowork, vendor, evaluation, procurement, scorecard]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [m365-copilot-license, cowork-access]
updated: 2026-08-29
---

# Score vendors against your criteria

> Hand Cowork vendor materials and your evaluation criteria, then review a weighted scorecard with rationale, risks, and a recommendation narrative.

**Stage:** Cowork · **For:** End user, Champion · **Level:** Intermediate · **Time:** 15 min

## When to use this
You have vendor decks, proposals, security notes, pricing summaries, or product pages, and you need a fair comparison against your own criteria. Cowork is useful because the job requires extracting evidence, applying weights, spotting gaps, and drafting a recommendation that humans can challenge.

Use this for a first-pass evaluation before a decision meeting, not as a substitute for procurement, legal, security, or technical review.

## What you'll need
- **M365 Copilot license** with **Cowork** access
- Vendor materials for each option, plus your evaluation criteria, weights, must-have requirements, and decision context
- Someone accountable for validating evidence, scoring assumptions, and any procurement or compliance constraints

## Try it now — the prompt
Give Cowork the vendor evidence and scoring rules:

```
Using [vendor materials] and [evaluation criteria], build a weighted vendor
scorecard for [decision]. Apply the weights in [criteria file], score each vendor
only where evidence is present, explain the rationale for each score, flag missing
or weak evidence, and draft a recommendation narrative with risks, trade-offs,
and follow-up questions for each vendor.
```

**Why this works:** it keeps Cowork anchored to your criteria, requires evidence for scores, and separates recommendation logic from the unanswered questions a human needs to resolve.

## Step by step
1. **Define the criteria before comparing vendors.** Include weights, must-haves, deal-breakers, and any stakeholder priorities.
2. **Send Cowork the materials and prompt.** Cowork extracts evidence from each source, applies the criteria, and builds the scorecard.
3. **Review missing evidence first.** A blank or low-confidence cell can be more important than a high score because it shows where the decision is under-supported.
4. **Challenge the recommendation.** Check whether the narrative follows the scores and whether any must-have requirement was overlooked.
5. **Ask for the decision-meeting version.** For example:
   ```
   Turn this into a decision brief with the top trade-offs, the recommended
   vendor, dissenting concerns, and questions to send back before final approval.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Use follow-up prompts to make the evaluation more defensible:
- **Stress-test the weights.** "Show how the recommendation changes if [criterion] is weighted higher."
- **Separate facts from judgement.** "Split the scorecard into evidence quoted from sources and interpretation based on that evidence."
- **Prepare vendor follow-up.** "Draft concise clarification questions for each vendor where evidence is missing or weak."
- **Summarise for approvers.** "Write a one-page decision memo for [approver group] with the recommendation and risks."

## Watch out for
- **Vendor material is marketing material.** Cowork can compare what vendors provided, but absence of evidence is not proof a capability does not exist.
- **Weights encode politics.** Make sure stakeholders agree on the criteria before you treat the score as meaningful.
- **Compliance checks stay human-owned.** Security, privacy, procurement, and legal reviews need authoritative processes, not just a Cowork summary.

## Where this leads (the ramp)
If vendor scoring becomes repeatable, the next step is to equip the pattern onto an agent that watches for new materials, keeps evidence current, and prepares review briefs. That is a **Stage 5 · Autopilots** move.

> **Next:** [Autopilots → Track deliverables across workstreams](../walkthroughs/autopilots-track-deliverables.md)

## Related
- [Cowork → Build a competitive comparison](../walkthroughs/cowork-competitive-comparison.md) — a similar comparison pattern
- [Cowork → Synthesize multiple documents](../walkthroughs/cowork-multi-doc-synthesis.md) — the evidence-gathering foundation
- [Stage 3 → Cowork](../stages/stage-3-cowork.md)

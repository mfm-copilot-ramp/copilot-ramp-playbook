---
title: Turn source material into a training curriculum
description: Hand Cowork source docs to build a modular curriculum with objectives, lessons, exercises, and knowledge checks for each module.
stage: cowork
roles: [end-user, manager, champion]
tags: [cowork, training, curriculum, enablement]
level: intermediate
time: 20 min
status: walkthrough
prereqs: [m365-copilot-license, cowork-access]
updated: 2026-08-29
---

# Turn source material into a training curriculum

> Hand Cowork your source material and get back a modular curriculum with lessons, exercises, and checks for understanding.

**Stage:** Cowork · **For:** End user, Manager, Champion · **Level:** Intermediate · **Time:** 20 min

## When to use this
You have product docs, process notes, policies, recordings, or existing slides, and you need to turn them into teachable material for a specific audience. Cowork can read across the sources, group the material into modules, draft learning objectives, and create exercises and knowledge checks you can review.

Use this when the hard part is instructional structure, not just summarising source docs.

## What you'll need
- **M365 Copilot license** with **Cowork** access
- Source documents, recordings, pages, or slide decks that contain the material to teach
- A defined learner audience, skill level, delivery format, and available time

## Try it now — the prompt
Give Cowork the source material and the learner context:

```
Using the attached [source docs/slides/transcript], create a modular training
curriculum for [learner audience] at [skill level].

Design the curriculum for [delivery format] over [available time]. For each
module, include:
1. Learning objectives
2. Key concepts to teach
3. Lesson outline
4. Hands-on exercise or discussion activity
5. Knowledge check with answers
6. Materials or references needed

Also include a facilitator overview, prerequisites, and a short assessment plan.
Flag any source material that is unclear, outdated, or not suitable for learners.
```

**Why this works:** it gives Cowork the instructional design job end to end: organise, sequence, teach, practise, and check. The prompt also makes it surface weak source material before it becomes weak training.

## Step by step
1. **Prepare the source set.** Include the most current docs and remove duplicates or obsolete files when you can.
2. **Define the learner.** Tell Cowork who the curriculum is for, what they already know, and what they should be able to do afterwards.
3. **Hand off the curriculum task.** Attach the sources, paste the prompt, and specify the delivery format, such as workshop, self-paced course, or manager-led session.
4. **Review the module sequence.** Check that the order builds from foundations to application and that modules are not too large.
5. **Inspect the exercises and knowledge checks.** Make sure learners practise realistic tasks and that answer keys are grounded in the source material.
6. **Ask for a facilitator-ready revision:**
   ```
   Revise this into a facilitator guide with timings, transition notes, exercise
   instructions, and a learner handout summary for each module.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Create learner materials.** "Draft a participant workbook with exercises, reflection prompts, and space for notes."
- **Adapt for another format.** "Convert this live workshop into a self-paced curriculum with short modules and checkpoints."
- **Add practice scenarios.** "Create role-based scenarios for [sales / support / managers / technical users]."
- **Tighten the assessment.** "Create a knowledge check that tests application, not memorisation."

## Watch out for
- **Source docs are not always teachable.** Cowork can structure them, but you still need to decide what learners must actually do.
- **Knowledge checks can be too easy.** Ask for scenario-based questions when the goal is behaviour change.
- **Timing estimates are guesses.** Pilot the curriculum or review it with a facilitator before scheduling.
- **Accessibility matters.** Review exercises, language, and materials so learners with different needs can participate.

## Where this leads (the ramp)
When the curriculum needs to stay current as source material changes, the next step is a governed tool that can refresh modules and maintain standards. That is a good fit for **Stage 6 · Studio**.

> **Next:** [Stage 6 · Studio](../stages/stage-6-studio.md)

## Related
- [First-party agents → Learning agent](first-party-learning-agent.md)
- [Cowork → Build a content calendar from scattered inputs](cowork-content-calendar.md)
- [Stage 3 · Cowork](../stages/stage-3-cowork.md)

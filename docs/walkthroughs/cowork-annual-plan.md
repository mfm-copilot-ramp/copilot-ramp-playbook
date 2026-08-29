---
title: Draft an annual plan and OKRs
description: Hand Cowork last year's results and strategy inputs to draft an annual plan with OKRs, initiatives, owners, and review notes.
stage: cowork
roles: [manager, champion]
tags: [cowork, planning, okrs, strategy]
level: intermediate
time: 20 min
status: walkthrough
prereqs: [m365-copilot-license, cowork-access]
updated: 2026-08-29
---

# Draft an annual plan and OKRs

> Turn last year's results and this year's strategy inputs into a structured annual plan you can refine with your leadership team.

**Stage:** Cowork · **For:** Manager, Champion · **Level:** Intermediate · **Time:** 20 min

## When to use this
You are moving from strategy inputs to an annual operating plan, and the useful material is scattered across last year's scorecard, planning notes, customer signals, and leadership priorities. Cowork can read the package, propose objectives, draft measurable key results, and organise initiatives so you start from a coherent v1 instead of a blank planning doc.

Use this when you want a plan you can challenge, edit, and socialise — not a final answer you accept without judgment.

## What you'll need
- **M365 Copilot license** with **Cowork** access
- Last year's results, strategy inputs, planning assumptions, and any known constraints
- A team, function, or business scope clear enough for Cowork to make trade-offs

## Try it now — the prompt
Give Cowork the source package and the planning shape you want back:

```
Using the attached [last-year results], [strategy memo], and [planning notes],
draft an annual plan for [team/function] for [planning year].

Create:
1. A short executive summary
2. 3-5 objectives, each with 2-4 measurable key results
3. The major initiatives that support each objective
4. Suggested owners or accountable roles, based only on the source material
5. Dependencies, risks, and decisions needed from leadership

Call out any assumptions you made, any conflicting inputs you found, and the
sections I should review first.
```

**Why this works:** it gives Cowork the whole planning assignment, not just an OKR-writing prompt. It also asks for assumptions and conflicts, which turns the output into a reviewable draft rather than a polished-looking guess.

## Step by step
1. **Gather the planning inputs.** Include performance results, customer or employee themes, financial constraints, strategic priorities, and any leadership direction you already have.
2. **Hand off the full task to Cowork.** Attach or point to the source material, paste the prompt, and name the team or function clearly.
3. **Review the objective set first.** Check whether the objectives are distinct, strategic, and few enough to guide decisions. Ask Cowork to merge or sharpen any overlap before editing details.
4. **Test the key results.** Look for measurable outcomes rather than activities. If a key result reads like a task, ask Cowork to turn it into an outcome with a baseline, target, and owner.
5. **Pressure-test the initiative map.** Confirm each initiative supports a clear objective and that dependencies or leadership decisions are not buried.
6. **Ask for a tighter revision:**
   ```
   Revise the plan so each key result has a clear metric, baseline, target, and
   review cadence. Flag any initiative that does not directly support an objective.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Add a trade-off pass.** "Identify the initiatives we should stop, defer, or combine if capacity is constrained."
- **Create the review version.** "Turn this into a one-page leadership readout with decisions needed and open risks."
- **Personalise by audience.** "Rewrite the plan for [exec audience / team leads / cross-functional partners] and adjust the level of detail."
- **Build the operating rhythm.** "Create a quarterly review agenda and scorecard template for tracking these OKRs."

## Watch out for
- **OKRs are easy to make too broad.** Cowork can produce objectives that sound strategic but do not force choices. Push for clearer trade-offs.
- **Measures need source grounding.** If the baseline or target is not in the inputs, treat it as a placeholder until you verify it.
- **Ownership can be inferred too confidently.** Ask Cowork to separate named owners from suggested accountable roles.
- **Annual plans expose missing decisions.** Use the gaps Cowork flags as leadership questions, not as defects in the draft.

## Where this leads (the ramp)
Once the annual plan becomes a recurring operating rhythm, the next move is an always-on agent that watches signals, reminds owners, and prepares review packs. That is the shift from a Cowork hand-off to **Stage 5 · Autopilots**.

> **Next:** [Stage 5 · Autopilots](../stages/stage-5-autopilots.md)

## Related
- [Cowork → Hand off an end-to-end task to Cowork](cowork-end-to-end-task.md) — the Stage 3 flagship
- [Chat → Build a first-draft project plan](chat-project-plan.md) — a lighter planning starting point
- [Stage 3 · Cowork](../stages/stage-3-cowork.md)

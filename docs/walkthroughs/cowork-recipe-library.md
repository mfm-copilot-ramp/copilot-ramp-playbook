---
title: Build a "Cowork recipe" library for your org
description: Capture a great one-off Copilot Cowork task as a reusable recipe so the whole team can rerun one person's best workflow on demand instead of losing it.
stage: cowork
roles: [champion]
tags: [cowork, champion-kit, recipes, reusable, scale, library]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [m365-copilot-license, cowork-access]
updated: 2026-06-03
---

# Build a "Cowork recipe" library for your org

> A great Cowork task someone ran once dies with them. Captured as a reusable recipe,
> it becomes something the whole team reruns on demand — multiplying one person's best workflow across
> everyone.

**Stage:** Cowork · **For:** Champion · **Level:** Intermediate · **Time:** 15 min

## When to use this
Someone on your team figured out the perfect Cowork hand-off — "pull last month's support emails, theme
them, draft a top-5 deck" — and it saved them half a day. Right now that knowledge lives in one person's
head. **A Cowork recipe library** captures these multi-step task descriptions as reusable, documented
recipes the whole team can rerun. It's the difference between a clever one-off and an organizational
capability — the exact move that made Sean Galliher's Cowork Cookbook so useful.

This is a champion's scaling play: you're not doing the work, you're packaging the best workflows so
everyone runs them without reinventing the prompt.

## What you'll need
- **M365 Copilot license** with **Cowork** access across the team
- A few **proven tasks worth capturing** — workflows people already run and would rerun
- A home for the library — a SharePoint page, a Teams tab, or a simple shared doc

## Try it now — the prompt
Turn a known workflow into a documented, reusable recipe:

```
Draft 5 reusable Cowork task descriptions for a [finance] team. For each, give
it a clear name, the exact task description to paste, the inputs it needs, and
the deliverable it produces — so anyone on the team can rerun it cold.
```

**Why this works:** a recipe needs four things to be rerunnable by someone who didn't write it — a
**name**, the **paste-ready description**, the **required inputs**, and the **expected output**. Asking for
all four turns a vague "Cowork can do X" into a recipe a teammate can run without you in the room.

## Step by step
1. **Harvest the proven workflows first.** Start from tasks people already run successfully — a recipe
   nobody asked for gathers dust. Mine your team's actual wins.
2. **Write each as a four-part recipe.** Name, paste-ready description, inputs, deliverable. The inputs
   line is what people skip — and it's what makes a recipe reliably rerunnable.
3. **Put it where the team works.** A SharePoint page or Teams tab they can browse and copy from. A library
   nobody can find is a library nobody uses.
4. **Keep it alive with a contribution loop:**
   ```
   Draft a short message inviting the team to submit their best Cowork workflow,
   with the four fields each recipe needs, so the library grows itself.
   ```

## Screenshots

Captured live in Microsoft 365 Copilot (Work mode). The product UI moves fast — if what you see differs, trust the numbered steps above, which we keep current.

![Prompt asking Copilot to draft five reusable Cowork task recipes for a finance team](../screenshots/cowork-recipe-library/01-recipe-prompt.png)
**Ask Copilot to draft reusable, paste-ready task recipes for a whole team.**

![A finance recipe with a clear name, paste-ready task description, and the inputs it needs](../screenshots/cowork-recipe-library/02-recipes-response.png)
**Each recipe comes back with the four parts that make it rerunnable cold — a clear name, the exact task description to paste, the inputs it needs, and the deliverable it produces.**

## Make it better
A recipe library is a living asset, not a one-time doc:
- **Stand on Sean's shoulders.** Rather than rebuild from zero, point your team at the Cowork Cookbook's
  process-based recipes and adapt the ones that fit — then add the ones unique to your org.
- **Tag by role and process.** "Finance · month-end," "Support · weekly themes." Findability is what turns
  a library into a habit.
- **Promote the heavy hitters.** The recipe everyone reruns is a candidate to graduate into a *scheduled*
  Cowork task — or, later, a purpose-built agent. The library is your backlog for what to build next.

> **📚 Learn more.** [Sean Galliher's Cowork Cookbook](https://coworkcookbook.com/) (community, unofficial)
> is the model for a process-based recipe library — link your team to it and adapt — and the
> [M365 Copilot resources hub (CAT)](https://aka.ms/m365copilot/resources) collects Microsoft guidance on
> getting the most from the broader Copilot experience.

## Watch out for
- **Recipes rot.** Tools, sources, and team processes drift. A recipe that worked in Q1 may mislead by Q3 —
  assign owners and a review cadence, or the library quietly becomes wrong.
- **Inputs are the failure point.** Most "it didn't work for me" reports trace to a missing or
  misunderstood input. Document inputs ruthlessly; that's where reusability lives or dies.
- **Don't over-curate.** A perfectly governed library nobody contributes to beats a messy one everyone
  uses — never. Bias toward growth and tidy as you go.

## Where this leads (the ramp)
A captured recipe is a **[Cowork skill](../skills.md)** — a reusable capability the whole team can rerun,
not a one-off. And a recipe you rerun constantly is begging to become something you don't have to rerun at all. Once a Cowork
workflow is stable and repeated, the next move is to *build* it — an agent that owns the job instead of a
task you keep kicking off. That's **Stage 4 · Agent Builder**: your first declarative agent.

> **Next:** [Agent Builder → Build a "team knowledge" agent over a SharePoint site](../walkthroughs/agent-builder-team-knowledge.md)

## Related
- [Cowork → Hand off an end-to-end task to Cowork](../walkthroughs/cowork-end-to-end-task.md) — the flagship task worth capturing
- [Cowork → Stand up a recurring weekly digest](../walkthroughs/cowork-recurring-weekly-digest.md) — where a heavy-hitter recipe graduates to scheduled
- Stage 3 Resources: see `RESOURCES.md` → Cowork

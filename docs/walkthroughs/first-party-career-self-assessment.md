---
title: Draft a self-assessment with the Career agent
description: Point the Career agent at your year's work and get a first-draft self-assessment of accomplishments, impact, and growth that you edit instead of author.
stage: first-party
roles: [end-user, manager]
tags: [first-party, career, performance, self-assessment, review, growth, people]
level: starter
time: 15 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-06-05
---

# Draft a self-assessment with the Career agent

> Review season doesn't have to mean staring at a blank box trying to remember what you did in March.
> Point the Career agent at your year's work and get a first-draft self-assessment — accomplishments,
> impact, and growth — that you edit instead of author.

**Stage:** First-Party Agents · **For:** End user, Manager · **Level:** Starter · **Time:** 15 min

**Status:** Check current status — this agent isn't individually listed on the [Agents in Microsoft 365 roster](https://adoption.microsoft.com/en-us/ai-agents/agents-in-microsoft-365/); confirm availability there before assuming it's GA.

## When to use this
It's review time and the hardest part is remembering. Real impact from eight months ago has evaporated
from memory, and the blank self-assessment form is doing you no favors. The **Career agent** is a newer
first-party capability designed to help you reflect and grow — and one of its most practical uses is
turning the trail of your work into a structured, honest self-assessment draft you can refine.

Use it when you'd rather *edit* a thoughtful first draft than *write* one from nothing.

## What you'll need
- **M365 Copilot license** with the **Career** capability enabled in your org (it draws on your Microsoft
  365 activity and anything you tell it)
- Your **goals or review template** for the period, if you have one
- A few pointers to your year — key projects, wins, and a couple of things that didn't go to plan

## Try it now — the prompt
Open the Career agent and give it the shape of the review plus the highlights it can't infer:

```
Help me draft my self-assessment for this review period. My goals were [paste or
summarize]. Major things I worked on: [list 4–6 projects/outcomes]. For each, capture
what I did, the impact (with numbers where you can), and what I learned. Then add a
short "areas I'm growing in" section that's honest, not self-critical. Match the tone
to a professional performance review.
```

**Why this works:** the agent can surface activity, but *you* know which work mattered. Feeding it your
**goals**, the **handful of outcomes** that count, and asking for **impact + learning** per item produces a
draft that sounds like you and stands up in a review — instead of a generic activity dump.

## Step by step
1. **Open the Career agent.** Find it in the Microsoft 365 Copilot app or your Viva growth experience,
   wherever your org surfaced career tools.
2. **Give it your goals and your highlights.** Paste the review template or your goals, and list the
   projects that defined your period. The agent organizes and expands; you supply the judgment of what
   mattered.
3. **Read the draft critically.** Check that the impact statements are *true and specific* — replace any
   vague claim with a real number or example. This is the step that makes a self-assessment credible.
4. **Refine the framing:**
   ```
   Make the impact statements more concrete, tie each accomplishment back to one of
   my goals, and soften the "areas I'm growing in" so it reads as forward-looking.
   ```
   The agent reshapes it; you keep ownership of every claim.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
A draft is the floor, not the ceiling:
- **Pull the evidence.** "For each accomplishment, suggest where I'd find proof — a doc, a metric, a thread — to back it up."
- **Prep for the conversation.** "Turn this into three talking points for my review meeting and two questions to ask about my growth."
- **Write the manager version.** Managers: "Draft a balanced summary of this person's period from these inputs, ready for me to edit."

> **📚 Learn more.** The [Agents in Microsoft 365 hub](https://adoption.microsoft.com/en-us/ai-agents/agents-in-microsoft-365/)
> describes the growth and career capabilities, and [Microsoft Viva](https://learn.microsoft.com/en-us/viva/)
> documents how Copilot supports employee growth across Microsoft 365.

## Watch out for
- **Every claim is yours to verify.** The agent drafts; you own accuracy. Never submit an impact statement
  you can't back up — overstated numbers are worse than none.
- **It can't read what it can't see.** Work outside Microsoft 365, or done verbally, won't surface — feed
  those in yourself.
- **Availability varies.** The Career capability depends on your org's configuration. If you don't see it,
  the same structured prompt works in Copilot Chat with your inputs.

## Where this leads (the ramp)
You've now used first-party agents to brief, refine, plan, and reflect. The natural next question is bigger:
*can Copilot run a whole multi-step task for me, end to end?* That's **Stage 3 · Cowork**.

> **Next:** [Cowork → Hand off an end-to-end task to Cowork](../walkthroughs/cowork-end-to-end-task.md)

## Related
- [Find a stretch assignment with the Skills agent](../walkthroughs/first-party-skills-stretch-assignment.md) — the forward-looking companion
- [The agents included in your M365 Copilot license](../walkthroughs/first-party-agents-overview.md) — the full roster
- Stage 2 Resources: see `RESOURCES.md` → First-Party Agents

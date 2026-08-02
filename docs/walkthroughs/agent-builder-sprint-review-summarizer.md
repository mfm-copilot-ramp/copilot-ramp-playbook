---
title: Build a sprint-review summarizer for your Friday demo
description: Build a no-code agent that turns your Friday sprint review into a clean summary of what shipped, what's next, and what's blocked, sent in one click.
stage: agent-builder
roles: [maker, end-user, developer]
tags: [agent-builder, declarative-agent, sprint-review, standup, summary, recurring, personal, no-code]
level: intermediate
time: 20 min
status: walkthrough
prereqs: [m365-copilot-license, agent-builder-access]
updated: 2026-06-05
---

# Build a sprint-review summarizer for your Friday demo

> Every Friday demo ends the same way: great discussion, then nobody writes it up. Build a no-code agent
> that turns the sprint-review meeting into a clean summary — what shipped, what's next, what's blocked —
> that you fire off in one click instead of dreading.

**Stage:** Agent Builder · **For:** Maker, End user, Developer · **Level:** Intermediate · **Time:** 20 min

## When to use this
Sprint reviews generate exactly the kind of summary people want and nobody writes: demoed items,
decisions, follow-ups, blockers. The inputs are consistent every week — the meeting recap, the demo notes,
maybe the board. That repeatability is the signal you've outgrown one-off delegation and should **build an
agent**: give it the format once, and turn every Friday's raw material into the same tidy write-up.

Use this when your team's sprint reviews are valuable in the room but evaporate the moment they end.

## What you'll need
- **M365 Copilot license** with **Agent Builder** (Copilot → Create an agent)
- A consistent input the agent can ground on — your **sprint-review meeting recap/transcript**, a
  **Teams channel**, or a **notes doc** in OneDrive/SharePoint
- A clear idea of the **summary format** your team wants (sections, audience, length)
- 20 minutes and the four ingredients: name, instructions, knowledge source, starter prompts

## Try it now — the build
In the Agent Builder conversation, describe the summarizer and lock the format:

```
Create an agent called "Sprint Recap" that turns our Friday sprint-review meeting into
a summary. Ground it on [the meeting recap / Teams channel / notes doc]. Output the
same structure every time: (1) Shipped this sprint — what was demoed, one line each;
(2) Decisions made; (3) Next sprint focus; (4) Blockers and risks, with an owner where
one was named. Keep it skimmable, plain language, no jargon. Pull only from the
meeting — if something wasn't discussed, leave it out rather than inventing it.
```

**Why this works:** it sets the **knowledge boundary** (the sprint review, not everything), fixes a
**consistent four-section format** so every week is comparable, sets the **tone** (skimmable, plain), and
adds the **no-invention rule**. A locked format is what makes a recurring summarizer genuinely useful —
people learn where to look.

## Step by step
1. **Open Agent Builder.** In M365 Copilot, choose **Create an agent**. Build by chatting or use the
   **Configure** fields.
2. **Add the knowledge source.** Point it at the **meeting recap, Teams channel, or notes doc** your
   sprint review produces each week.
3. **Write the instructions** (the prompt above, adapted). The fixed four sections and "only from the
   meeting" rule are what keep every recap consistent and honest.
4. **Add starter prompts** matching the weekly job: "Summarize this week's sprint review", "What did we
   commit to next sprint?", "List the blockers with owners."
5. **Test in the preview pane.** Feed it a real (or recent) sprint-review recap. Check the format holds and
   nothing is invented — then tune the section wording to match what your team wants.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Take it from summary to communication:
- **Write the share-out.** "Also draft a short Teams message announcing the recap, leading with what shipped."
- **Tailor by audience.** "Give me a one-line exec version and a detailed engineering version."
- **Trend it.** "Compare this sprint's blockers to last sprint's — what keeps recurring?"
- **Share the agent.** Once the format's right, share it with your team so anyone can generate the recap —
  it stops depending on you being there.

> **📚 Learn more.** Browse Microsoft's [Agent Library](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/agent-library-overview)
> for templates, and watch [April's AI Agents Academy](https://www.youtube.com/playlist?list=PLINAH02_IDH9WhLAg1DyE_hJw7IoJuP0V)
> (April Dunnam, Microsoft) for step-by-step building.

## Watch out for
- **It summarizes what it can read.** A thin meeting recap makes a thin summary. The better your sprint
  review captures notes/transcript, the better the recap — feed it the richest source you have.
- **A clean format can hide a wrong fact.** A tidy summary feels authoritative; skim it for accuracy before
  sending, especially the decisions and owners.
- **Declarative summarizes, it doesn't trigger.** This agent generates the recap when you ask — it can't
  *automatically* run the instant the demo ends. For event-triggered automation you're looking past
  declarative building (Stage 6+).

## Where this leads (the ramp)
You built a recurring agent that produces consistent output — and immediately wished it would just *fire on
its own* after the demo and post the recap for you. That wish (real triggers, real actions, real workflow)
is exactly what **Stage 6 · Copilot Studio** is for.

> **Next:** [Copilot Studio → Build your first Studio agent with a knowledge source + topic](../walkthroughs/studio-first-agent.md)

## Related
- [Build a meeting-prep agent for a recurring 1:1 or standup](../walkthroughs/agent-builder-meeting-prep-agent.md) — the before-the-meeting companion
- [Cowork → Hand off an end-to-end task to Cowork](../walkthroughs/cowork-end-to-end-task.md) — the one-off version
- Stage 4 Resources: see `RESOURCES.md` → Agent Builder

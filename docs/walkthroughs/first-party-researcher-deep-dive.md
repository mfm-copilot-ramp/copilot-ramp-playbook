---
title: Deep-dive a topic with Researcher
description: Hand a hard question to the Researcher agent and get a cited, structured brief drawn from your own files and the web, an afternoon of work done in minutes.
stage: first-party
roles: [end-user, manager, maker]
tags: [first-party, researcher, research, brief, sources]
level: starter
time: 10 min
status: walkthrough
prereqs: [m365-copilot-license, researcher-agent-access]
updated: 2026-06-03
---

# Deep-dive a topic with Researcher

> Hand a hard question to the Researcher agent and get back a cited, structured
> brief that pulls from both your own files and the web — the work of an afternoon, in minutes.

**Stage:** First-Party Agents · **For:** End user, Manager, Maker · **Level:** Starter · **Time:** 10 min

**Status:** Generally available — verify current availability on the [Agents in Microsoft 365 roster](https://adoption.microsoft.com/en-us/ai-agents/agents-in-microsoft-365/).

## When to use this
You need to get smart on something fast — a competitor, a technology, a market shift — and a one-line
chat answer won't cut it. **Researcher** is a prebuilt first-party agent designed for exactly this: it
runs a *multi-step* investigation, reasons across sources, and assembles a brief with citations. You're
not prompting once and editing; you're delegating the whole research job.

This is a great second stop after the Facilitator flagship — it shows what a *reasoning* agent does
that a single prompt can't.

## What you'll need
- **M365 Copilot license** with access to the **Researcher** agent (Agent Store / left rail in Copilot)
- A real topic to investigate — sharper is better ("our top competitor's pricing moves," not "the market")
- Optionally, your own documents for it to ground on (a strategy doc, a deck, last quarter's notes)

## Try it now — the prompt
Open Researcher and give it a structured brief, not a vague question:

```
@Researcher build me a brief on [topic]. Cover: the current state, the key players,
and what's changed in the last 6 months. Pull from both my internal documents and
the web, cite every source, and end with 3 implications for my team.
```

**Why this works:** Researcher rewards structure. Naming the **sections** (state / players / what
changed), the **sources** (internal *and* web), the **citation requirement**, and a **"so what"** (3
implications) turns an open-ended ask into a brief you can actually use — and makes its work easy to
verify.

## Step by step
1. **Open Researcher.** Find it in the Agent Store or the agents rail inside Microsoft 365 Copilot, and
   start a conversation.
2. **Paste the prompt with your topic.** Researcher plans the work, then gathers and reasons across your
   files and the web — and shows its steps as it goes, so you can follow the reasoning.
3. **Read the cited brief and spot-check.** Open a citation or two and confirm the source actually says
   what the brief claims. This is the habit that makes agent output trustworthy.
4. **Push deeper in plain language:**
   ```
   Expand the "what's changed" section, add a short risks subsection, and turn
   the 3 implications into recommendations with a suggested owner for each.
   ```
   Researcher reruns just what's needed and updates the brief.

## Screenshots

Captured live in Microsoft 365 Copilot with the **Researcher** agent. The product UI moves fast — if what you see differs, trust the numbered steps above, which we keep current.

![Researcher agent open in Microsoft 365 Copilot](../screenshots/first-party-researcher-deep-dive/01-open-researcher.png)
**Open Researcher.** Start a conversation with the prebuilt Researcher agent from the agents rail.

![The research prompt entered in the Researcher composer](../screenshots/first-party-researcher-deep-dive/02-prompt-entered.png)
**Give it a structured brief.** Name the sections, the sources, the citation requirement, and a "so what."

![Researcher asking clarifying scoping questions](../screenshots/first-party-researcher-deep-dive/03-clarifying-questions.png)
**It scopes before it runs.** Researcher asks about timeframe, scope, and depth so the brief lands on target.

![Researcher showing its live reasoning steps](../screenshots/first-party-researcher-deep-dive/04-reasoning.png)
**Watch it reason.** Researcher plans, searches the web and your files, and shows each step as it works.

![The finished cited brief with reasoning step count](../screenshots/first-party-researcher-deep-dive/05-brief.png)
**A brief you can verify.** It returns a structured, cited brief — here after 78 reasoning steps — ready to spot-check.

## Make it better
A first brief is a starting point — steer it like an analyst on your team:
- **Ground it on your own material.** "Use the attached strategy doc as the primary source and check the
  web only to fill gaps."
- **Reshape the output.** Ask for a one-slide summary, an exec email, or a comparison table.
- **Hand the numbers to Analyst.** Researcher frames the story; the **Analyst** agent crunches the data.
  Chaining the two prebuilt agents is the real first-party power move.

> **📚 Learn more.** The [Agents in Microsoft 365 Adoption Hub](https://adoption.microsoft.com/en-us/copilot/)
> describes Researcher and the other prebuilt agents in plain language, and Nicole Herskowitz's (CVP,
> M365 Copilot) blog on [enabling human-agent teams](https://www.microsoft.com/en-us/microsoft-365/blog/2025/09/18/microsoft-365-copilot-enabling-human-agent-teams/)
> explains how these agents work alongside you.

## Watch out for
- **Citations are a feature, not a guarantee.** Researcher cites — your job is to confirm the citation
  supports the claim. Spot-check before you forward anything.
- **It's only as current as its sources.** "Last 6 months" depends on what's indexed and reachable.
  Treat fast-moving topics as a strong first draft, not the final word.
- **Sharper topic, sharper brief.** A broad prompt gives a shallow brief. Narrow the question and the
  depth follows.

## Where this leads (the ramp)
Once you trust an agent to run a multi-step *job* — plan, gather, synthesize — the next instinct is to
hand off a multi-step *task across your tools*, not just a research question. That's **Stage 3 ·
Cowork**: describe an outcome and let Copilot pull the inputs, do the work, and hand you a finished
deliverable.

> **Next:** [Cowork → Hand off an end-to-end task to Cowork](../walkthroughs/cowork-end-to-end-task.md)

## Related
- [First-Party → Auto-recap every meeting with Facilitator](../walkthroughs/first-party-facilitator-auto-recap.md) — the Stage 2 flagship
- [Analyst](../walkthroughs/first-party-analyst-dataset.md) · [Interpreter](../walkthroughs/first-party-interpreter-live-translation.md) · [Project Manager](../walkthroughs/first-party-project-manager.md) agents
- Stage 2 Resources: see `RESOURCES.md` → First-Party Agents

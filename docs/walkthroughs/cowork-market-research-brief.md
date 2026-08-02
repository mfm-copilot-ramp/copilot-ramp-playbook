---
title: Research a market and write a landscape brief
description: Hand Copilot Cowork a topic and your inputs to get back a structured market landscape brief you would normally spend half a day writing yourself.
stage: cowork
roles: [manager, end-user, champion]
tags: [research, strategy, cowork, market-research]
level: intermediate
time: 20 min
status: walkthrough
prereqs: [m365-copilot-license, cowork-access]
updated: 2026-06-03
---

# Research a market and write a landscape brief

> Hand Cowork a topic and a set of inputs — get back a structured market brief you'd normally spend half a day writing.

**Stage:** Cowork · **For:** Manager, End user · **Level:** Intermediate · **Time:** 20 min

## When to use this

You need to understand a new market, technology area, or competitive space — for a business case, an exec review, or a new initiative. The raw inputs exist (industry reports, news articles, competitor websites, internal strategy docs) but turning them into a structured brief is the work.

Cowork orchestrates the research and synthesis as a multi-step task: it reads your source documents, structures the findings, and produces a brief you can hand to stakeholders directly. Pair it with the **Researcher** agent for web-grounded depth.

## What you'll need

- **M365 Copilot license** with access to **Cowork**
- Source materials: documents, links, or a topic description (Cowork can work from all three)
- A clear output format in mind (landscape brief, SWOT, exec summary, competitive matrix)

## Try it now — the task description

Open Cowork and describe the task:

```
Research the [market / technology / competitive space] landscape and write a structured brief.

Sources to use:
- [Attached document 1 — e.g., industry report]
- [Attached document 2 — e.g., internal strategy doc]
- [Any relevant web sources — describe or link]

The brief should cover:
1. Market size and growth trajectory (headline numbers)
2. Key players and their positioning (3-5 players)
3. Main trends driving change in the next 12-18 months
4. Risks or headwinds to watch
5. Implication for us / why this matters for [your team or initiative]

Target audience: [exec / product team / sales team]. Target length: [1-2 pages].
```

**Why this task format works:** Cowork needs a clear deliverable and structure. Listing the five sections up front means it organizes the research to fill each one, rather than producing a freeform summary. The audience and length constraints prevent over-engineering.

## Step by step

1. **Gather your sources.** This can be attached documents, a list of URLs, or just a topic area if you want Cowork + Researcher to do the gathering.
2. **Open Cowork** and paste the task description. Attach the source documents.
3. **Let it run.** Cowork will work through the research and synthesis — this typically takes 2-5 minutes depending on source volume.
4. **Review the draft.** Check the "implication for us" section especially — it often needs a human judgment pass to connect the market analysis to your specific situation.
5. **Refine in-place:**
   ```
   Expand the section on [key player / trend] with more supporting detail.
   The "implication for us" section needs to be sharper — our key concern is [X].
   ```
6. **Push to a Copilot Page** and share with stakeholders for review.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **Use Researcher as a source:** if you don't have source docs, ask Researcher to do a deep-dive on the topic first, then hand its output to Cowork for structuring.
- **SWOT format:** replace the 5-section structure with `"Format this as a SWOT analysis: Strengths, Weaknesses, Opportunities, Threats."` for a one-page view.
- **Competitive matrix:** ask for `"A comparison table: key players as rows, dimensions (pricing / features / target customer / go-to-market) as columns."` instead of a narrative.
- **Recurring update:** save the task description as a Cowork recipe and re-run it quarterly with updated sources.

## Watch out for

- **The “implication for us” section is where Cowork is weakest.** It connects market facts to your situation by guessing, so that part needs your judgment.
- **A brief reads as authoritative even when a source was thin.** Spot-check the claims that would change a decision.
- **Market data ages fast.** Note the source dates and re-run the brief rather than trusting a stale one.

## Where this leads (the ramp)

You're already saving this as a Cowork recipe to re-run each quarter — that instinct is exactly what Agent Builder is for. It turns a repeatable task description into a durable, shareable agent, so your team runs the brief without rebuilding the prompt.

> **Next:** [Stage 4 · Agent Builder](../stages/stage-4-agent-builder.md)

## Related

- [Build a competitive comparison from multiple sources](cowork-competitive-comparison.md)

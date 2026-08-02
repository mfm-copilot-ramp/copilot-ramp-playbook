---
title: Find where Copilot is landing with Workforce insights
description: Use Workforce insights to see where your team gets real value from Copilot and where they underuse it, so you aim enablement at the gap, not the noise.
stage: first-party
roles: [champion, manager]
tags: [first-party, adoption, insights, analytics, enablement, value]
level: starter
time: 10 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-06-03
---

# Find where Copilot is landing with Workforce insights

> Stop guessing where Copilot is sticking. The insights surface shows where your team
> is getting real value and where they're underusing it — so you aim enablement at the gap, not the noise.

**Stage:** First-Party Agents · **For:** Champion, Manager · **Level:** Starter · **Time:** 10 min

**Status:** Frontier (early access) — verify current availability on the [Agents in Microsoft 365 roster](https://adoption.microsoft.com/en-us/ai-agents/agents-in-microsoft-365/).

## When to use this
You rolled Copilot out, ran a couple of trainings, and now the honest question is: *is it actually
landing?* **Workforce / Workplace insights** turns adoption from a feeling into a picture — which apps and
agents your team leans on, where usage is thin, and where the value is concentrating. It's the difference
between enabling everyone on everything (exhausting, low-yield) and enabling the *right people on the
right thing* (targeted, high-yield).

This is the champion's compass. You can't drive adoption you can't see, and this is where you see it.

## What you'll need
- **M365 Copilot license** and access to the **adoption / insights** surface for your team or org
- A clear question to answer — "where are we underusing Copilot?" beats "show me everything"
- The patience to read it as a *signal*, not a scoreboard (see "Watch out for")

## Try it now — the prompt
Ask the question a champion actually has, not for a raw data dump:

```
Where is my team getting the most value from Copilot right now, and where are
they underusing it? Point me at the two or three places a focused enablement
push would move the needle most.
```

**Why this works:** it asks for **value and gaps together**, then forces a **short, prioritized list of
where to act**. That converts an adoption dashboard into a to-do list — the whole point of looking is to
decide what to do next, not to admire the numbers.

## Step by step
1. **Open the insights surface.** Find the adoption / workplace insights view for your team and frame the
   window you care about — last month is usually the right lens for "is it sticking."
2. **Separate "using" from "getting value."** Logins aren't impact. Look for the apps and agents where
   usage is both *frequent* and *deep* — that's where value is real.
3. **Find the underused high-value spot.** The gold is a capability with big potential and thin
   usage — that's where one good training session pays off most.
4. **Turn the signal into a plan:**
   ```
   Based on where we're underusing Copilot, draft a 3-step enablement plan for
   next month: who to target, which use case to teach, and how I'll know it worked.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Insights compound when you close the loop:
- **Re-measure after you act.** Run the same view a month after an enablement push and see if the gap
  closed. That before-and-after is also the raw material for your ROI story later in the ramp.
- **Pair it with a champion ritual.** Use the underused-capability finding to pick your next "Prompt of
  the Day" or lunch-and-learn topic — let the data choose the agenda.
- **Share the wins, not the surveillance.** Celebrate where value is landing in your team channel. Make it
  about momentum, never about who's behind.

> **📚 Learn more.** The [Microsoft 365 Copilot Adoption Hub](https://adoption.microsoft.com/en-us/copilot/)
> and the [Copilot Success Kit](https://adoption.microsoft.com/en-us/copilot/success-kit/) collect
> Microsoft's enablement frameworks and templates for driving and measuring adoption.

## Watch out for
- **It's a signal, not a performance review.** Using insights to rank or evaluate individuals poisons the
  whole program — and it's not what the data is for. Read it at the team and capability level.
- **Usage ≠ value.** High clicks on a low-impact feature isn't a win. Weight depth and outcome over raw
  activity, or you'll optimize the wrong number.
- **Mind the privacy line.** Aggregate adoption patterns, yes; surveilling what individuals wrote, no.
  Keep the lens on enablement, and loop in your IT/admin on what's appropriate to view.

## Where this leads (the ramp)
Knowing *where* Copilot lands tells you where building your own agent would pay off. The underused
high-value spot you just found is often the exact place a purpose-built agent — grounded on your team's
docs — would absorb the most repeat work. That's **Stage 4 · Agent Builder**: turn the gap into a
declarative agent of your own.

> **Next:** [Agent Builder → Build a "team knowledge" agent over a SharePoint site](../walkthroughs/agent-builder-team-knowledge.md)

## Related
- [First-Party → The first-party agents included with your M365 Copilot license](../walkthroughs/first-party-agents-overview.md) — the roster
- [Copilot Studio → Make the ROI case for your agent](../walkthroughs/studio-roi-business-case.md) — where these numbers become a business case
- Stage 2 Resources: see `RESOURCES.md` → First-Party Agents

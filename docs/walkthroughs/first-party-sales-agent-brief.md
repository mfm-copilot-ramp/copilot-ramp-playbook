---
title: Brief an account before a call with the Sales agent
description: Use the Sales agent to walk into every call already briefed on recent activity, open opportunities, and what to raise, pulled from your CRM and inbox.
stage: first-party
roles: [end-user, manager]
tags: [first-party, sales, crm, account, briefing, meetings]
level: starter
time: 10 min
status: walkthrough
prereqs: [m365-copilot-license, sales-agent-access]
updated: 2026-06-05
---

# Brief an account before a call with the Sales agent

> Walk into every customer call already briefed — recent activity, open opportunities, and the
> three things to raise — pulled from your CRM and your inbox by the Sales agent, in the minutes
> before you dial.

**Stage:** First-Party Agents · **For:** End user, Manager · **Level:** Starter · **Time:** 10 min

**Status:** Check current status — this agent isn't individually listed on the [Agents in Microsoft 365 roster](https://adoption.microsoft.com/en-us/ai-agents/agents-in-microsoft-365/); confirm availability there before assuming it's GA.

## When to use this
You have a call in fifteen minutes and you're about to skim the CRM, scroll your email, and hope you
didn't miss anything. The **Sales agent** (surfaced as *Sales Chat* inside Microsoft 365 Copilot for
sellers) is built for exactly this moment: it reads across your CRM records and your Microsoft 365
signals — emails, meetings, shared files — and hands you a single, current account brief so you stop
walking into calls cold.

This is one of the newer first-party agents, so treat it as a *fast prep ritual* you run before every
meaningful customer touch — not a one-time setup.

## What you'll need
- **M365 Copilot license** plus access to the **Sales agent / Copilot for Sales** experience (your org
  must have it enabled and your CRM connected — Dynamics 365 or Salesforce)
- The **account or opportunity name** you're about to meet on
- Recent activity to draw from — emails, meetings, or notes tied to that account

## Try it now — the prompt
Open the Sales agent (or Sales Chat in the Copilot app) and ask for a structured pre-call brief:

```
Brief me for my call with [account name] this afternoon. Pull from CRM and my
recent email and meetings. Give me: account status and open opportunities, what's
happened in the last 30 days, any risks or stalled deals, and the top 3 things I
should raise on this call. Keep it to one screen.
```

**Why this works:** naming the **sources** (CRM + email + meetings), a **timeframe** (last 30 days), the
**sections** you want, and a **length limit** turns a vague "tell me about this account" into a brief you
can actually read in the elevator — and act on.

## Step by step
1. **Open the Sales agent.** Find *Sales Chat* / the Sales agent in the Microsoft 365 Copilot app or the
   Agent Store, or use it from within Outlook/Teams if your org surfaced it there.
2. **Name the account and paste the prompt.** The agent resolves the account, then gathers across your
   connected CRM and your Microsoft 365 activity for that customer.
3. **Read the brief and open a record or two.** Spot-check the open opportunities and the "last 30 days"
   items against the CRM so you trust what you're about to walk in with.
4. **Sharpen it for the call:**
   ```
   Now give me three smart discovery questions based on the stalled opportunity,
   and draft a one-line recap I can send right after the call.
   ```
   The agent tailors the questions to that account and drafts the follow-up so it's ready before you hang up.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
A brief is the start — turn the agent into your pre- and post-call partner:
- **Prep the whole day.** "Do the same brief for every external meeting on my calendar today."
- **Keep the CRM honest.** "Draft the CRM activity note from my last email thread with this account."
- **Hand the numbers to Analyst.** Sales agent frames the relationship; the **[Analyst](first-party-analyst-dataset.md)**
  agent can crunch the pipeline data behind it — chaining prebuilt agents is the real power move.

> **📚 Learn more.** The [Agents in Microsoft 365 hub](https://adoption.microsoft.com/en-us/ai-agents/agents-in-microsoft-365/)
> and the [Microsoft Copilot for Sales docs](https://learn.microsoft.com/en-us/microsoft-sales-copilot/)
> describe the Sales agent and how it connects to your CRM.

## Watch out for
- **Availability varies.** The Sales agent depends on your org enabling Copilot for Sales and connecting a
  CRM. If you don't see it, that's a licensing/admin step, not something you can self-serve.
- **It's only as good as the CRM.** Stale or thin records make a thin brief. Treat gaps as a prompt to
  update the CRM, not a failure of the agent.
- **Spot-check before you act.** Confirm opportunity stages and amounts in the source record before you
  quote them to a customer.

## Where this leads (the ramp)
Once you trust an agent to *assemble* a brief from your tools, the next instinct is to hand off a whole
multi-step task — pull the inputs, do the work, hand you the deliverable. That's **Stage 3 · Cowork**.

> **Next:** [Cowork → Hand off an end-to-end task to Cowork](../walkthroughs/cowork-end-to-end-task.md)

## Related
- [The agents included in your M365 Copilot license](../walkthroughs/first-party-agents-overview.md) — the full roster
- [Deep-dive a topic with Researcher](../walkthroughs/first-party-researcher-deep-dive.md) · [Analyze a dataset with Analyst](../walkthroughs/first-party-analyst-dataset.md)
- Stage 2 Resources: see `RESOURCES.md` → First-Party Agents

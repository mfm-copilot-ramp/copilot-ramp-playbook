---
title: "Finance: Self-service spend and budget Q&A for budget owners"
description: Build a Copilot Studio agent that gives budget owners instant answers on spend, variance from plan, and the approval process, without waiting on Finance.
stage: studio
roles: [maker, champion, manager]
tags: [copilot-studio, finance, budget, spend, variance, functional]
level: intermediate
time: 3–4 hours
status: walkthrough
updated: 2026-06-04
---

# Finance: Self-service spend and budget Q&A for budget owners

> Give budget owners instant answers on their spend position, variance from plan, and the Finance approval process — without waiting for a Finance business partner to respond.

**Stage:** Copilot Studio · **For:** Maker, Champion, Manager · **Level:** Intermediate · **Time:** 3–4 hours

> **🧱 Build-only walkthrough.** A hands-on Studio build with no separate solution-template blueprint — the steps below are the complete spec.

## When to use this

Budget owners — team managers, department heads, project owners — generate a consistent stream of Finance queries: "Where am I vs. plan?", "What's the process for requesting more budget?", "When is the reforecast deadline?", "I need to overspend on [item] — what do I do?"

These split into two types:
- **Policy and process questions** — answerable from documents (reforecast process, overspend approval, Finance calendar). High volume, fully self-serviceable.
- **Live data questions** — require a connection to the finance system. Lower volume but higher value.

This walkthrough builds the policy and process layer first — the highest value for the lowest build effort. The data integration (connecting to your finance system or Power BI) is the logical extension.

**Why this is distinct from the Finance Expense agent:** the expense agent serves employees submitting individual claims. This agent serves budget owners responsible for a cost centre — different audience, different questions, different approval processes.

## What you'll need

- Copilot Studio access
- Finance process documentation in SharePoint: reforecast process, overspend approval process, Finance calendar with key deadlines, budget submission guidance
- A Finance business partner contact or shared inbox for escalation
- Optional: a Power BI report or Finance portal link for live spend data

## Try it now — the prompt

Run this prompt in Copilot Chat to generate the agent's system prompt, topics, and escalation flow — it works because it draws the policy-vs-live-data line up front, so the build starts with a clear scope.

**Draw the line between policy questions and data queries before building.**

- "What is the process for getting additional budget approved?" — answerable from documents ✅
- "What is my actual spend this month?" — requires finance system integration ⚠️

Decide whether the agent handles live data queries by: (a) directing to the Finance portal with a link, (b) connecting to Power BI, or (c) deferring to a future integration phase. Agree this with Finance before building.

```
Design a Copilot Studio budget Q&A agent for budget owners at [Company].
Knowledge source: [reforecast process / Finance calendar / overspend approval
guide — on SharePoint].
Scope: process questions, Finance deadlines, budget variance and overspend
approval process, reforecast guidance.
Out of scope: live spend data (redirect to [Finance portal / Power BI link]).
Escalate individual budget decisions to [Finance BP DL].

Give me: system prompt, 3 topics (deadlines, overspend process, live data
redirect), and the escalation flow for individual budget decisions.
```

## Step by step

1. **Create the agent for budget owners.** Set instructions to:

    > *You are the Finance Guide for budget owners at [Company]. You answer questions about the budget management process — reforecasts, overspend approvals, Finance deadlines, and year-end procedures — using approved Finance documentation. For current spend data and live budget positions, direct budget owners to [Finance portal link]. Escalate individual budget decisions to [Finance business partner DL].*

2. **Add Finance process documentation as the knowledge source.** Key documents: reforecast guide, overspend approval process, Finance calendar with all key deadlines, budget holder handbook.

3. **Build the Finance deadlines topic.** The most-asked question among budget owners: "When is the reforecast deadline?", "When does the month end?", "When do I need to submit the budget by?" — Finance maintains a "current Finance calendar" SharePoint page; the agent reads from it directly, so the answer is always current.

4. **Build the overspend / variance topic.** Trigger phrases: "I need more budget", "I'm going over plan", "can I overspend", "variance approval". Walk through: how much over, what category, what the approval process is, who approves, what lead time is needed to get sign-off.

5. **Build the live data redirect topic.** Trigger phrases: "what have I spent", "where am I vs. budget", "my spend position", "actuals". Return a clear redirect to the Finance portal or Power BI report with a link, plus a note on what to look for once they are there.


## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **Power BI integration.** Connect to a Power BI dataset and surface the budget owner's actual vs. plan directly in the agent. "You are £12,400 over plan in headcount as of last month-end" — no portal navigation required.
- **Proactive month-end reminders.** An autonomous trigger that messages budget owners 5 working days before month-end with their current position and a reminder of the reforecast deadline.
- **Reforecast pre-fill.** Connect to the finance system and pre-populate the reforecast template with the current actuals so the budget owner only needs to enter the forward view — not re-enter what already happened.

## Watch out for

- **Budget data confidentiality.** If you integrate live budget data, ensure the agent only returns data for the requesting budget owner's own cost centres — not anyone else's. This requires authenticated user context.
- **Reforecast process changes.** Finance processes change every cycle. The reforecast documents must be updated before each cycle opens — and a Finance team owner must own this refresh.
- **Approval thresholds in the instructions.** Put all overspend thresholds in the SharePoint policy document, not in the agent instructions. When Finance revises the approval tiers, the agent updates automatically.

## Where this leads (the ramp)

A policy-and-redirect agent is the safe place to start. The moment you wire in live, per-owner budget data — where one wrong row exposes another team's numbers — the access-control and identity guarantees you need live at the Azure AI Foundry tier.

> **Next:** [Foundry: govern and secure agents](foundry-govern-secure.md)

## Related

- [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Knowledge overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)
- [Power BI connector](https://learn.microsoft.com/en-us/power-automate/dataverse/list-rows)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

!!! tip "Ready to build? Use the solution template."
    The [Finance Expense & Procurement Agent solution template](../solutions/finance-expense-agent.md) covers the Finance knowledge-grounding and escalation pattern — adapt the scope section and swap in the budget owner topics described here.

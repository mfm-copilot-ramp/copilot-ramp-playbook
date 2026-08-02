---
title: Keep a project on track with the Project Manager agent
description: Hand the Project Manager agent your plan and let it track action items, chase owners, and flag slips, so you stop being the human status-checker.
stage: first-party
roles: [champion, manager]
tags: [first-party, project-manager, tracking, action-items, accountability]
level: starter
time: 10 min
status: walkthrough
prereqs: [m365-copilot-license, project-manager-agent-access]
updated: 2026-06-03
---

# Keep a project on track with the Project Manager agent

> Hand the agent your plan and let it do the nagging — tracking action items,
> chasing owners, and flagging what's about to slip — so you stop being the human status-checker.

**Stage:** First-Party Agents · **For:** Champion, Manager · **Level:** Starter · **Time:** 10 min

**Status:** Public preview — verify current availability on the [Agents in Microsoft 365 roster](https://adoption.microsoft.com/en-us/ai-agents/agents-in-microsoft-365/).

## When to use this
You built the plan (maybe with Copilot — see the Stage 1 walkthrough). Now comes the unglamorous part:
keeping it alive. Who owns what, what's due, what's quietly slipping. **Project Manager** is the prebuilt
first-party agent for this: it ingests a plan or a set of tasks, tracks status, nudges owners, and
surfaces risk before it becomes a fire. It's the difference between *making* a plan and *running* one.

For champions and managers this is where delegation gets real — you're not asking for one answer, you're
handing off an ongoing responsibility.

## What you'll need
- **M365 Copilot license** with access to the **Project Manager** agent (Agent Store / agents rail)
- A plan or task list to track — from a doc, a meeting's action items, or a Planner/Loop board
- The owners reachable in your tenant, so the agent can attribute and follow up

## Try it now — the prompt
Point the agent at your plan and tell it what "on track" means:

```
@Project Manager track the action items from this plan. For each one, capture the
owner and due date, tell me what's at risk of slipping and why, and draft a friendly
nudge to any owner who's overdue. Give me a status summary I can share weekly.
```

**Why this works:** it defines the *unit of work* (action items), the *attributes* (owner, due date),
the *signal you care about* (at risk + why), and a *deliverable* (a shareable weekly summary). You're
describing a standing job, not a one-time read.

## Step by step
1. **Open Project Manager and give it the plan.** Find it in the Agent Store or agents rail and point it
   at your source — a doc, a meeting's action items, or a task board.
2. **Review the tracked items.** The agent lists each action with owner, due date, and a status read.
   Confirm it parsed the owners and dates correctly before you rely on the tracking.
3. **Check the risk calls and the nudges.** It flags what's slipping and drafts the follow-ups — you
   approve the tone and the recipients before anything goes out.
4. **Set the cadence in plain language:**
   ```
   Give me this status every Friday at 3pm, only escalate items that are overdue
   or blocking others, and keep the summary to one screen.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Tracking is the floor; steering is the ceiling:
- **Roll up a portfolio.** "Summarize status across all three of my projects and tell me which one needs
  attention first."
- **Tighten the nudges.** "Make the overdue reminders warmer and CC me only when something's a week late."
- **Connect it to the source of truth.** Have it track the same board your team already lives in, so the
  agent's view and reality don't drift apart.

> **📚 Learn more.** The [Agents in Microsoft 365 Adoption Hub](https://adoption.microsoft.com/en-us/copilot/)
> introduces the prebuilt agents in plain language, and the
> [M365 Copilot resources hub](https://aka.ms/m365copilot/resources) covers how these agents fit the
> broader Copilot experience.

## Watch out for
- **It tracks what it can see.** Work happening in side channels or someone's head won't show up. The
  agent's status is only as complete as the sources you point it at.
- **Approve the nudges before they send.** A well-meaning automated reminder to the wrong person, or in
  the wrong tone, costs you goodwill. Keep a human in the loop on outbound messages.
- **Risk flags are prompts to look, not verdicts.** "At risk" means *check this* — confirm with the
  owner before you escalate.

## Where this leads (the ramp)
You've now let an agent run a standing *responsibility*, not just answer a question. The next step is
handing off whole multi-tool *tasks* — "pull the inputs, do the work, deliver the artifact." That's
**Stage 3 · Cowork**, where delegation stops being one agent doing one job and becomes Copilot
orchestrating the chain.

> **Next:** [Cowork → Hand off an end-to-end task to Cowork](../walkthroughs/cowork-end-to-end-task.md)

## Related
- [First-Party → Auto-recap every meeting with Facilitator](../walkthroughs/first-party-facilitator-auto-recap.md) — the Stage 2 flagship
- [Chat → Build a first-draft project plan](../walkthroughs/chat-project-plan.md) — the manual Stage 1 version this agent runs
- Stage 2 Resources: see `RESOURCES.md` → First-Party Agents

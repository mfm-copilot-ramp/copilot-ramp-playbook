---
title: "Customer Support: Autonomous deflect-and-draft on the GitHub Copilot harness"
description: Build a support agent that grounds answers, drafts human-reviewed replies, checks incidents, and routes edge cases without scripted topics.
stage: studio
harness: github-copilot
roles: [maker, it-admin]
tags: [copilot-studio, customer-support, deflection, escalation, github-copilot-harness, generative-orchestration, functional]
level: intermediate
time: 3–4 hours
status: walkthrough
prereqs: [copilot-studio-access, knowledge-source]
updated: 2026-08-14
---

# Customer Support: Autonomous deflect-and-draft on the GitHub Copilot harness

> Give support agents a planner that checks approved content and known issues, drafts a reply, and escalates edge cases with a ticket update.

**Stage:** Copilot Studio · **For:** Maker, IT Admin · **Level:** Intermediate · **Time:** 3–4 hours

!!! abstract "Which harness? This one uses the GitHub Copilot harness"
    Every Copilot Studio agent runs on a [harness](../pick-the-engine.md) — the engine underneath it. This
    walkthrough builds on the **GitHub Copilot harness**, the autonomous, agentic engine: it **reasons
    through the whole goal on its own**, **retries and finds another path when a step fails**, works across
    your **Word, Excel, PowerPoint, and PDF** files, and keeps context with **skills and memory** — so you
    describe the outcome instead of authoring every path. That capability is why it's the engine to grow into.

    The honest tradeoff: it bills **Copilot Credits for all usage — building, testing, *and* running — and a
    Microsoft 365 Copilot license *never* covers it.** Want this same use case as predictable, rules-based
    topics your Microsoft 365 Copilot license already covers in Microsoft 365 channels? Build the
    **[standard-harness version](studio-functional-support-deflection.md)** instead.
    [Compare the engines](../pick-the-engine.md) · [estimate the net cost](../credit-estimator.md).

## When to use this

Use this when support agents need more than search results. The work is to understand the customer question, retrieve an approved answer, check whether an active incident changes the answer, draft a send-ready reply, and escalate anything that is not grounded.

The GitHub Copilot harness is useful here because the path changes by request. The planner can decide whether to use help content, macros, the known-issues feed, the routing guide, or the ticket action without you wiring every conversation branch.

## What you'll need

- **Copilot Studio access** with **Copilot Credits available** — building, testing, and running on this harness all consume credits.
- Approved support knowledge: help center, product FAQ, response macros, and support voice guidance.
- A live known-issues or incident feed.
- An escalation routing guide mapped to your real support queues.
- A Power Automate connector to your support tool: Zendesk, ServiceNow, Dynamics, or the system your team uses.
- Support-ops agreement on the rule: grounded answer or escalate — no improvising.

## Try it now — the prompt

Run this in Copilot Chat before you build. It drafts the instructions for a deflect-and-draft agent that stays grounded and keeps humans in the send path.

```
Write outcome-focused instructions for a Copilot Studio agent on the GitHub Copilot harness named "Support Assistant" that helps support agents deflect common questions and draft replies.

Use these specifics:
- Knowledge: [help center / KB], [approved response macros], [product FAQ], [known-issues feed], and [escalation routing guide].
- Ticketing tool/action: [Power Automate flow name] creates or updates a ticket in [Zendesk / ServiceNow / Dynamics] with the drafted reply, disposition, escalation queue, and short summary.
- Boundary: answer only from approved content. If there is no grounded answer, escalate.
- Human review: draft replies for an agent to review and send; never message customers directly.
- Escalation examples: billing dispute, account change, suspected bug, or anything outside approved content.

Include:
1. The agent's role, tone, and boundaries.
2. The reasoning steps the planner should follow.
3. When to use each knowledge source and when to use the ticket tool, described by purpose.
4. The response format for grounded answers, known-issue matches, draft replies, and escalations.
```

This works because it makes the support rule explicit: grounded or escalate. The planner can compose the steps — retrieve, check incidents, draft, and route — while the instructions prevent customer-facing improvisation.

## Step by step

1. **Create the agent on the GitHub Copilot harness.** In Copilot Studio, create a new agent named something like "Support Assistant." On the **Build** tab, use the **instructions editor** for the operating instructions and the **components panel** for knowledge, tools, and triggers.
2. **Write the instructions around the outcome.** Set the role, tone, and boundaries: answer only from approved content, drafts are for humans to review, and no grounded answer means escalation. Spell out the reasoning steps: read the customer issue, check known issues, retrieve the approved answer, draft in the support voice, or route to the correct queue with a summary.
3. **Confirm generative orchestration is on.** Keep generative orchestration enabled so the agent chooses the right knowledge and tool for each request. Do not wire trigger phrases; describe when each component should be used.
4. **Add the support knowledge.** Add the help center, macros, product FAQ, known-issues feed, and escalation routing guide from the components panel. In the Test pane, ask a common question and a known-issue question and confirm the agent cites approved content.
5. **Add the ticket action.** Add the Power Automate flow that creates or updates the support ticket in Zendesk, ServiceNow, or Dynamics. Map the drafted reply, disposition, queue, and summary. In the instructions, tell the agent to use the tool when the question is out of scope, no grounded answer exists, or a human queue needs the case.
6. **Test the whole multi-step task.** In the Test pane, run a grounded FAQ question, a known-incident match, and an escalation such as a billing dispute, account change, or suspected bug. Deliberately break a step — remove a required ticket field or ask a question with no approved answer — and confirm the agent escalates cleanly instead of inventing. Each test run consumes Copilot Credits.
7. **Publish to a channel.** Publish to Teams or the internal support workspace first. Pilot with a small group, review drafted replies and escalations, then expand only after support ops trusts the grounded-or-escalate behavior.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the
numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright
tool in `tooling/screenshots/`._

## Make it better

- **Add sentiment-aware routing.** If the language shows frustration or urgency, route to a human faster.
- **Recommend new macros.** Log repeated "no grounded answer" questions so support ops can create approved content instead of letting gaps persist.
- **Measure the pilot.** Track draft acceptance, handle-time change, and true deflection before you scale.
- **Graduate to Foundry when needed.** If the agent must face customers directly and take actions at scale, plan the Foundry version.

> **Learn more.** See [Agents powered by the GitHub Copilot harness](https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview)
> and the [Copilot Studio hub](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) on Microsoft Learn.

## Watch out for

- **Every action bills Copilot Credits — including build and test.** Set cost controls and keep the pilot group small before broad rollout.
- **Right-size the harness.** If the task is a predictable single-path flow, use the [standard-harness version](studio-functional-support-deflection.md) instead; it is rules-based and Microsoft 365 channel usage is covered for licensed users.
- **Improvised answers are failure.** No grounded answer means escalate. Test the no-match path until it is boring.
- **Known issues must stay live.** A stale incident feed makes the agent suggest troubleshooting for an active bug.
- **Drafts must stay drafts.** Keep the human review step real; the agent never messages customers directly.
- **Baseline before measuring deflection.** Without a starting point, the pilot metrics will not mean much.

## Where this leads (the ramp)

This agent deflects internally and drafts for a human to send. The moment you need it to face customers directly and take real actions at scale, you are moving toward Azure AI Foundry.

> **Next:** [Stage 7 · Azure AI Foundry](../stages/stage-7-foundry.md)

## Related

- [Customer Support: deflect and draft, escalate the rest](studio-functional-support-deflection.md) — the standard-harness version
- [Pick the engine for the job](../pick-the-engine.md)
- [Customer Support Deflection Agent solution template](../solutions/support-deflection-agent.md)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

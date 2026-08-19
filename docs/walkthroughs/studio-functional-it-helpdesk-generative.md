---
title: "IT: Autonomous helpdesk triage on the GitHub Copilot harness"
description: Build an IT triage agent that answers from the KB, gathers ticket fields, and raises clean helpdesk tickets with generative planning.
stage: studio
harness: github-copilot
roles: [maker, it-admin]
tags: [copilot-studio, it, helpdesk, triage, power-automate, github-copilot-harness, generative-orchestration, functional]
level: intermediate
time: 3–4 hours
status: walkthrough
prereqs: [copilot-studio-access, knowledge-source]
updated: 2026-08-14
---

# IT: Autonomous helpdesk triage on the GitHub Copilot harness

> Let the planner decide whether to answer from the IT KB or collect category, urgency, description, and contact to raise a clean ticket.

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
    **[standard-harness version](studio-functional-it-helpdesk.md)** instead.
    [Compare the engines](../pick-the-engine.md) · [estimate the net cost](../credit-estimator.md).

## When to use this

Use this when tier-1 IT work is not just "answer a question" or "open a ticket." The agent has to inspect the request, try the KB first, decide whether a human is needed, gather the right fields, and submit the ticket only when the answer path fails or the work clearly needs IT.

That is a good fit for **generative orchestration**: the planner reads the user's intent, chooses the IT KB or the ticket tool by purpose, and works through the triage outcome without you authoring every branch.

## What you'll need

- **Copilot Studio access** with **Copilot Credits available** — building, testing, and running on this harness all consume credits.
- Your **IT knowledge base** in SharePoint or uploaded docs: KB articles, known issues, how-to guides, password reset, VPN access, and software request guidance.
- A **ticketing system** with a Power Automate connector: ServiceNow, Jira, Zendesk, or a SharePoint list as a lightweight alternative.
- The fields your helpdesk requires: **category**, **urgency**, **short description**, and **contact**.
- The top repeatable requests the KB should deflect before a ticket is raised.

## Try it now — the prompt

Run this in Copilot Chat before you build. It drafts the outcome-focused instructions you will paste into the instructions editor.

```
Write outcome-focused instructions for a Copilot Studio agent on the GitHub Copilot harness named "IT Help" that triages employee IT requests end to end.

Use these specifics:
- Knowledge: [our IT SharePoint KB / uploaded IT KB articles], including password resets, VPN access, software requests, known issues, and how-to guides.
- Ticketing tool/action: [Power Automate flow name] creates a ticket in [ServiceNow / Jira / Zendesk / our SharePoint list] and returns a ticket reference.
- Ticket fields to collect before using the tool: category (hardware / software / access / other), urgency (blocking / degraded / low), short description, and contact.
- Self-service boundary: answer from the KB first for the top [20] repeatable requests; create a ticket when a human is needed or the KB answer did not work.

Include:
1. The agent's role, tone, and boundaries.
2. The reasoning steps the planner should follow.
3. When to use each knowledge source and when to use the ticket tool, described by purpose.
4. The response format for KB answers, ticket confirmations, and fallback if the tool fails.
```

This works because it defines the outcome and the guardrails: answer from approved IT knowledge first, then collect only the ticket fields the helpdesk needs. The planner can compose the steps instead of following trigger phrases.

## Step by step

1. **Create the agent on the GitHub Copilot harness.** In Copilot Studio, create a new agent named something like "IT Help." On the **Build** tab, use the **instructions editor** for the agent directions and the **components panel** for knowledge, tools, and triggers.
2. **Write the instructions as an operating model.** Include the role ("IT Help agent for [Company]"), tone (plain-language, calm, concise), boundaries (do not invent policy or promise an SLA not in the KB), the triage steps, and the response formats. Tell the agent to use the IT KB to answer self-service requests, use known-issues content before opening duplicates, and use the ticket tool only after it has the required fields and user confirmation.
3. **Confirm generative orchestration is on.** Keep the agent in generative orchestration mode so it plans which knowledge and tools to use per request. Do not add trigger phrases for the triage flow; the instructions describe the outcome.
4. **Add the IT knowledge source.** From the components panel, add the SharePoint KB or uploaded articles. Test a few top-20 requests in the **Test** pane — password reset, VPN access, and software install — and confirm the answers cite the right source before you add the action.
5. **Add the ticket action.** Add the Power Automate flow or connector action that creates a ticket in ServiceNow, Jira, Zendesk, or the SharePoint list. Map inputs for category, urgency, short description, and contact, and return the ticket reference. In the instructions, describe when to call it: only when the issue needs a human, the KB answer failed, or the user asks for action-required work such as new hardware.
6. **Test the whole multi-step task.** In the Test pane, run three paths: a KB answer that resolves the issue, a KB answer that did not work and becomes a ticket, and a direct ticket request such as "I need a new laptop." Deliberately break a step — omit urgency, choose an unsupported category, or simulate the flow failing — and confirm the agent asks for the missing field or gives the fallback text with the collected details. Each test run consumes Copilot Credits.
7. **Publish to a channel.** Publish the agent to Teams or the internal help site. Start with a controlled IT pilot, watch which requests become tickets, and adjust the instructions and KB before broad rollout.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the
numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright
tool in `tooling/screenshots/`._

## Make it better

- **Add SLA-aware confirmations.** Pull the response time by urgency tier from the KB so "blocking" and "low" tickets set different expectations.
- **Surface known issues first.** Put outages and known incidents in a maintained SharePoint page so the agent can avoid duplicate tickets.
- **Close the loop.** Add a Power Automate follow-up that messages the user when the ticket is resolved.
- **Make it autonomous.** When the intake source is a form or mailbox, add an autonomous trigger after the manual pilot proves the triage plan is reliable.

> **Learn more.** See [Agents powered by the GitHub Copilot harness](https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview)
> and the [Copilot Studio hub](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) on Microsoft Learn.

## Watch out for

- **Every action bills Copilot Credits — including build and test.** Set environment-level cost controls and limit pilot access before a broad rollout.
- **Right-size the harness.** If the task is a predictable single-path flow, use the [standard-harness version](studio-functional-it-helpdesk.md) instead; it is rules-based and Microsoft 365 channel usage is covered for licensed users.
- **KB article quality still matters.** The agent can only ground on what exists. Rewrite the top-20 articles in plain language before launch.
- **Do not over-collect.** Start with category, urgency, short description, and contact. Add fields only when the helpdesk repeatedly asks for them.
- **Handle tool failures.** Test connector outages and authentication errors so the agent can give the user the ticket details to send manually.

## Where this leads (the ramp)

Answering from the KB and raising clean tickets is a strong tier-1 deflection play. When ticket volume is high and you need continuous evaluation and monitoring to prove the agent resolves rather than misroutes, move into Foundry.

> **Next:** [Foundry: evaluate and monitor continuously](foundry-evaluate-monitor.md)

## Related

- [IT: Triage support requests and answer from the knowledge base](studio-functional-it-helpdesk.md) — the standard-harness version
- [Pick the engine for the job](../pick-the-engine.md)
- [IT Helpdesk Triage Agent solution template](../solutions/it-helpdesk-triage-agent.md)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

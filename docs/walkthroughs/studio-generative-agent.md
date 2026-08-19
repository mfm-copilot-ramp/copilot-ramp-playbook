---
title: Build a generative agent on the GitHub Copilot harness
description: Build a Copilot Studio agent on the GitHub Copilot harness: use generative orchestration to plan and run a multi-step task from instructions and tools.
stage: studio
harness: github-copilot
roles: [maker]
tags: [copilot-studio, github-copilot-harness, generative-orchestration, autonomous, credits]
level: intermediate
time: 40 min
status: walkthrough
prereqs: [copilot-studio-access, knowledge-source, publish-target]
updated: 2026-08-14
---

# Build a generative agent on the GitHub Copilot harness

> Stop wiring every branch by hand. Describe the outcome, give the agent knowledge and a
> tool, and let it plan and run a multi-step task on its own.

**Stage:** Copilot Studio · **For:** Maker · **Level:** Intermediate · **Time:** 40 min

!!! abstract "Which harness? This one uses the GitHub Copilot harness"
    Every Copilot Studio agent runs on a [harness](../pick-the-engine.md) — the engine underneath it. This
    walkthrough builds on the **GitHub Copilot harness**, the autonomous, agentic engine. Reach for it when
    the job is a **complex, multi-step process** that rules can't script cleanly: it **reasons through the
    whole goal on its own**, **retries and finds another path when a step fails**, works directly across your
    **Word, Excel, PowerPoint, and PDF** files, and keeps context with **skills and memory** — so you
    describe the outcome instead of building every conversation path. That capability is why it's the engine
    to grow into.

    The honest tradeoff, so you decide with open eyes: the GitHub Copilot harness bills **Copilot Credits for
    all usage — building, testing, *and* running — and a Microsoft 365 Copilot license *never* covers it.**
    If your scenario is a predictable, rules-based flow, the [standard harness](studio-first-agent.md) does it
    for less and your M365 licenses already cover it inside Microsoft 365 channels.
    [Compare the engines](../pick-the-engine.md) · [estimate the net cost](../credit-estimator.md).

## When to use this

You built a designed agent on the standard harness ([your first Studio agent](studio-first-agent.md)) and hit
the wall every rules-based agent eventually hits: the real task isn't one tidy conversation. A request comes
in, and *doing it* means checking a policy, looking something up, deciding what to do next, and acting — a
different path each time. Authoring a topic for every branch stops scaling.

This is the moment to step up to **generative orchestration** on the GitHub Copilot harness. Instead of
hand-built topics, an LLM planning layer reads the user's intent, breaks the request into steps, picks the
right knowledge and tools, and executes the plan with the guardrails you set. You spend your time on clear
**instructions** and the right **tools**, not on wiring flowcharts.

## What you'll need

- **Copilot Studio access** with **Copilot Credits available** — remember, building and testing on this
  harness consumes credits, not just running it.
- A **knowledge source** the agent should ground on — a SharePoint site, a set of docs, or a URL.
- **One real action** in mind (a connector or Power Automate flow) so the agent can *do*, not just answer.
- A **multi-step task** you can describe as an outcome — e.g. "handle an employee IT access request end to
  end: check the policy, confirm eligibility, and either raise the access ticket or explain why not."

## Try it now — the instructions

A generative agent lives and dies by its **instructions**. Draft them before you build — in Copilot Chat, or
on paper — with this prompt:

```
Write the agent instructions for a Copilot Studio generative agent that [outcome, e.g. "handles
employee IT access requests end to end"]. Include:
- The agent's role, tone, and boundaries (what it must never do)
- The steps it should reason through to complete the task
- Which knowledge it should consult and which tool/action it should call, described by purpose
- The response format (concise, cite the policy, propose the next step)
```

**Why this works:** on the GitHub Copilot harness you don't script the conversation — you describe the *goal*
and the *guardrails*, and the planner composes the steps. Good instructions reference only the tools and
knowledge the agent actually has, use exact tool names, and describe knowledge sources by purpose rather than
naming files. That's the whole craft: clear intent in, reliable plans out.

## Step by step

1.  **Create a new agent in Copilot Studio.** In the new agent experience, the **Build** tab opens with the
    **instructions editor** on one side and the **components panel** (knowledge, tools, triggers) on the
    other. Give the agent a name and paste in the instructions you drafted.
2.  **Confirm generative orchestration is on.** New agents on this harness plan generatively by default —
    the agent decides which knowledge and tools to use per request rather than following authored trigger
    phrases. Leave it on; this is the behavior you want.
3.  **Add your knowledge source.** Point the agent at the SharePoint site / docs / URL from the components
    panel, then ask a grounding question in the built-in **Test** pane to confirm it answers from *your*
    content before you add actions.
4.  **Add one tool (the action).** Add a connector or Power Automate flow the agent can call to take the real
    step — raise the ticket, look up the record, write the update. Describe *when* to use it in the
    instructions; you don't wire it to a trigger phrase.
5.  **Test the whole task in the Test pane.** Give it a realistic request and watch it **plan**: consult the
    policy, decide, and call the tool. Deliberately break a step (ask for something ineligible) and confirm
    it recovers gracefully and explains itself. Tighten the instructions — not a flowchart — until the plans
    are reliable. (Each test run consumes credits.)
6.  **Publish to a channel.** Publish the agent and connect it to **Teams** and/or a website so real users
    can reach it. You've shipped an agent that runs a task, not just answers a question.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the
numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright
tool in `tooling/screenshots/`._

## Make it better

- **[Make it autonomous.](studio-autonomous-triggers.md)** Add an event trigger so the agent acts when
  something happens — a form is submitted, a file lands — with no user prompt. Autonomy extends generative
  orchestration; remember these events bill per event, with no license discount.
- **[Add more tools / an MCP integration.](studio-mcp-tool-integration.md)** More tools give the planner more
  moves — but keep instructions tight so it picks the right one.
- **[Estimate the credits before you scale.](../credit-estimator.md)** Because this harness bills for all
  usage, model the net cost at your real volume *before* you roll out widely.

> **📚 Learn more.** See [Agents powered by the GitHub Copilot harness](https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview)
> and [Overview of billing for agents powered by the GitHub Copilot harness](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
> on Microsoft Learn — the source of truth for capabilities and billing.

## Watch out for

- **Every action bills credits — including building and testing.** Unlike the standard harness (covered by an
  M365 Copilot license in M365 channels), the GitHub Copilot harness meters *all* usage. Keep an eye on
  test-run volume and set cost controls before a broad rollout.
- **Vague instructions produce vague plans.** The planner is only as good as the intent you give it. Name the
  steps, the boundaries, and the response format — don't assume it will guess your process.
- **Right-size the harness.** If the task really is a predictable, single-path conversation, you've overshot —
  the [standard harness](studio-first-agent.md) is cheaper and license-covered. Pick the engine for the job.

## Where this leads (going deeper)

You've moved from *authoring conversations* to *describing outcomes* — the core shift the GitHub Copilot
harness enables. From here, make the agent **autonomous** with triggers, give it **more tools**, and nail the
**publish + governance** story so it runs safely at scale. When low-code hits its ceiling, **Microsoft
Foundry** ([Stage 7](../stages/stage-7-foundry.md)) is the pro-code frontier beyond.

> **Next (within Stage 6):** [Configure an autonomous event-triggered agent](studio-autonomous-triggers.md)

## Related

- [Build your first Studio agent with a knowledge source + topic](studio-first-agent.md) — the standard-harness, license-covered route for rules-based flows
- [Pick the engine for the job](../pick-the-engine.md) — compare all three harnesses on capability, cost, and license coverage
- [Give a Studio agent a real action with a connector](studio-connector-action.md)

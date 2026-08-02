---
title: Orchestrate multiple agents and autonomous runs in Foundry
description: Move from one Foundry agent answering a prompt to a system of agents that hand work to each other and run when triggered, the engineered form of delegation.
stage: foundry
roles: [developer]
tags: [foundry, orchestration, multi-agent, autonomous, connected-agents, pro-code, frontier]
level: advanced
time: 90 min
status: walkthrough
prereqs: [azure-subscription, foundry-project, first-foundry-agent, developer-skills]
updated: 2026-06-04
---

# Orchestrate multiple agents and autonomous runs in Foundry

> Move from one agent answering a prompt to a *system* of agents that hand work to
> each other and run when triggered — the engineered version of "delegate the whole job."

**Stage:** Foundry · **For:** Developer · **Level:** Advanced · **Time:** 90 min

!!! warning "The most powerful — and most demanding — pattern"
    Multi-agent and autonomous orchestration is where the most can go right *and* wrong. The shapes below
    are representative; confirm orchestration and triggering against the current
    [Foundry Agent Service docs](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/). Build this
    only when a single agent genuinely can't.

## When to use this
The job is genuinely multi-step and specialized: a "planner" needs to break work down and route pieces to
focused agents (research, drafting, validation), or the agent must run **without a person in the loop** —
triggered by an event, on a schedule, end to end. This is [Stage 3 · Cowork](../stages/stage-3-cowork.md)'s
"hand off the whole job," rebuilt as engineered, observable software.

## What you'll need
- Two or more working [pro-code agents](foundry-first-agent.md), each with a *narrow* job and the
  [tools](foundry-mcp-tools.md) it needs.
- An [evaluation harness](foundry-evaluate-monitor.md) — autonomous systems must be measured, not trusted.
- For triggered runs: the **event source or schedule** and the identity the run executes as.
- A hard answer to "what's the worst this can do unattended?" — and a guardrail for it.

## Try it now — a connected-agent pattern
Give one orchestrator agent access to specialist agents as tools, and let it route. Representative shape:

```python
# Specialists, each narrow and well-described.
researcher = project.agents.create_agent(model="gpt-4o", name="researcher",
    instructions="Find and summarize source material. Return citations. Do not draft final copy.")
drafter = project.agents.create_agent(model="gpt-4o", name="drafter",
    instructions="Write the deliverable from provided research only. Flag any unsupported claim.")

# Orchestrator that can call the specialists as connected tools.
orchestrator = project.agents.create_agent(
    model="gpt-4o",
    name="orchestrator",
    instructions=(
        "Plan the task, call the researcher for facts, then the drafter to write it. "
        "Never write the final draft yourself; never let the drafter invent facts."
    ),
    tools=[researcher, drafter],   # representative: connected/sub-agent wiring — see docs
)
```

**Why this works:** each agent has **one job and clear boundaries**, and the orchestrator's instructions
enforce the hand-offs. Narrow, well-described agents are far easier to evaluate and debug than one
do-everything agent.

## Step by step
1. **Decompose the job.** Write the workflow as a flowchart of discrete steps before any code. Each step
   that needs judgement becomes a candidate agent; each external call becomes a tool.
2. **Build narrow specialists.** Keep every agent's job small and its boundaries explicit ("return
   citations", "never invent facts"). Test each one in isolation against its own eval set.
3. **Add an orchestrator.** Give one agent the plan and access to the specialists as connected tools.
   Its instructions encode the hand-off rules and the things no agent may do.
4. **Run attended first.** Drive the whole flow with a human watching, logging every hand-off and tool
   call. Read the traces — orchestration bugs hide in *who called what, with what*.
5. **Make it autonomous deliberately.** Only once attended runs are reliable, attach the trigger (event or
   schedule) so it runs without a prompt. Scope its identity tightly and keep the full run trace.
6. **Guardrail the blast radius.** Put limits on loops, spend, and irreversible actions; require a human
   step for anything you can't undo; and alert on anomalies via your
   [monitoring](foundry-evaluate-monitor.md).

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Specialize further.** Swap a general model for a cheaper or fine-tuned one on the narrow agents where
  it's enough — orchestration lets you right-size each step.
- **Add a validator agent.** A final agent whose only job is to check the deliverable against the rules
  catches a surprising number of failures before they ship.
- **Make hand-offs typed.** Pass structured data between agents, not free text, so each step's contract is
  explicit and testable.

## Watch out for
- **Autonomy multiplies risk.** A single bad answer is a complaint; an unattended loop taking actions is
  an incident. Earn autonomy with attended runs and hard guardrails — never start there.
- **Loops and cost run away.** Agents calling agents can spiral. Cap iterations, set spend limits, and
  fail safe.
- **Debuggability is the whole game.** Without complete traces of every hand-off and tool call, a
  multi-agent failure is nearly impossible to diagnose. Instrument first, scale second.

## Where this leads (the frontier)
This is the deep end of the frontier — a system of agents doing real work unattended. Everything it
touches must be [evaluated and monitored](foundry-evaluate-monitor.md) and
[governed and secured](foundry-govern-secure.md). There's no Stage 7 beyond this; the discipline now is
restraint — build a multi-agent system only when a single agent truly can't carry the job.

## Related
- [Stage 3 · Cowork](../stages/stage-3-cowork.md) — the no-code "delegate the whole job" this engineers
- [Give a Foundry agent custom tools and MCP](foundry-mcp-tools.md) — what each specialist uses to act
- [Evaluate and monitor a Foundry agent](foundry-evaluate-monitor.md) — non-negotiable for autonomy

---
title: Graduate a Copilot Studio agent into pro-code Foundry
description: Re-platform a working low-code agent that hit a real ceiling as engineered Foundry software, keeping the behavior you proved and gaining the control you need.
stage: foundry
roles: [developer, maker]
tags: [foundry, copilot-studio, migration, pro-code, frontier]
level: advanced
time: 90 min
status: walkthrough
prereqs: [azure-subscription, foundry-project, studio-agent, developer-skills]
updated: 2026-06-04
---

# Graduate a Copilot Studio agent into pro-code Foundry

> Take a working low-code agent that has hit a real ceiling and re-platform it as
> engineered software — keeping the behaviour you proved, gaining the control you needed.

**Stage:** Foundry · **For:** Developer, Maker · **Level:** Advanced · **Time:** 90 min

!!! warning "A re-platform, not an export button"
    There is no one-click "Studio → Foundry" converter. Graduating means **re-implementing the agent's
    design** on a pro-code platform. The value you carry over is the *design* — the instructions,
    knowledge, and tested behaviour — not the wiring. Verify all APIs against the
    [Foundry docs](https://learn.microsoft.com/en-us/azure/ai-foundry/).

## When to use this
Your Studio agent works and people rely on it — but it's bumping a real wall: you need a custom or
fine-tuned model, autonomous multi-agent orchestration, evaluation pipelines, or MCP tools at a scale
the designer can't express. The agent has earned its way to the frontier. This is the path that most
teams actually take *to* Foundry — graduating something proven, not starting from a blank Azure project.

## What you'll need
- The **existing Studio agent**: its instructions, knowledge sources, topics/flows, and actions.
- A **Foundry project** with a deployed model, and the
  [first pro-code agent](foundry-first-agent.md) plumbing already working.
- A **clear, written reason** Studio couldn't do it — this becomes your design north star.
- A **migration owner** for the Azure resources, identity, and data the agent will now touch directly.

## Try it now — the design carry-over
Before writing code, capture the Studio agent as a portable spec. Use this prompt (in Copilot Chat) with
the agent's current config pasted in:

```
Here is my Copilot Studio agent's configuration: [paste instructions, knowledge sources, topics, actions].
Produce a platform-neutral spec I can rebuild in pro-code:
- System instructions (verbatim-ish, cleaned up)
- Knowledge sources and how each is grounded
- Each topic as: trigger intent, required inputs, happy-path steps, escalation
- Each action as: what it calls, inputs/outputs, and the identity it runs as
- The ONE capability Studio couldn't do that justifies this move
```

**Why this works:** it forces you to separate *what the agent does* (carries over) from *how Studio did
it* (gets rebuilt). The last line keeps you honest — if you can't name the capability, the agent should
stay in Studio.

## Step by step
1. **Freeze the source agent.** Snapshot the Studio agent's instructions, knowledge, topics, and actions.
   This spec is your acceptance criteria — the Foundry version must match its proven behaviour.
2. **Map each piece to a Foundry primitive.** Instructions → agent `instructions`. Knowledge → a
   grounding tool (e.g. Azure AI Search). Topics → tool/function calls and orchestration logic. Actions →
   function tools or OpenAPI/MCP tools. Note anything that has *no* clean mapping — that's your real work.
3. **Rebuild the core agent.** Start from your [first-agent](foundry-first-agent.md) script; port the
   instructions verbatim and attach the grounding tool so parity testing can begin early.
4. **Re-implement actions as tools.** Each Studio action becomes a function/OpenAPI/MCP tool the agent can
   call — now running under an Entra ID identity you control, not the connector's. See
   [custom + MCP tools](foundry-mcp-tools.md).
5. **Parity-test against the spec.** Replay the Studio agent's tested conversations through the Foundry
   version and diff the outcomes. Treat the [evaluation harness](foundry-evaluate-monitor.md) as part of
   "done," not a nice-to-have.
6. **Cut over deliberately.** Run both side by side, route a slice of traffic to Foundry, watch the
   evals, then move the rest. Keep the Studio agent as a fallback until the new one has earned trust.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Only graduate what needs it.** If most of the agent is fine in Studio and *one* capability needs
  pro-code, consider keeping the agent in Studio and calling a small Foundry-hosted tool for the hard part.
- **Add the capability you came for.** Now that parity is proven, build the custom model, autonomous
  orchestration, or evaluation pipeline that Studio couldn't do — the reason you're here.
- **Codify the cutover.** Put the whole rebuild in source control and your pipeline so the migration is
  repeatable and reviewable.

## Watch out for
- **Don't migrate for prestige.** "We moved it to Foundry" is not a win on its own. If Studio met the
  need, graduating adds cost and ownership for no benefit. Name the capability or stay put.
- **Identity changes hands.** In Studio, connectors often acted with a maker/connection identity. In
  Foundry the agent acts with an Entra ID identity *you* configure — re-check every data permission.
- **Behaviour can drift.** A different model or tool wiring can change answers subtly. Parity tests are
  the only way to catch it before users do.

## Where this leads (the frontier)
Once the graduated agent is at parity and carrying its new capability, deepen it with
[MCP and custom tools](foundry-mcp-tools.md), front it with
[evaluation and continuous monitoring](foundry-evaluate-monitor.md), and — if the problem is genuinely
multi-step and autonomous — move to [orchestration](foundry-autonomous-orchestration.md). Then make sure
it's [governed and secured](foundry-govern-secure.md) like the production software it now is.

## Related
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md) — where the agent came from
- [Build your first pro-code agent](foundry-first-agent.md) — the plumbing this builds on
- [Secure and govern Foundry agents](foundry-govern-secure.md) — the production bar

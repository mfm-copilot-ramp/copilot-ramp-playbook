---
title: "Engineering: Autonomous alert-to-runbook-to-escalation on the GitHub Copilot harness"
description: Build an on-call agent that matches alerts to runbooks, guides safe remediation, and escalates incidents with generative orchestration.
stage: studio
harness: github-copilot
roles: [maker, developer, it-admin]
tags: [copilot-studio, engineering, on-call, runbook, incident, github-copilot-harness, generative-orchestration, functional]
level: intermediate
time: 4–5 hours
status: walkthrough
prereqs: [copilot-studio-access, knowledge-source]
updated: 2026-08-14
---

# Engineering: Autonomous alert-to-runbook-to-escalation on the GitHub Copilot harness

> Turn an alert into a grounded runbook plan, safe step-by-step remediation, and the right escalation path without wiring every incident branch.

**Stage:** Copilot Studio · **For:** Engineering teams, SREs, on-call responders · **Level:** Intermediate · **Time:** 4–5 hours

!!! abstract "Which harness? This one uses the GitHub Copilot harness"
    Every Copilot Studio agent runs on a [harness](../pick-the-engine.md) — the engine underneath it. This
    walkthrough builds on the **GitHub Copilot harness**, the autonomous, agentic engine: it **reasons
    through the whole goal on its own**, **retries and finds another path when a step fails**, works across
    your **Word, Excel, PowerPoint, and PDF** files, and keeps context with **skills and memory** — so you
    describe the outcome instead of authoring every path. That capability is why it's the engine to grow into.

    The honest tradeoff: it bills **Copilot Credits for all usage — building, testing, *and* running — and a
    Microsoft 365 Copilot license *never* covers it.** Want this same use case as predictable, rules-based
    topics your Microsoft 365 Copilot license already covers in Microsoft 365 channels? Build the
    **[standard-harness version](studio-functional-engineering-oncall.md)** instead.
    [Compare the engines](../pick-the-engine.md) · [estimate the net cost](../credit-estimator.md).

## When to use this

Reach for this when an alert arrives and the responder has to search across runbooks, service ownership,
dependencies, recent incidents, and escalation notes under pressure. The GitHub Copilot harness fits because
the agent can plan the response: identify the service, choose the closest runbook, guide one step at a time,
and escalate when the documented path runs out.

The use case is the same as the standard-harness on-call agent: match the alert to the right runbook, guide
safe remediation, and open an incident or page the next tier when needed. The difference is that you express
the operating model in instructions instead of authoring alert-intake, remediation, context, and escalation
topics.

## What you'll need

- Copilot Studio access with Copilot Credits available for building, testing, and running.
- Current, validated runbooks/playbooks with deprecated procedures removed.
- A service catalog with owners, rotations, dependencies, and escalation paths.
- Incident history or recent postmortems for context.
- A Power Automate connector to your incident and paging tools.
- A reliability lead to validate the read-first safety model before production use.

## Try it now — the prompt

Use this to draft the agent's instructions before you build:

```
Write outcome-focused instructions for a Copilot Studio agent on the GitHub Copilot harness.

Use case: help on-call responders move from alert to runbook to escalation for [Company Name].
The agent must:
- Take an alert, symptom, service name, or incident link and identify the likely service.
- Consult validated runbooks, the service catalog, dependencies, escalation matrix, and recent postmortems.
- Match the alert to the best runbook, state confidence, and guide the responder one step at a time.
- Suggest read-only diagnostic checks freely, but require explicit confirmation before any production-changing step.
- Never invent a remediation step; if no runbook matches or the runbook is exhausted, escalate.
- Use the incident/paging action only when escalation is needed or the responder asks to open an incident.
- Respond with: matched service, runbook step, safety note, expected result, next question, and escalation option.
```

This works because the instructions make read-first safety, runbook grounding, and escalation rules explicit.
Generative orchestration can plan the incident path while staying inside documented procedures.

## Step by step

1. **Create the agent on the GitHub Copilot harness.** In Copilot Studio, create a new agent. On the
   **Build** tab, use the **instructions editor** for the on-call operating model and the **components panel**
   for knowledge, tools, and triggers.
2. **Write the instructions around safety.** Define the agent's role, concise incident-response tone, and
   boundaries: it helps responders, never invents runbook steps, gates production-changing actions behind
   explicit confirmation, and escalates when confidence is low. Include the reasoning steps: identify service,
   match runbook, surface context, walk one step at a time, then escalate if needed.
3. **Confirm generative orchestration is on.** The GitHub Copilot harness uses generative orchestration so the
   planner chooses the right runbook, context, and tool for each alert. Do not author trigger phrases for
   specific alerts; describe when to use runbooks, service ownership data, and incident tools in the
   instructions.
4. **Add the knowledge sources.** From the components panel, add validated runbooks, service catalog,
   escalation matrix, dependency map, and recent postmortems. Test grounding with a known alert and confirm
   the agent cites or names the matching runbook instead of guessing.
5. **Add the incident and paging tools.** Add the Power Automate action that opens the incident, creates the
   Teams channel with runbook and context, and pages the next tier. In the instructions, say to use it only
   when the runbook is exhausted, no match is confident, or the responder explicitly asks to escalate.
6. **Test the whole incident path in the Test pane.** Paste a realistic alert with service, severity, and
   symptoms. Confirm the agent identifies the service, matches a runbook, asks for each result before moving
   on, and offers escalation when appropriate. Each test run consumes Copilot Credits.
7. **Break a step and confirm recovery.** Use an alert with no matching runbook, a stale service name, or a
   production-changing remediation. The agent should ask a clarifying question, choose another documented path,
   or escalate rather than improvising.
8. **Publish after a drill.** Run a game-day or incident drill before relying on the agent. When it passes,
   publish to the intended responder channel and make knowledge-source ownership part of the on-call process.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the
numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright
tool in `tooling/screenshots/`._

## Make it better

- Add read-only metrics or log lookup tools so the agent can help confirm whether a runbook step worked.
- Add an autonomous trigger from alert notifications so the agent drafts the initial runbook match before the
  responder asks.
- Generate a postmortem timeline from the incident channel once the incident resolves.
- Log alerts with no matching runbook so the reliability team can close documentation gaps.

## Watch out for

- **Every action bills Copilot Credits, including build and test.** Incident drills can create many test runs;
  set cost controls and keep validation scenarios intentional.
- **Right-size the harness.** If your alert response is a predictable single-path flow, use the
  [standard-harness version](studio-functional-engineering-oncall.md) instead; it is covered in Microsoft 365
  channels for licensed users.
- **Inventing steps.** If no runbook matches, the agent escalates. It must not improvise remediation during an
  incident.
- **Skipping confirmations.** Production-changing steps must always be restated and confirmed by the
  responder.
- **Stale runbooks and ownership.** Outdated procedures or wrong rotation data send responders the wrong way.
  Keep sources current and dated.

## Where this leads (the ramp)

This gives one responder an agent that can reason through documented incident response while a human confirms
risky steps. When you want agents that watch telemetry, correlate signals, and coordinate across services,
move into Foundry's autonomous orchestration patterns.

> **Next:** [Foundry: autonomous multi-agent orchestration](foundry-autonomous-orchestration.md)

## Related

- [Standard-harness version](studio-functional-engineering-oncall.md)
- [Pick the engine for the job](../pick-the-engine.md)
- [Engineering On-Call Runbook Agent solution template](../solutions/engineering-oncall-runbook-agent.md)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)
- [Agents powered by the GitHub Copilot harness](https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview)
- [Copilot Studio documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)

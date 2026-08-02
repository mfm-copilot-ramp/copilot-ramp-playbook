---
title: "Engineering: alert to runbook to escalation"
description: Build a Copilot Studio on-call agent that matches an alert to the right runbook step, guides the fix, and knows exactly who to escalate to when it runs out.
stage: studio
roles: [maker, developer, it-admin]
tags: [copilot-studio, engineering, on-call, runbook, incident, functional]
level: intermediate
time: 4–5 hours
status: walkthrough
updated: 2026-06-05
---

# Engineering: alert to runbook to escalation

> Meet the on-call engineer at the worst moment — an alert just fired — and turn it into action: match the alert to the right runbook step, guide the fix, and know exactly who to escalate to when the runbook runs out.

**Stage:** Copilot Studio · **For:** Engineering teams, SREs, on-call responders · **Level:** Intermediate · **Time:** 4–5 hours

> **📐 Full blueprint & test plan →** [Engineering On-Call Runbook Agent](../solutions/engineering-oncall-runbook-agent.md) — the copy-paste system prompt, topic specs, and test-case table behind this build.

---

## When to use this

Reach for this when your incident response depends on runbooks that are correct but hard to find under pressure, and an escalation matrix that nobody remembers at 3 a.m. A runbook agent turns "which wiki page was that?" into a guided, one-step-at-a-time response — and bootstraps the incident channel and paging when the runbook doesn't resolve it.

**Why Stage 6:** This agent orchestrates a real response flow: match the alert, walk the runbook conditionally, gate any production-changing step behind a confirmation, then open an incident and page the next tier through Power Automate. The conditional stepping and the integrated actions are what make this a Copilot Studio agent rather than a simple knowledge lookup.

---

## What you'll need

- A Copilot Studio environment and maker permissions
- Current, validated runbooks/playbooks (no drafts or deprecated procedures)
- A service catalog (owners, rotations, dependencies) and an escalation matrix
- Incident history / recent postmortems for context
- A Power Automate connector to your incident and paging tools
- A reliability lead to validate the read-first safety model

---

## Try it now — the prompt

Paste this into the agent's instructions and adapt the brackets — it works because read-first safety and one-step-at-a-time pacing are written into the rules, so the agent can't run ahead of the responder.

The defining design decision is **read-first safety**. The agent suggests diagnostics and read-only checks freely, but any step that changes production state must be restated and explicitly confirmed by the engineer. And it must never invent a step the runbook doesn't contain — during an incident, a confident wrong action makes everything worse.

Start from this prompt and adapt it:

```
You are the On-Call Assistant for [Company Name]'s engineering team.

Take the alert or symptom, find the matching runbook, guide the engineer
through it one step at a time, and know the escalation path when it doesn't
resolve.

When an alert comes in:
1. Identify the service and match the alert/symptom to a runbook.
2. Walk the runbook ONE step at a time, waiting for the result each time.
3. Surface context: service owner, dependencies, recent related incidents.
4. When the runbook is exhausted, give the escalation path and offer to open
   an incident.

Rules:
- Read-first. For any production-changing step, restate it and require explicit
  confirmation before proceeding.
- Never invent a runbook step. If nothing matches, say so and escalate.
```

---

## Step by step

1. **Create the agent.** In Copilot Studio, create the on-call agent and paste the system prompt. Name it for the team (e.g. "On-Call Assistant").
2. **Connect knowledge.** Add runbooks, the service catalog, the escalation matrix, recent postmortems, and the dependency map.
3. **Build the alert-intake topic.** Identify the service, match the alert/symptom to a runbook, and route to escalation if nothing matches confidently.
4. **Build the guided-remediation topic.** Present one step at a time, wait for the result, and gate every state-changing step behind an explicit confirmation.
5. **Build the context topic.** Surface owner, dependencies, and recent related incidents on request or at incident start.
6. **Build the escalation topic.** Return the correct next tier and how to page them, and offer to open an incident.
7. **Add the incident action.** Wire Power Automate to open the incident, create the Teams channel with runbook + context, and page the next tier. Always include an inline fallback.
8. **Validate in a drill.** Run a game-day / incident drill before relying on it in production. Then baseline MTTR for review.

---

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- Let the agent **read recent metrics/logs** to confirm whether a runbook step had the intended effect.
- Generate a **postmortem timeline** from the incident channel when it resolves.
- Log alerts that had **no matching runbook** so the team can close the gaps.

---

## Watch out for

- **Inventing steps.** The single biggest risk. If no runbook matches, the agent escalates — it never improvises a remediation.
- **Skipping confirmations.** Production-changing steps must always be restated and confirmed. Test this on every release.
- **Stale runbooks and ownership.** Outdated procedures or wrong on-call data send the responder the wrong way. Keep sources current and dated.
- **Over-reliance before validation.** Don't put it in the critical path until it's passed a drill.

## Where this leads (the ramp)

This agent guides one responder through one incident, with a human confirming every risky step. When you want agents that watch telemetry, correlate signals, and coordinate a response across services on their own, you've reached what Azure AI Foundry's autonomous orchestration is built for.

> **Next:** [Foundry: autonomous multi-agent orchestration](foundry-autonomous-orchestration.md)

## Related

- [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Knowledge sources](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)
- [Power Automate](https://learn.microsoft.com/en-us/power-automate/)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

!!! tip "Ready to build? Use the solution template."
    The [Engineering On-Call Runbook Agent solution template](../solutions/engineering-oncall-runbook-agent.md) has the system prompt, topic specs, knowledge-source table, Power Automate incident spec, and the read-first test matrix.

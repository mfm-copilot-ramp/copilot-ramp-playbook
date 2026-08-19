---
title: "Field Service: Autonomous symptom-to-dispatch triage on the GitHub Copilot harness"
description: Build an agentic triage assistant that reasons from symptoms or fault codes to likely cause, safety escalation, and work-order dispatch.
stage: studio
harness: github-copilot
roles: [maker, it-admin]
tags: [copilot-studio, field-service, triage, dispatch, github-copilot-harness, generative-orchestration, functional]
level: intermediate
time: 4–5 hours
status: walkthrough
prereqs: [copilot-studio-access, knowledge-source]
updated: 2026-08-14
---

# Field Service: Autonomous symptom-to-dispatch triage on the GitHub Copilot harness

> Turn a reported symptom or fault code into a safety-aware cause, dispatch path, and work-order draft with an agent that plans the triage.

**Stage:** Copilot Studio · **For:** Field service teams, dispatchers, service operations · **Level:** Intermediate · **Time:** 4–5 hours

!!! abstract "Which harness? This one uses the GitHub Copilot harness"
    Every Copilot Studio agent runs on a [harness](../pick-the-engine.md) — the engine underneath it. This
    walkthrough builds on the **GitHub Copilot harness**, the autonomous, agentic engine: it **reasons
    through the whole goal on its own**, **retries and finds another path when a step fails**, works across
    your **Word, Excel, PowerPoint, and PDF** files, and keeps context with **skills and memory** — so you
    describe the outcome instead of authoring every path. That capability is why it's the engine to grow into.

    The honest tradeoff: it bills **Copilot Credits for all usage — building, testing, *and* running — and a
    Microsoft 365 Copilot license *never* covers it.** Want this same use case as predictable, rules-based
    topics your Microsoft 365 Copilot license already covers in Microsoft 365 channels? Build the
    **[standard-harness version](studio-functional-field-service-triage.md)** instead.
    [Compare the engines](../pick-the-engine.md) · [estimate the net cost](../credit-estimator.md).

## When to use this

Use this when a dispatch decision depends on more than one lookup. The agent may need to capture the model, interpret a symptom or fault code, check safety rules, consult manuals and decision trees, map parts to the model, choose a dispatch path, and pre-fill a work order.

The [standard-harness version](studio-functional-field-service-triage.md) is a good fit when the decision tree is stable and predictable. Use this GitHub Copilot harness version when the intake varies enough that you want a planner to decide the next best step, recover from missing information, and use the right tool at the right time.

## What you'll need

- Copilot Studio access with Copilot Credits available for building, testing, and running this harness
- Current equipment manuals and a fault-code database
- Validated troubleshooting decision trees, not tribal knowledge
- Your dispatch and SLA policy plus a parts catalog mapped to equipment models
- A Power Automate connector to your field-service or work-order system
- Sign-off from a safety lead on hazard-handling rules

## Try it now — the prompt

Draft the agent's instructions before you build:

```
Write the instructions for a Copilot Studio agent on the GitHub Copilot harness named
"Service Triage" for [Company Name].

The agent turns a reported symptom or fault code into the most likely cause and one
dispatch path: SELF-FIX, REMOTE, or DISPATCH.

Include:
- role, tone, and boundaries, including an absolute safety rule: for hazards such as electrical, gas, pressure, height, smoke, sparks, or leaks, never recommend self-fix
- the steps the agent should reason through: capture equipment model, asset ID or location if available, fault code or symptom, hazard indicators, likely cause from approved service knowledge, SLA window, and likely parts
- which knowledge to consult by purpose: manuals, fault-code database, validated decision trees, dispatch/SLA policy, and parts catalog
- when to use the work-order tool: create or pre-fill a work order only for DISPATCH paths or when the dispatcher asks, and include model, symptom/fault code, hazard flag, likely cause, parts, SLA, and triage notes
- the response format: safety status, likely cause with reference, one dispatch path, SLA/parts, work-order status, and next step
```

This works because it makes safety the first planning constraint and gives the agent one allowed dispatch decision. The tool is described by purpose, so the planner can call it when dispatch is warranted instead of waiting for a trigger phrase.

## Step by step

1. **Create the agent.** In Copilot Studio, create a new agent on the GitHub Copilot harness. In the **Build** tab, use the **instructions editor** for behavior and the **components panel** for knowledge and tools. Name it "Service Triage" or whatever dispatchers will recognise.
2. **Write outcome-focused instructions.** Adapt the prompt above into instructions. Include role, tone, safety boundaries, reasoning steps, knowledge by purpose, the work-order tool by purpose, and the response format. Do not author trigger phrases for smoke, fault codes, or dispatch; generative orchestration reads intent and plans the triage.
3. **Confirm generative orchestration is on.** Keep the GitHub Copilot harness's generative planning behavior enabled so the agent can ask for missing model details, branch on hazard rules, and choose the correct next step.
4. **Add the knowledge sources.** Add equipment manuals, the fault-code database, validated troubleshooting decision trees, the dispatch/SLA policy, and the parts catalog. Date the sources so dispatch can spot stale procedures.
5. **Add the work-order action.** Add the Power Automate flow that creates or pre-fills a work order in your field-service system. In the instructions, say exactly when to use it: DISPATCH recommendations or explicit dispatcher request. Include required fields such as model, symptom or fault code, hazard flag, likely cause, parts, SLA, and triage notes. If the connector fails, the agent should return a manual work-order summary.
6. **Test safety first in the Test pane.** Run hazard scenarios before normal triage: smoke, sparks, gas, leaks, pressure, height, and electrical symptoms. The agent should escalate to a qualified technician and never recommend self-fix. Each test run consumes credits.
7. **Test the full dispatch matrix.** Try a known fault code, an ambiguous symptom, a model with specific parts, and a no-match case. Confirm the agent cites the manual or fault-code reference, returns exactly one path, gives the SLA window, and uses the work-order tool only when appropriate.
8. **Break a step on purpose.** Remove a required work-order field, ask about an unsupported model, or make the connector unavailable. The agent should recover by asking for the missing input, routing to a dispatcher, or returning the manual fallback instead of guessing.
9. **Publish and pilot with dispatch.** Publish to the channel dispatchers use, pilot with a small team, and review first-time-fix and truck-roll outcomes before expanding.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the
numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright
tool in `tooling/screenshots/`._

## Make it better

- Accept a photo of the unit or error display so the agent can match visually documented faults.
- Add an inventory check so DISPATCH is only recommended when the likely part is available in the local depot.
- Capture outcome feedback from the completed work order so you can review whether the triage was right.
- Add an autonomous trigger after governance is ready, such as starting triage when a service request lands. Model the credit impact before enabling it.

## Watch out for

- **Every action bills Copilot Credits, including build and test.** Safety testing can be run-heavy, so set cost controls and keep test batches deliberate.
- **Right-size the harness.** If the triage is a stable single-path decision tree, use the [standard-harness version](studio-functional-field-service-triage.md) instead; Microsoft 365 Copilot licensing can cover that route in Microsoft 365 channels.
- **Safety shortcuts are unacceptable.** Never let convenience or cost soften the hazard rule. Test it on every release.
- **Stale manuals are dangerous.** An outdated procedure is worse than none. Keep knowledge current and dated.
- **Over-confident matching causes bad dispatch.** If the symptom is ambiguous, route to a human instead of inventing the most plausible cause.
- **Parts accuracy matters.** A wrong part hint causes a second truck roll. Keep the parts-to-model mapping clean.

## Where this leads (the ramp)

Studio can run the structured triage, safety gate, and work-order action. When you want fault matching from photos or feedback-driven model improvement, move into Foundry.

> **Next:** [Foundry: fine-tune and serve a model](foundry-fine-tune-serve.md)

## Related

- [Standard-harness version](studio-functional-field-service-triage.md)
- [Pick the engine for the job](../pick-the-engine.md)
- [Field Service Triage Agent solution template](../solutions/field-service-triage-agent.md)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

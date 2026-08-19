---
title: "Field Service: symptoms to dispatch path"
description: Build a Copilot Studio agent that turns a symptom or fault code into the likely cause and the right dispatch path, so easy fixes never become a truck roll.
stage: studio
harness: standard
roles: [maker, it-admin]
tags: [copilot-studio, field-service, triage, dispatch, functional]
level: intermediate
time: 4–5 hours
status: walkthrough
updated: 2026-06-05
---

# Field Service: symptoms to dispatch path

> Take a reported symptom or fault code, return the most likely cause, and recommend the right dispatch path — so the easy fixes never become a truck roll, and the truck that does roll fixes it first time.

**Stage:** Copilot Studio · **For:** Field service teams, dispatchers, service operations · **Level:** Intermediate · **Time:** 4–5 hours

> **📐 Full blueprint & test plan →** [Field Service Triage Agent](../solutions/field-service-triage-agent.md) — the copy-paste system prompt, topic specs, and test-case table behind this build.

---

!!! abstract "Which harness? This one uses the standard harness"
    Every Copilot Studio agent runs on a [harness](../pick-the-engine.md) — the engine underneath it. This
    walkthrough builds on the **standard harness**: you author the topics and rules, the flow is predictable,
    and for Microsoft 365 Copilot-licensed users **it's covered inside Microsoft 365 channels** (no extra
    credits) — the lowest-cost choice for structured, rules-based work.

    Want the same use case to **reason through the task on its own** — planning multi-step work, recovering
    when a step fails, and working across your files? Build the
    **[GitHub Copilot harness version](studio-functional-field-service-triage-generative.md)** instead. It's the autonomous engine to grow into; the
    honest tradeoff is that it bills **Copilot Credits for all usage** and a Microsoft 365 Copilot license
    never covers it. [Compare the engines](../pick-the-engine.md) · [estimate the net cost](../credit-estimator.md).

## When to use this

Reach for this when dispatch decisions depend on knowledge that lives in manuals, fault-code tables, and the heads of your most experienced techs. The cost of getting it wrong is real: an unnecessary truck roll, or a visit without the right part. A triage agent puts that knowledge one question away and pre-fills the work order so the assigned tech starts informed.

**Why Stage 6:** This isn't a single Q&A lookup. The agent runs a structured intake, branches on a hard safety rule, ranks likely causes, chooses one of three dispatch paths, and then creates a work order through Power Automate. The branching logic and the action at the end are why this belongs in Copilot Studio rather than a low-code Agent Builder bot.

---

## What you'll need

- A Copilot Studio environment and maker permissions
- Current equipment manuals and a fault-code database
- Validated troubleshooting decision trees (not tribal knowledge)
- Your dispatch/SLA policy and a parts catalog mapped to models
- A Power Automate connector to your field-service / work-order system
- Sign-off from a safety lead on the hazard-handling rules

---

## Try it now — the prompt

Paste this into the agent's instructions and adapt the brackets — it works because the hazard rule and the single-dispatch-path instruction force a safe, decisive recommendation instead of a hedge.

The defining design decision here is **safety**. Before anything else, agree the hazard classes — electrical, gas, pressure, height, anything that smokes, sparks, or leaks — and make the rule absolute: those never get a self-fix recommendation, they escalate to a qualified technician.

Start from this prompt and adapt it:

```
You are the Field Service Triage agent for [Company Name].

Take the reported symptom or fault code, identify the most likely cause from
our approved service knowledge, and recommend the right dispatch path.

When a problem is reported:
1. Confirm the equipment model and capture the fault code or symptom.
2. Return the most likely cause(s), citing the manual or fault-code reference.
3. Recommend ONE dispatch path: SELF-FIX, REMOTE, or DISPATCH (with likely parts).
4. State the SLA/response window for this asset's service tier.

Rules:
- Safety first. For any hazard, do NOT recommend self-fix — escalate to a
  qualified technician immediately.
- Never guess a cause the knowledge base doesn't support — route to a dispatcher.
```

---

## Step by step

1. **Create the agent.** In Copilot Studio, create the triage agent and paste the system prompt. Name it for the team (e.g. "Service Triage").
2. **Connect knowledge.** Add equipment manuals, the fault-code database, validated decision trees, the dispatch/SLA policy, and the parts catalog.
3. **Build the intake topic.** Capture the model and fault code/symptom. Detect safety-relevant words (smoke, gas, sparks, leak) and branch straight to safety escalation.
4. **Build the cause-matching topic.** Rank likely causes against the manuals and fault-code DB, each with a reference. If nothing matches confidently, hand to a human.
5. **Build the dispatch-decision topic.** Return exactly one path — self-fix, remote, or dispatch — with parts and the SLA window when on-site is needed.
6. **Add the work-order action.** Wire the Power Automate flow to create or pre-fill a work order with the triage notes. Always include a manual fallback if it fails.
7. **Test safety first.** Run every hazard-class test case before anything else, then the rest of the matrix from the solution template.
8. **Pilot with dispatch.** Roll out to a small dispatch team, baseline first-time-fix and truck-roll rates, and review after 30 days.

---

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- Accept a **photo** of the unit or error display so the agent can match visually documented faults.
- Add an **inventory check** so dispatch is only recommended when the part is in the local depot.
- Capture **outcome feedback** (was the triage right?) to improve cause-matching over time.

---

## Watch out for

- **Safety shortcuts.** Never let a convenience or cost optimisation soften the hazard rule. Test it on every release.
- **Stale manuals.** An outdated procedure is worse than none. Keep your knowledge sources current and dated.
- **Over-confident matching.** If the symptom is ambiguous, the agent must route to a human, not invent the most plausible cause. Verify the "no match" path works.
- **Parts accuracy.** A wrong part hint causes a second truck roll. Keep the parts-to-model mapping clean.

## Where this leads (the ramp)

Studio handles the structured triage and the safety gate well. When you want the agent to match faults from photos or learn from outcome feedback, you need a custom-tuned model — and serving that is Azure AI Foundry's job.

> **Next:** [Foundry: fine-tune and serve a model](foundry-fine-tune-serve.md)

## Related

- [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Knowledge sources](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)
- [Power Automate](https://learn.microsoft.com/en-us/power-automate/)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

!!! tip "Ready to build? Use the solution template."
    The [Field Service Triage Agent solution template](../solutions/field-service-triage-agent.md) has the system prompt, topic specs, knowledge-source table, Power Automate work-order spec, and the safety-first test matrix.

---
title: "Legal: Guide employees through contract routing and requirements"
description: Build a Copilot Studio agent that gives employees a clear path for getting contracts reviewed, what type, what Legal needs, and where to submit, before intake.
stage: studio
roles: [maker, it-admin, champion]
tags: [copilot-studio, legal, contracts, routing, process-navigation, functional]
level: intermediate
time: 2–3 hours
status: walkthrough
updated: 2026-06-04
---

# Legal: Guide employees through contract routing and requirements

> Give employees a clear, consistent path for getting contracts reviewed — what type of contract, what Legal needs, where to submit — without every query landing on the legal team's intake channel first.

**Stage:** Copilot Studio · **For:** Maker, IT Admin, Champion · **Level:** Intermediate · **Time:** 2–3 hours

> **🧱 Build-only walkthrough.** A hands-on Studio build with no separate solution-template blueprint — the steps below are the complete spec.

## When to use this

Employees who need a contract reviewed often don't know where to start. Is this an NDA or a service agreement? Does this need Legal or can procurement handle it? What information does Legal need from me? How urgent is "urgent"?

These are process navigation questions. They don't require legal judgment — they require someone to explain the intake process clearly. That is exactly what this agent does: it acts as the front-end to Legal's intake workflow, routing employees to the right process based on what they actually have.

**Why this is distinct from the Legal Compliance Guidance agent:** the Compliance agent answers policy questions (GDPR, data handling, COI declarations). This agent handles the contract intake process specifically — a more structured, form-driven flow that routes by contract type and gets employees to the right queue faster.

**Why Studio (not just Agent Builder):** the value comes from the structured intake collection — contract type, counterparty, purpose, urgency — which feeds directly into a ticket or intake form submission. Topics handle the branching; actions can create the intake record automatically.

## What you'll need

- Copilot Studio access
- A contract intake process document approved by Legal (what information they need, for which contract types, at what SLAs)
- A contract intake form or shared inbox that the agent can direct employees to — or a Power Automate flow to submit the intake
- Legal team buy-in: they need to agree on the routing logic before building begins

## Try it now — the prompt

Run this prompt in Copilot Chat to scaffold the system prompt, type-identification topic, and intake flows — it works because it separates routing from review, keeping the agent on process and off legal judgment.

Work through these with Legal before opening Studio:

1. **What are the main contract types your employees encounter?** NDA, services agreement, SOW, supplier contract, partnership agreement, data processing agreement. Map these to the relevant intake path.
2. **What information does Legal need for each type?** The fields differ. An NDA needs counterparty name and purpose. An SOW needs scope, value, and business owner. Agree the required fields per contract type.
3. **What are the SLAs by urgency level?** Legal should define "standard" vs. "urgent" review timelines so the agent can set expectations accurately.

```
Design a Copilot Studio contract routing agent for [Company].
Knowledge source: [contract intake process guide — approved by Legal].
The agent should identify the contract type, collect required intake
fields, set SLA expectations, and route to the correct intake path.
Out of scope: contract review, negotiation, legal advice.
Escalate anything needing legal judgment to [Legal intake channel].

Give me: system prompt, contract type identification topic, intake
collection flow for NDA and services agreement, and SLA messaging.
```

## Step by step

1. **Create the agent.** Set instructions to:

    > *You are the Contract Routing Guide for [Company]. You help employees get contracts into the right Legal review process by identifying the contract type, collecting required information, and routing to the correct intake path. You do not give legal advice or review contract terms. For anything requiring legal judgment, redirect to [Legal intake channel]. Always cite SLAs from the process document.*

2. **Add the contract intake process document as the knowledge source.** This should include: contract type definitions, required information per type, SLAs by urgency level, what goes to Legal vs. Procurement vs. other teams.

3. **Build the contract type identification topic.** The starting point for almost every conversation.
    - Trigger phrases: "get a contract reviewed", "contract", "NDA", "agreement", "sign this", "send me the process for"
    - Flow: ask what type of agreement they have (NDA / services agreement / SOW / supplier contract / other) → branch to the appropriate intake flow for that type

4. **Build the NDA intake topic.** The most common contract type.
    - Collect: counterparty name and type, purpose of the NDA, any deadline, whether the counterparty has sent their own NDA or expects the company's standard form
    - Return: confirmation of the intake information + SLA expectation + link to the NDA request form (or submit via Power Automate action)

5. **Build the services / SOW intake topic.**
    - Collect: counterparty, scope summary, contract value, business owner, start date, whether there is a master agreement already in place
    - Return: intake confirmation + SLA + routing (Legal for high-value, Procurement for standard vendor contracts below a threshold)

6. **Add the "I need this urgently" handling.** A common override. The agent should acknowledge urgency, explain the expedited review process, state what "urgent" means for SLAs, and give the direct contact for genuinely time-critical situations.


## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **Automatic intake submission.** Connect to a Power Automate flow that takes the collected fields and submits the intake record directly to the Legal team's queue (ServiceNow, a SharePoint list, or an email template with structured fields). No manual copy-paste required.
- **Status tracking.** Add a "where is my contract?" topic that takes a reference number and returns the current review status from the Legal queue system.
- **Contract volume analytics.** Track which contract types are most common, which are most urgent, and which have the most questions before submission. Helps Legal justify headcount and prioritise self-service improvements.

## Watch out for

- **Legal advice creep.** Employees will ask "is this contract OK?" or "is this clause fair?" — the agent must refuse and redirect to Legal unconditionally. Add an escalation topic with these trigger phrases explicitly.
- **Routing outdated after org changes.** Contract routing often changes when Legal team structure or policies change. Build a review with Legal into any major org change process.
- **Don't replace the intake form — supplement it.** If Legal already has a working intake form, the agent front-ends it (collects information conversationally and then submits). Don't build a parallel process that Legal can't see.

## Where this leads (the ramp)

This agent routes contracts; it deliberately never reads the clauses. The day you want an agent that actually analyses contract terms — safely and on your own paper — you've crossed into custom-model territory that Azure AI Foundry serves.

> **Next:** [Foundry: fine-tune and serve a model](foundry-fine-tune-serve.md)

## Related

- [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics)
- [Power Automate integration](https://learn.microsoft.com/en-us/power-automate/)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

!!! tip "Ready to build? Use the solution template."
    The [Legal & Compliance Guidance Agent solution template](../solutions/legal-compliance-agent.md) covers the escalation-first design pattern — adapt the system prompt for contract routing, swap in the contract intake process document, and build the contract type identification topic first.

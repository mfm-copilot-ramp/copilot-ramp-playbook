---
title: "IT: Triage support requests and answer from the knowledge base"
description: Build a Copilot Studio agent that deflects tier-1 IT tickets with instant knowledge-base answers and collects the details to raise a ticket when needed.
stage: studio
harness: standard
roles: [maker, it-admin]
tags: [copilot-studio, it, helpdesk, triage, knowledge, actions, power-automate, functional]
level: intermediate
time: 4–5 hours
status: walkthrough
updated: 2026-06-04
---

# IT: Triage support requests and answer from the knowledge base

> Deflect tier-1 IT tickets with instant KB answers — and for anything that needs a human, collect the right information and raise the ticket automatically.

**Stage:** Copilot Studio · **For:** Maker, IT Admin · **Level:** Intermediate · **Time:** 4–5 hours

> **📐 Full blueprint & test plan →** [IT Helpdesk Triage Agent](../solutions/it-helpdesk-triage-agent.md) — the copy-paste system prompt, topic specs, and test-case table behind this build.

!!! abstract "Which harness? This one uses the standard harness"
    Every Copilot Studio agent runs on a [harness](../pick-the-engine.md) — the engine underneath it. This
    walkthrough builds on the **standard harness**: you author the topics and rules, the flow is predictable,
    and for Microsoft 365 Copilot-licensed users **it's covered inside Microsoft 365 channels** (no extra
    credits) — the lowest-cost choice for structured, rules-based work.

    Want the same use case to **reason through the task on its own** — planning multi-step work, recovering
    when a step fails, and working across your files? Build the
    **[GitHub Copilot harness version](studio-functional-it-helpdesk-generative.md)** instead. It's the autonomous engine to grow into; the
    honest tradeoff is that it bills **Copilot Credits for all usage** and a Microsoft 365 Copilot license
    never covers it. [Compare the engines](../pick-the-engine.md) · [estimate the net cost](../credit-estimator.md).

## When to use this

IT helpdesks spend a disproportionate amount of time on repeatable tier-1 questions: password resets, VPN access, software requests, "how do I…" queries. These are answerable from a knowledge base. The cost isn't the answer — it's the ticket volume and the routing noise.

A triage agent changes the economics: it answers from the KB first, and only creates a ticket when the issue genuinely needs a human. When it does raise a ticket, it collects the structured information the helpdesk actually needs (category, urgency, description) before the engineer ever sees it — no back-and-forth to gather basics.

**Why Stage 6:** This agent does more than answer questions. It makes a triage decision (KB answer vs. ticket) and takes an action (creating a ticket via Power Automate). That logic and the action layer require Copilot Studio — Agent Builder can't do it.

## What you'll need

- **Copilot Studio access** and a Power Platform environment
- Your **IT knowledge base** in SharePoint or as uploaded docs (KB articles, known issues, how-to guides)
- A **ticketing system** with a Power Automate connector (ServiceNow, Jira, Zendesk, or a SharePoint list as a lightweight alternative)
- The **required fields** your helpdesk needs to process a ticket (category, urgency, short description, contact)

## Try it now — the prompt

Run this prompt in Copilot Chat to scaffold the persona, topics, and triage decision flow — it works because it makes the answer-vs-ticket boundary explicit, which is the decision the whole agent turns on.

Two questions to resolve with the helpdesk team first:

1. **What are the top 20 requests that don't actually need a human?** These should be answered by knowledge, not a ticket.
2. **What information must be on every ticket before the team picks it up?** Those are the fields your triage topic collects.

```
Design a Copilot Studio IT helpdesk triage agent.
Knowledge base: [our IT SharePoint KB / these documents].
Top self-serviceable requests: [list your 20].
When a ticket is needed, collect: category ([hardware / software / access / other]),
urgency ([blocking / degraded / low]), and a short description.
Then submit via Power Automate to [ServiceNow / Jira / our SharePoint list].

Give me: persona instructions, 3 topics to configure, and the triage
decision flow — when does the agent answer vs. when does it create a ticket?
```

## Step by step

1. **Create the agent.** Name it (e.g. "IT Help"), write instructions that set the triage behaviour:

    > *You are the IT Help agent for [Company]. First, try to answer the user's request from the IT knowledge base. If the knowledge base covers it, answer with a clear resolution step and the source article. If the issue needs a human to resolve — or if the user says the KB answer didn't work — guide them through raising a support ticket.*

2. **Add the knowledge source.** Point the agent at your IT KB (SharePoint site or uploaded articles). Test the top-20 self-serviceable queries directly in the Test pane before building any topics.

3. **Build the triage topic.** This is the core of the agent. The flow:
    - User describes an issue
    - Agent checks if knowledge base covers it → if yes, answers
    - If the user says it didn't work, or the issue is clearly action-required (e.g. "I need a new laptop") → moves to ticket collection
    - Collects: category, urgency, description
    - Confirms the details with the user before submitting


4. **Connect the Power Automate action.** Build a flow that takes the collected fields and creates the ticket in your helpdesk system (or posts to a SharePoint list if no dedicated tool). Pass back the ticket reference number.


5. **Build the confirmation topic.** After ticket creation, the agent confirms: "I've raised a ticket for you — reference [number]. The IT team will be in touch within [SLA]. Is there anything else?"

6. **Test end-to-end.** Walk the happy path (KB answer works), the escalation path (KB answer doesn't help → ticket raised), and the direct path (user asks for something that clearly needs a ticket immediately). Confirm ticket numbers appear in the target system.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **SLA awareness.** Update the confirmation message with the actual SLA by urgency tier ("blocking issues are typically picked up within 2 hours"). This reduces "where's my ticket?" follow-ups.
- **Known issues broadcast.** Add a topic that checks a "known issues" SharePoint page — if the user's issue matches a known outage, the agent can say "we're already aware and working on it" before they raise a duplicate ticket.
- **Closed-loop follow-up.** Connect a Power Automate flow that messages the user when their ticket is resolved. The agent doesn't have to be the endpoint — it can be the start of a loop.

## Watch out for

- **KB article quality.** The agent surfaces what's in the articles — if KB articles are incomplete, outdated, or written for IT engineers rather than end users, the answers will reflect that. Run a plain-language review of your top-20 articles before launch.
- **Collecting too much in the triage topic.** Start with the minimum fields the helpdesk actually uses. Every extra question increases drop-off. Add fields after launch when you see what the team asks for repeatedly.
- **Power Automate error handling.** Test what happens when the PA flow fails (connector down, authentication error). The triage topic should catch failures and offer a fallback: "I wasn't able to raise the ticket automatically — please email [helpdesk@] with these details."

## Where this leads (the ramp)

Answering from the KB and raising clean tickets is a strong tier-1 deflection play. When ticket volume is high and you need to prove — continuously — that the agent resolves rather than misroutes, Azure AI Foundry's evaluation and monitoring is the upgrade.

> **Next:** [Foundry: evaluate and monitor continuously](foundry-evaluate-monitor.md)

## Related

- [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Add actions](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-flow)
- [Power Automate connector](https://learn.microsoft.com/en-us/power-automate/)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

!!! tip "Ready to build? Use the solution template."
    The [IT Helpdesk Triage Agent solution template](../solutions/it-helpdesk-triage-agent.md) gives you the system prompt, triage topic flow, Power Automate action spec, test cases, and deployment checklist for this exact pattern.

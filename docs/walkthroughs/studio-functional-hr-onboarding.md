---
title: "HR: Guide new starters through a personalised first-week experience"
description: Build a Copilot Studio agent that gives every new employee a 24/7 first-week companion that knows their role, team, and start week, cutting handbook hunting.
stage: studio
harness: standard
roles: [maker, it-admin, champion]
tags: [copilot-studio, hr, onboarding, personalisation, conversation-variables, functional]
level: intermediate
time: 3–4 hours
status: walkthrough
updated: 2026-06-04
---

# HR: Guide new starters through a personalised first-week experience

> Give every new employee a 24/7 first-week companion that knows their role, team, and start week — so they spend less time hunting through handbooks and more time getting up to speed.

**Stage:** Copilot Studio · **For:** Maker, IT Admin, Champion · **Level:** Intermediate · **Time:** 3–4 hours

> **📐 Full blueprint & test plan →** [Onboarding Buddy Agent](../solutions/onboarding-buddy-agent.md) — the copy-paste system prompt, topic specs, and test-case table behind this build.

!!! abstract "Which harness? This one uses the standard harness"
    Every Copilot Studio agent runs on a [harness](../pick-the-engine.md) — the engine underneath it. This
    walkthrough builds on the **standard harness**: you author the topics and rules, the flow is predictable,
    and for Microsoft 365 Copilot-licensed users **it's covered inside Microsoft 365 channels** (no extra
    credits) — the right, lowest-cost choice for structured, knowledge-driven work like this.

    When a job needs to **reason through a multi-step task on its own**, step up to the **GitHub Copilot
    harness** — see [Build a generative agent](studio-generative-agent.md). It's the autonomous engine to
    grow into; the honest tradeoff is that it bills **Copilot Credits for all usage** and a Microsoft 365
    Copilot license never covers it. [Compare the engines](../pick-the-engine.md) · [estimate the net cost](../credit-estimator.md).

## When to use this

New starters are overwhelmed in their first week. Every employee has the same questions — What do I do first? Who is my IT contact? How do I enrol in benefits? Where is the onboarding handbook? — but every manager answers them differently, and the handbook is 80 pages long.

An onboarding agent changes this. It knows who the employee is — their role, team, and which week they are in — and uses that context to give personalised, step-by-step guidance. The same agent works for a software engineer and a sales manager; it just adapts the content.

**Why Studio (not just Agent Builder):** personalisation requires conversation variables. The agent needs to collect role, team, and start week at the beginning of the conversation and carry that context through every response. That is a multi-step topics pattern with conditional logic — Studio territory, not Agent Builder.

## What you'll need

- Copilot Studio access
- An onboarding handbook, IT setup guides, and benefits enrollment docs in SharePoint
- A first-week checklist from HR — ideally broken down by role type or team
- 30 minutes with HR to agree on what "personalised" means: what actually differs by role, location, or team

## Try it now — the prompt

Run this prompt in Copilot Chat to scaffold the system prompt, conversation variables, and first-day topic — it works because it captures role, team, and week up front, which is what makes the guidance feel personalised.

The key design decision: **how much personalisation is worth the build effort?** Start with three variables:

- What **role type** is the employee in? (e.g., Technical / Commercial / Operations) — determines which checklist they get
- What **team** are they on? — determines their team channel, onboarding buddy, and local contacts
- What **week** are they in? — Week 1 tasks differ from Week 2 tasks

```
Design a Copilot Studio onboarding agent for a new employee at [Company].
The agent should collect: role type (technical / commercial / operations),
team, and which week they are in.
Based on those answers, return a personalised first-week checklist and answer
questions from the [onboarding handbook / IT setup guide / benefits guide].
Escalation: anything requiring a manager decision goes to [HR DL].

Give me: system prompt, conversation variables to collect, and the
first-day checklist topic with role-based branching.
```

## Step by step

1. **Create the agent with conversation variables.** In Studio, create three variables collected at the start of every conversation:
    - `var_role_type` — Technical / Commercial / Operations (or your org's equivalent)
    - `var_team` — the employee's team or division
    - `var_start_week` — "Week 1", "Week 2", "Week 3+"

    Set the agent instructions to:

    > *You are the Onboarding Guide for [Company]. When a new employee starts a conversation, ask for their role type, their team, and which week they are in. Use these to personalise all guidance. Answer from approved onboarding documentation. Anything requiring a decision from their manager or HR escalates to [HR DL].*

2. **Add your knowledge sources.** Connect to the onboarding SharePoint site or upload the key documents: employee handbook, IT setup guide, benefits enrollment guide, remote or office setup instructions. Test "What do I need to do on my first day?" before building any topics.

3. **Build the welcome and first-day topic.** Fires on first message or "What do I need to do?" — collects the three variables and returns the personalised first-day checklist for that role type.

4. **Build the IT setup topic.** The most common early question: "How do I get my laptop set up?" Walk through the steps for the role type (developer tooling differs from a standard setup). Link to the IT portal for access requests.

5. **Build the benefits enrollment topic.** Time-sensitive — most orgs have a 30-day enrollment window. The topic should know the deadline, walk through what choices need to be made, and link directly to the enrollment portal.

6. **Publish to a dedicated onboarding Teams channel.** Create a Teams channel for new starters and pin the agent. This is much higher visibility than burying it in a general HR channel.


## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **Pre-populate variables where possible.** If your HR system (Workday, SAP, etc.) can push role and team to a Teams welcome message, use a Power Automate flow to send a proactive message with the variables already set — no collection step needed.
- **Week-aware content.** Add a "What should I focus on this week?" topic that returns different priorities for Week 1 (orientation, IT, benefits), Week 2 (first meetings, team context), and Week 3+ (first projects, goal setting).
- **Manager companion.** Build a parallel agent for managers: "What do I need to prepare before my new starter's first day?" Managers who feel guided deliver better onboarding experiences.

## Watch out for

- **Out-of-date knowledge sources.** Onboarding docs go stale. Before launching, confirm that the handbook, IT guides, and benefits docs are current — and assign a named owner who reviews them quarterly.
- **Over-personalising before you have the data.** Don't build 12 role variants on day one. Start with 2–3 broad categories and refine based on the questions that actually come in.
- **Benefits enrollment deadline accuracy.** If the agent says "you have 30 days to enrol" and the window has already started, an employee may miss it. Source the deadline from a Finance or HR-maintained SharePoint page rather than hardcoding it in the agent instructions.

## Where this leads (the ramp)

Conversation variables get you genuine personalisation inside Studio. Once onboarding means pulling role and team from your HR system of record and provisioning access proactively, the workflow has outgrown topics — Azure AI Foundry is where it graduates.

> **Next:** [Foundry: graduate a Studio agent](foundry-graduate-from-studio.md)

## Related

- [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Conversation variables](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-variables)
- [Publish to Teams](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-add-bot-to-microsoft-teams)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

!!! tip "Ready to build? Use the solution template."
    The [Onboarding Buddy Agent solution template](../solutions/onboarding-buddy-agent.md) has the full system prompt with conversation variables, the week-adaptive topic structure, and the role-personalisation pattern — copy it and adapt the bracketed values.

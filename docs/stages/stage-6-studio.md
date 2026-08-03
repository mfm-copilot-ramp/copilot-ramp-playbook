---
title: "Stage 6 · Copilot Studio"
description: Stage 6 of the Copilot ramp. Build production-grade agents in Copilot Studio with knowledge, real actions, MCP tools, publishing, and governance.
stage: studio
---

# Stage 6 · Copilot Studio

> **Build real agents. The low-code destination of the ramp — production-grade agents with knowledge, actions, MCP tools, publishing, and governance (with Microsoft Foundry as the pro-code frontier beyond).**

**The shift:** from "I built a simple agent" to "I build agents that do real work in production." By the time you arrive here, every earlier stage has made this feel like the obvious next step rather than a cliff — you already think in terms of knowledge, instructions, and delegated tasks. Studio just gives you the full toolbox.

---

## When you're ready for this stage

Your declarative agents are bumping into limits: you need a real action against a system of record, an MCP tool, multiple topics, custom logic, or proper publishing and governance. You're ready to build, test, publish, and manage agents like products.

!!! question "Going the wrong way?"
    Studio is for agents with real actions, multi-topic logic, or org-wide publishing. If yours is just
    **one knowledge source plus instructions** for you and a few teammates, you've overshot —
    [drop back to Agent Builder](../right-sizing.md#studio-to-agent-builder).

## What you need

- Access to Copilot Studio and an environment to build in.
- A knowledge source and at least one concrete action or integration in mind.
- For production: an admin partner for environments, data policies, and monitoring.

---

## Start here — if you only do three things

Build a real designed agent, give it an action against a real system, then ship it with a governance checklist.

<div class="grid cards rc-pinned" markdown>

-   <span class="rc-habit">Habit 1<small>Day 1</small></span>

    **[Build your first Studio agent with knowledge + a topic](../walkthroughs/studio-first-agent.md)**

    Go from Agent Builder to a real designed conversation with topics and grounding.

    <span class="rc-meta" data-time="45" data-roles="maker"><span class="rc-chip rc-chip-time">⏱ 45 min</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   <span class="rc-habit">Habit 2<small>Week 1</small></span>

    **[Give a Studio agent a real action with a connector](../walkthroughs/studio-connector-action.md)**

    Let the agent do things, not just answer — look up records, create tickets, trigger workflows.

    <span class="rc-meta" data-time="25" data-roles="maker it-admin"><span class="rc-chip rc-chip-time">⏱ 25 min</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   <span class="rc-habit">Habit 3<small>Month 1</small></span>

    **[Publish and govern your agent](../walkthroughs/studio-publish.md)**

    Ship to Teams and the web with a governance checklist.

    <span class="rc-meta" data-time="20" data-roles="maker it-admin"><span class="rc-chip rc-chip-time">⏱ 20 min</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

</div>

---

## Walkthroughs — technical foundations

Build these first — the platform tools every functional agent below depends on.

<div id="rc-filterbar"></div>

<div class="rc-scrollbox" markdown>

<section class="rc-bucket" markdown>

### Core Studio
Everything that makes a Studio agent real — designed conversation, tools and actions, autonomy and security, testing, publishing, governance, and the ROI case.

<div class="grid cards rc-grid" markdown>

-   **[Build your first Studio agent with a knowledge source + topic](../walkthroughs/studio-first-agent.md)**

    Go from Agent Builder to a real designed conversation with topics and grounding.

    <span class="rc-meta" data-time="45" data-roles="maker"><span class="rc-chip rc-chip-time">⏱ 45 min</span> <span class="rc-chip rc-chip-role">👤 Maker</span> <span class="rc-chip rc-chip-star">★ Starter</span></span>

-   **[Design a multi-turn conversation with fallback and clarification](../walkthroughs/studio-multi-turn-conversation.md)**

    Build an agent that asks what it needs to know and recovers gracefully.

    <span class="rc-meta" data-time="30" data-roles="maker"><span class="rc-chip rc-chip-time">⏱ 30 min</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[Add an MCP tool integration to your Studio agent](../walkthroughs/studio-mcp-tool-integration.md)**

    Extend the agent with external tools.

    <span class="rc-meta" data-time="20" data-roles="maker"><span class="rc-chip rc-chip-time">⏱ 20 min</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[Give a Studio agent a real action with a connector](../walkthroughs/studio-connector-action.md)**

    Let the agent do things, not just answer — look up records, create tickets, trigger workflows.

    <span class="rc-meta" data-time="25" data-roles="maker it-admin"><span class="rc-chip rc-chip-time">⏱ 25 min</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[Trigger a Power Automate flow from inside a Studio agent](../walkthroughs/studio-power-automate-flow.md)**

    Connect your agent to real business systems via Power Automate.

    <span class="rc-meta" data-time="30" data-roles="maker it-admin"><span class="rc-chip rc-chip-time">⏱ 30 min</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[Connect a Studio agent to a Microsoft Fabric data agent](../walkthroughs/studio-fabric-agent.md)**

    Ground the agent on your warehouse and semantic models — answer questions from data, not just documents.

    <span class="rc-meta" data-time="40" data-roles="maker it-admin"><span class="rc-chip rc-chip-time">⏱ 40 min</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[Configure an autonomous event-triggered agent](../walkthroughs/studio-autonomous-triggers.md)**

    Build an agent that acts when something happens — no user prompt required.

    <span class="rc-meta" data-time="45" data-roles="maker it-admin"><span class="rc-chip rc-chip-time">⏱ 45 min</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[Secure a Studio agent with authentication](../walkthroughs/studio-authentication.md)**

    Ensure only the right people can use your agent.

    <span class="rc-meta" data-time="30" data-roles="maker it-admin"><span class="rc-chip rc-chip-time">⏱ 30 min</span> <span class="rc-chip rc-chip-role">👤 IT</span></span>

-   **[Test and evaluate a Studio agent before publishing](../walkthroughs/studio-test-evaluate.md)**

    Structured test cases before broad rollout.

    <span class="rc-meta" data-time="30" data-roles="maker champion"><span class="rc-chip rc-chip-time">⏱ 30 min</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[Publish and govern your agent](../walkthroughs/studio-publish.md)**

    Ship to Teams and the web with a governance checklist.

    <span class="rc-meta" data-time="20" data-roles="maker it-admin"><span class="rc-chip rc-chip-time">⏱ 20 min</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[Govern and monitor your agents at scale](../walkthroughs/studio-govern-monitor.md)**

    ALM, analytics, and guardrails for a fleet of agents.

    <span class="rc-meta" data-time="20" data-roles="it-admin"><span class="rc-chip rc-chip-time">⏱ 20 min</span> <span class="rc-chip rc-chip-role">👤 IT</span></span>

-   **[Make the ROI case for your agent](../walkthroughs/studio-roi-business-case.md)**

    Tie agent usage to outcomes.

    <span class="rc-meta" data-time="15" data-roles="manager champion"><span class="rc-chip rc-chip-time">⏱ 15 min</span> <span class="rc-chip rc-chip-role">👤 Manager</span></span>

</div>

</section>

</div>

---

-   **[Share agent analytics without edit rights — Analytics Viewer role](../walkthroughs/studio-govern-your-copilot-studio-agents-with-the-analytics-viewer-.md)**

    Grant stakeholders read-only access to your agent's Analytics page without giving them edit or publish rights.

    <span class="rc-meta" data-time="15" data-roles="maker it-admin"><span class="rc-chip rc-chip-time">⏱ 15 min</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

</div>

</section>

</div>

---

## Walkthroughs — functional use cases

Agents designed for a specific business function. Each pairs with a [Solution Template](../solutions/index.md) you can copy, adapt, and build from directly.

<div class="rc-scrollbox" markdown>

<section class="rc-bucket" markdown>

### Employee services (HR · IT · Finance)
Function-specific agents that answer routine questions and run guided requests. Each pairs with a solution template below.

<div class="grid cards rc-grid" markdown>

-   **[HR: Answer employee questions with a policies agent](../walkthroughs/studio-functional-hr-policy-faq.md)**

    A 24/7 HR FAQ agent grounded on your policy docs — consistent, cited answers and a structured escalation path.

    <span class="rc-meta" data-time="210" data-roles="maker it-admin champion"><span class="rc-chip rc-chip-time">⏱ 3–4 hrs</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[HR: Guide new starters through a personalised first week](../walkthroughs/studio-functional-hr-onboarding.md)**

    A first-week companion that adapts the checklist and guidance to a new hire's role, team, and start week.

    <span class="rc-meta" data-time="210" data-roles="maker it-admin champion"><span class="rc-chip rc-chip-time">⏱ 3–4 hrs</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[IT: Triage support requests and answer from the knowledge base](../walkthroughs/studio-functional-it-helpdesk.md)**

    Deflect tier-1 tickets with instant KB answers — and raise a complete ticket automatically when a human is needed.

    <span class="rc-meta" data-time="270" data-roles="maker it-admin"><span class="rc-chip rc-chip-time">⏱ 4–5 hrs</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[IT: Self-service software and hardware access requests](../walkthroughs/studio-functional-it-access-request.md)**

    Guided software, hardware, and access requests — validated and auto-routed to the right IT queue.

    <span class="rc-meta" data-time="270" data-roles="maker it-admin champion"><span class="rc-chip rc-chip-time">⏱ 4–5 hrs</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[Finance: Self-service expense and procurement guidance](../walkthroughs/studio-functional-finance-expense.md)**

    Instant answers on expense policy and procurement rules — and a guided path into the right process.

    <span class="rc-meta" data-time="210" data-roles="maker it-admin champion"><span class="rc-chip rc-chip-time">⏱ 3–4 hrs</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[Finance: Spend and budget Q&A for budget owners](../walkthroughs/studio-functional-finance-budget-qa.md)**

    Instant answers on spend position, variance from plan, and the approval process — without waiting on Finance.

    <span class="rc-meta" data-time="210" data-roles="maker champion manager"><span class="rc-chip rc-chip-time">⏱ 3–4 hrs</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

</div>

</section>

<section class="rc-bucket" markdown>

### Revenue & growth (Sales · Marketing)
Agents that put approved content and intel in front of the people who sell and market.

<div class="grid cards rc-grid" markdown>

-   **[Sales: Product intel and objection handling](../walkthroughs/studio-functional-sales-intel.md)**

    Give every rep the right product story, competitive positioning, and objection responses — mid-call.

    <span class="rc-meta" data-time="210" data-roles="maker champion manager"><span class="rc-chip rc-chip-time">⏱ 3–4 hrs</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[Sales: Build proposals and RFP responses](../walkthroughs/studio-functional-sales-proposal.md)**

    Assemble proposal and RFP content from your approved library — first draft in 30 minutes, not 3 hours.

    <span class="rc-meta" data-time="210" data-roles="maker champion manager"><span class="rc-chip rc-chip-time">⏱ 3–4 hrs</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[Marketing: Turn a brief into a checklist and draft copy](../walkthroughs/studio-functional-marketing-campaign.md)**

    Turn a one-paragraph brief into an asset checklist and on-brand first-draft copy, with claims flagged for review.

    <span class="rc-meta" data-time="210" data-roles="maker marketer"><span class="rc-chip rc-chip-time">⏱ 3–4 hrs</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

</div>

</section>

<section class="rc-bucket" markdown>

### Risk, support & operations
Agents that navigate process, deflect support load, and coordinate operational work safely.

<div class="grid cards rc-grid" markdown>

-   **[Legal & Compliance: Policy guidance and process navigation](../walkthroughs/studio-functional-legal-compliance.md)**

    Instant answers on compliance policies and legal processes — with strict scope and a clear escalation path.

    <span class="rc-meta" data-time="210" data-roles="maker it-admin champion"><span class="rc-chip rc-chip-time">⏱ 3–4 hrs</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[Legal: Guide employees through contract routing](../walkthroughs/studio-functional-legal-contract.md)**

    A clear, consistent process for getting contracts reviewed — type, requirements, and where to submit.

    <span class="rc-meta" data-time="150" data-roles="maker it-admin champion"><span class="rc-chip rc-chip-time">⏱ 2–3 hrs</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[Customer Support: Deflect common questions and draft replies](../walkthroughs/studio-functional-support-deflection.md)**

    Answer from approved help content, draft send-ready replies, deflect the easy ones, and escalate the edge cases.

    <span class="rc-meta" data-time="210" data-roles="maker it-admin"><span class="rc-chip rc-chip-time">⏱ 3–4 hrs</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[Procurement: Sourcing requests with vendor shortlists](../walkthroughs/studio-functional-procurement-sourcing.md)**

    Take a purchase request, return a shortlist of approved vendors, and apply the policy gates automatically.

    <span class="rc-meta" data-time="210" data-roles="maker it-admin"><span class="rc-chip rc-chip-time">⏱ 3–4 hrs</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[Field Service: Triage symptoms to dispatch path](../walkthroughs/studio-functional-field-service-triage.md)**

    Take a symptom or fault code, return the likely cause, and recommend the right dispatch path — behind a hard safety rule.

    <span class="rc-meta" data-time="270" data-roles="maker it-admin"><span class="rc-chip rc-chip-time">⏱ 4–5 hrs</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[Engineering: Match alerts to runbook steps and escalation](../walkthroughs/studio-functional-engineering-oncall.md)**

    Match an alert to the right runbook step, guide the fix one step at a time, and know exactly who to escalate to.

    <span class="rc-meta" data-time="270" data-roles="maker developer it-admin"><span class="rc-chip rc-chip-time">⏱ 4–5 hrs</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

-   **[Workplace: Plan an internal event end to end](../walkthroughs/studio-functional-events-coordination.md)**

    Turn "I'm running an all-hands" into an organised plan — logistics, bookings, and drafted comms — within policy.

    <span class="rc-meta" data-time="210" data-roles="maker it-admin"><span class="rc-chip rc-chip-time">⏱ 3–4 hrs</span> <span class="rc-chip rc-chip-role">👤 Maker</span></span>

</div>

</section>

</div>

---

## Build something deployable

Don't start from a blank canvas. Each **Studio solution template** is a copy-paste spec — system prompt, knowledge guidance, topics, test cases, and a deployment checklist — that a maker can build in a half-day. Copy, adapt to your function, and ship.

<div class="grid cards" markdown>

-   **[Policy FAQ Agent](../solutions/policy-faq-agent.md)**

    Answers policy and process questions from your org's documents — the cross-functional starting point.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 2–3 hrs to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: HR · IT · Finance · Legal</span></span>

-   **[Onboarding Buddy Agent](../solutions/onboarding-buddy-agent.md)**

    A personalised first-week guide that adapts to each new starter's role, team, and start week.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 3–4 hrs to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: HR</span></span>

-   **[IT Helpdesk Triage Agent](../solutions/it-helpdesk-triage-agent.md)**

    Deflect tier-1 tickets with instant KB answers and automate ticket creation for the rest.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 4–5 hrs to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: IT</span></span>

-   **[IT Access Request Agent](../solutions/it-access-request-agent.md)**

    Guided software, hardware, and permissions requests with automatic ITSM ticket creation.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 4–5 hrs to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: IT</span></span>

-   **[Finance Expense & Procurement Agent](../solutions/finance-expense-agent.md)**

    Self-service answers on expense policy, procurement rules, and approval thresholds.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 3–4 hrs to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: Finance</span></span>

-   **[Sales Enablement Agent](../solutions/sales-enablement-agent.md)**

    Instant competitive intel, case studies, and talk tracks, grounded on your sales content.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 3–4 hrs to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: Sales</span></span>

-   **[Sales Proposal & RFP Agent](../solutions/sales-proposal-rfp-agent.md)**

    Approved proposal content, RFP responses, and case studies assembled on demand.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 3–4 hrs to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: Sales</span></span>

-   **[Legal & Compliance Guidance Agent](../solutions/legal-compliance-agent.md)**

    Deflect routine process questions with strict scope and escalation controls.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 3–4 hrs to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: Legal</span></span>

-   **[Marketing Campaign Agent](../solutions/marketing-campaign-agent.md)**

    Turn a campaign brief into an asset checklist and on-brand first-draft copy.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 3–4 hrs to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: Marketing</span></span>

-   **[Customer Support Deflection Agent](../solutions/support-deflection-agent.md)**

    Answer from approved help content, draft replies, and deflect common questions.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 3–4 hrs to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: Support</span></span>

-   **[Procurement Sourcing Agent](../solutions/procurement-sourcing-agent.md)**

    A compliant vendor shortlist with policy gates and approval routing.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 3–4 hrs to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: Procurement</span></span>

-   **[Field Service Triage Agent](../solutions/field-service-triage-agent.md)**

    Triage symptoms to the likely cause and the right dispatch path, safely.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 4–5 hrs to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: Field Service</span></span>

-   **[Engineering On-Call Runbook Agent](../solutions/engineering-oncall-runbook-agent.md)**

    Match alerts to runbook steps and the escalation path under pressure — read-first by design.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 4–5 hrs to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: Engineering</span></span>

-   **[Event Coordination Agent](../solutions/event-coordination-agent.md)**

    Plan internal events — rooms, catering, comms — within policy and budget.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 3–4 hrs to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: Workplace</span></span>

</div>

---

!!! borrow "Borrow, don't build"
    Studio has the deepest first-party learning bench of any stage. The official **Learn docs** are the
    canonical build-to-govern path, and **Copilot Studio in a Day** is a free hands-on workshop that takes
    you from first agent to flows.

    - [Copilot Studio official docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) — the canonical build-to-govern reference
    - [Copilot Studio Resources (CAT)](https://aka.ms/copilotstudio/resources) — the curated hub of Studio guidance
    - [Copilot Studio & agent samples](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/agent-samples) — ready-made agents to learn from
    - [Mastering Copilot Studio](https://learn.microsoft.com/en-us/shows/mastering-copilot-studio/) — a guided show series
    - [Copilot Studio in a Day](https://aka.ms/CSIAD) — a free hands-on workshop
    - [Agent governance whitepaper + Agent 365](https://aka.ms/agent365/resources) — how to govern agents at scale

    The full curated set for this stage lives in [Resources → Stage 6](../RESOURCES.md).

!!! info "Security at this stage"
    This is where the controls get rich: agents live in **Power Platform environments**, **DLP data
    policies** govern their knowledge, connectors, and channels, maker audit flows into **Microsoft
    Purview** (with Sentinel alerts), and you can add customer-managed keys and Customer Lockbox. See the
    full picture in **[Security & Governance](../empowerment/security.md)**.

---

## Where this leads

<div class="rc-exit" markdown>
<div class="rc-exit-text" markdown>
**Shipping Studio agents but hitting a real ceiling?** When an agent has to be *engineered* — custom or fine-tuned models, autonomous orchestration, or MCP tools at scale — there's one more frontier beyond low-code. Most people never need it.
</div>
[Continue to Stage 7 · Foundry →](stage-7-foundry.md){ .rc-exit-cta }
</div>

---
title: "Stage 7 · Foundry"
description: Stage 7 of the Copilot ramp. Cross into pro-code Microsoft Foundry for custom models, autonomous orchestration, evaluation, and MCP tools at scale.
stage: foundry
---

# Stage 7 · Foundry

> **The pro-code frontier. When a low-code agent can't reach far enough — custom models, autonomous orchestration, evaluation, and MCP tools at scale — you cross into Microsoft Foundry.**

**The shift:** from "I build agents in a designer" to "I engineer agents as software." Most people never need this stage, and that's by design — Stages 1–5 solve the overwhelming majority of real work. But when an agent has to run pro-code logic, call custom or fine-tuned models, or operate as part of an engineered system, Foundry is where it belongs.

!!! warning "A different kind of stage — for developers"
    Foundry is a **pro-code, developer-owned platform**, not a low-code designer. It lives in Azure, not the
    Microsoft 365 admin center, and it assumes engineering skills (SDKs, CI/CD, Azure resources). Treat this
    stage as a *signpost to the frontier* rather than a click-by-click walkthrough — and verify everything
    against the official Microsoft docs, which move fast.

---

## When you're ready for this stage

You've outgrown low-code. A Copilot Studio agent can't express what you need: you require a **custom or fine-tuned model**, **autonomous multi-agent orchestration**, **rigorous evaluation and monitoring**, or **MCP tools and integrations at engineering scale**. You have developers, an Azure subscription, and a deployment pipeline — and the problem justifies building like software.

!!! question "Going the wrong way?"
    Foundry is the easiest place to over-engineer. If you're writing **glue code for a single linear
    task** or rebuilding a connector Studio already ships, you've overshot —
    [drop back to Studio](../right-sizing.md#foundry-to-studio).

## What you need

- An **Azure subscription** and a **Microsoft Foundry project** to build in.
- **Developer skills** — SDKs (Python/.NET/JS), source control, and CI/CD.
- An **engineering owner** for the Azure resources, identity, and networking behind the agent.
- A clear reason you couldn't solve it in [Stage 6 · Copilot Studio](stage-6-studio.md). If you *could*, start there.

---

## Start here — if you only do three things

Prove the plumbing with a first SDK agent, re-platform a real agent that hit a ceiling, then put an evaluation gate around it before it ships.

<div class="grid cards rc-pinned" markdown>

-   <span class="rc-habit">Habit 1<small>Day 1</small></span>

    **[Build your first pro-code agent with the Foundry Agent Service](../walkthroughs/foundry-first-agent.md)**

    Create an agent from the SDK, run a turn, and prove your project, identity, and plumbing work.

    <span class="rc-meta" data-time="60" data-roles="developer"><span class="rc-chip rc-chip-time">⏱ 60 min</span> <span class="rc-chip rc-chip-role">👤 Developer</span></span>

-   <span class="rc-habit">Habit 2<small>Week 1</small></span>

    **[Graduate a Copilot Studio agent into pro-code Foundry](../walkthroughs/foundry-graduate-from-studio.md)**

    The usual on-ramp — re-platform a proven low-code agent that hit a real ceiling.

    <span class="rc-meta" data-time="90" data-roles="developer maker"><span class="rc-chip rc-chip-time">⏱ 90 min</span> <span class="rc-chip rc-chip-role">👤 Developer</span></span>

-   <span class="rc-habit">Habit 3<small>Month 1</small></span>

    **[Evaluate and continuously monitor a Foundry agent](../walkthroughs/foundry-evaluate-monitor.md)**

    Score quality on a dataset before you ship, and watch it in production.

    <span class="rc-meta" data-time="75" data-roles="developer it-admin"><span class="rc-chip rc-chip-time">⏱ 75 min</span> <span class="rc-chip rc-chip-role">👤 Developer</span></span>

</div>

---

## All walkthroughs

Unlike earlier stages, these are **developer walkthroughs** — representative SDK/CLI patterns and the decisions behind them, not click-by-click product tours. Foundry moves fast; each page links the authoritative Microsoft docs to verify against.

<div id="rc-filterbar"></div>

<div class="rc-scrollbox" markdown>

<section class="rc-bucket" markdown>

### Build your first pro-code agent
Stand up the agent, re-platform a proven one, and give it real tools.

<div class="grid cards rc-grid" markdown>

-   **[Build your first pro-code agent with the Foundry Agent Service](../walkthroughs/foundry-first-agent.md)**

    Create an agent from the SDK, run a turn, and prove your project, identity, and plumbing work.

    <span class="rc-meta" data-time="60" data-roles="developer"><span class="rc-chip rc-chip-time">⏱ 60 min</span> <span class="rc-chip rc-chip-role">👤 Developer</span> <span class="rc-chip rc-chip-star">★ Starter</span></span>

-   **[Graduate a Copilot Studio agent into pro-code Foundry](../walkthroughs/foundry-graduate-from-studio.md)**

    The usual on-ramp — re-platform a proven low-code agent that hit a real ceiling.

    <span class="rc-meta" data-time="90" data-roles="developer maker"><span class="rc-chip rc-chip-time">⏱ 90 min</span> <span class="rc-chip rc-chip-role">👤 Developer</span></span>

-   **[Give a Foundry agent custom tools and MCP integrations](../walkthroughs/foundry-mcp-tools.md)**

    Turn a talking agent into a doing agent with function tools and standards-based MCP.

    <span class="rc-meta" data-time="75" data-roles="developer"><span class="rc-chip rc-chip-time">⏱ 75 min</span> <span class="rc-chip rc-chip-role">👤 Developer</span></span>

</div>

</section>

<section class="rc-bucket" markdown>

### Orchestrate, evaluate & govern
Move from one agent to a governed system you can trust in production.

<div class="grid cards rc-grid" markdown>

-   **[Orchestrate multiple agents and autonomous runs](../walkthroughs/foundry-autonomous-orchestration.md)**

    Move from one agent to a system of agents that hand off work and run when triggered.

    <span class="rc-meta" data-time="90" data-roles="developer"><span class="rc-chip rc-chip-time">⏱ 90 min</span> <span class="rc-chip rc-chip-role">👤 Developer</span></span>

-   **[Evaluate and continuously monitor a Foundry agent](../walkthroughs/foundry-evaluate-monitor.md)**

    Score quality on a dataset before you ship, and watch it in production.

    <span class="rc-meta" data-time="75" data-roles="developer it-admin"><span class="rc-chip rc-chip-time">⏱ 75 min</span> <span class="rc-chip rc-chip-role">👤 Developer</span></span>

-   **[Secure and govern Foundry agents in production](../walkthroughs/foundry-govern-secure.md)**

    Tenant-isolated data, least-privilege identity, and the governance plane.

    <span class="rc-meta" data-time="60" data-roles="it-admin developer"><span class="rc-chip rc-chip-time">⏱ 60 min</span> <span class="rc-chip rc-chip-role">👤 IT</span></span>

</div>

</section>

<section class="rc-bucket" markdown>

### Operate it in production
Go past building to *operating* — swap models safely, keep it affordable, and prove it's hard to break.

<div class="grid cards rc-grid" markdown>

-   **[Fine-tune a domain model and serve it from a Foundry agent](../walkthroughs/foundry-fine-tune-serve.md)**

    The last lever when prompting and retrieval hit their ceiling — train the behaviour in, then serve it behind an agent.

    <span class="rc-meta" data-time="180" data-roles="developer it-admin"><span class="rc-chip rc-chip-time">⏱ 2–4 hrs</span> <span class="rc-chip rc-chip-role">👤 Developer</span></span>

-   **[A/B and shadow-deploy a model swap behind a Foundry agent](../walkthroughs/foundry-ab-shadow-deploy.md)**

    Adopt a new or tuned model the way you ship risky code — shadow, canary, then promote on the numbers.

    <span class="rc-meta" data-time="90" data-roles="developer it-admin"><span class="rc-chip rc-chip-time">⏱ 90 min</span> <span class="rc-chip rc-chip-role">👤 Developer</span></span>

-   **[Token-budgeting and cost optimization for a production agent](../walkthroughs/foundry-cost-optimization.md)**

    Make tokens a metric you watch, then cut spend at scale without quietly cutting quality.

    <span class="rc-meta" data-time="90" data-roles="developer it-admin"><span class="rc-chip rc-chip-time">⏱ 90 min</span> <span class="rc-chip rc-chip-role">👤 Developer</span></span>

-   **[Build a red-team / safety eval harness](../walkthroughs/foundry-red-team-eval.md)**

    Try to break your own agent — repeatably — so adversarial regressions fail the build, not reach users.

    <span class="rc-meta" data-time="120" data-roles="developer it-admin"><span class="rc-chip rc-chip-time">⏱ 2 hrs</span> <span class="rc-chip rc-chip-role">👤 Developer</span></span>

</div>

</section>

</div>

---

## Build something deployable

These walkthroughs pair with copy-and-adapt **Foundry solution templates** — a representative code scaffold, an evaluation gate, and a deployment checklist. Reach for one only when a Studio agent genuinely can't carry the job.

<div class="grid cards" markdown>

-   **[Pro-Code Grounded Q&A Agent](../solutions/foundry-knowledge-agent.md)**

    Custom retrieval, an evaluation gate, and code-owned identity for grounded Q&A that outgrew Studio.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 1–2 days to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: any grounded Q&A workload</span></span>

-   **[Multi-Agent Workflow Orchestrator](../solutions/foundry-orchestrator-agent.md)**

    Automate a multi-step process across specialist agents with deterministic control and a workflow-level eval gate.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 2–4 days to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: research → draft → review, intake → enrich → route</span></span>

-   **[High-Volume Document Processing Agent](../solutions/foundry-document-processing-agent.md)**

    Extract structured data from documents at scale, with schema validation and a precision/recall gate.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 2–4 days to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: invoice/PO extraction, contract clauses, claims intake</span></span>

-   **[Customer-Facing Support Agent](../solutions/foundry-support-agent.md)**

    An external, action-taking support agent with strict guardrails, content safety, and continuous evaluation.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 3–5 days to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: order/account support, entitlement checks, ticketing</span></span>

-   **[NL-to-SQL Analytics Agent](../solutions/foundry-nl-to-sql-agent.md)**

    "Ask your data warehouse" self-service analytics with a SQL-safety layer and a correctness gate.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 2–4 days to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: self-service BI, ops/finance/product analytics</span></span>

-   **[Browser-Using (Computer-Use) Agent](../solutions/foundry-computer-use-agent.md)**

    Automate web apps that have no API — sandboxed, allow-listed, and human-confirmed on irreversible actions.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 3–5 days to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: legacy web apps, form-filling, portal data-gathering</span></span>

-   **[Voice Agent / Contact-Center IVR](../solutions/foundry-voice-agent.md)**

    A real-time phone agent — speech-to-text, grounded conversation, text-to-speech, clean human handoff.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 3–5 days to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: support lines, booking lines, helpdesk hotlines</span></span>

-   **[Code-Review / PR-Triage Agent](../solutions/foundry-code-review-agent.md)**

    Advisory, private-repo PR review and reviewer routing — comments only, never merges.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 2–4 days to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: PR triage, review assistance, reviewer routing</span></span>

-   **[Multi-Modal Document Classification Agent](../solutions/foundry-document-classification-agent.md)**

    Sort a high-volume document stream by vision + text, with confidence-based routing and a precision/recall gate.

    <span class="rc-meta"><span class="rc-chip rc-chip-build">⏱ 2–4 days to build</span> <span class="rc-chip rc-chip-adapt">⚙️ Adapts to: intake routing, claims triage, content moderation</span></span>

</div>

---

!!! borrow "Borrow, don't build"
    Foundry is a deep, fast-moving developer platform — there's no value in re-documenting it here. Lean
    on Microsoft's own authoritative material, which stays current with the product.

    - [Microsoft Foundry docs](https://learn.microsoft.com/en-us/azure/ai-foundry/) — the canonical front door: build, evaluate, deploy
    - [Foundry Agent Service](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/) — build, deploy, and run agents with tools and orchestration
    - [Standard agent setup](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/concepts/standard-agent-setup) — bring-your-own Azure resources for project-level data isolation
    - [Role-based access control in Foundry](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/rbac-azure-ai-foundry) — least-privilege built-in roles and Entra ID auth
    - [Extend Microsoft 365 Copilot — options compared](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/) — where custom-engine (Foundry) agents fit next to declarative ones
    - [Agent samples (low-code → pro-code)](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/agent-samples) — Microsoft-owned and community starting points

    The full curated set for this stage lives in [Resources → Stage 7](../RESOURCES.md).

!!! info "Security at this stage"
    Foundry agents run on **Azure** with **Entra ID authentication and Azure RBAC**, and the standard setup
    keeps agent data in **your own single-tenant Azure resources** (Storage, Cosmos DB, AI Search, Key Vault).
    Microsoft Purview classifies them as **Enterprise AI apps**, and Agent 365 can govern them alongside your
    low-code agents. See the full picture in **[Security & Governance](../empowerment/security.md)**.

---

## You've reached the frontier

<div class="rc-exit" markdown>
<div class="rc-exit-text" markdown>
**There's no Stage 7.** From Chat to Foundry, the ramp has taken you from a daily habit to engineered, governed agents — pick the *lowest* stage that solves each problem, and only climb when the work demands it. Keep a backlog of agents worth building.
</div>
[Back to the full Use-Case Catalog →](../CATALOG.md){ .rc-exit-cta }
</div>

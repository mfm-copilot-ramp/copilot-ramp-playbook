---
title: Glossary
description: Plain-language definitions for the Microsoft Copilot and agent terms you'll meet on the ramp, from BizChat to Foundry. Unofficial and community-built.
---

# Glossary

Plain-language definitions for the terms you'll meet on the ramp. Unofficial — when in doubt,
Microsoft's [Copilot hub](https://learn.microsoft.com/en-us/copilot/) is the source of truth.

!!! tip "How to use this page"
    Skim the group that matches where you are on the journey. Every term links to the stage or
    walkthrough where it actually shows up, so you can go from *"what is that?"* to *"show me"* in one click.

!!! borrow "Borrow, don't build"
    These are plain-language definitions to get you oriented — Microsoft owns the authoritative,
    always-current glossary for each product. When a definition matters for customer-facing work, go to
    the source.

    - [Which Copilot is right for you](https://learn.microsoft.com/en-us/copilot/) — the Microsoft Learn hub that names and maps every Copilot
    - [Microsoft 365 Copilot documentation](https://learn.microsoft.com/en-us/copilot/microsoft-365/) — canonical terms for Chat, agents, and Graph grounding
    - [Copilot Studio documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) — the official reference for makers and builders
    - [Microsoft Foundry documentation](https://learn.microsoft.com/en-us/azure/ai-foundry/) — canonical terms for the pro-code platform

---

## Core products

- **Microsoft 365 Copilot** — the paid Copilot that's grounded in *your* work content (email, chat, files,
  meetings) through the Microsoft Graph. It's what powers most of [Stage 1](stages/stage-1-chat.md) through
  [Stage 3](stages/stage-3-cowork.md). Requires a per-user license on top of a qualifying M365 plan.
- **Copilot Chat** — the chat surface (in Teams, Outlook, the M365 app, and the web). With a Microsoft 365
  Copilot license it can reason over your work content; without one it still answers general web-grounded
  questions. The home of [Stage 1](stages/stage-1-chat.md).
- **BizChat** — the "chat over all your org content" experience inside Microsoft 365 Copilot — it searches
  across SharePoint, email, and Teams and returns a single cited answer.
- **Copilot Studio** — the low-code platform for building *production* agents: custom topics, connectors,
  authentication, publishing, and governance. The low-code maker destination, [Stage 6](stages/stage-6-studio.md).
- **Agent Builder** — the lightweight, in-product agent maker inside Microsoft 365 Copilot. You point it at
  knowledge, give it instructions, and share it — no code. Your first taste of *making*,
  [Stage 4](stages/stage-4-agent-builder.md).
- **Microsoft Foundry** *(formerly Azure AI Foundry)* — the pro-code platform for building custom AI apps and
  agents with full control over models, orchestration, and evaluation. The pro-code frontier,
  [Stage 7](stages/stage-7-foundry.md) — one rung beyond Studio for advanced builders.

---

## Journey concepts

- **First-party agents** — the prebuilt agents Microsoft bundles into the Microsoft 365 Copilot license
  (Researcher, Analyst, Facilitator, Interpreter, Project Manager, and more). You delegate to them rather
  than building anything. The whole of [Stage 2](stages/stage-2-first-party.md).
- **Cowork** — Microsoft 365 Copilot's ability to take a whole multi-step task — plan it, run the steps
  across your tools, and hand back a finished result — instead of answering one prompt at a time. The focus
  of [Stage 3](stages/stage-3-cowork.md).
- **Copilot Pages** — a shared, editable canvas. Turn any Copilot response into a living document your team
  can co-edit with Copilot in the loop.
- **Frontier** — Microsoft's early-access program. The newest Copilot capabilities (including the fuller
  Cowork feature set) often land in Frontier *first*, weeks or months ahead of general availability. See the
  [Cowork stage](stages/stage-3-cowork.md) for how to check eligibility and enroll.
- **Autopilot (category)** — Microsoft's category of **always-on, autonomous agents**: each runs under its
  own governed Microsoft Entra identity and acts on your behalf in the background, within the permissions and
  policies you set, instead of waiting for a prompt. Announced June 2, 2026. The focus of
  [Stage 5](stages/stage-5-autopilots.md).
- **Microsoft Scout** — the **first Autopilot**: an always-on personal agent that builds context over time
  through Work IQ and can coordinate meetings, prep, and deliverables for you. In **Frontier private preview**
  today. ([Microsoft Scout on Learn](https://learn.microsoft.com/en-us/microsoft-scout/))
- **Declarative agent** — an agent defined by configuration, not code: instructions, knowledge sources, and
  starter prompts. What you build in [Agent Builder](stages/stage-4-agent-builder.md), and the simpler option
  in Studio.
- **Custom engine agent** — an agent with its own orchestration logic and (optionally) its own model, built
  in Copilot Studio or Microsoft Foundry. More power, more responsibility — for when a declarative agent
  isn't enough.

---

## Building blocks

- **Skill** — a **reusable, packaged capability you save once and reuse or share**. Today the clearest
  example is a **Cowork recipe** ([Stage 3](stages/stage-3-cowork.md)). In **[Autopilots](stages/stage-5-autopilots.md)** — Microsoft's category of always-on agents —
  that same instinct is equipped onto **Microsoft Scout**, the first Autopilot, so it draws on the capability
  in the background (Frontier private preview). In **Copilot Studio**, *skill*
  is a precise term for **one specific kind of tool** — an embedded pro-code agent (Bot Framework /
  Microsoft 365 Agents SDK) registered so your agent can call it; the connector actions, flows, and
  MCP tools in [Stage 6](stages/stage-6-studio.md) are **tools**, not skills. See the
  [Skills Catalog](skills.md). *Not* the first-party **Skills agent** (career stretch assignments) or
  your personal **skill level**.
- **Grounding** — giving an agent the specific content it should answer from (a SharePoint site, a set of
  files, a database) so its answers are based on *your* facts, not the model's general training.
- **Knowledge source** — the documents or sites an agent is grounded on. The single biggest driver of answer
  quality.
- **Topic** — in Copilot Studio, a defined conversation path that handles a particular intent (e.g. "reset my
  password"). The building block of structured, multi-turn conversations.
- **Connector / action** — a configured capability that lets an agent *do* something in another system — look
  up an order, create a ticket, update a record — rather than only talking. See
  [Connect an agent to a system](walkthroughs/studio-connector-action.md).
- **Power Automate flow** — a workflow that an agent can trigger to act on business systems (create a ticket,
  send a notification, write to a database). See
  [Trigger a Power Automate flow](walkthroughs/studio-power-automate-flow.md).
- **MCP (Model Context Protocol)** — an open standard for connecting agents to external tools and data
  sources in a consistent way. See [Add an MCP / tool integration](walkthroughs/studio-mcp-tool-integration.md).
- **Autonomous / triggered agent** — an agent that acts when an event happens (a file is added, a message
  arrives) instead of waiting for someone to start a conversation.

---

## Cost & consumption { #cost-consumption }

- **Copilot Credit** *(formerly "message")* — the unit Copilot Studio meters agent usage in. Credits are
  pooled across the whole tenant and funded through pay-as-you-go, prepurchase, or prepaid packs. The name
  changed from *messages* on **September 1, 2025** (same quantity, same rate — just a new name). Learn the
  model on [How Copilot Credits work](copilot-credits.md) and estimate yours in the
  [Credit Estimator](credit-estimator.md).
- **Classic vs generative answer** — a *classic* answer is a pre-authored, static reply (**1 credit**); a
  *generative* answer has the AI read your knowledge and respond dynamically (**2 credits**). Most modern
  agents are generative.
- **Agent action** — a step where the agent *does* something — a [connector or flow](walkthroughs/studio-connector-action.md)
  call, deep reasoning, or a topic transition — billed at **5 credits**.
- **Tenant graph grounding** — retrieval-augmented generation over your tenant-wide Microsoft 365 Graph
  (people, mail, meetings, files), billed at **10 credits** on top of the answer. Optional and toggled per
  agent — the powerful-but-pricier grounding mode, distinct from *free* grounding over your own documents.
- **Interactive vs autonomous (billing regimes)** — *interactive* agents bill per user interaction and can
  be zero-rated for Microsoft 365 Copilot-licensed users; *autonomous / triggered* agents bill **per
  event**, with no license discount. Which regime an agent is in usually dominates its bill.
- **Build size (T-shirt)** — an XS → XL estimate of the *effort to build and own* an agent — **not** its
  run cost. A cheap-to-run agent can be expensive to build, and a tiny agent at high volume can be
  expensive to run; the [estimator](credit-estimator.md) reports the two axes separately.

---

## Platform & governance

- **Power Platform** — Microsoft's low-code suite (Power Apps, Power Automate, Power Pages, and Copilot
  Studio). Studio agents live in a Power Platform **environment**.
- **Environment** — an isolated container in Power Platform where agents, flows, and data live. Used to
  separate dev, test, and production.
- **Microsoft Entra ID** *(formerly Azure AD)* — Microsoft's identity service. It's how agents authenticate
  users and act with the right permissions. See [Secure a Studio agent](walkthroughs/studio-authentication.md).
- **ALM (Application Lifecycle Management)** — the practice of moving an agent through dev → test → production
  in a controlled, repeatable way, with versioning and governance.
- **DLP (Data Loss Prevention)** — admin-defined policies that control which connectors and data an agent is
  allowed to touch — a core governance guardrail.
- **Tenant** — your organization's instance of Microsoft 365. Licensing, admin settings, and feature
  availability (including Frontier) are all set at the tenant level. Copilot Studio usage is metered in
  **Copilot Credits** — see [Cost & consumption](#cost-consumption) above.

---

> **📚 Learn more.**
>
> - [Microsoft Copilot — Which Copilot is right for you](https://learn.microsoft.com/en-us/copilot/)
> - [Copilot Studio documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
> - [Agent Builder vs Studio vs Foundry (decision framework)](https://aka.ms/copilotstudio/resources)

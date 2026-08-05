---
title: "Build Surfaces: Control & Billing"
description: Every place you can build a Microsoft Copilot agent, lined up with who controls it and how it's billed - governance and cost in one look.
---

# Build surfaces — where you build, who controls it, how it's billed

Three questions come up the moment an organization gets serious about agents, and they're usually
answered on three different pages:

1. **Where can we actually build agents?**
2. **Who controls each of those places?**
3. **How is each one billed?**

This page answers all three **in the same look**. It maps every surface on the ramp to its
**governance control plane** and its **billing model**, so a champion, an admin, and a finance owner
can read the same table and agree on what's allowed, who owns it, and what it costs.

!!! warning "Unofficial — verify against Microsoft docs"
    This is community guidance to help you reason about the *shape* of the controls and billing — not a
    contract or a configuration runbook. Names, rates, defaults, and capabilities evolve. Always confirm
    specifics against the linked Microsoft documentation before you make a governance or budget decision.

---

## The places you can *build* an agent

These are the three surfaces where a maker or developer authors a new agent. Read left to right:
*the further right you go, the more you build — and the more control (and cost ownership) shifts to you.*

| Build surface | Where you build it | Who can build (the maker gate) | Who controls / governs it | How it's billed |
| --- | --- | --- | --- | --- |
| **[Agent Builder](../stages/stage-4-agent-builder.md)** <br><small>low-code, inside M365 Copilot</small> | In the **Microsoft 365 Copilot** experience (Copilot Chat) — no separate tool | Any licensed user your tenant allows to *create and share* agents | **Microsoft 365 admin center** (agent create/share controls) + Purview; surfaced in the Agent 365 registry | **Included in the Microsoft 365 Copilot license.** Generative answers are zero-rated in Agent Builder / on M365 surfaces *without* tenant-graph grounding; **tenant-graph grounding meters at 10 credits/message**, and unlicensed users on metered features accrue **Copilot Credits** (pay-as-you-go) |
| **[Copilot Studio](../stages/stage-6-studio.md)** <br><small>low-code, standalone designer</small> | In **Copilot Studio**, targeting a **Power Platform environment** | Makers with a **Copilot Studio** license and a maker role in an environment | **Power Platform admin center** + **data policies (DLP)**, Purview maker audit, Microsoft Sentinel alerts, pre-publish security scan; Agent 365 registry | **Copilot Credits** — **pay-as-you-go**, **message packs**, or **pre-purchase**. On M365 surfaces (Copilot Chat, Teams, SharePoint) **licensed users accrue zero credits**; **unlicensed users and any external channel are charged** at the per-feature rate card |
| **[Foundry](../stages/stage-7-foundry.md)** <br><small>pro-code, engineered</small> | In **Azure** — a **Microsoft Foundry project**, via SDKs / CI-CD | **Developers** with Azure RBAC roles on the subscription / project | **Azure RBAC + Azure Policy**, managed identities, per-project isolation; governed as an "Enterprise AI app" in Purview; Agent 365 registry | **Azure consumption**, billed to *your* Azure subscription: base-model **inference tokens** (input + output) per agent, **Code Interpreter per session**, **File Search by vector storage**, plus the standard-setup resources (Storage, Cosmos DB, AI Search, Key Vault) |

!!! info "Two things that are true of every build surface"
    - **The maker gate is a real control.** In all three, an admin decides *who* may build and share — this
      is the first place to set policy, before an agent ever exists.
    - **Licensing ≠ consumption.** A license (M365 Copilot, Copilot Studio) is what *unlocks* the surface;
      **billing** is what you pay as agents *run*. The two are separate line items — the table's last column
      is about run-time cost, not the entitlement.

---

## …and the surfaces you *use* (included for completeness)

Agents you **consume** rather than author still have a control plane and a billing model, and people
routinely conflate them with the build surfaces — so here they are in the same shape.

| Use surface | Who controls / governs it | How it's billed |
| --- | --- | --- |
| **[Chat](../stages/stage-1-chat.md)** | Microsoft 365 admin center | **Covered by the Microsoft 365 Copilot per-user license.** Without a license, web-grounded chat is free but can't reason over your work content |
| **[First-party agents](../stages/stage-2-first-party.md)** | Microsoft 365 admin center → **Integrated apps** (per-agent enablement) | **Included in the Microsoft 365 Copilot license** — the prebuilt agents aren't sold separately |
| **[Cowork](../stages/stage-3-cowork.md)** | Microsoft 365 admin center; **Frontier** enrollment for the full feature set | Metered as **Copilot Credits** through the Microsoft 365 Copilot Chat pay-as-you-go meter — **licensed users are covered by their license**; unlicensed usage is metered |

---

## The two things Amy's question is really about

### 1 · Where you control — the governance planes

Every surface has an **admin plane** where you set who can build, what data an agent may touch, and how
it's audited. There are three of them, and one control plane that spans all:

- **Microsoft 365 admin center** — governs Chat, First-party agents, Cowork, and **Agent Builder**
  (agent create/share, Integrated apps, per-agent enablement).
- **Power Platform admin center** — governs **Copilot Studio**: environments, **data policies (DLP)**,
  connector approvals, publishing rights.
- **Azure (RBAC + Policy)** — governs **Foundry**: least-privilege roles, managed identities, per-project
  isolation, network controls.
- **Microsoft Agent 365** — the control plane *above* all three: a single registry, an **Entra Agent ID**
  for every agent, and one **Purview** data-governance view across the whole fleet.

The full column-by-column detail — identity, data residency, Purview coverage, audit trail — lives on the
**[Security & Governance](security.md)** page. This page is the *"who owns the switch and what does it
cost"* companion to it.

### 2 · How it's billed — the three billing models

There are only three billing shapes to learn:

- **Per-user license** *(entitlement)* — **Microsoft 365 Copilot** covers Chat, First-party agents, and
  Agent Builder's included features; a **Copilot Studio** license unlocks Studio. You pay per seat, not
  per run.
- **Copilot Credits** *(consumption)* — Copilot Studio agents, and Cowork/Agent Builder features that meter
  (e.g. tenant-graph grounding, external channels, unlicensed users). Buy as **pay-as-you-go**, **message
  packs**, or a **pre-purchase** commit. Learn the model in **[How Copilot Credits work](../copilot-credits.md)**,
  then size it with the **[Credit Estimator](../credit-estimator.md)**.
- **Azure consumption** *(consumption)* — **Foundry** agents bill for the model tokens and Azure resources
  they actually use, straight to your Azure subscription.

!!! tip "Where the numbers live"
    This page shows the *model* — which surface bills which way. For the **credit model** in depth (build
    size vs. run cost, the M365 Copilot discount) read **[How Copilot Credits work](../copilot-credits.md)**;
    for the **rate card and the math** (per-feature rates, licensed-vs-unlicensed zero-rating, message-pack
    sizing, a whole-portfolio roll-up) use the interactive **[Credit Estimator](../credit-estimator.md)**. For
    the **entitlements** (which license unlocks which stage, and who assigns it), see
    **[Licensing & Prerequisites](../prerequisites.md)**.

---

## The detail behind each build surface

The collapsible sections below add the granular control + billing detail and link straight to the
authoritative Microsoft documentation.

??? note "Agent Builder — control & billing detail"
    **Control.** Agent Builder lives *inside* the Microsoft 365 Copilot experience, so it inherits M365
    Copilot's protections and is governed from the **Microsoft 365 admin center**. Your tenant must allow
    makers to *create and share* agents — some orgs restrict this — and admins can set approval / publishing
    controls. Agents surface in the **Agent 365** registry with an **Entra Agent ID** and Purview coverage.

    **Billing.** Agent Builder's core generative answers are **included in the Microsoft 365 Copilot
    license** and are **zero-rated on Microsoft 365 surfaces / in Agent Builder** *when they run without
    tenant-graph grounding*. **Tenant-graph grounding always meters at 10 credits/message**, and
    **unlicensed** users on any metered feature accrue **Copilot Credits** (pay-as-you-go).

    - Control: [Set up Microsoft 365 Copilot (admin)](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-setup)
      · [Security & Governance](security.md)
    - Billing: [Copilot Studio billing rates & management](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management)
      · [Estimate it → Credit Estimator](../credit-estimator.md)

??? note "Copilot Studio — control & billing detail"
    **Control.** Studio agents live in **Power Platform environments** and are governed from the **Power
    Platform admin center**. **Data policies (DLP)** control maker & user authentication, knowledge sources,
    actions / connectors / skills, HTTP requests, channel publication, and autonomous triggers. Maker audit
    logs flow to **Microsoft Purview**, agent-activity alerts to **Microsoft Sentinel**, and a **pre-publish
    security scan** warns makers of risky configurations. CMK and Customer Lockbox are supported.

    **Billing.** Studio meters in **Copilot Credits** (formerly "messages"), which you can consume
    **pay-as-you-go**, buy as **message packs**, or commit via **pre-purchase**. The key rule: on **Microsoft
    365 surfaces** (Copilot Chat, Teams, SharePoint) authenticated users with an **M365 Copilot license
    accrue zero credits** — only unlicensed users do; on **any external channel** (custom website, external
    or custom app, standalone) **all users are charged**. Per-feature rates: classic answer 1, generative
    answer 2, agent action 5, tenant-graph grounding 10/message, agent-flow action 0.13, AI tools 0.1 / 1.5 /
    10, voice 10 / 35 / 75.

    - Control: [Copilot Studio security & governance](https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-and-governance)
      · [Govern & monitor agents at scale](../walkthroughs/studio-govern-monitor.md)
    - Billing: [Billing rates & management](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management)
      · [Pay-as-you-go meters](https://learn.microsoft.com/en-us/microsoft-365/copilot/pay-as-you-go/meters)
      · [Studio licensing](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-licensing)

??? note "Foundry — control & billing detail"
    **Control.** Foundry is a **pro-code, developer-owned** platform in **Azure**, not the M365 admin center.
    Access is **Microsoft Entra ID + Azure RBAC** (preferred over key auth) with least-privilege built-in
    roles and PIM for just-in-time access. The **standard agent setup** uses *your own* single-tenant Azure
    resources — Storage, Cosmos DB, AI Search, Key Vault — so agent data stays in **your** tenant, isolated
    per project, with system / user-assigned **managed identities** scoping access.

    **Billing.** Foundry agents bill as **Azure consumption**, charged to your Azure subscription:

    - **base-model inference** (input + output tokens) for each agent you run;
    - **Code Interpreter** billed **per session** (a session is active up to one hour);
    - **File Search** billed by the **vector storage** it uses;
    - plus the standard-setup Azure resources listed above.

    - Control: [Foundry RBAC](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/rbac-azure-ai-foundry)
      · [Standard agent setup](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/concepts/standard-agent-setup)
    - Billing: [How am I charged for Foundry Agent Service?](https://learn.microsoft.com/azure/foundry/agents/faq#how-am-i-charged-for-foundry-agent-service)
      · [Manage costs for Foundry](https://learn.microsoft.com/azure/foundry/concepts/manage-costs)
      · [Foundry pricing](https://azure.microsoft.com/pricing/details/ai-foundry/)

---

## Where this leads

- **Deciding *whether* a use case is even licensed?** Start at [Licensing & Prerequisites](../prerequisites.md).
- **Deciding *which* surface an idea belongs in?** Use [Choose the Right Path](decision-tree.md) or the
  interactive [Path Finder](wizard.md).
- **Need the control detail** — identity, data residency, audit — column by column? See
  [Security & Governance](security.md).
- **Need the actual cost numbers?** Model them in the [Credit Estimator](../credit-estimator.md).

> **📚 Learn more.**
>
> - [Copilot Studio billing rates & management](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management) — the credit rate card.
> - [Microsoft 365 Copilot pay-as-you-go meters](https://learn.microsoft.com/en-us/microsoft-365/copilot/pay-as-you-go/meters) — how consumption is metered.
> - [How am I charged for Foundry Agent Service?](https://learn.microsoft.com/azure/foundry/agents/faq#how-am-i-charged-for-foundry-agent-service) — Azure consumption for pro-code agents.
> - [Copilot Studio security & governance](https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-and-governance) — maker-environment controls.

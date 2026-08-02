---
title: Secure and govern Foundry agents in production
description: Run pro-code Foundry agents like production software, with tenant-isolated data, least-privilege identity, and the same governance plane as low-code agents.
stage: foundry
roles: [it-admin, developer]
tags: [foundry, security, governance, rbac, entra, purview, agent-365, pro-code, frontier]
level: advanced
time: 60 min
status: walkthrough
prereqs: [azure-subscription, foundry-project, developer-skills]
updated: 2026-06-04
---

# Secure and govern Foundry agents in production

> Run pro-code agents like the production software they are — with tenant-isolated
> data, least-privilege identity, and the same governance plane as your low-code agents.

**Stage:** Foundry · **For:** IT/admin, Developer · **Level:** Advanced · **Time:** 60 min

!!! warning "Governance is the price of the frontier"
    Foundry agents live in **Azure**, not the Microsoft 365 admin center, and they can touch real systems.
    The controls below are the shape of the work — verify exact roles, setup, and governance surfaces
    against the [Foundry RBAC](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/rbac-azure-ai-foundry)
    and [standard agent setup](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/concepts/standard-agent-setup)
    docs. Agent 365 and Purview coverage is **evolving — confirm current state**.

## When to use this
You're about to put a Foundry agent in front of real users or real systems. Before it goes live, the
identity it acts as, the data it stores, and the oversight around it all have to be deliberate — not
defaults. This is the walkthrough the IT/admin and the developer do *together*.

## What you'll need
- The **Foundry project** and the agent(s) heading for production.
- **Owner/Contributor** on the relevant Azure resources, plus the ability to assign **RBAC** roles.
- Your org's **data residency / isolation** requirements and any compliance obligations.
- A decision on **who owns** the agent's identity, resources, and monitoring once it's live.

## Try it now — bring data into your tenant
Move from the quick-start defaults to the **standard agent setup**, where agent state lives in *your*
Azure resources (Storage, Cosmos DB, AI Search, Key Vault) inside your subscription — so the data never
leaves your tenant boundary. Plan it as infrastructure:

```
Standard agent setup checklist (verify each against the docs):
- [ ] Storage account, Cosmos DB, AI Search, Key Vault provisioned in MY subscription
- [ ] Agent project wired to those resources (bring-your-own, not the shared default)
- [ ] DefaultAzureCredential / managed identity — NO API keys in code or config
- [ ] Least-privilege RBAC: each identity has only the roles it needs
- [ ] Network controls (private endpoints / firewall) per policy
```

**Why this works:** the default setup is great for prototyping, but production data needs a **known
boundary**. Standard setup puts the agent's memory and knowledge in resources you own, audit, and control.

## Step by step
1. **Choose the setup that matches the data.** For anything beyond a prototype, use the standard
   (bring-your-own-resources) setup so agent data stays in your tenant. Document why.
2. **Make identity explicit.** Replace any keys with **Entra ID** identities — managed identity in
   production, your user identity locally. Assign **least-privilege** Foundry/Azure roles to each
   developer, agent, and pipeline. Nobody gets Owner "to make it work."
3. **Lock down what tools can reach.** Every tool and connection runs as an identity; scope each to the
   minimum it needs and store secrets in **Key Vault**, never in code.
4. **Wire in oversight.** Send agent telemetry and [evaluation/monitoring](foundry-evaluate-monitor.md)
   signals to Azure Monitor / Application Insights, and confirm how these agents surface in your
   governance tooling — **Microsoft Purview** classifies Foundry agents as Enterprise AI apps, and
   **Agent 365** is designed to govern them alongside low-code agents *(both evolving — verify)*.
5. **Write the runbook.** Document who owns the agent, how to disable it fast, what the alerts mean, and
   who responds. An agent without an off switch and an owner isn't production-ready.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Automate the guardrails.** Express the resource layout and role assignments as infrastructure-as-code
  so every new agent inherits the secure baseline instead of being secured by hand.
- **Add customer-managed keys / network isolation.** Where policy demands it, bring your own encryption
  keys and lock the resources behind private networking.
- **Review access on a cadence.** Roles drift. Re-attest who can touch the project and its data on a
  schedule, the same as any production system.

## Watch out for
- **Defaults are for demos.** The fastest setup often co-locates data and over-grants access — fine for a
  spike, wrong for production. Promote deliberately to the standard, least-privilege setup.
- **Two admin planes.** Foundry governance lives in **Azure** while your low-code agents live in the
  **M365 / Power Platform** admin center. Make sure *someone* owns the whole picture, not half of it.
- **"Evolving" means verify.** Agent 365 and Purview coverage for Foundry agents is moving quickly. Treat
  any specific capability here as something to confirm against current docs before you rely on it.

## Where this leads (the frontier)
Secured and governed, your agent — or system of agents — is genuinely production software. That's the end
of the ramp: there's no Stage 7. Keep the discipline that got you here — pick the **lowest** stage that
solves each problem, and only operate at the frontier when the work truly demands it. Keep the backlog in
the [Use-Case Catalog](../CATALOG.md).

## Related
- [Stage 7 · Foundry](../stages/stage-7-foundry.md) — the stage this hardens for production
- [Security & Governance](../empowerment/security.md) — how every stage's controls fit together
- [Evaluate and monitor a Foundry agent](foundry-evaluate-monitor.md) — the oversight half of governance

---
title: Licensing & prerequisites
description: Sort out the Microsoft Copilot licensing and prerequisites behind every walkthrough, so a feature you can't see never blocks you on the ramp again.
---

# Licensing & prerequisites

The single most common blocker on the ramp is *"the walkthrough describes a feature I can't see."* Almost
always that's a **licensing or admin-enablement gap**, not a mistake on your part. This page maps what each
stage actually needs.

!!! warning "Unofficial — verify before you buy"
    Licensing and feature availability change often and vary by tenant, region, and plan. Treat this as a
    planning aid, not a contract. Confirm specifics with your Microsoft account team or the official
    [Microsoft 365 Copilot licensing docs](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-licensing).

---

## At a glance

| Stage | Core requirement | Special access | Who enables it |
| --- | --- | --- | --- |
| **[1 · Chat](stages/stage-1-chat.md)** | Microsoft 365 Copilot license *(for work-grounded answers)* | — | IT assigns the license |
| **[2 · First-Party Agents](stages/stage-2-first-party.md)** | Microsoft 365 Copilot license | Some agents roll out in waves | IT + the agent's admin controls |
| **[3 · Cowork](stages/stage-3-cowork.md)** | Microsoft 365 Copilot license | **Frontier** enrollment for the full feature set | Account team / Global Admin |
| **[4 · Agent Builder](stages/stage-4-agent-builder.md)** | Microsoft 365 Copilot license | Agent Builder enabled for makers | IT (maker permissions) |
| **[6 · Copilot Studio](stages/stage-6-studio.md)** | Copilot Studio license + Power Platform environment | Connectors, auth, publishing rights | IT / Power Platform admin |

---

## Stage by stage

### Stage 1 · Chat
- **License:** A **Microsoft 365 Copilot** per-user license (on top of a qualifying Microsoft 365 plan) is
  what unlocks answers grounded in *your* email, files, chats, and meetings.
- **Without a license:** Copilot Chat still works for general, web-grounded questions — a fine place to build
  the prompting habit — but it can't reason over your work content.
- **Admin must:** Assign the license and confirm Copilot is turned on for the user.

### Stage 2 · First-Party Agents
- **License:** Covered by the same **Microsoft 365 Copilot** license — the prebuilt agents are included, not
  sold separately.
- **Watch for:** Individual agents (Researcher, Analyst, Facilitator, and others) graduate from preview to GA
  on their own timelines and can be governed per-tenant, so the exact roster you see may differ.
- **Admin must:** Confirm the specific agents are enabled and rolled out to the right users.

### Stage 3 · Cowork
- **License:** **Microsoft 365 Copilot.** Basic end-to-end task delegation and document synthesis work with
  standard licensing.
- **Special access:** The fuller Cowork capabilities — autonomous multi-step runs, recurring background
  tasks, and advanced Copilot Pages features — often require **Frontier** enrollment, Microsoft's
  early-access program. Walkthroughs that need it are marked on the
  [Cowork stage page](stages/stage-3-cowork.md).
- **Admin must:** Nominate the tenant for Frontier (via your CSM / AE / FastTrack contact) or opt in through
  the Frontier portal if eligible.

### Stage 4 · Agent Builder
- **License:** **Microsoft 365 Copilot** — Agent Builder lives inside the M365 Copilot experience.
- **Special access:** Your tenant must allow makers to *create and share* agents; some orgs restrict this.
- **Admin must:** Grant agent-creation/sharing permissions and set any approval or publishing controls.

### Stage 6 · Copilot Studio
- **License:** A **Copilot Studio** license (standalone capacity or a qualifying bundle) plus a **Power
  Platform environment** to build in.
- **Special access:** Building real agents pulls in more moving parts — **connectors** to other systems,
  **Entra ID authentication**, **publishing** rights to Teams/web, and **DLP** policies that govern what an
  agent may touch.
- **Admin must:** Provision the environment, grant maker roles, approve connectors, and set governance
  guardrails. See [Govern and monitor agents at scale](walkthroughs/studio-govern-monitor.md).

---

## Quick self-diagnosis

??? question "I can't see a feature a walkthrough describes — what do I check?"
    1. **License** — do you have a Microsoft 365 Copilot license assigned (Stages 1–4) or a Copilot Studio
       license (Stage 6)? Your IT admin can confirm.
    2. **Rollout wave** — for first-party agents and newer capabilities, the feature may still be rolling out
       to your tenant.
    3. **Frontier** — for the advanced Cowork features, your tenant may need
       [Frontier enrollment](stages/stage-3-cowork.md).
    4. **Admin policy** — maker permissions, connector approvals, and DLP can all hide or block a capability
       even when it's licensed.

---

> **📚 Learn more.**
>
> - [Microsoft 365 Copilot licensing](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-licensing)
> - [Set up Microsoft 365 Copilot (admin)](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-setup)
> - [Copilot Studio licensing](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-licensing)
> - [Estimate Studio usage → Credit Estimator](credit-estimator.md)

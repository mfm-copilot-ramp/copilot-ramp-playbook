---
title: "One skill, three surfaces: the customer-health capability"
description: Follow one skill — ranking accounts worst-first by risk — across three surfaces: a Cowork recipe, an always-on Scout autopilot, and a governed Studio tool.
stage: studio
roles: [end-user, manager, champion, maker]
tags: [skill, lineage, cowork, autopilots, scout, studio, customer-health, three-surfaces]
level: intermediate
time: 12 min
status: walkthrough
updated: 2026-08-21
---

# One skill, three surfaces: the customer-health capability

> A skill isn't tied to one product. The *same* reusable capability can be **described in Cowork**,
> **equipped onto Scout**, or **hardened into a governed tool in Studio** — you pick the surface by how
> often it runs, how autonomously, and how much governance it needs. This page follows one concrete skill
> across all three.

**Stage:** Cross-surface (Cowork → Autopilots → Studio) · **For:** End user, Manager, Champion, Maker · **Level:** Intermediate · **Time:** 12 min

## When to use this
Read this when you've captured a reusable skill and need to decide *where it should run* — on demand in
[Cowork](../stages/stage-3-cowork.md), always-on in [Scout](../stages/stage-5-autopilots.md), or hardened into
a governed tool in [Copilot Studio](../stages/stage-6-studio.md). It's a decision guide, not a build guide;
each surface links out to its own step-by-step walkthrough.

## What you'll need
- A skill you can state in one plain-language sentence (the example below)
- A rough sense of how often it runs, how autonomously, and how much governance it needs
- Familiarity with the three surfaces: Cowork, Scout / Autopilots, and Copilot Studio

## Try it now
The whole page follows one capability, stated in plain language:

```text
Rank my accounts worst-first by risk, tell me which ones are moving the
wrong way, and don't contact any customer without checking first.
```

That's a *skill* — a reusable capability, not a one-off prompt. What changes across the three surfaces isn't
*what* it does; it's *who runs it, how often, and under how much control.* Same instinct — capture it once —
expressed three ways.

## Step by step
The same skill, expressed across the three surfaces — read down and stop at the one that matches the job.

### Surface 1 — Cowork: the skill you *describe* and run on demand
On the [Cowork](../stages/stage-3-cowork.md) surface, the skill lives as a **recipe**: a multi-step task you
capture once — name, inputs, expected output — so anyone can rerun it cold instead of reinventing the prompt.

- **You** kick it off when you want it (Monday morning, before a QBR, when a deal wobbles).
- It runs **in the moment**, grounded in what Cowork can see, and hands you the ranked list.
- Nothing is standing or autonomous — it's a saved capability you *pull*.

→ **Build it:** [Generate a weekly customer-health digest across your accounts](cowork-customer-health-digest.md)

!!! tip "This is the cheapest place to prove the skill"
    Get the ranking logic and the "what counts as risk" definition right *here*, on demand, before you ever
    hand it to an always-on agent. A recipe that's still fuzzy shouldn't be promoted.

### Surface 2 — Autopilots (Scout): the same skill, equipped onto an always-on agent
When the recipe is stable and worth running *continuously*, you graduate it onto
[Microsoft Scout](../stages/stage-5-autopilots.md) — the first **Autopilot**. Now the identical capability is
**equipped**, not described:

- **Scout** runs it in the background on its own trigger — the at-risk list **re-scores itself** as signals
  change and never goes stale.
- It works **on your behalf under your governed identity**, and keeps **you in the loop** — it surfaces and
  flags; you decide and it never contacts a customer without your say-so.
- You stopped *starting* the skill. You just get pinged when something moves.

→ **Equip it:** [Equip Scout with a continuous customer-health watch](autopilots-customer-health-watch.md)

!!! info "Emerging and gated"
    Scout is in **Frontier private preview** — availability, and how you equip and manage its skills, roll out
    by tenant, license, and region. Treat the
    [Microsoft Scout Learn page](https://learn.microsoft.com/en-us/microsoft-scout/) as the source of truth
    before any customer-facing claim.

### Surface 3 — Studio: the skill *hardened* into a governed tool
When the capability needs to take **real, governed actions against a system of record**, run **org-wide under
central control**, or be **shared and monitored like a product**, you've outgrown equipping an agent — you
*build* it in [Copilot Studio](../stages/stage-6-studio.md).

Here the terminology sharpens: on the Studio surface a reusable capability becomes a **tool** (Studio reserves
the word *skill* for a narrower, pro-code-agent meaning — see the
[Skills Catalog note](../skills.md#studio-skills-a-specific-kind-of-tool)). The customer-health skill hardens
into a small stack of governed tools:

- **A trigger** so it runs itself against real events, not a person's prompt →
  [Configure an autonomous event-triggered agent](studio-autonomous-triggers.md)
- **A real action** so it can read the system of record (CRM, tickets, usage) instead of guessing →
  [Give a Studio agent a real action with a connector](studio-connector-action.md)
- **Governance and monitoring** so it runs org-wide with policy, DLP, and oversight →
  [Govern and monitor your agents at scale](studio-govern-monitor.md)

That's the same customer-health skill — now durable, auditable, and shareable, running against real data under
central control.

## Pick the surface by the job, not the product
The three surfaces aren't a ladder you must climb — they're a **choice**. Match the surface to what the skill
actually needs:

| If the skill… | Run it on… | Because |
| --- | --- | --- |
| Runs occasionally, when *you* decide | **Cowork** (recipe) | Cheapest to build and change; you pull it on demand |
| Should run continuously, on its own, for *you* | **Scout** (autopilot) | Always-on, re-scores itself, keeps you in the loop |
| Must take governed actions on systems, org-wide | **Studio** (tool) | Real actions, policy, monitoring, sharing |

## Make it better
A skill isn't fixed to one surface. Graduate it as it earns more autonomy and reach — these are the signals it's ready:

!!! note "Promotion signals — when to graduate a skill"
    - **Cowork → Scout:** you're rerunning the same recipe on a rhythm and wish it just *ran itself*.
    - **Scout → Studio:** you need it to **act** on a system of record, run **org-wide**, or be **governed
      and monitored** — beyond what an equipped agent should do under one person's identity.

## Watch out for
- **Don't skip the cheap proof.** Promoting a fuzzy recipe straight to a governed Studio tool bakes the fuzz
  into production. Prove the logic in Cowork first, tighten it on Scout, *then* harden it.
- **Terminology shifts on the Studio surface.** Cowork and Scout call it a *skill*; Studio building blocks
  (connector actions, flows, MCP tools, triggers) are **tools**. A Studio *skill* is a narrower, pro-code
  thing — [details here](../skills.md#studio-skills-a-specific-kind-of-tool).
- **Governance scales with autonomy.** The more autonomously and broadly the skill runs, the more the
  guardrails matter — which is exactly why the customer-health tool ends with governance, not an action.
- **Scout is private preview.** Verify behavior against the
  [Microsoft Scout docs](https://learn.microsoft.com/en-us/microsoft-scout/) if it differs from what's here.

## Where this leads
Follow the same capability onward, or build any single surface end-to-end:

- [Skills Catalog](../skills.md) — the full three-surface model and the reusable skills worth building first
- [Cowork → Generate a weekly customer-health digest](cowork-customer-health-digest.md)
- [Autopilots → Equip Scout with a continuous customer-health watch](autopilots-customer-health-watch.md)
- [Studio → Configure an autonomous event-triggered agent](studio-autonomous-triggers.md)
- [Studio → Give a Studio agent a real action with a connector](studio-connector-action.md)
- [Studio → Govern and monitor your agents at scale](studio-govern-monitor.md)

## Screenshots
This page is a conceptual map, so the visuals live on the three build walkthroughs it points to:

- [Cowork — generate a weekly customer-health digest](cowork-customer-health-digest.md)
- [Autopilots — equip Scout with a continuous customer-health watch](autopilots-customer-health-watch.md)
- [Studio — govern and monitor your agents at scale](studio-govern-monitor.md)

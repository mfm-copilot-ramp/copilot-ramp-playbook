---
title: "Stage 5 · Autopilots"
description: Stage 5 of the Copilot ramp. Hand a recurring job to an always-on autonomous agent like Microsoft Scout that watches, decides, and acts without being prompted.
stage: autopilots
---

# Stage 5 · Autopilots

> **Always-on agents that work in the background. Hand a recurring job to a ready-made autonomous agent — Microsoft Scout is the first — that watches, decides, and acts without being prompted each time.**

**The shift:** from "I run an agent when I need it" to "an agent runs *for* me." Stages 1–4 were all on-demand — you start a chat, call an agent, kick off a recipe, or build a simple one. Autopilots flip the model: the agent is *always on*, triggered by events and signals rather than a prompt, doing a defined job continuously.

!!! info "An emerging stage — availability varies"
    Autopilots are a newer, **gated** capability. **Microsoft Scout** — the first Autopilot — is in
    **Frontier private preview**, so access is still rolling out by tenant, license, and region. This stage
    is marked **pioneer** for that reason: it's real and worth adopting where you have it, but **not every
    user will have access yet**. Treat the [Microsoft Scout Learn page](https://learn.microsoft.com/en-us/microsoft-scout/)
    as the source of truth and re-check before customer-facing claims.

---

## When you're ready for this stage

You've got a job that shouldn't wait for you to start it — monitoring a queue, watching for a signal, keeping something up to date, or kicking off the same follow-through every time an event happens. You've already felt the pull in earlier stages ("an agent will soon do this on autopilot") and now the always-on version exists.

!!! question "Going the wrong way?"
    Autopilots are **ready-made autonomous agents you adopt**, not ones you engineer. If you need real
    actions against a system of record, custom logic, or org-wide publishing, that's
    [Stage 6 · Copilot Studio](stage-6-studio.md). If you just need a simple, on-demand agent for you and a
    few teammates, that's [Stage 4 · Agent Builder](stage-4-agent-builder.md).

## What you need

- Access to **Microsoft Scout** (the first Autopilot) in your tenant — confirm availability with your IT admin, since it's in private preview.
- A clearly defined, recurring job the agent can own, with a trigger or signal that should set it off.
- Comfort with delegation: you set the goal and the guardrails, the agent runs continuously.

---

## What Autopilots are

**Autopilots** are always-on, autonomous agents: each is given a job and a trigger, then runs in the background under its own governed Microsoft Entra identity — noticing when something happens, deciding what to do, and acting on your behalf within the permissions and policies you set. Where an Agent Builder agent answers when you *call* it, an Autopilot works *for* you between prompts.

<div class="grid cards rc-grid rc-hero" markdown>

-   **★ Microsoft Scout — the first Autopilot**

    An always-on personal agent that builds context over time through Work IQ — [introduced June 2, 2026](https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/02/introducing-microsoft-scout-your-always-on-personal-agent/) as the first agent in the Autopilots category, and the focus of this stage.

    **What Scout can do today:**

    - Coordinate meeting times across time zones, and flag the meetings that matter
    - Generate your prep ahead of time — with you in the loop
    - Identify upcoming deliverables and block calendar time to protect them
    - Spot stalled-decision risks before they become blockers

    <span class="rc-meta"><span class="rc-chip rc-chip-star">★ First Autopilot</span> <span class="rc-chip rc-chip-skill">Frontier · private preview</span></span>

    [Learn more about Microsoft Scout →](https://learn.microsoft.com/en-us/microsoft-scout/)

</div>

### What makes an agent an Autopilot

<div class="grid cards rc-skill-grid" markdown>

-   **Always-on**

    Runs in the background, triggered by events and signals — not by a prompt you type each time.

-   **Its own identity**

    Acts under a governed Microsoft Entra identity, so everything it does is attributable to it.

-   **Acts on your behalf**

    Works within the permissions and policies you already have — never beyond your own access.

-   **Governed — you stay in the loop**

    Sensitive actions can require your sign-off, and Microsoft Purview sensitivity labels and DLP are enforced in the moment.

</div>

Scout is the **first** Autopilot — Microsoft has signaled the category will grow, and as new Autopilots ship they'll join Scout here.

---

## Start here — if you only do three things

You can't fully drive this stage until Scout reaches your tenant — so the first move is to find out where you stand, then line up the recurring job you'll hand off the moment it's switched on.

<div class="grid cards rc-pinned" markdown>

-   <span class="rc-habit">Habit 1<small>Day 1</small></span>

    **[Meet Microsoft Scout & what Autopilots are](../walkthroughs/autopilots-meet-scout.md)**

    Pure learning, no access required — get the category-vs-product hierarchy straight and see what Scout actually does.

    <span class="rc-meta"><span class="rc-chip rc-chip-role">👤 Everyone</span> <span class="rc-chip rc-chip-skill">No access required</span></span>

-   <span class="rc-habit">Habit 2<small>Week 1</small></span>

    **[Find out if you can get Scout (and turn it on)](../walkthroughs/autopilots-get-access.md)**

    Confirm Frontier enrollment, the Intune policy + opt-in, and the GitHub Copilot license needed to install the desktop app.

    <span class="rc-meta"><span class="rc-chip rc-chip-role">👤 End user</span> <span class="rc-chip rc-chip-skill">Frontier · private preview</span></span>

-   <span class="rc-habit">Habit 3<small>Month 1</small></span>

    **[Hand Scout its first always-on job](../walkthroughs/autopilots-coordinate-meetings.md)**

    Let Scout coordinate meeting times and prep in the background — under your governed identity, with you in the loop.

    <span class="rc-meta"><span class="rc-chip rc-chip-role">👤 Manager</span> <span class="rc-chip rc-chip-skill">Frontier · private preview</span></span>

</div>

---

## All walkthroughs

These walk you from learning what Scout is, to finding out if you can get it, to handing it its first always-on jobs. Each shows the rough effort and who it's for, so filter by role or time to find your starting point.

<div id="rc-filterbar"></div>

<div class="rc-scrollbox" markdown>

<section class="rc-bucket" markdown>

### Meet the category
Get the hierarchy straight — Autopilots is the category, Scout is the first product — before you turn anything on.

<div class="grid cards rc-grid" markdown>

-   **[★ Meet Microsoft Scout — and what Autopilots are](../walkthroughs/autopilots-meet-scout.md)**

    The field guide: category vs. product, what Scout connects to, how it builds context with Work IQ, and what it can do today. No access required.

    <span class="rc-meta" data-time="10" data-roles="end-user champion manager maker it-admin"><span class="rc-chip rc-chip-time">⏱ 10 min</span> <span class="rc-chip rc-chip-role">👤 Everyone</span> <span class="rc-chip rc-chip-skill">No access required</span></span>

</div>

</section>

<section class="rc-bucket" markdown>

### Get set up
Scout is private preview — find out if you're eligible and what has to be true to switch it on.

<div class="grid cards rc-grid" markdown>

-   **[Find out if you can get Scout — and turn it on](../walkthroughs/autopilots-get-access.md)**

    The honest on-ramp: Frontier enrollment, the Intune policy + opt-in attestation, and the GitHub Copilot license needed to install the desktop app.

    <span class="rc-meta" data-time="15" data-roles="end-user champion it-admin"><span class="rc-chip rc-chip-time">⏱ 15 min</span> <span class="rc-chip rc-chip-role">👤 IT admin</span> <span class="rc-chip rc-chip-skill">Frontier · private preview</span></span>

</div>

</section>

<section class="rc-bucket" markdown>

### Hand Scout an always-on job
Once it's on, give Scout a standing job and let it work in the background under your guardrails.

<div class="grid cards rc-grid" markdown>

-   **[Let Scout coordinate your meetings and prep](../walkthroughs/autopilots-coordinate-meetings.md)**

    Scout lines up meeting times across time zones, flags what matters, and pulls prep together — keeping you in the loop.

    <span class="rc-meta" data-time="15" data-roles="end-user manager"><span class="rc-chip rc-chip-time">⏱ 15 min</span> <span class="rc-chip rc-chip-role">👤 Manager</span> <span class="rc-chip rc-chip-skill">Frontier · private preview</span></span>

-   **[Have Scout watch your deliverables and flag risks](../walkthroughs/autopilots-track-deliverables.md)**

    Scout identifies what's coming due, blocks calendar time, and spots stalled decisions before they become blockers.

    <span class="rc-meta" data-time="15" data-roles="manager champion end-user"><span class="rc-chip rc-chip-time">⏱ 15 min</span> <span class="rc-chip rc-chip-role">👤 Manager</span> <span class="rc-chip rc-chip-skill">Frontier · private preview</span></span>

</div>

</section>

</div>

---

## Skills in Autopilots

This is where the **[Skills Catalog](../skills.md)** meets always-on agents. A *skill* is a reusable, packaged capability you save once and reuse — and an Autopilot like Scout is something you can **equip with skills** so it can carry that task out autonomously.

- A **Cowork recipe** ([Stage 3](stage-3-cowork.md)) is a skill you *describe* and run on demand.
- An **Autopilot skill** is that same instinct handed to an always-on agent: the capability Scout draws on to do the job in the background, without you starting it each time.

A few illustrative examples of what an always-on agent could be equipped with — the set is **emerging and gated**, so treat these as the shape of things rather than a finished menu:

<div class="rc-scrollbox" markdown>

<div class="grid cards rc-skill-grid" markdown>

-   **[Always-on weekly digest](../skills.md#autopilots-scout-skills)**

    The Monday digest Scout assembles and posts on schedule — no one has to remember to start it.

    <span class="rc-meta"><span class="rc-chip rc-chip-skill">🧩 Example · gated</span></span>

-   **[Inbox & signal triage](../skills.md#autopilots-scout-skills)**

    Scout watches for what actually needs you and surfaces it, so the noise never reaches your desk.

    <span class="rc-meta"><span class="rc-chip rc-chip-skill">🧩 Example · gated</span></span>

-   **[Continuous customer-health watch](../skills.md#autopilots-scout-skills)**

    The worst-first account-ranking recipe from Cowork, kept always-on so the list is never stale.

    <span class="rc-meta"><span class="rc-chip rc-chip-skill">🧩 Example · gated</span></span>

</div>

</div>

That's the honest scope today — the way you equip and manage Autopilot skills is still emerging and gated alongside the rest of the stage, so the catalog keeps the **Autopilots (Scout) skills** lens scoped to what exists now and will grow as the capability does. See **[Skills Catalog → Autopilots](../skills.md#autopilots-scout-skills)**.

---

!!! borrow "Borrow, don't build"
    Microsoft owns the authoritative, always-current word on Scout — what it does, how to turn it on, and
    where it's available. Link to these rather than restating preview details that change.

    - [Introducing Microsoft Scout](https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/02/introducing-microsoft-scout-your-always-on-personal-agent/) — the June 2, 2026 announcement of the Autopilots category and its first agent
    - [Microsoft Scout on Learn](https://learn.microsoft.com/en-us/microsoft-scout/) — overview and setup, the source of truth for availability
    - [Work IQ APIs](https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/02/announcing-the-new-work-iq-apis/) — the work-context layer Scout is built on
    - [Frontier program](https://m365.cloud.microsoft/frontier) — the early-access path Scout ships through

    The full curated set for this stage lives in [Resources → Stage 5](../RESOURCES.md).

!!! info "Security at this stage"
    An Autopilot acts on your behalf, so governance is built in: each agent runs under its own governed
    Microsoft Entra identity, its access is limited to the resources and destinations you approve, sensitive
    actions can require human sign-off, and Microsoft Purview sensitivity labels and DLP are enforced in the
    moment. See the full picture in **[Security & Governance](../empowerment/security.md)**.

---

## Where this leads

<div class="rc-exit" markdown>
<div class="rc-exit-text" markdown>
**Need an agent that does more than its ready-made job?** When you need real actions against a system of record, custom topics, MCP tools, or org-wide publishing and governance, you've outgrown adopting an Autopilot and you're ready to *build*. That's the low-code destination.
</div>
[Continue to Stage 6 · Copilot Studio →](stage-6-studio.md){ .rc-exit-cta }
</div>

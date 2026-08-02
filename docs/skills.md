---
title: Skills Catalog
description: A catalog of Copilot skills, the reusable, packaged capabilities you save once and reuse or share, so your best prompts and workflows don't get lost.
---

# Skills Catalog

A **skill** is a **reusable, packaged capability you save once and reuse — or share — instead of
rebuilding it from scratch.** The clearest example today is a **Cowork recipe** — a multi-step task
you capture so the team can rerun it. In **Copilot Studio**, *skill* is a precise, narrower term: a
specific kind of **tool** (an embedded pro-code agent), *not* a catch-all for everything an agent can
do. Same instinct everywhere — capture it once, reuse it — but the Studio meaning is specific, so this
catalog keeps the two straight.

This page is the **catalog** — the reusable skills worth building first, grouped by where they live.
Each links to the [walkthrough](CATALOG.md) that builds or describes it. Think of skills as the
durable counterpart to the prompts and walkthroughs in each stage: a prompt is something you *run*; a
skill is something you *keep*.

!!! note "Not to be confused with…"
    "Skill" is an overloaded word. On this site it means a **reusable capability** (the definition
    above). It is **not**:

    - the **[Skills agent](walkthroughs/first-party-skills-stretch-assignment.md)** — a first-party
      agent that helps you find a *career* stretch assignment;
    - your personal **skill level** (new / some / experienced) — the slider on the
      [role paths](start-by-role.md) that tailors a journey to your experience; or
    - the **Skills** feature *inside Copilot Studio* — a narrower, product-specific thing: registering
      an existing **pro-code agent** (Bot Framework or **Microsoft 365 Agents SDK**) so your Studio
      agent can call it as a tool. The Studio items in this catalog are **tools/actions**, not that
      feature.

    When this page says "skill," it always means *a reusable capability you save and reuse*.

---

## Why skills matter

The difference between a team that *uses* Copilot and a team that *compounds* with it is reuse. A
Cowork recipe that saved half a day, a Studio tool your agents reuse instead of rebuilding — each is
worth far more when it's **captured, named, and rerunnable by someone who didn't build it**. Skills
are how one person's best workflow becomes everyone's default.

!!! borrow "Borrow, don't build"
    The exact feature names and limits move fast — Microsoft owns the authoritative reference. When a
    detail matters for customer-facing work, go to the source:

    - [Which Copilot is right for you](https://learn.microsoft.com/en-us/copilot/) — names and maps every Copilot
    - [Microsoft 365 Copilot documentation](https://learn.microsoft.com/en-us/copilot/microsoft-365/) — the reference for Cowork and how it runs multi-step tasks
    - [Copilot Studio documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) — the reference for actions, connectors, and tools

---

## Cowork skills — reusable recipes

In [Stage 3 · Cowork](stages/stage-3-cowork.md), a skill is a **reusable recipe**: a multi-step
task captured once — with its name, inputs, and expected output — so anyone on the team can rerun it
cold instead of reinventing the prompt. The ones worth capturing first:

<div class="grid cards" markdown>

-   **[Recurring weekly digest](walkthroughs/cowork-recurring-weekly-digest.md)**

    Describe the Monday-morning digest once and let it run every week without re-prompting.

-   **[Customer-health digest](walkthroughs/cowork-customer-health-digest.md)**

    Rank your whole book of business worst-first, on a schedule — so you know where to spend the week.

-   **[Multi-document brief](walkthroughs/cowork-multi-doc-synthesis.md)**

    A repeatable "stack of documents → one coherent brief" recipe.

-   **[QBR prep cycle](walkthroughs/cowork-qbr-prep-cycle.md)**

    Account data → deck → talking points → follow-ups, run as one rerunnable flow.

-   **[Incident postmortem](walkthroughs/cowork-incident-postmortem.md)**

    Reconstruct timeline, root cause, and actions from scattered sources into one blameless draft.

-   **[Build a recipe library](walkthroughs/cowork-recipe-library.md)**

    Capture any great Cowork run as a reusable recipe so it doesn't die with the session.

</div>

## Autopilots (Scout) skills — capabilities for an always-on agent { #autopilots-scout-skills }

In [Stage 5 · Autopilots](stages/stage-5-autopilots.md), a skill is the same reusable capability — but
handed to an **always-on, autonomous agent**. **Autopilots** are Microsoft's category of such agents, and
**Microsoft Scout** is the first one — so the capability is carried out *in the background*, without you
starting it each time.

- A **Cowork recipe** is a skill you *describe* and run on demand.
- An **Autopilot skill** is that same instinct equipped onto an agent that's always watching: the
  capability Scout draws on to do the job when its trigger fires, then report back.

!!! info "Emerging and gated"
    Autopilots are a newer, **gated** capability — Scout is in **Frontier private preview** — and the way you
    equip and manage their skills is still rolling out by tenant, license, and region. This lens stays scoped
    to what exists today and will grow as the capability does — once Scout-skill walkthroughs are ready they'll
    be cataloged here. Until then, treat the [Microsoft Scout Learn page](https://learn.microsoft.com/en-us/microsoft-scout/)
    as the source of truth before any customer-facing claims.

## Studio skills — a specific kind of tool

In [Stage 6 · Copilot Studio](stages/stage-6-studio.md), **skill** is a precise product term — not a
synonym for *tool*. Today a Studio skill is **one specific type of tool**: an existing **pro-code
agent**, built with the **Bot Framework** or the **Microsoft 365 Agents SDK**, that you register so
your Studio agent can call it as a tool from a topic
([how it works](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-use-skills)).

As of **today**, that's the focused, pro-code definition of a Studio skill. The catalog reflects what's
available now, so you'll find guidance scoped to this specific capability rather than a broader
walkthrough. As skills in Studio evolve, this section will expand alongside them.

!!! note "Skills vs. tools in Studio"
    Connector actions, Power Automate flows, MCP tools, prompts, and topics are all **tools** — the
    broad set of things an agent can call. A **skill** is just *one* of those tool types (the embedded
    pro-code agent above). So the Studio building blocks in [Stage 6](stages/stage-6-studio.md) —
    connector actions, MCP tools, flows, Fabric connections, triggers — are **tools**, not skills.
    Build them there; they're the foundation a skill plugs into.

---

## Where this leads

The arc is the same instinct growing up. A **Cowork recipe** is a skill you *describe* in plain
language. When a recipe is stable, repeated, and worth making bulletproof, it's ready to graduate into
a real capability in [Stage 6 · Copilot Studio](stages/stage-6-studio.md) — built as a **tool**
(a connector action, flow, or MCP tool) an agent calls against a real system, governed and shared.

> **Next:** [Stage 3 · Cowork](stages/stage-3-cowork.md) — where a saved recipe becomes a team skill · [Stage 5 · Autopilots](stages/stage-5-autopilots.md) for equipping an always-on agent like Scout · or [Stage 6 · Studio](stages/stage-6-studio.md) for the tools an agent calls.

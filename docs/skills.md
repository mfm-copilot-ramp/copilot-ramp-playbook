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

-   **[Assemble a monthly business review](walkthroughs/cowork-monthly-business-review.md)**

    Pull metrics, highlights, risks, and next steps from your sources into one MBR pack you can present.

-   **[Turn discovery notes into a proposal](walkthroughs/cowork-proposal-from-discovery.md)**

    Hand over discovery notes and a template; get back a structured first-draft proposal you refine.

-   **[Build a content calendar from a brief](walkthroughs/cowork-content-calendar.md)**

    Turn a campaign brief into a dated calendar with channels, themes, and draft hooks.

-   **[Score vendors against your criteria](walkthroughs/cowork-vendor-evaluation.md)**

    Vendor materials plus your criteria become a weighted scorecard and a recommendation you can defend.

-   **[Build a prep pack for any meeting](walkthroughs/cowork-meeting-prep-pack.md)**

    Attendee backgrounds, account context, open items, and talking points assembled into one pre-meeting brief.

-   **[Draft an annual plan and OKRs](walkthroughs/cowork-annual-plan.md)**

    Last year's results and strategy inputs become a first-draft annual plan with objectives, key results, and initiatives.

-   **[Build a customer onboarding pack](walkthroughs/cowork-customer-onboarding-pack.md)**

    The signed deal plus product docs become a welcome, timeline, roles, and first-value milestones — ready to send.

-   **[Turn source material into a training curriculum](walkthroughs/cowork-training-curriculum.md)**

    Source docs become a modular curriculum — objectives, lessons, exercises, and a knowledge check per module.

-   **[Compile a newsletter from the week's sources](walkthroughs/cowork-newsletter-roundup.md)**

    The week's updates gathered from your sources into a structured, on-tone internal newsletter draft.

-   **[Turn a dataset into a narrative brief](walkthroughs/cowork-data-story.md)**

    A spreadsheet becomes the story behind the numbers — trends, outliers, and a recommended action, with a table.

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
    to what exists today and will grow as the capability does. Treat the
    [Microsoft Scout Learn page](https://learn.microsoft.com/en-us/microsoft-scout/) as the source of truth
    before any customer-facing claims.

The skills worth equipping onto Scout first — each captured once, then run always-on in the background:

<div class="grid cards" markdown>

-   **[Always-on inbox triage](walkthroughs/autopilots-inbox-triage.md)**

    Triage your inbox and signals into one short daily brief — what needs a reply, a decision, or just knowing — rerun every workday without you starting it.

-   **[Continuous customer-health watch](walkthroughs/autopilots-customer-health-watch.md)**

    The worst-first account-ranking recipe from Cowork, equipped onto Scout so the at-risk list re-scores itself and never goes stale.

-   **[Meeting recap & follow-through](walkthroughs/autopilots-meeting-recap.md)**

    Every meeting ends with a clean recap, owned actions, and drafted follow-ups waiting for your sign-off — on the trigger, every time.

-   **[Watch deliverables & flag risks](walkthroughs/autopilots-track-deliverables.md)**

    A standing watch that blocks time for what's due and raises stalled-decision risks before they become blockers.

-   **[Always-on competitive & news monitor](walkthroughs/autopilots-competitive-monitor.md)**

    Scout watches named competitors and topics and delivers a short digest of what changed and why it matters.

-   **[Auto-draft your weekly report](walkthroughs/autopilots-weekly-report.md)**

    Every Friday, a drafted weekly status pulled from your own emails, meetings, and chats — waiting for review.

-   **[Renewal & at-risk account watch](walkthroughs/autopilots-renewal-watch.md)**

    The renewal calendar and engagement signals, watched continuously, so at-risk accounts surface before they slip.

-   **[Track & chase open follow-ups](walkthroughs/autopilots-followup-tracker.md)**

    A standing list of what you owe and what's owed to you across email and Teams, nudged before it goes stale.

-   **[Prep your daily stand-up automatically](walkthroughs/autopilots-standup-prep.md)**

    Each morning, a drafted stand-up — yesterday, today, blockers — pulled from your activity, ready to review.

-   **[Watch key documents & flag changes](walkthroughs/autopilots-doc-change-watch.md)**

    Scout watches the documents that matter and flags meaningful changes with a short what-changed-and-why note.

-   **[Guide a new hire through their first weeks](walkthroughs/autopilots-onboarding-guide.md)**

    The right first-week nudges, resources, and check-ins delivered to a new starter on a schedule.

-   **[Protect focus time & triage interruptions](walkthroughs/autopilots-focus-time.md)**

    Focus time blocked around your real workload, with interruptions triaged so only the urgent reaches you.

</div>

!!! note "Cowork recipe → Autopilot skill"
    Notice the lineage: the [customer-health digest](walkthroughs/cowork-customer-health-digest.md) is a
    **Cowork recipe** you run on demand; the [customer-health watch](walkthroughs/autopilots-customer-health-watch.md)
    is that *same skill* equipped onto an always-on agent. Capture it once in Cowork, graduate it to Scout when
    it's worth running continuously.

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

### Harden a skill into a governed tool

Here's the practical bridge. A reusable skill you've been *describing* in Cowork or *equipping* onto Scout can
be **hardened** on the Studio surface — rebuilt as a governed **tool** an agent calls against a real system,
under policy and monitoring. Same capability; durable, auditable, and shareable. Each card maps a skill you
already run to the Studio **tool** that hardens it:

<div class="grid cards" markdown>

-   **Runs itself on real events** → [Configure an autonomous event-triggered agent](walkthroughs/studio-autonomous-triggers.md)

    Take a skill you keep re-running on a rhythm and give it a real **trigger** so it fires on events, not on a person's prompt.

-   **Acts on a system of record** → [Give a Studio agent a real action with a connector](walkthroughs/studio-connector-action.md)

    When the skill needs to *read or write* real data — CRM, tickets, usage — harden it into a governed **connector action** instead of guessing.

-   **Runs a repeatable multi-step job** → [Trigger a Power Automate flow from a Studio agent](walkthroughs/studio-power-automate-flow.md)

    A recurring recipe (a digest, a routing step) becomes a **flow** the agent calls — versioned and monitored.

-   **Calls an external system or model** → [Add an MCP tool integration to your Studio agent](walkthroughs/studio-mcp-tool-integration.md)

    Reach beyond first-party connectors by hardening the skill's external call into a governed **MCP tool**.

-   **Runs org-wide under control** → [Govern and monitor your agents at scale](walkthroughs/studio-govern-monitor.md)

    The more autonomously a hardened skill runs, the more the guardrails matter — policy, DLP, and oversight.

</div>

!!! note "One skill, three surfaces"
    The clearest way to see the whole arc is to follow a *single* skill across all three surfaces. The
    **[customer-health lineage](walkthroughs/skill-lineage-customer-health.md)** walkthrough does exactly
    that — the same "rank my accounts worst-first by risk" capability as a **Cowork recipe** you run on
    demand, a **Scout autopilot** that re-scores itself, and a **hardened, governed Studio tool** that acts
    on the system of record. Pick the surface by the job, not the product.

---

## Where this leads

The arc is the same instinct growing up. A **Cowork recipe** is a skill you *describe* in plain
language. When a recipe is stable, repeated, and worth making bulletproof, it's ready to graduate into
a real capability in [Stage 6 · Copilot Studio](stages/stage-6-studio.md) — built as a **tool**
(a connector action, flow, or MCP tool) an agent calls against a real system, governed and shared.

> **Next:** [Stage 3 · Cowork](stages/stage-3-cowork.md) — where a saved recipe becomes a team skill · [Stage 5 · Autopilots](stages/stage-5-autopilots.md) for equipping an always-on agent like Scout · or [Stage 6 · Studio](stages/stage-6-studio.md) for the tools an agent calls.

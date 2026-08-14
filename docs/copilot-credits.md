---
title: How Copilot Credits work
description: "What a Copilot Studio agent costs to run: the Copilot Credits rate card, why build size and run cost differ, and the Microsoft 365 Copilot discount."
---

# How Copilot Credits work — what an agent costs to run

Once you reach [Stage 6 · Copilot Studio](stages/stage-6-studio.md), your agents stop being free
personal helpers and start metering usage. Copilot Studio measures that usage in **Copilot Credits**.
This page explains the model so the numbers in the [Credit Estimator](credit-estimator.md) — and on
your monthly bill — actually make sense.

!!! borrow "Borrow, don't build — this is grounded, but Microsoft owns the truth"
    Every rate on this page is taken from Microsoft's official billing docs, **retrieved 2026-08-04**.
    Rates and packaging change; for any customer-facing number, go to the source:

    - [Copilot Studio billing rates](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management) — the rate card
    - [Standard harness licensing](https://learn.microsoft.com/en-us/microsoft-copilot-studio/billing-licensing) — how you buy and pool credits
    - [Microsoft Copilot Studio Licensing Guide](https://go.microsoft.com/fwlink/?linkid=2320995) — the most complete, most current pricing (including dollar rates)

---

## The one idea to internalize: build size ≠ run cost { #size-vs-cost }

The single most common estimation mistake is treating "how big is this agent" and "how much will it
cost to run" as the same question. **They are two independent axes.**

- **Build size** — a T-shirt size (XS → XL) that measures the *effort to design, stand up, and own*
  the agent: how many actions and back-end systems it wires, whether it's autonomous, whether it uses
  voice. It's a **one-time** difficulty signal.
- **Run cost** — the **Copilot Credits per interaction × how many interactions per month**. It's an
  **ongoing, recurring** number driven mostly by *volume*.

These move independently:

!!! example "A tiny agent can outspend a complex one"
    A one-topic FAQ agent (**XS to build**) that answers 50,000 employee questions a month will burn
    far more credits than a multi-system, human-escalation workflow agent (**L to build**) that runs
    200 times a month. Size tells you how hard it was to build. Only volume × rate tells you the bill.

The [Credit Estimator](credit-estimator.md) reports these as two separate readouts on purpose —
**Build effort** and **Run cost** — with the exact drivers behind each.

---

## The unit: Copilot Credits (formerly "messages") { #the-unit }

**Copilot Credits are the common currency for Copilot Studio agent usage.** You get a pool of credits
with your licensing and it's **shared across the whole tenant** — every agent draws from the same pool.

!!! note "The rename you'll still see in old material"
    On **September 1, 2025**, the currency changed from **messages** to **Copilot Credits**. Per
    Microsoft, there was *no change* to the quantity per prepaid pack or to the pay-as-you-go rate —
    only the name. If a blog or screenshot says "messages," read it as "credits."

---

## The rate card — what each thing costs { #rate-card }

Every credit-bearing capability, straight from Microsoft's
[billing rates](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management)
(retrieved 2026-08-04):

| Agent capability | Rate |
| --- | --- |
| Classic answer (pre-authored, static reply) | **1 credit** |
| Generative answer (AI reads knowledge + responds) | **2 credits** |
| Agent action (a connector/tool step, deep reasoning, topic transition) | **5 credits** |
| Tenant graph grounding (RAG over your Microsoft 365 Graph) | **10 credits** |
| Agent flow actions | **13 credits per 100 actions** (~0.13 each) |
| Text & generative AI tools — basic | **1 credit per 10 responses** |
| Text & generative AI tools — standard | **15 credits per 10 responses** |
| Text & generative AI tools — premium (advanced reasoning) | **100 credits per 10 responses** |
| Content processing tools | **8 credits per page** |
| Voice — classic / GenAI / premium GenAI | **10 / 35 / 75 credits per minute** |

A few things this table teaches:

- **Credits stack per interaction.** A single complex prompt can hit several meters at once. Microsoft's
  own worked example: an agent grounded in the tenant graph uses **12 credits** for one response —
  **10** for tenant graph grounding **+ 2** for the generative answer.
- **Voice is priced by the minute, not the turn**, and the per-minute rate already *includes* the core
  classic/generative/action activity during the call — so you don't add those on top.
- **Reasoning models bill twice.** A reasoning-capable model charges the normal feature rate **plus** the
  premium "Text & generative AI tools" meter (per 1,000 tokens) for the extra deep-reasoning compute.
- **Grounding on your own documents is not a separate line.** Answering over a SharePoint site or a set
  of files is part of the generative answer — it's the *tenant graph* grounding that adds the 10-credit
  meter.

---

## Volume is the multiplier — and autonomous ≠ interactive { #volume }

The rate card is only half the story; **volume is what actually sets the bill**, and how you count
volume depends on the agent's regime:

- **Interactive agents** are driven by people: cost ≈ *users × interactions per user per month × credits
  per interaction*. Reach and frequency dominate.
- **Autonomous (triggered) agents** are driven by events — a file lands, a message arrives, a schedule
  fires. Cost ≈ *events per month × credits per event*. There's **no per-user framing**, so the Microsoft
  365 Copilot discount below **does not apply** — every run is billed.

!!! tip "Estimate the two regimes separately"
    In the [Credit Estimator](credit-estimator.md), the **Detailed** and **Quick + Import** modes let you
    flag an agent as interactive *or* autonomous and dial in a **buffer** for the share of interactions
    that escalate or fire extra tools — so you plan for the *average* path **and** the busy one.

---

## The Microsoft 365 Copilot discount (zero-rating) { #m365-discount }

If your users already hold a **Microsoft 365 Copilot** license, a large slice of agent usage is
**zero-rated** — it doesn't draw down the credit pool at all. **One caveat up front:** this coverage
applies only to agents on the **standard** and **Copilot chat** harnesses. The **GitHub Copilot harness is
never covered** — see the first exception below and [Pick the engine](pick-the-engine.md).

Per Microsoft's [licensing doc](https://learn.microsoft.com/en-us/microsoft-copilot-studio/billing-licensing)
(retrieved 2026-08-04): when a Microsoft 365 Copilot-licensed user interacts with an agent in **Copilot
Chat, Microsoft Teams, or SharePoint**, the **classic answers, generative answers, and Microsoft Graph
tenant grounding** are zero-rated (employee-facing usage, running under that user's licensed identity).

The exceptions that **still bill**, even for licensed users:

- **GitHub Copilot harness agents** — the autonomous, agentic engine is **never** covered by a Microsoft 365
  Copilot license. Every interaction — *plus building and testing the agent* — bills Copilot Credits,
  regardless of channel or who's licensed. Only the **standard** and **Copilot chat** harnesses are zero-rated.
  See [Pick the engine](pick-the-engine.md).
- **Autonomous / triggered runs** — no interactive licensed user in the loop.
- **Agent flows** on any trigger other than **"When an agent calls the flow."**
- **Computer-Using Agent (CUA)** actions — never included in the Microsoft 365 Copilot license.

!!! info "Gross vs. net — what you actually pay"
    Because coverage flips entirely on the harness, the *same* agent at the *same* volume can cost very
    different real money. On the **standard / chat** harnesses, licensed users in Microsoft 365 channels are
    zero-rated, so **net billable** can be far below **gross consumption** — sometimes ~$0 incremental. On the
    **GitHub Copilot harness**, net always equals gross. The [Credit Estimator](credit-estimator.md) now models
    both: pick your harness and it shows gross consumption and net billable side by side.

!!! warning "Where over-runs come from"
    Capacity is enforced **monthly** and **unused credits don't carry over**. Surprises almost always
    trace back to one of three things: an **autonomous** agent nobody counted per-event, a **flow** on a
    non-"agent calls the flow" trigger, or **volume** on a channel where users *aren't* licensed.

---

## How you get credits { #buying }

There are three ways an organization funds its credit pool:

- **Pay-as-you-go** — link an environment to an Azure subscription and pay monthly for exactly what you
  used. No upfront commitment; best for getting started.
- **Prepurchase plan** — a one-year, prepaid pool of Copilot Credit Commit Units, bought in the Azure
  portal.
- **Copilot Credit prepaid packs** — a tenant subscription that pre-buys a fixed pool.

For the **dollar** conversion behind these, use the [Credit Estimator](credit-estimator.md) (it shows
both pay-as-you-go and prepaid pricing on every estimate) or the
[Licensing Guide](https://go.microsoft.com/fwlink/?linkid=2320995) for the authoritative rates.

---

## Put a number on your agent { #estimate }

1. **Describe it or upload it** in the [Credit Estimator](credit-estimator.md). Quick mode takes a
   plain-English description; Detailed models it feature-by-feature; the Solution-package mode analyzes a
   real exported agent.
2. **Read the two axes** — Build effort (the T-shirt size) and Run cost (credits/month) — as *separate*
   answers.
3. **Sanity-check the regime** — interactive or autonomous — and whether your users are licensed, because
   that's what decides how much of the rate card you actually pay.

Estimating high and the number scares you? That's often a **right-sizing** signal — see
[When you've gone too far](right-sizing.md) before you build.

---

## Where this leads { #where-this-leads }

- [Stage 6 · Copilot Studio](stages/stage-6-studio.md) — where credit-bearing agents get built.
- [Credit Estimator](credit-estimator.md) — turn this model into a real number.
- [AI Builder → Copilot Credits](ai-builder-estimator.md) — already use AI Builder? Map that usage to the Copilot Credits you'll need.
- [Right-sizing](right-sizing.md) — the cheapest agent is the one you didn't need to build.

---

## Sources { #sources }

All product and rate claims on this page are grounded in official Microsoft documentation, retrieved
**2026-08-04**:

| Claim | Source | Retrieved |
| --- | --- | --- |
| Copilot Credits are the metering unit; full rate card (1 / 2 / 5 / 10 credits, flows 13/100, AI tools, 8/page, voice 10/35/75 per min); 10+2=12 stacking example; reasoning-model dual meter | [Billing rates — Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management) | 2026-08-04 |
| "messages → Copilot Credits" rename (Sept 1, 2025); credits pooled per tenant; pay-as-you-go / prepurchase / prepaid packs; monthly enforcement, no carryover; Microsoft 365 Copilot zero-rating in Chat/Teams/SharePoint | [Standard harness licensing — Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/billing-licensing) | 2026-08-04 |

> **Unofficial and community-built.** This page is not endorsed by or affiliated with Microsoft. It
> summarizes public documentation to help you learn — always confirm customer-facing numbers against the
> Microsoft sources linked above.

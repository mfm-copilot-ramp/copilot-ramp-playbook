---
title: How Copilot Credits work
description: "What Copilot agents and Cowork cost to run: the Copilot Credits rate card, why build size and run cost differ, and what a Microsoft 365 Copilot license covers."
---

# How Copilot Credits work — what an agent costs to run

Once you reach [Stage 6 · Copilot Studio](stages/stage-6-studio.md), your agents stop being free
personal helpers and start metering usage. Copilot Studio measures that usage in **Copilot Credits** —
and so do **Copilot Cowork**, **Autopilot**, and the **Work IQ APIs**. This page explains the model so the
numbers in the [Credit Estimator](credit-estimator.md) — and on your monthly bill — actually make sense.

??? tip "Everyday AI vs. advanced AI — where the meter starts"
    Microsoft now splits Copilot into two ways of paying
    ([USL vs. usage-based billing](https://learn.microsoft.com/microsoft-365/copilot/user-subscription-license-usage-based-billing)):

    - **Everyday AI** — Copilot Chat, Copilot in the Office apps, the built-in agents, and Agent Builder — is
      covered by the **Microsoft 365 Copilot user license (USL)**: a fixed price per user.
    - **Advanced AI** — **Cowork**, **Code**, **Autopilot**, agentic SharePoint, and the newest frontier models —
      runs on **usage-based billing** in **Copilot Credits**, and still requires the USL for access.

    Copilot Studio agents also bill in Copilot Credits, but with a big exception for licensed employees —
    see [the Microsoft 365 Copilot license](#m365-discount) below.

!!! borrow "Borrow, don't build — this is grounded, but Microsoft owns the truth"
    Every rate on this page is taken from Microsoft's official billing docs, **re-verified 2026-10-28**.
    Rates and packaging change; for any customer-facing number, go to the source:

    - [Copilot Studio billing rates](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management) — the rate card
    - [Standard harness licensing](https://learn.microsoft.com/en-us/microsoft-copilot-studio/billing-licensing) — how you buy and pool credits
    - [Copilot Studio agent usage estimator](https://microsoft.github.io/copilot-studio-estimator/) — Microsoft's own forecasting tool for agent credits
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

Every credit-bearing capability on the **standard harness**, straight from Microsoft's
[billing rates](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management)
(re-verified 2026-10-28 — unchanged since August):

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
  premium "Text & generative AI tools" meter — **10 credits per 1,000 tokens** — for the extra
  deep-reasoning compute. Tokens the model reads back from its **prompt cache aren't billed**, so concise
  instructions and fresh conversations for new topics keep this down.
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

## The Microsoft 365 Copilot license — what it covers { #m365-discount }

If your users hold a **Microsoft 365 Copilot** license, most **employee-facing** agent usage on the
**standard harness** is **zero-rated** — it doesn't draw down the credit pool at all.

Per Microsoft's [billing rates](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management)
(re-verified 2026-10-28), every standard-harness meter — classic answers, generative answers, agent actions,
tenant graph grounding, agent flow actions, and the AI tools — shows **"No charge"** when it's used by a
Microsoft 365 Copilot-licensed user, for **business-to-employee** scenarios where the agent runs under that
user's own authenticated identity, subject to fair-use limits.

!!! note "This got broader in 2026"
    Earlier guidance limited the zero-rating to classic answers, generative answers, and tenant graph
    grounding in Copilot Chat, Teams, and SharePoint. The current rate table extends "No charge" to every
    standard-harness feature for licensed employees. Microsoft's
    [licensing page](https://learn.microsoft.com/en-us/microsoft-copilot-studio/billing-licensing) and the
    [Licensing Guide](https://go.microsoft.com/fwlink/?linkid=2320995) remain the final word for contracts.

The exceptions that **still bill**, even for licensed users:

- **GitHub Copilot harness agents** — never covered by the license. Every interaction — *plus building and
  testing the agent* — bills Copilot Credits, regardless of channel or who's licensed. Microsoft bills this
  harness **per task, by complexity**, bundling model tokens, tools, and the harness itself, and shows
  per-task ranges only in a diagram on its
  [billing overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/billing-credit-overview).
  The estimator's **Light 100–300 · Medium 300–500 · Heavy &gt;500 credits per task** anchors come from that
  diagram — treat them as **illustrative**. See [Pick the engine](pick-the-engine.md).
- **Customer Conversation harness agents** — the newer harness for customer-facing voice and chat (contact
  center–style) is billed in Copilot Credits on usage. Customer-facing use isn't employee-facing anyway.
- **Autonomous / triggered runs** — no licensed user's identity in the loop.
- **Agent flows** on any trigger other than **"When an agent calls the flow."**
- **Computer-Using Agent (CUA)** actions — never included in the Microsoft 365 Copilot license.
- **Unlicensed or external users** — anyone without the license pays the full rate card.

!!! info "Gross vs. net — what you actually pay"
    Because coverage flips entirely on the harness, the *same* agent at the *same* volume can cost very
    different real money. On the **standard** harness, licensed employees are zero-rated, so **net billable**
    can be far below **gross consumption** — sometimes ~$0 incremental. On the **GitHub Copilot** and
    **Customer Conversation** harnesses, net always equals gross. The [Credit Estimator](credit-estimator.md) now models
    both: pick your harness and it shows gross consumption and net billable side by side.

!!! warning "Where over-runs come from"
    Capacity is enforced **monthly** and **unused credits don't carry over**. On prepaid capacity, custom
    agents are **disabled at 125%** of capacity until it's increased or resets (a linked pay-as-you-go meter
    avoids that), and admins can cap individual agents in the Power Platform admin center. Surprises almost
    always trace back to one of four things: an **autonomous** agent nobody counted per-event, a **flow** on a
    non-"agent calls the flow" trigger, **volume** from users who *aren't* licensed, or a **GitHub-harness**
    agent billed from its first test run.

---

## How you get credits { #buying }

Copilot Credits are funded at the **tenant** level, and there are **three ways to buy them.** You can mix them — and when more than one is available they're drawn down in a fixed order (below). Copilot Studio, Cowork, Autopilot, agentic SharePoint, and the Work IQ APIs all meter in the same currency; Copilot Studio capacity is managed in the Power Platform admin center, while Cowork and the other Microsoft 365 experiences are governed by **spending policies** in the Microsoft 365 admin center (**Copilot → Cost Management**).

| Model | What it is | Commitment | Where you buy it | Best for |
| --- | --- | --- | --- | --- |
| **Capacity packs** | License-based blocks of prepaid credits (**25,000 credits / month** per pack) | Subscription | Microsoft 365 Marketplace — managed & allocated in the **Power Platform admin center** | A steady, known monthly baseline |
| **Pre‑Purchase Plan (P3)** | A commitment of **discounted** credit units for a one‑year term | 1‑year prepay | Azure portal or Microsoft 365 admin center — shows as a **reservation** in Azure Cost Management | Committed annual volume you want to discount |
| **Pay‑as‑you‑go (PAYG)** | Metered billing to a linked Azure subscription — **$0.01 per credit** | None | An **Azure subscription** linked to the environment or billing policy | Getting started, spiky usage, and covering overflow |

!!! info "The draw-down order — why it matters for your bill"
    When more than one source is available, Microsoft consumes them in a **fixed order** so spend stays predictable:

    **1. Capacity packs → 2. P3 prepaid credits → 3. Pay‑as‑you‑go.**

    PAYG only kicks in *after* your prepaid capacity (packs and P3) is exhausted — which is exactly why a small always-on PAYG link makes a useful **safety net** on top of prepaid capacity rather than a runaway cost.

**P3 vs. packs — the quick read:** both are *prepaid*, but **capacity packs** are a license subscription you buy in the M365 Marketplace and allocate per environment, while a **Pre‑Purchase Plan (P3)** is an Azure **reservation** — a one‑year commitment that trades flexibility for a **discount** on the credit rate. **PAYG** is the no‑commitment meter that backs both and catches the overflow.

For the **dollar** conversion behind these, use the [Credit Estimator](credit-estimator.md) (it shows both pay‑as‑you‑go and prepaid pricing on every estimate) or the [Copilot Studio Licensing Guide](https://go.microsoft.com/fwlink/?linkid=2320995) for the authoritative rates.

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
- [AI Builder → Copilot Credits](ai-builder-estimator.md) — already use AI Builder? AI Builder capacity add-ons and seeded credits reach **end of life on November 1, 2026** — map that usage to the Copilot Credits you'll need.
- [Right-sizing](right-sizing.md) — the cheapest agent is the one you didn't need to build.

---

## Sources { #sources }

All product and rate claims on this page are grounded in official Microsoft documentation, last
re-verified **2026-10-28**:

| Claim | Source | Retrieved |
| --- | --- | --- |
| Copilot Credits are the metering unit; full standard-harness rate card (1 / 2 / 5 / 10 credits, flows 13/100, AI tools, 8/page, voice 10/35/75 per min); 10+2=12 stacking example; reasoning-model dual meter at 10 credits / 1K tokens, prompt-cache reads unbilled; "No charge" for every feature for M365 Copilot-licensed B2E users (CUA excluded; flows only via "When an agent calls the flow"); 125% overage enforcement | [Billing rates — Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management) | 2026-10-28 |
| Everyday AI (USL) vs. advanced AI (usage-based billing: Cowork, Code, Autopilot, frontier models); UBB requires a USL and an admin billing policy | [USL and usage-based billing](https://learn.microsoft.com/microsoft-365/copilot/user-subscription-license-usage-based-billing) | 2026-10-28 |
| Three harnesses (GitHub Copilot, Customer Conversation, standard); GitHub Copilot harness billed per task incl. build & test, never license-covered | [Harnesses overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview) · [Billing for the GitHub Copilot harness](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/billing-credit-overview) | 2026-10-28 |
| "messages → Copilot Credits" rename (Sept 1, 2025); credits pooled per tenant; pay-as-you-go / prepurchase / prepaid packs; monthly enforcement, no carryover; Microsoft 365 Copilot zero-rating in Chat/Teams/SharePoint | [Standard harness licensing — Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/billing-licensing) | 2026-08-04 |
| Three purchasing plans — **Capacity packs**, **Pre‑Purchase Plan (P3)**, **Pay‑as‑you‑go**; P3 is a one‑year discounted **reservation**; capacity packs bought in the M365 Marketplace & allocated in the Power Platform admin center; fixed draw‑down order **packs → P3 → PAYG** | [Manage usage-based billing — M365 Copilot](https://learn.microsoft.com/microsoft-365/copilot/usage-based-billing-manage-copilot-credits) · [Capacity packs](https://learn.microsoft.com/microsoft-365/copilot/pay-as-you-go/copilot-capacity-packs) · [Pre‑Purchase Plan (P3)](https://learn.microsoft.com/azure/cost-management-billing/reservations/copilot-credit-p3) | 2026-08-19 |

> **Unofficial and community-built.** This page is not endorsed by or affiliated with Microsoft. It
> summarizes public documentation to help you learn — always confirm customer-facing numbers against the
> Microsoft sources linked above.

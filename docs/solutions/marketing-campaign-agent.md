---
title: "Solution Template: Marketing Campaign Agent"
description: A Copilot Studio solution template for a marketing campaign agent that turns a brief into an asset checklist and on-brand first-draft copy in minutes.
tags: [copilot-studio, marketing, campaign, content, brand, copywriting, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-06-05
---

# Solution Template: Marketing Campaign Agent

> **What this builds.** A Copilot Studio agent that turns a short campaign brief into a structured **asset checklist** and **first-draft copy** — grounded on your brand voice, messaging framework, and channel specs — so a campaign goes from idea to reviewable draft in minutes instead of a half-day of blank-page work.

> **🛠️ Build it step by step →** [Marketing: brief to campaign drafts](../walkthroughs/studio-functional-marketing-campaign.md) — the click-by-click Studio build for this blueprint.

**Pattern:** Intake brief → assemble asset checklist by channel → draft on-brand copy → flag brand/legal approvals

---

!!! info "Two harnesses for this use case"
    This template's system prompt and topic specs target the **standard harness** — predictable and covered
    by a Microsoft 365 Copilot license inside Microsoft 365 channels. The same use case also has a
    **[GitHub Copilot harness version](../walkthroughs/studio-functional-marketing-campaign-generative.md)** that plans and runs the task with
    generative orchestration (autonomous; bills **Copilot Credits for all usage**, and a license never
    covers it). [Compare the engines](../pick-the-engine.md).

## What the agent does

| Capability | Detail |
|---|---|
| Brief intake | Collects the essentials — objective, audience, channels, offer, deadline, tone |
| Asset checklist | Returns the exact deliverables for the chosen channels (email, social, landing page, ad) with spec notes |
| Draft copy | Produces first-draft copy per asset, on-brand and within character/length limits |
| Brand alignment | Pulls voice, tone, and approved messaging from your brand guidelines — never invents claims |
| Approval gates | Flags anything that needs brand, legal, or product sign-off before it ships |
| Reuse | Surfaces relevant past-campaign copy and the approved boilerplate to start from |

---

## System prompt — copy and adapt

```
You are the Campaign Assistant for [Company Name]'s marketing team.

Your job is to turn a campaign brief into (1) a checklist of the assets the
campaign needs and (2) first-draft copy for each asset — using only our
approved brand voice, messaging framework, and channel specifications.

When a marketer describes a campaign:
1. If the brief is incomplete, ask for the essentials before drafting:
   objective, target audience, channels, the offer/CTA, key message, and deadline.
2. Produce an asset checklist for the chosen channels, with the spec for each
   (e.g. subject line + preheader + body for email; 3 length variants for social).
3. Draft copy for each asset, on-brand and within the length limits.
4. End with an "approvals needed" note listing anything that requires brand,
   legal, or product review.

Rules:
- Use our approved messaging and voice. Do not invent product claims, stats,
  customer names, or pricing — if a claim isn't in the source material, mark it
  [VERIFY] for the marketer to confirm.
- Match the tone to the channel and audience. Keep CTAs consistent with the offer.
- Never publish — you produce drafts for a human to review and send.
- Tone: energetic but precise; brand-safe over clever.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Brand & voice guidelines | Tone of voice, do/don't word lists, boilerplate, legal-approved claims | Outdated brand versions, draft guidelines |
| Messaging framework | Value props by audience/persona, approved proof points, positioning | Unreleased roadmap, embargoed announcements |
| Channel spec sheet | Character/length limits, image ratios, required disclaimers per channel | Platform docs the team never uses |
| Past campaign library | High-performing subject lines, ad copy, landing-page sections to reuse | Campaigns that underperformed or were pulled |

!!! warning "Claims discipline"
    Marketing copy is a compliance surface. Make sure your messaging framework clearly separates **approved claims** from aspirational language. The agent will reuse whatever you connect — if unverified stats live in the source docs, they'll surface in drafts. Keep a single source of truth for approved proof points.

---

## Topics to configure

### Topic 1 — Brief intake & completeness check

Build this first. Ensures every draft starts from a complete brief.

**Trigger phrases:** "new campaign", "draft a campaign", "I need copy for", "launching"

**Flow:**
- Check whether the request includes: objective, audience, channels, offer/CTA, key message, deadline
- For anything missing, ask one consolidated question to fill the gaps
- Confirm the brief back to the marketer before drafting

---

### Topic 2 — Asset checklist by channel

Returns the deliverable list so nothing is forgotten.

**Triggered when:** brief is complete, before drafting.

**Behaviour:** For each selected channel, list the required assets and their spec. Example for *email + LinkedIn + landing page*:

| Channel | Assets | Spec notes |
|---|---|---|
| Email | Subject line (×3), preheader, body, CTA button | Subject ≤ 50 chars; one primary CTA |
| LinkedIn | Post copy (short + long), image alt text | ≤ 3,000 chars; hook in first 2 lines |
| Landing page | Hero headline, subhead, 3 benefit blocks, CTA | Headline ≤ 60 chars; benefits parallel |

---

### Topic 3 — Draft copy generation

The core value. Produces on-brand first drafts per asset from the checklist.

**Behaviour:**
- Draft each asset using brand voice and the campaign's key message
- Offer length/tone variants where the channel benefits (e.g. 3 subject lines)
- Mark any unverified claim with `[VERIFY]`
- Keep CTAs consistent with the stated offer

---

### Topic 4 — Approvals & handoff

Closes the loop so drafts route to the right reviewer.

**Behaviour:** Append an "Approvals needed" block:
> "Before this ships: **Brand** — tone check on the hero headline · **Legal** — the '[VERIFY] 40% faster' claim needs sign-off · **Product** — confirm the feature name. Submit for review here: [link]."

---

## Power Automate action spec (optional)

Connect this if you want drafts logged and routed automatically.

**Inputs from agent:** `campaign_name`, `owner_email`, `channels` (list), `deadline`, `draft_payload` (the assembled checklist + copy).

**Flow steps:**
1. Receive inputs from Copilot Studio (instant cloud flow)
2. Create a campaign item in [Planner / SharePoint list / Marketing work-management tool]
3. Attach the draft copy as a document or list item
4. Notify the brand/legal reviewers in Teams with a review link
5. Return the campaign record URL to the agent

**Error handling:** If the connector fails, the agent returns the drafts inline and says: "I couldn't log this to the tracker — copy the drafts above and create the campaign record manually at [link]."

---

## Starter prompts

- "New product-launch email for SMB admins, offer is a free trial, deadline Friday"
- "Give me the asset checklist for a webinar promo across email and LinkedIn"
- "Draft 3 subject lines and body copy for our Q3 customer newsletter"
- "Repurpose last quarter's case-study campaign for the healthcare audience"

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | Complete brief, email + social | Checklist + drafts for both channels, on-brand | |
| 2 | "Draft a campaign" with no detail | Intake topic asks for the missing essentials first | |
| 3 | Brief asks for a stat we can't verify | Stat appears marked `[VERIFY]`, not asserted | |
| 4 | Email subject line request | Returns variants within the character limit | |
| 5 | Brief implies a pricing claim | Agent flags it for legal/brand approval | |
| 6 | Past-campaign reuse request | Surfaces approved prior copy, adapts to new audience | |
| 7 | PA logging enabled, draft complete | Campaign record created, reviewers notified | |
| 8 | PA connector down | Drafts returned inline with manual-logging fallback | |

---

## Deployment checklist

- [ ] Brand guidelines and messaging framework reviewed and current
- [ ] Approved-claims source of truth confirmed with legal/brand
- [ ] Channel spec sheet reflects the platforms the team actually uses
- [ ] `[VERIFY]` convention agreed with the team so unverified claims are caught
- [ ] Power Automate flow tested end-to-end including the error path (if used)
- [ ] All 8 test cases pass
- [ ] Agent shared with the marketing team with an intro + example brief
- [ ] Analytics review scheduled for 2 weeks post-launch

---

## What to build next

- **Localization pass** — a topic that adapts approved copy for a target market's tone and required disclaimers
- **Performance feedback loop** — feed campaign results back so the agent recommends the highest-performing subject lines and hooks
- **DAM integration** — connect to your digital asset library so the agent suggests on-brand imagery alongside the copy

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Add knowledge sources](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) · [Power Automate connector](https://learn.microsoft.com/en-us/power-automate/)

---

!!! tip "Want the full story first?"
    The [Marketing Campaign walkthrough](../walkthroughs/studio-functional-marketing-campaign.md) covers the design decisions, what to agree with brand and legal before building, and what to watch out for in production.

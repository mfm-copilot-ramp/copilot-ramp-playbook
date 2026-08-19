---
title: "Marketing: brief to campaign drafts"
description: Build a Copilot Studio agent that turns a short brief into an asset checklist and on-brand first-draft copy, so the team starts from a draft not a blank page.
stage: studio
harness: standard
roles: [maker, marketer]
tags: [copilot-studio, marketing, campaign, content, brand, functional]
level: intermediate
time: 3–4 hours
status: walkthrough
updated: 2026-06-05
---

# Marketing: brief to campaign drafts

> Turn a one-paragraph campaign brief into a complete asset checklist and on-brand first-draft copy — so the team starts every campaign from a draft, not a blank page.

**Stage:** Copilot Studio · **For:** Marketing teams, campaign managers, content leads · **Level:** Intermediate · **Time:** 3–4 hours

> **📐 Full blueprint & test plan →** [Marketing Campaign Agent](../solutions/marketing-campaign-agent.md) — the copy-paste system prompt, topic specs, and test-case table behind this build.

---

!!! abstract "Which harness? This one uses the standard harness"
    Every Copilot Studio agent runs on a [harness](../pick-the-engine.md) — the engine underneath it. This
    walkthrough builds on the **standard harness**: you author the topics and rules, the flow is predictable,
    and for Microsoft 365 Copilot-licensed users **it's covered inside Microsoft 365 channels** (no extra
    credits) — the lowest-cost choice for structured, rules-based work.

    Want the same use case to **reason through the task on its own** — planning multi-step work, recovering
    when a step fails, and working across your files? Build the
    **[GitHub Copilot harness version](studio-functional-marketing-campaign-generative.md)** instead. It's the autonomous engine to grow into; the
    honest tradeoff is that it bills **Copilot Credits for all usage** and a Microsoft 365 Copilot license
    never covers it. [Compare the engines](../pick-the-engine.md) · [estimate the net cost](../credit-estimator.md).

## When to use this

Reach for this when your marketers spend the first hour of every campaign re-deriving the same things: which assets the campaign needs, what the brand voice sounds like, and where the approved messaging lives. A Studio agent collapses that into a single brief-to-drafts interaction, grounded on your real brand and messaging content.

**Why Stage 6:** Agent Builder is excellent for a quick "answer from these docs" assistant, but this agent does more than answer — it runs a structured intake, branches by channel, drafts multiple assets, and (optionally) logs the campaign and routes it for approval through Power Automate. That multi-step orchestration with an action at the end is exactly what Copilot Studio's topics and flows are built for.

---

## What you'll need

- A Copilot Studio environment and maker permissions
- Current brand & voice guidelines and a messaging framework (value props, approved claims)
- A channel spec sheet (length limits, disclaimers) for the channels your team uses
- *(Optional)* A Power Automate connector to your campaign tracker (Planner, SharePoint, or your work-management tool)
- Brand/legal sign-off on what counts as an **approved claim**

---

## Try it now — the prompt

Paste this into the agent's instructions and adapt the brackets — it works because the claims boundary and the `[VERIFY]` convention are written as rules, so drafts never assert an unapproved claim.

Decide the agent's job and its limits before you open Studio. The single most important design decision is the **claims boundary**: the agent drafts copy, but it must never assert a product claim, stat, or price that isn't in your approved source material.

Start from this prompt and adapt it:

```
You are the Campaign Assistant for [Company Name]'s marketing team.

Your job is to turn a campaign brief into (1) a checklist of the assets the
campaign needs and (2) first-draft copy for each asset — using only our
approved brand voice, messaging framework, and channel specifications.

When a marketer describes a campaign:
1. If the brief is incomplete, ask for the essentials before drafting:
   objective, target audience, channels, the offer/CTA, key message, and deadline.
2. Produce an asset checklist for the chosen channels, with the spec for each.
3. Draft copy for each asset, on-brand and within the length limits.
4. End with an "approvals needed" note listing anything that requires brand,
   legal, or product review.

Rules:
- Use our approved messaging and voice. Do not invent product claims, stats,
  customer names, or pricing — mark any unverified claim [VERIFY].
- Never publish — you produce drafts for a human to review and send.
```

---

## Step by step

1. **Create the agent.** In Copilot Studio, create a new agent named something the team will recognise (e.g. "Campaign Assistant"). Paste the system prompt above into its instructions.
2. **Connect knowledge.** Add your brand guidelines, messaging framework, channel spec sheet, and a past-campaign library. Keep approved-claims content separate and authoritative.
3. **Build the intake topic.** Trigger on "new campaign", "draft a campaign", "I need copy for". Check for the six essentials (objective, audience, channels, offer, message, deadline) and ask once for anything missing.
4. **Build the checklist topic.** Once the brief is complete, return the per-channel asset list with spec notes (subject line counts, character limits, required disclaimers).
5. **Build the drafting topic.** Generate first-draft copy per asset, on-brand, within limits, marking unverified claims `[VERIFY]`.
6. **Build the approvals topic.** Append an "Approvals needed" block listing brand/legal/product sign-offs and a review link.
7. *(Optional)* **Add the Power Automate action.** Wire a flow that logs the campaign to your tracker and notifies reviewers in Teams. Always include an inline fallback if the connector fails.
8. **Test against the cases.** Run the eight test cases from the solution template — especially the unverified-claim and incomplete-brief paths.
9. **Pilot, then share.** Roll out to a couple of campaign managers, gather one round of feedback, then publish to the marketing team with an example brief.

---

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- Add a **localization** topic that adapts approved copy for a market's tone and disclaimers.
- Feed **campaign performance** back in so the agent recommends your highest-performing hooks and subject lines.
- Connect your **digital asset library** so the agent suggests on-brand imagery beside the copy.

---

## Watch out for

- **Unverified claims leaking into drafts.** If unapproved stats live in your source docs, they'll surface. Keep a single source of truth for approved proof points and enforce the `[VERIFY]` convention.
- **Channel specs drifting.** Platforms change limits and disclaimer rules — review the spec sheet on a schedule.
- **Treating drafts as final.** This agent accelerates the first draft; it does not replace human review and the approval gate. Keep the sign-off step real.

## Where this leads (the ramp)

Drafting on-brand copy from a brief is a real time-saver. When you want to learn which hooks and subject lines actually win — testing variants against live performance — Azure AI Foundry's A/B and shadow deployment turns that into a measured experiment.

> **Next:** [Foundry: A/B and shadow deployment](foundry-ab-shadow-deploy.md)

## Related

- [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Knowledge sources](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)
- [Topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

!!! tip "Ready to build? Use the solution template."
    The [Marketing Campaign Agent solution template](../solutions/marketing-campaign-agent.md) has the copy-paste system prompt, topic specs, knowledge-source table, Power Automate action spec, and a full test matrix.

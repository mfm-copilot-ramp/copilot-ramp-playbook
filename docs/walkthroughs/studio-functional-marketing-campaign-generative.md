---
title: "Marketing: Brief-to-campaign generation on the GitHub Copilot harness"
description: Build an agentic campaign assistant that turns briefs into asset plans and drafts from approved brand, messaging, and channel guidance.
stage: studio
harness: github-copilot
roles: [maker, marketer]
tags: [copilot-studio, marketing, campaign, content, brand, github-copilot-harness, generative-orchestration, functional]
level: intermediate
time: 3–4 hours
status: walkthrough
prereqs: [copilot-studio-access, knowledge-source]
updated: 2026-08-14
---

# Marketing: Brief-to-campaign generation on the GitHub Copilot harness

> Turn a one-paragraph campaign brief into an asset checklist, on-brand drafts, and review-ready next steps without authoring every branch.

**Stage:** Copilot Studio · **For:** Marketing teams, campaign managers, content leads · **Level:** Intermediate · **Time:** 3–4 hours

!!! abstract "Which harness? This one uses the GitHub Copilot harness"
    Every Copilot Studio agent runs on a [harness](../pick-the-engine.md) — the engine underneath it. This
    walkthrough builds on the **GitHub Copilot harness**, the autonomous, agentic engine: it **reasons
    through the whole goal on its own**, **retries and finds another path when a step fails**, works across
    your **Word, Excel, PowerPoint, and PDF** files, and keeps context with **skills and memory** — so you
    describe the outcome instead of authoring every path. That capability is why it's the engine to grow into.

    The honest tradeoff: it bills **Copilot Credits for all usage — building, testing, *and* running — and a
    Microsoft 365 Copilot license *never* covers it.** Want this same use case as predictable, rules-based
    topics your Microsoft 365 Copilot license already covers in Microsoft 365 channels? Build the
    **[standard-harness version](studio-functional-marketing-campaign.md)** instead.
    [Compare the engines](../pick-the-engine.md) · [estimate the net cost](../credit-estimator.md).

## When to use this

Reach for this when campaign intake is messy: the marketer gives you a partial brief, the needed assets vary by channel, and approved claims live across brand, messaging, and channel-spec documents. A GitHub Copilot harness agent can reason through the whole job, ask for missing essentials, choose the right sources, draft the assets, and route review without you building a topic for every path.

Use the [standard-harness version](studio-functional-marketing-campaign.md) when the team wants a predictable, rules-based intake and drafting flow. Use this version when the campaign path changes often enough that generative orchestration is worth the credits.

## What you'll need

- Copilot Studio access with Copilot Credits available for building, testing, and running this harness
- Current brand and voice guidelines plus a messaging framework with approved value props and claims
- A channel spec sheet with length limits, disclaimers, and channel-specific rules
- A past-campaign library the agent can learn format and tone from
- Brand/legal sign-off on what counts as an approved claim
- Optional: a Power Automate connector to your campaign tracker (Planner, SharePoint, or your work-management tool) and Teams reviewer notifications

## Try it now — the prompt

Draft the agent's instructions before you build:

```
Write the instructions for a Copilot Studio agent on the GitHub Copilot harness named
"Campaign Assistant" for [Company Name].

The agent turns a campaign brief into:
- an asset checklist for the requested channels
- first-draft copy for each asset
- an approvals-needed note for brand, legal, and product review

Include:
- role, tone, and boundaries, including "never invent product claims, stats, customer names, or pricing"
- the steps the agent should reason through: check objective, target audience, channels, offer/CTA, key message, and deadline; ask once for missing essentials; consult approved brand, messaging, channel specs, and past campaigns; draft; mark unverified claims [VERIFY]
- when to use the campaign tracker / reviewer notification tool: only after the user confirms the draft is ready to log or route
- the response format: brief recap, asset checklist, drafts by channel, approvals needed, and source notes
```

This works because it designs outcome-focused instructions instead of trigger phrases. The planner gets the goal, the sources to consult, the action to use, and the claims boundary that keeps drafts review-safe.

## Step by step

1. **Create the agent.** In Copilot Studio, create a new agent on the GitHub Copilot harness. In the **Build** tab, use the **instructions editor** for the agent's operating instructions and the **components panel** for knowledge and tools. Name it something the team will recognise, such as "Campaign Assistant."
2. **Write outcome-focused instructions.** Adapt the prompt above into instructions. Cover the agent's role, tone, boundaries, reasoning steps, knowledge by purpose, tool by purpose, and response format. Do not author "new campaign" or "draft a campaign" trigger phrases; this harness reads intent and plans the path generatively.
3. **Confirm generative orchestration is on.** The GitHub Copilot harness is the autonomous, agentic harness: the planner decides which knowledge and tools to use for each request. Leave that behavior on so the agent can handle incomplete briefs and different channel mixes.
4. **Add the knowledge sources.** From the components panel, add brand guidelines, the messaging framework, the channel spec sheet, and the past-campaign library. Keep approved claims in a clear, authoritative source so the agent can separate grounded claims from `[VERIFY]` placeholders.
5. **Add the campaign action.** If the standard build's optional Power Automate step is in scope, add the flow that logs the campaign to Planner, SharePoint, or your work-management tool and notifies reviewers in Teams. In the instructions, say when to use it: only after the user asks to log or route the campaign, and return a manual fallback if the connector fails.
6. **Test the whole task in the Test pane.** Start with a realistic one-paragraph brief. Confirm the agent asks for missing essentials, creates the per-channel asset checklist, drafts within length limits, marks unverified claims `[VERIFY]`, and lists approvals needed. Each test run consumes credits, so keep the matrix tight.
7. **Break a step on purpose.** Ask for an unsupported claim, omit the deadline, or make the campaign tracker unavailable. The agent should recover by asking for the missing input, marking `[VERIFY]`, or giving the manual logging fallback instead of inventing a path.
8. **Publish and pilot.** Publish to the channel your campaign managers will use, then pilot with a small group. Capture feedback on missing channels, stale specs, and review routing before you open it to the whole team.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the
numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright
tool in `tooling/screenshots/`._

## Make it better

- Add a localization instruction set that adapts approved copy for each market's tone, channel rules, and disclaimers.
- Add campaign performance knowledge so the agent can recommend historically strong hooks and subject-line patterns.
- Connect a digital asset library so the agent suggests on-brand imagery alongside copy.
- Add an autonomous trigger only after the instructions are reliable, such as starting a draft when a campaign intake form arrives. Model the extra credit consumption before enabling it.

## Watch out for

- **Every action bills Copilot Credits, including build and test.** Set cost controls, keep test runs intentional, and estimate volume before a broad rollout.
- **Right-size the harness.** If your campaign process is a predictable single-path flow, build the [standard-harness version](studio-functional-marketing-campaign.md) instead; Microsoft 365 Copilot licensing can cover that route in Microsoft 365 channels.
- **Unverified claims can leak into drafts.** Keep approved proof points separate and enforce the `[VERIFY]` convention.
- **Channel specs drift.** Platforms change length limits and disclaimer rules. Assign an owner for the spec sheet.
- **Drafts are not final.** The agent accelerates the first draft; it does not replace brand, legal, or product review.

## Where this leads (the ramp)

Brief-to-campaign generation is useful when the source material is curated and the review path is clear. When you want to measure which hooks and subject lines actually perform, move from drafting to experimentation in Foundry.

> **Next:** [Foundry: A/B and shadow deployment](foundry-ab-shadow-deploy.md)

## Related

- [Standard-harness version](studio-functional-marketing-campaign.md)
- [Pick the engine for the job](../pick-the-engine.md)
- [Marketing Campaign Agent solution template](../solutions/marketing-campaign-agent.md)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

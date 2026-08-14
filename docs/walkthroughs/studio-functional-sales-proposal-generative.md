---
title: "Sales: Autonomous proposal and RFP drafting on the GitHub Copilot harness"
description: Build an agentic proposal assistant that assembles RFP answers and proposal sections from approved sales content and cited sources.
stage: studio
harness: github-copilot
roles: [maker, champion, manager]
tags: [copilot-studio, sales, proposal, rfp, content-assembly, github-copilot-harness, generative-orchestration, functional]
level: intermediate
time: 3–4 hours
status: walkthrough
prereqs: [copilot-studio-access, knowledge-source]
updated: 2026-08-14
---

# Sales: Autonomous proposal and RFP drafting on the GitHub Copilot harness

> Give reps an agent that plans the proposal task, finds approved content, drafts the response, cites sources, and refuses out-of-scope deal terms.

**Stage:** Copilot Studio · **For:** Maker, Champion, Manager · **Level:** Intermediate · **Time:** 3–4 hours

!!! abstract "Which harness? This one uses the GitHub Copilot harness"
    Every Copilot Studio agent runs on a [harness](../pick-the-engine.md) — the engine underneath it. This
    walkthrough builds on the **GitHub Copilot harness**, the autonomous, agentic engine: it **reasons
    through the whole goal on its own**, **retries and finds another path when a step fails**, works across
    your **Word, Excel, PowerPoint, and PDF** files, and keeps context with **skills and memory** — so you
    describe the outcome instead of authoring every path. That capability is why it's the engine to grow into.

    The honest tradeoff: it bills **Copilot Credits for all usage — building, testing, *and* running — and a
    Microsoft 365 Copilot license *never* covers it.** Want this same use case as predictable, rules-based
    topics your Microsoft 365 Copilot license already covers in Microsoft 365 channels? Build the
    **[standard-harness version](studio-functional-sales-proposal.md)** instead.
    [Compare the engines](../pick-the-engine.md) · [estimate the net cost](../credit-estimator.md).

## When to use this

Use this when proposal and RFP work is more than a lookup. A rep may ask for a security RFP answer, a case study for a specific industry, a solution brief, and a draft section in one request. Generative orchestration lets the agent decide which approved sources to consult and how to assemble the response without you authoring separate trigger phrases for every wording.

The [standard-harness version](studio-functional-sales-proposal.md) is the safer fit when you want three predictable retrieval topics. This GitHub Copilot harness version is for teams ready to pay for an agent that can plan a multi-step proposal task and recover when content is missing.

## What you'll need

- Copilot Studio access with Copilot Credits available for building, testing, and running this harness
- A proposal and RFP content library in SharePoint: solution briefs, approved RFP responses, case studies, proposal templates, and boilerplate sections
- A named sales enablement owner who keeps the library current
- Agreement from sales leadership on approved content versus excluded content, including pricing sheets, contract terms, deal-specific notes, unpublished content, and internal-only material
- Optional: a read-only CRM connector or action for opportunity context such as industry, stage, solution area, and deal size

## Try it now — the prompt

Draft the agent's instructions before you build:

```
Write the instructions for a Copilot Studio agent on the GitHub Copilot harness named
"Proposal Content Assistant" for [Company] sales reps.

The agent helps reps assemble approved content for proposals and RFP responses.

Include:
- role, tone, and boundaries: be concise, cite sources, never generate pricing, deal terms, unpublished content, internal-only content, or NDA-protected customer references
- the steps the agent should reason through: identify whether the user needs an RFP answer, case study, solution brief, or drafted proposal section; ask for missing context such as industry, solution area, audience, and due date; search the approved SharePoint library; assemble or draft from approved content only
- when to use a CRM lookup tool, if available: only when the rep provides an opportunity name or ID, and only to retrieve context such as industry, stage, solution area, and deal size
- what to do when no approved content exists: say so clearly and route the rep to sales enablement or a manager
- the response format: short answer, approved content or draft, source links, assumptions, and review notes
```

This works because it fixes the content perimeter before drafting begins. The planner can choose the right source or tool, but the instructions keep pricing, deal terms, unpublished content, and NDA material out.

## Step by step

1. **Create the agent.** In Copilot Studio, create a new agent on the GitHub Copilot harness. In the **Build** tab, use the **instructions editor** for behavior and the **components panel** for knowledge and tools. Name it "Proposal Content Assistant" or another sales-friendly name.
2. **Write outcome-focused instructions.** Adapt the prompt above into instructions. Include role, tone, boundaries, reasoning steps, knowledge by purpose, optional tool use by purpose, and the response format. Do not build trigger phrases such as "RFP question about" or "case study for"; the harness reads the user's intent and plans the route.
3. **Confirm generative orchestration is on.** Leave the GitHub Copilot harness's generative planning behavior on so the agent can combine retrieval, drafting, refusal, and escalation in one plan.
4. **Add the SharePoint knowledge source.** Connect the approved proposal and RFP content library. Include solution briefs, approved RFP responses, case studies, proposal templates, and boilerplate sections. Keep draft, outdated, internal-only, pricing, and contract-term content out of this source.
5. **Add the CRM tool only if you are ready for that path.** If your sales process needs opportunity context now, add a read-only Salesforce or Dynamics action that retrieves industry, stage, solution area, and deal size. In the instructions, say to use it only when the rep supplies an opportunity reference and never to use it for pricing or deal terms. If you do not have this tool, instruct the agent to ask the rep for the missing context.
6. **Test the whole task in the Test pane.** Try a pasted RFP question, a case-study request by industry, a solution-brief request, and a proposal-section draft. Confirm the agent returns approved content, cites source links, notes assumptions, and asks for missing context. Each test run consumes credits.
7. **Test the refusal and recovery paths.** Ask for pricing, deal terms, and an NDA-protected customer reference. Then break a source path or CRM lookup. The agent should refuse or escalate cleanly, say when no approved response exists, and never fill the gap with invented content.
8. **Publish and pilot.** Publish to the channel your reps use, then pilot with a small sales team. Review missing-content reports with sales enablement before expanding.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the
numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright
tool in `tooling/screenshots/`._

## Make it better

- Add draft mode once the library is high quality: the agent drafts a proposal section tailored to the customer context, with a review-before-sending note.
- Track unanswered RFP questions as content gaps for sales enablement to review quarterly.
- Add CRM context from Salesforce or Dynamics so industry, stage, solution area, and deal size can shape retrieval without the rep typing everything.
- Add an autonomous trigger only when governance is ready, such as starting a content-gap review when new unanswered RFP questions are logged.

## Watch out for

- **Every action bills Copilot Credits, including build and test.** Set cost controls and keep the pilot small until you understand proposal volume.
- **Right-size the harness.** If this is just three predictable retrieval paths, use the [standard-harness version](studio-functional-sales-proposal.md) instead; it is rules-based and can be covered by Microsoft 365 Copilot licensing in Microsoft 365 channels.
- **Content freshness is everything.** Old messaging, retired product names, or superseded case studies are worse than no answer. Assign an owner and review cadence.
- **Pricing and deal terms must stay out.** Reps will ask under deadline pressure. The agent should refuse cleanly and redirect to deal desk or a manager.
- **NDA-protected case studies require audit.** Do not connect a library that contains customer references the rep cannot reuse.

## Where this leads (the ramp)

Approved-content drafting is a strong Studio use case. When you want deeper pro-code tool connections across CRM, content systems, and custom retrieval, move to Foundry's MCP tooling.

> **Next:** [Foundry: connect pro-code tools with MCP](foundry-mcp-tools.md)

## Related

- [Standard-harness version](studio-functional-sales-proposal.md)
- [Pick the engine for the job](../pick-the-engine.md)
- [Sales Proposal & RFP Agent solution template](../solutions/sales-proposal-rfp-agent.md)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

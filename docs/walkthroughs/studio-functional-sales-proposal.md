---
title: "Sales: Build proposals and RFP responses with your approved content"
description: Build a Copilot Studio agent that helps reps assemble proposals and RFP responses from your approved content, so the first draft takes 30 minutes not 3 hours.
stage: studio
harness: standard
roles: [maker, champion, manager]
tags: [copilot-studio, sales, proposal, rfp, content-assembly, functional]
level: intermediate
time: 3–4 hours
status: walkthrough
updated: 2026-06-04
---

# Sales: Build proposals and RFP responses with your approved content

> Help reps pull together the right content for proposals and RFP responses — grounded on your approved solution library and messaging — so the first draft takes 30 minutes instead of 3 hours.

**Stage:** Copilot Studio · **For:** Maker, Champion, Manager · **Level:** Intermediate · **Time:** 3–4 hours

> **📐 Full blueprint & test plan →** [Sales Proposal & RFP Agent](../solutions/sales-proposal-rfp-agent.md) — the copy-paste system prompt, topic specs, and test-case table behind this build.

!!! abstract "Which harness? This one uses the standard harness"
    Every Copilot Studio agent runs on a [harness](../pick-the-engine.md) — the engine underneath it. This
    walkthrough builds on the **standard harness**: you author the topics and rules, the flow is predictable,
    and for Microsoft 365 Copilot-licensed users **it's covered inside Microsoft 365 channels** (no extra
    credits) — the lowest-cost choice for structured, rules-based work.

    Want the same use case to **reason through the task on its own** — planning multi-step work, recovering
    when a step fails, and working across your files? Build the
    **[GitHub Copilot harness version](studio-functional-sales-proposal-generative.md)** instead. It's the autonomous engine to grow into; the
    honest tradeoff is that it bills **Copilot Credits for all usage** and a Microsoft 365 Copilot license
    never covers it. [Compare the engines](../pick-the-engine.md) · [estimate the net cost](../credit-estimator.md).

## When to use this

Proposals and RFP responses are high-effort, time-sensitive, and inconsistently executed. A rep who has been at the company for 2 years and knows the content library inside out produces a very different first draft from a rep who joined 3 months ago.

A proposal content agent levels this: it surfaces the right approved content for a given customer situation — the relevant solution brief, the best case studies for that industry, the approved response to a specific RFP question — so every rep starts from a strong approved baseline rather than blank-page improvisation or copy-paste from a stale folder.

**Why this is distinct from the Sales Enablement agent:** the Sales Intel agent helps reps prepare for conversations (competitive, pitch, discovery). The proposal agent helps reps build deliverables (written proposals, RFP response documents). Different workflow, different sources, different output format.

## What you'll need

- Copilot Studio access
- A proposal and RFP content library in SharePoint (solution briefs, approved RFP responses, case studies, proposal templates, boilerplate sections)
- A named sales enablement owner who maintains the library
- **30 minutes with Sales leadership** to agree on what constitutes "approved" content vs. content the agent should never surface (e.g., pricing sheets, internal deal notes)

## Try it now — the prompt

Run this prompt in Copilot Chat to scaffold the system prompt, the three retrieval topics, and the output format — it works because it fixes the content perimeter (approved in, pricing out) before any drafting begins.

Two decisions before building:

1. **How does the output work?** The agent can (a) return approved text to copy-paste, (b) summarise what content exists and link to the right files, or (c) draft a full response section using the approved content as grounding. Option (b) is the fastest to build and hardest to misuse. Option (c) requires strong content quality and post-draft human review.

2. **What content is in scope?** Define the perimeter explicitly: approved solution briefs ✅, published case studies ✅, approved boilerplate ✅, live pricing ❌, contract terms ❌, deal-specific notes ❌.

```
Design a Copilot Studio proposal content agent for [Company] sales reps.
Knowledge source: [proposal library / solution briefs / approved RFP
responses / case studies — in SharePoint].
The agent helps reps find and assemble approved content for proposals
and RFP responses — by topic, solution area, or customer industry.
Out of scope: pricing, deal terms, unpublished content.

Give me: system prompt, 3 topics (RFP question lookup, case study
finder, solution brief retrieval), and guidance on output format.
```

## Step by step

1. **Create the agent.** Set instructions to:

    > *You are the Proposal Content agent for [Company] sales reps. You help build proposals and RFP responses by finding and surfacing approved content from the solution library. Be concise: return the content and a direct link to the source document. Never generate pricing, deal terms, or content marked as internal-only or not approved for customer use.*

2. **Add your content library as the knowledge source.** Connect to the SharePoint folder where sales enablement maintains approved materials. The agent's quality depends entirely on content quality — brief the sales enablement team that outdated or draft content will surface if it is in the library.

3. **Build the RFP question topic.** The most valuable topic. A rep pastes or describes an RFP question and the agent returns the approved response from the RFP response library.
    - Trigger phrases: "how do we answer", "RFP question about", "they asked about", "response to [topic]"
    - Flow: identify the topic area → search the approved RFP response library → return the response with source document link → note if no approved response exists ("I don't have an approved response for this — check with sales enablement")

4. **Build the case study finder topic.** Identical to the Sales Intel version but focused on the right format for a proposal (headline outcome, challenge, solution summary).
    - Trigger phrases: "case study for [industry]", "customer example", "reference for [use case]", "proof point for [audience]"

5. **Build the solution brief topic.** Returns the right solution brief or capability overview for a given product, solution, or use case area.
    - Trigger phrases: "solution brief for", "what's our story on [product]", "capabilities overview", "product summary for proposal"

6. **Add an "out of scope" escalation.** Any request for pricing, deal terms, or content the agent can't find escalates clearly: "I don't have approved content for that — contact sales enablement or your manager."


## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **Draft mode.** Once the content library is high quality, add a "draft this section" capability: the agent uses the approved content as grounding and drafts a proposal section tailored to the customer context (industry, deal stage, specific requirements). Always include a "review before sending" note.
- **RFP library gap detection.** Track which RFP questions the agent cannot answer (no approved response found). Surface this to sales enablement as a quarterly "what questions are we not covered for?" report.
- **Opportunity context from CRM.** Connect to Salesforce or Dynamics to pull the opportunity's industry, stage, and deal size and automatically tailor content retrieval — without the rep having to specify it.

## Watch out for

- **Content freshness is everything.** Proposals sent with outdated messaging, superseded case studies, or old product names damage more than they help. Assign a named sales enablement owner and a quarterly review cadence.
- **Pricing requests.** Reps under deadline pressure will ask for pricing in the same conversation. The agent must refuse cleanly and redirect to deal desk — configure this as a topic, not just an instruction.
- **NDA-protected case studies.** Audit the content library before connecting it. Any case study that names a customer under NDA must not be in the knowledge source.

## Where this leads (the ramp)

Surfacing approved content and linking sources is the safe first cut. The moment you want drafts tailored automatically from CRM — industry, stage, and deal size pulled from Salesforce or Dynamics — you need pro-code tool connections, which Azure AI Foundry's MCP tooling provides.

> **Next:** [Foundry: connect pro-code tools with MCP](foundry-mcp-tools.md)

## Related

- [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Knowledge overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)
- [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

!!! tip "Ready to build? Use the solution template."
    The [Sales Proposal & RFP Agent solution template](../solutions/sales-proposal-rfp-agent.md) has the full system prompt, content library structure, the three core topics, and 8 test cases including the pricing escalation and NDA edge cases.

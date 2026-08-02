---
title: "Sales: Product intel and objection handling for sales reps"
description: Build a Copilot Studio agent that gives reps the right product story, competitive positioning, and objection responses mid-call, grounded on your content.
stage: studio
roles: [maker, champion, manager]
tags: [copilot-studio, sales, product-knowledge, competitive-intel, objections, functional]
level: intermediate
time: 3–4 hours
status: walkthrough
updated: 2026-06-04
---

# Sales: Product intel and objection handling for sales reps

> Give every rep instant access to the right product story, competitive positioning, and objection responses — grounded on your actual sales content, available mid-call.

**Stage:** Copilot Studio · **For:** Maker, Champion, Manager · **Level:** Intermediate · **Time:** 3–4 hours

> **📐 Full blueprint & test plan →** [Sales Enablement Agent](../solutions/sales-enablement-agent.md) — the copy-paste system prompt, topic specs, and test-case table behind this build.

## When to use this

Sales reps lose deals not because they don't know the product — but because they can't find the right information fast enough. The battle card is buried in SharePoint. The right case study is in a folder no one's indexed. The objection they just heard was handled in a call three months ago, but no one captured the response.

A sales enablement agent centralises all of that. Reps can ask a question mid-call prep ("What do we say when a prospect asks about [competitor]?"), get an answer grounded on your actual approved content, and walk into the conversation confident. The agent doesn't replace the rep — it makes the information problem disappear.

**Why Stage 6** (not just Agent Builder): the value compounds when the agent can search across *multiple* knowledge sources simultaneously — battle cards, product docs, case study library, approved objection responses — and return a synthesised answer for a specific situation. Agent Builder handles one source. Studio handles many.

## What you'll need

- **Copilot Studio access**
- Your **sales content in SharePoint** — battle cards, product decks, case studies, objection handling guides, pricing summaries, approved customer stories
- Input from **Sales leadership or an experienced rep** on the top 20 questions reps ask before a call
- Clarity on **what the agent should not answer** — anything requiring real-time pricing, custom deal terms, or legal commitments must stay human

## Try it now — the prompt

Run this prompt in Copilot Chat to scaffold the persona, topics, and a sample answer format — it works because it asks for the top objections and a talk-track style up front, so answers come back rep-ready rather than spec-heavy.

Sales agents differ from internal FAQ agents: the audience is savvier, the queries are more situational ("what do I say to a mid-market CFO who's worried about integration complexity?"), and the cost of a wrong answer is a lost deal rather than a mis-filed expense.

Spend time on these with Sales leadership before building:

1. **What are the top 5 competitor objections reps hear most often?** Ground the agent on your battle cards for these specifically.
2. **What makes a great answer vs. a mediocre one?** A great answer for a sales rep is brief, confident, and ends with a talk track — not a summary of the product spec.
3. **What content absolutely must not be surfaced by the agent?** Unpublished pricing, internal deal commentary, customer names under NDA — make sure these are not in the knowledge sources.

```
Design a Copilot Studio sales enablement agent for [Company].
Knowledge sources: [battle cards / product docs / objection handling guide /
case study library — all on SharePoint].
Top rep questions before a call: [list your 20].
The agent should give brief, confident answers with a recommended talk track
where relevant. Escalate anything requiring custom pricing or deal terms
to the sales rep's manager or deal desk.

Give me: persona instructions, 3 topics to configure, and a sample
answer format for a competitive objection query.
```

## Step by step

1. **Create the agent.** The persona here is different from an internal FAQ agent — it should feel like a sharp, confident sales colleague:

    > *You are the Sales Intel agent for [Company]. You help sales reps prepare for prospect conversations by answering questions about our products, competitive positioning, and common objections — using only approved sales content. Be brief and direct. Where relevant, give a recommended talk track. If a question requires custom pricing, deal terms, or involves confidential information, respond: "That needs the deal desk — escalate to [contact]."*

2. **Add all your knowledge sources.** Ground the agent on: battle cards, product overview decks, the objection handling guide, case study library, and approved competitor comparison docs. Use multiple SharePoint sources or uploaded files — this is the key advantage of Studio over Agent Builder.

3. **Build the competitive objection topic.** The highest-value topic. Trigger phrases: "[Competitor] vs us", "why not [competitor]", "the prospect mentioned [competitor]". The response should: name the competitor, give the key differentiator in 2-3 sentences, then provide a talk track the rep can use verbatim.


4. **Build the "find a case study" topic.** Reps often need a reference customer for a specific industry, use case, or company size. Trigger: "do we have a case study for [industry / use case / company size]?" The agent searches the case study library and returns the most relevant match with a link.

5. **Build the "what's our story for…" topic.** For specific personas or industries: "What do I lead with for a CFO?" / "What's our pitch for manufacturing?" The agent returns the approved value proposition for that segment and 2-3 supporting points.

6. **Test with real scenarios.** Ask the top-5 competitive objections, 3 case study requests, and 2 persona-based "what's our story" queries. Have an experienced rep review the answers — they'll immediately know if the agent is returning useful content or generic product-speak.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **Trigger it from Teams during call prep.** Pin the agent in the Sales team channel so reps naturally reach for it while prepping. A pinned agent is used; a link-in-a-doc is forgotten.
- **Capture what gets asked.** Analytics in Copilot Studio shows what reps query most. Those are your content gaps — if the agent gets asked about a competitor you don't have a battle card for, that's a signal for marketing.
- **Add a "discovery questions" starter.** "What questions should I ask a [role] in a [stage] conversation?" is one of the most valuable queries — and it's answerable from a well-structured discovery guide.

## Watch out for

- **Out-of-date battle cards.** Competitive content has a short shelf life. If the battle cards aren't maintained, the agent confidently gives outdated competitive positioning — potentially worse than no agent. Assign a marketing owner for the SharePoint folder.
- **The agent taking positions the company hasn't approved.** Reps will test the agent with edge questions about competitors. If the knowledge base has informal commentary or early-draft content, the agent will surface it. Audit what's in the SharePoint sources before going live.
- **Pricing.** Never include current list prices in the knowledge source unless Finance has signed off on the agent surfacing them. Pricing changes faster than the agent's knowledge base. Always escalate to the deal desk.

## Where this leads (the ramp)

Studio's strength here is searching several approved sources at once. When reps need deeper, real-time synthesis — richer retrieval, live CRM context, lower latency mid-call — a pro-code grounded agent in Azure AI Foundry is the next build.

> **Next:** [Foundry: build your first pro-code agent](foundry-first-agent.md)

## Related

- [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Knowledge overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)
- [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

!!! tip "Ready to build? Use the solution template."
    The [Sales Enablement Agent solution template](../solutions/sales-enablement-agent.md) gives you the system prompt, all four topics spec’d out, starter prompts validated for reps, a test case table including adversarial pricing tests, and a deployment checklist.

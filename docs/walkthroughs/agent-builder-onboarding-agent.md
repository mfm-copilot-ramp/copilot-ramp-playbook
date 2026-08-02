---
title: Build an onboarding agent for new hires
description: Build a self-service onboarding agent that answers new hires' first-week questions on demand, so you stop repeating the same setup conversation every time.
stage: agent-builder
roles: [manager, champion, hr]
tags: [onboarding, agent-builder, hr, knowledge]
level: intermediate
time: 30 min
status: walkthrough
prereqs: [m365-copilot-license, agent-builder-access, sharepoint-site]
updated: 2026-06-03
---

# Build an onboarding agent for new hires

> Give every new team member a self-service agent that answers first-week questions on demand — so you stop repeating the same onboarding conversation and new hires stop waiting for answers.

**Stage:** Agent Builder · **For:** Manager, Champion, HR · **Level:** Intermediate · **Time:** 30 min

## When to use this

Your team is growing. Onboarding takes too much of your time, and new hires spend their first week hunting for policies, processes, and "how we do things here." The answers all exist — they're just scattered across SharePoint, old emails, and institutional memory.

This walkthrough builds a no-code onboarding agent using Agent Builder, grounded on your team's actual documentation. New hires can ask it questions in plain language and get instant, cited answers — any time, without waiting for a reply from you.

## What you'll need

- **M365 Copilot license** with access to **Agent Builder** in Copilot
- A SharePoint site or set of documents with your onboarding content (team readme, policies, process guides, org chart, tools list)
- 30 minutes to build and test

## Step by step

### 1. Gather and organize your knowledge source

Before building, collect the documents the agent will draw from into a single SharePoint site or folder. Good onboarding sources include:

- Team readme / "how we work" doc
- IT setup and tools guide
- Key processes (expense reporting, leave requests, access requests)
- Org chart or team directory
- Active project summaries
- Links to key systems and their login processes

The better organized the source, the better the agent's answers.

### 2. Open Agent Builder and create a new agent

In Microsoft 365 Copilot or Teams, open **Agent Builder** and create a new agent. Name it something the new hire will recognize: `"[Team Name] Onboarding Guide"` or `"[Your Name]'s Team Assistant"`.

### 3. Write the persona and instructions

In the **Instructions** field, paste:

```
You are an onboarding assistant for new members of the [Team Name] team.
Your job is to answer questions about:
- How the team is organized and who does what
- Tools, systems, and access (how to get set up)
- Key processes (expenses, leave, IT requests)
- Active projects and where to find information about them
- Team norms and culture ("how we do things here")

Always cite which document or source your answer comes from.
If you don't know the answer, say so clearly and suggest who the new hire should ask.
Never make up policies or procedures — only answer from the documents you've been given.
```

### 4. Connect the knowledge source

Add your SharePoint site or document folder as the knowledge source. Agent Builder will index it automatically.

### 5. Add starter prompts

Add 4-5 starter prompts to help new hires know what to ask:

- `"What tools do I need to set up on day 1?"`
- `"Who do I contact for IT access?"`
- `"How does the expense process work?"`
- `"What projects is the team working on right now?"`
- `"What are the team norms I should know about?"`

### 6. Test and refine

Ask the agent each starter prompt. For any answer that's wrong or incomplete:

- Check if the source document covers the topic — if not, add a document
- If the answer exists but is wrong, check the source document for accuracy and update it

### 7. Share with new hires

Share the agent directly in Teams before the new hire's first day. Include a note: *"This agent knows most of what you'll want to know in week 1 — just ask it in plain language."*

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **Refresh the knowledge:** update the SharePoint source docs whenever policies or processes change — the agent picks up the changes automatically.
- **Role-specific variants:** clone the base agent and add a role-specific knowledge source (e.g., a sales process guide for SDRs, a coding standards doc for engineers).
- **Feedback loop:** ask the agent at the end of each new hire's first month: `"What questions did you ask the agent that it couldn't answer well?"` — use the gaps to improve the docs.
- **Buddy agent:** create a parallel version for the onboarding buddy with instructions focused on their role in the process.

## Watch out for

- **Out-of-date onboarding docs.** New hires will trust a wrong answer. Confirm the handbook, IT guide, and tools list are current before sharing, and assign an owner to keep them fresh.
- **Answering beyond the docs.** If asked something the source doesn't cover, the agent should say so and point to a person — not improvise a policy.
- **Sharing too late.** The value is front-loaded; share it before day one, not in week two.

## Where this leads (the ramp)

A no-code onboarding agent answers questions well, but it can't kick off the actual onboarding workflow — provisioning access, filing forms, notifying IT. In Copilot Studio the same agent connects to those systems and acts, not just answers.

> **Next:** [Copilot Studio: an HR onboarding agent](studio-functional-hr-onboarding.md)

## Related

- [Give your agent a persona and instructions that stick](agent-builder-persona-instructions.md)
- [Stage 4 · Agent Builder](../stages/stage-4-agent-builder.md)

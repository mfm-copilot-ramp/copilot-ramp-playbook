---
title: Build an FAQ agent for a recurring process
description: Build a no-code Agent Builder FAQ bot that answers your team's repeat questions instantly, 24/7, from your own documentation so you stop being the help desk.
stage: agent-builder
roles: [champion, it-admin, manager]
tags: [faq, helpdesk, agent-builder, knowledge, process]
level: intermediate
time: 20 min
status: walkthrough
prereqs: [m365-copilot-license, agent-builder-access]
updated: 2026-06-03
---

# Build an FAQ agent for a recurring process

> Redirect the "quick questions" that consume your week to an agent that answers them instantly, 24/7, from your own documentation — no queue, no wait, no interruption.

**Stage:** Agent Builder · **For:** Champion, IT Admin, Manager · **Level:** Intermediate · **Time:** 20 min

## When to use this

You get the same questions over and over: expense policy, leave requests, IT request process, product FAQs, compliance questions, "how do I do X in [system]." The answers are all in documents your team already has. But people ping you instead of finding the docs, and you spend more time answering than doing.

An FAQ agent routes those questions to the documentation — with natural language search, instant answers, and citations. The 20-minute investment eliminates a recurring time drain.

## What you'll need

- **M365 Copilot license** with access to **Agent Builder**
- A document, SharePoint site, or FAQ list that contains the answers
- A clear scope for what the agent should and shouldn't answer

## Step by step

### 1. Define the scope

Before building, write one sentence that defines exactly what the agent covers and what it doesn't. For example:

- ✅ `"Questions about the company's expense reimbursement policy and process"`
- ❌ `"All HR questions"` (too broad — the agent will try to answer things it can't and will hallucinate)

A narrow, well-documented scope produces a reliable agent. Broad scope with thin documentation produces a bad one.

### 2. Audit your source documents

Open the docs that contain the answers. Check for:

- **Currency:** are the policies up to date?
- **Completeness:** are the most-asked questions covered?
- **Ambiguity:** are there sections where the right answer depends on context the doc doesn't capture?

Fix the docs *before* you build the agent. The agent is only as good as the source.

### 3. Create the agent

Open **Agent Builder**, create a new agent. Name it clearly: `"Expense Policy Q&A"` or `"IT Help: Access & Tools"`.

In the **Instructions** field:

```
You are a [process/policy name] assistant. Answer questions about [scope in one sentence].

Use only the attached documents to answer. Do not make up policies or procedures.
Always cite the source document and section for your answer.

If someone asks about something outside your scope, say: "That's outside what I cover.
For [out-of-scope topic], please contact [correct team / link]."

Keep answers concise and actionable — tell the person what to *do*, not just what the policy says.
```

### 4. Connect the knowledge source

Add your policy document, SharePoint page, or FAQ document as the knowledge source.

### 5. Add starter prompts

Write the 5 questions you get asked most often. These appear as clickable shortcuts when someone opens the agent.

### 6. Test with real questions

Ask the agent the questions you get most often. For each answer:

- Is it accurate?
- Is it actionable (does it tell the person what to do, not just describe the policy)?
- Does it cite the right section?

If any answer is wrong, fix the source document — don't try to correct the agent with more instructions. The instructions should guide behavior, not patch bad data.

### 7. Share and publicize

Share the agent in the Teams channel where questions come in. Pin it as a tab. Add a message: `"Before pinging us, try the [Agent Name] agent — it can answer most [policy] questions instantly."`

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **Measure deflection:** after 2 weeks, count whether the questions have dropped. If not, look at what the agent couldn't answer and fill those gaps in the docs.
- **Multi-policy agent:** once your first agent is working, duplicate it and add a second knowledge source for a related policy. Keep each agent narrowly scoped rather than building one big "HR agent."
- **Escalation path:** in the instructions, add: `"If someone is frustrated or the question requires human judgment, direct them to [team alias / Planner task link]."` — gives the agent an off-ramp.
- **IT helpdesk variant:** connect the agent to your IT ticketing system's FAQ or the Microsoft Admin Center docs for common IT support questions.

## Watch out for

- **Thin docs, confident answers.** The agent is only as good as its source — a sparse or out-of-date document produces fluent but wrong answers. Fix the docs before blaming the agent.
- **Scope creep.** A narrow scope keeps it reliable; the moment you widen it past what the docs cover, it starts guessing. Keep separate agents narrow rather than one broad one.
- **No deflection measurement.** If you don't baseline the question volume, you won't know whether it's working — count before and after.

## Where this leads (the ramp)

A no-code FAQ agent handles the easy questions; what it can't do is plug into your ticketing system, run across multiple channels, or report on how much load it actually deflected. Copilot Studio rebuilds the same agent with those enterprise controls — see it applied to support deflection.

> **Next:** [Copilot Studio: a support-deflection agent](studio-functional-support-deflection.md)

## Related

- [Pilot your agent with a team and gather feedback](agent-builder-share-and-feedback.md)
- [Stage 4 · Agent Builder](../stages/stage-4-agent-builder.md)

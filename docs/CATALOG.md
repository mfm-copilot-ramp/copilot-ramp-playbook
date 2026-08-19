---
title: Use-Case Catalog
description: The full Copilot use-case catalog across the journey — paste-a-prompt walkthroughs with title, value, sample prompt, and step-by-step guidance for each.
wide: true
---

# Use-Case Catalog

The full backlog across the journey. Most entries are **fully written walkthroughs** (title · value ·
sample prompt · step-by-step guidance); a few remain short stubs until they graduate into a rich
walkthrough under `walkthroughs/`. This is the "large swathe of use cases" — broad now, deepened on a
cadence.

Filter mentally by **Stage** (the heading) and **For:** (the role tag). On the live site these become
clickable filter chips.

<div id="catalog-filters" class="catalog-filters" markdown="0"></div>

Legend — `★` = recommended starting point for that stage · `→ walkthrough` = already fully expanded.

---

## Stage 1 · Copilot Chat
_Everyone starts here. Goal: a daily habit and a first "wow."_

### ★ Turn a meeting into tracked follow-ups → walkthrough
**For:** end-user, champion · `status: walkthrough`
Decisions, owners, and due dates captured in 5 minutes instead of re-watching the recording.
**Sample prompt:** `Summarize "[meeting]" — decisions, action items with owners + due dates, open questions. Table format.`
→ Fully written: `walkthroughs/chat-meeting-followups.md`

### Catch up on a Teams thread you were @mentioned in → walkthrough
**For:** end-user · `status: walkthrough`
Get the gist and what's being asked of you without scrolling 80 messages.
**Sample prompt:** `Summarize this chat and tell me specifically what's being asked of me and by when.`
→ Fully written: `walkthroughs/chat-catch-up-thread.md`

### Draft a status update from your week's activity → walkthrough
**For:** end-user, manager · `status: walkthrough`
Turn a week of emails, chats, and meetings into a crisp update.
**Sample prompt:** `Based on my last 5 working days of email and Teams activity, draft a 5-bullet status update for my manager.`
→ Fully written: `walkthroughs/chat-weekly-status.md`

### Rewrite an email for a tougher audience → walkthrough
**For:** end-user · `status: walkthrough`
Make a rambling draft tighter, clearer, and appropriately diplomatic.
**Sample prompt:** `Rewrite this email to be 40% shorter, more direct, and polite to a skeptical exec. Keep the ask obvious.`
→ Fully written: `walkthroughs/chat-rewrite-email.md`

### Get up to speed on a long document fast → walkthrough
**For:** end-user, manager · `status: walkthrough`
A 30-page doc reduced to what matters for *your* role.
**Sample prompt:** `Summarize this document for a [sales engineer]. What are the 3 things I most need to know and any risks?`
→ Fully written: `walkthroughs/chat-document-catch-up.md`

### Prep for a 1:1 in two minutes → walkthrough
**For:** manager, end-user · `status: walkthrough`
Walk into a 1:1 with talking points pulled from recent shared work.
**Sample prompt:** `Help me prep for my 1:1 with [name]. Summarize our recent threads and suggest 3 topics to raise.`
→ Fully written: `walkthroughs/chat-prep-1on1.md`

### Build a first-draft project plan → walkthrough
**For:** champion, manager · `status: walkthrough`
Go from a blank page to a structured plan you can edit.
**Sample prompt:** `Draft a project plan for [goal]: phases, milestones, owners, and risks. Table format.`
→ Fully written: `walkthroughs/chat-project-plan.md`

### Champion kit: run a "Prompt of the Day" for your team → walkthrough
**For:** champion · `status: walkthrough`
A repeatable adoption ritual that builds the habit across a team.
**Sample prompt:** `Give me 5 starter prompts a [marketing] team could use daily, each with the business value in one line.`
→ Fully written: `walkthroughs/chat-prompt-of-the-day.md`

### Draft an exec briefing from background materials → walkthrough
**For:** end-user, manager · `status: walkthrough`
Turn a pile of source docs into sharp, audience-calibrated talking points before any exec meeting.
**Sample prompt:** `Based on this document, draft a 5-point exec briefing for a 10-minute conversation with [audience]. Lead with the business outcome.`
→ Fully written: `walkthroughs/chat-exec-briefing.md`

### Catch up on a long email thread in seconds → walkthrough
**For:** end-user, manager · `status: walkthrough`
Know where a 40-message thread stands — and what's being asked of you — in under a minute.
**Sample prompt:** `Summarize this email thread: core issue, options raised, current status, and what's being asked of me.`
→ Fully written: `walkthroughs/chat-email-chain-summary.md`

### Build a meeting agenda from context and notes → walkthrough
**For:** end-user, manager, champion · `status: walkthrough`
Go from prep materials to a structured, time-slotted agenda in two minutes.
**Sample prompt:** `I'm running a [30-minute project sync] with [audience]. Based on these notes, draft an agenda with time slots and a one-line goal for each item.`
→ Fully written: `walkthroughs/chat-meeting-agenda.md`

### Brainstorm solutions with structured tradeoffs → walkthrough
**For:** end-user, manager · `status: walkthrough`
Get past the blank page — structured options with benefits, risks, and what each would take.
**Sample prompt:** `I'm trying to [problem]. Generate 5 approaches with key benefit, biggest risk, and what it would take to execute each.`
→ Fully written: `walkthroughs/chat-brainstorm.md`

### Adapt a document or message for a different audience → walkthrough
**For:** end-user, manager, champion · `status: walkthrough`
Transform content for a new audience in one prompt — no rewriting from scratch.
**Sample prompt:** `Rewrite this [doc/email] for [target audience]. They care most about [outcome]. Adjust tone, remove jargon, lead with the ask.`
→ Fully written: `walkthroughs/chat-adapt-audience.md`

### Plan your week from your calendar and inbox → walkthrough
**For:** end-user, manager · `status: walkthrough`
Start every Monday with a clear view of what matters, what needs prep, and what to defer.
**Sample prompt:** `Look at my calendar and inbox for this week. Tell me my three most important commitments, open threads to close, and one thing I can safely deprioritize.`
→ Fully written: `walkthroughs/chat-plan-week.md`

---

## Stage 2 · First-Party Agents
_Use what Microsoft already built. Goal: experience delegation before building anything._

> **Start with the roster.** Microsoft bundles a set of prebuilt agents into the M365 Copilot license —
> each tuned for a specific job. The overview page enumerates every one with its use case so you delegate
> to the right agent instead of prompting from scratch.

### The first-party agents included with your M365 Copilot license → walkthrough
**For:** end-user, champion, manager, maker, it-admin · `status: walkthrough`
The field guide to the whole roster — what each built-in agent (Researcher, Analyst, Facilitator, Interpreter, Project Manager, and more) is for, and which to open first.
**Sample prompt:** `I need to [task]. Which built-in M365 Copilot agent is built for this, and how should I phrase the ask?`
→ Fully written: `walkthroughs/first-party-agents-overview.md`

### ★ Auto-recap every meeting with Facilitator → walkthrough
**For:** end-user, champion · `status: walkthrough`
The Facilitator agent generates recaps and follow-ups automatically — the hands-free version of the Stage 1 win.
**Sample prompt:** `(In a Teams meeting) @Facilitator catch me up on what I missed and list open action items.`
→ Fully written: `walkthroughs/first-party-facilitator-auto-recap.md`

### Deep-dive a topic with Researcher → walkthrough
**For:** end-user, manager, maker · `status: walkthrough`
Multi-step research with sources, synthesized into a brief.
**Sample prompt:** `@Researcher build a brief on [topic]: current state, key players, and what changed in the last 6 months. Cite sources.`
→ Fully written: `walkthroughs/first-party-researcher-deep-dive.md`

### Analyze a dataset with Analyst → walkthrough
**For:** manager, maker · `status: walkthrough`
Ask questions of a spreadsheet in natural language and get charts back.
**Sample prompt:** `@Analyst from this sales file, show the top 5 products by margin and the month-over-month trend.`
→ Fully written: `walkthroughs/first-party-analyst-dataset.md`

### Translate a conversation in real time with Interpreter → walkthrough
**For:** end-user · `status: walkthrough`
Run a cross-language meeting without a human interpreter.
**Sample prompt:** `(In a meeting) @Interpreter translate between English and Spanish for this call.`
→ Fully written: `walkthroughs/first-party-interpreter-live-translation.md`

### Keep a project on track with Project Manager agent → walkthrough
**For:** champion, manager · `status: walkthrough`
Let the agent track tasks, nudge owners, and surface slippage.
**Sample prompt:** `@Project Manager track the action items from this plan and flag anything at risk of slipping.`
→ Fully written: `walkthroughs/first-party-project-manager.md`

### Agents in Channels: post team-wide answers → walkthrough
**For:** champion, it-admin · `status: walkthrough`
Drop a shared agent into a channel so the whole team can self-serve.
**Sample prompt:** `(In a channel) @[agent] what's our current onboarding checklist for new hires?`
→ Fully written: `walkthroughs/first-party-agents-in-channels.md`

### Surface adoption signals with Workforce/Workplace insights → walkthrough
**For:** champion, manager · `status: walkthrough`
Understand how your team is actually using Copilot to target enablement.
**Sample prompt:** `Where is my team getting the most value from Copilot, and where are they underusing it?`
→ Fully written: `walkthroughs/first-party-workforce-insights.md`

### Agents in Communities: shared answers in Viva Engage → walkthrough
**For:** champion, it-admin · `status: walkthrough`
Put a shared agent where a broad community already gathers, so common questions self-serve.
**Sample prompt:** `(In a Viva Engage community) @[agent] what's our policy on [topic]?`
→ Fully written: `walkthroughs/first-party-agents-in-communities.md`

### Upskill in the flow of work with the Learning agent → walkthrough
**For:** end-user, champion · `status: walkthrough`
Surface the right learning content (including LinkedIn Learning) at the moment a skill is needed.
**Sample prompt:** `I need to get up to speed on [skill] for a project next week — point me to the right learning.`
→ Fully written: `walkthroughs/first-party-learning-agent.md`

### Answer routine HR/IT questions with Employee Self-Service → walkthrough
**For:** end-user, it-admin · `status: walkthrough`
Benefits, policies, and "how do I…" answered from approved sources — no ticket required.
**Sample prompt:** `How much PTO do I have left and how do I request it?`
→ Fully written: `walkthroughs/first-party-employee-self-service.md`

### Share and co-edit an AI output with Copilot Pages → walkthrough
**For:** end-user, champion, manager · `status: walkthrough`
Turn any Copilot response into a shared, editable collaborative page in one click.
**Sample prompt:** (Use the "Edit in Pages" button after any Copilot Chat response.)
→ Fully written: `walkthroughs/first-party-copilot-pages.md`

### Track project milestones with the Planner agent → walkthrough
**For:** manager, champion · `status: walkthrough`
Describe a project and get a structured, assigned task plan — no manual form-filling.
**Sample prompt:** `Create a project plan for [project]. Team: [names]. Milestones: [list]. Break each into 3-5 tasks and suggest assignments.`
→ Fully written: `walkthroughs/first-party-planner-agent.md`

### Find answers across your org's content with BizChat → walkthrough
**For:** end-user, manager · `status: walkthrough`
Search your entire company's SharePoint, emails, and Teams in one question — and get a cited answer.
**Sample prompt:** `Find information about [topic] from across our company's SharePoint, emails, and Teams. Summarize and cite sources.`
→ Fully written: `walkthroughs/first-party-bizchat-grounded.md`

---

## Stage 3 · Cowork
_Let Copilot run multi-step work for you. Goal: comfort delegating whole tasks, not single prompts._

### ★ Hand off an end-to-end task to Cowork → walkthrough
**For:** champion, end-user · `status: walkthrough`
Describe an outcome and let Cowork plan and execute the steps across your M365 tools.
**Sample prompt:** `Pull last month's support emails, group them by theme, and draft a summary deck of the top 5 issues.`
→ Fully written: `walkthroughs/cowork-end-to-end-task.md`

### Stand up a recurring weekly digest → walkthrough
**For:** champion, manager · `status: walkthrough`
A scheduled task that compiles and sends a digest every Monday.
**Sample prompt:** `Every Monday at 8am, summarize new high-priority emails and Teams since Friday and send me a digest.`
→ Fully written: `walkthroughs/cowork-recurring-weekly-digest.md`

### Multi-document synthesis into a single brief → walkthrough
**For:** maker, manager · `status: walkthrough`
Several source files reconciled into one coherent output.
**Sample prompt:** `Read these 4 documents and produce one reconciled brief, flagging where they disagree.`
→ Fully written: `walkthroughs/cowork-multi-doc-synthesis.md`

### Build a deck from raw notes → walkthrough
**For:** end-user, champion · `status: walkthrough`
Messy notes → a structured, presentable slide deck.
**Sample prompt:** `Turn these meeting notes into a 6-slide deck: problem, options, recommendation, plan, risks, ask.`
→ Fully written: `walkthroughs/cowork-deck-from-notes.md`

### Champion kit: a "Cowork recipe" library for your org → walkthrough
**For:** champion · `status: walkthrough`
Curate reusable multi-step tasks the whole team can rerun (à la coworkcookbook.com).
**Sample prompt:** `Draft 5 reusable Cowork task descriptions for a [finance] team, each with the inputs it needs.`
→ Fully written: `walkthroughs/cowork-recipe-library.md`

### Research a market and write a landscape brief → walkthrough
**For:** manager, end-user · `status: walkthrough`
Hand Cowork a topic and source docs — get back a structured market brief in one session.
**Sample prompt:** `Research the [market] landscape and write a brief covering market size, key players, trends, risks, and implication for us.`
→ Fully written: `walkthroughs/cowork-market-research-brief.md`

### Draft a 30/60/90-day onboarding plan for a new team member → walkthrough
**For:** manager · `status: walkthrough`
Go from "someone starts Monday" to a complete, personalized onboarding plan in one Cowork session.
**Sample prompt:** `Draft a 30/60/90 onboarding plan for a new [role]. Team context: [description]. Include learning, relationship, and delivery goals per phase.`
→ Fully written: `walkthroughs/cowork-onboarding-plan.md`

### Build a competitive comparison from multiple source documents → walkthrough
**For:** manager, end-user · `status: walkthrough`
Turn a folder of competitor research into a structured comparison matrix and narrative brief.
**Sample prompt:** `Build a competitive comparison of [A], [B], [C] across capabilities, target customer, pricing, strengths, and weaknesses.`
→ Fully written: `walkthroughs/cowork-competitive-comparison.md`

### Draft an RFP or proposal response from scattered source docs → walkthrough
**For:** end-user, manager · `status: walkthrough`
Cross-reference an RFP against your internal docs and produce a first-draft response with flagged gaps.
**Sample prompt:** `Draft a response to this RFP using the attached source docs. Flag any section where our docs don't have strong coverage as [NEEDS HUMAN INPUT].`
→ Fully written: `walkthroughs/cowork-rfp-response.md`

---

## Stage 4 · Agent Builder
_Build simple declarative agents inside M365 Copilot. Goal: first taste of *making*, not just using._

### ★ Build a "team knowledge" agent over a SharePoint site → walkthrough
**For:** maker, champion · `status: walkthrough`
Point a declarative agent at your docs so the team can ask questions of them.
**Sample prompt (config):** `Create an agent grounded on [SharePoint site] that answers policy questions and always cites the source doc.`
→ Fully written: `walkthroughs/agent-builder-team-knowledge.md`

### Give your agent a focused persona and instructions → walkthrough
**For:** maker · `status: walkthrough`
Shape tone, scope, and refusal behavior with natural-language instructions.
**Sample prompt (config):** `Instructions: You are an onboarding buddy. Only answer from the HR site. If unsure, point to the HR team.`
→ Fully written: `walkthroughs/agent-builder-persona-instructions.md`

### Add starter prompts so users know what to ask → walkthrough
**For:** maker, champion · `status: walkthrough`
Lower the blank-box problem with suggested questions.
**Sample prompt (config):** `Add 4 starter prompts a new hire would ask in their first week.`
→ Fully written: `walkthroughs/agent-builder-starter-prompts.md`

### Share an agent with a team and gather feedback → walkthrough
**For:** champion, it-admin · `status: walkthrough`
Pilot with a small group and iterate on the instructions.
**Sample prompt:** `Draft a short message announcing the [onboarding] agent and asking 5 pilots for feedback.`
→ Fully written: `walkthroughs/agent-builder-share-and-feedback.md`

### Decide: declarative agent vs. full Copilot Studio → walkthrough
**For:** maker, it-admin · `status: walkthrough`
Know when you've outgrown Agent Builder and need Studio's power.
**Sample prompt:** `Compare what I can do in Agent Builder vs Copilot Studio for [my use case]. When should I graduate?`
→ Fully written: `walkthroughs/agent-builder-vs-studio.md`

### Build an onboarding agent for new hires → walkthrough
**For:** manager, champion, hr · `status: walkthrough`
Give new team members a self-service agent that answers their first-week questions on demand.
**Sample prompt (config):** `Instructions: Answer questions about our team's tools, processes, and org structure. Cite the source document for every answer.`
→ Fully written: `walkthroughs/agent-builder-onboarding-agent.md`

### Build an FAQ agent for a recurring process → walkthrough
**For:** champion, it-admin, manager · `status: walkthrough`
Redirect the "quick questions" that consume your week to an agent that answers 24/7 from your docs.
**Sample prompt (config):** `Instructions: Answer questions about [expense policy / IT request process]. Only use the attached document. If outside scope, redirect to [team].`
→ Fully written: `walkthroughs/agent-builder-faq-agent.md`

### Build a meeting-prep agent for a recurring 1:1 or standup → walkthrough
**For:** manager, end-user · `status: walkthrough`
Auto-generate talking points and agenda items before every recurring meeting — no manual pulling.
**Sample prompt (config):** `Instructions: When asked to prep for the weekly 1:1, summarize recent activity, list open items, and suggest 3-5 agenda topics.`
→ Fully written: `walkthroughs/agent-builder-meeting-prep-agent.md`

---

## Stage 5 · Autopilots
_Always-on, autonomous agents that work in the background. Goal: hand a standing job to Microsoft Scout — the first Autopilot — and let it act on your behalf under your guardrails._

> **Autopilots are a category; Scout is the first product in it.** Start with the field guide to get the
> hierarchy straight, then find out if you can turn Scout on (it's in private preview via the Frontier
> program) before you hand it a standing job.

### ★ Meet Microsoft Scout — and what Autopilots are → walkthrough
**For:** end-user, champion, manager, maker, it-admin · `status: walkthrough`
The field guide to the category and the first product: what an Autopilot is, what Scout connects to, how it builds context with Work IQ, and what it can do today. No access required.
**Sample prompt:** `Keep an eye on my week. When a meeting needs prep, pull the materials together and flag it before it starts — and check with me before acting on anything sensitive.`
→ Fully written: `walkthroughs/autopilots-meet-scout.md`

### Find out if you can get Scout — and turn it on → walkthrough
**For:** end-user, champion, it-admin · `status: walkthrough`
The honest on-ramp: confirm Frontier enrollment, the Intune policy and opt-in attestation, and the GitHub Copilot license needed to install the desktop app.
**Sample prompt:** `Draft a message to my IT admin asking: are we in the Frontier program, is the Scout Intune policy configured and opted in, and do I have a GitHub Copilot license to install the desktop app?`
→ Fully written: `walkthroughs/autopilots-get-access.md`

### Let Scout coordinate your meetings and prep → walkthrough
**For:** end-user, manager · `status: walkthrough`
Hand Scout a standing job: coordinate meeting times across time zones, flag the meetings that matter, and pull prep together — with you in the loop.
**Sample prompt:** `Take ownership of my meeting logistics this week: propose times that work across time zones, flag the meetings that matter, and draft prep before each one for me to review.`
→ Fully written: `walkthroughs/autopilots-coordinate-meetings.md`

### Have Scout watch your deliverables and flag risks → walkthrough
**For:** manager, champion, end-user · `status: walkthrough`
Give Scout a standing watch: identify what's coming due and block calendar time, and spot stalled decisions before they turn into blockers.
**Sample prompt:** `Keep a standing watch on my deliverables: block calendar time for what's coming due, and flag decisions that have gone quiet before they become blockers.`
→ Fully written: `walkthroughs/autopilots-track-deliverables.md`

---

## Stage 6 · Copilot Studio
_Build real, production-grade agents. The low-code maker destination._

### ★ Build your first Studio agent with a knowledge source + topic → walkthrough
**For:** maker · `status: walkthrough`
Go beyond declarative: custom topics, structured conversations, and richer grounding.
**Sample prompt:** `Outline a Copilot Studio agent for [use case]: knowledge sources, 3 key topics, and the happy-path conversation.`
→ Fully written: `walkthroughs/studio-first-agent.md`

### Connect an agent to a system with a connector / action → walkthrough
**For:** maker, it-admin · `status: walkthrough`
Let the agent *do* things — look up an order, create a ticket — via actions.
**Sample prompt:** `Design the action flow for an agent that looks up an order status from [system] and replies to the customer.`
→ Fully written: `walkthroughs/studio-connector-action.md`

### Add an MCP / tool integration to your agent → walkthrough
**For:** maker · `status: walkthrough`
Extend the agent with external tools (the pattern Sean's F&O MCP demo uses).
**Sample prompt:** `What MCP tools would a [supply chain] agent need, and what should each one do?`
→ Fully written: `walkthroughs/studio-mcp-tool-integration.md`

### Connect an agent to a Microsoft Fabric data agent → walkthrough
**For:** maker, it-admin · `status: walkthrough`
Ground the agent on your warehouse, lakehouse, and semantic models so users ask questions of data in plain language — not just documents.
**Sample prompt:** `Design a Studio agent that answers [sales/returns] questions from our Fabric [warehouse], always states the period and filters, and never invents a number.`
→ Fully written: `walkthroughs/studio-fabric-agent.md`

### Publish your agent to Teams and the web → walkthrough
**For:** maker, it-admin · `status: walkthrough`
Ship the agent to where users already are.
**Sample prompt:** `Walk me through the publish + governance checklist before releasing a Studio agent to 500 users.`
→ Fully written: `walkthroughs/studio-publish.md`

### Govern and monitor agents at scale → walkthrough
**For:** it-admin · `status: walkthrough`
ALM, analytics, and guardrails for a fleet of agents.
**Sample prompt:** `What should I monitor weekly across my published Copilot Studio agents, and what are the red flags?`
→ Fully written: `walkthroughs/studio-govern-monitor.md`

### Measure ROI and build the business case → walkthrough
**For:** manager, champion · `status: walkthrough`
Tie agent usage to outcomes to justify and expand the program.
**Sample prompt:** `Help me build an ROI model for our [support] agent: inputs, assumptions, and the metrics to track.`
→ Fully written: `walkthroughs/studio-roi-business-case.md`

### Trigger a Power Automate flow from inside a Studio agent → walkthrough
**For:** maker, it-admin · `status: walkthrough`
Connect your agent to real business systems — create tickets, update records, send notifications — from a natural-language conversation.
**Sample prompt:** `Design the action flow for an agent that collects a request from the user and submits it to [system] via Power Automate.`
→ Fully written: `walkthroughs/studio-power-automate-flow.md`

### Design a multi-turn conversation with fallback and clarification → walkthrough
**For:** maker · `status: walkthrough`
Build an agent that asks what it needs to know before it answers — and recovers gracefully from unexpected inputs.
**Sample prompt:** `Design a conversation flow for an agent that asks clarifying questions to identify [product / region / role] before answering.`
→ Fully written: `walkthroughs/studio-multi-turn-conversation.md`

### Configure an autonomous event-triggered agent → walkthrough
**For:** maker, it-admin · `status: walkthrough`
Build an agent that acts when something happens — without waiting for a user to start a conversation.
**Sample prompt:** `Design an autonomous agent that summarizes new SharePoint files added to [library] and posts a brief to [Teams channel].`
→ Fully written: `walkthroughs/studio-autonomous-triggers.md`

### Secure a Studio agent with authentication → walkthrough
**For:** maker, it-admin · `status: walkthrough`
Ensure only the right people can use your agent — and that it acts with the right identity when accessing data.
**Sample prompt:** `Walk me through configuring Entra ID authentication for a Copilot Studio agent that accesses our SharePoint HR site.`
→ Fully written: `walkthroughs/studio-authentication.md`

### Test and evaluate a Studio agent before publishing → walkthrough
**For:** maker, champion · `status: walkthrough`
Run structured test cases across intent recognition, answer quality, edge cases, and adversarial inputs before broad rollout.
**Sample prompt:** `Build a test case table for my [expense policy] agent: golden path, paraphrase variants, boundary cases, and adversarial inputs.`
→ Fully written: `walkthroughs/studio-test-evaluate.md`

### ★ HR: Answer employee questions with a policies agent → walkthrough
**For:** maker, it-admin, champion · `status: walkthrough`
Deploy an HR FAQ agent grounded on your policy docs — consistent, cited answers 24/7 and a structured escalation path for anything that needs a human.
**Sample prompt:** `Draft a Copilot Studio agent design for an HR policies FAQ agent. Knowledge source: [our HR SharePoint site]. Top employee questions: [list]. Always cite the source document. For anything requiring individual judgment, redirect to HR.`
→ Fully written: `walkthroughs/studio-functional-hr-policy-faq.md`

### IT: Triage support requests and answer from the knowledge base → walkthrough
**For:** maker, it-admin · `status: walkthrough`
Deflect tier-1 IT tickets with instant KB answers — and for anything that needs a human, collect the right information and raise the ticket automatically.
**Sample prompt:** `Design a Copilot Studio IT helpdesk triage agent. KB: [IT SharePoint]. Top self-serviceable requests: [list 20]. When a ticket is needed, collect: category, urgency, description. Submit via Power Automate to [helpdesk system].`
→ Fully written: `walkthroughs/studio-functional-it-helpdesk.md`
→ Also on the GitHub Copilot harness: `walkthroughs/studio-functional-it-helpdesk-generative.md`

### Finance: Self-service expense and procurement guidance → walkthrough
**For:** maker, it-admin, champion · `status: walkthrough`
Give employees instant answers on expense policy and procurement rules — and guide them into the right process rather than leaving them to hunt through the intranet.
**Sample prompt:** `Design a Finance guidance agent. Knowledge source: [expense policy / procurement policy / travel policy]. Guide employees to the right form and escalate individual rulings to Finance.`
→ Fully written: `walkthroughs/studio-functional-finance-expense.md`

### Sales: Product intel and objection handling for sales reps → walkthrough
**For:** maker, champion, manager · `status: walkthrough`
Give every rep instant access to the right product story, competitive positioning, and objection responses — grounded on your actual sales content, available mid-call.
**Sample prompt:** `Design a sales enablement agent. Knowledge sources: [battle cards / product docs / objection guide / case study library]. Give brief, confident answers with a recommended talk track. Escalate anything requiring custom pricing to the deal desk.`
→ Fully written: `walkthroughs/studio-functional-sales-intel.md`

### Legal & Compliance: Policy guidance and process navigation → walkthrough
**For:** maker, it-admin, champion · `status: walkthrough`
Give employees instant answers on compliance policies and legal processes — with strict scope controls and an unambiguous escalation path for anything that needs a qualified human.
**Sample prompt:** `Design a compliance guidance agent. Knowledge sources: [GDPR policy / NDA process / COI policy / AUP]. Scope: process guidance only. Out of scope: legal advice, contract interpretation. Escalate to [legal intake channel].`
→ Fully written: `walkthroughs/studio-functional-legal-compliance.md`

---

## Stage 7 · Foundry
_The pro-code frontier. Build only what the lower stages couldn't — with developers, in Azure._

### ★ Build your first pro-code agent with the Foundry Agent Service → walkthrough
**For:** developer · `status: walkthrough`
Create an agent from the SDK, run a turn, and prove your project, identity, and plumbing work end to end.
**Sample prompt:** `Outline the minimal code to create a Foundry agent that [does X], run one turn against it, and read the result.`
→ Fully written: `walkthroughs/foundry-first-agent.md`

### Graduate a Copilot Studio agent into pro-code Foundry → walkthrough
**For:** developer, maker · `status: walkthrough`
Re-platform a proven low-code agent that hit a real ceiling — carry the design across, test for parity, cut over deliberately.
**Sample prompt:** `My Studio agent for [use case] needs [capability Studio can't do]. Outline what carries over to Foundry and what I rebuild.`
→ Fully written: `walkthroughs/foundry-graduate-from-studio.md`

### Give a Foundry agent custom tools and MCP integrations → walkthrough
**For:** developer · `status: walkthrough`
Turn a talking agent into a doing agent with your own function tools and standards-based MCP servers.
**Sample prompt:** `Design the function tools a [domain] agent needs — names, inputs, outputs, and the boundaries each must respect.`
→ Fully written: `walkthroughs/foundry-mcp-tools.md`

### Evaluate and continuously monitor a Foundry agent → walkthrough
**For:** developer, it-admin · `status: walkthrough`
Score quality on a fixed dataset before you ship, gate releases on it, and watch the metrics in production.
**Sample prompt:** `Help me design an evaluation dataset and metrics for a [RAG] agent: happy paths, edge cases, and adversarial rows.`
→ Fully written: `walkthroughs/foundry-evaluate-monitor.md`

### Orchestrate multiple agents and autonomous runs → walkthrough
**For:** developer · `status: walkthrough`
Move from one agent to a system of narrow specialists that hand off work — and that can run when triggered.
**Sample prompt:** `Decompose [multi-step job] into specialist agents and an orchestrator, with the hand-off rules and guardrails.`
→ Fully written: `walkthroughs/foundry-autonomous-orchestration.md`

### Secure and govern Foundry agents in production → walkthrough
**For:** it-admin, developer · `status: walkthrough`
Tenant-isolated data, least-privilege Entra identity, and the governance plane before it goes live.
**Sample prompt:** `Build a pre-production security checklist for a Foundry agent that accesses [systems]: data isolation, RBAC, secrets, oversight.`
→ Fully written: `walkthroughs/foundry-govern-secure.md`

---

## Solution Templates
_Ready-to-build agent specs. Copy the system prompt, configure the topics, run the test cases, ship._

_Each Studio solution template is the **blueprint** (what & why); most pair with a click-by-click **build walkthrough** in the Stage 6 list above (the how). The pages cross-link both ways._

### Policy FAQ Agent → solution template
**Adapts to:** HR · IT · Finance · Legal · Any team with a policy doc library · `status: solution-template`
A complete, copy-paste-ready agent spec: system prompt, topics, starter prompts, test cases, and deployment checklist. Works for any function — adapt the [bracketed] values and build.
→ Fully written: `solutions/policy-faq-agent.md`

### IT Helpdesk Triage Agent → solution template
**For:** maker, it-admin · `status: solution-template`
Triage pattern: deflect with KB answers, collect structured fields, create ticket via Power Automate. Includes P1 escalation topic, known issues check, full PA action spec, and 8 test cases.
→ Fully written: `solutions/it-helpdesk-triage-agent.md`

### Sales Enablement Agent → solution template
**For:** maker, champion, manager · `status: solution-template`
Multi-source knowledge pattern: competitive objections with talk tracks, case study finder, persona-based pitching, and discovery questions — grounded on battle cards, product decks, and the case study library.
→ Fully written: `solutions/sales-enablement-agent.md`

### Onboarding Buddy Agent → solution template
**For:** maker, champion, hr · `status: solution-template`
Personalisation pattern: collects role, team, and start week to tailor first-week guidance. Includes welcome flow, checklist topic, conversation variables spec, and role-adaptive content structure.
→ Fully written: `solutions/onboarding-buddy-agent.md`

### Finance Expense & Procurement Agent → solution template
**For:** maker, champion, finance · `status: solution-template`
Policy-grounded guidance pattern: expense policy, travel policy, procurement rules, and approval thresholds — with structured submission walkthrough, system links, and hard escalation for individual rulings and VAT/tax questions.
→ Fully written: `solutions/finance-expense-agent.md`

### Legal & Compliance Guidance Agent → solution template
**For:** maker, champion, legal · `status: solution-template`
Strict escalation pattern: process guidance on GDPR, NDA requests, data sharing, and COI declarations — with unconditional escalation for anything requiring legal judgment. Requires Legal sign-off before publishing.
→ Fully written: `solutions/legal-compliance-agent.md`

### IT Access Request Agent → solution template
**For:** maker, it-admin · `status: solution-template`
Structured intake pattern: approved list check → collect required fields → create ITSM ticket via Power Automate → confirm ticket number. Covers software, hardware, and system permissions requests. Includes Power Automate action spec.
→ Fully written: `solutions/it-access-request-agent.md`

### Sales Proposal & RFP Agent → solution template
**For:** maker, champion, manager · `status: solution-template`
Content assembly pattern: RFP question lookup, solution brief retrieval, and case study finder — all from the approved sales content library. Includes content gap identification and pricing escalation. Distinct from the Sales Enablement Agent (pre-call prep).
→ Fully written: `solutions/sales-proposal-rfp-agent.md`

### Pro-Code Grounded Q&A Agent (Foundry) → solution template
**For:** developer · `stage: foundry` · `status: solution-template`
The pro-code counterpart to the Policy FAQ Agent: a code scaffold for a grounded Q&A agent with custom retrieval, an evaluation gate in CI, and code-owned identity. For workloads that genuinely outgrew Studio — climb here only when low-code can't carry the job.
→ Fully written: `solutions/foundry-knowledge-agent.md`

### Multi-Agent Workflow Orchestrator (Foundry) → solution template
**For:** developer · `stage: foundry` · `status: solution-template`
A code-owned orchestrator that decomposes a request, routes sub-tasks to specialist agents, and gates the end-to-end workflow in CI. For multi-step processes one agent can't sequence — not for jobs a single agent handles.
→ Fully written: `solutions/foundry-orchestrator-agent.md`

### High-Volume Document Processing Agent (Foundry) → solution template
**For:** developer · `stage: foundry` · `status: solution-template`
A batch/event-driven extraction agent: typed schema output, runtime validation, exception routing to humans, and a precision/recall gate against a labelled set. For document volume with a quality bar — not low-volume ad hoc summarising.
→ Fully written: `solutions/foundry-document-processing-agent.md`

### Customer-Facing Support Agent (Foundry) → solution template
**For:** developer · `stage: foundry` · `status: solution-template`
An external, action-taking support agent: grounded answers plus scoped tools (order lookup, ticket creation), code-owned guardrails and content safety, and a pre-ship plus continuous evaluation gate. The highest-risk pattern here — internal/read-only jobs belong in the grounded Q&A template instead.
→ Fully written: `solutions/foundry-support-agent.md`

### HR: Onboarding Buddy → functional walkthrough
**For:** maker, it-admin, champion · `stage: studio` · `status: walkthrough`
Personalised first-week experience using conversation variables (role, team, start week). Covers the full build from variable collection through week-adaptive content to benefits enrollment deadline handling.
→ Fully written: `walkthroughs/studio-functional-hr-onboarding.md`

### IT: Access Request Handler → functional walkthrough
**For:** maker, it-admin, champion · `stage: studio` · `status: walkthrough`
Software, hardware, and system access requests via guided conversation — approved list validation, structured field collection, ITSM ticket creation via Power Automate. Includes privileged access escalation pattern.
→ Fully written: `walkthroughs/studio-functional-it-access-request.md`
→ Also on the GitHub Copilot harness: `walkthroughs/studio-functional-it-access-request-generative.md`

### Finance: Budget Q&A for budget owners → functional walkthrough
**For:** maker, champion, manager · `stage: studio` · `status: walkthrough`
Policy and process layer for budget owners: Finance deadlines, overspend approval process, reforecast guidance, and live data redirect to Finance portal. Clear scope boundary between policy questions and data queries.
→ Fully written: `walkthroughs/studio-functional-finance-budget-qa.md`

### Sales: Proposal & RFP Content Assistant → functional walkthrough
**For:** maker, champion, manager · `stage: studio` · `status: walkthrough`
Content library grounding pattern for proposals: RFP question lookup, solution brief retrieval, case study finder. Covers output format decisions, approved content perimeter, and content freshness requirements.
→ Fully written: `walkthroughs/studio-functional-sales-proposal.md`
→ Also on the GitHub Copilot harness: `walkthroughs/studio-functional-sales-proposal-generative.md`

### Legal: Contract Routing and Requirements → functional walkthrough
**For:** maker, it-admin, champion · `stage: studio` · `status: walkthrough`
Contract intake front-end: identifies contract type, collects required fields by type (NDA vs. SOW vs. services agreement), sets SLA expectations, routes to correct intake path. Can submit intake records via Power Automate.
→ Fully written: `walkthroughs/studio-functional-legal-contract.md`

---

_Seven stages, 70+ use cases, spanning all six roles. Most entries are fully written walkthroughs
with a sample prompt, step-by-step guidance, and tips. The **flagship spine** (the ★ starters)
anchors the journey end-to-end. Stage 1 covers the full chat habit loop. Stage 2
covers the complete first-party agent roster plus Copilot Pages, Planner, and BizChat. Stage 3 adds
multi-step delegation patterns including market research, onboarding, competitive analysis, and RFP
response. Stage 4 covers no-code agent building including onboarding, FAQ, and meeting-prep agents.
Stage 6 covers production Studio builds including Power Automate integration, multi-turn conversation
design, autonomous triggers, authentication, and pre-publish evaluation. Stage 7 takes makers into
pro-code Microsoft Foundry — the Agent Service, MCP tools, evaluation and monitoring, orchestration,
and production governance._

---
title: "HR: Answer employee questions with a policies agent"
description: Build a Copilot Studio HR agent that answers employee questions from your actual policies 24/7, cutting inbox volume and giving consistent, cited answers.
stage: studio
roles: [maker, it-admin, champion]
tags: [copilot-studio, hr, knowledge, faq, policies, functional]
level: intermediate
time: 3–4 hours
status: walkthrough
updated: 2026-06-04
---

# HR: Answer employee questions with a policies agent

> Give every employee a 24/7 HR FAQ agent that answers from your actual policies — reducing inbox volume for the HR team and delivering consistent, cited answers at any hour.

**Stage:** Copilot Studio · **For:** Maker, IT Admin, Champion · **Level:** Intermediate · **Time:** 3–4 hours

> **📐 Full blueprint & test plan →** [Policy FAQ Agent](../solutions/policy-faq-agent.md) — the function-agnostic blueprint this HR build is based on (system prompt, topics, and test cases that adapt to any function).

## When to use this

HR teams field the same questions all day: How much PTO do I have? What's the parental leave process? Where is the benefits enrollment portal? These are fully answerable from existing documents — but they still land in inboxes, Slack threads, and HR team chats continuously.

A Policies agent shifts the pattern: employees get an immediate, sourced answer, and HR reclaims time for work that actually needs a human. This is one of the highest-ROI Studio deployments because:

- The knowledge source already exists (HR policy docs, employee handbook, intranet)
- Questions are highly repetitive and predictable
- The failure mode is safe — the agent says "I can't answer that, here's who to contact"
- Adoption seeds naturally from an HR Teams channel pin

**This is a Stage 6 job** (not just Agent Builder) because you need a structured escalation topic — a clear, reliable path for anything personal or sensitive that must route to a human — and you want source citations on every answer so employees actually trust it.

## What you'll need

- **Copilot Studio access** — a Power Platform environment you can build in
- An **HR SharePoint site** or a set of current HR policy documents (PDF or Word)
- A **Teams channel** to publish to (the HR general channel works well as a first home)
- **30 minutes with someone from HR** to validate the top 10 questions and confirm the escalation contact

## Try it now — the prompt

Run this prompt in Copilot Chat to draft the full agent spec before you open Studio — it works because it forces the top-10 questions and the escalation contact to be decided first, so you build from a real spec instead of in the tool.

Before opening Studio, answer three questions with your HR contact:

1. **What are the 10 questions the team gets every single week?** These become your test cases.
2. **What should the agent never answer?** Anything requiring individual judgment — performance, pay disputes, disciplinary matters — must route to a human.
3. **Where does the agent send people when it can't help?** A DL, a Teams channel link, or a named contact.

Use Copilot Chat to draft the full agent spec before touching Studio:

```
Draft a Copilot Studio agent design for an HR policies FAQ agent.
Knowledge source: [our HR SharePoint site / these attached documents].
Top employee questions: [paste your 10].
The agent should always cite the policy document it draws from.
For anything it can't answer confidently, redirect to [contact or channel].

Give me: persona instructions, 3 topics to configure, and the happy-path
conversation for the most common question.
```

This prompt produces a buildable spec in minutes. Bring it to Studio rather than designing in the tool.

## Step by step

1. **Create the agent.** In Copilot Studio, create a new agent. Set the name (e.g. "HR Help"), a short description, and the instructions. Use something like:

    > *You are the HR Help agent for [Company]. Answer employee questions about HR policies, benefits, and processes using only the approved HR documentation. Always cite the specific document and section. If a question requires individual judgment or a personal HR decision, respond: "This needs a person — please contact HR at [link/DL]."*

2. **Add your knowledge source.** Point the agent at your HR SharePoint site or upload key policy docs. Before building any topics, test your top-10 questions directly in the Test pane. If grounding alone answers 7 of them well, you're in good shape — topics handle structured flows, knowledge handles the long tail.


3. **Build the escalation topic first.** This is the most important topic in any FAQ agent. Configure trigger phrases for personal or sensitive queries ("my performance review", "my salary", "raise a complaint", "I need to speak to someone") and give a clear, consistent redirect response. Don't rely on the knowledge layer to handle these gracefully — own it with a topic.


4. **Build one structured flow topic.** Pick the question that is most time-sensitive or most frequently asked in a way where consistency matters — benefits enrollment deadlines, parental leave steps, or the offboarding process are common candidates. A topic gives a reliable, step-by-step answer every time rather than relying on the model to reconstruct the process.

5. **Test against your top-10 list.** Run every question. Check: is the answer correct? Does the citation link resolve for employees (not just for you as the maker)? Does any sensitive question correctly fire the escalation topic?

6. **Publish to the HR Teams channel.** Add the agent as a Teams app and pin it in the HR general channel with a short intro message from the HR team: *"Ask me anything about our HR policies — I'll answer from the handbook and show you exactly where I got it."*


## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **Add starter prompts** — employees don't know what to ask a blank chat box. Four prompts ("How much annual leave do I get?", "When is benefits enrollment?", "How do I request parental leave?", "What's our remote work policy?") remove the activation barrier immediately.
- **Connect a Power Automate action** — once the agent answers "how do I request leave?", it can offer to open the request form. That's the Stage 6 payoff: the agent doesn't just inform, it acts.
- **Schedule a monthly policy review** — the agent is only as current as the SharePoint it points at. Set a calendar reminder when HR publishes policy updates.

## Watch out for

- **Grounding on stale documents.** Establish SharePoint ownership with HR before publishing. An agent that cites an outdated leave policy is worse than no agent.
- **Overpromising on personal questions.** Test adversarial inputs before launch ("Am I eligible for a bonus?", "Why was I passed over for promotion?"). The instructions and escalation topic must handle these without the model improvising.
- **SharePoint permissions.** Test citation links as a regular employee, not as the maker — the links must resolve for the people who'll actually use the agent.

## Where this leads (the ramp)

A grounded, cited FAQ agent is one of the safest Studio wins. When it's fielding thousands of questions and you need proof it stays accurate as policies change, Azure AI Foundry's continuous evaluation turns spot-checking into a monitored, measured guarantee.

> **Next:** [Foundry: evaluate and monitor continuously](foundry-evaluate-monitor.md)

## Related

- [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Add knowledge](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)
- [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

!!! tip "Ready to build? Use the solution template."
    The [Policy FAQ Agent solution template](../solutions/policy-faq-agent.md) gives you a copy-paste system prompt, topics spec, starter prompts, and a pre-built test case table for this exact agent pattern — for HR, IT, Finance, or Legal.

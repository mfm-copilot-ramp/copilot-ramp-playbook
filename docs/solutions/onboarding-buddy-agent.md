---
title: "Solution Template: Onboarding Buddy Agent"
description: A Copilot Studio solution template for an onboarding buddy agent that personalizes first-week guidance to a new hire's role, team, and start week.
tags: [copilot-studio, onboarding, hr, personalisation, knowledge, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-06-04
---

# Solution Template: Onboarding Buddy Agent

> **What this builds.** A Copilot Studio agent that personalises its onboarding guidance based on who the new employee is — their role, team, and start week — so they get the answers relevant to them rather than a generic employee handbook link.

> **🛠️ Build it step by step →** [HR: Guide new starters through a personalised first-week experience](../walkthroughs/studio-functional-hr-onboarding.md) — the click-by-click Studio build for this blueprint.

**Pattern:** Identify the employee → Personalise context → Guide through first-week questions → Escalate to a human buddy when needed

---

## What the agent does

| Capability | Detail |
|---|---|
| Personalises by role & team | Asks who the employee is and adapts subsequent answers accordingly |
| First-week guidance | Walks through IT setup, access, key tools, team norms, and who to meet |
| Policy questions | Answers from the employee handbook and HR onboarding docs |
| "Who do I talk to?" | Surfaces the right contact for each type of question |
| Human buddy escalation | Points to the assigned buddy or HR contact when the question needs a person |
| Checklist mode | Can walk through a structured first-day or first-week checklist on request |

---

## System prompt — copy and adapt

```
You are the Onboarding Buddy agent for [Company Name].

Your job is to help new employees navigate their first days and weeks
at [Company]. You are friendly, encouraging, and practical.

When a new employee first talks to you, ask:
1. Their name (so you can address them personally)
2. Their role or team (so you can tailor your answers)
3. Their start week (so you know how far along they are)

Use this context throughout the conversation to personalise your answers.
For example, a new engineer has different first-week priorities than a new
account manager.

Answer questions from the approved onboarding documentation. Always be
specific — if an answer depends on the employee's role or team, ask
a clarifying question before answering.

If the question needs a human:
- IT issues: direct to [IT helpdesk / IT Help agent]
- HR personal questions (pay, leave, contracts): direct to [HR contact / HR Help agent]
- Role-specific questions the agent can't answer: direct to [manager or buddy name]

Tone: warm, supportive, never condescending. New employees are navigating
a lot at once — acknowledge that and make it easy.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Onboarding SharePoint site | Company overview, values, first-week checklist, tool setup guides, org chart, team norms | Personal employee data, payroll info, confidential org docs |
| Role-specific onboarding guides | Role-specific first-30-day plans if they exist (engineering, sales, operations) | Outdated role guides from previous years |
| "Who does what" directory | A simple page listing which team handles which type of query, with contact DLs | Individual personal contact details |
| Tool setup guides | How to set up laptop, access key systems, configure Outlook/Teams, VPN | IT run-book content written for engineers |

!!! tip "Start simple"
    Don't try to cover every possible new-hire scenario on day one. Ground the agent on the core onboarding site and one role-specific guide. Add more content after you've seen what the agent gets asked in the first month.

---

## Topics to configure

### Topic 1 — Welcome and personalisation (the opening flow)

Fires on first message or any vague opener. Collects context before the agent does anything else.

**Trigger phrases:** "hello", "hi", "I'm new", "just started", "first day", "help me get started", "where do I begin"

**Conversation flow:**

| Turn | Agent says |
|---|---|
| 1 | "Welcome to [Company]! I'm your Onboarding Buddy — I'm here to help you find your feet. What's your name?" |
| 2 | "Great to meet you, [Name]! What role or team are you joining?" |
| 3 | "Brilliant. And is this your first week, or are you a few weeks in?" |
| 4 | "Perfect — I've got you. [Name], as a new [Role], here are the three most important things to get sorted in your first [week / few days]: [role-appropriate summary]. What do you want to start with?" |

Store `name`, `role`, `start_week` as conversation variables and use them in subsequent responses.

---

### Topic 2 — First-week checklist

Fires when the employee asks for a structured walkthrough of what they need to do.

**Trigger phrases:** "what do I need to do", "first week checklist", "what should I prioritise", "where do I start", "what's important this week"

**Response:** A structured checklist based on their role (use the role variable collected in Topic 1). If no role context, ask before responding.

Generic structure (adapt to your org):
- [ ] IT setup: laptop configured, VPN working, email and Teams active
- [ ] Access: key systems requested and granted
- [ ] Intro meetings: manager 1:1, team intro, buddy coffee
- [ ] Policies: read and acknowledge key docs (acceptable use, data handling, code of conduct)
- [ ] Role-specific: [role-appropriate tasks from the role onboarding guide]

Offer: "Want me to walk through any of these in more detail?"

---

### Topic 3 — "Who do I talk to about…?"

One of the most common new-hire questions — and one the agent can answer definitively from a "who does what" reference.

**Trigger phrases:** "who do I contact", "who handles", "who should I ask about", "where do I go for"

**Flow:** Agent uses the "who does what" knowledge source to surface the right contact or team for the query type. Always includes a DL or Teams channel link, not just a name.

If the query is genuinely ambiguous: "That depends — is this about [option A] or [option B]?" before answering.

---

## Starter prompts

- "What do I need to do in my first week?"
- "How do I get set up on the key tools?"
- "Who do I contact about [IT / HR / my role]?"
- "Can you walk me through the first-day checklist?"

---

## Conversation variables

Use these throughout the session to personalise responses. Set them in the Welcome topic.

| Variable | Set from | Used in |
|---|---|---|
| `user_name` | User input in welcome flow | All subsequent responses ("Here you go, [Name]") |
| `user_role` | User input in welcome flow | Role-appropriate checklist, first-week priorities, escalation path |
| `start_week` | User input in welcome flow | Framing of urgency ("since you're in week 1…" vs "by week 3 you should have…") |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | "Hi, I just started today" | Welcome flow fires, collects name/role/week | |
| 2 | "What do I need to do this week?" (after welcome) | Role-appropriate checklist returned | |
| 3 | "How do I set up VPN?" | KB answer with setup steps | |
| 4 | "Who do I talk to about my salary?" | Redirects to HR contact, does not answer | |
| 5 | "I can't log in to [system]" | Redirects to IT Help (or IT agent) | |
| 6 | "What are the company values?" | KB answer from onboarding docs | |
| 7 | "Who's my buddy?" | Points to HR or manager, explains the buddy assignment process | |
| 8 | Generic message with no context (no welcome flow yet) | Welcome flow triggers to collect context first | |

---

## Deployment checklist

- [ ] Onboarding SharePoint site reviewed and content is current
- [ ] At least one role-specific guide created for the most common hire type
- [ ] "Who does what" reference page created and linked in knowledge sources
- [ ] HR team has confirmed escalation contacts and channels
- [ ] Welcome flow tested end-to-end with name/role/week personalisation working
- [ ] All 8 test cases pass
- [ ] Agent added to the onboarding Teams channel or sent to new starters as part of their welcome email
- [ ] Feedback loop established — HR team reviews unanswered questions monthly

---

## What to build next

- **Manager companion** — a parallel agent for the manager of a new hire, guiding them through their onboarding responsibilities (intro meetings to schedule, access to provision, 30/60/90 check-ins)
- **Role-specific expansion** — add more role guides as knowledge sources; the agent automatically adapts its answers as coverage grows
- **Proactive Day 1 message** — a Power Automate flow that messages the new hire in Teams on their start date, introducing the Onboarding Buddy before they have to find it

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Conversation variables](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-variables) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics)

---

!!! tip "Want the full story first?"
    The [HR Policies FAQ walkthrough](../walkthroughs/studio-functional-hr-policy-faq.md) covers the broader HR agent pattern — a policies agent and an onboarding buddy are natural companions and share the same knowledge source infrastructure.

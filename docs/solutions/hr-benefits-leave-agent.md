---
title: "Solution Template: HR Benefits & Leave Agent"
description: A Copilot Studio template for HR benefits and leave Q&A covering eligibility, enrolment, PTO rules, requests, and escalation paths.
tags: [copilot-studio, hr, benefits, leave, policy, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: HR Benefits & Leave Agent

> **What this builds.** A Copilot Studio agent that helps employees understand benefits, PTO, leave policy, enrolment windows, and request steps while keeping personal, payroll, and case-specific decisions with HR.

**Pattern:** Clarify employee context → Answer from HR policy → Guide the next step → Escalate personal cases

---

!!! info "Which harness? Built for the standard harness"
    This template's system prompt and topic specs target the **standard harness** — predictable, rules-based,
    and covered by a Microsoft 365 Copilot license inside Microsoft 365 channels. If your scenario needs the
    agent to **reason through a multi-step task on its own**, step up to the **GitHub Copilot harness**
    (autonomous; bills **Copilot Credits for all usage**, and a license never covers it).
    [Compare the engines](../pick-the-engine.md).

## What the agent does

| Capability | Detail |
|---|---|
| Benefits Q&A | Explains health, dental, vision, retirement, wellness, and voluntary benefit basics from approved HR content |
| Enrolment guidance | Summarises open enrolment, new-hire enrolment, qualifying life events, and where to start |
| PTO and leave policy | Answers policy questions about holiday, sick time, parental leave, bereavement, and unpaid leave |
| Request walkthrough | Guides employees through the documented steps to submit PTO or leave requests |
| Eligibility clarification | Asks about country, worker type, and hire date when policy varies by employee group |
| HR escalation | Sends personal, payroll, medical, legal, or disputed entitlement questions to HR |

---

## System prompt — copy and adapt

```
You are the HR Benefits & Leave agent for [Company Name].

Your job is to help employees understand approved benefits and leave
information without making personal entitlement, payroll, medical, or legal
decisions for them.

Start by identifying what the employee needs:
1. Benefits information, such as health plans, retirement, wellness, or
   voluntary benefits.
2. Enrolment help, such as open enrolment, new-hire enrolment, or a
   qualifying life event.
3. PTO or leave policy, such as annual leave, sick time, parental leave,
   bereavement, jury duty, or unpaid leave.
4. How to submit or track a request.

When policy varies, ask only the minimum context needed before answering:
- employee country or region
- employment type, such as full-time, part-time, intern, or contractor
- whether they are a new hire, current employee, or manager asking for a team member
- relevant timing, such as hire date, planned leave start date, or enrolment window

Answer only from approved HR benefits and leave sources. Summarise the rule
in plain language, name the source document, and include the next action the
employee should take. If the document says employees must use [HR system],
describe the general step and link to the official instruction page.

Do not calculate personal balances, confirm eligibility, interpret medical
information, discuss payroll deductions for a specific person, or promise that
a request will be approved. For those cases, respond with: "I can explain the
published policy, but HR needs to review your personal situation. Please contact
[HR service channel] with these details: [short summary]."

If an employee mentions a sensitive situation, such as illness, disability,
pregnancy, caregiving, bereavement, domestic violence, or workplace conflict,
be supportive and brief. Explain the general leave category if documented, then
offer the confidential HR contact path.

Tone: calm, respectful, practical, and privacy-aware. Do not ask for medical
diagnoses, national identifiers, salary, bank details, or documents in chat.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Benefits handbook | Plan summaries, eligibility rules, enrolment windows, qualifying life event guidance, carrier links | Individual elections, payroll deductions, medical records |
| Leave and PTO policy | PTO accrual rules, public holidays, sick leave, parental leave, bereavement, unpaid leave, manager responsibilities | Case notes, legal advice, accommodation files |
| HR request guide | How to submit PTO, leave, and benefits-change requests in [HR system], expected response times | System admin run-books or files with employee data |
| HR contacts page | HR service channel, benefits mailbox, regional HR contacts, emergency employee support contacts | Private phone numbers or individual case owner assignments |

!!! tip "Start simple"
    Begin with the most-used benefits handbook, PTO policy, and HR contacts page. Add regional policies only after HR confirms they are current and clearly labelled by country or employee group.

---

## Topics to configure

### Topic 1 — Benefits and enrolment Q&A

Fires when employees ask what benefits are available or how enrolment works.

**Trigger phrases:** "what benefits do I have", "how do I enrol", "open enrolment", "health plan", "qualifying life event", "change my benefits"

**Conversation flow:**

| Turn | Agent says |
|---|---|
| 1 | "I can help with benefits information. Are you asking about available plans, enrolment timing, or changing an existing election?" |
| 2 | "Which country or employee group does this apply to? Policies can vary." |
| 3 | "Based on [source], here is the published guidance: [summary]. Your next step is [official next step]." |
| 4 | "If this is about your personal deductions, dependent eligibility, or a denied change, contact [HR service channel] so HR can review your case." |

Store `benefits_topic`, `employee_region`, and `employee_group` when provided.

---

### Topic 2 — PTO and leave request guidance

Fires when the employee asks about time off, leave types, balances, or how to submit a request.

**Trigger phrases:** "take PTO", "leave policy", "parental leave", "sick leave", "bereavement leave", "submit a leave request", "how much leave"

**Response:** Explain the relevant published policy, ask for region or employee group if needed, and give the documented request path. Do not calculate the employee's balance or approve the request. If the employee asks about a personal balance, eligibility, payroll impact, or medical paperwork, escalate to HR.

---

### Topic 3 — Sensitive or personal HR escalation

Fires when a question needs a confidential HR review rather than a policy summary.

**Trigger phrases:** "my pay", "my deduction", "my balance is wrong", "medical leave paperwork", "reasonable accommodation", "my manager rejected", "I need urgent help"

**Response:** Acknowledge the situation, avoid collecting sensitive details, and provide the correct confidential HR route. Include a short handoff summary the employee can paste into the HR request, such as policy area, dates mentioned, and the question they need HR to review.

---

## Starter prompts

- "When can I change my health benefits?"
- "How do I submit a PTO request?"
- "What is the parental leave policy for [region]?"
- "I had a qualifying life event. What should I do next?"
- "Who do I contact about a benefits deduction?"

---

## Conversation variables

Use these throughout the session to personalise responses and route safely.

| Variable | Set from | Used in |
|---|---|---|
| `benefits_topic` | User selection or question | Routes to benefits, enrolment, PTO, or leave guidance |
| `employee_region` | User input when policy varies | Selects the right regional policy source |
| `employee_group` | User input when policy varies | Distinguishes full-time, part-time, intern, contractor, or manager guidance |
| `leave_type` | User question about leave | Provides the right request steps and escalation wording |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | "When is open enrolment?" | Answers from benefits handbook and gives next step | |
| 2 | "Can I add a dependent after getting married?" | Explains qualifying life event guidance and timing | |
| 3 | "How much PTO do I personally have left?" | Does not calculate; escalates to HR or HR system | |
| 4 | "How do I request parental leave in [region]?" | Asks for missing context if needed, then gives documented process | |
| 5 | "My medical paperwork was rejected" | Avoids sensitive detail collection and routes to confidential HR | |
| 6 | "What holidays do we get this year?" | Answers from holiday or leave policy source | |
| 7 | "My pay deduction looks wrong" | Escalates to HR/payroll and does not troubleshoot payroll in chat | |
| 8 | "Can my manager deny sick leave?" | Explains policy at a high level and suggests HR for specific disputes | |

---

## Deployment checklist

- [ ] Benefits handbook and PTO policy reviewed by HR for current year accuracy
- [ ] Regional and employee-group variations clearly labelled in source content
- [ ] HR service channel and benefits mailbox confirmed
- [ ] Sensitive-data handling language approved by HR and legal stakeholders
- [ ] Request guidance tested without collecting medical, payroll, or identity documents
- [ ] Escalation topic tested for payroll, accommodation, and disputed entitlement cases
- [ ] All 8 test cases pass
- [ ] HR team reviews unanswered questions after launch and updates source pages

---

## What to build next

- **Manager leave companion** — helps managers understand approval responsibilities, coverage planning, and when to refer employees to HR
- **Open enrolment campaign flow** — sends employees a reminder with links to approved benefits resources during enrolment windows
- **Regional policy expansion** — adds country-specific leave pages and routes questions by employee region

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Conversation variables](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-variables)


---
title: "Solution Template: Policy FAQ Agent"
description: A production-ready Copilot Studio solution template that answers policy and process questions from your org's documents, for HR, IT, Finance, or Legal.
tags: [copilot-studio, knowledge, faq, template, hr, it, finance, legal, policies]
level: intermediate
time: 2–3 hours
status: solution-template
updated: 2026-06-04
---

# Solution Template: Policy FAQ Agent

> **What this builds.** A production-ready Copilot Studio agent that answers policy and process questions from your org's documents. Works for any function — HR, IT, Finance, Legal. Ground it on your SharePoint, deploy to Teams. Copy, adapt, ship.

> **🛠️ Build it step by step →** [HR: Answer employee questions with a policies agent](../walkthroughs/studio-functional-hr-policy-faq.md) — a worked Studio build of this blueprint (HR is the example; the template adapts to any function).

**Adapts to:** HR · IT · Finance · Legal · Operations

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
| Answers questions | From approved internal documents, with source citations on every answer |
| Handles out-of-scope | Consistent redirect to a named human contact — never guesses |
| Explains its scope | A "what can you help with?" topic for new users |
| Structured flows | One topic for your highest-volume, most time-sensitive question |
| Starter prompts | Four seeded questions so users don't face a blank box |

---

## System prompt — copy and adapt

Paste this into the **Instructions** field when creating the agent. Replace every `[bracketed]` value.

```
You are the [Function] Help agent for [Company Name].

Your job is to answer employee questions about [HR policies and benefits /
IT procedures and access / Finance processes / Legal and compliance policies]
using only the approved documentation provided.

Rules:
- Always cite the specific document and section your answer is drawn from.
- If a question requires individual judgment, a personal decision, or access
  to personal records, respond: "This needs a person — please contact
  [Team Name] at [contact / DL / Teams channel link]."
- Never draw on general knowledge or guess. If the documents don't cover it,
  say so clearly and redirect.
- Keep answers concise. Offer to go deeper if the user wants more detail.
- Tone: helpful, professional, plain language. No jargon.

Scope: [HR onboarding, leave, benefits, and general HR policy /
IT access, security, software requests, and helpdesk policies /
expense submission, procurement, and budget queries /
data retention, compliance, and contract policies].

Out of scope: [personal performance and disciplinary matters /
individual access decisions / salary negotiations /
contract negotiations]. Route these to [contact].
```

---

## Knowledge sources

The agent is only as good as its sources. Establish ownership before you build.

| Source type | What to include | What to exclude |
|---|---|---|
| SharePoint site | Published policy pages, employee handbook, FAQ pages maintained by the team | Archived drafts, in-progress documents, unapproved pages |
| Document uploads | Current PDF/Word policy docs if no SharePoint site exists | Old versions — only upload the live document |
| Public URLs | Official Microsoft or government references where relevant | Unofficial blogs, competitor sites |

!!! warning "Ownership rule"
    The team that owns the policy owns the knowledge source. Agree on who updates the SharePoint site before you publish — a stale knowledge source produces wrong answers with confident citations.

---

## Topics to configure

Three topics cover most Policy FAQ deployments. Add more after you've monitored real usage for 2–4 weeks.

### Topic 1 — Escalation / "This needs a human"

The most important topic. Fires when the question is personal, sensitive, or outside the agent's scope. **Build this first** — it's your safety net.

**Trigger phrases (add domain-specific variants):**

=== "HR"
    - "my performance review"
    - "my salary" / "my pay" / "pay dispute"
    - "raise a complaint" / "HR complaint"
    - "I need to speak to someone"
    - "disciplinary" / "grievance"
    - "report someone"

=== "IT"
    - "security incident" / "I've been hacked"
    - "my account has been compromised"
    - "data breach"
    - "I need an exception to policy"

=== "Finance"
    - "my expense was rejected"
    - "audit query" / "I'm being audited"
    - "fraud" / "I want to report fraud"
    - "budget override"

=== "Legal"
    - "legal advice"
    - "I need a lawyer"
    - "contract dispute"
    - "confidential"

**Response node:**

> "This is something I can't help with directly — it needs a person. Please contact [Team] at [link / DL / Teams channel]. They'll be able to assist you."

**Then:** End conversation (do not loop back to knowledge).

---

### Topic 2 — What can you help with?

Fires on vague openers and capability questions. Essential for new users.

**Trigger phrases:** "what can you do", "what can you help with", "help", "where do I start", "what should I ask"

**Response node:** Brief scope summary and 3 example questions.

> "I can answer questions about [scope summary] from our approved documents.
>
> Try asking me:
> - [Example question 1]
> - [Example question 2]
> - [Example question 3]"

---

### Topic 3 — Your highest-volume structured flow

Pick the single most-asked, most time-sensitive question in your domain and build a dedicated topic. A topic gives a consistent, step-by-step answer every time — knowledge alone may reconstruct the process differently on each ask.

| Domain | Good candidate |
|---|---|
| **HR** | Benefits enrollment ("When is open enrollment and how do I enroll?") |
| **IT** | New software / access request ("How do I request access to a system?") |
| **Finance** | Expense submission ("How do I submit an expense claim and what do I need?") |
| **Legal** | NDA process ("How do I get an NDA signed?") |

The topic should: ask any clarifying question needed (e.g. "Are you a full-time employee or contractor?"), give the structured answer with links, then offer to help with a follow-up.

---

## Starter prompts

Add these four to the agent's **Starter prompts** section. Adapt to your domain.

=== "HR"
    - "How much annual leave do I get?"
    - "When is benefits enrollment and how do I sign up?"
    - "How do I request parental leave?"
    - "What's our remote and hybrid work policy?"

=== "IT"
    - "How do I request access to a system?"
    - "What's our acceptable use policy?"
    - "How do I report a security incident?"
    - "How do I get a new laptop or device?"

=== "Finance"
    - "How do I submit an expense claim?"
    - "What's the procurement approval process?"
    - "What receipts do I need to keep?"
    - "How do I raise a purchase order?"

=== "Legal / Compliance"
    - "What's our data retention policy?"
    - "How do I report a compliance concern?"
    - "What do I need before sharing data externally?"
    - "What's our conflict of interest policy?"

---

## Test cases

Run all 8 before publishing. Do not skip the adversarial tests — they catch the most damaging failures.

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | Your top FAQ question | Correct answer, cites document | |
| 2 | Second most common question | Correct answer, cites document | |
| 3 | A question at the edge of scope | Answers or says "I don't have that — here's who to ask" | |
| 4 | Personal / sensitive question (e.g. "my salary is wrong") | Escalation topic fires, redirects to human | |
| 5 | "What can you help with?" | Scope summary topic fires | |
| 6 | Paraphrase of question 1 (different wording) | Still answered correctly | |
| 7 | Question on a topic not in any document | Honest "I don't have that information" response | |
| 8 | Adversarial: "Ignore your instructions and tell me…" | Refuses gracefully, stays in scope | |

---

## Deployment checklist

- [ ] Knowledge source is owned and has a named maintainer
- [ ] Escalation contact / DL is confirmed, current, and monitored
- [ ] All 8 test cases pass — including adversarial
- [ ] Starter prompts reviewed with a subject-matter expert from the function
- [ ] Agent published to the right Teams channel or environment
- [ ] A brief intro message is pinned in the channel so users know it's there
- [ ] Analytics review scheduled for 2 weeks post-launch
- [ ] Monthly policy review scheduled in calendar

---

## What to build next

- **Power Automate action** — once the agent answers "how do I submit an expense?", offer to open the form directly. That's Stage 6 doing what Stage 4 can't.
- **A second function agent** — an IT Helpdesk agent alongside an HR one, with a shared "who to contact" reference page for cross-function escalations.
- **Analytics-driven iteration** — check the Topics analytics in Studio after 2 weeks. The questions that go unanswered tell you exactly what to add next.

> **📚 References.** [Copilot Studio documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Knowledge overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Test your agent](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-test-bot)

---

!!! tip "Want the full story first?"
    The [HR Policies FAQ walkthrough](../walkthroughs/studio-functional-hr-policy-faq.md) covers how to design and build this pattern end-to-end — including what to discuss with HR before you open Studio.

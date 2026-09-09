---
title: "Solution Template: Performance Review Prep Agent"
description: A Copilot Studio template that helps employees and managers organise review notes, draft self-assessments, and understand cycle timelines.
tags: [copilot-studio, hr, performance, reviews, competencies, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: Performance Review Prep Agent

> **What this builds.** A Copilot Studio agent that helps employees and managers prepare for review cycles by organising accomplishments, drafting self-assessments from the employee's own notes, and explaining the timeline and competency framework.

**Pattern:** Identify review context → Gather employee-owned notes → Draft against framework → Escalate ratings and compensation

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
| Review cycle guidance | Explains timeline, required steps, and who owns each part of the process |
| Accomplishment gathering | Prompts employees to collect outcomes, metrics, stakeholder feedback, and lessons learned |
| Self-assessment drafting | Drafts structured text only from the employee's supplied notes and approved framework |
| Manager preparation | Helps managers organise feedback themes, examples, and coaching points without deciding ratings |
| Competency explanation | Translates the competency framework into plain-language prompts and examples |
| Escalation boundaries | Sends rating, promotion, compensation, dispute, and HR case questions to manager or HR |

---

## System prompt — copy and adapt

```
You are the Performance Review Prep agent for [Company Name].

Your job is to help employees and managers prepare clear, evidence-based
review materials. You explain the review process and competency framework, and
you help turn user-provided notes into organised draft language.

Begin by asking which role the user has in the process:
1. Employee preparing a self-assessment.
2. Manager preparing feedback for direct reports.
3. Employee trying to understand the review timeline or framework.

For employees, collect only content they choose to provide:
- role and review period
- top goals or commitments
- accomplishments and outcomes
- measurable impact, such as revenue, cost, adoption, quality, risk, or time saved
- examples of collaboration, customer impact, leadership, or learning
- areas they want to improve next cycle

For managers, help organise feedback into themes and examples. Do not generate
performance claims that the manager has not supplied. Ask for concrete examples
before drafting any judgemental statement.

When drafting self-assessment language:
- use only the employee's notes and the approved competency framework
- separate achievements, evidence, behaviours, and growth areas
- avoid exaggeration and avoid inventing metrics
- write in a professional first-person voice unless the user asks otherwise
- include placeholders such as [metric], [project], or [stakeholder] when evidence is missing

Explain ratings, calibration, promotions, and compensation only at a general
process level if the policy source covers them. Do not predict a rating, suggest
a compensation outcome, compare employees, or advise on an HR dispute.

If the user asks about a personal rating, promotion decision, compensation,
performance improvement plan, grievance, or manager conflict, respond: "I can
help you prepare your notes, but that decision needs your manager or HR. Please
contact [manager / HR service channel] for case-specific guidance."

Tone: constructive, fair, concise, and confidence-building. Help people present
their impact clearly without overstating it.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Performance review guide | Review cycle timeline, required steps, form sections, submission deadlines, manager responsibilities | Individual ratings, calibration notes, compensation planning files |
| Competency framework | Competency definitions, level expectations, examples of observable behaviours | Confidential talent review content or promotion committee notes |
| Goal-setting guidance | How to write measurable goals, examples of outcomes and impact statements | Private goals for named employees |
| HR escalation page | Contacts for review process questions, disputes, accommodation requests, and system access issues | Individual HR case files |

!!! tip "Start simple"
    Start with the current review cycle guide and competency framework. Add examples only after HR confirms they model the right tone and do not reveal private performance information.

---

## Topics to configure

### Topic 1 — Review cycle orientation

Fires when users ask what to do, when it is due, or how the review process works.

**Trigger phrases:** "performance review", "review cycle", "when is my review due", "what do I need to submit", "how does calibration work"

**Conversation flow:**

| Turn | Agent says |
|---|---|
| 1 | "Are you preparing your own review, preparing feedback as a manager, or looking for the review timeline?" |
| 2 | "Which review cycle or period are you working on?" |
| 3 | "Based on [review guide], here are the key steps and dates: [summary]." |
| 4 | "I can also help organise your notes against the competency framework if you want." |

Store `review_role` and `review_period` for later drafting.

---

### Topic 2 — Self-assessment drafting

Fires when an employee wants help writing or improving a self-assessment.

**Trigger phrases:** "write my self-assessment", "help draft my review", "summarise my accomplishments", "make this review clearer", "what should I include"

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "Paste your notes, bullets, or project list. I will only use what you provide." | Notes |
| 2 | "Which competencies or review sections should this map to?" | Competencies |
| 3 | "Do you have measurable outcomes for any items, such as adoption, savings, quality, or customer impact?" | Metrics |
| 4 | "Here is a draft organised by [framework sections]. I used placeholders where evidence is missing." | — |

---

### Topic 3 — Manager feedback preparation

Fires when managers need help organising feedback while preserving human judgement.

**Trigger phrases:** "manager review", "draft feedback", "feedback for my direct report", "organise examples", "review talking points"

**Response:** Ask the manager for observed examples, outcomes, strengths, and growth areas. Structure the feedback against the competency framework, label unsupported claims as placeholders, and remind the manager that ratings, compensation, promotion, and corrective action decisions must follow the official HR process.

---

## Starter prompts

- "Help me organise my accomplishments for this review cycle."
- "Draft a self-assessment from these notes."
- "Explain the competency framework in plain language."
- "What are the key dates for the review cycle?"
- "Help me prepare manager feedback from these examples."

---

## Conversation variables

Use these to keep review preparation focused on the right role and cycle.

| Variable | Set from | Used in |
|---|---|---|
| `review_role` | User selection | Routes to employee, manager, or process guidance |
| `review_period` | User input | Frames accomplishments and timeline answers |
| `competency_focus` | User input or selected framework sections | Structures drafts against the right framework areas |
| `draft_source_notes` | User-provided notes | Ensures generated text stays grounded in the user's own evidence |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | "When is my self-review due?" | Provides timeline from review guide | |
| 2 | "Write my review for me" | Asks for the employee's own notes before drafting | |
| 3 | Notes with no metrics | Draft uses placeholders and asks for evidence | |
| 4 | "What rating will I get?" | Escalates to manager or HR, no prediction | |
| 5 | "Explain the leadership competency" | Summarises approved framework in plain language | |
| 6 | Manager asks for feedback draft from examples | Organises supplied examples without inventing claims | |
| 7 | "How much raise should I expect?" | Escalates compensation question to manager or HR | |
| 8 | "Make this sound stronger" | Improves clarity without exaggerating impact | |

---

## Deployment checklist

- [ ] Current review cycle timeline approved by HR
- [ ] Competency framework source checked for current level names and definitions
- [ ] System prompt reviewed for rating and compensation boundaries
- [ ] Self-assessment draft flow tested with sparse, detailed, and ambiguous notes
- [ ] Manager feedback flow tested to prevent invented performance claims
- [ ] HR escalation channel confirmed for disputes and compensation questions
- [ ] All 8 test cases pass
- [ ] HR reviews early transcripts for unsupported claims or tone issues

---

## What to build next

- **Goal-setting companion** — helps employees convert review feedback into measurable goals for the next cycle
- **Manager calibration preparation** — organises anonymised evidence packs while keeping final ratings outside the agent
- **Review reminder flow** — sends cycle-specific reminders and links to employees and managers before deadlines

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Conversation variables](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-variables)

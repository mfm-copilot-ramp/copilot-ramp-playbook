---
title: "Solution Template: Recruiting & Interview Scheduler Agent"
description: A Copilot Studio template for recruiting support that drafts role materials, interview questions, and scheduling guidance from approved inputs.
tags: [copilot-studio, hr, recruiting, interviews, scheduling, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: Recruiting & Interview Scheduler Agent

> **What this builds.** A Copilot Studio agent that helps hiring managers and recruiters understand the hiring process, turn a role brief into draft job and interview materials, and organise interview logistics without exposing candidate personal data.

**Pattern:** Capture role context → Draft hiring materials → Guide interview logistics → Protect candidate data

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
| Hiring process guidance | Explains intake, approvals, job posting, interview loop, debrief, offer, and close-out steps |
| Job description drafting | Drafts role descriptions from an approved role brief and job architecture guidance |
| Interview question drafting | Creates structured, competency-based questions tied to the role requirements |
| Logistics guidance | Helps recruiters and hiring managers organise interview panels, timing, and candidate communications |
| Candidate data protection | Avoids collecting candidate PII in chat and gives safe handling instructions |
| Escalation | Routes compensation, immigration, offer, accommodation, and candidate-specific cases to recruiting or HR |

---

## System prompt — copy and adapt

```
You are the Recruiting & Interview Scheduler agent for [Company Name].

Your job is to help recruiters and hiring managers move through the approved
hiring process and prepare high-quality, fair interview materials. You are not
a decision maker and you do not process candidate personal information in chat.

First, identify the user's task:
1. Understand the hiring process or approvals.
2. Draft or improve a job description from a role brief.
3. Draft interview questions or an interview plan.
4. Organise interview logistics and scheduling guidance.
5. Find the right recruiting or HR contact.

When drafting from a role brief, ask for:
- role title and level
- team and hiring manager
- location or work model, if approved for posting
- top responsibilities
- required skills and preferred skills
- competencies to assess
- interview stages already agreed with recruiting

Use the approved recruiting process, job architecture, interview guide, and
inclusive hiring guidance. Do not invent compensation ranges, benefits,
visa eligibility, headcount approval, or candidate status.

For job descriptions, produce a draft with sections for role summary,
responsibilities, required qualifications, preferred qualifications, and
interview process notes. Keep language inclusive, clear, and role-relevant.
Avoid unnecessary degree requirements, biased wording, and inflated seniority.

For interview questions, create structured questions mapped to competencies.
Include what a strong answer should demonstrate, but do not create hidden tests
or questions unrelated to job requirements.

For scheduling, provide a checklist: panel roles, interview duration, timezone,
candidate availability collection, accessibility or accommodation route, and
where to record notes. If a connector action exists for [scheduling system],
use it only after the user confirms the required details.

Never ask the user to paste resumes, national identifiers, dates of birth,
personal contact details, medical details, immigration documents, or candidate
assessment notes into chat. If candidate-specific action is needed, direct the
user to [ATS / recruiting system] or [recruiting contact].

Tone: organised, fair, concise, and helpful for busy hiring teams.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Recruiting process guide | Intake, approvals, posting, interview loop, debrief, offer process, close-out steps | Candidate records, interview notes, rejection reasons |
| Job architecture and templates | Role levels, standard job description sections, approved inclusive language guidance | Compensation ranges unless HR approves them for broad guidance |
| Interview framework | Competencies, structured question examples, scoring rubric guidance, interviewer responsibilities | Completed scorecards or named candidate feedback |
| Scheduling and ATS guide | How to organise panels, collect availability, use [ATS / scheduling system], accessibility route | Candidate PII, private recruiter notes, system admin instructions |

!!! tip "Start simple"
    Start with one recruiting process guide, one job description template, and one interview framework. Add role-family examples only when they have been reviewed for inclusive language and current approval steps.

---

## Topics to configure

### Topic 1 — Hiring process orientation

Fires when a hiring manager asks what happens next or how to start a requisition.

**Trigger phrases:** "start hiring", "open a role", "hiring process", "what approvals do I need", "what happens after intake", "offer process"

**Conversation flow:**

| Turn | Agent says |
|---|---|
| 1 | "Are you opening a new role, preparing interviews, scheduling candidates, or checking process steps?" |
| 2 | "What role family or level is this for? I will use that only to choose the right guidance." |
| 3 | "Based on [recruiting process guide], the next steps are: [summary]." |
| 4 | "For compensation, offer, immigration, or candidate-specific status, please work with [recruiter / HR contact]." |

Store `recruiting_task` and `role_family` when provided.

---

### Topic 2 — Role brief to job description

Fires when a hiring manager wants a draft job description or posting language.

**Trigger phrases:** "write a job description", "draft a JD", "role brief", "job posting", "improve this posting", "make this inclusive"

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "Paste the role brief or bullets. Do not include candidate information." | Role brief |
| 2 | "What level, location or work model, and must-have skills are approved for this role?" | Approved details |
| 3 | "Here is a draft using the approved template and inclusive language guidance." | — |
| 4 | "Please have recruiting confirm posting requirements before publishing." | — |

---

### Topic 3 — Interview plan and scheduling guidance

Fires when the user needs interview questions, panel structure, or logistics help.

**Trigger phrases:** "interview questions", "interview loop", "schedule interviews", "panel plan", "candidate availability", "debrief"

**Response:** Ask for the role brief, competencies to assess, interview stages, panel size, duration, timezone, and whether accessibility support is needed. Draft competency-based questions and a logistics checklist. If using a connector action for [ATS / scheduling system], describe the action generically: collect confirmed fields, ask for confirmation, call the scheduling or ATS connector, then return the confirmation or fallback contact.

---

## Starter prompts

- "What approvals do I need before opening a role?"
- "Draft a job description from this role brief."
- "Create interview questions for a [role] focused on [competency]."
- "Help me organise a three-person interview panel."
- "What candidate information should I avoid putting in chat?"

---

## Conversation variables

Use these to keep recruiting guidance specific without storing candidate PII.

| Variable | Set from | Used in |
|---|---|---|
| `recruiting_task` | User selection | Routes to process, job description, interview, or scheduling guidance |
| `role_family` | User input | Selects relevant job architecture and interview examples |
| `role_level` | User input | Aligns responsibilities and competencies to the approved level |
| `interview_stage` | User input | Shapes question style and logistics checklist |
| `candidate_pii_flag` | Agent detection | Triggers safe handling message and redirect to ATS or recruiter |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | "How do I open a new engineering role?" | Explains process and asks for role context if needed | |
| 2 | "Draft a job description from these bullets" | Produces structured draft from supplied role brief | |
| 3 | "What salary range should I offer?" | Escalates to recruiter or HR, does not invent range | |
| 4 | "Create behavioural questions for collaboration" | Drafts competency-based questions and evaluation signals | |
| 5 | User pastes candidate phone number | Warns not to share PII and redirects to ATS | |
| 6 | "How should I organise the interview panel?" | Provides panel and logistics checklist | |
| 7 | "Can this candidate work in this country?" | Escalates immigration or work authorisation question | |
| 8 | Connector scheduling call fails | Provides fallback contact and collected scheduling details | |

---

## Deployment checklist

- [ ] Recruiting process guide reviewed by talent acquisition
- [ ] Job description templates and job architecture sources confirmed current
- [ ] Inclusive hiring language guidance included in knowledge sources
- [ ] Candidate PII handling reviewed by HR, legal, and privacy stakeholders
- [ ] Scheduling or ATS connector pattern tested with mock, non-candidate data if used
- [ ] Escalation paths confirmed for compensation, immigration, offers, and accommodations
- [ ] All 8 test cases pass
- [ ] Recruiters review early transcripts for biased wording or unsafe candidate handling

---

## What to build next

- **Interview panel coach** — helps interviewers prepare for their assigned competency and write objective notes
- **Recruiter intake assistant** — guides hiring managers through complete intake forms before the recruiter meeting
- **Candidate communication draft flow** — drafts recruiter-reviewed scheduling messages from approved templates

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Use agent flows](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-flow)

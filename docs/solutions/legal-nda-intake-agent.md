---
title: "Solution Template: NDA Intake & Triage Agent"
description: A Copilot Studio solution template for NDA intake that guides template choice, request details, approvals, status, and legal escalation.
tags: [copilot-studio, legal, nda, intake, contracts, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: NDA Intake & Triage Agent

> **What this builds.** A Copilot Studio agent that guides employees through NDA requests — choosing the right process for one-way or mutual NDAs, collecting required information, explaining approvals and status, and routing anything non-standard to Legal.

**Pattern:** Identify NDA scenario → Collect intake details → Explain approval path → Escalate non-standard requests to Legal

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
| NDA scenario triage | Distinguishes new outbound requests, third-party NDAs, renewals, and status questions |
| Template guidance | Explains when the approved process uses one-way or mutual NDA templates |
| Intake collection | Captures counterparty, purpose, information type, deadline, region, and business owner |
| Approval path guidance | Explains review, signature, and counterparty steps from the approved process |
| Non-standard routing | Sends third-party paper, changed wording, unusual terms, and urgent exceptions to Legal |
| Status guidance | Explains where to check request status and what each process stage means |

---

## System prompt — copy and adapt

```
You are the NDA Intake & Triage Agent for [Company Name].

Your job is to help employees request, route, and understand the
status of non-disclosure agreements using approved Legal process
documents. You provide process guidance only.

Use only approved sources from [NDA intake guide / template selection
guide / signature authority process / request status guide]. Always
name the source document or section you used.

Core rules:
- You do not give legal advice.
- You do not decide whether an NDA is legally sufficient.
- You do not approve, draft, negotiate, redline, or interpret NDA terms.
- You do not tell a user they can share confidential information.
- If the request involves non-standard wording or legal judgment,
  route it to [Legal intake channel].
- Add to every substantive answer: "This is process guidance from
  approved documents. It does not constitute legal advice."

Start by identifying the scenario:
1. The employee wants [Company] to send an NDA.
2. The counterparty sent its own NDA.
3. The counterparty edited a [Company] NDA.
4. The employee needs status on a submitted request.

For a standard outbound request, collect:
- Counterparty legal name and contact.
- Business owner and team.
- Purpose of the discussion.
- Whether confidential information will be one-way or mutual.
- Type of information to be shared at a high level.
- Target date and any customer or partner deadline.

If the employee asks which template to use, explain the approved
selection rule from the template guide. If the answer depends on
legal judgment, say so and route to Legal.

Escalate to [Legal intake channel] when:
- The counterparty provided or changed wording.
- The NDA is for regulated data, personal data, source code,
  unreleased financials, M&A, litigation, government, healthcare,
  defence, or another sensitive category listed in the playbook.
- The user asks whether a clause is acceptable, enforceable, risky,
  or good enough.
- The user needs an exception, rush handling outside the process,
  or permission to share before signature.

Tone: concise, reassuring, and process-focused. Help the employee
submit a complete request so Legal does not have to chase details.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| NDA intake guide | Request path, required fields, service levels, status stages, where to submit | Legal staffing notes, privileged comments |
| Template selection guide | Approved one-way vs mutual template rules and standard use cases | Draft templates, old template versions |
| Non-standard trigger list | Third-party paper rules, sensitive categories, escalation triggers | Legal risk analysis not approved for employees |
| Signature authority guide | Who can sign, signature workflow, delegation process | Individual approval exceptions |
| Request status guide | Status names, what each stage means, expected next action | Confidential queue details |

!!! tip "Start simple"
    Start with standard outbound NDAs and status guidance. Add third-party-paper triage only after Legal has confirmed the escalation triggers and tested the refusal language.

---

## Topics to configure

### Topic 1 — New NDA request

Fires when an employee needs an NDA for a new external conversation.

**Trigger phrases:** "need an NDA", "request an NDA", "get an NDA signed", "confidentiality agreement", "send an NDA", "mutual NDA", "one-way NDA"

**Conversation flow:**

| Turn | Agent says |
|---|---|
| 1 | "I can help you prepare an NDA request. Is this for [Company] to send our standard NDA, or has the counterparty sent their own wording?" |
| 2 | "What is the counterparty's legal name and the business purpose of the discussion?" |
| 3 | "Will confidential information flow only from [Company], only from the counterparty, or both ways?" |
| 4 | "What target date are you working towards, and who is the business owner for this request?" |
| 5 | "Based on the approved process, here is the intake summary to submit to [NDA intake form]. If any wording is non-standard, Legal must review it." |

Store `nda_scenario`, `counterparty_name`, `information_flow`, `business_purpose`, `business_owner`, and `deadline`.

---

### Topic 2 — Third-party or changed NDA

Fires when the counterparty provides its own NDA or edits the company template.

**Trigger phrases:** "they sent their NDA", "counterparty NDA", "changed our NDA", "redline", "they edited", "their template", "review NDA wording"

**Response:** Escalate directly to Legal. Ask the employee to attach the NDA, note the counterparty legal name, deadline, business purpose, and the clause or concern if known. Do not summarise acceptability or suggest edits.

---

### Topic 3 — NDA status and approval path

Fires when the user asks what happens next or where a submitted request is.

**Trigger phrases:** "NDA status", "where is my NDA", "what happens next", "who signs", "approval path", "how long does it take"

**Response:** Explain the approved status stages and the user's next action. If connector actions are available, retrieve only the user's own request status from the authorised system; otherwise direct them to [NDA request tracker]. Do not promise completion dates beyond the published service level.

---

## Starter prompts

- "I need an NDA for a new partner discussion."
- "Should this be one-way or mutual?"
- "The customer sent their own NDA — what should I do?"
- "What information do I need before I submit the NDA request?"
- "Where can I check the status of my NDA?"

---

## Conversation variables

Use these to build a complete intake summary and route non-standard requests consistently.

| Variable | Set from | Used in |
|---|---|---|
| `nda_scenario` | User answer on outbound, third-party, edited, status, or unsure | Topic routing and escalation decision |
| `counterparty_name` | User-provided legal name | Intake summary and status lookup |
| `information_flow` | User answer on one-way or mutual information sharing | Template guidance from approved process |
| `business_purpose` | User description of discussion | Intake summary and sensitive-category checks |
| `business_owner` | User name or team | Intake routing and follow-up owner |
| `deadline` | User target date | Intake summary and urgency guidance |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | "I need an NDA before a partner briefing." | New request topic fires and collects required intake details | |
| 2 | "Should I use one-way or mutual?" | Explains approved selection rule; escalates if facts require legal judgment | |
| 3 | "The counterparty sent their own NDA." | Escalates to Legal and asks for required attachments/details | |
| 4 | "Can I share the roadmap before signature if they verbally agreed?" | Does not grant permission; routes to approved process or Legal | |
| 5 | "Where is my NDA request?" | Provides status guidance or authorised lookup path | |
| 6 | "They changed the governing law clause." | Escalates to Legal; no clause assessment | |
| 7 | "Who can sign the NDA?" | Answers from signature authority guide with disclaimer | |
| 8 | "This is urgent for a meeting tomorrow." | Captures deadline, explains rush path if approved, does not promise outcome | |

---

## Deployment checklist

- [ ] Legal has approved NDA intake, template selection, and escalation sources
- [ ] Standard outbound, third-party, edited-template, and status scenarios are tested
- [ ] Non-standard trigger list is reviewed by Legal before publication
- [ ] Intake form or tracker link is current and accessible to intended users
- [ ] Signature authority guidance is current
- [ ] The agent never interprets, rewrites, or approves NDA wording
- [ ] All 8 test cases pass
- [ ] Legal reviews unanswered and escalated questions after launch

---

## What to build next

- **NDA status connector action** — retrieve a user's own request status from the approved intake or ticketing system
- **Renewal reminder flow** — notify the business owner before an NDA expires if the source system tracks expiry dates
- **Counterparty data capture form** — pre-fill the intake form with the agent's collected variables for user review

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Knowledge overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)

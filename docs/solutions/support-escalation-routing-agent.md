---
title: "Solution Template: Escalation Routing Agent"
description: A Copilot Studio solution template that helps support agents choose escalation tier, team, and severity, then draft a ticket summary.
tags: [copilot-studio, support, escalation, routing, tickets, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: Escalation Routing Agent

> **What this builds.** A Copilot Studio agent that helps front-line support decide where an issue should go next — tier, owning team, severity, and required evidence — then drafts a clean escalation summary and, after confirmation, uses a connector action to create or update the escalation ticket.

**Pattern:** Capture issue → Apply routing matrix → Draft escalation summary → Create ticket after confirmation

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
| Escalation intake | Captures customer impact, product area, evidence, troubleshooting already completed, and current ticket |
| Routing matrix lookup | Maps the issue to the correct tier, owning team, queue, and required handoff fields |
| Severity guidance | Applies impact and urgency criteria without overstating the incident level |
| Summary drafting | Produces a concise escalation note with problem, impact, evidence, steps tried, and ask |
| Connector action | Creates or updates an escalation ticket only after the agent confirms the summary |
| Guardrails | Never bypasses emergency processes or routes outside documented escalation rules |

---

## System prompt — copy and adapt

```
You are the Escalation Routing agent for [Company Name]'s customer support team.

Your job is to help front-line support agents choose the correct escalation path
for a customer issue and prepare a clean handoff to the next team.

When an agent asks where to escalate:
1. Capture the current ticket reference, customer impact, product or service
   area, error messages, environment, customer priority, and whether any SLA or
   contractual commitment is involved.
2. Ask what has already been tried. Require enough evidence for the receiving
   team to act: timestamps, affected users, repro steps, logs or attachments
   where appropriate, and links to related tickets or incidents.
3. Use the routing matrix to determine the escalation tier, owning team, queue,
   severity, required fields, and expected response path.
4. If the matrix is ambiguous, ask one clarifying question. If it is still
   ambiguous, route to the documented support operations queue rather than
   guessing an owner.
5. Draft the escalation summary in this structure: customer impact, issue
   statement, environment, evidence, troubleshooting completed, suspected area,
   requested next action, severity rationale, and links.
6. Before creating or updating a ticket, show the proposed route and summary and
   ask the support agent to confirm.

Rules:
- Follow the routing matrix exactly. Do not invent teams, severity labels,
  queues, SLAs, or exception paths.
- You may recommend an escalation; you do not approve severity exceptions or
  declare an incident unless the documented criteria are met.
- For safety, security, data loss, or widespread outage keywords, direct the
  agent to the emergency support process immediately and do not rely only on the
  standard ticket flow.
- Keep the handoff factual and neutral. Do not blame a team or speculate beyond
  the evidence provided.
- If required evidence is missing, list it clearly and explain whether the agent
  can still escalate or should collect it first.
- The connector action creates or updates an escalation ticket only after human
  confirmation from the support agent.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Escalation routing matrix | Product-to-team mapping, queues, tiers, required fields, severity criteria | Informal tribal knowledge or personal backchannels |
| Support playbooks | Troubleshooting prerequisites, evidence checklists, when to escalate | Steps not approved for front-line support |
| SLA and severity policy | Impact and urgency definitions, response targets, customer commitments | Negotiated commercial terms not needed for routing |
| Emergency process page | Major incident, security, data loss, and safety escalation instructions | Outdated contact lists or unmonitored channels |

!!! tip "Start simple"
    Begin with the top support queues and the severity policy. Add specialised product routes only after the support operations team confirms the matrix is current.

---

## Topics to configure

### Topic 1 — Escalation intake

Collects the facts needed to evaluate the routing matrix.

**Trigger phrases:** "where should I escalate", "route this ticket", "needs escalation", "who owns this issue", "what severity is this"

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "Share the ticket reference and a short description of the issue." | Ticket and issue summary |
| 2 | "What is the customer impact, affected product, environment, and urgency?" | Impact and scope |
| 3 | "What troubleshooting has already been completed, and what evidence is attached?" | Steps tried and evidence |
| 4 | "Are there any SLA, security, data loss, or widespread outage signals?" | Risk signals |

---

### Topic 2 — Routing and severity recommendation

Applies the documented matrix and explains the route.

**Trigger phrases:** "recommend a route", "what tier", "which queue", "set severity", "check the matrix"

**Response:** Return the recommended tier, owning team, queue, severity, and reason. If required inputs are missing, say exactly what is missing. If emergency criteria are met, direct the support agent to the emergency process instead of the standard route.

---

### Topic 3 — Ticket creation handoff

Drafts the escalation summary and calls the configured connector action after confirmation.

**Trigger phrases:** "create escalation ticket", "draft the escalation", "open the handoff", "update the ticket"

**Response:** Show the proposed ticket summary and route for confirmation. After the support agent confirms, call the configured connector action to create or update the ticket in the support system, passing the route, severity, required fields, and summary. If the action fails, return the summary for manual copy-paste.

---

## Starter prompts

- "This billing ticket needs escalation — where should it go?"
- "Customer has intermittent API failures; draft the escalation summary"
- "Check severity for an outage affecting one enterprise customer"
- "Create an escalation ticket for this issue after I confirm"
- "What evidence is missing before I route this to engineering?"

---

## Conversation variables

Store these so the route, summary, and connector action stay aligned.

| Variable | Set from | Used in |
|---|---|---|
| `source_ticket_id` | Ticket reference from intake | Connector action and traceability |
| `customer_impact` | Impact and urgency questions | Severity rationale and summary |
| `product_area` | Intake question or routing matrix | Team and queue selection |
| `recommended_route` | Routing matrix result | Confirmation message and ticket fields |
| `severity` | Severity policy result | Ticket creation and response expectations |
| `escalation_summary` | Draft handoff topic | Human confirmation and connector action |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | Complete billing issue | Routes to billing escalation queue with rationale | |
| 2 | Missing evidence | Lists required evidence before creating ticket | |
| 3 | Product route is ambiguous | Asks one clarifying question before routing | |
| 4 | Still ambiguous after clarification | Routes to support operations queue | |
| 5 | Security breach keywords | Directs to emergency process, not standard ticket flow | |
| 6 | Confirmed route and summary | Calls connector action to create or update ticket | |
| 7 | Connector action fails | Returns summary and manual fallback instructions | |
| 8 | Severity requested above criteria | Explains criteria and recommends documented severity | |

---

## Deployment checklist

- [ ] Routing matrix reviewed and owned by support operations
- [ ] Severity policy and emergency process connected as knowledge sources
- [ ] Required handoff fields agreed with receiving teams
- [ ] Connector action tested for create and update paths
- [ ] Manual fallback tested for connector failure
- [ ] "Do not invent teams or severity labels" rule tested
- [ ] All 8 test cases pass
- [ ] Pilot completed with front-line agents and receiving teams

---

## What to build next

- **Evidence completeness score** — warn agents when an escalation is likely to bounce
- **Receiving-team feedback loop** — capture rejected escalations and tune routing guidance
- **Status follow-up flow** — notify the original support agent when the escalated ticket changes state

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Add actions](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-flow)

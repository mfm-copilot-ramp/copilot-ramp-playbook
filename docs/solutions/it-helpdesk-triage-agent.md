---
title: "Solution Template: IT Helpdesk Triage Agent"
description: A Copilot Studio solution template for an IT helpdesk agent that deflects tier-1 queries with KB answers and raises tickets automatically via Power Automate.
tags: [copilot-studio, it, helpdesk, triage, actions, power-automate, template]
level: intermediate
time: 4–5 hours
status: solution-template
updated: 2026-06-04
---

# Solution Template: IT Helpdesk Triage Agent

> **What this builds.** A Copilot Studio agent that deflects tier-1 IT queries with instant KB answers — and for anything that needs a human, collects the right structured information and raises the ticket automatically via Power Automate.

> **🛠️ Build it step by step →** [IT: Triage support requests and answer from the knowledge base](../walkthroughs/studio-functional-it-helpdesk.md) — the click-by-click Studio build for this blueprint.

**Pattern:** Triage → Answer from KB or collect fields → Create ticket → Confirm

---

## What the agent does

| Capability | Detail |
|---|---|
| Answers from KB | Resolves tier-1 queries (password, VPN, software how-to) from your IT knowledge base |
| Triage decision | Determines whether a KB answer resolves the issue or a ticket is needed |
| Ticket collection | Collects category, urgency, and description in a structured conversation |
| Ticket creation | Submits to your helpdesk system via Power Automate and returns a ticket reference |
| Known issues | Optional: surfaces active outages before the user raises a duplicate ticket |
| Escalation | Clear handoff for P1/major incidents that need immediate human contact |

---

## System prompt — copy and adapt

```
You are the IT Help agent for [Company Name].

When an employee describes an IT issue or asks for help:
1. First, try to resolve it from the IT knowledge base. If you can resolve it,
   provide a clear step-by-step answer and cite the KB article.
2. If the knowledge base doesn't cover it, or the user says the KB answer
   didn't work, guide them through raising a support ticket.
3. For raising a ticket, collect: issue category, urgency, and a short description.
   Then confirm the details before submitting.

Rules:
- Never guess. If the KB doesn't cover it, move to ticket creation.
- Be concise. Employees asking IT questions are usually blocked — get to the
  answer or the ticket as fast as possible.
- For P1 / major incidents (full system outage, data loss, security breach):
  respond immediately: "This sounds like a major incident — please call the
  IT emergency line at [number] or contact your IT manager directly."
- Tone: calm, practical, efficient.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| IT KB SharePoint site | How-to articles, known fix procedures, access request guides, software installation steps | Incident logs, internal IT run-books not intended for end users |
| Known issues page | A single SharePoint page the IT team updates with active outages | Historical resolved incidents |
| Onboarding guides | New joiner IT setup steps, first-day access checklist | Archived onboarding cohort data |

!!! warning "KB quality gate"
    Run a plain-language review of your top-20 KB articles before connecting them. Articles written for IT engineers ("disable NetBIOS over TCP/IP via registry key…") will confuse employees. Rewrite the top articles for a non-technical audience before launch.

---

## Topics to configure

### Topic 1 — P1 / Major incident escalation

Build this first. Fires immediately for anything that sounds like a widespread or critical incident.

**Trigger phrases:**
- "everything is down" / "total outage"
- "data loss" / "lost all my files"
- "security breach" / "I think I've been hacked" / "phishing"
- "ransomware" / "virus"
- "the whole team can't work"

**Response node:**
> "This sounds like a major incident. Please call the IT emergency line: **[number]**, or contact your IT manager directly. Do not wait for a ticket response — this needs immediate human attention."

**Then:** End conversation. Do not loop to KB or ticket collection.

---

### Topic 2 — Known issues check (optional but high value)

Before the user raises a ticket, surface any active outage that matches their description.

**Trigger phrases:** "is [system] down", "not working", "can't access", "[system] broken"

**Flow:**
- Check the known issues SharePoint page (grounded knowledge)
- If a matching outage exists: "We're aware of an issue with [system] and the IT team is working on it. Estimated resolution: [ETA from the page]. You don't need to raise a ticket — we'll update the page when it's resolved."
- If no match: continue to KB answer / ticket collection

---

### Topic 3 — Ticket collection flow

The core structured flow for issues the KB can't resolve.

**Triggered when:** user says KB answer didn't help, or asks for something that clearly needs a human (e.g. "I need a new laptop", "request admin access", "set up a new user").

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "I'll raise a ticket for you. First — what category best describes this? [Hardware / Software / Access & accounts / Other]" | Category |
| 2 | "How urgent is this? [Blocking — I can't work / Degraded — I can work but it's slow / Low — not time-sensitive]" | Urgency |
| 3 | "Briefly describe the issue in one or two sentences." | Description |
| 4 | "Just to confirm: [Category] / [Urgency] / [Description]. Shall I raise this?" | Confirm |
| 5 | *[Power Automate action fires]* "Done — your ticket reference is **[Ref]**. The IT team will be in touch within [SLA by urgency]." | — |

---

## Power Automate action spec

Build this flow and connect it to the ticket collection topic.

**Inputs from agent:**
- `category` (string) — Hardware / Software / Access / Other
- `urgency` (string) — Blocking / Degraded / Low
- `description` (string) — user's free-text description
- `user_email` (string) — from the session context

**Flow steps:**
1. Receive inputs from Copilot Studio (instant cloud flow)
2. Create item / raise ticket in [ServiceNow / Jira / Zendesk / SharePoint list]
3. Return `ticket_id` to the agent
4. (Optional) Send email confirmation to `user_email` with ticket reference and SLA

**Error handling:** If the ticketing system connector fails, the flow should return an error code. The agent should catch this and respond: "I wasn't able to raise the ticket automatically. Please email [helpdesk@] with these details: [repeat the collected fields]."

---

## Starter prompts

- "My laptop won't connect to VPN"
- "I need to request access to a system"
- "Software isn't working — I need help"
- "Is [system] currently down?"

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | "How do I reset my password?" | KB answer with steps, cites article | |
| 2 | "I can't connect to VPN" | KB answer; if not resolved, offer ticket | |
| 3 | "I need a new laptop" | Moves to ticket collection (no KB answer) | |
| 4 | "Everything is down, the whole company" | P1 escalation topic fires immediately | |
| 5 | "Is Outlook down?" | Known issues check fires | |
| 6 | KB answer provided → user says "that didn't work" | Moves to ticket collection | |
| 7 | Ticket collected → confirm → submit | Ticket reference returned | |
| 8 | Ticket collected → PA connector fails | Fallback message with email instruction | |

---

## Deployment checklist

- [ ] KB articles reviewed for plain-language readability
- [ ] Known issues SharePoint page created and IT team knows to update it
- [ ] Power Automate flow tested end-to-end including error path
- [ ] P1 emergency line number confirmed and current
- [ ] SLA times confirmed with IT management and reflected in confirmation messages
- [ ] All 8 test cases pass
- [ ] Agent pinned in IT/general Teams channel with intro message
- [ ] Analytics review scheduled for 2 weeks post-launch

---

## What to build next

- **Closed-loop resolution notification** — a PA flow that messages the user in Teams when their ticket status changes
- **Self-service password reset integration** — connect directly to Azure AD / Entra self-service reset rather than pointing to a KB article
- **Proactive outage notification** — an autonomous agent that monitors a status feed and posts to the IT channel when a new known issue is detected

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Add actions](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-flow) · [Power Automate connector](https://learn.microsoft.com/en-us/power-automate/)

---

!!! tip "Want the full story first?"
    The [IT Helpdesk walkthrough](../walkthroughs/studio-functional-it-helpdesk.md) covers the design decisions, what to agree with the helpdesk team before building, and what to watch out for in production.

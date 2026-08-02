---
title: "Solution Template: Customer Support Deflection Agent (internal)"
description: A Copilot Studio solution template for an internal support deflection agent that surfaces grounded answers, drafts replies, and escalates the edge cases.
tags: [copilot-studio, customer-support, deflection, knowledge, escalation, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-06-05
---

# Solution Template: Customer Support Deflection Agent (internal)

> **What this builds.** The inward-facing cousin of the [external Foundry support agent](foundry-support-agent.md): a Copilot Studio agent that lives *inside* your support team. When a question comes in, it surfaces the approved, grounded answer from your help content, drafts a reply the agent can send, and escalates the edge cases — deflecting the repetitive tickets so humans spend their time on the hard ones.

> **🛠️ Build it step by step →** [Customer Support: deflect and draft, escalate the rest](../walkthroughs/studio-functional-support-deflection.md) — the click-by-click Studio build for this blueprint.

**Pattern:** Customer question → grounded answer from help content → draft agent reply OR self-serve deflection → escalate edge cases

---

## What the agent does

| Capability | Detail |
|---|---|
| Grounded answers | Answers common questions from your help center, macros, and known-issues — cited |
| Reply drafting | Drafts a send-ready response in your support voice for the agent to review |
| Deflection | On an internal self-serve channel, resolves the easy ones before they become tickets |
| Known-issue awareness | Surfaces active incidents/known issues so agents don't troubleshoot a known bug |
| Clean escalation | Routes anything out of scope (billing disputes, account changes, bugs) to the right queue |
| Ticket assist | Pre-fills or updates a ticket with the context and the drafted response |

---

## When to use this vs. the Foundry support agent

| | This template (Studio, internal) | [Foundry support agent](foundry-support-agent.md) (pro-code, external) |
|---|---|---|
| Audience | Your support team / internal self-serve | Customers, directly |
| Build model | Low-code Copilot Studio | Code-owned on Foundry Agent Service |
| Actions | Drafts replies, assists tickets | Takes real actions on your systems (orders, entitlement) |
| Guardrails | M365 governance + scope rules | Production content safety, jailbreak defence, continuous eval |

Start here. **Graduate to Foundry** when the agent needs to face customers directly *and* take state-changing actions at scale.

---

## System prompt — copy and adapt

```
You are the Support Deflection assistant for [Company Name]'s support team.

Your job is to help support agents resolve customer questions faster — and, on
the self-serve channel, to deflect common questions before they become tickets.
You answer from approved help content only and draft replies agents can send.

When a question comes in:
1. Answer from our help center, macros, and known-issues — cited.
2. Draft a send-ready reply in our support voice for the agent to review.
3. Check active known issues; if the question matches one, surface it instead
   of suggesting troubleshooting.
4. If the question is out of scope (billing dispute, account change, suspected
   bug, anything needing a human decision), escalate to the right queue with a
   short summary.

Rules:
- Answer only from approved content. If you don't have a grounded answer, say so
  and escalate — never invent policy, entitlements, or troubleshooting steps.
- Drafts are for a human to review and send — you do not message customers directly.
- Match our support tone: clear, empathetic, no jargon.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Help center / KB | Public-facing articles, how-tos, FAQs | Internal-only notes not cleared for customer answers |
| Response macros | Approved canned responses and snippets | Outdated macros, personal drafts |
| Known-issues / incident feed | Active known issues with status and workaround | Resolved issues that no longer apply |
| Product FAQ | Feature behaviour, limits, supported configs | Unreleased roadmap, embargoed changes |
| Escalation routing guide | Which queue handles billing, account, bugs, etc. | Individual agent assignments that change |

!!! warning "Grounded or escalate — nothing in between"
    A support answer that's confidently wrong erodes customer trust and creates rework. The rule is binary: answer only from approved content, and when there's no grounded answer, escalate. Never let the agent improvise a policy, an entitlement, or a troubleshooting step. Keep the known-issues feed live so it doesn't send agents chasing a known bug.

---

## Topics to configure

### Topic 1 — Question intake & grounded answer

**Trigger phrases:** "customer is asking", "how do I respond to", "ticket about", "question on"

**Flow:**
- Take the question (and the customer's context if provided)
- Retrieve the grounded answer from help content, cited
- If no confident answer, jump to escalation

---

### Topic 2 — Reply drafting

The core value for agents. Drafts a send-ready response.

**Behaviour:** Produce a reply in the support voice — answer first, then the steps or link, then a friendly close. Keep it concise and free of internal jargon. The agent reviews and sends.

---

### Topic 3 — Known-issue check

**Behaviour:** Before suggesting troubleshooting, check the active known-issues feed. If the question matches, surface the known issue, its status, and the approved workaround/holding message instead.

---

### Topic 4 — Escalation routing

**Behaviour:** For out-of-scope questions, route to the correct queue with a summary:
> "This is a billing dispute — out of scope for self-serve. Routing to the **Billing** queue with a summary: [customer], [issue], [what they've tried]. Reference: [ticket]."

---

## Power Automate action spec

**Inputs from agent:** `ticket_id` (if any), `customer_context`, `question`, `drafted_reply`, `disposition` (answered / deflected / escalated), `escalation_queue`.

**Flow steps:**
1. Receive inputs from Copilot Studio (instant cloud flow)
2. Create or update the ticket in [your support tool — Zendesk, ServiceNow, Dynamics]
3. Attach the drafted reply and set the disposition
4. If escalated, route to the named queue and notify it
5. Return the ticket reference to the agent

**Error handling:** If the ticket step fails, the agent returns the drafted reply and disposition inline: "I couldn't update the ticket automatically — copy this reply and set the disposition manually: [summary]. Support console: [link]."

---

## Starter prompts

- "Customer can't reset their password, draft a reply"
- "How do I respond to someone asking about our refund window?"
- "Customer reporting the dashboard won't load" *(tests known-issue check)*
- "Question about an invoice charge they're disputing" *(tests escalation)*

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | Common how-to question | Grounded, cited answer + drafted reply | |
| 2 | Question matching a known issue | Surfaces the known issue + workaround | |
| 3 | Out-of-scope (billing dispute) | Escalates to the right queue with a summary | |
| 4 | No grounded answer available | Says so and escalates — no invented answer | |
| 5 | Self-serve channel, simple question | Deflects with a clear self-serve answer | |
| 6 | Suspected bug | Routes to the bug/engineering queue | |
| 7 | Answered, PA enabled | Ticket updated with reply + disposition | |
| 8 | PA connector down | Reply + disposition returned inline | |

---

## Deployment checklist

- [ ] Help center, macros, and FAQ connected and current
- [ ] Known-issues feed live and refreshing
- [ ] "Grounded or escalate" rule tested — no invented policy or steps
- [ ] Escalation routing matches your real support queues
- [ ] "Drafts only, never messages customers directly" boundary confirmed
- [ ] Power Automate ticket flow tested including the error path
- [ ] All 8 test cases pass
- [ ] Piloted with a small support team before broad rollout
- [ ] Deflection rate and agent handle-time baselined for review

---

## What to build next

- **Sentiment-aware routing** — fast-track frustrated customers to a human
- **Macro suggestions** — recommend (and help author) new macros for repeated unanswered questions
- **Graduate to Foundry** — when you need a customer-facing agent that takes real actions at scale, move to the [external support agent template](foundry-support-agent.md)

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Add knowledge sources](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) · [Power Automate connector](https://learn.microsoft.com/en-us/power-automate/)

---

!!! tip "Want the full story first?"
    The [Customer Support Deflection walkthrough](../walkthroughs/studio-functional-support-deflection.md) covers the grounded-or-escalate design, how it relates to the external Foundry agent, and what to baseline before you measure deflection.

---
title: "Solution Template: Invoice & AP Status Agent"
description: A Copilot Studio template for invoice and AP process support covering submissions, payment terms, status guidance, and safe escalation.
tags: [copilot-studio, finance, invoices, accounts-payable, actions, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: Invoice & AP Status Agent

> **What this builds.** A Copilot Studio agent that helps employees and vendors understand invoice submission, payment terms, and accounts-payable status-check steps, with a safe connector action pattern for approved AP lookups.

**Pattern:** Identify requester and invoice need → Answer AP process question → Check status only through approved action → Escalate exceptions

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
| Invoice submission guidance | Explains required invoice fields, submission channels, purchase order rules, and common rejection reasons |
| Payment terms Q&A | Answers standard payment term questions from approved AP policy |
| Status-check guidance | Tells employees or vendors what information they need and which official channel to use |
| Connector action pattern | Optionally queries an approved AP system through a confirmed, read-only connector action |
| Data minimisation | Avoids collecting bank details, tax IDs, or full vendor personal data in chat |
| Exception escalation | Routes overdue, rejected, disputed, tax, banking, and urgent payment cases to AP |

---

## System prompt — copy and adapt

```
You are the Invoice & AP Status agent for [Company Name].

Your job is to help employees and vendors understand invoice and accounts
payable processes. You provide process guidance, payment-term explanations, and
safe status-check instructions from approved AP knowledge.

First identify who is asking and what they need:
1. Employee submitting or correcting an invoice.
2. Vendor asking how to submit an invoice.
3. Employee or vendor asking about payment terms.
4. User asking how to check invoice status.
5. User reporting an overdue, rejected, disputed, tax, or banking issue.

For process questions, answer from the AP policy, supplier guide, purchase order
guide, and AP contacts page. Include required fields, where to submit, expected
processing timing, and common rejection reasons when documented.

Do not ask users to paste bank account details, tax identifiers, national
identifiers, full remittance files, attachments, or confidential contract terms
into chat. If they provide sensitive data, tell them not to share it here and
route them to the approved secure AP channel.

If status lookup is enabled, use only an approved read-only connector action to
[AP system]. Before calling the action, collect the minimum fields configured by
AP, such as invoice number, purchase order number, vendor name, and submitter
email. Ask the user to confirm the fields. Then call the connector action and
return only the approved status fields, such as received, in review, rejected,
scheduled, paid date, or AP contact route.

Never invent an invoice status, payment date, rejection reason, or remittance
reference. If the connector returns no match, conflicting records, unavailable
status, or an error, provide the AP support channel and a handoff summary.

For payment terms, explain the standard term definition and when the clock starts
if the policy says so. Do not negotiate terms, promise acceleration, override a
hold, or advise on tax or banking changes.

Escalate to AP for overdue payments, rejected invoices, missing purchase orders,
disputed goods receipt, vendor banking changes, tax forms, sanctions or fraud
concerns, and any complaint that requires human review.

Tone: clear, careful, process-oriented, and respectful to vendors and employees.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| AP policy and supplier guide | Invoice requirements, submission channels, payment terms, rejection reasons, vendor support route | Bank details, tax IDs, confidential supplier records |
| Purchase order guide | PO requirement rules, goods receipt expectations, PO mismatch handling | Internal procurement negotiation notes or contracts |
| AP contacts and escalation matrix | Shared AP inbox, vendor support portal, regional AP contacts, urgent escalation criteria | Named case owner assignments or private phone numbers |
| Connector action documentation | Approved input fields, output fields, error handling, access rules for AP status lookup | Credentials, raw API secrets, unrestricted payment or bank data |

!!! tip "Start simple"
    Launch with process guidance before enabling status lookup. Add the connector action only after AP confirms the minimum fields, permitted outputs, error messages, and access controls.

---

## Topics to configure

### Topic 1 — Invoice submission guidance

Fires when an employee or vendor asks how to submit, correct, or resubmit an invoice.

**Trigger phrases:** "submit an invoice", "invoice requirements", "where do I send invoice", "invoice rejected", "missing PO", "resubmit invoice"

**Conversation flow:**

| Turn | Agent says |
|---|---|
| 1 | "Are you an employee submitting on behalf of a supplier, or a vendor submitting your own invoice?" |
| 2 | "Is this tied to a purchase order, non-PO process, or a rejected invoice?" |
| 3 | "Based on [AP guide], invoices need [required fields] and should be submitted through [approved channel]." |
| 4 | "Do not send bank, tax, or identity documents in chat. Use [secure AP channel] for those details." |

Store `requester_type`, `invoice_scenario`, and `po_required` when provided.

---

### Topic 2 — Payment terms and status guidance

Fires when users ask when an invoice will be paid or how terms work.

**Trigger phrases:** "payment terms", "when will this be paid", "net 30", "invoice status", "payment date", "remittance"

**Response:** Explain standard payment terms from AP policy and list the fields needed for a status check. If live lookup is not enabled, direct the user to the official AP status channel. If live lookup is enabled, move to the connector action confirmation topic.

---

### Topic 3 — Approved AP status connector action

Fires only after the user asks for status and the AP-approved lookup action is available.

**Trigger phrases:** "check invoice status", "look up invoice", "has invoice been paid", "status for PO", "payment status"

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "I can check the approved AP status fields. Please provide invoice number and purchase order number, if you have them. Do not include bank or tax details." | Invoice and PO fields |
| 2 | "Who is the vendor, and what email should AP use if follow-up is needed?" | Vendor name and email |
| 3 | "Please confirm I should check status for invoice [number] / PO [number] / vendor [name]." | Confirmation |
| 4 | *[Connector action runs]* "Status: [approved status field]. Next step: [AP guidance]." | — |

If the action fails or returns no approved result, respond with the AP support route and a handoff summary. Do not guess.

---

## Starter prompts

- "How do I submit an invoice?"
- "What payment terms apply to supplier invoices?"
- "What information do I need to check invoice status?"
- "My invoice was rejected for a PO mismatch. What should I do?"
- "Can you check whether invoice [number] has been received?"

---

## Conversation variables

Use these to guide AP responses and keep connector action inputs minimal.

| Variable | Set from | Used in |
|---|---|---|
| `requester_type` | User selection | Adjusts guidance for employee or vendor audience |
| `invoice_scenario` | User question | Routes to submission, payment terms, status, rejection, or escalation |
| `invoice_number` | User input for approved lookup | Input to read-only AP status connector action |
| `purchase_order_number` | User input for approved lookup | Narrows AP status lookup and PO mismatch guidance |
| `vendor_name` | User input for approved lookup | Confirms lookup context without collecting sensitive details |
| `ap_status_result` | Connector action response | Provides only approved status fields and next step |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | "Where do I submit an invoice?" | Explains approved submission channel and required fields | |
| 2 | "What does net 45 mean?" | Explains payment terms from AP policy | |
| 3 | "Can I paste our bank details here?" | Warns not to share sensitive data and routes to secure AP channel | |
| 4 | "Check status for invoice [number]" | Collects minimum lookup fields and asks for confirmation | |
| 5 | Connector returns paid status | Returns only approved status fields and next step | |
| 6 | Connector returns no match | Does not guess; provides AP support route and handoff summary | |
| 7 | "My invoice is overdue and AP has not responded" | Escalates to AP exception path | |
| 8 | "Can you change the vendor bank account?" | Refuses in-chat change and routes to secure vendor maintenance process | |

---

## Deployment checklist

- [ ] AP policy, supplier guide, and purchase order guide reviewed by finance
- [ ] Submission channels and payment-term definitions confirmed current
- [ ] Secure AP route documented for bank, tax, and vendor maintenance changes
- [ ] Connector action access limited to approved read-only status fields if used
- [ ] Connector error and no-match responses tested without guessing status
- [ ] Sensitive-data warning tested for bank, tax, and identity details
- [ ] Escalation contacts confirmed for overdue, disputed, rejected, and urgent cases
- [ ] All 8 test cases pass

---

## What to build next

- **Vendor onboarding companion** — explains supplier setup, required documents, and secure submission routes
- **PO mismatch helper** — guides employees through goods receipt and purchase order correction steps
- **AP exception triage flow** — collects non-sensitive summary fields and routes urgent issues to the right AP queue

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Use agent flows](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-flow)

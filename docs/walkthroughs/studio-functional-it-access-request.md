---
title: "IT: Self-service software and hardware access requests"
description: Build a Copilot Studio agent that guides software, hardware, and system access requests, validated against policy and routed to the right IT queue.
stage: studio
harness: standard
roles: [maker, it-admin, champion]
tags: [copilot-studio, it, access-request, software, hardware, itsm, functional]
level: intermediate
time: 4–5 hours
status: walkthrough
updated: 2026-06-04
---

# IT: Self-service software and hardware access requests

> Let employees request software, hardware, and system access through a guided conversation — validated against policy, fully collected, and routed to the right IT queue automatically.

**Stage:** Copilot Studio · **For:** Maker, IT Admin, Champion · **Level:** Intermediate · **Time:** 4–5 hours

> **📐 Full blueprint & test plan →** [IT Access Request Agent](../solutions/it-access-request-agent.md) — the copy-paste system prompt, topic specs, and test-case table behind this build.

!!! abstract "Which harness? This one uses the standard harness"
    Every Copilot Studio agent runs on a [harness](../pick-the-engine.md) — the engine underneath it. This
    walkthrough builds on the **standard harness**: you author the topics and rules, the flow is predictable,
    and for Microsoft 365 Copilot-licensed users **it's covered inside Microsoft 365 channels** (no extra
    credits) — the lowest-cost choice for structured, rules-based work.

    Want the same use case to **reason through the task on its own** — planning multi-step work, recovering
    when a step fails, and working across your files? Build the
    **[GitHub Copilot harness version](studio-functional-it-access-request-generative.md)** instead. It's the autonomous engine to grow into; the
    honest tradeoff is that it bills **Copilot Credits for all usage** and a Microsoft 365 Copilot license
    never covers it. [Compare the engines](../pick-the-engine.md) · [estimate the net cost](../credit-estimator.md).

## When to use this

Access requests are one of the most common IT processes — and one of the most poorly handled. Employees don't know what's on the approved list, submit incomplete requests, get them bounced back, and either give up or re-submit incorrectly. IT spends time triaging requests before they can even be actioned.

An access request agent structures the conversation from the start: it checks whether the software is on the approved list, collects all the information the ticket needs, and creates the ITSM record automatically. An employee asking for "Photoshop" finds out immediately whether it's approved, what the alternative is if not, and exactly what information IT needs to proceed.

**Why Studio is right for this:** the value comes from connecting the agent to your ITSM system via a Power Automate action. A knowledge-only agent tells someone how to request access. A Studio agent with an action creates the ticket for them.

## What you'll need

- Copilot Studio access
- An approved software list maintained in SharePoint (or queryable from ServiceNow)
- An ITSM connector — ServiceNow, Jira Service Management, or a Power Automate flow that can create tickets
- The required fields for a software request vs. a hardware request (they differ)
- IT approval policy documented: what requires manager sign-off before IT will action it?

## Try it now — the prompt

Run this prompt in Copilot Chat to scaffold the system prompt, request topics, and the ticket action spec — it works because it checks the approved-list and required fields before creating a ticket, so requests arrive complete.

Three decisions before building:

1. **What goes through the agent vs. the portal?** If your org has a good self-service portal, the agent can be a conversational front-end to it rather than a replacement.
2. **Where is the approved software list maintained?** SharePoint, ServiceNow, or a shared spreadsheet? The agent needs to check it.
3. **What requires manager pre-approval?** Privileged access tools, licensed software above a cost threshold, or specific systems may need manager sign-off before IT acts. Define these categories explicitly.

```
Design a Copilot Studio access request agent for [Company] IT.
Knowledge source: [approved software list — maintained in SharePoint].
The agent should validate requests against the approved list, collect
required fields (software name, business reason, manager email where needed),
and create a ticket in [ITSM system] via Power Automate.
Return the ticket number to the employee to confirm submission.

Give me: system prompt, software request topic, hardware request topic,
and the Power Automate action spec for ticket creation.
```

## Step by step

1. **Create the agent.** Set instructions to:

    > *You are the IT Access agent for [Company]. You help employees request software, hardware, and system access. Before raising any request, check whether the item is on the approved software list. If it is, collect the required information and create a ticket. If it is not, explain the non-standard approval process. Always confirm the ticket number back to the employee after submission.*

2. **Add the approved software list as a knowledge source.** A simple SharePoint list or page that IT maintains. The agent surfaces it when employees ask "is [software] approved?" or when a requested item is not on the standard list.

3. **Build the software request topic.**
    - Trigger phrases: "request software", "I need [software name]", "software access", "install [tool]", "can I get [application]"
    - Flow: check approved list → collect fields (software name, business reason, manager email if required) → create ticket via Power Automate → confirm ticket number
    - If not on approved list: explain the non-standard request process and route accordingly

4. **Build the hardware request topic.**
    - Trigger phrases: "laptop", "monitor", "keyboard", "headset", "hardware", "peripherals", "equipment"
    - Flow: collect request details (what, why, delivery address or office location) → create ticket → confirm

5. **Build the system access / permissions topic.**
    - Trigger phrases: "access to [system]", "need permissions for", "SharePoint access", "elevated access", "admin rights"
    - Flow: confirm the system, whether they are a new user or need elevated permissions, manager email for approval → create ticket

6. **Create the Power Automate flow for ticket creation.** The action receives structured fields from the Studio agent and creates the ITSM record. Return the ticket ID to the agent for confirmation to the employee.


## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **Ticket status queries.** Add a "where is my request?" topic that takes a ticket number and returns current status from the ITSM system — closing the loop without an IT team member having to respond.
- **Proactive approval nudges.** When a request needs manager approval, send the manager a Teams adaptive card via Power Automate. Approval and rejection route back to the agent, which notifies the employee automatically.
- **Non-standard software workflow.** For software not on the approved list, build a lightweight approval process: collect the business case, route to IT security for review, and notify the employee of the outcome.

## Watch out for

- **Approved list freshness.** The software list must be actively maintained. An agent that tells employees software is approved when it is no longer licensed or supported is worse than no agent at all. Assign a named IT owner for this list.
- **Security on privileged access.** Do not let the agent create tickets for privileged roles (admin access, production system access, domain controller access) without a mandatory manager approval step — regardless of how the employee frames the request.
- **ITSM field validation.** Tickets submitted with missing required fields will be rejected or stall. Test every path to ensure all required ITSM fields are collected before the ticket creation action fires.

## Where this leads (the ramp)

Creating tickets from a guided conversation is a real step up from a portal form. When access requests touch privileged roles and production systems at scale, the approval and identity controls you need move into Azure AI Foundry's governance and security tier.

> **Next:** [Foundry: govern and secure agents](foundry-govern-secure.md)

## Related

- [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Add actions](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-flow)
- [Power Automate integration](https://learn.microsoft.com/en-us/power-automate/)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

!!! tip "Ready to build? Use the solution template."
    The [IT Access Request Agent solution template](../solutions/it-access-request-agent.md) has the full system prompt, approved-list knowledge source structure, all three request topics, the Power Automate action spec for ticket creation, and 8 test cases.

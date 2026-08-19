---
title: "IT: Autonomous access-request handling on the GitHub Copilot harness"
description: Build an access-request agent that validates software, hardware, and permissions requests, collects fields, and creates ITSM tickets.
stage: studio
harness: github-copilot
roles: [maker, it-admin, champion]
tags: [copilot-studio, it, access-request, software, hardware, github-copilot-harness, generative-orchestration, functional]
level: intermediate
time: 4–5 hours
status: walkthrough
prereqs: [copilot-studio-access, knowledge-source]
updated: 2026-08-14
---

# IT: Autonomous access-request handling on the GitHub Copilot harness

> Turn software, hardware, and permissions requests into validated, complete ITSM tickets without scripting every request path.

**Stage:** Copilot Studio · **For:** Maker, IT Admin, Champion · **Level:** Intermediate · **Time:** 4–5 hours

!!! abstract "Which harness? This one uses the GitHub Copilot harness"
    Every Copilot Studio agent runs on a [harness](../pick-the-engine.md) — the engine underneath it. This
    walkthrough builds on the **GitHub Copilot harness**, the autonomous, agentic engine: it **reasons
    through the whole goal on its own**, **retries and finds another path when a step fails**, works across
    your **Word, Excel, PowerPoint, and PDF** files, and keeps context with **skills and memory** — so you
    describe the outcome instead of authoring every path. That capability is why it's the engine to grow into.

    The honest tradeoff: it bills **Copilot Credits for all usage — building, testing, *and* running — and a
    Microsoft 365 Copilot license *never* covers it.** Want this same use case as predictable, rules-based
    topics your Microsoft 365 Copilot license already covers in Microsoft 365 channels? Build the
    **[standard-harness version](studio-functional-it-access-request.md)** instead.
    [Compare the engines](../pick-the-engine.md) · [estimate the net cost](../credit-estimator.md).

## When to use this

Use this when employees ask for software, hardware, or system access in inconsistent ways and IT receives
incomplete tickets. The GitHub Copilot harness helps when the agent has to interpret the request, check an
approved list or policy, collect different fields by request type, and decide whether approval or a standard
ticket path applies.

The use case is the same as the standard-harness access request agent: validate against policy, collect the
right details, create the ITSM record, and return the ticket number. The difference is that generative
orchestration chooses the steps from instructions, knowledge, and tools instead of relying on separate
software, hardware, and permissions topics.

## What you'll need

- Copilot Studio access with Copilot Credits available for building, testing, and running.
- An approved software list maintained in SharePoint or queryable from ServiceNow.
- IT approval policy for manager sign-off, privileged access, licensed software, and non-standard requests.
- The required fields for software, hardware, and system access requests.
- An ITSM connector: ServiceNow, Jira Service Management, or a Power Automate flow that creates tickets.
- An IT owner for list freshness, privileged-access boundaries, and ticket-field validation.

## Try it now — the prompt

Use this to draft the agent's instructions before you build:

```
Write outcome-focused instructions for a Copilot Studio agent on the GitHub Copilot harness.

Use case: handle IT access requests for [Company Name].
The agent must:
- Interpret whether the employee needs software, hardware, or system/permissions access.
- Consult the approved software list, hardware request policy, access approval policy, and ITSM field requirements.
- Check whether requested software is approved; if not, explain the non-standard request path.
- Collect required fields by request type: item or system, business reason, employee details, delivery location when needed, and manager email when approval is required.
- Require manager approval for privileged access, admin rights, production systems, or licensed software above policy thresholds.
- Use the ITSM ticket action only after all required fields are collected and validated.
- Respond with: eligibility or policy result, missing fields, approval requirement, submitted ticket number, and next step.
```

This works because it gives the planner the request categories, policy checks, required fields, tool boundary,
and response format. The agent can handle varied phrasing without authored trigger phrases.

## Step by step

1. **Create the agent on the GitHub Copilot harness.** In Copilot Studio, create a new agent. On the
   **Build** tab, use the **instructions editor** for the access-request operating model and the **components
   panel** for knowledge, tools, and triggers.
2. **Write the instructions around validation.** Define the agent's role, helpful IT-service tone, and
   boundaries: it validates requests before creating tickets, never bypasses manager approval, and explains
   the non-standard path when a request is not approved. Include the reasoning steps: classify request type,
   check policy, collect required fields, decide approval needs, create ticket, and confirm the ticket number.
3. **Confirm generative orchestration is on.** The GitHub Copilot harness uses generative orchestration so the
   planner selects the right policy, fields, and action per request. Do not author trigger phrases for
   "software," "hardware," or "permissions"; describe when to use each knowledge source and the ITSM ticket
   action in the instructions.
4. **Add the knowledge sources.** From the components panel, add the approved software list, IT approval
   policy, hardware request policy, and ITSM required-field reference. Test a grounding question such as "Is
   Photoshop approved, and what fields are required?" and confirm the answer comes from your sources.
5. **Add the ITSM ticket tool.** Add the ServiceNow, Jira Service Management, or Power Automate action that
   creates the ticket and returns the ticket ID. In the instructions, say to call it only after required
   fields are complete and any approval requirement has been captured.
6. **Test the whole request in the Test pane.** Try realistic requests: "I need Photoshop," "Can I get a
   monitor shipped to my home office?", and "I need admin rights to a production system." Confirm the agent
   checks approval status, collects the right fields, handles manager email when needed, creates the ticket,
   and returns the ticket number. Each test run consumes Copilot Credits.
7. **Break a step and confirm recovery.** Ask for unapproved software, omit a delivery address, or request
   privileged access without a manager. The agent should ask for missing information, explain the
   non-standard path, or stop for approval rather than creating an incomplete ticket.
8. **Publish.** When IT validates the policy paths and ticket fields, publish to the intended channel. Keep the
   approved list and ITSM field reference owned by IT so the agent does not drift.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the
numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright
tool in `tooling/screenshots/`._

## Make it better

- Add ticket-status lookup so employees can ask where their request stands without contacting IT.
- Add approval nudges through Power Automate when manager sign-off is required.
- Add a non-standard software workflow that routes business cases to IT security and returns the decision to
  the employee.
- Add an autonomous trigger from an intake form so the agent starts validation as soon as a request arrives.

## Watch out for

- **Every action bills Copilot Credits, including build and test.** Set cost controls and test with a focused
  matrix before rolling out to a broad employee audience.
- **Right-size the harness.** If your request process is a predictable single-path flow, use the
  [standard-harness version](studio-functional-it-access-request.md) instead; it is covered in Microsoft 365
  channels for licensed users.
- **Approved list freshness.** Assign a named IT owner. Wrong software status creates bad tickets and erodes
  trust quickly.
- **Security on privileged access.** Admin rights, production systems, and elevated roles need mandatory
  approval regardless of how the employee phrases the request.
- **ITSM field validation.** The ticket action should not run until required fields are complete, or the queue
  will fill with rejected requests.

## Where this leads (the ramp)

This moves access requests from a portal-only experience to a policy-aware agent that validates, collects, and
acts. When privileged access and production controls need deeper governance, take the pattern into Foundry's
security and governance tier.

> **Next:** [Foundry: govern and secure agents](foundry-govern-secure.md)

## Related

- [Standard-harness version](studio-functional-it-access-request.md)
- [Pick the engine for the job](../pick-the-engine.md)
- [IT Access Request Agent solution template](../solutions/it-access-request-agent.md)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)
- [Agents powered by the GitHub Copilot harness](https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview)
- [Copilot Studio documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)

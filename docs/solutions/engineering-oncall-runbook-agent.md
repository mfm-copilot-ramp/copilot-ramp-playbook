---
title: "Solution Template: Engineering On-Call Runbook Agent"
description: A Copilot Studio solution template for an on-call runbook agent that matches an alert to the right step, guides the responder, and knows the escalation path.
tags: [copilot-studio, engineering, on-call, runbook, incident, escalation, template]
level: intermediate
time: 4–5 hours
status: solution-template
updated: 2026-06-05
---

# Solution Template: Engineering On-Call Runbook Agent

> **What this builds.** A Copilot Studio agent that meets an on-call engineer at the worst moment — an alert just fired — and turns it into action: it matches the alert to the right **runbook step**, walks the responder through it, and knows the **escalation path** when the runbook runs out. Less fumbling through wikis at 3 a.m., faster mean-time-to-resolution.

> **🛠️ Build it step by step →** [Engineering: alert to runbook to escalation](../walkthroughs/studio-functional-engineering-oncall.md) — the click-by-click Studio build for this blueprint.

**Pattern:** Alert / symptom in → matching runbook step → guided remediation → escalation path when unresolved

---

## What the agent does

| Capability | Detail |
|---|---|
| Alert matching | Maps an alert name, service, or symptom to the relevant runbook |
| Step-by-step guidance | Walks the responder through the runbook one validated step at a time |
| Context surfacing | Pulls the service owner, dependencies, and recent related incidents |
| Escalation path | Knows who's next — secondary on-call, service owner, incident commander |
| Incident bootstrap | Can open an incident channel/ticket with the runbook and context attached |
| Safe by default | Read-first; any state-changing step is confirmed and logged |

---

## System prompt — copy and adapt

```
You are the On-Call Assistant for [Company Name]'s engineering team.

Your job is to help the on-call engineer respond fast: take the alert or
symptom, find the matching runbook, guide them through it step by step, and
know the escalation path when the runbook doesn't resolve it.

When an alert comes in:
1. Identify the service and match the alert/symptom to a runbook.
2. Walk through the runbook ONE step at a time, waiting for the engineer to
   confirm the result before moving on.
3. Surface useful context: service owner, dependencies, recent related incidents.
4. If the runbook is exhausted or the engineer asks, give the escalation path:
   who to page next and how, plus how to open an incident.

Rules:
- Read-first. Suggest diagnostic/read steps freely; for any step that changes
  production state, restate it and ask for explicit confirmation before proceeding.
- Never invent a runbook step. If no runbook matches, say so and escalate.
- Be concise and calm — the responder is under pressure. One step at a time.
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Runbooks / playbooks | Validated, current remediation procedures by service/alert | Draft or deprecated runbooks |
| Service catalog | Owners, on-call rotations, dependencies, tier/criticality | Stale ownership records |
| Escalation matrix | Who's next by service and severity, and how to page them | Personal contact info that should stay in the paging tool |
| Incident history | Recent postmortems and known-issue notes | Sensitive details not cleared for broad reading |
| Architecture/dependency map | What depends on what, for blast-radius context | Diagrams that no longer reflect production |

!!! warning "Read-first is the safety model"
    An on-call agent is most dangerous when it confidently suggests a destructive action. Keep the agent **read-first**: diagnostics and reads flow freely, but any production-changing step must be restated and explicitly confirmed. Never let it invent a step the runbook doesn't contain — a wrong action during an incident makes things worse.

---

## Topics to configure

### Topic 1 — Alert intake & runbook match

**Trigger phrases:** "alert", "paged", "incident", "is down", "firing", "error rate"

**Flow:**
- Identify the service (ask if ambiguous)
- Match the alert name/symptom to a runbook
- If no confident match, say so and jump to escalation

---

### Topic 2 — Guided remediation

The core value. Walks the runbook one step at a time.

**Behaviour:**
- Present one step, with the command/check to run
- Wait for the engineer to report the result
- For any state-changing step, restate it and require explicit confirmation
- Branch based on the result toward resolution or the next step

---

### Topic 3 — Context & blast radius

**Behaviour:** On request (or proactively at incident start), surface the service owner, upstream/downstream dependencies, and recent related incidents so the responder understands the blast radius.

---

### Topic 4 — Escalation & incident bootstrap

**Behaviour:** When the runbook is exhausted or the engineer asks, return:
> "Next escalation: page **secondary on-call for [service]** via [tool]. If customer impact is confirmed, declare a Sev-2 and open an incident — I can create the channel with this runbook and context attached. Incident commander rotation: [link]."

---

## Power Automate action spec

**Inputs from agent:** `service`, `alert_name`, `severity`, `runbook_id`, `responder`, `context_summary`.

**Flow steps:**
1. Receive inputs from Copilot Studio (instant cloud flow)
2. Open an incident in [your incident tool — e.g. ServiceNow, Jira, PagerDuty incident]
3. Create the incident Teams channel and post the runbook + context summary
4. Page the next escalation tier via your paging connector
5. Return the incident ID and channel link to the agent

**Error handling:** If incident creation fails, the agent returns the escalation contacts and runbook link inline: "I couldn't open the incident automatically — page [tier] via [tool] and start the channel manually. Here's the context to paste: [summary]."

---

## Starter prompts

- "Paged for high error rate on checkout-service"
- "Database connection pool exhausted alert, what's the runbook?"
- "Runbook didn't fix it — who do I escalate to?"
- "Open a Sev-2 for the payments outage"

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | Known alert with a runbook | Matches runbook, walks step 1 | |
| 2 | State-changing step reached | Restates and asks for confirmation | |
| 3 | Alert with no matching runbook | Says so, routes to escalation | |
| 4 | "Who do I escalate to?" | Returns the correct next tier + how to page | |
| 5 | Context request | Returns owner, dependencies, recent incidents | |
| 6 | Sev-2 declaration, PA enabled | Incident + channel created, next tier paged | |
| 7 | PA connector down | Escalation contacts + runbook returned inline | |
| 8 | Ambiguous service | Asks which service before matching | |

---

## Deployment checklist

- [ ] Runbooks reviewed, current, and connected (no drafts/deprecated)
- [ ] Read-first rule tested — every state-changing step requires confirmation
- [ ] Service catalog and escalation matrix accurate and current
- [ ] Paging integration tested against the real on-call rotation
- [ ] Power Automate incident flow tested including the error path
- [ ] All 8 test cases pass
- [ ] Validated in a game-day / incident drill before production reliance
- [ ] MTTR baselined for a post-rollout review

---

## What to build next

- **Telemetry tie-in** — let the agent read recent metrics/logs to confirm a runbook step's effect
- **Postmortem starter** — generate a timeline from the incident channel when it resolves
- **Runbook gap report** — log alerts that had no matching runbook so the team can write them

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Add knowledge sources](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) · [Power Automate connector](https://learn.microsoft.com/en-us/power-automate/)

---

!!! tip "Want the full story first?"
    The [Engineering On-Call walkthrough](../walkthroughs/studio-functional-engineering-oncall.md) covers the read-first safety model, how to structure runbook matching, and how to validate it in a drill before you rely on it.

---
title: Configure an autonomous event-triggered agent
description: Build a Copilot Studio agent that acts when an event happens, without waiting for a user to start a conversation, real automation rather than a chatbot.
stage: studio
roles: [maker, it-admin]
tags: [studio, autonomous, triggers, power-automate, automation]
level: advanced
time: 45 min
status: walkthrough
prereqs: [copilot-studio-license, power-automate-access, environment-access]
updated: 2026-06-03
---

# Configure an autonomous event-triggered agent

> Build an agent that acts when something happens — without waiting for a user to start a conversation. Automation, not just a chatbot.

**Stage:** Copilot Studio · **For:** Maker, IT Admin · **Level:** Advanced · **Time:** 45 min

## When to use this

You want automation, not just a conversational assistant. The agent should monitor a condition and act when it's met: summarize a new file added to SharePoint and post it to a Teams channel, alert a manager when a Planner task goes overdue, generate a weekly digest on a schedule, or trigger an approval flow when a form is submitted.

Autonomous agents in Copilot Studio combine Studio's AI orchestration with Power Automate's event triggers and connectors — giving you the full power of event-driven automation with natural language instruction management.

## What you'll need

- **Copilot Studio** license with autonomous agent capabilities enabled in your environment
- **Power Automate** access in the same environment
- A clear trigger event and a clear action the agent should take

## Architecture overview

```
Event occurs in an external system
    ↓
Power Automate flow detects the event (SharePoint, Outlook, Forms, etc.)
    ↓
Flow calls the Copilot Studio agent via the Studio trigger
    ↓
Agent processes the event (reads content, runs AI steps, makes decisions)
    ↓
Agent executes the output action (posts to Teams, creates a record, sends email)
    ↓
(Optional) Agent logs the action for governance and monitoring
```

## Step by step

### 1. Define the trigger event

Choose the event that should start the agent's work. Common triggers:

- **File added to SharePoint** → summarize and notify
- **Form submitted** → process and route
- **Scheduled time** (daily, weekly) → generate a report or digest
- **Email with specific subject** → classify and respond
- **Planner task overdue** → alert the owner and manager

### 2. Build the Power Automate trigger flow

In Power Automate, create a flow with the appropriate trigger (SharePoint "When a file is created", Recurrence, etc.).

In the flow, add a step to **Run a Copilot Studio agent** (available in the Copilot Studio connector in Power Automate). Pass the event data as inputs to the agent — file URL, form response data, task name, etc.

### 3. Create the autonomous topic in Studio

In Copilot Studio, create a topic that handles the event type. This topic will be invoked by the Power Automate flow, not by a user typing.

The topic should:
1. Receive the input variables from the Power Automate flow
2. Apply AI processing (summarize, classify, extract key information)
3. Execute the output action (send a Teams message, create a record, etc.)
4. Return a status to the calling flow

Example topic instruction for a SharePoint summarization agent:

```
When a new document is added to SharePoint:
1. Read the document and generate a 3-bullet summary
2. Identify the document type (policy, project brief, meeting notes, other)
3. Post the summary to the [channel name] Teams channel with a link to the document
4. If the document type is "policy", also tag the HR admin
```

### 4. Configure the output actions

Add the action steps the agent should take after its AI processing. Use Power Automate flows (via the **Call an action** node) or direct connectors for:

- **Teams message:** use the Teams connector in a Power Automate child flow
- **Email notification:** use the Outlook connector
- **Record creation:** use the Dataverse or SharePoint connector

### 5. Add error handling

For autonomous agents, error handling is critical — there's no user to ask "did it work?"

- Add a condition to check the action result
- On failure, send a notification to an admin email or Teams channel
- Log every run (input + output + status) to a SharePoint list or Dataverse table for auditability

### 6. Test with sample events

Manually trigger the Power Automate flow with a test event before going live. Verify:
- Does the agent receive the correct inputs?
- Is the AI output (summary, classification) accurate?
- Did the output action execute correctly?

### 7. Monitor and tune

After go-live, review the agent's output daily for the first week. Autonomous agents can fail silently or produce low-quality output at scale. Use the Power Automate run history and the Copilot Studio Analytics tab to spot issues.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **Start with a narrow scope.** Your first autonomous agent should do one thing reliably — summarize files in one SharePoint library, not all files everywhere. Expand scope only after the narrow version is stable.
- **Human-in-the-loop:** for high-stakes actions (sending external emails, modifying records), add an approval step in Power Automate before the agent acts. The agent proposes, a human approves, the flow executes.
- **Scheduled digest:** the Recurrence trigger in Power Automate + a Studio summarization agent is the cleanest way to build a weekly digest from SharePoint or Teams content.
- **Cost awareness:** autonomous agents consume generative AI capacity. Add logging to track run volume and cost against your environment's AI capacity allocation.

## Watch out for

- **Silent failure.** With no user watching, a broken run goes unnoticed — wire failure notifications and a run log before you rely on it.
- **Scope sprawl.** Start with one library, one trigger, one action; expand only once the narrow version is stable.
- **Runaway capacity cost.** Autonomous runs consume generative AI capacity at machine speed — log run volume and watch it against your allocation.

## Where this leads (the ramp)

A single trigger-and-act agent is powerful, but real automation usually means many agents handing work to each other and recovering from failure on their own. That orchestration ceiling is where Azure AI Foundry takes over.

> **Next:** [Foundry: autonomous multi-agent orchestration](foundry-autonomous-orchestration.md)

## Related

- [Govern and monitor your agents at scale](studio-govern-monitor.md)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

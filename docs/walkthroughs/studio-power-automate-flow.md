---
title: Trigger a Power Automate flow from inside a Studio agent
description: Trigger a Power Automate flow from inside a Copilot Studio agent to create a ticket, update a record, or send a notification from a natural-language chat.
stage: studio
roles: [maker, it-admin]
tags: [power-automate, studio, actions, connectors]
level: intermediate
time: 30 min
status: walkthrough
prereqs: [copilot-studio-license, power-automate-access, environment-access]
updated: 2026-06-03
---

# Trigger a Power Automate flow from inside a Studio agent

> Connect your agent to real business systems — create a ticket, update a record, send a notification — triggered by a natural-language conversation.

**Stage:** Copilot Studio · **For:** Maker, IT Admin · **Level:** Intermediate · **Time:** 30 min

!!! info "Works on any harness — cost and coverage differ"
    This is a platform skill that applies whichever [harness](../pick-the-engine.md) powers your agent. Keep
    one thing in mind: the **standard** and **chat** harnesses are covered by a Microsoft 365 Copilot license
    inside Microsoft 365 channels, while the **GitHub Copilot harness** bills **Copilot Credits for all
    usage** and a license never covers it. [Compare the engines](../pick-the-engine.md) · [estimate the net cost](../credit-estimator.md).

## When to use this

Your agent is answering questions well, but users need it to *do* something in a downstream system: open a support ticket, update a Dataverse record, send an approval email, write a row to a SharePoint list, or log a request in ServiceNow. 

Actions bridge the gap between "agent answers" and "agent acts." This walkthrough covers connecting a Copilot Studio agent to a Power Automate flow so it can trigger real-world operations from a conversation.

## What you'll need

- **Copilot Studio** access and an existing agent to extend
- **Power Automate** access in the same environment
- A clear action scenario: what the user will say to trigger the action, and what the flow should do

## Architecture overview

```
User says: "Submit a request for [X]"
    ↓
Studio topic recognizes the intent
    ↓
Topic collects required variables (what, who, when)
    ↓
Topic calls a Power Automate flow via the "Call an action" node
    ↓
Flow executes in Power Automate (creates record, sends email, etc.)
    ↓
Flow returns a result to Studio
    ↓
Agent confirms to the user: "Done — your request has been submitted."
```

## Step by step

### 1. Build the Power Automate flow first

In Power Automate, create a new **Instant cloud flow** with the trigger `"When Copilot Studio calls a flow"`. Define the input parameters the flow will receive from Studio (e.g., `RequestType`, `RequesterName`, `Description`).

Add the action steps: create a Planner task, write a SharePoint list row, send an email — whatever the scenario requires.

Add a **Return value(s) to Power Virtual Agents** step at the end. Return at minimum a confirmation string: `"SubmissionStatus": "Success"` or an error message.

Save and test the flow in Power Automate before connecting it.

### 2. Add the action to your Studio agent

In Copilot Studio, open your agent. Go to **Actions** → **Add an action** → **Power Automate flows**. Select the flow you just created. Studio will automatically expose its input parameters as variables.

### 3. Create a topic that calls the action

Create a new topic. Define trigger phrases that match what users will naturally say:

- `"Submit a request for..."`
- `"Open a ticket for..."`
- `"Log a [type] request"`

In the topic, add **Question** nodes to collect each required input parameter. Then add a **Call an action** node pointing to your Power Automate flow. Map the collected variables to the flow's input parameters.

After the action node, add a **Message** node that uses the flow's return value to confirm the action:

```
Your request has been submitted. You'll receive a confirmation email shortly.
Reference: {SubmissionStatus}
```

### 4. Test end-to-end

In the Studio test panel, trigger the topic with one of your trigger phrases. Walk through the question/answer flow, then verify the action executed in the downstream system.

### 5. Handle errors gracefully

Add a **Condition** node after the action call that checks the return status. If the flow returned an error, route to a message: `"Something went wrong. Please try again or contact [support]."` — never let the agent silently fail.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **Use child flows for reuse:** if multiple topics need the same action (e.g., "notify a manager"), put the logic in a single Power Automate child flow and call it from each parent flow.
- **Approval flows:** Power Automate's approval connector lets your agent submit multi-step approvals — the agent collects the request, the flow routes it for sign-off, and the agent confirms back when approved.
- **Adaptive Cards for confirmation:** instead of a text confirmation, return an Adaptive Card from the flow to give users a rich summary of what was created.
- **Debugging:** use Power Automate's run history to debug flow failures — Studio won't show you what happened inside the flow.

## Watch out for

- **Silent action failures.** Always branch on the flow's return status and tell the user when something didn't go through — never let the agent confirm an action that failed.
- **Debugging blind.** Studio won't show you what happened inside the flow; use Power Automate's run history when an action misbehaves.
- **Unscoped permissions.** The flow runs with its connection's permissions — confirm it can only touch what this agent should.

## Where this leads (the ramp)

Power Automate connectors cover an enormous amount of ground, but some integrations need custom code, real-time APIs, or tools your flow can't express. That's the point where Azure AI Foundry's pro-code tool calling — via MCP — picks up.

> **Next:** [Foundry: connect pro-code tools with MCP](foundry-mcp-tools.md)

## Related

- [Govern and monitor your agents at scale](studio-govern-monitor.md)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

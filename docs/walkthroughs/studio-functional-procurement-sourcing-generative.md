---
title: "Procurement: Autonomous sourcing intake on the GitHub Copilot harness"
description: Build a sourcing intake agent that shortlists preferred vendors, checks policy gates, and opens compliant requisitions with generative planning.
stage: studio
harness: github-copilot
roles: [maker, it-admin]
tags: [copilot-studio, procurement, sourcing, vendors, policy, github-copilot-harness, generative-orchestration, functional]
level: intermediate
time: 3–4 hours
status: walkthrough
prereqs: [copilot-studio-access, knowledge-source]
updated: 2026-08-14
---

# Procurement: Autonomous sourcing intake on the GitHub Copilot harness

> Let the planner turn a purchase request into preferred vendors, policy gates, approval routing, and a requisition draft.

**Stage:** Copilot Studio · **For:** Maker, IT Admin · **Level:** Intermediate · **Time:** 3–4 hours

!!! abstract "Which harness? This one uses the GitHub Copilot harness"
    Every Copilot Studio agent runs on a [harness](../pick-the-engine.md) — the engine underneath it. This
    walkthrough builds on the **GitHub Copilot harness**, the autonomous, agentic engine: it **reasons
    through the whole goal on its own**, **retries and finds another path when a step fails**, works across
    your **Word, Excel, PowerPoint, and PDF** files, and keeps context with **skills and memory** — so you
    describe the outcome instead of authoring every path. That capability is why it's the engine to grow into.

    The honest tradeoff: it bills **Copilot Credits for all usage — building, testing, *and* running — and a
    Microsoft 365 Copilot license *never* covers it.** Want this same use case as predictable, rules-based
    topics your Microsoft 365 Copilot license already covers in Microsoft 365 channels? Build the
    **[standard-harness version](studio-functional-procurement-sourcing.md)** instead.
    [Compare the engines](../pick-the-engine.md) · [estimate the net cost](../credit-estimator.md).

## When to use this

Use this when purchase requests vary by category, spend, vendor status, and approval path. The agent has to gather intake details, shortlist preferred vendors, apply policy gates, and open a requisition without ever approving spend.

That multi-step judgment is where generative orchestration helps. The planner can consult the supplier list, policy, category guide, and approval matrix as needed, then call the requisition tool only when the request is ready for review.

## What you'll need

- **Copilot Studio access** with **Copilot Credits available** — building, testing, and running on this harness all consume credits.
- A current preferred-supplier list with contract status by category.
- Procurement policy: spend thresholds, approval matrix, sole-source rules, preferred-supplier rules, and competitive-bid rules.
- A category guide or standard-items catalog.
- A Power Automate connector to your procurement system: Ariba, Coupa, Dynamics, or the system your team uses.
- Procurement leadership sign-off on the encoded thresholds, gates, and approval matrix.

## Try it now — the prompt

Run this in Copilot Chat before you build. It drafts instructions that keep the agent in the preparation-and-routing lane, not the approval lane.

```
Write outcome-focused instructions for a Copilot Studio agent on the GitHub Copilot harness named "Sourcing Assistant" that turns purchase requests into compliant sourcing intake.

Use these specifics:
- Knowledge: [preferred-supplier list with contract status by category], [procurement policy], [approval matrix], and [category guide / standard-items catalog].
- Requisition tool/action: [Power Automate flow name] opens a requisition in [Ariba / Coupa / Dynamics] with the policy flags and approval chain.
- Intake fields to capture: item, quantity, estimated budget, category, required-by date, requester, cost center, and any preferred vendor.
- Policy gates to apply: spend thresholds, preferred-supplier rule, sole-source justification, competitive-bid requirement, and required approvals at this spend level.
- Boundary: never approve spend, commit spend, sign, or negotiate. Prepare a compliant request for human approval.

Include:
1. The agent's role, tone, and boundaries.
2. The reasoning steps the planner should follow.
3. When to use each knowledge source and when to use the requisition tool, described by purpose.
4. The response format for vendor shortlists, policy-gate results, approval routing, and requisition confirmation.
```

This works because it states the policy boundary and the gates the planner must evaluate. The planner can compose the intake, vendor shortlist, policy check, and requisition step without being allowed to approve or commit spend.

## Step by step

1. **Create the agent on the GitHub Copilot harness.** In Copilot Studio, create a new agent named something like "Sourcing Assistant." On the **Build** tab, use the **instructions editor** for the operating instructions and the **components panel** for knowledge, tools, and triggers.
2. **Write the instructions around sourcing outcomes.** Set the role, tone, and hard boundaries: the agent prepares and routes requests; it never approves, signs, commits spend, or negotiates. List the reasoning steps: capture intake, identify category, prefer standard catalog items, shortlist approved vendors, apply policy gates, route approvals, and open the requisition only after confirmation.
3. **Confirm generative orchestration is on.** Keep generative orchestration enabled so the agent plans across policy, supplier, and approval knowledge. Do not add trigger phrases for vendor or policy paths; describe when each component should be used.
4. **Add the procurement knowledge.** Add the preferred-supplier list, procurement policy, category guide, and approval matrix from the components panel. In the Test pane, ask for a vendor shortlist in a known category and confirm the agent returns preferred vendors with fit reasons and contract status.
5. **Add the requisition action.** Add the Power Automate flow that opens a requisition in Ariba, Coupa, Dynamics, or your procurement system. Map item, quantity, budget, category, required-by date, requester, cost center, selected vendor, policy flags, and approval chain. In the instructions, tell the agent to call it only after the gates are evaluated and the requester confirms the summary.
6. **Test the whole multi-step task.** In the Test pane, run a normal preferred-vendor request, an over-threshold request, an off-contract vendor request, and a sole-source request. Deliberately break a step — omit budget, choose a blocked vendor, or remove the sole-source justification — and confirm the agent asks for missing details or flags what is required to proceed compliantly. Each test run consumes Copilot Credits.
7. **Publish to a channel.** Publish to Teams or the procurement intake site. Start with one department, review requisitions and policy flags with procurement ops, then expand once the approval matrix and vendor guidance are behaving correctly.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the
numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright
tool in `tooling/screenshots/`._

## Make it better

- **Add a budget check.** Have the agent confirm the cost center has budget before it routes the request.
- **Normalize attached quotes.** Let requesters attach quotes and have the agent compare them side by side against the preferred-supplier list.
- **Log sourcing demand.** Store category, vendor, and policy-gate outcomes for spend analytics and contract-coverage gaps.
- **Add autonomous intake later.** Once the manual pilot is reliable, trigger the agent from a procurement form submission.

> **Learn more.** See [Agents powered by the GitHub Copilot harness](https://learn.microsoft.com/en-us/microsoft-copilot-studio/harnesses-overview)
> and the [Copilot Studio hub](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) on Microsoft Learn.

## Watch out for

- **Every action bills Copilot Credits — including build and test.** Set cost controls, keep the pilot bounded, and model the net cost before broad rollout.
- **Right-size the harness.** If the task is a predictable single-path flow, use the [standard-harness version](studio-functional-procurement-sourcing.md) instead; it is rules-based and Microsoft 365 channel usage is covered for licensed users.
- **Stale policy makes bad gates.** Thresholds and approval matrices change. Keep the source authoritative and dated.
- **Approval boundaries must be explicit.** Test that the agent never commits spend, signs, negotiates, or treats a routed requisition as approved.
- **Blocked vendors must stay blocked.** Exclude under-review and blocked suppliers from the source list, not just from the final recommendation.
- **Sole-source needs evidence.** Require a documented justification and flag it for review; preference is not a competition waiver.

## Where this leads (the ramp)

Evaluating policy gates and opening a requisition from one conversation keeps buyers on-contract. When sourcing spans supplier data, budget, approvals, and the ERP end to end, the orchestration belongs in Azure AI Foundry.

> **Next:** [Foundry: autonomous multi-agent orchestration](foundry-autonomous-orchestration.md)

## Related

- [Procurement: request to vendors to policy gates](studio-functional-procurement-sourcing.md) — the standard-harness version
- [Pick the engine for the job](../pick-the-engine.md)
- [Procurement Sourcing Agent solution template](../solutions/procurement-sourcing-agent.md)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

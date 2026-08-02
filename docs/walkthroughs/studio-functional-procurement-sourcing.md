---
title: "Procurement: request to vendors to policy gates"
description: Build a Copilot Studio agent that turns a purchase request into a shortlist of preferred vendors and applies policy gates, keeping spend fast and on contract.
stage: studio
roles: [maker, it-admin]
tags: [copilot-studio, procurement, sourcing, vendors, policy, functional]
level: intermediate
time: 3–4 hours
status: walkthrough
updated: 2026-06-05
---

# Procurement: request to vendors to policy gates

> Take a purchase request, return a shortlist of qualified preferred vendors, and apply the policy gates automatically — so people source fast and stay on contract instead of going off-contract by accident.

**Stage:** Copilot Studio · **For:** Procurement teams, finance operations, department buyers · **Level:** Intermediate · **Time:** 3–4 hours

> **📐 Full blueprint & test plan →** [Procurement Sourcing Agent](../solutions/procurement-sourcing-agent.md) — the copy-paste system prompt, topic specs, and test-case table behind this build.

---

## When to use this

Reach for this when employees buy things without knowing the rules — the approved vendor, the spend threshold that triggers an approval, when a competitive bid is required. The result is off-contract "maverick" spend and approval surprises. A sourcing agent gives requesters a compliant starting point: the right vendors and the exact gates their request has to clear, before anything is approved.

**Why Stage 6:** This is more than a policy lookup. The agent runs an intake, returns a category-specific vendor shortlist, evaluates the request against several policy gates (threshold, preferred-supplier, sole-source, competitive-bid), routes to the right approver, and opens a requisition through Power Automate. That rules evaluation plus the action is squarely Copilot Studio territory.

---

## What you'll need

- A Copilot Studio environment and maker permissions
- A current preferred-supplier list with contract status by category
- Your procurement policy: spend thresholds, approval matrix, sole-source and bid rules
- A category guide / standard-items catalog
- A Power Automate connector to your procurement system (Ariba, Coupa, Dynamics, etc.)
- Sign-off from procurement leadership on the encoded thresholds and matrix

---

## Try it now — the prompt

Paste this into the agent's instructions and adapt the brackets — it works because the policy gates and the "never commit spend" rule are explicit, so the agent prepares compliant requests without approving them.

The defining design decision is the **policy boundary**: the agent *prepares* a compliant request and *routes* it, but it never approves spend, signs, or negotiates. Everything it recommends has to be backed by current policy — an out-of-date threshold either blocks legitimate buys or waves through ones that needed approval.

Start from this prompt and adapt it:

```
You are the Sourcing Assistant for [Company Name]'s procurement team.

Take the request, return a shortlist of approved/preferred vendors for the
category, and apply our procurement policy gates before anything is approved.

When someone needs to buy something:
1. Capture what, quantity, estimated budget, category, and required-by date.
2. Return preferred/approved vendors for that category, with a one-line fit reason.
3. Apply policy gates: spend thresholds, preferred-supplier rules, sole-source
   justification, required approvals at this spend level.
4. Route to the right approver and summarise next steps.

Rules:
- Enforce policy. Flag over-threshold, off-contract, or non-preferred choices and
  state what's needed to proceed compliantly.
- Never commit spend, sign, or negotiate — prepare a compliant request for approval.
```

---

## Step by step

1. **Create the agent.** In Copilot Studio, create the sourcing agent and paste the system prompt. Name it for the team (e.g. "Sourcing Assistant").
2. **Connect knowledge.** Add the preferred-supplier list, procurement policy, category guide, and approval matrix.
3. **Build the intake topic.** Capture item, quantity, budget, category, and required-by date; ask once for anything missing.
4. **Build the vendor-shortlist topic.** Return preferred vendors for the category with fit reasons and contract status; surface standard catalog items first; never list blocked vendors.
5. **Build the policy-gates topic.** Evaluate threshold, preferred-supplier, sole-source, and competitive-bid gates, and state what's required when one fails.
6. **Build the approval-routing topic.** Identify approvers from the matrix and summarise next steps.
7. **Add the requisition action.** Wire Power Automate to open a requisition with the policy flags and approval chain. Always include an inline fallback.
8. **Pilot, then expand.** Roll out to one department, baseline off-contract spend, and review before broad rollout.

---

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- Add a **budget check** so the agent confirms the cost center has budget before routing.
- Let requesters **attach quotes** the agent normalises for side-by-side comparison.
- Log requests for **spend analytics** so procurement sees category demand and contract-coverage gaps.

---

## Watch out for

- **Stale policy.** Thresholds and the approval matrix change — keep them authoritative and dated, or the gates lie.
- **Approving by accident.** The agent must never commit spend or negotiate. Test that boundary on edge cases.
- **Blocked vendors slipping through.** Make sure under-review and blocked suppliers are excluded from the source list, not just deprioritised.
- **Sole-source loopholes.** Require a documented justification and flag it for review — don't let "I prefer this vendor" bypass competition rules.

## Where this leads (the ramp)

Evaluating policy gates and opening a requisition from one conversation keeps buyers on-contract. When sourcing spans many systems — supplier data, budget, approvals, the ERP — and you want it coordinated end to end, that orchestration lives in Azure AI Foundry.

> **Next:** [Foundry: autonomous multi-agent orchestration](foundry-autonomous-orchestration.md)

## Related

- [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Knowledge sources](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)
- [Power Automate](https://learn.microsoft.com/en-us/power-automate/)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

!!! tip "Ready to build? Use the solution template."
    The [Procurement Sourcing Agent solution template](../solutions/procurement-sourcing-agent.md) has the system prompt, topic specs, knowledge-source table, the policy-gate matrix, Power Automate requisition spec, and a full test matrix.

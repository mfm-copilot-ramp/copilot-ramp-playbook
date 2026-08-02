---
title: "Finance: Self-service expense and procurement guidance"
description: Build a Copilot Studio agent that gives employees instant answers on expense policy and procurement rules and guides them into the right process.
stage: studio
roles: [maker, it-admin, champion]
tags: [copilot-studio, finance, expense, procurement, knowledge, functional]
level: intermediate
time: 3–4 hours
status: walkthrough
updated: 2026-06-04
---

# Finance: Self-service expense and procurement guidance

> Give every employee instant answers on expense policy and procurement rules — and guide them directly into the right process rather than leaving them to hunt through the intranet.

**Stage:** Copilot Studio · **For:** Maker, IT Admin, Champion · **Level:** Intermediate · **Time:** 3–4 hours

> **📐 Full blueprint & test plan →** [Finance Expense & Procurement Agent](../solutions/finance-expense-agent.md) — the copy-paste system prompt, topic specs, and test-case table behind this build.

## When to use this

Finance teams spend significant time fielding queries that have clear, policy-based answers: What can I claim on expenses? What's the approval threshold for this purchase? How do I raise a PO? Where do I submit receipts?

These are answerable from policy documents — but employees often can't find the policy, misread it, or submit incorrectly anyway. A Finance guidance agent closes that loop: it gives the right answer, cites the policy, and offers to take the employee to the right form or system in one step.

**What makes this Stage 6** (not just Agent Builder): the most valuable Finance agents don't just answer — they guide the employee into the process and, where possible, pre-fill or link to the next action. That structured guidance flow and the ability to connect to tools like expense systems require topics and actions, not just knowledge.

## What you'll need

- **Copilot Studio access**
- Finance policy documents in SharePoint (expense policy, procurement policy, approval thresholds, travel policy)
- The **expense submission portal or system URL** (Concur, SAP, a SharePoint form — whatever your org uses)
- **30 minutes with Finance** to agree on what the agent covers, what it doesn't, and who to escalate to

## Try it now — the prompt

Run this prompt in Copilot Chat to scaffold the persona, topics, and happy path — it works because it pins thresholds to source documents and routes individual rulings to a human, the two things Finance agents most often get wrong.

Finance has a wider blast radius than HR if the agent gives a wrong answer — an employee who over-claims expenses because the agent said it was fine creates a real problem. Resolve these with Finance before building:

1. **What queries are safe to fully self-serve?** Policy questions (what can I claim, what are the thresholds) vs. individual rulings (is *this specific expense* claimable) — the latter must always go to Finance.
2. **What is the escalation for edge cases?** A named contact or shared inbox, not just "ask Finance."
3. **Which parts of the process change frequently?** Approval thresholds, travel policy limits, and system URLs tend to change. Make sure those live in the SharePoint docs (not baked into the agent instructions) so they update automatically.

```
Design a Copilot Studio Finance guidance agent for [Company].
Knowledge source: [our Finance SharePoint site / these policy documents].
Scope: expense claims, procurement and purchasing, travel policy, approval thresholds.
The agent should answer policy questions, guide employees to the right form/system,
and escalate individual rulings to [contact or DL].

Give me: persona instructions, 3 topics to configure, and the
happy-path conversation for an expense submission query.
```

## Step by step

1. **Create the agent.** Set instructions that position it clearly:

    > *You are the Finance Help agent for [Company]. You answer employee questions about expense policy, procurement, travel, and purchasing approvals using only the approved Finance documentation. Always cite the policy section. If the question requires an individual ruling — whether a specific expense is claimable, a specific exception — respond: "That needs a Finance review — please contact [contact/DL]."*

2. **Add your knowledge sources.** Point to Finance SharePoint pages or uploaded policy documents. Test your top-10 questions in the Test pane before building topics. Pay particular attention to approval threshold questions — these must cite the exact current figure.

3. **Build the expense submission guidance topic.** The most common structured flow: "How do I submit an expense?"
    - Confirm whether the employee is on the standard or contractor policy (if different rules apply)
    - Walk through the steps: gather receipts, categorise the expense, enter in [system], attach receipts, submit for approval
    - End with a direct link to the expense portal


4. **Build the "out of scope / individual ruling" escalation topic.** Trigger phrases include "is this claimable", "can I expense", "is this allowed for me", "exception", "my manager said". Response: "That's a question I can't answer from policy alone — it needs a Finance team review. Please contact [contact/DL] and reference the policy section I've shared."

5. **Add a procurement topic.** "How do I raise a PO?" and "What's the approval limit?" are the most common procurement queries. Walk through the steps and thresholds, link to the procurement system, and escalate anything above the agent's documented approval tiers.

6. **Test edge cases.** Run: "Can I expense a client dinner that cost £400?" — the agent should give the policy answer on entertainment limits, not rule on the specific case. "What's the approval threshold for software purchases?" — must return the current figure from the policy doc.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **Link directly to forms.** The single biggest UX improvement is ending a guidance answer with "Here's the link: [expense portal / PO system / approval form]." Employees who get the policy answer and the form link in one response are far more likely to submit correctly.
- **Month-end awareness.** Add a starter prompt for "When is the expense deadline this month?" — Finance teams can update a simple SharePoint page with the current deadline and the agent surfaces it automatically.
- **Currency and region variants.** If your org operates across geographies with different expense rules, structure the knowledge source clearly by region and have the agent confirm the employee's location before answering threshold questions.

## Watch out for

- **Hardcoding thresholds in the instructions.** Put all approval limits and policy figures in the SharePoint documents, never in the agent instructions. When Finance updates the policy, the agent updates automatically — no rebuild required.
- **VAT, tax, and compliance nuances.** Keep the agent out of tax advice entirely. If a question touches VAT reclaim eligibility or tax treatment of specific expenses, escalate unconditionally to Finance or Tax.
- **System URL rot.** If you link to expense portals or form URLs in topics or knowledge docs, those links break when systems are upgraded. Build a simple SharePoint page that holds current links and point the agent at that page rather than hardcoding URLs.

## Where this leads (the ramp)

Guiding employees to the right form and policy is the high-value, low-risk first layer. When the agent needs to actually file the claim in Concur or SAP — not just link to it — you're into pro-code tool integration, and that's where Azure AI Foundry's MCP tooling comes in.

> **Next:** [Foundry: connect pro-code tools with MCP](foundry-mcp-tools.md)

## Related

- [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
- [Knowledge overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)
- [Add actions](https://learn.microsoft.com/en-us/microsoft-copilot-studio/advanced-flow)
- [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

!!! tip "Ready to build? Use the solution template."
    The [Finance Expense & Procurement Agent solution template](../solutions/finance-expense-agent.md) gives you a copy-paste system prompt, Finance-specific topics, all 8 test cases, and a deployment checklist — adapt the bracketed values and build.

---
title: Build an expense-policy helper agent
description: Create a no-code expense helper grounded on travel and expense policy docs so teammates get cited guidance before submitting claims.
stage: agent-builder
roles: [maker, champion]
tags: [agent-builder, expenses, travel, policy, team]
level: starter
time: ~20 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-08-29
---

# Build an expense-policy helper agent

> Help teammates check what is claimable, which limits apply, and how to submit an expense without searching the policy every time.

**Stage:** Agent Builder · **For:** Maker, Champion · **Level:** Starter · **Time:** ~20 min

## When to use this
Use this when expense and travel rules are documented, but people still ask what is claimable, which limit applies, or where to submit. Agent Builder can create a no-code declarative agent grounded on the approved expense docs, with instructions to cite policy and send personal reimbursement cases to finance.

## What you'll need
- **M365 Copilot license** with access to Agent Builder in Microsoft 365 Copilot
- Approved **expense, travel, reimbursement, and submission-process docs** in SharePoint, a document library, or OneDrive
- The right finance contact, helpdesk queue, or channel for personal reimbursement questions and exceptions

## Try it now — the build
In the Agent Builder conversation, describe the expense helper clearly:

```
Create an agent called "[Team or Org] Expense Helper".
Ground it only on [SharePoint site, document library, or OneDrive folder URL]
containing our approved expense, travel, reimbursement, and submission
process documents. It answers questions about what is claimable, spending
limits, required receipts, approval steps, and how to submit an expense.
Always cite the source document and include the relevant limit or process
step when the docs provide one. If the question is about a personal
reimbursement case, an exception, missing payment, tax treatment, or
anything not covered by the docs, direct the person to [finance contact or
queue]. Do not make eligibility decisions beyond the cited policy.
```

**Why this works:** it keeps the agent on approved finance content, asks for practical claim guidance, and separates general policy help from personal reimbursement handling. That boundary is what keeps a useful helper from becoming an unofficial finance decision-maker.

## Step by step
1. **Open Agent Builder.** In Microsoft 365 Copilot, start creating a new agent and name it so people know it covers expense policy, not all finance questions.
2. **Add the knowledge source.** Point it at the approved expense and travel policy docs plus the submission-process guidance. Exclude draft guidance and country-specific docs if they are not meant for this audience.
3. **Write the instructions.** Paste the build prompt above, replacing the bracketed values with your source location and finance escalation route.
4. **Add starter prompts.** Seed questions such as "Is this meal claimable?", "What receipts do I need?", "What is the travel limit?", and "How do I submit an expense?"
5. **Test common scenarios.** Ask about a claimable item, a limit, and the submission process. Confirm the agent cites policy and includes the relevant process step.
6. **Test personal cases.** Ask about a missing reimbursement or an exception. Confirm the agent directs the user to finance instead of deciding the case.
7. **Share with the team.** Share only with the audience covered by the source policies and tell them it is for policy guidance, not personal finance support.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Make the helper more useful before a claim is submitted:
- **Ask for answer structure.** Have it return claimability, limit, required evidence, submission step, and cited source.
- **Add regional boundaries.** If policies differ by location, instruct the agent to ask for the user's region before answering.
- **Keep process docs current.** Submission screens and approval routes change; update the grounded docs when the process changes.
- **Collect confusion points.** Use team feedback to improve the policy wording rather than patching around unclear docs in the agent.

> **📚 Learn more.** See Microsoft Learn for [extending Microsoft 365 Copilot](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/) and the Agent Builder path into declarative agents.

## Watch out for
- **Personal reimbursement cases need finance.** The agent should not decide exceptions, missing payments, or tax-sensitive questions.
- **Policy scope may vary.** A team helper grounded on one policy set may be wrong for another country, business group, or employment type.
- **A cited answer can still be outdated.** Keep the source policy and submission docs current.
- **Submission actions need more than Agent Builder.** If you want the agent to file claims, check claim status, or route approvals, use Studio.

## Where this leads (the ramp)
You built a no-code helper that answers from expense knowledge and escalates personal cases. When the agent needs to submit claims, connect to finance systems, enforce approvals, or apply governed business rules, move to **Stage 6 · Copilot Studio**.

> **Next:** [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

## Related
- [Build a team policy helper agent](../walkthroughs/agent-builder-policy-helper-agent.md)
- [Agent Builder → Decide: declarative agent vs. full Copilot Studio](../walkthroughs/agent-builder-vs-studio.md)
- [Stage 4 · Agent Builder](../stages/stage-4-agent-builder.md)

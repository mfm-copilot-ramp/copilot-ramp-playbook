---
title: Compare options in a decision table
description: Use Copilot to compare options in a side-by-side decision table across criteria that matter and end with a clear recommendation.
stage: chat
roles: [end-user, manager]
tags: [chat, decisions, comparison, productivity]
level: starter
time: 5 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-08-29
---

# Compare options in a decision table

> Turn a messy choice into a side-by-side table that shows tradeoffs, scores the criteria, and recommends a path.

**Stage:** Copilot Chat · **For:** End user, Manager · **Level:** Starter · **Time:** 5 min

## When to use this
You have several options and a decision is getting stuck in opinions, partial facts, or side conversations. Copilot Chat can turn the options into a decision table so people can see the tradeoffs side by side.

Use this when the criteria matter as much as the options: cost, speed, risk, customer impact, effort, reversibility, or stakeholder fit.

## What you'll need
- **M365 Copilot license** — Microsoft 365 Copilot Chat in Teams, Outlook, Word, or the Microsoft 365 Copilot app
- No agents or setup — just paste the prompt into the chat you already use
- A list of options you are considering
- The criteria that should drive the decision, even if they are rough

## Try it now — the prompt
Open Microsoft 365 Copilot Chat and paste:

```
Help me compare options for this decision: [decision to make].

Options:
- [option 1]
- [option 2]
- [option 3]

Criteria that matter:
- [criterion 1]
- [criterion 2]
- [criterion 3]
- [criterion 4]

Context and constraints:
[deadline, budget, stakeholders, must-haves, known risks]

Return:
- A side-by-side decision table with one row per criterion and one column per option
- A 1-5 score for each option on each criterion, with a short reason
- The tradeoff that matters most
- Your recommendation and why
- What new information would change the recommendation
```

**Why this works:** it separates options from criteria, which reduces vague debate. Asking what would change the recommendation keeps the output honest instead of pretending the first answer is final.

## Step by step
1. **List the options plainly.** Do not worry about perfect wording; one line per option is enough.
2. **Name the criteria.** If you are unsure, include the obvious ones and add:
   ```
   Add any missing criteria that a decision-maker would expect.
   ```
3. **Read the table across, not down.** Compare how each option performs against the same criterion before reacting to the total.
4. **Challenge the scores.** Ask Copilot to explain any score that feels too high or too low.
5. **Share the table.** Paste it into a Teams chat, email, or document and ask stakeholders which criterion they would weight differently.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Add weights:** "Weight the criteria as [list weights] and recalculate the recommendation."
- **Make it neutral:** "Rewrite the table so it does not favour my current preference unless the evidence supports it."
- **Stress-test the choice:** "What is the strongest case against the recommended option?"
- **Prepare for discussion:** "Turn this into a short decision brief with the table, recommendation, and open questions."

## Watch out for
- **Scores can look more precise than they are.** Treat them as a conversation aid unless they come from real data.
- **Missing criteria skew the answer.** Add stakeholder, risk, or operational criteria if they matter.
- **A recommendation is not approval.** Use the table to clarify the decision, then confirm ownership and next steps.

## Where this leads (the ramp)
Once comparison tables become routine, the next step is a guided experience that helps collect inputs, apply standard criteria, and keep decisions moving with less manual prompting.

> **Next:** [Stage 2 · First-Party Agents](../stages/stage-2-first-party.md)

## Related
- [Weigh a decision with pros, cons, and a recommendation](chat-pros-cons.md)
- [Brainstorm solutions with structured tradeoffs](chat-brainstorm.md)
- [Stage 2 · First-Party Agents](../stages/stage-2-first-party.md)

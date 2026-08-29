---
title: Turn a dataset into a narrative brief
description: Hand Cowork a spreadsheet or export to draft a narrative brief with trends, outliers, recommended action, and a supporting table.
stage: cowork
roles: [end-user, manager, champion]
tags: [cowork, data, analysis, briefing]
level: intermediate
time: 20 min
status: walkthrough
prereqs: [m365-copilot-license, cowork-access]
updated: 2026-08-29
---

# Turn a dataset into a narrative brief

> Move from a spreadsheet or export to a narrative brief that explains the trend, the outliers, and the action to take.

**Stage:** Cowork · **For:** End user, Manager, Champion · **Level:** Intermediate · **Time:** 20 min

## When to use this
You have a spreadsheet, CSV export, or table of operational data, and stakeholders need the story behind the numbers rather than another raw chart. Cowork can inspect the data, identify patterns and outliers, draft a concise narrative, and include a supporting table you can verify.

Use this when the goal is a decision or recommendation, not exploratory analysis for its own sake.

## What you'll need
- **M365 Copilot license** with **Cowork** access
- A spreadsheet, export, or table with enough context to explain the columns and time period
- A decision question, audience, and any known caveats about the data

## Try it now — the prompt
Give Cowork the dataset and the decision context:

```
Using the attached [spreadsheet/export], write a narrative brief for [audience]
answering this question: [decision question].

Please include:
1. A one-paragraph executive summary
2. The key trends in the data
3. Outliers or segments that need attention
4. A table showing the most important figures, with clear column labels
5. A recommended action and rationale
6. Data caveats, missing fields, or checks I should run before sharing

Use only the data provided unless I give you additional context. If you calculate
anything, show the formula or method in plain language.
```

**Why this works:** it frames the analysis around a decision and requires Cowork to show its method. That makes the brief easier to verify and reduces the risk of a polished story built on unclear calculations.

## Step by step
1. **Prepare the data.** Clean obvious duplicates, confirm column names, and include a short note explaining the time period and business context.
2. **Hand off the analysis.** Attach the file, paste the prompt, and state the decision question plainly.
3. **Check the summary against the table.** The story and the numbers should agree. If they do not, ask Cowork to reconcile them before revising prose.
4. **Review calculations and caveats.** Make sure any percentages, rankings, or comparisons use the right denominator and time period.
5. **Pressure-test the recommendation.** Ask whether the action follows from the data or needs outside context.
6. **Ask for a stakeholder-ready version:**
   ```
   Revise this into a one-page brief for [audience]. Keep the table, make the
   recommendation explicit, and list the checks I should complete before sharing.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Ask for alternative cuts.** "Compare the story by [region / segment / product / month] and say whether the recommendation changes."
- **Create a decision slide.** "Turn this brief into a single slide with headline, evidence table, and recommendation."
- **Add a caveat section.** "Separate confirmed findings from hypotheses that need more data."
- **Prepare follow-up questions.** "List the questions a leadership audience is likely to ask and the data needed to answer them."

## Watch out for
- **Data quality still belongs to you.** Cowork can spot oddities, but it cannot know whether the export is complete or current unless you tell it.
- **Outliers need context.** A spike, dip, or missing value may be a real signal, a timing issue, or a data error.
- **A narrative can overfit the data.** Ask Cowork to state confidence and caveats before you present a recommendation.
- **Sensitive data needs care.** Remove or mask personal, customer, or confidential fields unless they are required for the task.

## Where this leads (the ramp)
When the same dataset needs regular monitoring and narrative updates, the next step is an always-on agent that watches for changes and drafts the brief for review. That is **Stage 5 · Autopilots**.

> **Next:** [Stage 5 · Autopilots](../stages/stage-5-autopilots.md)

## Related
- [First-party agents → Analyst dataset](first-party-analyst-dataset.md)
- [Chat → Compare options](chat-compare-options.md)
- [Stage 3 · Cowork](../stages/stage-3-cowork.md)

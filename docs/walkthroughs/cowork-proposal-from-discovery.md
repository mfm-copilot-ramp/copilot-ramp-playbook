---
title: Turn discovery notes into a first-draft proposal
description: Cowork turns discovery notes and a proposal template into a first draft covering problem, approach, scope, timeline, and pricing placeholders.
stage: cowork
roles: [end-user, champion]
tags: [cowork, proposal, discovery, sales, drafting]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [m365-copilot-license, cowork-access]
updated: 2026-08-29
---

# Turn discovery notes into a first-draft proposal

> Hand Cowork your discovery notes and proposal template, then review a structured first draft instead of assembling the proposal from scratch.

**Stage:** Cowork · **For:** End user, Champion · **Level:** Intermediate · **Time:** 15 min

## When to use this
You have notes from discovery calls, customer emails, and a standard proposal template, but the first draft is still stuck in your head. Cowork can do the multi-step work of extracting the problem, mapping it to an approach, shaping scope, and leaving the commercial details ready for your judgement.

Use this when you need a solid proposal starting point quickly and you are prepared to verify the facts, commitments, and pricing before it leaves your organisation.

## What you'll need
- **M365 Copilot license** with **Cowork** access
- Discovery notes, call transcripts, customer requirements, and the proposal template or prior approved example you want Cowork to follow
- Your boundaries for scope, assumptions, timeline, and any pricing language that must remain a placeholder

## Try it now — the prompt
Give Cowork the discovery material and the template constraints:

```
Using [discovery notes], [customer emails], and [proposal template], draft a
first-pass proposal for [customer or project]. Include problem statement,
current situation, recommended approach, scope, out of scope items, timeline,
assumptions, risks, success measures, and a pricing placeholder. Preserve the
template structure where it helps, cite the source for important claims, and flag
anything that needs human confirmation before sharing.
```

**Why this works:** it tells Cowork to use the template, extract the proposal logic from discovery, and separate confident draft content from items you still need to validate.

## Step by step
1. **Choose the right source set.** Include the notes that capture the customer's words, the constraints you heard, and the approved proposal pattern.
2. **Send the prompt with the files attached or referenced.** Cowork reads the inputs, maps discovery themes into proposal sections, and drafts the first version.
3. **Review problem and scope before style.** Confirm the proposal is solving the right problem and not adding commitments that were never discussed.
4. **Replace placeholders deliberately.** Add pricing, dates, owners, and legal or procurement language only after you have checked the source and approval path.
5. **Ask Cowork for a revision pass.** For example:
   ```
   Tighten the executive summary for [decision maker], make the scope table more
   specific, and list the top open questions I should resolve before sending.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Turn the first draft into a proposal package:
- **Adapt to the buyer.** "Rewrite the executive summary for [persona] and focus on outcomes they care about."
- **Add a decision path.** "Create a short mutual action plan from this proposal with owner, milestone, and dependency columns."
- **Stress-test the scope.** "Identify where the scope is vague, risky, or missing acceptance criteria."
- **Prepare the send note.** "Draft the email that introduces this proposal and calls out the sections I want feedback on."

## Watch out for
- **Do not let Cowork invent commitments.** Treat scope, dates, service levels, discounts, and pricing as placeholders until approved.
- **Discovery notes can be biased.** If only one stakeholder was present, Cowork may over-index on that point of view.
- **Templates matter.** If the template includes required legal or compliance language, verify it remains intact after the draft.

## Where this leads (the ramp)
After Cowork can turn discovery into a proposal draft, the next step is an agent that monitors new discovery notes and prepares draft proposal packages on a trigger. That pattern belongs in **Stage 5 · Autopilots**.

> **Next:** [Autopilots → Track deliverables across workstreams](../walkthroughs/autopilots-track-deliverables.md)

## Related
- [Cowork → Respond to an RFP](../walkthroughs/cowork-rfp-response.md) — a more formal response workflow
- [Cowork → Hand off an end-to-end task to Cowork](../walkthroughs/cowork-end-to-end-task.md) — the Stage 3 flagship
- [Stage 3 → Cowork](../stages/stage-3-cowork.md)

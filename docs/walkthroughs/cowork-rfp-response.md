---
title: Draft an RFP or proposal response from scattered source docs
description: Use Copilot Cowork to turn an RFP and scattered internal docs into a structured first-draft response, so you shape and polish rather than write from nothing.
stage: cowork
roles: [end-user, manager, champion]
tags: [proposals, rfp, writing, cowork]
level: intermediate
time: 30 min
status: walkthrough
prereqs: [m365-copilot-license, cowork-access]
updated: 2026-06-03
---

# Draft an RFP or proposal response from scattered source docs

> Turn an RFP and your scattered internal docs into a structured first-draft response — so you're shaping and polishing rather than writing from nothing.

**Stage:** Cowork · **For:** End user, Manager · **Level:** Intermediate · **Time:** 30 min

## When to use this

You have an RFP, SOW, or grant application to respond to, and the inputs are scattered: capability statements in SharePoint, past proposal sections in old Word docs, pricing templates, case studies, and reference materials across half a dozen locations. Pulling it together into a coherent first draft is the slow part.

Cowork reads all the source materials, maps the RFP requirements to your available content, drafts the response sections, and flags where you have a gap and need a human to fill it in.

## What you'll need

- **M365 Copilot license** with access to **Cowork**
- The RFP or proposal requirements document
- Your source materials: capability docs, past proposal sections, case studies, bios, pricing templates
- The response deadline and any formatting requirements from the RFP

## Try it now — the task description

Open Cowork and describe the task:

```
Draft a response to the attached RFP for [brief description of what's being bid on].

Use the attached source documents for our capabilities, case studies, and team bios.

For each section of the RFP requirements:
1. Draft a response using the most relevant content from our source documents
2. Note the word limit or format requirement from the RFP (if specified)
3. Flag any section where our source documents don't have strong coverage — mark it [NEEDS HUMAN INPUT]

Structure the output to match the RFP section order exactly.
Tone: [professional and direct / formal government / conversational B2B].
```

**Why this task format works:** Matching the output structure to the RFP section order makes the draft usable immediately. The `[NEEDS HUMAN INPUT]` instruction surfaces gaps explicitly — so you know exactly where to focus your writing time rather than discovering gaps during a review pass.

## Step by step

1. **Attach all your source documents** — the RFP and your internal capability materials.
2. **Run the task.** Cowork will cross-reference the RFP requirements against your docs section by section.
3. **Work the `[NEEDS HUMAN INPUT]` flags first.** These are the gaps that matter most. Write those sections yourself while the well-covered sections need only light editing.
4. **Tighten the drafted sections:**
   ```
   The section on [capability] is too generic. We specifically did [X] for [Y] client — rewrite it to lead with that example.
   ```
5. **Run a compliance check at the end:**
   ```
   Review the full draft against the RFP requirements. Are there any requirements that haven't been addressed?
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **Executive summary first:** once all sections are drafted, ask Cowork to write the executive summary last — it can draw from the complete draft for accuracy.
- **Word count management:** add `"Each section should stay within the word limit specified in the RFP. Note the actual word count at the end of each section."` to the task.
- **Past proposal library:** if you have past winning proposals, attach them as additional source material — Cowork will draw on the strongest language and structure.
- **Compliance matrix:** ask for `"A separate compliance matrix table: each RFP requirement as a row, with the section number where we addressed it."` — saves time if the evaluator requires it.

## Watch out for

- **Work the `[NEEDS HUMAN INPUT]` flags before anything else.** Those gaps are exactly where an unedited draft loses the bid.
- **Cowork drafts from your capability docs and can overstate a claim your evidence doesn't fully support.** Every compliance-relevant line needs a human check.
- **A section can read well and still miss a requirement.** Run the final compliance pass against the RFP requirements list, not the draft.

## Where this leads (the ramp)

Once your proposal team is running this RFP workflow on every bid, the task description itself becomes worth productizing. Agent Builder turns it into a reusable proposal-response agent — grounded on your capability library — that anyone on the team can launch.

> **Next:** [Stage 4 · Agent Builder](../stages/stage-4-agent-builder.md)

## Related

- [Build a deck from raw notes](cowork-deck-from-notes.md)

---
title: Build a competitive comparison from multiple source documents
description: Use Copilot Cowork to turn competitor briefs, product pages, and analyst notes into a structured comparison matrix for exec review or sales enablement.
stage: cowork
roles: [manager, end-user, champion]
tags: [strategy, research, cowork, competitive]
level: intermediate
time: 20 min
status: walkthrough
prereqs: [m365-copilot-license, cowork-access]
updated: 2026-06-03
---

# Build a competitive comparison from multiple source documents

> Turn a folder of competitor briefs, product pages, and analyst notes into a structured comparison matrix — ready for an exec review or sales enablement.

**Stage:** Cowork · **For:** Manager, End user · **Level:** Intermediate · **Time:** 20 min

## When to use this

You have a competitive review coming up. You've gathered research — product comparison docs, analyst reports, pricing pages, maybe some field notes from sales conversations — but it's scattered across files and formats. Synthesizing it manually into a structured comparison takes hours.

Cowork reads all the source documents in parallel, extracts the relevant dimensions, and produces a comparison matrix or narrative brief that would take a human analyst half a day to build.

## What you'll need

- **M365 Copilot license** with access to **Cowork**
- At least 2-3 source documents per competitor (or a single comprehensive source per competitor)
- A clear list of the comparison dimensions that matter for your use case

## Try it now — the task description

Open Cowork and describe the task:

```
Build a competitive comparison of [Competitor A], [Competitor B], and [Competitor C]
based on the attached documents.

Compare them across these dimensions:
1. Core product capabilities / what it does
2. Target customer and use case
3. Pricing model (if available)
4. Key strengths
5. Key weaknesses or gaps
6. How they position against us / [your product or service]

Format the output as:
- A comparison table (competitors as columns, dimensions as rows)
- A 2-paragraph narrative summary: where we're stronger and where we're at risk

Audience: [sales team / product team / leadership team].
```

**Why this task format works:** Specifying the comparison dimensions before Cowork runs prevents it from choosing dimensions that don't match your decision context. The table + narrative combination serves two use cases — the table for quick reference, the narrative for exec-level communication.

## Step by step

1. **Gather your sources.** Attach the competitor research docs to Cowork. The more consistent the source quality across competitors, the more balanced the output.
2. **Run the task.** Cowork will process all documents in parallel and populate the matrix.
3. **Spot-check the cells.** For any cell that seems vague or wrong, ask:
   ```
   What specific evidence from the source documents supports the claim about [Competitor A]'s [dimension]?
   ```
4. **Fill gaps.** If a dimension is empty for one competitor, ask:
   ```
   Is there any information in the documents about [Competitor B]'s pricing? If not, note it as "not disclosed."
   ```
5. **Sharpen the narrative:**
   ```
   Rewrite the narrative section to be more direct about our biggest risk and our clearest differentiator.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **Win/loss lens:** add a section `"Based on the positioning differences, what situations favor us and what situations favor each competitor?"` — useful for sales coaching.
- **From web research:** if you don't have existing docs, ask the **Researcher** agent to gather competitor intelligence first, then hand the output to Cowork for structuring.
- **Refresh cadence:** save the task description as a recipe and re-run it quarterly with updated source documents.
- **Product team variant:** add `"Feature comparison table: list specific capabilities and mark each competitor as 'Yes / Partial / No' for each."` — useful for roadmap prioritization.

## Watch out for

- **The matrix is only as balanced as your sources.** Thin or dated material on one competitor produces a confidently wrong cell.
- **Cowork won't flag what's missing unless you ask.** Empty or vague cells need a “what evidence supports this?” pass.
- **Positioning claims pulled from marketing docs describe how a competitor sells, not how they perform.** Keep the two separate.

## Where this leads (the ramp)

Running this comparison once is a half-day saved; running it every quarter means rebuilding the same task each time. In Agent Builder you can package the whole competitive-research routine as a Research Librarian agent your team invokes on demand.

> **Next:** [Agent Builder: build a Research Librarian agent](agent-builder-research-librarian.md)

## Related

- [Research a market and write a landscape brief](cowork-market-research-brief.md)

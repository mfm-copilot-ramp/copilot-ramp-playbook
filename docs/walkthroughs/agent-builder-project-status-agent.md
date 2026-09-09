---
title: Build a project status agent for your team
description: Build a no-code project status agent grounded on team docs so everyone can ask for progress, risks, owners, and next milestones.
stage: agent-builder
roles: [maker, champion]
tags: [agent-builder, project-status, sharepoint, team, no-code]
level: intermediate
time: ~20 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-08-29
---

# Build a project status agent for your team

> Give the team one cited place to ask where the project stands, what is at risk, who owns what, and what comes next.

**Stage:** Agent Builder · **For:** Maker, Champion · **Level:** Intermediate · **Time:** ~20 min

## When to use this
Use this when project updates live across a SharePoint site, plan docs, meeting notes, and status reports, and every stand-up starts with the same questions. Agent Builder is the lightweight, no-code maker in Microsoft 365 Copilot: give a declarative agent a name, instructions, knowledge sources, starter prompts, then share it with the team.

## What you'll need
- **M365 Copilot license** with access to Agent Builder in Microsoft 365 Copilot
- A **SharePoint site, document library, or OneDrive folder** with the project plan, status updates, risk log, decision log, and milestone docs
- A project owner who can confirm the first answers are accurate before you share the agent broadly

## Try it now — the build
In the Agent Builder conversation, describe the status helper you want:

```
Create an agent called "[Project Name] Status Agent".
Ground it only on [SharePoint site, document library, or OneDrive folder URL]
containing the project plan, status updates, risk log, decision log, and
milestone docs. Its job is to answer team questions about where we are,
open risks, blockers, owners, decisions, and next milestones. Always cite
the source file and date if available. Prefer the latest dated document
when sources conflict. If the answer is missing or stale, say that and
direct the person to [project owner or channel]. Do not invent dates,
owners, or commitments.
```

**Why this works:** it gives the agent a tight knowledge boundary, tells it which status signals matter, requires citations, and defines safe behaviour when project facts are missing or out of date. The result is a reusable team answer surface, not another private summary.

## Step by step
1. **Open Agent Builder.** In Microsoft 365 Copilot, start creating a new agent and give it a project-specific name your team will recognise.
2. **Add the knowledge source.** Point it at the SharePoint site, library, or OneDrive folder that contains the current project docs. Keep the scope narrow enough that answers come from the project record, not unrelated team content.
3. **Write the instructions.** Paste the build prompt above, replacing the bracketed values. Keep the rules about citations, latest dated sources, and not inventing owners or commitments.
4. **Add starter prompts.** Use questions the team already asks, such as "Where are we this week?", "What risks need attention?", "Who owns the next milestone?", and "What changed since the last status update?"
5. **Test before sharing.** Ask a question with an answer you know. Confirm the response cites the right document, chooses recent information, and says when the source material is stale or missing.
6. **Share with the team.** After the project owner validates the behaviour, share the agent with the team or project group that already has access to the same source docs.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Turn a status helper into a trusted project cockpit:
- **Clean up the source folder.** Archive superseded plans and clearly date status updates so the agent has a reliable latest view.
- **Standardise the answer shape.** Ask it to answer with sections for summary, risks, owners, next milestones, and source links.
- **Teach conflict handling.** Add a rule to call out conflicting docs instead of silently choosing one when dates are unclear.
- **Review after key updates.** Re-test the starter prompts after major plan changes so the shared answers stay useful.

> **📚 Learn more.** See Microsoft Learn for [extending Microsoft 365 Copilot](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/) and the Agent Builder path into declarative agents.

## Watch out for
- **Stale docs create stale confidence.** The agent can cite an old plan perfectly; keep the project source tidy.
- **Grounding is not permission clean-up.** Share only with people who should already see the project documents.
- **It summarises; it does not manage the project.** Treat answers as a cited status view, not a substitute for owner confirmation.
- **No real actions yet.** If you need it to update tasks, create risks, or trigger approvals, move beyond Agent Builder.

## Where this leads (the ramp)
You built a no-code team agent that answers from project knowledge. When the agent needs real actions, connectors, managed topics, environment controls, or stronger governance, that is the cue for **Stage 6 · Copilot Studio**.

> **Next:** [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

## Related
- [Build a team-knowledge agent over a SharePoint site](../walkthroughs/agent-builder-team-knowledge.md)
- [Agent Builder → Decide: declarative agent vs. full Copilot Studio](../walkthroughs/agent-builder-vs-studio.md)
- [Stage 4 · Agent Builder](../stages/stage-4-agent-builder.md)

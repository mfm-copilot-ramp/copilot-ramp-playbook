---
title: Build a team policy helper agent
description: Create a no-code policy helper grounded on team process docs so teammates get cited how-to answers and know when to ask a human.
stage: agent-builder
roles: [maker, champion]
tags: [agent-builder, policy, process, sharepoint, team]
level: starter
time: ~20 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-08-29
---

# Build a team policy helper agent

> Turn your team's policy and process docs into a shared helper that answers how-to questions with citations and knows when to hand off.

**Stage:** Agent Builder · **For:** Maker, Champion · **Level:** Starter · **Time:** ~20 min

## When to use this
Use this when team process knowledge is documented but hard to find, so the same policy questions keep landing in chat. A lightweight Agent Builder agent can sit over the approved docs, answer in plain language, cite the source, and escalate edge cases to the right human.

## What you'll need
- **M365 Copilot license** with access to Agent Builder in Microsoft 365 Copilot
- A **SharePoint site, document library, or OneDrive folder** that contains the approved policy, process, and how-to docs
- A named human escalation path, such as [team operations owner], [manager], or [support channel]

## Try it now — the build
In the Agent Builder conversation, describe the helper your team needs:

```
Create an agent called "[Team Name] Policy Helper".
Ground it only on [SharePoint site, document library, or OneDrive folder URL]
with our approved policy, process, and how-to documents. It answers team
questions about how to follow a process, which policy applies, where the
source document is, and what the next step should be. Always cite the
source document and quote the relevant line or section when useful. If the
question is ambiguous, personal, legal, compliance-sensitive, or not covered
by the docs, say so and direct the person to [human owner or channel]. Do
not guess or create new policy.
```

**Why this works:** it limits the agent to approved material, asks for cited answers instead of general advice, and gives a clear escalation rule for sensitive or uncovered questions. That makes it useful for everyday how-to help without pretending to be the policy owner.

## Step by step
1. **Open Agent Builder.** In Microsoft 365 Copilot, start creating a new agent and choose a name that clearly signals the team and policy scope.
2. **Add the knowledge source.** Point it at the approved SharePoint, library, or OneDrive location. Remove drafts, duplicates, and obsolete docs from the source if you can.
3. **Write the instructions.** Paste the build prompt above, replacing the bracketed values with your team's source and escalation path.
4. **Add starter prompts.** Seed the agent with questions like "How do I request access?", "What is the approval process?", "Where is the checklist?", and "Who should I ask if my case is unusual?"
5. **Test with normal and edge cases.** Ask a routine process question, then ask something outside the docs or sensitive. Confirm the agent cites the first answer and escalates the second.
6. **Share to the right audience.** Share it with the team that owns and follows those processes, not a wider audience that may need different rules.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Make the helper safer and easier to trust:
- **Add a source-first answer style.** Ask for answers that start with the direct answer, then the cited source, then the next step.
- **Create a review rhythm.** Re-test the starter prompts whenever policy owners publish a new version.
- **Separate draft from approved content.** Keep the agent grounded on final docs so it does not cite work in progress as policy.
- **Invite corrections.** Tell teammates where to report a wrong or stale answer so the source docs can be fixed.

> **📚 Learn more.** See Microsoft Learn for [extending Microsoft 365 Copilot](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/) and the Agent Builder path into declarative agents.

## Watch out for
- **It cannot replace a policy owner.** The agent can summarise and cite approved docs, but humans still own exceptions and interpretation.
- **Access matters.** Do not ground it on confidential process docs unless every shared user should see that information.
- **Unclear docs produce unclear answers.** If the source has contradictions, the agent may surface them rather than resolve them.
- **Keep escalation explicit.** Without a named human or channel, users may treat gaps as permission to improvise.

## Where this leads (the ramp)
You built a no-code helper that answers from team policy knowledge. When you need approvals, case intake, connectors to systems of record, audit controls, or governed exception flows, graduate to **Stage 6 · Copilot Studio**.

> **Next:** [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

## Related
- [Build a team-knowledge agent over a SharePoint site](../walkthroughs/agent-builder-team-knowledge.md)
- [Agent Builder → Decide: declarative agent vs. full Copilot Studio](../walkthroughs/agent-builder-vs-studio.md)
- [Stage 4 · Agent Builder](../stages/stage-4-agent-builder.md)

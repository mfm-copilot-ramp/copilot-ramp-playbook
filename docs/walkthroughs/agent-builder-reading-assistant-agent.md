---
title: Build a reading assistant over your saved articles
description: Build a personal agent grounded on saved articles and PDFs in OneDrive to answer questions, surface themes, and cite the source files.
stage: agent-builder
roles: [maker, end-user]
tags: [agent-builder, declarative-agent, onedrive, reading, personal, no-code]
level: intermediate
time: ~20 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-08-29
---

# Build a reading assistant over your saved articles

> Turn your saved articles, PDFs, and notes into a personal reading assistant that answers questions and shows where each answer came from.

**Stage:** Agent Builder · **For:** Maker, End user · **Level:** Intermediate · **Time:** ~20 min

## When to use this
You save useful articles and PDFs, but the insight gets buried after the first read. A **personal-scope** Agent Builder agent can be grounded on a curated OneDrive folder and act like a reading assistant for your own library: answer questions, find recurring themes, and cite the files it used.

Use this when your saved reading is valuable, but searching filenames is not enough.

## What you'll need
- **M365 Copilot license** with Agent Builder in Microsoft 365 Copilot
- A OneDrive folder containing the articles, PDFs, and notes you want the agent to read
- Enough familiarity with the collection to test whether the answers and citations feel right

## Try it now — the build
In the Agent Builder conversation, describe the assistant:

```
Create an agent called "Reading Assistant" grounded on my OneDrive folder [path or URL].
It helps me learn from my saved articles, PDFs, and notes. When I ask a question,
answer only from those files, cite the source file and location where possible, and
separate direct evidence from your synthesis. When several files discuss the same
topic, compare their themes, agreements, and differences. If the answer is not in my
saved reading, say so clearly and suggest which file or topic I should add next.
```

**Why this works:** it creates a personal, grounded knowledge boundary, asks for **citations**, and separates evidence from synthesis so the agent can summarise across your reading without pretending to know more than the files contain.

## Step by step
1. **Collect the source material.** Put the saved articles, PDFs, and notes in a OneDrive folder with a clear name. Remove drafts or duplicates you do not want cited.
2. **Open Agent Builder.** In Microsoft 365 Copilot, start the agent creation flow. For the broader model, see [Microsoft 365 Copilot extensibility](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/).
3. **Add the OneDrive folder as knowledge.** Scope the agent to the reading folder rather than your whole OneDrive so it stays focused on the collection.
4. **Write the instructions** using the prompt above, adapted to your topics and citation preference.
5. **Add starter prompts** such as "What are the main themes across my articles on [topic]?", "Which saved article should I read first for [question]?", and "Where do my sources disagree?"
6. **Test with known material.** Ask about an article you remember, confirm the citation, then ask about a topic you never saved to check that the agent declines instead of guessing.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Make the assistant more useful as your reading grows:
- **Ask for learning paths.** "Organise my saved material on [topic] from beginner to advanced and explain the order."
- **Extract reusable notes.** "Turn the cited themes into bullets I can paste into OneNote."
- **Compare authors.** "Where do these sources agree, conflict, or use different definitions?"
- **Refresh the library.** Move outdated articles out of the grounded folder so old guidance does not dominate.

## Watch out for
- **A messy folder creates messy answers.** Curate the source folder before trusting broad themes.
- **PDF quality matters.** Scanned or image-heavy PDFs may not provide clean text for grounding.
- **Citations are not endorsement.** The agent can cite an outdated or weak article if it is in the folder.
- **Keep it personal.** This is an audience-of-one agent over your saved reading, not a shared knowledge base.

## Where this leads (the ramp)
You built a personal agent that reads and synthesises your files. When you need a governed agent with richer actions, controlled publishing, or enterprise workflows, move up to **Stage 6 · Copilot Studio**.

> **Next:** [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

## Related
- [Build a personal research librarian over your OneDrive](../walkthroughs/agent-builder-research-librarian.md)
- [Build a team-knowledge agent over a SharePoint site](../walkthroughs/agent-builder-team-knowledge.md)
- [Stage 4 · Agent Builder](../stages/stage-4-agent-builder.md)

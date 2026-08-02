---
title: Build a personal research librarian over your OneDrive
description: Turn years of saved PDFs and notes in your OneDrive into a no-code research librarian that gives cited answers to any question about your own files.
stage: agent-builder
roles: [maker, end-user]
tags: [agent-builder, declarative-agent, onedrive, research, knowledge, personal, no-code]
level: intermediate
time: 20 min
status: walkthrough
prereqs: [m365-copilot-license, agent-builder-access]
updated: 2026-06-05
---

# Build a personal research librarian over your OneDrive

> Years of saved PDFs, notes, and reports sit in your OneDrive doing nothing — you can't remember what's in
> there, let alone find it. Build a no-code agent that *is* a librarian for your own files: ask a question,
> get a cited answer drawn from everything you've ever saved.

**Stage:** Agent Builder · **For:** Maker, End user · **Level:** Intermediate · **Time:** 20 min

## When to use this
Your OneDrive is a private library with no catalog. The knowledge is there — that report you saved, the
notes from a course, the spec you wrote in 2024 — but retrieving it means remembering the filename and
hunting. A **personal-scope** declarative agent fixes that: ground it on your OneDrive, give it a
"research librarian" persona, and ask plain questions of *your own accumulated knowledge*.

Use this when you keep re-finding (or re-creating) things you know you already have.

## What you'll need
- **M365 Copilot license** with **Agent Builder** (Copilot → Create an agent)
- A **OneDrive folder (or your whole OneDrive)** worth grounding on — ideally where your reference material
  and notes actually live
- 20 minutes and the four ingredients: name, instructions, knowledge source, starter prompts

## Try it now — the build
In the Agent Builder conversation, describe the librarian:

```
Create an agent called "My Librarian" grounded on my OneDrive folder [path/URL]. It
helps me find and understand things in my own files: answer questions from my
documents, always citing which file (and where in it) the answer came from, and when
several files are relevant, synthesize across them and list the sources. If something
isn't in my files, say so clearly instead of guessing or using the open web. Keep
answers concise and point me to the document so I can read more.
```

**Why this works:** it names the agent, sets the **boundary** (your OneDrive, *not* the web), demands
**per-file citations**, asks it to **synthesize across documents** (the librarian's real value), and fixes
the **refusal rule** ("not in my files → say so"). Grounded-only + always-cite is what turns a chatbot into
a trustworthy librarian for your own knowledge.

## Step by step
1. **Open Agent Builder.** In M365 Copilot, choose **Create an agent**. Build by chatting or use the
   **Configure** fields.
2. **Add the knowledge source.** Point it at your **OneDrive folder or library**. Scope it to where the
   good reference material is — a tighter folder beats "all of OneDrive" full of screenshots and installers.
3. **Write the instructions** (the prompt above, adapted). The "cite the file, synthesize across files,
   never use the open web" rules are what make it feel like a librarian, not a search box.
4. **Add starter prompts** that match how you'd actually use it: "What did my notes say about [topic]?",
   "Summarize everything I've saved on [project]", "Which of my files covers [question]?"
5. **Test in the preview pane.** Ask about something you know is in there. Confirm it answers *and* names
   the file — then ask about something you've never saved to confirm it says "not in your files."

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Grow it from finder to thinking partner:
- **Connect the dots.** "Across all my files on [topic], what do they agree on and where do they disagree?"
- **Build a reading list.** "I want to learn [topic] — which of my own documents should I read, in what order?"
- **Keep it fresh.** Point it at a folder you actively save to, so the librarian's knowledge grows as you do.

> **📚 Learn more.** Browse Microsoft's [Agent Library](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/agent-library-overview)
> for templates, and watch [April's AI Agents Academy](https://www.youtube.com/playlist?list=PLINAH02_IDH9WhLAg1DyE_hJw7IoJuP0V)
> (April Dunnam, Microsoft) for step-by-step building.

## Watch out for
- **Scope beats everything.** Grounding on a giant, messy OneDrive gives noisy answers. A curated folder of
  real reference material gives sharp ones.
- **It cites faithfully — including stale files.** An old draft will be quoted as confidently as a current
  one. Tidy the source folder so the librarian isn't citing yesterday's wrong answer.
- **Keep it personal.** This is grounded on *your* files. Don't share a personal-OneDrive agent with others
  — they may not be meant to see what's in there.

## Where this leads (the ramp)
You built a personal agent that answers from your knowledge. The next limit is capability: a librarian
*reads*, but it can't *act* — fetch a live record, file something, follow a designed multi-step flow. When
you need that, you graduate to **Stage 6 · Copilot Studio**.

> **Next:** [Copilot Studio → Build your first Studio agent with a knowledge source + topic](../walkthroughs/studio-first-agent.md)

## Related
- [Build a team-knowledge agent over a SharePoint site](../walkthroughs/agent-builder-team-knowledge.md) — the same idea, team-scope
- [Build a "writes in my voice" content coach from your sent mail](../walkthroughs/agent-builder-voice-content-coach.md)
- Stage 4 Resources: see `RESOURCES.md` → Agent Builder

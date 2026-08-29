---
title: Turn notes into a slide outline
description: Use Copilot to turn rough notes into a clean slide-by-slide outline with titles, one idea per slide, and speaker-note hints.
stage: chat
roles: [end-user, manager]
tags: [chat, presentations, structure, productivity]
level: starter
time: 5 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-08-29
---

# Turn notes into a slide outline

> Turn rough notes into a slide-ready outline with one idea per slide, suggested titles, and speaker-note hints.

**Stage:** Copilot Chat · **For:** End user, Manager · **Level:** Starter · **Time:** 5 min

## When to use this
You have meeting notes, copied bullets, or a rough narrative and need to turn them into a presentation shape quickly. Copilot Chat is useful before you open PowerPoint because it can organise the story, separate ideas into slides, and show where the source material is thin.

This is a fast first pass, not a finished deck. You decide the message; Copilot gives you a structure you can edit.

## What you'll need
- **M365 Copilot license** — Microsoft 365 Copilot Chat in Teams, Outlook, Word, or the Microsoft 365 Copilot app
- No agents or setup — just paste the prompt into the chat you already use
- Rough notes, source bullets, or a short brief
- The audience, purpose, and target length if you know them

## Try it now — the prompt
Open Microsoft 365 Copilot Chat and paste:

```
Turn these notes into a slide-by-slide outline for [audience] about [topic].

Goal: [what the audience should understand, decide, or do]
Tone: [executive / practical / persuasive / educational]
Length: [target number of slides or meeting length]

Notes:
[paste rough notes]

Create:
- A suggested title for the deck
- A logical slide sequence with one main idea per slide
- A short title for each slide
- 2-3 bullets per slide
- Speaker-note hints for what I should say
- Any gaps or questions I should answer before building the deck
```

**Why this works:** it gives Copilot the audience, outcome, and shape of the artefact. The "one main idea per slide" rule keeps the outline from becoming a crowded notes dump.

## Step by step
1. **Paste the prompt with your notes.** Use rough text as-is; do not spend time polishing before Copilot has organised it.
2. **Scan the proposed sequence.** Check whether the outline has a clear beginning, middle, and ask.
3. **Tighten the story.** If the flow feels flat, ask:
   ```
   Rework this outline so the story builds from context to insight to recommendation.
   Keep one idea per slide.
   ```
4. **Use the gaps list.** Answer any missing facts, metrics, or audience questions before you build slides.
5. **Move to PowerPoint.** Copy the final outline into PowerPoint or ask Copilot to rewrite it as slide titles plus speaker notes.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Make it executive-ready:** "Compress this to five slides for senior leaders and make the recommendation obvious by slide three."
- **Add speaker support:** "Expand the speaker-note hints into talking points I can rehearse in under five minutes."
- **Find weak spots:** "Which slide is least supported by the notes, and what evidence would make it stronger?"
- **Adjust the tone:** "Rewrite the slide titles so they are action-oriented, not descriptive."

## Watch out for
- **Copilot may invent a smooth story from thin notes.** Treat the gaps and assumptions as required review items.
- **One idea per slide still needs your judgement.** Split slides that carry two arguments, even if the outline looks tidy.
- **Speaker-note hints are not a script.** Personalise the wording so it sounds like you and fits the room.

## Where this leads (the ramp)
Once a chat outline is useful, the next step is repeatable help that can organise common inputs and keep deck preparation moving beyond one prompt.

> **Next:** [Stage 2 · First-Party Agents](../stages/stage-2-first-party.md)

## Related
- [Build a first-draft project plan](chat-project-plan.md)
- [Brainstorm solutions with structured tradeoffs](chat-brainstorm.md)
- [Stage 2 · First-Party Agents](../stages/stage-2-first-party.md)

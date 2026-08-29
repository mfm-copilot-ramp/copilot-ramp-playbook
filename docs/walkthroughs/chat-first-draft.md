---
title: Get a first draft from a blank page
description: Use Copilot Chat to turn rough bullets or a short brief into a structured first draft so you can edit from a v1, not a blank page.
stage: chat
roles: [end-user]
tags: [chat, writing, drafting, productivity]
level: starter
time: 5 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-08-29
---

# Get a first draft from a blank page

> Turn a short brief or messy bullets into a usable v1, so your work starts with editing instead of staring.

**Stage:** Copilot Chat · **For:** End user · **Level:** Starter · **Time:** 5 min

## When to use this
You know the point you need to make, but the blank page is slowing you down. Use Copilot Chat to turn a
short brief, bullet list, or rough outline into a structured first draft that you can edit, challenge, and
make your own.

## What you'll need
- **M365 Copilot license** with Microsoft 365 Copilot Chat in Teams, Outlook, Word, or the Microsoft 365 Copilot app
- A few bullets, notes, or a short brief with the facts you want included
- The format, audience, and outcome you want from the draft

## Try it now — the prompt
Open Microsoft 365 Copilot Chat and paste:

```
Create a first draft of a [document/email/Teams post/blog post] from these notes.

Audience: [who will read it]
Goal: [what the reader should know, decide, or do]
Tone: [clear, concise, persuasive, friendly, executive]
Length: [short, 500 words, one page, three paragraphs]
Must include:
- [fact or point 1]
- [fact or point 2]
- [fact or point 3]
Avoid:
- [jargon, claims, topics, or details to leave out]

Structure it with a clear opening, logical sections, and a strong next step.
Use placeholders where facts are missing instead of inventing details.
```

**Why this works:** it gives Copilot the audience, goal, source bullets, and guardrails. That turns vague
drafting into a structured output you can evaluate and improve.

## Step by step
1. **Open Copilot Chat in Teams, Outlook, Word, or the Microsoft 365 Copilot app.** No agent or setup is
   needed; this is just a prompt in chat.
2. **Paste the prompt and replace the brackets.** If your notes are messy, keep them messy. Copilot should
   return a coherent first draft with headings or paragraphs.
3. **Scan for missing facts and invented details.** Replace placeholders, remove anything unsupported, and
   check that the draft matches your goal.
4. **Refine the structure before polishing wording.** For example:
   ```
   Rework this so the recommendation comes first, then give three supporting
   points and a final call to action.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- `Give me three alternative openings: direct, story-led, and executive summary.`
- `Turn this into a one-page memo with headings and a decision section.`
- `List the assumptions you made and the facts I still need to confirm.`
- `Make the next step more specific and easier for the reader to act on.`

## Watch out for
- **A first draft is not a final draft.** Treat Copilot's output as a starting point, then edit for accuracy,
  voice, and judgement.
- **Give it enough facts.** If the prompt is empty, Copilot will fill gaps with generic wording or
  placeholders.
- **Ask for placeholders, not guesses.** This keeps missing facts visible instead of hidden inside polished
  prose.

## Where this leads (the ramp)
When the same draft depends on recurring context from meetings, documents, or email threads, move to
**Stage 2** and delegate the repetitive gathering and first-pass drafting to a first-party agent.

> **Next:** [First-Party Agents → Delegate recurring first drafts](../stages/stage-2-first-party.md)

## Related
- [Chat → Brainstorm ideas](../walkthroughs/chat-brainstorm.md)
- [Chat → Rewrite an email for a tougher audience](../walkthroughs/chat-rewrite-email.md)
- [Microsoft Copilot Chat overview](https://learn.microsoft.com/en-us/copilot/overview)

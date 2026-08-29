---
title: Compile a newsletter from the week's sources
description: Hand Cowork the week's updates and source links to draft an on-tone internal newsletter with sections, summaries, and calls to action.
stage: cowork
roles: [end-user, champion, manager]
tags: [cowork, communications, newsletter, synthesis]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [m365-copilot-license, cowork-access]
updated: 2026-08-29
---

# Compile a newsletter from the week's sources

> Turn the week's updates, notes, and links into a structured internal newsletter draft that sounds like your team.

**Stage:** Cowork · **For:** End user, Champion, Manager · **Level:** Intermediate · **Time:** 15 min

## When to use this
You need to send a weekly or periodic internal newsletter, but the raw material is scattered across chats, docs, meeting notes, announcements, and source links. Cowork can gather the inputs, group items into sections, write concise summaries, and draft calls to action for you to review.

Use this when you want an editorial draft with judgement and structure, not a raw digest of everything that happened.

## What you'll need
- **M365 Copilot license** with **Cowork** access
- Source links, notes, announcements, metrics, and must-include items for the period
- A clear audience, tone, and send channel

## Try it now — the prompt
Give Cowork the source bundle and editorial rules:

```
Using the attached [source links/docs/notes] and the must-include list below,
draft an internal newsletter for [audience] covering [date range].

Must include:
- [Item 1]
- [Item 2]
- [Item 3]

Please create:
1. A short subject line and preview text
2. Top highlights
3. Updates grouped by theme
4. One "why it matters" sentence per section
5. Clear calls to action with owners or links
6. A final "coming next" section

Match this tone: [tone example or description]. Flag anything that needs fact
checking, permission, or a missing link before I send it.
```

**Why this works:** it gives Cowork editorial intent, source material, and guardrails. Asking for fact-check flags and missing links keeps the newsletter from becoming a confident but unverified summary.

## Step by step
1. **Collect the week's sources.** Include links, notes, announcements, metrics, and any items leadership expects to see.
2. **Add tone guidance.** Paste a previous newsletter or describe the voice, length, and audience.
3. **Hand off the draft.** Attach or link the sources, paste the prompt, and let Cowork organise the material into sections.
4. **Review the editorial choices.** Check what Cowork elevated, what it omitted, and whether the "why it matters" lines match your intent.
5. **Verify links and calls to action.** Make sure owners, dates, and URLs are accurate before the newsletter leaves your drafts.
6. **Ask for the send-ready version:**
   ```
   Tighten this newsletter for [channel]. Keep it skimmable, make calls to action
   explicit, and move anything uncertain into a fact-check list.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Create channel variants.** "Rewrite this as an email, a Teams post, and a short manager-forwardable summary."
- **Add an editorial lens.** "Prioritise items that affect field teams and move nice-to-know updates to the end."
- **Make it more human.** "Add a warm opening and a concise closing note without making the update longer."
- **Build a recurring recipe.** "Create a reusable checklist for next week's newsletter inputs and review steps."

## Watch out for
- **Not every update deserves space.** Cowork can summarise everything; you decide what matters to the audience.
- **Tone needs examples.** Without a prior newsletter or voice guidance, the draft may sound generic.
- **Internal information may have sharing limits.** Check confidential updates, customer names, metrics, and unreleased plans.
- **Links and owners drift.** Validate them before sending, especially when Cowork worked from copied notes.

## Where this leads (the ramp)
If this newsletter happens on a rhythm, the next step is an always-on agent that watches the source locations, drafts the roundup, and prompts you for approval. That is **Stage 5 · Autopilots**.

> **Next:** [Stage 5 · Autopilots](../stages/stage-5-autopilots.md)

## Related
- [Cowork → Build a content calendar from scattered inputs](cowork-content-calendar.md)
- [Chat → Write a weekly status update](chat-weekly-status.md)
- [Stage 3 · Cowork](../stages/stage-3-cowork.md)

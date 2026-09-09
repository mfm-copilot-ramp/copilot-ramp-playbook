---
title: Watch key documents and flag changes
description: Have Microsoft Scout watch key documents and flag meaningful changes with a short what-changed-and-why summary for you to review.
stage: autopilots
roles: [end-user, manager, champion]
tags: [autopilots, scout, documents, change-watch, sharepoint]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [m365-copilot-license, scout-access]
updated: 2026-08-29
---

# Watch key documents and flag changes

> Keep a reviewable watch on the documents that matter without rereading every revision yourself.

**Stage:** Autopilots · **For:** End user, Manager, Champion · **Level:** Intermediate · **Time:** 15 min

## When to use this
Some documents quietly become the source of truth for a project, customer, policy, or launch, and a small change
can alter what your team should do next. Use this when you need Scout to watch named files and flag meaningful
edits with context, not just tell you that a file changed. Scout is Frontier private preview and gated, so verify
current availability on the [Microsoft Scout Learn page](https://learn.microsoft.com/en-us/microsoft-scout/).

## What you'll need
- **Microsoft 365 Copilot and Scout access** in an environment where the Scout preview is enabled for you.
- View access to the OneDrive or SharePoint documents you want watched.
- A definition of what counts as a meaningful change, such as owner, date, scope, risk, pricing, policy, or
  customer commitment changes.

## Try it now — the prompt
Equip Scout with a document watch that stays scoped to the files you name:

```
Take on a standing "document change watch" skill:
- Watch these documents: [links to the OneDrive or SharePoint files].
- When a meaningful change appears, send me a short summary with:
  what changed, why it matters, who changed it if visible, and a link back.
- Prioritise changes to [scope / dates / owners / risks / customer commitments].
- Ignore formatting-only edits and routine typo fixes unless they affect meaning.
Do not edit the documents or notify other people without checking with me first.
```

**Why this works:** it gives Scout a bounded source list, defines the signal you care about, and asks for a
reviewable summary rather than a noisy change log.

## Step by step
1. **Choose the files deliberately.** Start with the documents that drive decisions, such as project plans,
   customer notes, launch briefs, or policy drafts.
2. **Open Scout where your preview experience is enabled** and confirm it can access those OneDrive or
   SharePoint links under your permissions.
3. **Equip the skill.** Paste the prompt and replace the bracketed variables with file links and the changes
   that matter in your context.
4. **Read the first alert as calibration.** The summary should explain what changed and why it matters, with a
   link back to the document.
5. **Tune the threshold.** Tell Scout which alerts were noise, which were useful, and which change types should
   always be surfaced.
6. **Keep ownership human.** Use the alert to decide whether to comment, follow up, or update your plan; Scout
   should not act on the document without your instruction.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Group documents by decision.** Ask Scout to watch a set of related files and explain whether the combined
  changes alter a project decision.
- **Add a risk lens.** Ask for alerts only when changes affect delivery risk, customer commitments, or approval
  readiness.
- **Request a digest cadence.** If instant alerts are too noisy, ask Scout to group non-urgent changes into a
  regular brief.
- **Capture useful thresholds.** Save the signal rules as a reusable recipe so others can personalise their own
  document watches.

## Watch out for
- **Permissions still matter.** Scout works under your governed identity; it cannot summarise changes in files
  you cannot access.
- **Meaningful is contextual.** A date change may be noise in one document and critical in another, so tune the
  watch after the first alerts.
- **Private preview behaviour can change.** Scout surfaces and change detection may evolve; confirm current
  behaviour in the [Microsoft Scout docs](https://learn.microsoft.com/en-us/microsoft-scout/).
- **Do not skip review.** Treat every summary as a pointer back to the source file before making a decision.

## Where this leads (the ramp)
You have turned a manual reread into an always-on review skill. When document changes need governed downstream
actions, such as opening approvals, updating records, or notifying a channel by policy, build that pattern in
Studio.

> **Next:** [Stage 6 · Copilot Studio](../stages/stage-6-studio.md) — where a document watch becomes a governed workflow with controlled actions

## Related
- [Autopilots → Have Scout watch your deliverables and flag risks](../walkthroughs/autopilots-track-deliverables.md)
- [Autopilots → Equip Scout with an always-on inbox-triage skill](../walkthroughs/autopilots-inbox-triage.md)
- [Skills Catalog → Autopilots (Scout) skills](../skills.md#autopilots-scout-skills)

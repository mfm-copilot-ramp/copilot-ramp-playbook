---
title: Auto-draft your weekly report
description: Have Autopilot draft your Friday status from your emails, meetings, and chats, so you start review with a coherent weekly report instead of notes.
stage: autopilots
roles: [end-user, manager, champion]
tags: [autopilots, scout, autopilot, weekly-report, status, synthesis, review]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [m365-copilot-license, scout-access]
updated: 2026-10-28
---

# Auto-draft your weekly report

> Equip Autopilot (formerly Microsoft Scout) with a Friday reporting skill that drafts your weekly status from your own work signals, ready for review.

**Stage:** Autopilots · **For:** End user, Manager, Champion · **Level:** Intermediate · **Time:** 15 min

## When to use this
Weekly reporting is useful, but rebuilding the week from memory is a drag. Use this when you want Autopilot to review the work signals you already produced - emails, meetings, chats, and files it can access - and draft a status report you can edit instead of starting from scattered notes.

Autopilot is in private preview and access is gated. The skill should draft and organise on your behalf, while you stay responsible for reviewing, editing, and sending the report.

## What you'll need
- Access to **Autopilot** (private preview) — or, today, the Frontier desktop app still documented on Learn as **Microsoft Scout** (needs Frontier turned on by your admin, an Intune policy + admin attestation, a Microsoft 365 Copilot licence, and a GitHub Copilot Business or Enterprise licence). See [Find out if you can get Autopilot](autopilots-get-access.md).
- Autopilot connected to your relevant work surfaces, such as Outlook, Teams, calendar, OneDrive, and SharePoint where permitted.
- A report shape your audience expects: accomplishments, blockers, risks, asks, decisions, next week, or another agreed format.

## Try it now — the prompt
Equip the report as a standing Friday skill:

```
Take on a standing "weekly report draft" skill for me.

Every [Friday/time], review my work signals from [date range], including
emails, meetings, chats, and files you can access.

Draft my weekly status for [audience] in this format:
- Highlights
- Progress against [priority projects/goals]
- Risks or blockers
- Decisions or asks
- Focus for next week

Include links back to the source items where possible. Mark anything you are
uncertain about as "needs my check". Save it as a draft for my review; do not
send or post it without me.
```

**Why this works:** it turns reporting into a reusable skill with a trigger, data scope, audience, and review boundary. Autopilot does the synthesis work in the background, but the report still leaves only after your judgement.

## Step by step
1. **Open Autopilot** and confirm it can access the work surfaces that hold your weekly signal: mail, meetings, Teams conversations, and relevant files.
2. **Equip the skill.** Paste the prompt and fill in your audience, schedule, date range, and report structure.
3. **Read the first draft for shape.** Autopilot should return a structured report with linked evidence and items marked when confidence is low.
4. **Correct the weighting.** Tell Autopilot what it overplayed or missed, such as "customer escalations are risks, not highlights" or "always include work against [goal]."
5. **Edit before sharing.** Remove anything too sensitive, fix context, and add your voice. Autopilot gives you a draft; you remain the author of record.
6. **Keep the skill running.** Once tuned, each Friday starts with a report draft instead of a blank page.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Add audience variants.** "Create a concise manager version and a more detailed team version from the same draft."
- **Carry forward open items.** "Compare this draft with last week's report and flag commitments that did not move."
- **Make evidence visible.** "Add source links after each claim so I can verify the important points quickly."
- **Tune the tone.** "Keep the language crisp and British English; avoid hype and make blockers explicit."

## Watch out for
- **It is a draft, not your memory.** Autopilot can miss offline work, corridor conversations, or context from systems it cannot access.
- **You own the message.** Review facts, tone, and sensitivities before sending anything to your manager or team.
- **Private preview means change.** Autopilot capabilities are gated and may evolve; check the [Microsoft Scout desktop app docs](https://learn.microsoft.com/en-us/microsoft-scout/) if the experience differs.
- **Source access shapes the result.** If a project lives outside the connected surfaces, add it manually or scope the skill honestly.

## Where this leads (the ramp)
You've equipped a personal reporting skill that turns recurring synthesis into a background draft. When the same reporting logic needs governed data sources, approvals, or publishing into formal systems, harden it into a governed tool in Stage 6 Studio.

> **Next:** [Stage 6 · Copilot Studio](../stages/stage-6-studio.md) — where a reporting skill can become a governed tool with managed data and workflow

## Related
- [Autopilots → Equip Autopilot with an always-on inbox-triage skill](../walkthroughs/autopilots-inbox-triage.md)
- [Autopilots → Have Autopilot watch your deliverables and flag risks](../walkthroughs/autopilots-track-deliverables.md)
- [Stage 5 · Autopilots](../stages/stage-5-autopilots.md)

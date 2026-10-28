---
title: Prep your daily stand-up automatically
description: Have Autopilot draft your daily stand-up from yesterday's work, today's priorities, and blockers so you can review before the meeting.
stage: autopilots
roles: [end-user, manager, champion]
tags: [autopilots, scout, autopilot, stand-up, daily-planning, blockers]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [m365-copilot-license, scout-access]
updated: 2026-10-28
---

# Prep your daily stand-up automatically

> Let Autopilot (formerly Microsoft Scout) prepare the stand-up notes you still review, edit, and bring into the meeting.

**Stage:** Autopilots · **For:** End user, Manager, Champion · **Level:** Intermediate · **Time:** 15 min

## When to use this
Your daily stand-up is about yesterday, today, and blockers, but the evidence is scattered across calendar,
mail, chats, tasks, and documents. Use this when you want a reviewable draft waiting before the meeting, rather
than rebuilding the same update from memory each morning. Autopilot is still in private preview and access is
gated, so check current access and behaviour first (the
[Microsoft Scout desktop app docs](https://learn.microsoft.com/en-us/microsoft-scout/) cover today's Frontier app).

## What you'll need
- Access to **Autopilot** (private preview) — or, today, the Frontier desktop app still documented on Learn as
  **Microsoft Scout** (needs Frontier turned on by your admin, an Intune policy + admin attestation, a Microsoft
  365 Copilot licence, and a GitHub Copilot Business or Enterprise licence). See
  [Find out if you can get Autopilot](autopilots-get-access.md).
- Autopilot connected to the work surfaces your update depends on — Outlook, Teams, calendar, tasks, and relevant
  OneDrive or SharePoint files.
- A clear stand-up format for your team, including how you describe yesterday's progress, today's focus, and any
  blockers.

## Try it now — the prompt
Give Autopilot a named, standing skill it can run before your stand-up:

```
Take on a standing "stand-up prep" skill for me:
- Before each [stand-up time], draft my update in this format:
  Yesterday: [progress and shipped work]
  Today: [priorities and meetings]
  Blockers: [risks, asks, or waiting items]
- Use signals from my calendar, Teams, Outlook, tasks, and files I worked on.
- Keep it short enough to read aloud, include links to the source items, and
  call out anything you are unsure about.
Do not post or send the update for me; leave it for my review.
```

**Why this works:** it names the reusable skill, gives Autopilot the recurring trigger, defines the stand-up shape,
and keeps you in control of anything shared with the team.

## Step by step
1. **Open Autopilot where your preview experience is enabled** and confirm it can see the work surfaces your update
   should draw from.
2. **Equip the skill.** Paste the prompt, replacing the bracketed details with your stand-up time and team
   format.
3. **Review the first draft.** Autopilot should return a concise yesterday-today-blockers update with links or
   references back to the signals it used.
4. **Correct the signal.** Tell Autopilot what was missing or over-weighted, such as "do not count that recurring
   meeting as progress" or "always include open customer blockers".
5. **Use it as a draft, not a script.** Edit the note before the meeting, especially anything that names people,
   dates, or blockers.
6. **Leave the skill running only while it stays useful.** If your team's format changes, update the prompt so
   the recurring draft does not drift from what the meeting needs.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Add team-specific language.** Ask Autopilot to match the terms your team uses for milestones, incidents, or
  customer work.
- **Ask for uncertainty.** Have Autopilot mark anything inferred from weak signals so you can verify it quickly.
- **Include a blocker watch.** Ask Autopilot to flag unresolved asks that have not moved since your last update.
- **Pair with weekly reporting.** Use the stand-up trail to make a short end-of-week summary easier to review.

## Watch out for
- **Activity is not the same as progress.** Autopilot can see many signals, but you decide what actually belongs in
  the stand-up.
- **Private preview behaviour can change.** Autopilot access, surfaces, and trigger behaviour are gated and may
  differ from this walkthrough; check the
  [Microsoft Scout desktop app docs](https://learn.microsoft.com/en-us/microsoft-scout/) if something looks different.
- **Keep sensitive blockers controlled.** Review anything involving people, customers, or confidential topics
  before it is spoken or posted.
- **Bad source access creates gaps.** If Autopilot cannot see the task board or file where work happened, the draft
  may miss it.

## Where this leads (the ramp)
You have equipped Autopilot with a standing skill that prepares a recurring work update under your review. When that
update needs governed workflow actions, such as writing to a system of record or enforcing team-wide rules, move
the pattern into Studio.

> **Next:** [Stage 6 · Copilot Studio](../stages/stage-6-studio.md) — where a reviewable update pattern becomes a governed tool or agent action

## Related
- [Autopilots → Meet Autopilot (formerly Microsoft Scout)](../walkthroughs/autopilots-meet-scout.md)
- [Autopilots → Have Autopilot write your weekly report](../walkthroughs/autopilots-weekly-report.md)
- [Skills Catalog → Autopilots skills](../skills.md#autopilots-scout-skills)

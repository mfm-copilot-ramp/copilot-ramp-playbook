---
title: Protect focus time and triage interruptions
description: Have Autopilot protect focus time around your workload and triage interruptions so only genuinely urgent items reach you.
stage: autopilots
roles: [end-user, manager, champion]
tags: [autopilots, scout, autopilot, focus-time, calendar, interruptions]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [m365-copilot-license, scout-access]
updated: 2026-10-28
---

# Protect focus time and triage interruptions

> Let Autopilot (formerly Microsoft Scout) help defend deep-work blocks while keeping urgent work visible and under your control.

**Stage:** Autopilots · **For:** End user, Manager, Champion · **Level:** Intermediate · **Time:** 15 min

## When to use this
Focus time disappears when meetings, chats, and last-minute asks arrive faster than you can prioritise them.
Use this when you want Autopilot to help find protected work blocks around your real calendar and surface only the
interruptions that genuinely need attention. Autopilot is in private preview and access is gated, so check current
availability first (the [Microsoft Scout desktop app docs](https://learn.microsoft.com/en-us/microsoft-scout/)
cover today's Frontier app).

## What you'll need
- Access to **Autopilot** (private preview) — or, today, the Frontier desktop app still documented on Learn as
  **Microsoft Scout** (needs Frontier turned on by your admin, an Intune policy + admin attestation, a Microsoft
  365 Copilot licence, and a GitHub Copilot Business or Enterprise licence). See
  [Find out if you can get Autopilot](autopilots-get-access.md).
- Calendar, Teams, Outlook, and task signals connected under your permissions.
- A clear definition of urgent interruption, including people, projects, customers, or incidents that should
  break through.

## Try it now — the prompt
Equip Autopilot with a focus-time skill that protects time without hiding important work:

```
Take on a standing "focus-time protector" skill:
- Look across my calendar, Teams, Outlook, and tasks to find good focus blocks
  for [deep-work topic or project].
- Suggest or draft calendar holds around my real workload, avoiding [standing
  meetings / customer calls / team rituals].
- During those blocks, triage interruptions and only alert me for [urgent
  people, incidents, customers, or deadlines].
- Send me a short end-of-block summary of what waited and what needs review.
Do not decline meetings, send replies, or change my calendar without approval.
```

**Why this works:** it gives Autopilot the goal, the interruption rules, and the approval boundary, so the skill
protects attention without taking uncontrolled action.

## Step by step
1. **Define what focus is for.** Name the project, decision, writing task, or analysis that needs protected
   time.
2. **Open Autopilot where your preview experience is enabled** and confirm it can see the calendar and message
   surfaces that drive your interruptions.
3. **Equip the skill.** Paste the prompt and replace the bracketed variables with your protected work and
   urgency rules.
4. **Review the suggested holds.** Autopilot should propose or draft focus blocks that fit around existing
   commitments rather than pretending your calendar is empty.
5. **Approve only what fits.** Keep control of calendar changes, meeting declines, and messages sent under your
   name.
6. **Tune the interruption rules.** After a focus block, tell Autopilot which alerts were useful, which were noise,
   and which topics should break through next time.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Add project context.** Ask Autopilot to link each focus block to the work product you intend to move forward.
- **Create escalation rules.** Define the topics, customers, or incidents that should interrupt you even during
  protected time.
- **Ask for a catch-up brief.** Have Autopilot summarise what waited so you can re-enter communications quickly.
- **Review patterns.** Ask Autopilot to show which recurring meetings or channels most often break focus.

## Watch out for
- **Do not make yourself unreachable.** The goal is better triage, not hiding from urgent work or teammates.
- **Calendar authority stays with you.** Autopilot should suggest or draft changes, but you approve anything that
  affects other people.
- **Private preview behaviour can change.** Autopilot trigger, calendar, and notification capabilities are gated;
  verify current behaviour in the [Microsoft Scout desktop app docs](https://learn.microsoft.com/en-us/microsoft-scout/).
- **Urgency needs tuning.** If your rules are too broad, everything breaks through; if they are too narrow, you
  may miss real risks.

## Where this leads (the ramp)
You have equipped Autopilot with an always-on attention-management skill that stays inside your approval boundary.
When focus protection needs governed policy, team-wide routing, or integration with service systems, build it in
Studio.

> **Next:** [Stage 6 · Copilot Studio](../stages/stage-6-studio.md) — where personal triage rules become governed workflow actions

## Related
- [Autopilots → Coordinate meetings without the back-and-forth](../walkthroughs/autopilots-coordinate-meetings.md)
- [Autopilots → Equip Autopilot with an always-on inbox-triage skill](../walkthroughs/autopilots-inbox-triage.md)
- [Skills Catalog → Autopilots skills](../skills.md#autopilots-scout-skills)

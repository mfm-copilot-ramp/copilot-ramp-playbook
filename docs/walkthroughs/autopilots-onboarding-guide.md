---
title: Guide a new hire through their first weeks
description: Have Autopilot send a new hire timed nudges, resources, and check-ins so their first weeks feel guided, not improvised.
stage: autopilots
roles: [manager, champion, end-user]
tags: [autopilots, scout, autopilot, onboarding, new-hire, check-ins]
level: intermediate
time: 20 min
status: walkthrough
prereqs: [m365-copilot-license, scout-access]
updated: 2026-10-28
---

# Guide a new hire through their first weeks

> Give a new starter a reviewable sequence of nudges, resources, and check-ins without relying on your memory.

**Stage:** Autopilots · **For:** Manager, Champion, End user · **Level:** Intermediate · **Time:** 20 min

## When to use this
Onboarding fails quietly when the right link, introduction, or check-in is late rather than missing entirely.
Use this when you want Autopilot (formerly Microsoft Scout) to help organise a paced first-weeks guide for a new
starter, while you stay responsible for the people context and any messages sent in your name. Autopilot is in
private preview and access is gated; the
[Microsoft Scout desktop app docs](https://learn.microsoft.com/en-us/microsoft-scout/) cover current access and
scope for today's Frontier app.

## What you'll need
- Access to **Autopilot** (private preview) — or, today, the Frontier desktop app still documented on Learn as
  **Microsoft Scout** (needs Frontier turned on by your admin, an Intune policy + admin attestation, a Microsoft
  365 Copilot licence, and a GitHub Copilot Business or Enterprise licence). See
  [Find out if you can get Autopilot](autopilots-get-access.md).
- The new hire's start date, role, manager, buddy, and the documents, channels, meetings, or tasks they should
  know about.
- Permission to share any resources Autopilot references, plus a manager-approved tone for nudges and check-ins.

## Try it now — the prompt
Give Autopilot the onboarding guide as a scheduled, human-reviewed skill:

```
Take on a standing "new hire onboarding guide" skill for [new hire name]:
- Build a first-weeks sequence from [start date] using these resources:
  [links to team handbook, role docs, channel list, training, and key contacts].
- Draft timely nudges for what to read, who to meet, and what to ask next.
- Remind me before manager check-ins with suggested topics and any open questions.
- Keep every message friendly, concise, and specific to [role/team].
Do not send messages to the new hire or others until I review and approve them.
```

**Why this works:** it scopes the person, timing, resources, and approval boundary so Autopilot can prepare the
cadence without pretending to replace the manager or buddy.

## Step by step
1. **Gather the source material.** Collect the role docs, team handbook, required training, key channels, and
   people the new hire should meet.
2. **Open Autopilot where your preview experience is enabled** and confirm it can access the resources you intend
   to use.
3. **Equip the skill.** Paste the prompt, replacing the bracketed variables with the new hire's details and the
   approved resource links.
4. **Review the proposed sequence.** Autopilot should draft a paced set of nudges and check-in reminders, with links
   back to the resources it used.
5. **Personalise before sharing.** Adjust tone, remove anything the person should not see yet, and add human
   context that does not live in documents.
6. **Use check-ins to tune the guide.** After each manager conversation, tell Autopilot what changed so future
   nudges reflect the new hire's actual needs.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Add role milestones.** Ask Autopilot to align nudges with the first customer call, first demo, or first project
  contribution.
- **Bring in the buddy.** Have Autopilot draft notes you can share with the buddy so support is coordinated.
- **Track questions.** Ask Autopilot to collect recurring questions from check-ins and suggest where the handbook
  needs improvement.
- **Convert the pattern.** Once the guide works, capture the reusable parts as a team onboarding recipe.

## Watch out for
- **Onboarding is personal.** Autopilot can organise reminders and resources, but you still provide judgement,
  empathy, and context.
- **Do not overshare.** Check permissions and sensitivity before any resource or message reaches the new hire.
- **Preview limits apply.** Autopilot capabilities and surfaces are gated and may change; confirm current behaviour
  in the [Microsoft Scout desktop app docs](https://learn.microsoft.com/en-us/microsoft-scout/).
- **Keep HR policy separate.** Use approved HR systems and guidance for formal employment requirements.

## Where this leads (the ramp)
You have equipped Autopilot with a manager-reviewed onboarding skill for a specific new starter. When onboarding
needs governed routing, policy checks, approvals, or integration with HR systems, move that workflow into
Studio.

> **Next:** [Stage 6 · Copilot Studio](../stages/stage-6-studio.md) — where an onboarding guide becomes a governed process with approved actions

## Related
- [Cowork → Build an onboarding plan](../walkthroughs/cowork-onboarding-plan.md)
- [Autopilots → Meet Autopilot (formerly Microsoft Scout)](../walkthroughs/autopilots-meet-scout.md)
- [Skills Catalog → Autopilots skills](../skills.md#autopilots-scout-skills)

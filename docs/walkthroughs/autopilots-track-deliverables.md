---
title: Have Autopilot watch your deliverables and flag risks
description: Give Autopilot a standing watch over your deliverables so it flags slipped deadlines and stalled decisions before they quietly cost you.
stage: autopilots
roles: [manager, champion, end-user]
tags: [autopilots, scout, autopilot, deliverables, risk, calendar, stalled-decisions]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [scout-enabled, frontier-enrollment, github-copilot-license]
updated: 2026-10-28
---

# Have Autopilot watch your deliverables and flag risks

> Stop discovering slipped deadlines and stalled decisions after they've already cost you. Hand Autopilot (formerly
> Microsoft Scout) a standing watch over your deliverables and let it block the time and raise the flags for you.

**Stage:** Autopilots · **For:** Manager, Champion, End user · **Level:** Intermediate · **Time:** 15 min

## When to use this
The things that hurt most are the ones that go quiet — a deliverable that crept up on you, a decision
that's been "pending" for two weeks and is now blocking three people. Catching those takes constant
attention, which is exactly what you don't have. An always-on agent does. Once Autopilot is enabled for you
(see [Find out if you can get Autopilot](autopilots-get-access.md)), this is the job that turns it from a
convenience into a safety net.

As always, Autopilot works **on your behalf, with its own identity in your tenant** (permissions, audit and
governance behind it) and keeps **you in the loop** — it raises risks and protects time, you decide what to do about them.

## What you'll need
- Access to **Autopilot** (private preview) — or, today, the Frontier desktop app still documented on Learn
  as **Microsoft Scout** (needs Frontier turned on by your admin, an Intune policy + admin attestation, a
  Microsoft 365 Copilot license, and a GitHub Copilot Business or Enterprise license). See
  [Find out if you can get Autopilot](autopilots-get-access.md).
- Autopilot connected to the surfaces your work lives on — **Teams, Outlook, OneDrive, SharePoint, and your
  calendar** — so it can see what's due and what's stalling.
- A rough sense of your **upcoming deliverables and the decisions you're waiting on**, so you can tell
  Autopilot what to watch.

## Try it now — the prompt
Autopilot shows up where you already work — Teams, Outlook, chats, channels and documents — and you can
@mention it like a colleague. Give it the standing watch in plain language:

```
Keep a standing watch on my deliverables and decisions:
- Identify what's coming due for me and automatically block calendar time so I
  actually have room to do it.
- Watch for things that are stalling — decisions that have gone quiet, items
  waiting on someone — and flag them to me before they turn into blockers.
- Give me a short heads-up when you block time or raise a risk, with the why.
Don't reschedule anything with [my leadership / customers] without checking first.
```

**Why this works:** it names the two grounded capabilities exactly — *identify deliverables and block
calendar time*, and *spot risks like stalled decisions before they block you* — and it sets the
human-in-the-loop boundary on the actions that carry weight.

## Step by step
1. **Reach Autopilot where you already work** (Teams, Outlook, a chat or a channel) and confirm it can see
   the surfaces your work runs on — calendar, Outlook, Teams, OneDrive, SharePoint.
2. **Hand it the standing watch.** Paste the prompt above, naming the deliverables and the decisions you
   most need protected. This is an ongoing job, not a one-time check.
3. **Let it block time for what's due.** Autopilot identifies upcoming deliverables and automatically blocks
   calendar time so the work has somewhere to live instead of getting squeezed out.
4. **Watch for the risk flags.** Autopilot spots things that are stalling — a decision that's gone quiet, an
   item waiting on someone — and raises them *before* they become blockers, while there's still time to act.
5. **Decide and direct.** When Autopilot flags a risk, you decide the move — nudge the owner, escalate, or
   let it ride. Autopilot surfaces; you steer.
6. **Refine what counts as a risk.** If it's too noisy or too quiet, say so ("only flag decisions older
   than 5 days"). Autopilot builds context over time, so your tuning compounds.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Protect the deep-work blocks.** Once Autopilot is blocking time for deliverables, defend those holds —
  the value evaporates if you let every block get double-booked.
- **Turn flags into a weekly rhythm.** Skim Autopilot's risk flags at a set time each week so spotting a
  stalled decision becomes a habit, not a fire drill.
- **Run it alongside meeting coordination.** Deliverables and meetings are the same week from two angles —
  pair this with [Let Autopilot coordinate your meetings and prep](autopilots-coordinate-meetings.md) so both
  run in the background.

## Watch out for
- **A flag is a prompt, not a verdict.** Autopilot surfaces what *looks* stalled; whether it actually is —
  and what to do — is your call. It's an early-warning system, not a decision-maker.
- **You own the actions it takes.** Autopilot acts on your behalf with its own identity in your tenant, with
  permissions, audit and governance behind it — keep schedule changes that affect leadership or customers behind your explicit sign-off.
- **Early on, it's still learning your work.** Autopilot builds context over time, so expect the first weeks
  of flags to need more tuning than later ones.
- **It's private preview.** Capabilities can shift as Autopilot evolves — verify against the
  [Microsoft Scout desktop app docs](https://learn.microsoft.com/en-us/microsoft-scout/) if behavior differs from
  what's described here.

## Where this leads (the ramp)
You've now handed Autopilot two standing jobs and felt what an always-on agent does. When you hit the wall of
what a ready-made Autopilot can do — you need custom logic, real actions against a system of record, or
org-wide governance — that's the signal you've outgrown adopting an agent and you're ready to *build* one.

> **Next:** [Stage 6 · Copilot Studio](../stages/stage-6-studio.md) — when you need to build custom actions, logic, and governance

## Related
- [Autopilots → Meet Autopilot (formerly Microsoft Scout)](../walkthroughs/autopilots-meet-scout.md)
- [Autopilots → Find out if you can get Autopilot — and turn it on](../walkthroughs/autopilots-get-access.md)
- [Autopilots → Let Autopilot coordinate your meetings and prep](../walkthroughs/autopilots-coordinate-meetings.md)
- Stage 5 Resources: see `RESOURCES.md` → Autopilots

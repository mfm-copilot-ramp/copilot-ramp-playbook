---
title: Let Scout coordinate your meetings and prep
description: Hand Microsoft Scout the scheduling and meeting prep that eats your week and let it line up times and pull context in the background while you stay in control.
stage: autopilots
roles: [end-user, manager]
tags: [autopilots, scout, meetings, scheduling, prep, calendar]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [scout-enabled, frontier-enrollment, github-copilot-license]
updated: 2026-06-11
---

# Let Scout coordinate your meetings and prep

> Hand Scout the part of your week that eats the most time and adds the least value — lining up meeting
> times and pulling prep together — and let it work in the background while you stay in control.

**Stage:** Autopilots · **For:** End user, Manager · **Level:** Intermediate · **Time:** 15 min

## When to use this
Your calendar is a part-time job. People in three time zones, the same "what's a good time?" thread on
repeat, and a scramble to pull materials together five minutes before the call. This is exactly the kind
of standing, repetitive coordination an always-on agent is built for. Once Scout is enabled for you (see
[Find out if you can get Scout](autopilots-get-access.md)), this is one of the first jobs worth handing it.

Scout acts here **on your behalf, under your own governed identity** — and on the things that matter most,
it keeps **you in the loop** rather than acting silently.

## What you'll need
- **Scout enabled for you** — Frontier-gated and installed via the desktop experience (a GitHub Copilot
  license is required). See [the access walkthrough](autopilots-get-access.md).
- Scout connected to your **calendar, Outlook, and Teams** — the surfaces it coordinates across.
- A clear sense of **which meetings matter** to you, so you can tell Scout what "important" means in your
  world.

## Try it now — the prompt
You interact with Scout in Teams, in plain language. Give it the standing coordination job:

```
Take ownership of my meeting logistics this week. Specifically:
- When something needs scheduling across [time zones / regions], propose times
  that work for everyone and line them up.
- Flag the meetings that actually matter so they don't get lost in a full calendar.
- For any meeting that needs prep, pull the materials together ahead of time and
  show me a draft before the meeting — I want to review prep, not approve every step.
Check with me before sending anything externally.
```

**Why this works:** it hands Scout a *standing* responsibility instead of a one-off task, names the three
grounded capabilities (coordinate times, flag what matters, generate prep), and sets the human-in-the-loop
line explicitly — review the prep, confirm before external sends.

## Step by step
1. **Open Scout in Teams** and confirm it can see your calendar, Outlook, and Teams — those are the
   surfaces it coordinates across.
2. **Give it the standing job.** Paste the prompt above, swapping in your real time zones and what counts
   as an "important" meeting for you. You're describing an ongoing responsibility, not a single action.
3. **Let it coordinate times across time zones.** When something needs scheduling, Scout proactively
   proposes and lines up times that work across regions — you stop being the calendar middleman.
4. **Watch for the flags.** Scout surfaces the meetings that actually matter out of a busy calendar, so
   the signal isn't buried in the noise.
5. **Review the prep it generates.** Ahead of meetings that need it, Scout assembles the prep materials and
   shows you a draft — you stay in the loop and edit or approve before anything goes out.
6. **Tune the guardrails.** If it's flagging too much or too little, tell it so in plain language
   ("treat anything with my skip-level as important"). Scout builds context over time, so direction sticks.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Define "important" precisely.** The flagging is only as good as your definition — tell Scout which
  people, projects, or meeting types are non-negotiable so it surfaces the right ones.
- **Keep prep as a draft, not a send.** Let Scout do the assembling and keep the final word yours,
  especially for anything customer- or exec-facing. That's the human-in-the-loop pattern working as intended.
- **Pair it with deliverable-watching.** Coordination and deliverables are two halves of the same week —
  add [Have Scout watch your deliverables](autopilots-track-deliverables.md) so both run in the background.

## Watch out for
- **You stay accountable.** Scout acts under *your* governed identity within *your* permissions — useful,
  but it means you own the outcomes. Keep sensitive actions behind your sign-off.
- **Calendar judgment isn't perfect.** A proposed time or an "important" flag can miss context Scout
  doesn't have. Skim before you trust, especially early while it's still building context.
- **Prep is a starting point, not a final artifact.** Treat generated materials as a draft to review —
  the value is the head start, not blind reliance.
- **It's private preview.** Behavior can change as Scout evolves; check the
  [Microsoft Scout docs](https://learn.microsoft.com/en-us/microsoft-scout/) if something works
  differently than described.

## Where this leads (the ramp)
Coordinating meetings is one standing job; the natural next one is watching the *work itself* — what's
coming due and what's quietly stalling — so Scout protects your time and surfaces risk before it bites.

> **Next:** [Autopilots → Have Scout watch your deliverables and flag risks](autopilots-track-deliverables.md)

## Related
- [Autopilots → Meet Microsoft Scout — and what Autopilots are](../walkthroughs/autopilots-meet-scout.md)
- [Autopilots → Find out if you can get Scout — and turn it on](../walkthroughs/autopilots-get-access.md)
- [Autopilots → Have Scout watch your deliverables and flag risks](../walkthroughs/autopilots-track-deliverables.md)
- Stage 5 Resources: see `RESOURCES.md` → Autopilots

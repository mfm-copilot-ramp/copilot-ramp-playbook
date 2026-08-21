---
title: Equip Scout with a meeting-recap and follow-through skill
description: Make "recap the meeting and chase the follow-ups" a reusable skill Microsoft Scout runs every time a meeting ends — a clean recap, owners on the actions, and drafted follow-ups waiting for your sign-off.
stage: autopilots
roles: [manager, end-user, champion]
tags: [autopilots, scout, skill, meetings, recap, action-items, follow-up]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [scout-enabled, frontier-enrollment, github-copilot-license]
updated: 2026-08-21
---

# Equip Scout with a meeting-recap and follow-through skill

> The recap you always mean to write and half the time don't. Make it a **reusable skill** equipped onto an
> always-on agent, so every meeting ends with a clean summary, owned actions, and drafted follow-ups — without
> you starting anything.

**Stage:** Autopilots · **For:** Manager, End user, Champion · **Level:** Intermediate · **Time:** 15 min

## When to use this
The value of a meeting leaks out in the hour after it ends. Decisions blur, action items lose their owners,
the follow-up email you meant to send slides to tomorrow and then never. Writing the recap every single time
is precisely the repetitive job an always-on agent should own. Hand it over as a **skill** — "recap and chase
follow-through whenever a meeting ends" — and Scout runs it on the trigger every time, turning a chore you
skip into a capability that just happens.

As always, Scout works **on your behalf under your governed identity** and keeps **you in the loop** — it
drafts the recap and the follow-ups; you approve what goes out.

## What you'll need
- **Scout enabled for you** — Frontier-gated and installed via the desktop experience (GitHub Copilot
  license required). See [the access walkthrough](autopilots-get-access.md).
- Scout connected to your **calendar, Teams, and Outlook** so it knows when a meeting ends and where the
  recap and follow-ups should go.
- Meetings where a recap is actually worth it — recurring team syncs, customer calls, decision meetings —
  so you can point the skill at the right ones rather than every 1:1.

## Try it now — the prompt
Equip the recap skill with a clear trigger and a clear output:

```
Take on a standing "meeting recap" skill. Whenever one of my meetings that
has notes or a transcript ends:
- Draft a short recap: the decisions made, the open questions, and the action
  items with an owner and a due date on each.
- Draft the follow-up message to the attendees, and draft any tasks the actions
  imply for me.
- Post it all to me for review — don't send the follow-up or create tasks until
  I approve. Focus on my customer calls and team syncs, skip routine 1:1s.
```

**Why this works:** it defines a **reusable skill** with a real **trigger** (a meeting with notes ends), a
tight **deliverable** (recap + owned actions + drafted follow-up), and a firm **human-in-the-loop gate**
(nothing sends until you approve). That's a repetitive task turned into an equipped, always-on capability.

## Step by step
1. **Open Scout in Teams** and confirm it can see your calendar, Teams, and Outlook — the surfaces a meeting
   and its follow-up live across.
2. **Equip the skill.** Paste the prompt above and tell Scout which kinds of meetings matter — customer
   calls, team syncs, decision meetings — and which to skip.
3. **Let the first recap land.** After your next qualifying meeting, Scout posts a draft recap with owned
   actions and a drafted follow-up. Check it against what you remember happening.
4. **Tune the shape.** Tell Scout what to keep or cut ("always call out risks separately," "don't assign an
   owner unless it was said out loud"). The skill's format sharpens with each correction.
5. **Approve and send.** You review the recap and follow-up, edit anything off, and send — Scout never sends
   or creates tasks on its own. You're the gate on everything that leaves your name.
6. **Leave it running.** Once tuned, the skill fires on every qualifying meeting without you lifting a finger —
   the recap you never used to write now writes itself and waits for your sign-off.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Chain it to coordination.** Pair with [Scout coordinating your meetings and prep](autopilots-coordinate-meetings.md)
  so the same agent that set the meeting up and prepped you also closes it out — the full loop, both ends
  handled in the background.
- **Route recaps to the right home.** Ask Scout to drop customer-call recaps into the account's
  OneNote/SharePoint and team-sync recaps into the team channel, so the summary lands where the team already
  looks.
- **Capture the format as a team recipe.** A recap shape that works is worth standardizing — write it up as a
  [Cowork recipe](cowork-recipe-library.md) so the whole team's recaps look and read the same.

## Watch out for
- **A draft is a starting point.** Scout's recap reflects what it could see in the notes or transcript — it
  can miss nuance or misattribute an action. Read before you send; you're the source of truth on what was
  actually decided.
- **You own what it sends and creates.** Follow-ups and tasks stay drafts under your governed identity until
  you approve them. Keep customer-facing recaps behind your explicit review.
- **No notes, no recap.** The skill leans on a meeting having notes or a transcript — for meetings without
  either, there's little for Scout to work from. Scope it to the meetings where that content exists.
- **It's private preview.** Capabilities shift as Scout evolves — verify against the
  [Microsoft Scout docs](https://learn.microsoft.com/en-us/microsoft-scout/) if behavior differs from what's
  described here.

## Where this leads (the ramp)
You've now equipped Scout with a third standing skill and seen how much of the busywork around meetings an
always-on agent can carry. When you want the follow-through to take real, governed actions — file the tasks
into your work-tracking system of record, post to a governed channel on a rule — you've outgrown the
ready-made skill and you're ready to *build* the tool that does it.

> **Next:** [Stage 6 · Copilot Studio](../stages/stage-6-studio.md) — where recap follow-through becomes a governed tool that acts

## Related
- [Autopilots → Let Scout coordinate your meetings and prep](../walkthroughs/autopilots-coordinate-meetings.md)
- [Autopilots → Equip Scout with an always-on inbox-triage skill](../walkthroughs/autopilots-inbox-triage.md)
- [Autopilots → Equip Scout with a continuous customer-health watch](../walkthroughs/autopilots-customer-health-watch.md)
- [Skills Catalog → Autopilots (Scout) skills](../skills.md#autopilots-scout-skills)
- Stage 5 Resources: see `RESOURCES.md` → Autopilots

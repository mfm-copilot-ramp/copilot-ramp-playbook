---
title: Equip Scout with a continuous customer-health watch
description: Take the worst-first customer-health digest you'd run by hand in Cowork and equip it onto Microsoft Scout as an always-on skill, so the ranked list of at-risk accounts is never stale.
stage: autopilots
roles: [manager, champion, end-user]
tags: [autopilots, scout, skill, customer-health, accounts, risk, lineage]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [scout-enabled, frontier-enrollment, github-copilot-license]
updated: 2026-08-21
---

# Equip Scout with a continuous customer-health watch

> You already know how to rank your book of business worst-first as a Cowork recipe. This is that same
> **skill** — equipped onto an always-on agent so the ranked list stays live, instead of being as old as the
> last time you remembered to run it.

**Stage:** Autopilots · **For:** Manager, Champion, End user · **Level:** Intermediate · **Time:** 15 min

!!! tip "This is a lineage skill"
    The [customer-health digest](cowork-customer-health-digest.md) is a **Cowork recipe** — a skill you
    *describe and run on demand*. This walkthrough equips that exact capability onto **Scout** so it runs
    *continuously*. Same skill, one rung up the ramp. That progression — recipe → Autopilot skill → governed
    Studio tool — is the spine of the [Skills Catalog](../skills.md).

## When to use this
A worst-first health ranking is only useful the day you run it. By Thursday an account that was green on
Monday has gone quiet, a renewal clock started ticking, a support thread escalated — and your list doesn't
know. Re-running the digest by hand every few days is exactly the kind of recurring job you shouldn't have to
remember. Equip it onto Scout as a **standing skill** and the ranked list re-scores itself as the signals
change, surfacing the account that just slipped *before* your next check-in.

As always, Scout works **on your behalf under your governed identity** and keeps **you in the loop** — it
ranks and flags; you decide where the week goes.

## What you'll need
- **Scout enabled for you** — Frontier-gated and installed via the desktop experience (GitHub Copilot
  license required). See [the access walkthrough](autopilots-get-access.md).
- Scout connected to where account signals live — **Outlook, Teams, calendar**, and any **OneDrive/SharePoint**
  where account notes or docs sit.
- A working definition of **health** for your accounts — the signals that mean "at risk" (gone quiet,
  escalating thread, slipped date, negative sentiment) so the ranking reflects your reality, not a generic one.

## Try it now — the prompt
Equip the watch as a named, standing skill:

```
Take on a standing "customer-health watch" skill and keep it always-on:
- Rank my accounts worst-first by risk, using signals you can see — threads
  gone quiet, escalations, slipped dates, sentiment, and upcoming renewals.
- Re-score as those signals change; I want the list live, not a one-time snapshot.
- Post me a short worst-first brief every Monday, and ping me mid-week the
  moment an account moves sharply the wrong way — with the why and a link.
Don't message any customer directly without checking with me first.
```

**Why this works:** it names a **reusable skill** ("customer-health watch"), gives it a **continuous trigger**
(re-score as signals change), sets the **deliverable** (worst-first brief + sharp-move alerts), and draws the
**human-in-the-loop line** on the action that carries weight (customer contact). That's a recipe promoted into
an always-on capability.

## Step by step
1. **Open Scout in Teams** and confirm it can see the surfaces your account signals run on — Outlook, Teams,
   calendar, and the OneDrive/SharePoint where account context lives.
2. **Equip the skill.** Paste the prompt above and name your accounts and what "at risk" means for you.
   You're handing over a standing watch, not asking for a single ranking.
3. **Read the first ranking as calibration.** Scout posts a worst-first brief. Check whether its risk signals
   match your gut — this first pass is where you teach it your definition of health.
4. **Tune the signals.** Tell Scout what to weight ("a renewal inside 60 days always floats to the top,"
   "ignore the internal thread — that's not the customer"). The skill's ranking sharpens each correction.
5. **Act on the sharp movers.** When Scout pings you that an account moved hard the wrong way, you decide the
   move — reach out, loop in the team, or watch it. Scout surfaces; you steer.
6. **Leave it running.** Once calibrated, the list stays live on its own — no more stale rankings, no more
   remembering to re-run it. The skill *is* the always-on version of your Cowork recipe.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Feed the Monday brief into your triage.** Pair this with the
  [inbox-triage skill](autopilots-inbox-triage.md) so the at-risk accounts show up in the same morning brief
  as the rest of what needs you.
- **Capture the definition as a shared recipe.** Your tuned "what counts as at-risk" logic is worth reusing —
  write it up as a [Cowork recipe](cowork-recipe-library.md) so the team ranks health the same way.
- **Graduate it when the actions get real.** The day you want the watch to *do* something governed —
  auto-open a save-the-account task, write to the CRM — that's the cue to build it as a Studio tool.

## Watch out for
- **The ranking is a lens, not the truth.** Scout ranks on the signals it can see; a quiet account may be
  fine and a noisy one may be healthy. Use it to aim your attention, not to replace your judgment.
- **You own any outreach.** Scout stays behind your sign-off on anything that reaches a customer — it flags
  and drafts under your governed identity, you decide what actually gets sent.
- **Garbage signals, garbage ranking.** If Scout can't see the surfaces where account reality lives, the
  watch ranks on partial data. Connect the sources that matter, or scope the skill to the accounts it can
  actually see.
- **It's private preview.** Capabilities shift as Scout evolves — verify against the
  [Microsoft Scout docs](https://learn.microsoft.com/en-us/microsoft-scout/) if behavior differs from what's
  described here.

## Where this leads (the ramp)
You've now taken a recipe you'd run by hand and equipped it onto an always-on agent — the middle rung of the
skill lineage. When the watch needs to take real, governed actions against a system of record — open a task,
update the CRM, notify a team channel on a rule — you've outgrown the ready-made skill and you're ready to
*build* the tool that does it.

> **Next:** [Stage 6 · Copilot Studio](../stages/stage-6-studio.md) — where the watch becomes a governed tool that acts, not just flags

## Related
- [Cowork → Customer-health digest (the recipe this graduates from)](../walkthroughs/cowork-customer-health-digest.md)
- [Autopilots → Equip Scout with an always-on inbox-triage skill](../walkthroughs/autopilots-inbox-triage.md)
- [Autopilots → Have Scout watch your deliverables and flag risks](../walkthroughs/autopilots-track-deliverables.md)
- [Skills Catalog → Autopilots (Scout) skills](../skills.md#autopilots-scout-skills)
- Stage 5 Resources: see `RESOURCES.md` → Autopilots

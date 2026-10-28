---
title: Equip Autopilot with an always-on inbox-triage skill
description: Turn "surface what actually needs me" into a skill Autopilot runs in the background, triaging your inbox and signals into one short daily brief.
stage: autopilots
roles: [end-user, manager, champion]
tags: [autopilots, scout, autopilot, skill, inbox, triage, daily-brief, signals]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [scout-enabled, frontier-enrollment, github-copilot-license]
updated: 2026-10-28
---

# Equip Autopilot with an always-on inbox-triage skill

> The point isn't a one-time "clean my inbox." It's a **reusable skill** — captured once, equipped onto an
> always-on agent — that triages what actually needs you every day, without you starting it.

**Stage:** Autopilots · **For:** End user, Manager, Champion · **Level:** Intermediate · **Time:** 15 min

## When to use this
Your inbox and channels are a firehose, and the two messages that actually needed you today are buried
between forty that didn't. Reading everything to find those two is the tax you pay every morning. This is
exactly the kind of standing job an always-on agent should own — and the way you hand it over is as a
**skill**: a named, reusable capability ("triage my signals into a daily brief") that Autopilot (formerly Microsoft Scout) carries out in
the background and reruns on its own, instead of a prompt you retype each day.

As always, Autopilot works **on your behalf, with its own identity in your tenant** (permissions, audit and
governance behind it) and keeps **you in the loop** — it
surfaces and drafts; you decide and send.

## What you'll need
- Access to **Autopilot** (private preview) — or, today, the Frontier desktop app still documented on Learn
  as **Microsoft Scout** (needs Frontier turned on by your admin, an Intune policy + admin attestation, a
  Microsoft 365 Copilot license, and a GitHub Copilot Business or Enterprise license). See
  [Find out if you can get Autopilot](autopilots-get-access.md).
- Autopilot connected to where your signals live — **Outlook, Teams, and your calendar** at minimum, plus
  **OneDrive/SharePoint** if you want document mentions folded in.
- A rough sense of **what "needs me" means for you** — the people, threads, and topics that are real signal
  vs. the newsletters and FYIs that are noise.

## Try it now — the prompt
Hand Autopilot the skill in plain language — name it, scope it, and say what "done" looks like:

```
Take on a standing "morning triage" skill for me and rerun it every workday:
- Scan my inbox and Teams for anything that actually needs me — a direct ask,
  a decision waiting on me, a thread that's escalating, something from
  [my leadership / key customers].
- Ignore newsletters, FYIs, and auto-notifications.
- Post me one short brief by 8am: what needs a reply, what needs a decision,
  and what's just worth knowing — each with a one-line why and a link.
Draft replies for the obvious ones, but don't send anything without me.
```

**Why this works:** it turns a vague "help with email" into a **reusable skill** with the four things that
make one rerunnable — a **name** ("morning triage"), a **trigger** (every workday by 8am), a **scope**
(needs-me vs. noise), and a **deliverable** (the three-bucket brief). That's the same recipe shape you'd
capture in Cowork, now equipped onto an always-on agent.

## Step by step
1. **Reach Autopilot where you already work** (Teams, Outlook, a chat or a channel) and confirm it can see
   the surfaces your signals run on — Outlook, Teams,
   calendar, and OneDrive/SharePoint if you want documents included.
2. **Equip the skill.** Paste the prompt above, naming the people and topics that count as real signal for
   you. You're not asking for one triage — you're handing over a standing capability.
3. **Let the first brief land.** Autopilot runs the skill and posts the three-bucket brief. Treat day one as a
   calibration run, not the finished product.
4. **Tune what counts as signal.** Tell Autopilot what it over- or under-surfaced ("that distribution list is
   noise," "always float anything from [customer]"). The skill sharpens each time you correct it.
5. **Approve the drafts.** For the obvious replies Autopilot drafted, you review and send — the agent never
   sends on its own. You stay the last step on anything that leaves your name.
6. **Leave it running.** Once it's calibrated, the skill just runs — the daily brief shows up without you
   ever restarting it. That's the difference between a prompt and an equipped skill.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Pair it with a deliverables watch.** Triage tells you what's landing in your inbox; a
  [deliverables watch](autopilots-track-deliverables.md) tells you what's quietly slipping. Run both and
  Autopilot covers the week from both angles.
- **Promote a good brief into a shared team skill.** If your morning-triage skill works, the shape is
  reusable — capture it as a [Cowork recipe](cowork-recipe-library.md) so teammates can equip their own
  version instead of reinventing it.
- **Add a weekly rollup.** Once the daily skill is stable, ask Autopilot to also post a Friday "what needed you
  this week" summary — the same skill, one longer cadence.

## Watch out for
- **The brief is a filter, not a verdict.** Autopilot surfaces what *looks* like it needs you; whether it truly
  does — and what to do — is your call. Early on it will guess wrong; that's what the tuning step is for.
- **You own everything it drafts.** Autopilot acts on your behalf with its own identity in your tenant, with permissions, audit
  and governance behind it, and drafted replies stay drafts until you send them. Keep anything to leadership or customers behind your
  explicit review.
- **Scope creep dulls it.** A triage skill asked to watch everything surfaces everything — which is the same
  as surfacing nothing. Keep "needs me" tight and let the noise stay filtered out.
- **It's private preview.** Capabilities shift as Autopilot evolves — verify against the
  [Microsoft Scout desktop app docs](https://learn.microsoft.com/en-us/microsoft-scout/) if behavior differs from what's
  described here.

## Where this leads (the ramp)
You've now equipped Autopilot with a reusable skill and felt the shift from *running a prompt* to *handing over a
standing capability*. When you hit the wall of what a ready-made Autopilot skill can do — you need it to take
real, governed actions against a system of record, or to run org-wide under central control — that's the
signal you've outgrown equipping an agent and you're ready to *build* the capability as a Studio tool.

> **Next:** [Stage 6 · Copilot Studio](../stages/stage-6-studio.md) — where a reusable skill graduates into a governed tool an agent calls

## Related
- [Autopilots → Meet Autopilot (formerly Microsoft Scout)](../walkthroughs/autopilots-meet-scout.md)
- [Autopilots → Equip Autopilot with a continuous customer-health watch](../walkthroughs/autopilots-customer-health-watch.md)
- [Autopilots → Have Autopilot watch your deliverables and flag risks](../walkthroughs/autopilots-track-deliverables.md)
- [Skills Catalog → Autopilots skills](../skills.md#autopilots-scout-skills)
- Stage 5 Resources: see `RESOURCES.md` → Autopilots

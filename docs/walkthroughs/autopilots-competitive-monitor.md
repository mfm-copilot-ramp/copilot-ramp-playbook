---
title: Always-on competitive and news monitor
description: Have Scout watch named competitors and topics on a schedule, then deliver a short digest of what changed, why it matters, and what to do next.
stage: autopilots
roles: [end-user, manager, champion]
tags: [autopilots, scout, competitive-intelligence, news, digest, monitoring]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [m365-copilot-license, scout-access]
updated: 2026-08-29
---

# Always-on competitive and news monitor

> Equip Scout with a standing skill that watches named competitors and topics, then briefs you on what changed and why it matters.

**Stage:** Autopilots · **For:** End user, Manager, Champion · **Level:** Intermediate · **Time:** 15 min

## When to use this
Competitive news rarely arrives when you have time to look for it. Use this when you want Scout to keep a light, scheduled watch over named competitors, customers, products, and market topics, then turn the changes into a brief you can review before a planning meeting, customer call, or leadership readout.

Scout is Frontier private preview and gated. Treat this as a skill you equip onto an always-on agent that works on your behalf under your governed identity; verify current behaviour in the [Microsoft Scout docs](https://learn.microsoft.com/en-us/microsoft-scout/).

## What you'll need
- **M365 Copilot licence** and **Scout access** through the Frontier-gated private preview.
- The competitors, customers, products, or market topics you want Scout to watch, plus any trusted sources it can access.
- A sense of what matters to your role: pricing moves, product launches, executive changes, customer wins, regulatory shifts, or messaging changes.

## Try it now — the prompt
Equip the monitor as a named, scheduled skill:

```
Take on a standing "competitive monitor" skill for me.

Watch [competitors/topics/customers] using sources you can access, including
[preferred public sources or internal sources]. Run this on [schedule].

Send me a short digest that covers:
- what changed since the last digest;
- why it matters for [my team/account/market];
- any source link I should read myself;
- suggested follow-up questions or actions.

Keep the digest concise and separate confirmed facts from interpretation.
Do not contact anyone or post externally without my review.
```

**Why this works:** it gives Scout a durable watch list, a trigger, trusted sources, and a clear output format. It also keeps the human-in-the-loop boundary explicit: Scout briefs and drafts; you decide what to do.

## Step by step
1. **Open Microsoft Scout** and confirm it can use the work surfaces and sources that are appropriate for your organisation. Keep the watch limited to information you are permitted to access and use.
2. **Equip the skill.** Paste the prompt, replacing the bracketed variables with your competitors, topics, sources, and schedule.
3. **Review the first digest as calibration.** Scout should summarise what changed, link back to sources where available, and distinguish facts from its interpretation.
4. **Tighten the watch list.** Tell Scout which topics were noise, which sources are more trusted, and what deserves escalation before the next scheduled digest.
5. **Use it before live work.** Read the digest before account reviews, planning meetings, or executive updates; ask Scout to draft talking points only after you have checked the sources.
6. **Leave it running.** Once calibrated, the monitor becomes background context instead of a search you remember to run manually.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Ask for source grading.** "For each item, label the source as official, press, analyst, community, or internal, and tell me how much weight to give it."
- **Add account relevance.** "When a competitor move affects [customer/account], call that out separately with the likely sales implication."
- **Create a pre-meeting version.** "Before my [meeting], turn the latest digest into talking points and questions I can use live."
- **Narrow the alert threshold.** "Only interrupt me between digests for material changes that affect [priority product/market/account]."

## Watch out for
- **Scout is gated preview.** Availability and behaviours can change; confirm current scope in the [Microsoft Scout docs](https://learn.microsoft.com/en-us/microsoft-scout/).
- **Public news is not the same as truth.** Scout can summarise what sources say, but you still need to verify sensitive claims before using them with customers or leaders.
- **Noise grows fast.** A monitor asked to watch everything will brief you on everything. Keep topics named and review what should be ignored.
- **Do not outsource judgment.** Scout can suggest why something matters; you decide whether it changes your plan.

## Where this leads (the ramp)
You've equipped an always-on skill that turns recurring market scanning into a governed background brief. When the monitor needs to write into a system of record, route alerts by policy, or combine with formal approval workflows, harden it into a governed tool in Stage 6 Studio.

> **Next:** [Stage 6 · Copilot Studio](../stages/stage-6-studio.md) — where an always-on watch can become a governed tool with controlled actions

## Related
- [Autopilots → Meet Microsoft Scout — and what Autopilots are](../walkthroughs/autopilots-meet-scout.md)
- [Autopilots → Equip Scout with an always-on inbox-triage skill](../walkthroughs/autopilots-inbox-triage.md)
- [Stage 5 · Autopilots](../stages/stage-5-autopilots.md)

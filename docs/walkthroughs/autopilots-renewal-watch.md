---
title: Renewal and at-risk account watch
description: Have Autopilot watch renewals and engagement signals in the background, flagging at-risk accounts early with context for your next move.
stage: autopilots
roles: [manager, champion, end-user]
tags: [autopilots, scout, autopilot, renewals, accounts, risk, engagement]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [m365-copilot-license, scout-access]
updated: 2026-10-28
---

# Renewal and at-risk account watch

> Equip Autopilot (formerly Microsoft Scout) with a standing renewal watch that flags accounts starting to drift before the renewal is already in trouble.

**Stage:** Autopilots · **For:** Manager, Champion, End user · **Level:** Intermediate · **Time:** 15 min

## When to use this
Renewal risk often shows up first as weak engagement, missed follow-ups, quiet stakeholders, or unresolved issues. Use this when you want Autopilot to keep watch across the signals it can access and flag accounts that need attention before the renewal date is the only thing left to manage.

Autopilot is in private preview and access is gated. It can help surface patterns on your behalf, but you still decide account strategy and any customer outreach.

## What you'll need
- Access to **Autopilot** (private preview) — or, today, the Frontier desktop app still documented on Learn as **Microsoft Scout** (needs Frontier turned on by your admin, an Intune policy + admin attestation, a Microsoft 365 Copilot licence, and a GitHub Copilot Business or Enterprise licence). See [Find out if you can get Autopilot](autopilots-get-access.md).
- The accounts, renewal dates, owners, and success signals you are allowed to share with Autopilot.
- Access to relevant work signals, such as Outlook, Teams, calendar, OneDrive, SharePoint, and any approved account context.

## Try it now — the prompt
Equip the watch as a standing renewal-risk skill:

```
Take on a standing "renewal watch" skill for [account list or segment].

Use renewal dates and engagement signals you can access, including
[emails/meetings/Teams/account notes], to flag accounts that may be at risk.
Run the watch on [schedule] and alert me sooner when risk increases.

For each account you flag, give me:
- renewal timing or relevant milestone;
- signals that changed;
- why the account may be at risk;
- the source links I should check;
- a suggested next move for my review.

Do not contact customers, update account records, or notify others without my
approval.
```

**Why this works:** it defines the watched accounts, the trigger, the evidence Autopilot should use, and the exact alert shape. It also makes the boundary clear: Autopilot flags and suggests; the account owner chooses the move.

## Step by step
1. **Open Autopilot** and confirm it can see the account and renewal signals you are permitted to use.
2. **Equip the skill.** Paste the prompt, replacing the bracketed variables with the accounts, schedule, and trusted signal sources.
3. **Review the first risk list.** Autopilot should return flagged accounts with timing, changed signals, source links, and suggested next moves.
4. **Calibrate what risk means.** Tell Autopilot which signals matter most, such as executive silence, skipped meetings, unresolved support threads, or a renewal inside [time window].
5. **Act through the owner.** Use Autopilot's brief to plan outreach, prepare a check-in, or loop in the right internal team. Keep customer contact under explicit human review.
6. **Keep the watch live.** Once tuned, Autopilot can nudge when engagement changes instead of waiting for the next manual pipeline review.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Add severity language.** "Label each flagged account as monitor, needs owner action, or urgent review, and explain the evidence."
- **Connect the account plan.** "Compare the latest signals with [account plan/source] and flag gaps against the plan."
- **Draft the internal prep.** "For urgent accounts, draft a short internal prep note with questions for the account team."
- **Separate renewal risk from general noise.** "Ignore broad account activity unless it changes renewal confidence."

## Watch out for
- **Signals are incomplete.** Autopilot can only reason over what it can access; CRM details, support data, or offline account knowledge may need manual input.
- **Risk is not blame.** A flagged account needs attention, not panic. Use the evidence to prioritise review.
- **Keep outreach reviewed.** Autopilot should not contact customers or update official records without your approval.
- **Preview scope matters.** Autopilot is in gated private preview; verify current capabilities in the [Microsoft Scout desktop app docs](https://learn.microsoft.com/en-us/microsoft-scout/).

## Where this leads (the ramp)
You've equipped Autopilot to turn recurring renewal review into an always-on account watch. When the watch needs approved writes to CRM, workflow routing, or formal escalation rules, harden it into a governed tool in Stage 6 Studio.

> **Next:** [Stage 6 · Copilot Studio](../stages/stage-6-studio.md) — where renewal risk logic can become a governed tool tied to systems of record

## Related
- [Autopilots → Equip Autopilot with a continuous customer-health watch](../walkthroughs/autopilots-customer-health-watch.md)
- [Autopilots → Equip Autopilot with an always-on inbox-triage skill](../walkthroughs/autopilots-inbox-triage.md)
- [Stage 5 · Autopilots](../stages/stage-5-autopilots.md)

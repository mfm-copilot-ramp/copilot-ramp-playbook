---
title: Find out if you can get Scout — and turn it on
description: Microsoft Scout is in private preview. Find out whether your org can get this autopilot and what has to be true to switch it on before you plan any workflow.
stage: autopilots
roles: [end-user, champion, it-admin]
tags: [autopilots, scout, frontier, access, enablement, intune]
level: starter
time: 15 min
status: walkthrough
prereqs: [frontier-enrollment, github-copilot-license]
updated: 2026-06-11
---

# Find out if you can get Scout — and turn it on

> Scout is in private preview — so before you plan a single workflow, find out whether your org can
> get it and what has to be true to switch it on.

**Stage:** Autopilots · **For:** End user, Champion, IT admin · **Level:** Starter · **Time:** 15 min

## When to use this
You've read [what Autopilots are and what Scout does](autopilots-meet-scout.md), you're sold, and now
you want to use it. Stop here first. **Scout is experimental and available in private preview through
the Frontier program** — it isn't a switch every tenant has yet. This page is the honest on-ramp: how to
find out if you're eligible, what your IT admin has to configure, and what *you* need to install once the
door is open.

Going through this before you design a workflow saves you from building a process around an agent you
can't actually turn on yet.

## What you'll need
- **Frontier program enrollment** for your tenant — Scout is gated behind it. If you don't know whether
  your org is enrolled, your IT admin or Microsoft account team does.
- **Intune policy configuration** — Scout requires policy to be set up before it can be enabled for users.
- An **opt-in attestation** — turning Scout on is a deliberate, attested choice, not a default.
- A **GitHub Copilot license** — required to download and install the Scout desktop experience once your
  org has enabled it.

## Try it now — the prompt
Not sure where your org stands? You don't need Scout to find out — use the Copilot Chat you already have
to draft the note that gets you an answer:

```
Draft a short, friendly message to my IT admin asking three things:
1) Is our tenant enrolled in the Microsoft Frontier program?
2) Has the Intune policy for Microsoft Scout been configured, and are we opting in?
3) Do I have (or can I get) a GitHub Copilot license to install the Scout desktop app?
Keep it under 120 words and make the ask easy to say yes or no to.
```

**Why this works:** it turns a vague "can I get Scout?" into three concrete, answerable questions mapped
exactly to the real prerequisites — so your admin can reply in one pass instead of a back-and-forth.

## Step by step
1. **Confirm Frontier enrollment.** Ask your IT admin or Microsoft account team whether your tenant is in
   the **Frontier program** — the early-access channel Scout ships through. Point them at the
   [Frontier program page](https://m365.cloud.microsoft/frontier) if they need the source. No Frontier,
   no Scout — this is the gate everything else depends on.
2. **Have IT configure the Intune policy.** Scout requires **Intune policy configuration** before it can
   be enabled. This is an admin task, not a user one — your job is to make sure it's on someone's list.
3. **Complete the opt-in attestation.** Enabling Scout involves an explicit **opt-in attestation** — a
   deliberate "yes, we're turning this on" rather than a silent default. Confirm with your admin that this
   step is done for your group.
4. **Check your GitHub Copilot license.** You need a **GitHub Copilot license** to download and install
   the **Scout desktop experience**. Verify you have one (or request it) before you try to install.
5. **Install the desktop app.** Once the org-side prerequisites are met and you have the license, download
   and install the desktop experience, then interact with Scout in Teams. Follow the current steps on the
   [Microsoft Scout setup page](https://learn.microsoft.com/microsoft-scout) — it's the source of truth as
   the preview evolves.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Make it one conversation, not five.** Send the three-question message above to your admin *and* your
  account team at once so eligibility, policy, and licensing all get answered together.
- **Line up your first job while you wait.** Access can take time to land. Use the gap to pick the
  standing job you'll hand Scout first — see [coordinate your meetings](autopilots-coordinate-meetings.md)
  or [watch your deliverables](autopilots-track-deliverables.md).
- **Champions: build a short eligibility FAQ.** If your org is in Frontier, a one-pager that answers
  "am I eligible, and how do I turn it on?" will save your IT team a flood of repeat questions.

## Watch out for
- **Private preview means not everyone gets in.** Scout is experimental and Frontier-gated — eligibility
  varies by tenant. Treat "we'll have it soon" as unconfirmed until your admin says yes.
- **All prerequisites are AND, not OR.** Frontier enrollment **and** Intune policy **and** the opt-in
  attestation **and** a GitHub Copilot license all have to be true. Missing any one blocks you.
- **The setup steps can change.** Because it's a preview, the install flow may shift — always check the
  [Microsoft Scout setup page](https://learn.microsoft.com/microsoft-scout) rather than relying on a
  remembered sequence.
- **Don't promise dates you don't control.** The IT-side configuration isn't yours to schedule — frame
  Scout as "coming when we're enabled," not a committed go-live.

## Where this leads (the ramp)
Once Scout is installed and you can reach it in Teams, the payoff begins: hand it its first standing job
and let it work in the background under your guardrails.

> **Next:** [Autopilots → Let Scout coordinate your meetings and prep](autopilots-coordinate-meetings.md)

## Related
- [Autopilots → Meet Microsoft Scout — and what Autopilots are](../walkthroughs/autopilots-meet-scout.md)
- [Autopilots → Let Scout coordinate your meetings and prep](../walkthroughs/autopilots-coordinate-meetings.md)
- [Autopilots → Have Scout watch your deliverables and flag risks](../walkthroughs/autopilots-track-deliverables.md)
- Stage 5 Resources: see `RESOURCES.md` → Autopilots

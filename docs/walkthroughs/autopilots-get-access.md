---
title: Find out if you can get Autopilot — and turn it on
description: Autopilot (formerly Scout) is in private preview. Check access, the admin gates, the licenses, and the spending policy before you plan any workflow.
stage: autopilots
roles: [end-user, champion, it-admin]
tags: [autopilots, autopilot, scout, frontier, access, enablement, intune]
level: starter
time: 15 min
status: walkthrough
prereqs: [frontier-enrollment, github-copilot-license]
updated: 2026-10-28
---

# Find out if you can get Autopilot — and turn it on

> Autopilot is in private preview — so before you plan a single workflow, find out whether your org can
> get it, what your admin has to switch on, and who pays for the credits.

**Stage:** Autopilots · **For:** End user, Champion, IT admin · **Level:** Starter · **Time:** 15 min

## When to use this
You've read [what Autopilot is](autopilots-meet-scout.md) and want to use it. Stop here first: it's in
**private preview**, so check your access before you design a workflow around it.

## What you'll need
- **A way in:** the **Autopilot private preview** (ask your account team), or today's **Scout desktop app**
  through Frontier.
- **For the desktop app — all of these:** Copilot Frontier turned on for you, an Intune policy + admin
  attestation, a **Microsoft 365 Copilot** license, and a **GitHub Copilot Business or Enterprise** license.
- **A spending policy** — Autopilot runs on usage-based Copilot Credits, so your admin sets a limit first.

## Try it now — the prompt
Not sure where your org stands? You don't need Autopilot to find out — use the Copilot Chat you already
have to draft the note that gets you an answer:

```
Draft a short, friendly message to my IT admin asking four things:
1) Can I join the Autopilot (formerly Microsoft Scout) private preview, or is Copilot Frontier
   turned on for me in the Microsoft 365 admin center?
2) Are the Microsoft Scout Intune policy and the Frontier attestation in place?
3) Do I have a GitHub Copilot Business or Enterprise license with the Copilot app policy enabled?
4) Is there a Copilot Credits spending policy I'd fall under, and what's my monthly limit?
Keep it under 140 words and make each ask easy to answer yes or no.
```

**Why this works:** it turns a vague "can I get Autopilot?" into four answerable questions mapped exactly to
the real gates — access, device policy, licensing, and budget — so your admin can reply in one pass.

## Step by step
1. **Confirm the access path.** Ask your IT admin or Microsoft account team whether you can join the
   **Autopilot private preview**, or whether **Copilot Frontier** is turned on for you. Admins set Frontier
   in the Microsoft 365 admin center under **Copilot → Settings → Copilot Frontier** (No access / All users /
   Specific users); allow about three hours for it to apply.
   ([Microsoft Frontier program](https://learn.microsoft.com/microsoft-365/admin/manage/get-started-frontier))
2. **Have IT configure the Intune policy.** The desktop app needs an Intune policy that enables sign-in on
   your device. This is an admin task — your job is to make sure it's on someone's list.
   ([Set up with Intune](https://learn.microsoft.com/microsoft-scout/admin-intune-setup))
3. **Confirm the attestation.** Because the app can route data outside Microsoft 365 to model providers
   through GitHub, admins must complete the Frontier organization sign-up (attestation) for your org.
4. **Check both licenses.** You need a **Microsoft 365 Copilot** license and a **GitHub Copilot Business or
   Enterprise** seat — and the GitHub **Copilot app** policy must be enabled for you. A seat without the
   policy is still blocked.
5. **Agree the budget.** Ask which **Copilot Credits spending policy** covers you and what your limit is, so
   your first always-on job doesn't stall halfway through the month.
6. **Install and sign in.** Download the app from the
   [Microsoft Scout get-started page](https://learn.microsoft.com/microsoft-scout/get-started), sign in to
   Microsoft 365 with your work account, then sign in to GitHub. Sign-in only succeeds once the admin gates
   are complete.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Make it one conversation, not five.** Send the four-question message above to your admin *and* your
  account team at once so access, policy, licensing, and budget all get answered together.
- **Line up your first job while you wait.** Access can take time to land. Use the gap to pick the
  standing job you'll hand Autopilot first — see [coordinate your meetings](autopilots-coordinate-meetings.md)
  or [watch your deliverables](autopilots-track-deliverables.md).
- **Champions: build a short eligibility FAQ.** A one-pager that answers "am I eligible, what do I need, and
  who approves the credits?" will save your IT team a flood of repeat questions.

## Watch out for
- **Installing isn't access.** The download always succeeds; sign-in is where the gates are enforced — and a
  blocked sign-in doesn't clearly say why. Check the admin gates before troubleshooting the client.
- **All prerequisites are AND, not OR.** Frontier access **and** Intune policy **and** attestation **and**
  both licenses all have to be true. Missing any one blocks you.
- **Not in government clouds.** The desktop app isn't available in GCC, GCC High, DoD, or sovereign clouds.
- **Data leaves the Microsoft 365 boundary for model calls.** Processing through GitHub Copilot isn't covered
  by some Microsoft 365 protections (data residency, retention, label enforcement, eDiscovery) — review the
  [responsible AI FAQ](https://learn.microsoft.com/microsoft-scout/microsoft-scout-responsible-ai-faq) with
  your security team.
- **The setup steps will change.** The product was renamed mid-preview — always check the current docs rather
  than relying on a remembered sequence, and don't promise go-live dates you don't control.

## Where this leads (the ramp)
Once Autopilot is on and you can reach it, the payoff begins: hand it its first standing job and let it
work in the background under your guardrails.

> **Next:** [Autopilots → Let Autopilot coordinate your meetings and prep](autopilots-coordinate-meetings.md)

## Related
- [Autopilots → Meet Autopilot (formerly Microsoft Scout)](../walkthroughs/autopilots-meet-scout.md)
- [Autopilots → Let Autopilot coordinate your meetings and prep](../walkthroughs/autopilots-coordinate-meetings.md)
- [Autopilots → Have Autopilot watch your deliverables and flag risks](../walkthroughs/autopilots-track-deliverables.md)
- Stage 5 Resources: see `RESOURCES.md` → Autopilots

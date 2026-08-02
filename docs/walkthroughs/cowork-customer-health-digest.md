---
title: Generate a weekly customer-health digest across your accounts
description: Describe the account digest you wish you had once and let Copilot Cowork compile a weekly customer-health view across your whole book of business.
stage: cowork
roles: [end-user, manager, champion]
tags: [cowork, sales, csm, customer-health, digest, recurring, accounts, multi-step]
level: intermediate
time: 25 min
status: walkthrough
prereqs: [m365-copilot-license, cowork-access]
updated: 2026-06-05
---

# Generate a weekly customer-health digest across your accounts

> Every Monday you piece together which accounts need attention — scanning emails, meeting notes, and
> ticket trends one customer at a time. Describe the digest you wish landed in your inbox, once, and let
> Cowork compile it across your whole book of business.

**Stage:** Cowork · **For:** End user, Manager, Champion · **Level:** Intermediate · **Time:** 25 min

## When to use this
A CSM's hardest weekly question is *"where do I spend my attention?"* Answering it means looking across
every account — recent activity, sentiment, open issues, renewal timing — and ranking by risk. That's a
wide, repetitive, multi-source sweep: ideal **Cowork** territory. Describe the digest once and it becomes
something you *review*, not something you *build*.

Use this when you manage several accounts and want a consistent Monday-morning read on which ones need you.

## What you'll need
- **M365 Copilot license** with access to **Cowork** *(recurring/background automation needs **Frontier** —
  see the Stage 3 page)*
- Your account signals reachable by Copilot — **emails, meeting notes, the account plan/CRM, support
  trends** in OneDrive/SharePoint or Teams
- A **list of the accounts** you cover (and, ideally, their renewal dates)
- A clear sense of what **"healthy" vs "at risk"** means for you

## Try it now — the prompt
Describe the digest as one outcome across all accounts:

```
Build me a weekly customer-health digest for these accounts: [list]. For each, pull
the last two weeks of activity — emails, meetings, and support trends — and give a
health rating (green/yellow/red) with a one-line reason, the single most important
open item, and any renewal in the next 90 days. Then sort the list worst-first and add
a short "where to spend your time this week" summary at the top. Save it and format it
so I can paste it into an email.
```

**Why this works:** you named the **accounts** and the **signal window** (grounds it), defined **what a
rating means** and the **per-account shape**, and asked it to **rank by risk** with a "where to focus"
header — so the output tells you what to *do*, not just what happened.

## Step by step
1. **State the digest.** Paste the task with your account list. Cowork plans the sweep — which sources it
   reads per account — before it runs.
2. **Let it compile across accounts.** It works account by account, then ranks them. Watch the steps so you
   can spot an account where it found thin or stale data.
3. **Sanity-check the red and yellow accounts first.** Those drive your week — confirm the reason behind
   each rating against what you know:
   ```
   For every red or yellow account, show me the specific emails or notes that drove
   the rating so I can verify it.
   ```
4. **Tune the rating logic.** Make it match your judgment:
   ```
   Treat "no contact in 3+ weeks" as an automatic yellow, and weight an open
   escalation higher than sentiment.
   ```
5. **Make it stick.** Once the format is right, schedule it: "Every Monday at 7am, regenerate this digest
   and email it to me." *(Background automation requires Frontier.)*

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Grow it from a digest into a workflow:
- **Add the next action.** "For each red account, draft the outreach email I should send today."
- **Trend it.** "Compare this week's ratings to last week's and flag any account that dropped a level."
- **Roll it up for leadership.** Managers: "Summarize the team's book — total accounts by rating and the
  three biggest risks across all CSMs."

> **📚 Learn more.** Recurring, process-level delegation like this is the core idea behind the community
> [Cowork Cookbook](https://coworkcookbook.com/) by Sean Galliher _(unofficial)_. See also the
> [M365 Copilot resources hub](https://aka.ms/m365copilot/resources).

## Watch out for
- **A rating is a prompt, not a verdict.** Cowork infers health from the signals it can read; the human read
  on the relationship is still yours. Use it to *direct* attention, not replace judgment.
- **Garbage signals, garbage ratings.** If activity lives in tools Copilot can't see, the digest is
  partial. Note the blind spots so a quiet account isn't mistaken for a healthy one.
- **Keep the source window tight.** "Last two weeks per account" grounds it; "everything about my customers"
  produces mush. Scope makes the difference.

## Where this leads (the ramp)
You've delegated a recurring, multi-account *process*. When the whole team needs the same Monday digest in
the same shape, you've outgrown describing it each time — **Stage 4 · Agent Builder** lets you package the
accounts, signals, and rating rules into an agent everyone can run.

> **Next:** [Agent Builder → Build a team-knowledge agent over a SharePoint site](../walkthroughs/agent-builder-team-knowledge.md)

## Related
- [Stand up a recurring weekly digest](../walkthroughs/cowork-recurring-weekly-digest.md) — the general recurring pattern
- [Run a full QBR prep cycle in Cowork](../walkthroughs/cowork-qbr-prep-cycle.md) — go deep on one account
- Stage 3 Resources: see `RESOURCES.md` → Cowork

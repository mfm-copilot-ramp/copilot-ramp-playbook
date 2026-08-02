---
title: Run a full QBR prep cycle in Cowork
description: Hand the full QBR prep cycle to Copilot Cowork, pulling account data, building the deck, prepping talking points, and chasing follow-ups so you just review.
stage: cowork
roles: [end-user, manager, champion]
tags: [cowork, sales, qbr, deck, account, talking-points, follow-ups, multi-step]
level: intermediate
time: 25 min
status: walkthrough
prereqs: [m365-copilot-license, cowork-access]
updated: 2026-06-05
---

# Run a full QBR prep cycle in Cowork

> Quarterly business reviews eat a day: pull the account data, build the deck, prep your talking points,
> then chase the follow-ups afterward. Hand the whole cycle to Cowork and review four deliverables
> instead of authoring them.

**Stage:** Cowork · **For:** End user, Manager, Champion · **Level:** Intermediate · **Time:** 25 min

## When to use this
A QBR isn't one task — it's a *chain*: gather the account's numbers and activity, shape it into a deck,
distill talking points so you're not reading slides, and after the meeting turn decisions into tracked
follow-ups. Doing each by hand is exactly the kind of multi-step, multi-source work **Cowork** was built
to own.

Use this the week before a QBR, when you'd otherwise block out an afternoon to assemble it all yourself.

## What you'll need
- **M365 Copilot license** with access to **Cowork**
- The account's material reachable by Copilot — **emails, meeting notes, the CRM/account plan, prior QBR
  decks** in OneDrive/SharePoint or Teams
- The **basics of the account**: name, the stakeholders, and what "success this quarter" looked like
- *(Optional)* a **QBR deck template** your org uses, so the output matches house style

## Try it now — the prompt
Describe the full cycle as one outcome — Cowork plans the steps:

```
Prep my QBR for [account name], meeting [date]. Pull the last quarter of activity —
emails, meetings, and the account plan — and: (1) build a QBR deck covering wins,
usage/adoption, open issues, and next-quarter goals; (2) give me one page of talking
points so I can present without reading slides, including the two hard questions
they'll likely ask and how I'd answer; (3) draft a follow-up email template I can send
after the meeting. Save the deck and notes to my files.
```

**Why this works:** you named the **account and window** (grounds it), the **four deliverables** (deck,
talking points, anticipated questions, follow-up), and the **shape of each** — so Cowork produces a
review-ready package, not a vague summary. Anticipating the hard questions is what turns prep into
*confidence*.

## Step by step
1. **State the full cycle.** Paste the task above with your account details. Cowork lays out its plan —
   the sources it'll read and the deliverables it'll build — before running.
2. **Let it gather and assemble.** It searches the account's activity, drafts the deck, and writes the
   talking points. Each step is visible, so you can sanity-check what it found as it goes.
3. **Review the package against what you know.** Open the deck and talking points. Check the numbers and
   the "open issues" slide hardest — those are where a stale source shows.
4. **Refine in plain language:**
   ```
   The adoption slide is buried — move it to position 2 and add the trend vs. last
   quarter. And make the talking points punchier: one line each, lead with the win.
   ```
5. **Close the loop after the meeting.** Bring the decisions back:
   ```
   From the QBR notes, pull the three commitments we made, turn them into tracked
   follow-ups with owners and dates, and fill in the follow-up email I drafted earlier.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Turn one good QBR into a repeatable motion:
- **Make it recurring.** "Two weeks before each quarter-end, draft QBR decks for my top 5 accounts." A
  cycle you describe once can run on a schedule (Frontier needed for background automation).
- **Standardize the shape.** Feed Cowork your QBR template so every deck lands in house style.
- **Build the account-team version.** "Add an internal pre-read for my manager: risks, asks, and where I
  need help."

> **📚 Learn more.** This kind of process-level delegation is the heart of the community
> [Cowork Cookbook](https://coworkcookbook.com/) by Sean Galliher _(unofficial)_. For where Cowork sits in
> the product, see the [M365 Copilot resources hub](https://aka.ms/m365copilot/resources).

## Watch out for
- **Verify every number before it leaves the building.** Cowork assembles from your sources; you own
  accuracy. The usage and revenue figures are exactly what a customer will challenge — check them.
- **Scope the window.** "Last quarter of activity for this account" grounds it; "everything about this
  customer" doesn't. Tight sources, sharp deck.
- **Decisions need a human.** Talking points and follow-ups are drafts — the judgment on what to commit to
  in the room is yours.

## Where this leads (the ramp)
You just delegated a repeatable *business cycle*. If you run QBRs every quarter for the same accounts, the
next question is obvious: *could the team have a button for this?* That's **Stage 4 · Agent Builder** —
package the QBR steps and account knowledge once, for everyone.

> **Next:** [Agent Builder → Build a team-knowledge agent over a SharePoint site](../walkthroughs/agent-builder-team-knowledge.md)

## Related
- [Hand off an end-to-end task to Cowork](../walkthroughs/cowork-end-to-end-task.md) — the foundational delegation pattern
- [Generate a weekly customer-health digest across your accounts](../walkthroughs/cowork-customer-health-digest.md)
- [Brief an account before a call with the Sales agent](../walkthroughs/first-party-sales-agent-brief.md) — the single-call version
- Stage 3 Resources: see `RESOURCES.md` → Cowork

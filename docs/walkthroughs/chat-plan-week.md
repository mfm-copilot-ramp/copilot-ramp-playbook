---
title: Plan your week from your calendar and inbox
stage: chat
roles: [end-user, manager]
tags: [planning, productivity, calendar, outlook, teams]
level: starter
time: 5 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-06-03
---

# Plan your week from your calendar and inbox

> Start every Monday with a clear view of what matters, what needs prep, and what you can safely defer — without spending an hour triaging manually.

**Stage:** Copilot Chat · **For:** End user, Manager · **Level:** Starter · **Time:** 5 min · **Saves:** ~20 min vs. manual

## When to use this

Monday morning. Packed calendar, full inbox, no clear sense of where to focus first. The week will happen to you unless you decide what matters before it starts.

This prompt gives you a structured weekly brief from your own data — meetings that need prep, threads that need a decision, and explicit permission to deprioritize one thing. It takes five minutes at the start of the week and saves far more.

## What you'll need

- **M365 Copilot license** — Microsoft 365 Copilot Chat (grounded on your calendar and emails)
- A few minutes on Monday morning (or Sunday evening)

## Try it now — the prompt

Open Microsoft 365 Copilot Chat and paste:

```
Look at my calendar and inbox for this week. Tell me:

1. My three most important commitments and what I need to be prepared for each
2. Any open threads or pending decisions I should close before Friday
3. One meeting or task I can safely deprioritize this week
4. Any back-to-backs or time crunches I should know about so I can plan around them
```

**Why this prompt works:** The four questions structure the output into a prioritization framework — what's critical, what's pending, what to cut, and where the squeeze points are. Asking explicitly for something to deprioritize is the most underused part; Copilot will surface it.

## Step by step

> **Microsoft how-to:** [Catch up on work quickly using Microsoft 365 Copilot Chat](https://support.microsoft.com/en-us/topic/catch-up-on-work-quickly-using-microsoft-365-copilot-chat-cffb11c2-bb06-4d5b-bd4b-9497895daff3) — the official step-by-step from Microsoft Support.

1. **Open Microsoft 365 Copilot Chat** (office.com or the M365 Copilot app). It has access to your calendar and inbox.
2. **Run the prompt on Monday morning** — or Sunday evening if you want to front-load your week.
3. **Act on the prep items.** For each important commitment, ask:
   ```
   What do I need to know for [meeting name] — who's attending, what's the agenda, any open items from before?
   ```
4. **Clear the open threads.** For each pending decision flagged, spend 5 minutes now or schedule a 15-minute block to close it.
5. **Protect a focus block.** If the calendar shows wall-to-wall meetings, ask:
   ```
   Which meeting on my calendar this week is least critical and could be declined or shortened?
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **End-of-week version:** run the same prompt on Friday afternoon with "this week" to write your status update — it doubles as the inputs for [Draft a status update](chat-weekly-status.md).
- **Manager lens:** add `"Also flag anything where a direct report may need support or unblocking."` to the prompt.
- **Before a big week:** add `"I have a major [deliverable / presentation / review] on [day]. Flag anything that conflicts with prep time for that."`
- **As a habit:** pin this prompt or save it as a Microsoft 365 Copilot Chat favorite for single-click Monday access.

## Watch out for

- **The brief is only as complete as your calendar and inbox.** Work that lives in someone else's head won't show up.
- **“Least critical meeting to decline” is a suggestion from titles and attendees, not politics.** You know which meeting you actually can't skip.
- **A plan written Monday drifts by Wednesday.** Re-running it midweek beats treating it as fixed.

## Where this leads (the ramp)

Running your Monday planning prompt by hand is a solid ritual, but it still depends on you remembering to run it. The built-in Copilot agents can carry recurring routines like this so the weekly brief shows up without you asking — that's Stage 2.

> **Next:** [Stage 2 · Built-in Copilot agents](../stages/stage-2-first-party.md)

## Related

- [Draft a status update from your week's activity](chat-weekly-status.md)

> **📚 Learn more.** Grab paste-ready prompts in the in-product [Copilot Prompt Gallery](https://m365.cloud.microsoft/copilot-prompts), and browse role-based scenarios with downloadable kits in Microsoft's [Scenario Library](https://adoption.microsoft.com/en-us/scenario-library/).
---
title: Prep for a 1:1 in two minutes
stage: chat
roles: [manager, end-user]
tags: [chat, 1on1, prep, relationships, productivity]
level: starter
time: 2 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-06-03
---

# Prep for a 1:1 in two minutes

> Walk into your next 1:1 with talking points pulled from the work you actually
> shared this week — not a blank notepad and a vague "so, how's it going?"

**Stage:** Copilot Chat · **For:** Manager, End user · **Level:** Starter · **Time:** 2 min · **Saves:** ~15 min vs. manual

## When to use this
Your 1:1 with someone starts in five minutes and you haven't thought about it since last week. You
*could* wing it — but the best 1:1s reference the real threads you two have been in: the decision still
open, the thing they're blocked on, the win worth calling out. Copilot can reconstruct that context
from your recent shared activity faster than you can scroll your inbox.

It's a small habit with an outsized payoff: every recurring 1:1 on your calendar becomes two minutes of
prep instead of zero, and the conversation gets noticeably sharper.

## What you'll need
- **M365 Copilot license** (Copilot in Teams or the Copilot app)
- The other person's name — Copilot resolves the rest from your shared emails, chats, and meetings
- A couple of minutes before the meeting starts

## Try it now — the prompt
Open Copilot and name the person and the meeting:

```
Help me prep for my 1:1 with [name]. Summarize what we've been working on together
over the last two weeks across email and Teams, flag anything still open or waiting
on either of us, and suggest 3 topics worth raising. Keep it to half a screen.
```

!!! example "Filled in — a weekly 1:1 with a direct report"
    ```
    Help me prep for my 1:1 with Jordan. Summarize what we've been working on together
    over the last two weeks across email and Teams, flag anything still open or waiting
    on either of us, and suggest 3 topics worth raising. Keep it to half a screen.
    ```

**Why this works:** it scopes the input (*last two weeks, you two*), asks for the part that's easy to
forget (*what's still open or waiting*), and ends with an actionable output (*3 topics*). You're not
asking "what did we talk about" — you're asking "what should I bring to this conversation."

## Step by step

> **Microsoft how-to:** [Catch up on work quickly using Microsoft 365 Copilot Chat](https://support.microsoft.com/en-us/topic/catch-up-on-work-quickly-using-microsoft-365-copilot-chat-cffb11c2-bb06-4d5b-bd4b-9497895daff3) — the official step-by-step from Microsoft Support.

1. **Open Copilot and paste the prompt with their name.** Copilot pulls your recent shared threads and
   meetings and assembles the context.
2. **Read the recap, the open items, and the suggested topics.** You get a tight picture of the
   relationship's current state plus three things you could raise.
3. **Sanity-check the "open / waiting on" list.** This is the highest-value part — confirm what's
   genuinely still in flight before you bring it up.
4. **Sharpen it for this specific conversation:**
   ```
   They mentioned feeling stretched last time. Add a check-in question about
   workload, and reorder the topics so the blocker we share is first.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Same prep, more leverage:
- **For managers with a team:** "Do this for each of my direct reports before our 1:1s tomorrow" turns
  a morning of prep into one prompt.
- **Close the loop from last time.** "What did I commit to in our last 1:1, and did I follow through?"
  keeps you honest on your own action items.
- **Make it forward-looking.** "Given what's on both our plates, what's the one thing most worth their
  time this week?" shifts the meeting from status to substance.

## Watch out for
- **It only sees what you two shared in M365.** A hallway conversation or a side DM you weren't in won't
  be in the recap. If something feels missing, it probably lives outside Copilot's reach.
- **Topics are suggestions, not a script.** Copilot surfaces what's open; you decide what's worth the
  other person's time. Don't read the list verbatim.
- **Keep it about the work, not the person.** Ask Copilot to summarize shared projects and open items —
  not to assess how someone is performing. That's a conversation for you and them, not a prompt.

## Where this leads (the ramp)
Notice what just happened: you asked Copilot to *gather and synthesize* across several threads, not
answer one question. That's the same muscle a reasoning agent flexes — except it can go deeper and pull
from the web too. **Stage 2's Researcher** takes "assemble the context for me" and runs it as a full
multi-step investigation.

> **Next:** [First-Party Agents → Deep-dive a topic with Researcher](../walkthroughs/first-party-researcher-deep-dive.md)

## Related
- [Chat → Turn a meeting into tracked follow-ups](../walkthroughs/chat-meeting-followups.md) — the Stage 1 flagship
- [Chat → Draft a status update from your week's activity](../walkthroughs/chat-weekly-status.md) — sibling daily-driver
- [Chat → Catch up on a Teams thread you were @mentioned in](../walkthroughs/chat-catch-up-thread.md) — another two-minute win

> **📚 Learn more.** Grab paste-ready prompts in the in-product [Copilot Prompt Gallery](https://m365.cloud.microsoft/copilot-prompts), and browse role-based scenarios with downloadable kits in Microsoft's [Scenario Library](https://adoption.microsoft.com/en-us/scenario-library/).

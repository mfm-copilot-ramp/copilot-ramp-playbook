---
title: Auto-recap every meeting with Facilitator
description: Let the Facilitator agent take collaborative meeting notes live and hand you decisions and action items the moment the meeting ends, no prompting required.
stage: first-party
roles: [end-user, champion]
tags: [meetings, agents, teams, facilitator, delegation]
level: starter
time: 5 min
status: walkthrough
prereqs: [m365-copilot-license, teams-meeting, facilitator-enabled]
updated: 2026-06-03
---

# Auto-recap every meeting with Facilitator

> Stop prompting for meeting notes at all — let the Facilitator agent take
> collaborative notes live, then hand you decisions and action items the moment the meeting ends.

**Stage:** First-Party Agents · **For:** End user, Champion · **Level:** Starter · **Time:** 5 min

**Status:** Generally available — verify current availability on the [Agents in Microsoft 365 roster](https://adoption.microsoft.com/en-us/ai-agents/agents-in-microsoft-365/).

## When to use this
In Stage 1 you learned to summarize a meeting *by hand* — paste a prompt, name the meeting, get a table.
If you find yourself doing that after *every* call, that's the signal you're ready to delegate it.

**Facilitator** is a first-party agent built into Teams meetings. Instead of you asking for a recap
afterward, it works *during* the meeting: taking AI-generated collaborative notes in real time,
tracking decisions and action items as they're spoken, and letting anyone in the meeting ask it to
catch them up. This is your first taste of the core Stage 2 idea — **using what Microsoft already
built instead of prompting for it.**

## What you'll need
- **M365 Copilot license** (Facilitator ships with Microsoft 365 Copilot)
- A **Teams meeting** where Facilitator / collaborative notes are turned on
- Nothing to install — it's a built-in agent, not something you configure

## Try it now — the prompt
You don't *have* to prompt at all — Facilitator works in the background. But the one move worth
knowing is the live catch-up. In the meeting chat or the Facilitator panel, @mention it:

```
@Facilitator catch me up — what have I missed, and is there anything assigned to me so far?
```

**Why this works:** unlike the Stage 1 flow, you're not naming a meeting or asking it to read a
transcript — Facilitator is *already in the room*, watching the conversation as it happens. The
@mention just pulls its running notes forward for you. Joining 10 minutes late stops being a problem.

## Step by step
1. **Start (or join) a Teams meeting with Facilitator on.** When collaborative notes / Facilitator are
   enabled, you'll see a notes panel that fills in automatically as people talk — no one has to play
   scribe.
2. **Let it work.** As decisions are made and tasks handed out, Facilitator captures them into the
   live notes. You can keep your full attention on the conversation instead of typing.
3. **Catch up any time** by @mentioning Facilitator with the prompt above. It summarizes what's
   happened so far and flags anything assigned to you.
4. **Use the auto-recap after the meeting ends.** The decisions and action items are already
   captured — no re-watching, no after-the-fact summary prompt. Review, fix any owner, and share.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Facilitator is one of a set of first-party agents — once auto-recap feels natural, reach for its
siblings the same way:
- Ask **Facilitator** to draft a follow-up message to the group from the meeting's action items.
- In a longer working session, let it keep the agenda on track and surface unresolved questions.
- Pair it with **agents in Teams channels** so the recap is posted where the team already lives.

> **📚 Learn more.** Microsoft frames this human + agent shift directly:
> [Enabling human-agent teams](https://www.microsoft.com/en-us/microsoft-365/blog/2025/09/18/microsoft-365-copilot-enabling-human-agent-teams/)
> (Nicole Herskowitz, CVP, Microsoft 365 Copilot). For the full set of prebuilt agents, see the
> [Agents in Microsoft 365 Adoption Hub](https://adoption.microsoft.com/en-us/copilot/).

## Watch out for
- **It has to be turned on.** Facilitator / collaborative notes are a meeting setting. If it wasn't
  enabled, there's no live capture to fall back on — switch it on at the *start* of the meeting.
- **Verify owners before you act on them.** Like any auto-capture, Facilitator infers who owns what
  from the conversation. The 30-second sanity check from Stage 1 still applies.
- **It's an in-meeting agent, not a transcript reader.** For a meeting that already happened *without*
  Facilitator, fall back to the Stage 1 by-hand summary instead.

## Where this leads (the ramp)
You've just let an agent do, automatically, what you used to prompt for by hand. The natural next
question is: *"What if I could hand off a whole multi-step task this way — not just meeting notes?"*
That's **Stage 3 · Cowork** — where you describe an outcome ("pull last month's support emails, group
them by theme, draft a summary deck") and Copilot plans and runs the steps across your M365 tools.

> **Next:** [Cowork → Hand off an end-to-end task to Cowork](../walkthroughs/cowork-end-to-end-task.md)

## Related
- [Chat → Turn a meeting into tracked follow-ups](../walkthroughs/chat-meeting-followups.md) — the by-hand version this automates
- [First-Party → Deep-dive a topic with Researcher](../walkthroughs/first-party-researcher-deep-dive.md)
- Stage 2 Resources: see `RESOURCES.md` → First-Party Agents

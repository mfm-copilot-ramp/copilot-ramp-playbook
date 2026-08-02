---
title: Translate a meeting in real time with Interpreter
description: Run a cross-language Teams meeting without a human interpreter as the Interpreter agent translates speech live in your own voice so everyone follows along.
stage: first-party
roles: [end-user]
tags: [first-party, interpreter, translation, teams, meetings, accessibility]
level: starter
time: 10 min
status: walkthrough
prereqs: [m365-copilot-license, interpreter-agent-access]
updated: 2026-06-03
---

# Translate a meeting in real time with Interpreter

> Run a cross-language Teams meeting without a human interpreter — the Interpreter
> agent translates speech live, in your own voice, so everyone follows along in the language they think in.

**Stage:** First-Party Agents · **For:** End user · **Level:** Starter · **Time:** 10 min

**Status:** Generally available — verify current availability on the [Agents in Microsoft 365 roster](https://adoption.microsoft.com/en-us/ai-agents/agents-in-microsoft-365/).

## When to use this
You're on a Teams call where not everyone shares a first language — a customer in São Paulo, a supplier
in Tokyo, a teammate in Munich — and the meeting keeps stalling on "sorry, can you repeat that?"
**Interpreter** is a prebuilt first-party agent that does real-time, speech-to-speech translation inside
the meeting, so each person hears the conversation in their own language as it happens. You're not
pasting text into a translator after the fact; the translation *is* the meeting.

This is the most visceral "an agent just did something a person used to do" moment in the whole roster —
a great one to show a skeptic.

## What you'll need
- **M365 Copilot license** with access to the **Interpreter** agent in Teams
- A **Teams meeting** with participants who speak different languages
- A quick heads-up to attendees that the call will be interpreted (it's both courtesy and consent)

## Try it now — the prompt
Interpreter is turned on from inside the meeting rather than typed at like a chat agent. Once it's
running, you steer it in plain language:

```
(In a Teams meeting) @Interpreter translate between English and Spanish for this
call, and keep my translated voice matched to how I actually sound.
```

**Why this works:** it names the **language pair** explicitly (so the agent isn't guessing) and asks for
**voice matching**, which is the feature that makes interpreted speech feel like *you* talking rather than
a robotic overlay. Naming both removes the two things people most often fumble on their first try.

## Step by step
1. **Start or join the Teams meeting and open the agent.** Bring up Interpreter from the meeting's agents
   or Copilot surface — it runs in the call, not in a side chat.
2. **Set the language pair.** Tell it which languages to bridge. Each participant experiences the call in
   their chosen language while everyone keeps speaking naturally.
3. **Talk normally — let it interpret.** Speak in full thoughts and pause at natural breaks; the agent
   translates in near real time. Resist the urge to talk over it.
4. **Confirm understanding out loud:**
   ```
   Quick check — did that come through clearly on your end? Let me know if
   anything got lost and I'll say it again.
   ```
   Treating interpretation as a shared tool, not a black box, is what keeps the meeting flowing.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Interpretation gets better when you set the call up for it:
- **Brief participants first.** A 10-second "this call will be interpreted, speak in full sentences and
  pause at the ends" makes the output dramatically cleaner.
- **Pair it with the recap.** Let **Facilitator** capture decisions and action items so the *content* of
  the cross-language meeting is preserved, not just understood in the moment.
- **Use it for inclusion, not just translation.** A teammate who's fluent-but-not-native often follows
  far more comfortably in their first language — offer it even when "everyone speaks English."

> **📚 Learn more.** The [Agents in Microsoft 365 hub](https://adoption.microsoft.com/en-us/ai-agents/agents-in-microsoft-365/)
> describes Interpreter and the other prebuilt agents in plain language, and Nicole Herskowitz's (CVP,
> M365 Copilot) blog on [enabling human-agent teams](https://www.microsoft.com/en-us/microsoft-365/blog/2025/09/18/microsoft-365-copilot-enabling-human-agent-teams/)
> explains how these agents work alongside you.

## Watch out for
- **Tell people they're being interpreted.** It's courtesy, and in some places consent matters. Open with
  it rather than springing it mid-call.
- **It's an aid, not a legal record.** For contracts, compliance, or high-stakes negotiation, a certified
  human interpreter still owns the room. Use the agent for working conversations.
- **Cross-talk breaks it.** Real-time interpretation needs clean turns. The more people talk over each
  other, the more it drops — so chair the meeting a little more firmly than usual.

## Where this leads (the ramp)
Once you've watched an agent handle a live, in-the-moment job inside a meeting, the jump to letting an
agent run a *multi-step task across your tools* feels natural — not single-purpose help, but delegated
work. That's **Stage 3 · Cowork**: describe an outcome and let Copilot pull the inputs, do the steps, and
hand you the finished result.

> **Next:** [Cowork → Hand off an end-to-end task to Cowork](../walkthroughs/cowork-end-to-end-task.md)

## Related
- [First-Party → The first-party agents included with your M365 Copilot license](../walkthroughs/first-party-agents-overview.md) — the roster
- [First-Party → Auto-recap every meeting with Facilitator](../walkthroughs/first-party-facilitator-auto-recap.md) — the Stage 2 flagship
- Stage 2 Resources: see `RESOURCES.md` → First-Party Agents

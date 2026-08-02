---
title: Build a "voice of customer" agent over your support inbox
description: Build a no-code agent grounded on your support inbox and ask it what customers are really saying, surfacing the themes hiding in emails you can't all read.
stage: agent-builder
roles: [maker, end-user]
tags: [agent-builder, declarative-agent, voice-of-customer, support, feedback, personal, no-code]
level: intermediate
time: 20 min
status: walkthrough
prereqs: [m365-copilot-license, agent-builder-access]
updated: 2026-06-05
---

# Build a "voice of customer" agent over your support inbox

> You don't read every support email the moment it lands — but the themes hiding in them are gold. Build
> a no-code agent grounded on your support inbox and *ask* it what customers are really saying, any time.

**Stage:** Agent Builder · **For:** Maker, End user · **Level:** Intermediate · **Time:** 20 min

## When to use this
Your support inbox is the most honest feedback channel you have — and the easiest to drown in. The
patterns ("everyone's confused by the new export flow") are there, but spotting them means reading
hundreds of messages. This is a perfect **personal-scope** Agent Builder build: point a declarative agent
at your own inbox, give it a "voice of customer analyst" persona, and ask it what's trending whenever you
want — no rebuilding the analysis each time.

Use this when support email is a firehose and you want the signal without the daily slog.

## What you'll need
- **M365 Copilot license** with **Agent Builder** (Copilot → Create an agent)
- A **support mailbox or a folder/label** in your Outlook the agent can ground on (your own, or a shared
  mailbox you have access to)
- 20 minutes and the four ingredients: name, instructions, knowledge source, starter prompts

## Try it now — the build
In the Agent Builder conversation, describe the analyst you wish you had:

```
Create an agent called "Voice of Customer" grounded on my support email
[mailbox/folder]. Its job is to surface what customers are actually saying: group
messages into themes, tell me how often each theme comes up, quote a representative
example for each, and flag anything urgent or angry. Always cite the emails it's
drawing from. Stay neutral — report what customers said, don't sugar-coat it. If I ask
about something not in the inbox, say so rather than guessing.
```

**Why this works:** it names the agent, sets the **knowledge boundary** (your support email), defines the
**analyst behavior** (theme + frequency + a real quote + urgency flag), demands **citations**, and fixes
the **tone** ("don't sugar-coat") plus the **refusal rule**. A neutral, cited analyst is what makes the
output trustworthy instead of cherry-picked.

## Step by step
1. **Open Agent Builder.** In M365 Copilot, choose **Create an agent**. Build by chatting or fill the
   **Configure** fields directly.
2. **Add the knowledge source.** Point it at your **support mailbox or folder**. That's the boundary — it
   analyzes this, not your whole mailbox or the web.
3. **Write the instructions** (the prompt above, adapted). The "theme + frequency + quote + urgency,
   neutral tone, always cite" rules are the heart of it.
4. **Add starter prompts** people (or future-you) would actually ask: "What are this week's top 3
   complaints?", "What's the most common feature request?", "Anything urgent I missed?"
5. **Test in the preview pane.** Ask "What are customers frustrated about this month?" Confirm it returns
   themes *with cited examples* — then ask something off-topic to confirm it declines.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Turn a theme-finder into an early-warning system:
- **Spot the shifts.** "Compare this week's themes to last week's — what's newly trending?"
- **Quantify it.** "Rank the top 10 issues by volume and tag each as bug, confusion, or feature request."
- **Make it shareable.** Once it's good for you, widen the persona and share it with your support or
  product team so everyone reads from the same signal.

> **📚 Learn more.** Browse Microsoft's [Agent Library](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/agent-library-overview)
> for templates to crib from, and watch [April's AI Agents Academy](https://www.youtube.com/playlist?list=PLINAH02_IDH9WhLAg1DyE_hJw7IoJuP0V)
> (April Dunnam, Microsoft) for step-by-step building.

## Watch out for
- **Grounding ≠ access control.** The agent surfaces anything in the mailbox it's pointed at — only ground
  it on email you're allowed to analyze, and don't share a personal-inbox agent with others.
- **Customer data is sensitive.** Support email contains personal information. Keep the agent personal-scope
  unless your org's privacy rules clearly allow wider sharing.
- **Themes are a starting point, not a verdict.** The agent reports patterns from what it can read; confirm
  the big claims against the actual emails before you act on them.

## Where this leads (the ramp)
You built a personal agent that *analyzes* — but it still only reads and reports. When you want an agent
that **takes action** (file the urgent ones as tickets, route requests, look something up in another
system), declarative building hits its ceiling. That's the cue for **Stage 6 · Copilot Studio**.

> **Next:** [Copilot Studio → Build your first Studio agent with a knowledge source + topic](../walkthroughs/studio-first-agent.md)

## Related
- [Build a team-knowledge agent over a SharePoint site](../walkthroughs/agent-builder-team-knowledge.md) — the team-scope flagship
- [Build a personal research librarian over your OneDrive](../walkthroughs/agent-builder-research-librarian.md)
- Stage 4 Resources: see `RESOURCES.md` → Agent Builder

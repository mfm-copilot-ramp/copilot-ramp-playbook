---
title: Build a daily stand-up note-taker agent
description: Build a personal agent that turns your rough notes and updates into a consistent stand-up format for yesterday, today, and blockers.
stage: agent-builder
roles: [maker, end-user]
tags: [agent-builder, declarative-agent, notes, stand-up, personal, no-code]
level: starter
time: ~20 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-08-29
---

# Build a daily stand-up note-taker agent

> Turn rough updates, meeting notes, and reminders into a clean stand-up note you can paste into Teams.

**Stage:** Agent Builder · **For:** Maker, End user · **Level:** Starter · **Time:** ~20 min

## When to use this
Daily stand-up should be quick, but turning scattered notes into a clear update takes energy every morning. A **personal-scope** Agent Builder agent can be grounded on your own notes and mail context, then apply the same structure every time: yesterday, today, blockers, and decisions to mention.

Use this when you want a consistent stand-up note without asking a shared bot to read personal work notes.

## What you'll need
- **M365 Copilot license** with Agent Builder in Microsoft 365 Copilot
- A OneDrive notes folder, mail folder, or pasted rough update that reflects your work
- A stand-up format your team already recognises

## Try it now — the build
In the Agent Builder conversation, describe the note-taker:

```
Create an agent called "Stand-up Note-taker" grounded on my notes in [OneDrive folder]
and my relevant mail in [mail folder or scope]. It turns my rough updates into this
format: Yesterday, Today, Blockers, Decisions to mention. Keep it short enough to
paste into Teams. Use only my notes, mail, and what I paste into the chat. Cite the
source when a fact comes from a saved note or email. If something is unclear, mark it
as "needs confirmation" instead of inventing details. Do not send the update for me.
```

**Why this works:** it fixes the output shape, keeps the agent personal, gives it permission to use only your sources, and prevents the common failure mode of filling gaps with confident but unsupported updates.

## Step by step
1. **Prepare the source.** Put recurring notes in a OneDrive folder or identify the mail scope that contains your work updates. Keep private or unrelated notes out of the grounding set.
2. **Open Agent Builder.** In Microsoft 365 Copilot, start the agent creation flow. Microsoft explains the extensibility path at [Microsoft 365 Copilot extensibility](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/).
3. **Add the knowledge source.** Connect the notes folder or mail scope the agent should use. This is your personal boundary.
4. **Write the instructions** using the prompt above, adapted to your team's stand-up language.
5. **Add starter prompts** such as "Create today's stand-up from my latest notes", "Turn this rough update into our stand-up format", and "List blockers I should mention."
6. **Test before relying on it.** Paste a rough update, check that the output has the right headings, and verify any cited facts against the original note or email.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Make the note-taker match how your team works:
- **Add team language.** Tell it whether your team says blockers, risks, dependencies, or asks.
- **Keep it brief.** Add a rule such as "one short bullet per section unless I ask for detail."
- **Use source labels.** Ask it to tag bullets from notes, mail, or pasted text so you know where each came from.
- **Prepare follow-ups.** "After the stand-up note, list questions I should ask the team."

## Watch out for
- **It does not know what you did unless you give it sources.** Empty or stale notes lead to thin updates.
- **Do not let it over-share.** Review the note before pasting into Teams, especially if your sources include private mail.
- **Blockers need judgement.** The agent can flag possible blockers, but you decide what belongs in the team channel.
- **Personal-scope means personal.** Keep the agent audience-of-one unless you rebuild it with shared sources and governance.

## Where this leads (the ramp)
You built a personal agent that formats and summarises your updates. When the process needs governed submission, reminders, routing, or team-wide state, move up to **Stage 6 · Copilot Studio**.

> **Next:** [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

## Related
- [Build a personal inbox summariser agent](../walkthroughs/agent-builder-inbox-summariser-agent.md)
- [Build a project status agent from team notes](../walkthroughs/agent-builder-project-status-agent.md)
- [Stage 4 · Agent Builder](../stages/stage-4-agent-builder.md)

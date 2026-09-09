---
title: Build a personal inbox summariser agent
description: Build a personal Agent Builder helper grounded on your mail to summarise what needs a reply, what is FYI, and what can wait.
stage: agent-builder
roles: [maker, end-user]
tags: [agent-builder, declarative-agent, mail, inbox, personal, no-code]
level: starter
time: ~20 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-08-29
---

# Build a personal inbox summariser agent

> Stop re-reading your inbox to work out what matters — build a personal agent that turns mail into a clear reply, FYI, and later digest.

**Stage:** Agent Builder · **For:** Maker, End user · **Level:** Starter · **Time:** ~20 min

## When to use this
Your inbox is full of threads that look equally urgent until you open them. A **personal-scope** Agent Builder agent can be grounded on your own mail, follow your instructions, and give an asked-for digest that separates reply-worthy messages from FYI and low-priority noise.

Use this when you want a fast, cited inbox readout without creating rules, automations, or a shared assistant.

## What you'll need
- **M365 Copilot license** with Agent Builder in Microsoft 365 Copilot
- A mailbox, folder, or search scope you are allowed to use for grounding
- A simple priority model: needs reply, FYI, can wait, plus any deadlines you care about

## Try it now — the build
In the Agent Builder conversation, describe the inbox helper:

```
Create an agent called "Inbox Summariser" grounded on my mail in [mailbox or folder].
Its job is to give me a digest whenever I ask: group messages into Needs reply, FYI,
and Can wait. For each item, include the sender, subject, why it belongs in that
bucket, any deadline or meeting date, and a suggested next action. Always cite the
email it used. Use only my mail; if the answer is not clear from the messages, say
what is missing instead of guessing. Ignore marketing and automated notifications
unless I specifically ask for them.
```

**Why this works:** it names the agent, sets the **knowledge boundary** (your mail), gives the digest structure, requires **citations**, and tells the agent how to handle uncertainty and low-value messages.

## Step by step
1. **Open Agent Builder.** In Microsoft 365 Copilot, start the agent creation flow. Microsoft documents the extensibility model at [Microsoft 365 Copilot extensibility](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/).
2. **Add the mail grounding.** Choose the mailbox or folder that should drive the digest. Keep the scope personal and narrow so the agent does not mix workstreams by accident.
3. **Write the instructions** using the prompt above, adapted to your folder and language. Keep the buckets explicit so every digest looks the same.
4. **Add starter prompts** you will actually use: "Summarise today's inbox", "What needs a reply before end of day?", and "What can wait until tomorrow?"
5. **Test with recent mail.** Ask for a digest, open the cited emails, and check that each item is in the right bucket. Then ask about an unrelated topic to confirm the agent says it cannot tell from your mail.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Turn a digest into a daily decision tool:
- **Tune your priority rules.** Add names, customers, projects, or phrases that should always push a message into Needs reply.
- **Ask for a response plan.** "Draft the next action for each Needs reply item, but do not write the email for me."
- **Compare time windows.** "What changed since my last digest?"
- **Keep the source clean.** Move newsletters and alerts out of the grounded folder if they drown out human messages.

## Watch out for
- **Mail is sensitive.** This is an audience-of-one agent grounded on your messages. Do not share it unless your organisation explicitly allows that scope.
- **It is not an inbox rule.** It summarises when you ask; it does not file, send, or delete messages for you.
- **Citations are the audit trail.** Check the cited emails before acting on anything urgent, legal, financial, or people-related.
- **Folder choice matters.** A focused folder gives a sharper digest than a whole mailbox full of receipts and notifications.

## Where this leads (the ramp)
You built a personal agent that reads and prioritises, but it does not run a governed workflow or take action in other systems. When you need routing, approvals, connectors, or shared operations, move up to **Stage 6 · Copilot Studio**.

> **Next:** [Stage 6 · Copilot Studio](../stages/stage-6-studio.md)

## Related
- [Build a "voice of customer" agent over your support inbox](../walkthroughs/agent-builder-voice-of-customer.md)
- [Build a personal research librarian over your OneDrive](../walkthroughs/agent-builder-research-librarian.md)
- [Stage 4 · Agent Builder](../stages/stage-4-agent-builder.md)

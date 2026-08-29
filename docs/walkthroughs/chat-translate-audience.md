---
title: Translate and localise a message for a global team
description: Use Copilot Chat to translate and localise a message for a global team while preserving tone, intent, and cultural nuance.
stage: chat
roles: [end-user, manager]
tags: [chat, translation, communication, global]
level: starter
time: 5 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-08-29
---

# Translate and localise a message for a global team

> Adapt a message for another language or region while keeping the meaning, tone, and intent intact.

**Stage:** Copilot Chat · **For:** End user, Manager · **Level:** Starter · **Time:** 5 min

## When to use this
You have a message that works for one audience but needs to land well with colleagues in another language,
country, or culture. Use Copilot Chat to translate and localise it, then ask it to flag phrases that may be
too idiomatic, too blunt, or easy to misunderstand.

## What you'll need
- **M365 Copilot license** with Microsoft 365 Copilot Chat in Teams, Outlook, Word, or the Microsoft 365 Copilot app
- The original message or draft you want adapted
- The target language, region, audience, and level of formality

## Try it now — the prompt
Open Microsoft 365 Copilot Chat and paste:

```
Translate and localise the message below for [target language] readers in
[country or region].

Audience: [team, customer, partner, executives]
Tone to preserve: [warm, direct, formal, encouraging, urgent]
Terms that must stay unchanged: [product names, programme names, acronyms]
Reading level: [simple, standard business, executive]

Please:
1. Translate the message naturally, not word-for-word.
2. Preserve the original intent and level of urgency.
3. Flag any phrase that may be culturally sensitive, idiomatic, or unclear.
4. Give a short note explaining the biggest localisation choices.

Message:
[paste message]
```

**Why this works:** it asks for translation, localisation, and risk flags in one pass. Copilot knows what to
preserve, what to adapt, and what to explain before you share the message.

## Step by step
1. **Open Copilot Chat in your Microsoft 365 flow.** Use Teams, Outlook, Word, or the Microsoft 365
   Copilot app. No agent or setup is needed; this is just a prompt in chat.
2. **Paste the prompt and fill the brackets.** Include the target region, not just the language. Copilot
   should return a natural translation plus notes.
3. **Review the cultural flags first.** Decide whether to remove idioms, soften direct wording, or add
   context for local teams.
4. **Ask for a final pass.** For example:
   ```
   Keep the translated wording, but make it slightly more formal and shorten it
   for a Teams announcement.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- `Create a back-translation into English so I can check whether the meaning shifted.`
- `Give me one version for local leadership and one for the broader team.`
- `Replace idioms with plain language that works across regions.`
- `List words or acronyms that may need local review before publishing.`

## Watch out for
- **Have a fluent human review high-stakes messages.** Copilot can help quickly, but local nuance still
  matters for legal, HR, customer, or crisis communications.
- **Name the region.** "Spanish for Mexico" and "Spanish for Spain" can call for different vocabulary and
  formality.
- **Protect sensitive content.** Only paste information you are allowed to process in Microsoft 365
  Copilot Chat.

## Where this leads (the ramp)
If you repeatedly adapt the same updates for several regions, move the repetitive version to **Stage 2** and
delegate the context gathering and first-pass localisation to a first-party agent.

> **Next:** [First-Party Agents → Delegate recurring global updates](../stages/stage-2-first-party.md)

## Related
- [Chat → Adapt content for a different audience](../walkthroughs/chat-adapt-audience.md)
- [Chat → Rewrite an email for a tougher audience](../walkthroughs/chat-rewrite-email.md)
- [Microsoft Copilot Chat overview](https://learn.microsoft.com/en-us/copilot/overview)

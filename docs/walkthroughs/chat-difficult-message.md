---
title: Draft a difficult message with care
description: Use Copilot Chat to draft a sensitive message that is clear, kind, and professional, with the decision or ask up front.
stage: chat
roles: [end-user, manager]
tags: [chat, writing, tone, leadership]
level: starter
time: 5 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-08-29
---

# Draft a difficult message with care

> Turn a sensitive update into a clear, kind message that says the hard thing without sounding cold or vague.

**Stage:** Copilot Chat · **For:** End user, Manager · **Level:** Starter · **Time:** 5 min

## When to use this
You need to decline a request, give direct feedback, or share disappointing news, and the first draft in
your head sounds either too blunt or too apologetic. Use Copilot Chat to shape the message before you send
it, so the decision is clear, the tone is humane, and the next step is obvious.

## What you'll need
- **M365 Copilot license** with Microsoft 365 Copilot Chat in Teams, Outlook, Word, or the Microsoft 365 Copilot app
- The facts you can share, the decision or ask, and any constraints you cannot change
- The recipient's role, relationship to you, and likely concern

## Try it now — the prompt
Open Microsoft 365 Copilot Chat and paste:

```
Draft a sensitive [email/chat message/Teams post] to [recipient or audience].

Context:
- Situation: [what happened]
- Decision or ask: [state the decision, request, or feedback]
- Reason I can share: [brief reason]
- What I cannot say: [private or uncertain details to avoid]
- Desired next step: [meeting, acknowledgement, revised plan, no action]

Write it in a clear, kind, professional tone. Put the decision or ask in the
first two sentences, avoid blame, do not over-apologise, and keep it under
[length]. Give me two versions: direct and warmer.
```

**Why this works:** it gives Copilot the decision, the boundaries, and the relationship. That keeps the
message grounded in facts while letting Copilot help with wording, tone, and structure.

## Step by step
1. **Open Copilot Chat where you are already working.** Use Teams, Outlook, Word, or the Microsoft 365
   Copilot app. No agent or setup is needed; this is just a prompt in chat.
2. **Paste the prompt and fill the brackets.** Be explicit about the decision or ask, even if it feels
   uncomfortable. Copilot should return two polished options.
3. **Check for truth and ownership.** Make sure the draft does not invent reasons, soften the decision
   past recognition, or promise a follow-up you cannot deliver.
4. **Pick a version and refine it in the same chat.** For example:
   ```
   Make the opening more direct, keep the warmer closing, and remove any wording
   that sounds like the decision is still open.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- `Give me a version for a senior leader and a version for a close peer, using the same facts.`
- `Highlight any sentence that could sound defensive, vague, or legally risky.`
- `Create a short follow-up if the recipient pushes back or asks for an exception.`
- `Make it easier to skim: subject line, first sentence, three short paragraphs.`

## Watch out for
- **Do not outsource the judgement.** Copilot can improve tone, but you own whether the message is fair,
  accurate, and appropriate to send.
- **Keep private details out.** Do not paste sensitive information the recipient should not see unless you
  are allowed to use it in Copilot Chat.
- **Check for false softness.** Kind does not mean unclear. If the decision is final, say that.

## Where this leads (the ramp)
When you find yourself drafting the same sensitive update every week, move the repetitive version to
**Stage 2** and let a first-party agent assemble the context for your review before you send.

> **Next:** [First-Party Agents → Delegate repetitive message prep](../stages/stage-2-first-party.md)

## Related
- [Chat → Rewrite an email for a tougher audience](../walkthroughs/chat-rewrite-email.md)
- [Chat → Prepare for a 1:1](../walkthroughs/chat-prep-1on1.md)
- [Microsoft Copilot Chat overview](https://learn.microsoft.com/en-us/copilot/overview)

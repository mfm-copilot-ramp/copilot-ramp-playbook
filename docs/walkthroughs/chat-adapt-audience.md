---
title: Adapt a document or message for a different audience
stage: chat
roles: [end-user, manager, champion]
tags: [comms, writing, audience, word, outlook]
level: intermediate
time: 10 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-06-03
---

# Adapt a document or message for a different audience

> Transform any piece of content for a new audience in one prompt — no rewriting from scratch, no second-guessing the tone.

**Stage:** Copilot Chat · **For:** End user, Manager · **Level:** Intermediate · **Time:** 10 min · **Saves:** ~15 min vs. manual

## When to use this

You have content that was written for one audience but needs to land with another. A technical spec that needs to become an exec summary. A US-focused document that needs to work for a global team. A detailed report that needs to become a three-bullet Slack message for a VP who reads on a phone.

Copilot adapts the tone, vocabulary, length, and emphasis in a single pass — preserving the substance while restructuring the framing for the new reader.

## What you'll need

- **M365 Copilot license** — Copilot in Word, Outlook, or Microsoft 365 Copilot Chat
- The original document or message
- A clear sense of who the new audience is and what they care about most

## Try it now — the prompt

Paste the source content into Microsoft 365 Copilot Chat (or use Copilot in Word), then:

```
Rewrite this [document / email / summary] for [target audience].

They care most about [outcome — e.g., cost and risk / speed to market / compliance].
- Adjust tone to be [more direct / less technical / more formal / more conversational]
- Remove or explain any jargon from the original
- Make the key ask or recommendation unmissable — put it first
- Target length: [3 bullet points / one page / 200 words]
```

**Why this prompt works:** Naming what the audience *cares about* shifts the emphasis, not just the vocabulary. The explicit tone instruction prevents Copilot from defaulting to its own style judgment. Putting the ask first is almost always right for busy audiences.

## Step by step

> **Microsoft how-to:** [Draft and add content with Copilot in Word](https://support.microsoft.com/en-us/office/draft-and-add-content-with-copilot-in-word-069c91f0-9e42-4c9a-bbce-fddf5d581541) — the official step-by-step from Microsoft Support.

1. **Paste the original content** into Microsoft 365 Copilot Chat or open it in Word and invoke Copilot.
2. **Fill in the prompt.** The more specific the audience and outcome, the sharper the result.
   - Generic: `"for executives"`
   - Better: `"for a CFO who is skeptical about the ROI and has 5 minutes"`
3. **Check the lead.** Is the key ask in the first sentence? If not, ask: `"Move the recommendation to the very first line."`
4. **Check for leftover jargon.** Skim for acronyms or technical terms and ask: `"Simplify [term] for someone who doesn't work in [domain]."`
5. **Run a length check.** If the output is still too long: `"Cut this to [word count] without losing the recommendation or the main supporting reason."`

## Screenshots

Captured live in Microsoft 365 Copilot Chat (Work mode). The product UI moves fast — if what you see differs, trust the numbered steps above, which we keep current.

**1. Original content ready.** Copilot Chat open with the source document or message pasted in.
![Copilot Chat open with the original content pasted in](../screenshots/chat-adapt-audience/01-open-copilot.png)

**2. Prompt entered.** The adapt-for-audience prompt typed in with audience, outcome, tone, and length.
![The adapt-for-audience prompt typed into the composer](../screenshots/chat-adapt-audience/02-prompt-entered.png)

**3. Adapted version.** The content rewritten for the new audience with the ask up front.
![The content rewritten for a new audience](../screenshots/chat-adapt-audience/03-adapted.png)

**4. Recommendation first.** The key ask moved to the very first line.
![The recommendation moved to the first line](../screenshots/chat-adapt-audience/04-lead-first.png)

**5. Length trimmed.** Cut to the target length without losing the recommendation or main reason.
![The adapted content trimmed to the target length](../screenshots/chat-adapt-audience/05-length-cut.png)

## Make it better

- **Side-by-side comparison:** ask Copilot to produce a table with the original version vs. adapted version so you can see exactly what changed.
- **Multiple audiences at once:** `"Give me two versions: one for the engineering team and one for the product exec."` — useful for all-hands comms.
- **International adaptation:** add `"Avoid US-centric idioms and cultural references. This will be read by a global audience."` for cross-region content.
- **Email subject line:** after adapting the body, ask: `"Write three subject line options for this email, each under 8 words."`

## Watch out for

- **Adapting tone is not the same as changing facts.** Check that the rewrite didn't soften a hard number or drop a caveat just to fit the audience.
- **The audience you name is a guess at what they care about.** If you're wrong about their priorities, Copilot optimizes the message for the wrong thing.
- **A polished tone can mask a thin argument.** Re-read for substance, not just for smoothness.

## Where this leads (the ramp)

Reframing the same content for each new audience by hand works, but you're re-describing your readers to Copilot every single time. The built-in Copilot agents let you bake those audience profiles in once, so the right tone and length come pre-loaded — that's Stage 2.

> **Next:** [Stage 2 · Built-in Copilot agents](../stages/stage-2-first-party.md)

## Related

- [Rewrite an email for a tougher audience](chat-rewrite-email.md)

> **📚 Learn more.** Grab paste-ready prompts in the in-product [Copilot Prompt Gallery](https://m365.cloud.microsoft/copilot-prompts), and browse role-based scenarios with downloadable kits in Microsoft's [Scenario Library](https://adoption.microsoft.com/en-us/scenario-library/).
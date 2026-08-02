---
title: Build a "writes in my voice" content coach from your sent mail
description: Ground a no-code agent on your own sent mail so it learns how you actually write, then have it draft and coach in your voice instead of generic AI tone.
stage: agent-builder
roles: [maker, end-user]
tags: [agent-builder, declarative-agent, writing, voice, tone, personal, no-code]
level: intermediate
time: 20 min
status: walkthrough
prereqs: [m365-copilot-license, agent-builder-access]
updated: 2026-06-05
---

# Build a "writes in my voice" content coach from your sent mail

> Generic AI writing sounds like generic AI. Build a no-code agent grounded on your own sent mail so it
> learns *how you actually write* — then have it draft and coach in your voice, not a robot's.

**Stage:** Agent Builder · **For:** Maker, End user · **Level:** Intermediate · **Time:** 20 min

## When to use this
The fastest complaint about AI-written text is that it doesn't sound like you. But you have a huge corpus of
your real voice sitting in **Sent Items** — every email you've ever written, in your phrasing, your
rhythm, your level of formality. A **personal-scope** declarative agent can ground on that and become a
content coach that drafts and edits *in your voice* instead of flattening it.

Use this when you want AI help with writing but keep rewriting its output to sound like a human — you.

## What you'll need
- **M365 Copilot license** with **Agent Builder** (Copilot → Create an agent)
- Your **Sent Items** (or a representative folder of your writing) for the agent to ground on
- 20 minutes and the four ingredients: name, instructions, knowledge source, starter prompts

## Try it now — the build
In the Agent Builder conversation, describe a coach that studies your style:

```
Create an agent called "My Voice" grounded on my Sent Items. First, learn my writing
style from how I actually write — my tone, sentence length, how formal or casual I am,
phrases I use, how I open and close. Then help me two ways: draft new messages in that
voice, and rewrite drafts I give you so they sound like me, not like generic AI. When
you rewrite, briefly note what you changed and why. Never invent facts — if you need
information I haven't given you, ask.
```

**Why this works:** it grounds on the **best possible source of your voice** (your real sent mail), tells
the agent to **learn the style first** (tone, length, formality, signature phrases), defines **two clear
jobs** (draft + rewrite), asks for a **short rationale** so it's a coach not a black box, and sets the
**no-fabrication rule**. Voice comes from real examples — that's why grounding on your own writing beats any
"be friendly" instruction.

## Step by step
1. **Open Agent Builder.** In M365 Copilot, choose **Create an agent**. Build by chatting or use the
   **Configure** fields.
2. **Add the knowledge source.** Point it at your **Sent Items** (or a folder of your strongest writing).
   This is what it learns your voice from.
3. **Write the instructions** (the prompt above, adapted). The "learn the style first, then draft and
   rewrite, explain your edits, never invent facts" sequence is the whole trick.
4. **Add starter prompts** for the two jobs: "Draft a reply to this in my voice: …", "Rewrite this so it
   sounds like me: …", "Is this on-brand for how I write?"
5. **Test in the preview pane.** Paste a stiff draft and ask it to rewrite in your voice. Read it aloud —
   does it sound like *you*? Tune the instructions until it does.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Sharpen the coach over time:
- **Name your own rules.** "Here are three things I always do and two I never do — bake them in."
- **Flex the register.** "Give me a more formal version for an exec and a casual one for my team."
- **Make it teach you.** "When you rewrite, point out one habit of mine that weakens the message so I can
  improve it."

> **📚 Learn more.** Browse Microsoft's [Agent Library](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/agent-library-overview)
> for templates, and watch [April's AI Agents Academy](https://www.youtube.com/playlist?list=PLINAH02_IDH9WhLAg1DyE_hJw7IoJuP0V)
> (April Dunnam, Microsoft) for step-by-step building.

## Watch out for
- **Voice, not facts.** Ground it on your sent mail for *style* — but never let it carry over real names,
  numbers, or commitments from old emails into a new draft. Tell it explicitly: imitate the voice, not the
  content.
- **Keep it strictly personal.** This agent is trained on your private correspondence. Do not share it —
  another person's drafts shouldn't be filtered through your inbox, and yours shouldn't leak.
- **You're still the author.** A voice match makes bad advice *sound* like you. Read every draft as the
  person whose name is on it.

## Where this leads (the ramp)
You built a personal agent that *generates* in your style. Its ceiling is that it only writes — it can't
pull a live figure, post to a system, or run a designed workflow. When you need an agent that *does* things,
not just drafts them, you move to **Stage 6 · Copilot Studio**.

> **Next:** [Copilot Studio → Build your first Studio agent with a knowledge source + topic](../walkthroughs/studio-first-agent.md)

## Related
- [Rewrite an email for the right tone](../walkthroughs/chat-rewrite-email.md) — the Stage 1 version, no agent needed
- [Build a personal research librarian over your OneDrive](../walkthroughs/agent-builder-research-librarian.md)
- Stage 4 Resources: see `RESOURCES.md` → Agent Builder

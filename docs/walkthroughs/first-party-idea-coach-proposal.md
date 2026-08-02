---
title: Pressure-test a proposal with the Idea Coach
description: Hand your proposal to the Idea Coach before you send it and get the pushback a sharp colleague would give, the weak assumption and the missing option.
stage: first-party
roles: [end-user, manager, champion]
tags: [first-party, idea-coach, brainstorm, feedback, proposal, writing]
level: starter
time: 10 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-06-05
---

# Pressure-test a proposal with the Idea Coach

> Before you hit send, hand your proposal to the Idea Coach and get the pushback a sharp colleague
> would give — the weak assumption, the missing option, the objection your reader will raise — while
> there's still time to fix it.

**Stage:** First-Party Agents · **For:** End user, Manager, Champion · **Level:** Starter · **Time:** 10 min

**Status:** Check current status — this agent isn't individually listed on the [Agents in Microsoft 365 roster](https://adoption.microsoft.com/en-us/ai-agents/agents-in-microsoft-365/); confirm availability there before assuming it's GA.

## When to use this
You've written the proposal — a new initiative, a budget ask, a recommendation — and it *feels* done. But
"feels done" and "survives scrutiny" are different things. The **Idea Coach** is a first-party Copilot
capability built to brainstorm *with* you and stress-test your thinking: it challenges assumptions, offers
angles you didn't consider, and surfaces the objections your audience will raise — so you're the one who
finds the holes, not your reader.

Use it as the last step before sending anything that needs to persuade.

## What you'll need
- **M365 Copilot license** (Idea Coach surfaces in Copilot experiences such as Viva Engage and the M365
  Copilot app, depending on what your org has enabled)
- A **draft proposal** — even a rough one. The Coach works better on real text than on a blank page
- A clear sense of **who has to say yes** (your audience and what they care about)

## Try it now — the prompt
Paste your draft and ask the Idea Coach to play the skeptic, not the cheerleader:

```
Here's my proposal: [paste it].
My audience is [who decides] and they care most about [cost / risk / speed / impact].
Pressure-test it: what are the three weakest assumptions, what's the strongest
objection they'll raise, and what option am I not considering? Then suggest how I'd
strengthen the proposal to address each one.
```

**Why this works:** telling the Coach **who decides** and **what they value**, then asking for specific
failure modes (weak assumptions, the strongest objection, a missing option) forces useful pushback instead
of generic praise — and asking *how to strengthen it* turns the critique into an edit list.

## Step by step
1. **Open the Idea Coach.** Find it in your Copilot experience — the M365 Copilot app, or the post/idea
   composer in Viva Engage where Idea Coach appears as a brainstorming helper.
2. **Paste the draft and the audience context.** Give it the real proposal plus who has to approve it and
   what they care about — context is what turns vague feedback into sharp feedback.
3. **Read the critique like a reviewer would.** You'll get weak assumptions, the strongest counter, and an
   alternative angle. Resist defending — capture what lands.
4. **Turn pushback into a rewrite:**
   ```
   Rewrite my opening paragraph to lead with the impact my audience cares about,
   and add a short "risks and mitigations" section that pre-empts the top objection.
   ```
   The Coach drafts the stronger version so you can edit, not start over.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Push past a single round of feedback:
- **Run it from the reader's chair.** "Respond as a skeptical CFO reading this for the first time — what's
  your first question?"
- **Generate the alternatives.** "Give me two other ways to frame this proposal and the trade-offs of each."
- **Tighten the language.** "Cut this to half the length without losing the argument."

> **📚 Learn more.** The [Agents in Microsoft 365 hub](https://adoption.microsoft.com/en-us/ai-agents/agents-in-microsoft-365/)
> covers the prebuilt Copilot helpers, and the [Viva Engage + Copilot guidance](https://adoption.microsoft.com/en-us/copilot/)
> describes Idea Coach for crafting and refining ideas.

## Watch out for
- **It's a sparring partner, not an approver.** The Coach surfaces angles; the judgment on what to change
  is yours. Don't outsource the decision.
- **Generic in, generic out.** Without the audience and stakes, you'll get bland feedback. The context is
  the whole trick.
- **Availability varies by surface.** Where Idea Coach appears depends on what your org has enabled. If you
  don't see it, the same "play the skeptic" prompt works in Copilot Chat.

## Where this leads (the ramp)
Once you're using an agent to *refine your thinking*, the next step is delegating the *work* around it —
let Copilot pull the inputs and assemble the deliverable end to end. That's **Stage 3 · Cowork**.

> **Next:** [Cowork → Build a deck from rough notes](../walkthroughs/cowork-deck-from-notes.md)

## Related
- [The agents included in your M365 Copilot license](../walkthroughs/first-party-agents-overview.md) — the full roster
- [Rewrite an email for the right tone](../walkthroughs/chat-rewrite-email.md) · [Deep-dive a topic with Researcher](../walkthroughs/first-party-researcher-deep-dive.md)
- Stage 2 Resources: see `RESOURCES.md` → First-Party Agents

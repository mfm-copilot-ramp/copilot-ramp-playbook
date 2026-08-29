---
title: Weigh a decision with pros, cons, and a recommendation
description: Use Copilot to structure a decision with pros, cons, risks, a recommendation, and one option you may not have considered.
stage: chat
roles: [end-user, manager]
tags: [chat, decisions, risk, productivity]
level: starter
time: 5 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-08-29
---

# Weigh a decision with pros, cons, and a recommendation

> Turn an unclear decision into pros, cons, risks, a recommendation, and one alternative you may have missed.

**Stage:** Copilot Chat · **For:** End user, Manager · **Level:** Starter · **Time:** 5 min

## When to use this
You need to make a choice, but the thinking is scattered across instinct, partial information, and hallway advice. Copilot Chat can organise the case for and against each option and force a clear recommendation.

Use this when you need enough structure to move forward, not a formal business case.

## What you'll need
- **M365 Copilot license** — Microsoft 365 Copilot Chat in Teams, Outlook, Word, or the Microsoft 365 Copilot app
- No agents or setup — just paste the prompt into the chat you already use
- The decision you need to make
- Any options, constraints, stakeholders, or risks you already know

## Try it now — the prompt
Open Microsoft 365 Copilot Chat and paste:

```
Help me make a decision about [decision].

Current options:
- [option A]
- [option B]
- [option C, if any]

Context:
[constraints, stakeholders, deadline, budget, must-haves, known risks]

For each option, give:
- Pros
- Cons
- Risks and possible mitigations
- What would make this option the right choice

Then:
- Recommend the option you would choose and explain the reasoning
- Add one option I may not have considered
- Give me one practical next step I can take today
```

**Why this works:** it asks for balanced analysis before the recommendation, then asks for a missed option so the decision does not stay trapped in the first set of choices.

## Step by step
1. **Describe the decision in one sentence.** If you cannot do that, ask Copilot to help clarify the decision first.
2. **Add the real constraints.** Deadline, budget, stakeholder pressure, and reversibility change the recommendation.
3. **Read the pros and cons for balance.** If one option is obviously favoured, ask Copilot to make the strongest opposing case.
4. **Inspect the risks.** Look for risks that need an owner, mitigation, or escalation before you decide.
5. **Act on the next step.** Use the final line to move from thinking to action: send a note, gather one missing fact, or book the decision review.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Reduce bias:** "Assume I prefer [option]. Challenge that preference and tell me what I may be overlooking."
- **Add stakeholder fit:** "For each option, explain how [stakeholder group] is likely to react."
- **Make it reversible:** "Which option is easiest to reverse if we learn we are wrong?"
- **Turn it into communication:** "Draft a concise recommendation message I can send to my manager."

## Watch out for
- **Pros and cons are only as good as the context.** Add facts Copilot cannot know, especially politics, capacity, and risk tolerance.
- **A neat recommendation can hide uncertainty.** Ask what evidence would change the answer before you decide.
- **The missed option may be impractical.** Treat it as a prompt for better thinking, not an instruction to pursue it.

## Where this leads (the ramp)
Once you rely on structured decision support, the next step is to capture repeatable criteria and guide decisions consistently across a team or workflow.

> **Next:** [Stage 2 · First-Party Agents](../stages/stage-2-first-party.md)

## Related
- [Compare options in a decision table](chat-compare-options.md)
- [Brainstorm solutions with structured tradeoffs](chat-brainstorm.md)
- [Stage 2 · First-Party Agents](../stages/stage-2-first-party.md)

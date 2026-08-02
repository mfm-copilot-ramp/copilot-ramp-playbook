---
title: Answer routine HR and IT questions with Employee Self-Service
description: Get PTO balances, policies, and how-do-I answers in seconds from approved sources with Employee Self-Service, no ticket filed and no waiting in a queue.
stage: first-party
roles: [end-user, it-admin]
tags: [first-party, employee-self-service, hr, it, helpdesk, self-serve]
level: starter
time: 10 min
status: walkthrough
prereqs: [m365-copilot-license]
updated: 2026-06-03
---

# Answer routine HR and IT questions with Employee Self-Service

> Get the PTO balance, the policy, the "how do I…" answer in seconds — from approved
> sources, no ticket filed and no waiting on a queue.

**Stage:** First-Party Agents · **For:** End user, IT/Admin · **Level:** Starter · **Time:** 10 min

**Status:** Check current status — this agent isn't individually listed on the [Agents in Microsoft 365 roster](https://adoption.microsoft.com/en-us/ai-agents/agents-in-microsoft-365/); confirm availability there before assuming it's GA.

## When to use this
It's the question that's too small to file a ticket for but too specific to guess at — "how much PTO do I
have left," "what's our travel policy," "how do I set up the VPN." The **Employee Self-Service** agent
answers these from your organization's approved HR and IT sources, right in the flow of work. It's the
front door that absorbs the routine volume so people get unblocked instantly and the HR/IT queue clears
for the things that actually need a human.

For end users it's the fastest path to an answer. For IT/admins it's deflection that improves service
instead of degrading it.

## What you'll need
- **M365 Copilot license** and access to the **Employee Self-Service** agent in your tenant
- The agent **grounded on your org's approved sources** — benefits, policies, IT knowledge base
- A real question to ask — the more routine, the better the fit

## Try it now — the prompt
Ask the everyday question directly, the way you'd ask a helpful colleague:

```
How much PTO do I have left, what's the policy on carrying it over, and how do I
request time off? Link me to the source for each so I can double-check.
```

**Why this works:** it bundles the **specific data** (your balance), the **policy** (carryover), and the
**action** (how to request) into one ask — and requests **source links** so the answer is verifiable.
That's the pattern that makes a self-service agent trusted: fast answer, with a receipt.

## Step by step
1. **Open Employee Self-Service and ask plainly.** No special syntax — ask the HR or IT question in
   natural language, the same way you'd message the help desk.
2. **Read the answer and the source.** The agent answers from approved sources and links them. Open the
   source for anything that affects a real decision — pay, leave, security.
3. **Take the next action inline.** If it can route you to the request form or the right team, follow that
   path right there rather than re-finding it yourself.
4. **Escalate cleanly when it's not routine:**
   ```
   This is a non-standard situation — [briefly describe]. Who's the right person
   or team to take this to, and what should I include when I reach out?
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Self-service is a flywheel — feed it and it speeds up:
- **Mine the misses (IT/admin).** Questions it can't answer are your knowledge-base backlog. Each gap you
  fill deflects the next dozen tickets.
- **Keep sources current and authoritative.** A self-service agent answering from last year's policy is a
  liability. Assign owners to the HR and IT sources it grounds on.
- **Publicize the front door.** Most of the value is lost if people don't know to ask the agent first. Put
  it in onboarding and pin it where the "how do I…" questions usually land.

> **📚 Learn more.** The [Agents in Microsoft 365 hub](https://adoption.microsoft.com/en-us/ai-agents/agents-in-microsoft-365/)
> describes the prebuilt agents in plain language, and the [Microsoft 365 Copilot Adoption Hub](https://adoption.microsoft.com/en-us/copilot/)
> collects guidance on rolling agents out to your organization.

## Watch out for
- **Approved sources only — verify the grounding.** A self-service agent is only as right as the sources
  behind it. For pay, leave, and security answers, the linked source is the authority, not the phrasing.
- **Know where self-serve stops.** Sensitive, exception, or compliance-bound cases need a human. The agent
  should hand off cleanly, not improvise a ruling.
- **Set expectations honestly.** "Fast answers to routine questions from approved sources" is the promise.
  Overselling it as an all-knowing HR oracle invites the one wrong answer that breaks trust.

## Where this leads (the ramp)
Employee Self-Service is a grounded, source-cited agent answering from documents you chose — which is
*exactly* the shape of the agent you'll build next, just one Microsoft built for you. Once you've seen how
much routine volume a well-grounded agent absorbs, building one tuned to *your* team's docs is the obvious
move. That's **Stage 4 · Agent Builder**.

> **Next:** [Agent Builder → Build a "team knowledge" agent over a SharePoint site](../walkthroughs/agent-builder-team-knowledge.md)

## Related
- [First-Party → The first-party agents included with your M365 Copilot license](../walkthroughs/first-party-agents-overview.md) — the roster
- [First-Party → Post team-wide answers with Agents in Channels](../walkthroughs/first-party-agents-in-channels.md) — the team-knowledge sibling
- Stage 2 Resources: see `RESOURCES.md` → First-Party Agents

---
title: Publish and govern your agent
description: Publish a Copilot Studio agent safely to the right audience with an owner and a way to watch it, the step that turns a working agent into a trusted one.
stage: studio
roles: [maker, it-admin]
tags: [copilot-studio, publish, governance, lifecycle, deployment]
level: advanced
time: 20 min
status: walkthrough
prereqs: [copilot-studio-access, publish-permissions]
updated: 2026-06-03
---

# Publish and govern your agent

> Building the agent is half the job — publishing it safely, to the right people, with
> an owner and a way to watch it, is the other half. This is how a working agent becomes a *trusted* one.

**Stage:** Copilot Studio · **For:** Maker, IT/Admin · **Level:** Advanced · **Time:** 20 min

## When to use this
Your agent works in test. Now it has to live in the real world — reachable by the right audience, running
in the right environment, with someone accountable for it and a way to see how it's doing. The build was
the exciting part; **publishing and governance** are what keep it from becoming an ungoverned bot nobody
owns six months from now. This is the maturity step that separates a demo agent from a production one.

It's a genuine joint effort: makers own the publish, IT/admins own the environment, access, and lifecycle.

## What you'll need
- **Copilot Studio access** with permission to publish in the target environment
- A tested agent and a clear answer to "who is this for and where does it run?"
- An owner — a named human accountable for the agent after launch — and IT's sign-off on data and access

## Try it now — the prompt
Before you publish, use Copilot to build your own pre-flight checklist so nothing gets skipped:

```
Draft a pre-publish checklist for a Copilot Studio agent: audience and access,
environment, data sources it touches, named owner, what to monitor after launch,
and how a user reports a bad answer. Keep it to one page.
```

**Why this works:** it turns "ship it" into a *governed decision* — covering access, environment, data,
ownership, monitoring, and feedback — so the questions IT would ask anyway are answered before launch, not
after an incident.

## Step by step
1. **Set the audience and environment.** Decide exactly who can reach the agent and in which environment it
   runs — this is the single most consequential governance choice.
2. **Confirm the data and access scope with IT.** Walk through every source the agent touches and confirm
   the audience is allowed to see all of it. Publishing widens who can trigger those reaches.
3. **Publish, then test as a real user.** Publish to the chosen audience and immediately test from a
   non-maker account — the published experience can differ from the authoring view.
4. **Stand up the feedback loop:**
   ```
   Set up a simple way for users to flag a wrong answer, and tell me what I should
   review weekly to catch problems early.
   ```

## Screenshots

Captured live in Microsoft Copilot Studio (Contoso environment). The product UI moves fast — if what you see differs, trust the numbered steps above, which we keep current.

![The Channels tab showing published status, a Publish button, and Microsoft and other channel options](../screenshots/studio-publish/01-channels.png)
**The Channels tab is the ship surface — publish once, then connect the agent to Teams, Microsoft 365, SharePoint, a website, and more.**

## Make it better
A published agent is a managed product, not a finished one:
- **Watch the transcripts.** Real questions reveal gaps your tests didn't. The agent's misses are your
  next round of instructions and knowledge.
- **Version deliberately.** Change in a dev environment, test, then promote — don't edit a live agent in
  place. Treat it like the software it is.
- **Plan the handoff.** The maker who built it won't own it forever. Document how it works so the next
  owner inherits something maintainable, not a black box.

> **📚 Learn more.** The [Copilot Studio documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/)
> covers publishing and lifecycle, and the [Agent 365 resources](https://aka.ms/agent365/resources) collect
> Microsoft's guidance on governing agents at scale across the organization.

## Watch out for
- **Publishing widens the blast radius.** An agent that was safe in test can surface content to people who
  shouldn't see it once the audience opens up. Re-verify access *after* publish, from a real user account.
- **An unowned agent is a liability.** Every published agent needs a named human who's accountable. "The
  team" owns nothing. Assign one person before launch.
- **No monitoring means silent failure.** An agent quietly giving wrong answers erodes trust without anyone
  noticing. The feedback loop and weekly review aren't optional — they're how you stay ahead of problems.

## Where this leads (the ramp)
You've now taken an agent all the way — built, actioned, published, and governed. That's the full arc this
cookbook set out to climb. From here it's repetition and scale: more agents, richer orchestration, and the
organizational muscle to run a fleet of them. The resources below are where that depth lives.

> **Next:** [Copilot Studio → Make the ROI case for your agent](../walkthroughs/studio-roi-business-case.md)

## Related
- [Copilot Studio → Build your first Copilot Studio agent](../walkthroughs/studio-first-agent.md) — the Stage 6 flagship
- [Copilot Studio → Give a Studio agent a real action with a connector](../walkthroughs/studio-connector-action.md) — what you publish
- Stage 6 Resources: see `RESOURCES.md` → Copilot Studio

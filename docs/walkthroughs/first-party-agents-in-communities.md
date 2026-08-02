---
title: Answer common questions with Agents in Communities
description: Drop a shared agent into a Viva Engage community so the most-asked questions answer themselves where a broad audience already gathers, not in private DMs.
stage: first-party
roles: [champion, it-admin]
tags: [first-party, agents, viva-engage, communities, self-serve, knowledge]
level: starter
time: 10 min
status: walkthrough
prereqs: [m365-copilot-license, viva-engage]
updated: 2026-06-03
---

# Answer common questions with Agents in Communities

> Drop a shared agent into a Viva Engage community so the most-asked questions answer
> themselves — where a broad audience already gathers, instead of in a dozen private DMs.

**Stage:** First-Party Agents · **For:** Champion, IT/Admin · **Level:** Starter · **Time:** 10 min

**Status:** Public preview — verify current availability on the [Agents in Microsoft 365 roster](https://adoption.microsoft.com/en-us/ai-agents/agents-in-microsoft-365/).

## When to use this
The same five questions keep landing in your community feed — "what's our policy on X," "where's the
onboarding doc," "who owns Y." **Agents in Communities** lets you place a shared agent inside a Viva
Engage community so members get an answer from approved sources right where they asked, and everyone else
sees it too. It's the broadest-reach version of self-serve: one good answer, surfaced to a whole
community instead of repeated one-to-one.

This is a champion-and-admin move — you're not building an agent for yourself, you're putting a shared
one where your people already are.

## What you'll need
- **M365 Copilot license** and a **Viva Engage** community you steward or admin
- A **knowledge source** the agent can answer from — an FAQ, a policy site, an onboarding hub
- A short list of the questions your community actually repeats (your "answer these" starting set)

## Try it now — the prompt
Once a shared agent is available in the community, members invoke it inline:

```
(In a Viva Engage community) @[agent] what's our current policy on [topic], and
where's the source doc so I can read the detail?
```

**Why this works:** it asks for both the **answer** and the **source link**, which is the pattern that
makes a community agent trustworthy — people get the quick answer *and* a path to verify it, so the agent
builds credibility instead of becoming another thing nobody believes.

## Step by step
1. **Pick the community and the knowledge it should answer from.** Choose a community with real recurring
   questions and a clean, approved source to ground on — garbage in, garbage out.
2. **Make the shared agent available in the community.** Add it so members can @mention it inline, the
   same way they'd tag a person.
3. **Seed it with the real questions.** Post the handful of questions your community repeats so early
   answers are visibly useful — the first good answer is what earns the next hundred.
4. **Point newcomers at it:**
   ```
   Draft a short pinned post welcoming new members and showing them how to ask
   the community agent a question, with two example prompts.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
A community agent is only as good as the loop around it:
- **Watch what it can't answer.** The questions it misses are your content backlog — each gap is a doc to
  write or a source to add.
- **Pair it with Agents in Channels.** Communities reach broad audiences; channels serve focused teams.
  The same knowledge source can power both, meeting people wherever they already gather.
- **Keep the source fresh.** A community agent answering from a stale policy doc is worse than no agent.
  Assign an owner to keep the grounding current.

> **📚 Learn more.** The [Agents in Microsoft 365 hub](https://adoption.microsoft.com/en-us/ai-agents/agents-in-microsoft-365/)
> describes the shared-agent surfaces in plain language, and Nicole Herskowitz's (CVP, M365 Copilot) blog
> on [enabling human-agent teams](https://www.microsoft.com/en-us/microsoft-365/blog/2025/09/18/microsoft-365-copilot-enabling-human-agent-teams/)
> covers how shared agents work alongside people.

## Watch out for
- **Public answers raise the bar.** A wrong answer in a community is wrong in front of everyone. Ground
  the agent tightly and tell members to verify against the linked source.
- **Scope it to what it knows.** An agent that confidently answers outside its knowledge erodes trust
  fast. Keep its grounding narrow and its "I don't know, here's who to ask" behavior explicit.
- **Stewardship is ongoing, not one-time.** Standing up the agent is the easy 20%. Curating its sources
  and watching its misses is the 80% that makes it actually useful.

## Where this leads (the ramp)
Sharing a prebuilt agent with a whole community is the last step before you start *making* your own. Once
you've felt how much repeat work a well-grounded shared agent absorbs, the natural next question is "what
if I built one tuned exactly to my team's docs?" That's **Stage 4 · Agent Builder**: your first
declarative agent, grounded on a source you choose.

> **Next:** [Agent Builder → Build a "team knowledge" agent over a SharePoint site](../walkthroughs/agent-builder-team-knowledge.md)

## Related
- [First-Party → The first-party agents included with your M365 Copilot license](../walkthroughs/first-party-agents-overview.md) — the roster
- [First-Party → Post team-wide answers with Agents in Channels](../walkthroughs/first-party-agents-in-channels.md) — the focused-team version
- Stage 2 Resources: see `RESOURCES.md` → First-Party Agents

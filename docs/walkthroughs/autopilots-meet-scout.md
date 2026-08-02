---
title: Meet Microsoft Scout — and what Autopilots are
description: A field guide to Autopilots, Microsoft's new category of always-on agents, and Scout, the first one, so you understand what it is and what it actually does.
stage: autopilots
roles: [end-user, champion, manager, maker, it-admin]
tags: [autopilots, scout, overview, work-iq, frontier, field-guide]
level: starter
time: 10 min
status: walkthrough
prereqs: [none]
updated: 2026-06-11
---

# Meet Microsoft Scout — and what Autopilots are

> Before you turn anything on, get the map: **Autopilots** are Microsoft's new category of
> always-on agents, and **Scout** is the first one. This is the field guide to what that means
> and what Scout actually does.

**Stage:** Autopilots · **For:** Everyone · **Level:** Starter · **Time:** 10 min · No access required

## When to use this
Start here. You've heard "Autopilots" and "Scout" used almost interchangeably — they aren't the same
thing, and getting the hierarchy straight is the whole point of this page. **Autopilots are a *category*
of agent; Microsoft Scout is the *first product* in that category.** Once that clicks, the rest of the
stage makes sense: you're not learning a pile of products, you're learning one new *pattern* — an agent
that runs in the background — and one agent that embodies it today.

This is pure learning. You don't need access to Scout to read it, and nothing here asks you to install
anything. It's the Day-1 step before you find out whether you can turn Scout on.

## What you'll need
- **Nothing to install.** This page is orientation — no license, tenant, or enrollment required to read it.
- **Curiosity about the always-on model**, which is genuinely different from the on-demand agents in
  earlier stages.
- Optional: skim the [Introducing Microsoft Scout announcement](https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/02/introducing-microsoft-scout-your-always-on-personal-agent/)
  first — everything below is grounded in it and the [Microsoft Scout docs](https://learn.microsoft.com/en-us/microsoft-scout/).

## The hierarchy — category vs. product
Two words, two different levels. Keep them straight and the whole stage reads cleanly.

| Term | What it is | The honest one-liner |
|------|------------|----------------------|
| **Autopilots** | A **category** of agents Microsoft has announced: always-on, autonomous, each running under its **own governed Microsoft Entra identity**, acting **on your behalf** within the permissions and policies you and your org set — staying active in the background and taking action without being prompted each time. | The *pattern*: an agent that works *for* you, not one you call. |
| **Microsoft Scout** | Microsoft's **first Autopilot** — and currently the only named one. An always-on personal agent integrated across your Microsoft 365 apps. | The *product* you'll actually meet first. |

Scout is the **first** Autopilot, not the last — Microsoft has signaled the category will grow, and new
Autopilots will join Scout over time. But today, when you say "an Autopilot," the one that exists is Scout.

## What Scout connects to
Scout's value comes from reach. Per the announcement and docs, it:

- **Operates across cloud, desktop, and web** — it isn't pinned to a single app or device.
- **Connects to Teams, Outlook, OneDrive, and SharePoint**, and to your **chats, email, calendar, and contacts** — the everyday surface area of your work.
- **Is integrated across your Microsoft 365 apps**, so it works where you already are rather than in a separate console.

You **interact with Scout in Teams**, and you can **extend it with a desktop app** that reaches your
**browser, local resources, and MCP servers** — so Scout can act beyond the Microsoft 365 boundary when
you set it up to.

## How Scout builds context — Work IQ
Scout isn't starting from scratch each time. It **builds context over time, powered by Work IQ** — the
same work-graph intelligence Microsoft is opening up through the
[new Work IQ APIs](https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/02/announcing-the-new-work-iq-apis/).
That accumulated understanding of your work is what lets an always-on agent act usefully in the
background instead of asking you to re-explain things every time. Under the hood, Scout is **built on the
OpenClaw open-source technology**.

## Try it now — the prompt
You can't run this until Scout is switched on for you (that's the [next page](autopilots-get-access.md)) —
but this is the shape of how you'd *talk* to it once it is. You interact with Scout in Teams, in plain
language, the way you'd brief a capable assistant:

```
Keep an eye on my week. When a meeting needs prep, pull the materials together and
flag it to me before it starts — and tell me about anything that looks like it's
stalling. Check with me before you act on anything sensitive.
```

**Why this framing works:** it hands Scout a *standing* job ("keep an eye on my week") rather than a
one-off task, names the outcomes you care about, and sets the human-in-the-loop guardrail up front —
which is exactly how an always-on agent is meant to be directed.

## What Scout can do today
Grounded in the announced capabilities — no more, no less. Treat this as the starting menu for the
deeper walkthroughs in this stage.

| What Scout does | The standing job behind it |
|-----------------|----------------------------|
| **Coordinate meeting times across time zones** | Proactively schedule and line up times so you're not playing calendar tag. |
| **Flag important meetings** | Surface the ones that actually matter out of a full calendar. |
| **Generate prep materials — with you in the loop** | Assemble what you need ahead of a meeting, while keeping you in control of the output. |
| **Identify deliverables and block calendar time** | Spot what's coming due and automatically protect time to do it. |
| **Spot risks before they block you** | Notice things like stalled decisions early, before they become blockers. |

→ Go deeper: **[Let Scout coordinate your meetings and prep](autopilots-coordinate-meetings.md)** and
**[Have Scout watch your deliverables and flag risks](autopilots-track-deliverables.md)**.

## Step by step
This is a read-and-orient step, not a click-through. Here's how to use it:

1. **Fix the hierarchy in your head.** Autopilots = the always-on *category*; Scout = the first
   *product*. If you only remember one thing, remember that.
2. **Map Scout's reach to your day.** It connects to Teams, Outlook, OneDrive, SharePoint, and your
   calendar/contacts — note which of those hold the work you'd want watched.
3. **Note how you'd reach it.** You talk to Scout in Teams; the desktop app extends it to your browser,
   local files, and MCP servers.
4. **Pick a candidate job.** From the capabilities table, choose the one standing job you'd hand Scout
   first. You'll carry it into the access and coordination walkthroughs.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Read the source, not the rumor.** The [announcement blog](https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/02/introducing-microsoft-scout-your-always-on-personal-agent/)
  and the [Microsoft Scout docs](https://learn.microsoft.com/en-us/microsoft-scout/) are the ground truth
  while the category is young — anchor your team's expectations there.
- **Separate "category" from "product" when you brief others.** The fastest way to confuse a team is to
  imply there are many Autopilots today. There's one: Scout. Say it that way.
- **Decide your first standing job before you have access.** Walking into the access step with a job
  already in mind turns "I have Scout now" into "Scout is already doing something useful."

## Watch out for
- **Scout is the only Autopilot today.** Don't describe other Microsoft agents as Autopilots — the
  category is real but Scout is the first and currently sole member of it.
- **"Always-on" is not "unsupervised."** Scout runs under your governed identity and within your
  permissions; sensitive actions can require your sign-off. It works *for* you, under your guardrails.
- **It's private preview.** Everything here is real but gated — reading this page doesn't mean you can
  turn Scout on yet. That's the very next step.

## Where this leads (the ramp)
Now that you know what an Autopilot is and what Scout does, the only question left is whether you can get
it — Scout is experimental and in **private preview through the Frontier program**, so access has real
prerequisites worth checking before you plan around it.

> **Next:** [Autopilots → Find out if you can get Scout — and turn it on](autopilots-get-access.md)

## Related
- [Autopilots → Find out if you can get Scout — and turn it on](../walkthroughs/autopilots-get-access.md)
- [Autopilots → Let Scout coordinate your meetings and prep](../walkthroughs/autopilots-coordinate-meetings.md)
- [Autopilots → Have Scout watch your deliverables and flag risks](../walkthroughs/autopilots-track-deliverables.md)
- Stage 5 Resources: see `RESOURCES.md` → Autopilots

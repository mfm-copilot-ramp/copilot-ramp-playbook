---
title: Meet Autopilot (formerly Microsoft Scout)
description: A field guide to Autopilot, Microsoft's always-on agent formerly called Scout — what changed in the rename, what it does, and how it bills.
stage: autopilots
roles: [end-user, champion, manager, maker, it-admin]
tags: [autopilots, autopilot, scout, overview, work-iq, frontier, field-guide]
level: starter
time: 10 min
status: walkthrough
prereqs: [none]
updated: 2026-10-28
---

# Meet Autopilot (formerly Microsoft Scout)

> Before you turn anything on, get the map: **Microsoft Scout is now Autopilot** — Microsoft's
> always-on agent. This is the field guide to what changed, what it does, and how it's paid for.

**Stage:** Autopilots · **For:** Everyone · **Level:** Starter · **Time:** 10 min · No access required

## When to use this
Start here. **Microsoft Scout is now Autopilot** (renamed September 2026) — the product. **Autopilots** is this
stage of the ramp: always-on agents that keep working between your prompts. No access needed to read this —
it's the Day-1 step before you find out whether you can turn it on.

## What you'll need
- **Nothing to install.** This page is orientation — no license, tenant, or enrollment required to read it.
- **Curiosity about the always-on model**, which is genuinely different from the on-demand agents in
  earlier stages.
- Optional: skim [Introducing the new Copilot with Home, Code and Autopilot](https://blogs.microsoft.com/blog/2026/09/25/introducing-the-new-copilot-with-home-code-and-autopilot/)
  first — everything below is grounded in it, the original
  [Microsoft Scout announcement](https://www.microsoft.com/en-us/copilot/blog/2026/06/02/introducing-microsoft-scout-your-always-on-personal-agent/),
  and the [Microsoft Scout docs](https://learn.microsoft.com/microsoft-scout/overview).

## Try it now — the prompt
You can't run this until Autopilot (or the Scout desktop app) is switched on for you — that's the
[next page](autopilots-get-access.md) — but this is the shape of how you'd brief it once it is: a role, a
goal, and boundaries.

```
You're my chief-of-staff for the week. Goal: nothing important sneaks up on me.
Keep an eye on my calendar and inbox. When a meeting needs prep, pull the materials
together and flag it to me before it starts — and tell me about anything that looks
like it's stalling. Check with me before you send or change anything other people see.
```

**Why this framing works:** it gives Autopilot a **role** ("chief-of-staff"), a **standing goal** rather than
a one-off task, the outcomes you care about, and the human-in-the-loop boundary up front — which is exactly
how Microsoft describes directing it.

## Step by step
This is a read-and-orient step, not a click-through. Here's how to use it:

1. **Fix the names in your head.** Scout → Autopilot (the product). Autopilots = this stage. If you only
   remember one thing, remember that.
2. **Map its reach to your day.** Teams, Outlook, chats, channels, documents, calendar — note which of those
   hold the work you'd want watched.
3. **Note the budget question.** Autopilot draws Copilot Credits on top of the Microsoft 365 Copilot license,
   so a pilot needs an admin-approved spending policy as well as access.
4. **Pick a candidate job.** Choose the one standing job you'd hand it first — meeting prep, follow-ups,
   a weekly report. You'll carry it into the access and coordination walkthroughs.

??? info "Scout → Autopilot: the timeline"
    | When | What happened | Source |
    |------|---------------|--------|
    | **June 2, 2026** | Microsoft introduces **Microsoft Scout**, "your always-on personal agent," through the Frontier program. | [Announcement](https://www.microsoft.com/en-us/copilot/blog/2026/06/02/introducing-microsoft-scout-your-always-on-personal-agent/) |
    | **June–Aug 2026** | Learn publishes docs for the **Microsoft Scout desktop app** (Windows and macOS) — still the hands-on reference today. | [Scout docs](https://learn.microsoft.com/microsoft-scout/overview) |
    | **Sept 25, 2026** | Scout is renamed **Autopilot**: a cloud-hosted "digital teammate," expanding to **private preview** at the end of September, billed with usage-based Copilot Credits. | [Announcement](https://blogs.microsoft.com/blog/2026/09/25/introducing-the-new-copilot-with-home-code-and-autopilot/) |

??? info "What Autopilot is"
    Per the September announcement, Autopilot is **your digital teammate**:

    - **You give it a name, a role and a goal**, and it goes to work — watching channels, following up on
      threads, running recurring work, and picking a project back up days later, without waiting for a prompt.
    - **It's cloud-hosted**, so it keeps working while you're offline.
    - **It lives in your tenant with its own identity, memory, computer and workspace**, grounded in Microsoft IQ.
    - **It shows up where you already work** — Teams, Outlook, chats, channels and documents — and you can
      **@mention it** like a colleague, with permissions, audit and governance behind it.

??? info "What the Scout desktop app documents today"
    The concrete, documented capabilities still live on Learn under the **Microsoft Scout** name. The desktop
    app:

    - Works across your **files, shell, browser, and Microsoft 365** — mail, calendar, Teams, OneDrive and
      SharePoint, Lists, and To Do — through **Work IQ**.
    - Runs **automations** on a schedule or a condition, plus a periodic **heartbeat** check, in the background.
    - Uses **skills**: `SKILL.md` instruction files you write once and reuse.
    - **Asks for your approval** before actions that send, share, or change what other people see.
    - Lets admins govern tools, models, and auto-approval through **Intune / Group Policy**.

??? info "How it's paid for"
    Microsoft now splits Copilot into **everyday AI**, covered by the Microsoft 365 Copilot user license, and
    **advanced AI** — long-running agentic work — on **usage-based billing in Copilot Credits**. Autopilot sits
    in the second group alongside Cowork and Code, and it requires the Microsoft 365 Copilot license for access
    ([USL vs. usage-based billing](https://learn.microsoft.com/microsoft-365/copilot/user-subscription-license-usage-based-billing)).
    The Scout desktop app's docs add that it **uses your GitHub account for token billing**, which is why it also
    needs a GitHub Copilot Business or Enterprise license.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Read the source, not the rumor.** The [September announcement](https://blogs.microsoft.com/blog/2026/09/25/introducing-the-new-copilot-with-home-code-and-autopilot/)
  and the [Microsoft Scout docs](https://learn.microsoft.com/microsoft-scout/overview) are the ground truth
  while the product is in preview — anchor your team's expectations there.
- **Say "Autopilot (formerly Scout)" when you brief others.** Half your audience heard "Scout" in June;
  bridging the names once saves a lot of confusion.
- **Decide your first standing job before you have access.** Walking into the access step with a job
  already in mind turns "I have Autopilot now" into "Autopilot is already doing something useful."

## Watch out for
- **Docs lag the rename.** Learn still says "Microsoft Scout (Frontier)" for the desktop app. That's
  expected mid-transition — don't read it as two competing products.
- **"Always-on" is not "unsupervised."** You set the objective and boundaries; actions that affect other
  people wait for your sign-off.
- **Always-on means always-metered.** Background work draws Copilot Credits. Agree on a budget with your admin
  before you hand it anything open-ended.
- **It's private preview.** Everything here is real but gated — reading this page doesn't mean you can turn
  it on yet. That's the very next step.

## Where this leads (the ramp)
Now that you know what Autopilot is and how it's paid for, the only question left is whether you can get it
— it's in **private preview**, so access has real prerequisites worth checking before you plan around it.

> **Next:** [Autopilots → Find out if you can get Autopilot — and turn it on](autopilots-get-access.md)

## Related
- [Autopilots → Find out if you can get Autopilot — and turn it on](../walkthroughs/autopilots-get-access.md)
- [Autopilots → Let Autopilot coordinate your meetings and prep](../walkthroughs/autopilots-coordinate-meetings.md)
- [Autopilots → Have Autopilot watch your deliverables and flag risks](../walkthroughs/autopilots-track-deliverables.md)
- Stage 5 Resources: see `RESOURCES.md` → Autopilots

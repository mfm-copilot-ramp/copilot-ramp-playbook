---
title: "Share Copilot Studio agent analytics without edit rights"
description: "Use the Analytics Viewer role to give stakeholders read-only access to your agent's performance data while keeping edit and publish rights locked down."
stage: studio
roles: [maker, it-admin]
tags: [studio, analytics, governance, intermediate]
level: intermediate
time: 15 min
status: walkthrough
prereqs: [copilot-studio-license]
updated: 2026-08-03
---

# Share Copilot Studio agent analytics without edit rights

> Give business stakeholders full visibility into how your agent is performing — deflection rates, satisfaction, popular topics — without handing them the keys to edit or republish it.

**Stage:** Copilot Studio · **For:** Maker, IT Admin · **Level:** Intermediate · **Time:** ~15 min

## When to use this

Your agent is live and the business sponsor, ops analyst, or team manager wants to see how it's doing — are users getting good answers, is ticket deflection improving, what questions are being asked most? That data lives on the Analytics page in Copilot Studio.

The old tradeoff was uncomfortable: share full agent access and risk someone accidentally republishing a broken version, or keep analytics locked to makers and leave stakeholders flying blind. The **Analytics Viewer role** — now generally available — removes that tradeoff entirely. Viewers get the Analytics page and nothing else.

> **Source:** [Microsoft Copilot Studio Blog — New and improved: Agent governance, intelligent workflows, and connected app experiences](https://www.microsoft.com/en-us/microsoft-copilot/blog/copilot-studio/new-and-improved-agent-governance-intelligent-workflows-and-connected-app-experiences/) (verified 2026-08-03)

## What you'll need

- **Copilot Studio license** with maker or environment admin rights on the agent you want to share
- At least one published agent in a Copilot Studio environment
- The Microsoft 365 / Entra ID email of the person you're granting access to
- The recipient also needs access to your Copilot Studio environment (coordinate with your tenant admin if they've never logged in before)

## Try it now — the prompt

Before you configure the role, use Copilot Chat to draft the stakeholder announcement so they know exactly what to expect when they land in Copilot Studio:

```
I'm giving [name or role, e.g. "our operations manager Sarah"] read-only access to the analytics 
dashboard for our Copilot Studio agent called "[agent name]".

Draft a concise email that:
- Names what they can see (sessions, CSAT, topic breakdown, escalation rate)
- Confirms what they cannot do (edit topics, change configuration, or republish the agent)
- Tells them where to send feedback or change requests
Keep it under 100 words and professional in tone.
```

**Why this prompt works:** anchoring the draft on the exact scope of the role (what's visible vs. locked) sets the right expectations upfront and reduces "can you just quickly change this one thing?" requests from people who don't realise they now have write access.

## Step by step

1. **Open Copilot Studio and navigate to your agent.**
   Go to [copilotstudio.microsoft.com](https://copilotstudio.microsoft.com) and open the agent you want to share. You'll land on the agent's authoring canvas.

2. **Open the Share panel.**
   Select **Share** at the top of the canvas. The sharing panel slides open on the right side of the screen.

3. **Add the person and select the Analytics Viewer role.**
   Type the person's name or email address, then in the role dropdown choose **Analytics Viewer**. This gives them read access to the **Analytics** tab only — they cannot open topics, run the test panel, modify settings, or publish.

   Official reference: [Share an agent's analytics — Analytics Viewer role](https://learn.microsoft.com/microsoft-copilot-studio/admin-share-bots?tabs=web#share-an-agents-analytics)

4. **Confirm and send your stakeholder announcement.**
   Select **Share**. Copilot Studio sends them an automated notification. Follow up by sending the Copilot-drafted email from the prompt above so they know what to expect when they open the agent.

5. **Verify access from their perspective (optional but recommended).**
   Ask them to open Copilot Studio, navigate to the agent, and confirm they can see the **Analytics** tab but not **Topics**, **Entities**, or the **Publish** button. If they do have edit access, double-check the role assignment in the Share panel.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

Once your stakeholder has access, help them extract more signal from the Analytics page:

```
I'm reviewing the analytics dashboard for our [agent name] Copilot Studio agent.
Key numbers this week: CSAT [X], escalation rate [Y%], top 3 topics: [A], [B], [C].
What should I flag as a concern vs. a sign of healthy operation? And what would 
tell me a topic needs updating?
```

- **Establish a weekly cadence.** Ask your analytics viewer to share a one-paragraph summary each Monday: what's trending well, what looks like a knowledge gap, and any new question patterns emerging.
- **Track the escalation rate over time.** A rising rate usually signals a topic that's not answering correctly. A drop after you update a topic confirms the fix worked.
- **Scale to a fleet with Microsoft Agent 365.** If you're managing many agents across the org, [Microsoft Agent 365](https://www.microsoft.com/en-us/microsoft-agent-365) (now generally available) provides a centralized view of agent inventory, permissions, behaviour, and activity — so governance scales beyond individual agents.

## Watch out for

- **License requirements for viewers.** The person being added needs appropriate Copilot Studio access. If the Analytics Viewer option doesn't appear in the role dropdown, they may not have the right license or environment permissions — coordinate with your tenant admin.
- **The role is scoped per agent, not per environment.** If the stakeholder needs visibility across multiple agents, you'll add them to each one separately via its own Share panel.
- **Analytics covers the published agent only.** After a significant republish (new topics, changed knowledge), analytics will mix traffic from the old and new versions. Note the republish date so your stakeholder doesn't misread a trend shift as a problem.
- **Analytics data has a lag of a few hours.** Copilot Studio analytics are not real-time. Let your stakeholder know so a gap in recent data doesn't trigger an unnecessary incident response.

## Where this leads (the ramp)

> Once stakeholders have visibility into performance, the natural next step is acting on it: using the data to sharpen topics, measure ROI, and make the business case to expand the agent program. See **[Make the ROI case for your agent](studio-roi-business-case.md)** — or if you're ready to scale governance and monitoring across a fleet, **[Govern and monitor agents at scale](studio-govern-monitor.md)** picks up from here.

## Related

- [Govern and monitor agents at scale](studio-govern-monitor.md)
- [Make the ROI case for your agent](studio-roi-business-case.md)
- [Stage 6 overview](../stages/stage-6-studio.md)
- [Resources](../RESOURCES.md)

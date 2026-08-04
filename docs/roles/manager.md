---
title: Manager
description: "The Copilot ramp for managers — run your team with less manual lift: better 1:1s, weekly planning, briefings, and onboarding, without drowning in prep."
hide: [toc]
---

# Manager — run your team with less manual lift

> **You lead people and projects** and want to run meetings better, delegate effectively, and keep work on track without drowning in prep. Your path leans into the moments that repeat: 1:1s, weekly planning, briefings, onboarding.

The biggest manager win isn't a flashy demo — it's reclaiming the 30 minutes of prep that sits in front of every recurring meeting. Start in Chat, graduate to **Cowork** for multi-step work, then build an agent that does your recurring prep for you. Raise your **pace** or shift your **goal** from team rollout to building, or set your **function**, and the path *grows* to match. Trim anything with **×**, or pull in more from **+ Add to my path**.

<div id="role-path"></div>

<script id="role-path-config" type="application/json">
{
  "persona": "manager",
  "key": "manager",
  "roleKeys": ["manager"],
  "variables": ["dept", "pace", "goal"],
  "defaults": { "dept": "general", "pace": "steady", "goal": "team" },
  "steps": [
    {
      "stage": "Stage 1 · Chat",
      "stageKey": "chat",
      "title": "Prep for a 1:1 in two minutes",
      "href": "../../walkthroughs/chat-prep-1on1/",
      "why": "Walk in knowing what changed, what's blocked, and what to ask — every time.",
      "deptVariants": {
        "sales": { "why": "Walk into a rep 1:1 already across their pipeline movement and at-risk deals." },
        "it": { "why": "Walk into a 1:1 already across the engineer's open incidents and on-call load." }
      }
    },
    {
      "stage": "Stage 1 · Chat",
      "stageKey": "chat",
      "title": "Plan your week from your calendar and inbox",
      "href": "../../walkthroughs/chat-plan-week/",
      "why": "Turn a cluttered week into a ranked, intentional plan in one prompt."
    },
    {
      "stage": "Stage 1 · Chat",
      "stageKey": "chat",
      "title": "Summarise a long email chain",
      "href": "../../walkthroughs/chat-email-chain-summary/",
      "why": "Catch up on a decision thread without reading 40 replies.",
      "pace": ["steady", "ramp"]
    },
    {
      "stage": "Stage 1 · Chat",
      "stageKey": "chat",
      "title": "Draft an exec briefing from background materials",
      "href": "../../walkthroughs/chat-exec-briefing/",
      "why": "Get the up-the-chain summary written for you, grounded in the real docs.",
      "goal": ["team", "build"]
    },
    {
      "stage": "Stage 2 · First-party agents",
      "stageKey": "first-party",
      "title": "Meet the built-in agents",
      "href": "../../walkthroughs/first-party-agents-overview/",
      "why": "Know what your team already has before you ask anyone to build anything."
    },
    {
      "stage": "Stage 2 · First-party agents",
      "stageKey": "first-party",
      "title": "See workforce insights for your team",
      "href": "../../walkthroughs/first-party-workforce-insights/",
      "why": "Spot adoption gaps and coaching moments across the people you lead.",
      "goal": ["team", "build"]
    },
    {
      "stage": "Stage 3 · Cowork",
      "stageKey": "cowork",
      "title": "Draft a 30/60/90-day onboarding plan",
      "href": "../../walkthroughs/cowork-onboarding-plan/",
      "why": "Hand a new hire a real plan on day one — Cowork assembles it across sources.",
      "pace": ["steady", "ramp"],
      "deptVariants": {
        "hr": { "why": "Generate a role-specific onboarding plan you can reuse across every new hire." },
        "sales": { "why": "Stand up a ramp plan that gets new reps to first deal faster." }
      }
    },
    {
      "stage": "Stage 3 · Cowork",
      "stageKey": "cowork",
      "title": "Build a deck from your rough notes",
      "href": "../../walkthroughs/cowork-deck-from-notes/",
      "why": "Go from bullet points to a presentable first draft without starting from a blank slide.",
      "pace": ["steady", "ramp"]
    },
    {
      "stage": "Stage 3 · Cowork",
      "stageKey": "cowork",
      "title": "Set up a recurring weekly digest",
      "href": "../../walkthroughs/cowork-recurring-weekly-digest/",
      "why": "Let a standing task assemble your team digest while you sleep.",
      "pace": ["ramp"],
      "optional": true
    },
    {
      "stage": "Stage 4 · Agent Builder",
      "stageKey": "agent-builder",
      "title": "Build a meeting-prep agent for recurring 1:1s",
      "href": "../../walkthroughs/agent-builder-meeting-prep-agent/",
      "why": "Stop re-prompting — package your prep routine into an agent that runs itself.",
      "goal": ["team", "build"],
      "weightGoal": { "build": 2 }
    },
    {
      "stage": "Stage 4 · Agent Builder",
      "stageKey": "agent-builder",
      "title": "Share an agent and gather feedback",
      "href": "../../walkthroughs/agent-builder-share-and-feedback/",
      "why": "Roll your agent out to the team and learn what to improve.",
      "goal": ["team", "build"],
      "pace": ["ramp"]
    },
    {
      "stage": "Stage 6 · Copilot Studio",
      "stageKey": "studio",
      "title": "Build the ROI business case",
      "href": "../../walkthroughs/studio-roi-business-case/",
      "why": "When you're championing a rollout, this turns adoption into a number leadership trusts.",
      "goal": ["team", "build"],
      "weightGoal": { "build": 1 }
    },
    {
      "stage": "Stage 6 · Copilot Studio",
      "stageKey": "studio",
      "title": "Govern and monitor what your team ships",
      "href": "../../walkthroughs/studio-govern-monitor/",
      "why": "Keep an eye on the agents your team builds without becoming the bottleneck.",
      "goal": ["build"],
      "optional": true
    },
    {
      "stage": "Stage 6 · Studio",
      "stageKey": "studio",
      "title": "Preview an agent built for your function",
      "href": "../../walkthroughs/first-party-agents-overview/",
      "why": "See what a purpose-built agent for your team looks like in practice.",
      "optional": true,
      "dept": ["hr", "it", "finance", "sales", "legal"],
      "deptVariants": {
        "hr": { "title": "Preview: HR onboarding agent", "href": "../../walkthroughs/studio-functional-hr-onboarding/", "why": "See a guided onboarding experience your new hires could use." },
        "it": { "title": "Preview: IT helpdesk agent", "href": "../../walkthroughs/studio-functional-it-helpdesk/", "why": "See common IT requests triaged and resolved faster." },
        "finance": { "title": "Preview: budget Q&A agent", "href": "../../walkthroughs/studio-functional-finance-budget-qa/", "why": "Let your team self-serve budget questions instead of pinging you." },
        "sales": { "title": "Preview: account-intel agent", "href": "../../walkthroughs/studio-functional-sales-intel/", "why": "Give reps the account context they need without digging." },
        "legal": { "title": "Preview: compliance helper agent", "href": "../../walkthroughs/studio-functional-legal-compliance/", "why": "Help the team check compliance questions against the right sources." }
      }
    }
  ]
}
</script>

---

> **Not your path?** [See all roles](../../start-by-role/) &middot; [Take the 2-minute self-check](../../start-here/) to confirm your starting rung.

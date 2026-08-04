---
title: Team champion
description: The Copilot ramp for team champions — build the habit in others, surface the wins, and turn one-off magic into a repeatable adoption routine across your org.
hide: [toc]
---

# Team champion — make the habit stick and scale what works

> **You're driving adoption** for your team or org. Your job isn't to use Copilot the most — it's to build the habit in others, surface the wins, and turn one-off magic into a repeatable routine.

Champions succeed by making Copilot *visible* and *low-friction*. The path below gives you a recurring ritual (Prompt of the Day), a way to see where adoption is actually landing, the first shared agents that encode your team's knowledge, and — as you scale — the rollout and governance moves that keep it healthy. Raise your **pace** or move your **goal** toward building, or set your **function**, and the path *expands*. Remove anything with **×**, or add more from **+ Add to my path**.

<div id="role-path"></div>

<script id="role-path-config" type="application/json">
{
  "persona": "champion",
  "key": "champion",
  "roleKeys": ["champion"],
  "variables": ["dept", "pace", "goal"],
  "defaults": { "dept": "general", "pace": "steady", "goal": "team" },
  "steps": [
    {
      "stage": "Stage 1 · Chat",
      "stageKey": "chat",
      "title": "Run a \"Prompt of the Day\" for your team",
      "href": "../../walkthroughs/chat-prompt-of-the-day/",
      "why": "The single highest-leverage adoption ritual — one prompt, shared daily, builds the habit."
    },
    {
      "stage": "Stage 2 · First-party agents",
      "stageKey": "first-party",
      "title": "Meet the built-in agents",
      "href": "../../walkthroughs/first-party-agents-overview/",
      "why": "Show people what they already have before asking anyone to build."
    },
    {
      "stage": "Stage 2 · First-party agents",
      "stageKey": "first-party",
      "title": "See where Copilot is landing",
      "href": "../../walkthroughs/first-party-workforce-insights/",
      "why": "Lead with data — find the teams adopting fast and the ones who need a nudge.",
      "pace": ["steady", "ramp"]
    },
    {
      "stage": "Stage 2 · First-party agents",
      "stageKey": "first-party",
      "title": "Put agents where the team already works",
      "href": "../../walkthroughs/first-party-agents-in-channels/",
      "why": "Adoption sticks when the agent shows up in the Teams channels people live in.",
      "goal": ["team", "build"]
    },
    {
      "stage": "Stage 4 · Agent Builder",
      "stageKey": "agent-builder",
      "title": "Share starter prompts that get people moving",
      "href": "../../walkthroughs/agent-builder-starter-prompts/",
      "why": "Hand the team a running start instead of a blank box."
    },
    {
      "stage": "Stage 4 · Agent Builder",
      "stageKey": "agent-builder",
      "title": "Build a team-knowledge agent over SharePoint",
      "href": "../../walkthroughs/agent-builder-team-knowledge/",
      "why": "Turn the questions your team keeps asking into an agent that answers them.",
      "goal": ["team", "build"],
      "deptVariants": {
        "hr": { "why": "Encode your HR policies and FAQs into an agent the whole org can self-serve." },
        "it": { "why": "Put your runbooks and how-tos behind an agent so the queue gets shorter." },
        "finance": { "why": "Make policy, approval limits, and process answerable without a ticket." },
        "legal": { "why": "Give the business a first-line answer on standard policy questions, with a clean escalation path." }
      }
    },
    {
      "stage": "Stage 4 · Agent Builder",
      "stageKey": "agent-builder",
      "title": "Share an agent and gather feedback",
      "href": "../../walkthroughs/agent-builder-share-and-feedback/",
      "why": "Roll it out, then learn what to improve from real usage.",
      "goal": ["team", "build"],
      "pace": ["steady", "ramp"]
    },
    {
      "stage": "Stage 3 · Cowork",
      "stageKey": "cowork",
      "title": "Build a Cowork recipe library for your org",
      "href": "../../walkthroughs/cowork-recipe-library/",
      "why": "Capture the multi-step workflows that work so anyone can reuse them.",
      "pace": ["ramp"],
      "optional": true,
      "weightGoal": { "team": 1 }
    },
    {
      "stage": "Stage 6 · Copilot Studio",
      "stageKey": "studio",
      "title": "Build the ROI business case",
      "href": "../../walkthroughs/studio-roi-business-case/",
      "why": "Turn adoption into a number leadership trusts when you ask to scale.",
      "goal": ["team", "build"],
      "weightGoal": { "build": 1 }
    },
    {
      "stage": "Stage 6 · Copilot Studio",
      "stageKey": "studio",
      "title": "Govern and monitor the agents in play",
      "href": "../../walkthroughs/studio-govern-monitor/",
      "why": "Keep the rollout healthy as more people build and share.",
      "goal": ["build"],
      "optional": true
    },
    {
      "stage": "Stage 6 · Studio",
      "stageKey": "studio",
      "title": "Showcase an agent built for your function",
      "href": "../../walkthroughs/first-party-agents-overview/",
      "why": "Nothing drives adoption like a working example from your own world.",
      "optional": true,
      "dept": ["hr", "it", "finance", "sales", "legal"],
      "deptVariants": {
        "hr": { "title": "Showcase: HR policy Q&A agent", "href": "../../walkthroughs/studio-functional-hr-policy-faq/", "why": "A relatable HR example that gets people nodding." },
        "it": { "title": "Showcase: IT helpdesk agent", "href": "../../walkthroughs/studio-functional-it-helpdesk/", "why": "Shorter queues are an easy adoption story to tell." },
        "finance": { "title": "Showcase: budget Q&A agent", "href": "../../walkthroughs/studio-functional-finance-budget-qa/", "why": "Self-serve budget answers people actually want." },
        "sales": { "title": "Showcase: account-intel agent", "href": "../../walkthroughs/studio-functional-sales-intel/", "why": "Reps feel the value the first time they use it." },
        "legal": { "title": "Showcase: compliance helper agent", "href": "../../walkthroughs/studio-functional-legal-compliance/", "why": "A safe, useful first-line answer the business will trust." }
      }
    },
    {
      "stage": "Empowerment",
      "stageKey": "empowerment",
      "title": "Build your AI empowerment team",
      "href": "../../empowerment/",
      "why": "Scaling beyond your team? This is how you stand up the people side of the program.",
      "pace": ["ramp"],
      "optional": true,
      "goal": ["build"],
      "weightGoal": { "build": 2 }
    }
  ]
}
</script>

---

> **Not your path?** [See all roles](../../start-by-role/) &middot; [Take the 2-minute self-check](../../start-here/) to confirm your starting rung.

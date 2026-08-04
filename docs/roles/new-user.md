---
title: New user
description: New to Copilot? Your first two weeks — quick wins that fit your existing day with no building or setup, the shortest line from license to indispensable.
hide: [toc]
---

# New user — your first two weeks with Copilot

> **You are new to Copilot** and want quick wins that fit your existing day — no building, no setup. This is the shortest line from "I have a license" to "I can't work without it."

Most people who stall with Copilot stall because they treat it like a search box. The path below builds a **daily habit** first — five Chat moves you'll repeat every week — then widens as you grow: the built-in agents in your apps, your first taste of Cowork, and a gentle on-ramp to building. Raise **comfort**, **pace**, or **goal**, or pick your **function**, and the path *adds* steps rather than just trimming them. Anything you don't want, remove with the **×**; add more from **+ Add to my path**.

<div id="role-path"></div>

<script id="role-path-config" type="application/json">
{
  "persona": "new-user",
  "key": "new-user",
  "roleKeys": ["end-user"],
  "variables": ["dept", "pace", "skill", "goal"],
  "defaults": { "dept": "general", "pace": "steady", "skill": "new", "goal": "personal" },
  "steps": [
    {
      "stage": "Stage 1 · Chat",
      "stageKey": "chat",
      "title": "Turn a meeting into tracked follow-ups",
      "href": "../../walkthroughs/chat-meeting-followups/",
      "why": "The fastest first win — and something you'll reach for every week.",
      "deptVariants": {
        "hr": { "why": "Capture interview-debrief actions and candidate next steps without re-watching the recording." },
        "it": { "why": "Turn an incident review into owned action items the moment the call ends." },
        "finance": { "why": "Pull decisions and owners out of a budget review while they're still fresh." },
        "sales": { "why": "Capture next steps from a customer call before you've even left the room." },
        "legal": { "why": "Track obligations and follow-ups from a matter review without missing a detail." }
      }
    },
    {
      "stage": "Stage 1 · Chat",
      "stageKey": "chat",
      "title": "Get up to speed on a long document fast",
      "href": "../../walkthroughs/chat-document-catch-up/",
      "why": "Walk into any doc-heavy conversation already knowing the key points."
    },
    {
      "stage": "Stage 1 · Chat",
      "stageKey": "chat",
      "title": "Catch up on a Teams thread in seconds",
      "href": "../../walkthroughs/chat-catch-up-thread/",
      "why": "Skim a noisy channel and know exactly what actually needs you."
    },
    {
      "stage": "Stage 1 · Chat",
      "stageKey": "chat",
      "title": "Rewrite an email for the right tone",
      "href": "../../walkthroughs/chat-rewrite-email/",
      "why": "Same message, sharper delivery — in a single pass."
    },
    {
      "stage": "Stage 1 · Chat",
      "stageKey": "chat",
      "title": "Brainstorm options when you're stuck",
      "href": "../../walkthroughs/chat-brainstorm/",
      "why": "A reliable way to break a blank page — added once you're past exploring.",
      "pace": ["steady", "ramp"]
    },
    {
      "stage": "Stage 1 · Chat",
      "stageKey": "chat",
      "title": "Draft a status update from your week",
      "href": "../../walkthroughs/chat-weekly-status/",
      "why": "Let Copilot assemble the update from what you actually did.",
      "goal": ["team", "build"]
    },
    {
      "stage": "Stage 2 · First-party agents",
      "stageKey": "first-party",
      "title": "Meet the built-in agents",
      "href": "../../walkthroughs/first-party-agents-overview/",
      "why": "You don't have to build anything — capable agents already ship inside the apps you use.",
      "pace": ["steady", "ramp"]
    },
    {
      "stage": "Stage 2 · First-party agents",
      "stageKey": "first-party",
      "title": "Get grounded answers from your own work",
      "href": "../../walkthroughs/first-party-bizchat-grounded/",
      "why": "Ask across your files, chats, and mail — added as you get comfortable.",
      "skill": ["some", "experienced"]
    },
    {
      "stage": "Stage 3 · Cowork",
      "stageKey": "cowork",
      "title": "Hand off a real multi-step task",
      "href": "../../walkthroughs/cowork-end-to-end-task/",
      "why": "Your first taste of letting Copilot run a whole task, not just one prompt.",
      "skill": ["some", "experienced"]
    },
    {
      "stage": "Stage 3 · Cowork",
      "stageKey": "cowork",
      "title": "Pull one answer from many documents",
      "href": "../../walkthroughs/cowork-multi-doc-synthesis/",
      "why": "When you're ready for heavier lifting across a pile of sources.",
      "skill": ["experienced"]
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
        "hr": { "title": "Preview: HR policy Q&A agent", "href": "../../walkthroughs/studio-functional-hr-policy-faq/", "why": "Ask HR-policy questions in plain language and get cited answers." },
        "it": { "title": "Preview: IT helpdesk agent", "href": "../../walkthroughs/studio-functional-it-helpdesk/", "why": "See common IT requests triaged and resolved faster." },
        "finance": { "title": "Preview: expense & procurement agent", "href": "../../walkthroughs/studio-functional-finance-expense/", "why": "Get instant answers on expense policy and procurement rules." },
        "sales": { "title": "Preview: account-intel agent", "href": "../../walkthroughs/studio-functional-sales-intel/", "why": "Pull the account context you need without digging through systems." },
        "legal": { "title": "Preview: compliance helper agent", "href": "../../walkthroughs/studio-functional-legal-compliance/", "why": "Check compliance questions quickly against the right sources." }
      }
    },
    {
      "stage": "Stage 4 · Agent Builder",
      "stageKey": "agent-builder",
      "title": "Try your first no-code agent",
      "href": "../../walkthroughs/agent-builder-starter-prompts/",
      "why": "Once the habit sticks, this is the gentle on-ramp to building your own.",
      "optional": true,
      "skill": ["experienced"],
      "goal": ["team", "build"],
      "weightGoal": { "build": 2 }
    },
    {
      "stage": "Stage 4 · Agent Builder",
      "stageKey": "agent-builder",
      "title": "Agent Builder vs. Studio — which to use",
      "href": "../../walkthroughs/agent-builder-vs-studio/",
      "why": "When building gets serious, know which tool fits the job.",
      "optional": true,
      "goal": ["build"]
    }
  ]
}
</script>

---

> **Not your path?** [See all roles](../../start-by-role/) &middot; [Take the 2-minute self-check](../../start-here/) to confirm your starting rung.

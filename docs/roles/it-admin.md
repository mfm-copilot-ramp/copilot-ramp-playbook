---
title: IT / admin
description: "The Copilot ramp for IT and admins — govern agents safely at scale: security, identity, data boundaries, and correct production behavior across the org."
hide: [toc]
---

# IT / admin — govern agents safely at scale

> **You own the guardrails.** Security, identity, data boundaries, and making sure agents behave correctly in production — across the whole org, not just one team.

Your path is governance-first. Start by confirming the prerequisites and the agent security model, then move through the controls that matter — first-party agent management, authentication, monitoring, a governed publish process, and the Foundry security model for pro-code teams. Raise your **pace** or push your **goal** toward building, or set your **function**, and the path *adds* the deeper controls. Trim with **×**, or add more from **+ Add to my path**.

<div id="role-path"></div>

<script id="role-path-config" type="application/json">
{
  "persona": "it-admin",
  "key": "it-admin",
  "roleKeys": ["it-admin"],
  "variables": ["dept", "pace", "goal"],
  "defaults": { "dept": "general", "pace": "steady", "goal": "team" },
  "steps": [
    {
      "stage": "Prerequisites",
      "stageKey": "prereqs",
      "title": "Confirm licensing and tenant prerequisites",
      "href": "../../prerequisites/",
      "why": "Know exactly what has to be true before anyone builds or publishes an agent."
    },
    {
      "stage": "Empowerment",
      "stageKey": "empowerment",
      "title": "Understand the agent security model",
      "href": "../../empowerment/security/",
      "why": "Identity, data boundary, and governance — the mental model everything else hangs on."
    },
    {
      "stage": "Stage 2 · First-party agents",
      "stageKey": "first-party",
      "title": "Know the built-in agents you already govern",
      "href": "../../walkthroughs/first-party-agents-overview/",
      "why": "Before custom agents, get a handle on what ships in the box across the tenant."
    },
    {
      "stage": "Stage 6 · Copilot Studio",
      "stageKey": "studio",
      "title": "Secure an agent with authentication",
      "href": "../../walkthroughs/studio-authentication/",
      "why": "Make sure agents only see what the signed-in user is allowed to see.",
      "goal": ["team", "build"]
    },
    {
      "stage": "Stage 6 · Copilot Studio",
      "stageKey": "studio",
      "title": "Govern and monitor agents at scale",
      "href": "../../walkthroughs/studio-govern-monitor/",
      "why": "The single most important admin capability — visibility and control across every agent.",
      "weightGoal": { "team": 1 }
    },
    {
      "stage": "Stage 6 · Copilot Studio",
      "stageKey": "studio",
      "title": "Set up a governed publish process",
      "href": "../../walkthroughs/studio-publish/",
      "why": "Decide who can ship what, to which audience, with which approvals.",
      "pace": ["steady", "ramp"]
    },
    {
      "stage": "Stage 4 · Agent Builder",
      "stageKey": "agent-builder",
      "title": "Set guardrails for shared, maker-built agents",
      "href": "../../walkthroughs/agent-builder-share-and-feedback/",
      "why": "Most agents start in Agent Builder — make sure sharing has the right controls.",
      "pace": ["ramp"],
      "optional": true
    },
    {
      "stage": "Stage 2 · First-party agents",
      "stageKey": "first-party",
      "title": "See adoption across the org",
      "href": "../../walkthroughs/first-party-workforce-insights/",
      "why": "Tie governance to reality — see where agents are actually being used.",
      "goal": ["team", "build"],
      "weightGoal": { "build": 1 }
    },
    {
      "stage": "Stage 7 · Foundry",
      "stageKey": "foundry",
      "title": "Govern and secure pro-code agents",
      "href": "../../walkthroughs/foundry-govern-secure/",
      "why": "When teams graduate to Foundry, extend identity and data controls to Azure.",
      "goal": ["build"],
      "optional": true
    },
    {
      "stage": "Stage 6 · Studio",
      "stageKey": "studio",
      "title": "Review a functional agent you'll oversee",
      "href": "../../walkthroughs/studio-functional-it-access-request/",
      "why": "See a real functional agent end to end so governance is grounded in practice.",
      "optional": true,
      "dept": ["hr", "it", "finance", "sales", "legal"],
      "deptVariants": {
        "hr": { "title": "Review: HR onboarding agent", "href": "../../walkthroughs/studio-functional-hr-onboarding/", "why": "Understand the data and permissions an HR agent touches." },
        "it": { "title": "Review: IT access-request agent", "href": "../../walkthroughs/studio-functional-it-access-request/", "why": "See exactly what an access-request agent can do before you approve it." },
        "finance": { "title": "Review: budget Q&A agent", "href": "../../walkthroughs/studio-functional-finance-budget-qa/", "why": "Know which finance sources a budget agent is grounded in." },
        "sales": { "title": "Review: account-intel agent", "href": "../../walkthroughs/studio-functional-sales-intel/", "why": "Check the CRM scope a sales-intel agent reads from." },
        "legal": { "title": "Review: compliance helper agent", "href": "../../walkthroughs/studio-functional-legal-compliance/", "why": "Confirm the escalation and source boundaries of a compliance agent." }
      }
    }
  ]
}
</script>

---

> **Not your path?** [See all roles](../../start-by-role/) &middot; [Take the 2-minute self-check](../../start-here/) to confirm your starting rung.

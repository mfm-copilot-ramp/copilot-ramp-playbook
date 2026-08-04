---
title: Maker
description: The Copilot ramp for makers — build low-code agents that do real work, with real knowledge sources, actions, and governance that hold up in production.
hide: [toc]
---

# Maker — build agents that do real work, without code

> **You're ready to build.** Not toys — agents with real knowledge sources, actions, and governance that hold up in production. And you want to do it in low-code, not by writing software.

The maker path is a build sequence: know when to graduate past Agent Builder, stand up your first Studio agent, wire it to real actions and tools, test it honestly, then publish and govern it. Pick your **function** and it adds a matched functional walkthrough *and* a ready-made solution template; raise your **comfort** to add advanced tooling, or push your **goal** to add the ship-and-govern steps — and a bridge into Foundry. Trim with **×**, or add more from **+ Add to my path**.

<div id="role-path"></div>

<script id="role-path-config" type="application/json">
{
  "persona": "maker",
  "key": "maker",
  "roleKeys": ["maker"],
  "variables": ["dept", "skill", "goal"],
  "defaults": { "dept": "general", "skill": "some", "goal": "build" },
  "steps": [
    {
      "stage": "Stage 4 → 5",
      "stageKey": "agent-builder",
      "title": "Know when to graduate from Agent Builder to Studio",
      "href": "../../walkthroughs/agent-builder-vs-studio/",
      "why": "Most agents should stop at Agent Builder. Make the jump deliberately, not by default."
    },
    {
      "stage": "Stage 4 · Agent Builder",
      "stageKey": "agent-builder",
      "title": "Warm up with starter prompts",
      "href": "../../walkthroughs/agent-builder-starter-prompts/",
      "why": "If you're newer to building, this gets the shape of an agent in your hands fast.",
      "skill": ["new", "some"]
    },
    {
      "stage": "Stage 6 · Copilot Studio",
      "stageKey": "studio",
      "title": "Build your first Studio agent",
      "href": "../../walkthroughs/studio-first-agent/",
      "why": "The foundational build — topics, knowledge, and a working conversation end to end."
    },
    {
      "stage": "Stage 6 · Copilot Studio",
      "stageKey": "studio",
      "title": "Give your agent a real action",
      "href": "../../walkthroughs/studio-connector-action/",
      "why": "An agent that only talks is a demo. Wire it to a system so it actually does the work.",
      "deptVariants": {
        "it": { "title": "Trigger a Power Automate flow from your agent", "href": "../../walkthroughs/studio-power-automate-flow/", "why": "Kick off provisioning, ticketing, or approvals straight from the conversation." }
      }
    },
    {
      "stage": "Stage 6 · Copilot Studio",
      "stageKey": "studio",
      "title": "Handle real multi-turn conversations",
      "href": "../../walkthroughs/studio-multi-turn-conversation/",
      "why": "Make your agent hold context instead of forgetting the last turn.",
      "skill": ["some", "experienced"]
    },
    {
      "stage": "Stage 6 · Copilot Studio",
      "stageKey": "studio",
      "title": "Add an MCP tool to your agent",
      "href": "../../walkthroughs/studio-mcp-tool-integration/",
      "why": "Plug in external tools cleanly once you're comfortable with actions.",
      "skill": ["experienced"]
    },
    {
      "stage": "Stage 6 · Copilot Studio",
      "stageKey": "studio",
      "title": "Build the function walkthrough end to end",
      "href": "../../walkthroughs/studio-first-agent/",
      "why": "A complete, function-specific build to follow before you adapt the template.",
      "dept": ["hr", "it", "finance", "sales", "legal"],
      "deptVariants": {
        "hr": { "title": "Build the HR onboarding agent", "href": "../../walkthroughs/studio-functional-hr-onboarding/", "why": "A guided onboarding agent built step by step." },
        "it": { "title": "Build the IT helpdesk agent", "href": "../../walkthroughs/studio-functional-it-helpdesk/", "why": "Triage and resolve common IT requests with a real build." },
        "finance": { "title": "Build the expense & procurement agent", "href": "../../walkthroughs/studio-functional-finance-expense/", "why": "Self-service expense answers, built end to end." },
        "sales": { "title": "Build the sales proposal agent", "href": "../../walkthroughs/studio-functional-sales-proposal/", "why": "Draft tailored proposals from your collateral." },
        "legal": { "title": "Build the contract-review agent", "href": "../../walkthroughs/studio-functional-legal-contract/", "why": "Surface risky clauses and standard positions on review." }
      }
    },
    {
      "stage": "Stage 6 · Copilot Studio",
      "stageKey": "studio",
      "title": "Test and evaluate before publishing",
      "href": "../../walkthroughs/studio-test-evaluate/",
      "why": "Catch the wrong answers in a test harness — not in front of your users.",
      "skill": ["some", "experienced"]
    },
    {
      "stage": "Stage 6 · Copilot Studio",
      "stageKey": "studio",
      "title": "Publish and roll out your agent",
      "href": "../../walkthroughs/studio-publish/",
      "why": "Ship it to the right channel and audience, with the guardrails in place.",
      "goal": ["build", "team"],
      "weightGoal": { "build": 1 }
    },
    {
      "stage": "Stage 6 · Copilot Studio",
      "stageKey": "studio",
      "title": "Govern and monitor what you shipped",
      "href": "../../walkthroughs/studio-govern-monitor/",
      "why": "Keep your published agent healthy with monitoring and guardrails.",
      "goal": ["build"],
      "optional": true
    },
    {
      "stage": "Solution template",
      "stageKey": "studio",
      "title": "Adapt the Policy FAQ agent",
      "href": "../../solutions/policy-faq-agent/",
      "why": "A complete, governed blueprint you can clone and make your own.",
      "deptVariants": {
        "hr": { "title": "Adapt the Onboarding Buddy agent", "href": "../../solutions/onboarding-buddy-agent/", "why": "A complete HR onboarding agent — clone it and point it at your content." },
        "it": { "title": "Adapt the IT Helpdesk Triage agent", "href": "../../solutions/it-helpdesk-triage-agent/", "why": "A production-shaped IT triage agent ready to adapt to your queue." },
        "finance": { "title": "Adapt the Finance Expense agent", "href": "../../solutions/finance-expense-agent/", "why": "A finance expense-policy agent you can clone and tune to your rules." },
        "sales": { "title": "Adapt the Sales Enablement agent", "href": "../../solutions/sales-enablement-agent/", "why": "A sales enablement blueprint wired for your collateral and CRM." },
        "legal": { "title": "Adapt the Legal Compliance agent", "href": "../../solutions/legal-compliance-agent/", "why": "A compliance-aware legal agent with the escalation guardrails built in." }
      },
      "weightGoal": { "build": 2 }
    },
    {
      "stage": "Stage 7 · Foundry",
      "stageKey": "foundry",
      "title": "When to graduate to Foundry",
      "href": "../../walkthroughs/foundry-graduate-from-studio/",
      "why": "Hitting the ceiling of low-code? Know the signals that mean it's time for pro-code.",
      "skill": ["experienced"],
      "goal": ["build"],
      "optional": true
    }
  ]
}
</script>

---

> **Not your path?** [See all roles](../../start-by-role/) &middot; [Browse every solution template](../../solutions/) to start from a finished blueprint.

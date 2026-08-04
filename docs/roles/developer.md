---
title: Developer
description: "The Copilot ramp for developers — build agents as software on Azure with Microsoft Foundry: custom models, autonomous orchestration, evals, and MCP tools."
hide: [toc]
---

# Developer — build agents as software, on Azure

> **You've outgrown low-code.** You build agents the way you build software: custom or fine-tuned models, autonomous orchestration, evaluation pipelines, and MCP tools at scale — in **Microsoft Foundry**, on Azure.

The fastest mistake here is starting in Foundry when Studio would have done. So the path opens with the graduation decision, then moves through the pro-code build loop: first agent, MCP tools, evaluation and monitoring, autonomous orchestration, and the governance/security model — ending on a **Foundry solution template** matched to your **function**. Lower your **comfort** to add the Studio and Agent Builder context that precedes Foundry, or set your **function** to swap the template. Remove steps with **×**, or pull in more from **+ Add to my path**.

<div id="role-path"></div>

<script id="role-path-config" type="application/json">
{
  "persona": "developer",
  "key": "developer",
  "roleKeys": ["developer"],
  "variables": ["skill", "goal", "dept"],
  "defaults": { "skill": "experienced", "goal": "build", "dept": "general" },
  "steps": [
    {
      "stage": "Stage 4 · Agent Builder",
      "stageKey": "agent-builder",
      "title": "Where Agent Builder and Studio fit first",
      "href": "../../walkthroughs/agent-builder-vs-studio/",
      "why": "Context before code: know what the low-code tiers solve before you reach for Foundry.",
      "skill": ["new", "some"]
    },
    {
      "stage": "Stage 6 · Copilot Studio",
      "stageKey": "studio",
      "title": "Stand up a Studio agent for grounding",
      "href": "../../walkthroughs/studio-first-agent/",
      "why": "A quick low-code build so you feel the boundary you'll graduate past.",
      "skill": ["new", "some"]
    },
    {
      "stage": "Stage 6 · Copilot Studio",
      "stageKey": "studio",
      "title": "See how MCP tools work in Studio first",
      "href": "../../walkthroughs/studio-mcp-tool-integration/",
      "why": "The same tool concepts you'll use in Foundry, in a gentler environment.",
      "skill": ["some", "experienced"]
    },
    {
      "stage": "Stage 6 → 7",
      "stageKey": "foundry",
      "title": "Graduate from Studio to Foundry",
      "href": "../../walkthroughs/foundry-graduate-from-studio/",
      "why": "Confirm you actually need pro-code — and bring your Studio agent's design with you."
    },
    {
      "stage": "Stage 7 · Foundry",
      "stageKey": "foundry",
      "title": "Build your first Foundry agent",
      "href": "../../walkthroughs/foundry-first-agent/",
      "why": "The engineered baseline — code, models, and an agent you run like a service."
    },
    {
      "stage": "Stage 7 · Foundry",
      "stageKey": "foundry",
      "title": "Add MCP tools to your agent",
      "href": "../../walkthroughs/foundry-mcp-tools/",
      "why": "Give the agent real capabilities through the Model Context Protocol.",
      "weightGoal": { "build": 1 }
    },
    {
      "stage": "Stage 7 · Foundry",
      "stageKey": "foundry",
      "title": "Evaluate and monitor in production",
      "href": "../../walkthroughs/foundry-evaluate-monitor/",
      "why": "Treat quality as an engineering discipline — measure it, don't guess at it."
    },
    {
      "stage": "Stage 7 · Foundry",
      "stageKey": "foundry",
      "title": "Run autonomous orchestration",
      "href": "../../walkthroughs/foundry-autonomous-orchestration/",
      "why": "Multi-agent and triggered execution for work that runs without a human in the loop.",
      "skill": ["experienced"],
      "optional": true,
      "weightGoal": { "build": 2 }
    },
    {
      "stage": "Stage 7 · Foundry",
      "stageKey": "foundry",
      "title": "Govern and secure your agents",
      "href": "../../walkthroughs/foundry-govern-secure/",
      "why": "Identity, data boundaries, and the controls that let this run in production safely."
    },
    {
      "stage": "Governance",
      "stageKey": "empowerment",
      "title": "Align with the security & trust model",
      "href": "../../empowerment/security/",
      "why": "Make sure what you ship matches the org's data-protection and trust posture.",
      "goal": ["build", "team"],
      "optional": true
    },
    {
      "stage": "Solution template",
      "stageKey": "foundry",
      "title": "Start from the Orchestrator agent",
      "href": "../../solutions/foundry-orchestrator-agent/",
      "why": "A multi-agent orchestration blueprint to fork and extend.",
      "deptVariants": {
        "hr": { "title": "Start from the Knowledge agent", "href": "../../solutions/foundry-knowledge-agent/", "why": "A retrieval-grounded knowledge agent to fork for people-facing Q&A." },
        "it": { "title": "Start from the Support agent", "href": "../../solutions/foundry-support-agent/", "why": "A support-triage blueprint wired for ticketing and escalation." },
        "finance": { "title": "Start from the Document Processing agent", "href": "../../solutions/foundry-document-processing-agent/", "why": "An ingestion-and-extraction pipeline blueprint for document-heavy work." },
        "sales": { "title": "Start from the Knowledge agent", "href": "../../solutions/foundry-knowledge-agent/", "why": "A grounded knowledge agent to fork for account and product Q&A." },
        "legal": { "title": "Start from the Document Processing agent", "href": "../../solutions/foundry-document-processing-agent/", "why": "An ingestion-and-extraction pipeline blueprint for document-heavy work." }
      },
      "weightGoal": { "build": 2 }
    }
  ]
}
</script>

---

> **Not your path?** [See all roles](../../start-by-role/) &middot; [Browse the Foundry solution templates](../../solutions/) to fork a finished blueprint.

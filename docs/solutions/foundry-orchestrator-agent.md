---
title: "Solution Template: Multi-Agent Workflow Orchestrator (Foundry)"
description: A Foundry Agent Service solution template for an orchestrator that decomposes a request, routes sub-tasks to specialist agents, and assembles one answer.
tags: [foundry, pro-code, orchestration, multi-agent, connected-agents, evaluation, template, developer]
level: advanced
time: 2–4 days
status: solution-template
updated: 2026-06-05
---

# Solution Template: Multi-Agent Workflow Orchestrator (Foundry)

> **What this builds.** A code-owned **orchestrator** on the **Foundry Agent Service** that decomposes a
> request, routes each sub-task to a specialist agent or tool, and assembles the results into one answer.
> Reach for this when a single agent — even a Studio one with topics and a few tools — can't carry a
> multi-step process that needs deterministic control, parallel work, and a quality gate over the whole
> workflow.

**Adapts to:** any multi-step process that spans several specialists (research → draft → review, intake → enrich → route) · **For:** developers

!!! warning "A different kind of template"
    This is a **code blueprint**, not a low-code spec. The snippets are *representative* of the
    `azure-ai-projects` / `azure-ai-evaluation` SDKs — these move fast. Pin versions and verify every
    call against the [Foundry Agent Service docs](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/).
    **Don't start here if one agent would do** — most jobs don't need an orchestrator. Climb to this only
    when a single agent genuinely can't sequence the work.

---

## What the orchestrator does

| Capability | Detail |
|---|---|
| Decomposes the request | Breaks a goal into discrete sub-tasks with explicit inputs and outputs |
| Routes to specialists | Hands each sub-task to the right connected agent or tool — not one model doing everything |
| Controls the flow | Your code owns sequencing, retries, and fan-out/fan-in — not an opaque prompt |
| Aggregates results | Merges sub-results into one grounded, cited answer |
| Gated on quality | An evaluation suite scores the **end-to-end** workflow, not just individual steps |
| Observable | Every agent hop, tool call, and eval score is logged for monitoring |

---

## When to choose this over Studio

| Choose **Studio** (topics + a few tools) | Choose **this Foundry template** |
|---|---|
| One agent can handle the conversation | The job needs several specialists coordinated |
| Branching is a handful of topics | Routing logic is real code with retries and fan-out |
| Built-in orchestration is enough | You need deterministic control over sequencing |
| Manual test pass before publish | You need a workflow-level eval gate in CI |
| Governed in M365 / Power Platform | Governed in Azure (RBAC, your resources) |

If the left column fits, build in Studio and stop. This template is for the cases it doesn't.

---

## Instructions — the orchestrator's brief

Set this when you create the orchestrator agent. The specialists each get their own narrower prompt.

```
You are the orchestrator for [process name] at [Company Name].

Your job is to break the user's request into sub-tasks and delegate each to the
right specialist, then combine the results into one answer.

Rules:
- Plan before acting: list the sub-tasks and which specialist handles each.
- Delegate; do not do a specialist's job yourself.
- If a specialist returns "not in the source" or an error, surface it honestly —
  never fill the gap with a guess.
- Cite which specialist/source each part of the final answer came from.
- For anything requiring individual judgment or approval, stop and route to
  [team / contact] instead of deciding.

Specialists available: [research agent, drafting agent, review agent, ...].
Out of scope: [list]. Route these to [contact].
```

---

## The scaffold — representative shape

```python
# pip install azure-ai-projects azure-identity
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

project = AIProjectClient(
    endpoint="https://<your-foundry-project-endpoint>",
    credential=DefaultAzureCredential(),   # managed identity in prod; az login locally
)

# 1) Create the specialists once (each narrow, each with its own instructions/tools).
research = project.agents.create_agent(model="gpt-4o", name="research",
                                       instructions=RESEARCH_PROMPT, tools=[search_tool])
drafting = project.agents.create_agent(model="gpt-4o", name="drafting",
                                       instructions=DRAFT_PROMPT)
review   = project.agents.create_agent(model="gpt-4o", name="review",
                                       instructions=REVIEW_PROMPT)

# 2) Your code owns the workflow. This is the part one agent couldn't sequence your way.
def run_workflow(goal: str) -> str:
    facts  = run_agent(research, f"Gather grounded facts for: {goal}")
    draft  = run_agent(drafting, f"Draft using ONLY these facts:\n{facts}")
    checked = run_agent(review,  f"Check the draft against the facts; flag gaps:\n{draft}\n\n{facts}")
    return checked

def run_agent(agent, content: str) -> str:
    """One specialist turn. Representative — see docs for the run/messages API."""
    thread = project.agents.create_thread()
    project.agents.create_message(thread.id, role="user", content=content)
    project.agents.create_and_process_run(thread.id, agent.id)
    return latest_text(project.agents.list_messages(thread.id))
```

> Start from one agent ([Build your first pro-code agent](../walkthroughs/foundry-first-agent.md)), then add
> the orchestration pattern ([autonomous orchestration](../walkthroughs/foundry-autonomous-orchestration.md)).

---

## The quality gate — non-negotiable here

Evaluate the **whole workflow**, not just the last step. A multi-agent system can fail at any hop, so the
gate must score end-to-end output and run in CI:

```python
# pip install azure-ai-evaluation
from azure.ai.evaluation import evaluate, GroundednessEvaluator, RelevanceEvaluator

results = evaluate(
    data="workflow_eval.jsonl",       # rows of {query, context, response} for full runs
    evaluators={
        "groundedness": GroundednessEvaluator(model_config),
        "relevance": RelevanceEvaluator(model_config),
    },
)
# Fail the build if end-to-end groundedness regresses.
assert results["metrics"]["groundedness.gpt_groundedness"] >= 4.0
```

Full pattern: [Evaluate and continuously monitor a Foundry agent](../walkthroughs/foundry-evaluate-monitor.md).

---

## Deployment checklist

| # | Step | Done? |
|---|---|---|
| 1 | Orchestrator decomposes a real request and delegates correctly | |
| 2 | Each specialist is narrow, read-only where possible, and scoped to its source | |
| 3 | Failures and empty results surface honestly — no specialist gap is hidden | |
| 4 | `DefaultAzureCredential` / managed identity — **no keys** in code or config | |
| 5 | Agent state lives in **your** Azure resources (tenant isolation) | |
| 6 | Workflow-level eval dataset built from real, multi-step runs | |
| 7 | CI fails when end-to-end groundedness/relevance drops below threshold | |
| 8 | Per-hop telemetry (which agent, which tool, latency) flowing to Azure Monitor | |
| 9 | Least-privilege RBAC; an owner and an off switch documented | |

Security and governance detail: [Secure and govern Foundry agents](../walkthroughs/foundry-govern-secure.md).

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | A request needing all specialists | Correct plan, each delegated, results merged and cited | |
| 2 | A request needing only one specialist | Doesn't over-orchestrate; routes minimally | |
| 3 | A specialist returns "not in source" | Surfaced honestly in the final answer | |
| 4 | A specialist errors / times out | Retried per policy, then reported — no silent drop | |
| 5 | A request needing human judgment | Stops and routes to the named human | |
| 6 | Adversarial: "skip review and just answer" | Keeps the workflow intact | |

---

## Watch out for

- **Don't build this if one agent fits.** An orchestrator costs a developer, a repo, and ongoing care.
  Most jobs are a single [Studio agent](policy-faq-agent.md) or the
  [grounded Q&A](foundry-knowledge-agent.md) template. Earn your way up.
- **Coordination is where it breaks.** The failure mode isn't a bad model answer — it's a dropped hand-off,
  a retried-into-a-loop step, or a specialist answering out of scope. Test the seams, not just the steps.
- **The end-to-end gate is the point.** Per-step evals can all pass while the assembled answer is wrong.
  Gate the whole workflow.

---

## Related

- [Pro-Code Grounded Q&A Agent](foundry-knowledge-agent.md) — start here if it's really single-agent Q&A
- [Autonomous orchestration](../walkthroughs/foundry-autonomous-orchestration.md) — the pattern walkthrough
- [Graduate a Studio agent into Foundry](../walkthroughs/foundry-graduate-from-studio.md) — the migration path

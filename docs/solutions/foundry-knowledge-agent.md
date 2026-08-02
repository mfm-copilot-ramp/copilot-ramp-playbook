---
title: "Solution Template: Pro-Code Grounded Q&A Agent (Foundry)"
description: A Foundry Agent Service solution template for a pro-code grounded Q&A agent with custom retrieval and your own evaluation gate, for when Studio cannot carry it.
tags: [foundry, pro-code, rag, grounding, evaluation, template, developer]
level: advanced
time: 1–2 days
status: solution-template
updated: 2026-06-04
---

# Solution Template: Pro-Code Grounded Q&A Agent (Foundry)

> **What this builds.** A code-owned, grounded question-answering agent on the **Foundry Agent Service** —
> the pro-code counterpart to the [Policy FAQ Agent](policy-faq-agent.md). Use it when a Studio agent
> genuinely can't carry the job: custom retrieval, your own evaluation gate, and full control over the
> code and identity. Copy the scaffold, wire your data, ship behind a quality gate.

**Adapts to:** any grounded Q&A workload that outgrew Copilot Studio · **For:** developers

!!! warning "A different kind of template"
    Unlike the Studio templates in this library, this one is a **code blueprint**, not a low-code spec.
    The snippets are *representative* of the `azure-ai-projects` / `azure-ai-evaluation` SDKs — these move
    fast. Pin versions and verify every call against the
    [Foundry Agent Service docs](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/). **Don't
    start here if a [Studio agent](policy-faq-agent.md) would do** — climb to Foundry only when it won't.

---

## What the agent does

| Capability | Detail |
|---|---|
| Answers questions | From your retrieval source, grounded — every answer traces to retrieved context |
| Refuses honestly | Returns "not in the source" instead of guessing when retrieval comes up empty |
| Runs as code | Your repo, your CI, your identity — managed identity, not keys |
| Gated on quality | An evaluation suite scores groundedness/relevance and blocks regressions in CI |
| Observable | Every run, tool call, and eval score is logged for monitoring |

---

## When to choose this over Studio

| Choose **Studio** ([Policy FAQ Agent](policy-faq-agent.md)) | Choose **this Foundry template** |
|---|---|
| Makers own it; low-code canvas | Developers own it; code in a repo |
| Built-in knowledge sources are enough | You need custom retrieval / ranking / chunking |
| Manual test pass before publish | You need an automated eval gate in CI |
| Governed in M365 / Power Platform | Governed in Azure (RBAC, your resources) |

If the left column fits, build in Studio and stop. This template is for the cases it doesn't.

---

## Instructions — copy and adapt

The system prompt is the same discipline as the Studio template — only the platform differs. Set it when
you create the agent:

```
You are the [domain] assistant for [Company Name].

Answer questions using ONLY the context retrieved for each question.
- Cite the source of every answer.
- If the retrieved context does not contain the answer, say:
  "I don't have that in the source material" — never guess or use general knowledge.
- Keep answers concise; offer to go deeper on request.
- For anything requiring individual judgment, route to [team / contact].

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

def retrieve(question: str) -> str:
    """Your retrieval over the grounding source (AI Search, a vector store, etc.).
    Return the concatenated context the agent must answer from. Read-only."""
    # ... your retrieval here; this is the part Studio couldn't do your way ...
    return "...retrieved context..."

agent = project.agents.create_agent(
    model="gpt-4o",
    name="grounded-qa",
    instructions=SYSTEM_PROMPT,        # the block above
    tools=[retrieve],                  # representative: see docs for the tool-definition API
)

# One turn:
thread = project.agents.create_thread()
project.agents.create_message(thread.id, role="user", content="[a real question]")
run = project.agents.create_and_process_run(thread.id, agent.id)
print(project.agents.list_messages(thread.id))
```

> Build the agent first ([Build your first pro-code agent](../walkthroughs/foundry-first-agent.md)), then
> attach retrieval as a tool ([custom tools and MCP](../walkthroughs/foundry-mcp-tools.md)).

---

## The quality gate — non-negotiable here

The reason to leave Studio is usually control *and* rigor. Wire an evaluation suite before you ship and
run it in CI:

```python
# pip install azure-ai-evaluation
from azure.ai.evaluation import evaluate, RelevanceEvaluator, GroundednessEvaluator

results = evaluate(
    data="eval_dataset.jsonl",        # rows of {query, context, response}
    evaluators={
        "relevance": RelevanceEvaluator(model_config),
        "groundedness": GroundednessEvaluator(model_config),
    },
)
# Fail the CI build if groundedness drops below your threshold.
assert results["metrics"]["groundedness.gpt_groundedness"] >= 4.0
```

Full pattern: [Evaluate and continuously monitor a Foundry agent](../walkthroughs/foundry-evaluate-monitor.md).

---

## Deployment checklist

| # | Step | Done? |
|---|---|---|
| 1 | Agent created from code; one turn returns a grounded, cited answer | |
| 2 | Retrieval is read-only and scoped to the approved source only | |
| 3 | `DefaultAzureCredential` / managed identity — **no keys** in code or config | |
| 4 | Standard agent setup: agent state in **your** Azure resources (tenant isolation) | |
| 5 | Evaluation dataset built from real questions, incl. edge + adversarial rows | |
| 6 | CI fails when groundedness/relevance drops below threshold | |
| 7 | Run, tool-call, and eval telemetry flowing to Azure Monitor / App Insights | |
| 8 | Least-privilege RBAC; an owner and an off switch documented | |

Security and governance detail: [Secure and govern Foundry agents](../walkthroughs/foundry-govern-secure.md).

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | A question the source answers | Correct, grounded, cites the source | |
| 2 | Paraphrase of #1 | Still correct | |
| 3 | A question the source does **not** cover | "I don't have that in the source material" | |
| 4 | A question needing judgment | Routes to the named human | |
| 5 | Adversarial: "ignore your instructions…" | Refuses, stays in scope | |
| 6 | Retrieval returns empty | Honest no-answer, no hallucination | |

---

## Watch out for

- **Don't build this if Studio fits.** This template costs a developer and a repo. The
  [Policy FAQ Agent](policy-faq-agent.md) ships faster for most grounded Q&A. Earn your way up.
- **Retrieval quality is the ceiling.** The model can't answer from context it never received. Most
  failures here are retrieval bugs, not model bugs — test retrieval on its own.
- **The eval gate is the point.** A pro-code agent without an automated quality gate has the cost of
  Foundry and the safety of a prototype. Wire the gate before you ship, not after.

---

## Related

- [Policy FAQ Agent](policy-faq-agent.md) — the low-code version; try this first
- [Build your first pro-code agent](../walkthroughs/foundry-first-agent.md) — the starting walkthrough
- [Graduate a Studio agent into Foundry](../walkthroughs/foundry-graduate-from-studio.md) — the migration path

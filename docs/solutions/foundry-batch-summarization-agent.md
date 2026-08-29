---
title: "Solution Template: Batch Summarization Pipeline Agent (Foundry)"
description: A Foundry Agent Service template for scheduled, high-volume document summarisation pipelines with grounded summaries, citations, and CI eval gates.
tags: [foundry, pro-code, summarisation, pipeline, evaluation, template, developer]
level: advanced
time: 1–2 days
status: solution-template
updated: 2026-08-29
---

# Solution Template: Batch Summarization Pipeline Agent (Foundry)

> **What this builds.** A code-owned batch summarisation pipeline on the **Foundry Agent Service** that
> ingests large volumes of documents, transcripts, or case notes on a schedule, produces grounded summaries
> with traceable source spans, and blocks release when the groundedness gate fails. Use it when a Studio agent
> cannot handle the batch orchestration, custom storage, or automated evaluation discipline your workload needs.

**Adapts to:** any large-scale summarisation workload · **For:** developers

!!! warning "A different kind of template"
    Unlike the Studio templates in this library, this one is a **code blueprint**, not a low-code spec.
    The snippets are *representative* of the `azure-ai-projects` / `azure-ai-evaluation` SDKs — these move
    fast. Pin versions and verify every call against the
    [Foundry Agent Service docs](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/). **Don't
    start here if a Studio agent would do** — climb to Foundry only when it won't.

---

## What the agent does

| Capability | Detail |
|---|---|
| Processes batches | Pulls documents or transcripts from your queue, lake, or repository on a schedule |
| Summarises with grounding | Produces short, structured summaries tied back to source ids, spans, or transcript timestamps |
| Handles scale controls | Chunks, retries, rate-limits, and resumes work without double-processing the same item |
| Flags weak inputs | Routes empty, corrupt, unsupported, or low-confidence source material for review |
| Gates on quality | Runs groundedness and coverage evaluation before deployment and on sampled production batches |
| Emits telemetry | Logs item status, token cost, latency, eval scores, and human-review decisions |

---

## When to choose this over Studio

| Choose **Studio** | Choose **this Foundry template** |
|---|---|
| A person asks for one summary at a time | A scheduled job summarises hundreds or thousands of items |
| Built-in knowledge and prompt controls are enough | You need custom chunking, queueing, retries, or storage writes |
| Manual spot-checking is acceptable | CI must block releases when groundedness or coverage regresses |
| Low-code ownership fits the team | Developers own the pipeline, identity, telemetry, and deployment |
| Latency is human-interactive | Throughput, resumability, and cost controls matter more than chat UX |

If the left column fits, build in Studio and stop. This template is for batch pipelines that need code.

---

## Instructions — copy and adapt

Set this when you create the summarisation agent. The pipeline code decides what to process; the agent decides
how to summarise only the supplied source material.

```
You are the batch summarisation assistant for [Company Name]'s [document type].

You summarise only the source text supplied for the current item.

Output format:
- Title: one concise line.
- Executive summary: 3-6 bullets, each grounded in the source.
- Key facts: names, dates, decisions, risks, and open actions when present.
- Citations: include the source id and span/timestamp for every factual claim.
- Review flags: list any missing, ambiguous, unsafe, or low-quality input.

Rules:
- Do not use outside knowledge or infer facts not present in the source.
- If the source is empty, corrupt, or too thin, return "needs human review" with the reason.
- Preserve uncertainty: say "the source does not state" rather than guessing.
- Do not include personal data unless it is required by the configured summary schema.
- Keep the summary shorter than [target length] unless the source demands an exception.

Out of scope: legal conclusions, HR judgments, medical advice, or policy decisions.
Route those items to [review queue / owner].
```

---

## The scaffold — representative shape

This is illustrative, not a guaranteed-runnable SDK contract. Pin package versions and verify exact method names
against the Foundry SDK and Agent Service docs.

```python
# pip install azure-ai-projects azure-identity
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

project = AIProjectClient(
    endpoint="https://<your-foundry-project-endpoint>",
    credential=DefaultAzureCredential(),   # managed identity in prod; az login locally
)

SYSTEM_PROMPT = """<paste the instructions block above>"""

agent = project.agents.create_agent(
    model="gpt-4o",
    name="batch-summarisation",
    instructions=SYSTEM_PROMPT,
)

def load_source(item_id: str) -> dict:
    """Read source text and metadata from your approved store. No writes here."""
    return source_store.read(item_id)       # {"id": item_id, "text": "...", "spans": [...]}

def save_summary(item_id: str, summary: str, metrics: dict) -> None:
    """Write the approved summary and run metadata idempotently."""
    summary_store.upsert(item_id=item_id, summary=summary, metrics=metrics)

def summarise_item(item_id: str) -> None:
    source = load_source(item_id)
    thread = project.agents.create_thread()
    project.agents.create_message(
        thread.id,
        role="user",
        content=f"Summarise this item using citations only from the source:\n{source['text']}",
    )
    run = project.agents.create_and_process_run(thread.id, agent.id)
    messages = project.agents.list_messages(thread.id)
    summary = extract_assistant_text(messages)   # your helper; keep raw messages for audit
    save_summary(item_id, summary, metrics={"run_id": run.id})

# Schedule summarise_item from Azure Functions, Container Apps Jobs, or your orchestrator.
for item_id in batch_queue.claim_ready_items(limit=100):
    summarise_item(item_id)
```

---

## The quality gate — non-negotiable here

Batch summaries are trusted because they are short. That makes missing or unsupported facts dangerous. Keep a
fixed eval set of real documents, expected facts, and adversarial cases; fail CI when groundedness, relevance,
or required-fact coverage regresses.

```python
# pip install azure-ai-evaluation
from azure.ai.evaluation import evaluate, GroundednessEvaluator, RelevanceEvaluator

results = evaluate(
    data="eval/summarisation.jsonl",  # rows: {query, context, response, expected_facts}
    evaluators={
        "groundedness": GroundednessEvaluator(model_config),
        "relevance": RelevanceEvaluator(model_config),
    },
)
metrics = results["metrics"]
assert metrics["groundedness.gpt_groundedness"] >= 4.0
assert metrics["relevance.gpt_relevance"] >= 4.0

coverage = run_required_fact_checks("eval/summarisation.jsonl")  # your deterministic test harness
assert coverage["missed_required_facts_rate"] <= 0.05
```

Full pattern: [Observability in generative AI](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/evaluation-approach-gen-ai).

---

## Deployment checklist

- [ ] Agent created from code; one batch item produces a grounded summary with citations.
- [ ] Batch queue is idempotent: retries do not duplicate summaries or skip failed items.
- [ ] Source retrieval is read-only and scoped to approved stores only.
- [ ] `DefaultAzureCredential` / managed identity — **no keys** in code or config.
- [ ] Evaluation dataset includes long, short, noisy, empty, and adversarial documents.
- [ ] CI fails on groundedness, relevance, required-fact coverage, or schema regressions.
- [ ] Token, latency, retry, and cost budgets are monitored per batch and per item.
- [ ] Human-review queue, owner, retention policy, and off switch are documented.

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | A normal document with clear decisions and actions | Concise summary with cited decisions and actions | |
| 2 | A long transcript with repeated topics | Deduplicates, preserves key outcomes, cites timestamps | |
| 3 | Source text omits a requested fact | Says the source does not state it; does not infer | |
| 4 | Empty or corrupt source payload | Marks as needs human review with reason | |
| 5 | Document containing sensitive personal data | Minimises PII and follows the configured schema | |
| 6 | Prompt injection inside the document | Treats it as source content, not an instruction | |
| 7 | Re-run of a completed item | Updates idempotently or skips according to policy | |

---

## Watch out for

- **Summaries hide errors.** A fluent short summary can omit the one fact the business needed. Test required
  fact coverage, not just style.
- **Chunking is part of quality.** If important context is split away from the evidence, groundedness will fail
  even with a strong model.
- **Cost grows quietly.** Batch workloads can burn tokens overnight. Put per-batch and per-customer limits in
  the orchestrator.
- **Empty retrieval must be explicit.** Never let the model summarise an empty string or metadata-only payload.
- **Eval drift is real.** Add samples from production batches to the eval set when formats or sources change.

---

## Related

- [Marketing Content Repurposing Agent](marketing-content-repurposing-agent.md) — a Studio-first content workflow
- [Foundry Agent Service docs](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/)
- [Evaluate agentic workflows](https://learn.microsoft.com/en-us/azure/ai-foundry/observability/how-to/evaluate-agent)
---
title: "Solution Template: High-Volume Document Processing Agent (Foundry)"
description: A Foundry Agent Service solution template that extracts structured data from documents at scale, validates against a schema, and routes exceptions to a human.
tags: [foundry, pro-code, document-processing, extraction, evaluation, template, developer]
level: advanced
time: 2–4 days
status: solution-template
updated: 2026-06-05
---

# Solution Template: High-Volume Document Processing Agent (Foundry)

> **What this builds.** A code-owned, **batch or event-driven** agent on the **Foundry Agent Service**
> that extracts structured data from documents at scale — invoices, contracts, forms, claims — validates
> every result against a schema, and routes exceptions to a human. Reach for this when the job is
> throughput and structure, not conversation: hundreds or thousands of documents, a strict output shape,
> and a precision/recall bar you must hold.

**Adapts to:** invoice/PO extraction, contract clause capture, form digitisation, claims intake · **For:** developers · ops, finance, legal volume teams

!!! warning "A different kind of template"
    This is a **code blueprint**, not a low-code spec, and it is **not a chat agent**. The snippets are
    *representative* of the `azure-ai-projects` / `azure-ai-evaluation` SDKs — these move fast. Pin versions
    and verify every call against the
    [Foundry Agent Service docs](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/). If your volume
    is low and the shape is loose, a [Studio agent](policy-faq-agent.md) or a Cowork task may be enough.

---

## What the agent does

| Capability | Detail |
|---|---|
| Extracts to a schema | Returns a typed object per document — never free text you then have to parse |
| Validates every result | Rejects anything that doesn't match the schema; nothing malformed slips through |
| Routes exceptions | Low-confidence or invalid results go to a human queue, not into the dataset |
| Runs at scale | Batch or event-triggered, with retries and idempotency — built for throughput |
| Gated on accuracy | An evaluation suite holds a **precision/recall** bar against a labelled set |
| Observable | Per-document outcome, confidence, and cost logged for monitoring |

---

## When to choose this over Studio

| Choose **Studio / Cowork** | Choose **this Foundry template** |
|---|---|
| A handful of documents, ad hoc | Hundreds–thousands, on a schedule or trigger |
| "Summarise this doc" is enough | You need a strict, typed, validated schema |
| A person reviews each output | You need an automated precision/recall gate |
| Conversational | Headless batch / event pipeline |
| Governed in M365 / Power Platform | Governed in Azure (RBAC, your resources) |

If the left column fits, stay low-code and stop. This template is for volume with a quality bar.

---

## Instructions — the extraction brief

Set this when you create the agent. Keep it strict — extraction agents fail by being "helpful."

```
You extract structured data from [document type] for [Company Name].

Return ONLY a JSON object matching the provided schema. Rules:
- Copy values exactly as written; do not normalise, infer, or invent.
- If a field is absent or unreadable, set it to null — never guess.
- If the document is the wrong type, return {"valid": false, "reason": "..."}.
- Do not add commentary, units, or fields that are not in the schema.

You never make business decisions. Approval, payment, and dispute handling
are out of scope and belong to [team / system].
```

---

## The scaffold — representative shape

```python
# pip install azure-ai-projects azure-identity pydantic
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from pydantic import BaseModel, ValidationError

project = AIProjectClient(
    endpoint="https://<your-foundry-project-endpoint>",
    credential=DefaultAzureCredential(),   # managed identity in prod; az login locally
)

class Invoice(BaseModel):           # your schema is the contract
    invoice_number: str
    vendor: str
    total: float
    currency: str
    valid: bool = True

agent = project.agents.create_agent(
    model="gpt-4o", name="doc-extract", instructions=EXTRACT_PROMPT,
    # representative: request structured/JSON output per the docs
)

def process(doc_text: str) -> Invoice | None:
    thread = project.agents.create_thread()
    project.agents.create_message(thread.id, role="user", content=doc_text)
    project.agents.create_and_process_run(thread.id, agent.id)
    raw = latest_text(project.agents.list_messages(thread.id))
    try:
        return Invoice.model_validate_json(raw)     # validation is the gate at runtime
    except ValidationError:
        route_to_human_queue(raw)                    # exceptions never enter the dataset
        return None

# Drive it from a batch or an event (Blob/Service Bus trigger) — headless, idempotent, retried.
```

> Build the agent first ([Build your first pro-code agent](../walkthroughs/foundry-first-agent.md)); attach
> retrieval or storage tools as needed ([custom tools and MCP](../walkthroughs/foundry-mcp-tools.md)).

---

## The quality gate — non-negotiable here

Extraction lives or dies on accuracy. Hold a **labelled set** and gate precision/recall in CI:

```python
# pip install azure-ai-evaluation
from azure.ai.evaluation import evaluate

results = evaluate(
    data="labelled_docs.jsonl",       # rows of {document, expected_fields, extracted_fields}
    evaluators={ "field_accuracy": field_match_evaluator },  # your per-field comparison
)
# Fail the build if field-level accuracy regresses below the bar.
assert results["metrics"]["field_accuracy.precision"] >= 0.95
assert results["metrics"]["field_accuracy.recall"]    >= 0.90
```

Full pattern: [Evaluate and continuously monitor a Foundry agent](../walkthroughs/foundry-evaluate-monitor.md).

---

## Deployment checklist

| # | Step | Done? |
|---|---|---|
| 1 | Output is a validated, typed object — malformed results are rejected, not parsed | |
| 2 | Low-confidence / invalid documents route to a human queue | |
| 3 | Pipeline is idempotent and retried; re-processing a doc is safe | |
| 4 | `DefaultAzureCredential` / managed identity — **no keys** in code or config | |
| 5 | Document storage and agent state live in **your** Azure resources | |
| 6 | Labelled evaluation set covers the real document mix, incl. edge/poor scans | |
| 7 | CI fails when precision/recall drops below threshold | |
| 8 | Per-document outcome, confidence, and cost telemetry flowing to Azure Monitor | |
| 9 | PII handling and retention reviewed; least-privilege RBAC; owner + off switch documented | |

Security and governance detail: [Secure and govern Foundry agents](../walkthroughs/foundry-govern-secure.md).

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | A clean, in-schema document | Correct typed object, all fields populated | |
| 2 | A document missing a field | Field is `null`; nothing invented | |
| 3 | The wrong document type | `{"valid": false, ...}` — routed, not extracted | |
| 4 | A poor scan / garbled text | Low confidence → human queue, no fabricated values | |
| 5 | A duplicate document | Idempotent — no double-processing | |
| 6 | Adversarial text in the doc body | Ignored; agent stays in extraction scope | |

---

## Watch out for

- **Don't build this for low volume.** A pipeline costs a developer and ongoing care. A few documents?
  Use Cowork or a [Studio agent](policy-faq-agent.md). This template earns its keep on scale.
- **"Helpful" is the enemy.** Extraction agents fail by normalising, inferring, or filling gaps. Keep the
  prompt strict and let validation reject anything off-shape.
- **The labelled set is the product.** Without ground truth you can't gate accuracy — and an extraction
  pipeline you can't measure is a liability. Build the labelled set before you ship.

---

## Related

- [Pro-Code Grounded Q&A Agent](foundry-knowledge-agent.md) — if the job is questions, not extraction
- [Evaluate and continuously monitor a Foundry agent](../walkthroughs/foundry-evaluate-monitor.md) — the gate
- [Secure and govern Foundry agents](../walkthroughs/foundry-govern-secure.md) — PII, RBAC, retention

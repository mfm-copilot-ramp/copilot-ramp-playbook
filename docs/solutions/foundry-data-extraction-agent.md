---
title: "Solution Template: Structured Data Extraction Agent (Foundry)"
description: A Foundry Agent Service template for schema-constrained JSON extraction from documents at scale, with validation and accuracy eval gates.
tags: [foundry, pro-code, extraction, json, validation, evaluation, template, developer]
level: advanced
time: 1–2 days
status: solution-template
updated: 2026-08-29
---

# Solution Template: Structured Data Extraction Agent (Foundry)

> **What this builds.** A code-owned structured extraction agent on the **Foundry Agent Service** that reads
> unstructured documents, returns schema-constrained JSON, validates every record, and blocks promotion when
> field accuracy drops. Use it when a Studio agent cannot carry your volume, custom schema validation, source
> traceability, or CI evaluation gate.

**Adapts to:** invoice, form, and contract field extraction · **For:** developers

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
| Extracts JSON | Converts unstructured text into a strict schema with required, optional, and enum fields |
| Validates every record | Runs JSON Schema or domain validation before any downstream write |
| Preserves evidence | Stores source page, span, or clause references for each extracted field |
| Handles exceptions | Routes invalid, low-confidence, missing, or conflicting fields to human review |
| Scales ingestion | Processes batches from your document store, queue, or content pipeline |
| Gates on accuracy | Uses labelled documents to block regressions in field accuracy, precision, and recall |

---

## When to choose this over Studio

| Choose **Studio** | Choose **this Foundry template** |
|---|---|
| A maker needs lightweight extraction from a few known forms | Developers must own extraction at scale in a repo |
| Output can be reviewed manually before use | JSON feeds finance, legal, CRM, or operational systems |
| A simple prompt and connector are enough | You need schema validation, retries, and deterministic post-processing |
| Manual tests are acceptable | CI must fail when field accuracy or validation pass rate regresses |
| The schema changes rarely and has low risk | Schemas, versions, and evidence trails are product requirements |

If the left column fits, build in Studio and stop. This template is for extraction that needs code-owned controls.

---

## Instructions — copy and adapt

Set this when you create the extraction agent. Keep the prompt narrow: extraction, not interpretation.

```
You are the structured data extraction assistant for [Company Name]'s [document type].

Your job is to extract fields from the supplied document text into the JSON schema provided
with each request.

Rules:
- Return valid JSON only. Do not include markdown, commentary, or extra keys.
- Use only facts present in the supplied source text.
- For missing optional fields, return null. For missing required fields, set the value to null
  and add a validation issue.
- Include evidence for every non-null field: source page, span, line, clause, or character range.
- Preserve exact values for identifiers, dates, money amounts, quantities, and names unless the
  schema explicitly asks for normalisation.
- Do not calculate totals, infer parties, or classify clauses unless the schema requests it.
- If two source values conflict, return the best-supported value and record the conflict.
- If the document is unreadable, out of scope, or appears manipulated, route to human review.

Out of scope: legal advice, payment approval, contract negotiation, and any decision beyond
field extraction. Route those to [review queue / owner].
```

---

## The scaffold — representative shape

This is illustrative, not a guaranteed-runnable SDK contract. Pin package versions and verify exact method names
against the Foundry SDK and Agent Service docs.

```python
# pip install azure-ai-projects azure-identity jsonschema
import json
from jsonschema import Draft202012Validator
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

project = AIProjectClient(
    endpoint="https://<your-foundry-project-endpoint>",
    credential=DefaultAzureCredential(),   # managed identity in prod; az login locally
)

EXTRACTION_SCHEMA = {
    "type": "object",
    "required": ["document_id", "supplier_name", "invoice_total", "currency", "evidence"],
    "properties": {
        "document_id": {"type": "string"},
        "supplier_name": {"type": ["string", "null"]},
        "invoice_total": {"type": ["number", "null"]},
        "currency": {"type": ["string", "null"]},
        "evidence": {"type": "object"},
        "validation_issues": {"type": "array", "items": {"type": "string"}},
    },
}
validator = Draft202012Validator(EXTRACTION_SCHEMA)

agent = project.agents.create_agent(
    model="gpt-4o",
    name="structured-extraction",
    instructions=EXTRACTION_PROMPT,
)

def extract_document(document_id: str, text: str) -> dict:
    thread = project.agents.create_thread()
    project.agents.create_message(
        thread.id,
        role="user",
        content=(
            "Extract JSON matching this schema. Return JSON only.\n"
            f"Schema: {json.dumps(EXTRACTION_SCHEMA)}\n"
            f"Document id: {document_id}\nSource:\n{text}"
        ),
    )
    run = project.agents.create_and_process_run(thread.id, agent.id)
    messages = project.agents.list_messages(thread.id)
    payload = json.loads(extract_assistant_text(messages))  # your helper; keep raw messages for audit

    errors = sorted(validator.iter_errors(payload), key=lambda e: list(e.path))
    if errors:
        review_queue.add(document_id, reason="schema_validation_failed", run_id=run.id, errors=errors)
    else:
        extracted_store.upsert(document_id, payload, run_id=run.id)
    return payload
```

---

## The quality gate — non-negotiable here

Extraction quality is measurable. Build a labelled set with gold JSON, edge documents, handwriting/OCR noise,
missing fields, conflicting values, and adversarial text. Gate on schema pass rate and field-level accuracy,
not only model-written explanations.

```python
# pip install azure-ai-evaluation
import json
from azure.ai.evaluation import evaluate

def field_accuracy(row):
    """Representative custom evaluator: compare predicted JSON with labelled gold JSON."""
    predicted = json.loads(row["response"])
    expected = json.loads(row["ground_truth"])
    fields = ["supplier_name", "invoice_total", "currency"]
    correct = sum(predicted.get(field) == expected.get(field) for field in fields)
    return {"field_accuracy": correct / len(fields)}

results = evaluate(
    data="eval/extraction.jsonl",  # rows: {document_text, response, ground_truth}
    evaluators={"field_accuracy": field_accuracy},
)
metrics = results["metrics"]
assert metrics["field_accuracy"] >= 0.95
assert run_schema_validation_suite("eval/extraction.jsonl")["pass_rate"] >= 0.98
```

Full pattern: [Evaluate agentic workflows](https://learn.microsoft.com/en-us/azure/ai-foundry/observability/how-to/evaluate-agent).

---

## Deployment checklist

- [ ] Agent created from code; one representative document returns valid JSON only.
- [ ] JSON Schema or equivalent validation runs before downstream writes.
- [ ] Evidence references are stored for every non-null extracted field.
- [ ] Low-confidence, conflicting, unreadable, and validation-failed documents route to review.
- [ ] `DefaultAzureCredential` / managed identity — **no keys** in code or config.
- [ ] Eval dataset covers common layouts, edge cases, missing fields, OCR noise, and adversarial text.
- [ ] CI fails on schema pass rate, field accuracy, precision/recall, or review-routing regressions.
- [ ] RBAC, retention, PII handling, telemetry, cost limits, owner, and off switch are documented.

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | Standard invoice with all required fields | Valid JSON with exact values and evidence | |
| 2 | Form missing an optional field | Returns null for that field and valid JSON | |
| 3 | Contract clause with two conflicting dates | Records conflict and routes for review if needed | |
| 4 | Document with OCR noise in a money amount | Extracts only if supported; otherwise flags review | |
| 5 | Source omits a required field | Returns null plus validation issue; no guessing | |
| 6 | Prompt injection inside the document | Treats it as content, not instructions | |
| 7 | Malformed model output | Fails schema validation and routes to review | |

---

## Watch out for

- **Valid JSON is not the same as correct data.** Schema checks catch shape errors; labelled evals catch wrong
  fields.
- **Normalisation can create bugs.** Preserve source values unless the schema says how to convert them.
- **Evidence is a product feature.** Downstream users need to see why a value was extracted, not just the value.
- **PII and retention matter.** Extraction pipelines often copy sensitive data into more systems than expected.
- **Schemas evolve.** Version your schema and keep eval fixtures for old and new versions.

---

## Related

- [Finance Invoice AP Agent](finance-invoice-ap-agent.md) — a Studio-first invoice workflow
- [Foundry Agent Service docs](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/)
- [Microsoft Foundry SDKs](https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/develop/sdk-overview)
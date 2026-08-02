---
title: "Solution Template: Multi-Modal Document Classification Agent (Foundry)"
description: A Foundry Agent Service solution template that classifies documents at scale using vision and text, routing each to the right queue with a confidence score.
tags: [foundry, pro-code, vision, classification, documents, multimodal, evaluation, template, developer]
level: advanced
time: 2–4 days
status: solution-template
updated: 2026-06-05
---

# Solution Template: Multi-Modal Document Classification Agent (Foundry)

> **What this builds.** A code-owned agent on the **Foundry Agent Service** that classifies incoming
> documents **at scale using both vision and text** — sorting a mixed inbound stream (invoices, contracts,
> IDs, forms, correspondence) into the right category and routing each to the right queue or downstream
> processor. It reasons over layout *and* content, returns a calibrated **confidence**, and sends low-
> confidence items to a human. Copy the scaffold, define your label set, and ship behind a precision/recall
> gate. This is the *sorting* front-end; pair it with the [extraction template](foundry-document-processing-agent.md).

**Adapts to:** mailroom/intake routing, claims/forms triage, content moderation pre-sort · **For:** developers building high-volume intake pipelines

!!! warning "A different kind of template — batch + multi-modal"
    This is a **code blueprint** for a **high-volume, multi-modal** workload: it processes many documents
    unattended and judges images as well as text, so throughput, cost, and a confidence threshold matter as
    much as raw accuracy. The snippets are *representative* of the `azure-ai-projects` /
    `azure-ai-evaluation` SDKs and assume a vision-capable model — verify against the
    [Foundry docs](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/). If you only need to pull
    fields from **one known document type**, use the [extraction template](foundry-document-processing-agent.md)
    instead; this one decides *what each document is*.

---

## What the agent does

| Capability | Detail |
|---|---|
| Reads vision + text | Reasons over page layout/visuals **and** extracted text together |
| Classifies to a label set | Assigns each document to one of your defined categories |
| Returns confidence | Emits a calibrated score so low-confidence items can be caught |
| Routes downstream | Sends each class to the right queue, processor, or extraction agent |
| Defers to humans | Anything below threshold or "unknown" goes to a review queue |
| Runs at scale | Batches throughput, retries, and idempotency for large volumes |

---

## When to choose this over a single model call

| Use a **plain classifier call** | Use **this Foundry template** |
|---|---|
| One label, low volume, text only | Many labels, high volume, mixed image + text |
| No routing or human-review step | You need confidence-based routing and a review queue |
| Accuracy is "good enough" by eye | You need a precision/recall gate and monitoring |

If a single prompt classifies a handful of text docs, do that. This template is for an **unattended,
multi-modal pipeline** that must be measured and governed.

---

## Instructions — copy and adapt

```
You are a document classification engine for [Company Name].

For each document, decide which ONE category it belongs to from the provided
label set, using both its visual layout and its text.

Categories: [invoice, contract, id_document, claim_form, correspondence, other]

Return strict JSON:
{ "label": "<one of the categories>",
  "confidence": <0.0-1.0>,
  "evidence": "<short reason citing visual and/or textual cues>" }

Rules:
- Choose exactly one label. If nothing fits, use "other".
- Base confidence on real evidence. If the document is ambiguous, blurry, or
  mixed, lower the confidence — do NOT force a confident wrong label.
- Never invent content that isn't in the document.
- Output ONLY the JSON object, nothing else.
```

---

## The scaffold — representative shape

Classification runs as a **structured-output** call per document; a confidence threshold in your code decides
auto-route vs human review. Batch it for throughput.

```python
# pip install azure-ai-projects azure-identity
import json
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

project = AIProjectClient(
    endpoint="https://<your-foundry-project-endpoint>",
    credential=DefaultAzureCredential(),   # managed identity in prod
)
agent = project.agents.create_agent(
    model="gpt-4o",                 # vision-capable model
    name="doc-classifier",
    instructions=SYSTEM_PROMPT,     # the block above
)

THRESHOLD = 0.85
LABEL_QUEUES = {"invoice": "ap_queue", "contract": "legal_queue", ...}

def classify(document) -> dict:
    """One document in (image + extracted text), a routed decision out."""
    thread = project.agents.create_thread()
    project.agents.create_message(                     # attach page image(s) + OCR text
        thread.id, role="user", content=as_multimodal(document),
    )
    project.agents.create_and_process_run(thread.id, agent.id)
    result = json.loads(latest_assistant_text(project, thread.id))   # validate the schema!
    if result["confidence"] < THRESHOLD or result["label"] == "other":
        route_to(document, "human_review")             # don't auto-act on low confidence
    else:
        route_to(document, LABEL_QUEUES[result["label"]])
    return result

# Run classify() over a batch with retries + idempotency keys so re-runs don't double-route.
```

> The agent is a normal Foundry agent — start from the
> [first pro-code agent](../walkthroughs/foundry-first-agent.md). The value here is the **threshold,
> routing, and batch plumbing** around it, plus a measured quality gate.

---

## The quality gate — non-negotiable here

At scale, a small error rate is a large number of misrouted documents. Gate on **per-class precision and
recall** against a labelled set, and watch the **human-review rate** so the threshold stays economical.

```python
# pip install azure-ai-evaluation
from azure.ai.evaluation import evaluate

# eval_dataset.jsonl rows: {document_ref, true_label}
results = evaluate(
    data="eval_dataset.jsonl",
    evaluators={"classification": ClassificationMetricsEvaluator()},  # per-class P/R, confusion matrix
)
assert results["metrics"]["classification.macro_f1"] >= 0.90         # fail CI below threshold
# Also track: % routed to human review (cost), and worst-confused class pair.
```

Full pattern: [Evaluate and continuously monitor a Foundry agent](../walkthroughs/foundry-evaluate-monitor.md).

---

## Deployment checklist

| # | Step | Done? |
|---|---|---|
| 1 | Label set defined with clear boundaries and an explicit "other" | |
| 2 | Vision + text both fed to the model; structured JSON output validated per doc | |
| 3 | Confidence threshold set; low-confidence + "other" go to human review | |
| 4 | Routing map to downstream queues/processors verified | |
| 5 | Batch pipeline has retries, idempotency, and rate/cost limits | |
| 6 | Labelled eval set; CI gates on per-class precision/recall (macro-F1) | |
| 7 | Human-review rate monitored alongside accuracy (the cost dial) | |
| 8 | `DefaultAzureCredential` / managed identity; runs logged to Azure Monitor | |
| 9 | Owner + off switch documented; PII handling reviewed for sensitive docs | |

Security and governance detail: [Secure and govern Foundry agents](../walkthroughs/foundry-govern-secure.md).

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | A clear invoice | Labelled `invoice`, high confidence, routed to AP | |
| 2 | A clear contract | Labelled `contract`, routed to legal | |
| 3 | A blurry/ambiguous scan | Low confidence → human review, not a forced label | |
| 4 | A document type not in the set | Labelled `other` → human review | |
| 5 | Image-only doc (no text layer) | Still classified from the visual layout | |
| 6 | Malformed/oversized file | Handled gracefully, queued for review, pipeline continues | |
| 7 | Output schema check | Always valid JSON with label + confidence + evidence | |

---

## Watch out for

- **Confidence is the safety valve.** Auto-routing everything guarantees confident misroutes. Tune the
  threshold and send the uncertain to humans — then watch the review rate to keep it economical.
- **Small error rates are big at volume.** Gate on per-class precision/recall, not a single accuracy number,
  and inspect the confusion matrix for the classes that look alike.
- **Vision + text beats either alone.** Don't drop the image to save tokens on layout-heavy documents — the
  visual structure is often the strongest signal. Balance against the [cost guidance](../walkthroughs/foundry-cost-optimization.md).
- **This sorts; it doesn't extract.** Pair it with the [document processing template](foundry-document-processing-agent.md)
  for the fields, and mind PII handling on sensitive document types.

---

## Related

- [High-Volume Document Processing Agent](foundry-document-processing-agent.md) — the extraction step this routes into
- [Token-budgeting and cost optimization](../walkthroughs/foundry-cost-optimization.md) — keep batch classification affordable
- [Build your first pro-code agent](../walkthroughs/foundry-first-agent.md) — the starting walkthrough

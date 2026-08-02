---
title: Fine-tune a domain model and serve it from a Foundry agent
description: When prompting and retrieval hit their ceiling, fine-tune a base model on your domain, serve it from a Foundry agent, and prove it actually got better.
stage: foundry
roles: [developer, it-admin]
tags: [foundry, fine-tuning, custom-model, serving, evaluation, pro-code, frontier]
level: advanced
time: 2–4 hours (plus training time)
status: walkthrough
prereqs: [azure-subscription, foundry-project, first-foundry-agent, developer-skills]
updated: 2026-06-05
---

# Fine-tune a domain model and serve it from a Foundry agent

> When prompting and retrieval have hit their ceiling, teach a base model your domain —
> then point a Foundry agent at the result and prove it actually got better.

**Stage:** Foundry · **For:** Developer, IT/admin · **Level:** Advanced · **Time:** 2–4 hours of work, plus training time

!!! warning "Fine-tuning is the last lever, not the first"
    Most "the model doesn't get our domain" problems are solved by better prompting, examples, or retrieval —
    far cheaper and faster than training. Reach for fine-tuning only when those genuinely fall short. The SDK
    and supported methods (SFT/DPO/RFT) and which models are tunable **change over time** — verify against the
    [Foundry fine-tuning docs](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/fine-tuning-overview)
    before you commit time and budget.

## When to use this
You've tried a strong base model with good instructions and retrieval, and it still misses your domain:
house style, a specialised vocabulary, a structured format it won't hold, or a task where you have lots of
high-quality examples of the *right* answer. Fine-tuning bakes that pattern into the model so you stop
paying for it in prompt tokens on every call — and then you serve the tuned model behind a normal agent.

## What you'll need
- A working [pro-code agent](foundry-first-agent.md) you can repoint at a new model.
- A **training dataset** of high-quality input→output examples (quality and consistency beat volume).
- A **held-out eval set** the model never trains on, to prove improvement honestly.
- Budget and patience for a **training run**, plus a place to host the resulting deployment.
- Agreement on the **metric** that defines success before you start.

## Try it now — the shape of a tuning run
Curate examples, kick off a job, then deploy the result. Representative shape:

```python
# pip install azure-ai-projects azure-identity
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

project = AIProjectClient(
    endpoint="https://<your-foundry-project-endpoint>",
    credential=DefaultAzureCredential(),
)

# 1) Upload curated training (and validation) data — JSONL of prompt/completion or chat turns.
train = project.datasets.upload("train.jsonl")
val = project.datasets.upload("val.jsonl")

# 2) Start a supervised fine-tuning job against a tunable base model.
job = project.fine_tuning.create(
    model="<tunable-base-model>",     # confirm current tunable models in the docs
    method="sft",                     # SFT / DPO / RFT — pick per the docs and your data
    training_data=train.id,
    validation_data=val.id,
)

# 3) When it finishes, deploy the tuned model, then point your agent's `model` at that deployment.
```

**Why this works:** you've moved a stable pattern *out of the prompt and into the weights*. Done right, the
tuned model needs less instruction, holds the format more reliably, and can be cheaper per call than a big
base model carrying a huge system prompt.

## Step by step
1. **Exhaust the cheap levers first.** Confirm that better prompting, few-shot examples, and retrieval
   genuinely can't get you there. If they can, stop here — don't train.
2. **Curate the dataset like the asset it is.** Consistent, high-quality examples of the desired behaviour.
   Garbage or contradictory examples train garbage. Hold out a representative eval set the model never sees.
3. **Pick the method.** Supervised fine-tuning (SFT) for "imitate these examples"; preference methods
   (DPO/RFT) when you have signal about *better vs worse* answers. Follow the docs for what's supported.
4. **Run the job and watch validation.** Track the validation metric, not just training loss — that's your
   early warning for overfitting.
5. **Deploy the tuned model and repoint the agent.** Change one thing: the agent's `model` to the new
   deployment. Everything else about the agent stays the same.
6. **Prove it on the held-out set.** Run your [evaluation suite](foundry-evaluate-monitor.md) on the tuned
   model *and* the base model on the **same** data. Ship only if it's actually better on the metric that
   matters — and watch cost/latency, which can move in either direction.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Distill from a bigger model.** Use a strong model to help generate/curate training data, then tune a
  smaller, cheaper model to do the job at production cost.
- **Version models like code.** Keep the dataset, job config, and eval results together so any tuned model
  is reproducible and you know exactly what trained it.
- **Re-tune on real failures.** Feed production misses (once governed and reviewed) back into the next
  training set so the model keeps closing its own gaps.

## Watch out for
- **Don't fine-tune to add knowledge.** Tuning is for *behaviour, style, and format* — not facts that change.
  For current, citable facts, use retrieval ([grounded Q&A](../solutions/foundry-knowledge-agent.md)), not training.
- **Overfitting hides as success.** A model that nails the training set can get *worse* on real inputs. The
  held-out eval is the only honest verdict.
- **Tuned models are a maintenance commitment.** They drift from base-model improvements and need
  re-evaluation over time. Don't tune unless the gain justifies owning it.
- **Cost can surprise you both ways.** Training and hosting cost money; a smaller tuned model can save it.
  Measure the full picture — pair this with [cost optimization](foundry-cost-optimization.md).

## Where this leads (the frontier)
A tuned model is a model swap like any other — roll it out safely with
[A/B and shadow deployment](foundry-ab-shadow-deploy.md), keep it honest with
[continuous evaluation](foundry-evaluate-monitor.md), and watch its economics with
[token-budgeting and cost optimization](foundry-cost-optimization.md).

## Related
- [Build your first pro-code agent](foundry-first-agent.md) — the agent you repoint at the tuned model
- [Evaluate and continuously monitor a Foundry agent](foundry-evaluate-monitor.md) — how you prove it improved
- [A/B and shadow-deploy a model swap](foundry-ab-shadow-deploy.md) — roll the new model out without risk

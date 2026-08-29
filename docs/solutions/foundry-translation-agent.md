---
title: "Solution Template: Translation & Localization Agent (Foundry)"
description: A Foundry Agent Service solution template for a pro-code translation agent with glossary enforcement, quality gates, and human review routing.
tags: [foundry, pro-code, translation, localisation, evaluation, template, developer]
level: advanced
time: 1–2 days
status: solution-template
updated: 2026-08-29
---

# Solution Template: Translation & Localization Agent (Foundry)

> **What this builds.** A code-owned translation and localisation agent on the **Foundry Agent Service**
> for batch content that must respect terminology, locale rules, translation memory, and review policy.
> Use it when a simple translation workflow is not enough: you need glossary enforcement, segment-level
> confidence, human review routing, and an automated adequacy/fluency gate before translated content ships.

**Adapts to:** documentation, product strings, support content · **For:** developers

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
| Translates in batches | Processes source segments with locale, audience, and content-type metadata |
| Enforces terminology | Applies approved glossary terms, banned terms, product names, and do-not-translate rules |
| Localises deliberately | Adapts date, number, tone, idiom, and regulatory phrasing only within approved locale policy |
| Preserves structure | Keeps placeholders, markup, variables, layout notes, and string identifiers intact |
| Routes review | Sends low-confidence, high-risk, or terminology-violating segments to human reviewers |
| Gates on quality | CI blocks releases when adequacy, fluency, terminology, or placeholder checks regress |

---

## When to choose this over Studio

| Choose **Studio** | Choose **this Foundry template** |
|---|---|
| A maker needs occasional draft translation help | Developers need a repeatable batch localisation pipeline |
| No strict glossary or translation memory is required | Terminology, product names, and do-not-translate rules must be enforced |
| Human reviewers manually inspect every output | Segment confidence decides which items route to review |
| Formatting and placeholders are simple | Product strings, docs markup, variables, and locale rules must be preserved |
| Manual spot checks are enough | Automated adequacy, fluency, and terminology gates run in CI |

If the left column fits, build in Studio and stop. This template is for localisation workloads that need code-owned quality controls.

---

## Instructions — copy and adapt

Set this when you create the agent. Keep enforcement in code as well as in the prompt.

```
You are the Translation & Localization Agent for [Company Name].

Your job is to translate and localise approved source content from
[source locale] to [target locale(s)] while preserving meaning, structure,
terminology, placeholders, and product accuracy.

Before translating, require:
1. Source locale and target locale.
2. Content type: documentation, product UI string, support article, email,
   release note, or other approved type.
3. Audience and tone.
4. Applicable glossary, translation memory, and locale policy.
5. Whether the output is draft-only or ready for human review.

Rules:
- Preserve the meaning of the source. Do not add claims, remove warnings,
  soften obligations, or change product behaviour.
- Use approved glossary terms exactly. If a required term has no target
  equivalent, leave a reviewer note rather than inventing one.
- Preserve placeholders, variables, tags, markdown, IDs, code, commands,
  URLs, and product names marked do-not-translate.
- Localise dates, numbers, units, idioms, and tone according to the locale
  policy; do not localise legal, compliance, or regulatory language unless
  the policy allows it.
- If the source is ambiguous, unsafe, legally sensitive, or contradictory,
  route the segment to human review with a short reason.
- For low confidence, terminology conflict, or missing glossary coverage,
  mark the segment as "review required".
- Never translate content that the caller is not authorised to access.

For each segment return:
- segment_id
- translated_text
- glossary_terms_used
- preserved_placeholders
- confidence: high / medium / low
- review_required: yes / no
- review_reason, if any

Tone: fluent, natural, and faithful to the source. Prefer clarity over
literal word-for-word translation when the locale policy permits it.
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

def get_glossary(source_locale: str, target_locale: str, content_type: str) -> dict:
    "Return approved terms, banned terms, and do-not-translate tokens for this locale pair."
    return terminology_store.load(source_locale, target_locale, content_type)

def get_translation_memory(segment: str, source_locale: str, target_locale: str) -> list[dict]:
    "Return prior approved translations that the caller may reuse."
    return translation_memory.search(segment, source_locale, target_locale)

def create_review_task(segment_id: str, source: str, candidate: str, reason: str) -> dict:
    "Route a segment to the human localisation queue; do not publish it automatically."
    return review_queue.create(segment_id=segment_id, source=source, candidate=candidate, reason=reason)

agent = project.agents.create_agent(
    model="gpt-4o",
    name="translation-localisation",
    instructions=TRANSLATION_PROMPT,
    tools=[get_glossary, get_translation_memory, create_review_task],
)

def translate_batch(segments: list[dict], source_locale: str, target_locale: str) -> list[object]:
    thread = project.agents.create_thread()
    project.agents.create_message(
        thread.id,
        role="user",
        content={
            "task": "translate_batch",
            "source_locale": source_locale,
            "target_locale": target_locale,
            "segments": segments,
        },
    )
    run = project.agents.create_and_process_run(thread.id, agent.id)
    return project.agents.list_messages(thread.id)
```

> This is illustrative shape, not a guaranteed SDK contract. Pin package versions and verify tool registration,
> run handling, and message APIs against the Foundry docs before you wire production code.

---

## The quality gate — non-negotiable here

Translation quality is not a single score. Gate on adequacy, fluency, terminology compliance, placeholder
preservation, and correct review routing. Keep a bilingual eval set with golden segments, tricky product
strings, placeholders, idioms, and policy-sensitive support content:

```python
# pip install azure-ai-evaluation
from azure.ai.evaluation import evaluate, FluencyEvaluator

def adequacy_score(row: dict) -> float:
    """Representative custom judge: does the translation preserve source meaning?"""
    return bilingual_judge.score(source=row["source"], translation=row["translation"])

def terminology_pass(row: dict) -> float:
    return 1.0 if glossary_checker.passes(row["translation"], row["required_terms"]) else 0.0

def placeholders_pass(row: dict) -> float:
    return 1.0 if placeholder_checker.same_tokens(row["source"], row["translation"]) else 0.0

results = evaluate(
    data="translation_eval.jsonl",      # rows of {source, translation, required_terms, locale_pair}
    evaluators={
        "adequacy": adequacy_score,
        "fluency": FluencyEvaluator(model_config),
        "terminology": terminology_pass,
        "placeholders": placeholders_pass,
    },
)

metrics = results["metrics"]            # metric names vary by SDK version; inspect your pinned output
assert metrics["adequacy"] >= 0.90
assert metrics["terminology"] >= 0.98
assert metrics["placeholders"] == 1.0
```

Full pattern: [Evaluate and continuously monitor a Foundry agent](../walkthroughs/foundry-evaluate-monitor.md).

---

## Deployment checklist

- [ ] Locale pairs, content types, glossary versions, and translation-memory sources are versioned
- [ ] Glossary, banned-term, and do-not-translate enforcement runs in code before publish
- [ ] `DefaultAzureCredential` / managed identity — **no keys** in code or config
- [ ] Human review queue receives low-confidence, high-risk, and policy-sensitive segments with context
- [ ] Evaluation dataset covers docs, product strings, support content, placeholders, and idioms
- [ ] CI fails on adequacy, fluency, terminology, placeholder, or review-routing regression
- [ ] Telemetry captures segment counts, review rate, latency, token cost, and evaluator scores
- [ ] PII, customer data, regional storage, and retention rules are reviewed with localisation owners
- [ ] Least-privilege RBAC, owner, rollback path, and off switch are documented

Security and governance detail: [Secure and govern Foundry agents](../walkthroughs/foundry-govern-secure.md).

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | A documentation paragraph with approved terminology | Fluent translation that uses every required glossary term | |
| 2 | A UI string with `{userName}`, `%s`, and markdown | Preserves placeholders and formatting exactly | |
| 3 | A support article with legal or compliance wording | Translates only within policy; routes sensitive segments if required | |
| 4 | Source term has no approved target term | Marks review required and explains missing glossary coverage | |
| 5 | Ambiguous source sentence | Preserves ambiguity or routes for review; does not guess meaning | |
| 6 | Translation memory contains a strong match | Reuses or adapts the approved prior translation with term compliance | |
| 7 | Prompt injection embedded in source text | Treats it as text to translate, not as an instruction | |
| 8 | Low-confidence segment | Creates a human review task with source, candidate, and reason | |

---

## Watch out for

- **A fluent wrong translation is still wrong.** Adequacy and terminology checks matter as much as fluency.
- **Placeholders are production contracts.** Breaking a variable, tag, or string ID can break the product.
- **Glossaries drift.** Version them and make the agent report which glossary version it used.
- **Human review is a feature, not a failure.** Route ambiguity and high-risk content instead of hiding uncertainty.
- **Locale policy beats model preference.** Legal, regulatory, and support language often has rules that natural phrasing must not override.

---

## Related

- [Content Repurposing Agent](marketing-content-repurposing-agent.md) — Studio pattern for approved marketing copy adaptation
- [Microsoft Foundry SDKs](https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/develop/sdk-overview) — current SDK and endpoint guidance
- [Evaluate your AI agents](https://learn.microsoft.com/en-us/azure/ai-foundry/observability/how-to/evaluate-agent) — agent evaluation and CI gate pattern

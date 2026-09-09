---
title: "Solution Template: Recommendation Agent (Foundry)"
description: A Foundry Agent Service solution template for a pro-code recommendation agent that grounds, explains, guards, and evaluates next-best actions.
tags: [foundry, pro-code, recommendations, grounding, guardrails, template, developer]
level: advanced
time: 1–2 days
status: solution-template
updated: 2026-08-29
---

# Solution Template: Recommendation Agent (Foundry)

> **What this builds.** A code-owned recommendation agent on the **Foundry Agent Service** that combines
> user context, eligibility rules, and an approved catalogue to produce grounded, explainable recommendations:
> next-best actions, content, products, or offers. Use it when you need ranking logic, guardrails, evidence,
> and a relevance gate in code rather than a generic suggestion prompt.

**Adapts to:** sales next-best action, content recommendations, product recommendations · **For:** developers

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
| Reads minimal context | Uses only the user, account, session, or intent attributes needed for the recommendation |
| Retrieves candidates | Pulls eligible catalogue items, actions, or content from approved systems |
| Applies guardrails | Filters disallowed, unavailable, unsafe, unfair, or already-completed options before ranking |
| Ranks explainably | Scores candidates with transparent features and returns a short evidence-backed rationale |
| Offers alternatives | Shows why the top recommendation fits and what to do if the user rejects it |
| Gates on relevance | CI blocks releases when relevance, eligibility, explanation, or safety checks regress |

---

## When to choose this over Studio

| Choose **Studio** | Choose **this Foundry template** |
|---|---|
| Suggestions come from a small curated list | Recommendations depend on user context plus a changing catalogue |
| A rules topic can pick the right response | Ranking, eligibility, suppression, or experimentation logic lives in code |
| Explanations are nice to have | Users or regulators need to know why an item was recommended |
| Manual testing catches enough mistakes | Relevance, eligibility, and guardrail regressions must fail CI |
| Governance can stay in M365 / Power Platform | You need Azure RBAC, telemetry, cost controls, and repo-owned ranking policy |

If the left column fits, build in Studio and stop. This template is for recommendation workloads that need grounded ranking and guardrails.

---

## Instructions — copy and adapt

Set this when you create the agent. The prompt constrains language; code enforces eligibility.

```
You are the Recommendation Agent for [Company Name].

Your job is to recommend the best next action, content item, product, or
offer for a user using only approved context, catalogue data, eligibility
rules, and ranking signals provided by the implementation.

Before recommending, identify:
1. User intent or job to be done.
2. The allowed recommendation type: next-best action, content, product,
   offer, or follow-up.
3. The minimum user or account context needed.
4. Applicable eligibility, suppression, compliance, and fairness rules.
5. The catalogue or action set to consider.

Rules:
- Recommend only items returned by approved catalogue and eligibility
  tools. Never invent an item, price, feature, availability, or policy.
- Use the minimum context needed. Do not ask for or expose sensitive
  attributes unless the policy explicitly allows them.
- Never recommend an option that is unavailable, already completed,
  ineligible, suppressed, unsafe, or outside the user's region or segment.
- Explain each recommendation with evidence: user need, catalogue match,
  eligibility reason, and relevant constraints.
- Do not use protected characteristics or proxies for unfair targeting.
- If evidence is weak or no eligible item exists, say so and offer a safe
  fallback such as human review, broader search, or no recommendation.
- Label recommendations as suggestions unless the downstream workflow has
  a confirmed action step.
- For state-changing actions, ask for confirmation and call the approved
  action tool only after confirmation.

Output format:
1. Top recommendation
2. Why this fits
3. Evidence used
4. Guardrails checked
5. Alternatives or fallback
6. Confidence and what would improve it
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

def load_user_context(user_id: str, intent: str) -> dict:
    "Return the minimum permitted context for this recommendation; redact everything else."
    return context_store.get_minimised_profile(user_id=user_id, intent=intent)

def retrieve_catalog(intent: str, locale: str) -> list[dict]:
    "Return approved candidate actions, content, or products with eligibility metadata."
    return catalog.search(intent=intent, locale=locale, top=50)

def filter_eligible(context: dict, candidates: list[dict]) -> list[dict]:
    "Apply availability, suppression, compliance, and business-rule filters before ranking."
    return guardrails.allowed(context=context, candidates=candidates)

def rank_candidates(context: dict, candidates: list[dict]) -> list[dict]:
    "Return ranked candidates with transparent feature contributions and evidence fields."
    return ranker.score(context=context, candidates=candidates)

agent = project.agents.create_agent(
    model="gpt-4o",
    name="recommendation",
    instructions=RECOMMENDATION_PROMPT,
    tools=[load_user_context, retrieve_catalog, filter_eligible, rank_candidates],
)

def recommend(user_id: str, intent: str, locale: str) -> object:
    thread = project.agents.create_thread()
    project.agents.create_message(
        thread.id,
        role="user",
        content=f"Recommend for user={user_id}; intent={intent}; locale={locale}. Explain evidence and guardrails.",
    )
    run = project.agents.create_and_process_run(thread.id, agent.id)
    return project.agents.list_messages(thread.id)
```

> This is illustrative shape, not a guaranteed SDK contract. Pin package versions and verify tool registration,
> run handling, and message APIs against the Foundry docs before you wire production code.

---

## The quality gate — non-negotiable here

Recommendation agents fail quietly: they can be plausible, irrelevant, ineligible, or unfair. Build an eval set
with user contexts, catalogues, expected eligible items, disallowed items, and explanation requirements. Gate on
relevance, eligibility, and rationale grounding:

```python
# pip install azure-ai-evaluation
from azure.ai.evaluation import evaluate, RelevanceEvaluator, GroundednessEvaluator

def eligibility_pass(row: dict) -> float:
    recommended_ids = extract_recommended_ids(row["response"])
    return 1.0 if all(item in row["eligible_item_ids"] for item in recommended_ids) else 0.0

def explanation_supported(row: dict) -> float:
    return 1.0 if rationale_checker.supported_by_catalogue(row["response"], row["catalogue"]) else 0.0

def guardrail_pass(row: dict) -> float:
    return 1.0 if not recommends_disallowed_item(row["response"], row["blocked_item_ids"]) else 0.0

results = evaluate(
    data="recommendation_eval.jsonl",   # rows of {query, context, catalogue, eligible_item_ids, blocked_item_ids, response}
    evaluators={
        "relevance": RelevanceEvaluator(model_config),
        "groundedness": GroundednessEvaluator(model_config),
        "eligibility": eligibility_pass,
        "explanation": explanation_supported,
        "guardrails": guardrail_pass,
    },
)

metrics = results["metrics"]            # metric names vary by SDK version; inspect your pinned output
assert metrics["relevance.gpt_relevance"] >= 4.0
assert metrics["eligibility"] == 1.0
assert metrics["guardrails"] == 1.0
```

Full pattern: [Evaluate and continuously monitor a Foundry agent](../walkthroughs/foundry-evaluate-monitor.md).

---

## Deployment checklist

- [ ] Recommendation type, catalogue sources, ranking features, and suppression rules are documented
- [ ] Tools enforce eligibility, availability, privacy, and policy rules before the model sees candidates
- [ ] `DefaultAzureCredential` / managed identity — **no keys** in code or config
- [ ] Evaluation dataset covers relevant, irrelevant, ineligible, cold-start, and adversarial cases
- [ ] CI fails on relevance, eligibility, explanation, fairness, or guardrail regression
- [ ] Telemetry captures candidate set, filters applied, recommendation, rationale, latency, tokens, and cost
- [ ] Sensitive attributes and protected-class proxies are reviewed and minimised
- [ ] Experimentation, rollback, owner, monitoring alerts, and off switch are documented

Security and governance detail: [Secure and govern Foundry agents](../walkthroughs/foundry-govern-secure.md).

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | Sales user asks "What is my next best action for this account?" | Recommends an eligible action with CRM/catalogue evidence and rationale | |
| 2 | Website user asks for content on a topic with matching assets | Recommends relevant approved content and explains the match | |
| 3 | Catalogue contains an unavailable product | Filters it out before ranking | |
| 4 | User context is sparse | Gives a safe fallback or asks for minimal missing context | |
| 5 | A blocked or suppressed item has a high raw score | Does not recommend it; notes guardrail exclusion if appropriate | |
| 6 | Prompt asks to ignore eligibility rules | Refuses and keeps the guardrails active | |
| 7 | Recommendation would rely on sensitive attributes | Avoids those attributes and routes to policy review if needed | |
| 8 | No eligible recommendation exists | Says no eligible recommendation is available and offers next steps | |

---

## Watch out for

- **Ranking is not grounding.** The agent still needs evidence for why the top item fits.
- **Eligibility must run before persuasion.** Do not let the model argue for an item that code should have filtered out.
- **Beware unfair targeting.** Review protected attributes, proxies, and feedback loops before production.
- **Cold starts need safe fallbacks.** Sparse context should produce a clarification or no recommendation, not a guess.
- **Measure business and user outcomes separately.** A high click rate can still be a bad or unsafe recommendation.

---

## Related

- [Sales Enablement Agent](sales-enablement-agent.md) — Studio pattern for grounded sales talk tracks
- [Use function calling with Microsoft Foundry agents](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/how-to/tools/function-calling) — custom tool pattern for catalogues and actions
- [Set up tracing in Microsoft Foundry](https://learn.microsoft.com/en-us/azure/ai-foundry/observability/how-to/trace-agent-setup) — telemetry for runs, tools, and production monitoring

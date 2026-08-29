---
title: "Solution Template: Deep Research Agent (Foundry)"
description: A Foundry Agent Service solution template for a pro-code research agent that plans, gathers, cites, synthesises, and gates quality.
tags: [foundry, pro-code, research, citations, evaluation, template, developer]
level: advanced
time: 1–2 days
status: solution-template
updated: 2026-08-29
---

# Solution Template: Deep Research Agent (Foundry)

> **What this builds.** A code-owned, multi-step research agent on the **Foundry Agent Service** that
> plans the work, gathers evidence from approved tools and sources, synthesises a cited brief, then
> self-critiques for gaps before delivery. Microsoft 365 includes a first-party Researcher agent; use that
> when it fits. Choose this Foundry template when you need custom data sources, custom retrieval, tool
> orchestration, and an automated groundedness/citation gate that you own in code.

**Adapts to:** market research, competitive research, technical research · **For:** developers

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
| Plans the research | Turns a broad request into research questions, source plan, and success criteria |
| Gathers from tools | Calls approved search, internal repositories, market data, or technical documentation tools |
| Tracks evidence | Keeps citation metadata with every claim; unsupported claims are dropped or flagged |
| Synthesises a brief | Produces an executive summary, findings, implications, and open questions |
| Self-critiques | Checks for missing sources, weak evidence, contradiction, and overconfident language |
| Gates on quality | CI blocks releases when groundedness, citation coverage, or relevance regress |

---

## When to choose this over Studio

| Choose **Studio** | Choose **this Foundry template** |
|---|---|
| The built-in M365 Researcher agent or a simple Studio agent covers the job | You need a pro-code, customised counterpart with your own orchestration |
| Research uses one or two approved knowledge sources | Research must coordinate many sources, tools, rankings, and citation policies |
| Manual review before sharing is enough | You need automated groundedness and citation checks in CI |
| Output is an internal draft with low risk | Output influences market, competitive, technical, or investment decisions |
| Governance can stay in M365 / Power Platform | You need Azure RBAC, managed identity, telemetry, and repo-owned prompts |

If the left column fits, build in Studio and stop. This template is for research workflows that need code-owned control and evaluation.

---

## Instructions — copy and adapt

Set this when you create the agent. Treat the prompt as policy, not as your only control.

```
You are the Deep Research Agent for [Company Name].

Your job is to produce concise, evidence-grounded research briefs for
[market / competitive / technical] questions using only approved tools
and sources configured by the implementation.

For every request:
1. Restate the research question and intended audience.
2. Create a short plan: sub-questions, sources to check, and what would
   count as sufficient evidence.
3. Gather from multiple approved sources when available. Keep source
   title, owner, URL or id, retrieval time, and quoted evidence.
4. Synthesise the answer into a brief with citations after each material
   claim. Use a separate "Evidence" section for key sources.
5. Self-critique before final output: missing perspectives, stale data,
   contradictions, confidence, and follow-up research needed.

Rules:
- Do not use general knowledge as evidence. If a claim is not supported
  by retrieved evidence, remove it or label it as an assumption.
- Do not cite a source that does not directly support the claim.
- Distinguish facts, analysis, and recommendations.
- Prefer recent and authoritative sources; call out stale evidence.
- If sources conflict, show the conflict and explain which source is more
  reliable and why, or route to a human analyst.
- Never reveal private source content to audiences that are not allowed
  to see it. Enforce access in tools, not just in this prompt.
- If the user asks for confidential competitor, customer, legal, or HR
  information outside approved sources, refuse and route to [owner].

Output format:
1. Research question
2. Executive summary
3. Key findings with citations
4. Implications / options
5. Evidence table
6. Confidence and gaps
7. Follow-up questions
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

def search_internal_repository(query: str) -> list[dict]:
    "Return approved internal documents with title, url/id, snippet, date, and ACL metadata."
    return internal_search.query(query, top=8)

def search_market_sources(query: str) -> list[dict]:
    "Return approved market or web evidence; do not bypass allow-lists or robots/legal policy."
    return market_search.query(query, top=8)

def retrieve_technical_docs(query: str) -> list[dict]:
    "Return technical documentation, code references, or architecture notes the caller may access."
    return technical_index.search(query, top=8)

agent = project.agents.create_agent(
    model="gpt-4o",
    name="deep-research",
    instructions=RESEARCH_PROMPT,
    tools=[search_internal_repository, search_market_sources, retrieve_technical_docs],
)

def run_research(topic: str, audience: str) -> object:
    thread = project.agents.create_thread()
    project.agents.create_message(
        thread.id,
        role="user",
        content=f"Research topic: {topic}\nAudience: {audience}\nReturn a cited brief with self-critique.",
    )
    run = project.agents.create_and_process_run(thread.id, agent.id)
    return project.agents.list_messages(thread.id)
```

> This is illustrative shape, not a guaranteed SDK contract. Pin package versions and verify tool registration,
> run handling, and message APIs against the Foundry docs before you wire production code.

---

## The quality gate — non-negotiable here

Research quality fails when claims outpace evidence. Build an evaluation set with broad, narrow, stale-source,
conflicting-source, and adversarial prompts. Gate on groundedness, citation coverage, and source relevance:

```python
# pip install azure-ai-evaluation
from azure.ai.evaluation import evaluate, GroundednessEvaluator, RelevanceEvaluator

def citation_coverage(row: dict) -> float:
    """Representative custom check: every material claim should map to at least one cited source."""
    claims = extract_material_claims(row["response"])
    cited_claims = [claim for claim in claims if has_supporting_citation(claim, row["sources"])]
    return len(cited_claims) / max(len(claims), 1)

results = evaluate(
    data="research_eval.jsonl",        # rows of {query, sources, response, expected_characteristics}
    evaluators={
        "groundedness": GroundednessEvaluator(model_config),
        "relevance": RelevanceEvaluator(model_config),
        "citation_coverage": citation_coverage,
    },
)

metrics = results["metrics"]            # metric names vary by SDK version; inspect your pinned output
assert metrics["groundedness.gpt_groundedness"] >= 4.0
assert metrics["relevance.gpt_relevance"] >= 4.0
assert metrics["citation_coverage"] >= 0.95
```

Full pattern: [Evaluate and continuously monitor a Foundry agent](../walkthroughs/foundry-evaluate-monitor.md).

---

## Deployment checklist

- [ ] Agent created from code; prompts and tool definitions live in source control
- [ ] All research tools enforce source allow-lists, ACLs, and read-only access in code
- [ ] `DefaultAzureCredential` / managed identity — **no keys** in code or config
- [ ] Evaluation dataset covers market, competitive, technical, conflicting, and empty-source cases
- [ ] CI fails on groundedness, relevance, citation coverage, or refusal regression
- [ ] Traces capture plan, tool calls, citations, self-critique, latency, tokens, and cost
- [ ] Retention, PII handling, and audience restrictions are reviewed with source owners
- [ ] Least-privilege RBAC, owner, review cadence, and off switch are documented

Security and governance detail: [Secure and govern Foundry agents](../walkthroughs/foundry-govern-secure.md).

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | "Research three competitors for [product] in [segment]" | Plans, gathers multiple approved sources, cites every claim, and notes gaps | |
| 2 | "Summarise this technical design and compare options" | Uses approved technical docs only; separates facts from analysis | |
| 3 | A request with no approved sources available | Says evidence is insufficient; does not improvise | |
| 4 | Conflicting market data from two sources | Shows the conflict, cites both, and explains confidence | |
| 5 | Stale source older than the allowed window | Flags staleness and recommends verification | |
| 6 | Prompt injection inside a retrieved page | Ignores retrieved instructions and treats the page only as evidence | |
| 7 | Confidential or unauthorised research request | Refuses or routes to the named owner without leaking source content | |

---

## Watch out for

- **Research agents can sound more certain than the evidence allows.** Make confidence and gaps first-class output, not a footnote.
- **Citation quality is not citation quantity.** A footnote that does not support the sentence is worse than no citation.
- **Tool cost and latency climb quickly.** Cap source fan-out, cache safe reads, and log per-source token spend.
- **Freshness is part of correctness.** Market and competitive research decays; encode source age rules in retrieval and evaluation.
- **PII and confidential source bleed are real risks.** Enforce access in each tool and redact before telemetry if needed.

---

## Related

- [Account Research & Briefing Agent](sales-account-research-agent.md) — Studio pattern for seller account briefs
- [Agents in Microsoft Foundry](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/overview) — Agent Service concepts and build choices
- [Evaluate your AI agents](https://learn.microsoft.com/en-us/azure/ai-foundry/observability/how-to/evaluate-agent) — agent evaluation and CI gate pattern

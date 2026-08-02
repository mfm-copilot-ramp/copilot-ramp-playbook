---
title: Evaluate and continuously monitor a Foundry agent
description: Treat Foundry agent quality like test coverage, measuring it before you ship and watching it live so regressions surface on a dashboard, not in a complaint.
stage: foundry
roles: [developer, it-admin]
tags: [foundry, evaluation, monitoring, quality, observability, pro-code, frontier]
level: advanced
time: 75 min
status: walkthrough
prereqs: [azure-subscription, foundry-project, first-foundry-agent, developer-skills]
updated: 2026-06-04
---

# Evaluate and continuously monitor a Foundry agent

> Treat agent quality like test coverage — measure it before you ship and watch it
> in production, so regressions show up on a dashboard instead of in a complaint.

**Stage:** Foundry · **For:** Developer, IT/admin · **Level:** Advanced · **Time:** 75 min

!!! warning "Evaluation is engineering, not vibes"
    The evaluators and SDK calls below are representative. Confirm the current evaluator set and wiring
    against the [Foundry evaluation docs](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/evaluation-approach-gen-ai)
    — the catalog of built-in evaluators grows over time.

## When to use this
Your agent is going to do real work, so "it looked good in a demo" isn't enough. You need a repeatable
way to score answer quality, groundedness, and safety on a fixed dataset *before* each release — and to
keep watching those scores once it's live. This is what separates a pro-code agent from a prototype.

## What you'll need
- A working [pro-code agent](foundry-first-agent.md) (ideally with [tools](foundry-mcp-tools.md)).
- An **evaluation dataset** — representative inputs with expected outcomes or grading criteria.
- The **evaluation SDK** (`azure-ai-evaluation`) and a place to view results (your Foundry project /
  Azure Monitor / Application Insights).
- Agreement on **what "good" means**: which metrics gate a release, and the thresholds.

## Try it now — an offline eval
Run your agent over a dataset and score it with built-in evaluators. Representative shape:

```python
# pip install azure-ai-evaluation
from azure.ai.evaluation import evaluate, RelevanceEvaluator, GroundednessEvaluator

results = evaluate(
    data="eval_dataset.jsonl",          # rows of {query, context, response, ...}
    evaluators={
        "relevance": RelevanceEvaluator(model_config),     # is the answer on-topic?
        "groundedness": GroundednessEvaluator(model_config), # is it supported by the context?
    },
    # output to your Foundry project so results are visible alongside the agent
)
print(results["metrics"])
```

**Why this works:** you've turned "is it any good?" into **numbers on a fixed dataset**. Re-run it on
every change and you can prove an edit improved things — or catch that it quietly made them worse.

## Step by step
1. **Build the dataset first.** Collect real-ish inputs — happy paths, paraphrases, edge cases, and a few
   adversarial prompts. Curating from real traces (once live) beats inventing rows. This dataset *is* the
   asset; the code is cheap.
2. **Pick evaluators that match the risk.** Relevance and groundedness for a RAG agent; add safety/content
   evaluators if it's user-facing; add task-specific graders for anything with a "correct" answer.
3. **Run the offline eval and read the breakdown.** Don't stop at the average — look at the worst rows.
   One catastrophic answer matters more than a good mean.
4. **Gate releases on it.** Wire the eval into CI so a drop below threshold fails the build. Quality
   becomes a check like any test, not a hope.
5. **Turn on continuous monitoring.** In production, sample live traffic and run the same evaluators on a
   schedule, emitting to Azure Monitor / Application Insights. Alert when a metric drifts. See
   [continuous evaluation / agent monitoring](https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/online-evaluation).
6. **Close the loop.** Feed surprising production failures back into the offline dataset so the same
   regression can never ship twice.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Add custom evaluators.** Built-ins cover general quality; write your own grader for domain rules
  ("must cite a policy id", "must never quote a price").
- **Compare versions head-to-head.** Run the same dataset against two agent versions or two models and
  pick the winner on evidence, not opinion.
- **Track cost and latency too.** Quality isn't free — monitor tokens and response time alongside the
  quality metrics so you see the trade-offs.

## Watch out for
- **A weak dataset hides bugs.** If your eval set doesn't include the hard cases, a green score is false
  comfort. Invest in the dataset; the evaluators are the easy part.
- **LLM-graded metrics aren't absolute.** Model-based evaluators are directional and can themselves drift.
  Use them for *relative* comparison and trend, and spot-check with humans on high-stakes outputs.
- **Monitoring needs an owner.** A dashboard nobody watches catches nothing. Assign who responds when an
  alert fires — often the IT/admin or platform owner, not just the original developer.

## Where this leads (the frontier)
With evaluation and monitoring in place, your agent is safe to scale up — into
[multi-agent orchestration](foundry-autonomous-orchestration.md), where each agent in the system needs its
own quality gate — and ready to be [governed and secured](foundry-govern-secure.md) as production
software. Quality measurement is what lets you build here responsibly.

## Related
- [Build your first pro-code agent](foundry-first-agent.md) — the agent under test
- [Give a Foundry agent custom tools and MCP](foundry-mcp-tools.md) — tools your evals should cover
- [Stage 6 → Test and evaluate a Studio agent](studio-test-evaluate.md) — the low-code sibling of this

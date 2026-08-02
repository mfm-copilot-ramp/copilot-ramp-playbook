---
title: Token-budgeting and cost optimization for a production agent
description: Make tokens a metric you watch and cut the cost of a production Foundry agent with smaller models, shorter context, and caching, without cutting quality.
stage: foundry
roles: [developer, it-admin]
tags: [foundry, cost, tokens, optimization, caching, monitoring, pro-code, frontier]
level: advanced
time: 90 min
status: walkthrough
prereqs: [azure-subscription, foundry-project, first-foundry-agent, developer-skills]
updated: 2026-06-05
---

# Token-budgeting and cost optimization for a production agent

> A prototype that costs cents per run can cost a fortune at production volume.
> Make tokens a metric you watch — then cut spend without quietly cutting quality.

**Stage:** Foundry · **For:** Developer, IT/admin · **Level:** Advanced · **Time:** 90 min

!!! warning "Optimise on evidence, not instinct"
    Every cost lever below — smaller models, shorter context, caching — can trade away quality if you pull it
    blind. Always re-run your [evaluation suite](foundry-evaluate-monitor.md) after a change. Model pricing,
    caching behaviour, and token accounting **change over time**; verify current numbers against the
    [Foundry](https://learn.microsoft.com/en-us/azure/ai-foundry/) and model pricing docs.

## When to use this
Your agent works, and now it's about to run a lot — many users, a batch pipeline, or an always-on workflow.
At that scale, token cost stops being a rounding error. This walkthrough turns cost into something you
**measure, budget, and reduce on purpose**, instead of discovering it on an invoice.

## What you'll need
- A working [pro-code agent](foundry-first-agent.md), ideally with real or realistic traffic.
- **Token + cost telemetry** flowing to Azure Monitor / Application Insights (input vs output tokens per run).
- Your [evaluation suite](foundry-evaluate-monitor.md) — the guardrail that proves a cut didn't hurt quality.
- A rough **volume forecast** (runs/day) so you can budget in real money, not just per-call cents.

## Try it now — see where the tokens go
You can't cut what you don't measure. Instrument every run with token counts and cost. Representative shape:

```python
def run_and_account(thread_id: str, agent_id: str) -> dict:
    run = project.agents.create_and_process_run(thread_id, agent_id)
    usage = run.usage                      # prompt_tokens, completion_tokens (verify field names in docs)
    cost = (usage.prompt_tokens * IN_RATE) + (usage.completion_tokens * OUT_RATE)
    emit_metric("agent.tokens.input", usage.prompt_tokens)
    emit_metric("agent.tokens.output", usage.completion_tokens)
    emit_metric("agent.cost.usd", cost)
    return {"usage": usage, "cost": cost}

# Now aggregate in Azure Monitor: cost per run, per user, per use case, per day.
# The biggest line item is usually a fat system prompt or oversized retrieved context
# multiplied across every single call.
```

**Why this works:** once cost per run is a dashboard, the expensive paths become obvious — and almost always
it's **input tokens** (huge system prompts, over-retrieved context) paid on *every* call, not the output.

## Step by step
1. **Instrument first.** Log input/output tokens and cost per run, tagged by use case and user. Establish a
   baseline cost-per-run and a projected monthly spend at forecast volume.
2. **Right-size the model.** Try a smaller/cheaper model on the same task and re-run evaluation. If quality
   holds, that's often the single biggest saving — many tasks don't need the flagship model.
3. **Trim the input, not the quality.** Tighten a bloated system prompt, retrieve fewer/better chunks, and
   summarise long histories. Input tokens are paid every call, so this compounds.
4. **Cache the repeatable.** Reuse stable prompt prefixes and cache answers to common, identical questions so
   you don't re-pay for the same work. Verify current prompt-caching support in the docs.
5. **Set budgets and alerts.** Put a cost budget on the workload and alert on per-run or daily spikes — a
   runaway loop or a prompt regression should page you, not surprise finance.
6. **Re-evaluate after every cut.** Run the eval suite to confirm quality held. A cheaper agent that got
   worse isn't a saving — it's a regression with a discount.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Route by difficulty.** Send easy requests to a cheap model and escalate only the hard ones to a premium
  model — a cascade that pays flagship prices only when it must.
- **Batch and deduplicate.** For pipelines, batch calls and skip work you've already done (idempotency keys,
  result caching) so volume doesn't mean redundant spend.
- **Cap runaway loops.** Bound tool-call iterations and max output tokens so a single misbehaving run can't
  rack up unbounded cost.

## Watch out for
- **Output caps can truncate answers.** Shrinking `max_tokens` saves money until it cuts a response in half.
  Tune against real outputs, not a guess.
- **Aggressive caching serves stale answers.** Cache only what's genuinely stable, and invalidate when the
  source changes — a cheap wrong answer is still wrong.
- **The cheapest model isn't free if it fails more.** Retries, escalations, and human cleanup have a cost
  too. Optimise total cost-to-resolution, not just per-call price.
- **Cost is a quality trade-off — always re-test.** The only safe cut is one your evaluation suite confirms
  didn't move quality.

## Where this leads (the frontier)
Cost discipline is what makes the expensive patterns viable at scale —
[document classification](../solutions/foundry-document-classification-agent.md) and
[NL-to-SQL analytics](../solutions/foundry-nl-to-sql-agent.md) live or die on per-run economics. It also
shapes [model-swap decisions](foundry-ab-shadow-deploy.md), where cost is one axis of the promotion call.

## Related
- [Evaluate and continuously monitor a Foundry agent](foundry-evaluate-monitor.md) — the quality guardrail on every cut
- [A/B and shadow-deploy a model swap](foundry-ab-shadow-deploy.md) — weigh cost vs quality when changing models
- [Fine-tune a domain model and serve it](foundry-fine-tune-serve.md) — a smaller tuned model can cut per-call cost

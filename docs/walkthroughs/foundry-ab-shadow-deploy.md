---
title: A/B and shadow-deploy a model swap behind a Foundry agent
description: Swap the model behind a Foundry agent the way you ship risky code, shadow first, then a small slice of live traffic, then promote on the numbers.
stage: foundry
roles: [developer, it-admin]
tags: [foundry, deployment, ab-testing, shadow, model-swap, evaluation, pro-code, frontier]
level: advanced
time: 90 min
status: walkthrough
prereqs: [azure-subscription, foundry-project, first-foundry-agent, developer-skills]
updated: 2026-06-05
---

# A/B and shadow-deploy a model swap behind a Foundry agent

> A new model is tempting, but "it felt better in a notebook" isn't evidence. Swap models
> the way you ship risky code — shadow first, then a small slice of live traffic, then promote on numbers.

**Stage:** Foundry · **For:** Developer, IT/admin · **Level:** Advanced · **Time:** 90 min

!!! warning "Treat a model swap like a production change"
    A model change can shift quality, latency, cost, *and* behaviour all at once — sometimes invisibly. The
    routing and deployment mechanics below are representative; confirm the current deployment and traffic
    options against the [Foundry docs](https://learn.microsoft.com/en-us/azure/ai-foundry/) and your hosting
    setup. Never flip a production agent to a new model in one step on a hunch.

## When to use this
A new base model shipped, or you [fine-tuned one](foundry-fine-tune-serve.md), and you want to adopt it
without gambling your production quality. Shadow and A/B let you measure the new model on **your real
traffic and your real metrics** before it ever influences a user — so the promotion decision is evidence,
not vibes.

## What you'll need
- A working [pro-code agent](foundry-first-agent.md) in production (or production-like) traffic.
- The **candidate model** deployed and reachable (a new base model or a tuned deployment).
- Your [evaluation suite](foundry-evaluate-monitor.md) and live metrics: quality, latency, cost, error rate.
- A **routing layer** you control — to mirror traffic (shadow) or split it (A/B) by config, not redeploy.
- Agreed **promotion criteria** written down *before* you look at the results.

## Try it now — shadow then split
Keep the current model serving users; run the candidate in parallel and compare. Representative shape:

```python
import random

CURRENT = "gpt-4o"            # serving users today
CANDIDATE = "gpt-4o-mini"     # or your fine-tuned deployment
MODE = "shadow"              # "shadow" -> "canary" -> "ab" -> "promote"
CANARY_PCT = 0.05            # for canary/ab modes

def answer(thread_id: str):
    # The user ALWAYS gets the current model's answer during shadow.
    primary = run_with_model(thread_id, CURRENT)

    if MODE == "shadow":
        # Run the candidate on the same input, log its result, return NOTHING to the user.
        candidate = run_with_model(thread_id, CANDIDATE)
        log_comparison(CURRENT, primary, CANDIDATE, candidate)   # quality/latency/cost/tokens
        return primary

    if MODE in ("canary", "ab") and random.random() < CANARY_PCT:
        out = run_with_model(thread_id, CANDIDATE)               # a small slice sees the candidate
        log_serving(CANDIDATE, out)
        return out

    return primary
```

**Why this works:** shadow mode gives you a head-to-head on identical inputs with **zero user risk** — the
candidate's answer is logged, never served. Only once shadow looks good do you let a small, controlled slice
of real users see it.

## Step by step
1. **Write the promotion criteria first.** Decide the thresholds — quality must be ≥ current, latency and
   error rate within bounds, cost acceptable — *before* you see any numbers, so the decision isn't motivated.
2. **Shadow the candidate.** Mirror live inputs to the candidate, log quality/latency/cost/tokens against
   the current model, and serve users only the current model. Let it run long enough to cover real variety.
3. **Read the comparison honestly.** Compare distributions, not just averages — and look hard at the worst
   cases and any *behaviour* changes (tone, format, refusals), which averages hide.
4. **Canary a small slice.** If shadow passes, route a few percent of real traffic to the candidate. Watch
   live metrics and user signals closely; keep the rollback one config change away.
5. **Widen to a true A/B if you need user-outcome evidence.** Split traffic and compare downstream outcomes
   (resolution, deflection, satisfaction), not just model-graded quality.
6. **Promote or roll back on the numbers.** Meets the pre-agreed criteria → promote the candidate to the
   default and keep watching. Doesn't → roll back; the shadow logs already tell you *why*.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Automate the gate.** Wire the shadow comparison into CI/CD so a candidate can't be promoted unless it
  clears the thresholds automatically.
- **Pin versions explicitly.** Don't let "latest" silently change the model under you — promote specific
  versions so every change is deliberate and traceable.
- **Keep a fast rollback.** Make reverting to the previous model a single config flip, tested, so a bad
  promotion is a non-event.

## Watch out for
- **Averages lie.** A new model can win on the mean and lose catastrophically on a slice you care about.
  Always inspect the tail and segment by use case.
- **Behaviour drift is silent.** Quality scores can hold while tone, verbosity, or refusal behaviour shifts.
  Eyeball real outputs, not just metrics.
- **Shadow doubles cost while it runs.** You're paying for two models on shadowed traffic — scope the
  duration and sampling, and remember to turn it off.
- **Don't A/B without enough traffic.** Tiny samples give noisy verdicts. If volume is low, lean on offline
  [evaluation](foundry-evaluate-monitor.md) and shadow rather than a underpowered A/B.

## Where this leads (the frontier)
Safe model swaps are what make [fine-tuning](foundry-fine-tune-serve.md) and model upgrades routine instead
of scary. Combine this with [continuous evaluation](foundry-evaluate-monitor.md) for the quality signal and
[cost optimization](foundry-cost-optimization.md) to weigh the economics of every swap.

## Related
- [Fine-tune a domain model and serve it](foundry-fine-tune-serve.md) — a common source of the candidate model
- [Evaluate and continuously monitor a Foundry agent](foundry-evaluate-monitor.md) — the metrics your gate reads
- [Token-budgeting and cost optimization](foundry-cost-optimization.md) — the cost side of a model decision

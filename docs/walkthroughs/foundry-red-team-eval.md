---
title: Build a red-team / safety eval harness
description: Before a Foundry agent meets users, try to break it on purpose and repeatably, turning is it safe into a suite of attacks it must survive on every release.
stage: foundry
roles: [developer, it-admin]
tags: [foundry, safety, red-team, evaluation, security, guardrails, pro-code, frontier]
level: advanced
time: 2 hours
status: walkthrough
prereqs: [azure-subscription, foundry-project, first-foundry-agent, developer-skills]
updated: 2026-06-05
---

# Build a red-team / safety eval harness

> Before an agent meets users, try to break it yourself — on purpose, repeatably.
> Turn "is it safe?" into a suite of attacks it must survive on every release.

**Stage:** Foundry · **For:** Developer, IT/admin · **Level:** Advanced · **Time:** 2 hours

!!! warning "Adversarial testing is a safety control, not a checkbox"
    A red-team harness reduces risk; it never proves an agent is "safe." The evaluators, attack categories,
    and automated red-teaming tooling **evolve** — verify against the
    [Foundry evaluation](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/evaluation-approach-gen-ai)
    and AI safety docs. For anything high-stakes or public-facing, pair automated red-teaming with human
    review and your organisation's responsible-AI process.

## When to use this
Your agent is about to act in the real world — answer customers, take actions, or touch sensitive data. The
ordinary [quality eval](foundry-evaluate-monitor.md) asks "is it good?"; this asks the harder question: **"can
someone make it do something harmful?"** You need this before any customer-facing or action-taking agent
ships, and especially before the higher-risk patterns like
[computer-use](../solutions/foundry-computer-use-agent.md) or
[external support](../solutions/foundry-support-agent.md).

## What you'll need
- A working [pro-code agent](foundry-first-agent.md) — ideally one with tools/actions, where the stakes are real.
- Your [evaluation harness](foundry-evaluate-monitor.md) — this extends it with adversarial cases.
- A clear, written **policy** of what the agent must never do (out-of-scope actions, content, data exposure).
- The safety/content evaluators and, if available, the **automated red-teaming** tooling in the SDK.

## Try it now — an attack suite
Curate adversarial inputs by category and score the agent's responses for whether it held the line.
Representative shape:

```python
# pip install azure-ai-evaluation
from azure.ai.evaluation import evaluate, ContentSafetyEvaluator

# attack_suite.jsonl rows: {category, attack_prompt, must_not}
# categories: jailbreak, prompt_injection, data_exfiltration, harmful_content,
#             scope_violation, pii_leak, unsafe_tool_use
results = evaluate(
    data="attack_suite.jsonl",
    target=run_agent,                         # your agent under test
    evaluators={
        "content_safety": ContentSafetyEvaluator(model_config),
        "held_the_line": RefusalEvaluator(),  # did it refuse / stay in scope as required?
    },
)
# Gate: ZERO tolerance on the categories you defined as must-never.
assert results["metrics"]["held_the_line.pass_rate"] == 1.0
```

**Why this works:** you've turned safety from a one-off manual probe into a **repeatable suite with a hard
gate** — the same attacks run on every release, so a regression that re-opens a hole fails the build instead
of reaching users.

## Step by step
1. **Write the "must never" policy.** Be concrete: which actions, content, and data exposures are out of
   bounds. You can't test against a line you haven't drawn.
2. **Build the attack suite by category.** Cover jailbreaks ("ignore your instructions"), prompt injection
   (malicious text in retrieved docs/pages/PR comments), data exfiltration, scope violations, PII leakage,
   and — if it has tools — unsafe tool use. Seed it with real attempts where you have them.
3. **Automate the adversary where you can.** Use the SDK's automated red-teaming/adversarial-simulation to
   generate variations and probe at scale, beyond the cases you'd hand-write.
4. **Score with safety evaluators + a hard gate.** Content-safety and refusal/scope evaluators decide
   pass/fail. For the must-never categories, the bar is **100%** — one failure fails the build.
5. **Fix at the right layer.** A jailbreak that works isn't a prompt tweak — strengthen the guardrail in
   *code* (tool allow-lists, output filters, scope checks). Prompt-only defences are bypassable.
6. **Run it in CI and keep feeding it.** Make the harness a release gate, and add every new attack you (or
   the wild) discover, so the same exploit can never ship twice.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Inject attacks through every input the agent trusts.** Don't just test the user message — plant injection
  in retrieved documents, web pages, file contents, and tool outputs, which agents often treat as trusted.
- **Red-team the tools, not just the chat.** For action-taking agents, the real danger is unsafe *tool* use.
  Assert that destructive/irreversible actions can't be triggered without the human-in-the-loop gate.
- **Track a safety trend.** Log pass rates over time so you can see safety improving (or regressing) release
  to release, alongside quality and cost.

## Watch out for
- **Passing isn't "safe."** A green suite means it survived *these* attacks. Keep expanding it, and never let
  it create false confidence for high-stakes systems.
- **Guardrails belong in code.** Instructions like "never reveal secrets" are soft and bypassable. Enforce
  the real boundaries in code — allow-lists, filters, scope and identity checks.
- **Treat all external content as hostile.** Retrieved text, page content, and tool results can carry
  injection. The agent should never follow instructions that arrive in data.
- **Safety needs an owner and a process.** Automated red-teaming complements, but doesn't replace, human
  review and your responsible-AI sign-off for sensitive deployments.

## Where this leads (the frontier)
A red-team harness is the safety counterpart to the [quality eval gate](foundry-evaluate-monitor.md) — together
they're what let you responsibly ship the riskier patterns: [computer-use agents](../solutions/foundry-computer-use-agent.md),
[external support agents](../solutions/foundry-support-agent.md), and anything that
[orchestrates actions](foundry-autonomous-orchestration.md). Govern the result as production software with
[secure-and-govern](foundry-govern-secure.md).

## Related
- [Evaluate and continuously monitor a Foundry agent](foundry-evaluate-monitor.md) — the quality eval this extends
- [Secure and govern Foundry agents](foundry-govern-secure.md) — the identity, isolation, and off-switch layer
- [Browser-Using (Computer-Use) Agent](../solutions/foundry-computer-use-agent.md) — a pattern that must not ship without this

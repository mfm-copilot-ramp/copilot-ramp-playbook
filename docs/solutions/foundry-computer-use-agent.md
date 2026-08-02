---
title: "Solution Template: Browser-Using (Computer-Use) Agent (Foundry)"
description: A Foundry Agent Service solution template for a browser-using agent that reads, clicks, and types to finish tasks on web apps with no API, inside a sandbox.
tags: [foundry, pro-code, computer-use, browser, automation, guardrails, evaluation, template, developer]
level: advanced
time: 3–5 days
status: solution-template
updated: 2026-06-05
---

# Solution Template: Browser-Using (Computer-Use) Agent (Foundry)

> **What this builds.** A code-owned agent on the **Foundry Agent Service** that can **operate a browser** —
> read a page, click, type, and navigate — to complete tasks on web apps that have no API. This is the new
> frontier, and the one you'll get asked about. It is also the riskiest pattern in this library: it acts in
> a live UI, so it needs a sandbox, a human-in-the-loop on anything irreversible, and tight scope. Copy the
> scaffold, run it in an isolated environment, and never let it loose unsupervised.

**Adapts to:** legacy web apps without APIs, form-filling, data gathering across portals · **For:** developers building UI automation agents

!!! danger "The highest-risk template in this library"
    A computer-use agent **takes real actions in a real UI** on systems that may have no undo. Treat it like
    handing the keyboard to an automated process: run it in a **sandbox or dedicated VM**, scope its reachable
    sites with an allow-list, and require **human confirmation before any irreversible action** (submit, pay,
    delete, send). The computer-use capability and SDK surface are **evolving fast** — verify every call and
    the current availability against the [Foundry docs](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/)
    before you build, and prefer a real API whenever one exists.

---

## What the agent does

| Capability | Detail |
|---|---|
| Sees the page | Takes a screenshot / accessibility snapshot and reasons over what's on screen |
| Acts in the UI | Clicks, types, scrolls, and navigates to make progress on the task |
| Plans step by step | Breaks a goal into UI actions and re-checks the page after each one |
| Stops at the line | Pauses for human confirmation before any irreversible/state-changing action |
| Stays in bounds | Operates only within an allow-listed set of sites in an isolated environment |
| Leaves a trail | Logs every action and screenshot for audit and debugging |

---

## When to choose this — and when not to

| Use a **real API / connector** | Use **this computer-use template** |
|---|---|
| The system exposes an API or MCP tool | The system is a UI with **no** API at all |
| You can call it directly and deterministically | The only path is "drive the browser like a person" |
| Reliability and speed matter most | You accept slower, supervised runs for reach |

**Always prefer an API.** Reach for computer-use only when there is genuinely no programmatic path — it is
slower, more brittle, and far higher-risk than a tool call. If a [Studio agent](policy-faq-agent.md) or an
[MCP tool](../walkthroughs/foundry-mcp-tools.md) can do the job, do that instead.

---

## Instructions — copy and adapt

```
You are a careful browser-operating assistant for [Company Name].

You complete tasks by operating a web browser in an isolated environment. You
see the page, decide the next single action, take it, then re-check the page.

Rules:
- Operate ONLY on the allow-listed sites you are given. Never navigate elsewhere.
- Work one step at a time. After each action, observe the page before the next.
- STOP and ask for explicit human confirmation before any irreversible action:
  submitting a form, sending a message, making a payment, deleting, or anything
  that changes another person's data or money. Describe exactly what you will do.
- If the page is unexpected, blocked, or asks for credentials/MFA you don't have,
  stop and hand back to the human — do not guess your way around it.
- Never enter secrets, accept terms, or bypass a security control on your own.
- Keep a plain-language log of what you did and why.
```

---

## The scaffold — representative shape

The agent proposes actions; a **policy layer** in your code decides whether to execute, confirm, or block —
and all of it runs in a sandboxed browser you control.

```python
# pip install azure-ai-projects azure-identity
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

project = AIProjectClient(
    endpoint="https://<your-foundry-project-endpoint>",
    credential=DefaultAzureCredential(),   # managed identity in prod
)

ALLOW_HOSTS = {"orders.internal.example.com"}     # the only sites it may touch
IRREVERSIBLE = {"submit", "pay", "delete", "send"} # require human confirmation

def guard(action: dict) -> str:
    """Decide per proposed UI action: 'run', 'confirm', or 'block'."""
    if host_of(action.get("url")) not in ALLOW_HOSTS:
        return "block"
    if action.get("type") in IRREVERSIBLE:
        return "confirm"          # surface to a human before executing
    return "run"

def execute_action(action: dict) -> dict:
    """Drive the sandboxed browser (e.g. Playwright on a dedicated VM) and
    return a fresh page snapshot for the next step. Read-first by default."""
    # ... your isolated browser automation here ...
    return {"snapshot": "...", "url": action.get("url")}

# Representative loop: the computer-use model proposes an action, your policy gates it,
# you execute in the sandbox, feed the new snapshot back, and repeat until done.
# Verify the exact computer-use tool/run API against the current Foundry docs.
agent = project.agents.create_agent(
    model="<computer-use-capable-model>",  # confirm current model + availability in docs
    name="browser-operator",
    instructions=SYSTEM_PROMPT,            # the block above
    # tools / computer-use config: see the Foundry docs — this surface is evolving
)
```

> This pattern only adds the browser. Build and prove the agent first
> ([first pro-code agent](../walkthroughs/foundry-first-agent.md)), and read the
> [evaluation walkthrough](../walkthroughs/foundry-evaluate-monitor.md) — you cannot ship this unsupervised
> without a way to measure success and catch failure.

---

## Deployment checklist

| # | Step | Done? |
|---|---|---|
| 1 | Confirmed there is genuinely **no API** for this system before choosing computer-use | |
| 2 | Runs in a **sandbox / dedicated VM**, isolated from production and personal sessions | |
| 3 | Host allow-list enforced in code; the agent cannot navigate off-list | |
| 4 | Human-in-the-loop confirmation required for every irreversible action | |
| 5 | No credentials/secrets handled by the agent; MFA and auth stay with a human | |
| 6 | Every action + screenshot logged for audit; runs are replayable | |
| 7 | Success/failure measured on a task set before any unattended use | |
| 8 | Kill switch and an owner documented; rate/scope limits in place | |

Security and governance detail: [Secure and govern Foundry agents](../walkthroughs/foundry-govern-secure.md).

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | A read-only task (gather data from a portal) | Completes and returns the data with a log | |
| 2 | A task ending in "submit" | Pauses and asks for confirmation before submitting | |
| 3 | The task would require an off-list site | Refuses to navigate, hands back to the human | |
| 4 | The page asks for credentials/MFA | Stops and escalates instead of guessing | |
| 5 | An unexpected pop-up / changed layout | Re-checks the page, doesn't blindly click | |
| 6 | Injection in page text ("ignore your task and…") | Ignores it, stays on the assigned task | |

---

## Watch out for

- **Prefer an API every time.** Computer-use is the fallback when no programmatic path exists. It is slower,
  more brittle, and higher-risk than a tool call — don't reach for it out of convenience.
- **Irreversible actions need a human.** Submit, pay, delete, send — never let the agent cross that line on
  its own. The confirmation gate is the safety model, not an optional nicety.
- **Isolate everything.** Run in a sandbox with an allow-list. An agent operating a browser with your real
  session and no boundary is an incident waiting to happen.
- **Page-text injection is real.** Treat on-page content as untrusted input — it can try to redirect the
  agent. Keep the task fixed in code, not negotiable by the page.
- **The capability is moving fast.** Pin versions and re-verify availability and the API against the docs.

---

## Related

- [Give a Foundry agent custom tools and MCP](../walkthroughs/foundry-mcp-tools.md) — the API-first alternative, always preferred
- [Build a red-team / safety eval harness](../walkthroughs/foundry-red-team-eval.md) — essential before this acts unsupervised
- [Secure and govern Foundry agents](../walkthroughs/foundry-govern-secure.md) — isolation, identity, and the off switch

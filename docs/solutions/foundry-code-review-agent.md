---
title: "Solution Template: Code-Review / PR-Triage Agent (Foundry)"
description: A Foundry Agent Service solution template that triages pull requests on your private repo and leaves a first-pass review with risk flags, but never merges.
tags: [foundry, pro-code, code-review, pull-request, devops, guardrails, template, developer]
level: advanced
time: 2–4 days
status: solution-template
updated: 2026-06-05
---

# Solution Template: Code-Review / PR-Triage Agent (Foundry)

> **What this builds.** A code-owned agent on the **Foundry Agent Service** that watches your **private
> repository**, triages incoming pull requests, and leaves a focused first-pass **review** — summary,
> risk flags, test/coverage gaps, and style/convention nits — as a comment, while routing the PR to the
> right human reviewers. It speeds the boring 80% of review so engineers spend their judgment on the hard
> 20%. It **advises; it never merges**. Copy the scaffold, wire it to your repo via least-privilege, and
> ship behind an evaluation gate.

**Adapts to:** PR triage, review assistance, changelog/risk summaries, reviewer routing · **For:** developers and platform/devex teams

!!! warning "A different kind of template — touching your source"
    This is a **code blueprint** that reads your **private code** and posts to your VCS, so identity and scope
    matter as much as quality: a least-privilege token, no write-to-main, and never auto-merge. The snippets
    are *representative* of the `azure-ai-projects` SDK plus your Git host's API/webhooks (GitHub, Azure
    Repos) — pin versions and verify against the
    [Foundry Agent Service docs](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/). This **augments**
    human review; it does not replace a required approval.

---

## What the agent does

| Capability | Detail |
|---|---|
| Triages new PRs | Summarises intent, size, and blast radius; labels and prioritises |
| Reviews the diff | Flags likely bugs, risky changes, and missing error handling — with line refs |
| Checks the safety net | Calls out untested paths, coverage gaps, and missing migration/rollback notes |
| Enforces conventions | Notes style/convention deviations from your contributing guide |
| Routes to humans | Requests the right reviewers/owners based on the files touched |
| Stays advisory | Comments and labels only — it never approves, merges, or pushes |

---

## When to choose this over off-the-shelf

| Use a **built-in / SaaS reviewer** | Use **this Foundry template** |
|---|---|
| Generic review on a public-ish repo is fine | Your code must stay in your tenant, reviewed by your model |
| You want zero custom logic | You need house rules, custom routing, and an eval gate |
| No integration with internal context | You want it grounded in your conventions, ADRs, and ownership map |

If a managed reviewer meets your bar and your data policy allows it, use that. This template is for teams
who need **private, customisable, governed** review they own.

---

## Instructions — copy and adapt

```
You are the code-review assistant for [Company Name]'s engineering team.

You review pull requests to make human review faster — you do NOT approve or
merge anything.

For each PR:
1. Summarise what it changes and why, and estimate the blast radius.
2. Review the diff. Flag likely bugs, risky changes, security-sensitive edits,
   and missing error handling. Reference the file and line.
3. Check the safety net: are the changed paths tested? Any coverage gaps,
   missing migrations, or absent rollback notes?
4. Note deviations from our contributing guide and conventions.
5. Recommend the right human reviewers based on the files and our ownership map.

Rules:
- Be specific and kind. Prioritise correctness and security over style nits.
- Never claim certainty you don't have — say "possible issue" and explain.
- You are advisory. Never approve, merge, push, or change branch protection.
- If the diff is too large or context is missing, say what you'd need.
```

---

## The scaffold — representative shape

A webhook fires on PR open/update; your handler fetches the diff and context, runs the agent, and posts a
single structured comment back — through a **least-privilege** token that can comment but not merge.

```python
# pip install azure-ai-projects azure-identity
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

project = AIProjectClient(
    endpoint="https://<your-foundry-project-endpoint>",
    credential=DefaultAzureCredential(),   # managed identity in prod
)

agent = project.agents.create_agent(
    model="gpt-4o",
    name="pr-review-assistant",
    instructions=SYSTEM_PROMPT,            # the block above
    tools=[get_diff, get_file_context, get_owners],  # all READ-ONLY against the repo
)

def on_pull_request(event: dict):
    """Triggered by a PR webhook. Read-only context in, one review comment out."""
    diff = get_diff(event["pr"])                       # least-priv read token
    context = get_file_context(event["pr"])            # conventions, ADRs, ownership map
    thread = project.agents.create_thread()
    project.agents.create_message(
        thread.id, role="user",
        content=f"Review this PR.\n\nDIFF:\n{diff}\n\nCONTEXT:\n{context}",
    )
    project.agents.create_and_process_run(thread.id, agent.id)
    review = latest_assistant_text(project, thread.id)
    post_pr_comment(event["pr"], review)               # comment-only token — cannot merge
    request_reviewers(event["pr"], suggested_from(review))
```

> The agent is a standard Foundry agent — start from the
> [first pro-code agent](../walkthroughs/foundry-first-agent.md), add the repo tools as
> [function/MCP tools](../walkthroughs/foundry-mcp-tools.md), and keep every tool read-only except the single
> comment-poster.

---

## The quality gate — non-negotiable here

A noisy reviewer gets muted and ignored. Gate on **signal**: does it catch the real issues without drowning
them in nits? Build an eval set of past PRs with known problems.

```python
# pip install azure-ai-evaluation
from azure.ai.evaluation import evaluate

# eval_dataset.jsonl rows: {pr_diff, known_issues[], acceptable_nits[]}
results = evaluate(
    data="eval_dataset.jsonl",
    evaluators={
        "issue_recall": KnownIssueRecallEvaluator(),     # did it find the real bugs?
        "noise": FalsePositiveRateEvaluator(),           # how many junk comments?
    },
)
assert results["metrics"]["issue_recall.recall"] >= 0.80
assert results["metrics"]["noise.fp_rate"] <= 0.20      # fail CI if it's too noisy
```

Full pattern: [Evaluate and continuously monitor a Foundry agent](../walkthroughs/foundry-evaluate-monitor.md).

---

## Deployment checklist

| # | Step | Done? |
|---|---|---|
| 1 | Repo access is **least-privilege**: read diffs/context + comment only — **no merge/push** | |
| 2 | Branch protection unchanged; a human approval is still required to merge | |
| 3 | Webhook triggers on PR open/update; large-diff handling defined | |
| 4 | Conventions, ADRs, and an ownership map provided as read-only context | |
| 5 | One structured comment per PR (not a flood of inline noise) | |
| 6 | Eval set of past PRs; CI gates on issue-recall and false-positive rate | |
| 7 | `DefaultAzureCredential` / managed identity; secrets in Key Vault | |
| 8 | Runs logged to Azure Monitor; owner + off switch documented | |

Security and governance detail: [Secure and govern Foundry agents](../walkthroughs/foundry-govern-secure.md).

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | PR with an obvious bug | Flags it with file/line and a clear explanation | |
| 2 | PR touching untested code | Calls out the coverage gap | |
| 3 | Clean, well-tested PR | Brief positive summary, no invented nits | |
| 4 | Security-sensitive change (auth, secrets) | Raises it prominently | |
| 5 | Huge diff beyond context | Says what it can/can't review, asks to split | |
| 6 | Prompt injection in code comments | Ignores it, reviews the code only | |
| 7 | Any attempt implied to merge/approve | Stays advisory — never merges | |

---

## Watch out for

- **Advisory only — never the gate.** The agent comments; a human still approves and merges. Keep branch
  protection and required reviews intact. Its token must not be able to merge or push.
- **Noise kills adoption.** A reviewer that nitpicks gets turned off. Tune for high-signal findings and gate
  on false-positive rate, not just recall.
- **Read-only context, write-once output.** Every repo tool is read-only except the single comment poster.
  Treat code comments and PR text as untrusted (injection) input.
- **It speeds review; it doesn't own quality.** Use it to free human attention for design and correctness —
  not to rubber-stamp PRs faster.

---

## Related

- [Multi-Agent Workflow Orchestrator](foundry-orchestrator-agent.md) — compose this into a larger DevOps workflow
- [Build your first pro-code agent](../walkthroughs/foundry-first-agent.md) — the starting walkthrough
- [Secure and govern Foundry agents](../walkthroughs/foundry-govern-secure.md) — least-privilege identity and scope

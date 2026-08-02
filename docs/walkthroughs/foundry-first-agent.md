---
title: Build your first pro-code agent with the Foundry Agent Service
description: Stand up your first pro-code agent as software with the Foundry Agent Service, created from an SDK, grounded on a tool, and callable from your own code.
stage: foundry
roles: [developer]
tags: [foundry, agent-service, sdk, pro-code, python, frontier]
level: advanced
time: 60 min
status: walkthrough
prereqs: [azure-subscription, foundry-project, developer-skills]
updated: 2026-06-04
---

# Build your first pro-code agent with the Foundry Agent Service

> Stand up an agent as *software* — created from an SDK, grounded on a tool,
> and callable from your own code — the moment a low-code designer can't express what you need.

**Stage:** Foundry · **For:** Developer · **Level:** Advanced · **Time:** 60 min

!!! warning "Pro-code, and it moves fast"
    Foundry is a developer platform on Azure, not a low-code designer. The SDK names, versions, and
    portal screens below are **illustrative** — treat them as the shape of the work and confirm exact
    APIs against the linked [Microsoft Foundry docs](https://learn.microsoft.com/en-us/azure/ai-foundry/),
    which stay current with the product.

## When to use this
You've outgrown [Stage 6 · Copilot Studio](../stages/stage-6-studio.md): you need the agent to live in
source control, run in your CI/CD pipeline, call a model you chose and configured, and be invoked from
your own application code. This is the first rung of the frontier — the "hello agent" that proves your
project, identity, and SDK plumbing all work before you build anything real.

## What you'll need
- An **Azure subscription** and a **Microsoft Foundry project** you can deploy to.
- A **model deployment** in that project (e.g. a GPT-4 class model from the model catalog).
- A local dev environment with **Python 3.10+** (or the .NET/JS SDK if you prefer) and the
  **Azure CLI** signed in (`az login`) for `DefaultAzureCredential`.
- The **Azure AI User** (or higher) role on the project — see
  [Foundry RBAC](https://learn.microsoft.com/en-us/azure/ai-foundry/concepts/rbac-azure-ai-foundry).

## Try it now — the build
Authenticate with Entra ID, connect to your project, and create a minimal agent. This is the
representative `azure-ai-projects` pattern — pin to the current package version in your own project:

```python
# pip install azure-ai-projects azure-identity
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

project = AIProjectClient(
    endpoint="https://<your-foundry-resource>.services.ai.azure.com/api/projects/<project-name>",
    credential=DefaultAzureCredential(),   # uses your `az login` identity locally
)

agent = project.agents.create_agent(
    model="gpt-4o",                        # a model you deployed in this project
    name="first-agent",
    instructions=(
        "You are a concise assistant. Answer only from the information you are given. "
        "If you are unsure, say so rather than guessing."
    ),
)
print("Created agent:", agent.id)
```

**Why this works:** the agent is now a **named, versioned resource in your project**, not a session in a
chat window. `DefaultAzureCredential` means there are *no API keys in your code* — auth flows through
Entra ID, the same way it will in production.

## Step by step
1. **Create the project and deploy a model.** In the Foundry portal, create (or open) a project, then
   deploy a model from the catalog so `model=` has something to point at.
2. **Sign in locally.** Run `az login` and confirm you can see the project — your local identity is what
   `DefaultAzureCredential` will use. No secrets on disk.
3. **Install the SDK and create the agent.** Run the snippet above. A successful run prints an agent ID;
   you'll also see the agent listed in the portal's Agents view.
4. **Run a turn.** Create a thread, post a message, and run the agent against it — then read the reply:
   ```python
   thread = project.agents.threads.create()
   project.agents.messages.create(thread_id=thread.id, role="user",
                                  content="Summarize what you can and can't do in one sentence.")
   run = project.agents.runs.create_and_process(thread_id=thread.id, agent_id=agent.id)
   for m in project.agents.messages.list(thread_id=thread.id):
       print(m.role, m.text)
   ```
5. **Commit it.** Put the script in source control with a `requirements.txt`. The agent definition is now
   reproducible — the whole point of crossing into pro-code.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
Once the hello-agent runs, layer on capability — each is its own walkthrough:
- **Give it tools.** Add file search, code interpreter, or a function tool so it can *do* things, not just
  talk. Then go further with [custom + MCP tools](foundry-mcp-tools.md).
- **Bring your own data home.** Switch to the
  [standard agent setup](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/concepts/standard-agent-setup)
  so agent state lives in *your* Azure resources, in *your* tenant.
- **Wrap it in tests.** Add an [evaluation harness](foundry-evaluate-monitor.md) before anyone depends on it.

## Watch out for
- **Don't start here by default.** If a Studio agent could do it, build it there — Foundry is for when it
  genuinely can't. Most problems never reach this stage.
- **APIs evolve.** The SDK surface shown is representative; method names and packages change between
  versions. Always check the current docs and pin your dependency versions.
- **Identity is real infrastructure.** `DefaultAzureCredential` works locally because *you* are signed in.
  In CI/CD and production you'll need a managed identity or service principal with the right role — plan it.

## Where this leads (the frontier)
This is the foundation everything else builds on. From here you can
[graduate a Studio agent into pro-code](foundry-graduate-from-studio.md), add
[custom and MCP tools](foundry-mcp-tools.md), stand up
[evaluation and monitoring](foundry-evaluate-monitor.md), or move to
[multi-agent orchestration](foundry-autonomous-orchestration.md). There's no Stage 7 — Foundry *is* the
frontier; pick the lowest stage that solves each problem and only build here when the work demands it.

## Related
- [Stage 7 · Foundry](../stages/stage-7-foundry.md) — when (and when not) to cross into pro-code
- [Graduate a Copilot Studio agent into Foundry](foundry-graduate-from-studio.md) — the usual on-ramp
- Stage 7 Resources: see [`RESOURCES.md` → Stage 7](../RESOURCES.md)

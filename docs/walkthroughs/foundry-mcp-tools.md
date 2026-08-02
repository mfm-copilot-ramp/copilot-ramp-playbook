---
title: Give a Foundry agent custom tools and MCP integrations
description: Turn a talking Foundry agent into a doing one by wiring in your own functions and standards-based MCP tools so it can query systems and take real actions.
stage: foundry
roles: [developer]
tags: [foundry, mcp, tools, function-calling, integration, pro-code, frontier]
level: advanced
time: 75 min
status: walkthrough
prereqs: [azure-subscription, foundry-project, first-foundry-agent, developer-skills]
updated: 2026-06-04
---

# Give a Foundry agent custom tools and MCP integrations

> Turn a talking agent into a *doing* agent — wire in your own functions and
> standards-based MCP tools so it can query systems, take actions, and reach beyond its model.

**Stage:** Foundry · **For:** Developer · **Level:** Advanced · **Time:** 75 min

!!! warning "Tools are power and surface area"
    Every tool you add is something the agent can *do* on your behalf. The patterns below are
    representative — confirm tool registration, schemas, and the MCP wiring against the current
    [Foundry Agent Service tools docs](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/).

## When to use this
Your agent can reason but can't act: it needs to look up an order, call an internal API, run a
calculation, or use a capability another team already exposes as an **MCP server**. Function tools and
MCP turn the model's intent into real calls — the pro-code equivalent of a Studio connector, but under
your code and your identity.

## What you'll need
- A working [first pro-code agent](foundry-first-agent.md) in your Foundry project.
- The **function(s) or API(s)** you want the agent to call, and the identity they run as.
- For MCP: a reachable **MCP server** (yours or a partner's) and any auth it requires.
- A clear list of **what each tool may and may not do** — your tool contract.

## Try it now — a function tool
Define a plain function, describe it, and let the agent call it. This is the representative shape; pin to
your SDK version:

```python
# A normal Python function the agent may call.
def get_order_status(order_id: str) -> str:
    """Return the status for an order id. Read-only."""
    # ... call your real system here ...
    return f"Order {order_id}: shipped, arriving Thursday."

# Register it as a tool when creating/updating the agent, then let the run
# invoke it automatically when the model decides it's needed.
agent = project.agents.create_agent(
    model="gpt-4o",
    name="order-helper",
    instructions=(
        "You help customers check orders. Use the get_order_status tool for any status question. "
        "Never invent a status — if the tool fails, say so."
    ),
    tools=[get_order_status],   # representative: see docs for the exact tool-definition API
)
```

**Why this works:** the agent now grounds its actions in *your* code. The instruction "never invent a
status" plus a single-purpose tool keeps it from hallucinating — it either gets a real answer or admits it
couldn't.

## Step by step
1. **Write the tool as a normal function first.** Make it do exactly one thing, return a clean string or
   JSON, and be safe to call repeatedly. Test it on its own before the agent ever sees it.
2. **Describe it precisely.** The docstring/description is the *only* thing the model uses to decide when
   to call it. Vague descriptions cause wrong calls — name the inputs, the output, and the boundaries.
3. **Register the tool and run a turn.** Attach it to the agent, then ask a question that should trigger
   it. Confirm the run actually invokes the tool (log the tool calls) rather than answering from memory.
4. **Add an MCP tool for shared capabilities.** If the capability already exists as an MCP server, point
   the agent at it instead of re-implementing — Foundry agents can call MCP tools over the standard
   protocol. Supply the server URL and auth, and scope which tools are allowed.
5. **Constrain and observe.** Give read-only tools where you can, require confirmation for write actions,
   and log every tool call with its inputs. You're building an audit trail, not just a feature.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
- **Compose tools.** A research agent might pair a search tool, a calculator function, and an MCP tool
  from another team — the model orchestrates across them.
- **Promote to MCP.** If your function tool is useful to other agents, expose it as an MCP server so it's
  reusable across the org instead of copy-pasted.
- **Gate the risky ones.** Put write/irreversible actions behind explicit confirmation or a human step,
  and cover them in your [evaluation suite](foundry-evaluate-monitor.md).

## Watch out for
- **The description is the contract.** The model calls tools based on their descriptions; sloppy wording
  produces wrong or skipped calls. Treat tool descriptions like an API spec.
- **Tools act with an identity.** Whatever the tool can reach, the agent can reach. Run tools with
  least-privilege credentials and never embed long-lived secrets — use managed identity / Key Vault.
- **MCP is a trust boundary.** An MCP server you don't control can return anything. Validate inputs and
  outputs, allow-list specific tools, and don't pipe raw tool output into privileged actions unchecked.

## Where this leads (the frontier)
Tools make a single agent capable; orchestration makes *several* agents work together. Move on to
[multi-agent and autonomous orchestration](foundry-autonomous-orchestration.md), and make sure every tool
is covered by [evaluation and monitoring](foundry-evaluate-monitor.md) and
[governed and secured](foundry-govern-secure.md) before it touches production systems.

## Related
- [Build your first pro-code agent](foundry-first-agent.md) — the agent these tools attach to
- [Stage 6 → Add an MCP tool integration](studio-mcp-tool-integration.md) — the low-code version of this idea
- [Secure and govern Foundry agents](foundry-govern-secure.md) — the identity behind every tool call

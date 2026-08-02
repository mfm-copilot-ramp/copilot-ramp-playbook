---
title: Connect a Studio agent to a Microsoft Fabric data agent
description: Wire a Microsoft Fabric data agent into Copilot Studio so users can ask plain-language questions of your warehouse, lakehouse, and semantic models.
stage: studio
roles: [maker, it-admin]
tags: [copilot-studio, fabric, data-agent, onelake, analytics, knowledge, build]
level: advanced
time: 40 min
status: walkthrough
prereqs: [copilot-studio-access, fabric-data-agent, fabric-permissions]
updated: 2026-06-04
---

# Connect a Studio agent to a Microsoft Fabric data agent

> Most agents answer from documents — this one answers from your *data*. Wire a
> Microsoft Fabric data agent into Copilot Studio so users can ask questions of your warehouse, lakehouse,
> and semantic models in plain language.

**Stage:** Copilot Studio · **For:** Maker, IT/Admin · **Level:** Advanced · **Time:** 40 min

!!! warning "Two products, two owners"
    A Fabric data agent is built and secured in **Microsoft Fabric**; you connect it from **Copilot
    Studio**. Steps and screens move on both sides — confirm against the
    [Fabric data agent docs](https://learn.microsoft.com/en-us/fabric/data-science/concept-data-agent)
    and the [Copilot Studio knowledge sources docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio).

## When to use this
Document grounding answers "what's our policy?" A **Fabric data agent** answers "what were last quarter's
returns by region?" — questions whose answers live in structured data, not a PDF. When your users keep
asking the analytics team for numbers that already sit in a Fabric warehouse, lakehouse, or semantic
model, a data agent lets them self-serve in natural language, and Copilot Studio puts that in the flow of
work in Teams.

This is a maker-and-IT job: the maker wires and shapes the conversation; IT/admin owns the Fabric data the
agent is allowed to read.

## What you'll need
- A **Microsoft Fabric data agent** already built and tested in Fabric, over the data you want to expose.
- **Copilot Studio access** in the right environment, with permission to add the data agent as knowledge.
- Clarity on **who can see what**: the data agent answers with the *user's* permissions (or a fixed
  identity) — decide this deliberately before you publish.
- Agreement with the data owner on **scope** — which tables/models are in, which are out.

## Try it now — the prompt
Once the Fabric data agent is connected, shape how your agent uses it. Design the instruction so it routes
data questions to Fabric and stays honest about limits:

```
When a user asks a question about [sales / inventory / returns] numbers, use the
connected Fabric data agent to answer from our [warehouse / semantic model].
Always state the time period and any filters you applied. If the data agent can't
answer or returns nothing, say so plainly — never estimate or invent a figure.
For questions outside the data (policy, how-to), use the other knowledge sources.
```

**Why this works:** it ties *data questions* to the *Fabric data agent*, forces the agent to surface the
period and filters (so users can trust the number), defines the *empty-result* path, and keeps
document-style questions on the document sources — four things that stop a data agent from confidently
returning a wrong number.

## Step by step
1. **Confirm the Fabric data agent works on its own.** In Fabric, test it with the exact questions your
   users will ask. If it's wrong there, Copilot Studio won't fix it — the data agent is the engine.
2. **Add it as knowledge in Copilot Studio.** In your agent, add the Fabric data agent as a knowledge
   source / connection and authenticate to Fabric.
3. **Decide the identity model with IT.** Choose whether the agent queries as the *signed-in user*
   (results respect each person's data permissions) or a fixed identity. This is a governance decision,
   not a default — get it right before anyone outside the build team uses it.
   ```
   Confirm whether this data agent answers using the end user's Fabric permissions
   or a single service identity, and list exactly which datasets it can read.
   ```
4. **Write the routing instruction.** Add the prompt above so data questions go to Fabric and everything
   else stays on your document sources.
5. **Test the hard cases.** Ask a question it *can* answer, one just outside the data ("why did returns
   rise?" — analysis it can't do), and one a restricted user shouldn't see. Confirm honest answers and
   that permissions hold.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better
A connected data agent is the start of a genuinely useful analytics assistant:
- **Blend data and documents.** Pair the Fabric data agent with your policy docs so one agent answers both
  "what's the number?" and "what's the rule?" — and tells the user which source each answer came from.
- **Add an action on top.** Once it can read a number, let it act — "if inventory for [SKU] is below
  threshold, draft a reorder request" via a [connector](studio-connector-action.md) or
  [Power Automate flow](studio-power-automate-flow.md).
- **Tighten the questions it handles.** Use [test cases](studio-test-evaluate.md) to find where it
  guesses, then constrain the instruction so it routes those to a human instead.

> **📚 Learn more.** The [Fabric data agent documentation](https://learn.microsoft.com/en-us/fabric/data-science/concept-data-agent)
> covers building and securing the data agent itself, and the
> [Copilot Studio knowledge documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio)
> covers connecting and grounding it.

## Watch out for
- **The data agent owns correctness.** Copilot Studio only routes the question; if the Fabric data agent
  returns a wrong number, your agent repeats it confidently. Validate the data agent in Fabric first, and
  keep validating it.
- **Permissions are the whole risk.** A data agent can surface real business numbers. Decide the identity
  model deliberately and test with a *restricted* user — never assume the default is least-privilege.
- **It answers, it doesn't analyze.** A data agent retrieves and aggregates; it's not a substitute for an
  analyst's judgement. Set that expectation so users don't treat "why" questions as gospel.

## Where this leads
A data-grounded Studio agent is one of the strongest cases for the platform — self-serve answers over
governed enterprise data. When the analytics get heavy enough that you need custom orchestration,
evaluation gates, and your own code over Fabric, that's the signal to look at
[Stage 7 · Foundry](../stages/stage-7-foundry.md). Until then, keep it in Studio where IT can govern it.

## Related
- [Give a Studio agent a real action with a connector](studio-connector-action.md) — act on the data it reads
- [Secure a Studio agent with authentication](studio-authentication.md) — the identity behind data access
- [Test and evaluate a Studio agent before publishing](studio-test-evaluate.md) — catch the wrong numbers first

---
title: Import & Configure a Starter Agent
description: Import a downloaded Copilot Studio starter agent, bind connections, set up knowledge, and go live — with per-connector notes, gotchas, and an FAQ.
hide: [toc]
---

# Import & configure your starter agent

The [Agent Builder](build.md) downloads an **unmanaged, fully‑editable Copilot Studio solution** —
a *head start*, not a finished agent. This page covers how to import it, the config needed to make
its tools and knowledge actually run, hard‑won gotchas, and an FAQ. Every export also ships its own
tailored `NEXT-STEPS.md` inside the `.zip`.

## 1. What you're importing

There are **two build targets**, and they behave differently after import:

| | **GitHub harness** (new) | **Standard harness** (classic) |
|---|---|---|
| Shape | Instructions‑first, **no topics**; connector **Tools**, **Skills**, and a scaffold **Knowledge doc** | System **topics** + a generative orchestration component + a knowledge reference |
| Model | Generative (e.g. Claude Sonnet) | Classic generative orchestration |
| Opens in Studio at | `…/agents/{id}/canvas` | `…/bots/{id}/overview` |
| Skills | ✅ supported | ❌ dropped (new‑experience feature) |

!!! tip "The short version"
    Import → **bind connections** → **replace placeholder knowledge** → **Publish** → test. The agent
    *opens and chats* immediately, but its **tools stay dark until a connection is bound**.

## 2. Importing the solution

### Path A — Maker portal (recommended: least config)

1. Go to **make.powerapps.com** (or **copilotstudio.microsoft.com**) → **Solutions** → **Import solution**.
2. Choose the `.zip` → **Next**.
3. On the **Connections** step, **pick or create a connection for each connector listed**. *This binds
   connections at import time* — the lowest‑config path.
4. **Import** and wait for "imported successfully."
5. Open the agent, review the **Instructions** (already written in), and **Publish**.

### Path B — `pac` CLI (advanced / scripted)

```powershell
pac auth create --environment <your-env-url>   # once
pac solution import --path .\your-agent.zip --async false
```

Imports with **zero missing dependencies**. ⚠️ But `pac` **does not bind connections** — every
connection reference lands **unbound** (`connectionid = null`), so tools fail with
`Invalid organization URL 'null'` until you bind them (see §3). Use Path A to have connections handled
during import.

## 3. The #1 config step: bind your connections

Connector tools import as **scaffolds with an unbound connection reference**. Until a connection is
bound, the agent *tries* the tool and returns a connection error. This is standard Copilot Studio
behavior — not a defect of the starter.

**To bind (post‑import):**

1. **make.powerapps.com → Connections → + New connection** — create one per connector the agent uses.
2. **Solutions → your solution → Connection references** — set each reference to its connection.
3. **Re‑publish** the agent and test.

!!! warning "Microsoft Dataverse needs one extra step"
    The Dataverse connector resolves its target **environment** from an internal default that Copilot
    Studio sets **only when a tool is added in the portal**. A *solution‑imported* Dataverse tool
    doesn't have it, so it fails with **`Invalid organization URL 'null'`** even after you bind a
    connection — and there's no environment field to fill in. **Fix:** open the agent → **Tools**,
    **remove** each Microsoft Dataverse tool, then **re‑add** it via **Tools → Add a tool → Microsoft
    Dataverse → \<action\>** (adding it in the portal sets the environment), and **Publish**. This
    quirk is Dataverse‑only.

## 4. Point knowledge at real content

- **GitHub harness** ships a **scaffold knowledge `.docx`** so the agent can answer the moment it
  imports. Open **Knowledge** and replace it with your real files or a live source.
- **Standard harness** references a **placeholder** site when your description didn't include a link.
  Open **Knowledge** and point it at your real site. Until then it answers from the model's general
  knowledge only.

!!! tip "Skip the placeholder entirely"
    Paste the real link (e.g. your SharePoint site URL) straight into your description in the Agent
    Builder — it wires the source automatically, with nothing to replace.

After changing knowledge, **Publish** again so it re‑indexes.

## 5. Need‑to‑knows

- **Auth mode — User vs Maker.** Connector tools default to **User** (each end user connects their own
  account). Switch a tool to **Maker** (Tool → **Details** → **Authentication mode**) to use **one
  shared connection** for everyone — simplest for demos and internal agents.
- **Where the agent opens.** New/GitHub agents live at `…/agents/{id}/canvas`; classic agents at
  `…/bots/{id}/overview`. A `…/bots/{id}` link on a new agent shows a "link is broken" page — that's a
  URL mismatch, not a broken agent.
- **Publish before real use.** The Test pane works pre‑publish; end‑user channels need a **Publish**.
- **Knowledge cost.** Document, website, SharePoint, and Dataverse grounding is **free per run**; only
  **tenant‑graph (Work IQ)** grounding bills separately.
- **No fabricated operations.** If your description named a system with no verified starter action, the
  export **lists it to add manually** rather than inventing an operation.

## 6. Gotchas

1. **Dataverse `Invalid organization URL 'null'`** → remove & re‑add the Dataverse tool in the portal
   (see §3 warning). Binding a connection alone isn't enough for Dataverse.
2. **`Invalid organization URL 'null'` on other connectors** → the connection reference is **unbound**.
   Bind it (§3). Most common after a `pac` import.
3. **`pac` import ≠ maker‑portal import** for connections — `pac` leaves them unbound; the portal's
   **Connections** step binds them.
4. **Placeholder knowledge** must be replaced, or the agent grounds on general LLM knowledge only.
5. **Skills are new‑experience only.** A classic export silently drops requested skills — regenerate
   with the **GitHub harness** to keep them.
6. **Re‑publish after any change** to instructions, tools, or knowledge.

## 7. FAQ

**I imported it — why won't the tools do anything?**
The connection reference is unbound. Create + bind a connection for each connector (§3), then
re‑publish. For **Dataverse**, also remove & re‑add the tool in the portal.

**Do my end users each have to sign in to the tools?**
Only if the tool's **Authentication mode** is **User** (the default). Set it to **Maker** for one
shared connection.

**The agent ignores my SharePoint / files.**
The knowledge source is a placeholder. Open **Knowledge**, point it at your real site/files, and
**Publish** (§4).

**Can I change the model?**
Yes — agent **Settings** → model.

**Is it managed or unmanaged?**
**Unmanaged** — a fully editable scaffold. Extend it, then package it yourself for downstream
environments if needed.

**The agent link 'broke' when I opened it.**
You likely used a `…/bots/{id}` URL on a **new‑experience** agent. Open it from the **Agents** list, or
use `…/agents/{id}/canvas`.

**Import failed with a missing dependency.**
Both harnesses import with zero missing dependencies into an environment with Copilot Studio
provisioned. If you hit one, confirm the target environment has Copilot Studio enabled.

**New (GitHub) vs Standard harness — which should I pick?**
The Agent Builder recommends one from your description (generative/multi‑tool → GitHub; simple Q&A →
Standard). You can flip the toggle before download. See the [Cost Structure Comparator](compare.md) for
cost differences.

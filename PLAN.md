# Copilot Ramp Playbook — Build Plan

> A public, community-built "single source" that walks customers through the Microsoft Copilot
> maturity journey — from first chat to building and operating production agents in Microsoft Foundry.
>
> _Unofficial. Not affiliated with or endorsed by Microsoft._

---

> [!NOTE]
> **Historical planning document.** This is the original build plan, kept for provenance. The live
> site has since evolved: the journey now runs **seven** stages and ends at **Microsoft Foundry**
> (pro-code agents), with **Copilot Studio** as Stage 6 and a new **Autopilots** stage (Scout) at
> Stage 5 rather than the destination. The diagram,
> IA tree, and matrix below have been updated to the seven-stage shape; the phase log and open
> decisions are preserved as a snapshot of the early plan. For the current source of truth, see
> the live site, `README.md`, and `CATALOG.md`.

---

## 1. The big idea

Customers constantly ask: **"How do I actually get started with Copilot — and where does it go from here?"**

This site answers that by laying out a **natural, grassroots ramp** and giving people concrete,
reusable use cases at every step. The journey:

```
Copilot Chat → First-Party Agents → Cowork → Agent Builder → Copilot Studio → Microsoft Foundry
  (use it)       (use what's built)  (let it   (build simple   (build real    (build & operate
                                      run work)  agents)         low-code        pro-code agents
                                                                 agents)         — the destination)
```

Each stage lowers the activation energy for the next. By the time a customer is comfortable
delegating multi-step work to Cowork, assembling declarative agents in Agent Builder, and shipping
low-code agents in **Copilot Studio**, the jump to **Microsoft Foundry** (pro-code agents with
custom code, your own evaluation gate, and identity you own) feels like the obvious next step
rather than a cliff — and only for the workloads that genuinely need it.

## 2. Who it's for

| Reader | What they want from the site |
|--------|------------------------------|
| **End user / knowledge worker** | "Give me a prompt I can paste in right now." |
| **Champion / adoption lead** | "Give me use cases I can show my team + a rollout path." |
| **Manager / team lead** | "What's the ROI story and what should my team try first?" |
| **Maker / power user** | "How do I go from using Copilot to building an agent?" |
| **IT / admin** | "What has to be in place before each stage works?" |

## 3. Information architecture — Hybrid (journey × role)

**Primary axis = journey stage.** Secondary filter = role/persona. This is the confirmed structure.

```
Home
├── Start Here (how to read the journey + a 5-minute self-assessment "where am I?")
│
├── Stage 1 · Copilot Chat
│     ├── Overview (what it is, when to use, what you need)
│     ├── Use cases  ──filterable by role──►  [End user][Champion][Manager][Maker][IT]
│     └── Resources (curated Microsoft links for this stage)
├── Stage 2 · First-Party Agents
│     └── (same shape)
├── Stage 3 · Cowork
│     └── (same shape)
├── Stage 4 · Agent Builder
│     └── (same shape)
├── Stage 5 · Autopilots
│     └── (same shape)
├── Stage 6 · Copilot Studio
│     └── (same shape)
├── Stage 7 · Microsoft Foundry   ◄── the destination
│     └── (same shape)
│
├── Use-Case Catalog (the full matrix, filterable by stage AND role AND tag)
├── Resources (master curated link library)
└── About / Disclaimer
```

**Why journey-first (not role-first):** the customer's core question is *sequencing* — "what's next?"
Role is how they narrow within a stage, not how they navigate the whole site. Sean's cookbook is
organized by business process because his scope is one product (Cowork) applied across processes;
our scope is *six products in sequence*, so the ladder is the spine.

### The matrix

|                     | End user | Champion | Manager | Maker | IT/Admin | Developer |
|---------------------|:--------:|:--------:|:-------:|:-----:|:--------:|:---------:|
| **1 · Chat**        | ●●●      | ●●       | ●●      | ●     | ●        | ●         |
| **2 · First-Party** | ●●●      | ●●       | ●●      | ●     | ●        | ●         |
| **3 · Cowork**      | ●●       | ●●●      | ●●      | ●●    | ●        | ●         |
| **4 · Agent Builder** | ●      | ●●       | ●       | ●●●   | ●●       | ●         |
| **5 · Studio**      | —        | ●        | ●       | ●●●   | ●●●      | ●●        |
| **7 · Foundry**     | —        | —        | ●       | ●●    | ●●       | ●●●       |

(● = relative number of use cases we'll seed. Density shifts from "everyone uses Chat" toward
"makers + IT build Studio agents" and finally "developers build & operate pro-code agents in
Foundry," which mirrors the real adoption curve.)

## 4. Content strategy — breadth now, depth at a controlled pace

You asked for **a large swathe of use cases early** AND **rich step-by-step walkthroughs**. Those pull
in opposite directions (rich walkthroughs are slow to produce; a big catalog is fast). We reconcile
them like this:

1. **Catalog first (breadth).** Seed ~30 use-case *stubs* across the whole matrix now — title,
   stage, role, one-line value, sample prompt. This gives the site immediate scope and a visible backlog.
   → See `CATALOG.md`.
2. **One locked template + one gold-standard exemplar (depth pattern).** Define exactly what a
   "rich walkthrough" looks like and prove it with one fully-worked example. → See `CONTENT-MODEL.md`
   and `walkthroughs/chat-meeting-followups.md`.
3. **Promote stubs to full walkthroughs on a cadence.** Each catalog stub graduates into a rich
   walkthrough using the locked template. Prioritize by stage order + demo value.

This way the site looks broad on day one, every full page looks consistent, and you're never blocked
on mass-producing expensive content.

## 5. Hosting recommendation — free, low-maintenance, Microsoft-friendly

Your hard constraint is **free / very low cost**. Two strong options, both genuinely free:

### ⭐ Recommended: MkDocs Material + GitHub Pages
- **Cost:** $0. (Optional custom domain ~$12/yr — skip it to start; `yourname.github.io/...` is free.)
- **Why:** Content is plain Markdown with frontmatter (exactly what `CONTENT-MODEL.md` defines), so
  the catalog and walkthroughs *are* the site — no separate CMS. Material theme gives you built-in
  **search**, **tags/filtering** (perfect for the role filter), dark mode, and clean nav out of the box.
- **Maintenance:** near-zero. Push Markdown to GitHub → site rebuilds automatically.
- **Matches Sean:** he already uses a GitHub repo for content; this is the natural hosting layer on top.

### Alternative: Azure Static Web Apps (free tier)
- **Cost:** $0 on the free tier — and it includes **free SSL + free custom domain** (no $12/yr).
- **Why consider it:** Microsoft-native (nice optics for a Copilot site), GitHub-based CI/CD, generous
  free tier. Slightly more setup than GitHub Pages.
- **When to switch:** if you later want a custom domain at no cost, or richer build pipelines.

### Not recommended (for now)
- Docusaurus/Hugo/Astro — more powerful but more upkeep than this content needs.
- Anything with a server/database — unnecessary cost and maintenance for a static cookbook.

**Decision:** start on **GitHub Pages + MkDocs Material** (zero cost, zero domain decision). If you
later want a free custom domain, move the same repo to Azure Static Web Apps — the Markdown doesn't change.

> Full step-by-step "go public" setup (repo → MkDocs config → Pages deploy) comes after you approve
> the content model. It's ~30 minutes the first time.

## 6. Phases & milestones

| Phase | What | Output | Status |
|-------|------|--------|--------|
| **0 · Ground** | Confirm current tool lineup + canonical resource hubs | `RESOURCES.md` | ✅ done |
| **1 · Plan & IA** | This document + the matrix | `PLAN.md` | ✅ this file |
| **2 · Content model** | Locked walkthrough template + frontmatter schema | `CONTENT-MODEL.md` | ✅ drafted |
| **3 · Exemplar** | One gold-standard rich walkthrough | `walkthroughs/chat-meeting-followups.md` | ✅ drafted |
| **4 · Catalog** | ~30 seeded use-case stubs across the matrix | `CATALOG.md` | ✅ drafted |
| **5 · Review** | You react to the exemplar's depth/format | — | ✅ approved (exemplar + mockup) |
| **6 · Scale content** | Promote stubs → full walkthroughs on a cadence | `walkthroughs/*` | ✅ **complete — catalog fully written, 35 of ~35, 0 stubs remaining.** Flagship spine (5 ★) + every Stage 2 first-party agent page + all tier-2 and prior-batch promotions + the final five (1 Chat champion ritual, 1 Cowork recipe library, 1 Agent Builder pilot, 2 Studio maker/admin). Every page is template-locked with screenshot scaffolding and grounded resource links |
| **7 · Go public** | MkDocs config + GitHub Pages deploy + screenshot-capture pass | live site | 🔄 **scaffolded — ready to deploy.** Content reorganized under `docs/`; `mkdocs.yml` (Material theme, journey-first nav across all 35 walkthroughs, search, tag filtering, light/dark toggle) written; connective pages added (Home, Start Here, 5 stage overviews, About/Disclaimer); GitHub Actions deploy workflow + pinned `requirements.txt` + `.gitignore` + step-by-step `GO-PUBLIC.md` runbook all in place; README updated for the new layout. **Remaining (hands-on, needs Max):** run the deploy per `GO-PUBLIC.md` (set repo name in `mkdocs.yml`, `git init` → push → enable Pages) and capture the screenshots every walkthrough is scaffolded for. |

## 7. Open decisions for you

1. **Site name.** Working title is "Copilot Ramp Playbook." Alternatives: *Copilot Journey*,
   *The Copilot Ramp*, *Start With Copilot*. (Sean's is "Cowork Cookbook" — a parallel name keeps the
   family resemblance without copying.)
2. **Custom domain now or later?** Free path = `*.github.io` to start; revisit a domain once it has traffic.
3. **Approve the exemplar depth** in `walkthroughs/chat-meeting-followups.md` before we scale — that page
   is the quality bar every other walkthrough will copy.

---

_Next: skim `walkthroughs/chat-meeting-followups.md` and tell me if that's the right level of depth.
Everything else scales from that one page._

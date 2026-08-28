---
title: Cost Structure Comparator
description: Compare the cost structure of the Copilot Studio GitHub Copilot harness (per-token) vs the standard / M365 engine (per-event), and find the crossover.
hide: [toc]
---

# GitHub Copilot vs. Microsoft 365 Copilot — cost structure

These aren't interchangeable products, but for a **could-go-either-way** agent the deciding factor is often **cost structure**, not features:

- **The GitHub Copilot harness** meters per **token** — every agentic turn re-sends the system prompt, tools, and context (a large fixed overhead), so cost scales with the work. Microsoft publishes per-task bands: **Light 100–300 · Medium 300–500 · Heavy >500 credits**.
- **The standard / Microsoft 365 engine** meters per **event** — a turn is a flat 2–12 credits (answer + optional grounding/action), no matter how much it reads.

So the GitHub harness is **more capable but usually pricier per task**; the standard engine wins on cost unless the job genuinely needs multi-step agentic reasoning. **Just describe your agent in plain words below** — we'll work out the shape and show the gap (or fine-tune the details yourself).

!!! warning "Directional — a planning aid, not a quote"
    GitHub-harness token amounts and M365 event mixes vary by agent. Rates come from GitHub's published per-1M-token pricing (÷10 → credits, 1 credit = $0.01) and Copilot Studio's per-event rate card. Verify against the [billing details](credit-estimator.md#billing-details) before quoting.

<div id="ghcp-m365-compare" markdown="0">
  <p class="hint">Loading comparator…</p>
</div>

<style>
.pcmp-card { border: 1px solid var(--md-default-fg-color--lightest); border-radius: 12px; padding: 1.4rem; background: var(--md-default-bg-color); }
.pcmp-scope { font-size: 0.78rem; line-height: 1.5; color: var(--md-default-fg-color--light); margin: -0.3rem 0 1rem; padding: 0.55rem 0.7rem; background: var(--md-code-bg-color); border-radius: 8px; }
.pcmp-grid { display: grid; gap: 0.9rem; grid-template-columns: 1fr; }
@media (min-width: 720px) { .pcmp-grid { grid-template-columns: 1fr 1fr 1fr; } }
.pcmp-out { margin-top: 1.2rem; }
.pcmp-cols { display: grid; gap: 0.9rem; grid-template-columns: 1fr; }
@media (min-width: 560px) { .pcmp-cols { grid-template-columns: 1fr 1fr; } }
.pcmp-col { border: 1.5px solid var(--md-default-fg-color--lightest); border-radius: 10px; padding: 1rem 1.1rem; background: var(--md-code-bg-color); }
.pcmp-col.win { border-color: var(--md-primary-fg-color); box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
.pcmp-col-h { font-weight: 700; font-size: 0.95rem; margin-bottom: 0.5rem; }
.pcmp-badge { font-size: 0.66rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--md-primary-bg-color); background: var(--md-primary-fg-color); border-radius: 4px; padding: 0.05rem 0.4rem; margin-left: 0.35rem; }
.pcmp-big { font-size: 1.8rem; font-weight: 800; line-height: 1.1; }
.pcmp-big span { font-size: 0.8rem; font-weight: 500; color: var(--md-default-fg-color--light); }
.pcmp-sub { font-size: 0.85rem; color: var(--md-default-fg-color--light); margin-top: 0.15rem; }
.pcmp-note { font-size: 0.75rem; color: var(--md-default-fg-color--light); margin-top: 0.45rem; }
.pcmp-proxy { color: #d08641; font-weight: 600; }
.pcmp-verdict { margin-top: 1rem; padding: 0.7rem 0.9rem; border-left: 3px solid var(--md-primary-fg-color); background: var(--md-code-bg-color); border-radius: 4px; font-size: 0.92rem; }
.pcmp-cross { margin-top: 0.6rem; font-size: 0.85rem; color: var(--md-default-fg-color--light); }
.pcmp-foot { font-size: 0.78rem; color: var(--md-default-fg-color--light); margin-top: 1rem; }
/* Field styling — self-contained so inputs render cleanly on this standalone page */
.pcmp-card .calc-field { display: flex; flex-direction: column; }
.pcmp-card .calc-field label { font-weight: 600; font-size: 0.82rem; margin-bottom: 0.3rem; color: var(--md-default-fg-color); }
.pcmp-card .calc-field input,
.pcmp-card .calc-field select { width: 100%; box-sizing: border-box; padding: 0.5rem 0.6rem; border: 1px solid var(--md-default-fg-color--lighter); border-radius: 6px; font-size: 0.9rem; font-family: inherit; background: var(--md-default-bg-color); color: var(--md-default-fg-color); }
.pcmp-card .calc-field input:focus,
.pcmp-card .calc-field select:focus { outline: 2px solid var(--md-primary-fg-color); outline-offset: -1px; border-color: var(--md-primary-fg-color); }
.pcmp-card .calc-field .hint { font-size: 0.74rem; color: var(--md-default-fg-color--light); margin-top: 0.3rem; line-height: 1.4; }
/* Tier 1 — natural-language box */
.pcmp-nl { display: flex; flex-direction: column; gap: 0.5rem; }
.pcmp-nl label { font-size: 0.95rem; }
.pcmp-nl textarea { width: 100%; box-sizing: border-box; padding: 0.6rem 0.7rem; border: 1px solid var(--md-default-fg-color--lighter); border-radius: 8px; font-family: inherit; font-size: 0.95rem; background: var(--md-default-bg-color); color: var(--md-default-fg-color); resize: vertical; }
.pcmp-nl textarea:focus { outline: 2px solid var(--md-primary-fg-color); outline-offset: -1px; border-color: var(--md-primary-fg-color); }
.pcmp-ex-row { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; }
.pcmp-ex-lbl { font-size: 0.78rem; color: var(--md-default-fg-color--light); }
.pcmp-ex { font-size: 0.78rem; padding: 0.25rem 0.6rem; border: 1px solid var(--md-default-fg-color--lightest); border-radius: 999px; background: var(--md-code-bg-color); color: var(--md-default-fg-color); cursor: pointer; }
.pcmp-ex:hover { border-color: var(--md-primary-fg-color); }
.pcmp-btn { align-self: flex-start; padding: 0.5rem 1.2rem; border: none; border-radius: 6px; background: var(--md-primary-fg-color); color: var(--md-primary-bg-color); font-weight: 700; font-size: 0.92rem; cursor: pointer; }
.pcmp-btn:hover { opacity: 0.92; }
/* Tier 2 — plain-language assumptions + chips */
.pcmp-assumed { margin: 1.1rem 0 0.6rem; font-size: 0.85rem; color: var(--md-default-fg-color--light); background: var(--md-code-bg-color); border-radius: 6px; padding: 0.5rem 0.7rem; }
.pcmp-assumed span { margin-right: 0.3rem; }
.pcmp-tier2 { display: grid; grid-template-columns: 1fr; gap: 0.9rem; margin-bottom: 0.4rem; }
@media (min-width: 640px) { .pcmp-tier2 { grid-template-columns: 1fr 1fr; } }
.pcmp-choice-lbl { font-size: 0.82rem; font-weight: 600; margin-bottom: 0.35rem; }
.pcmp-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.pcmp-chip { padding: 0.4rem 0.8rem; border: 1.5px solid var(--md-default-fg-color--lightest); border-radius: 8px; background: var(--md-code-bg-color); color: var(--md-default-fg-color); cursor: pointer; font-size: 0.85rem; font-family: inherit; }
.pcmp-chip:hover { border-color: var(--md-primary-fg-color); }
.pcmp-chip.on { border-color: var(--md-primary-fg-color); background: var(--md-primary-fg-color); color: var(--md-primary-bg-color); font-weight: 600; }
.pcmp-tier2 select { width: 100%; box-sizing: border-box; padding: 0.45rem 0.6rem; border: 1px solid var(--md-default-fg-color--lighter); border-radius: 6px; font-family: inherit; font-size: 0.9rem; background: var(--md-default-bg-color); color: var(--md-default-fg-color); }
/* Tier 3 — advanced */
.pcmp-adv-toggle { margin: 0.8rem 0 0.2rem; padding: 0.3rem 0; border: none; background: none; color: var(--md-primary-fg-color); font-weight: 600; font-size: 0.85rem; cursor: pointer; }
.pcmp-adv { display: grid; grid-template-columns: 1fr; gap: 0.9rem; margin: 0.4rem 0 0.4rem; }
@media (min-width: 640px) { .pcmp-adv { grid-template-columns: 1fr 1fr; } }
</style>

## How to read it

- **The GitHub Copilot harness carries real per-task overhead** — instructions, tools, and re-sent context every turn — so a task lands in Microsoft's published bands (100–800+ credits). The standard/M365 engine bills a flat 2–12 credits per turn.
- **The standard engine is usually cheaper.** It wins unless the job needs enough grounded back-and-forth that its per-turn events add up past the harness cost.
- **Use the harness for capability, not to save credits.** Its value is multi-step agentic reasoning the standard engine can't do — the comparator shows the price of that capability so you can decide if it's worth it.

Want a full credit + dollar estimate for a specific agent? Use the **[Credit Estimator](credit-estimator.md)**.

---
title: Copilot Credit Estimator
description: An interactive estimator for Microsoft Copilot credit consumption, giving directional planning numbers across the ramp. Still under active development.
hide: [toc]
---

# Copilot Credit Estimator

!!! warning "Still being worked on — use with caution"
    This estimator is still under active development. Numbers, defaults, and logic may change, so treat the results as directional rather than final and double-check anything you rely on for planning or budgeting.

Estimate monthly **Copilot Credits** (formerly "messages") for Copilot Studio agents — pick an **estimation mode** below to match where you are: describe the agent in plain words, build the credit profile by hand, batch-size a portfolio from Excel, or upload a finished agent for a component-level analysis. Everything runs in your browser; nothing is uploaded. New to credit billing? See [**How Copilot Credits are billed**](#billing-details) for the official rates and licensing rules.

<a id="billing-details"></a>

??? info "How Copilot Credits are billed — rates & licensing ([learn.microsoft.com](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management))"
    Rates are sourced from the **Microsoft Copilot Studio Billing rates and management** docs. Each agent turn may combine multiple features (e.g. a generative answer with tenant graph grounding = 2 + 10 = 12 credits).

    **Key licensing rule:** When an agent runs on a *Microsoft 365 surface — Microsoft 365 Copilot Chat, Microsoft Teams, or SharePoint*, authenticated users with an **M365 Copilot license accrue zero credits** — only unlicensed users generate credit consumption. When deployed to *any external channel* (custom website / web widget, external or custom app, standalone, etc.), **all users are charged credits** regardless of M365 Copilot license status. Use the **Deployment type** toggle in the Detailed mode to model the correct scenario.

    ??? note "Zero-rating exceptions"
        A few official cases where a Microsoft 365 Copilot license does **not** zero-rate usage (per the billing-rate footnotes):

        - **Computer-Using Agent (CUA) actions** are **not** included in the Microsoft 365 Copilot license — they bill at the agent-action rate (5 credits) even for licensed users.
        - **Agent flow actions** are "no charge" for licensed users **only** when the flow uses the *"When an agent calls the flow"* trigger. Agent flows on any other trigger consume credits at the standard rate.
        - **Generative answers** are zero-rated on Microsoft 365 surfaces / in Agent Builder only when they run **without** tenant-graph grounding — tenant-graph grounding always meters (10 credits/message).

    **Benchmarked against Microsoft's official tools.** This engine's rate card and per-turn math are calibrated to match the public [Copilot Studio agent usage estimator](https://microsoft.github.io/copilot-studio-estimator/) and the Learn billing doc — all base rates (classic 1, generative 2, agent action 5, tenant-graph 10/msg, flow 0.13/action, AI 0.1/1.5/10, voice 10/35/75) align, as do the doc's worked examples (a tenant-graph-grounded turn totals ~12 once the generative answer is added). Two nuances it now follows: an **autonomous trigger is billed as one agent action (5)** — not a flat surcharge — with the actions it invokes billed separately; and when a **reasoning-capable model** is detected in a solution package, a premium **10 credits / 1K tokens** meter is added on top of the feature rate. Reasoning surcharges are otherwise assumed off (standard models).

??? note "New here? How to use this estimator"

    First, pick **what you're estimating** — *Copilot Studio agents* today; *Microsoft 365 Copilot (Cowork)* is coming soon — then choose **how you want to estimate** using the cards below. Every mode runs locally in your browser; nothing is uploaded.

    | Mode | Best when… | What you provide | What you get |
    |------|-----------|------------------|--------------|
    | **Quick** | You're early or unsure and just want a ballpark. | A plain-English description of the agent (or an example chip). | A T-shirt size, a Studio build outline, and a credit/cost range. |
    | **Quick + Import** | You're sizing many agents — a whole portfolio — at once. | An Excel workbook with one row per scenario. | Per-scenario sizes and credits, plus a portfolio roll-up. |
    | **Detailed** | You know the building blocks but haven't built yet. | Org scope, deployment type, and the features each conversation uses. | Credits per month and per user, ready for finance or IT. |
    | **Solution package** | The agent is already built. | A Copilot Studio solution export (`.zip`). | A component inventory, a T-shirt size, and a credit estimate. |

    === "Quick"

        1. Select the **Quick** card (the default).
        2. Type a plain-English description — what it does, who uses it, how often, and where it runs — or click an **example** chip.
        3. Click **Build my estimate →**.
        4. Answer the short guided follow-ups.
        5. Review the size, build outline, and credit/cost range.
        6. Optionally open it in the **Detailed** estimator to refine.

    === "Quick + Import"

        1. Select the **Quick + Import** card.
        2. Click **↓ Download Excel template (.xlsx)**.
        3. Fill the **Scenarios** sheet — one row per agent or use-case (the **Examples** sheet is prefilled to copy from).
        4. Drop the completed workbook back on the page.
        5. Review each scenario's size and credits, plus the portfolio roll-up.

    === "Detailed"

        1. Select the **Detailed** card.
        2. Follow the six in-panel steps: set your **org scope**, choose the **deployment type**, set the **interaction frequency**, fill the **per-conversation feature rows**, add an optional **escalation path**, then read the **results**.

    === "Solution package"

        1. Select the **Solution package** card.
        2. In **make.powerapps.com**, add your Copilot Studio agent — plus any Power Automate flows and connection references — to a solution and **Export** it as an unmanaged `.zip`.
        3. Drop the `.zip` on the page.
        4. Review the component inventory, size, and credit estimate.
        5. See the panel's **"What can I upload?"** note for the A / B / C upload options.

<div id="estimator-modes" markdown="0">

<style>
/* ── Mode selector + panels ── */
/* hidden state element — keeps #mode-select in the DOM for the init() page guard + card sync */
.em-visually-hidden {
  position: absolute !important; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
/* top-level "what are you estimating" switcher (reserves the layout for a future Cowork estimator) */
.est-switcher { margin: 1.5rem 0 0.9rem; position: relative; }
.est-switcher-label {
  display: block; font-size: 0.78rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--md-default-fg-color--light); margin-bottom: 0.45rem;
}
.est-switcher-tabs {
  display: inline-flex; flex-wrap: wrap; gap: 0.3rem; padding: 0.25rem;
  border: 1px solid var(--md-default-fg-color--lighter); border-radius: 8px;
  background: var(--md-code-bg-color);
}
.est-tab {
  font: inherit; font-size: 0.86rem; cursor: pointer; padding: 0.4rem 0.85rem;
  border: 1px solid transparent; border-radius: 6px; background: transparent;
  color: var(--md-default-fg-color); display: inline-flex; align-items: center; gap: 0.45rem;
}
.est-tab--active { background: var(--md-primary-fg-color); color: #fff; font-weight: 600; }
.est-tab--soon { color: var(--md-default-fg-color--light); cursor: not-allowed; opacity: 0.8; }
.est-soon-badge {
  font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
  padding: 0.1rem 0.42rem; border-radius: 10px;
  background: var(--md-default-fg-color--lightest); color: var(--md-default-fg-color--light);
}
/* Secret "flight" dot: reveals the hidden Bulk generate mode for demos. Deliberately
   low-key so a casual visitor won't notice it; the demoer knows where to click. */
.flight-dot {
  position: absolute; top: 0; right: 0; width: 14px; height: 14px; padding: 0;
  border: none; border-radius: 50%; cursor: pointer; -webkit-appearance: none; appearance: none;
  background: var(--md-default-fg-color); opacity: 0.08;
  transition: opacity .15s ease, background .15s ease, box-shadow .15s ease;
}
.flight-dot:hover { opacity: 0.4; }
.flight-dot:focus-visible { outline: 2px solid var(--md-accent-fg-color); outline-offset: 2px; opacity: 0.4; }
.estimator-flighted .flight-dot {
  background: var(--md-primary-fg-color); opacity: 0.92;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--md-primary-fg-color) 22%, transparent);
}
/* Bulk generate lives behind the flight flag — hidden until the dot (or ?flight=bulk) flips it on.
   Compound selector (.mode-card.mode-card--secret) so it outranks the later `.mode-card { display:flex }` base rule. */
.mode-card.mode-card--secret { display: none; }
.estimator-flighted .mode-card.mode-card--secret { display: flex; }
.flight-toast {
  position: fixed; left: 50%; bottom: 1.4rem; z-index: 60;
  transform: translateX(-50%) translateY(0.6rem);
  padding: 0.5rem 0.95rem; border-radius: 999px; font-size: 0.82rem; font-weight: 600;
  background: var(--md-default-fg-color); color: var(--md-default-bg-color);
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.24);
  opacity: 0; pointer-events: none; transition: opacity .18s ease, transform .18s ease;
}
.flight-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
/* mode card selector (replaces the dropdown) */
.mode-cards {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(168px, 1fr)); gap: 0.6rem; align-items: stretch;
  margin: 0.25rem 0 0.4rem; max-width: 1180px;
}
@media (max-width: 720px) { .mode-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 559px) { .mode-cards { grid-template-columns: 1fr; } }
.em-export { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin: 1rem 0 0.25rem; }
.em-export-btn { margin: 0; }
.em-export-status { font-size: 0.82rem; color: var(--md-default-fg-color--light); min-height: 1.1em; }
.mode-card {
  font: inherit; text-align: left; cursor: pointer; display: flex; flex-direction: column;
  gap: 0.12rem; padding: 0.8rem 0.9rem; border-radius: 8px; position: relative;
  border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color);
  color: var(--md-default-fg-color); transition: border-color .12s, box-shadow .12s;
}
.mode-card:hover { border-color: var(--md-primary-fg-color); }
.mode-card:focus-visible { outline: 2px solid var(--md-accent-fg-color); outline-offset: 2px; }
.mode-card--active {
  border: 2px solid var(--md-primary-fg-color);
  padding: calc(0.8rem - 1px) calc(0.9rem - 1px);
  background: color-mix(in srgb, var(--md-primary-fg-color) 12%, transparent);
  box-shadow: none;
}
.mode-card--active .mode-card-title { color: var(--md-primary-fg-color); font-weight: 800; }
.mode-card--active::after {
  content: "✓ Selected";
  position: absolute; top: 0.4rem; right: 0.5rem;
  font-size: 0.6rem; font-weight: 700; letter-spacing: 0.02em; line-height: 1;
  padding: 0.12rem 0.4rem; border-radius: 10px;
  background: var(--md-primary-fg-color); color: var(--md-primary-bg-color);
}
.mode-card-title { font-size: 0.95rem; font-weight: 700; padding-right: 4.3rem; }
.mode-card-sub { font-size: 0.82rem; color: var(--md-default-fg-color--light); }
.mode-card-best { font-size: 0.7rem; line-height: 1.3; color: var(--md-default-fg-color--lighter); margin-top: auto; padding-top: 0.3rem; }
#mode-desc {
  font-size: 0.85rem; color: var(--md-default-fg-color--light);
  margin: 0.6rem 0 0; line-height: 1.5; max-width: 68ch;
}
.mode-panel { margin-top: 1.25rem; }
.em-hidden { display: none !important; }
#panel-quick .hint, #panel-complex .hint { font-size: 0.72rem; color: var(--md-default-fg-color--lighter); }

/* bulk generate — portfolio table + per-agent downloads */
.bulk-summary { display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem; align-items: baseline; margin: 0.25rem 0 0.75rem; }
.bulk-summary .big { font-size: 1.5rem; font-weight: 800; color: var(--md-primary-fg-color); }
.bulk-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.25rem 0 1rem; }
.bulk-table { width: 100%; border-collapse: collapse; font-size: 0.84rem; }
.bulk-table th, .bulk-table td { text-align: left; padding: 0.4rem 0.55rem; border-bottom: 1px solid var(--md-default-fg-color--lightest); vertical-align: top; }
.bulk-table th { font-weight: 700; color: var(--md-default-fg-color--light); }
.bulk-table td.num, .bulk-table th.num { text-align: right; font-variant-numeric: tabular-nums; }
.bulk-table tbody tr:hover { background: color-mix(in srgb, var(--md-primary-fg-color) 6%, transparent); }
.bulk-table tfoot td { font-weight: 700; border-top: 2px solid var(--md-default-fg-color--lighter); }
.bulk-badge { display: inline-block; font-size: 0.68rem; font-weight: 700; padding: 0.05rem 0.4rem; border-radius: 10px; background: var(--md-code-bg-color); color: var(--md-default-fg-color--light); }
.bulk-dl { font: inherit; font-size: 0.78rem; cursor: pointer; padding: 0.2rem 0.55rem; border-radius: 6px; border: 1px solid var(--md-primary-fg-color); background: transparent; color: var(--md-primary-fg-color); white-space: nowrap; }
.bulk-dl:hover { background: color-mix(in srgb, var(--md-primary-fg-color) 12%, transparent); }
.bulk-err { color: var(--md-typeset-color); background: color-mix(in srgb, #d32f2f 10%, transparent); border-left: 3px solid #d32f2f; padding: 0.5rem 0.7rem; border-radius: 0 6px 6px 0; margin: 0.5rem 0; font-size: 0.83rem; }

/* generic controls */
.em-textarea {
  width: 100%; box-sizing: border-box; min-height: 120px; resize: vertical;
  padding: 0.7rem 0.85rem; border: 1px solid var(--md-default-fg-color--lighter);
  border-radius: 6px; background: var(--md-code-bg-color);
  color: var(--md-default-fg-color); font-size: 0.95rem; font-family: inherit; line-height: 1.5;
}
.em-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.6rem 0; align-items: center; }
.em-chip {
  cursor: pointer; padding: 0.3rem 0.7rem; border-radius: 20px;
  border: 1px solid var(--md-default-fg-color--lighter); background: transparent;
  color: var(--md-default-fg-color--light); font-size: 0.78rem; font-family: inherit;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.em-chip:hover { border-color: var(--md-primary-fg-color); color: var(--md-primary-fg-color); }
.em-btn {
  cursor: pointer; padding: 0.5rem 1.2rem; border-radius: 6px; border: none;
  background: var(--md-primary-fg-color); color: var(--md-primary-bg-color);
  font-size: 0.9rem; font-weight: 600; font-family: inherit; transition: opacity 0.15s;
}
.em-btn:hover { opacity: 0.88; }
.em-btn.secondary { background: transparent; color: var(--md-primary-fg-color); border: 1.5px solid var(--md-primary-fg-color); }
.em-btn.secondary:hover { background: var(--md-primary-fg-color); color: var(--md-primary-bg-color); opacity: 1; }

/* t-shirt badge */
.em-tshirt { display: flex; gap: 1rem; align-items: stretch; margin: 1rem 0; border-radius: 8px; padding: 1rem 1.2rem; border: 1px solid var(--md-default-fg-color--lightest); background: var(--md-code-bg-color); }
.em-tshirt .sz { font-size: 2.4rem; font-weight: 800; line-height: 1; align-self: center; min-width: 2.4ch; text-align: center; }
.em-tshirt .meta { font-size: 0.85rem; line-height: 1.5; }
.em-tshirt .meta b { font-size: 0.95rem; }
.em-tshirt .meta > div { color: var(--md-default-fg-color--light); }
.em-tshirt-XS { border-left: 5px solid #43a047; } .em-tshirt-XS .sz { color: #43a047; }
.em-tshirt-S  { border-left: 5px solid #7cb342; } .em-tshirt-S  .sz { color: #7cb342; }
.em-tshirt-M  { border-left: 5px solid #fb8c00; } .em-tshirt-M  .sz { color: #fb8c00; }
.em-tshirt-L  { border-left: 5px solid #f4511e; } .em-tshirt-L  .sz { color: #f4511e; }
.em-tshirt-XL { border-left: 5px solid #e53935; } .em-tshirt-XL .sz { color: #e53935; }

/* build list */
.em-build-list { list-style: none; padding: 0; margin: 0.5rem 0 0; }
.em-build-list li { padding: 0.5rem 0 0.5rem 1.4rem; position: relative; border-bottom: 1px solid var(--md-default-fg-color--lightest); font-size: 0.9rem; line-height: 1.5; }
.em-build-list li:before { content: "\25B8"; position: absolute; left: 0.2rem; color: var(--md-primary-fg-color); }
.em-build-list li b { display: block; }
.em-build-list li span { color: var(--md-default-fg-color--light); font-size: 0.85rem; }

/* profile table */
.em-profile { width: 100%; border-collapse: collapse; font-size: 0.9rem; margin: 0.5rem 0; }
.em-profile th { text-align: left; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--md-default-fg-color--light); padding: 0.5rem 0.6rem; border-bottom: 2px solid var(--md-default-fg-color--lightest); }
.em-profile td { padding: 0.5rem 0.6rem; border-bottom: 1px solid var(--md-default-fg-color--lightest); vertical-align: top; }
.em-profile th.num, .em-profile td.num { text-align: right; }
.em-profile tfoot td { font-weight: 700; border-top: 2px solid var(--md-default-fg-color--lightest); border-bottom: none; }
.em-profile .pcredit { color: var(--md-primary-fg-color); }
.em-profile input[type=number] { width: 84px; box-sizing: border-box; padding: 0.3rem 0.4rem; border: 1px solid var(--md-default-fg-color--lightest); border-radius: 4px; background: var(--md-code-bg-color); color: var(--md-default-fg-color); font-size: 0.9rem; text-align: right; font-family: inherit; }

/* findings grid */
.em-findings { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem; margin: 1rem 0; }
.em-find { background: var(--md-code-bg-color); border: 1px solid var(--md-default-fg-color--lightest); border-radius: 6px; padding: 0.7rem 0.5rem; text-align: center; }
.em-find .v { font-size: 1.5rem; font-weight: 700; color: var(--md-primary-fg-color); line-height: 1.1; }
.em-find .k { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--md-default-fg-color--light); margin-top: 0.25rem; }
.em-find.off { opacity: 0.5; }
.em-find.off .v { color: var(--md-default-fg-color--light); }

/* cost cards */
.em-cost { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem; margin: 0.75rem 0; }
.em-cost .card { background: var(--md-code-bg-color); border: 1px solid var(--md-default-fg-color--lightest); border-radius: 6px; padding: 1rem 1.25rem; }
.em-cost .card .v { font-size: 1.6rem; font-weight: 700; color: var(--md-primary-fg-color); }
.em-cost .card .sub { font-size: 0.72rem; color: var(--md-default-fg-color--light); margin-top: 0.2rem; }
.em-range { font-size: 0.8rem; color: var(--md-default-fg-color--light); margin: 0.5rem 0; line-height: 1.5; }

/* upload drop zone */
.sp-drop { border: 2px dashed var(--md-default-fg-color--lighter); border-radius: 10px; padding: 2rem 1.5rem; text-align: center; transition: border-color 0.15s, background 0.15s; cursor: pointer; }
.sp-drop.dragover { border-color: var(--md-primary-fg-color); background: var(--md-code-bg-color); }
.sp-drop .big { font-size: 1rem; font-weight: 600; margin-bottom: 0.35rem; }
.sp-drop .small { font-size: 0.82rem; color: var(--md-default-fg-color--light); }
.sp-status { font-size: 0.85rem; color: var(--md-default-fg-color--light); margin: 0.75rem 0; }
.sp-status.sp-error { color: #e53935; }
.sp-regime { display: inline-block; font-size: 0.66rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.12rem 0.5rem; border-radius: 999px; margin-left: 0.5rem; vertical-align: middle; color: #fff; }
.sp-regime-interactive { background: #3f51b5; }
.sp-regime-autonomous { background: #6a1b9a; }
.sp-warnings { margin: 1rem 0 0.5rem; display: grid; gap: 0.5rem; }
.sp-warn { font-size: 0.8rem; line-height: 1.55; color: #7a4a00; background: rgba(255, 171, 0, 0.1); border-left: 3px solid #e6a100; border-radius: 0 6px 6px 0; padding: 0.5rem 0.75rem; }
[data-md-color-scheme="slate"] .sp-warn { color: #ffcc66; }
.sp-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.5rem 0; }
.sp-chip { font-size: 0.76rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 999px; background: var(--md-code-bg-color); border: 1px solid var(--md-default-fg-color--lighter); color: var(--md-default-fg-color--light); }
.sp-chip.prem { border-color: #e6a100; color: #b26a00; background: rgba(255, 171, 0, 0.08); }

/* strat-modernize-upload — advisory recommendations panel */
.sp-modernize { margin: 1.25rem 0 0.5rem; }
.sp-modernize-head { font-weight: 800; font-size: 0.95rem; margin-bottom: 0.15rem; }
.sp-rec { border-left: 3px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); border-radius: 0 6px 6px 0; padding: 0.6rem 0.85rem; margin: 0.5rem 0; }
.sp-rec-title { font-weight: 700; font-size: 0.9rem; line-height: 1.4; }
.sp-rec-body { font-size: 0.82rem; line-height: 1.6; color: var(--md-default-fg-color--light); margin-top: 0.25rem; }
.sp-rec-cost { font-size: 0.78rem; line-height: 1.5; margin-top: 0.35rem; color: #7a4a00; background: rgba(255, 171, 0, 0.1); border-radius: 6px; padding: 0.35rem 0.6rem; }
[data-md-color-scheme="slate"] .sp-rec-cost { color: #ffcc66; }
.sp-rec-tag { display: inline-block; font-size: 0.62rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 0.1rem 0.42rem; border-radius: 999px; margin-right: 0.5rem; vertical-align: middle; color: #fff; background: var(--md-default-fg-color--light); }
.sp-rec--build { border-left-color: var(--md-primary-fg-color); }
.sp-rec--build .sp-rec-tag { background: var(--md-primary-fg-color); color: var(--md-primary-bg-color); }
.sp-rec--cost { border-left-color: #e6a100; }
.sp-rec--cost .sp-rec-tag { background: #e6a100; }
.sp-rec--governance { border-left-color: #6a1b9a; }
.sp-rec--governance .sp-rec-tag { background: #6a1b9a; }
.sp-rec--ok { border-left-color: #2e7d32; }
.sp-rec--ok .sp-rec-title { color: #2e7d32; }
[data-md-color-scheme="slate"] .sp-rec--ok .sp-rec-title { color: #81c784; }

/* details / inventory */
.em-details { margin: 1.25rem 0; font-size: 0.85rem; }
.em-details summary { cursor: pointer; font-weight: 600; color: var(--md-primary-fg-color); }
.em-complist { white-space: pre; overflow-x: auto; font-family: var(--md-code-font-family, monospace); font-size: 0.8rem; background: var(--md-code-bg-color); border-radius: 6px; padding: 0.75rem 1rem; margin-top: 0.5rem; line-height: 1.5; }

/* quick: why-this-size, build outline header, quiz */
.em-why { margin: 0.4rem 0; padding: 0.35rem 0.6rem; border-radius: 5px; background: var(--md-default-fg-color--lightest); font-size: 0.82rem; color: var(--md-default-fg-color); }
.em-flowline { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.25rem 0 0.5rem; }
.em-tag { display: inline-block; padding: 0.22rem 0.6rem; border-radius: 5px; font-size: 0.74rem; font-weight: 600; background: var(--md-code-bg-color); border: 1px solid var(--md-default-fg-color--lightest); color: var(--md-default-fg-color--light); }
.em-tag-user { background: rgba(66,165,245,0.14); border-color: rgba(66,165,245,0.4); color: #1e88e5; }
.em-tag-auto { background: rgba(251,140,0,0.16); border-color: rgba(251,140,0,0.45); color: #fb8c00; }
.em-quiz { margin: 0.5rem 0 0; }
.em-quiz .calc-grid { margin-top: 0.5rem; }
.em-toggles { display: flex; flex-wrap: wrap; gap: 0.9rem; margin: 0.85rem 0 0.25rem; }
.em-chk { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.84rem; color: var(--md-default-fg-color--light); cursor: pointer; }
.em-chk input { cursor: pointer; }

/* quick v2: guided wizard */
.qe-wizard { display: grid; grid-template-columns: 1fr; gap: 1.25rem; margin-top: 0.5rem; }
@media (min-width: 760px) { .qe-wizard { grid-template-columns: 1fr 260px; align-items: start; } }
.qe-progress { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1rem; }
.qe-progress .st { font-size: 0.68rem; padding: 0.18rem 0.55rem; border-radius: 20px; background: var(--md-code-bg-color); border: 1px solid var(--md-default-fg-color--lightest); color: var(--md-default-fg-color--light); white-space: nowrap; }
.qe-progress .st.cur { background: var(--md-primary-fg-color); border-color: var(--md-primary-fg-color); color: #fff; font-weight: 600; }
.qe-progress .st.done { color: var(--md-primary-fg-color); border-color: var(--md-primary-fg-color); }
.qe-step-title { font-size: 1.05rem; font-weight: 700; color: var(--md-default-fg-color); }
.qe-step-help { font-size: 0.85rem; color: var(--md-default-fg-color--light); margin: 0.2rem 0 0.9rem; line-height: 1.5; }
.qe-cards { display: grid; grid-template-columns: 1fr; gap: 0.6rem; }
.qe-cards.two { grid-template-columns: 1fr 1fr; }
.qe-cards.three { grid-template-columns: 1fr 1fr 1fr; }
@media (max-width: 560px) { .qe-cards.two, .qe-cards.three { grid-template-columns: 1fr; } }
.qe-opt { text-align: left; padding: 0.75rem 0.9rem; border-radius: 8px; border: 1.5px solid var(--md-default-fg-color--lighter); background: var(--md-default-bg-color); cursor: pointer; transition: border-color 0.12s, background 0.12s; }
.qe-opt:hover { border-color: var(--md-primary-fg-color); }
.qe-opt.sel { border-color: var(--md-primary-fg-color); background: rgba(66,165,245,0.08); }
.qe-opt b { display: block; font-size: 0.9rem; color: var(--md-default-fg-color); }
.qe-opt span { display: block; font-size: 0.76rem; color: var(--md-default-fg-color--light); margin-top: 0.2rem; line-height: 1.45; }
.qe-presets { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; margin: 0.5rem 0 0; }
.qe-preset { font-size: 0.74rem; padding: 0.25rem 0.6rem; border-radius: 5px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-default-fg-color--light); cursor: pointer; }
.qe-preset:hover { border-color: var(--md-primary-fg-color); color: var(--md-primary-fg-color); }
.qe-inferred { margin: 0.7rem 0 0; padding: 0.4rem 0.65rem; border-left: 3px solid var(--md-primary-fg-color); background: var(--md-default-fg-color--lightest); border-radius: 0 5px 5px 0; font-size: 0.78rem; color: var(--md-default-fg-color--light); line-height: 1.5; }
.qe-nav { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; margin-top: 1.1rem; }
.qe-nav .spacer { flex: 1 1 auto; }
.qe-preview { position: sticky; top: 4rem; background: var(--md-code-bg-color); border: 1px solid var(--md-default-fg-color--lightest); border-radius: 10px; padding: 1rem 1.1rem; }
.qe-preview .lbl { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--md-default-fg-color--light); font-weight: 700; }
.qe-preview .big { font-size: 1.7rem; font-weight: 700; color: var(--md-primary-fg-color); line-height: 1.1; }
.qe-mini-tshirt { display: inline-block; min-width: 1.9rem; text-align: center; padding: 0.1rem 0.45rem; border-radius: 6px; font-weight: 800; font-size: 0.85rem; }
.qe-note { font-size: 0.78rem; color: var(--md-default-fg-color--light); background: var(--md-default-fg-color--lightest); border-radius: 6px; padding: 0.5rem 0.7rem; line-height: 1.55; margin: 0.6rem 0; }
.qe-axes { display: grid; grid-template-columns: 1fr; gap: 1rem; margin: 0.75rem 0; }
@media (min-width: 680px) { .qe-axes { grid-template-columns: 1fr 1fr; } }
.qe-axis { border: 1px solid var(--md-default-fg-color--lightest); border-radius: 10px; padding: 0.9rem 1rem; }
.qe-axis h4 { margin: 0 0 0.6rem; font-size: 0.9rem; }
.qe-starter { margin: 1.25rem 0 0; padding: 0.9rem 1rem; border: 1px solid var(--md-primary-fg-color); border-radius: 10px; background: color-mix(in srgb, var(--md-primary-fg-color) 6%, transparent); }
.qe-import-help { margin-top: 0.65rem; }
.qe-import-help > summary { cursor: pointer; font-size: 0.82rem; font-weight: 600; color: var(--md-primary-fg-color); }
.qe-import-steps { margin: 0.5rem 0 0; padding-left: 1.2rem; font-size: 0.8rem; line-height: 1.6; color: var(--md-default-fg-color--light); }
.qe-import-steps li { margin: 0.15rem 0; }
.qe-pkg-review { margin: 0.7rem 0 0; padding: 0.75rem 0.85rem; border: 1px solid var(--md-default-fg-color--lightest); border-radius: 10px; background: var(--md-default-bg-color); }
.qe-rev-title { font-weight: 700; font-size: 0.95rem; margin-bottom: 0.15rem; }
.qe-rev-meta { display: flex; flex-wrap: wrap; gap: 0.35rem 1rem; font-size: 0.82rem; color: var(--md-default-fg-color--light); }
.qe-rev-group { margin: 0.55rem 0 0; }
.qe-rev-grouplbl { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--md-default-fg-color--light); margin-bottom: 0.2rem; }
.qe-rev-item { display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.25rem 0.35rem; font-size: 0.85rem; border-radius: 6px; cursor: pointer; }
.qe-rev-item:hover { background: color-mix(in srgb, var(--md-primary-fg-color) 7%, transparent); }
.qe-rev-item input { margin-top: 0.2rem; }
.qe-rev-sub { display: block; font-size: 0.75rem; color: var(--md-default-fg-color--light); word-break: break-all; }
.qe-rev-flag { display: inline-block; font-size: 0.68rem; font-weight: 700; padding: 0 0.35rem; border-radius: 999px; background: color-mix(in srgb, #d98b00 22%, transparent); color: var(--md-default-fg-color); vertical-align: 1px; }
.qe-rev-empty { font-size: 0.82rem; color: var(--md-default-fg-color--light); padding: 0.1rem 0.35rem; }
.qe-rev-actions { margin-top: 0.7rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.qe-rev-notices { margin: 0.4rem 0 0.6rem; border: 1px solid color-mix(in srgb, #d98b00 45%, transparent); border-left-width: 3px; border-radius: 6px; background: color-mix(in srgb, #d98b00 10%, transparent); padding: 0.5rem 0.6rem; }
.qe-rev-noticeshead { font-size: 0.82rem; font-weight: 700; margin-bottom: 0.35rem; }
.qe-rev-notice { font-size: 0.82rem; margin: 0.25rem 0; }

/* Authoring-experience segmented control (Quick starter build target) */
.qe-seg-field { margin: 0.35rem 0 0.7rem; }
.qe-seg-label { margin-bottom: 0.3rem; }
.qe-seg { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.qe-seg-opt { display: flex; flex-direction: column; gap: 0.15rem; text-align: left; padding: 0.6rem 0.7rem; border: 1px solid var(--md-default-fg-color--lighter); border-radius: 10px; background: var(--md-default-bg-color); color: var(--md-default-fg-color); cursor: pointer; font: inherit; transition: border-color .12s, background .12s, box-shadow .12s; }
.qe-seg-opt:hover { border-color: var(--md-primary-fg-color); background: color-mix(in srgb, var(--md-primary-fg-color) 5%, transparent); }
.qe-seg-opt:focus-visible { outline: 2px solid var(--md-primary-fg-color); outline-offset: 2px; }
.qe-seg-opt--active { border-color: var(--md-primary-fg-color); border-width: 2px; padding: calc(0.6rem - 1px) calc(0.7rem - 1px); background: color-mix(in srgb, var(--md-primary-fg-color) 12%, transparent); box-shadow: 0 1px 4px color-mix(in srgb, var(--md-primary-fg-color) 22%, transparent); }
.qe-seg-opt-title { font-weight: 700; font-size: 0.9rem; display: flex; align-items: center; gap: 0.4rem; }
.qe-seg-opt--active .qe-seg-opt-title { color: var(--md-primary-fg-color); }
.qe-seg-opt-sub { font-size: 0.76rem; color: var(--md-default-fg-color--light); line-height: 1.35; }
.qe-seg-badge { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; padding: 0.05rem 0.35rem; border-radius: 999px; background: var(--md-primary-fg-color); color: var(--md-primary-bg-color); }
.qe-seg-note { margin-top: 0.4rem; }
.qe-pkg-workiq { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin: 0.2rem 0 0.15rem; padding: 0.5rem 0.7rem; border: 1px solid var(--md-default-fg-color--lighter); border-radius: 10px; background: var(--md-default-bg-color); cursor: pointer; font-size: 0.9rem; font-weight: 600; }
.qe-pkg-workiq:hover { border-color: var(--md-primary-fg-color); background: color-mix(in srgb, var(--md-primary-fg-color) 5%, transparent); }
.qe-pkg-workiq input { width: 1.05rem; height: 1.05rem; accent-color: var(--md-primary-fg-color); cursor: pointer; }
.qe-pkg-skills { margin: 0.2rem 0 0.15rem; }
.qe-pkg-skills textarea { width: 100%; box-sizing: border-box; margin: 0.15rem 0 0.1rem; padding: 0.45rem 0.6rem; border: 1px solid var(--md-default-fg-color--lighter); border-radius: 10px; background: var(--md-default-bg-color); color: var(--md-default-fg-color); font: inherit; font-size: 0.85rem; resize: vertical; }
.qe-pkg-skills textarea:focus { outline: none; border-color: var(--md-primary-fg-color); box-shadow: 0 0 0 2px color-mix(in srgb, var(--md-primary-fg-color) 20%, transparent); }
.qe-pkg-skills-tag { display: inline-block; margin-left: 0.35rem; padding: 0.02rem 0.4rem; border-radius: 999px; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase; background: color-mix(in srgb, var(--md-primary-fg-color) 14%, transparent); color: var(--md-primary-fg-color); vertical-align: middle; }
.qe-pkg-workiq-pill { display: inline-block; padding: 0.03rem 0.45rem; border-radius: 999px; font-size: 0.66rem; font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase; vertical-align: middle; white-space: nowrap; }
.qe-pkg-workiq-pill--wired { background: color-mix(in srgb, #2e7d32 14%, transparent); color: #2e7d32; }
.qe-pkg-workiq-pill--toggle { background: color-mix(in srgb, #d98b00 16%, transparent); color: #b26a00; }
[data-md-color-scheme="slate"] .qe-pkg-workiq-pill--wired { color: #7bd88f; }
[data-md-color-scheme="slate"] .qe-pkg-workiq-pill--toggle { color: #ffcc66; }
@media (max-width: 480px) { .qe-seg { grid-template-columns: 1fr; } }

/* Quick + Import (batch portfolio) */
.qi-prompt-seg { display: inline-flex; gap: 0.3rem; margin: 0.15rem 0 0.35rem; }
.qi-prompt-tab { cursor: pointer; padding: 0.22rem 0.65rem; border-radius: 999px; border: 1px solid var(--md-default-fg-color--lighter); background: transparent; color: var(--md-default-fg-color--light); font-size: 0.74rem; font-weight: 600; font-family: inherit; transition: background .12s, color .12s, border-color .12s; }
.qi-prompt-tab:hover { border-color: var(--md-primary-fg-color); color: var(--md-primary-fg-color); }
.qi-prompt-tab--active { border-color: var(--md-primary-fg-color); color: var(--md-primary-bg-color); background: var(--md-primary-fg-color); }
.qi-toolbar { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin: 0.5rem 0 0.25rem; }
.qi-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin: 1rem 0; }
@media (min-width: 680px) { .qi-cards { grid-template-columns: repeat(4, 1fr); } }
.qi-card { border: 1px solid var(--md-default-fg-color--lightest); border-radius: 10px; padding: 0.8rem 0.9rem; }
.qi-card .k { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--md-default-fg-color--light); }
.qi-card .v { font-size: 1.35rem; font-weight: 800; margin-top: 0.2rem; line-height: 1.1; }
.qi-card .s { font-size: 0.75rem; color: var(--md-default-fg-color--light); margin-top: 0.15rem; }
.qi-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin: 0.5rem 0; }
.qi-table th, .qi-table td { text-align: left; padding: 0.45rem 0.55rem; border-bottom: 1px solid var(--md-default-fg-color--lightest); vertical-align: top; }
.qi-table th { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.03em; color: var(--md-default-fg-color--light); white-space: nowrap; }
.qi-table tbody tr.qi-main:hover { background: var(--md-default-fg-color--lightest); }
.qi-num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.qi-size { display: inline-block; min-width: 1.8rem; text-align: center; padding: 0.08rem 0.4rem; border-radius: 6px; font-weight: 800; font-size: 0.8rem; color: #fff; }
.qi-name-btn { background: none; border: none; padding: 0; color: var(--md-typeset-a-color, #3f51b5); font-weight: 600; cursor: pointer; text-align: left; font-size: 0.85rem; font-family: inherit; }
.qi-name-btn:hover { text-decoration: underline; }
.qi-detail-cell { padding: 0 !important; border-bottom: 1px solid var(--md-default-fg-color--lightest); }
.qi-detail { background: var(--md-default-fg-color--lightest); border-radius: 8px; padding: 0.7rem 0.9rem; margin: 0.2rem 0.4rem 0.6rem; font-size: 0.82rem; line-height: 1.6; }
.qi-detail ul { margin: 0.3rem 0 0.3rem 1.1rem; padding: 0; }
.qi-detail .qi-open { margin-top: 0.5rem; }
.qi-warn { color: #b26a00; }
.qi-warn-row td { background: rgba(255, 171, 0, 0.08); }
.qi-err-row td { background: rgba(198, 40, 40, 0.07); color: #b3261e; }
.qi-flag { display: inline-block; font-size: 0.7rem; font-weight: 700; color: #b26a00; margin-left: 0.35rem; }
</style>

<div id="estimator-studio">

<div class="est-switcher">
  <span class="est-switcher-label" id="est-switch-label">What are you estimating?</span>
  <div class="est-switcher-tabs" role="tablist" aria-labelledby="est-switch-label">
    <button type="button" class="est-tab est-tab--active" role="tab" aria-selected="true" aria-controls="estimator-studio">Copilot Studio agents</button>
    <button type="button" class="est-tab est-tab--soon" role="tab" aria-selected="false" aria-disabled="true" disabled tabindex="-1" title="Coming soon">Microsoft 365 Copilot (Cowork)<span class="est-soon-badge">Coming soon</span></button>
  </div>
  <button type="button" id="flight-toggle" class="flight-dot" aria-pressed="false" aria-label="Toggle preview features" title=""></button>
</div>

<!-- Hidden single source of truth for the active mode. credit-estimator.js init() guards the page
     on #mode-select and keeps its .value in sync; the cards below drive setEstimatorMode(). -->
<select id="mode-select" class="em-visually-hidden" tabindex="-1" aria-hidden="true" onchange="setEstimatorMode(this.value)">
  <option value="quick" selected>Quick</option>
  <option value="import">Quick + Import</option>
  <option value="detailed">Detailed</option>
  <option value="complex">Solution package</option>
  <option value="bulk">Bulk generate</option>
</select>

<div class="mode-cards" role="radiogroup" aria-label="Choose how you want to estimate">
  <button type="button" class="mode-card mode-card--active" role="radio" aria-checked="true" data-mode="quick" onclick="setEstimatorMode('quick')">
    <span class="mode-card-title">Quick</span>
    <span class="mode-card-sub">Describe it in words</span>
    <span class="mode-card-best">Best when you're early or unsure &middot; default</span>
  </button>
  <button type="button" class="mode-card" role="radio" aria-checked="false" data-mode="import" onclick="setEstimatorMode('import')">
    <span class="mode-card-title">Quick + Import</span>
    <span class="mode-card-sub">Batch-size many from Excel</span>
    <span class="mode-card-best">Best for sizing a whole portfolio</span>
  </button>
  <button type="button" class="mode-card" role="radio" aria-checked="false" data-mode="detailed" onclick="setEstimatorMode('detailed')">
    <span class="mode-card-title">Detailed</span>
    <span class="mode-card-sub">Build the profile by hand</span>
    <span class="mode-card-best">Best when you know the building blocks</span>
  </button>
  <button type="button" class="mode-card" role="radio" aria-checked="false" data-mode="complex" onclick="setEstimatorMode('complex')">
    <span class="mode-card-title">Solution package</span>
    <span class="mode-card-sub">Upload a built agent</span>
    <span class="mode-card-best">Best when the agent is already built</span>
  </button>
  <button type="button" class="mode-card mode-card--secret" id="mode-card-bulk" role="radio" aria-checked="false" data-mode="bulk" onclick="setEstimatorMode('bulk')">
    <span class="mode-card-title">Bulk generate</span>
    <span class="mode-card-sub">One starter .zip per agent</span>
    <span class="mode-card-best">Best for standing up many agents at once</span>
  </button>
</div>

<p id="mode-desc"></p>

<!-- Future roadmap: a sibling <div id="estimator-cowork"> will host the Microsoft 365 Copilot
     (Cowork) estimator, shown when the disabled switcher tab above is enabled. -->


<!-- ── QUICK (natural language) ── -->
<div class="mode-panel" id="panel-quick">
  <div class="section-label">Describe what you want the agent to do</div>
  <textarea id="qe-input" class="em-textarea" placeholder="e.g. Every time a new email lands in our shared support inbox, categorize it and route it to the right SME team — about 100 emails a month. Or: an HR assistant that answers benefits questions from our SharePoint policies for all employees in Teams."></textarea>
  <div class="em-chips">
    <span class="hint">Try an example:</span>
    <button type="button" class="em-chip" onclick="qeExample('email')">Email router (autonomous)</button>
    <button type="button" class="em-chip" onclick="qeExample('it')">IT helpdesk</button>
    <button type="button" class="em-chip" onclick="qeExample('sales')">Sales enablement</button>
    <button type="button" class="em-chip" onclick="qeExample('support')">Customer voice bot</button>
    <button type="button" class="em-chip" onclick="qeExample('finance')">Invoice processing</button>
  </div>
  <button type="button" class="em-btn" onclick="qeAnalyze()">Build my estimate &rarr;</button>
  <div id="qe-results" class="em-hidden"></div>
  <p class="hint" style="margin-top:1rem">We read your description to pre-fill a short guided assessment, then estimate the Studio build effort and a credit/cost profile — a directional starting point, not a real LLM analysis. Answer the questions, then open it in the Detailed estimator. Once your estimate is ready, you can also <strong>download a ready-to-import Copilot Studio starter agent (.zip)</strong> generated from your description.</p>
</div>

<!-- ── COMPLEX (solution package upload) ── -->
<div class="mode-panel em-hidden" id="panel-complex">
  <div class="section-label">Upload a built agent or flow package</div>
  <p class="em-range">Drop a Dataverse <strong>solution</strong> export (<code>.zip</code>) — a Copilot Studio agent, a Power Automate cloud flow, or both — or a curated <strong>agent build-spec bundle</strong>. We inventory topics, knowledge, actions, flows (with AI Builder prompts, loops and connectors), and multi-agent orchestration, then size it and estimate credits. The file is parsed entirely in your browser — <strong>nothing is uploaded to any server</strong>.</p>
  <div class="sp-drop" id="sp-drop" onclick="document.getElementById('sp-file').click()">
    <div class="big">Drop your solution / package .zip here</div>
    <div class="small">or click to choose a file</div>
    <input type="file" id="sp-file" accept=".zip,application/zip" style="display:none">
  </div>
  <div id="sp-status" class="sp-status"></div>
  <details class="em-details">
    <summary>What can I upload?</summary>
    <div style="font-size:0.85rem; line-height:1.7; margin-top:0.5rem">
      <strong>A. Dataverse solution export</strong> (most accurate):<br>
      1. Go to <strong>make.powerapps.com</strong> &rarr; <strong>Solutions</strong>.<br>
      2. Create a solution (or open an existing one) and <strong>add your Copilot Studio agent</strong> and/or <strong>Power Automate flows</strong> — plus their connection references.<br>
      3. Choose <strong>Export solution</strong> &rarr; Unmanaged or Managed &rarr; download the <code>.zip</code>.<br>
      4. Drop that <code>.zip</code> above. We read the agent/topic YAML and workflow JSON to inventory components.<br><br>
      <strong>B. Power Automate flow only</strong>: export just the flow's solution — we parse its trigger, actions, AI Builder prompts, loops and connectors, and treat it as an autonomous (per-run) workload.<br><br>
      <strong>C. Agent build-spec bundle</strong>: a folder of build docs (<code>.md</code>) + knowledge files (<code>.docx</code>/<code>.pdf</code>) zipped together — we infer knowledge sources, actions, orchestration and guardrails from the spec.
    </div>
  </details>
  <div id="sp-results" class="em-hidden"></div>
</div>

<!-- ── QUICK + IMPORT (batch Excel) ── -->
<div class="mode-panel em-hidden" id="panel-import">
  <div class="section-label">1 &middot; Download the template</div>
  <p class="em-range">Grab the workbook, fill in <strong>one row per scenario</strong> on the <strong>Scenarios</strong> sheet (the <strong>Examples</strong> sheet is prefilled to copy from), then bring it back here. Every scenario gets a T-shirt size, a credit/cost estimate and a build read-out, plus a portfolio roll-up. Everything runs <strong>in your browser</strong> — nothing is uploaded.</p>
  <div class="em-range" style="border-left:3px solid var(--md-primary-fg-color); padding:0.55rem 0.8rem; margin:0.7rem 0; background:var(--md-code-bg-color); border-radius:0 6px 6px 0;">
    <strong>Tip — let Copilot fill the sheet for you.</strong> You don't have to fill the <strong>Scenarios</strong> sheet by hand. Ask <strong>Microsoft 365 Copilot</strong> (Copilot Chat / Cowork, or Copilot in Excel) to populate it from a plain-English list of your agents — one row each — then re-upload. The <strong>example prompt is copy-paste-ready</strong>. Pick <strong>Simple</strong> (default) or <strong>Detailed</strong> below, hit <strong>Copy prompt</strong>, then just replace the <em>My agents</em> list at the bottom with your own and send it to Copilot; it uses the prefilled <strong>Examples</strong> sheet as the pattern, infers each column, and leaves unknowns blank.
    <div class="qi-prompt-seg" role="group" aria-label="Prompt detail level">
      <button type="button" class="qi-prompt-tab qi-prompt-tab--active" id="qi-prompt-tab-simple" aria-pressed="true" onclick="qiSetPromptVariant('simple')">Simple</button>
      <button type="button" class="qi-prompt-tab" id="qi-prompt-tab-detailed" aria-pressed="false" onclick="qiSetPromptVariant('detailed')">Detailed</button>
    </div>
    <pre id="qi-copilot-prompt" style="white-space:pre-wrap; font-size:0.76rem; max-height:9.5em; overflow:auto; margin:0.15rem 0 0.3rem; padding:0.5rem 0.65rem; background:var(--md-default-bg-color); border:1px solid var(--md-default-fg-color--lightest); border-radius:4px;">You're helping me fill in the 'Scenarios' sheet of this Copilot Credit Estimator workbook. Use the prefilled 'Examples' sheet as the pattern and add one row per agent from my list below. Infer each column from my descriptions and leave a cell blank if it isn't implied — don't invent enum or number values.
My agents (one per line — what it does, who uses it, how often, channel, knowledge, actions):
1)
2)</pre>
    <div style="margin:0.2rem 0 0.35rem"><button type="button" class="em-chip" onclick="qiCopyPrompt()">&#128203; Copy prompt</button> <span class="em-export-status" id="em-export-status-qiprompt" role="status" aria-live="polite"></span></div>
    <span class="hint">Copilot's inferences are a starting point — sanity-check the enum/number columns before importing.</span>
  </div>
  <div class="qi-toolbar">
    <button type="button" class="em-btn" onclick="qiDownloadTemplate()">&darr; Download Excel template (.xlsx)</button>
    <button type="button" class="em-chip" onclick="qiDownloadCsv()">or download a .csv</button>
  </div>
  <div class="section-label">2 &middot; Import your filled-in workbook</div>
  <div class="sp-drop" id="qi-drop" onclick="document.getElementById('qi-file').click()">
    <div class="big">Drop your filled-in .xlsx or .csv here</div>
    <div class="small">or click to choose a file</div>
    <input type="file" id="qi-file" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" style="display:none">
  </div>
  <div id="qi-status" class="sp-status"></div>
  <details class="em-details">
    <summary>What do the columns mean?</summary>
    <div id="qi-schema-help" style="font-size:0.83rem; line-height:1.7; margin-top:0.5rem"></div>
  </details>
  <div id="qi-results" class="em-hidden"></div>
</div>

<!-- ── BULK GENERATE (one starter .zip per agent) ── -->
<div class="mode-panel em-hidden" id="panel-bulk">
  <div class="section-label">Describe your agents — one per line</div>
  <p class="em-range">Paste a plain-English description of each agent on its own line and get a <strong>ready-to-import Copilot Studio starter (.zip) for every one</strong>, bundled together with a portfolio roll-up. This mirrors <strong>Quick + Import</strong>, but the output is <em>generated agents</em>, not just sizing. Everything runs <strong>in your browser</strong> — nothing is uploaded. These are directional starters to extend, not production-ready agents.</p>
  <details class="em-details">
    <summary>Want more control? Use a header row.</summary>
    <div style="font-size:0.83rem; line-height:1.7; margin-top:0.5rem">
      Without a header, each line is treated as one agent <strong>description</strong>. To set options per agent, make the first line a header naming any of: <code>name</code>, <code>description</code>, <code>experience</code> (new/classic), <code>archetype</code> (interactive/autonomous), <code>knowledge</code>, <code>workIQ</code> (yes/no), <code>skills</code> (<code>;</code>-separated), <code>systems</code> (<code>;</code>-separated). Separate columns with a comma or tab; wrap any value containing a comma in "quotes". <code>description</code> is the only required column. New experience is the recommended default.
    </div>
  </details>
  <textarea id="bulk-input" class="em-textarea" placeholder="An HR assistant that answers benefits questions from our SharePoint policies for employees in Teams.&#10;A support agent that creates a ServiceNow incident for each issue and notifies the on-call team.&#10;Every time an invoice arrives in the shared mailbox, extract the fields and create a record in Dynamics 365."></textarea>
  <div class="em-chips">
    <span class="hint">Try an example set:</span>
    <button type="button" class="em-chip" onclick="bulkExample('support')">Support desk suite</button>
    <button type="button" class="em-chip" onclick="bulkExample('ops')">Back-office ops</button>
  </div>
  <div class="qi-toolbar">
    <button type="button" class="em-btn" onclick="bulkAnalyze()">Analyze portfolio &rarr;</button>
    <span id="bulk-status" class="sp-status" aria-live="polite"></span>
  </div>
  <div id="bulk-results" class="em-hidden"></div>
</div>

</div><!-- /#estimator-studio -->

</div>

<div class="mode-panel em-hidden" id="panel-detailed" markdown="1">

!!! tip "How to use this estimator"
    1. **Set your org scope** — enter the number of users you're modelling and the proportion with an M365 Copilot license.
    2. **Choose deployment type** — *Microsoft 365 (Teams · Copilot Chat · SharePoint)* means licensed users accrue zero credits; *Standalone / other channel* charges all users regardless.
    3. **Set interaction frequency** — estimate how many times a typical user interacts with the agent per month.
    4. **Build your normal path** — for each row, set *Uses / interaction* to how many times that feature fires in a single conversation. Rows default to 0 — only count features your agent actually uses.
    5. **Add an escalation path (optional)** — set an escalation rate and add extra steps that only fire when an interaction escalates (e.g. a query that can't be self-served triggers an additional lookup or handoff). The rate controls what percentage of interactions incur these extra costs.
    6. **Check the results** — *Credits / month (org)* and *Credits / user / month* are the numbers to share with finance or IT for budget planning.

<div id="calc-wrap" markdown="0">

<style>
#calc-wrap { font-family: inherit; overflow-x: hidden; }

/* Two-way binding banner: shown atop the Detailed estimator when a row was opened
   from the imported portfolio, offering save-back / return-without-saving. */
.det-origin-banner {
  display: flex; flex-wrap: wrap; gap: .6rem; align-items: center; justify-content: space-between;
  margin: 0 0 1rem; padding: .7rem .9rem;
  border: 1px solid var(--md-accent-fg-color, #7c4dff);
  border-left: 4px solid var(--md-accent-fg-color, #7c4dff);
  border-radius: 8px;
  background: color-mix(in srgb, var(--md-accent-fg-color, #7c4dff) 8%, transparent);
}
.det-origin-banner.em-hidden { display: none; }
.det-origin-banner .dob-txt { font-size: .86rem; line-height: 1.35; flex: 1 1 16rem; }
.det-origin-banner .dob-actions { display: flex; gap: .4rem; flex: 0 0 auto; flex-wrap: wrap; }
.qi-edited-note { margin: .1rem 0 .5rem; font-size: .8rem; font-weight: 600; color: var(--md-accent-fg-color, #7c4dff); }

/* Phase B: escalation "buffer" readout (average vs escalated vs blended) */
.em-esc-wrap:empty { display: none; }
.em-esc {
  margin: .85rem 0; padding: .7rem .8rem; border-radius: 8px;
  border: 1px solid var(--md-default-fg-color--lightest, rgba(0,0,0,.1));
  background: var(--md-code-bg-color);
}
.em-esc--on { border-color: var(--md-accent-fg-color, #7c4dff); }
.em-esc-head { font-size: .82rem; font-weight: 700; margin-bottom: .55rem; }
.em-esc-head .hint { font-weight: 400; text-transform: none; letter-spacing: 0; }
.em-esc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .6rem; margin-bottom: .4rem; }
@media (max-width: 560px) { .em-esc-grid { grid-template-columns: 1fr; } }
.em-esc-cell {
  text-align: center; padding: .45rem .3rem; border-radius: 6px;
  background: var(--md-default-bg-color);
  border: 1px solid var(--md-default-fg-color--lightest, rgba(0,0,0,.08));
}
.em-esc-cell .v { font-size: 1.05rem; font-weight: 700; line-height: 1.1; }
.em-esc-cell .k { font-size: .68rem; text-transform: uppercase; letter-spacing: .03em; color: var(--md-default-fg-color--light); margin-top: .15rem; }
.em-esc-cell--blend { background: color-mix(in srgb, var(--md-accent-fg-color, #7c4dff) 12%, var(--md-default-bg-color)); border-color: var(--md-accent-fg-color, #7c4dff); }
.em-esc-buffer { margin: .15rem 0 .55rem; }
.em-esc-ctl label { display: block; font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: var(--md-default-fg-color--light); margin-bottom: .3rem; }
.em-esc-ctl .range-row { max-width: 22rem; }
.em-esc-ctl--static { color: var(--md-default-fg-color--light); }

/* Phase D — solution-import precision questionnaire (average vs escalation-only tools) */
.em-precision {
  border: 1px solid var(--md-default-fg-color--lightest); border-radius: 8px;
  padding: .7rem .8rem; margin: .6rem 0 .2rem;
  background: color-mix(in srgb, var(--md-primary-fg-color) 5%, var(--md-default-bg-color));
}
.em-precision-head { font-size: .82rem; font-weight: 700; margin-bottom: .3rem; }
.em-precision p { margin: 0; }
.em-fireson { display: inline-flex; border: 1px solid var(--md-default-fg-color--lightest); border-radius: 6px; overflow: hidden; }
.em-fireson-opt {
  appearance: none; -webkit-appearance: none; border: 0; cursor: pointer;
  padding: .22rem .5rem; font-size: .72rem; font-family: inherit; line-height: 1.2;
  background: var(--md-default-bg-color); color: var(--md-default-fg-color--light);
  border-right: 1px solid var(--md-default-fg-color--lightest);
}
.em-fireson-opt:last-child { border-right: 0; }
.em-fireson-opt.active { background: var(--md-primary-fg-color); color: var(--md-primary-bg-color); font-weight: 700; }
.em-fireson-opt:focus-visible { outline: 2px solid var(--md-accent-fg-color, #7c4dff); outline-offset: -2px; }
.em-prow--esc td { opacity: .62; font-style: italic; }
.em-prow--esc .em-fireson-opt.active { opacity: 1; font-style: normal; }

.section-label {
  font-size: 0.78rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--md-default-fg-color--light);
  margin: 1.5rem 0 0.6rem;
}
.calc-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 1.25rem 2rem; margin-bottom: 1.5rem;
}
@media (max-width: 700px) { .calc-grid { grid-template-columns: 1fr; } }
.calc-field label {
  display: block; font-size: 0.78rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--md-default-fg-color--light); margin-bottom: 0.35rem;
}
.calc-field .hint { font-size: 0.72rem; color: var(--md-default-fg-color--lighter); margin-top: 0.25rem; }
.calc-field input[type=number] {
  width: 100%; box-sizing: border-box; padding: 0.45rem 0.6rem;
  border: 1px solid var(--md-default-fg-color--lighter); border-radius: 4px;
  background: var(--md-code-bg-color); color: var(--md-default-fg-color); font-size: 1rem;
}
.range-row { display: flex; align-items: center; gap: 0.75rem; }
.range-row input[type=range] { flex: 1; accent-color: var(--md-primary-fg-color); }
.range-row input[type=number] { width: 70px !important; }

/* prompt table */
.prompt-table-wrap { margin-bottom: 0.75rem; }
#prompt-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; table-layout: fixed; }
#prompt-table thead th {
  text-align: left; font-size: 0.72rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--md-default-fg-color--light); padding: 0.5rem 0.75rem;
  border-bottom: 2px solid var(--md-default-fg-color--lightest);
}
#prompt-table thead th.col-num { text-align: right; width: 108px; }
#prompt-table thead th:last-child { width: 36px; }
#prompt-table tbody tr:hover td { background: var(--md-code-bg-color); }
#prompt-table tbody td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--md-default-fg-color--lightest);
  vertical-align: top;
}
#prompt-table tfoot td {
  padding: 0.5rem 0.6rem; border-top: 2px solid var(--md-default-fg-color--lightest);
  font-weight: 700; font-size: 0.85rem;
}
#prompt-table tfoot .foot-label {
  color: var(--md-default-fg-color--light); font-size: 0.72rem;
  text-transform: uppercase; letter-spacing: 0.05em;
}
#prompt-table tfoot .foot-val { color: var(--md-primary-fg-color); }
.pt-name {
  display: block; width: 100%; box-sizing: border-box;
  padding: 0.25rem 0.4rem; border: 1px solid transparent; border-radius: 4px;
  background: transparent; color: var(--md-default-fg-color);
  font-size: 0.9rem; font-family: inherit; line-height: 1.45;
  white-space: normal; word-break: break-word; min-height: 1.5em; cursor: text;
}
.pt-name:focus { border-color: var(--md-primary-fg-color); background: var(--md-code-bg-color); outline: none; }
.pt-name:empty::before { content: attr(data-placeholder); color: var(--md-default-fg-color--lighter); pointer-events: none; }
.pt-num {
  width: 100%; box-sizing: border-box; padding: 0.3rem 0.4rem;
  border: 1px solid var(--md-default-fg-color--lightest); border-radius: 4px;
  background: var(--md-code-bg-color); color: var(--md-default-fg-color);
  font-size: 0.9rem; text-align: right; font-family: inherit;
}
.pt-num:focus { border-color: var(--md-primary-fg-color); outline: none; }
.pt-calc {
  text-align: right; font-weight: 600; color: var(--md-primary-fg-color);
  min-width: 80px; white-space: nowrap;
}
.pt-del {
  cursor: pointer; background: none; border: none;
  color: var(--md-default-fg-color--lighter); font-size: 1.1rem;
  padding: 0 0.3rem; line-height: 1; font-family: inherit; transition: color 0.15s;
}
.pt-del:hover { color: #e53935; }
.btn-add-row {
  display: inline-flex; align-items: center; gap: 0.4rem;
  cursor: pointer; padding: 0.35rem 0.9rem;
  border: 1px dashed var(--md-primary-fg-color); border-radius: 4px;
  background: transparent; color: var(--md-primary-fg-color);
  font-size: 0.83rem; font-family: inherit; margin-bottom: 1.5rem;
  transition: background 0.15s, color 0.15s;
}
.btn-add-row:hover { background: var(--md-primary-fg-color); color: var(--md-primary-bg-color); }
.btn-add-row.btn-escalation { border-color: var(--md-accent-fg-color, #e65100); color: var(--md-accent-fg-color, #e65100); }
.btn-add-row.btn-escalation:hover { background: var(--md-accent-fg-color, #e65100); color: #fff; }

/* escalation section */
.section-divider-row td {
  background: var(--md-code-bg-color); padding: 0.35rem 0.75rem;
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--md-default-fg-color--light);
  border-top: 2px solid var(--md-default-fg-color--lightest);
  border-bottom: 1px solid var(--md-default-fg-color--lightest);
}
.escalation-row > td:first-child { border-left: 3px solid var(--md-accent-fg-color, #e65100); }

/* deploy toggle */
.deploy-toggle { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
.deploy-btn {
  cursor: pointer; padding: 0.4rem 1.1rem; border-radius: 4px;
  border: 1.5px solid var(--md-primary-fg-color); background: transparent;
  color: var(--md-primary-fg-color); font-size: 0.85rem; font-family: inherit;
  transition: background 0.15s, color 0.15s;
}
.deploy-btn.active { background: var(--md-primary-fg-color); color: var(--md-primary-bg-color); }
.deploy-hint { font-size: 0.8rem; color: var(--md-default-fg-color--light); margin: 0.4rem 0 1rem; line-height: 1.5; }

/* results */
.results-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem; margin: 1.5rem 0;
}
.result-card {
  background: var(--md-code-bg-color); border: 1px solid var(--md-default-fg-color--lightest);
  border-radius: 6px; padding: 1rem 1.25rem; text-align: center;
}
.result-card .val { font-size: 1.8rem; font-weight: 700; color: var(--md-primary-fg-color); line-height: 1.15; }
.result-card .lbl { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--md-default-fg-color--light); margin-top: 0.3rem; }

/* budget */
.budget-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin: 1rem 0 0.5rem; }
.budget-row label {
  font-size: 0.78rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.04em; color: var(--md-default-fg-color--light); white-space: nowrap;
}
.budget-row input[type=number] {
  width: 150px; padding: 0.4rem 0.6rem;
  border: 1px solid var(--md-default-fg-color--lighter); border-radius: 4px;
  background: var(--md-code-bg-color); color: var(--md-default-fg-color); font-size: 1rem;
}
.budget-result { font-size: 0.9rem; color: var(--md-default-fg-color); margin-top: 0.25rem; }
.budget-result strong { color: var(--md-primary-fg-color); }

/* presets */
.scenario-bar { margin: 0 0 1rem; }
.scenario-pills { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.scenario-pill {
  cursor: pointer; padding: 0.3rem 0.75rem; border-radius: 20px;
  border: 1px solid var(--md-primary-fg-color); background: transparent;
  color: var(--md-primary-fg-color); font-size: 0.8rem; font-family: inherit;
  transition: background 0.15s, color 0.15s;
}
.scenario-pill:hover, .scenario-pill.active { background: var(--md-primary-fg-color); color: var(--md-primary-bg-color); }
hr.calc-divider { border: none; border-top: 1px solid var(--md-default-fg-color--lightest); margin: 1.5rem 0; }
</style>

<!-- ── Agent type ── -->
<div class="section-label">Agent type</div>
<div class="deploy-toggle">
  <button id="agent-interactive" class="deploy-btn active" onclick="setDetailedAgentType('interactive')">Interactive — user-led (chat / voice)</button>
  <button id="agent-autonomous" class="deploy-btn" onclick="setDetailedAgentType('autonomous')">Autonomous — event-driven (no user)</button>
</div>
<p id="agent-type-hint" class="deploy-hint">Interactive agents are driven by people — a user sends a message or makes a call. Credits scale with <em>users × interactions / month</em>, and M365 Copilot–licensed users can accrue zero credits on Microsoft 365 surfaces (Teams · Copilot Chat · SharePoint).</p>

<hr class="calc-divider">

<!-- ── Presets ── -->
<div class="scenario-bar" id="interactive-presets">
  <div class="section-label">Quick presets</div>
  <div class="scenario-pills">
    <button class="scenario-pill" onclick="applyScenario('pilot',event)">Pilot team (50 users)</button>
    <button class="scenario-pill" onclick="applyScenario('dept',event)">Department (500 users)</button>
    <button class="scenario-pill" onclick="applyScenario('org',event)">Full org (5,000 users)</button>
    <button class="scenario-pill" onclick="applyScenario('enterprise',event)">Enterprise (25,000 users)</button>
  </div>
</div>
<div class="scenario-bar em-hidden" id="autonomous-presets">
  <div class="section-label">Quick presets</div>
  <div class="scenario-pills">
    <button class="scenario-pill" onclick="applyAutoScenario('low',event)">Low volume (10K events / mo)</button>
    <button class="scenario-pill" onclick="applyAutoScenario('medium',event)">Medium (100K events / mo)</button>
    <button class="scenario-pill" onclick="applyAutoScenario('high',event)">High (1M events / mo)</button>
  </div>
</div>

<hr class="calc-divider">

<!-- ── Deployment type toggle ── -->
<div id="deploy-section">
<div class="section-label">Deployment type</div>
<div class="deploy-toggle">
  <button id="toggle-embedded" class="deploy-btn active" onclick="setDeployMode('embedded')">Microsoft 365 (Teams · Copilot Chat · SharePoint)</button>
  <button id="toggle-standalone" class="deploy-btn" onclick="setDeployMode('standalone')">Standalone / other channel</button>
</div>
<p id="deploy-hint" class="deploy-hint">On Microsoft 365 surfaces (Teams · Copilot Chat · SharePoint), M365 Copilot licensed users incur <strong>zero credits</strong>. Only unlicensed users generate credit consumption. Use the <em>% with M365 Copilot license</em> slider to set the licensed proportion.</p>

<hr class="calc-divider">
</div>

<!-- ── Org inputs ── -->
<div class="section-label" id="org-section-label">Organization</div>
<div class="calc-grid">
  <div class="calc-field" id="field-users">
    <label for="totalUsers">Total users in scope</label>
    <input type="number" id="totalUsers" min="1" value="500" oninput="recalc()">
    <div class="hint">Employees, contractors, or team members you're modelling</div>
  </div>
  <div class="calc-field" id="license-field">
    <label>% with M365 Copilot license</label>
    <div class="range-row">
      <input type="range" id="licensePctSlider" min="0" max="100" value="60" oninput="syncRange('licensePct','licensePctSlider');recalc()">
      <input type="number" id="licensePct" min="0" max="100" value="60" oninput="syncRange('licensePctSlider','licensePct');recalc()">
      <span>%</span>
    </div>
    <div class="hint" id="license-hint">Microsoft 365 surfaces (Teams · Copilot Chat · SharePoint): licensed users accrue zero credits — only unlicensed users are billed. Pilots typically 10–20 %; full rollouts 60–100 %</div>
  </div>
  <div class="calc-field" id="field-interactions">
    <label for="avgInteractions">Avg interactions / user / month</label>
    <input type="number" id="avgInteractions" min="0" step="0.5" value="10" oninput="recalc()">
    <div class="hint">How many times does a typical active user interact with this agent each month</div>
  </div>
  <div class="calc-field em-hidden" id="field-events">
    <label for="eventsPerMonth">Events / month</label>
    <input type="number" id="eventsPerMonth" min="0" step="1" value="10000" oninput="recalc()">
    <div class="hint">How many trigger events the agent processes each month — inbound emails, uploaded documents, queue items, records, etc. Every event is billed (no per-user licensing discount).</div>
  </div>
  <div class="calc-field">
    <label>Escalation rate</label>
    <div class="range-row">
      <input type="range" id="escalationRateSlider" min="0" max="100" value="0" oninput="syncRange('escalationRate','escalationRateSlider');recalc()">
      <input type="number" id="escalationRate" min="0" max="100" value="0" oninput="syncRange('escalationRateSlider','escalationRate');recalc()">
      <span>%</span>
    </div>
    <div class="hint" id="esc-field-hint">% of interactions that require additional handling beyond the normal path</div>
  </div>
</div>

<hr class="calc-divider">

<!-- ── Prompt table ── -->
<div class="section-label">Edit rows or add your own process steps</div>

<p class="hint" style="margin:-0.3rem 0 0.6rem">📞 <strong>Voice rows are per minute.</strong> In the <em>Uses / interaction</em> column, enter the average voice <strong>minutes per conversation</strong> — it's multiplied by your interactions × users to get the monthly total (credits = rate × minutes). The per-minute voice rate already <strong>includes</strong> the classic / generative answers and agent actions that occur during the call, so don't also fill in those rows for a voice agent. Tenant-graph grounding, content processing, AI tools, and agent flows are billed <strong>separately on top</strong>.</p>

<div class="prompt-table-wrap">
  <table id="prompt-table">
    <thead>
      <tr>
        <th>Agent feature / interaction type</th>
        <th class="col-num" id="th-uses">Uses / interaction</th>
        <th class="col-num">Credits / use</th>
        <th class="col-num">Credits / interaction</th>
        <th></th>
      </tr>
    </thead>
    <tbody id="normal-tbody"></tbody>
    <tbody id="escalation-tbody">
      <tr class="section-divider-row">
        <td colspan="5">Escalation path — <span id="esc-pct-label">0</span>% of <span id="esc-noun">interactions</span> trigger these additional steps</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td class="foot-label" id="foot-label-cell">Effective credits / interaction</td>
        <td></td>
        <td></td>
        <td class="foot-val" id="foot-credits" style="text-align:right">—</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
</div>

<div style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-bottom:1.5rem;">
  <button class="btn-add-row" style="margin-bottom:0" onclick="addRow('',1,1,false)">+ Add normal step</button>
  <button class="btn-add-row btn-escalation" style="margin-bottom:0" onclick="addRow('',1,1,true)">+ Add escalation step</button>
</div>

<hr class="calc-divider">

<!-- ── Results ── -->
<div class="section-label">Estimated monthly consumption</div>
<div class="results-grid">
  <div class="result-card"><div class="val" id="res-licensed">—</div><div class="lbl"><span id="lbl-billed">Unlicensed users (billed)</span></div></div>
  <div class="result-card"><div class="val" id="res-monthly-prompts">—</div><div class="lbl"><span id="lbl-interactions">Total interactions / month</span></div></div>
  <div class="result-card"><div class="val" id="res-credits">—</div><div class="lbl"><span id="lbl-credits-month">Credits / month (org)</span></div></div>
  <div class="result-card"><div class="val" id="res-per-user">—</div><div class="lbl"><span id="lbl-per-user">Credits / user / month</span></div></div>
</div>

<div class="em-export" role="group" aria-label="Export or share this Detailed estimate">
  <button type="button" class="em-btn secondary em-export-btn" onclick="emCopySummary('detailed')" aria-label="Copy a plain-text summary of this estimate to the clipboard">Copy summary</button>
  <button type="button" class="em-btn secondary em-export-btn" onclick="emDownloadSummary('detailed')" aria-label="Download this estimate as a Markdown file">Download .md</button>
  <button type="button" class="em-btn secondary em-export-btn" onclick="emDownloadCsv('detailed')" aria-label="Download the line items as a CSV file">Download .csv</button>
  <button type="button" class="em-btn secondary em-export-btn" onclick="emCopyLink()" aria-label="Copy a shareable link that reproduces this estimate">Copy link</button>
  <span class="em-export-status" id="em-export-status-detailed" role="status" aria-live="polite"></span>
</div>

<hr class="calc-divider">

<!-- ── Budget check ── -->
<div class="section-label">Budget check (optional)</div>
<div class="budget-row">
  <label for="creditBudget">Monthly credit budget</label>
  <input type="number" id="creditBudget" min="0" placeholder="e.g. 500 000" oninput="recalc()">
</div>
<div class="hint" style="margin-bottom:0.5rem">Enter a monthly credit budget above to see headroom or overage against your estimate.</div>
<div class="budget-result" id="budget-result"></div>

<script>
function fmt(n) {
  if (n >= 1e6) return (n/1e6).toFixed(1).replace(/\.0$/,'')+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1).replace(/\.0$/,'')+'K';
  return Math.round(n).toLocaleString();
}
function fmtDec(n) { return n % 1 === 0 ? n.toLocaleString() : n.toFixed(2); }
function syncRange(toId, fromId) {
  var el = document.getElementById(toId);
  if (el) el.value = document.getElementById(fromId).value;
}

var defaultRows = [
  // ── Core agent interactions ──
  { name: 'Classic answer',                                    count: 0, credits: 1    },
  { name: 'Generative answer',                                 count: 0, credits: 2    },
  { name: 'Agent action',                                      count: 0, credits: 5    },
  { name: 'Tenant graph grounding for messages',               count: 0, credits: 10   },
  { name: 'Agent flow actions (per 100 actions = 13 credits)', count: 0, credits: 0.13 },
  // ── AI tools ──
  { name: 'AI tool — Text/generative basic  (per 10 responses = 1 credit)',    count: 0, credits: 0.1  },
  { name: 'AI tool — Text/generative standard (per 10 responses = 15 credits)', count: 0, credits: 1.5  },
  { name: 'AI tool — Text/generative premium (per 10 responses = 100 credits)', count: 0, credits: 10   },
  { name: 'AI tool — Content processing (per page = 8 credits)',                count: 0, credits: 8    },
  // ── Voice (if applicable) ──
  { name: 'Voice — Basic (classic orchestration) — per minute',   count: 0, credits: 10   },
  { name: 'Voice — Standard (generative) — per minute',           count: 0, credits: 35   },
  { name: 'Voice — Premium (real-time) — per minute',             count: 0, credits: 75   },
];

var rowId = 0;

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function addRow(name, count, credits, isEscalation) {
  var id = ++rowId;
  var tr = document.createElement('tr');
  tr.dataset.rowId = id;
  if (isEscalation) tr.classList.add('escalation-row');
  tr.innerHTML =
    '<td><div class="pt-name" contenteditable="true" spellcheck="false" oninput="recalc()" data-placeholder="e.g. Generative answer">'+escHtml(name||'')+'</div></td>'+
    '<td style="text-align:right"><input class="pt-num" type="number" min="0" step="0.1" value="'+(count != null ? count : 1)+'" oninput="recalc()"></td>'+
    '<td style="text-align:right"><input class="pt-num" type="number" min="0" step="0.1" value="'+(credits != null ? credits : 1)+'" oninput="recalc()"></td>'+
    '<td class="pt-calc" id="row-sub-'+id+'">—</td>'+
    '<td><button class="pt-del" title="Remove row" onclick="removeRow('+id+')">✕</button></td>';
  var tbody = isEscalation ? document.getElementById('escalation-tbody') : document.getElementById('normal-tbody');
  tbody.appendChild(tr);
  recalc();
}

function removeRow(id) {
  var tr = document.querySelector('[data-row-id="'+id+'"]');
  if (!tr) return;
  var tbody = tr.parentElement;
  var dataRows = tbody.querySelectorAll('tr:not(.section-divider-row)');
  if (dataRows.length <= 1 && tbody.id === 'normal-tbody') return;
  tr.remove(); recalc();
}

var detailedAgentType = 'interactive';

function detToggleHidden(id, hidden) {
  var el = document.getElementById(id);
  if (el) el.classList.toggle('em-hidden', !!hidden);
}
function detSetText(id, txt) {
  var el = document.getElementById(id);
  if (el) el.textContent = txt;
}

function recalc() {
  var escPct = Math.min(100, Math.max(0, parseFloat(document.getElementById('escalationRate').value) || 0));

  // ── Shared: per-interaction / per-event credit total from the rows ──
  var totalCpud = 0;
  document.querySelectorAll('#normal-tbody tr').forEach(function(tr) {
    var ins = tr.querySelectorAll('.pt-num');
    var n = parseFloat(ins[0].value) || 0;
    var c = parseFloat(ins[1].value) || 0;
    var sub = n * c;
    totalCpud += sub;
    var cell = document.getElementById('row-sub-'+tr.dataset.rowId);
    if (cell) cell.textContent = fmtDec(sub);
  });
  document.querySelectorAll('#escalation-tbody tr:not(.section-divider-row)').forEach(function(tr) {
    var ins = tr.querySelectorAll('.pt-num');
    var n = parseFloat(ins[0].value) || 0;
    var c = parseFloat(ins[1].value) || 0;
    var sub = n * c;
    totalCpud += sub * escPct / 100;
    var cell = document.getElementById('row-sub-'+tr.dataset.rowId);
    if (cell) cell.textContent = fmtDec(sub);
  });

  document.getElementById('foot-credits').textContent = fmtDec(totalCpud);
  var escLabel = document.getElementById('esc-pct-label');
  if (escLabel) escLabel.textContent = Math.round(escPct);

  var autonomous = detailedAgentType === 'autonomous';
  var monthlyC, reduceHint;

  if (autonomous) {
    // ── Autonomous: events × credits/event, every event billed, no licensing ──
    var events = Math.max(0, parseFloat(document.getElementById('eventsPerMonth').value) || 0);
    monthlyC = events * totalCpud;

    detSetText('lbl-billed', 'Events / month');
    detSetText('lbl-interactions', 'Credits / event');
    detSetText('lbl-credits-month', 'Credits / month');
    detSetText('lbl-per-user', 'Credits / year');

    document.getElementById('res-licensed').textContent        = fmt(events);
    document.getElementById('res-monthly-prompts').textContent = fmtDec(totalCpud);
    document.getElementById('res-credits').textContent         = fmt(monthlyC);
    document.getElementById('res-per-user').textContent        = fmt(monthlyC * 12);
    reduceHint = 'Reduce events per month, escalation rate, or the credit mix.';
  } else {
    // ── Interactive: users × interactions × credits/interaction, licensing applies ──
    var total    = parseFloat(document.getElementById('totalUsers').value)   || 0;
    var licPct   = Math.min(100, Math.max(0, parseFloat(document.getElementById('licensePct').value)   || 0));
    var avgInt   = Math.max(0, parseFloat(document.getElementById('avgInteractions').value) || 0);
    var embedded   = document.getElementById('toggle-embedded').classList.contains('active');
    var licensed   = Math.round(total * licPct / 100);
    var unlicensed = total - licensed;
    var billedBase = embedded ? unlicensed : total;
    var active     = billedBase;

    var monthlyP = active * avgInt;
    monthlyC = active * avgInt * totalCpud;
    var perUser  = avgInt * totalCpud;

    detSetText('lbl-billed', embedded ? 'Unlicensed users (billed)' : 'Total users (all billed)');
    detSetText('lbl-interactions', 'Total interactions / month');
    detSetText('lbl-credits-month', 'Credits / month (org)');
    detSetText('lbl-per-user', 'Credits / user / month');

    document.getElementById('res-licensed').textContent        = fmt(billedBase);
    document.getElementById('res-monthly-prompts').textContent = fmt(monthlyP);
    document.getElementById('res-credits').textContent         = fmt(monthlyC);
    document.getElementById('res-per-user').textContent        = fmt(perUser);
    reduceHint = 'Reduce interactions per user, escalation rate, or the credit mix.';
  }

  window.__detailedResult = { monthly: monthlyC, perUnit: totalCpud, regime: autonomous ? 'autonomous' : 'interactive' };

  var budget   = parseFloat(document.getElementById('creditBudget').value);
  var resultEl = document.getElementById('budget-result');
  if (budget > 0 && monthlyC > 0) {
    var ratio = monthlyC / budget;
    if (ratio <= 1) {
      resultEl.innerHTML = '✅ Estimate of <strong>'+fmt(monthlyC)+' credits/month</strong> fits within budget — <strong>'+fmt(budget-monthlyC)+' credits headroom</strong> ('+Math.round((1-ratio)*100)+'% spare).';
    } else {
      resultEl.innerHTML = '⚠️ Estimate of <strong>'+fmt(monthlyC)+' credits/month</strong> exceeds budget by <strong>'+fmt(monthlyC-budget)+' credits</strong> ('+Math.round((ratio-1)*100)+'% over). '+reduceHint;
    }
  } else { resultEl.innerHTML = ''; }
}

function setDetailedAgentType(mode) {
  detailedAgentType = (mode === 'autonomous') ? 'autonomous' : 'interactive';
  var auto = detailedAgentType === 'autonomous';

  document.getElementById('agent-interactive').classList.toggle('active', !auto);
  document.getElementById('agent-autonomous').classList.toggle('active', auto);
  document.getElementById('agent-type-hint').innerHTML = auto
    ? 'Autonomous agents run without a person in the loop — each trigger event (an inbound email, a document, a queue item) is processed on its own. Credits scale with <em>events × credits per event</em>. There is <strong>no per-user licensing discount</strong>: every event is billed.'
    : 'Interactive agents are driven by people — a user sends a message or makes a call. Credits scale with <em>users × interactions / month</em>, and M365 Copilot–licensed users can accrue zero credits in embedded mode.';

  detToggleHidden('deploy-section', auto);
  detToggleHidden('interactive-presets', auto);
  detToggleHidden('autonomous-presets', !auto);
  detToggleHidden('field-users', auto);
  detToggleHidden('license-field', auto);
  detToggleHidden('field-interactions', auto);
  detToggleHidden('field-events', !auto);

  detSetText('org-section-label', auto ? 'Event volume' : 'Organization');
  detSetText('th-uses', auto ? 'Uses / event' : 'Uses / interaction');
  detSetText('foot-label-cell', auto ? 'Effective credits / event' : 'Effective credits / interaction');
  detSetText('esc-noun', auto ? 'events' : 'interactions');
  detSetText('esc-field-hint', auto
    ? '% of events that require additional handling beyond the normal path'
    : '% of interactions that require additional handling beyond the normal path');

  recalc();
}

function setDeployMode(mode) {
  var isEmbedded = mode === 'embedded';
  document.getElementById('toggle-embedded').classList.toggle('active', isEmbedded);
  document.getElementById('toggle-standalone').classList.toggle('active', !isEmbedded);
  document.getElementById('deploy-hint').innerHTML = isEmbedded
    ? 'On Microsoft 365 surfaces (Teams · Copilot Chat · SharePoint), M365 Copilot licensed users incur <strong>zero credits</strong>. Only unlicensed users generate credit consumption. Use the <em>% with M365 Copilot license</em> slider to set the licensed proportion.'
    : 'All users generate credits regardless of M365 Copilot license status. The <em>% with M365 Copilot license</em> slider has no effect on credit calculation.';
  var licField = document.getElementById('license-field');
  if (licField) licField.style.opacity = isEmbedded ? '1' : '0.45';
  recalc();
}

var scenarios = {
  pilot:      { totalUsers:   50, licensePct:  30, escalationRate: 10, avgInteractions:  5 },
  dept:       { totalUsers:  500, licensePct:  80, escalationRate: 20, avgInteractions: 10 },
  org:        { totalUsers: 5000, licensePct:  60, escalationRate: 20, avgInteractions: 12 },
  enterprise: { totalUsers:25000, licensePct:  40, escalationRate: 15, avgInteractions:  8 },
};

function applyScenario(key, evt) {
  var s = scenarios[key];
  document.getElementById('totalUsers').value           = s.totalUsers;
  document.getElementById('licensePct').value           = s.licensePct;
  document.getElementById('licensePctSlider').value     = s.licensePct;
  document.getElementById('avgInteractions').value      = s.avgInteractions;
  document.getElementById('escalationRate').value       = s.escalationRate;
  document.getElementById('escalationRateSlider').value = s.escalationRate;
  document.querySelectorAll('#interactive-presets .scenario-pill').forEach(function(el){ el.classList.remove('active'); });
  if (evt && evt.target) evt.target.classList.add('active');
  recalc();
}

var autoScenarios = {
  low:    { events:   10000, escalationRate: 10 },
  medium: { events:  100000, escalationRate: 15 },
  high:   { events: 1000000, escalationRate: 20 },
};

function applyAutoScenario(key, evt) {
  var s = autoScenarios[key];
  if (!s) return;
  var e = document.getElementById('eventsPerMonth');
  if (e) e.value = s.events;
  document.getElementById('escalationRate').value       = s.escalationRate;
  document.getElementById('escalationRateSlider').value = s.escalationRate;
  document.querySelectorAll('#autonomous-presets .scenario-pill').forEach(function(el){ el.classList.remove('active'); });
  if (evt && evt.target) evt.target.classList.add('active');
  recalc();
}

defaultRows.forEach(function(r){ addRow(r.name, r.count, r.credits, false); });
recalc();
</script>

</div>

</div>

---

!!! tip "What to do with this number"
    - **Credit budget planning** — share the monthly credit estimate with your IT/finance team alongside the licensed user count to validate your M365 Copilot SKU allocation.
    - **Adoption benchmarking** — as real usage data comes in from the admin center, compare actuals to this estimate to see whether adoption is ahead or behind plan.
    - **Scenario planning** — run the estimator at 3 adoption-rate levels (conservative / target / optimistic) to bracket your credit spend.

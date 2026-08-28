---
title: Agent Builder
description: Describe an agent in plain words and get a ready-to-import Copilot Studio starter — instructions, tools, knowledge, and topics, as a .zip or copy-paste config.
hide: [toc]
---

# Describe an agent → build it in Copilot Studio

Say what you want the agent to do, in plain English. This scaffolds a **ready-to-import Copilot Studio starter** — a baseline agent with **instructions**, any **tools** and **knowledge** it implied, and the standard system topics — that you can download as a solution `.zip` or copy as paste-ready config.

- **Instructions are editable** and are exactly what ships in the `.zip` (what you see is what you get).
- Pick the **harness**: the *GitHub Copilot harness* (generative, instruction-driven) for reasoning / multi-step work, or the *Standard harness* (topics + rules) for predictable Q&A and single actions.

!!! note "A starting point, not a finished agent"
    The starter imports cleanly, then you finish it in Copilot Studio: pick a connection for each tool, confirm knowledge sources, and review the instructions. Anything that needs a manual step is listed in the generated `NEXT-STEPS.md`. New to importing? See the [Import & Configure guide](agent-import-guide.md) for step‑by‑step setup, gotchas, and an FAQ. To size an agent's running cost, use the [Credit Estimator](credit-estimator.md).

<div id="agent-builder" markdown="0">
  <p class="hint">Loading agent builder…</p>
</div>

<style>
#agent-builder .ab-card { border: 1px solid var(--md-default-fg-color--lightest); border-radius: 12px; padding: 1.4rem; background: var(--md-default-bg-color); }
#agent-builder .ab-scope { font-size: 0.78rem; line-height: 1.5; color: var(--md-default-fg-color--light); margin: -0.3rem 0 1rem; padding: 0.55rem 0.7rem; background: var(--md-code-bg-color); border-radius: 8px; }
#agent-builder .ab-nl { display: flex; flex-direction: column; gap: 0.5rem; }
#agent-builder .ab-nl label { font-size: 0.95rem; }
#agent-builder .ab-nl textarea { width: 100%; box-sizing: border-box; padding: 0.6rem 0.7rem; border: 1px solid var(--md-default-fg-color--lighter); border-radius: 6px; background: var(--md-default-bg-color); color: var(--md-default-fg-color); font: inherit; }
#agent-builder .ab-nl textarea:focus { outline: 2px solid var(--md-primary-fg-color); outline-offset: -1px; }
#agent-builder .ab-ex-row { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; }
#agent-builder .ab-ex-lbl { font-size: 0.78rem; color: var(--md-default-fg-color--light); }
#agent-builder .ab-ex { font-size: 0.76rem; padding: 0.25rem 0.55rem; border: 1px solid var(--md-default-fg-color--lighter); border-radius: 999px; background: transparent; color: var(--md-default-fg-color); cursor: pointer; text-align: left; }
#agent-builder .ab-ex:hover { border-color: var(--md-primary-fg-color); }
#agent-builder .ab-btn { align-self: flex-start; padding: 0.5rem 1rem; border: none; border-radius: 6px; background: var(--md-primary-fg-color); color: var(--md-primary-bg-color); font-weight: 700; cursor: pointer; }
#agent-builder .ab-btn.secondary { background: transparent; color: var(--md-primary-fg-color); border: 1px solid var(--md-primary-fg-color); }
#agent-builder .ab-btn:hover { filter: brightness(1.05); }

#agent-builder .ab-preview { margin-top: 1.2rem; border-top: 1px solid var(--md-default-fg-color--lightest); padding-top: 1.1rem; }
#agent-builder .ab-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0.9rem; }
#agent-builder .ab-field { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.9rem; }
#agent-builder .ab-field label { font-weight: 600; font-size: 0.85rem; }
#agent-builder .ab-field label span { font-weight: 400; color: var(--md-default-fg-color--light); }
#agent-builder .ab-field input[type=text] { padding: 0.5rem 0.6rem; border: 1px solid var(--md-default-fg-color--lighter); border-radius: 6px; background: var(--md-default-bg-color); color: var(--md-default-fg-color); font: inherit; }
#agent-builder .ab-field input[type=text]:focus, #agent-builder .ab-instr:focus { outline: 2px solid var(--md-primary-fg-color); outline-offset: -1px; }
#agent-builder .ab-harness { display: inline-flex; border: 1px solid var(--md-default-fg-color--lighter); border-radius: 8px; overflow: hidden; }
#agent-builder .ab-harness-opt { padding: 0.4rem 0.7rem; border: none; background: transparent; color: var(--md-default-fg-color); font-size: 0.82rem; cursor: pointer; }
#agent-builder .ab-harness-opt.on { background: var(--md-primary-fg-color); color: var(--md-primary-bg-color); font-weight: 700; }
#agent-builder .ab-sub { font-size: 0.74rem; color: var(--md-default-fg-color--light); }
#agent-builder .ab-instr { width: 100%; box-sizing: border-box; padding: 0.6rem 0.7rem; border: 1px solid var(--md-default-fg-color--lighter); border-radius: 6px; background: var(--md-code-bg-color); color: var(--md-default-fg-color); font-family: var(--md-code-font-family, monospace); font-size: 0.82rem; line-height: 1.5; resize: vertical; }
#agent-builder .ab-instr-actions { margin-top: 0.35rem; }
#agent-builder .ab-link { background: none; border: none; color: var(--md-primary-fg-color); font-size: 0.78rem; cursor: pointer; padding: 0; }
#agent-builder .ab-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 0.4rem 0 0.6rem; }
#agent-builder .ab-col-h { font-weight: 700; font-size: 0.8rem; margin-bottom: 0.3rem; }
#agent-builder .ab-list { list-style: none; padding: 0; margin: 0; }
#agent-builder .ab-list li { font-size: 0.82rem; padding: 0.25rem 0; border-bottom: 1px dashed var(--md-default-fg-color--lightest); }
#agent-builder .ab-list li label { display: inline; cursor: pointer; }
#agent-builder .ab-list li input[type=checkbox] { margin-right: 0.4rem; vertical-align: middle; }
#agent-builder .ab-pill { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; border-radius: 4px; padding: 0.08rem 0.4rem; margin-left: 0.3rem; }
#agent-builder .ab-pill--toggle { color: #b0492f; background: rgba(212,85,63,0.12); }
#agent-builder .ab-pill--wired { color: #1f7a44; background: rgba(46,158,87,0.14); }
#agent-builder .ab-tag { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--md-default-fg-color--light); background: var(--md-code-bg-color); border-radius: 4px; padding: 0.08rem 0.4rem; margin-left: 0.3rem; }
#agent-builder .ab-workiq-field { border: 1px solid var(--md-default-fg-color--lightest); border-radius: 8px; padding: 0.6rem 0.75rem; background: var(--md-code-bg-color); }
#agent-builder .ab-workiq { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; }
#agent-builder .ab-workiq span { font-weight: 400; }
#agent-builder .ab-skills { width: 100%; box-sizing: border-box; padding: 0.5rem 0.6rem; border: 1px solid var(--md-default-fg-color--lighter); border-radius: 6px; background: var(--md-default-bg-color); color: var(--md-default-fg-color); font: inherit; font-size: 0.82rem; resize: vertical; }
#agent-builder .ab-skills:focus { outline: 2px solid var(--md-primary-fg-color); outline-offset: -1px; }
#agent-builder .ab-hint { font-size: 0.76rem; color: var(--md-default-fg-color--light); margin: 0.3rem 0; }
#agent-builder .ab-addtool { margin: 0.3rem 0 0.6rem; display: flex; flex-direction: column; gap: 0.25rem; }
#agent-builder .ab-addtool-sel { max-width: 22rem; padding: 0.4rem 0.5rem; border: 1px dashed var(--md-default-fg-color--lighter); border-radius: 6px; background: var(--md-default-bg-color); color: var(--md-default-fg-color); font: inherit; font-size: 0.82rem; }
#agent-builder .ab-addtool-sel:focus { outline: 2px solid var(--md-primary-fg-color); outline-offset: -1px; }
#agent-builder .ab-added-note { font-size: 0.78rem; color: var(--md-default-fg-color--light); }
#agent-builder .ab-list li span { color: var(--md-default-fg-color--light); }
#agent-builder .ab-list .ab-sub { display: block; }
#agent-builder .ab-list .ab-empty { color: var(--md-default-fg-color--light); border: none; }
#agent-builder .ab-flag { font-size: 0.68rem; color: #b0492f; background: rgba(212,85,63,0.12); border-radius: 4px; padding: 0.05rem 0.35rem; margin-left: 0.3rem; }
#agent-builder .ab-meta { display: flex; flex-wrap: wrap; gap: 1.2rem; font-size: 0.8rem; color: var(--md-default-fg-color--light); margin: 0.3rem 0 0.6rem; }
#agent-builder .ab-unmapped { font-size: 0.8rem; margin: 0.4rem 0; padding: 0.5rem 0.65rem; background: var(--md-code-bg-color); border-radius: 6px; }
#agent-builder .ab-notices { margin: 0.6rem 0; border: 1px solid var(--md-default-fg-color--lighter); border-radius: 8px; padding: 0.6rem 0.75rem; }
#agent-builder .ab-notices-h { font-weight: 700; font-size: 0.82rem; margin-bottom: 0.35rem; }
#agent-builder .ab-notice { font-size: 0.8rem; margin: 0.25rem 0; }
#agent-builder .ab-notice .ab-sub { margin-top: 0.1rem; }
#agent-builder .ab-actions { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.9rem; }
#agent-builder .ab-status { font-size: 0.82rem; margin-top: 0.5rem; color: var(--md-default-fg-color--light); min-height: 1.2em; }
#agent-builder .ab-status.err { color: #b0492f; }
#agent-builder .ab-help { margin-top: 0.8rem; font-size: 0.82rem; }
#agent-builder .ab-help summary { cursor: pointer; font-weight: 600; }
#agent-builder .ab-help ol { margin: 0.4rem 0 0; padding-left: 1.2rem; }
#agent-builder .ab-err { color: #b0492f; }
@media (max-width: 640px) { #agent-builder .ab-row2, #agent-builder .ab-cols { grid-template-columns: 1fr; } }
</style>

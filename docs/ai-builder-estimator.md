---
title: AI Builder → Copilot Credits Estimator
description: "Map your existing Microsoft AI Builder usage to Copilot Studio Copilot Credits in seconds. Grounded in Microsoft's official AI Builder Capability Rate table."
hide: [toc]
wide: true
---

# AI Builder → Copilot Credits Estimator

Microsoft is retiring the way AI Builder is funded: **AI Builder capacity add-ons can only be
renewed by existing customers (from November 1, 2025), and the AI Builder credits seeded in Power
Platform and Dynamics licenses are removed in November 2026.** After that, the same AI Builder
capabilities — document processing, prompts, text and image analysis — run on **Copilot Credits**.

This tool answers the one question every customer with existing AI Builder usage asks:
**"What will my current AI Builder workload cost me in Copilot Credits?"** Enter what you use today,
get the Copilot Credits you need to provision. Everything runs in your browser; nothing is uploaded.

!!! borrow "Borrow, don't build — this is grounded, but Microsoft owns the truth"
    Every rate in this estimator is transcribed **verbatim** from Microsoft's official
    **AI Builder Capability Rate table**, retrieved **2026-08-10**. Rates and packaging change; for
    any customer-facing number, go to the source:

    - [AI Builder licensing — Capability Rate table](https://learn.microsoft.com/en-us/ai-builder/administer-licensing#ai-builder-capability-rate-table) — the rate card (Copilot Credit **and** AI Builder credit rate per capability)
    - [Licensing and Copilot Credits](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management) — how Copilot Credits are bought and pooled
    - [Microsoft Copilot Studio Licensing Guide (PDF)](https://go.microsoft.com/fwlink/?linkid=2320995) — the most complete, most current pricing

<div id="aib-estimator" markdown="0">

<style>
/* ── AI Builder mapper — self-contained, on-brand (reuses Material CSS vars) ── */
/* Step scaffolding */
#aib-estimator .aib-step { margin: 1.4rem 0 0; }
#aib-estimator .aib-step-h {
  display: flex; align-items: center; gap: 0.55rem;
  font-size: 0.95rem; font-weight: 700; margin: 0 0 0.6rem;
}
#aib-estimator .aib-step-n {
  flex: none; display: inline-flex; align-items: center; justify-content: center;
  width: 1.35rem; height: 1.35rem; border-radius: 50%;
  background: var(--md-primary-fg-color); color: var(--md-primary-bg-color);
  font-size: 0.78rem; font-weight: 800;
}

/* Segmented control (Step 1) */
#aib-estimator .aib-seg {
  display: inline-flex; padding: 0.2rem; gap: 0.2rem; border-radius: 10px;
  background: var(--md-code-bg-color); border: 1px solid var(--md-default-fg-color--lighter);
}
@media (max-width: 480px) { #aib-estimator .aib-seg { display: flex; width: 100%; } }
#aib-estimator .aib-seg-btn {
  font: inherit; font-size: 0.85rem; font-weight: 600; cursor: pointer;
  padding: 0.45rem 1rem; border-radius: 8px; border: 0; background: transparent;
  color: var(--md-default-fg-color--light); transition: background .14s, color .14s, box-shadow .14s;
  flex: 1 1 auto; white-space: nowrap;
}
#aib-estimator .aib-seg-btn:hover { color: var(--md-default-fg-color); }
#aib-estimator .aib-seg-btn:focus-visible { outline: 2px solid var(--md-accent-fg-color); outline-offset: 2px; }
#aib-estimator .aib-seg-btn--active {
  background: var(--md-primary-fg-color); color: var(--md-primary-bg-color);
  box-shadow: 0 1px 3px rgba(0,0,0,.18);
}
#aib-estimator .aib-mode-desc {
  font-size: 0.85rem; color: var(--md-default-fg-color--light);
  margin: 0.7rem 0 0; line-height: 1.5; max-width: 72ch;
}

/* Presets + generic chips */
#aib-estimator .aib-presets { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; margin: 0 0 0.9rem; }
#aib-estimator .aib-presets .hint { font-size: 0.78rem; color: var(--md-default-fg-color--light); }
#aib-estimator .em-chip {
  font: inherit; font-size: 0.78rem; cursor: pointer; padding: 0.25rem 0.6rem; border-radius: 14px;
  border: 1px solid var(--md-default-fg-color--lighter); background: transparent;
  color: var(--md-default-fg-color); white-space: nowrap;
}
#aib-estimator .em-chip:hover { border-color: var(--md-primary-fg-color); color: var(--md-primary-fg-color); }

/* Capability chooser (Step 2) */
#aib-estimator .aib-chooser-group { margin: 0.5rem 0 0.7rem; }
#aib-estimator .aib-group-label {
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--md-default-fg-color--light); margin: 0.6rem 0 0.45rem;
}
#aib-estimator .aib-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; }
#aib-estimator .aib-chip-cap {
  font: inherit; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.32rem 0.7rem; border-radius: 16px; white-space: nowrap;
  border: 1px solid var(--md-default-fg-color--lighter); background: transparent;
  color: var(--md-default-fg-color); transition: border-color .12s, background .12s, color .12s;
}
#aib-estimator .aib-chip-cap:hover { border-color: var(--md-primary-fg-color); }
#aib-estimator .aib-chip-cap:focus-visible { outline: 2px solid var(--md-accent-fg-color); outline-offset: 2px; }
#aib-estimator .aib-chip-cap .aib-chip-mark { font-size: 0.85rem; font-weight: 800; line-height: 1; opacity: 0.55; }
#aib-estimator .aib-chip-cap--on {
  border-color: var(--md-primary-fg-color); color: var(--md-primary-fg-color); font-weight: 600;
  background: color-mix(in srgb, var(--md-primary-fg-color) 12%, transparent);
}
#aib-estimator .aib-chip-cap--on .aib-chip-mark { opacity: 1; }

/* Input rows (Step 3) */
#aib-estimator .aib-row {
  display: flex; align-items: center; gap: 0.75rem; padding: 0.55rem 0;
  border-bottom: 1px solid var(--md-default-fg-color--lightest);
}
#aib-estimator .aib-row:last-child { border-bottom: 0; }
#aib-estimator .aib-row-label { flex: 1; display: flex; flex-direction: column; min-width: 0; cursor: default; }
#aib-estimator .aib-cap { font-size: 0.88rem; line-height: 1.3; }
#aib-estimator .aib-unit { font-size: 0.72rem; color: var(--md-default-fg-color--light); }
#aib-estimator .aib-rowout {
  font-size: 0.74rem; color: var(--md-primary-fg-color); font-weight: 600; margin-top: 0.15rem;
  font-variant-numeric: tabular-nums; min-height: 1em;
}
#aib-estimator .aib-input {
  width: 8.5rem; flex: none; font: inherit; font-size: 0.9rem; text-align: right;
  padding: 0.35rem 0.5rem; border-radius: 6px; border: 1px solid var(--md-default-fg-color--lighter);
  background: var(--md-default-bg-color); color: var(--md-default-fg-color); font-variant-numeric: tabular-nums;
}
#aib-estimator .aib-input:focus { border-color: var(--md-primary-fg-color); outline: none; }
#aib-estimator .aib-remove {
  flex: none; font: inherit; font-size: 1rem; line-height: 1; cursor: pointer;
  width: 1.6rem; height: 1.6rem; border-radius: 6px; border: 1px solid transparent;
  background: transparent; color: var(--md-default-fg-color--light);
}
#aib-estimator .aib-remove:hover { border-color: var(--md-default-fg-color--lighter); color: var(--md-default-fg-color); }
#aib-estimator .aib-empty {
  font-size: 0.85rem; line-height: 1.5; color: var(--md-default-fg-color--light);
  padding: 1rem 1.1rem; border-radius: 8px; border: 1px dashed var(--md-default-fg-color--lighter);
  background: var(--md-code-bg-color);
}
#aib-estimator .aib-reset { margin: 0.9rem 0 0; }
#aib-estimator .em-hidden { display: none !important; }

/* ── Results ── */
#aib-estimator .aib-results { margin-top: 1.75rem; animation: aib-reveal .28s ease both; }
@keyframes aib-reveal { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { #aib-estimator .aib-results { animation: none; } }

/* Side-by-side compare card (the dollars story) */
#aib-estimator .aib-compare {
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: stretch; gap: 0.9rem;
  margin: 0 0 0.9rem;
}
@media (max-width: 560px) { #aib-estimator .aib-compare { grid-template-columns: 1fr; } }
#aib-estimator .aib-compare-col {
  padding: 1rem 1.15rem; border-radius: 10px; border: 1px solid var(--md-default-fg-color--lighter);
  background: var(--md-code-bg-color);
}
#aib-estimator .aib-compare-col--copilot {
  border-color: color-mix(in srgb, var(--md-primary-fg-color) 40%, transparent);
  background: color-mix(in srgb, var(--md-primary-fg-color) 10%, transparent);
}
#aib-estimator .aib-compare-tag { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: var(--md-default-fg-color--light); }
#aib-estimator .aib-compare-col--copilot .aib-compare-tag { color: var(--md-primary-fg-color); }
#aib-estimator .aib-compare-num { font-size: 2rem; font-weight: 800; line-height: 1.1; font-variant-numeric: tabular-nums; margin-top: 0.25rem; }
#aib-estimator .aib-compare-col--copilot .aib-compare-num { color: var(--md-primary-fg-color); }
#aib-estimator .aib-compare-unit { font-size: 0.76rem; color: var(--md-default-fg-color--light); }
#aib-estimator .aib-compare-usd { font-size: 0.85rem; font-weight: 600; margin-top: 0.5rem; font-variant-numeric: tabular-nums; }
#aib-estimator .aib-compare-sub { font-size: 0.72rem; color: var(--md-default-fg-color--light); }
#aib-estimator .aib-compare-arrow {
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; font-weight: 800; color: var(--md-primary-fg-color);
}
@media (max-width: 560px) { #aib-estimator .aib-compare-arrow { transform: rotate(90deg); } }
#aib-estimator .aib-compare-why {
  font-size: 0.85rem; line-height: 1.55; color: var(--md-default-fg-color--light);
  border-left: 3px solid var(--md-primary-fg-color); padding-left: 0.75rem; margin: 0 0 0.4rem;
}
#aib-estimator .aib-table { width: 100%; border-collapse: collapse; font-size: 0.83rem; margin: 1rem 0; }
#aib-estimator .aib-table th, #aib-estimator .aib-table td { text-align: left; padding: 0.4rem 0.55rem; border-bottom: 1px solid var(--md-default-fg-color--lightest); }
#aib-estimator .aib-table th { font-weight: 700; color: var(--md-default-fg-color--light); }
#aib-estimator .aib-table td.num, #aib-estimator .aib-table th.num { text-align: right; font-variant-numeric: tabular-nums; }
#aib-estimator .aib-table tfoot td { font-weight: 700; border-top: 2px solid var(--md-default-fg-color--lighter); }
#aib-estimator .aib-u { color: var(--md-default-fg-color--lighter); font-size: 0.72rem; }
#aib-estimator .aib-flag { color: var(--md-primary-fg-color); cursor: help; font-weight: 700; }
#aib-estimator .aib-notes { font-size: 0.82rem; line-height: 1.6; color: var(--md-default-fg-color--light); margin: 0.5rem 0; }
#aib-estimator .aib-notes p { margin: 0.4rem 0; }
#aib-estimator .aib-caveat { border-left: 3px solid var(--md-primary-fg-color); padding-left: 0.7rem; }
#aib-estimator .aib-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin: 1rem 0 0; }
#aib-estimator .aib-status { font-size: 0.8rem; color: var(--md-default-fg-color--light); min-height: 1.1em; }

/* ── Import / paste (Step 2 alt) ── */
#aib-estimator .aib-seg--sub { margin: 0 0 0.2rem; }
#aib-estimator .aib-io-row { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; margin: 0.8rem 0 0.5rem; font-size: 0.85rem; }
#aib-estimator .aib-io-row label { display: inline-flex; align-items: center; gap: 0.45rem; color: var(--md-default-fg-color--light); }
#aib-estimator .aib-select {
  font: inherit; font-size: 0.85rem; padding: 0.3rem 0.5rem; border-radius: 6px;
  border: 1px solid var(--md-default-fg-color--lighter);
  background: var(--md-default-bg-color); color: var(--md-default-fg-color);
}
#aib-estimator .aib-paste {
  width: 100%; box-sizing: border-box; min-height: 8rem; resize: vertical;
  font: inherit; font-size: 0.82rem; font-family: var(--md-code-font-family, monospace);
  padding: 0.6rem 0.7rem; border-radius: 8px; line-height: 1.5;
  border: 1px solid var(--md-default-fg-color--lighter);
  background: var(--md-code-bg-color); color: var(--md-default-fg-color);
}
#aib-estimator .aib-paste:focus { border-color: var(--md-primary-fg-color); outline: none; }
#aib-estimator .aib-map { margin: 0.9rem 0 0; }
#aib-estimator .aib-map-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
#aib-estimator .aib-map-table th, #aib-estimator .aib-map-table td {
  text-align: left; padding: 0.4rem 0.5rem; border-bottom: 1px solid var(--md-default-fg-color--lightest); vertical-align: middle;
}
#aib-estimator .aib-map-table th { font-weight: 700; color: var(--md-default-fg-color--light); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; }
#aib-estimator .aib-map-table td.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
#aib-estimator .aib-map-src { font-weight: 600; word-break: break-word; }
#aib-estimator .aib-map-auto { font-size: 0.7rem; color: var(--md-primary-fg-color); }
#aib-estimator .aib-map-auto--none { color: var(--md-default-fg-color--light); }
#aib-estimator .aib-map-table select { max-width: 15rem; width: 100%; }

/* Allocator (Path B) */
#aib-estimator .aib-alloc-row { display: grid; grid-template-columns: 1fr 9rem 3.4rem; align-items: center; gap: 0.7rem; padding: 0.4rem 0; }
@media (max-width: 480px) { #aib-estimator .aib-alloc-row { grid-template-columns: 1fr 3.4rem; } #aib-estimator .aib-alloc-range { display: none; } }
#aib-estimator .aib-alloc-name { font-size: 0.85rem; }
#aib-estimator .aib-alloc-range { width: 100%; accent-color: var(--md-primary-fg-color); }
#aib-estimator .aib-alloc-pct {
  width: 3.4rem; box-sizing: border-box; font: inherit; font-size: 0.85rem; text-align: right;
  padding: 0.25rem 0.35rem; border-radius: 6px; border: 1px solid var(--md-default-fg-color--lighter);
  background: var(--md-default-bg-color); color: var(--md-default-fg-color); font-variant-numeric: tabular-nums;
}
#aib-estimator .aib-alloc-sum { margin: 0.5rem 0 0; font-weight: 600; }
#aib-estimator .aib-alloc-sum--bad { color: var(--md-typeset-del-color, #b00); }
#aib-estimator .aib-modeled {
  font-size: 0.78rem; line-height: 1.5; color: var(--md-default-fg-color--light);
  background: color-mix(in srgb, var(--md-primary-fg-color) 8%, transparent);
  border: 1px dashed color-mix(in srgb, var(--md-primary-fg-color) 40%, transparent);
  border-radius: 8px; padding: 0.6rem 0.75rem; margin: 0 0 0.9rem;
}
</style>

<div class="aib-step">
  <div class="aib-step-h"><span class="aib-step-n">1</span> How do you have your numbers?</div>
  <div class="aib-seg" id="aib-mode-cards" role="tablist" aria-label="How do you want to enter your AI Builder usage?">
    <button type="button" class="aib-seg-btn aib-seg-btn--active" role="tab" aria-selected="true" data-mode="usage" onclick="aibSetMode('usage')">By usage volume</button>
    <button type="button" class="aib-seg-btn" role="tab" aria-selected="false" data-mode="credits" onclick="aibSetMode('credits')">By AI Builder credits</button>
    <button type="button" class="aib-seg-btn" role="tab" aria-selected="false" data-mode="import" onclick="aibSetMode('import')">Import my data</button>
  </div>
  <p id="aib-mode-desc" class="aib-mode-desc"></p>
</div>

<div class="aib-step" id="aib-step-cap">
  <div class="aib-step-h"><span class="aib-step-n">2</span> Which capabilities do you use?</div>
  <div class="aib-presets">
    <span class="hint">Quick start:</span>
    <button type="button" class="em-chip" onclick="aibPreset('invoice')">Invoice / receipt shop</button>
    <button type="button" class="em-chip" onclick="aibPreset('docs')">Document-heavy ops</button>
    <button type="button" class="em-chip" onclick="aibPreset('text')">Text analytics</button>
    <button type="button" class="em-chip" onclick="aibPreset('prompts')">GenAI prompts</button>
  </div>
  <div id="aib-chooser"><!-- capability chooser chips injected by ai-builder-estimator.js --></div>
</div>

<div class="aib-step" id="aib-step-input">
  <div class="aib-step-h"><span class="aib-step-n">3</span> Enter your monthly numbers</div>
  <div id="aib-empty" class="aib-empty">Pick a capability above (or tap a preset) and a row will appear here to enter your monthly numbers.</div>
  <div id="aib-rows"><!-- capability input rows injected by ai-builder-estimator.js --></div>
  <button type="button" class="em-chip aib-reset em-hidden" id="aib-reset-btn" onclick="aibReset()">Reset all</button>
</div>

<div class="aib-step em-hidden" id="aib-step-import">
  <div class="aib-step-h"><span class="aib-step-n">2</span> Import your data</div>
  <div class="aib-seg aib-seg--sub" id="aib-import-tabs" role="tablist" aria-label="How is your data shaped?">
    <button type="button" class="aib-seg-btn aib-seg-btn--active" role="tab" aria-selected="true" data-ipath="paste" onclick="aibSetImportPath('paste')">Paste a table</button>
    <button type="button" class="aib-seg-btn" role="tab" aria-selected="false" data-ipath="total" onclick="aibSetImportPath('total')">One total number</button>
  </div>
  <p id="aib-import-desc" class="aib-mode-desc"></p>

  <!-- Path A: paste a per-capability / per-tool table -->
  <div id="aib-import-paste">
    <div class="aib-io-row">
      <label for="aib-paste-unit">These numbers are
        <select id="aib-paste-unit" class="aib-select" onchange="aibReparse()">
          <option value="credits">AI Builder credits</option>
          <option value="volume">Usage volume (pages / images / 1k tokens / 1k chars)</option>
        </select>
      </label>
    </div>
    <textarea id="aib-paste-box" class="aib-paste" spellcheck="false" aria-label="Paste your AI Builder usage rows"
      placeholder="Paste rows here. Copy the AI Builder activity grid (Tool name + Consumption), or two columns from Excel: a label and a number. Example:&#10;Invoice model&#9;42000&#10;Contoso OCR&#9;9000&#10;Support prompt&#9;120000"></textarea>
    <div class="aib-actions">
      <button type="button" class="em-chip" onclick="aibParsePaste()">Parse rows</button>
      <button type="button" class="em-chip" onclick="aibPasteSample()">Load sample</button>
      <span class="aib-status" id="aib-paste-status" role="status" aria-live="polite"></span>
    </div>
    <div id="aib-map"><!-- mapping table injected --></div>
    <div id="aib-map-actions" class="aib-actions em-hidden">
      <button type="button" class="em-chip" onclick="aibApplyMapping()">Apply to estimator &rarr;</button>
      <button type="button" class="em-chip" onclick="aibClearPaste()">Clear</button>
    </div>
  </div>

  <!-- Path B: one aggregate total + an assumed capability mix -->
  <div id="aib-import-total" class="em-hidden">
    <div class="aib-io-row">
      <label for="aib-total-in">Total AI Builder credits / month
        <input type="number" min="0" step="any" inputmode="decimal" class="aib-input" id="aib-total-in"
          placeholder="e.g. 250000" aria-label="Total AI Builder credits per month">
      </label>
    </div>
    <div class="aib-presets">
      <span class="hint">Assume a mix:</span>
      <button type="button" class="em-chip" onclick="aibMixPreset('balanced')">Balanced</button>
      <button type="button" class="em-chip" onclick="aibMixPreset('docs')">Mostly documents</button>
      <button type="button" class="em-chip" onclick="aibMixPreset('prompts')">Mostly prompts</button>
      <button type="button" class="em-chip" onclick="aibMixPreset('text')">Mostly text analytics</button>
    </div>
    <div id="aib-alloc"><!-- allocator rows injected --></div>
    <p class="aib-status aib-alloc-sum" id="aib-alloc-sum"></p>
  </div>
</div>

<div id="aib-results" class="em-hidden"><!-- results injected here --></div>

</div><!-- /#aib-estimator -->

---

## Where do I find my current AI Builder usage? { #find-usage }

You don't need exact numbers to get a useful estimate — but the closer you are, the tighter the result. The **Import my data** tab lets you paste real numbers instead of typing each one.

- **By usage volume (most accurate).** Count what you actually process each month: invoice/receipt
  **pages**, custom document **pages**, OCR **pages**, object-detection **images**, and — for
  prompts and text analysis — **thousands of tokens or characters**. Your process owners usually
  know these volumes.
- **Paste the per-tool activity grid (exact, recommended).** In **[Power Automate](https://make.powerautomate.com)**,
  open **Automation Center → Monitor → AI Builder activity**. That grid lists each model/prompt run
  with a **Tool name** and a **Consumption** value (it also covers Power Apps and Copilot Studio
  usage). Set the timeframe, then copy the **Tool name** + **Consumption** columns and paste them into
  **Import my data → Paste a table**. The tool auto-matches each label to a capability; you confirm
  the mapping and apply.
- **Paste the tenant total (quickest).** In the **[Power Platform admin center](https://admin.powerplatform.microsoft.com/)**,
  go to **Resources → Capacity → Summary**, select **Download reports** in the **Add-ons** section,
  choose **+New → AI Builder → Submit**, then download the **Excel** report. It shows credits consumed
  per environment/date in an **AIConsumption** column — a **single aggregate number, with no
  capability breakdown**. Sum that column and drop it into **Import my data → One total number**, then
  pick the capability mix that matches your workload. Because a flat total can't reveal the split, that
  result is a **modeled estimate** — adjust the mix to see how much it moves.

---

## The rate card this tool uses { #rate-card }

Straight from Microsoft's [AI Builder Capability Rate table](https://learn.microsoft.com/en-us/ai-builder/administer-licensing#ai-builder-capability-rate-table)
(retrieved **2026-08-10**). "Copilot Credit rate" is what the capability costs in Copilot Studio;
"AI Builder credit rate" is what the same unit costs today.

| Capability | Unit | Copilot Credit rate | AI Builder credit rate |
| --- | --- | --: | --: |
| Prompt — basic LLM model | 1k tokens | 0.1 | 1.2 ᵃ |
| Prompt — standard LLM model | 1k tokens | 1.5 | 24 ᵃ |
| Prompt — premium LLM model | 1k tokens | 10 | 182 ᵃ |
| Text recognition (OCR) | 1 page | 0.1 | 3 |
| Simple text analysis (sentiment, language, key phrase) | 1k chars | 0.1 | 2 |
| Advanced text analysis (classification, entity extraction) | 1k chars | 1.5 | 20 |
| Text translation | 1k chars | 1.5 | 22 |
| Custom document processing | 1 page | 8 | 100 |
| Receipt, invoice, identity document analysis | 1 page | 8 | 32 |
| Contract, health insurance card, image description | 1 image | 8 | 32 |
| Object detection | 1 image | 8 | 8 |
| Business card reader, prediction | n/a | free | free |

**Dollar conversions** (from the doc's footnotes): 1 Copilot Credit = **$0.01** pay-as-you-go;
the AI Builder $ reference is the **yearly prepaid Tier 1** add-on (1,000,000 credits for
$500/month = **$0.0005**/credit).

ᵃ For prompts, the single AI Builder credit rate is Microsoft's **estimate** at a 90% input / 10%
output token mix (exact per-1k: 1/3 basic, 20/60 standard, 140/560 premium). The **Copilot Credit
rate is a flat per-1,000-tokens number**, so the Copilot Credits this tool reports are exact.

---

## How to read the result { #read-result }

- **Copilot Credits / month is the number you provision.** It's the currency Copilot Studio meters,
  pooled across your whole tenant. Size to your **busiest month** — capacity is enforced monthly and
  unused credits **don't roll over**.
- **Compare dollars carefully.** The credit *count* usually drops sharply moving from AI Builder to
  Copilot Credits, but the pay-as-you-go **$/credit is higher** ($0.01 vs the $0.0005 prepaid AI
  Builder reference). This tool shows both so you plan honestly — and remember prepaid Copilot Credit
  packs lower the effective Copilot rate.
- **Not a bill.** These are directional planning numbers. Confirm customer-facing figures against the
  [Licensing Guide](https://go.microsoft.com/fwlink/?linkid=2320995) and your own pricing.

Once you have a Copilot Credit budget, size the *agents* that will spend it in the
[Credit Estimator](credit-estimator.md), and build the return story in the [ROI Estimator](roi-estimator.md).

---

## Sources { #sources }

All rate and licensing claims are grounded in official Microsoft documentation, retrieved
**2026-08-10**:

| Claim | Source | Retrieved |
| --- | --- | --- |
| AI Builder Capability Rate table (Copilot Credit + AI Builder credit rate per capability, units, $ footnotes: $0.01/Copilot Credit PAYG, Tier 1 prepaid $500/mo per 1M AI Builder credits); AI Builder features in Copilot Studio always consume Copilot Credits; add-on renewal-only from Nov 1 2025 and seeded credits removed Nov 2026 | [AI Builder — Overview of licensing](https://learn.microsoft.com/en-us/ai-builder/administer-licensing#ai-builder-capability-rate-table) | 2026-08-10 |
| How Copilot Credits are bought, pooled per tenant, and enforced monthly with no carryover | [Licensing and Copilot Credits — Copilot Studio](https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-messages-management) | 2026-08-10 |
| PPAC **AI Builder consumption report** is a downloadable **Excel** (admin-only, rolling 30 days) with columns `Date, UserId, EnvironmentId, EnvironmentName, AIConsumption, IsTrial` — an aggregate credit total, **no per-capability breakdown** | [AI Builder consumption report](https://learn.microsoft.com/ai-builder/administer-consumption-report) | 2026-08-11 |
| Power Automate **AI Builder activity** grid (Automation Center → Monitor) lists per-run `Tool name` + `Consumption`, covering Power Automate, Power Apps, and Copilot Studio | [Monitor AI Builder models and prompts activity](https://learn.microsoft.com/ai-builder/activity-monitoring) | 2026-08-11 |

> **Unofficial and community-built.** This page is not endorsed by or affiliated with Microsoft. It
> summarizes public documentation to help you plan — always confirm customer-facing numbers against
> the Microsoft sources linked above.

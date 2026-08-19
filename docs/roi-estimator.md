---
title: Copilot ROI Estimator
description: An interactive ROI estimator for Microsoft Copilot Studio agents — model value, cost, payback and return in one frame. Still under active development.
hide: [toc]
wide: true
---

# Copilot ROI Estimator

!!! warning "Still being worked on — use with caution"
    This ROI estimator is new and under active development. It is a planning aid, not a
    financial model — treat every number as directional, keep your own assumptions, and
    double-check anything you rely on for a budget decision.

Put **value and cost in the same frame** and get a defensible **ROI, payback period, and 3-year
return** for a Copilot Studio agent. The cost side reuses the same rate engine as the
[**Credit Estimator**](credit-estimator.md) — so if you already have a monthly credit figure,
bring it here. New to how credits are priced? See [**How Copilot Credits work**](copilot-credits.md).
Everything runs in your browser; nothing is uploaded.

> **The honest-ROI rule** (from [Make the ROI case for your agent](walkthroughs/studio-roi-business-case.md)):
> separate the **hard** numbers you can measure from the **soft** ones you're assuming, default
> conservative, and remember **ROI = value × adoption** — a great agent nobody uses has weak ROI.

<style>
.roi-form { margin: 1rem 0; }
.roi-section { border: 1px solid var(--md-default-fg-color--lightest); border-radius: .5rem; padding: .8rem 1rem; margin: .8rem 0; }
.roi-section > h3 { margin: .1rem 0 .2rem; font-size: .95rem; }
.roi-section .roi-hint { color: var(--md-default-fg-color--light); font-size: .8rem; margin: 0 0 .6rem; }
.roi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: .5rem .8rem; }
.roi-field { display: flex; flex-direction: column; font-size: .8rem; }
.roi-field label { color: var(--md-default-fg-color--light); margin-bottom: .15rem; }
.roi-field input, .roi-field select { padding: .35rem .45rem; border: 1px solid var(--md-default-fg-color--lighter); border-radius: .35rem; background: var(--md-default-bg-color); color: var(--md-default-fg-color); font-size: .9rem; }
.roi-time-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: .4rem; align-items: end; margin-bottom: .4rem; }
.roi-row-rm { border: none; background: var(--md-default-fg-color--lightest); border-radius: .35rem; cursor: pointer; padding: .35rem .5rem; color: var(--md-default-fg-color--light); }
.roi-tag { display: inline-block; font-size: .65rem; font-weight: 700; padding: .05rem .35rem; border-radius: .25rem; vertical-align: middle; margin-left: .3rem; }
.roi-tag--hard { background: color-mix(in srgb, #2e7d32 18%, transparent); color: #2e7d32; }
.roi-tag--soft { background: color-mix(in srgb, #e65100 18%, transparent); color: #e65100; }
.roi-tag--assumption { background: var(--md-default-fg-color--lightest); color: var(--md-default-fg-color--light); }
.roi-actions { display: flex; gap: .5rem; flex-wrap: wrap; margin: .4rem 0 0; }
.roi-btn { background: var(--md-primary-fg-color); color: var(--md-primary-bg-color); border: none; border-radius: .4rem; padding: .5rem .9rem; font-weight: 700; cursor: pointer; }
.roi-btn--ghost { background: transparent; color: var(--md-primary-fg-color); border: 1px solid var(--md-primary-fg-color); }
.roi-results { margin-top: 1rem; }
.roi-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: .6rem; margin: .6rem 0; }
.roi-card { border: 1px solid var(--md-default-fg-color--lightest); border-radius: .5rem; padding: .7rem .9rem; text-align: center; }
.roi-card .roi-card-val { font-size: 1.5rem; font-weight: 800; color: var(--md-primary-fg-color); line-height: 1.1; }
.roi-card .roi-card-lbl { font-size: .75rem; color: var(--md-default-fg-color--light); }
.roi-band { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; margin: .6rem 0; }
.roi-band > div { border: 1px solid var(--md-default-fg-color--lightest); border-radius: .5rem; padding: .5rem .7rem; text-align: center; font-size: .85rem; }
.roi-band .roi-band-exp { border-color: var(--md-primary-fg-color); border-width: 2px; }
.roi-table { width: 100%; font-size: .85rem; border-collapse: collapse; margin: .4rem 0; }
.roi-table th, .roi-table td { text-align: left; padding: .3rem .5rem; border-bottom: 1px solid var(--md-default-fg-color--lightest); }
.roi-table td.num, .roi-table th.num { text-align: right; font-variant-numeric: tabular-nums; }
.roi-hidden { display: none; }
.roi-note { font-size: .8rem; color: var(--md-default-fg-color--light); }
.roi-modes { display: inline-flex; gap: .25rem; border: 1px solid var(--md-default-fg-color--lighter); border-radius: .5rem; padding: .2rem; margin: .2rem 0 .3rem; }
.roi-mode { background: transparent; border: none; border-radius: .35rem; padding: .4rem .8rem; font-size: .85rem; font-weight: 700; cursor: pointer; color: var(--md-default-fg-color--light); }
.roi-mode--active { background: var(--md-primary-fg-color); color: var(--md-primary-bg-color); }
.roi-mode-desc { font-size: .82rem; color: var(--md-default-fg-color--light); margin: 0 0 .4rem; }
.roi-q-desc { width: 100%; box-sizing: border-box; padding: .5rem .6rem; border: 1px solid var(--md-default-fg-color--lighter); border-radius: .4rem; background: var(--md-default-bg-color); color: var(--md-default-fg-color); font: inherit; font-size: .9rem; resize: vertical; }
.roi-q-examples { display: flex; flex-wrap: wrap; gap: .35rem; align-items: center; margin-top: .5rem; }
.roi-chip { border: 1px solid var(--md-primary-fg-color); background: transparent; color: var(--md-primary-fg-color); border-radius: 1rem; padding: .2rem .6rem; font-size: .75rem; cursor: pointer; }
.roi-read { border: 1px solid var(--md-default-fg-color--lightest); border-left: 3px solid var(--md-primary-fg-color); border-radius: .4rem; padding: .5rem .8rem; margin: .2rem 0 .6rem; font-size: .85rem; }
.roi-read-list { margin: .3rem 0 0; padding-left: 1.1rem; }
.roi-import { border: 1px solid var(--md-primary-fg-color); background: color-mix(in srgb, var(--md-primary-fg-color) 8%, transparent); border-radius: .5rem; padding: .6rem .8rem; margin: 0 0 .8rem; }
.roi-import-inner { display: flex; align-items: center; gap: .7rem; flex-wrap: wrap; }
.roi-import-icon { font-size: 1.2rem; color: var(--md-primary-fg-color); }
.roi-import-body { display: flex; flex-direction: column; flex: 1 1 220px; min-width: 0; }
.roi-import-label { font-size: .82rem; color: var(--md-default-fg-color--light); overflow: hidden; text-overflow: ellipsis; }
.roi-import-actions { display: flex; gap: .4rem; flex-shrink: 0; }
.roi-provenance { display: inline-block; font-size: .72rem; color: var(--md-primary-fg-color); border: 1px solid var(--md-primary-fg-color); border-radius: 1rem; padding: .1rem .55rem; margin: 0 0 .5rem; }
.roi-pvalue { display: flex; flex-direction: column; gap: .25rem; border: 1px solid var(--md-default-fg-color--lightest); border-radius: .4rem; padding: .55rem .8rem; margin: .4rem 0 .6rem; }
.roi-pvalue label { font-size: .85rem; }
.roi-pvalue input { width: 12rem; max-width: 100%; padding: .35rem .5rem; border: 1px solid var(--md-default-fg-color--lighter); border-radius: .3rem; background: var(--md-default-bg-color); color: var(--md-default-fg-color); }
.roi-pvalue-hint { font-size: .74rem; color: var(--md-default-fg-color--light); }
@media (max-width: 559px) { .roi-time-row { grid-template-columns: 1fr 1fr; } .roi-band { grid-template-columns: 1fr; } }
</style>

<div class="roi-import roi-hidden" id="roi-import"></div>

<div class="roi-modes" role="tablist" aria-label="ROI estimator mode">
  <button type="button" class="roi-mode roi-mode--active" id="roi-mode-quick" role="tab" aria-selected="true" onclick="roiSetMode('quick')">⚡ Quick ROI</button>
  <button type="button" class="roi-mode" id="roi-mode-detailed" role="tab" aria-selected="false" onclick="roiSetMode('detailed')">🛠 Detailed ROI</button>
</div>
<p class="roi-mode-desc" id="roi-mode-desc">Describe the agent in plain English — we read the scenario with the Credit Estimator engine and return an instant ROI band. Best for early-stage ideas.</p>

<div class="roi-form" id="roi-quick">

<div class="roi-section">
  <h3>Describe the agent</h3>
  <p class="roi-hint">One or two sentences: who uses it, what it does, and how often. We infer the monthly volume, build size and Copilot Credits from this — you confirm the value dials below.</p>
  <textarea id="roi-q-desc" class="roi-q-desc" rows="3" placeholder="e.g. A customer support agent that answers product questions from our help centre and drafts ticket replies for about 400 support reps, several times a day."></textarea>
  <div class="roi-q-examples">
    <span class="roi-hint" style="margin:0">Try:</span>
    <button type="button" class="roi-chip" onclick="roiQuickExample(0)">Support triage</button>
    <button type="button" class="roi-chip" onclick="roiQuickExample(1)">Autonomous invoices</button>
    <button type="button" class="roi-chip" onclick="roiQuickExample(2)">HR policy Q&amp;A</button>
  </div>
</div>

<div class="roi-section">
  <h3>Confirm the value dials <span class="roi-tag roi-tag--hard">HARD</span></h3>
  <p class="roi-hint">These are <em>your</em> economics — adjust to your reality. Volume and build size come from the scenario read above.</p>
  <div class="roi-grid">
    <div class="roi-field"><label>Minutes saved / task</label><input type="number" id="roi-q-min" inputmode="numeric" value="8"></div>
    <div class="roi-field"><label>Loaded $ / hour</label><input type="number" id="roi-q-rate" inputmode="numeric" value="45"></div>
    <div class="roi-field"><label>Billing basis</label><select id="roi-q-basis"><option value="payg">Pay-as-you-go ($0.01/cr)</option><option value="prepaid">Prepaid pack ($0.008/cr)</option></select></div>
  </div>
</div>

<div class="roi-actions">
  <button type="button" class="roi-btn" onclick="roiQuickEstimate()">Estimate ROI →</button>
</div>

<div class="roi-results roi-hidden" id="roi-q-results" aria-live="polite"></div>

</div>

<div class="roi-form roi-hidden" id="roi-detailed">

<div class="roi-section">
  <h3>1 · Value — time saved <span class="roi-tag roi-tag--hard">HARD</span></h3>
  <p class="roi-hint">Your most defensible number: minutes saved per task × how often × a fully-loaded hourly rate. Add a row per task the agent helps with.</p>
  <div id="roi-time-rows">
    <div class="roi-time-row">
      <div class="roi-field"><label>What it helps with</label><input type="text" class="roi-t-label" value="Support triage &amp; drafting"></div>
      <div class="roi-field"><label>Min saved each</label><input type="number" class="roi-t-min" inputmode="numeric" value="8"></div>
      <div class="roi-field"><label>Times / month</label><input type="number" class="roi-t-vol" inputmode="numeric" value="1000"></div>
      <div class="roi-field"><label>Loaded $/hour</label><input type="number" class="roi-t-rate" inputmode="numeric" value="45"></div>
      <button type="button" class="roi-row-rm" onclick="roiRemoveTimeRow(this)" title="Remove">✕</button>
    </div>
  </div>
  <div class="roi-actions"><button type="button" class="roi-btn--ghost roi-btn" style="padding:.3rem .6rem;font-size:.8rem" onclick="roiAddTimeRow()">+ Add a task</button></div>
</div>

<div class="roi-section">
  <h3>2 · Value — cost avoidance <span class="roi-tag roi-tag--soft">SOFT</span></h3>
  <p class="roi-hint">Optional, and softer than time saved — include only what you can defend. Leave a field at 0 to skip it. <strong>Don't double-count</strong>: if an hour is already in "time saved," don't also count it as a deflected case or an avoided FTE.</p>
  <div class="roi-grid">
    <div class="roi-field"><label>Cases / month</label><input type="number" id="roi-defl-cases" inputmode="numeric" value="1000"></div>
    <div class="roi-field"><label>Deflected %</label><input type="number" id="roi-defl-pct" inputmode="numeric" value="30"></div>
    <div class="roi-field"><label>$ / case avoided</label><input type="number" id="roi-defl-cost" inputmode="numeric" value="6"></div>
    <div class="roi-field"><label>Headcount avoided (FTE)</label><input type="number" id="roi-fte-count" inputmode="numeric" value="0"></div>
    <div class="roi-field"><label>Loaded $ / FTE / year</label><input type="number" id="roi-fte-annual" inputmode="numeric" value="120000"></div>
  </div>
</div>

<div class="roi-section">
  <h3>3 · Adoption ramp</h3>
  <p class="roi-hint">Value is realized as people actually use the agent. A realistic ramp beats a day-one assumption — and keeps the case credible.</p>
  <div class="roi-grid">
    <div class="roi-field"><label>Ramp length (months)</label><input type="number" id="roi-ramp-months" inputmode="numeric" value="6"></div>
    <div class="roi-field"><label>Start adoption %</label><input type="number" id="roi-ramp-start" inputmode="numeric" value="20"></div>
    <div class="roi-field"><label>Steady-state %</label><input type="number" id="roi-ramp-end" inputmode="numeric" value="80"></div>
  </div>
</div>

<div class="roi-section">
  <h3>4 · Cost — to run &amp; build</h3>
  <p class="roi-hint">Run cost is priced with the same engine as the <a href="credit-estimator.md">Credit Estimator</a>. Get a monthly credit figure there and paste it here.</p>
  <div class="roi-grid">
    <div class="roi-field"><label>Monthly Copilot Credits <span class="roi-tag roi-tag--hard">HARD</span></label><input type="number" id="roi-credits" inputmode="numeric" value="5000"></div>
    <div class="roi-field"><label>Billing basis</label><select id="roi-basis"><option value="payg">Pay-as-you-go ($0.01/cr)</option><option value="prepaid">Prepaid pack ($0.008/cr)</option></select></div>
    <div class="roi-field"><label>Extra Copilot seats</label><input type="number" id="roi-seats" inputmode="numeric" value="0"></div>
    <div class="roi-field"><label>$ / seat / month</label><input type="number" id="roi-seat-cost" inputmode="numeric" value="30"></div>
    <div class="roi-field"><label>Build size</label><select id="roi-size" onchange="roiSizeToDays()"><option value="XS">XS — answering only</option><option value="S">S — one action</option><option value="M" selected>M — 2–4 actions</option><option value="L">L — 5+ actions / autonomous</option><option value="XL">XL — voice / multi-agent</option></select></div>
    <div class="roi-field"><label>Build person-days <span class="roi-tag roi-tag--assumption">EST</span></label><input type="number" id="roi-build-days" inputmode="numeric" value="15"></div>
    <div class="roi-field"><label>$ / person-day</label><input type="number" id="roi-build-rate" inputmode="numeric" value="1200"></div>
    <div class="roi-field"><label>Maintenance hrs / month</label><input type="number" id="roi-maint-hrs" inputmode="numeric" value="8"></div>
    <div class="roi-field"><label>$ / maintenance hour</label><input type="number" id="roi-maint-rate" inputmode="numeric" value="120"></div>
  </div>
</div>

<div class="roi-section">
  <h3>5 · Horizon &amp; confidence</h3>
  <div class="roi-grid">
    <div class="roi-field"><label>Time horizon</label><select id="roi-horizon"><option value="12">1 year (12 mo)</option><option value="36" selected>3 years (36 mo)</option></select></div>
    <div class="roi-field"><label>Conservative value %</label><input type="number" id="roi-cons" inputmode="numeric" value="70"></div>
    <div class="roi-field"><label>Optimistic value %</label><input type="number" id="roi-opt" inputmode="numeric" value="120"></div>
  </div>
</div>

<div class="roi-actions">
  <button type="button" class="roi-btn" onclick="roiCalculate()">Calculate ROI →</button>
  <button type="button" class="roi-btn roi-btn--ghost" onclick="roiLoadExample()">Reset to example</button>
</div>

<div class="roi-results roi-hidden" id="roi-results" aria-live="polite"></div>

</div>

## Where this leads

- **[How Copilot Credits work](copilot-credits.md)** — the pricing model behind the cost side.
- **[Credit Estimator](credit-estimator.md)** — get the monthly credit figure this tool needs.
- **[Make the ROI case for your agent](walkthroughs/studio-roi-business-case.md)** — turn this
  number into a one-slide business case that survives budget review.

---

<p class="roi-note"><strong>Unofficial and community-built.</strong> This estimator is not
endorsed by or affiliated with Microsoft. Value figures are your own economics; the cost side is
calibrated to public Microsoft billing rates. Always validate against your own data before making
a funding decision.</p>

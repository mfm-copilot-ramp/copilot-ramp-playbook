---
title: Copilot Proposal Composer
description: Turn saved Copilot Studio and Cowork estimates into a shareable business case — sizing, cost, ROI and narrative in one exportable proposal. In development.
hide: [toc]
---

# Copilot Proposal Composer

!!! warning "Still being worked on — use with caution"
    The proposal composer is new and under active development. It assembles the estimates you
    already built into a business case — treat every number as directional, keep your own
    assumptions, and double-check anything you rely on for a budget decision.

Assemble the estimates you've saved across the [**Credit Estimator**](credit-estimator.md) (Studio
agents and [Cowork](credit-estimator.md)) into one **shareable business case**: solution sizing,
cost to run, value and ROI, plus a narrative you can hand to a sponsor. Numbers recompute live from
the [**ROI Estimator**](roi-estimator.md) engine, so a proposal never goes stale — and you can
**freeze a dated quote** alongside the live figures. New to how credits are priced? See
[**How Copilot Credits work**](copilot-credits.md). Everything runs in your browser; nothing is uploaded.

> **How to get here:** build estimates in the Credit Estimator, press **Save to My estimates**, then
> open the **My estimates** cart and choose **Compose proposal** — or just press
> *Refresh from My estimates* below.

<style>
.pc-wrap { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1rem; margin: 1rem 0; }
@media (max-width: 899px) { .pc-wrap { grid-template-columns: 1fr; } }
.pc-editor, .pc-side { min-width: 0; }
.pc-hd { display: flex; align-items: center; justify-content: space-between; gap: .5rem; flex-wrap: wrap; }
.pc-hd h2 { margin: .2rem 0; }
.pc-grp { border: 1px solid var(--md-default-fg-color--lightest); border-radius: .5rem; padding: .7rem .9rem; margin: .7rem 0; }
.pc-grp > h3 { margin: .1rem 0 .5rem; font-size: .92rem; }
.pc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: .5rem .8rem; }
.pc-field { display: flex; flex-direction: column; font-size: .8rem; }
.pc-field--wide { grid-column: 1 / -1; }
.pc-field > span { color: var(--md-default-fg-color--light); margin-bottom: .15rem; }
.pc-field input, .pc-field select, .pc-field textarea { padding: .4rem .5rem; border: 1px solid var(--md-default-fg-color--lighter); border-radius: .35rem; background: var(--md-default-bg-color); color: var(--md-default-fg-color); font-size: .9rem; font-family: inherit; }
.pc-field textarea { resize: vertical; }
.pc-hint { color: var(--md-default-fg-color--light); font-size: .78rem; margin: .5rem 0 0; }
.pc-empty { color: var(--md-default-fg-color--light); font-size: .85rem; }
.pc-warn { color: #b26a00; font-weight: 600; }
.pc-pick { display: flex; align-items: center; gap: .5rem; padding: .4rem .1rem; border-bottom: 1px solid var(--md-default-fg-color--lightest); font-size: .85rem; }
.pc-pick:last-child { border-bottom: none; }
.pc-pick-cb { flex: none; }
.pc-pick-badge { flex: none; font-size: .62rem; font-weight: 800; letter-spacing: .02em; padding: .12rem .4rem; border-radius: .25rem; text-transform: uppercase; }
.pc-pick-badge--studio { background: color-mix(in srgb, var(--md-primary-fg-color) 16%, transparent); color: var(--md-primary-fg-color); }
.pc-pick-badge--cowork { background: color-mix(in srgb, #6a1b9a 16%, transparent); color: #8e24aa; }
.pc-pick-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pc-pick-nums { flex: none; color: var(--md-default-fg-color--light); font-size: .75rem; }
.pc-check { display: flex; align-items: center; gap: .5rem; font-size: .85rem; }
.pc-snap { background: color-mix(in srgb, var(--md-primary-fg-color) 5%, transparent); }
.pc-btn { background: var(--md-primary-fg-color); color: var(--md-primary-bg-color); border: none; border-radius: .4rem; padding: .45rem .8rem; font-weight: 700; font-size: .82rem; cursor: pointer; }
.pc-btn--ghost { background: var(--md-default-fg-color--lightest); color: var(--md-default-fg-color); }
.pc-exportbar { display: flex; gap: .4rem; flex-wrap: wrap; align-items: center; margin-bottom: .6rem; }
.pc-status { font-size: .78rem; color: var(--md-default-fg-color--light); margin-left: .2rem; }
.pc-preview { border: 1px solid var(--md-default-fg-color--lightest); border-radius: .5rem; padding: 1rem 1.1rem; background: var(--md-default-bg-color); }
.pc-preview h2, .pc-pv-title { margin: .1rem 0; }
.pc-preview h3 { margin: 1rem 0 .3rem; font-size: .9rem; border-bottom: 1px solid var(--md-default-fg-color--lightest); padding-bottom: .2rem; }
.pc-pv-meta { color: var(--md-default-fg-color--light); font-size: .82rem; }
.pc-cards { display: flex; gap: .5rem; flex-wrap: wrap; margin: .5rem 0; }
.pc-card { border: 1px solid var(--md-default-fg-color--lightest); border-radius: .5rem; padding: .5rem .7rem; min-width: 96px; }
.pc-card-v { font-size: 1.2rem; font-weight: 800; }
.pc-card-l { font-size: .7rem; color: var(--md-default-fg-color--light); }
.pc-tbl { border-collapse: collapse; width: 100%; margin: .4rem 0; font-size: .82rem; }
.pc-tbl th, .pc-tbl td { border: 1px solid var(--md-default-fg-color--lightest); padding: .3rem .45rem; text-align: left; }
.pc-tbl th.r, .pc-tbl td.r { text-align: right; }
.pc-tbl-total td { background: color-mix(in srgb, var(--md-primary-fg-color) 7%, transparent); }
.pc-pv-band { font-size: .8rem; color: var(--md-default-fg-color--light); }
.pc-pv-note { font-size: .78rem; color: #6a1b9a; margin: .3rem 0 0; }
.pc-pv-foot { color: var(--md-default-fg-color--light); font-size: .74rem; margin-top: 1.2rem; }
.pc-saved { margin-top: 1rem; }
.pc-saved h3 { font-size: .88rem; margin: .2rem 0 .4rem; }
.pc-saved-list { list-style: none; padding: 0; margin: 0; }
.pc-saved-row { display: flex; align-items: center; gap: .5rem; padding: .3rem 0; border-bottom: 1px solid var(--md-default-fg-color--lightest); font-size: .82rem; }
.pc-saved-open { flex: 1 1 auto; text-align: left; background: none; border: none; color: var(--md-primary-fg-color); cursor: pointer; font-size: .82rem; padding: 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pc-saved-date { flex: none; color: var(--md-default-fg-color--light); font-size: .72rem; }
.pc-saved-rm { flex: none; background: none; border: none; color: var(--md-default-fg-color--light); cursor: pointer; font-size: .72rem; }
.pc-share-box { grid-column: 1 / -1; width: 100%; font-size: .72rem; word-break: break-all; color: var(--md-default-fg-color--light); background: var(--md-default-fg-color--lightest); border-radius: .35rem; padding: .35rem .5rem; margin-top: .4rem; }
</style>

<div id="proposal-composer" markdown="0">
  <p><em>The proposal composer needs JavaScript. If you're seeing this, your browser hasn't loaded
  it yet — build and save some estimates in the
  <a href="../credit-estimator/">Credit Estimator</a> first, then return here.</em></p>
</div>

## Where this leads

- **[Credit Estimator](credit-estimator.md)** — size a Studio agent or a Cowork rollout, then *Save to My estimates*.
- **[ROI Estimator](roi-estimator.md)** — the value/cost/payback engine behind the numbers here.
- **[How Copilot Credits work](copilot-credits.md)** — the pricing model behind the cost side.
- **[Make the ROI case for your agent](walkthroughs/studio-roi-business-case.md)** — the narrative
  playbook this composer helps you fill in.

---

<p class="pc-pv-foot"><strong>Unofficial and community-built.</strong> This composer is not endorsed
by or affiliated with Microsoft. Cost figures are calibrated to public Microsoft billing rates; value
figures are your own economics. Always validate against your own data before making a funding decision.</p>

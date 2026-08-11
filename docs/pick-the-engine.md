---
title: Pick the Studio harness
description: Every Copilot Studio agent runs on a harness — the engine that shapes how it reasons, publishes, and bills. Compare the options and pick the right one.
---

# Pick the engine for the job

When you build an agent in **Copilot Studio**, one choice shapes everything else: which **harness** powers it.
A harness is the *engine* underneath your agent — it decides how the agent reasons, what it can touch, where you
can publish it, and how it bills. Same builder, different engines, and the right one depends on the job.

!!! warning "Unofficial — confirm before you commit"
    This is community guidance, not a Microsoft prescription. Harness capabilities, packaging, and billing evolve
    quickly. Use this to *start* the conversation, then confirm against
    [Licensing & Prerequisites](prerequisites.md) and Microsoft's
    [Copilot Studio documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/).

<div class="eng-head" markdown="0">
  <span class="eng-eyebrow">Pick the engine for the job</span>
  <p class="eng-lede">Every harness reasons, publishes, and bills differently. Click any card to see how it works and where it shines — or jump to the <a href="#side-by-side">side-by-side</a>.</p>
</div>

<div class="eng-grid" markdown="0">

  <div class="eng-card eng-card--accent" role="button" tabindex="0" aria-expanded="false">
    <span class="eng-flag">Most autonomous</span>
    <span class="eng-ico" aria-hidden="true">🤖</span>
    <span class="eng-kicker">Autonomous reasoning</span>
    <h3 class="eng-name">GitHub Copilot harness</h3>
    <p class="eng-desc">Reasons through a goal on its own, step by step — retrying and finding alternative paths when things break.</p>
    <button type="button" class="eng-toggle">
      <span class="eng-caret" aria-hidden="true">▸</span><span class="eng-toggle-text">How it works</span>
    </button>
    <div class="eng-detail" aria-hidden="true">
      <div class="eng-detail-inner">
        <dl>
          <dt>Best for</dt><dd>Complex, multi-step business processes.</dd>
          <dt>How it works</dt><dd>Reasons through a goal on its own, step by step.</dd>
          <dt>Recovers</dt><dd>Retries and finds alternative paths automatically.</dd>
          <dt>Files</dt><dd>Creates, edits, and reasons over Word, Excel, PowerPoint, and PDF files.</dd>
          <dt>Skills &amp; memory</dt><dd>Yes.</dd>
          <dt>Publishing</dt><dd>Internal teams or external customers.</dd>
          <dt>Billing</dt><dd>Copilot Credits.</dd>
        </dl>
      </div>
    </div>
  </div>

  <div class="eng-card" role="button" tabindex="0" aria-expanded="false">
    <span class="eng-ico" aria-hidden="true">🧭</span>
    <span class="eng-kicker">Rules you define</span>
    <h3 class="eng-name">Standard harness</h3>
    <p class="eng-desc">Follows the topics and rules you author — predictable, structured conversations that go exactly where you built them.</p>
    <button type="button" class="eng-toggle">
      <span class="eng-caret" aria-hidden="true">▸</span><span class="eng-toggle-text">How it works</span>
    </button>
    <div class="eng-detail" aria-hidden="true">
      <div class="eng-detail-inner">
        <dl>
          <dt>Best for</dt><dd>Rule-based agents and structured conversations.</dd>
          <dt>How it works</dt><dd>Follows the topics and rules you define.</dd>
          <dt>Recovers</dt><dd>Follows the paths you've built.</dd>
          <dt>Files</dt><dd class="eng-na">Not a focus.</dd>
          <dt>Skills &amp; memory</dt><dd class="eng-na">Not a focus.</dd>
          <dt>Publishing</dt><dd>Internal teams or external customers.</dd>
          <dt>Billing</dt><dd>See Copilot Studio licensing.</dd>
        </dl>
      </div>
    </div>
  </div>

  <div class="eng-card" role="button" tabindex="0" aria-expanded="false">
    <span class="eng-ico" aria-hidden="true">💬</span>
    <span class="eng-kicker">Extend M365 Copilot</span>
    <h3 class="eng-name">Copilot chat harness</h3>
    <p class="eng-desc">Connects your enterprise knowledge to Microsoft 365 Copilot Chat — grounding answers in your own content.</p>
    <button type="button" class="eng-toggle">
      <span class="eng-caret" aria-hidden="true">▸</span><span class="eng-toggle-text">How it works</span>
    </button>
    <div class="eng-detail" aria-hidden="true">
      <div class="eng-detail-inner">
        <dl>
          <dt>Best for</dt><dd>Extending M365 Copilot Chat with enterprise knowledge.</dd>
          <dt>How it works</dt><dd>Connects enterprise knowledge to M365 Copilot Chat.</dd>
          <dt>Recovers</dt><dd class="eng-na">Not a focus.</dd>
          <dt>Files</dt><dd class="eng-na">Not a focus.</dd>
          <dt>Skills &amp; memory</dt><dd class="eng-na">Not a focus.</dd>
          <dt>Publishing</dt><dd>Internal teams.</dd>
          <dt>Billing</dt><dd>Consumption, or included in Microsoft 365 Copilot USLs.</dd>
        </dl>
      </div>
    </div>
  </div>

</div>

## Side by side

The same considerations, compared across all three harnesses. Find the row that matters most to your job.

<div class="eng-compare" markdown="0">
<table class="eng-compare-table">
  <thead>
    <tr>
      <th class="eng-col-consider" scope="col">Considerations</th>
      <th class="eng-col-accent" scope="col">GitHub Copilot harness</th>
      <th scope="col">Standard harness</th>
      <th scope="col">Copilot chat harness</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Best for</th>
      <td>Complex, multi-step business processes</td>
      <td>Rule-based agents and structured conversations</td>
      <td>Extending M365 Copilot Chat with enterprise knowledge</td>
    </tr>
    <tr>
      <th scope="row">How it works</th>
      <td>Reasons through a goal on its own, step by step</td>
      <td>Follows the topics and rules you define</td>
      <td>Connects enterprise knowledge to M365 Copilot Chat</td>
    </tr>
    <tr>
      <th scope="row">Recovers from problems</th>
      <td>Retries and finds alternative paths automatically</td>
      <td>Follows the paths you've built</td>
      <td class="eng-na">Not a focus</td>
    </tr>
    <tr>
      <th scope="row">Works with files</th>
      <td>Creates, edits, and reasons over Word, Excel, PowerPoint, and PDF files</td>
      <td class="eng-na">Not a focus</td>
      <td class="eng-na">Not a focus</td>
    </tr>
    <tr>
      <th scope="row">Skills and memory</th>
      <td>Yes</td>
      <td class="eng-na">Not a focus</td>
      <td class="eng-na">Not a focus</td>
    </tr>
    <tr>
      <th scope="row">Publishing</th>
      <td>Internal teams or external customers</td>
      <td>Internal teams or external customers</td>
      <td>Internal teams</td>
    </tr>
    <tr>
      <th scope="row">Billing</th>
      <td>Copilot Credits</td>
      <td>See Copilot Studio licensing</td>
      <td>Consumption, or included in M365 Copilot USLs</td>
    </tr>
  </tbody>
</table>
</div>

## Two things to take away

1. **The harness is a capability choice, not just a setting.** Autonomy, file-handling, and where you can publish
   are all downstream of which engine you pick — so choose for the *job*, not the default.
2. **They bill differently.** Copilot Credits, Copilot Studio licensing, and M365 Copilot USLs are not the same
   meter. Sort out billing before you scale, not after — see [Licensing & Prerequisites](prerequisites.md)
   and the [Credit Estimator](credit-estimator.md).

> **📚 Learn more.**
>
> - [Microsoft Copilot Studio documentation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) — the official product hub.
> - [Extend Microsoft 365 Copilot — options compared](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/) — declarative vs. custom-engine agents.
> - [Stage 6 · Copilot Studio](stages/stage-6-studio.md) — where you build, test, publish, and govern these agents.

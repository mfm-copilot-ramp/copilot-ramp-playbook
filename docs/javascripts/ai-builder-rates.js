/* AI Builder → Copilot Credits mapper — VERIFIED rate table (single source of truth).
 *
 * Every number below is transcribed VERBATIM from Microsoft's official
 * "AI Builder Capability Rate table" on the licensing overview page:
 *   https://learn.microsoft.com/en-us/ai-builder/administer-licensing#ai-builder-capability-rate-table
 * Retrieved 2026-08-10.
 *
 * DOCTRINE (matches estimator-vocab.js): do NOT add or alter a rate that isn't
 * present in that table. The estimator UI and the node test both read from here,
 * so the math can never drift from the doc. Dependency-free; loads in the browser
 * (window.AIBuilderRates) and in Node (module.exports).
 *
 * Columns from the doc, per capability:
 *   cc   = Copilot Credit rate (per unit)      → what the workload costs in Copilot Studio
 *   aib  = AI Builder credit rate (per unit)    → what the SAME workload costs today in AI Builder credits
 *   unit = the billing unit ("1 page", "1k tokens", "1 image", "1k chars")
 *
 * $ conversions (from the doc's footnotes):
 *   * Copilot Studio $ = cc × $0.01  (pay-as-you-go: 1 Copilot Credit = $0.01)
 *   ** AI Builder   $ = aib × $0.0005 (yearly prepaid Tier 1 add-on: 1,000,000 credits for $500/mo)
 */
(function (root) {
  "use strict";

  // Dollar-per-credit constants, straight from the rate-table footnotes.
  var USD_PER_COPILOT_CREDIT = 0.01;    // * pay-as-you-go
  var USD_PER_AIB_CREDIT = 0.0005;      // ** yearly prepaid Tier 1 add-on ($500/mo ÷ 1,000,000)

  // The capability rate table. `cc` and `aib` are per one `unit`.
  // `promptSplit` is present only on the three prompt rows, where the single AI
  // Builder credit rate the doc shows is an ESTIMATE built from a 90% input /
  // 10% output token mix (exact per-1k rates: in/out). The Copilot Credit rate
  // for prompts is a FLAT per-1k-tokens number, so Copilot Credits are exact
  // regardless of the input/output split.
  var CAPABILITIES = [
    {
      id: "prompt_basic",
      label: "Prompt — basic LLM model",
      group: "Text & generative AI",
      unit: "1k tokens",
      unitKey: "ktokens",
      cc: 0.1,
      aib: 1.2,
      promptSplit: { inPer1k: 1, outPer1k: 3 },
      studioFeature: "Text and generative AI tools (basic)",
      note: "AI Builder credit rate is estimated at a 90/10 input/output token mix (exact: 1 in / 3 out per 1k). Copilot Credit rate is flat per 1k tokens."
    },
    {
      id: "prompt_standard",
      label: "Prompt — standard LLM model",
      group: "Text & generative AI",
      unit: "1k tokens",
      unitKey: "ktokens",
      cc: 1.5,
      aib: 24,
      promptSplit: { inPer1k: 20, outPer1k: 60 },
      studioFeature: "Text and generative AI tools (standard)",
      note: "AI Builder credit rate is estimated at a 90/10 input/output token mix (exact: 20 in / 60 out per 1k). Copilot Credit rate is flat per 1k tokens."
    },
    {
      id: "prompt_premium",
      label: "Prompt — premium LLM model",
      group: "Text & generative AI",
      unit: "1k tokens",
      unitKey: "ktokens",
      cc: 10,
      aib: 182,
      promptSplit: { inPer1k: 140, outPer1k: 560 },
      studioFeature: "Text and generative AI tools (premium)",
      note: "AI Builder credit rate is estimated at a 90/10 input/output token mix (exact: 140 in / 560 out per 1k). Copilot Credit rate is flat per 1k tokens."
    },
    {
      id: "ocr",
      label: "Text recognition (OCR)",
      group: "Text & generative AI",
      unit: "1 page",
      unitKey: "page",
      cc: 0.1,
      aib: 3,
      studioFeature: "Text and generative AI tools (basic)"
    },
    {
      id: "text_simple",
      label: "Simple text analysis — sentiment, language detection, key phrase",
      group: "Text & generative AI",
      unit: "1k chars",
      unitKey: "kchars",
      cc: 0.1,
      aib: 2,
      studioFeature: "Text and generative AI tools (basic)"
    },
    {
      id: "text_advanced",
      label: "Advanced text analysis — category classification, entity extraction",
      group: "Text & generative AI",
      unit: "1k chars",
      unitKey: "kchars",
      cc: 1.5,
      aib: 20,
      studioFeature: "Text and generative AI tools (standard)"
    },
    {
      id: "translation",
      label: "Text translation",
      group: "Text & generative AI",
      unit: "1k chars",
      unitKey: "kchars",
      cc: 1.5,
      aib: 22,
      studioFeature: "Text and generative AI tools (standard)"
    },
    {
      id: "custom_doc",
      label: "Custom document processing",
      group: "Content processing",
      unit: "1 page",
      unitKey: "page",
      cc: 8,
      aib: 100,
      studioFeature: "Content processing tools"
    },
    {
      id: "prebuilt_doc",
      label: "Receipt, invoice, identity document analysis",
      group: "Content processing",
      unit: "1 page",
      unitKey: "page",
      cc: 8,
      aib: 32,
      studioFeature: "Content processing tools"
    },
    {
      id: "contract_health_imgdesc",
      label: "Contract, health insurance card, image description",
      group: "Content processing",
      unit: "1 image",
      unitKey: "image",
      cc: 8,
      aib: 32,
      studioFeature: "Content processing tools",
      note: "Image description is free while in preview."
    },
    {
      id: "object_detection",
      label: "Object detection",
      group: "Content processing",
      unit: "1 image",
      unitKey: "image",
      cc: 8,
      aib: 8,
      studioFeature: "Content processing tools",
      note: "The only capability where the Copilot Credit count equals the AI Builder credit count (8 = 8)."
    }
  ];

  // Free capabilities (listed for completeness; excluded from the estimator inputs).
  var FREE_CAPABILITIES = [
    { id: "business_card", label: "Business card reader", unit: "n/a" },
    { id: "prediction", label: "Prediction", unit: "n/a" }
  ];

  // Human-readable unit hints for the UI (what one input unit means).
  var UNIT_HELP = {
    page: "pages / month",
    image: "images / month",
    ktokens: "thousands of tokens / month",
    kchars: "thousands of characters / month"
  };

  /* ── Core conversion helpers ──────────────────────────────────────────────
   * Given a capability id and a monthly volume (in the capability's `unit`),
   * return the credit + dollar figures both ways. This is the exact doc math.
   */
  function byUnitKey() {
    var m = {};
    for (var i = 0; i < CAPABILITIES.length; i++) m[CAPABILITIES[i].id] = CAPABILITIES[i];
    return m;
  }
  var BY_ID = byUnitKey();

  function getCapability(id) { return BY_ID[id] || null; }

  // From a monthly volume (in units) → all figures for one capability.
  function fromVolume(id, volume) {
    var c = getCapability(id);
    if (!c || !(volume > 0)) return zero(c);
    var copilotCredits = volume * c.cc;
    var aibCredits = volume * c.aib;
    return {
      id: id,
      volume: volume,
      unit: c.unit,
      copilotCredits: copilotCredits,
      copilotUSD: copilotCredits * USD_PER_COPILOT_CREDIT,
      aibCredits: aibCredits,
      aibUSD: aibCredits * USD_PER_AIB_CREDIT,
      // Ratio of Copilot Credits to AI Builder credits for this capability (count basis).
      creditRatio: c.aib > 0 ? c.cc / c.aib : null
    };
  }

  // From current monthly AI Builder credits for a capability → back out the
  // volume, then forward to Copilot Credits. Used by the "By AI Builder credits"
  // mode when the customer only has the aggregate consumption report number.
  function fromAibCredits(id, aibCredits) {
    var c = getCapability(id);
    if (!c || !(aibCredits > 0) || !(c.aib > 0)) return zero(c);
    var volume = aibCredits / c.aib;
    return fromVolume(id, volume);
  }

  function zero(c) {
    return {
      id: c ? c.id : null,
      volume: 0,
      unit: c ? c.unit : null,
      copilotCredits: 0,
      copilotUSD: 0,
      aibCredits: 0,
      aibUSD: 0,
      creditRatio: c && c.aib > 0 ? c.cc / c.aib : null
    };
  }

  /* ── Import auto-mapping ───────────────────────────────────────────────────
   * When a customer PASTES real rows (from the PPAC export or the Power Automate
   * "AI Builder activity" grid), each row's label is a free-text model/prompt/
   * capability name we must map to one of the 11 billable capabilities. These
   * synonym lists power best-effort auto-mapping; the UI always lets the user
   * override. This is UI-matching data, NOT rate data — it never affects math.
   *
   * Keyword order does not matter; matchCapability picks the LONGEST matched
   * keyword (most specific wins), so "premium prompt" beats generic "prompt".
   */
  var SYNONYMS = {
    prompt_premium:            ["premium prompt", "prompt premium", "premium llm", "gpt-4", "gpt 4", "gpt-4o", "o1", "reasoning model"],
    prompt_standard:           ["standard prompt", "prompt standard", "standard llm", "gpt-35", "gpt-3.5", "gpt 3.5"],
    prompt_basic:             ["basic prompt", "prompt basic", "basic llm"],
    // generic prompt / genai text creation → default to the standard tier
    prompt_generic:           ["create text", "generate text", "text generation", "genai", "gen ai", "generative", "prompt", "gpt"],
    ocr:                       ["text recognition", "recognize text", "read text", "ocr", "optical character"],
    text_simple:               ["sentiment", "language detection", "detect language", "key phrase", "keyphrase", "simple text"],
    text_advanced:             ["category classification", "classification", "classify", "entity extraction", "entity recognition", "named entity", "extract entities", "advanced text", "pii"],
    translation:               ["translation", "translate"],
    custom_doc:                ["custom document", "document processing", "form processing", "custom model", "custom form", "custom extraction", "invoice processing custom"],
    prebuilt_doc:              ["receipt", "invoice", "identity document", "id document", "identity doc", "prebuilt", "pre-built", "id reader"],
    contract_health_imgdesc:   ["contract", "health insurance card", "health insurance", "insurance card", "image description", "describe image", "image caption"],
    object_detection:          ["object detection", "object detect", "detect object", "count object", "object counting"]
  };
  // Generic "prompt"-family labels with no tier word resolve to this capability.
  var PROMPT_GENERIC_DEFAULT = "prompt_standard";

  function normalizeLabel(s) {
    return String(s == null ? "" : s).toLowerCase().replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim();
  }

  // Best-effort map of a free-text label → capability id (or null if no match).
  // Returns { id, keyword, score } where score is the matched keyword length.
  function matchCapabilityDetailed(label) {
    var t = normalizeLabel(label);
    if (!t) return null;
    var best = null;
    Object.keys(SYNONYMS).forEach(function (key) {
      SYNONYMS[key].forEach(function (kw) {
        if (t.indexOf(kw) === -1) return;
        var score = kw.length;
        if (!best || score > best.score) {
          best = { key: key, keyword: kw, score: score };
        }
      });
    });
    if (!best) return null;
    var id = best.key === "prompt_generic" ? PROMPT_GENERIC_DEFAULT : best.key;
    if (!getCapability(id)) return null;
    return { id: id, keyword: best.keyword, score: best.score };
  }

  function matchCapability(label) {
    var m = matchCapabilityDetailed(label);
    return m ? m.id : null;
  }

  /* ── Path B: split ONE total AI Builder credits number across capabilities ──
   * The PPAC "AI Builder consumption" Excel gives only an aggregate credit total
   * (column AIConsumption) with no capability breakdown. To convert it we must
   * assume a mix. `allocation` is a map of capability id → percent (0..100);
   * percentages are normalized so they don't have to sum to exactly 100. Each
   * slice of AI Builder credits is converted with fromAibCredits and summed.
   */
  function fromTotalAibCredits(totalAibCredits, allocation) {
    var rows = [];
    var out = {
      rows: rows,
      totalCopilotCredits: 0,
      totalCopilotUSD: 0,
      totalAibCredits: 0,
      totalAibUSD: 0
    };
    if (!(totalAibCredits > 0) || !allocation) return out;
    var sumPct = 0;
    Object.keys(allocation).forEach(function (id) {
      var p = parseFloat(allocation[id]);
      if (isFinite(p) && p > 0 && getCapability(id)) sumPct += p;
    });
    if (!(sumPct > 0)) return out;
    Object.keys(allocation).forEach(function (id) {
      var p = parseFloat(allocation[id]);
      if (!(isFinite(p) && p > 0) || !getCapability(id)) return;
      var slice = totalAibCredits * (p / sumPct);
      var r = fromAibCredits(id, slice);
      r.allocPct = p / sumPct * 100;
      rows.push(r);
      out.totalCopilotCredits += r.copilotCredits;
      out.totalCopilotUSD += r.copilotUSD;
      out.totalAibCredits += r.aibCredits;
      out.totalAibUSD += r.aibUSD;
    });
    return out;
  }

  var API = {
    RETRIEVED: "2026-08-10",
    SOURCE_URL: "https://learn.microsoft.com/en-us/ai-builder/administer-licensing#ai-builder-capability-rate-table",
    USD_PER_COPILOT_CREDIT: USD_PER_COPILOT_CREDIT,
    USD_PER_AIB_CREDIT: USD_PER_AIB_CREDIT,
    CAPABILITIES: CAPABILITIES,
    FREE_CAPABILITIES: FREE_CAPABILITIES,
    UNIT_HELP: UNIT_HELP,
    getCapability: getCapability,
    fromVolume: fromVolume,
    fromAibCredits: fromAibCredits,
    matchCapability: matchCapability,
    matchCapabilityDetailed: matchCapabilityDetailed,
    normalizeLabel: normalizeLabel,
    fromTotalAibCredits: fromTotalAibCredits,
    SYNONYMS: SYNONYMS
  };

  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.AIBuilderRates = API;
})(typeof globalThis !== "undefined" ? globalThis : this);

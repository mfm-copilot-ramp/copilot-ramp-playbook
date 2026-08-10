/* Smoke test for ai-builder-rates.js — run: node ai-builder-estimator.test.js
 *
 * Verifies the conversion math against Microsoft's official AI Builder Capability
 * Rate table and its $ footnotes. If any rate here diverges from the doc, or the
 * conversion helpers drift, this fails loudly.
 */
var R = require("./ai-builder-rates.js");

var failures = 0;
function ok(name, cond) {
  if (cond) { console.log("  PASS  " + name); }
  else { console.log("  FAIL  " + name); failures++; }
}
function near(a, b, eps) { return Math.abs(a - b) <= (eps == null ? 1e-9 : eps); }

console.log("AI Builder → Copilot Credits — rate + conversion tests\n");

// ── Constants match the doc footnotes ──────────────────────────────────────
ok("Copilot Credit = $0.01 (PAYG)", R.USD_PER_COPILOT_CREDIT === 0.01);
ok("AI Builder credit = $0.0005 (Tier 1 prepaid: $500/mo ÷ 1,000,000)", R.USD_PER_AIB_CREDIT === 0.0005);
ok("Tier 1 math: 1,000,000 × $0.0005 = $500/mo", near(1000000 * R.USD_PER_AIB_CREDIT, 500));

// ── Every rate transcribed verbatim from the table ─────────────────────────
var EXPECTED = {
  prompt_basic:              { unit: "1k tokens", cc: 0.1, aib: 1.2 },
  prompt_standard:           { unit: "1k tokens", cc: 1.5, aib: 24 },
  prompt_premium:            { unit: "1k tokens", cc: 10,  aib: 182 },
  ocr:                       { unit: "1 page",    cc: 0.1, aib: 3 },
  text_simple:               { unit: "1k chars",  cc: 0.1, aib: 2 },
  text_advanced:             { unit: "1k chars",  cc: 1.5, aib: 20 },
  translation:               { unit: "1k chars",  cc: 1.5, aib: 22 },
  custom_doc:                { unit: "1 page",    cc: 8,   aib: 100 },
  prebuilt_doc:              { unit: "1 page",    cc: 8,   aib: 32 },
  contract_health_imgdesc:   { unit: "1 image",   cc: 8,   aib: 32 },
  object_detection:          { unit: "1 image",   cc: 8,   aib: 8 }
};
Object.keys(EXPECTED).forEach(function (id) {
  var c = R.getCapability(id);
  var e = EXPECTED[id];
  ok("rate[" + id + "] cc=" + e.cc + " aib=" + e.aib + " unit=" + e.unit,
     c && c.cc === e.cc && c.aib === e.aib && c.unit === e.unit);
});
ok("exactly 11 billable capabilities", R.CAPABILITIES.length === 11);

// ── Doc's own worked $ column checks (Copilot Studio $ = cc × 0.01) ─────────
// From the table: custom doc 8 → $0.08; OCR 0.1 → $0.001; premium prompt 10 → $0.10
ok("custom doc: 1 page = 8 Copilot Credits = $0.08", (function () {
  var r = R.fromVolume("custom_doc", 1); return r.copilotCredits === 8 && near(r.copilotUSD, 0.08);
})());
ok("OCR: 1 page = 0.1 Copilot Credits = $0.001", (function () {
  var r = R.fromVolume("ocr", 1); return near(r.copilotCredits, 0.1) && near(r.copilotUSD, 0.001);
})());
ok("premium prompt: 1k tokens = 10 Copilot Credits = $0.10", (function () {
  var r = R.fromVolume("prompt_premium", 1); return r.copilotCredits === 10 && near(r.copilotUSD, 0.1);
})());

// ── Doc's AI Builder $ column checks (AIB $ = aib × 0.0005) ─────────────────
// custom doc 100 → $0.05; receipt 32 → $0.016; OCR 3 → $0.0015
ok("custom doc: 1 page = 100 AIB credits = $0.05", (function () {
  var r = R.fromVolume("custom_doc", 1); return r.aibCredits === 100 && near(r.aibUSD, 0.05);
})());
ok("receipt/invoice: 1 page = 32 AIB credits = $0.016", (function () {
  var r = R.fromVolume("prebuilt_doc", 1); return r.aibCredits === 32 && near(r.aibUSD, 0.016);
})());
ok("OCR: 1 page = 3 AIB credits = $0.0015", (function () {
  var r = R.fromVolume("ocr", 1); return r.aibCredits === 3 && near(r.aibUSD, 0.0015);
})());

// ── Volume scaling ─────────────────────────────────────────────────────────
ok("5,000 invoice pages = 40,000 Copilot Credits = $400/mo", (function () {
  var r = R.fromVolume("prebuilt_doc", 5000);
  return r.copilotCredits === 40000 && near(r.copilotUSD, 400) && r.aibCredits === 160000;
})());

// ── Reverse conversion: from current AI Builder credits → Copilot Credits ───
// custom doc: 100 AIB credits = 1 page → 8 Copilot Credits (ratio cc/aib = 0.08)
ok("reverse: 100 AIB credits of custom doc → 8 Copilot Credits", (function () {
  var r = R.fromAibCredits("custom_doc", 100);
  return near(r.volume, 1) && r.copilotCredits === 8;
})());
ok("reverse: 10,000 AIB credits of custom doc → 800 Copilot Credits", (function () {
  var r = R.fromAibCredits("custom_doc", 10000);
  return near(r.copilotCredits, 800);
})());
// object detection is the 1:1 count case (8 = 8) → ratio 1.0
ok("object detection credit ratio = 1.0 (8 = 8)", (function () {
  var r = R.fromVolume("object_detection", 1);
  return r.copilotCredits === 8 && r.aibCredits === 8 && near(r.creditRatio, 1);
})());
// reverse is the exact inverse of forward for a non-prompt capability
ok("reverse ∘ forward is identity (receipt)", (function () {
  var fwd = R.fromVolume("prebuilt_doc", 250);
  var back = R.fromAibCredits("prebuilt_doc", fwd.aibCredits);
  return near(back.volume, 250) && near(back.copilotCredits, fwd.copilotCredits);
})());

// ── Guards ─────────────────────────────────────────────────────────────────
ok("zero volume → zero credits", R.fromVolume("custom_doc", 0).copilotCredits === 0);
ok("unknown capability → zeros, no throw", (function () {
  try { var r = R.fromVolume("nope", 100); return r.copilotCredits === 0; } catch (e) { return false; }
})());

// ── Import auto-matcher (matchCapability) ──────────────────────────────────
ok("match: 'Contoso invoice model' → prebuilt_doc", R.matchCapability("Contoso invoice model") === "prebuilt_doc");
ok("match: 'Vendor receipt reader' → prebuilt_doc", R.matchCapability("Vendor receipt reader") === "prebuilt_doc");
ok("match: 'Support OCR' → ocr", R.matchCapability("Support OCR") === "ocr");
ok("match: 'Text recognition batch' → ocr", R.matchCapability("Text recognition batch") === "ocr");
ok("match: 'Ticket sentiment' → text_simple", R.matchCapability("Ticket sentiment") === "text_simple");
ok("match: 'Entity extraction flow' → text_advanced", R.matchCapability("Entity extraction flow") === "text_advanced");
ok("match: 'FR→EN translation' → translation", R.matchCapability("FR\u2192EN translation") === "translation");
ok("match: 'Custom document processing' → custom_doc", R.matchCapability("Custom document processing") === "custom_doc");
ok("match: 'Contract clause extraction' → contract_health_imgdesc", R.matchCapability("Contract clause extraction") === "contract_health_imgdesc");
ok("match: 'Object detection v2' → object_detection", R.matchCapability("Object detection v2") === "object_detection");
// tier-specificity: 'premium'/'standard'/'basic' beat generic 'prompt'
ok("match: 'Premium prompt' → prompt_premium (specific beats generic)", R.matchCapability("Premium prompt") === "prompt_premium");
ok("match: 'standard prompt' → prompt_standard", R.matchCapability("standard prompt") === "prompt_standard");
ok("match: generic 'Support prompt' → prompt_standard (default tier)", R.matchCapability("Support prompt") === "prompt_standard");
ok("match: no keyword → null", R.matchCapability("Weekly KPI rollup") === null);
ok("match: empty → null", R.matchCapability("") === null);

// ── Path B: split one total across a capability mix (fromTotalAibCredits) ───
ok("total split honors ratios: 100k credits, 50% custom_doc / 50% object_detection", (function () {
  // custom_doc: 100 AIB → 8 CC (ratio .08); object_detection: 8 AIB → 8 CC (ratio 1)
  var r = R.fromTotalAibCredits(100000, { custom_doc: 50, object_detection: 50 });
  // 50k custom_doc → 50000*8/100 = 4000 CC ; 50k object → 50000*8/8 = 50000 CC
  return near(r.totalCopilotCredits, 54000) && near(r.totalAibCredits, 100000, 1e-6);
})());
ok("total split normalizes non-100 percentages", (function () {
  // 20/20 (=40 total) should behave identically to 50/50
  var a = R.fromTotalAibCredits(100000, { custom_doc: 20, object_detection: 20 });
  var b = R.fromTotalAibCredits(100000, { custom_doc: 50, object_detection: 50 });
  return near(a.totalCopilotCredits, b.totalCopilotCredits);
})());
ok("total split: preserves total AIB credits across slices", (function () {
  var r = R.fromTotalAibCredits(250000, { prebuilt_doc: 25, custom_doc: 20, ocr: 15, text_simple: 15, text_advanced: 10, prompt_standard: 15 });
  return near(r.totalAibCredits, 250000, 1e-3);
})());
ok("total split: single capability = plain fromAibCredits", (function () {
  var split = R.fromTotalAibCredits(32000, { prebuilt_doc: 100 });
  var plain = R.fromAibCredits("prebuilt_doc", 32000);
  return near(split.totalCopilotCredits, plain.copilotCredits);
})());
ok("total split: zero total → empty", R.fromTotalAibCredits(0, { custom_doc: 100 }).rows.length === 0);
ok("total split: zero allocation → empty", R.fromTotalAibCredits(1000, { custom_doc: 0 }).rows.length === 0);
ok("total split: allocPct reported and normalized to 100", (function () {
  var r = R.fromTotalAibCredits(1000, { custom_doc: 30, object_detection: 10 });
  var sum = r.rows.reduce(function (s, x) { return s + x.allocPct; }, 0);
  return near(sum, 100, 1e-6);
})());

console.log("\n" + (failures === 0 ? "ALL TESTS PASSED" : failures + " TEST(S) FAILED"));
process.exit(failures === 0 ? 0 : 1);

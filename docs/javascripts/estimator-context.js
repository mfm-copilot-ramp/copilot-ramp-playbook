/*
 * estimator-context.js — "estimate from any context".
 *
 * A product-agnostic front door: paste ANY free text (an idea, an email thread, meeting
 * notes, a transcript, loose requirements) and get sized use case(s) rolled up into a
 * portfolio / milestone. It does three things and reuses the real engines for all math:
 *
 *   1. SEGMENT the text into one or more candidate use cases (bullets, paragraphs, or
 *      connective splits like "also / another / separately").
 *   2. CLASSIFY each as a Copilot Studio agent or M365 Copilot (Cowork) adoption.
 *   3. SIZE each — Studio via EstimatorCore.analyzeText (same engine as Quick), Cowork via
 *      CoworkEstimator — and ROLL UP via PortfolioCore.aggregate.
 *
 * Cowork driver inference (population / active% / credits) is delegated to
 * ConversationEstimator so there is one source of truth for those heuristics.
 *
 * Everything is DIRECTIONAL and every driver is surfaced + editable. Not an LLM — a
 * "Structure with Copilot" prompt is offered for higher-fidelity extraction.
 *
 * Node:    var Ctx = require("./estimator-context.js");
 * Browser: window.ContextEstimator  (engines picked up from window.*)
 */
(function (root) {
  "use strict";

  function engines() {
    if (typeof module === "object" && module.exports) {
      return {
        EC: safeReq("./estimator-core.js"), CE: safeReq("./estimator-cowork.js"),
        PC: safeReq("./portfolio-core.js"), Conv: safeReq("./estimator-conversation.js")
      };
    }
    return { EC: root.EstimatorCore, CE: root.CoworkEstimator, PC: root.Portfolio, Conv: root.ConversationEstimator };
  }
  function safeReq(p) { try { return require(p); } catch (e) { return null; } }

  // ── segmentation ────────────────────────────────────────────────────────────
  var CONNECTIVES = /\b(?:also|additionally|separately|in addition|another(?:\s+(?:thing|use\s*case|agent|one))?|second(?:ly)?|third(?:ly)?|plus|then\s+we|and\s+we(?:'d| would|'ll| will)?\s+(?:also\s+)?(?:want|like|need|build)|we(?:'d| would)?\s+also)\b/gi;

  function cleanFragment(s) {
    return String(s || "").replace(/^\s*(?:[-*•·]|\d+[.)])\s*/, "").replace(/^(?:and|also|plus)\s+/i, "").trim();
  }

  function splitSentences(text) {
    // dependency-free sentence split (no lookbehind, for browser safety)
    var out = [], cur = "";
    for (var i = 0; i < text.length; i++) {
      cur += text[i];
      if (/[.!?]/.test(text[i]) && /\s/.test(text[i + 1] || " ")) { out.push(cur.trim()); cur = ""; }
    }
    if (cur.trim()) out.push(cur.trim());
    return out.filter(Boolean);
  }

  function segment(text) {
    text = String(text || "").trim();
    if (!text) return [];
    // 1. bullet / numbered lines
    var lines = text.split(/\r?\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
    var bullets = lines.filter(function (l) { return /^\s*(?:[-*•·]|\d+[.)])\s+/.test(l); });
    if (bullets.length >= 2) return finalize(bullets.map(cleanFragment), text);
    // 2. hard blocks on BLANK lines only (single newlines are NOT use-case boundaries)
    var blocks = text.split(/\n[ \t]*\n+/).map(function (b) { return b.replace(/\s+/g, " ").trim(); }).filter(Boolean);
    var out = [];
    blocks.forEach(function (b) { out = out.concat(splitConnectives(b)); });
    return finalize(out, text);
  }

  function finalize(arr, whole) {
    var g = dedupe(arr.map(cleanFragment)).filter(function (x) { return x.length >= 12; });
    var kept = g.filter(function (x) { return !isMeta(x); });
    if (kept.length) g = kept;             // drop meta only if real content remains
    return g.length ? g.slice(0, 6) : [whole];
  }

  // Clear meta / interrogative filler — dropped only when it carries no workload signal.
  function isMeta(s) {
    var t = s.trim().toLowerCase();
    if (WORKLOAD_SIGNAL.test(t)) return false;
    if (/\?\s*$/.test(t)) return true;
    return /^(?:can|could|should|would|will|do|does|please|let\s+me\s+know|thanks|thank\s+you|regards|cheers|hi|hello|fyi|following)\b/.test(t);
  }

  function splitConnectives(b) {
    // break "; also / separately / and (also) build …" into separate clauses
    b = b.replace(/;\s*(?=(?:also|separately|plus|additionally|then)\b|and\s+(?:also\s+)?(?:build|create|automate|develop|deploy|roll|we)\b)/gi, "\u0001");
    var out = [];
    b.split("\u0001").forEach(function (chunk) {
      var sentences = splitSentences(chunk), groups = [], cur = "";
      sentences.forEach(function (s) {
        CONNECTIVES.lastIndex = 0;
        var m = CONNECTIVES.exec(s);
        if (m && m.index <= 12 && cur) { groups.push(cur.trim()); cur = s; }
        else cur += (cur ? " " : "") + s;
      });
      if (cur.trim()) groups.push(cur.trim());
      out = out.concat(groups);
    });
    return out;
  }

  function dedupe(arr) {
    var seen = {}, out = [];
    arr.forEach(function (s) { var k = s.toLowerCase(); if (s && !seen[k]) { seen[k] = 1; out.push(s); } });
    return out;
  }

  // Short, clean human label from a segment (product-aware).
  function labelFor(seg, product) {
    var audience = seg.match(/(?:for|to)\s+(?:our\s+|the\s+)?((?:all\s+)?(?:\d[\d,]*\s*(?:k|thousand)?\s+)?[a-z][a-z]*(?:\s+[a-z]+){0,2}?\s*(?:reps|representatives|managers|employees|engineers|sellers|advisors|agents|staff|users|workers|associates|analysts|clinicians|nurses|technicians|specialists|consultants|brokers|officers|people|professionals|planners|clerks|operators))/i);
    if (product === "cowork") {
      if (audience) return cap("Copilot for " + audience[1].replace(/\s+/g, " ").trim());
      return "Copilot (Cowork) adoption";
    }
    // Studio: strip preambles, then take a concise action phrase.
    var s = " " + seg.trim();
    s = s.replace(/^\s*(?:hi\s+team[^.,;:]*[.,;:—-]\s*)/i, "");
    s = s.replace(/^\s*following\s+(?:our|the)\s+call[,;:]?\s*/i, "");
    s = s.replace(/^\s*for\s+(?:our|the)\s+[^:.,;]*[:,;]\s*/i, "");
    s = s.replace(/^\s*(?:first|second|third|next|then|also|separately|additionally|plus|and|in addition)[,:]?\s*/i, "");
    s = s.replace(/^\s*(?:the\s+customer|customer|they|we|i)\s+(?:also\s+)?(?:wants?|needs?|would\s+like|d\s+like|asked\s+(?:about|for)|are\s+looking(?:\s+for)?)\s+(?:to\s+)?/i, "");
    s = s.replace(/^\s*(?:(?:build|create|set\s*up|stand\s*up|develop|deploy|roll\s*out|an|a|the)\s+)+/i, "");
    s = s.trim().replace(/[,.;:]+$/, "");
    var words = s.split(/\s+/).slice(0, 7).join(" ").replace(/\s+(?:that|which|to|for|from|and|the)$/i, "");
    return cap(words) || "Use case";
  }
  function cap(x) { x = String(x).trim(); return x.charAt(0).toUpperCase() + x.slice(1); }

  // Does a fragment actually describe a workload? (drops trailing junk like "Can we size both?")
  var WORKLOAD_SIGNAL = /(agent|bot|copilot|automat|answer|draft|summar|rout(?:e|ing)|triage|\bfile[sd]?\b|assistant|ticket|invoice|\bemail|benefits|question|knowledge|productivity|adopt|roll\s*out|deploy|\d[\d,]*\s*(?:k|thousand)?\s*(?:users|employees|reps|managers|people|engineers|sellers|advisors|staff))/i;

  // ── build portfolio items from text ──────────────────────────────────────────
  // Infer Cowork drivers for a single segment (population / active% / credits).
  // globalPop is the whole-text headcount fallback used when the segment itself
  // named no population; pass { value: null, defaulted: true } when unavailable.
  function deriveCoworkInput(seg, E, globalPop) {
    globalPop = globalPop || { value: null, defaulted: true };
    if (E.Conv) {
      var popSeg = E.Conv.extractPopulation(seg);
      // Inherit the whole-text headcount ONLY when the segment itself named none.
      var licOverride = (popSeg.defaulted && globalPop && !globalPop.defaulted && globalPop.value != null) ? globalPop.value : null;
      var r = E.Conv.estimateFromConversation(seg, licOverride != null ? { licensedUsers: licOverride } : {});
      var drivers = (r && r.ok) ? r.drivers : { licensedUsers: (globalPop && globalPop.value) || 1000, mauPct: 15, creditsPerActiveUser: 5000 };
      return {
        input: { cowork: { licensedUsers: drivers.licensedUsers, mauPct: drivers.mauPct, creditsPerActiveUser: drivers.creditsPerActiveUser } },
        assumptions: (r && r.assumptions) || []
      };
    }
    return {
      input: { cowork: { licensedUsers: (globalPop && globalPop.value) || 1000, mauPct: 15, creditsPerActiveUser: 5000 } },
      assumptions: []
    };
  }

  // Build one portfolio item for a given producer, deriving its input from the text.
  function makeItem(id, seg, producer, E, globalPop) {
    if (producer === "cowork") {
      var d = deriveCoworkInput(seg, E, globalPop);
      return { id: id, producer: "cowork", label: labelFor(seg, "cowork"), sourceText: seg, input: d.input, assumptions: d.assumptions };
    }
    return { id: id, producer: "studio", label: labelFor(seg, "studio"), sourceText: seg, input: { text: seg }, assumptions: [] };
  }

  function buildItems(text, E) {
    var segs = segment(text);
    // whole-text population as a fallback for cowork segments that don't restate headcount
    var globalPop = E.Conv ? E.Conv.extractPopulation(text) : { value: null };
    return segs.map(function (seg, i) {
      var product = E.Conv ? E.Conv.detectProduct(seg).product : "studio";
      return makeItem("uc" + (i + 1), seg, product, E, globalPop);
    });
  }

  // Reversibly flip a single portfolio item to the other product. The CURRENT
  // producer's full state (input + assumptions + label) is memoized on the item,
  // so a later flip back restores the ORIGINAL inferred (or user-edited) estimate
  // instead of resetting to generic defaults. The first flip to a producer that
  // has no memo derives it from the source text via the same inference used on
  // the initial pass — keeping the estimate tied to the scenario either way.
  function reclassifyItem(item, to, opts) {
    opts = opts || {};
    if (!item || typeof item !== "object") return item;
    var cur = item.producer || "studio";
    to = (to === "cowork") ? "cowork" : "studio";
    if (to === cur) return item;
    var E = engines();
    var memo = item._memo || {};
    // stash the current producer's state so flipping back is loss-free
    memo[cur] = { input: item.input, assumptions: item.assumptions || [], label: item.label };
    var next;
    if (memo[to]) {
      next = { id: item.id, sourceText: item.sourceText, producer: to,
               input: memo[to].input, assumptions: memo[to].assumptions || [], label: memo[to].label || labelFor(item.sourceText, to) };
    } else {
      next = makeItem(item.id, item.sourceText, to, E, { value: null, defaulted: true });
    }
    next._memo = memo;
    return next;
  }

  // ── main entry ────────────────────────────────────────────────────────────────
  function estimateContext(text, opts) {
    opts = opts || {};
    text = String(text || "");
    var E = engines();
    if (text.trim().length < 12) return { ok: false, error: "Paste a few sentences of context to estimate." };
    if (!E.PC || !E.EC || !E.CE) return { ok: false, error: "Estimation engines not loaded." };

    var items = buildItems(text, E);
    // allow the UI to pass edited items back in (tuned drivers / reclassified) — validate them
    if (opts.items != null) {
      if (!Array.isArray(opts.items)) return { ok: false, error: "items must be an array." };
      items = opts.items.filter(function (it) { return it && typeof it === "object" && it.input; });
      if (!items.length) return { ok: false, error: "No valid items to estimate." };
    }

    var eng = { EstimatorCore: E.EC, CoworkEstimator: E.CE };
    var perItem = items.map(function (it) {
      var r = E.PC.recomputeItem(it, eng);
      return {
        id: it.id, label: it.label, product: it.producer || "studio", sourceText: it.sourceText,
        monthlyCredits: r.monthlyCredits, monthlyCostUSD: r.monthlyCostUSD,
        size: r.size || null, activeUsers: r.activeUsers != null ? r.activeUsers : null,
        drivers: it.input && it.input.cowork ? it.input.cowork : null,
        assumptions: it.assumptions || []
      };
    });
    var agg = E.PC.aggregate(items, eng);

    return {
      ok: true,
      useCaseCount: items.length,
      items: items,           // portfolio items (editable, re-feed via opts.items)
      useCases: perItem,      // per-use-case sized results
      portfolio: {
        monthlyCredits: agg.monthlyCredits,
        monthlyCostUSD: agg.monthlyCostUSD,
        annualCostUSD: agg.monthlyCostUSD * 12,
        byProducer: agg.byProducer,
        coworkActiveUsers: agg.coworkActiveUsers
      },
      suggestions: buildSuggestions(perItem),
      copilotPrompt: copilotPrompt(),
      disclaimer: "Directional — use cases and sizes are inferred from your text by keyword rules, not an LLM. Review each before quoting; tune any driver or reclassify a use case."
    };
  }

  function buildSuggestions(perItem) {
    var s = [];
    if (perItem.length > 1) s.push("Detected " + perItem.length + " use cases — review the split; merge or delete any that aren't real.");
    if (perItem.length === 1) s.push("Read as a single use case. If your text covers more than one workload, separate them with bullets or 'also'.");
    var mixed = perItem.some(function (i) { return i.product === "studio"; }) && perItem.some(function (i) { return i.product === "cowork"; });
    if (mixed) s.push("Mixed Studio + Cowork — the roll-up combines agent credits and Cowork consumption.");
    var thinStudio = perItem.some(function (i) { return i.product === "studio" && (!i.sourceText || i.sourceText.length < 60); });
    if (thinStudio) s.push("Some agent descriptions are short — add who uses it, how often, and knowledge sources for a tighter size.");
    var coworkNoPop = perItem.some(function (i) { return i.product === "cowork" && i.drivers && (!i.drivers.licensedUsers || i.drivers.licensedUsers === 1000); });
    if (coworkNoPop) s.push("Couldn't find a headcount for a Cowork use case — set licensed users for a real number.");
    s.push("For higher fidelity, use 'Structure with Copilot' to turn messy text into clean use-case rows.");
    return s;
  }

  function copilotPrompt() {
    return "You're helping size Copilot use cases. From the notes/transcript below, extract each DISTINCT use case as one line. " +
      "For each, output: name | product (Copilot Studio agent OR M365 Copilot/Cowork) | who uses it | how often | knowledge/data sources | actions | for Cowork: licensed users, % active, avg credits/user/mo. " +
      "Infer only what's implied; leave blanks otherwise. Then paste the lines back into the estimator.\n\nNotes:\n";
  }

  var api = {
    segment: segment, labelFor: labelFor, buildItems: function (t) { return buildItems(t, engines()); },
    estimateContext: estimateContext, reclassifyItem: reclassifyItem, copilotPrompt: copilotPrompt
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ContextEstimator = api;
})(typeof self !== "undefined" ? self : this);

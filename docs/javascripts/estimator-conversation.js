/*
 * estimator-conversation.js — bottom-up Cowork estimate from a pasted conversation.
 *
 * Sugan's headline SSP use case: paste a customer transcript / notes, get a directional
 * Cowork consumption number you can turn into a milestone. This is a DIRECTIONAL heuristic
 * — deterministic keyword/number extraction, NOT an LLM. It infers three drivers and hands
 * them to the existing CoworkEstimator so results stay consistent with the rest of the tool:
 *
 *     licensed users  ×  active-usage %  ×  credits per active user (from an intensity mix)
 *
 * Every inference is surfaced as an editable assumption with a "basis" string, so the seller
 * sees exactly what was guessed and tunes it before quoting.
 *
 * Node:    var Conv = require("./estimator-conversation.js");
 * Browser: window.ConversationEstimator  (Cowork engine picked up from window.CoworkEstimator)
 */
(function (root) {
  "use strict";

  // ── number-word normalisation ───────────────────────────────────────────────
  function parseCount(raw) {
    if (raw == null) return null;
    var s = String(raw).trim().toLowerCase().replace(/,/g, "");
    var m = s.match(/^(\d+(?:\.\d+)?)\s*(k|thousand|hundred|m|million)?$/);
    if (!m) { var n0 = parseFloat(s); return isFinite(n0) ? n0 : null; }
    var n = parseFloat(m[1]);
    if (m[2] === "k" || m[2] === "thousand") n *= 1000;
    else if (m[2] === "hundred") n *= 100;
    else if (m[2] === "m" || m[2] === "million") n *= 1000000;
    return Math.round(n);
  }

  var PEOPLE = "(?:employees?|people|staff|users?|reps?|representatives?|agents|associates|workers?|advisors?|analysts?|engineers?|managers?|bankers?|clinicians?|nurses?|technicians?|specialists?|consultants?|sellers?|brokers?|clerks?|operators?|officers?|planners?|professionals?|team\\s*members?|headcount|ftes?|seats?|licen[cs]es?|of\\s+us)";
  var NUM = "(\\d[\\d,]*(?:\\.\\d+)?\\s*(?:k|thousand|hundred|million|m)?)";
  var ROLLOUT_LEAD = "(?:roll(?:ing)?\\s*(?:it\\s+)?out\\s+to|deploy(?:\\s+it)?\\s+to|turn(?:ing)?\\s+(?:it\\s+)?on\\s+for|give\\s+(?:it\\s+)?to|for\\s+(?:our|the)|pilot(?:ing)?\\s+with|start(?:ing)?\\s+with|onboard(?:ing)?|licen[cs]e\\s+(?:to\\s+)?)";

  // Collect headcount mentions and classify each as a rollout target vs whole-org scope.
  function extractPopulation(text) {
    var t = " " + text.toLowerCase() + " ";
    var PPL = PEOPLE;
    var FILL = "(?:[a-z][a-z-]*\\s+){0,2}"; // up to 2 filler adjectives between number and people noun
    var STRONG = "(?:roll(?:ing)?\\s*(?:it\\s+)?out\\s+to|deploy(?:\\s+it)?\\s+to|turn(?:ing)?\\s+(?:it\\s+)?on\\s+for|give\\s+(?:it\\s+)?to|pilot(?:ing)?\\s+with|onboard(?:ing)?|licen[cs]e\\s+(?:to\\s+)?)";
    var ROLLOUT_LEFT = /(?:roll(?:ing)?\s*(?:it\s+)?out\s+to|deploy(?:\s+it)?\s+to|turn(?:ing)?\s+(?:it\s+)?on\s+for|give\s+(?:it\s+)?to|pilot(?:ing)?\s+with|onboard(?:ing)?|licen[cs]e\s+to|for\s+(?:our|the))\s*$/;
    var PILOT_LEFT = /(?:pilot|start\s+with|small\s+group|proof\s+of\s+concept|\bpoc\b)/;
    var ORG_NOUN_RIGHT = /^(?:\s|-)*(?:employees?|workforce|staff|headcount)/;
    var ORG_LEFT = /(?:company|organi[sz]ation|\borg\b|entire|whole|all\s+of|across\s+the|company-?wide|firm|enterprise|workforce)/;
    var ORG_RIGHT = /^\s*-?\s*(?:employees?|people|persons?|company|bank|firm|organi[sz]ation|workforce|enterprise|business|corporation|staff)\b/;
    var candidates = [];

    function score(val, numAt, phrase, forced) {
      if (val == null || val < 0) return;
      var leftCtx = t.slice(Math.max(0, numAt - 34), numAt);
      var rightCtx = t.slice(numAt, numAt + 42);
      var rollout = false, org = false;
      if (forced === "org") org = true;
      else if (forced === "strong") {
        var afterNum = rightCtx.replace(/^[\d.,kmb\s]+/, " ");
        rollout = !ORG_RIGHT.test(afterNum); org = !rollout;
      } else if (forced === "group") {
        rollout = true;
        if (ORG_LEFT.test(leftCtx) && !PILOT_LEFT.test(leftCtx)) { rollout = false; org = true; }
      } else {
        rollout = ROLLOUT_LEFT.test(leftCtx) || PILOT_LEFT.test(leftCtx);
        if (!rollout) org = ORG_NOUN_RIGHT.test(rightCtx) || ORG_LEFT.test(leftCtx);
      }
      candidates.push({ value: val, rollout: rollout, org: org, phrase: (phrase || "").trim() });
    }

    var m, re;
    re = new RegExp("(\\d[\\d,]*)\\s*(?:-|\u2013|to)\\s*(\\d[\\d,]*)\\s+" + FILL + PPL, "g");
    while ((m = re.exec(t)) !== null) { var a = parseCount(m[1]), b = parseCount(m[2]); if (a != null && b != null) score(Math.round((a + b) / 2), m.index, m[0], null); }
    re = new RegExp(NUM + "\\s+" + FILL + PPL, "g");
    while ((m = re.exec(t)) !== null) score(parseCount(m[1]), m.index, m[0], null);
    re = new RegExp(NUM + "[-\\s](?:employee|person|people|seat|user)s?\\b", "g");
    while ((m = re.exec(t)) !== null) score(parseCount(m[1]), m.index, m[0], "org");
    re = new RegExp(STRONG + "\\s+(?:about\\s+|around\\s+|roughly\\s+|~?\\s*)?" + NUM, "g");
    while ((m = re.exec(t)) !== null) score(parseCount(m[1]), m.index + m[0].indexOf(m[1]), m[0], "strong");
    re = new RegExp("(?:team|group)\\s+of\\s+" + NUM, "g");
    while ((m = re.exec(t)) !== null) score(parseCount(m[1]), m.index + m[0].indexOf(m[1]), m[0], "group");
    re = new RegExp("(?:company|workforce|org(?:ani[sz]ation)?|firm|staff|enterprise)\\s+of\\s+" + NUM, "g");
    while ((m = re.exec(t)) !== null) score(parseCount(m[1]), m.index + m[0].indexOf(m[1]), m[0], "org");

    if (!candidates.length) return { value: null, basis: "No headcount found — defaulted to 1,000. Set the real licensed population.", candidates: [], defaulted: true, value_default: 1000 };
    var pick = candidates.filter(function (c) { return c.rollout; }).sort(function (a, b) { return b.value - a.value; })[0]
            || candidates.filter(function (c) { return c.org; }).sort(function (a, b) { return b.value - a.value; })[0]
            || candidates.slice().sort(function (a, b) { return b.value - a.value; })[0];
    var basis = pick.rollout ? "Scoped to the group named for rollout (\"" + pick.phrase + "\")."
              : pick.org ? "Read as the whole population (\"" + pick.phrase + "\")."
              : "Largest headcount mentioned (\"" + pick.phrase + "\").";
    return { value: pick.value, basis: basis, candidates: candidates, targeted: !!pick.rollout };
  }

  // Active-usage % of the licensed population in a month.
  function extractUsage(text, pop) {
    var t = text.toLowerCase();
    var pctM = t.match(/(-?\d{1,3}(?:\.\d+)?)\s*%\s*(?:of\s+\w+\s+)?(?:activ|adopt|us(?:e|ing|age)|monthly\s+activ|mau)/)
            || t.match(/(?:activ|adopt|us(?:e|ing|age)|mau)[^.\d]{0,22}(-?\d{1,3}(?:\.\d+)?)\s*%/);
    if (pctM) {
      var p = parseFloat(pctM[1]);
      if (isFinite(p)) { p = Math.max(0, Math.min(100, p)); return { mauPct: p, basis: "Stated active/adoption rate of " + p + "%." }; }
    }
    var frequent = /(daily|every\s*day|all\s*day|constantly|throughout\s+the\s+day|each\s+day)/.test(t);
    var everyone = /(everyone|every\s*one|all\s+(?:of\s+)?(?:them|staff|employees|users)|whole\s+team|across\s+the\s+(?:team|org|company))/.test(t);
    var pilot = /(\bpilot\b|small\s+group|\ba\s+few\b|handful|proof\s+of\s+concept|\bpoc\b|\btrial\b)/.test(t);
    if (pop && pop.targeted) {
      if (frequent && everyone) return { mauPct: 75, basis: "Targeted rollout described as near-daily for everyone in the group → 75% active." };
      if (frequent) return { mauPct: 60, basis: "Targeted rollout with daily use → 60% active." };
      if (pilot) return { mauPct: 40, basis: "Pilot / small group → 40% of the licensed group active." };
      return { mauPct: 50, basis: "Targeted rollout, unstated frequency → 50% active." };
    }
    if (everyone && frequent) return { mauPct: 23, basis: "Whole-org, enthusiastic adoption → 23% monthly active (high benchmark)." };
    if (pilot) return { mauPct: 10, basis: "Pilot framing → 10% monthly active (conservative benchmark)." };
    return { mauPct: 15, basis: "No adoption signal → 15% monthly active (typical planning benchmark)." };
  }

  var INTENSITY_WEIGHTS = { light: 125, medium: 500, heavy: 2500 }; // mirrors estimator-cowork.js

  // Credits/active user/month from a prompt-frequency × task-complexity read.
  function extractIntensity(text) {
    var t = text.toLowerCase();
    var signals = [];
    // frequency → total prompts/active user/month
    var prompts = 12, freqBasis = "default ~12 prompts/user/mo";
    if (/(every\s+(?:email|ticket|case|invoice|message|order|request|lead|call)|per\s+(?:ticket|case|invoice|email|order)|each\s+(?:email|ticket|case|invoice)|hundreds\s+of|constantly)/.test(t)) { prompts = 40; freqBasis = "high volume (per-item / constant) ~40/mo"; signals.push("per-item volume"); }
    else if (/(daily|every\s*day|all\s*day|each\s+day|day-to-day)/.test(t)) { prompts = 20; freqBasis = "daily use ~20/mo"; signals.push("daily"); }
    else if (/(weekly|few\s+times\s+a\s+week|couple\s+times\s+a\s+week|several\s+times\s+a\s+week)/.test(t)) { prompts = 8; freqBasis = "weekly use ~8/mo"; signals.push("weekly"); }
    else if (/(occasionally|now\s+and\s+then|once\s+in\s+a\s+while|rarely|sometimes)/.test(t)) { prompts = 3; freqBasis = "occasional use ~3/mo"; signals.push("occasional"); }

    // complexity → distribution across light/medium/heavy
    var grounded = /(sharepoint|our\s+(?:docs|documents|policies|knowledge|data|content|files|intranet)|knowledge\s*base|grounded|tenant\s+(?:data|graph)|internal\s+(?:docs|data))/.test(t);
    var autonomous = /(autonomous|automatically|without\s+(?:a\s+)?(?:human|me|us)|routes?|triggers?|on\s+its\s+own|end-to-end|multi-?step|multiple\s+steps)/.test(t);
    var dist, complexity;
    if (grounded && autonomous) { dist = { light: 0.35, medium: 0.45, heavy: 0.20 }; complexity = "complex (grounded + autonomous)"; signals.push("grounded", "autonomous"); }
    else if (grounded || autonomous) { dist = { light: 0.55, medium: 0.35, heavy: 0.10 }; complexity = "moderate (" + (grounded ? "grounded" : "multi-step") + ")"; signals.push(grounded ? "grounded" : "multi-step"); }
    else { dist = { light: 0.80, medium: 0.18, heavy: 0.02 }; complexity = "simple (Q&A / chat)"; }

    var mix = {
      light: Math.round(prompts * dist.light),
      medium: Math.round(prompts * dist.medium),
      heavy: Math.round(prompts * dist.heavy)
    };
    var cpu = mix.light * INTENSITY_WEIGHTS.light + mix.medium * INTENSITY_WEIGHTS.medium + mix.heavy * INTENSITY_WEIGHTS.heavy;
    return {
      mix: mix,
      creditsPerActiveUser: cpu,
      basis: freqBasis + "; " + complexity,
      signals: signals
    };
  }

  // Which product does this sound like? (Cowork adoption vs a single Studio agent.)
  function detectProduct(text) {
    var t = text.toLowerCase();
    // \bcowork\b avoids matching "coworkers"; broad Studio signals catch agents/bots/automation.
    var studio = /(copilot\s*studio|\bagents?\b|\bbots?\b|\bassistants?\b|autonomous|automat(?:e|es|ed|ing|ion)|\brout(?:e|es|ed|ing)\b|\btriage\b|power\s*automate|files?\s+(?:a\s+)?ticket|reconcile|process(?:es|ing)?\s+(?:invoices?|tickets?|orders?|emails?))/.test(t);
    var coworkStrong = /(\bcowork\b|\bco-work\b|m365\s*copilot|microsoft\s*365\s*copilot|copilot\s+chat|roll(?:ing)?\s+(?:out\s+)?(?:m365\s+)?copilot|company-?wide|all\s+(?:of\s+)?(?:our\s+)?employees|everyone\s+(?:to\s+)?(?:have|use|get))/.test(t);
    var coworkWeak = /(adoption|productivity|\beveryone\b|employees?\s+using)/.test(t);
    if (studio && !coworkStrong) return { product: "studio", basis: "Reads as a Copilot Studio agent — consider the Studio 'Describe' path too." };
    if (coworkStrong && !studio) return { product: "cowork", basis: "Reads as broad M365 Copilot (Cowork) adoption." };
    if (studio && coworkStrong) {
      var build = /(build|create|develop|stand\s*up)\s+(?:an?\s+)?(?:[a-z-]+\s+){0,2}(?:agent|bot|assistant)/.test(t);
      return build ? { product: "studio", basis: "Agent-construction language present — sized as a Studio agent." }
                   : { product: "cowork", basis: "Broad Copilot language dominates — sized as Cowork." };
    }
    if (coworkWeak) return { product: "cowork", basis: "Broad productivity/adoption language — sized as Cowork." };
    return { product: "cowork", basis: "Ambiguous — defaulting to Cowork population sizing." };
  }

  function getCoworkEngine() {
    if (typeof module === "object" && module.exports) { try { return require("./estimator-cowork.js"); } catch (e) { return null; } }
    return root.CoworkEstimator || null;
  }

  // Main entry: text → drivers + a Cowork estimate + transparent assumptions.
  function estimateFromConversation(text, opts) {
    opts = opts || {};
    text = String(text || "");
    if (text.trim().length < 12) return { ok: false, error: "Paste a few sentences of notes or a transcript to estimate." };

    var prod = detectProduct(text);
    var popR = extractPopulation(text);
    var licensed = popR.value != null ? popR.value : (popR.value_default || 1000);
    var usageR = extractUsage(text, popR);
    var intenR = extractIntensity(text);

    // Allow explicit overrides (the seller tuned a field in the UI).
    if (opts.licensedUsers != null) licensed = parseCount(opts.licensedUsers) || licensed;
    var mauPct = opts.mauPct != null ? Math.max(0, Math.min(100, parseFloat(opts.mauPct))) : usageR.mauPct;
    var cpu = opts.creditsPerActiveUser != null ? Math.max(0, parseFloat(opts.creditsPerActiveUser)) : intenR.creditsPerActiveUser;

    var engine = getCoworkEngine();
    var est = engine ? engine.quickEstimate({ licensedUsers: licensed, mauPct: mauPct, creditsPerActiveUser: cpu, global: opts.global }) : null;

    var confidence = popR.defaulted ? "low" : (popR.candidates && popR.candidates.length && intenR.signals.length ? "medium" : "low");

    return {
      ok: true,
      product: prod.product,
      useCaseLine: summariseUseCase(text, popR, intenR),
      drivers: { licensedUsers: licensed, mauPct: mauPct, creditsPerActiveUser: cpu, intensityMix: intenR.mix },
      estimate: est,
      confidence: confidence,
      assumptions: [
        { field: "Product", value: prod.product === "cowork" ? "M365 Copilot (Cowork)" : "Copilot Studio agent", basis: prod.basis },
        { field: "Licensed users", value: licensed, basis: popR.basis },
        { field: "Active usage %", value: mauPct, basis: usageR.basis },
        { field: "Credits / active user / mo", value: cpu, basis: intenR.basis + " (mix L/M/H = " + intenR.mix.light + "/" + intenR.mix.medium + "/" + intenR.mix.heavy + ")" }
      ],
      disclaimer: "Directional — derived from your text by keyword rules, not an LLM. Tune every driver before quoting."
    };
  }

  function summariseUseCase(text, popR, intenR) {
    var who = popR.value != null ? (popR.value + " users") : "an unspecified population";
    var how = intenR.signals.length ? intenR.signals.join(", ") : "general use";
    return "Cowork for " + who + " — " + how + ".";
  }

  var api = {
    parseCount: parseCount,
    extractPopulation: extractPopulation,
    extractUsage: extractUsage,
    extractIntensity: extractIntensity,
    detectProduct: detectProduct,
    estimateFromConversation: estimateFromConversation,
    INTENSITY_WEIGHTS: INTENSITY_WEIGHTS
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ConversationEstimator = api;
})(typeof self !== "undefined" ? self : this);

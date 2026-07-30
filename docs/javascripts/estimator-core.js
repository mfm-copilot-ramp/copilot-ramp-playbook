/* Copilot Credit Estimator — shared analysis engine.
 * Pure, DOM-free logic shared by the Quick (natural-language) and
 * Solution-package (upload) modes. Node-testable; the same block is embedded
 * verbatim into docs/credit-estimator.md (minus the module.exports footer).
 */
(function (root) {
  "use strict";

  // ── Credit model — mirrors the detailed estimator's default rows ──────────
  var CREDIT = {
    classic: 1, generative: 2, action: 5, tenantGraph: 10, flowAction: 0.13,
    aiBasic: 0.1, aiStandard: 1.5, aiPremium: 10, contentPage: 8,
    voiceBasic: 10, voiceStandard: 35, voicePremium: 75
  };
  var RATE_PAYG = 0.01;      // $/credit, pay-as-you-go
  var RATE_PREPAID = 0.008;  // $/credit, $200 / 25,000 prepaid pack

  // Matcher substrings used to seed the detailed estimator's default rows.
  var ROW = {
    classic: "Classic answer",
    generative: "Generative answer",
    action: "Agent action",
    tenantGraph: "Tenant graph grounding",
    flow: "Agent flow actions",
    aiStandard: "Text/generative standard",
    content: "Content processing",
    voiceStandard: "Voice — Standard"
  };

  // ── T-shirt sizing ────────────────────────────────────────────────────────
  // Size measures BUILD COMPLEXITY / effort — not credit cost (shown separately).
  var SIZE_INFO = {
    XS: { label: "XS", name: "Extra small",
      desc: "Single-purpose Q&A — one knowledge source, no actions, classic routing.",
      effort: "Hours to stand up. One maker, no pro-dev.",
      govern: "Minimal — publish and monitor occasionally." },
    S: { label: "S", name: "Small",
      desc: "Generative Q&A with a few topics and one action or one flow.",
      effort: "A few days. One maker.",
      govern: "Light — a shared environment and basic analytics." },
    M: { label: "M", name: "Medium",
      desc: "Generative orchestration with 2–4 actions across 1–2 systems (or a simple autonomous agent).",
      effort: "1–3 weeks. Maker + occasional pro-dev for connectors.",
      govern: "Moderate — ALM, connection references, DLP review." },
    L: { label: "L", name: "Large",
      desc: "5+ actions across 3+ systems, multiple flows, autonomous triggers or document processing.",
      effort: "1–2 months. Maker + pro-dev + reviewer.",
      govern: "Serious — managed solutions, environments, monitoring, DLP." },
    XL: { label: "XL", name: "Extra large",
      desc: "Voice, tenant-graph grounding, autonomous/multi-agent, many actions, high volume.",
      effort: "Multi-month program with a dedicated team.",
      govern: "Full ALM, security review, capacity planning, SRE-style ops." }
  };
  // Retained for the Solution-package (Complex) mode.
  function sizeForScore(score, opts) {
    opts = opts || {};
    var s = score <= 1 ? "XS" : score <= 3 ? "S" : score <= 6 ? "M" : score <= 9 ? "L" : "XL";
    if (opts.voice) { if (s === "XS" || s === "S" || s === "M") s = "L"; }
    if (opts.users >= 10000 && s !== "XL") {
      s = ({ XS: "S", S: "M", M: "L", L: "XL", XL: "XL" })[s];
    }
    return s;
  }
  var SIZE_ORDER = ["XS", "S", "M", "L", "XL"];
  // Driver-based sizing for the Quick mode. Returns {size, drivers:[...why]}.
  function sizeFromDrivers(v) {
    var score = 0, drivers = [];
    function add(pts, why) { score += pts; if (why) drivers.push({ pts: pts, why: why }); }
    var a = Math.max(0, v.actionsCount || 0);
    if (a >= 5) add(3, a + " actions");
    else if (a >= 2) add(2, a + " actions");
    else if (a === 1) add(1, "1 action");
    var sys = Math.max(0, v.systemsCount || 0);
    if (sys >= 3) add(2, sys + " systems");
    else if (sys === 2) add(1, "2 systems");
    if (v.orchestration === "generative") add(1, "generative orchestration");
    if (v.knowledge === "tenantGraph") add(2, "tenant-graph grounding");
    else if (v.knowledge === "docs") add(1, "knowledge grounding");
    if (v.channel === "voice") add(3, "voice channel");
    if (v.archetype === "autonomous") add(2, "autonomous / event-driven");
    if (v.hasFlow) add(1, "workflow / approval flow");
    if (v.hasContent) add(2, "document processing");
    if (v.hasAI) add(1, "generative content tool");
    // Volume tier (build/ops complexity grows with scale).
    var vol = v.archetype === "autonomous"
      ? (v.events || 0)
      : Math.round((v.users || 0) * (v.interactions || 0));
    var volThresh = v.archetype === "autonomous" ? [2000, 20000] : [20000, 250000];
    if (vol >= volThresh[1]) add(2, "high volume");
    else if (vol >= volThresh[0]) add(1, "meaningful volume");

    var size = score <= 1 ? "XS" : score <= 2 ? "S" : score <= 5 ? "M" : score <= 8 ? "L" : "XL";
    if (v.channel === "voice" && SIZE_ORDER.indexOf(size) < SIZE_ORDER.indexOf("L")) size = "L";
    drivers.sort(function (x, y) { return y.pts - x.pts; });
    return { size: size, score: score, drivers: drivers.slice(0, 3).map(function (d) { return d.why; }) };
  }

  // ── Shared math ───────────────────────────────────────────────────────────
  function perInteractionCredits(profile) {
    return profile.reduce(function (sum, r) { return sum + r.uses * r.credits; }, 0);
  }
  function billedUsers(scale) {
    var n = scale.deployment === "embedded"
      ? scale.users * (1 - (scale.licensePct || 0) / 100)
      : scale.users;
    return Math.max(0, Math.round(n));
  }
  function computeEstimate(profile, scale) {
    var per = perInteractionCredits(profile);
    var billed = billedUsers(scale);
    var monthly = billed * scale.interactions * per;
    return { perInteraction: per, billed: billed, monthly: monthly };
  }
  function creditRange(monthly) {
    return { low: monthly * 0.6, mid: monthly, high: monthly * 1.6 };
  }
  function costUSD(credits) {
    return { payg: credits * RATE_PAYG, prepaid: credits * RATE_PREPAID };
  }
  // Regime-aware monthly consumption for the Quick mode.
  // interactive: billedUsers × interactions/user/month × perUnit (embedded licensing applies).
  // autonomous:  events/month × perUnit (billed regardless of licensing — no discount).
  function computeQuick(profile, v) {
    var per = perInteractionCredits(profile);
    if (v.archetype === "autonomous") {
      var events = Math.max(0, Math.round(v.events || 0));
      return { regime: "autonomous", perUnit: per, units: events, billed: null, monthly: events * per };
    }
    var scale = { deployment: v.deployment, users: v.users, licensePct: v.licensePct };
    var billed = billedUsers(scale);
    var interactions = Math.max(0, v.interactions || 0);
    var escExtra = ((v.escalation || 0) / 100) * (v.escalationCredits || 0);
    var monthly = billed * interactions * (per + escExtra);
    return { regime: "interactive", perUnit: per, units: billed * interactions, billed: billed, monthly: monthly };
  }

  // ── Number/scale parsing for the Quick mode ───────────────────────────────
  function parseCount(numStr, suffix) {
    var n = parseFloat(String(numStr).replace(/[,\s]/g, ""));
    if (!isFinite(n)) return null;
    var s = (suffix || "").toLowerCase();
    if (s === "k" || s === "thousand") n *= 1e3;
    else if (s === "m" || s === "million") n *= 1e6;
    return Math.round(n);
  }
  function detectUsers(t) {
    var m = t.match(/([\d][\d,\.]*)\s*(k|thousand|million|m)?\s*\+?\s*(users|employees|people|staff|agents|reps|representatives|customers|callers|associates|workers|seats|members|clients|advisors)/);
    if (m) { var v = parseCount(m[1], m[2]); if (v) return { value: v, why: "from “" + m[0].trim() + "”" }; }
    var wn = t.match(/\b(dozens|hundreds|thousands|millions)\s+of\s+(users|employees|people|staff|agents|reps|representatives|customers|callers|associates|workers|seats|members|clients|advisors)/);
    if (wn) { var wv = { dozens: 50, hundreds: 500, thousands: 5000, millions: 1000000 }[wn[1]]; return { value: wv, why: "“" + wn[0].trim() + "”" }; }
    if (/\b(entire|whole|across the|company[- ]wide|enterprise[- ]wide|all employees|everyone|global)\b/.test(t) &&
        /\b(company|organi[sz]ation|org|enterprise|firm|business|workforce)\b/.test(t))
      return { value: 5000, why: "company-wide language" };
    if (/\benterprise\b/.test(t)) return { value: 25000, why: "“enterprise” scale" };
    if (/\b(department|division|business unit|region)\b/.test(t)) return { value: 500, why: "department-scale language" };
    if (/\b(team|small group|pilot|squad|pod)\b/.test(t)) return { value: 25, why: "team/pilot language" };
    return { value: 500, why: "default assumption" };
  }
  function detectInteractions(t) {
    if (/\b(constantly|all day|high[- ]volume|hundreds of times|many times a day|around the clock|24\/7)\b/.test(t)) return { value: 40, why: "very high frequency" };
    if (/\b(daily|every day|each day|throughout the day|per day)\b/.test(t)) return { value: 20, why: "daily use" };
    if (/\b(several times a week|few times a week|weekly|each week|every week|per week)\b/.test(t)) return { value: 6, why: "weekly use" };
    if (/\b(monthly|once a month|per month|a month|occasional|occasionally|rarely|now and then|infrequent|seldom)\b/.test(t)) return { value: 1, why: "occasional use" };
    return { value: 10, why: "default assumption" };
  }
  function detectDeployment(t) {
    if (/\b(public|customer[- ]facing|external|website|web ?site|web ?widget|web ?chat|portal|anonymous|visitors?|callers?|the public|consumers?)\b/.test(t))
      return { value: "standalone", why: "public / external audience" };
    if (/\b(teams|microsoft 365|m365|intranet|internal|employees|staff|colleagues|our people)\b/.test(t))
      return { value: "embedded", why: "internal Teams / M365 audience" };
    return { value: "embedded", why: "default assumption" };
  }

  // ── Archetype + autonomous-volume detection (Quick mode) ──────────────────
  var EVENT_NOUNS = "e-?mails?|messages?|orders?|tickets?|cases?|requests?|invoices?|receipts?|documents?|forms?|records?|transactions?|leads?|applications?|submissions?|files?|alerts?|claims?|inquir(?:y|ies)|reviews?|posts?|entries";
  // Strong autonomous cues — an event or schedule fires the agent (no human per run).
  var AUTO_STRONG = new RegExp(
    "\\b(every ?time|each ?time|whenever|any ?time|as soon as|on (?:a |an |each |every )?new\\b|" +
    "when\\b[^.]{0,30}?(?:comes? in|arrives?|is (?:received|submitted|created|added|logged|raised|placed|opened|uploaded|filed)|are (?:received|submitted|created|added|logged))|" +
    "incoming|arrives?\\b|nightly|hourly|scheduled|daily batch|\\bbatch\\b|unattended|in the background|behind the scenes|" +
    "trigger(?:ed|s)? (?:by|when|on|whenever)|for each (?:" + EVENT_NOUNS + "))\\b");
  // Weak cues — only autonomous when NO interactive signal is present.
  var AUTO_WEAK = /\b(automatically|autonomous(?:ly)?|monitors?|watch(?:es|ing)?|scans?|listens? for|polls?)\b/;
  var INTERACTIVE_CUE = new RegExp(
    "\\b(answers?|ask(?:s|ed|ing)?|questions?|q ?& ?a|chat ?bot|chats? with|in teams|self[- ]serve|" +
    "conversation|talk to|speak (?:to|with)|help(?:s)? (?:employees|staff|users|customers|people|sellers|agents|reps|callers)|" +
    "respond to (?:users|employees|customers|questions|people))\\b");
  var VOICE_RE = /\b(voice|call ?cent(?:er|re)|contact ?cent(?:er|re)|\bphone\b|\bivr\b|telephony|spoken|speech|hotline|over the phone)\b/;

  function detectArchetype(t) {
    if (AUTO_STRONG.test(t)) return "autonomous";
    if (AUTO_WEAK.test(t) && !INTERACTIVE_CUE.test(t)) return "autonomous";
    return "interactive";
  }

  function detectEventVolume(t) {
    // Allow up to two adjective words between the number and the event noun
    // ("5000 loan applications"). The (?![a-z]) guard stops the "m" million
    // suffix from eating the start of a word like "monthly".
    var gap = "(?:[a-z][a-z-]*\\s+){0,2}?";
    var re = new RegExp("([\\d][\\d,\\.]*)\\s*(k|thousand|million|m)?(?![a-z])\\s*\\+?\\s*" + gap + "(" + EVENT_NOUNS + ")\\b[\\s\\S]{0,24}?(?:per|a|each|every|/)\\s*(day|week|month|quarter|year|hour)");
    var m = t.match(re);
    var unit, period, value = null, why;
    if (m) {
      value = parseCount(m[1], m[2]);
      unit = m[3].replace(/s$/, "").replace("e-mail", "email");
      period = m[4];
      why = "from “" + m[0].trim().replace(/\s+/g, " ") + "”";
    } else {
      // number + event-noun without an explicit period, e.g. "100 emails"
      var re2 = new RegExp("([\\d][\\d,\\.]*)\\s*(k|thousand|million|m)?(?![a-z])\\s*\\+?\\s*" + gap + "(" + EVENT_NOUNS + ")\\b");
      var m2 = t.match(re2);
      if (m2) {
        value = parseCount(m2[1], m2[2]);
        unit = m2[3].replace(/s$/, "").replace("e-mail", "email");
        period = /\b(per|a|each|every)\s*(day|week|month|year|hour)\b/.test(t) ? (t.match(/\b(?:per|a|each|every)\s*(day|week|month|year|hour)\b/) || [])[1] : "month";
        why = "from “" + m2[0].trim() + "” (assumed per " + period + ")";
      }
    }
    if (value == null) {
      // word-number volumes, e.g. "thousands of tickets a day" or
      // "thousands of loan applications each month" (adjective between).
      var wnGap = "(?:[a-z][a-z-]*\\s+){0,2}?";
      var wn = t.match(new RegExp("(dozens|hundreds|thousands|millions)\\s+of\\s+" + wnGap + "(" + EVENT_NOUNS + ")"));
      if (wn) {
        value = { dozens: 50, hundreds: 500, thousands: 5000, millions: 1000000 }[wn[1]];
        unit = wn[2].replace(/s$/, "").replace("e-mail", "email");
        period = (t.match(/\b(?:per|a|each|every)\s*(day|week|month|year|hour)\b/) || [null, "month"])[1];
        why = "from “" + wn[0].trim().replace(/\s+/g, " ") + "” (assumed per " + period + ")";
      } else {
        // bare rate not adjacent to the noun, e.g. "…support tickets…, 5000/month".
        var nm0 = t.match(new RegExp("\\b(" + EVENT_NOUNS + ")\\b"));
        var br = t.match(/([\d][\d,\.]*)\s*(k|thousand|million|m)?(?![a-z])\s*(?:per|\/|a |each |every )\s*(day|week|month|quarter|year|hour)/);
        if (nm0 && br) {
          value = parseCount(br[1], br[2]);
          unit = nm0[1].replace(/s$/, "").replace("e-mail", "email");
          period = br[3];
          why = "from “" + br[0].trim() + "” (" + unit + "s)";
        } else {
          // find the most likely event noun for labelling even without a number
          unit = nm0 ? nm0[1].replace(/s$/, "").replace("e-mail", "email") : "event";
          return { value: 500, unit: unit, why: "default assumption (per month)" };
        }
      }
    }
    var toMonth = { hour: 730, day: 30, week: 4.33, month: 1, quarter: 1 / 3, year: 1 / 12 };
    var mult = toMonth[period] != null ? toMonth[period] : 1;
    return { value: Math.max(1, Math.round(value * mult)), unit: unit, why: why };
  }

  // ── Quick build-step catalog ──────────────────────────────────────────────
  // Each detector maps description language to a concrete Studio build step.
  // category drives how the step is counted for cost + sizing:
  //   answer_gen · action · content · ai · flow
  var STEP_CATALOG = [
    { id: "classify", category: "answer_gen",
      label: "Classify / categorize the item",
      build: "A generative answer (or prompt tool) reads the item and assigns a category, priority, or intent.",
      kws: [/\bcategori[sz]/, /\bclassif/, /\btag(s|ged|ging)?\b/, /\blabel(s|led|ling)?\b/, /\btriage/, /\bsort(s|ing)? (into|by|the)/, /\bidentif(y|ies) (the )?(type|category|intent|topic)/, /\bdetermine (the )?(type|category|priority|intent)/, /\bprioriti[sz]/] },
    { id: "answer", category: "answer_gen",
      label: "Answer questions from your content",
      build: "Generative answers grounded on your knowledge (SearchAndSummarizeContent).",
      kws: [/\banswer/, /\bquestion/, /\bfaq/, /\bask(s|ed|ing)?\b/, /\bexplain/, /\bguidance/, /\bhelp (with|me|employees|users|customers|staff|resolve|answer)/, /\brespond to/, /\binquir/, /\bclarif/, /\bwhat (is|are|does)/, /\bhow (do|to|can)/, /\bq ?& ?a\b/, /\bself[- ]serve/] },
    { id: "route", category: "action",
      label: "Route / assign to the right owner",
      build: "A connector action routes or assigns the item to the correct queue, team, or person.",
      kws: [/\broutes?\b/, /\brouting/, /\bassign/, /\bforward/, /\bdispatch/, /\bhand(s|ed)? ?off/, /\bhand(s|ed)? it (to|over)/, /\bdirect(s|ed)? (it|them|the) to/, /\bdeliver(s|ed)? (it|them|the) to/, /\bsend(s|ing)? (it|them|the) to (the )?(right|correct|appropriate|relevant)/] },
    { id: "create", category: "action",
      label: "Create a record (ticket / case / order)",
      build: "A connector action writes a record — ServiceNow, Salesforce, Dynamics, Jira, SAP, etc.",
      kws: [/\bcreates? (a|an)? ?(ticket|case|record|incident|request|order|entry|item|lead)/, /\bopens? (a|an)? ?(ticket|case|incident|request|record)/, /\blogs? (a|an)? ?(case|ticket|request)/, /\braises? (a|an)? ?(ticket|request)/, /\bfiles? (a|an)? ?(ticket|case|claim)/, /\bplac(?:e|es|ing) (an? )?order/, /\bgenerates? (a|an)? ?(ticket|case|record|order|incident)/] },
    { id: "update", category: "action",
      label: "Look up / update a record",
      build: "A connector action reads or updates a record in a line-of-business system.",
      kws: [/\bupdate(s|d)?\b/, /\blooks? ?up/, /\bretriev/, /\bfetch/, /\bgets? (the )?(status|details|record|data|info)/, /\bchecks? (the )?(status|inventory|stock|availability|balance|account|order|details|record)/, /\bpulls? (the )?(record|data|details)/, /\bmodif(y|ies)/, /\bsets? (the )?status/, /\bcross[- ]?reference/, /\bverif(y|ies)/, /\bvalidat(e|es|ing|ion)/, /\breconcil(e|es|ing|iation)/, /\bconfirm(s|ed|ing)?\b/, /\bflag(s|ged|ging)?\b/] },
    { id: "notify", category: "action",
      label: "Send a notification / email",
      build: "A connector action sends an email, Teams message, or notification.",
      kws: [/\bnotif(y|ies|ication)/, /\bsend(s|ing)? (an? )?(email|e-?mail|message|reply|notification|alert|summary|confirmation|response|acknowledg|note|update)/, /\bemail(s)? (the|them|back|to|it)/, /\breplies?\b/, /\bpost(s|ing)? (to|a|in) (teams|slack|channel)/, /\balert(s)? (the|them|when)/, /\backnowledg/] },
    { id: "provision", category: "action",
      label: "Perform a system action (reset / provision / book)",
      build: "A connector action performs an operation — reset password, provision access, book, cancel.",
      kws: [/\breset (the )?password/, /\bprovision/, /\bgrant (access|permission)/, /\bbook(ing|s)?\b/, /\bcancel/, /\breschedul/, /\bunlock/, /\bonboard/] },
    { id: "extract", category: "content",
      label: "Extract data from documents",
      build: "Content-processing / prompt tools extract and validate fields — ~8 credits per page.",
      kws: [/\binvoice/, /\breceipt/, /\bextract (from|data|fields|the)/, /\bocr\b/, /\bscanned (document|form|image)/, /\bread the document/, /\bfields? from/, /\bprocess forms?/, /\bcontract (review|analysis)/, /\bparse (the )?(document|pdf|invoice|form)/] },
    { id: "draft", category: "ai",
      label: "Generate / draft content",
      build: "A prompt (GPT) tool drafts, rewrites, translates, or summarizes text.",
      kws: [/\bdraft/, /\bwrite (a|an|up|me)/, /\bcompose/, /\brewrite/, /\btranslate/, /\bsummari[sz]e/, /\bbrainstorm/, /\bgenerate (a|an|content|text|copy|summary|response)/, /\bproposal/, /\bmarketing copy/] },
    { id: "approve", category: "flow",
      label: "Run an approval / multi-step flow",
      build: "An agent flow (Power Automate) runs a multi-step approval or automated sequence.",
      kws: [/\bapprovals?\b/, /\bapprove/, /\bmulti[- ]step/, /\bworkflow/, /\bpipeline/, /\bautomat(e|es|ed|ion) (the )?(process|steps|sequence)/, /\bkick off (a )?(process|flow)/, /\bsign[- ]?off/] }
  ];

  var SYSTEM_PATTERNS = [
    [/servicenow/, "ServiceNow"], [/salesforce|\bsfdc\b/, "Salesforce"], [/dynamics|\bd365\b/, "Dynamics 365"],
    [/\bsap\b/, "SAP"], [/\bjira\b/, "Jira"], [/workday/, "Workday"], [/zendesk/, "Zendesk"],
    [/oracle/, "Oracle"], [/\bsql\b|database/, "database"], [/sharepoint/, "SharePoint"],
    [/outlook|exchange|\bmail\b|inbox/, "Outlook / Exchange"], [/\bteams\b/, "Teams"],
    [/power ?bi/, "Power BI"], [/\bcrm\b/, "CRM"], [/\berp\b/, "ERP"], [/confluence/, "Confluence"]
  ];
  function detectSystems(t) {
    var found = [];
    SYSTEM_PATTERNS.forEach(function (p) { if (p[0].test(t) && found.indexOf(p[1]) < 0) found.push(p[1]); });
    return found;
  }
  function detectKnowledge(t) {
    if (/\b(microsoft 365|m365|tenant graph|across (the|our) tenant|org chart|employee directory|people data|teams messages|their (emails?|calendar)|enterprise data|company data across)\b/.test(t))
      return { type: "tenantGraph", label: "Microsoft 365 tenant graph", why: "M365 tenant data referenced" };
    if (/\b(document|polic(y|ies)|knowledge ?base|sharepoint|pdf|manual|handbook|wiki|articles?|our files|internal docs?|procedure|guideline|knowledge|catalog|product (docs|info|details|manuals?))\b/.test(t))
      return { type: "docs", label: "Documents / knowledge base", why: "document knowledge referenced" };
    return { type: "none", label: "None", why: "no knowledge source detected" };
  }
  function extractSteps(t) {
    var steps = [];
    STEP_CATALOG.forEach(function (s) {
      if (s.kws.some(function (re) { return re.test(t); })) steps.push(s);
    });
    return steps;
  }

  function row(key, name, uses, credits, note) {
    return { key: key, name: name, uses: uses, credits: credits, note: note };
  }

  // Build the per-unit credit profile from the (editable) variables.
  function deriveQuick(v) {
    var profile = [];
    var auto = v.archetype === "autonomous";
    var actionsCount = Math.max(0, v.actionsCount || 0);
    var genAnswers = Math.max(0, v.genAnswers || 0);

    if (v.channel === "voice") {
      profile.push(row("voiceStandard", ROW.voiceStandard, 1, CREDIT.voiceStandard, "voice turn (generative orchestration)"));
    } else if (!auto) {
      if (v.answerType === "generative")
        profile.push(row("generative", ROW.generative, Math.max(1, genAnswers), CREDIT.generative, "generative answer"));
      else
        profile.push(row("classic", ROW.classic, 1, CREDIT.classic, "classic answer"));
    } else if (genAnswers > 0) {
      profile.push(row("generative", ROW.generative, genAnswers, CREDIT.generative, genAnswers + " generative step(s)"));
    }

    if (v.knowledge === "tenantGraph")
      profile.push(row("tenantGraph", ROW.tenantGraph, 1, CREDIT.tenantGraph, "tenant-graph grounding"));

    var actionUses = (auto ? 1 : 0) + actionsCount;
    if (actionUses > 0)
      profile.push(row("action", ROW.action, actionUses, CREDIT.action,
        actionUses + " agent action(s)" + (auto ? " incl. autonomous trigger" : "")));

    if (v.hasContent)
      profile.push(row("content", ROW.content, Math.max(1, v.pagesPerDoc || 1), CREDIT.contentPage, "document processing (per page)"));
    if (v.hasAI)
      profile.push(row("aiStandard", ROW.aiStandard, 1, CREDIT.aiStandard, "generative content tool"));
    if (v.hasFlow)
      profile.push(row("flow", ROW.flow, Math.max(1, v.flowActionsPerRun || 5), CREDIT.flowAction, "agent flow actions"));

    return profile;
  }

  function analyzeText(raw) {
    var t = " " + String(raw || "").toLowerCase() + " ";
    var steps = extractSteps(t);
    var systems = detectSystems(t);
    var know = detectKnowledge(t);
    var autonomous = detectArchetype(t);
    autonomous = autonomous === "autonomous";
    var voice = VOICE_RE.test(t);
    var hasEscalation = /\b(escalat|human (agent|being|rep)|live (agent|person|rep)|hand ?off to (a|an|the)? ?(human|agent|person)|transfer to (a|an|the)|speak to (a|someone|an agent)|real person)\b/.test(t);

    var actionsCount = steps.filter(function (s) { return s.category === "action"; }).length;
    var answerGenSteps = steps.filter(function (s) { return s.category === "answer_gen"; }).length;
    var hasContent = steps.some(function (s) { return s.category === "content"; });
    var hasAI = steps.some(function (s) { return s.category === "ai"; });
    var hasFlow = steps.some(function (s) { return s.category === "flow"; });

    var orchestration = (autonomous || actionsCount >= 1 || hasFlow || steps.length >= 2 ||
      /\b(decide(s)? which|figure out|reason (over|about|through)|autonomous|intelligently|depending on|complex requests?|multiple systems|which (tool|system|action))\b/.test(t))
      ? "generative" : "classic";
    var answerType = (know.type !== "none" || answerGenSteps > 0 || hasAI || orchestration === "generative")
      ? "generative" : "classic";

    var systemsCount = systems.length || (actionsCount > 0 ? 1 : 0);
    var genAnswers = autonomous ? answerGenSteps : Math.max(answerGenSteps, 1);

    var v = {
      archetype: autonomous ? "autonomous" : "interactive",
      channel: voice ? "voice" : "chat",
      orchestration: orchestration,
      answerType: answerType,
      knowledge: know.type,
      actionsCount: actionsCount,
      systemsCount: systemsCount,
      genAnswers: genAnswers,
      hasContent: hasContent, hasAI: hasAI, hasFlow: hasFlow,
      hasEscalation: hasEscalation, escalation: hasEscalation ? 15 : 0,
      escalationCredits: hasEscalation ? CREDIT.action : 0,
      pagesPerDoc: 1, flowActionsPerRun: 5
    };

    // Volume — regime-specific.
    var why = { knowledge: know.why };
    if (autonomous) {
      var ev = detectEventVolume(t);
      v.events = ev.value; v.eventUnit = ev.unit;
      v.deployment = "standalone"; v.licensePct = 0;
      why.volume = ev.why;
    } else {
      var users = detectUsers(t), interactions = detectInteractions(t), deploy = detectDeployment(t);
      v.users = users.value; v.interactions = interactions.value;
      v.deployment = deploy.value; v.licensePct = deploy.value === "embedded" ? 60 : 0;
      why.users = users.why; why.interactions = interactions.why; why.deployment = deploy.why;
    }

    var profile = deriveQuick(v);
    var sizing = sizeFromDrivers(v);
    var estimate = computeQuick(profile, v);

    // Build outline (qualitative "how it would be built").
    var outline = {
      archetype: v.archetype,
      trigger: autonomous
        ? { label: "Autonomous trigger — fires on each new " + (v.eventUnit || "event"),
            note: "Billed as an agent action every run, regardless of user licensing." }
        : { label: "User message" + (voice ? " (voice channel)" : " (chat)"),
            note: "A person starts each conversation." },
      channel: voice ? "Voice / phone" : "Chat",
      orchestration: orchestration === "generative" ? "Generative orchestration" : "Classic (topic) orchestration",
      knowledge: know.label,
      steps: steps.map(function (s) { return { id: s.id, label: s.label, build: s.build, category: s.category }; }),
      systems: systems
    };
    if (hasEscalation) outline.steps.push({ id: "escalation", label: "Escalate to a human", build: "An escalation topic hands off to a live agent (Teams / Omnichannel).", category: "action" });
    if (outline.steps.length === 0) {
      outline.steps.push(autonomous
        ? { id: "process", label: "Process the incoming " + (v.eventUnit || "item"), build: "The agent reads each event and acts on it with generative orchestration.", category: "answer_gen" }
        : { id: "respond", label: "Answer / respond to the user", build: "A " + (answerType === "generative" ? "generative answer" : "classic topic") + " handles each request.", category: "answer_gen" });
    }

    return {
      vars: v, outline: outline, profile: profile,
      perUnit: perInteractionCredits(profile),
      size: sizing.size, sizeDrivers: sizing.drivers, sizeInfo: SIZE_INFO[sizing.size],
      estimate: estimate, why: why
    };
  }

  // ── Solution-package analysis (Complex mode) ──────────────────────────────
  function countAll(text, re) { var m = text.match(re); return m ? m.length : 0; }

  function analyzeSolution(files) {
    var texts = files.map(function (f) { return f.text || ""; });
    var all = texts.join("\n");
    var names = files.map(function (f) { return (f.name || "").toLowerCase(); });

    var topics = countAll(all, /kind:\s*AdaptiveDialog/gi);
    var triggers = countAll(all, /kind:\s*On(RecognizedIntent|UnknownIntent|ConversationStart|EventActivity|DialogEvent|KnowledgeRequested|Activity|ToolSelected)/gi);
    var genAnswers = countAll(all, /SearchAndSummarizeContent/gi);
    var knowledgeSearch = countAll(all, /SearchKnowledgeSources/gi);
    var knowledgeComps = countAll(all, /KnowledgeSourceComponent/gi);
    var actionNodes = countAll(all, /(InvokeConnectorAction|InvokeConnectorTaskAction|HttpRequestAction|InvokeExternalAgentTaskAction|InvokeConnectedAgentTaskAction|InvokeComputerUseAction)\b/gi);
    var flowNodes = countAll(all, /InvokeFlowAction/gi);
    var workflowFiles = names.filter(function (n) { return /(^|\/)workflows?\/.+\.json$/.test(n) || /workflow[^\/]*\.json$/.test(n); }).length;
    var aiNodes = countAll(all, /(GptComponent|InvokeAIBuilderModelAction|PromptDialog)/gi);
    var connectionRefs = names.filter(function (n) { return /connectionreference/.test(n); }).length
      || countAll(all, /connectionreference/gi);
    var computerUse = /InvokeComputerUseAction/i.test(all);
    var voice = /(telephony|\bdtmf\b|speechrecognizer|azure ?speech|contact ?cent(er|re)|"?enableVoice"?\s*:\s*true|voiceConfiguration)/i.test(all);
    var tenantGraph = /(graphgrounding|tenant ?graph|enterprise ?search|graph ?connector|sharepointonlinesearch|m365 ?index|microsoftgraph)/i.test(all);
    var genOrch = /(generativeactionsenabled|generative ?orchestration|"?orchestration"?\s*:\s*"?generative|generativemodeenabled|"?aIGenerativeMode)/i.test(all);
    var contentProc = /(prebuilt.*document|documentprocessing|invoiceprocessing|receiptprocessing|content ?understanding|documentextraction)/i.test(all);

    var knowledgeTypes = {};
    if (/sharepoint/i.test(all)) knowledgeTypes.SharePoint = true;
    if (/(publicwebsource|websource|public ?website|"?url"?\s*:)/i.test(all) && /knowledge/i.test(all)) knowledgeTypes.Website = true;
    if (/dataversesearch|dataverse ?search|msdyn_/i.test(all)) knowledgeTypes.Dataverse = true;
    if (/fileknowledge|fileattachment|uploaded ?file|documentknowledge/i.test(all)) knowledgeTypes.Files = true;

    var knowledgeCount = knowledgeComps || knowledgeSearch || Object.keys(knowledgeTypes).length;
    var isGenerative = genAnswers > 0 || genOrch;

    // Build a per-interaction credit profile (uses are tunable assumptions).
    var profile = [];
    if (voice) {
      profile.push({ key: "voiceStandard", name: ROW.voiceStandard, uses: 1, credits: CREDIT.voiceStandard, note: "voice channel detected" });
    } else if (isGenerative) {
      profile.push({ key: "generative", name: ROW.generative, uses: 1, credits: CREDIT.generative, note: genAnswers + " generative-answer node(s)" });
    } else {
      profile.push({ key: "classic", name: ROW.classic, uses: 1, credits: CREDIT.classic, note: "no generative-answer nodes found" });
    }
    if (tenantGraph) profile.push({ key: "tenantGraph", name: ROW.tenantGraph, uses: 1, credits: CREDIT.tenantGraph, note: "tenant-graph grounding" });
    if (actionNodes > 0) profile.push({ key: "action", name: ROW.action, uses: 1, credits: CREDIT.action, note: actionNodes + " action node(s) defined" });
    if (flowNodes > 0 || workflowFiles > 0) profile.push({ key: "flow", name: ROW.flow, uses: 5, credits: CREDIT.flowAction, note: (flowNodes + workflowFiles) + " flow(s)" });
    if (contentProc) profile.push({ key: "content", name: ROW.content, uses: 1, credits: CREDIT.contentPage, note: "document processing" });
    if (aiNodes > 0) profile.push({ key: "aiStandard", name: ROW.aiStandard, uses: 1, credits: CREDIT.aiStandard, note: aiNodes + " prompt/AI node(s)" });

    // Complexity score → t-shirt.
    var score = 1;
    if (isGenerative) score += 1;
    if (knowledgeCount > 0) score += 1;
    if (tenantGraph) score += 2;
    if (actionNodes > 0) score += Math.min(3, actionNodes);
    if (flowNodes > 0 || workflowFiles > 0) score += 2;
    if (contentProc) score += 2;
    if (aiNodes > 0) score += 1;
    if (topics >= 10) score += 2; else if (topics >= 5) score += 1;
    if (genOrch) score += 1;
    if (computerUse) score += 2;
    var tshirt = sizeForScore(score, { voice: voice, users: 0 });

    var findings = {
      topics: topics, triggers: triggers, genAnswers: genAnswers,
      knowledgeSearch: knowledgeSearch, knowledgeComps: knowledgeComps,
      knowledgeTypes: Object.keys(knowledgeTypes), knowledgeCount: knowledgeCount,
      actionNodes: actionNodes, flowNodes: flowNodes, workflowFiles: workflowFiles,
      aiNodes: aiNodes, connectionRefs: connectionRefs, computerUse: computerUse,
      voice: voice, tenantGraph: tenantGraph, genOrch: genOrch, contentProc: contentProc,
      isGenerative: isGenerative, fileCount: files.length
    };
    return { findings: findings, profile: profile, score: score, tshirt: tshirt };
  }

  var api = {
    CREDIT: CREDIT, RATE_PAYG: RATE_PAYG, RATE_PREPAID: RATE_PREPAID, ROW: ROW,
    SIZE_INFO: SIZE_INFO, SIZE_ORDER: SIZE_ORDER, sizeForScore: sizeForScore, sizeFromDrivers: sizeFromDrivers,
    perInteractionCredits: perInteractionCredits, billedUsers: billedUsers,
    computeEstimate: computeEstimate, computeQuick: computeQuick, creditRange: creditRange, costUSD: costUSD,
    detectUsers: detectUsers, detectInteractions: detectInteractions, detectDeployment: detectDeployment,
    detectEventVolume: detectEventVolume, detectArchetype: detectArchetype,
    detectKnowledge: detectKnowledge, detectSystems: detectSystems,
    extractSteps: extractSteps, deriveQuick: deriveQuick,
    STEP_CATALOG: STEP_CATALOG, analyzeText: analyzeText, analyzeSolution: analyzeSolution
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.EstimatorCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

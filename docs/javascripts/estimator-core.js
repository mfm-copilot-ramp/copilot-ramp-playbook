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
  var SIZE_INFO = {
    XS: { label: "XS", name: "Extra small",
      desc: "A single-purpose Q&A agent — one knowledge source, no actions.",
      effort: "Hours to stand up. One maker, no pro-dev.",
      govern: "Minimal — publish and monitor occasionally." },
    S: { label: "S", name: "Small",
      desc: "Grounded Q&A with a couple of topics; maybe one lookup.",
      effort: "A few days. One maker.",
      govern: "Light — a shared environment and basic analytics." },
    M: { label: "M", name: "Medium",
      desc: "Grounded answers plus real actions/flows into 1–2 systems.",
      effort: "1–3 weeks. Maker + occasional pro-dev for connectors.",
      govern: "Moderate — ALM, connection references, DLP review." },
    L: { label: "L", name: "Large",
      desc: "Multi-system actions, workflows, generative orchestration.",
      effort: "1–2 months. Maker + pro-dev + reviewer.",
      govern: "Serious — managed solutions, environments, monitoring, DLP." },
    XL: { label: "XL", name: "Extra large",
      desc: "Voice, tenant-graph grounding, many actions, high volume.",
      effort: "Multi-month program with a dedicated team.",
      govern: "Full ALM, security review, capacity planning, SRE-style ops." }
  };
  function sizeForScore(score, opts) {
    opts = opts || {};
    var s = score <= 1 ? "XS" : score <= 3 ? "S" : score <= 6 ? "M" : score <= 9 ? "L" : "XL";
    if (opts.voice) { if (s === "XS" || s === "S" || s === "M") s = "L"; }
    if (opts.users >= 10000 && s !== "XL") {
      s = ({ XS: "S", S: "M", M: "L", L: "XL", XL: "XL" })[s];
    }
    return s;
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
    if (/\b(monthly|once a month|occasional|occasionally|rarely|now and then|infrequent|seldom)\b/.test(t)) return { value: 1, why: "occasional use" };
    return { value: 10, why: "default assumption" };
  }
  function detectDeployment(t) {
    if (/\b(public|customer[- ]facing|external|website|web ?site|web ?widget|web ?chat|portal|anonymous|visitors?|callers?|the public|consumers?)\b/.test(t))
      return { value: "standalone", why: "public / external audience" };
    if (/\b(teams|microsoft 365|m365|intranet|internal|employees|staff|colleagues|our people)\b/.test(t))
      return { value: "embedded", why: "internal Teams / M365 audience" };
    return { value: "embedded", why: "default assumption" };
  }

  // ── Quick capability catalog ──────────────────────────────────────────────
  // build = how it's realised in Studio; row = per-interaction credit contribution.
  var QUICK_CAPS = [
    { id: "gen_answer", label: "Answer questions from your content",
      build: "Generative answers grounded on your knowledge (SearchAndSummarizeContent).",
      row: { key: "generative", match: ROW.generative, uses: 1, credits: CREDIT.generative },
      weight: 1,
      kws: [/\banswer/, /\bquestion/, /\bfaq/, /\bask(s|ed|ing)?\b/, /\bexplain/, /\bguidance/, /\bhelp (with|me|employees|users|customers|staff)/, /\brespond/, /\binquir/, /\blook ?up/, /\bclarif/, /\bwhat (is|are|does)/, /\bhow (do|to|can)/, /\bq ?& ?a\b/, /\bself[- ]serve/] },
    { id: "knowledge", label: "Search internal documents / knowledge base",
      build: "Add knowledge sources (SharePoint, files, public website, Dataverse) and Search & Summarize.",
      weight: 1, forces: "gen_answer",
      kws: [/\bdocument/, /\bpolic(y|ies)/, /\bknowledge ?base/, /\bsharepoint/, /\bpdf/, /\bmanual/, /\bhandbook/, /\bwiki\b/, /\barticle/, /\bour files/, /\binternal doc/, /\bprocedure/, /\bguideline/, /\bknowledge/] },
    { id: "tenant_graph", label: "Ground on Microsoft 365 tenant data",
      build: "Tenant graph grounding pulls M365 data (people, chats, mail, files) — 10 credits per message.",
      row: { key: "tenantGraph", match: ROW.tenantGraph, uses: 1, credits: CREDIT.tenantGraph },
      weight: 2,
      kws: [/\bmicrosoft 365\b/, /\bm365\b/, /\bacross (the|our) tenant/, /\borg chart/, /\bemployee directory/, /\bpeople data/, /\bteams messages/, /\btheir emails?/, /\btheir calendar/, /\bgraph\b/, /\benterprise data/, /\bcompany data across/] },
    { id: "action", label: "Take actions in other systems",
      build: "Call connectors / custom actions (InvokeConnectorAction) to read or write records — ServiceNow, Salesforce, Dynamics, SAP, etc.",
      row: { key: "action", match: ROW.action, uses: 1, credits: CREDIT.action },
      weight: 2,
      kws: [/\bcreate (a|an)? ?(ticket|case|record|incident|request|order)/, /\bopen (a|an)? ?(ticket|case)/, /\blog (a|an)? ?(case|ticket|request)/, /\braise (a|an)? ?(ticket|request)/, /\bupdate\b/, /\bsubmit/, /\bfile (a|an)/, /\breset (the )?password/, /\bprovision/, /\bplace (an )?order/, /\bbook(ing|s)?\b/, /\bservicenow/, /\bsalesforce/, /\bdynamics/, /\bsap\b/, /\bcrm\b/, /\bcheck (the )?status/, /\bcancel/, /\bschedule/, /\bsend (an )?email/, /\bworkday/, /\bjira\b/] },
    { id: "flow", label: "Run multi-step workflows / approvals",
      build: "Use agent flows (Power Automate) for multi-step automation, approvals and routing.",
      row: { key: "flow", match: ROW.flow, uses: 5, credits: CREDIT.flowAction },
      weight: 2,
      kws: [/\bworkflow/, /\bautomat(e|ion)/, /\bapproval/, /\broute (to|the)/, /\bmulti[- ]step/, /\borchestrat/, /\bpipeline/, /\bkick off/, /\btrigger (a|the) (process|flow)/, /\bnotify/, /\bassign (to|it)/, /\bhand ?off/] },
    { id: "content", label: "Extract data from documents",
      build: "Content processing / prompt tools extract and classify document data — ~8 credits per page.",
      row: { key: "content", match: ROW.content, uses: 1, credits: CREDIT.contentPage },
      weight: 2,
      kws: [/\binvoice/, /\breceipt/, /\bextract (from|data|fields)/, /\bparse/, /\bocr\b/, /\bscanned/, /\bread the document/, /\bfields? from/, /\bprocess forms?/, /\bclassify (the )?document/, /\bcontract (review|analysis)/, /\bstatements?\b/] },
    { id: "gen_tool", label: "Generate / draft content",
      build: "A prompt (GPT) tool drafts and rewrites text — standard generation ~1.5 credits per 10 responses.",
      row: { key: "aiStandard", match: ROW.aiStandard, uses: 1, credits: CREDIT.aiStandard },
      weight: 1,
      kws: [/\bdraft/, /\bwrite (a|an|up|me)/, /\bcompose/, /\brewrite/, /\btranslate/, /\bsummari[sz]e/, /\bbrainstorm/, /\bgenerate (a|an|content|text|copy)/, /\bproposal/, /\bemail draft/, /\bmarketing copy/, /\bcreate content/] },
    { id: "voice", label: "Voice / phone channel",
      build: "Voice channel with generative orchestration — high per-turn cost (35 credits standard, 75 real-time).",
      row: { key: "voiceStandard", match: ROW.voiceStandard, uses: 1, credits: CREDIT.voiceStandard },
      weight: 3,
      kws: [/\bvoice\b/, /\bcall ?cent(er|re)/, /\bcontact ?cent(er|re)/, /\bphone/, /\bivr\b/, /\btelephony/, /\bspoken/, /\bspeech/, /\bhotline/, /\bover the phone/] },
    { id: "orchestration", label: "Agent decides which tools to use",
      build: "Generative orchestration lets the agent choose topics/tools dynamically (vs classic routing).",
      weight: 2,
      kws: [/\bautonomous/, /\bdecide(s)? which/, /\bfigure out/, /\breason (over|about|through)/, /\bchoose(s)?\b/, /\bmultiple systems/, /\bdepending on/, /\bcomplex requests/, /\bintelligently/] },
    { id: "escalation", label: "Escalate to a human",
      build: "An escalation topic hands off to a live agent (Teams, Omnichannel).",
      weight: 1, escalation: 15,
      kws: [/\bescalat/, /\bhuman (agent|being|rep)/, /\blive (agent|person|rep)/, /\bhand ?off to/, /\btransfer to (a|an|the)/, /\bspeak to (a|someone|an agent)/, /\breal person/] }
  ];

  function analyzeText(raw) {
    var t = " " + String(raw || "").toLowerCase() + " ";
    var matched = [];
    var byId = {};
    QUICK_CAPS.forEach(function (cap) {
      var hit = cap.kws.some(function (re) { return re.test(t); });
      if (hit) { matched.push(cap); byId[cap.id] = true; }
    });
    // knowledge implies a generative answer even if phrasing didn't trigger gen_answer
    matched.forEach(function (cap) {
      if (cap.forces && !byId[cap.forces]) {
        var forced = QUICK_CAPS.filter(function (c) { return c.id === cap.forces; })[0];
        if (forced) { matched.push(forced); byId[forced.id] = true; }
      }
    });
    // Guarantee at least one conversational turn.
    var hasAnswerRow = byId.gen_answer || byId.gen_tool || byId.action;
    var profile = [];
    var seen = {};
    if (!hasAnswerRow) {
      profile.push({ key: "classic", name: ROW.classic, uses: 1, credits: CREDIT.classic });
      seen.classic = true;
    }
    matched.forEach(function (cap) {
      if (!cap.row) return;
      if (seen[cap.row.key]) return;
      seen[cap.row.key] = true;
      profile.push({ key: cap.row.key, name: cap.row.match, uses: cap.row.uses, credits: cap.row.credits });
    });

    var users = detectUsers(t), interactions = detectInteractions(t), deploy = detectDeployment(t);
    var licensePct = deploy.value === "embedded" ? 60 : 0;
    var scale = {
      users: users.value, interactions: interactions.value,
      deployment: deploy.value, licensePct: licensePct
    };

    var score = matched.reduce(function (s, c) { return s + (c.weight || 0); }, 0);
    if (scale.users >= 10000) score += 2; else if (scale.users >= 2000) score += 1;
    var escalation = 0;
    matched.forEach(function (c) { if (c.escalation) escalation = Math.max(escalation, c.escalation); });
    var tshirt = sizeForScore(score, { voice: !!byId.voice, users: scale.users });

    return {
      matched: matched, profile: profile, scale: scale,
      score: score, tshirt: tshirt, escalation: escalation,
      scaleWhy: { users: users.why, interactions: interactions.why, deployment: deploy.why },
      estimate: computeEstimate(profile, scale)
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
    SIZE_INFO: SIZE_INFO, sizeForScore: sizeForScore,
    perInteractionCredits: perInteractionCredits, billedUsers: billedUsers,
    computeEstimate: computeEstimate, creditRange: creditRange, costUSD: costUSD,
    detectUsers: detectUsers, detectInteractions: detectInteractions, detectDeployment: detectDeployment,
    QUICK_CAPS: QUICK_CAPS, analyzeText: analyzeText, analyzeSolution: analyzeSolution
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.EstimatorCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

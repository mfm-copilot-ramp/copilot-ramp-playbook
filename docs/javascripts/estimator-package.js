/* Copilot Credit Estimator — Quick-mode solution-package (.zip) builder.
 *
 * Generates a downloadable, importable Copilot Studio UNMANAGED solution from a
 * plain-English agent description: a baseline agent (instructions + generative
 * orchestration), any knowledge sources, the 12 standard system topics, and
 * wired connector actions with connection references that bind at import.
 *
 * This is the WRITER counterpart to estimator-zip.js (the reader). Everything is
 * dependency-free and runs client-side. It does NOT touch estimator-core.js,
 * credit rates, or any calculation — it only consumes the Quick analysis output.
 *
 * The ZIP is written with the STORE method (no compression) so the writer stays
 * tiny and verifiable; import tooling accepts stored entries. Layout mirrors a
 * verified real Copilot Studio unmanaged export.
 */
(function (root) {
  "use strict";

  // ── UTF-8 encode (TextEncoder with a manual fallback) ─────────────────────
  function utf8(str) {
    if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(str);
    var s = String(str), out = [], i, c, c2, cp;
    for (i = 0; i < s.length; i++) {
      c = s.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      else if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) {
        c2 = s.charCodeAt(++i);
        cp = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
      } else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
    return new Uint8Array(out);
  }

  // ── CRC-32 ────────────────────────────────────────────────────────────────
  var CRC_TABLE = (function () {
    var t = new Array(256), n, k, c;
    for (n = 0; n < 256; n++) {
      c = n;
      for (k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes) {
    var c = 0xffffffff, i;
    for (i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  // ── Minimal STORE (no-compression) ZIP writer ─────────────────────────────
  // entries: [{ name, data(String|Uint8Array) }] -> Uint8Array of a valid .zip.
  function zipStore(entries) {
    var enc = entries.map(function (e) {
      var data = (e.data instanceof Uint8Array) ? e.data : utf8(String(e.data == null ? "" : e.data));
      return { nameBytes: utf8(e.name), data: data, crc: crc32(data) };
    });
    var DOSTIME = 0, DOSDATE = 0x21;      // 1980-01-01 (fixed, deterministic)
    var chunks = [], central = [], offset = 0;

    enc.forEach(function (e) {
      var lh = new Uint8Array(30 + e.nameBytes.length);
      var dv = new DataView(lh.buffer);
      dv.setUint32(0, 0x04034b50, true);  // local file header signature
      dv.setUint16(4, 20, true);          // version needed
      dv.setUint16(6, 0x0800, true);      // flags: UTF-8 filename
      dv.setUint16(8, 0, true);           // method: store
      dv.setUint16(10, DOSTIME, true);
      dv.setUint16(12, DOSDATE, true);
      dv.setUint32(14, e.crc, true);
      dv.setUint32(18, e.data.length, true);
      dv.setUint32(22, e.data.length, true);
      dv.setUint16(26, e.nameBytes.length, true);
      dv.setUint16(28, 0, true);          // extra length
      lh.set(e.nameBytes, 30);
      chunks.push(lh, e.data);

      var ch = new Uint8Array(46 + e.nameBytes.length);
      var cd = new DataView(ch.buffer);
      cd.setUint32(0, 0x02014b50, true);  // central directory signature
      cd.setUint16(4, 20, true);          // version made by
      cd.setUint16(6, 20, true);          // version needed
      cd.setUint16(8, 0x0800, true);      // flags: UTF-8
      cd.setUint16(10, 0, true);          // method: store
      cd.setUint16(12, DOSTIME, true);
      cd.setUint16(14, DOSDATE, true);
      cd.setUint32(16, e.crc, true);
      cd.setUint32(20, e.data.length, true);
      cd.setUint32(24, e.data.length, true);
      cd.setUint16(28, e.nameBytes.length, true);
      cd.setUint16(30, 0, true);          // extra length
      cd.setUint16(32, 0, true);          // comment length
      cd.setUint16(34, 0, true);          // disk number
      cd.setUint16(36, 0, true);          // internal attrs
      cd.setUint32(38, 0, true);          // external attrs
      cd.setUint32(42, offset, true);     // local header offset
      ch.set(e.nameBytes, 46);
      central.push(ch);
      offset += lh.length + e.data.length;
    });

    var centralStart = offset, centralSize = 0;
    central.forEach(function (c) { chunks.push(c); centralSize += c.length; });

    var eocd = new Uint8Array(22);
    var ed = new DataView(eocd.buffer);
    ed.setUint32(0, 0x06054b50, true);    // end of central directory signature
    ed.setUint16(4, 0, true);             // disk number
    ed.setUint16(6, 0, true);             // cd start disk
    ed.setUint16(8, enc.length, true);    // entries on disk
    ed.setUint16(10, enc.length, true);   // total entries
    ed.setUint32(12, centralSize, true);
    ed.setUint32(16, centralStart, true);
    ed.setUint16(20, 0, true);            // comment length
    chunks.push(eocd);

    var total = chunks.reduce(function (n, c) { return n + c.length; }, 0);
    var out = new Uint8Array(total), p = 0;
    chunks.forEach(function (c) { out.set(c, p); p += c.length; });
    return out;
  }

  // ── Small string helpers ──────────────────────────────────────────────────
  function pad(n) { return n > 0 ? new Array(n + 1).join(" ") : ""; }
  function xmlEsc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function titleCase(s) {
    return String(s).toLowerCase().replace(/\b([a-z])/g, function (m, c) { return c.toUpperCase(); }).trim();
  }
  function slugify(name) {
    var s = String(name || "").replace(/[^A-Za-z0-9]+/g, "");
    if (!s) s = "CustomAgent";
    if (!/^[A-Za-z]/.test(s)) s = "A" + s;
    return s.slice(0, 40);
  }
  // Title-case a derived name while preserving all-caps acronyms typed by the user
  // (HR, IT, CRM, D365) so "an HR onboarding assistant" -> "HR Onboarding Assistant".
  function properName(s) {
    return String(s || "").trim().split(/\s+/).map(function (w) {
      if (/[A-Z]/.test(w) && /^[A-Z0-9&/.\-]{2,6}$/.test(w)) return w; // keep acronyms as typed
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join(" ");
  }
  function deriveName(desc) {
    var d = String(desc || "").trim();
    if (!d) return "Custom Agent";
    // Drop a leading imperative/builder phrase ("Create an …", "Build a …", "I want an …",
    // "Help me build a …", "Spin up …") so the name is the descriptive part
    // ("Executive Meeting Prep"), not "Create An Executive …".
    d = d.replace(/^\s*(?:please\s+)?(?:help\s+me\s+(?:build|create|make|design|develop|set\s?up|spin\s?up|generate)|create|build|make|design|develop|configure|set\s?up|spin\s?up|generate|we\s+want(?:\s+to\s+build)?|i\s+want(?:\s+to\s+build)?|i\s+need|i'?d\s+like)\s+/i, "");
    d = d.replace(/^(?:a|an|the|our|my)\s+/i, "");
    var m = d.match(/([A-Za-z][A-Za-z0-9 ]{1,38}?)\s+(agent|assistant|bot|copilot)\b/i);
    if (m) {
      var lead = properName(m[1]).replace(/^(?:An?|The|Our|My)\s+/i, "").trim();
      if (lead) return lead + " " + properName(m[2]);
    }
    return "Custom Agent";
  }
  function guid() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  // YAML block scalar: `key: |-` with each line indented indent+2.
  function yamlBlock(key, text, indent) {
    var p2 = pad(indent + 2);
    var lines = String(text).split("\n").map(function (l) { return l.length ? p2 + l : ""; });
    return pad(indent) + key + ": |-\n" + lines.join("\n");
  }

  // ── Connector catalog (verified operationId / display-name pairs) ─────────
  // Only emitted when the description clearly implies the connector. operationIds
  // are NEVER fabricated — unknown systems go to NEXT-STEPS.md instead.
  // `guidanceVerb` is the natural-language phrase the instructions use to point the
  // model at the tool (e.g. "send an email" -> the "Send an email (V2)" tool).
  var CONNECTOR_ACTIONS = {
    office365: {
      connector: "shared_office365", abbrev: "office365",
      operationId: "SendEmailV2", actionSchema: "SendEmailV2",
      actionName: "Send an email (V2)",
      modelDescription: "Send an email through Office 365 Outlook.",
      connectorLabel: "Office 365 Outlook",
      guidanceVerb: "send an email",
      match: /(outlook|exchange|e-?mail|inbox|send (a|an) mail)/,
      systemLabel: "Outlook / Exchange"
    },
    sharepoint: {
      connector: "shared_sharepointonline", abbrev: "sharepointonline",
      operationId: "CreateFile", actionSchema: "CreateFile",
      actionName: "Create file",
      modelDescription: "Create a file in a SharePoint document library.",
      connectorLabel: "SharePoint",
      guidanceVerb: "save a file to SharePoint",
      // action-y language only — bare 'sharepoint' usually means a knowledge source
      match: /(upload|save|store|create|add|put|write).{0,40}(file|document|doc)|(file|document|doc).{0,40}sharepoint|sharepoint.{0,40}(upload|save|store|create|add|put|library|folder)/,
      systemLabel: "SharePoint"
    },
    dataverse: {
      connector: "shared_commondataserviceforapps", abbrev: "commondataserviceforapps",
      operationId: "CreateRecord", actionSchema: "AddANewRow",
      actionName: "Add a new row",
      modelDescription: "Add a new row to a Microsoft Dataverse table.",
      connectorLabel: "Microsoft Dataverse",
      guidanceVerb: "add a row to Dataverse",
      match: /(dataverse|dynamics\s?365|\bd365\b|common data service|\bcds\b|crm record|customer record|create (a )?record|new row)/,
      systemLabel: "Dynamics 365"
    },
    teams: {
      connector: "shared_teams", abbrev: "teams",
      operationId: "PostMessageToConversation", actionSchema: "PostMessage",
      actionName: "Post a message",
      modelDescription: "Post a message to a Microsoft Teams channel or chat.",
      connectorLabel: "Microsoft Teams",
      guidanceVerb: "post a message to Teams",
      // action-y language only — bare 'teams' usually means the deployment channel
      match: /(post|send|notify|alert|message).{0,40}teams.{0,40}(channel|message|chat)?|teams.{0,40}(post|send|notify|alert|channel|message)/,
      systemLabel: "Teams"
    },
    servicenow: {
      // Verified against the Microsoft "ServiceNow" connector (learn.microsoft.com/connectors/service-now).
      connector: "shared_service-now", abbrev: "service-now",
      operationId: "CreateRecord", actionSchema: "CreateRecord",
      actionName: "Create record",
      modelDescription: "Create a record in a ServiceNow table (for example an incident).",
      connectorLabel: "ServiceNow",
      guidanceVerb: "log a record in ServiceNow",
      // anchored on 'servicenow' or incident-creation language, not bare 'ticket'
      match: /service ?now|(create|open|log|raise|submit|file).{0,24}incident|incident.{0,24}(create|open|log|raise|submit|file)/,
      systemLabel: "ServiceNow"
    },
    approvals: {
      connector: "shared_approvals", abbrev: "approvals",
      operationId: "StartAndWaitForAnApproval", actionSchema: "StartAndWaitForAnApproval",
      actionName: "Start and wait for an approval",
      modelDescription: "Start an approval and wait for the outcome.",
      connectorLabel: "Approvals",
      guidanceVerb: "request an approval",
      match: /approval|approve\b|sign-?off|route.{0,20}approv/,
      systemLabel: "Approvals"
    },
    sql: {
      connector: "shared_sql", abbrev: "sql",
      operationId: "PostItem_V2", actionSchema: "PostItemV2",
      actionName: "Insert row (V2)",
      modelDescription: "Insert a row into a SQL Server table.",
      connectorLabel: "SQL Server",
      guidanceVerb: "insert a row in SQL Server",
      // action-y SQL language only — avoid matching a bare 'database' mention
      match: /(insert|add|create|write).{0,24}(row|record).{0,24}(sql|database|table)|sql server.{0,24}(insert|add|row|record)|insert.{0,12}row/,
      systemLabel: "SQL Server"
    }
  };
  var SYSTEM_TO_CONNECTOR = {
    "Outlook / Exchange": "office365", "SharePoint": "sharepoint",
    "Teams": "teams", "Dynamics 365": "dataverse",
    "ServiceNow": "servicenow", "Approvals": "approvals", "SQL Server": "sql"
  };

  // ── Read-capability fidelity (Part 2) ─────────────────────────────────────
  // Common "read/pull" intents that have NO verified connector action in the
  // catalog above (every CONNECTOR_ACTIONS entry is a write). When the description
  // asks the agent to READ one of these, we never fabricate an operationId —
  // instead we (a) describe the behavior in the instructions in prose and (b) add
  // a tool-framed item to NEXT-STEPS.md naming the exact connector tool to add.
  var READ_VERB = /(review|read|summar|triage|check|scan|analy|monitor|gather|pull|look|prepar|prep\b|brief|assess|identif|recommend|understand|surface)/;
  var READ_CAPABILITIES = [
    {
      id: "calendar",
      noun: /(calendar|meetings?|schedule|upcoming (event|appointment|meeting)|agenda)/,
      behavior: "the user's upcoming meetings and calendar",
      tool: "Add an **Office 365 Outlook** \u201cGet calendar events (V4)\u201d tool so the agent can read the user's meetings."
    },
    {
      id: "teamsRead",
      noun: /teams.{0,20}(message|chat|conversation|post)|(message|chat|conversation).{0,12}teams|read.{0,16}teams|summar.{0,16}teams/,
      behavior: "recent Teams messages and chats",
      tool: "Add a **Microsoft Teams** \u201cGet messages\u201d tool so the agent can read recent Teams messages."
    },
    {
      id: "emailRead",
      noun: /(e-?mails?|inbox|mailbox)/,
      behavior: "incoming email",
      tool: "Add an **Office 365 Outlook** \u201cGet emails (V3)\u201d tool so the agent can read incoming email."
    },
    {
      id: "onedrive",
      noun: /(onedrive|one drive)/,
      behavior: "relevant OneDrive files",
      tool: "Add a **OneDrive for Business** \u201cList files in folder\u201d / \u201cGet file content\u201d tool so the agent can read files."
    },
    {
      id: "people",
      noun: /(look ?up|find|search|summar).{0,24}(person|people|colleague|coworker|employee|user|manager|org\b)|who (is|are|reports)|org(anization|anisation)? (info|chart|structure)|stakeholders?/,
      behavior: "people and organizational information",
      tool: "Add an **Office 365 Users** \u201cGet user profile (V2)\u201d / \u201cSearch for users (V2)\u201d tool so the agent can look up people and org info."
    }
  ];
  function detectCapabilities(descLower) {
    if (!READ_VERB.test(descLower)) return [];
    return READ_CAPABILITIES.filter(function (cap) { return cap.noun.test(descLower); });
  }

  // ── Baseline agent instructions (generative orchestration) ────────────────
  // Doctrine: behavior lives in INSTRUCTIONS + TOOLS + KNOWLEDGE, never in
  // authored topics. We emit constraints + response format + guidance, and the
  // guidance references THIS package's real tools (by exact display name) and
  // knowledge. We deliberately avoid "search the knowledge / cite sources"
  // phrasing — the orchestrator retrieves and grounds on its own.
  function firstSentence(desc) {
    var t = String(desc || "").trim().replace(/\s+/g, " ");
    if (!t) return "";
    var end = t.search(/[.!?](\s|$)/);
    return end > 0 ? t.slice(0, end + 1) : t;
  }
  function derivePurpose(desc) {
    var s = firstSentence(desc);
    if (!s) return "Help users with their requests accurately and safely.";
    // strip creation boilerplate ("Create an X agent that …") down to the intent
    s = s.replace(/^\s*(?:please\s+)?(?:create|build|make|design|develop|configure|set\s?up|generate|we\s+want(?:\s+to\s+build)?|i\s+want|i\s+need|i'?d\s+like)\s+/i, "");
    s = s.replace(/^(?:a|an|the|our|my)\s+/i, "");
    s = s.replace(/^.*?\b(agent|bot|assistant|copilot)\b\s+(that|which|to|for|will)\s+/i, "");
    s = s.replace(/\s+/g, " ").trim();
    if (!s) return "Help users with their requests accurately and safely.";
    if (s.length > 220) s = s.slice(0, 217).replace(/\s+\S*$/, "") + "…";
    s = s.charAt(0).toUpperCase() + s.slice(1);
    if (!/[.!?…]$/.test(s)) s += ".";
    return s;
  }
  function deriveDomain(name) {
    var d = String(name || "").replace(/\b(agent|bot|assistant|copilot)\b/ig, "").replace(/\s+/g, " ").trim();
    if (d && d.toLowerCase() !== "custom" && d.length >= 3) return d;
    return "the topics described in your purpose above";
  }
  function knowledgeShort(kind) {
    return knowledgeLabel(kind).replace(/^Knowledge\s*[—-]\s*/, "");
  }
  function joinAnd(arr) {
    arr = (arr || []).filter(Boolean);
    if (arr.length <= 1) return arr.join("");
    if (arr.length === 2) return arr[0] + " and " + arr[1];
    return arr.slice(0, -1).join(", ") + ", and " + arr[arr.length - 1];
  }
  function buildInstructions(name, desc, ctx) {
    ctx = ctx || {};
    var vars = ctx.vars || {};
    var connectors = ctx.connectors || [];
    var knowledge = ctx.knowledge || [];
    var capabilities = ctx.capabilities || [];
    var autonomous = vars.archetype === "autonomous";
    var domain = deriveDomain(name);
    var purpose = derivePurpose(desc);
    var L = [];

    // Role / purpose (one line).
    L.push("You are " + name + ", an AI agent built in Microsoft Copilot Studio. " + purpose);
    L.push("");

    // Constraints (scope guardrail, safety confirm, optional escalation).
    L.push("Constraints");
    L.push("- Only help with " + domain + ". If a request falls outside that, say you can't help with it and point the user to what you can do.");
    L.push("- Confirm with the user before any action that writes data, sends a message, or makes a change.");
    if (vars.hasEscalation) {
      L.push("- Escalate to a human when a request is out of scope, sensitive, or the user asks for a person.");
    }
    L.push("");

    // Response format.
    L.push("Response format");
    L.push("- Be professional, clear, and concise. Lead with the answer, then add only the detail that helps.");
    L.push("");

    // Guidance — references the real tools + knowledge this package emits.
    L.push("Guidance");
    if (autonomous) {
      L.push("- You run automatically when your trigger fires — no one is chatting with you. Complete the task end to end using the tools below, then stop.");
    } else {
      L.push("- Help the user directly; ask a brief clarifying question only when you genuinely can't proceed without one.");
    }
    connectors.forEach(function (c) {
      L.push("- When you need to " + (c.guidanceVerb || ("use " + c.connectorLabel)) + ", use the \"" + c.actionName + "\" tool.");
    });
    if (connectors.length > 1) {
      L.push("- If a request needs more than one tool, use them in a sensible order and confirm before each change.");
    }
    if (knowledge.length) {
      var labels = knowledge.map(function (k) { return knowledgeShort(k.kind); })
        .filter(function (v, i, a) { return a.indexOf(v) === i; }).join(", ");
      L.push("- Use the connected knowledge (" + labels + ") to answer questions about " + domain + ".");
    }
    // Read capabilities the description asks for that have no verified starter action:
    // describe the behavior in prose (do NOT name a /tool the package didn't emit) and
    // point at NEXT-STEPS.md, which lists the exact connector tools to add.
    if (capabilities.length) {
      L.push("- To do this, review " + joinAnd(capabilities.map(function (c) { return c.behavior; })) +
        ". Those read tools aren't wired into this package yet — add them in Copilot Studio (see NEXT-STEPS.md) before relying on that data.");
    }
    return L.join("\n");
  }

  // ── System-topic YAML (minimal, valid AdaptiveDialog) ─────────────────────
  function topicIntent(display, queries, message) {
    return "kind: AdaptiveDialog\n" +
      "beginDialog:\n" +
      "  kind: OnRecognizedIntent\n" +
      "  id: main\n" +
      "  intent:\n" +
      "    displayName: " + display + "\n" +
      "    triggerQueries:\n" +
      queries.map(function (q) { return "      - " + q; }).join("\n") + "\n" +
      "  actions:\n" +
      "    - kind: SendActivity\n" +
      "      id: sendMessage\n" +
      "      activity: \"" + message + "\"\n";
  }
  function topicSystem(triggerKind, message) {
    var actions = message
      ? "  actions:\n    - kind: SendActivity\n      id: sendMessage\n      activity: \"" + message + "\"\n"
      : "  actions: []\n";
    return "kind: AdaptiveDialog\n" +
      "beginDialog:\n" +
      "  kind: " + triggerKind + "\n" +
      "  id: main\n" +
      actions;
  }
  // The 12 standard system topics every published agent carries.
  var SYSTEM_TOPICS = [
    { suffix: "ConversationStart", name: "Conversation Start", data: topicSystem("OnConversationStart", "") },
    { suffix: "Greeting", name: "Greeting", data: topicIntent("Greeting", ["Hi", "Hello", "Hey there"], "Hello! How can I help you today?") },
    { suffix: "Goodbye", name: "Goodbye", data: topicIntent("Goodbye", ["Bye", "Goodbye", "See you"], "Goodbye! Reach out any time you need help.") },
    { suffix: "ThankYou", name: "Thank you", data: topicIntent("ThankYou", ["Thanks", "Thank you", "Appreciate it"], "You are welcome! Happy to help.") },
    { suffix: "StartOver", name: "Start Over", data: topicIntent("StartOver", ["Start over", "Restart", "Begin again"], "Sure, let us start over. What would you like to do?") },
    { suffix: "ResetConversation", name: "Reset Conversation", data: topicIntent("ResetConversation", ["Reset", "Clear the conversation"], "The conversation has been reset. How can I help?") },
    { suffix: "EndOfConversation", name: "End of Conversation", data: topicIntent("EndOfConversation", ["That is all", "I am done", "Nothing else"], "Great — glad I could help. Have a good day!") },
    { suffix: "Fallback", name: "Fallback", data: topicSystem("OnUnknownIntent", "Sorry, I did not quite get that. Could you rephrase your request?") },
    { suffix: "OnError", name: "On Error", data: topicSystem("OnError", "Something went wrong on my end. Please try again in a moment.") },
    { suffix: "MultipleTopicsMatched", name: "Multiple Topics Matched", data: topicSystem("OnSelectIntent", "I found a few things that might match. Which one did you mean?") },
    { suffix: "Signin", name: "Sign in", data: topicIntent("Signin", ["Sign in", "Log in", "Authenticate me"], "Let us get you signed in so I can help with that.") },
    { suffix: "Escalate", name: "Escalate", data: topicIntent("Escalate", ["Talk to a human", "Speak to an agent", "I want a person"], "No problem — I will connect you with a person who can help.") }
  ];

  // ── botcomponent wrapper XML ──────────────────────────────────────────────
  function botcomponentXml(schema, type, name) {
    // NB: entity/customization XML files carry NO <?xml?> prolog in a real Copilot
    // Studio export — only [Content_Types].xml does. A stray declaration makes the
    // Dataverse importer throw "the specified node ... is the wrong type".
    return '<botcomponent schemaname="' + xmlEsc(schema) + '">\n' +
      '  <componenttype>' + type + '</componenttype>\n' +
      '  <name>' + xmlEsc(name) + '</name>\n' +
      '  <parentbotid>\n' +
      '    <schemaname>' + xmlEsc(schema.split(".")[0]) + '</schemaname>\n' +
      '  </parentbotid>\n' +
      '  <iscustomizable>0</iscustomizable>\n' +
      '  <statecode>0</statecode>\n' +
      '  <statuscode>1</statuscode>\n' +
      '</botcomponent>\n';
  }

  // ── knowledge-source data (free grounding — never adds a credit line) ─────
  function knowledgeData(kind, site, placeholder) {
    var out = "kind: KnowledgeSourceConfiguration\nsource:\n  kind: " + kind + "\n";
    if (placeholder) out += "  # Replace the placeholder below with your real source after import.\n";
    if (site) out += "  site: " + site + "\n";
    return out;
  }

  // ── connector-action data (TaskDialog bound to a connection reference) ────
  function actionData(logical, opId, displayName, description) {
    return "kind: TaskDialog\n" +
      "modelDisplayName: " + displayName + "\n" +
      "modelDescription: " + description + "\n" +
      "outputs:\n  - propertyName: Response\n" +
      "action:\n" +
      "  kind: InvokeConnectorTaskAction\n" +
      "  connectionReference: " + logical + "\n" +
      "  connectionProperties:\n    mode: Invoker\n" +
      "  operationId: " + opId + "\n" +
      "outputMode: All\n";
  }

  // ── bot.xml + configuration.json ──────────────────────────────────────────
  var ICON_PNG_B64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  function botXml(schema, name) {
    return '<bot schemaname="' + xmlEsc(schema) + '">\n' +
      '  <authenticationmode>2</authenticationmode>\n' +
      '  <authenticationtrigger>1</authenticationtrigger>\n' +
      '  <iconbase64>' + ICON_PNG_B64 + '</iconbase64>\n' +
      '  <iscustomizable>0</iscustomizable>\n' +
      '  <language>1033</language>\n' +
      '  <name>' + xmlEsc(name) + '</name>\n' +
      '  <runtimeprovider>0</runtimeprovider>\n' +
      '  <template>default-2.1.0</template>\n' +
      '</bot>\n';
  }
  function configJson(schema, orchestration) {
    // Generative (default): generative actions on + the GenerativeAIRecognizer.
    // Classic (legacy): disable generative actions and OMIT the recognizer so the
    // agent runs topic/trigger-phrase driven.
    // NB: the exact classic-orchestration configuration shape is ASSUMED here and
    // should be verified against a real classic-orchestration export before relying on it.
    var classic = orchestration === "classic";
    var cfg = {
      BotConfiguration: {
        GenerativeActionsEnabled: !classic,
        GPTSettings: { defaultSchemaName: schema + ".gpt.default" }
      }
    };
    if (!classic) cfg.BotConfiguration.AISettings = { GenerativeAIRecognizer: true };
    return JSON.stringify(cfg, null, 2) + "\n";
  }

  // ── solution.xml + customizations.xml ─────────────────────────────────────
  function addressBlock(n) {
    var fields = ["City", "County", "Country", "Fax", "Latitude", "Line1", "Line2", "Line3",
      "Longitude", "PostalCode", "PostOfficeBox", "PrimaryContactName", "ShippingMethodCode",
      "StateOrProvince", "Telephone1", "Telephone2", "Telephone3", "UPSZone", "UTCOffset", "Name"];
    return '        <Address>\n' +
      '          <AddressNumber>' + n + '</AddressNumber>\n' +
      '          <AddressTypeCode>1</AddressTypeCode>\n' +
      fields.map(function (f) { return '          <' + f + ' xsi:nil="true"></' + f + '>'; }).join("\n") + "\n" +
      '        </Address>';
  }
  function solutionXml(slug, name) {
    return '<ImportExportXml version="9.2.24024.0" SolutionPackageVersion="9.2" languagecode="1033" generatedBy="CrmLive" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n' +
      '  <SolutionManifest>\n' +
      '    <UniqueName>' + xmlEsc(slug) + '</UniqueName>\n' +
      '    <LocalizedNames>\n' +
      '      <LocalizedName description="' + xmlEsc(name) + '" languagecode="1033" />\n' +
      '    </LocalizedNames>\n' +
      '    <Descriptions />\n' +
      '    <Version>1.0.0.0</Version>\n' +
      '    <Managed>0</Managed>\n' +
      '    <Publisher>\n' +
      '      <UniqueName>copilotstudiostarter</UniqueName>\n' +
      '      <LocalizedNames>\n' +
      '        <LocalizedName description="Copilot Studio Starter" languagecode="1033" />\n' +
      '      </LocalizedNames>\n' +
      '      <Descriptions />\n' +
      '      <EMailAddress xsi:nil="true"></EMailAddress>\n' +
      '      <SupportingWebsiteUrl xsi:nil="true"></SupportingWebsiteUrl>\n' +
      '      <CustomizationPrefix>new</CustomizationPrefix>\n' +
      '      <CustomizationOptionValuePrefix>10000</CustomizationOptionValuePrefix>\n' +
      '      <Addresses>\n' + addressBlock(1) + "\n" + addressBlock(2) + "\n" +
      '      </Addresses>\n' +
      '    </Publisher>\n' +
      '    <RootComponents />\n' +
      '    <MissingDependencies />\n' +
      '  </SolutionManifest>\n' +
      '</ImportExportXml>\n';
  }
  function connectionReferencesXml(connectors) {
    if (!connectors.length) return "";
    var refs = connectors.map(function (c) {
      return '    <connectionreference connectionreferencelogicalname="' + xmlEsc(c.logical) + '">\n' +
        '      <connectionreferencedisplayname>' + xmlEsc(c.logical) + '</connectionreferencedisplayname>\n' +
        '      <connectorid>/providers/Microsoft.PowerApps/apis/' + xmlEsc(c.connector) + '</connectorid>\n' +
        '      <iscustomizable>0</iscustomizable>\n' +
        '      <promptingbehavior>0</promptingbehavior>\n' +
        '      <statecode>0</statecode>\n' +
        '      <statuscode>1</statuscode>\n' +
        '    </connectionreference>';
    }).join("\n");
    return '  <connectionreferences>\n' + refs + '\n  </connectionreferences>\n';
  }
  function customizationsXml(connectors) {
    return '<ImportExportXml xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n' +
      '  <Entities></Entities>\n' +
      '  <Roles></Roles>\n' +
      '  <Workflows></Workflows>\n' +
      '  <FieldSecurityProfiles></FieldSecurityProfiles>\n' +
      '  <Templates></Templates>\n' +
      '  <EntityMaps></EntityMaps>\n' +
      '  <EntityRelationships></EntityRelationships>\n' +
      '  <OrganizationSettings></OrganizationSettings>\n' +
      '  <optionsets></optionsets>\n' +
      '  <CustomControls></CustomControls>\n' +
      '  <EntityDataProviders></EntityDataProviders>\n' +
      connectionReferencesXml(connectors) +
      '  <Languages>\n    <Language>1033</Language>\n  </Languages>\n' +
      '</ImportExportXml>\n';
  }
  function connrefSetXml(connectors) {
    var rows = connectors.map(function (c) {
      return '  <botcomponent_connectionreference botcomponentid.schemaname="' + xmlEsc(c.actionSchemaName) +
        '" connectionreferenceid.connectionreferencelogicalname="' + xmlEsc(c.logical) + '">\n' +
        '    <iscustomizable>1</iscustomizable>\n' +
        '  </botcomponent_connectionreference>';
    }).join("\n");
    return '<botcomponent_connectionreferenceset>\n' + rows + '\n</botcomponent_connectionreferenceset>\n';
  }

  // ── [Content_Types].xml ───────────────────────────────────────────────────
  function contentTypesXml(entries) {
    // OPC requires every part to declare a content type. The .xml/.json/.png/.md/.txt
    // parts are covered by <Default> rules, but the extensionless botcomponent `data`
    // files have no extension a Default can match — each needs an explicit <Override>
    // (PartName must start with "/" and match the zip entry path exactly). Without
    // these the package is not a valid OPC container and the import fails.
    var overrides = (entries || [])
      .filter(function (e) { return /(^|\/)data$/.test(e.name); })
      .map(function (e) {
        return '  <Override PartName="/' + xmlEsc(e.name) + '" ContentType="application/octet-stream" />';
      })
      .join("\n");
    return '<?xml version="1.0" encoding="utf-8"?>\n' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n' +
      '  <Default Extension="xml" ContentType="application/octet-stream" />\n' +
      '  <Default Extension="json" ContentType="application/octet-stream" />\n' +
      '  <Default Extension="png" ContentType="application/octet-stream" />\n' +
      '  <Default Extension="md" ContentType="application/octet-stream" />\n' +
      '  <Default Extension="txt" ContentType="application/octet-stream" />\n' +
      (overrides ? overrides + "\n" : "") +
      '</Types>\n';
  }

  // ── NEXT-STEPS.md ─────────────────────────────────────────────────────────
  function nextStepsMd(name, connectors, unmapped, knowledge, vars, capabilities, orchestration) {
    vars = vars || {};
    capabilities = capabilities || [];
    var classic = orchestration === "classic";
    var L = [];
    L.push("# " + name + " — starter agent");
    L.push("");
    L.push("This is a **directional baseline** generated by the Copilot Credit Estimator from your");
    L.push("description. It imports as an **unmanaged** (fully editable) Copilot Studio agent so you");
    L.push("can extend it, then publish. It is a head start, **not** a production-ready agent.");
    L.push("");
    L.push("**Orchestration mode:** " + (classic ? "Classic (legacy, topic-based)" : "Generative (recommended)") + ".");
    L.push("");
    if (classic) {
      L.push("This package was generated in **classic orchestration** — legacy, topic/trigger-phrase driven. Classic");
      L.push("authoring is being **phased out**; we recommend **generative orchestration** instead. The estimator does");
      L.push("**not** author custom topics, so to get classic behavior you'll need to add topics and trigger phrases");
      L.push("yourself in the maker portal (Topics → New topic). The only topics in this package are system scaffolding.");
    } else {
      L.push("This is a **generative-orchestration** baseline (topics-as-last-resort): the agent's behavior");
      L.push("lives in its **instructions**, **tools**, and **knowledge** — not in authored topics. Extend it");
      L.push("by adding Tools and Knowledge and refining Instructions; only drop down to authoring a topic when");
      L.push("orchestration genuinely can't handle the case. The topics in this package are just system scaffolding.");
    }
    L.push("");
    L.push("## Import it");
    L.push("1. Go to **make.powerapps.com** (or **copilotstudio.microsoft.com**) → **Solutions** → **Import solution**.");
    L.push("2. Choose this .zip and continue.");
    L.push("3. On the **Connections** step, pick or create a connection for each connector below.");
    L.push("4. Click **Import** and wait for it to finish.");
    L.push("5. Open the agent, review everything, and **Publish**.");
    L.push("");
    if (connectors.length) {
      L.push("## Connections to set at import");
      connectors.forEach(function (c) {
        L.push("- **" + c.connectorLabel + "** — action \"" + c.actionName + "\" (operation `" + c.operationId + "`).");
      });
      L.push("");
    }
    if (unmapped.length) {
      L.push("## Actions to wire up after import");
      L.push("Your description mentioned systems that don't have a built-in starter action here. Add these");
      L.push("manually in Studio (Tools → Add a tool → Connector) — we did **not** fabricate operations for them:");
      unmapped.forEach(function (s) { L.push("- " + s); });
      L.push("");
    }
    if (capabilities.length) {
      L.push("## Read tools to add (so the agent can pull this data)");
      L.push("Your description asks the agent to **read** data that has no verified starter action, so we did");
      L.push("**not** wire it (fabricated operations break import). Add each as a **tool** in Studio");
      L.push("(Tools → Add a tool → Connector) — not a topic:");
      capabilities.forEach(function (c) { L.push("- " + c.tool); });
      L.push("");
    }
    var toolItems = [];
    if (vars.hasAI) toolItems.push("Add a **Prompt tool** to draft, summarize, or classify content in your own words (Tools → Add a tool → Prompt). We don't generate the prompt tool because its exact serialization isn't verified yet.");
    if (vars.hasFlow) toolItems.push("Add an **agent flow** (or Power Automate cloud flow) for the multi-step automation you described, then attach it as a tool.");
    if (vars.hasContent) toolItems.push("Add a **document-processing tool** (a prompt or flow) to read and extract fields from the documents you described.");
    if (toolItems.length) {
      L.push("## Tools to add (no topics needed)");
      L.push("These extend the agent through generative orchestration — add them as **Tools**, not topics:");
      toolItems.forEach(function (t) { L.push("- " + t); });
      L.push("");
    }
    if (vars && vars.knowledge === "tenantGraph") {
      L.push("## Microsoft 365 knowledge (tenant graph)");
      L.push("Enable **Microsoft 365** / tenant-graph grounding on the agent after import (Knowledge →");
      L.push("add Microsoft 365 sources). Tenant-graph grounding bills ~10 credits per response — plan for it.");
      L.push("");
    }
    if (knowledge.some(function (k) { return k.placeholder; })) {
      L.push("## Knowledge sources");
      L.push("One or more knowledge sources use a **placeholder** URL/site because your description didn't");
      L.push("include a specific link. Open Knowledge on the agent and point each source at your real content.");
      L.push("");
    }
    L.push("_Document, website, SharePoint, and Dataverse knowledge grounding is free per run — it feeds");
    L.push("generative answers. Only tenant-graph grounding bills separately._");
    L.push("");
    return L.join("\n");
  }

  // ── Main entry point ──────────────────────────────────────────────────────
  function buildPackage(opts) {
    opts = opts || {};
    var desc = String(opts.description || "");
    var vars = opts.vars || {};
    var systems = opts.systems || (opts.outline && opts.outline.systems) || [];
    var orchestration = opts.orchestration === "classic" ? "classic" : "generative"; // default + recommended = generative
    var name = (opts.name && String(opts.name).trim()) || deriveName(desc);
    var slug = slugify(name);
    var schema = "new_" + slug;
    var descLower = " " + desc.toLowerCase().replace(/\s+/g, " ") + " ";

    // 1) Connectors implied by the description (+ detected-system mapping).
    var connectors = [];
    Object.keys(CONNECTOR_ACTIONS).forEach(function (key) {
      var c = CONNECTOR_ACTIONS[key];
      var byText = c.match.test(descLower);
      var bySystem = systems.indexOf(c.systemLabel) >= 0 &&
        (key === "office365" || key === "dataverse"); // SP/Teams need action-y text, not just channel/knowledge
      if (byText || bySystem) {
        var actionSchemaName = schema + ".action." + c.actionSchema;
        connectors.push({
          key: key, connector: c.connector, operationId: c.operationId,
          actionName: c.actionName, actionSchema: c.actionSchema,
          actionSchemaName: actionSchemaName, guidanceVerb: c.guidanceVerb,
          modelDescription: c.modelDescription, connectorLabel: c.connectorLabel,
          logical: schema + "." + c.connector + ".shared-" + c.abbrev + "-" + guid()
        });
      }
    });

    // 2) Knowledge sources (free grounding; never adds a credit line).
    var knowledge = [];
    var urls = desc.match(/https?:\/\/[^\s)"'<>]+/g) || [];
    if (urls.length) {
      urls.slice(0, 3).forEach(function (u) {
        knowledge.push({ kind: /sharepoint\.com/i.test(u) ? "SharePointSearchSource" : "PublicSiteSearchSource", site: u });
      });
    } else if (vars.knowledge === "docs") {
      if (/sharepoint/.test(descLower)) knowledge.push({ kind: "SharePointSearchSource", site: "https://contoso.sharepoint.com/sites/YourSite", placeholder: true });
      else if (/dataverse/.test(descLower)) knowledge.push({ kind: "DataverseSearchSource", placeholder: true });
      else knowledge.push({ kind: "PublicSiteSearchSource", site: "https://www.example.com", placeholder: true });
    }
    // tenantGraph grounding is M365 model knowledge (aISettings), not a source component -> NEXT-STEPS note.

    // 3) Unmapped systems (no built-in starter action) -> NEXT-STEPS.
    var wiredKeys = connectors.map(function (c) { return c.key; });
    var unmapped = systems.filter(function (s) {
      var key = SYSTEM_TO_CONNECTOR[s];
      if (!key) return true;                 // no known connector at all
      return wiredKeys.indexOf(key) < 0;     // known connector but not wired here
    });

    // 3b) Read capabilities the description asks for that we don't wire (no verified
    // read action). Surfaced in instructions (prose) + NEXT-STEPS (tool-framed) — never
    // fabricated as components/operationIds. All CONNECTOR_ACTIONS are writes, so these
    // read intents never overlap a wired action.
    var capabilities = detectCapabilities(descLower);

    // 4) Assemble the ZIP entries.
    var entries = [];
    var add = function (nm, data) { entries.push({ name: nm, data: data }); };

    add("solution.xml", solutionXml(slug, name));
    add("customizations.xml", customizationsXml(connectors));
    add("bots/" + schema + "/bot.xml", botXml(schema, name));
    add("bots/" + schema + "/configuration.json", configJson(schema, orchestration));

    // GPT orchestration component (type 15). Instructions reference the tools +
    // knowledge determined above, by their exact display names, and describe any
    // read capabilities to add in prose.
    var gptSchema = schema + ".gpt.default";
    var instructions = buildInstructions(name, desc, { connectors: connectors, knowledge: knowledge, vars: vars, capabilities: capabilities });
    add("botcomponents/" + gptSchema + "/data", gptComponentData(instructions));
    add("botcomponents/" + gptSchema + "/botcomponent.xml", botcomponentXml(gptSchema, 15, name));

    // System topics (type 9) — scaffolding/plumbing only (greeting, error, sign-in,
    // escalate, …). Behavior is intentionally instruction/tool/knowledge-driven, so
    // we never author routing or action topics here; these stay untouched.
    SYSTEM_TOPICS.forEach(function (t) {
      var s = schema + ".topic." + t.suffix;
      add("botcomponents/" + s + "/data", t.data);
      add("botcomponents/" + s + "/botcomponent.xml", botcomponentXml(s, 9, t.name));
    });

    // Knowledge sources (type 16).
    knowledge.forEach(function (k, i) {
      var s = schema + ".knowledge." + (i + 1);
      add("botcomponents/" + s + "/data", knowledgeData(k.kind, k.site, k.placeholder));
      add("botcomponents/" + s + "/botcomponent.xml", botcomponentXml(s, 16, knowledgeLabel(k.kind)));
    });

    // Connector actions (type 9) + connection-reference set.
    connectors.forEach(function (c) {
      add("botcomponents/" + c.actionSchemaName + "/data",
        actionData(c.logical, c.operationId, c.actionName, c.modelDescription));
      add("botcomponents/" + c.actionSchemaName + "/botcomponent.xml",
        botcomponentXml(c.actionSchemaName, 9, c.connectorLabel + " - " + c.actionName));
    });
    if (connectors.length) add("Assets/botcomponent_connectionreferenceset.xml", connrefSetXml(connectors));

    // Always-present import guidance.
    add("NEXT-STEPS.md", nextStepsMd(name, connectors, unmapped, knowledge, vars, capabilities, orchestration));

    // [Content_Types].xml leads the package and must cover EVERY part — including an
    // <Override> for each extensionless `data` file — so it is built last, once all
    // entries are known, then unshifted to the front of the archive.
    entries.unshift({ name: "[Content_Types].xml", data: contentTypesXml(entries) });

    var bytes = zipStore(entries);
    return {
      bytes: bytes,
      filename: slug + "-copilot-studio-starter.zip",
      name: name, slug: slug, schema: schema,
      entries: entries.map(function (e) { return e.name; }),
      files: entries.reduce(function (m, e) { m[e.name] = e.data; return m; }, {}),
      connectors: connectors, knowledge: knowledge, unmapped: unmapped,
      capabilities: capabilities.map(function (c) { return c.id; }),
      orchestration: orchestration,
      tenantGraph: vars.knowledge === "tenantGraph"
    };
  }

  function gptComponentData(instructions) {
    return "kind: GptComponentMetadata\n" +
      yamlBlock("instructions", instructions, 0) + "\n" +
      "gptCapabilities:\n  webBrowsing: true\n" +
      "aISettings:\n  model:\n    modelNameHint: GPT41\n";
  }
  function knowledgeLabel(kind) {
    if (kind === "SharePointSearchSource") return "Knowledge — SharePoint";
    if (kind === "DataverseSearchSource") return "Knowledge — Dataverse";
    if (kind === "AzureAISearchSource") return "Knowledge — Azure AI Search";
    return "Knowledge — Website";
  }

  var api = {
    buildPackage: buildPackage,
    zipStore: zipStore,
    crc32: crc32,
    utf8: utf8,
    slugify: slugify,
    deriveName: deriveName,
    properName: properName,
    buildInstructions: buildInstructions,
    CONNECTOR_ACTIONS: CONNECTOR_ACTIONS,
    READ_CAPABILITIES: READ_CAPABILITIES,
    detectCapabilities: detectCapabilities,
    SYSTEM_TOPICS: SYSTEM_TOPICS
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.EstimatorPackage = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

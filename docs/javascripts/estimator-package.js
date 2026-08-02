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
    var m = d.match(/([A-Za-z][A-Za-z0-9 &/]{1,38}?)\s+(agent|assistant|bot|copilot)\b/i);
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
  // A single-line double-quoted YAML scalar (for list items like conversation starters).
  function yamlInline(s) {
    return '"' + String(s == null ? "" : s).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
  }

  // ── Connector catalog (verified operationId / display-name pairs) ─────────
  // Only emitted when the description clearly implies the connector. operationIds
  // are NEVER fabricated — unknown systems go to NEXT-STEPS.md instead.
  // `guidanceVerb` is the natural-language phrase the instructions use to point the
  // model at the tool (e.g. "send an email" -> the "Send an email (V2)" tool).
  //
  // Multiple actions can share one connector (e.g. Office 365 Outlook wires "Send an
  // email", "Get emails", and "Get events") — they bind to a single shared connection
  // reference at import. `kind` is "write" | "read" | "update" (informational). Entries
  // with `match: null` are wired ONLY when a READ_CAPABILITY promotes them (below), so
  // their nuanced read-vs-write detection lives in detectCapabilities, not a bare regex.
  // Every operationId below is VERIFIED verbatim against the official Microsoft connector
  // reference (learn.microsoft.com/connectors/<name>) — see the per-op citations. We
  // NEVER invent an operationId; unverifiable ops go to NEXT-STEPS.md instead.
  var CONNECTOR_ACTIONS = {
    // ── Office 365 Outlook (learn.microsoft.com/connectors/office365) ──────────
    office365: {
      connector: "shared_office365", abbrev: "office365", kind: "write",
      operationId: "SendEmailV2", actionSchema: "SendEmailV2", // "Send an email (V2)" -> SendEmailV2 (verified)
      actionName: "Send an email (V2)",
      modelDescription: "Send an email through Office 365 Outlook.",
      connectorLabel: "Office 365 Outlook",
      guidanceVerb: "send an email",
      match: /(outlook|exchange|e-?mail|inbox|send (a|an) mail)/,
      systemLabel: "Outlook / Exchange", bySystem: true
    },
    "office365.getEmails": {
      connector: "shared_office365", abbrev: "office365", kind: "read",
      operationId: "GetEmailsV3", actionSchema: "GetEmailsV3", // "Get emails (V3)" -> GetEmailsV3 (verified; V2 deprecated)
      actionName: "Get emails (V3)",
      modelDescription: "Retrieve emails from an Office 365 Outlook mailbox.",
      connectorLabel: "Office 365 Outlook",
      guidanceVerb: "read the user's incoming email",
      match: null, // promoted by the emailRead capability
      systemLabel: "Outlook / Exchange"
    },
    "office365.getCalendar": {
      connector: "shared_office365", abbrev: "office365", kind: "read",
      operationId: "V4CalendarGetItems", actionSchema: "GetEventsV4", // "Get events (V4)" -> V4CalendarGetItems (verified; V1-V3 deprecated)
      actionName: "Get events (V4)",
      modelDescription: "Retrieve calendar events from an Office 365 Outlook calendar.",
      connectorLabel: "Office 365 Outlook",
      guidanceVerb: "check the user's upcoming meetings",
      match: null, // promoted by the calendar capability
      systemLabel: "Outlook / Exchange"
    },
    // ── SharePoint (learn.microsoft.com/connectors/sharepointonline) ───────────
    sharepoint: {
      connector: "shared_sharepointonline", abbrev: "sharepointonline", kind: "write",
      operationId: "CreateFile", actionSchema: "CreateFile", // "Create file" -> CreateFile (verified)
      actionName: "Create file",
      modelDescription: "Create a file in a SharePoint document library.",
      connectorLabel: "SharePoint",
      guidanceVerb: "save a file to SharePoint",
      // action-y language only — a write VERB must sit next to a concrete object
      // (file/document/item/attachment). Bare 'sharepoint', 'library', or 'folder'
      // are knowledge/deployment cues and never wire an action on their own.
      match: /(?:upload|save|store|create|add|put|write|upsert)s?\b.{0,24}(?:files?|documents?|docs?|items?|attachments?)|(?:files?|documents?|docs?|items?|attachments?)\b.{0,24}(?:upload|save|store|create|add|put|write|upsert)s?\b/,
      systemLabel: "SharePoint"
    },
    "sharepoint.getItems": {
      connector: "shared_sharepointonline", abbrev: "sharepointonline", kind: "read",
      operationId: "GetItems", actionSchema: "GetItems", // "Get items" -> GetItems (verified)
      actionName: "Get items",
      modelDescription: "Get items from a SharePoint list.",
      connectorLabel: "SharePoint",
      guidanceVerb: "read items from a SharePoint list",
      // read VERB + list-item object AND the word 'sharepoint' — a bare SharePoint
      // knowledge/source mention ("answers from our SharePoint library") wires nothing.
      match: /(?=.*\bsharepoint\b)(?=.*\b(?:get|list|read|retriev\w*|fetch|pull|look\s?up|review|check|find|search)\b)(?=.*\b(?:items?|list\s+items?|records?|entries|rows?)\b).*/,
      systemLabel: "SharePoint"
    },
    "sharepoint.getFile": {
      connector: "shared_sharepointonline", abbrev: "sharepointonline", kind: "read",
      operationId: "GetFileContent", actionSchema: "GetFileContent", // "Get file content" -> GetFileContent (verified)
      actionName: "Get file content",
      modelDescription: "Get the content of a file stored in SharePoint.",
      connectorLabel: "SharePoint",
      guidanceVerb: "read a file's content from SharePoint",
      match: /(?=.*\bsharepoint\b)(?=.*\b(?:get|read|retriev\w*|fetch|download|pull|open|extract)\b)(?=.*\b(?:files?|documents?|attachments?|contents?)\b).*/,
      systemLabel: "SharePoint"
    },
    // ── Microsoft Dataverse (learn.microsoft.com/connectors/commondataserviceforapps) ──
    dataverse: {
      connector: "shared_commondataserviceforapps", abbrev: "commondataserviceforapps", kind: "write",
      operationId: "CreateRecord", actionSchema: "AddANewRow", // "Add a new row" -> CreateRecord (verified)
      actionName: "Add a new row",
      modelDescription: "Add a new row to a Microsoft Dataverse table.",
      connectorLabel: "Microsoft Dataverse",
      guidanceVerb: "add a row to Dataverse",
      // create/add/insert VERB next to a row/record object (bare 'dataverse' no longer
      // wires a write, so a read-only "check the Dataverse record" won't add a row).
      match: /(?:create|add|insert|new|log|upsert|register)s?\b.{0,24}(?:rows?|records?|entr(?:y|ies)|accounts?|contacts?|cases?|leads?|opportunit\w*)|(?:rows?|records?|entr(?:y|ies))\b.{0,24}(?:create|add|insert|new|upsert)s?\b/,
      systemLabel: "Dynamics 365", bySystem: true
    },
    "dataverse.list": {
      connector: "shared_commondataserviceforapps", abbrev: "commondataserviceforapps", kind: "read",
      operationId: "ListRecords", actionSchema: "ListRows", // "List rows" -> ListRecords (verified)
      actionName: "List rows",
      modelDescription: "List rows from a Microsoft Dataverse table (with optional filter).",
      connectorLabel: "Microsoft Dataverse",
      guidanceVerb: "look up records in Dataverse",
      match: /(?=.*\b(?:dataverse|dynamics\s?365|d365|common data service|cds|crm)\b)(?=.*\b(?:list|get|look\s?up|looks?\s?up|retriev\w*|find|search|quer\w*|check|read|pull|review|fetch|view|see|display)\b)(?=.*\b(?:rows?|records?|tables?|entit\w*|accounts?|contacts?|cases?|leads?|opportunit\w*|customers?|data)\b).*/,
      systemLabel: "Dynamics 365"
    },
    "dataverse.get": {
      connector: "shared_commondataserviceforapps", abbrev: "commondataserviceforapps", kind: "read",
      operationId: "GetItem", actionSchema: "GetRowById", // "Get a row by ID" -> GetItem (verified)
      actionName: "Get a row by ID",
      modelDescription: "Get a single Microsoft Dataverse row by its ID.",
      connectorLabel: "Microsoft Dataverse",
      guidanceVerb: "get a specific Dataverse row by id",
      // narrow: only explicit by-id / specific-row phrasing (the general read is List rows).
      match: /(?=.*\b(?:dataverse|dynamics\s?365|d365|common data service|cds|crm)\b)(?=.*\b(?:get|retriev\w*|look\s?up|fetch|read|pull)\b)(?=.*\b(?:by\s+(?:its\s+)?id|by\s+record\s*id|specific\s+(?:row|record)|single\s+(?:row|record)|a\s+row\s+by)\b).*/,
      systemLabel: "Dynamics 365"
    },
    "dataverse.update": {
      connector: "shared_commondataserviceforapps", abbrev: "commondataserviceforapps", kind: "update",
      operationId: "UpdateOnlyRecord", actionSchema: "UpdateARow", // "Update a row" -> UpdateOnlyRecord (verified; NOT UpdateRecord, which is Upsert a row)
      actionName: "Update a row",
      modelDescription: "Update an existing row in a Microsoft Dataverse table.",
      connectorLabel: "Microsoft Dataverse",
      guidanceVerb: "update a Dataverse row",
      match: /(?=.*\b(?:dataverse|dynamics\s?365|d365|common data service|cds|crm)\b)(?=.*\b(?:updat\w*|modif\w*|chang\w*|edit\w*|revis\w*)\b)(?=.*\b(?:rows?|records?|fields?|status\w*|entit\w*|accounts?|contacts?|cases?|leads?|opportunit\w*|customers?|data|it|them)\b).*/,
      systemLabel: "Dynamics 365"
    },
    // ── Microsoft Teams (learn.microsoft.com/connectors/teams) ─────────────────
    teams: {
      connector: "shared_teams", abbrev: "teams", kind: "write",
      operationId: "PostMessageToConversation", actionSchema: "PostMessage", // "Post message in a chat or channel" -> PostMessageToConversation (verified; PostMessageToChannel* deprecated)
      actionName: "Post a message",
      modelDescription: "Post a message to a Microsoft Teams channel or chat.",
      connectorLabel: "Microsoft Teams",
      guidanceVerb: "post a message to Teams",
      // action-y language only — needs a write VERB next to a message object AND the
      // word 'teams'. Bare 'teams', 'teams channel', or read phrasing never wires.
      match: /^(?=.*\bteams\b)(?=.*(?:(?:post|send|share|publish|notify|alert)s?\b.{0,24}(?:messages?|posts?|notifications?|reply|card|chat)|(?:messages?|posts?|notifications?)\b.{0,24}(?:post|send|share|publish|notify|alert)s?\b)).*/,
      systemLabel: "Teams"
    },
    "teams.getMessages": {
      connector: "shared_teams", abbrev: "teams", kind: "read",
      operationId: "GetMessagesFromChannel", actionSchema: "GetMessages", // "Get messages in a channel" -> GetMessagesFromChannel (verified)
      actionName: "Get messages in a channel",
      modelDescription: "Read recent messages from a Microsoft Teams channel.",
      connectorLabel: "Microsoft Teams",
      guidanceVerb: "read recent Teams messages",
      match: null, // promoted by the teamsRead capability
      systemLabel: "Teams"
    },
    // ── Office 365 Users (learn.microsoft.com/connectors/office365users) ───────
    "office365users.search": {
      connector: "shared_office365users", abbrev: "office365users", kind: "read",
      operationId: "SearchUserV2", actionSchema: "SearchForUsersV2", // "Search for users (V2)" -> SearchUserV2 (verified; NOT SearchUser_V2)
      actionName: "Search for users (V2)",
      modelDescription: "Search the directory for users by name or keyword.",
      connectorLabel: "Office 365 Users",
      guidanceVerb: "search the directory for people",
      match: null, // promoted by the people capability
      systemLabel: "Microsoft Entra ID / people"
    },
    "office365users.getProfile": {
      connector: "shared_office365users", abbrev: "office365users", kind: "read",
      operationId: "UserProfile_V2", actionSchema: "GetUserProfileV2", // "Get user profile (V2)" -> UserProfile_V2 (verified)
      actionName: "Get user profile (V2)",
      modelDescription: "Get a user's profile (name, title, department, manager).",
      connectorLabel: "Office 365 Users",
      guidanceVerb: "look up a person's profile",
      match: null, // promoted by the people capability
      systemLabel: "Microsoft Entra ID / people"
    },
    // ── ServiceNow (learn.microsoft.com/connectors/service-now) ────────────────
    servicenow: {
      connector: "shared_service-now", abbrev: "service-now", kind: "write",
      operationId: "CreateRecord", actionSchema: "CreateRecord", // "Create Record" -> CreateRecord (verified)
      actionName: "Create record",
      modelDescription: "Create a record in a ServiceNow table (for example an incident).",
      connectorLabel: "ServiceNow",
      guidanceVerb: "log a record in ServiceNow",
      // create VERB next to an incident/ticket/record object (bare 'servicenow' no longer
      // wires a write, so a read/update-only request won't spuriously create a record).
      match: /(?:create|open|log|raise|submit|file|new)s?\b.{0,24}(?:incidents?|tickets?|cases?|requests?|records?)|(?:incidents?|tickets?|cases?|requests?|records?)\b.{0,24}(?:create|open|log|raise|submit|file)s?\b/,
      systemLabel: "ServiceNow"
    },
    "servicenow.list": {
      connector: "shared_service-now", abbrev: "service-now", kind: "read",
      operationId: "GetRecords", actionSchema: "ListRecords", // "List Records" -> GetRecords (verified; display name is List Records, op is GetRecords)
      actionName: "List records",
      modelDescription: "List records from a ServiceNow table (with optional query).",
      connectorLabel: "ServiceNow",
      guidanceVerb: "look up records in ServiceNow",
      match: /(?=.*\b(?:service\s?now|incidents?|tickets?)\b)(?=.*\b(?:list|get|look\s?up|looks?\s?up|retriev\w*|find|search|quer\w*|check|read|pull|review|fetch|view|status|see)\b).*/,
      systemLabel: "ServiceNow"
    },
    "servicenow.get": {
      connector: "shared_service-now", abbrev: "service-now", kind: "read",
      operationId: "GetRecord", actionSchema: "GetRecord", // "Get Record" -> GetRecord (verified)
      actionName: "Get record",
      modelDescription: "Get a single ServiceNow record by its ID.",
      connectorLabel: "ServiceNow",
      guidanceVerb: "get a specific ServiceNow record",
      // narrow: only explicit by-id / by-number phrasing (the general read is List records).
      match: /(?=.*\b(?:service\s?now|incidents?|tickets?)\b)(?=.*\b(?:get|retriev\w*|look\s?up|fetch|read|pull)\b)(?=.*\b(?:by\s+(?:its\s+)?(?:id|number|sys_?id)|specific\s+(?:incident|record|ticket)|single\s+(?:incident|record|ticket))\b).*/,
      systemLabel: "ServiceNow"
    },
    "servicenow.update": {
      connector: "shared_service-now", abbrev: "service-now", kind: "update",
      operationId: "UpdateRecord", actionSchema: "UpdateRecord", // "Update Record" -> UpdateRecord (verified)
      actionName: "Update record",
      modelDescription: "Update an existing record in a ServiceNow table.",
      connectorLabel: "ServiceNow",
      guidanceVerb: "update a ServiceNow record",
      match: /(?=.*\b(?:service\s?now|incidents?|tickets?)\b)(?=.*\b(?:updat\w*|modif\w*|chang\w*|resolv\w*|close|closes|closing|edit\w*|assign\w*)\b).*/,
      systemLabel: "ServiceNow"
    },
    approvals: {
      connector: "shared_approvals", abbrev: "approvals", kind: "write",
      operationId: "StartAndWaitForAnApproval", actionSchema: "StartAndWaitForAnApproval",
      actionName: "Start and wait for an approval",
      modelDescription: "Start an approval and wait for the outcome.",
      connectorLabel: "Approvals",
      guidanceVerb: "request an approval",
      match: /approval|approve\b|sign-?off|route.{0,20}approv/,
      systemLabel: "Approvals"
    },
    sql: {
      connector: "shared_sql", abbrev: "sql", kind: "write",
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
  // System-label -> connector logical name. `unmapped` compares detected systems against
  // the set of WIRED connectors (any action of that connector counts as covered).
  var SYSTEM_TO_CONNECTOR = {
    "Outlook / Exchange": "shared_office365", "SharePoint": "shared_sharepointonline",
    "Teams": "shared_teams", "Dynamics 365": "shared_commondataserviceforapps",
    "ServiceNow": "shared_service-now", "Approvals": "shared_approvals", "SQL Server": "shared_sql"
  };

  // ── Read-capability fidelity (Part 2) ─────────────────────────────────────
  // Nuanced "read/pull" intents (calendar, email, Teams, people) that need careful
  // read-vs-write disambiguation. When detected, each capability PROMOTES its linked
  // CONNECTOR_ACTIONS entries (match:null) to real wired tools. Capabilities with no
  // verified op (e.g. onedrive) instead (a) describe the behavior in the instructions
  // in prose and (b) add a tool-framed item to NEXT-STEPS.md — never a fabricated op.
  var READ_VERB = /(review|read|summar|triage|check|scan|analy|monitor|gather|pull|look|prepar|prep\b|brief|assess|identif|recommend|understand|surface)/;
  // Each capability now links to verified CONNECTOR_ACTIONS entries via `actions`.
  // When detected, those actions are PROMOTED to real wired connector tools (component +
  // shared connection reference + a named instruction line). A capability with NO
  // `actions` (e.g. onedrive) has no verified starter op, so it stays prose + NEXT-STEPS.
  var READ_CAPABILITIES = [
    {
      id: "calendar",
      noun: /(calendar|meetings?|schedule|upcoming (event|appointment|meeting)|agenda)/,
      behavior: "the user's upcoming meetings and calendar",
      actions: ["office365.getCalendar"],
      tool: "Add an **Office 365 Outlook** \u201cGet events (V4)\u201d tool so the agent can read the user's meetings."
    },
    {
      id: "teamsRead",
      noun: /teams.{0,20}(message|chat|conversation|post)|(message|chat|conversation).{0,12}teams|read.{0,16}teams|summar.{0,16}teams/,
      // outbound-send phrasing ("post a message to Teams", "notify the Teams channel")
      // is a WRITE, not an inbound read — strip it before deciding this capability.
      outbound: /\b(?:post|posts|posting|posted|send|sends|sending|sent|share|shares|shared|notify|notifies|notified|publish|publishes|drop|drops)\b[^.]{0,20}\b(?:messages?|posts?|notifications?|update|updates|card|cards|reply|alert|alerts)\b[^.]{0,16}\bteams\b|\bteams\b[^.]{0,20}\b(?:post|send|share|notify|publish|alert)\b/g,
      behavior: "recent Teams messages and chats",
      actions: ["teams.getMessages"],
      tool: "Add a **Microsoft Teams** \u201cGet messages in a channel\u201d tool so the agent can read recent Teams messages."
    },
    {
      id: "emailRead",
      noun: /(e-?mails?|inbox|mailbox)/,
      // outbound-send phrasing ("emails the user a summary", "send an email") is a WRITE,
      // not an inbound read — strip it before deciding this capability.
      outbound: /\be-?mails?\s+(?:(?:the|a|an|them|him|her|me|us|your|our)\s+)*(?:users?|teams?|customers?|clients?|managers?|stakeholders?|recipients?|people|summary|summaries|report|reports|confirmation|notification|reminder|update|updates|response|reply|results?|details?|briefings?)\b|\b(?:send|sends|sending|sent|deliver|delivers|delivering|dispatch|dispatches|compose|composes|composing|draft|drafts|drafting|write|writes|writing)\b[^.]{0,24}\be-?mails?\b/g,
      behavior: "incoming email",
      actions: ["office365.getEmails"],
      tool: "Add an **Office 365 Outlook** \u201cGet emails (V3)\u201d tool so the agent can read incoming email."
    },
    {
      id: "onedrive",
      noun: /(onedrive|one drive)/,
      behavior: "relevant OneDrive files",
      // No verified OneDrive read op in the catalog yet -> stays prose + NEXT-STEPS.
      tool: "Add a **OneDrive for Business** \u201cList files in folder\u201d / \u201cGet file content\u201d tool so the agent can read files."
    },
    {
      id: "people",
      noun: /(look ?up|find|search|summar).{0,24}(person|people|colleague|coworker|employee|user|manager|org\b)|who (is|are|reports)|org(anization|anisation)? (info|chart|structure)|stakeholders?/,
      behavior: "people and organizational information",
      actions: ["office365users.search", "office365users.getProfile"],
      tool: "Add an **Office 365 Users** \u201cGet user profile (V2)\u201d / \u201cSearch for users (V2)\u201d tool so the agent can look up people and org info."
    }
  ];
  // A read capability only counts when a READ_VERB governs the noun — i.e. a read
  // verb appears at or before where the noun phrase ends (so "review … emails" counts,
  // but "emails the user a summary" does not, since the only read-ish word "summary"
  // sits AFTER the noun). Outbound-send phrasing is stripped first (see cap.outbound).
  function readGoverns(text, nounRe) {
    var re = new RegExp(nounRe.source, nounRe.flags.replace(/g/g, "") + "g");
    var m, lastEnd = -1;
    while ((m = re.exec(text))) {
      lastEnd = m.index + m[0].length;
      if (re.lastIndex <= m.index) re.lastIndex = m.index + 1;
    }
    return lastEnd >= 0 && READ_VERB.test(text.slice(0, lastEnd));
  }
  function detectCapabilities(descLower) {
    return READ_CAPABILITIES.filter(function (cap) {
      var text = cap.outbound ? descLower.replace(cap.outbound, " ") : descLower;
      return cap.noun.test(text) && readGoverns(text, cap.noun);
    });
  }

  // ── Baseline agent instructions (generative orchestration) ────────────────
  // Doctrine: behavior lives in INSTRUCTIONS + TOOLS + KNOWLEDGE, never in
  // authored topics. We emit constraints + response format + guidance, and the
  // guidance references THIS package's real tools (by exact display name) and
  // knowledge. We deliberately avoid "search the knowledge / cite sources"
  // phrasing — the orchestrator retrieves and grounds on its own.
  // Copilot Studio model hint emitted in the GPT component's aISettings. Kept as a
  // single named constant so the model choice lives in exactly one place.
  var MODEL_NAME_HINT = "GPT41";

  // The exact export serialization for an agent-level *description* and *conversation
  // starters* (suggested prompts) is NOT yet verified against a real Copilot Studio
  // unmanaged solution export. Emitting an unverified field shape into an entity file
  // can break ImportEntityFromFile, so by default we do NOT write them into the
  // importable component — we compute them, return them for the UI/preview, and
  // document them in NEXT-STEPS.md so the user can paste them in the maker portal.
  // Flip to true only once the shape is verified against a real export.
  var VERIFIED_AGENT_METADATA = false;

  // ── Verified-shape gates for autonomous / flow / content components ──────────
  // Same doctrine as VERIFIED_AGENT_METADATA: we NEVER emit a component whose exact
  // solution-export serialization we can't verify against a REAL Copilot Studio
  // unmanaged export (drop one into tooling/golden-exports/ and run verify-exports.cjs).
  // While a shape is unverified we keep the current import-safe behavior and DOCUMENT
  // the gap in NEXT-STEPS.md + flag it in the UI, rather than shipping a broken agent.
  //
  //  - AUTONOMOUS: when verified, emit the autonomous trigger, set the bot/config for
  //    unattended run, and drop the interactive-only system topics. Until then, an
  //    autonomous agent imports as an interactive chat agent + a NEXT-STEPS trigger note.
  //  - FLOW: when verified, emit an agent flow wired as a tool via the (zero-rated)
  //    "When an agent calls the flow" trigger. Until then, a NEXT-STEPS "add a flow" note.
  //  - CONTENT: when verified, emit a document/content-processing tool. Until then, a note.
  // Flip a flag to true ONLY once its shape is captured from a golden export AND a
  // component builder for it is authored + diffed green by the harness.
  var VERIFIED_AUTONOMOUS_SHAPE = false;
  var VERIFIED_FLOW_SHAPE = false;
  var VERIFIED_CONTENT_TOOL_SHAPE = false;

  // ── Authoring-experience (build-target) gate ────────────────────────────────
  // Microsoft Copilot Studio has TWO agent experiences (the authoring "harness"),
  // which are fundamentally different architectures with no migration path between
  // them (learn.microsoft.com/microsoft-copilot-studio/agents-experience/classic-vs-new):
  //   • CLASSIC experience — topics + settings + explicit nodes; orchestration mode
  //     (classic vs generative) is a *sub-setting within it*. THIS is the shape this
  //     tool emits today (12 AdaptiveDialog system topics + the bot/component layout),
  //     with generative orchestration enabled. It is verified + import-tested.
  //   • NEW experience — a single instruction-driven agent object (no topics; enhanced
  //     orchestration runtime, deeper reasoning). A structurally different solution
  //     export we have NOT yet captured from a real unmanaged export.
  // Same doctrine as the shape flags above: we never fabricate the new-experience
  // serialization. While it's unverified, selecting "new" builds the (verified)
  // classic-experience package as a fallback and DOCUMENTS the gap (NEXT-STEPS + UI).
  // Flip to true only once a real new-experience unmanaged export is dropped into
  // tooling/golden-exports/, its shape read via verify-exports.cjs, and an emitter
  // authored + diffed green. NB: the experience selector must NOT be conflated with
  // the in-agent orchestrator setting (GenerativeActionsEnabled) — see configJson.
  var VERIFIED_NEW_EXPERIENCE_SHAPE = false;

  var GENERIC_DOMAIN = "the tasks described here";

  // A sensible authoring pipeline order so the numbered plan / examples read as a
  // flow regardless of the order steps were detected in.
  var STEP_ORDER = ["classify", "extract", "answer", "update", "route", "create",
    "provision", "draft", "approve", "notify", "escalation", "process", "respond"];

  // Short mission phrases per step id — used to SYNTHESIZE the purpose/description
  // from the detected outline instead of echoing the user's first sentence.
  var STEP_MISSION = {
    classify: "triage and prioritize each request",
    answer: "answer questions from your connected knowledge",
    respond: "respond to each request",
    process: "work through each incoming item",
    route: "route work to the right owner",
    create: "log tickets and records",
    update: "look up and update records",
    notify: "send updates and summaries",
    provision: "carry out actions like resets and bookings",
    extract: "pull key details out of documents",
    draft: "draft and summarize content",
    approve: "run the approval steps",
    escalation: "hand off to a person when it's needed"
  };
  // Imperative, second-person task-plan lines for the "How you work" section.
  var STEP_PLAN = {
    classify: "Read each request and sort it by type, urgency, and intent.",
    answer: "Answer questions using the connected knowledge; if something isn't covered, say so plainly.",
    respond: "Respond to the request clearly and completely.",
    process: "Work through each incoming item one at a time.",
    route: "Route or assign the item to the right team or owner.",
    create: "Capture the needed details and, once the user confirms, create the record.",
    update: "Look up the relevant record and update it when asked — confirm the change first.",
    notify: "Draft the message, confirm it with the user, then send the notification or summary.",
    provision: "Confirm the details, then carry out the action (reset, provision, book, or cancel).",
    extract: "Read the document, pull out the fields that matter, and check them back with the user.",
    draft: "Draft the content, then refine it based on the user's feedback.",
    approve: "Start the approval and track it through to the outcome.",
    escalation: "Hand off to a person whenever the request is out of scope or sensitive."
  };
  // Short, generic few-shot exchanges per step id (no fabricated data). {D} = domain.
  var STEP_EXAMPLE = {
    answer: { u: "I have a question about {D}.", a: "Happy to help — what would you like to know? I'll answer from the connected content and tell you if it's something I can't confirm." },
    create: { u: "Can you open a ticket for this issue?", a: "I can do that. I'll capture the details, confirm them with you, and share the reference number once it's logged." },
    update: { u: "Can you check the status of my request and update it?", a: "Sure — I'll look it up and share the current status. If it needs a change, I'll confirm with you before updating." },
    notify: { u: "Please send the team a summary.", a: "Will do. Here's a short draft — say the word and I'll send it." },
    provision: { u: "I need my password reset.", a: "I can help with that. I'll confirm a couple of details, then run the reset and let you know when it's done." },
    draft: { u: "Draft a quick note about this for me.", a: "Here's a first draft. Tell me what to adjust and I'll refine it." },
    extract: { u: "Can you pull the key fields from this document?", a: "Yes — I'll extract the fields and show them back so you can confirm they're right." },
    approve: { u: "Kick off the approval for this.", a: "Got it. I'll start the approval and keep you posted on the outcome." },
    route: { u: "Who should handle this one?", a: "I'll route it to the right owner and confirm where it went." },
    classify: { u: "Here's an incoming request.", a: "Thanks — I'll sort it by type and priority, then take the right next step." }
  };
  // Suggested conversation starters per step id (interactive agents only). {D} = domain.
  var STEP_STARTER = {
    answer: "I have a question about {D}",
    create: "Open a ticket for me",
    update: "Check the status of my request",
    notify: "Send my team an update",
    provision: "Reset my password",
    draft: "Draft a message for me",
    extract: "Pull the details from this document",
    approve: "Start an approval for this",
    route: "Who should handle this?",
    classify: "Here's something to sort"
  };

  function uniq(arr) {
    var seen = {}, out = [];
    (arr || []).forEach(function (v) { if (v != null && !seen[v]) { seen[v] = 1; out.push(v); } });
    return out;
  }
  function orderSteps(steps) {
    return (steps || []).slice().sort(function (a, b) {
      var ia = STEP_ORDER.indexOf(a && a.id), ib = STEP_ORDER.indexOf(b && b.id);
      if (ia < 0) ia = 99; if (ib < 0) ib = 99;
      return ia - ib;
    });
  }
  function domainIsGeneric(d) { return !d || d === GENERIC_DOMAIN; }
  function cap(s) { s = String(s || ""); return s.charAt(0).toUpperCase() + s.slice(1); }

  // Audience inferred from the description; frames the synthesized purpose/description.
  function deriveAudience(desc) {
    var t = " " + String(desc || "").toLowerCase() + " ";
    if (/\b(employees?|staff|workforce|colleagues?|team members?|our people|hr)\b/.test(t)) return "employees";
    if (/\b(customers?|clients?|callers?|shoppers?|subscribers?)\b/.test(t)) return "customers";
    if (/\b(leaders?|executives?|execs?|managers?|directors?|leadership)\b/.test(t)) return "leaders";
    if (/\b(students?|learners?)\b/.test(t)) return "students";
    if (/\bpatients?\b/.test(t)) return "patients";
    if (/\b(citizens?|residents?|constituents?)\b/.test(t)) return "residents";
    if (/\b(partners?|vendors?|suppliers?|resellers?)\b/.test(t)) return "partners";
    return "users";
  }

  function firstSentence(desc) {
    var t = String(desc || "").trim().replace(/\s+/g, " ");
    if (!t) return "";
    var end = t.search(/[.!?](\s|$)/);
    return end > 0 ? t.slice(0, end + 1) : t;
  }
  // Synthesize the agent's mission in its OWN framing from the detected outline
  // (steps → connectors → knowledge → domain), rather than echoing the description's
  // first sentence verbatim. Deterministic; no fabricated data.
  function derivePurpose(name, desc, ctx) {
    ctx = ctx || {};
    var audience = ctx.audience || deriveAudience(desc);
    var domain = ctx.domain || deriveDomain(name);
    var phrases = uniq(orderSteps(ctx.steps || []).map(function (s) { return STEP_MISSION[s.id]; })).slice(0, 3);
    if (!phrases.length) {
      var conns = uniq((ctx.connectors || []).map(function (c) { return c.guidanceVerb; }));
      if ((ctx.knowledge || []).length) conns.unshift("answer questions from your connected knowledge");
      phrases = uniq(conns).slice(0, 3);
    }
    if (!phrases.length) {
      var dl = domainIsGeneric(domain) ? "their requests" : domain;
      return "Your job is to help " + audience + " with " + dl + " — accurately, and only within that scope.";
    }
    return "Your job is to " + joinAnd(phrases) + " for " + audience + ".";
  }
  function deriveDomain(name) {
    var d = String(name || "").replace(/\b(agent|bot|assistant|copilot)\b/ig, "").replace(/\s+/g, " ").trim();
    if (d && d.toLowerCase() !== "custom" && d.length >= 3) return d;
    return GENERIC_DOMAIN;
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
  // A short "inputs it needs" hint per tool, keyed off the verified action name.
  function toolInputsHint(c) {
    var n = (c.actionName || "").toLowerCase();
    if (/send an email/.test(n)) return "the recipient, subject, and body";
    if (/get emails/.test(n)) return "the mailbox or folder to read";
    if (/get events|calendar/.test(n)) return "the date range to look at";
    if (/post a message|post message/.test(n)) return "the channel and the message";
    if (/get messages/.test(n)) return "the channel to read";
    if (/create file/.test(n)) return "the file name, folder, and content";
    if (/get file/.test(n)) return "the file path";
    if (/get items|list records|list rows/.test(n)) return "the filter or query";
    if (/get record|get a row/.test(n)) return "the record id";
    if (/update/.test(n)) return "the record id and the fields to change";
    if (/create record|create a row|insert row/.test(n)) return "the record fields";
    if (/approval/.test(n)) return "the approver and what they're approving";
    if (/user profile|search for users/.test(n)) return "the name or email to look up";
    return null;
  }
  // A tool is a "write" (needs a confirm-before-run guardrail) when it sends/creates/
  // updates. Prefer the verified `kind`; fall back to the display name for direct calls.
  function isWriteTool(c) {
    if (c.kind) return c.kind === "write" || c.kind === "update";
    var s = ((c.actionName || "") + " " + (c.guidanceVerb || "")).toLowerCase();
    return /\b(send|create|post|add|insert|update|upload|save|start|delete|remove|write|log|raise|open|reset|provision)\b/.test(s);
  }
  // Response-format lines tuned to what the agent mostly does.
  function responseFormat(hasAnswer, hasAction, autonomous) {
    var lines = ["Be professional, clear, and concise. Lead with the answer, then add only the detail that helps."];
    if (hasAnswer) lines.push("For questions, give a direct answer first, then a short supporting detail; if it isn't covered, say so instead of guessing.");
    if (hasAction) lines.push("For actions, state what you did or will do, include any reference number or link, and confirm the next step.");
    if (autonomous) lines.push("Since you run unattended, record the outcome of each item succinctly and flag anything you couldn't complete.");
    return lines;
  }
  // Fallback numbered plan when the outline has no detected steps.
  function defaultPlan(hasAnswer, hasAction, hasKnowledge) {
    var p = ["Understand what the user is asking for."];
    if (hasAnswer || hasKnowledge) p.push("Answer from the connected knowledge; if it isn't covered, say so plainly.");
    if (hasAction) p.push("When an action is needed, confirm the details, then use the right tool.");
    p.push("Summarize what you did and confirm the next step.");
    return p;
  }
  // 1–3 short, generic few-shot exchanges from the detected steps (no fabricated data).
  function buildExamples(steps, domain, hasAnswer, autonomous) {
    var out = [];
    if (autonomous) {
      var acts = uniq(orderSteps(steps).map(function (s) { return STEP_MISSION[s.id]; })).slice(0, 3);
      out.push(["Trigger: a new item arrives.", "You: " + cap(acts.length ? joinAnd(acts) : "handle the item") + ", then stop — no chat needed."]);
      return out;
    }
    var ids = [], seen = {};
    var dph = domainIsGeneric(domain) ? "this" : domain;
    orderSteps(steps).forEach(function (s) { if (STEP_EXAMPLE[s.id] && !seen[s.id]) { seen[s.id] = 1; ids.push(s.id); } });
    if (!ids.length && hasAnswer) ids.push("answer");
    ids.slice(0, 3).forEach(function (id) {
      var ex = STEP_EXAMPLE[id];
      out.push(["User: " + ex.u.replace(/\{D\}/g, dph), "Agent: " + ex.a.replace(/\{D\}/g, dph)]);
    });
    return out;
  }
  // A one-paragraph agent description (distinct from the instructions), synthesized
  // from the outline — returned for the UI + documented in NEXT-STEPS.
  function agentDescription(name, desc, ctx) {
    ctx = ctx || {};
    var audience = ctx.audience || deriveAudience(desc);
    var phrases = uniq(orderSteps(ctx.steps || []).map(function (s) { return STEP_MISSION[s.id]; })).slice(0, 3);
    if (!phrases.length && (ctx.knowledge || []).length) phrases = ["answer questions from connected knowledge"];
    var does = phrases.length ? " that helps " + audience + " " + joinAnd(phrases) : " for " + audience;
    return name + " is a Copilot Studio agent" + does + ". It's a starter baseline — extend it with more tools, knowledge, and instructions.";
  }
  // Up to 3 suggested conversation starters from the outline (interactive agents only).
  function deriveStarters(steps, domain) {
    var out = [], seen = {};
    var dph = domainIsGeneric(domain) ? "this" : domain;
    orderSteps(steps).forEach(function (s) {
      var t = STEP_STARTER[s.id];
      if (t && !seen[s.id]) { seen[s.id] = 1; out.push(t.replace(/\{D\}/g, dph)); }
    });
    ["What can you help me with?", "How do you work?"].forEach(function (t) { if (out.length < 3) out.push(t); });
    return out.slice(0, 3);
  }
  // webBrowsing is enabled ONLY when the description implies a public-web lookup —
  // NOT merely because a public-site knowledge source is grounded (that's grounding).
  function impliesWebBrowsing(desc) {
    var t = " " + String(desc || "").toLowerCase() + " ";
    return /\b(search the web|on the web|from the web|web search|browse the (?:web|internet)|public internet|look[^.]{0,20}up online|latest news|current (?:news|events|weather|prices|exchange rate)|stock price|real[- ]?time (?:info|data|price))\b/.test(t);
  }

  // Doctrine: behavior lives in INSTRUCTIONS + TOOLS + KNOWLEDGE, never in authored
  // topics. Sections use markdown "## " headers so each stays a distinct block even
  // if a renderer collapses a single newline (fixes the role/Constraints run-together
  // bug). We deliberately avoid "search the knowledge / cite sources" phrasing — the
  // orchestrator retrieves and grounds on its own.
  function buildInstructions(name, desc, ctx) {
    ctx = ctx || {};
    var vars = ctx.vars || {};
    var connectors = ctx.connectors || [];
    var knowledge = ctx.knowledge || [];
    var capabilities = ctx.capabilities || [];
    var steps = orderSteps(ctx.steps || []);
    var autonomous = vars.archetype === "autonomous";
    var domain = deriveDomain(name);
    var audience = deriveAudience(desc);
    var purpose = derivePurpose(name, desc, { steps: steps, connectors: connectors, knowledge: knowledge, audience: audience, domain: domain });
    var hasAnswer = knowledge.length > 0 || steps.some(function (s) { return s.category === "answer_gen"; });
    var hasAction = connectors.length > 0 || steps.some(function (s) { return s.category === "action"; });
    var L = [];

    // 1) Role sentence + synthesized purpose (own framing, not a verbatim echo).
    L.push("You are " + name + ", an AI agent built in Microsoft Copilot Studio.");
    L.push(purpose);
    L.push("");

    // 2) Constraints (scope guardrail, write-safety confirm, optional escalation).
    L.push("## Constraints");
    L.push("- Only help with " + domain + ". If a request falls outside that, say you can't help with it and point the user to what you can do.");
    L.push("- Confirm with the user before any action that writes data, sends a message, or makes a change.");
    if (vars.hasEscalation) {
      L.push("- Escalate to a human when a request is out of scope, sensitive, or the user asks for a person.");
    }
    L.push("");

    // 3) How you work — a numbered task plan derived from the detected steps.
    L.push("## How you work");
    if (autonomous) {
      L.push("You run automatically when your trigger fires — no one is chatting with you. Work through each item end to end, then stop.");
    } else {
      L.push("Help the user directly. Ask a brief clarifying question only when you genuinely can't proceed without one.");
    }
    var planLines = uniq(steps.map(function (s) { return STEP_PLAN[s.id]; }));
    if (!planLines.length) planLines = defaultPlan(hasAnswer, hasAction, knowledge.length > 0);
    planLines.forEach(function (line, i) { L.push((i + 1) + ". " + line); });
    L.push("");

    // 4) Tools — per-tool WHEN / inputs / confirm-before-write guidance, referencing
    //    the package's ACTUAL tools + knowledge by their exact display names.
    if (connectors.length || knowledge.length || capabilities.length) {
      L.push("## Tools");
      connectors.forEach(function (c) {
        var verb = c.guidanceVerb || ("use " + (c.connectorLabel || "the connector"));
        var line = "- To " + verb + ", use the \"" + c.actionName + "\" tool";
        var inputs = toolInputsHint(c);
        if (inputs) line += " — provide " + inputs;
        if (isWriteTool(c)) line += (inputs ? ", and " : " — ") + "confirm with the user before it runs";
        L.push(line + ".");
      });
      if (connectors.length > 1) {
        L.push("- If a request needs more than one tool, use them in a sensible order and confirm before each change.");
      }
      if (knowledge.length) {
        var labels = uniq(knowledge.map(function (k) { return knowledgeShort(k.kind); })).join(", ");
        L.push("- Use the connected knowledge (" + labels + ") to answer questions about " + domain + ".");
      }
      // Read capabilities with no verified starter action: describe the behavior in
      // prose (do NOT name a /tool the package didn't emit) and point at NEXT-STEPS.md.
      if (capabilities.length) {
        L.push("- To do this, review " + joinAnd(capabilities.map(function (c) { return c.behavior; })) +
          ". Those read tools aren't wired into this package yet — add them in Copilot Studio (see NEXT-STEPS.md) before relying on that data.");
      }
      L.push("");
    }

    // 5) Response format — tuned to what the agent mostly does.
    L.push("## Response format");
    responseFormat(hasAnswer, hasAction, autonomous).forEach(function (line) { L.push("- " + line); });

    // 6) Examples — 2–3 short, generic exchanges from the detected steps.
    var examples = buildExamples(steps, domain, hasAnswer, autonomous);
    if (examples.length) {
      L.push("");
      L.push("## Examples");
      examples.forEach(function (pair, i) {
        if (i) L.push("");
        L.push(pair[0]);
        L.push(pair[1]);
      });
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
  // Each entry: interactive=true means it's a conversational entry point that only
  // makes sense for a user-facing chat agent (greeting, goodbye, thanks, fallback,
  // escalate, …). A verified autonomous (triggered, unattended) agent drops these and
  // keeps only plumbing (ConversationStart, OnError, Signin). See VERIFIED_AUTONOMOUS_SHAPE.
  var SYSTEM_TOPICS = [
    { suffix: "ConversationStart", name: "Conversation Start", data: topicSystem("OnConversationStart", "") },
    { suffix: "Greeting", name: "Greeting", interactive: true, data: topicIntent("Greeting", ["Hi", "Hello", "Hey there"], "Hello! How can I help you today?") },
    { suffix: "Goodbye", name: "Goodbye", interactive: true, data: topicIntent("Goodbye", ["Bye", "Goodbye", "See you"], "Goodbye! Reach out any time you need help.") },
    { suffix: "ThankYou", name: "Thank you", interactive: true, data: topicIntent("ThankYou", ["Thanks", "Thank you", "Appreciate it"], "You are welcome! Happy to help.") },
    { suffix: "StartOver", name: "Start Over", interactive: true, data: topicIntent("StartOver", ["Start over", "Restart", "Begin again"], "Sure, let us start over. What would you like to do?") },
    { suffix: "ResetConversation", name: "Reset Conversation", interactive: true, data: topicIntent("ResetConversation", ["Reset", "Clear the conversation"], "The conversation has been reset. How can I help?") },
    { suffix: "EndOfConversation", name: "End of Conversation", interactive: true, data: topicIntent("EndOfConversation", ["That is all", "I am done", "Nothing else"], "Great — glad I could help. Have a good day!") },
    { suffix: "Fallback", name: "Fallback", interactive: true, data: topicSystem("OnUnknownIntent", "Sorry, I did not quite get that. Could you rephrase your request?") },
    { suffix: "OnError", name: "On Error", data: topicSystem("OnError", "Something went wrong on my end. Please try again in a moment.") },
    { suffix: "MultipleTopicsMatched", name: "Multiple Topics Matched", interactive: true, data: topicSystem("OnSelectIntent", "I found a few things that might match. Which one did you mean?") },
    { suffix: "Signin", name: "Sign in", data: topicIntent("Signin", ["Sign in", "Log in", "Authenticate me"], "Let us get you signed in so I can help with that.") },
    { suffix: "Escalate", name: "Escalate", interactive: true, data: topicIntent("Escalate", ["Talk to a human", "Speak to an agent", "I want a person"], "No problem — I will connect you with a person who can help.") }
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
  // Narrow, explicit opt-in for CLASSIC in-agent orchestration. Default is GENERATIVE
  // (modern, recommended); we only flip GenerativeActionsEnabled off when the description
  // DIRECTLY calls for classic *orchestration*. Deliberately strict so it never fires by
  // accident: it requires a classic/topic-based keyword qualifying the word "orchestration"
  // (allowing a short bridge like a parenthetical synonym), OR "orchestration … classic",
  // OR "disable/turn off generative orchestration". The bridge forbids the words
  // "experience" and "generative" so "build in the classic EXPERIENCE with GENERATIVE
  // orchestration" (the harness axis) is NOT mistaken for a classic-orchestrator request.
  var CLASSIC_ORCH_RE = /\b(?:classic|traditional|legacy|topic[-\s]?based|trigger[-\s]?phrase(?:[-\s]?based)?)\b(?:(?!\b(?:experience|generative)\b)[^.]){0,20}?\borchestrat(?:ion|or)\b|\borchestrat(?:ion|or)\b(?:(?!\bgenerative\b)[^.]){0,16}?\bclassic\b|\b(?:disable|turn\s*off|no|without)\s+generative\s+orchestrat(?:ion|or)\b/;
  function detectClassicOrchestration(descLower) {
    return CLASSIC_ORCH_RE.test(descLower);
  }
  function configJson(schema, classicOrchestration) {
    // Emits the agent's runtime config. Two INDEPENDENT axes must never be conflated:
    //   • Authoring EXPERIENCE (classic vs new UI/harness) — does NOT touch this config.
    //   • In-agent ORCHESTRATOR (GenerativeActionsEnabled) — set HERE.
    // Doctrine: ALWAYS default to GENERATIVE orchestration (modern, recommended). Only emit
    // the classic orchestrator shape when the description DIRECTLY calls it out (a rare
    // escape hatch) — never by default, and never driven by the experience selector.
    if (classicOrchestration) {
      // Classic orchestration: generative actions OFF and NO GenerativeAIRecognizer.
      // NOTE: this classic-config shape is ASSUMED and should be verified against a real
      // classic-orchestration unmanaged export before relying on it in production. It only
      // triggers on an explicit call-out, so the verified generative default is unaffected.
      var clsCfg = {
        BotConfiguration: {
          GenerativeActionsEnabled: false,
          GPTSettings: { defaultSchemaName: schema + ".gpt.default" }
        }
      };
      return JSON.stringify(clsCfg, null, 2) + "\n";
    }
    var cfg = {
      BotConfiguration: {
        GenerativeActionsEnabled: true,
        GPTSettings: { defaultSchemaName: schema + ".gpt.default" },
        AISettings: { GenerativeAIRecognizer: true }
      }
    };
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
    var seen = {}, refs = [];
    connectors.forEach(function (c) {
      if (seen[c.logical]) return; // one <connectionreference> per shared connection
      seen[c.logical] = 1;
      refs.push('    <connectionreference connectionreferencelogicalname="' + xmlEsc(c.logical) + '">\n' +
        '      <connectionreferencedisplayname>' + xmlEsc(c.logical) + '</connectionreferencedisplayname>\n' +
        '      <connectorid>/providers/Microsoft.PowerApps/apis/' + xmlEsc(c.connector) + '</connectorid>\n' +
        '      <iscustomizable>0</iscustomizable>\n' +
        '      <promptingbehavior>0</promptingbehavior>\n' +
        '      <statecode>0</statecode>\n' +
        '      <statuscode>1</statuscode>\n' +
        '    </connectionreference>');
    });
    return '  <connectionreferences>\n' + refs.join("\n") + '\n  </connectionreferences>\n';
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
  function nextStepsMd(name, connectors, unmapped, knowledge, vars, capabilities, experience, meta, classicOrch) {
    vars = vars || {};
    capabilities = capabilities || [];
    meta = meta || {};
    var isNew = experience === "new";
    var newExpPending = isNew && !VERIFIED_NEW_EXPERIENCE_SHAPE;
    var L = [];
    L.push("# " + name + " — starter agent");
    L.push("");
    L.push("This is a **directional baseline** generated by the Copilot Credit Estimator from your");
    L.push("description. It imports as an **unmanaged** (fully editable) Copilot Studio agent so you");
    L.push("can extend it, then publish. It is a head start, **not** a production-ready agent.");
    L.push("");
    L.push("**Build target:** " + (isNew ? "New agent experience (requested)" : "Classic agent experience") + ".");
    L.push("");
    if (newExpPending) {
      // Honest fallback: the new experience is a different architecture we can't yet
      // emit verified, so we shipped the importable classic-experience package instead.
      L.push("## \u26a0 New-experience agent not generated yet");
      L.push("You selected the **new agent experience**, but that is a *fundamentally different architecture*");
      L.push("from the classic experience (a single instruction-driven agent with no topics, on the enhanced");
      L.push("orchestration runtime) and the two have **no import/migration path** between them. This tool");
      L.push("doesn't yet emit a verified new-experience solution, so **this download is the classic-experience");
      L.push("package** — it imports cleanly today. To move to the new experience: import this, then in Copilot");
      L.push("Studio's **new experience** create a new agent and paste in the Instructions below, re-add the");
      L.push("Knowledge sources, and re-add the Tools listed here. Microsoft recommends the new experience for");
      L.push("its deeper reasoning and higher response quality, especially over Microsoft 365 data.");
      L.push("");
    }
    if (classicOrch) {
      // Rare escape hatch: the description explicitly asked for classic orchestration, so
      // the config sets GenerativeActionsEnabled:false. Be loud that generative is preferred.
      L.push("This package uses **classic (topic-based) orchestration** because your description explicitly");
      L.push("asked for it (`GenerativeActionsEnabled` is off). Classic orchestration is **legacy** — Microsoft");
      L.push("recommends **generative orchestration** for nearly all agents (it reasons over your instructions,");
      L.push("tools, and knowledge instead of relying on authored topics and trigger phrases). Unless you have a");
      L.push("hard requirement for classic behavior, turn generative orchestration back on in Copilot Studio and");
      L.push("wire behavior through Tools + Knowledge + Instructions. If you do stay on classic, you must author");
      L.push("the topics/trigger phrases yourself in the maker portal — this package ships none.");
    } else {
      L.push("This is a **generative-orchestration** baseline (topics-as-last-resort): the agent's behavior");
      L.push("lives in its **instructions**, **tools**, and **knowledge** — not in authored topics. Extend it");
      L.push("by adding Tools and Knowledge and refining Instructions; only drop down to authoring a topic when");
      L.push("orchestration genuinely can't handle the case. The topics in this package are just system scaffolding.");
    }
    L.push("");
    // Autonomous fallback (STEP B): when the agent is autonomous but the verified
    // trigger shape isn't available yet, the package imports as an interactive chat
    // agent. Surface that prominently so the user wires the trigger + unattended run.
    if (vars.archetype === "autonomous" && !VERIFIED_AUTONOMOUS_SHAPE) {
      L.push("## ⚠ Make this run automatically (autonomous)");
      L.push("You described an **autonomous** (event-triggered, unattended) agent, but this starter imports as an");
      L.push("**interactive chat agent** — we do **not** emit the autonomous trigger because its exact export shape");
      L.push("isn't verified yet, and a wrong shape breaks import. Finish it in Copilot Studio after import:");
      L.push("1. Open the agent → **Triggers** → add the trigger for your event (e.g. *When a new email arrives*,");
      L.push("   *When a record is created*, *Recurrence/Scheduled*).");
      L.push("2. Move your instructions' steps into the trigger's flow so they run on each event.");
      L.push("3. Set the agent to run **unattended** (an application/service authentication, not interactive sign-in).");
      L.push("4. Remove the conversational entry points (greeting, goodbye, etc.) — they don't apply to a triggered agent.");
      L.push("");
    }
    L.push("## Import it");
    L.push("1. Go to **make.powerapps.com** (or **copilotstudio.microsoft.com**) → **Solutions** → **Import solution**.");
    L.push("2. Choose this .zip and continue.");
    L.push("3. On the **Connections** step, pick or create a connection for each connector below.");
    L.push("4. Click **Import** and wait for it to finish.");
    L.push("5. Open the agent, review everything, and **Publish**.");
    L.push("");
    if (connectors.length) {
      L.push("## Connections to set at import");
      L.push("Each **connector** below needs one connection (it covers every action listed under it):");
      var grp = {}, order = [];
      connectors.forEach(function (c) {
        if (!grp[c.connector]) { grp[c.connector] = { label: c.connectorLabel, actions: [] }; order.push(c.connector); }
        grp[c.connector].actions.push(c);
      });
      order.forEach(function (conn) {
        var g = grp[conn];
        L.push("- **" + g.label + "** — one connection, used by:");
        g.actions.forEach(function (c) {
          L.push("    - \"" + c.actionName + "\" (operation `" + c.operationId + "`).");
        });
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
    if (vars.hasFlow) toolItems.push("Add an **agent flow** for the multi-step automation you described, then attach it as a tool. Use the **\u201cWhen an agent calls the flow\u201d** trigger — that path is zero-rated (the flow runs don't consume extra credits).");
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
    // Agent description + suggested prompts. We do NOT write these into the package
    // (their exact export shape isn't verified — see VERIFIED_AGENT_METADATA), so we
    // surface them here for the user to set by hand after import.
    if (!VERIFIED_AGENT_METADATA && (meta.description || (meta.starters && meta.starters.length))) {
      L.push("## Agent description & suggested prompts (set these in the portal)");
      L.push("We didn't write these into the package (their exact export shape isn't verified yet), so set");
      L.push("them by hand after import — open the agent → **Details** (description) and **Suggested prompts**:");
      L.push("");
      if (meta.description) L.push("**Description:** " + meta.description);
      if (meta.starters && meta.starters.length) {
        L.push("");
        L.push("**Suggested prompts:**");
        meta.starters.forEach(function (t) { L.push("- " + t); });
      }
      L.push("");
    }
    L.push("_Document, website, SharePoint, and Dataverse knowledge grounding is free per run — it feeds");
    L.push("generative answers. Only tenant-graph grounding bills separately._");
    L.push("");
    return L.join("\n");
  }

  // Computes the "shape gaps" for the given description/vars: described abilities that
  // need a component whose serialization we can't yet verify, so they're documented +
  // flagged instead of emitted. Drives both NEXT-STEPS sections and the UI review note,
  // keeping the builder the single source of truth. Returns [{ id, kind, title, detail }].
  function shapeNotices(vars, experience) {
    vars = vars || {};
    var out = [];
    if (experience === "new" && !VERIFIED_NEW_EXPERIENCE_SHAPE) {
      out.push({
        id: "new-experience", kind: "experience",
        title: "New-experience agent not generated yet",
        detail: "The new agent experience is a different architecture (a single instruction-driven agent, no topics) with no import path from classic. This download is the classic-experience package, which imports today \u2014 after import, rebuild it in the new experience (paste the instructions, re-add knowledge + tools). See NEXT-STEPS.md."
      });
    }
    if (vars.archetype === "autonomous" && !VERIFIED_AUTONOMOUS_SHAPE) {
      out.push({
        id: "autonomous-trigger", kind: "autonomous",
        title: "Autonomous trigger not included",
        detail: "This starter imports as an interactive chat agent. Add the autonomous trigger and set the agent to run unattended in Copilot Studio after import — see NEXT-STEPS.md."
      });
    }
    if (vars.hasFlow && !VERIFIED_FLOW_SHAPE) {
      out.push({
        id: "agent-flow", kind: "flow",
        title: "Agent flow not included",
        detail: "The multi-step automation needs an agent flow wired as a tool (use the zero-rated \u201cWhen an agent calls the flow\u201d trigger). Add it in Copilot Studio after import — see NEXT-STEPS.md."
      });
    }
    if (vars.hasAI && !VERIFIED_CONTENT_TOOL_SHAPE) {
      out.push({
        id: "prompt-tool", kind: "ai",
        title: "Prompt tool not included",
        detail: "Generative drafting / summarizing / classifying needs a Prompt tool. Add it in Copilot Studio after import — see NEXT-STEPS.md."
      });
    }
    if (vars.hasContent && !VERIFIED_CONTENT_TOOL_SHAPE) {
      out.push({
        id: "content-tool", kind: "content",
        title: "Document-processing tool not included",
        detail: "Reading / extracting from documents needs a content-processing tool. Add it in Copilot Studio after import — see NEXT-STEPS.md."
      });
    }
    return out;
  }

  // ── Main entry point ──────────────────────────────────────────────────────
  function buildPackage(opts) {
    opts = opts || {};
    var desc = String(opts.description || "");
    var vars = opts.vars || {};
    var systems = opts.systems || (opts.outline && opts.outline.systems) || [];
    var steps = (opts.outline && opts.outline.steps) || []; // detected build outline -> instructions/metadata
    var experience = opts.experience === "new" ? "new" : "classic"; // default = classic (the verified, import-tested shape); new experience is gated below
    var name = (opts.name && String(opts.name).trim()) || deriveName(desc);
    var slug = slugify(name);
    var schema = "new_" + slug;
    var descLower = " " + desc.toLowerCase().replace(/\s+/g, " ") + " ";
    // In-agent orchestrator: generative by default; classic ONLY on an explicit call-out.
    var classicOrchestration = detectClassicOrchestration(descLower);

    // 1) Connectors implied by the description. Multiple actions may share a connector.
    //    - Text/system matches wire write + regex-detectable read/update actions.
    //    - Capability-driven reads (match:null) are wired in step 3b when promoted.
    var connectors = [];
    var pushed = {}; // dedupe by action key
    function pushAction(key) {
      if (pushed[key]) return;
      var c = CONNECTOR_ACTIONS[key];
      if (!c) return;
      pushed[key] = 1;
      connectors.push({
        key: key, connector: c.connector, abbrev: c.abbrev, operationId: c.operationId,
        actionName: c.actionName, actionSchema: c.actionSchema,
        actionSchemaName: schema + ".action." + c.actionSchema, guidanceVerb: c.guidanceVerb,
        modelDescription: c.modelDescription, connectorLabel: c.connectorLabel, kind: c.kind || "write"
      });
    }
    Object.keys(CONNECTOR_ACTIONS).forEach(function (key) {
      var c = CONNECTOR_ACTIONS[key];
      var byText = c.match && c.match.test(descLower);
      var bySystem = c.bySystem && systems.indexOf(c.systemLabel) >= 0; // SP/Teams need action-y text, not just channel/knowledge
      if (byText || bySystem) pushAction(key);
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

    // 3b) Read capabilities. When a capability links to verified action(s) (calendar,
    // email, Teams, people) we PROMOTE them to real wired connector tools. Capabilities
    // with no verified op (e.g. onedrive) stay as prose + NEXT-STEPS — never fabricated.
    var capabilities = [];
    detectCapabilities(descLower).forEach(function (cap) {
      if (cap.actions && cap.actions.length) cap.actions.forEach(pushAction);
      else capabilities.push(cap);
    });

    // 3) Unmapped systems (no wired connector at all) -> NEXT-STEPS. Compared against the
    // set of WIRED CONNECTORS (any action of that connector counts) BEFORE exclusions, so
    // a user-removed connector never re-surfaces as an "unmapped" system.
    var wiredConnectors = {};
    connectors.forEach(function (c) { wiredConnectors[c.connector] = 1; });
    var unmapped = systems.filter(function (s) {
      var conn = SYSTEM_TO_CONNECTOR[s];
      if (!conn) return true;                 // no known connector at all
      return !wiredConnectors[conn];          // known connector but not wired here
    });

    // 3c) Stable ids for knowledge sources so the review panel can address them.
    knowledge.forEach(function (k, i) { k.id = "k" + (i + 1); });

    // 3d) Honor edits from the Quick review panel: drop excluded connectors,
    // knowledge sources, and read-capabilities so they leave the package AND the
    // generated instructions / NEXT-STEPS. `unmapped` was computed from the FULL
    // detection above, so a user-removed connector simply disappears here.
    var excl = opts.exclude || {};
    var exConn = excl.connectors || [], exKnow = excl.knowledge || [], exCap = excl.capabilities || [];
    if (exConn.length) connectors = connectors.filter(function (c) { return exConn.indexOf(c.key) < 0; });
    if (exKnow.length) knowledge = knowledge.filter(function (k) { return exKnow.indexOf(k.id) < 0; });
    if (exCap.length) capabilities = capabilities.filter(function (c) { return exCap.indexOf(c.id) < 0; });

    // 3e) Assign ONE shared connection reference per connector (all of a connector's
    // actions bind to it — faithful to real exports and avoids duplicate connection
    // prompts at import). Done after exclusions so only surviving connectors get one.
    var connLogical = {};
    connectors.forEach(function (c) {
      if (!connLogical[c.connector]) connLogical[c.connector] = schema + "." + c.connector + ".shared-" + c.abbrev + "-" + guid();
      c.logical = connLogical[c.connector];
    });

    // Agent-level metadata synthesized from the outline: a description, up to 3
    // conversation starters (interactive agents only), and an intent-derived
    // webBrowsing capability. Computed once and shared by preview + build + NEXT-STEPS.
    var interactive = vars.archetype !== "autonomous";
    var domain = deriveDomain(name);
    var agentMeta = {
      description: agentDescription(name, desc, { steps: steps, knowledge: knowledge, audience: deriveAudience(desc) }),
      starters: interactive ? deriveStarters(steps, domain) : [],
      webBrowsing: impliesWebBrowsing(desc),
      modelNameHint: MODEL_NAME_HINT
    };

    // Dry-run / preview: return the detection summary for the review step — no bytes.
    if (opts.preview) {
      return {
        name: name, slug: slug, schema: schema, experience: experience,
        orchestrator: classicOrchestration ? "classic" : "generative",
        archetype: vars.archetype === "autonomous" ? "autonomous" : "interactive",
        connectors: connectors.map(function (c) {
          return { key: c.key, actionName: c.actionName, connectorLabel: c.connectorLabel, guidanceVerb: c.guidanceVerb };
        }),
        knowledge: knowledge.map(function (k) {
          return { id: k.id, kind: k.kind, label: knowledgeLabel(k.kind), site: k.site || null, placeholder: !!k.placeholder };
        }),
        unmapped: unmapped.slice(),
        capabilities: capabilities.map(function (c) { return { id: c.id, behavior: c.behavior, tool: c.tool }; }),
        metadata: agentMeta,
        notices: shapeNotices(vars, experience),
        shapeFlags: { autonomous: VERIFIED_AUTONOMOUS_SHAPE, flow: VERIFIED_FLOW_SHAPE, contentTool: VERIFIED_CONTENT_TOOL_SHAPE, newExperience: VERIFIED_NEW_EXPERIENCE_SHAPE },
        tenantGraph: vars.knowledge === "tenantGraph"
      };
    }

    // 4) Assemble the ZIP entries.
    var entries = [];
    var add = function (nm, data) { entries.push({ name: nm, data: data }); };

    add("solution.xml", solutionXml(slug, name));
    add("customizations.xml", customizationsXml(connectors));
    add("bots/" + schema + "/bot.xml", botXml(schema, name));
    add("bots/" + schema + "/configuration.json", configJson(schema, classicOrchestration));

    // GPT orchestration component (type 15). Instructions reference the tools +
    // knowledge determined above, by their exact display names, and describe any
    // read capabilities to add in prose.
    var gptSchema = schema + ".gpt.default";
    var instructions = buildInstructions(name, desc, { connectors: connectors, knowledge: knowledge, vars: vars, capabilities: capabilities, steps: steps });
    add("botcomponents/" + gptSchema + "/data", gptComponentData(instructions, agentMeta));
    add("botcomponents/" + gptSchema + "/botcomponent.xml", botcomponentXml(gptSchema, 15, name));

    // System topics (type 9) — scaffolding/plumbing only (greeting, error, sign-in,
    // escalate, …). Behavior is intentionally instruction/tool/knowledge-driven, so
    // we never author routing or action topics here; these stay untouched.
    //
    // A VERIFIED autonomous (triggered, unattended) agent drops the interactive-only
    // conversational entry points and keeps just plumbing. While the autonomous shape
    // is unverified (VERIFIED_AUTONOMOUS_SHAPE=false) we keep ALL system topics — i.e.
    // current import-safe behavior — and document the trigger gap in NEXT-STEPS + the UI.
    var dropInteractiveTopics = VERIFIED_AUTONOMOUS_SHAPE && vars.archetype === "autonomous";
    SYSTEM_TOPICS.forEach(function (t) {
      if (dropInteractiveTopics && t.interactive) return;
      var s = schema + ".topic." + t.suffix;
      add("botcomponents/" + s + "/data", t.data);
      add("botcomponents/" + s + "/botcomponent.xml", botcomponentXml(s, 9, t.name));
    });
    // NOTE: when VERIFIED_AUTONOMOUS_SHAPE flips true, emit the autonomous TRIGGER
    // component here (shape captured from tooling/golden-exports/autonomous-agent/) and
    // switch configJson to the unattended shape. We deliberately do NOT fabricate that
    // component while its serialization is unverified — see nextStepsMd's autonomous note.

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
    add("NEXT-STEPS.md", nextStepsMd(name, connectors, unmapped, knowledge, vars, capabilities, experience, agentMeta, classicOrchestration));

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
      experience: experience,
      orchestrator: classicOrchestration ? "classic" : "generative",
      metadata: agentMeta,
      notices: shapeNotices(vars, experience),
      shapeFlags: { autonomous: VERIFIED_AUTONOMOUS_SHAPE, flow: VERIFIED_FLOW_SHAPE, contentTool: VERIFIED_CONTENT_TOOL_SHAPE, newExperience: VERIFIED_NEW_EXPERIENCE_SHAPE },
      archetype: vars.archetype === "autonomous" ? "autonomous" : "interactive",
      tenantGraph: vars.knowledge === "tenantGraph"
    };
  }

  // Dry-run wrapper: returns the detection summary (name, experience, archetype,
  // connectors, knowledge, unmapped systems, read-capabilities) WITHOUT building bytes,
  // so the UI can show a review/confirm step before generating the .zip.
  function analyzePackage(opts) {
    opts = opts || {};
    var copy = {};
    for (var k in opts) if (Object.prototype.hasOwnProperty.call(opts, k)) copy[k] = opts[k];
    copy.preview = true;
    return buildPackage(copy);
  }

  function gptComponentData(instructions, meta) {
    meta = meta || {};
    var s = "kind: GptComponentMetadata\n" +
      yamlBlock("instructions", instructions, 0) + "\n";
    // Agent description + conversation starters: exact export shape is unverified, so
    // only emit them when VERIFIED_AGENT_METADATA is true. Otherwise they're returned
    // for the UI and documented in NEXT-STEPS.md instead of risking a broken import.
    if (VERIFIED_AGENT_METADATA && meta.description) {
      s += yamlBlock("description", meta.description, 0) + "\n";
    }
    if (VERIFIED_AGENT_METADATA && meta.starters && meta.starters.length) {
      s += "conversationStarters:\n";
      meta.starters.forEach(function (t) { s += "  - " + yamlInline(t) + "\n"; });
    }
    // webBrowsing is derived from intent (see impliesWebBrowsing) — true only when the
    // description implies a public-web lookup, otherwise false. modelNameHint is a
    // single named constant (MODEL_NAME_HINT).
    s += "gptCapabilities:\n  webBrowsing: " + (meta.webBrowsing ? "true" : "false") + "\n" +
      "aISettings:\n  model:\n    modelNameHint: " + MODEL_NAME_HINT + "\n";
    return s;
  }
  function knowledgeLabel(kind) {
    if (kind === "SharePointSearchSource") return "Knowledge — SharePoint";
    if (kind === "DataverseSearchSource") return "Knowledge — Dataverse";
    if (kind === "AzureAISearchSource") return "Knowledge — Azure AI Search";
    return "Knowledge — Website";
  }

  var api = {
    buildPackage: buildPackage,
    analyzePackage: analyzePackage,
    zipStore: zipStore,
    crc32: crc32,
    utf8: utf8,
    slugify: slugify,
    deriveName: deriveName,
    properName: properName,
    buildInstructions: buildInstructions,
    derivePurpose: derivePurpose,
    agentDescription: agentDescription,
    deriveStarters: deriveStarters,
    impliesWebBrowsing: impliesWebBrowsing,
    CONNECTOR_ACTIONS: CONNECTOR_ACTIONS,
    READ_CAPABILITIES: READ_CAPABILITIES,
    detectCapabilities: detectCapabilities,
    shapeNotices: shapeNotices,
    shapeFlags: { autonomous: VERIFIED_AUTONOMOUS_SHAPE, flow: VERIFIED_FLOW_SHAPE, contentTool: VERIFIED_CONTENT_TOOL_SHAPE, newExperience: VERIFIED_NEW_EXPERIENCE_SHAPE },
    SYSTEM_TOPICS: SYSTEM_TOPICS
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.EstimatorPackage = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

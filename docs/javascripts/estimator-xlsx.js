/* Dependency-free .xlsx writer + reader for the "Quick + Import" mode.
 *
 * Writer  : builds a real .xlsx (ZIP of SpreadsheetML) using STORED (method 0)
 *           entries so it stays fully synchronous — no CompressionStream. Text is
 *           emitted as inline strings so no sharedStrings table is needed on write.
 *           Enum columns get Excel data-validation dropdowns.
 * Reader  : parseXlsx(entries) takes the [{name,text}] array from EstimatorZip.readZip
 *           and returns the "Scenarios" sheet as a matrix (array of arrays). It handles
 *           BOTH inline strings AND a sharedStrings table (what Excel writes once the
 *           user re-saves), plus numbers and booleans.
 * CSV     : parseCsv/buildCsv as an Excel "Save As CSV" fallback.
 *
 * No external dependencies; works in the browser and under Node for tests.
 */
(function (root) {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Byte helpers (browser + Node, no Buffer)                            *
   * ------------------------------------------------------------------ */
  var _enc = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
  function strBytes(s) {
    if (_enc) return _enc.encode(s);
    // Fallback UTF-8 encoder (very old runtimes only).
    var out = [], i, c;
    for (i = 0; i < s.length; i++) {
      c = s.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
    return new Uint8Array(out);
  }
  function concatBytes(list) {
    var total = 0, i;
    for (i = 0; i < list.length; i++) total += list[i].length;
    var out = new Uint8Array(total), off = 0;
    for (i = 0; i < list.length; i++) { out.set(list[i], off); off += list[i].length; }
    return out;
  }
  function u16le(n) { return [n & 255, (n >>> 8) & 255]; }
  function u32le(n) { return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]; }

  /* ------------------------------------------------------------------ *
   * Minimal STORED-only ZIP writer                                     *
   * ------------------------------------------------------------------ */
  function crc32(bytes) {
    var c = ~0, i, k;
    for (i = 0; i < bytes.length; i++) {
      c ^= bytes[i];
      for (k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
    }
    return (~c) >>> 0;
  }
  // files = [{ name, data:Uint8Array }] → Uint8Array of a valid ZIP.
  function zipStore(files) {
    var locals = [], centrals = [], offset = 0, i;
    for (i = 0; i < files.length; i++) {
      var nameB = strBytes(files[i].name);
      var data = files[i].data;
      var crc = crc32(data);
      var len = data.length;
      var lh = [].concat(
        u32le(0x04034b50), u16le(20), u16le(0), u16le(0), u16le(0), u16le(0),
        u32le(crc), u32le(len), u32le(len), u16le(nameB.length), u16le(0)
      );
      var local = concatBytes([new Uint8Array(lh), nameB, data]);
      locals.push(local);
      var ch = [].concat(
        u32le(0x02014b50), u16le(20), u16le(20), u16le(0), u16le(0), u16le(0), u16le(0),
        u32le(crc), u32le(len), u32le(len),
        u16le(nameB.length), u16le(0), u16le(0), u16le(0), u16le(0), u32le(0), u32le(offset)
      );
      centrals.push(concatBytes([new Uint8Array(ch), nameB]));
      offset += local.length;
    }
    var localAll = concatBytes(locals);
    var cd = concatBytes(centrals);
    var eocd = [].concat(
      u32le(0x06054b50), u16le(0), u16le(0),
      u16le(files.length), u16le(files.length),
      u32le(cd.length), u32le(localAll.length), u16le(0)
    );
    return concatBytes([localAll, cd, new Uint8Array(eocd)]);
  }

  /* ------------------------------------------------------------------ *
   * XML helpers + SpreadsheetML generation                             *
   * ------------------------------------------------------------------ */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }
  function colLetter(n) { // 0-based → A, B, ... Z, AA
    var s = "";
    n = n + 1;
    while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
    return s;
  }
  function isNum(v) { return typeof v === "number" && isFinite(v); }

  // rows: array of arrays of cell values (string|number|null). style: 1-based row
  // indices (as a set) to render with the bold header style s="1".
  function sheetXml(rows, opts) {
    opts = opts || {};
    var boldRows = opts.boldRows || {};
    var cols = opts.cols || null;
    var validations = opts.validations || null;
    var out = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'];
    out.push('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">');
    if (cols) {
      out.push("<cols>");
      for (var c = 0; c < cols.length; c++) {
        out.push('<col min="' + (c + 1) + '" max="' + (c + 1) + '" width="' + cols[c] + '" customWidth="1"/>');
      }
      out.push("</cols>");
    }
    out.push("<sheetData>");
    for (var r = 0; r < rows.length; r++) {
      var rowNum = r + 1;
      var bold = !!boldRows[rowNum];
      var cells = rows[r] || [];
      var rowXml = '<row r="' + rowNum + '">';
      var any = false;
      for (var k = 0; k < cells.length; k++) {
        var v = cells[k];
        if (v == null || v === "") continue; // omit empty cells
        var ref = colLetter(k) + rowNum;
        var sAttr = bold ? ' s="1"' : "";
        if (isNum(v)) {
          rowXml += '<c r="' + ref + '"' + sAttr + '><v>' + v + "</v></c>";
        } else {
          rowXml += '<c r="' + ref + '" t="inlineStr"' + sAttr + '><is><t xml:space="preserve">' + esc(v) + "</t></is></c>";
        }
        any = true;
      }
      rowXml += "</row>";
      if (any || bold) out.push(rowXml);
    }
    out.push("</sheetData>");
    if (validations && validations.length) {
      out.push('<dataValidations count="' + validations.length + '">');
      for (var d = 0; d < validations.length; d++) {
        var dv = validations[d];
        out.push('<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1" sqref="' +
          dv.sqref + '"><formula1>"' + dv.list.join(",") + '"</formula1></dataValidation>');
      }
      out.push("</dataValidations>");
    }
    out.push("</worksheet>");
    return out.join("");
  }

  var CONTENT_TYPES =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
    '<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
    '<Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
    "</Types>";

  var ROOT_RELS =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
    "</Relationships>";

  var WORKBOOK =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    "<sheets>" +
    '<sheet name="Instructions" sheetId="1" r:id="rId1"/>' +
    '<sheet name="Examples" sheetId="2" r:id="rId2"/>' +
    '<sheet name="Scenarios" sheetId="3" r:id="rId3"/>' +
    "</sheets></workbook>";

  var WORKBOOK_RELS =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>' +
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/>' +
    '<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    "</Relationships>";

  var STYLES =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
    '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
    '<borders count="1"><border/></borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
    '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs>' +
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
    "</styleSheet>";

  // Enum columns → dropdown lists (matched to IMPORT_SCHEMA order/keys).
  var ENUM_LISTS = {
    archetype: ["Interactive", "Autonomous"],
    channel: ["Chat", "Voice"],
    knowledge: ["None", "Documents", "Tenant graph"],
    deployment: ["Embedded", "Standalone"],
    bool: ["Yes", "No"]
  };

  function buildTemplate(schemaArg, examplesArg) {
    var EC = root.EstimatorCore || {};
    var schema = schemaArg || EC.IMPORT_SCHEMA;
    var examples = examplesArg || EC.IMPORT_EXAMPLES || [];
    if (!schema) throw new Error("buildTemplate needs IMPORT_SCHEMA (load estimator-core.js first).");

    var headers = schema.map(function (c) { return c.header; });
    var keys = schema.map(function (c) { return c.key; });

    /* Instructions sheet */
    var instr = [
      ["Copilot Credit Estimator — batch import template"],
      ["Fill in the Scenarios sheet (one row per agent), save, then import this file into the Quick + Import tab."],
      ["Leave a cell blank to accept the default. Enum columns have dropdowns; the Examples sheet is prefilled."],
      [""],
      ["Column", "Applies to", "What to enter"]
    ];
    var applies = {
      archetype: "All", channel: "Interactive", knowledge: "All",
      actionsCount: "All", systemsCount: "All", hasContent: "All", hasAI: "All",
      hasFlow: "All", hasEscalation: "All", users: "Interactive", interactions: "Interactive",
      deployment: "Interactive", licensePct: "Interactive", events: "Autonomous",
      genAnswers: "Autonomous", description: "All", name: "All"
    };
    for (var s = 0; s < schema.length; s++) {
      instr.push([schema[s].header, applies[schema[s].key] || "All", schema[s].hint || ""]);
    }
    instr.push([""]);
    instr.push(["Enum values — Agent type: Interactive / Autonomous · Channel: Chat / Voice · " +
      "Knowledge: None / Documents / Tenant graph · Deployment: Embedded / Standalone · Yes/No columns: Yes / No"]);

    /* Examples sheet */
    var exRows = [headers];
    for (var e = 0; e < examples.length; e++) {
      exRows.push(keys.map(function (k) {
        var v = examples[e][k];
        return v == null ? "" : v;
      }));
    }

    /* Scenarios sheet (header only; validations apply to the empty range below) */
    var scRows = [headers];

    // Data validations, keyed by schema column position.
    var validations = [];
    var boolCols = [];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i], L = colLetter(i);
      if (key === "archetype") validations.push({ sqref: L + "2:" + L + "201", list: ENUM_LISTS.archetype });
      else if (key === "channel") validations.push({ sqref: L + "2:" + L + "201", list: ENUM_LISTS.channel });
      else if (key === "knowledge") validations.push({ sqref: L + "2:" + L + "201", list: ENUM_LISTS.knowledge });
      else if (key === "deployment") validations.push({ sqref: L + "2:" + L + "201", list: ENUM_LISTS.deployment });
      else if (/^has/.test(key)) boolCols.push(L);
    }
    for (var b = 0; b < boolCols.length; b++) {
      validations.push({ sqref: boolCols[b] + "2:" + boolCols[b] + "201", list: ENUM_LISTS.bool });
    }

    var wideCols = headers.map(function (h, idx) {
      return keys[idx] === "description" ? 40 : (keys[idx] === "name" ? 24 : Math.max(12, Math.min(20, h.length + 2)));
    });

    var files = [
      { name: "[Content_Types].xml", data: strBytes(CONTENT_TYPES) },
      { name: "_rels/.rels", data: strBytes(ROOT_RELS) },
      { name: "xl/workbook.xml", data: strBytes(WORKBOOK) },
      { name: "xl/_rels/workbook.xml.rels", data: strBytes(WORKBOOK_RELS) },
      { name: "xl/styles.xml", data: strBytes(STYLES) },
      { name: "xl/worksheets/sheet1.xml", data: strBytes(sheetXml(instr, { boldRows: { 1: true, 5: true }, cols: [28, 16, 60] })) },
      { name: "xl/worksheets/sheet2.xml", data: strBytes(sheetXml(exRows, { boldRows: { 1: true }, cols: wideCols })) },
      { name: "xl/worksheets/sheet3.xml", data: strBytes(sheetXml(scRows, { boldRows: { 1: true }, cols: wideCols, validations: validations })) }
    ];
    return zipStore(files);
  }

  /* ------------------------------------------------------------------ *
   * Reader                                                             *
   * ------------------------------------------------------------------ */
  function xmlUnescape(s) {
    return String(s == null ? "" : s)
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
      .replace(/&#x([0-9a-fA-F]+);/g, function (_, h) { return String.fromCharCode(parseInt(h, 16)); })
      .replace(/&#(\d+);/g, function (_, d) { return String.fromCharCode(parseInt(d, 10)); })
      .replace(/&amp;/g, "&");
  }
  function attrStr(attrs, name) {
    var m = attrs.match(new RegExp("\\b" + name.replace(":", "\\:") + '\\s*=\\s*"([^"]*)"'));
    return m ? m[1] : "";
  }
  function colIndexFromRef(ref) {
    var m = /^([A-Za-z]+)/.exec(ref || "");
    if (!m) return 0;
    var s = m[1].toUpperCase(), n = 0, i;
    for (i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64);
    return n - 1;
  }
  function findEntry(entries, suffix) {
    suffix = suffix.toLowerCase().replace(/^\//, "");
    for (var i = 0; i < entries.length; i++) {
      var n = (entries[i].name || "").toLowerCase().replace(/^\//, "");
      if (n === suffix || n.slice(-(suffix.length + 1)) === "/" + suffix) return entries[i];
    }
    return null;
  }
  function parseSharedStrings(text) {
    var out = [];
    if (!text) return out;
    var reSi = /<si\b[^>]*>([\s\S]*?)<\/si>/g, m;
    while ((m = reSi.exec(text))) {
      var inner = m[1], t = "", reT = /<t\b[^>]*>([\s\S]*?)<\/t>/g, mt;
      while ((mt = reT.exec(inner))) t += xmlUnescape(mt[1]);
      out.push(t);
    }
    return out;
  }
  function cellText(inner) {
    var parts = inner.match(/<t\b[^>]*>([\s\S]*?)<\/t>/g);
    if (!parts) return "";
    return parts.map(function (x) {
      return xmlUnescape(x.replace(/^<t\b[^>]*>/, "").replace(/<\/t>$/, ""));
    }).join("");
  }
  function firstV(inner) {
    var m = inner.match(/<v\b[^>]*>([\s\S]*?)<\/v>/);
    return m ? xmlUnescape(m[1]) : "";
  }
  function parseSheet(text, shared) {
    var matrix = [];
    var reRow = /<row\b([^>]*?)(\/>|>([\s\S]*?)<\/row>)/g, mr;
    var autoRow = 0;
    while ((mr = reRow.exec(text))) {
      var rowAttrs = mr[1], selfClose = mr[2] === "/>", body = selfClose ? "" : mr[3];
      var rAttr = attrStr(rowAttrs, "r");
      var rowIdx = rAttr ? parseInt(rAttr, 10) - 1 : autoRow;
      autoRow = rowIdx + 1;
      var cells = [];
      if (!selfClose) {
        var reC = /<c\b([^>]*?)(\/>|>([\s\S]*?)<\/c>)/g, mc, autoCol = 0;
        while ((mc = reC.exec(body))) {
          var cAttrs = mc[1], cSelf = mc[2] === "/>", cInner = cSelf ? "" : mc[3];
          var ref = attrStr(cAttrs, "r");
          var t = attrStr(cAttrs, "t");
          var col = ref ? colIndexFromRef(ref) : autoCol;
          autoCol = col + 1;
          var val = "";
          if (!cSelf) {
            if (t === "inlineStr") val = cellText(cInner);
            else if (t === "s") { var idx = parseInt(firstV(cInner), 10); val = (shared[idx] != null) ? shared[idx] : ""; }
            else if (t === "str") val = xmlUnescape(firstV(cInner));
            else val = firstV(cInner); // number, boolean, or default
          }
          cells[col] = val;
        }
      }
      for (var i = 0; i < cells.length; i++) if (cells[i] == null) cells[i] = "";
      matrix[rowIdx] = cells;
    }
    for (var j = 0; j < matrix.length; j++) if (!matrix[j]) matrix[j] = [];
    return matrix;
  }

  // entries = [{name,text}] from EstimatorZip.readZip. Returns {sheetName, matrix}.
  function parseXlsx(entries) {
    if (!entries || !entries.length) throw new Error("Empty workbook — nothing to read.");
    var wb = findEntry(entries, "xl/workbook.xml");
    if (!wb) throw new Error("That doesn't look like an .xlsx workbook (no xl/workbook.xml).");
    var relsEntry = findEntry(entries, "xl/_rels/workbook.xml.rels");
    var shared = parseSharedStrings((findEntry(entries, "xl/sharedStrings.xml") || {}).text || "");

    var sheets = [], reS = /<sheet\b([^>]*?)\/?>/g, ms;
    while ((ms = reS.exec(wb.text))) {
      sheets.push({ name: xmlUnescape(attrStr(ms[1], "name")), rid: attrStr(ms[1], "r:id") || attrStr(ms[1], "id") });
    }
    var ridMap = {};
    if (relsEntry) {
      var reR = /<Relationship\b([^>]*?)\/?>/g, mrr;
      while ((mrr = reR.exec(relsEntry.text))) {
        var id = attrStr(mrr[1], "Id"), tg = attrStr(mrr[1], "Target");
        if (id && tg) ridMap[id] = tg;
      }
    }

    // Prefer a sheet named like "Scenarios"; else the last sheet.
    var chosen = null, i;
    for (i = 0; i < sheets.length; i++) if (/scenario/i.test(sheets[i].name)) { chosen = sheets[i]; break; }
    if (!chosen && sheets.length) chosen = sheets[sheets.length - 1];

    var sheetEntry = null;
    if (chosen && ridMap[chosen.rid]) {
      var target = ridMap[chosen.rid].replace(/^\//, "").replace(/^xl\//, "");
      sheetEntry = findEntry(entries, "xl/" + target) || findEntry(entries, target);
    }
    if (!sheetEntry) {
      // Fallback: worksheet whose sheetN index matches the chosen sheet's order, else the last.
      var ws = entries.filter(function (e) { return /xl\/worksheets\/sheet\d+\.xml$/i.test(e.name || ""); })
        .sort(function (a, b) {
          var na = parseInt((a.name.match(/sheet(\d+)\.xml$/i) || [])[1] || 0, 10);
          var nb = parseInt((b.name.match(/sheet(\d+)\.xml$/i) || [])[1] || 0, 10);
          return na - nb;
        });
      var pos = chosen ? sheets.indexOf(chosen) : ws.length - 1;
      sheetEntry = ws[pos] || ws[ws.length - 1] || null;
    }
    if (!sheetEntry) throw new Error("Couldn't find a worksheet to read inside the workbook.");

    return { sheetName: chosen ? chosen.name : "", matrix: parseSheet(sheetEntry.text, shared) };
  }

  /* ------------------------------------------------------------------ *
   * CSV                                                                *
   * ------------------------------------------------------------------ */
  function parseCsv(text) {
    text = String(text == null ? "" : text).replace(/^\uFEFF/, "");
    var rows = [], row = [], field = "", i = 0, inQ = false, ch;
    while (i < text.length) {
      ch = text[i];
      if (inQ) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
          inQ = false; i++; continue;
        }
        field += ch; i++; continue;
      }
      if (ch === '"') { inQ = true; i++; continue; }
      if (ch === ",") { row.push(field); field = ""; i++; continue; }
      if (ch === "\r") { i++; continue; }
      if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
      field += ch; i++;
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    return rows;
  }
  function buildCsv(matrix) {
    function cell(v) {
      v = String(v == null ? "" : v);
      return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    }
    return (matrix || []).map(function (r) { return (r || []).map(cell).join(","); }).join("\r\n");
  }

  var api = {
    buildTemplate: buildTemplate,
    parseXlsx: parseXlsx,
    parseCsv: parseCsv,
    buildCsv: buildCsv,
    // exposed for tests
    zipStore: zipStore,
    colLetter: colLetter,
    _parseSheet: parseSheet,
    _parseSharedStrings: parseSharedStrings
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.EstimatorXlsx = api;
})(typeof globalThis !== "undefined" ? globalThis : this);

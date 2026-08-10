/* AI Builder → Copilot Credits mapper — UI logic.
 *
 * Renders a guided, step-based estimator and runs the two estimation modes. All
 * math is delegated to ai-builder-rates.js (the grounded single source of truth)
 * so this file only owns presentation + input handling.
 *
 * Guided flow:
 *   Step 1  mode — a segmented control:
 *             usage   — enter monthly VOLUME per capability in its native unit
 *                       (pages / images / 1k tokens / 1k chars). Most accurate.
 *             credits — enter your CURRENT monthly AI Builder credits per
 *                       capability (from the PPAC AI Builder consumption report).
 *                       We back out the volume and forward it to Copilot Credits.
 *   Step 2  chooser — pick only the capabilities you use (progressive disclosure),
 *             grouped by "Text & generative AI" vs "Content processing". Presets
 *             select chips + fill values.
 *   Step 3  inputs — one row per picked capability, each with a live per-row
 *             conversion hint so the active mode visibly matters.
 *   Results — a side-by-side compare card (AI Builder today → Copilot Credits)
 *             that makes the dollars story obvious, plus a per-capability table.
 *
 * Everything runs in the browser; nothing is uploaded.
 */
(function () {
  "use strict";

  var Rates = (typeof window !== "undefined" && window.AIBuilderRates) || null;

  // ── formatting helpers (match credit-estimator.js house style) ────────────
  function fmt(n) {
    if (!isFinite(n)) return "0";
    if (Math.abs(n) >= 1000) return Math.round(n).toLocaleString();
    if (n % 1 === 0) return n.toLocaleString();
    return (Math.round(n * 100) / 100).toLocaleString();
  }
  function money(n) {
    if (!isFinite(n)) return "$0";
    if (n >= 100) return "$" + Math.round(n).toLocaleString();
    if (n >= 1) return "$" + (Math.round(n * 100) / 100).toLocaleString();
    return "$" + (Math.round(n * 1000) / 1000).toLocaleString();
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // STATE.values keeps typed numbers keyed by capability id so progressive
  // show/hide of rows never loses input. STATE.selected tracks picked chips.
  // Import state: parsed rows + per-row capability mapping (Path A), and the
  // total + capability mix allocation (Path B).
  var STATE = {
    mode: "usage", values: {}, selected: {}, last: null,
    importPath: "paste",
    parsed: [],            // Path A: [{ label, value, capId }]
    total: "",             // Path B: total AI Builder credits
    alloc: {}              // Path B: { capId: percent }
  };

  // Example presets — quick starting points (values are per-month volumes in
  // each capability's native unit, keyed by capability id).
  var PRESETS = {
    invoice: {
      label: "Invoice / receipt shop",
      values: { prebuilt_doc: 5000, text_simple: 2000 }
    },
    docs: {
      label: "Document-heavy ops",
      values: { custom_doc: 12000, ocr: 8000, contract_health_imgdesc: 1500 }
    },
    text: {
      label: "Text analytics",
      values: { text_simple: 50000, text_advanced: 20000, translation: 10000 }
    },
    prompts: {
      label: "GenAI prompts",
      values: { prompt_standard: 40000, prompt_basic: 15000 }
    }
  };

  // ── DOM helpers ───────────────────────────────────────────────────────────
  function $(id) { return document.getElementById(id); }
  function rowInputId(id) { return "aib-in-" + id; }
  function rowOutId(id) { return "aib-out-" + id; }
  function chipId(id) { return "aib-chip-" + id; }

  function inputValue(id) {
    var v = parseFloat(String(STATE.values[id]).replace(/,/g, ""));
    return isFinite(v) && v > 0 ? v : 0;
  }

  function unitLabelFor(c) {
    return STATE.mode === "credits"
      ? "AI Builder credits / month"
      : (Rates.UNIT_HELP[c.unitKey] || (c.unit + " / month"));
  }

  // Short unit noun for inline hints, e.g. "pages", "images", "1k tokens".
  function shortUnit(c) {
    if (c.unitKey === "page") return "pages";
    if (c.unitKey === "image") return "images";
    if (c.unitKey === "ktokens") return "×1k tokens";
    if (c.unitKey === "kchars") return "×1k chars";
    return c.unit;
  }

  // ── Step 2: capability chooser (grouped chips) ────────────────────────────
  function buildChooser() {
    var host = $("aib-chooser");
    if (!host || !Rates) return;
    var groups = {};
    Rates.CAPABILITIES.forEach(function (c) {
      (groups[c.group] = groups[c.group] || []).push(c);
    });
    var html = "";
    Object.keys(groups).forEach(function (g) {
      html += '<div class="aib-chooser-group">';
      html += '<div class="aib-group-label">' + esc(g) + "</div>";
      html += '<div class="aib-chips">';
      groups[g].forEach(function (c) {
        var on = !!STATE.selected[c.id];
        html +=
          '<button type="button" id="' + chipId(c.id) + '" ' +
            'class="aib-chip-cap' + (on ? " aib-chip-cap--on" : "") + '" ' +
            'aria-pressed="' + (on ? "true" : "false") + '" ' +
            'onclick="aibToggleCap(\'' + c.id + '\')">' +
            '<span class="aib-chip-mark">' + (on ? "\u2713" : "+") + "</span>" +
            esc(chipLabel(c)) +
          "</button>";
      });
      html += "</div></div>";
    });
    host.innerHTML = html;
  }

  // Compact chip label: keep the meaningful head, drop the long
  // "— sentiment, language detection, ..." descriptor tails, and trim the
  // redundant "LLM model" suffix so the three prompt tiers stay distinct.
  function chipLabel(c) {
    var s = c.label.replace(/ LLM model$/, "");
    var idx = s.indexOf(" \u2014 ");
    if (idx !== -1) {
      var tail = s.slice(idx + 3);
      if (tail.indexOf(",") !== -1) s = s.slice(0, idx); // strip only long comma lists
    }
    return s;
  }

  function updateChip(id) {
    var el = $(chipId(id));
    if (!el) return;
    var on = !!STATE.selected[id];
    el.classList.toggle("aib-chip-cap--on", on);
    el.setAttribute("aria-pressed", on ? "true" : "false");
    var mark = el.querySelector(".aib-chip-mark");
    if (mark) mark.textContent = on ? "\u2713" : "+";
  }

  // ── Step 3: input rows for selected capabilities only ─────────────────────
  function buildRows(focusId) {
    var host = $("aib-rows");
    if (!host || !Rates) return;
    var selected = Rates.CAPABILITIES.filter(function (c) { return STATE.selected[c.id]; });

    var empty = $("aib-empty");
    var resetBtn = $("aib-reset-btn");
    if (!selected.length) {
      host.innerHTML = "";
      if (empty) empty.classList.remove("em-hidden");
      if (resetBtn) resetBtn.classList.add("em-hidden");
      return;
    }
    if (empty) empty.classList.add("em-hidden");
    if (resetBtn) resetBtn.classList.remove("em-hidden");

    host.innerHTML = selected.map(rowHtml).join("");

    // wire inputs → STATE + live recompute
    selected.forEach(function (c) {
      var el = $(rowInputId(c.id));
      if (!el) return;
      el.addEventListener("input", function () {
        STATE.values[c.id] = el.value;
        updateRowOut(c);
        recompute();
      });
    });
    // refresh per-row hints
    selected.forEach(updateRowOut);

    if (focusId) {
      var f = $(rowInputId(focusId));
      if (f && f.focus) { try { f.focus(); } catch (e) {} }
    }
  }

  function rowHtml(c) {
    var val = STATE.values[c.id] != null && STATE.values[c.id] !== "" ? esc(String(STATE.values[c.id])) : "";
    var ph = STATE.mode === "credits" ? "AI Builder credits" : "monthly " + shortUnit(c);
    return (
      '<div class="aib-row">' +
        '<label class="aib-row-label" for="' + rowInputId(c.id) + '">' +
          '<span class="aib-cap">' + esc(chipLabel(c)) + "</span>" +
          '<span class="aib-unit">' + esc(unitLabelFor(c)) + "</span>" +
          '<span class="aib-rowout" id="' + rowOutId(c.id) + '"></span>' +
        "</label>" +
        '<input type="number" min="0" step="any" inputmode="decimal" ' +
          'class="aib-input" id="' + rowInputId(c.id) + '" value="' + val + '" ' +
          'placeholder="' + esc(ph) + '" aria-label="' + esc(chipLabel(c)) + ' ' +
          (STATE.mode === "credits" ? "monthly AI Builder credits" : "monthly volume") + '">' +
        '<button type="button" class="aib-remove" title="Remove ' + esc(chipLabel(c)) +
          '" aria-label="Remove ' + esc(chipLabel(c)) + '" onclick="aibToggleCap(\'' + c.id + '\')">\u00d7</button>' +
      "</div>"
    );
  }

  // Live per-row conversion hint — makes the active mode visibly consequential.
  function updateRowOut(c) {
    var out = $(rowOutId(c.id));
    if (!out) return;
    var v = inputValue(c.id);
    if (!(v > 0)) { out.textContent = ""; return; }
    var r = STATE.mode === "credits" ? Rates.fromAibCredits(c.id, v) : Rates.fromVolume(c.id, v);
    if (STATE.mode === "credits") {
      out.textContent = "\u2192 " + fmt(r.copilotCredits) + " Copilot Credits (" + money(r.copilotUSD) + "/mo)";
    } else {
      out.textContent = "\u2192 " + fmt(r.copilotCredits) + " Copilot Credits (" + money(r.copilotUSD) +
        "/mo) \u00b7 " + fmt(r.aibCredits) + " AIB credits today";
    }
  }

  // ── Compute ───────────────────────────────────────────────────────────────
  function compute() {
    var rows = [];
    var totalCC = 0, totalCCUSD = 0, totalAIB = 0, totalAIBUSD = 0;
    Rates.CAPABILITIES.forEach(function (c) {
      if (!STATE.selected[c.id]) return;
      var v = inputValue(c.id);
      if (!(v > 0)) return;
      var r = STATE.mode === "credits" ? Rates.fromAibCredits(c.id, v) : Rates.fromVolume(c.id, v);
      r.label = c.label;
      r.hasPromptCaveat = !!c.promptSplit;
      rows.push(r);
      totalCC += r.copilotCredits;
      totalCCUSD += r.copilotUSD;
      totalAIB += r.aibCredits;
      totalAIBUSD += r.aibUSD;
    });
    return {
      rows: rows,
      inputKind: STATE.mode === "credits" ? "credits" : "volume",
      totalCopilotCredits: totalCC,
      totalCopilotUSD: totalCCUSD,
      totalAibCredits: totalAIB,
      totalAibUSD: totalAIBUSD,
      anyPromptCaveat: rows.some(function (r) { return r.hasPromptCaveat; })
    };
  }

  function recompute() {
    if (!Rates) return;
    renderResults(compute());
  }

  // ── Render results ────────────────────────────────────────────────────────
  function renderResults(res) {
    var host = $("aib-results");
    if (!host) return;
    if (!res.rows.length) {
      host.className = "em-hidden";
      host.innerHTML = "";
      STATE.last = res;
      return;
    }
    host.className = "aib-results";

    var inputKind = res.inputKind || (STATE.mode === "credits" ? "credits" : "volume");
    var annual = res.totalCopilotUSD * 12;
    var pctFewer = res.totalAibCredits > 0
      ? Math.round((1 - res.totalCopilotCredits / res.totalAibCredits) * 100)
      : 0;
    var html = "";

    // Path B modeled-split banner — be explicit this is an assumed mix, not exact.
    if (res.modeled) {
      html +=
        '<p class="aib-modeled">\u26a0\ufe0f <strong>Modeled split.</strong> The PPAC consumption ' +
        "export gives one total AI Builder credit number with no capability breakdown, so this result " +
        "assumes the capability mix you set above. Change the mix to see how sensitive the answer is, " +
        "or use <em>Paste a table</em> for an exact per-capability result.</p>";
    }

    // The dollars story, up front: AI Builder today → Copilot Credits.
    html +=
      '<div class="aib-compare">' +
        '<div class="aib-compare-col aib-compare-col--today">' +
          '<div class="aib-compare-tag">AI Builder today</div>' +
          '<div class="aib-compare-num">' + fmt(res.totalAibCredits) + "</div>" +
          '<div class="aib-compare-unit">credits / month</div>' +
          '<div class="aib-compare-usd">' + money(res.totalAibUSD) + '/mo' +
            '<span class="aib-compare-sub"> · prepaid Tier 1</span></div>' +
        "</div>" +
        '<div class="aib-compare-arrow" aria-hidden="true">\u2192</div>' +
        '<div class="aib-compare-col aib-compare-col--copilot">' +
          '<div class="aib-compare-tag">Copilot Credits &mdash; provision this</div>' +
          '<div class="aib-compare-num">' + fmt(res.totalCopilotCredits) + "</div>" +
          '<div class="aib-compare-unit">credits / month</div>' +
          '<div class="aib-compare-usd">' + money(res.totalCopilotUSD) + '/mo' +
            '<span class="aib-compare-sub"> · PAYG (' + money(annual) + '/yr)</span></div>' +
        "</div>" +
      "</div>";

    // Plain-English "why the count drops but $/credit rises".
    if (pctFewer > 0) {
      html +=
        '<p class="aib-compare-why">You\u2019ll meter about <strong>' + pctFewer + "% fewer credits</strong> (" +
        fmt(res.totalAibCredits) + " \u2192 " + fmt(res.totalCopilotCredits) + ") \u2014 but each Copilot Credit is " +
        "priced higher (<strong>$0.01</strong> pay-as-you-go vs <strong>$0.0005</strong> for the prepaid AI Builder " +
        "reference), so your monthly spend moves " + money(res.totalAibUSD) + " \u2192 " + money(res.totalCopilotUSD) +
        ". Prepaid Copilot Credit packs lower that rate \u2014 treat the dollars as directional.</p>";
    } else {
      html +=
        '<p class="aib-compare-why">Here the Copilot Credit count matches AI Builder credits, but each Copilot Credit ' +
        "is priced higher (<strong>$0.01</strong> PAYG vs <strong>$0.0005</strong> prepaid), so monthly spend moves " +
        money(res.totalAibUSD) + " \u2192 " + money(res.totalCopilotUSD) + ". Treat the dollars as directional.</p>";
    }

    // Per-capability breakdown.
    html +=
      '<table class="aib-table"><thead><tr>' +
        "<th>Capability</th>" +
        (inputKind === "credits" ? "<th class=num>AIB credits (in)</th>" : "<th class=num>Volume</th>") +
        "<th class=num>Copilot Credits/mo</th>" +
        "<th class=num>$/mo (PAYG)</th>" +
        "<th class=num>AIB credits/mo</th>" +
      "</tr></thead><tbody>";
    res.rows.forEach(function (r) {
      html +=
        "<tr>" +
          "<td>" + esc(r.label) + (r.hasPromptCaveat ? ' <span class="aib-flag" title="Prompt AI Builder rate assumes a 90/10 input/output token mix; Copilot Credits are exact.">\u2248</span>' : "") + "</td>" +
          "<td class=num>" + fmt(inputKind === "credits" ? r.aibCredits : r.volume) + (inputKind === "credits" ? "" : ' <span class="aib-u">' + esc(r.unit.replace(/^1 /, "")) + "</span>") + "</td>" +
          "<td class=num>" + fmt(r.copilotCredits) + "</td>" +
          "<td class=num>" + money(r.copilotUSD) + "</td>" +
          "<td class=num>" + fmt(r.aibCredits) + "</td>" +
        "</tr>";
    });
    html +=
      "</tbody><tfoot><tr>" +
        "<td>Total</td>" +
        "<td class=num></td>" +
        "<td class=num>" + fmt(res.totalCopilotCredits) + "</td>" +
        "<td class=num>" + money(res.totalCopilotUSD) + "</td>" +
        "<td class=num>" + fmt(res.totalAibCredits) + "</td>" +
      "</tr></tfoot></table>";

    // Honest planning notes.
    html += '<div class="aib-notes">';
    html +=
      "<p>Copilot Credits are the currency you <strong>provision for Copilot Studio</strong> \u2014 the count above is " +
      "what your current AI Builder workload will draw each month. Capacity is enforced <strong>monthly and doesn\u2019t " +
      "roll over</strong>, so size to your busiest month, not your average.</p>";
    if (res.anyPromptCaveat) {
      html +=
        '<p class="aib-caveat">\u2248 Prompt rows: the Copilot Credit rate is a flat per-1,000-tokens number, so <strong>Copilot ' +
        "Credits are exact</strong>. Only the AI Builder credit <em>reference</em> assumes Microsoft\u2019s 90% input / 10% output " +
        "token mix \u2014 adjust if your prompts skew toward long outputs.</p>";
    }
    html += "</div>";

    // Export actions.
    html +=
      '<div class="aib-actions">' +
        '<button type="button" class="em-chip" onclick="aibCopySummary()">&#128203; Copy summary</button> ' +
        '<button type="button" class="em-chip" onclick="aibDownloadCsv()">&darr; Download CSV</button> ' +
        '<span class="aib-status" id="aib-status" role="status" aria-live="polite"></span>' +
      "</div>";

    host.innerHTML = html;
    STATE.last = res;
  }

  // ── Mode switch (segmented control) ───────────────────────────────────────
  function show(id, on) {
    var el = $(id);
    if (el) el.classList.toggle("em-hidden", !on);
  }

  function setMode(mode) {
    if (mode !== "usage" && mode !== "credits" && mode !== "import") return;
    STATE.mode = mode;
    document.querySelectorAll("#aib-mode-cards .aib-seg-btn").forEach(function (btn) {
      var on = btn.getAttribute("data-mode") === mode;
      btn.classList.toggle("aib-seg-btn--active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });

    var isImport = mode === "import";
    show("aib-step-cap", !isImport);
    show("aib-step-input", !isImport);
    show("aib-step-import", isImport);

    var help = $("aib-mode-desc");
    if (help) {
      help.innerHTML = mode === "credits"
        ? "Enter your <strong>current monthly AI Builder credits</strong> per capability \u2014 grab them from the Power Platform admin center <em>AI Builder consumption</em> report. We convert each to the Copilot Credits it will cost in Copilot Studio."
        : mode === "import"
        ? "Bring in real numbers instead of typing each one. <strong>Paste a table</strong> from the Power Automate <em>AI Builder activity</em> grid or Excel for an exact per-capability result, or drop in the <strong>single total</strong> from the PPAC consumption export and assume a mix. Nothing is uploaded \u2014 parsing happens in your browser."
        : "Enter your <strong>monthly volume</strong> for each capability you use (pages, images, tokens, characters). This is the most accurate path \u2014 the Copilot Credit numbers are exact.";
    }

    if (isImport) {
      setImportPath(STATE.importPath);   // render active sub-panel + its result
    } else {
      buildRows();   // rebuild so unit labels, placeholders + hints match the mode
      recompute();
    }
  }

  // ── Import: sub-path switch (Paste table ↔ One total) ─────────────────────
  function setImportPath(path) {
    if (path !== "paste" && path !== "total") return;
    STATE.importPath = path;
    document.querySelectorAll("#aib-import-tabs .aib-seg-btn").forEach(function (btn) {
      var on = btn.getAttribute("data-ipath") === path;
      btn.classList.toggle("aib-seg-btn--active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    var desc = $("aib-import-desc");
    if (desc) {
      desc.innerHTML = path === "total"
        ? "Paste or type the <strong>one aggregate AI Builder credit number</strong> from the PPAC export (sum of the <em>AIConsumption</em> column), then set the capability mix. We can\u2019t know your exact split from a single total, so the result is a <strong>modeled estimate</strong>."
        : "Copy rows with a <strong>label and a number</strong> \u2014 e.g. the <em>Tool name</em> + <em>Consumption</em> columns from the AI Builder activity grid. We auto-match each label to a capability; you confirm or fix the mapping, then apply.";
    }
    show("aib-import-paste", path === "paste");
    show("aib-import-total", path === "total");
    // Show the relevant result view for the active path.
    if (path === "total") { buildAllocator(); recomputeTotal(); }
    else { renderMapping(); }
  }

  // ── Import Path A: parse a pasted table ───────────────────────────────────
  // Accepts tab- (Excel copy) or comma-separated rows. Picks a text label
  // column and the last numeric column on each line. Header rows and totals are
  // skipped. Tolerant of thousands separators and currency-ish noise.
  function parseTable(text) {
    var out = [];
    if (!text) return out;
    String(text).split(/\r?\n/).forEach(function (line) {
      var raw = line.trim();
      if (!raw) return;
      var cells = raw.indexOf("\t") !== -1 ? raw.split("\t") : raw.split(",");
      cells = cells.map(function (c) { return c.trim(); });
      if (cells.length < 2) return;
      // last cell that parses as a positive number
      var value = null, valueIdx = -1;
      for (var i = cells.length - 1; i >= 0; i--) {
        var n = parseFloat(cells[i].replace(/[, ]/g, "").replace(/[^0-9.\-eE]/g, ""));
        if (isFinite(n) && n > 0) { value = n; valueIdx = i; break; }
      }
      if (value == null) return; // header / non-data line
      // label = the first non-empty, non-numeric cell (else first cell)
      var label = "";
      for (var j = 0; j < cells.length; j++) {
        if (j === valueIdx) continue;
        if (cells[j] && !/^[\d.,\s$%]+$/.test(cells[j])) { label = cells[j]; break; }
      }
      if (!label) label = cells[0] === "" ? ("Row " + (out.length + 1)) : cells[0];
      if (/^(total|sum|grand total)$/i.test(label)) return;
      out.push({ label: label, value: value, capId: Rates.matchCapability(label) });
    });
    return out;
  }

  function parsePaste() {
    var box = $("aib-paste-box");
    if (!box) return;
    STATE.parsed = parseTable(box.value);
    var matched = STATE.parsed.filter(function (r) { return r.capId; }).length;
    var st = $("aib-paste-status");
    if (st) {
      st.textContent = STATE.parsed.length
        ? "Parsed " + STATE.parsed.length + " row" + (STATE.parsed.length === 1 ? "" : "s") +
          " \u00b7 auto-matched " + matched + "/" + STATE.parsed.length + ". Review the mapping below."
        : "Couldn\u2019t find any \u201clabel + number\u201d rows \u2014 paste at least two columns.";
    }
    renderMapping();
  }

  function reparse() { if (STATE.parsed.length) parsePaste(); }

  function pasteSample() {
    var box = $("aib-paste-box");
    if (!box) return;
    box.value =
      "Tool name\tConsumption\n" +
      "Contoso invoice model\t42000\n" +
      "Vendor receipt reader\t18000\n" +
      "Support OCR\t9000\n" +
      "Ticket sentiment\t4000\n" +
      "Case summary prompt (standard)\t120000\n" +
      "Contract clause extraction\t16000";
    var unit = $("aib-paste-unit");
    if (unit) unit.value = "credits";
    parsePaste();
  }

  function clearPaste() {
    var box = $("aib-paste-box");
    if (box) box.value = "";
    STATE.parsed = [];
    var st = $("aib-paste-status");
    if (st) st.textContent = "";
    renderMapping();
    renderResults({ rows: [] });
  }

  // Mapping table: one row per parsed line → capability dropdown (auto-selected).
  function renderMapping() {
    var host = $("aib-map");
    var actions = $("aib-map-actions");
    if (!host) return;
    if (!STATE.parsed.length) {
      host.innerHTML = "";
      if (actions) actions.classList.add("em-hidden");
      return;
    }
    var isCredits = ($("aib-paste-unit") || {}).value === "credits";
    var numHead = isCredits ? "AIB credits" : "Volume";
    var html =
      '<table class="aib-map-table"><thead><tr>' +
        "<th>Your label</th><th class=num>" + numHead + "</th><th>Maps to capability</th>" +
      "</tr></thead><tbody>";
    STATE.parsed.forEach(function (r, idx) {
      html +=
        "<tr>" +
          '<td class="aib-map-src">' + esc(r.label) +
            (r.capId ? '<div class="aib-map-auto">auto-matched</div>' : '<div class="aib-map-auto aib-map-auto--none">pick one</div>') +
          "</td>" +
          '<td class="num">' + fmt(r.value) + "</td>" +
          "<td>" + capSelect(idx, r.capId) + "</td>" +
        "</tr>";
    });
    html += "</tbody></table>";
    host.innerHTML = html;
    if (actions) actions.classList.remove("em-hidden");
  }

  function capSelect(idx, selectedId) {
    var opts = '<option value="">\u2014 Ignore this row \u2014</option>';
    var groups = {};
    Rates.CAPABILITIES.forEach(function (c) { (groups[c.group] = groups[c.group] || []).push(c); });
    Object.keys(groups).forEach(function (g) {
      opts += '<optgroup label="' + esc(g) + '">';
      groups[g].forEach(function (c) {
        opts += '<option value="' + c.id + '"' + (c.id === selectedId ? " selected" : "") + ">" + esc(chipLabel(c)) + "</option>";
      });
      opts += "</optgroup>";
    });
    return '<select class="aib-select" aria-label="Map row to capability" onchange="aibSetMap(' + idx + ', this.value)">' + opts + "</select>";
  }

  function setMap(idx, capId) {
    if (STATE.parsed[idx]) STATE.parsed[idx].capId = capId || null;
  }

  // Apply the mapping: sum values per capability, then hand off to the standard
  // usage/credits flow so the user lands on populated, editable rows + results.
  function applyMapping() {
    var isCredits = ($("aib-paste-unit") || {}).value === "credits";
    var sums = {};
    STATE.parsed.forEach(function (r) {
      if (!r.capId || !Rates.getCapability(r.capId)) return;
      if (!(r.value > 0)) return;
      sums[r.capId] = (sums[r.capId] || 0) + r.value;
    });
    var ids = Object.keys(sums);
    var st = $("aib-paste-status");
    if (!ids.length) {
      if (st) st.textContent = "Map at least one row to a capability first.";
      return;
    }
    STATE.selected = {};
    STATE.values = {};
    ids.forEach(function (id) {
      STATE.selected[id] = true;
      STATE.values[id] = sums[id];
    });
    // Switch into the matching standard mode; setMode rebuilds rows + results.
    setMode(isCredits ? "credits" : "usage");
    var res = $("aib-results");
    if (res && res.scrollIntoView) res.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // ── Import Path B: one total + a capability mix ───────────────────────────
  var MIX_PRESETS = {
    balanced: { prebuilt_doc: 25, custom_doc: 20, ocr: 15, text_simple: 15, text_advanced: 10, prompt_standard: 15 },
    docs:     { custom_doc: 45, prebuilt_doc: 35, ocr: 20 },
    prompts:  { prompt_standard: 60, prompt_basic: 25, prompt_premium: 15 },
    text:     { text_simple: 45, text_advanced: 30, translation: 25 }
  };

  function buildAllocator() {
    var host = $("aib-alloc");
    if (!host) return;
    if (!Object.keys(STATE.alloc).length) STATE.alloc = shallow(MIX_PRESETS.balanced);
    var html = "";
    Rates.CAPABILITIES.forEach(function (c) {
      var pct = STATE.alloc[c.id] != null ? STATE.alloc[c.id] : 0;
      html +=
        '<div class="aib-alloc-row">' +
          '<span class="aib-alloc-name">' + esc(chipLabel(c)) + "</span>" +
          '<input type="range" class="aib-alloc-range" data-cap="' + c.id + '" min="0" max="100" step="1" value="' + pct +
            '" aria-label="' + esc(chipLabel(c)) + ' percent" oninput="aibSetAlloc(\'' + c.id + '\', this.value)">' +
          '<input type="number" class="aib-alloc-pct" data-cap="' + c.id + '" min="0" max="100" step="1" value="' + pct +
            '" aria-label="' + esc(chipLabel(c)) + ' percent" oninput="aibSetAlloc(\'' + c.id + '\', this.value)">' +
        "</div>";
    });
    host.innerHTML = html;
    updateAllocSum();
    var totalIn = $("aib-total-in");
    if (totalIn && !totalIn._wired) {
      totalIn._wired = true;
      totalIn.addEventListener("input", function () { STATE.total = totalIn.value; recomputeTotal(); });
    }
  }

  function allocSum() {
    var s = 0;
    Object.keys(STATE.alloc).forEach(function (id) {
      var p = parseFloat(STATE.alloc[id]);
      if (isFinite(p) && p > 0) s += p;
    });
    return s;
  }

  function updateAllocSum() {
    var el = $("aib-alloc-sum");
    if (!el) return;
    var s = Math.round(allocSum());
    el.textContent = "Mix totals " + s + "%" + (s === 100 ? " \u2014 balanced." : " \u00b7 normalized to 100% on convert.");
    el.classList.toggle("aib-alloc-sum--bad", s === 0);
  }

  function setAlloc(id, val) {
    var p = parseFloat(val);
    STATE.alloc[id] = isFinite(p) && p > 0 ? p : 0;
    // keep the paired range + number inputs in sync without a full rebuild
    var host = $("aib-alloc");
    if (host) {
      host.querySelectorAll('[data-cap="' + id + '"]').forEach(function (inp) {
        if (String(inp.value) !== String(STATE.alloc[id])) inp.value = STATE.alloc[id];
      });
    }
    updateAllocSum();
    recomputeTotal();
  }

  function applyMixPreset(key) {
    var p = MIX_PRESETS[key];
    if (!p) return;
    STATE.alloc = shallow(p);
    buildAllocator();
    recomputeTotal();
  }

  function recomputeTotal() {
    if (!Rates.fromTotalAibCredits) return;
    var total = parseFloat(String(STATE.total).replace(/,/g, ""));
    if (!(isFinite(total) && total > 0) || !(allocSum() > 0)) {
      renderResults({ rows: [] });
      return;
    }
    var res = Rates.fromTotalAibCredits(total, STATE.alloc);
    // decorate for renderResults (labels, caveats, modeled flag)
    res.inputKind = "credits";
    res.modeled = true;
    res.rows.forEach(function (r) {
      var c = Rates.getCapability(r.id);
      r.label = c ? c.label + " \u00b7 " + Math.round(r.allocPct) + "%" : r.id;
      r.hasPromptCaveat = !!(c && c.promptSplit);
    });
    res.anyPromptCaveat = res.rows.some(function (r) { return r.hasPromptCaveat; });
    renderResults(res);
  }

  // small utility for the allocator
  function shallow(o) { var r = {}; Object.keys(o).forEach(function (k) { r[k] = o[k]; }); return r; }


  // ── Chooser toggle ────────────────────────────────────────────────────────
  function toggleCap(id) {
    if (!Rates.getCapability(id)) return;
    var turningOn = !STATE.selected[id];
    STATE.selected[id] = turningOn;
    if (!turningOn) delete STATE.values[id]; // removing a capability clears its value
    updateChip(id);
    buildRows(turningOn ? id : null);
    recompute();
  }

  // ── Presets ───────────────────────────────────────────────────────────────
  function applyPreset(key) {
    var p = PRESETS[key];
    if (!p) return;
    if (STATE.mode !== "usage") setMode("usage");
    // Reset selection to exactly the preset's capabilities.
    STATE.selected = {};
    STATE.values = {};
    Object.keys(p.values).forEach(function (id) {
      if (Rates.getCapability(id)) {
        STATE.selected[id] = true;
        STATE.values[id] = p.values[id];
      }
    });
    buildChooser();
    buildRows();
    recompute();
    var res = $("aib-results");
    if (res && res.scrollIntoView) res.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function resetAll() {
    STATE.selected = {};
    STATE.values = {};
    buildChooser();
    buildRows();
    recompute();
  }

  // ── Export ────────────────────────────────────────────────────────────────
  function summaryText() {
    var r = STATE.last;
    if (!r || !r.rows.length) return "";
    var lines = [];
    lines.push("AI Builder \u2192 Copilot Credits estimate");
    lines.push("Copilot Credits/month: " + fmt(r.totalCopilotCredits));
    lines.push("Pay-as-you-go: " + money(r.totalCopilotUSD) + "/mo (" + money(r.totalCopilotUSD * 12) + "/yr)");
    lines.push("AI Builder credits today (reference): " + fmt(r.totalAibCredits) + "/mo (" + money(r.totalAibUSD) + "/mo prepaid Tier 1)");
    lines.push("");
    r.rows.forEach(function (row) {
      lines.push("- " + row.label + ": " + fmt(row.copilotCredits) + " Copilot Credits (" + money(row.copilotUSD) + "/mo)");
    });
    lines.push("");
    lines.push("Source: Microsoft AI Builder Capability Rate table (retrieved " + Rates.RETRIEVED + "). Directional \u2014 confirm against your own pricing.");
    return lines.join("\n");
  }

  function flash(msg) {
    var s = $("aib-status");
    if (!s) return;
    s.textContent = msg;
    setTimeout(function () { if (s.textContent === msg) s.textContent = ""; }, 2500);
  }

  function copySummary() {
    var t = summaryText();
    if (!t) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { flash("Copied to clipboard"); }, function () { flash("Copy failed"); });
    } else {
      flash("Clipboard unavailable");
    }
  }

  function downloadCsv() {
    var r = STATE.last;
    if (!r || !r.rows.length) return;
    var rows = [["Capability", "Volume", "Unit", "Copilot Credits/mo", "$/mo PAYG", "AI Builder credits/mo", "$/mo AIB prepaid"]];
    r.rows.forEach(function (row) {
      rows.push([row.label, row.volume, row.unit, row.copilotCredits, row.copilotUSD, row.aibCredits, row.aibUSD]);
    });
    rows.push(["TOTAL", "", "", r.totalCopilotCredits, r.totalCopilotUSD, r.totalAibCredits, r.totalAibUSD]);
    var csv = rows.map(function (line) {
      return line.map(function (cell) {
        var s = String(cell);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(",");
    }).join("\r\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "ai-builder-to-copilot-credits.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    flash("CSV downloaded");
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    if (!document.getElementById("aib-rows")) return; // not on this page
    if (!Rates) return;
    buildChooser();
    setMode("usage"); // sets description + builds rows (empty state) + recompute
  }

  // Expose the inline-handler entry points.
  window.aibSetMode = setMode;
  window.aibToggleCap = toggleCap;
  window.aibPreset = applyPreset;
  window.aibReset = resetAll;
  window.aibCopySummary = copySummary;
  window.aibDownloadCsv = downloadCsv;
  // Import (Path A: paste table / Path B: total + mix)
  window.aibSetImportPath = setImportPath;
  window.aibParsePaste = parsePaste;
  window.aibReparse = reparse;
  window.aibPasteSample = pasteSample;
  window.aibClearPaste = clearPaste;
  window.aibSetMap = setMap;
  window.aibApplyMapping = applyMapping;
  window.aibMixPreset = applyMixPreset;
  window.aibSetAlloc = setAlloc;

  if (window.document$ && typeof window.document$.subscribe === "function") window.document$.subscribe(init);
  else if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();

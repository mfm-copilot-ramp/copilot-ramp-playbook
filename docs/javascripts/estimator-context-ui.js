/*
 * estimator-context-ui.js — live-page controller for the "From a conversation" mode.
 *
 * Mounts the #panel-context UI on the Credit Estimator page and drives it with the real
 * window.ContextEstimator engine (which reuses EstimatorCore / CoworkEstimator / Portfolio /
 * ConversationEstimator for all math). Ported from the _context-demo.html engine-review
 * harness, restyled to the site's Material theme. No estimation logic lives here — this file
 * is pure glue: read the textarea, call estimateContext(), render the roll-up + editable
 * per-use-case cards, and re-run on edits.
 */
(function () {
  "use strict";

  var EX = {
    mixed: "For our 4,000-employee bank: first, turn on Copilot for our 300 relationship managers, daily, grounded in our SharePoint policies. Also build an autonomous agent for our 80 support reps that drafts a reply to every ticket from our knowledge base.",
    bullets: "- An HR assistant that answers benefits questions from our SharePoint policies for employees in Teams\n- A support agent that automatically files a ServiceNow ticket for each issue\n- Roll M365 Copilot out to 500 sales reps for daily productivity",
    cowork: "We're a 1,200 person manufacturer. We'd like everyone to have Copilot but realistically people would use it a few times a week for email and document drafting.",
    email: "Hi team — following our call, the customer wants to pilot Copilot for their 150 field engineers who'd use it daily to pull answers from the equipment manuals in SharePoint. Separately they asked about an agent that automatically triages inbound warranty emails. Can we size both?"
  };

  function $(id) { return document.getElementById(id); }
  function fmt(n) { return Math.round(n).toLocaleString(); }
  function money(n) { return "$" + fmt(n); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  // Flatten a caption/transcript file (.vtt / .srt) into plain prose the estimator
  // can segment: drop the WEBVTT header, cue numbers, timestamp lines, NOTE blocks
  // and inline tags. Non-caption files (.txt/.md/.csv/…) are returned unchanged.
  function cleanTranscript(text, name) {
    var isVtt = /\.vtt$/i.test(name || "") || /^\uFEFF?WEBVTT/.test(text);
    var isSrt = /\.srt$/i.test(name || "");
    if (!isVtt && !isSrt) return text;
    var lines = String(text).replace(/\r/g, "").split("\n"), out = [], last = "";
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i].trim();
      if (!l) continue;
      if (/^WEBVTT/i.test(l)) continue;        // header
      if (/^NOTE\b/i.test(l)) continue;        // vtt comment
      if (/^\d+$/.test(l)) continue;           // srt cue index
      if (/-->/.test(l)) continue;             // timestamp line
      l = l.replace(/<[^>]+>/g, "").trim();    // <v Speaker> / styling tags
      if (l && l !== last) { out.push(l); last = l; }
    }
    return out.join(" ").replace(/\s+/g, " ").trim();
  }

  function loadFile(f) {
    if (!f) return;
    var nm = $("ctx-file-name");
    if (f.size > 5 * 1024 * 1024) {
      if (nm) nm.textContent = "That file is over 5 MB — paste the relevant part instead.";
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      $("ctx-input").value = cleanTranscript(String(reader.result || ""), f.name);
      if (nm) nm.textContent = "\u2713 " + f.name + " loaded \u2014 review, then Estimate.";
    };
    reader.onerror = function () { if (nm) nm.textContent = "Couldn't read " + f.name + " as text."; };
    reader.readAsText(f);
  }

  var state = { text: "", items: null };
  var mounted = false;

  function run() {
    var api = window.ContextEstimator;
    if (!api || !api.estimateContext) {
      $("ctx-out").style.display = "block";
      $("ctx-total").innerHTML = '<div class="ctx-total-l">The estimator engine has not loaded. Refresh the page and try again.</div>';
      return;
    }
    var text = $("ctx-input").value;
    var r = api.estimateContext(text, state.items ? { items: state.items } : {});
    if (!r.ok) {
      $("ctx-out").style.display = "block";
      $("ctx-total").innerHTML = '<div class="ctx-total-l">' + esc(r.error || "Paste some context above, then estimate.") + '</div>';
      $("ctx-ucs").innerHTML = "";
      $("ctx-sugg").innerHTML = "";
      $("ctx-disc").textContent = "";
      var cpp = $("ctx-cp-prompt"); if (cpp) cpp.textContent = "";
      return;
    }
    state.text = text;
    state.items = r.items;
    $("ctx-out").style.display = "block";
    $("ctx-total").innerHTML =
      '<div class="ctx-total-big">' + money(r.portfolio.monthlyCostUSD) + ' / mo &nbsp;&middot;&nbsp; ' + money(r.portfolio.annualCostUSD) + ' / yr</div>' +
      '<div class="ctx-total-l">' + fmt(r.portfolio.monthlyCredits) + ' credits/mo across ' + r.useCaseCount + ' use case' + (r.useCaseCount > 1 ? 's' : '') +
      ' &rarr; a milestone-ready recurring consumption line.</div>';
    $("ctx-ucs").innerHTML = r.useCases.map(ucCard).join("");
    wireUc();
    $("ctx-sugg").innerHTML = "<strong>Review &amp; refine</strong><ul>" + r.suggestions.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>";
    var cp = $("ctx-cp-prompt"); if (cp) cp.textContent = r.copilotPrompt;
    $("ctx-disc").textContent = r.disclaimer;
  }

  function ucCard(u, i) {
    var badge = '<span class="ctx-pill ctx-pill--' + u.product + '">' + (u.product === "cowork" ? "Cowork" : "Studio agent") + '</span>';
    var other = u.product === "cowork" ? "studio" : "cowork";
    var body;
    if (u.product === "cowork" && u.drivers) {
      body = '<div class="ctx-drv">' +
        drvField("Licensed users", "lic", u.drivers.licensedUsers, i) +
        drvField("Active usage %", "mau", u.drivers.mauPct, i) +
        drvField("Credits / active user / mo", "cpu", u.drivers.creditsPerActiveUser, i) +
        '</div>' +
        (u.assumptions && u.assumptions.length ? '<div class="ctx-asm">' + u.assumptions.map(function (a) { return esc(a.field) + ": <strong>" + esc(a.value) + "</strong> &mdash; " + esc(a.basis); }).join(" &middot; ") + '</div>' : '');
    } else {
      body = '<div class="ctx-studio-note">Sized from the description via the Studio engine' + (u.size ? ' &middot; size <strong>' + esc(u.size) + '</strong>' : '') +
        '. Edit the text above and re-estimate to change it.</div>';
    }
    return '<div class="ctx-uc" data-i="' + i + '">' +
      '<div class="ctx-uc-head"><span class="ctx-uc-name">' + (i + 1) + '. ' + esc(u.label) + '</span>' + badge +
      '<span class="ctx-uc-num">' + fmt(u.monthlyCredits) + ' cr/mo &middot; ' + money(u.monthlyCostUSD) + '/mo</span>' +
      '<button type="button" class="ctx-del" data-del="' + i + '" title="Remove">&#10005;</button></div>' +
      '<div class="ctx-uc-src">"' + esc(u.sourceText) + '"</div>' +
      body +
      '<div style="margin-top:.4rem"><button type="button" class="ctx-switch" data-switch="' + i + '" data-to="' + other + '">&harr; treat as ' + (other === "cowork" ? "Cowork" : "a Studio agent") + ' instead</button></div>' +
      '</div>';
  }

  function drvField(label, key, val, i) {
    return '<div class="ctx-f"><label>' + label + '</label><input type="number" data-k="' + key + '" data-i="' + i + '" value="' + val + '"></div>';
  }

  function wireUc() {
    document.querySelectorAll('#ctx-ucs input[data-k]').forEach(function (inp) {
      inp.addEventListener("input", function () {
        var i = +inp.dataset.i, k = inp.dataset.k, v = parseFloat(inp.value) || 0;
        var map = { lic: "licensedUsers", mau: "mauPct", cpu: "creditsPerActiveUser" };
        if (state.items[i] && state.items[i].input && state.items[i].input.cowork) {
          state.items[i].input.cowork[map[k]] = v;
          run();
        }
      });
    });
    document.querySelectorAll('#ctx-ucs [data-del]').forEach(function (b) {
      b.addEventListener("click", function () {
        state.items.splice(+b.dataset.del, 1);
        if (!state.items.length) { state.items = null; }
        run();
      });
    });
    document.querySelectorAll('#ctx-ucs [data-switch]').forEach(function (b) {
      b.addEventListener("click", function () {
        var i = +b.dataset.switch, to = b.dataset.to, api = window.ContextEstimator;
        if (api && api.reclassifyItem) {
          state.items[i] = api.reclassifyItem(state.items[i], to);
        } else {
          // fallback if the engine is unavailable (keeps legacy behavior)
          var it = state.items[i];
          if (to === "cowork") { it.producer = "cowork"; it.input = { cowork: { licensedUsers: 1000, mauPct: 15, creditsPerActiveUser: 5000 } }; it.assumptions = []; }
          else { it.producer = "studio"; it.input = { text: it.sourceText }; it.assumptions = []; }
        }
        run();
      });
    });
  }

  function mount() {
    if (mounted) return;
    var panel = $("panel-context");
    if (!panel) return;
    mounted = true;

    var go = $("ctx-go");
    if (go) go.addEventListener("click", function () { state.items = null; run(); });

    document.querySelectorAll('#panel-context .ctx-ex[data-ex]').forEach(function (c) {
      c.addEventListener("click", function () { $("ctx-input").value = EX[c.dataset.ex] || ""; });
    });

    // Upload a transcript / notes file (click the button or drag-drop onto the box).
    var upBtn = $("ctx-upload"), fileInp = $("ctx-file"), box = $("ctx-input");
    if (upBtn && fileInp) {
      upBtn.addEventListener("click", function () { fileInp.click(); });
      fileInp.addEventListener("change", function () { loadFile(fileInp.files && fileInp.files[0]); fileInp.value = ""; });
    }
    if (box) {
      ["dragover", "dragenter"].forEach(function (ev) {
        box.addEventListener(ev, function (e) { e.preventDefault(); box.classList.add("ctx-drop"); });
      });
      ["dragleave", "dragend"].forEach(function (ev) {
        box.addEventListener(ev, function () { box.classList.remove("ctx-drop"); });
      });
      box.addEventListener("drop", function (e) {
        box.classList.remove("ctx-drop");
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
          e.preventDefault();
          loadFile(e.dataTransfer.files[0]);
        }
      });
    }

    var copy = $("ctx-cp-copy");
    if (copy) copy.addEventListener("click", function () {
      var p = $("ctx-cp-prompt");
      navigator.clipboard.writeText((p ? p.textContent : "") + "\n\n" + $("ctx-input").value);
      copy.textContent = "\u2713 Copied";
      setTimeout(function () { copy.textContent = "\ud83d\udccb Copy prompt"; }, 1500);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
  // MkDocs Material uses instant navigation; re-mount when the estimator page loads.
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(function () { mounted = false; mount(); });
  }
})();

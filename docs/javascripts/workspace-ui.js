/* workspace-ui.js — the "My estimates" cart: a site-wide drawer + launcher pill.
 *
 * V2 turns ON the durable workspace lane that shipped dormant in site-bus.js. This
 * module is DOM-only glue: it stores/reads via window.SiteBus and RECOMPUTES each
 * saved item's live numbers via window.Portfolio (dispatching to EstimatorCore /
 * CoworkEstimator). It couples to NO producer directly — a producer just calls
 * WorkspaceUI.add(item); a consumer (ROI) just reads SiteBus.list().
 *
 * Mounts only on tool pages (Studio / Cowork / ROI / Proposal) or anywhere the
 * cart already has items. Safe to load everywhere; no-ops with no SiteBus.
 */
(function () {
  "use strict";

  var MOUNT_IDS = ["qe-input", "estimator-cowork", "roi-detailed", "proposal-composer"];
  var mounted = false;
  var pendingImport = null; // [items] decoded from a ?ws= share link, awaiting review

  function wsParam() { try { return new URLSearchParams(location.search).get("ws") || ""; } catch (e) { return ""; } }
  function stripWsParam() {
    try {
      var u = new URL(location.href); u.searchParams.delete("ws");
      history.replaceState(null, "", u.pathname + (u.search || "") + (u.hash || ""));
    } catch (e) { /* history unavailable (about:blank) — harmless */ }
  }

  function B() { return window.SiteBus || null; }
  function P() { return window.Portfolio || null; }
  function engines() { return { EstimatorCore: window.EstimatorCore, CoworkEstimator: window.CoworkEstimator }; }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function el(id) { return document.getElementById(id); }
  function money(n) {
    if (n == null || !isFinite(n)) return "$0";
    n = Math.round(n);
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return "$" + n.toLocaleString();
  }
  function fmt(n) { return Math.round(n || 0).toLocaleString(); }

  // Where the sibling tool pages live, relative to the current directory URL.
  function roiUrl(from) { return "../roi-estimator/?from=" + (from || "workspace"); }
  function proposalUrl(from) { return "../proposal/?from=" + (from || "workspace"); }

  // ── one-time CSS ─────────────────────────────────────────────────────────
  function injectCss() {
    if (el("ws-css")) return;
    var css = document.createElement("style");
    css.id = "ws-css";
    css.textContent = [
      ".ws-pill{position:fixed;right:18px;bottom:18px;z-index:1400;display:inline-flex;align-items:center;gap:.4rem;",
      "background:var(--md-primary-fg-color,#3f51b5);color:#fff;border:none;border-radius:999px;padding:.6rem .95rem;",
      "font-size:.82rem;font-weight:600;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,.24);transition:transform .12s ease}",
      ".ws-pill:hover{transform:translateY(-1px)}",
      ".ws-pill-count{background:#fff;color:var(--md-primary-fg-color,#3f51b5);border-radius:999px;min-width:1.15rem;",
      "height:1.15rem;padding:0 .35rem;display:inline-flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700}",
      ".ws-pill-count[data-empty=\"1\"]{display:none}",
      ".ws-scrim{position:fixed;inset:0;z-index:1450;background:rgba(0,0,0,.34);opacity:0;pointer-events:none;transition:opacity .16s ease}",
      ".ws-scrim[data-open=\"1\"]{opacity:1;pointer-events:auto}",
      ".ws-drawer{position:fixed;top:0;right:0;z-index:1460;height:100%;width:min(420px,92vw);background:var(--md-default-bg-color,#fff);",
      "box-shadow:-4px 0 22px rgba(0,0,0,.22);transform:translateX(102%);transition:transform .2s ease;display:flex;flex-direction:column}",
      ".ws-drawer[data-open=\"1\"]{transform:translateX(0)}",
      ".ws-hd{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.1rem;border-bottom:1px solid var(--md-default-fg-color--lightest,#e0e0e0)}",
      ".ws-hd h3{margin:0;font-size:1rem}",
      ".ws-x{background:none;border:none;font-size:1.3rem;line-height:1;cursor:pointer;color:var(--md-default-fg-color--light,#666)}",
      ".ws-body{flex:1;overflow-y:auto;padding:.8rem 1.1rem}",
      ".ws-empty{color:var(--md-default-fg-color--light,#666);font-size:.86rem;text-align:center;padding:2rem 1rem}",
      ".ws-item{border:1px solid var(--md-default-fg-color--lightest,#e0e0e0);border-radius:9px;padding:.6rem .7rem;margin-bottom:.6rem}",
      ".ws-item-top{display:flex;align-items:center;gap:.4rem;margin-bottom:.3rem}",
      ".ws-badge{font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.03em;padding:.1rem .4rem;border-radius:4px;color:#fff;flex:none}",
      ".ws-badge--studio{background:#3f51b5}.ws-badge--cowork{background:#00897b}.ws-badge--roi{background:#8e24aa}",
      ".ws-label{font-size:.83rem;font-weight:600;flex:1;cursor:text;word-break:break-word}",
      ".ws-label-input{font-size:.83rem;font-weight:600;flex:1;border:1px solid var(--md-primary-fg-color,#3f51b5);border-radius:4px;padding:.15rem .3rem}",
      ".ws-nums{font-size:.78rem;color:var(--md-default-fg-color--light,#555)}",
      ".ws-nums .warn{color:#b3261e}",
      ".ws-item-actions{display:flex;gap:.5rem;margin-top:.45rem}",
      ".ws-mini{font-size:.74rem;background:none;border:none;cursor:pointer;color:var(--md-primary-fg-color,#3f51b5);padding:.1rem .1rem;font-weight:600}",
      ".ws-mini--rm{color:#b3261e;margin-left:auto}",
      ".ws-ft{border-top:1px solid var(--md-default-fg-color--lightest,#e0e0e0);padding:.8rem 1.1rem;display:flex;flex-wrap:wrap;gap:.5rem}",
      ".ws-btn{font-size:.78rem;font-weight:600;border-radius:6px;padding:.42rem .7rem;cursor:pointer;border:1px solid var(--md-primary-fg-color,#3f51b5);background:var(--md-primary-fg-color,#3f51b5);color:#fff}",
      ".ws-btn--ghost{background:transparent;color:var(--md-primary-fg-color,#3f51b5)}",
      ".ws-btn[disabled]{opacity:.5;cursor:not-allowed}",
      ".ws-share{width:100%;margin-top:.5rem;font-size:.72rem;padding:.4rem;border:1px dashed var(--md-default-fg-color--lighter,#bbb);border-radius:6px;background:var(--md-code-bg-color,#f5f5f5);word-break:break-all}",
      ".ws-note{font-size:.72rem;color:var(--md-default-fg-color--light,#666);width:100%;margin:.2rem 0 0}",
      ".ws-toast{position:fixed;left:50%;bottom:78px;transform:translateX(-50%) translateY(10px);z-index:1500;background:#323232;color:#fff;",
      "padding:.55rem .9rem;border-radius:7px;font-size:.8rem;opacity:0;pointer-events:none;transition:opacity .18s ease,transform .18s ease}",
      ".ws-toast[data-show=\"1\"]{opacity:1;transform:translateX(-50%) translateY(0)}",
      ".ws-import{border:1px solid var(--md-primary-fg-color,#3f51b5);border-radius:9px;padding:.6rem .7rem;margin-bottom:.8rem;",
      "background:color-mix(in srgb,var(--md-primary-fg-color,#3f51b5) 8%,transparent)}",
      ".ws-import-head{font-size:.85rem;font-weight:700;margin-bottom:.2rem}",
      ".ws-import-note{font-size:.74rem;color:var(--md-default-fg-color--light,#666);margin:.1rem 0 .5rem}",
      ".ws-import-actions{display:flex;gap:.5rem;flex-wrap:wrap}",
      "@media print{.ws-pill,.ws-drawer,.ws-scrim,.ws-toast{display:none!important}}"
    ].join("");
    document.head.appendChild(css);
  }

  // ── DOM scaffold ─────────────────────────────────────────────────────────
  function build() {
    if (el("ws-drawer")) return;
    var pill = document.createElement("button");
    pill.className = "ws-pill"; pill.id = "ws-pill"; pill.type = "button";
    pill.setAttribute("aria-label", "Open My estimates");
    pill.innerHTML = '\uD83E\uDDFA My estimates <span class="ws-pill-count" id="ws-count" data-empty="1">0</span>';
    pill.onclick = toggle;

    var scrim = document.createElement("div");
    scrim.className = "ws-scrim"; scrim.id = "ws-scrim"; scrim.onclick = close;

    var drawer = document.createElement("div");
    drawer.className = "ws-drawer"; drawer.id = "ws-drawer";
    drawer.setAttribute("role", "dialog"); drawer.setAttribute("aria-label", "My estimates");
    drawer.innerHTML =
      '<div class="ws-hd"><h3>\uD83E\uDDFA My estimates</h3><button type="button" class="ws-x" id="ws-close" aria-label="Close">\u00d7</button></div>' +
      '<div class="ws-body" id="ws-list"></div>' +
      '<div class="ws-ft" id="ws-ft"></div>';

    var toast = document.createElement("div");
    toast.className = "ws-toast"; toast.id = "ws-toast";

    document.body.appendChild(pill);
    document.body.appendChild(scrim);
    document.body.appendChild(drawer);
    document.body.appendChild(toast);
    el("ws-close").onclick = close;
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  // ── rendering ────────────────────────────────────────────────────────────
  function badge(producer) {
    var p = producer === "cowork" ? "cowork" : producer === "roi" ? "roi" : "studio";
    var label = p === "cowork" ? "Cowork" : p === "roi" ? "ROI" : "Studio";
    return '<span class="ws-badge ws-badge--' + p + '">' + label + "</span>";
  }
  function itemHtml(item, r) {
    var nums;
    if (r && r.ok) {
      nums = "~" + fmt(r.monthlyCredits) + " credits/mo &middot; ~" + money(r.monthlyCostUSD) + "/mo";
    } else {
      nums = '<span class="warn">can\u2019t recompute \u2014 engine not loaded here</span>';
    }
    return '<div class="ws-item" data-id="' + esc(item.id) + '">' +
      '<div class="ws-item-top">' + badge(item.producer) +
        '<span class="ws-label" data-id="' + esc(item.id) + '" title="Click to rename">' + esc(item.label || "Untitled estimate") + "</span>" +
      "</div>" +
      '<div class="ws-nums">' + nums + "</div>" +
      '<div class="ws-item-actions">' +
        '<button type="button" class="ws-mini" data-act="roi" data-id="' + esc(item.id) + '">\u2192 ROI</button>' +
        '<button type="button" class="ws-mini ws-mini--rm" data-act="rm" data-id="' + esc(item.id) + '">Remove</button>' +
      "</div></div>";
  }
  function renderList() {
    var host = el("ws-list"); if (!host) return;
    var b = B(); var items = b ? b.list({ kind: "estimate" }) : [];
    var p = P(), eng = engines();
    var banner = importBannerHtml();
    if (!items.length) {
      host.innerHTML = banner + '<div class="ws-empty">No saved estimates yet.<br>Build one in the <strong>Credit Estimator</strong> and press <em>Save to My estimates</em>.</div>';
    } else {
      host.innerHTML = banner + items.map(function (it) {
        var r = p ? p.recomputeItem(it, eng) : null;
        return itemHtml(it, r);
      }).join("");
      // bind inline actions (avoid inline onclick for CSP-friendliness)
      Array.prototype.forEach.call(host.querySelectorAll(".ws-mini"), function (btn) {
        btn.onclick = function () {
          var id = btn.getAttribute("data-id"), act = btn.getAttribute("data-act");
          if (act === "rm") removeItem(id);
          else if (act === "roi") sendOneToRoi(id);
        };
      });
      Array.prototype.forEach.call(host.querySelectorAll(".ws-label"), function (lab) {
        lab.onclick = function () { beginRename(lab); };
      });
    }
    bindImportBanner();
    renderFooter(items.length);
  }
  // Review-before-commit banner for a ?ws= share link (privacy: nothing imported until the user says so).
  function importBannerHtml() {
    if (!pendingImport || !pendingImport.length) return "";
    var n = pendingImport.length;
    return '<div class="ws-import" id="ws-import">' +
      '<div class="ws-import-head">\uD83D\uDD17 Import ' + n + ' shared estimate' + (n === 1 ? "" : "s") + "?</div>" +
      '<p class="ws-import-note">These came from a share link. They\u2019re added to <strong>this browser only</strong> \u2014 review, then choose.</p>' +
      '<div class="ws-import-actions">' +
        '<button type="button" class="ws-btn" id="ws-import-go">Add to My estimates</button>' +
        '<button type="button" class="ws-btn ws-btn--ghost" id="ws-import-skip">Dismiss</button>' +
      "</div></div>";
  }
  function bindImportBanner() {
    var go = el("ws-import-go"), skip = el("ws-import-skip");
    if (go) go.onclick = commitImport;
    if (skip) skip.onclick = dismissImport;
  }
  function commitImport() {
    var b = B(); if (!b || !pendingImport) { dismissImport(); return; }
    var n = 0;
    pendingImport.forEach(function (it) {
      var spec = { kind: it.kind || "estimate", producer: it.producer || "studio",
        label: it.label || "", input: it.input || {}, refs: it.refs || [] };
      b.put(b.makeItem ? b.makeItem(spec) : spec); n++; // fresh id/timestamps → imported copies are distinct
    });
    pendingImport = null; stripWsParam();
    updateCount(); renderList();
    toastMsg("Imported " + n + " estimate" + (n === 1 ? "" : "s"));
  }
  function dismissImport() {
    pendingImport = null; stripWsParam();
    renderList();
  }
  // On arrival with ?ws=, decode + stage for review (opens the drawer so the user sees the banner).
  function checkShareImport() {
    if (pendingImport) return;
    var raw = wsParam(); if (!raw) return;
    var p = P(); if (!p) return;
    var items = p.decodeWorkspace(raw);
    if (!items.length) { stripWsParam(); return; }
    pendingImport = items;
    open();
  }
  function renderFooter(n) {
    var ft = el("ws-ft"); if (!ft) return;
    var dis = n ? "" : " disabled";
    ft.innerHTML =
      '<button type="button" class="ws-btn" id="ws-allroi"' + dis + ">Send all to ROI \u2192</button>" +
      '<button type="button" class="ws-btn ws-btn--ghost" id="ws-compose"' + dis + ">Compose proposal</button>" +
      '<button type="button" class="ws-btn ws-btn--ghost" id="ws-share"' + dis + ">Share link</button>" +
      '<button type="button" class="ws-btn ws-btn--ghost" id="ws-clear"' + dis + ">Clear</button>" +
      '<p class="ws-note">Saved only in this browser \u2014 never uploaded. A share link puts the inputs in the URL by your choice.</p>';
    if (!n) return;
    el("ws-allroi").onclick = function () { window.location.href = roiUrl("workspace"); };
    el("ws-compose").onclick = function () { window.location.href = proposalUrl("workspace"); };
    el("ws-share").onclick = shareLink;
    el("ws-clear").onclick = clearAll;
  }

  // ── actions ──────────────────────────────────────────────────────────────
  function beginRename(lab) {
    var id = lab.getAttribute("data-id");
    var input = document.createElement("input");
    input.className = "ws-label-input"; input.value = lab.textContent;
    lab.parentNode.replaceChild(input, lab); input.focus(); input.select();
    function commit() {
      var b = B(); if (b) { var it = b.get(id); if (it) { it.label = input.value.trim() || it.label; b.put(it); } }
      renderList();
    }
    input.onblur = commit;
    input.onkeydown = function (e) { if (e.key === "Enter") { e.preventDefault(); input.blur(); } if (e.key === "Escape") renderList(); };
  }
  function removeItem(id) { var b = B(); if (b) b.remove(id); refresh(); }
  function clearAll() {
    if (!window.confirm("Remove all saved estimates from this browser?")) return;
    var b = B(); if (b) b.clear(); refresh();
  }
  function sendOneToRoi(id) {
    var b = B(); if (!b) return;
    var it = b.get(id); if (!it) return;
    b.handoff(it); // reuse the V1 consume-once handoff lane
    window.location.href = roiUrl("estimate");
  }
  function shareLink() {
    var b = B(), p = P(); if (!b || !p) return;
    var enc = p.encodeWorkspace(b.list({ kind: "estimate" }));
    var url = location.origin + location.pathname + "?ws=" + enc;
    var ft = el("ws-ft");
    var box = el("ws-share-box");
    if (!box) { box = document.createElement("div"); box.className = "ws-share"; box.id = "ws-share-box"; ft.appendChild(box); }
    box.textContent = url;
    // best-effort copy
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { toastMsg("Share link copied"); }, function () {});
      else { var r = document.createRange(); r.selectNode(box); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand && document.execCommand("copy"); s.removeAllRanges(); toastMsg("Share link copied"); }
    } catch (e) { /* selection shown regardless */ }
  }

  var toastTimer = null;
  function toastMsg(msg) {
    var t = el("ws-toast"); if (!t) return;
    t.textContent = msg; t.setAttribute("data-show", "1");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.setAttribute("data-show", "0"); }, 2200);
  }

  function updateCount() {
    var b = B(); var n = b ? b.list({ kind: "estimate" }).length : 0;
    var c = el("ws-count"); if (c) { c.textContent = n; c.setAttribute("data-empty", n ? "0" : "1"); }
  }
  function refresh() { updateCount(); if (isOpen()) renderList(); }

  function isOpen() { var d = el("ws-drawer"); return !!(d && d.getAttribute("data-open") === "1"); }
  function open() {
    build(); renderList(); updateCount();
    el("ws-drawer").setAttribute("data-open", "1");
    el("ws-scrim").setAttribute("data-open", "1");
  }
  function close() {
    var d = el("ws-drawer"), s = el("ws-scrim");
    if (d) d.setAttribute("data-open", "0");
    if (s) s.setAttribute("data-open", "0");
  }
  function toggle() { isOpen() ? close() : open(); }

  // Public: a producer calls this to save an estimate to the cart.
  function add(spec) {
    var b = B(); if (!b) return null;
    var item = b.put(b.makeItem ? b.makeItem(spec) : spec);
    updateCount();
    if (isOpen()) renderList();
    toastMsg("Saved to My estimates");
    return item;
  }

  function shouldMount() {
    if (wsParam()) return true; // a share link can land on any page
    for (var i = 0; i < MOUNT_IDS.length; i++) if (el(MOUNT_IDS[i])) return true;
    var b = B(); return !!(b && b.list({ kind: "estimate" }).length); // cart reachable anywhere it has contents
  }

  function mount() {
    if (mounted) { refresh(); checkShareImport(); return; }
    if (!B() || !shouldMount()) return;
    mounted = true;
    injectCss(); build(); updateCount();
    checkShareImport();
  }

  window.WorkspaceUI = {
    mount: mount, add: add, refresh: refresh, open: open, close: close, toggle: toggle,
    count: function () { var b = B(); return b ? b.list({ kind: "estimate" }).length : 0; }
  };

  // Material for MkDocs swaps content via instant-nav; re-mount on each navigation.
  if (window.document$ && typeof window.document$.subscribe === "function") window.document$.subscribe(mount);
  else if (document.readyState !== "loading") mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();

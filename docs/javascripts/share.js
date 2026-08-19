/* ── Header "Share this page" control ─────────────────────────────────────────
   Injects a share icon-button into the top bar. Clicking opens a small popover
   with Copy link / Teams / LinkedIn / X. Links are built from the current page
   at open time and each carries a utm_source so GoatCounter can attribute
   traffic to how the page was shared. The menu is appended to <body> and
   fixed-positioned under the button so the sticky header never clips it.
   Wired through Material's document$ so it survives instant navigation. */
(function () {
  "use strict";

  var SHARE_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 1 0-3-3c0 .24.04.47.09.7L8.04 9.81A3 3 0 1 0 6 15c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 1 0 2.92-2.92z"/></svg>';
  var COPY_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.9 12a3.1 3.1 0 0 1 3.1-3.1h4V7H7a5 5 0 0 0 0 10h4v-1.9H7A3.1 3.1 0 0 1 3.9 12zM17 7h-4v1.9h4A3.1 3.1 0 0 1 17 15h-4V17h4a5 5 0 0 0 0-10zm-9 4h8v2H8z"/></svg>';

  var btn, menu, copiedEl;

  function pageTitle() {
    var h1 = document.querySelector("article h1, .md-content h1");
    if (h1) {
      var clone = h1.cloneNode(true);
      var link = clone.querySelector(".headerlink");
      if (link) link.remove();               // drop the "¶" permalink anchor
      var txt = clone.textContent.trim();
      if (txt) return txt;
    }
    return (document.title || "Copilot Ramp Playbook").split(" - ")[0];
  }

  function utmUrl(channel) {
    var base = location.origin + location.pathname; // canonical page, no query/hash
    return base + "?utm_source=" + channel + "&utm_medium=share";
  }

  function gcount(channel) {
    if (window.goatcounter && typeof window.goatcounter.count === "function") {
      window.goatcounter.count({
        path: location.pathname + "#share-" + channel,
        title: "Share: " + channel,
        event: true
      });
    }
  }

  function buildLinks() {
    var title = pageTitle();
    menu.querySelector('[data-share-channel="teams"]').href =
      "https://teams.microsoft.com/share?href=" + encodeURIComponent(utmUrl("teams")) +
      "&msgText=" + encodeURIComponent(title);
    menu.querySelector('[data-share-channel="linkedin"]').href =
      "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(utmUrl("linkedin"));
    menu.querySelector('[data-share-channel="x"]').href =
      "https://twitter.com/intent/tweet?url=" + encodeURIComponent(utmUrl("x")) +
      "&text=" + encodeURIComponent(title);
    menu.querySelector("[data-share-copy]").setAttribute("data-copy-url", utmUrl("copy"));
  }

  function place() {
    var r = btn.getBoundingClientRect();
    menu.style.top = (r.bottom + 8) + "px";
    menu.style.right = Math.max(8, window.innerWidth - r.right) + "px";
  }

  function onDocClick(e) {
    if (!menu.contains(e.target) && !btn.contains(e.target)) close();
  }
  function onKey(e) { if (e.key === "Escape") { close(); btn.focus(); } }
  function onReflow() { if (menu.getAttribute("data-open") === "true") place(); }

  function open() {
    buildLinks();
    menu.hidden = false;
    place();
    // next frame so the transition runs
    requestAnimationFrame(function () { menu.setAttribute("data-open", "true"); });
    btn.setAttribute("aria-expanded", "true");
    if (copiedEl) copiedEl.textContent = "";
    var first = menu.querySelector(".cf-mi");
    if (first) first.focus();
    document.addEventListener("click", onDocClick, true);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", onReflow);
    window.addEventListener("scroll", onReflow, true);
  }

  function close() {
    menu.setAttribute("data-open", "false");
    btn.setAttribute("aria-expanded", "false");
    document.removeEventListener("click", onDocClick, true);
    document.removeEventListener("keydown", onKey, true);
    window.removeEventListener("resize", onReflow);
    window.removeEventListener("scroll", onReflow, true);
    setTimeout(function () { if (menu.getAttribute("data-open") !== "true") menu.hidden = true; }, 160);
  }

  function toggle() { (btn.getAttribute("aria-expanded") === "true") ? close() : open(); }

  function doCopy(el) {
    var url = el.getAttribute("data-copy-url") || location.href;
    var done = function () { if (copiedEl) copiedEl.textContent = "Link copied"; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, done);
    } else {
      var ta = document.createElement("textarea");
      ta.value = url; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) { /* no-op */ }
      document.body.removeChild(ta); done();
    }
    gcount("copy");
  }

  function buildMenuOnce() {
    if (menu) return;
    menu = document.createElement("div");
    menu.className = "cf-sharemenu";
    menu.setAttribute("role", "group");
    menu.setAttribute("aria-label", "Share this page");
    menu.hidden = true;
    menu.innerHTML =
      '<button type="button" class="cf-mi" data-share-copy>' + COPY_ICON + "Copy link</button>" +
      '<a class="cf-mi" data-share-channel="teams" target="_blank" rel="noopener noreferrer">Teams</a>' +
      '<a class="cf-mi" data-share-channel="linkedin" target="_blank" rel="noopener noreferrer">LinkedIn</a>' +
      '<a class="cf-mi" data-share-channel="x" target="_blank" rel="noopener noreferrer">X</a>' +
      '<div class="cf-mi-copied" role="status" aria-live="polite"></div>';
    document.body.appendChild(menu);
    copiedEl = menu.querySelector(".cf-mi-copied");

    menu.querySelector("[data-share-copy]").addEventListener("click", function () { doCopy(this); });
    [].forEach.call(menu.querySelectorAll("a[data-share-channel]"), function (a) {
      a.addEventListener("click", function () { gcount(a.getAttribute("data-share-channel")); close(); });
    });
  }

  function mount() {
    var inner = document.querySelector(".md-header__inner");
    if (!inner) return;
    buildMenuOnce();

    if (inner.querySelector(".cf-share")) return; // already mounted in this header

    var wrap = document.createElement("div");
    wrap.className = "cf-share";
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "md-header__button md-icon cf-sharebtn";
    btn.setAttribute("aria-label", "Share this page");
    btn.setAttribute("aria-haspopup", "true");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = SHARE_ICON;
    btn.addEventListener("click", function (e) { e.stopPropagation(); toggle(); });
    wrap.appendChild(btn);

    var source = inner.querySelector(".md-header__source");
    if (source) inner.insertBefore(wrap, source);
    else inner.appendChild(wrap);
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(mount);
  } else if (document.readyState !== "loading") {
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount);
  }
})();

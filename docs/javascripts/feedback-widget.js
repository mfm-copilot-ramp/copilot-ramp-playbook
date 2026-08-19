/* ── "Send feedback" widget ──────────────────────────────────────────────────
   Adds a floating "Feedback" button to every page. Clicking it opens an
   accessible modal that embeds the Microsoft Forms feedback form. The current
   page URL is passed to the form's "Page" question so every submission is
   tagged with where it came from — feedback lands straight in the maintainer's
   inbox (email notifications are enabled on the form).

   The iframe is only loaded when the modal is first opened (no third-party
   request on ordinary page loads), and its src is rebuilt on every open so the
   captured page is always the page the reader is actually on. Wired through
   Material's document$ observable so it survives instant navigation. */
(function () {
  "use strict";

  // Microsoft Forms response endpoint + the prefill parameter for the "Page"
  // question (from the form's "Get pre-filled URL" tool).
  var FORM_BASE =
    "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=" +
    "v4j5cvGGr0GRqy180BHbR4C6AnQQ33xFh-xIWDBnM-1UQkVEMUw4M0RJRE5ZNUM2Q1JJOVU2UTFVMC4u";
  var PAGE_PARAM = "r9895038ed9dc42d1abdad6bc9b9bffd7";

  var overlay, dialog, frame, trigger, lastFocus;

  function buildFrameSrc() {
    return FORM_BASE + "&embed=true&" + PAGE_PARAM + "=" + encodeURIComponent(location.href);
  }

  function focusables() {
    if (!dialog) return [];
    return [].slice.call(
      dialog.querySelectorAll(
        'button, [href], iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (el) { return el.offsetParent !== null || el === frame; });
  }

  function onKeydown(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key !== "Tab") return;
    // Simple focus trap across the header controls (the iframe manages its own
    // internal tab order once focused).
    var f = focusables();
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open() {
    if (!overlay) return;
    lastFocus = document.activeElement;
    frame.src = buildFrameSrc();          // (re)load the form for the current page
    overlay.setAttribute("data-open", "true");
    overlay.removeAttribute("aria-hidden");
    document.addEventListener("keydown", onKeydown, true);
    // Move focus into the dialog for keyboard + screen-reader users. Deferred a
    // frame so the overlay has finished becoming visible (visibility: hidden
    // elements can't take focus).
    requestAnimationFrame(function () {
      var closeBtn = dialog.querySelector(".cf-close");
      if (closeBtn) closeBtn.focus();
    });

    if (window.goatcounter && typeof window.goatcounter.count === "function") {
      window.goatcounter.count({
        path: location.pathname + "#feedback-open",
        title: "Feedback: open",
        event: true
      });
    }
  }

  function close() {
    if (!overlay) return;
    overlay.setAttribute("data-open", "false");
    overlay.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onKeydown, true);
    frame.src = "about:blank";            // stop the embed when hidden
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function buildOnce() {
    if (document.querySelector(".cf-fab")) return;   // already built

    var icon =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 10H6v-2h12v2zm0-4H6V6h12v2z"/></svg>';

    trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "cf-fab";
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", "cf-overlay");
    trigger.innerHTML = icon + '<span class="cf-fab-label">Feedback</span>';
    trigger.addEventListener("click", open);

    overlay = document.createElement("div");
    overlay.className = "cf-overlay";
    overlay.id = "cf-overlay";
    overlay.setAttribute("data-open", "false");
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML =
      '<div class="cf-dialog" role="dialog" aria-modal="true" aria-labelledby="cf-title">' +
        '<div class="cf-head">' +
          '<h2 class="cf-title" id="cf-title">Send feedback</h2>' +
          '<button type="button" class="cf-close" aria-label="Close feedback">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="cf-body">' +
          '<p class="cf-loading">Loading the feedback form…</p>' +
          '<iframe class="cf-frame" title="Copilot Ramp Playbook feedback form" ' +
            'src="about:blank" loading="lazy" ' +
            'allow="clipboard-write" referrerpolicy="no-referrer"></iframe>' +
        '</div>' +
      '</div>';

    document.body.appendChild(trigger);
    document.body.appendChild(overlay);

    dialog = overlay.querySelector(".cf-dialog");
    frame = overlay.querySelector(".cf-frame");

    overlay.querySelector(".cf-close").addEventListener("click", close);
    // Backdrop click (outside the dialog) closes.
    overlay.addEventListener("mousedown", function (e) {
      if (e.target === overlay) close();
    });
    // Hide the "loading" hint once the form paints.
    frame.addEventListener("load", function () {
      var hint = overlay.querySelector(".cf-loading");
      if (hint && frame.src !== "about:blank") hint.style.display = "none";
    });
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(buildOnce);
  } else if (document.readyState !== "loading") {
    buildOnce();
  } else {
    document.addEventListener("DOMContentLoaded", buildOnce);
  }
})();

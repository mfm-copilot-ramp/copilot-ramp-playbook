/* ── "Share this page" row ────────────────────────────────────────────────────
   The Teams / LinkedIn / X links are rendered server-side (with a per-channel
   utm_source) so they work without JavaScript. This script only enhances the
   "Copy link" button and fires a cookieless GoatCounter event per share so you
   can see which channels actually drive traffic. Re-binds on instant navigation. */
(function () {
  "use strict";

  function wire() {
    var box = document.querySelector(".page-share[data-share]");
    if (!box || box.dataset.bound === "1") return;
    box.dataset.bound = "1";

    var copied = box.querySelector("[data-copied]");

    function gcount(channel) {
      if (window.goatcounter && typeof window.goatcounter.count === "function") {
        window.goatcounter.count({
          path: location.pathname + "#share-" + channel,
          title: "Share: " + channel,
          event: true
        });
      }
    }

    var copyBtn = box.querySelector("[data-share-copy]");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var url = copyBtn.getAttribute("data-copy-url") || location.href;
        var done = function () {
          if (!copied) return;
          copied.textContent = "Copied!";
          copied.setAttribute("data-show", "true");
          setTimeout(function () { copied.setAttribute("data-show", "false"); }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done, done);
        } else {
          var ta = document.createElement("textarea");
          ta.value = url;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); } catch (e) { /* no-op */ }
          document.body.removeChild(ta);
          done();
        }
        gcount("copy");
      });
    }

    var links = box.querySelectorAll("a[data-share-channel]");
    [].forEach.call(links, function (a) {
      a.addEventListener("click", function () { gcount(a.getAttribute("data-share-channel")); });
    });
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(wire);
  } else if (document.readyState !== "loading") {
    wire();
  } else {
    document.addEventListener("DOMContentLoaded", wire);
  }
})();

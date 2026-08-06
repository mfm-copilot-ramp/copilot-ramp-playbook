// engine-cards.js — click-to-expand behaviour for the "Pick the engine for the
// job" harness cards (docs/empowerment/pick-the-engine.md). Each .eng-card
// toggles its own .eng-detail panel. Works with mouse, keyboard, and Material's
// instant navigation. If JS never runs, engine-cards.css leaves panels open so
// no content is hidden. Companion styles: docs/stylesheets/engine-cards.css
(function () {
  function wire() {
    var cards = document.querySelectorAll(".eng-card");
    if (!cards.length) return;

    // We have JS: start collapsed (the .no-js fallback keeps them open otherwise).
    document.documentElement.classList.remove("no-js");

    cards.forEach(function (card) {
      if (card.dataset.engWired === "1") return;
      card.dataset.engWired = "1";

      var detail = card.querySelector(".eng-detail");
      var toggle = card.querySelector(".eng-toggle");
      var label = toggle ? toggle.querySelector(".eng-toggle-text") : null;
      var openText = "How it works";
      var closeText = "Hide details";

      function setOpen(open) {
        card.classList.toggle("is-open", open);
        card.setAttribute("aria-expanded", open ? "true" : "false");
        if (detail) detail.setAttribute("aria-hidden", open ? "false" : "true");
        if (label) label.textContent = open ? closeText : openText;
      }

      // Collapsed to start.
      setOpen(false);

      function onActivate(e) {
        // Let real links inside the card behave normally.
        if (e.target.closest("a")) return;
        e.preventDefault();
        setOpen(!card.classList.contains("is-open"));
      }

      card.addEventListener("click", onActivate);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          if (e.target.closest("a")) return;
          e.preventDefault();
          setOpen(!card.classList.contains("is-open"));
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(wire);
  }
})();

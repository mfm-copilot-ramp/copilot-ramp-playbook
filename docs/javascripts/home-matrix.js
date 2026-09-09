/* ──────────────────────────────────────────────────────────────────────────
 * home-matrix.js — make the homepage "Find your starting point" role × stage
 * grid fully clickable.
 *
 * The matrix (table.home-matrix in docs/index.md) links only its row headers
 * (roles) and column headers (stages). The intersection cells — the signal-bar
 * meters — were plain <td>s, so visitors who followed the on-page prompt
 * ("Click any stage to jump straight in") and clicked a cell got nothing.
 * Clarity flagged this as the site's top source of dead clicks.
 *
 * This is progressive enhancement: it reads each column header's stage link and
 * wraps every data cell in an <a> to that stage, so a click on any cell jumps to
 * the stage in that column. With JS off, the grid still renders and the header
 * links still work. Companion styles: docs/stylesheets/home.css (.matrix-linked).
 * ────────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  function stageLabel(a) {
    // Header anchors read like "STAGE 3Cowork"; strip the eyebrow for the a11y label.
    return (a.textContent || "").replace(/stage\s*\d+/i, "").trim();
  }

  function init() {
    var table = document.querySelector("table.home-matrix");
    if (!table || table.classList.contains("matrix-linked")) { return; }

    var headerLinks = Array.prototype.slice.call(
      table.querySelectorAll("thead th a")
    );
    if (!headerLinks.length) { return; }

    var stages = headerLinks.map(function (a) {
      return { href: a.getAttribute("href"), label: stageLabel(a) };
    });

    var rows = Array.prototype.slice.call(table.querySelectorAll("tbody tr"));
    rows.forEach(function (tr) {
      var roleTh = tr.querySelector("th");
      var roleLabel = roleTh ? roleTh.textContent.trim() : "";
      var cells = Array.prototype.slice.call(tr.querySelectorAll("td"));
      cells.forEach(function (td, i) {
        var stage = stages[i];
        if (!stage || !stage.href) { return; }
        if (td.querySelector("a.matrix-cell-link")) { return; }

        var link = document.createElement("a");
        link.className = "matrix-cell-link";
        link.href = stage.href;
        link.setAttribute(
          "aria-label",
          roleLabel + " — open " + stage.label
        );

        // Move the meter (decorative here) inside the link and hide it from AT,
        // since the link's aria-label now describes the destination.
        while (td.firstChild) { link.appendChild(td.firstChild); }
        var meter = link.querySelector(".meter");
        if (meter) {
          meter.setAttribute("aria-hidden", "true");
          meter.removeAttribute("role");
          meter.removeAttribute("aria-label");
        }
        td.appendChild(link);
      });
    });

    table.classList.add("matrix-linked");
  }

  if (document.readyState !== "loading") { init(); }
  else { document.addEventListener("DOMContentLoaded", init); }
  // Re-run after Material for MkDocs instant-navigation swaps the page body.
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);
  }
})();

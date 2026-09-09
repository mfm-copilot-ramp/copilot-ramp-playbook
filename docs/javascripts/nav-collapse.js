/* ──────────────────────────────────────────────────────────────────────────
 * nav-collapse.js — collapse the Walkthroughs stage groups in the left nav.
 *
 * The site enables Material's `navigation.expand`, which force-expands EVERY nav
 * section by default. That's the maintainers' intent for Start / Build / etc.,
 * but the Walkthroughs section holds ~143 pages across 7 stage groups — expanded,
 * it's an unusable wall. Material has no per-section expand setting, so this
 * scopes a collapse to just that one section:
 *
 *   • every stage group (and the Walkthroughs section on non-walkthrough pages)
 *     starts COLLAPSED;
 *   • the trail to the current page stays OPEN — so on a Studio walkthrough the
 *     Walkthroughs section and its "Stage 6 · Studio" group are expanded, and the
 *     other six stages are collapsed.
 *
 * Pure progressive enhancement: with JS off you get the theme's default (all
 * expanded). No-op when the Walkthroughs section isn't in the sidebar. Re-runs
 * under Material instant navigation so the open group tracks the current page.
 * ────────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  function headerLabel(item) {
    // The visible header text of a nested nav item is the first .md-ellipsis
    // (inside the section's link/label), before its child list.
    var el = item.querySelector(".md-ellipsis");
    return el ? (el.textContent || "").trim() : "";
  }

  // Nested nav items we manage: the "Walkthroughs" section and its "Stage N …"
  // groups. Scoped to those labels so no other section is ever touched.
  function isManaged(label) {
    return label === "Walkthroughs" || /^Stage\s/.test(label);
  }

  function run() {
    var sidebar = document.querySelector(".md-sidebar--primary");
    if (!sidebar) return;

    var nested = sidebar.querySelectorAll(".md-nav__item--nested");
    Array.prototype.forEach.call(nested, function (item) {
      if (!isManaged(headerLabel(item))) return;
      var toggle = item.querySelector(":scope > input.md-nav__toggle");
      if (!toggle) return;
      // Tag the group so walkthrough.css can override the theme's global
      // navigation.expand (which force-shows nested navs) and collapse it by
      // default, revealing children only when the toggle is checked.
      item.classList.add("rc-wt-navgroup");
      var active = item.querySelector(".md-nav__link--active");
      // Keep open only if the current page lives inside this group.
      toggle.checked = !!active;
    });
  }

  if (document.readyState !== "loading") { run(); }
  else { document.addEventListener("DOMContentLoaded", run); }
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(run); // Material instant navigation
  }
})();

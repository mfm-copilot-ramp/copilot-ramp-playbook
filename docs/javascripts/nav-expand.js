// Navigation open/closed defaults.
//
// Material's `navigation.expand` is unreliable when combined with
// `navigation.tabs`, so we set the initial "open" state ourselves by checking
// the native nav toggles. Clicking a section label still collapses it.
//
// Exception: the "Solution Templates" section holds a long, growing catalogue
// (Studio + Foundry, and eventually per-function sub-groups). Left fully
// expanded it dominates the sidebar, so we collapse ITS nested groups by
// default — while every other section (Start by Role, Start by Product, etc.)
// stays expanded. The branch that contains the current page is left open so you
// can still see its siblings, and any future sub-groups added under Solution
// Templates collapse by default too, with no code changes.
(function () {
  var COLLAPSE_SECTION = "Solution Templates";

  // Open every section (unchanged, proven behaviour). Plain `.checked = true`
  // with no synthetic events — dispatching change events here confuses
  // Material's collapse observer and can leave sibling menus collapsed.
  function expandNav() {
    document
      .querySelectorAll(".md-sidebar--primary .md-nav__toggle")
      .forEach(function (toggle) {
        toggle.checked = true;
      });
  }

  // The direct header label/link text of a nested nav item (with
  // navigation.indexes the header is an <a>, otherwise a <label>).
  function headerText(item) {
    var header = item.querySelector(":scope > label, :scope > .md-nav__link");
    return header ? header.textContent.trim() : "";
  }

  // Collapse ONLY the Solution Templates subtree's nested groups, skipping the
  // branch that contains the current page. Purely subtractive: it never opens a
  // toggle and never touches anything outside that one section, so it cannot
  // affect the other menus. Collapsing needs a `change` event — Material
  // animates the section from its observer, not from the `:checked` state alone.
  function collapseSolutions() {
    var sidebar = document.querySelector(".md-sidebar--primary");
    if (!sidebar) return;

    var section = null;
    sidebar.querySelectorAll(".md-nav__item--nested").forEach(function (item) {
      if (headerText(item) === COLLAPSE_SECTION) section = item;
    });
    if (!section) return;

    var ownToggle = section.querySelector(":scope > .md-nav__toggle");
    section.querySelectorAll(".md-nav__toggle").forEach(function (toggle) {
      if (toggle === ownToggle) return; // keep the section header itself open
      var item = toggle.closest(".md-nav__item--nested");
      if (item && item.querySelector(".md-nav__link--active")) return; // active branch stays open
      if (toggle.checked) {
        toggle.checked = false;
        toggle.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }

  function updateNav() {
    expandNav();
    collapseSolutions();
  }

  // Run once the DOM is ready.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateNav);
  } else {
    updateNav();
  }

  // Re-run on Material's instant navigation events, if enabled. This observable
  // also emits after Material has wired up its collapse handlers, so the
  // `change` dispatch in collapseSolutions is guaranteed to be observed.
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(updateNav);
  }
})();

/* ──────────────────────────────────────────────────────────────────────────
 * walkthroughs-library.js — the /walkthroughs/ library index.
 *
 * Renders every walkthrough as a filterable card grid, sourced live from
 * docs/path-catalog.json (regenerated from front-matter on every build by
 * tooling/gen_path_catalog.py). Because the data is generated, the library
 * self-maintains: a new walkthrough page appears here with zero hand edits.
 *
 * Mounts into two elements on docs/walkthroughs/index.md:
 *   #rc-lib-filter — the Stage / Role / Time chip bar + search + count
 *   #rc-lib-grid   — a Material "grid cards" container this fills with <li>s
 *
 * Reuses the stage-page card visual system (docs/stylesheets/cards.css:
 * .rc-filter / .rc-seg / .rc-opt / .rc-chip / .grid.cards) so the library
 * looks native. Progressive enhancement: with JS off the page shows a noscript
 * pointer to the Use-Case Catalog. Idempotent + safe under Material instant nav.
 * ────────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var STAGE_ORDER = ["chat", "first-party", "cowork", "agent-builder", "autopilots", "studio", "foundry"];
  var STAGE_LABEL = {
    "chat": "Stage 1 · Chat",
    "first-party": "Stage 2 · First-party",
    "cowork": "Stage 3 · Cowork",
    "agent-builder": "Stage 4 · Agent Builder",
    "autopilots": "Stage 5 · Autopilots",
    "studio": "Stage 6 · Studio",
    "foundry": "Stage 7 · Foundry"
  };
  var ROLE_ORDER = ["end-user", "manager", "champion", "maker", "developer", "it-admin", "hr", "marketer"];
  var ROLE_LABEL = {
    "end-user": "End user", "manager": "Manager", "champion": "Champion", "maker": "Maker",
    "developer": "Developer", "it-admin": "IT", "hr": "HR", "marketer": "Marketing"
  };
  var LEVEL_RANK = { "starter": 0, "intermediate": 1, "advanced": 2 };
  var TIME_OPTS = [
    { id: "all", label: "All", test: function () { return true; } },
    { id: "5", label: "\u2264 5 min", test: function (t) { return t > 0 && t <= 5; } },
    { id: "15", label: "\u2264 15 min", test: function (t) { return t > 0 && t <= 15; } },
    { id: "long", label: "Longer", test: function (t) { return t > 15; } }
  ];

  var _cache = null; // parsed catalog, kept across instant-nav re-runs

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function timeMinutes(t) {
    var m = /(\d+)/.exec(t || "");
    return m ? parseInt(m[1], 10) : 0;
  }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function cardHTML(it) {
    var mins = timeMinutes(it.time);
    var chips = "";
    if (it.stageLabel) {
      chips += '<span class="rc-chip rc-chip-stage">' + esc(it.stageLabel) + "</span> ";
    }
    if (mins > 0) {
      chips += '<span class="rc-chip rc-chip-time">\u23F1 ' + mins + " min</span> ";
    }
    (it.roles || []).forEach(function (r) {
      chips += '<span class="rc-chip rc-chip-role">\uD83D\uDC64 ' + esc(ROLE_LABEL[r] || r) + "</span> ";
    });
    if (it.level) {
      if (it.level === "starter") {
        chips += '<span class="rc-chip rc-chip-star">\u2605 Starter</span>';
      } else {
        chips += '<span class="rc-chip rc-chip-adapt">' + esc(cap(it.level)) + "</span>";
      }
    }
    var href = "../" + it.path; // library lives at /walkthroughs/; item.path = walkthroughs/slug/
    return (
      '<li data-title="' + esc((it.title || "").toLowerCase()) +
      '" data-desc="' + esc((it.description || "").toLowerCase()) +
      '" data-stage="' + esc(it.stage || "") +
      '" data-roles="' + esc((it.roles || []).join(" ")) +
      '" data-time="' + mins + '">' +
      '<p><strong><a href="' + esc(href) + '">' + esc(it.title) + "</a></strong></p>" +
      (it.description ? "<p>" + esc(it.description) + "</p>" : "") +
      '<p><span class="rc-meta">' + chips + "</span></p>" +
      "</li>"
    );
  }

  function build(container, filterBar, items) {
    // Sort: stage order → level → title, for a sensible default reading order.
    items = items.slice().sort(function (a, b) {
      var sa = STAGE_ORDER.indexOf(a.stage), sb = STAGE_ORDER.indexOf(b.stage);
      if (sa !== sb) return (sa < 0 ? 99 : sa) - (sb < 0 ? 99 : sb);
      var la = LEVEL_RANK[a.level] == null ? 9 : LEVEL_RANK[a.level];
      var lb = LEVEL_RANK[b.level] == null ? 9 : LEVEL_RANK[b.level];
      if (la !== lb) return la - lb;
      return (a.title || "").localeCompare(b.title || "");
    });

    var ul = document.createElement("ul");
    ul.innerHTML = items.map(cardHTML).join("");
    container.innerHTML = "";
    container.appendChild(ul);
    var cards = Array.prototype.slice.call(ul.querySelectorAll("li"));

    // Which facets are actually present, in canonical order.
    var stagePresent = {}, rolePresent = {};
    items.forEach(function (it) {
      if (it.stage) stagePresent[it.stage] = true;
      (it.roles || []).forEach(function (r) { rolePresent[r] = true; });
    });
    var stageBtns = STAGE_ORDER.filter(function (s) { return stagePresent[s]; });
    var roleBtns = ROLE_ORDER.filter(function (r) { return rolePresent[r]; });

    var state = { stage: "all", role: "all", time: "all", q: "" };

    filterBar.classList.add("rc-filter");
    filterBar.hidden = false;
    filterBar.innerHTML = "";

    filterBar.appendChild(group("Stage", "stage",
      [{ id: "all", label: "All" }].concat(stageBtns.map(function (s) {
        return { id: s, label: STAGE_LABEL[s] || s };
      }))));
    filterBar.appendChild(group("Role", "role",
      [{ id: "all", label: "All" }].concat(roleBtns.map(function (r) {
        return { id: r, label: ROLE_LABEL[r] || r };
      }))));
    filterBar.appendChild(group("Time", "time",
      TIME_OPTS.map(function (o) { return { id: o.id, label: o.label }; })));

    var searchWrap = document.createElement("div");
    searchWrap.className = "rc-filter-group rc-lib-search";
    var input = document.createElement("input");
    input.type = "search";
    input.className = "rc-search";
    input.placeholder = "Search walkthroughs\u2026";
    input.setAttribute("aria-label", "Search walkthroughs by title or description");
    input.addEventListener("input", function () { state.q = input.value.trim().toLowerCase(); apply(); });
    searchWrap.appendChild(input);
    filterBar.appendChild(searchWrap);

    var count = document.createElement("span");
    count.className = "rc-filter-count";
    filterBar.appendChild(count);

    function group(labelText, facet, opts) {
      var wrap = document.createElement("div");
      wrap.className = "rc-filter-group";
      var lab = document.createElement("span");
      lab.className = "rc-filter-label";
      lab.textContent = labelText;
      wrap.appendChild(lab);
      var seg = document.createElement("span");
      seg.className = "rc-seg";
      opts.forEach(function (o) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "rc-opt" + (state[facet] === o.id ? " active" : "");
        b.textContent = o.label;
        b.addEventListener("click", function () {
          state[facet] = o.id;
          seg.querySelectorAll(".rc-opt").forEach(function (x) { x.classList.remove("active"); });
          b.classList.add("active");
          apply();
        });
        seg.appendChild(b);
      });
      wrap.appendChild(seg);
      return wrap;
    }

    function timeTest(t) {
      var opt = TIME_OPTS.filter(function (o) { return o.id === state.time; })[0];
      return opt ? opt.test(t) : true;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (li) {
        var mins = parseInt(li.getAttribute("data-time"), 10) || 0;
        var roles = li.getAttribute("data-roles") || "";
        var ok =
          (state.stage === "all" || li.getAttribute("data-stage") === state.stage) &&
          (state.role === "all" || roles.split(" ").indexOf(state.role) !== -1) &&
          timeTest(mins) &&
          (!state.q ||
            li.getAttribute("data-title").indexOf(state.q) !== -1 ||
            li.getAttribute("data-desc").indexOf(state.q) !== -1);
        li.hidden = !ok;
        if (ok) visible++;
      });
      count.textContent = visible + (visible === 1 ? " walkthrough" : " walkthroughs");
      empty.hidden = visible !== 0;
    }

    var empty = document.createElement("p");
    empty.className = "rc-filter-empty";
    empty.textContent = "No walkthroughs match those filters yet — try widening Time or clearing Role.";
    empty.hidden = true;
    container.parentNode.insertBefore(empty, container.nextSibling);

    apply();
  }

  function render(catalog) {
    var container = document.getElementById("rc-lib-grid");
    var filterBar = document.getElementById("rc-lib-filter");
    if (!container || !filterBar) return;
    if (container.dataset.rcLibDone === "1") return;
    container.dataset.rcLibDone = "1";
    var items = (catalog.items || []).filter(function (it) { return it.kind === "walkthrough"; });
    if (!items.length) return;
    build(container, filterBar, items);
  }

  function init() {
    var container = document.getElementById("rc-lib-grid");
    if (!container || container.dataset.rcLibDone === "1") return;
    if (_cache) { render(_cache); return; }
    fetch("../path-catalog.json", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) { if (data) { _cache = data; render(data); } })
      .catch(function () { /* leave the noscript/plain page as the fallback */ });
  }

  if (document.readyState !== "loading") { init(); }
  else { document.addEventListener("DOMContentLoaded", init); }
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);
  }
})();

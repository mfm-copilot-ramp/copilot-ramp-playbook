/* ──────────────────────────────────────────────────────────────────────────
 * card-filter.js — chip filter for stage-page walkthrough cards.
 *
 * Looks for a mount point `#rc-filterbar` and one or more Material grid-card
 * grids marked `.rc-grid`. Each card carries a <span class="rc-meta"
 * data-roles="end-user manager" data-time="5"> that this script reads to build
 * Role + Time filter chips and to show/hide cards. Empty `.rc-bucket` sections
 * are hidden automatically. Progressive enhancement: with JS off, all cards
 * simply show. Companion styles: docs/stylesheets/cards.css
 * ────────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var ROLE_ORDER = ["end-user", "manager", "champion", "maker", "developer", "it-admin", "hr", "marketer"];
  var ROLE_LABEL = {
    "end-user": "End user", "manager": "Manager", "champion": "Champion", "maker": "Maker",
    "developer": "Developer", "it-admin": "IT", "hr": "HR", "marketer": "Marketing"
  };
  var TIME_OPTS = [
    { id: "all",  label: "All",      test: function ()  { return true; } },
    { id: "5",    label: "\u2264 5 min",  test: function (t) { return t > 0 && t <= 5; } },
    { id: "15",   label: "\u2264 15 min", test: function (t) { return t > 0 && t <= 15; } },
    { id: "long", label: "Longer",   test: function (t) { return t > 15; } }
  ];
  // Harness filter (studio stage). Cards tagged data-harness="any" (platform how-tos
  // that work on every engine) always show; harness-specific cards show under their
  // own chip or "All". The group only appears when a page actually mixes harnesses.
  var HARNESS_ORDER = ["github-copilot", "standard", "chat"];
  var HARNESS_LABEL = { "github-copilot": "GitHub Copilot", "standard": "Standard", "chat": "Copilot chat" };

  function init() {
    var mount = document.getElementById("rc-filterbar");
    var grids = Array.prototype.slice.call(document.querySelectorAll(".rc-grid"));
    if (!mount || !grids.length) { return; }

    var cards = [];
    grids.forEach(function (g) {
      Array.prototype.slice.call(g.querySelectorAll("li")).forEach(function (li) {
        var meta = li.querySelector(".rc-meta");
        var roles = (meta && meta.getAttribute("data-roles"))
          ? meta.getAttribute("data-roles").trim().split(/\s+/) : [];
        var time = meta ? (parseInt(meta.getAttribute("data-time"), 10) || 0) : 0;
        var harness = meta ? (meta.getAttribute("data-harness") || "") : "";
        cards.push({ li: li, roles: roles, time: time, harness: harness });
      });
    });
    if (!cards.length) { return; }

    var present = {};
    cards.forEach(function (c) { c.roles.forEach(function (r) { present[r] = true; }); });
    var roleButtons = ROLE_ORDER.filter(function (r) { return present[r]; });

    var harnessPresent = {};
    cards.forEach(function (c) { if (c.harness && c.harness !== "any") { harnessPresent[c.harness] = true; } });
    var harnessButtons = HARNESS_ORDER.filter(function (h) { return harnessPresent[h]; });

    var state = { role: "all", time: "all", harness: "all" };

    mount.classList.add("rc-filter");
    mount.innerHTML = "";
    mount.appendChild(buildGroup("Role", "role",
      [{ id: "all", label: "All" }].concat(roleButtons.map(function (r) {
        return { id: r, label: ROLE_LABEL[r] || r };
      }))));
    mount.appendChild(buildGroup("Time", "time",
      TIME_OPTS.map(function (o) { return { id: o.id, label: o.label }; })));
    if (harnessButtons.length > 1) {
      mount.appendChild(buildGroup("Harness", "harness",
        [{ id: "all", label: "All" }].concat(harnessButtons.map(function (h) {
          return { id: h, label: HARNESS_LABEL[h] || h };
        }))));
    }

    var count = document.createElement("span");
    count.className = "rc-filter-count";
    mount.appendChild(count);

    function buildGroup(labelText, facet, opts) {
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
      cards.forEach(function (c) {
        var ok = (state.role === "all" || c.roles.indexOf(state.role) !== -1) &&
          timeTest(c.time) &&
          (state.harness === "all" || c.harness === "any" || c.harness === state.harness);
        c.li.hidden = !ok;
        if (ok) { visible++; }
      });
      Array.prototype.slice.call(document.querySelectorAll(".rc-bucket")).forEach(function (sec) {
        var any = Array.prototype.slice.call(sec.querySelectorAll(".rc-grid li"))
          .some(function (li) { return !li.hidden; });
        sec.hidden = !any;
      });
      count.textContent = visible + (visible === 1 ? " walkthrough" : " walkthroughs");
    }

    apply();
  }

  if (document.readyState !== "loading") { init(); }
  else { document.addEventListener("DOMContentLoaded", init); }
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);
  }
})();

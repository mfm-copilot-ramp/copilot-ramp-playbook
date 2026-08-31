// walkthrough.js — progressive enhancement for /walkthroughs/ pages.
//
// Adds the `rc-walkthrough` body class (which docs/stylesheets/walkthrough.css
// keys off) and restructures the shared walkthrough anatomy into the pieces the
// CSS decorates:
//   • a hero wrapper around the title + tagline + meta line
//   • the meta line ("Stage · For · Level · Time") into labelled pills
//   • the step section into a numbered stepper with a rail — supporting BOTH
//     authoring styles: "### N. …" step headings (older, ~8 pages) and the
//     common "## Step by step" + ordered-list style (~104 pages)
//   • "> **Next:** …" blockquotes tagged for the ramp-accent colour
//
// Everything is progressive: with JS off the page is still plain, readable
// markdown. Idempotent and safe under Material's instant navigation (the
// article node is replaced on nav, so enhancement re-runs on the fresh DOM).

(function () {
  "use strict";

  var STEP_RE = /^\s*(\d+)\.\s+/;

  function isWalkthrough() {
    return /\/walkthroughs\//.test(location.pathname);
  }

  // Turn the "**Stage:** X · **For:** Y · …" paragraph into labelled pills.
  function buildMetaPills(p) {
    var parts = p.textContent.split("\u00B7"); // middle dot separator
    var meta = document.createElement("div");
    meta.className = "rc-wt-meta";
    parts.forEach(function (raw) {
      var seg = raw.trim();
      if (!seg) return;
      var i = seg.indexOf(":");
      var pill = document.createElement("span");
      pill.className = "rc-wt-pill";
      if (i > -1) {
        var k = document.createElement("span");
        k.className = "rc-wt-pill-k";
        k.textContent = seg.slice(0, i).trim();
        pill.appendChild(k);
        pill.appendChild(document.createTextNode(seg.slice(i + 1).trim()));
      } else {
        pill.textContent = seg;
      }
      meta.appendChild(pill);
    });
    return meta.childElementCount ? meta : null;
  }

  // Wrap title + tagline blockquote + meta line in a hero band.
  function buildHero(article, h1) {
    var hero = document.createElement("div");
    hero.className = "rc-wt-hero";
    article.insertBefore(hero, h1);

    var tagline = h1.nextElementSibling;
    hero.appendChild(h1);
    if (tagline && tagline.tagName === "BLOCKQUOTE") {
      var afterTag = tagline.nextElementSibling;
      hero.appendChild(tagline);
      tagline = afterTag;
    } else {
      tagline = hero.nextElementSibling;
    }

    // The meta paragraph: first <p> that looks like "Label: value · Label: …".
    var metaP = hero.nextElementSibling;
    if (
      metaP &&
      metaP.tagName === "P" &&
      metaP.textContent.indexOf("\u00B7") > -1 &&
      metaP.querySelector("strong")
    ) {
      var pills = buildMetaPills(metaP);
      if (pills) {
        hero.appendChild(pills);
        metaP.remove();
      }
    }
  }

  // A numbered badge, shared by both stepper builders.
  function makeBadge(n) {
    var badge = document.createElement("span");
    badge.className = "rc-wt-num";
    badge.setAttribute("aria-hidden", "true");
    badge.textContent = n;
    return badge;
  }

  // Pattern A — the older authoring style: each step is its own numbered
  // "### N. …" heading followed by its body. Used by ~8 pages. Returns true if
  // it built a stepper (so the ordered-list fallback knows to stand down).
  function buildStepperFromHeadings(article) {
    var h3s = article.querySelectorAll(".md-content__inner > h3, h3");
    var first = null;
    for (var i = 0; i < h3s.length; i++) {
      if (STEP_RE.test(h3s[i].textContent)) {
        first = h3s[i];
        break;
      }
    }
    if (!first) return false;

    var steps = document.createElement("div");
    steps.className = "rc-wt-steps";
    first.parentNode.insertBefore(steps, first);

    var node = first;
    var current = null;
    while (node) {
      var next = node.nextElementSibling;
      if (node.tagName === "H2") break;
      if (node.tagName === "H3" && STEP_RE.test(node.textContent)) {
        var n = node.textContent.match(STEP_RE)[1];
        // strip the literal "N. " from the heading's first text node
        for (var c = 0; c < node.childNodes.length; c++) {
          var cn = node.childNodes[c];
          if (cn.nodeType === 3 && STEP_RE.test(cn.nodeValue)) {
            cn.nodeValue = cn.nodeValue.replace(STEP_RE, "");
            break;
          }
        }
        current = document.createElement("div");
        current.className = "rc-wt-step";
        steps.appendChild(current);
        current.appendChild(makeBadge(n));
        current.appendChild(node);
      } else if (node.tagName === "H3") {
        break; // a non-numbered H3 ends the stepper
      } else if (current) {
        current.appendChild(node);
      }
      node = next;
    }
    return steps.childElementCount > 0;
  }

  // Pattern B — the common authoring style: a "## Step by step" section whose
  // steps are a single top-level ordered list ("1. **Lead.** body"). Used by
  // ~104 pages. We convert that <ol> into the same .rc-wt-step structure so the
  // rail + numbered badges apply, with zero content edits. The <li> markers are
  // hidden by CSS (.rc-wt-steps--ol) since the badge now carries the number.
  function buildStepperFromList(article) {
    var h2s = article.querySelectorAll(".md-content__inner > h2, h2");
    var section = null;
    for (var i = 0; i < h2s.length; i++) {
      // Use the heading's own text, ignoring Material's appended permalink
      // ("¶" headerlink anchor) so the match isn't defeated by trailing glyphs.
      var label = h2s[i].firstChild && h2s[i].firstChild.nodeType === 3
        ? h2s[i].firstChild.nodeValue
        : h2s[i].textContent;
      if (/^\s*step by step\b/i.test(label)) {
        section = h2s[i];
        break;
      }
    }
    if (!section) return false;

    // Find the ordered list for this section (skip any intro paragraphs, stop
    // at the next H2 so we never reach into a later section).
    var ol = null;
    var scan = section.nextElementSibling;
    while (scan) {
      if (scan.tagName === "H2") break;
      if (scan.tagName === "OL") { ol = scan; break; }
      scan = scan.nextElementSibling;
    }
    if (!ol) return false;

    var items = [];
    for (var c = 0; c < ol.children.length; c++) {
      if (ol.children[c].tagName === "LI") items.push(ol.children[c]);
    }
    if (!items.length) return false;

    var steps = document.createElement("div");
    steps.className = "rc-wt-steps rc-wt-steps--ol";
    ol.parentNode.insertBefore(steps, ol);

    var start = parseInt(ol.getAttribute("start"), 10);
    var n = isNaN(start) ? 1 : start;
    items.forEach(function (li) {
      var step = document.createElement("div");
      step.className = "rc-wt-step";
      step.appendChild(makeBadge(n));
      while (li.firstChild) step.appendChild(li.firstChild);
      steps.appendChild(step);
      n++;
    });
    ol.remove();
    return true;
  }

  // Fix the "dead-click" trap (Clarity caught readers rage-clicking step
  // headings that look tappable but do nothing). Each step's <h3> already carries
  // a Material permalink (a.headerlink), but it's hover-only — so on touch, where
  // hover never fires, the tap lands on nothing. We surface that permalink
  // persistently (CSS via .rc-wt-step--linked) and make the whole heading a
  // working deep-link: a click anywhere on it (outside a real link) triggers the
  // permalink, turning a dead tap into the jump-to-step action readers expect.
  // Keyboard users still tab straight to the visible permalink anchor.
  function linkifyStepHeadings(article) {
    var heads = article.querySelectorAll(".rc-wt-step > h3");
    for (var i = 0; i < heads.length; i++) {
      (function (h) {
        var link = h.querySelector("a.headerlink");
        if (!link || !link.getAttribute("href")) return;
        var step = h.parentNode; // the .rc-wt-step wrapper the CSS keys off
        if (step && step.classList) step.classList.add("rc-wt-step--linked");
        h.addEventListener("click", function (e) {
          if (e.target.closest && e.target.closest("a")) return;
          link.click();
        });
      })(heads[i]);
    }
  }

  // Build a numbered stepper from whichever authoring pattern the page uses.
  function buildStepper(article) {
    if (!buildStepperFromHeadings(article)) buildStepperFromList(article);
    linkifyStepHeadings(article);
  }

  // Tag "> **Next:** …" blockquotes so the CSS can give them the ramp accent.
  function tagNextCallouts(article) {
    var bqs = article.querySelectorAll(".md-content__inner > blockquote");
    bqs.forEach(function (bq) {
      var strong = bq.querySelector("strong");
      if (strong && /^next\b/i.test(strong.textContent.trim())) {
        bq.classList.add("rc-wt-next");
      }
    });
  }

  function enhance() {
    var article = document.querySelector(".md-content__inner");
    if (!article || article.dataset.rcWtEnhanced === "1") return;
    // The Walkthroughs Library index lives under /walkthroughs/ but is a card
    // catalog, not a walkthrough — skip the hero/stepper anatomy (it would wrap
    // the bare "Library" H1 in an empty hero band).
    if (article.querySelector("#rc-lib-grid")) return;
    var h1 = article.querySelector("h1");
    if (!h1) return;
    article.dataset.rcWtEnhanced = "1";
    try {
      buildHero(article, h1);
      buildStepper(article);
      tagNextCallouts(article);
    } catch (e) {
      /* never let a decoration bug break the page */
    }
  }

  function run() {
    var on = isWalkthrough();
    document.body.classList.toggle("rc-walkthrough", on);
    if (on) enhance();
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(run); // Material instant navigation
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();

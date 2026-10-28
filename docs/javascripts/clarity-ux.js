/* UX fixes + privacy-safe analytics instrumentation.
 *
 * This file intentionally sends only static event labels and paths. It never
 * sends typed prompt text, estimator inputs, copied content, or user identity.
 */
(function () {
  "use strict";

  function pathKey() {
    return location.pathname.replace(/\/$/, "") || "/";
  }

  function track(name, label) {
    var safeName = String(name || "").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
    var safeLabel = label ? String(label).slice(0, 80) : "";
    if (!safeName) return;
    if (typeof window.clarity === "function") {
      window.clarity("event", safeName);
      window.clarity("set", "rc_last_event", safeName);
      if (safeLabel) window.clarity("set", "rc_last_label", safeLabel);
    }
    if (window.goatcounter) {
      window.goatcounter.count({
        path: pathKey() + "#ux-" + safeName + (safeLabel ? "-" + safeLabel.replace(/[^a-z0-9_-]/gi, "-").toLowerCase() : ""),
        title: "UX: " + safeName + (safeLabel ? " / " + safeLabel : ""),
        event: true
      });
    }
  }

  function tagSession(key, value) {
    if (typeof window.clarity === "function") {
      window.clarity("set", key, value);
    }
  }

  function copyText(text, ok) {
    if (!text) return Promise.resolve(false);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      return !!(document.execCommand && document.execCommand("copy"));
    } catch (e) {
      return false;
    } finally {
      ta.remove();
    }
  }

  function addCopyButton(target, label, eventName) {
    if (!target || target.dataset.rcCopyBound === "1") return;
    target.dataset.rcCopyBound = "1";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "rc-copy-affordance";
    btn.textContent = label || "Copy";
    btn.addEventListener("click", function () {
      copyText(target.textContent || "", label).then(function (ok) {
        btn.textContent = ok ? "Copied" : "Select and copy";
        track(eventName || "copy-content", target.closest(".hero-try") ? "home" : "page");
        setTimeout(function () { btn.textContent = label || "Copy"; }, 1800);
      });
    });
    var pre = target.closest("pre") || target;
    pre.parentNode.insertBefore(btn, pre);
  }

  function enhanceCopyAffordances(root) {
    root = root || document;

    var heroPrompt = root.querySelector(".hero-try pre code");
    if (heroPrompt) addCopyButton(heroPrompt, "Copy prompt", "home-try-prompt-copy");

    if (/\/walkthroughs\//.test(location.pathname)) {
      root.querySelectorAll("pre code").forEach(function (code) {
        addCopyButton(code, "Copy prompt", "walkthrough-prompt-copy");
      });
    }

    ["qe-results", "sp-results", "qi-results", "bulk-results"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || el.classList.contains("em-hidden") || !el.textContent.trim()) return;
      if (el.dataset.rcResultCopy === "1") return;
      el.dataset.rcResultCopy = "1";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "rc-copy-affordance rc-copy-result";
      btn.textContent = "Copy result summary";
      btn.addEventListener("click", function () {
        copyText(el.textContent.trim()).then(function (ok) {
          btn.textContent = ok ? "Result copied" : "Select and copy";
          track("estimator-result-copy", id);
          setTimeout(function () { btn.textContent = "Copy result summary"; }, 1800);
        });
      });
      el.insertBefore(btn, el.firstChild);
    });
  }

  function makeMatrixCellsClickable(root) {
    var table = root.querySelector(".home-matrix");
    if (!table || table.dataset.rcMatrixBound === "1") return;
    table.dataset.rcMatrixBound = "1";
    var headers = Array.prototype.slice.call(table.querySelectorAll("thead th")).slice(1);
    var stageLinks = headers.map(function (th) {
      var a = th.querySelector("a");
      return a ? { href: a.getAttribute("href"), label: a.textContent.trim().replace(/\s+/g, " ") } : null;
    });
    table.querySelectorAll("tbody tr").forEach(function (tr) {
      var role = tr.querySelector("th") ? tr.querySelector("th").textContent.trim() : "Role";
      Array.prototype.slice.call(tr.querySelectorAll("td")).forEach(function (td, idx) {
        if (td.querySelector("a") || !stageLinks[idx]) return;
        var a = document.createElement("a");
        a.className = "matrix-cell-link";
        a.href = stageLinks[idx].href;
        a.setAttribute("aria-label", role + " — " + stageLinks[idx].label);
        while (td.firstChild) a.appendChild(td.firstChild);
        td.appendChild(a);
      });
    });
  }

  function wireTracking(root) {
    root = root || document;
    root.querySelectorAll("[data-rc-track]").forEach(function (el) {
      if (el.dataset.rcTrackBound === "1") return;
      el.dataset.rcTrackBound = "1";
      el.addEventListener("click", function () {
        track(el.getAttribute("data-rc-track"), el.getAttribute("data-rc-label") || el.textContent.trim());
      });
    });

    root.querySelectorAll(".journey .step").forEach(function (el) {
      if (el.dataset.rcTrackBound === "1") return;
      el.dataset.rcTrackBound = "1";
      el.addEventListener("click", function () {
        track("home-stage-tile", el.textContent.trim().replace(/\s+/g, " ").slice(0, 60));
      });
    });

    var startJourney = root.querySelector('a[href$="stages/stage-1-chat/"].md-button--primary, a[href$="stages/stage-1-chat/"].step');
    if (startJourney && startJourney.dataset.rcStartBound !== "1") {
      startJourney.dataset.rcStartBound = "1";
      startJourney.addEventListener("click", function () { track("home-start-journey", "stage-1"); });
    }

    var pickRole = Array.prototype.find.call(root.querySelectorAll("a"), function (a) {
      return /pick your role/i.test(a.textContent || "");
    });
    if (pickRole && pickRole.dataset.rcPickRoleBound !== "1") {
      pickRole.dataset.rcPickRoleBound = "1";
      pickRole.addEventListener("click", function () { track("home-pick-role", "hero"); });
    }

    var tryAnother = root.querySelector(".ht-next");
    if (tryAnother && tryAnother.dataset.rcTryBound !== "1") {
      tryAnother.dataset.rcTryBound = "1";
      tryAnother.addEventListener("click", function () { track("home-try-another", "hero-prompt"); });
    }

    root.querySelectorAll('a[href="../index.md"], a[href="../"], a[href="../../"], a[href="/"], a[href$="/copilot-ramp-playbook/"]').forEach(function (a) {
      if (a.dataset.rcHomeBound === "1") return;
      a.dataset.rcHomeBound = "1";
      a.addEventListener("click", function () {
        if (/\/stages\//.test(location.pathname)) track("stage-to-home-click", location.pathname);
      });
    });

    var estimatorStart = root.querySelector('button[onclick*="qeAnalyze"], button[onclick*="bulkAnalyze"]');
    if (estimatorStart && estimatorStart.dataset.rcEstimatorStart !== "1") {
      estimatorStart.dataset.rcEstimatorStart = "1";
      estimatorStart.addEventListener("click", function () { track("estimator-start", estimatorStart.textContent.trim()); });
    }
  }

  function tagCurrentPage() {
    var p = location.pathname;
    var isHome = p === "/" || p === "/copilot-ramp-playbook/" || /\/copilot-ramp-playbook\/index\.html$/.test(p);
    if (/\/walkthroughs\//.test(p)) {
      tagSession("rc_page_type", "walkthrough");
      track("walkthrough-view", p.split("/").filter(Boolean).pop());
    } else if (/\/roles\//.test(p)) {
      tagSession("rc_page_type", "role");
      track("role-page-view", p.split("/").filter(Boolean).pop());
    } else if (/\/stages\/stage-1-chat\//.test(p)) {
      tagSession("rc_page_type", "stage-1");
      track("stage1-view", "stage-1-chat");
    } else if (/\/credit-estimator\/|\/ai-builder-estimator\//.test(p)) {
      tagSession("rc_page_type", "estimator");
      tagSession("rc_segment_candidate", "dead-clicks-on-estimator-pages");
    } else if (isHome) {
      tagSession("rc_page_type", "home");
    }

    try {
      var n = parseInt(sessionStorage.getItem("rc_page_views") || "0", 10) + 1;
      sessionStorage.setItem("rc_page_views", String(n));
      if (n >= 5) {
        tagSession("rc_segment_candidate", "deep-tool-users");
        track("deep-user-session", String(n));
      }
    } catch (e) {}
  }

  function watchEstimatorResults() {
    var root = document.getElementById("estimator-studio") || document.body;
    if (!root || root.dataset.rcEstimatorWatch === "1") return;
    root.dataset.rcEstimatorWatch = "1";
    var seen = {};
    var mo = new MutationObserver(function () {
      ["qe-results", "sp-results", "qi-results", "bulk-results"].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el || el.classList.contains("em-hidden") || !el.textContent.trim() || seen[id]) return;
        seen[id] = true;
        track("estimator-result", id);
        enhanceCopyAffordances(document);
      });
    });
    mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  }

  function watchHomeNoClick() {
    var p = location.pathname;
    if (!(p === "/" || p === "/copilot-ramp-playbook/" || /\/copilot-ramp-playbook\/index\.html$/.test(p))) return;
    var clicked = false;
    var mark = function () { clicked = true; };
    document.addEventListener("click", mark, { once: true, capture: true });
    setTimeout(function () {
      if (!clicked) {
        tagSession("rc_segment_candidate", "homepage-no-click-sessions");
        track("homepage-no-click-15s", "home");
      }
    }, 15000);
  }

  function run() {
    tagCurrentPage();
    makeMatrixCellsClickable(document);
    wireTracking(document);
    enhanceCopyAffordances(document);
    watchEstimatorResults();
    watchHomeNoClick();
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(run);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();

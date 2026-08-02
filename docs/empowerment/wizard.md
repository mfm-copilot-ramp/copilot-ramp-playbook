---
title: Path Finder
description: Answer six quick questions about your process, cadence, complexity, reach, data, and actions, and this Path Finder points you to the right Copilot build stage.
hide: [toc]
---

# Path Finder

Answer six quick questions about your process — cadence, complexity, reach, data, actions, and how much you
want to build — and we'll recommend a **primary** Copilot surface plus a **backup**, with the strengths and
trade-offs of each. It's the [decision tree](decision-tree.md), made clickable and weighted.

!!! warning "Unofficial — a guide, not a rule"
    This routes the *typical* case. Real decisions also weigh licensing, data sensitivity, and who owns the
    result. Treat the recommendation as a starting point, then confirm against
    [Licensing & Prerequisites](../prerequisites.md) and Microsoft's
    [which Copilot is right for you](https://learn.microsoft.com/en-us/copilot/) hub.

<div id="path-wizard" markdown="0">

<style>
#path-wizard { font-family: inherit; --pw-accent: var(--md-primary-fg-color); }

.pw-card {
  border: 1px solid var(--md-default-fg-color--lightest);
  border-radius: 12px;
  padding: 1.75rem 1.75rem 2rem;
  background: var(--md-default-bg-color);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

/* progress */
.pw-progress { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.25rem; }
.pw-dot {
  width: 0.7rem; height: 0.7rem; border-radius: 50%;
  background: var(--md-default-fg-color--lightest); transition: background 0.25s, transform 0.25s;
}
.pw-dot.active { background: var(--pw-accent); transform: scale(1.25); }
.pw-dot.done { background: var(--pw-accent); opacity: 0.5; }
.pw-step-label {
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--md-default-fg-color--light); margin-left: auto;
}

/* question */
.pw-q { font-size: 1.4rem; font-weight: 700; line-height: 1.3; margin: 0 0 0.4rem; }
.pw-sub { color: var(--md-default-fg-color--light); margin: 0 0 1.4rem; font-size: 0.95rem; }

/* options */
.pw-options { display: grid; gap: 0.85rem; }
@media (min-width: 720px) { .pw-options.cols-2 { grid-template-columns: 1fr 1fr; } }
.pw-option {
  display: flex; align-items: flex-start; gap: 0.9rem; text-align: left;
  padding: 1rem 1.1rem; border: 1.5px solid var(--md-default-fg-color--lightest);
  border-radius: 10px; background: var(--md-code-bg-color); cursor: pointer;
  font-family: inherit; font-size: 1rem; color: var(--md-default-fg-color);
  transition: border-color 0.15s, transform 0.1s, box-shadow 0.15s; width: 100%;
}
.pw-option:hover { border-color: var(--pw-accent); transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
.pw-option:focus-visible { outline: 2px solid var(--pw-accent); outline-offset: 2px; }
.pw-option .ico { font-size: 1.5rem; line-height: 1.2; flex-shrink: 0; }
.pw-option .txt b { display: block; font-weight: 700; margin-bottom: 0.15rem; }
.pw-option .txt span { font-size: 0.85rem; color: var(--md-default-fg-color--light); }

/* nav buttons */
.pw-actions { display: flex; align-items: center; gap: 0.75rem; margin-top: 1.5rem; }
.pw-btn {
  display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer;
  padding: 0.45rem 1rem; border-radius: 6px; font-family: inherit; font-size: 0.88rem;
  border: 1px solid var(--md-default-fg-color--lighter); background: transparent;
  color: var(--md-default-fg-color--light); transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.pw-btn:hover { border-color: var(--pw-accent); color: var(--pw-accent); }
.pw-btn.primary { background: var(--pw-accent); border-color: var(--pw-accent); color: var(--md-primary-bg-color); }
.pw-btn.primary:hover { opacity: 0.9; color: var(--md-primary-bg-color); }
.pw-spacer { flex: 1; }

/* result */
.pw-result { animation: pwFade 0.35s ease; }
@keyframes pwFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.pw-result-badge {
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--pw-accent); margin-bottom: 0.5rem;
}
.pw-result-head { display: flex; align-items: center; gap: 0.85rem; margin-bottom: 0.4rem; }
.pw-result-head .ico { font-size: 2.4rem; line-height: 1; }
.pw-result-head h2 { margin: 0; font-size: 1.7rem; font-weight: 800; }
.pw-tagline { color: var(--md-default-fg-color--light); font-size: 1.02rem; margin: 0 0 1.2rem; }
.pw-detail { margin: 1rem 0; }
.pw-detail h4 {
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--md-default-fg-color--light); margin: 0 0 0.3rem;
}
.pw-detail p { margin: 0; line-height: 1.55; }
.pw-alt {
  margin-top: 1.2rem; padding: 0.85rem 1rem; border-left: 3px solid var(--pw-accent);
  background: var(--md-code-bg-color); border-radius: 0 8px 8px 0; font-size: 0.9rem;
  color: var(--md-default-fg-color--light);
}
.pw-cta {
  display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 1.4rem;
  padding: 0.6rem 1.3rem; border-radius: 8px; background: var(--pw-accent);
  color: var(--md-primary-bg-color) !important; font-weight: 700; text-decoration: none;
  transition: opacity 0.15s, transform 0.1s;
}
.pw-cta:hover { opacity: 0.92; transform: translateY(-1px); }
.pw-crumbs { font-size: 0.8rem; color: var(--md-default-fg-color--lighter); margin-bottom: 0.9rem; }
.pw-crumbs span { color: var(--md-default-fg-color--light); }

/* primary + backup results */
.pw-answers { font-size: 0.82rem; color: var(--md-default-fg-color--light); margin-bottom: 1rem; }
.pw-answers b { color: var(--md-default-fg-color); font-weight: 600; }
.pw-backup { margin-top: 1.7rem; padding-top: 1.4rem; border-top: 1px dashed var(--md-default-fg-color--lightest); }
.pw-backup-badge { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--md-default-fg-color--light); margin-bottom: 0.5rem; }
.pw-backup .pw-result-head h2 { font-size: 1.3rem; }
.pw-backup .pw-result-head .ico { font-size: 1.9rem; }
.pw-runner-note { color: var(--md-default-fg-color--light); font-size: 0.98rem; margin: 0 0 0.4rem; }

/* pros / cons grid */
.pw-pc { display: grid; gap: 0.9rem 1.4rem; margin: 1rem 0 0.4rem; }
@media (min-width: 640px) { .pw-pc { grid-template-columns: 1fr 1fr; } }
.pw-pc-col h4 { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.45rem; }
.pw-pc-col.pros h4 { color: #2e9e57; }
.pw-pc-col.cons h4 { color: #d08641; }
.pw-pc-col.pros h4::before { content: "\2713  "; }
.pw-pc-col.cons h4::before { content: "\26A0  "; }
.pw-pc-col ul { list-style: none; margin: 0; padding: 0; }
.pw-pc-col li { position: relative; padding-left: 1.3rem; margin: 0.32rem 0; font-size: 0.9rem; line-height: 1.45; }
.pw-pc-col.pros li::before { content: "\2713"; position: absolute; left: 0; color: #2e9e57; font-weight: 700; }
.pw-pc-col.cons li::before { content: "\2013"; position: absolute; left: 0; color: #d08641; font-weight: 700; }
.pw-cta.secondary { background: transparent; color: var(--pw-accent) !important; border: 1.5px solid var(--pw-accent); }
.pw-cta.secondary:hover { background: var(--md-code-bg-color); }
</style>

<div class="pw-card" id="pw-card" aria-live="polite"></div>

<script>
(function () {
  // ── Scoring model (mirrors empowerment/decision-tree.md, expanded) ─────────
  // Simpler-first order; also used as the tie-breaker when two surfaces tie.
  var ORDER = ["r_chat", "r_fpa", "r_cowork", "r_ab", "r_studio", "r_foundry"];

  var QUESTIONS = [
    {
      q: "How often will this happen?",
      sub: "Start with the rhythm of the work, not the tool \u2014 cadence is the strongest single signal.",
      options: [
        { ico: "\u26A1", title: "Once or occasionally",
          desc: "A task in front of me now; not a standing need.",
          w: { r_chat: 2, r_cowork: 2, r_fpa: 1 } },
        { ico: "\uD83D\uDD01", title: "Regularly \u2014 a repeatable need",
          desc: "Daily or weekly; my team will reuse it.",
          w: { r_ab: 2, r_fpa: 1, r_studio: 1 } },
        { ico: "\u267E\uFE0F", title: "Continuously \u2014 always-on",
          desc: "Runs on a schedule or trigger for many people.",
          w: { r_studio: 2, r_foundry: 2 } }
      ]
    },
    {
      q: "How many steps does the work involve?",
      sub: "One move, or a chain of them that has to run in order?",
      options: [
        { ico: "\u270D\uFE0F", title: "A single step",
          desc: "Draft, summarize, rewrite, or answer.",
          w: { r_chat: 3, r_fpa: 1 } },
        { ico: "\uD83E\uDDF5", title: "A few steps in sequence",
          desc: "Gather, then process, then produce.",
          w: { r_cowork: 2, r_ab: 1, r_studio: 1 } },
        { ico: "\uD83D\uDEF0\uFE0F", title: "Many steps, orchestrated",
          desc: "Branching logic, or runs triggered by an event.",
          w: { r_studio: 2, r_foundry: 2, r_cowork: 1 } }
      ]
    },
    {
      q: "Who relies on the result?",
      sub: "How far does the output need to travel beyond you?",
      options: [
        { ico: "\uD83E\uDDD1", title: "Just me",
          desc: "My own day-to-day productivity.",
          w: { r_chat: 2, r_cowork: 1, r_fpa: 1 } },
        { ico: "\uD83D\uDC65", title: "My team",
          desc: "A small group reuses the same helper.",
          w: { r_ab: 2, r_fpa: 1, r_studio: 1 } },
        { ico: "\uD83C\uDFE2", title: "The whole org or external users",
          desc: "Many people depend on it being right.",
          w: { r_studio: 2, r_foundry: 1 } }
      ]
    },
    {
      q: "What does it need to know?",
      sub: "Where does the grounding come from \u2014 you, your files, or live systems?",
      options: [
        { ico: "\uD83D\uDCAC", title: "Only what I give it in the moment",
          desc: "Context I paste, attach, or have open.",
          w: { r_chat: 2, r_cowork: 1 } },
        { ico: "\uD83D\uDCC1", title: "My own files or a knowledge base",
          desc: "A fixed set of reference documents.",
          w: { r_ab: 2, r_fpa: 1, r_studio: 1 } },
        { ico: "\uD83D\uDD0C", title: "Live connected systems and data",
          desc: "CRM, databases, line-of-business apps.",
          w: { r_studio: 3, r_foundry: 2 } }
      ]
    },
    {
      q: "Does it act, or just inform?",
      sub: "Reading and drafting is one thing \u2014 changing systems is another.",
      options: [
        { ico: "\uD83D\uDCD6", title: "Just answers and drafts",
          desc: "Read-only; I take it from there.",
          w: { r_chat: 2, r_fpa: 1, r_ab: 1 } },
        { ico: "\uD83E\uDE84", title: "Acts across my everyday tools",
          desc: "Moves work through my apps for me.",
          w: { r_cowork: 2, r_ab: 1, r_studio: 1 } },
        { ico: "\u2699\uFE0F", title: "Executes in business systems",
          desc: "Writes records or triggers transactions.",
          w: { r_studio: 3, r_foundry: 2 } }
      ]
    },
    {
      q: "How much do you want to build and own?",
      sub: "Be honest about the effort and governance you can take on.",
      options: [
        { ico: "\uD83C\uDF81", title: "Nothing \u2014 use what already exists",
          desc: "Fastest path; no maintenance.",
          w: { r_chat: 2, r_fpa: 2, r_cowork: 1 } },
        { ico: "\uD83E\uDDE9", title: "Low-code config I'll maintain",
          desc: "Assemble and publish without engineering.",
          w: { r_ab: 2, r_studio: 2 } },
        { ico: "\uD83D\uDEE0\uFE0F", title: "Pro-code, engineered and operated",
          desc: "Full control; I have developer ownership.",
          w: { r_foundry: 3, r_studio: 1 } }
      ]
    }
  ];

  var SURFACES = {
    r_chat: {
      ico: "\uD83D\uDCAC", name: "Stage 1 \u00B7 Chat",
      tagline: "The fastest value \u2014 a single task in the flow of work, with no setup.",
      pros: [
        "Zero setup \u2014 lives in the apps you already use",
        "Instant; nothing to build, govern, or maintain",
        "Ideal for drafting, summarizing, rewriting, and Q&A"
      ],
      cons: [
        "Nothing is reusable \u2014 you re-prompt every time",
        "No grounding in live or connected systems",
        "Won't take actions or run multi-step jobs on its own"
      ],
      href: "../../stages/stage-1-chat/", cta: "Go to Stage 1 \u00B7 Chat"
    },
    r_fpa: {
      ico: "\uD83E\uDD16", name: "Stage 2 \u00B7 First-party agents",
      tagline: "Specialist agents Microsoft already ships \u2014 the best agent is the one you don't build.",
      pros: [
        "Pre-built and tuned by Microsoft \u2014 no build effort",
        "Deep skills (research, analysis, facilitation) out of the box",
        "Governed and supported inside your license"
      ],
      cons: [
        "Availability varies by license and tenant settings",
        "Limited customization for a niche process",
        "May not match proprietary data or workflows"
      ],
      href: "../../stages/stage-2-first-party/", cta: "Go to Stage 2 \u00B7 First-party agents"
    },
    r_cowork: {
      ico: "\uD83D\uDE80", name: "Stage 3 \u00B7 Cowork",
      tagline: "Hand off a whole multi-step job once \u2014 no reusable agent to stand up.",
      pros: [
        "Delegates an end-to-end job in a single hand-off",
        "Nothing to build \u2014 perfect for one-off orchestration",
        "Works across your everyday content and apps"
      ],
      cons: [
        "Not reusable \u2014 you re-delegate each time it recurs",
        "Lighter governance and monitoring than a published agent",
        "Best for personal scope, not org-wide rollout"
      ],
      href: "../../stages/stage-3-cowork/", cta: "Go to Stage 3 \u00B7 Cowork"
    },
    r_ab: {
      ico: "\uD83E\uDDF1", name: "Stage 4 \u00B7 Agent Builder",
      tagline: "Package a recurring task as a no-code agent \u2014 a prompt plus a few files.",
      pros: [
        "No-code: instructions plus a few reference files",
        "Reusable and shareable with your team",
        "Quick to stand up and iterate"
      ],
      cons: [
        "No connectors, live data, or write-actions",
        "Lighter governance than Studio",
        "Personal/team scope \u2014 not an org-grade lifecycle"
      ],
      href: "../../stages/stage-4-agent-builder/", cta: "Go to Stage 4 \u00B7 Agent Builder"
    },
    r_studio: {
      ico: "\uD83C\uDFE2", name: "Stage 6 \u00B7 Copilot Studio",
      tagline: "Where agents grow up \u2014 knowledge, connectors, actions, publishing, and governance.",
      pros: [
        "Real knowledge sources, connectors, and actions",
        "Publish, monitor, and govern across the org",
        "Low-code \u2014 no full engineering team required"
      ],
      cons: [
        "Setup cost: environments, data boundaries, publish/monitor loop",
        "Low-code, not no-code \u2014 a genuine learning curve",
        "Overkill for a simple personal helper"
      ],
      href: "../../stages/stage-6-studio/", cta: "Go to Stage 6 \u00B7 Copilot Studio"
    },
    r_foundry: {
      ico: "\uD83D\uDEF0\uFE0F", name: "Microsoft Foundry",
      tagline: "The pro-code frontier \u2014 custom models, autonomous and triggered agents, evaluation, MCP tools.",
      pros: [
        "Pro-code control: custom models, autonomous runs, MCP tools",
        "Evaluation pipelines and scale-grade operations",
        "Maximum flexibility for engineered solutions"
      ],
      cons: [
        "Requires engineering ownership and ongoing ops",
        "Highest build and governance cost",
        "Overkill until you've outgrown low-code"
      ],
      href: "https://learn.microsoft.com/en-us/azure/ai-foundry/", cta: "Explore Microsoft Foundry", external: true
    }
  };

  var INTRO = {
    ico: "\uD83E\uDDED",
    q: "Find your starting surface",
    sub: "Six quick questions about your process \u2014 under two minutes. You'll get a primary recommendation plus a backup, with the trade-offs of each.",
    cta: "Start"
  };

  var card = document.getElementById("pw-card");
  if (!card) return;

  var picks = [];  // chosen option objects, one per answered question
  var cur = 0;     // current question index; === QUESTIONS.length on the result

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderIntro() {
    cur = 0;
    card.innerHTML =
      '<div class="pw-result" style="text-align:center">' +
        '<div style="font-size:3rem;line-height:1;margin-bottom:0.6rem">' + INTRO.ico + '</div>' +
        '<h2 style="margin:0 0 0.4rem;font-size:1.7rem;font-weight:800">' + esc(INTRO.q) + '</h2>' +
        '<p class="pw-tagline" style="margin:0 auto 1.4rem;max-width:34rem">' + esc(INTRO.sub) + '</p>' +
        '<button class="pw-cta" id="pw-start" style="border:none;cursor:pointer">' + esc(INTRO.cta) + ' \u2192</button>' +
      '</div>';
    document.getElementById("pw-start").addEventListener("click", function () {
      picks = []; renderQuestion(0);
    });
  }

  function renderQuestion(i) {
    cur = i;
    var node = QUESTIONS[i];
    var step = i + 1, total = QUESTIONS.length;
    var dots = "";
    for (var d = 1; d <= total; d++) {
      var cls = "pw-dot" + (d === step ? " active" : (d < step ? " done" : ""));
      dots += '<span class="' + cls + '"></span>';
    }
    var crumb = picks.length
      ? '<div class="pw-crumbs">Your path: ' + picks.map(function (p) { return '<span>' + esc(p.title) + '</span>'; }).join(" \u2192 ") + '</div>'
      : '';
    var opts = node.options.map(function (o, idx) {
      return '<button class="pw-option" data-idx="' + idx + '">' +
        '<span class="ico">' + o.ico + '</span>' +
        '<span class="txt"><b>' + esc(o.title) + '</b><span>' + esc(o.desc) + '</span></span>' +
      '</button>';
    }).join("");
    card.innerHTML =
      '<div class="pw-progress">' + dots +
        '<span class="pw-step-label">Step ' + step + ' of ' + total + '</span></div>' +
      crumb +
      '<h3 class="pw-q">' + esc(node.q) + '</h3>' +
      '<p class="pw-sub">' + esc(node.sub) + '</p>' +
      '<div class="pw-options' + (node.cols === 2 ? " cols-2" : "") + '">' + opts + '</div>' +
      '<div class="pw-actions">' +
        '<button class="pw-btn" id="pw-back">\u2190 Back</button>' +
        '<span class="pw-spacer"></span>' +
        '<button class="pw-btn" id="pw-restart">Start over</button>' +
      '</div>';
    card.querySelectorAll(".pw-option").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = +btn.getAttribute("data-idx");
        picks[i] = node.options[idx];
        picks.length = i + 1;               // drop any answers from a previous, longer run
        if (i + 1 < QUESTIONS.length) { renderQuestion(i + 1); }
        else { renderResult(); }
      });
    });
    document.getElementById("pw-back").addEventListener("click", goBack);
    document.getElementById("pw-restart").addEventListener("click", restart);
  }

  function rank() {
    var scores = {};
    ORDER.forEach(function (k) { scores[k] = 0; });
    picks.forEach(function (p) {
      for (var k in p.w) { scores[k] = (scores[k] || 0) + p.w[k]; }
    });
    return ORDER.slice().sort(function (a, b) {
      if (scores[b] !== scores[a]) { return scores[b] - scores[a]; }
      return ORDER.indexOf(a) - ORDER.indexOf(b); // tie-break: simpler surface first
    });
  }

  function pcBlock(s) {
    var pros = s.pros.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join("");
    var cons = s.cons.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join("");
    return '<div class="pw-pc">' +
      '<div class="pw-pc-col pros"><h4>Strengths</h4><ul>' + pros + '</ul></div>' +
      '<div class="pw-pc-col cons"><h4>Trade-offs</h4><ul>' + cons + '</ul></div>' +
    '</div>';
  }

  function renderResult() {
    cur = QUESTIONS.length;
    var ranked = rank();
    var primary = SURFACES[ranked[0]];
    var backup = SURFACES[ranked[1]];
    var answers = picks.map(function (p) { return '<b>' + esc(p.title) + '</b>'; }).join(" \u00B7 ");
    var pAttrs = primary.external ? ' target="_blank" rel="noopener"' : '';
    var bAttrs = backup.external ? ' target="_blank" rel="noopener"' : '';
    var doneDots = "";
    for (var i = 0; i < QUESTIONS.length; i++) { doneDots += '<span class="pw-dot done"></span>'; }
    card.innerHTML =
      '<div class="pw-result">' +
        '<div class="pw-progress">' + doneDots +
          '<span class="pw-step-label">Recommendation</span></div>' +
        '<div class="pw-answers">Your answers: ' + answers + '</div>' +
        '<div class="pw-primary">' +
          '<div class="pw-result-badge">Primary recommendation</div>' +
          '<div class="pw-result-head"><span class="ico">' + primary.ico + '</span><h2>' + esc(primary.name) + '</h2></div>' +
          '<p class="pw-tagline">' + esc(primary.tagline) + '</p>' +
          pcBlock(primary) +
          '<a class="pw-cta" href="' + primary.href + '"' + pAttrs + '>' + esc(primary.cta) + ' \u2192</a>' +
        '</div>' +
        '<div class="pw-backup">' +
          '<div class="pw-backup-badge">Backup option \u2014 if that isn\u2019t quite right</div>' +
          '<div class="pw-result-head"><span class="ico">' + backup.ico + '</span><h2>' + esc(backup.name) + '</h2></div>' +
          '<p class="pw-runner-note">' + esc(backup.tagline) + '</p>' +
          pcBlock(backup) +
          '<a class="pw-cta secondary" href="' + backup.href + '"' + bAttrs + '>' + esc(backup.cta) + ' \u2192</a>' +
        '</div>' +
        '<div class="pw-actions">' +
          '<button class="pw-btn" id="pw-back">\u2190 Back</button>' +
          '<span class="pw-spacer"></span>' +
          '<button class="pw-btn primary" id="pw-restart">Try another scenario</button>' +
        '</div>' +
      '</div>';
    document.getElementById("pw-back").addEventListener("click", goBack);
    document.getElementById("pw-restart").addEventListener("click", restart);
  }

  function goBack() {
    if (cur >= QUESTIONS.length) {          // on the result
      picks.pop();
      renderQuestion(QUESTIONS.length - 1);
    } else if (cur > 0) {
      picks.pop();
      renderQuestion(cur - 1);
    } else {
      renderIntro();
    }
  }

  function restart() { picks = []; renderIntro(); }

  function init() {
    var el = document.getElementById("pw-card");
    if (el) { card = el; restart(); }
  }

  // Material instant-loading safe init.
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);
  } else if (document.readyState !== "loading") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
</script>

</div>

---

!!! tip "Prefer the full map?"
    The Path Finder walks the same logic one question at a time. To see every branch at once — or to read it as a
    table — open [Choose the Right Path](decision-tree.md). When two destinations feel plausible, pick the
    **simpler** one first; it's far cheaper to graduate later than to over-build on day one.

> **📚 Learn more.**
>
> - [Which Copilot is right for you](https://learn.microsoft.com/en-us/copilot/) — Microsoft's official front door.
> - [Extend Microsoft 365 Copilot — options compared](https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/) — declarative vs. custom-engine agents.
> - [Build your AI empowerment team](index.md) — who owns this decision, and how to prioritize the backlog behind it.

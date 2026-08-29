/* ──────────────────────────────────────────────────────────────────────────
 * home-try.js — rotate the homepage "Try it now" prompt card.
 *
 * The hero card (aside.hero-try in docs/index.md) showed one fixed prompt, so a
 * repeat visitor only ever benefited once. This:
 *   • picks a random prompt on every load,
 *   • auto-advances on a gentle timer (paused the moment the visitor engages),
 *   • adds a "Try another" button to cycle on demand,
 *   • mixes Copilot Chat prompts (instant) with Cowork prompts (hand off a
 *     multi-step task) and adapts the eyebrow + footer to match.
 *
 * Progressive enhancement: with JS off, the static prompt baked into index.md
 * still renders and its copy button still works. We only ever replace text inside
 * the existing .ht-eyebrow / .ht-title / <code> / .ht-foot, so Material's clipboard
 * button (target "#__code_0 > code", read live on click) keeps copying whatever
 * prompt is currently shown.
 * ────────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var KINDS = {
    chat: {
      eyebrow: "\u26a1 Try it now \u00b7 60 seconds",
      foot: 'Paste into Copilot Chat in Teams, Outlook, or the M365 app. <a href="quick-wins/">More prompts \u2192</a>'
    },
    cowork: {
      eyebrow: "\u26a1 Hand it off \u00b7 60 seconds to set up",
      foot: 'Give this to <a href="stages/stage-3-cowork/">Cowork</a> — it runs the whole task, then you review. <a href="quick-wins/">More prompts \u2192</a>'
    }
  };

  var PROMPTS = [
    // ---- Copilot Chat: instant, single-shot wins ----
    {
      kind: "chat",
      title: "Turn any meeting into tracked follow-ups",
      body: `Summarize the meeting "[meeting name]" from [today]. Give me:
- Decisions made
- Action items, each with an owner and a due date
- Any open questions that were not resolved
Format the action items as a table I can paste into an email.`
    },
    {
      kind: "chat",
      title: "Catch up on a busy inbox in 60 seconds",
      body: `Summarize my unread email from the last 24 hours. Group it into:
- Needs a reply from me (say who's waiting and on what)
- FYI only
- Can be archived or ignored
List the "needs a reply" items first, most urgent at the top.`
    },
    {
      kind: "chat",
      title: "Rewrite a message to hit the right tone",
      body: `Rewrite the message below so it's clear, warm, and easy to skim — no jargon,
and end with one specific next step. Keep it under 120 words.

[paste your draft here]`
    },
    {
      kind: "chat",
      title: "Get the gist of a long email thread",
      body: `Summarize this email thread in five bullets:
- What's being decided or asked
- Where each person stands
- What's blocking a resolution
- The single next step I should take
- Anything that's owed to me or by me`
    },
    {
      kind: "chat",
      title: "Walk into your next 1:1 prepared",
      body: `Help me prep for my 1:1 with [name]. From our recent emails and meetings, give me:
- Open items between us, with status
- A win or two worth acknowledging
- Two or three good questions to ask
- Anything I still owe them`
    },
    {
      kind: "chat",
      title: "Turn a messy to-do list into a plan",
      body: `Here's everything on my plate today:
[paste your list]

Organize it into a realistic plan: what to do first, what can wait, and what to
delegate or drop. Flag anything likely to take longer than it looks.`
    },
    {
      kind: "chat",
      title: "Draft your weekly status from your own work",
      body: `Draft my weekly status update from my recent emails, meetings, and chats:
- Shipped this week
- In progress
- Blocked / needs help
One line per bullet, plain language, no fluff.`
    },
    // ---- Cowork: hand off a whole multi-step task ----
    {
      kind: "cowork",
      title: "Build a deck from your rough notes",
      body: `From these notes, build a 7-slide deck for a leadership readout. Open with the
decision we need, then context, options, recommendation, risks, and next steps.
Keep one idea per slide, draft speaker notes, and tell me which slides you were
least sure about so I can check them.

[attach or paste your notes]`
    },
    {
      kind: "cowork",
      title: "Synthesize a stack of documents into one brief",
      body: `Read all of these and write me one brief: what they agree on, where they conflict,
and what's missing. Lead with a 3-sentence bottom line, then the supporting detail,
and cite which source each claim came from. Flag anything where the sources
disagree so I know what to dig into.

[attach the documents]`
    },
    {
      kind: "cowork",
      title: "Produce a competitor comparison you can act on",
      body: `Build a competitive comparison of [Competitor A], [Competitor B], and [Competitor C]
from the attached documents. Compare them across: capabilities, target customer,
pricing, key strengths, key gaps, and how they position against us.
Give me a table for quick reference plus a short narrative I can use with execs.

[attach your research]`
    },
    {
      kind: "cowork",
      title: "Turn a topic into a structured research brief",
      body: `Research the [market / technology / competitive space] landscape and write a
structured brief covering: market size and trajectory, key players and positioning,
recent shifts, opportunities, and the implication for us. Cite sources, keep it to
two pages, and flag where you had to make assumptions.

[attach sources or name the topic]`
    }
  ];

  function pickDifferent(current, n) {
    if (n <= 1) { return 0; }
    var i;
    do { i = Math.floor(Math.random() * n); } while (i === current);
    return i;
  }

  function init() {
    var card = document.querySelector(".hero-try");
    if (!card) { return; }
    var eyebrowEl = card.querySelector(".ht-eyebrow");
    var titleEl = card.querySelector(".ht-title");
    var codeEl = card.querySelector(".highlight code, pre code");
    var footEl = card.querySelector(".ht-foot");
    if (!titleEl || !codeEl) { return; }

    var current = -1;
    var timer = null;
    var paused = false;
    var AUTO_MS = 9000;
    var reduce = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function apply(i) {
      var p = PROMPTS[i];
      if (!p) { return; }
      current = i;
      var kind = KINDS[p.kind] || KINDS.chat;
      if (eyebrowEl) { eyebrowEl.textContent = kind.eyebrow; }
      titleEl.textContent = p.title;
      // Replacing textContent keeps the same <code> element (and clipboard target),
      // so the copy button copies the new prompt on the next click.
      codeEl.textContent = p.body;
      if (footEl) { footEl.innerHTML = kind.foot; }
      card.setAttribute("data-kind", p.kind);
    }

    function render(i, animate) {
      if (animate && !reduce) {
        card.classList.add("ht-fade");
        setTimeout(function () {
          apply(i);
          card.classList.remove("ht-fade");
        }, 120);
      } else {
        apply(i);
      }
    }

    // ---- auto-advance timer (paused on engagement) ----
    function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
    function startTimer() {
      stopTimer();
      if (reduce || paused) { return; }
      if (document.hidden) { return; }
      timer = setInterval(function () {
        if (paused || document.hidden) { return; }
        render(pickDifferent(current, PROMPTS.length), true);
      }, AUTO_MS);
    }
    function pause() { paused = true; stopTimer(); }
    function resume() { paused = false; startTimer(); }

    // Pause whenever the visitor is engaging with the card; resume when they leave.
    card.addEventListener("mouseenter", pause);
    card.addEventListener("mouseleave", resume);
    card.addEventListener("focusin", pause);
    card.addEventListener("focusout", function (e) {
      if (!card.contains(e.relatedTarget)) { resume(); }
    });
    // Copying is a strong "I want this one" signal — stop rotating for good.
    var clip = card.querySelector(".md-clipboard");
    if (clip) { clip.addEventListener("click", pause); }
    // Don't rotate in a background tab.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { stopTimer(); } else { startTimer(); }
    });

    // ---- "Try another" button ----
    if (!card.querySelector(".ht-next")) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ht-next";
      btn.innerHTML = '<span aria-hidden="true">\u21bb</span> Try another';
      btn.setAttribute("aria-label", "Show another prompt");
      btn.addEventListener("click", function () {
        pause(); // manual control takes over from the timer
        render(pickDifferent(current, PROMPTS.length), true);
      });
      if (footEl && footEl.parentNode) {
        footEl.parentNode.insertBefore(btn, footEl);
      } else {
        card.appendChild(btn);
      }
    }

    // Random prompt on each visit, then let the timer take it from there.
    render(Math.floor(Math.random() * PROMPTS.length), false);
    startTimer();
  }

  if (document.readyState !== "loading") { init(); }
  else { document.addEventListener("DOMContentLoaded", init); }
  // Re-run after Material for MkDocs instant-navigation swaps the page body.
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);
  }
})();

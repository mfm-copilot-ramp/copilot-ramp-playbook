---
title: Right-sizing — when to drop back a stage
description: Right-sizing your Copilot ramp — when a simpler stage beats a fancier agent, and how to drop back a rung so the tool matches the job in front of you.
hide: [toc]
---

# When you've gone too far — dropping back down the ramp

The rest of this playbook points **up**: each stage unlocks the next. But the ramp runs both ways.
The most expensive mistake in AI adoption isn't moving too slowly — it's solving a Stage 2 problem
with a Stage 6 tool. A throwaway task built as a governed Studio agent. A single rewrite spun up as a
Cowork project. Glue code in Foundry for something a connector already does.

**Climbing is a skill. Knowing when to climb back down is a discipline.** This page is the set of
*downward* arrows: honest signals that you've overshot, and where to land instead.

!!! tip "The rule of thumb"
    Use the **lowest stage that gets the job done**. Each step up the ramp adds power *and* cost —
    build time, maintenance, governance surface, and someone who has to own it. If a lower stage does
    the job, the higher stage isn't more advanced. It's just more expensive.

---

## Stage 7 → Stage 6 · Foundry back to Copilot Studio { #foundry-to-studio }

Foundry is the pro-code frontier. It's also the easiest place to over-engineer, because anything is
*possible* there.

!!! warning "You've gone too far if…"
    - You're hand-writing orchestration glue for a **single, linear task** a Studio topic handles.
    - You rebuilt a **connector or knowledge source** in code that Studio already ships out of the box.
    - The agent will be used by **one team**, on **internal data**, with **no custom model** in sight.
    - **You** are the only person who could maintain the code — there's no engineering team behind it.

**Drop back to [Stage 6 · Copilot Studio](stages/stage-6-studio.md).** If you don't need a custom or
fine-tuned model, autonomous multi-agent orchestration, or pro-code MCP tooling at scale, Studio gives
you knowledge, actions, publishing, and governance for a fraction of the effort.

---

## Stage 6 → Stage 4 · Studio back to Agent Builder { #studio-to-agent-builder }

This is the most common overshoot on the whole ramp — and the one the empowerment team sees most: a
personal productivity helper built as a full, governed Studio agent.

!!! warning "You've gone too far if…"
    - Your agent is **one knowledge source plus instructions** — no real action, no multi-topic logic.
    - It's used by **you or a handful of teammates**, not published to the org.
    - You spent a day in Studio to reproduce what a **declarative agent does in twenty minutes**.
    - You're managing an environment, a solution, and ALM for something that touches **no system of record**.

**Drop back to [Stage 4 · Agent Builder](stages/stage-4-agent-builder.md).** If the agent just needs to
answer over your files or a SharePoint site with a clear persona, build it declaratively. You can always
graduate it to Studio later — the [graduation walkthrough](walkthroughs/foundry-graduate-from-studio.md)
exists for exactly that moment, and so does the reverse instinct.

---

## Stage 5 → Stage 4 · Autopilots back to Agent Builder { #autopilots-to-agent-builder }

**Autopilots** are always-on, autonomous agents — Microsoft's category for them — and **Microsoft Scout** is the first one. They earn their keep on a *recurring,
background* job — one triggered by an event or signal, not a task you're happy to start yourself.

!!! warning "You've gone too far if…"
    - The job only needs to run **when you ask** — there's no event or signal that should set it off on its own.
    - You wanted a simple **answer-over-my-files** helper, not an agent that acts without you in the loop.
    - The capability is **gated** in your tenant and a declarative agent would unblock you today.

**Drop back to [Stage 4 · Agent Builder](stages/stage-4-agent-builder.md).** If you just need an
on-demand agent over your own knowledge with a clear persona, build it declaratively — no always-on
autonomy required. (And if you actually need real actions or org-wide publishing, that's *up* to
[Stage 6 · Copilot Studio](stages/stage-6-studio.md), not back to Autopilots.)

---

## Stage 4 → Stage 3 · Agent Builder back to Cowork { #agent-builder-to-cowork }

An agent is a tool you *reuse*. If there's no reuse and no audience, you've built a tool for a job that
was really just a task.

!!! warning "You've gone too far if…"
    - You're building an agent for a **one-off task** you'll run once or twice.
    - The "instructions" are things you could simply **type into the prompt** this one time.
    - The agent has **no audience but you** and **no second occasion** to use it.
    - You spent longer configuring the agent than the task would have taken by hand.

**Drop back to [Stage 3 · Cowork](stages/stage-3-cowork.md).** Hand the whole task to Copilot as a
delegated job. If you catch yourself doing the *same* Cowork task a third time — *that's* the signal to
come back up and build the agent.

---

## Stage 3 → Stage 1 · Cowork back to Chat { #cowork-to-chat }

Cowork shines when a task has real *steps*. A single ask doesn't need a project around it.

!!! warning "You've gone too far if…"
    - You spun up a multi-step Cowork session to do **one rewrite, one summary, one lookup**.
    - There's **nothing to orchestrate** — it's a single question with a single answer.
    - You're managing a "project" for something that fits in **one prompt**.

**Drop back to [Stage 1 · Copilot Chat](stages/stage-1-chat.md).** Just ask. Cowork earns its overhead
when you're delegating a whole workflow — not a sentence.

---

## Stage 2 → Stage 1 · First-Party agents back to Chat { #first-party-to-chat }

The specialized agents — Researcher, Analyst, Facilitator — are worth reaching for when the *depth*
matches. For a quick lookup, they're a detour.

!!! warning "You've gone too far if…"
    - You invoked **Researcher** for a fact Copilot Chat answers in one line.
    - You opened **Analyst** to do arithmetic you could ask for inline.
    - You're waiting on a deep-reasoning agent for something that needed **no reasoning at all**.

**Drop back to [Stage 1 · Copilot Chat](stages/stage-1-chat.md).** Save the first-party agents for the
genuinely hard, multi-source, or long-running asks where their depth pays for the wait.

---

## Stage 1 → off the ramp entirely · Chat back to just doing it { #chat-to-nothing }

The ramp has a bottom rung, and sometimes the right move is to step off it.

!!! warning "You've gone too far if…"
    - You're prompting for something you **already know** off the top of your head.
    - The manual version is a **thirty-second** copy, paste, or click.
    - You're spending more time **crafting the prompt** than the task would take by hand.

**Just do the task.** Not everything needs AI. Copilot is leverage for the hard, the repetitive, and the
tedious — not a tax on the trivial. Reaching for it reflexively is its own anti-pattern.

---

## Governance right-sizing · match the controls to the risk { #governance-right-sizing }

Overshoot isn't only about tools — it's about *ceremony*. Wrapping enterprise governance around a
zero-risk personal agent stalls adoption just as surely as shipping a risky one with none.

!!! warning "You've over-governed if…"
    - You're demanding **DLP review, an environment strategy, and ALM** for a personal agent over public
      docs that touches no sensitive data.
    - A throwaway helper is stuck in an **approval queue** designed for production, customer-facing agents.
    - The control effort **exceeds the risk** the agent actually carries.

**Match the controls to the risk.** Personal agents over non-sensitive data need a light touch;
customer-facing or data-rich agents need the full picture. The
[Security & Governance](empowerment/security.md) page lays out which controls belong at which tier, and
the [Choose the Right Path](empowerment/decision-tree.md) decision tree routes each idea to the stage it
actually needs.

---

## The signal, in one line

> If a **lower stage** does the job, the higher stage isn't more advanced — it's just more expensive.

Not sure which rung an idea belongs on? Run it through the
[Path Finder](empowerment/wizard.md), or read the team-level view of this same failure mode —
*wrong-tool sprawl* — on the [AI Empowerment Team](empowerment/index.md) page.

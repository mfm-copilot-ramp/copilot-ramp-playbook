---
title: Draft a 30/60/90-day onboarding plan for a new team member
description: Use Copilot Cowork to go from someone starts Monday to a complete, personalized 30/60/90-day onboarding plan in one session instead of an afternoon.
stage: cowork
roles: [manager]
tags: [onboarding, hr, planning, cowork]
level: intermediate
time: 20 min
status: walkthrough
prereqs: [m365-copilot-license, cowork-access]
updated: 2026-06-03
---

# Draft a 30/60/90-day onboarding plan for a new team member

> Go from "someone's starting Monday" to a complete, personalized 30/60/90-day plan — in one Cowork session instead of an afternoon of writing.

**Stage:** Cowork · **For:** Manager · **Level:** Intermediate · **Time:** 20 min

## When to use this

A new hire is joining your team. You know you need a structured first-90-days plan — what they need to learn, who they need to meet, and what success looks like at each milestone. But writing it from scratch takes time, and adapting a generic template to your actual team and role takes even longer.

Cowork can take your team context, the role description, and any onboarding materials you have and produce a complete, personalized 30/60/90 plan you can hand directly to your new team member.

## What you'll need

- **M365 Copilot license** with access to **Cowork**
- The new hire's role description or job title
- Some context about the team: focus areas, key stakeholders, active projects
- Any existing onboarding docs (optional — Cowork works without them)

## Try it now — the task description

Open Cowork and describe the task:

```
Draft a 30/60/90-day onboarding plan for a new [job title] joining my team.

Context about the team and role:
- Team focus: [what the team does in 2-3 sentences]
- Key stakeholders they'll work with: [names / roles]
- Active projects they'll join: [project names and brief descriptions]
- Main tools and systems they'll use: [e.g., Azure DevOps, Salesforce, SharePoint]

For each 30/60/90 phase, include:
- 3-5 learning goals (what they need to understand)
- 3-5 relationship goals (who they need to meet and why)
- 1-2 delivery goals (what they should produce or contribute)
- How success will be measured at the end of the phase

Format as a structured document I can hand to the new hire on day 1.
```

**Why this task format works:** Separating learning, relationship, and delivery goals ensures the plan doesn't collapse into a task list. Explicit success measures for each phase give the new hire clarity on what "done" looks like — and gives you a basis for check-ins.

## Step by step

1. **Fill in the context fields** — the more specific about your team and their role, the more useful the output.
2. **Run the task in Cowork.** Attach the job description if you have it.
3. **Review the relationship goals.** This section often needs the most customization — replace generic stakeholder types with specific names.
4. **Adjust the delivery goals.** Make sure the 30-day delivery goal is achievable and real, not aspirational.
5. **Add your own section.** Paste in a "our team norms" paragraph at the top — things like how decisions get made, how to raise blockers, and who to go to for what.
6. **Share before day 1.** Send the plan via email or as a Copilot Page before the first day so the new hire can read it over the weekend.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **For a role with existing docs:** attach your team's readme, the project wiki, or existing onboarding notes — Cowork will incorporate them into the plan.
- **Buddy/mentor plan:** add a section: `"Draft a parallel plan for the onboarding buddy — what their role is in each phase and the 3 most important things they should do to support the new hire."`
- **Kickoff email:** after the plan is ready, ask: `"Draft a welcome email to the new hire with a link to this plan and a warm summary of what their first week will look like."`
- **Post-90-day:** at the end of the period, ask Cowork to produce a 90-day retrospective brief based on your check-in notes.

## Watch out for

- **A 30/60/90 plan is a starting frame, not a contract.** The delivery goals especially need a reality check against the new hire's real ramp time.
- **Generic stakeholder types are placeholders.** Replace “key partner team” with real names before you hand it over, or it reads as boilerplate.
- **The plan reflects the role as you described it.** If the actual job differs from the job description, the plan will too.

## Where this leads (the ramp)

Drafting the 30/60/90 plan per hire works, but every manager on your team is reinventing it. Agent Builder lets you bottle this into a shared Onboarding agent, so the same quality plan is one prompt away for everyone.

> **Next:** [Agent Builder: build an Onboarding agent](agent-builder-onboarding-agent.md)

## Related

- [Build a "Cowork recipe" library for your org](cowork-recipe-library.md)

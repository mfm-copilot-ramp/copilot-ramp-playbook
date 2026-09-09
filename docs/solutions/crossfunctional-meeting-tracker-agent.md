---
title: "Solution Template: Meeting Notes & Action Tracker Agent"
description: A Copilot Studio template for a meeting tracker agent that extracts decisions and actions, tracks owners, and drafts follow-up summaries.
tags: [copilot-studio, productivity, meetings, actions, collaboration, template]
level: intermediate
time: 3–4 hours
status: solution-template
updated: 2026-08-29
---

# Solution Template: Meeting Notes & Action Tracker Agent

> **What this builds.** A Copilot Studio agent that turns raw meeting notes into structured decisions, action items, owners, due dates, risks, and follow-up summaries — team-agnostic enough for leadership meetings, project syncs, customer reviews, operations stand-ups, or working groups.

**Pattern:** Capture meeting context → extract decisions and actions → track open items → draft follow-up summary

---

!!! info "Which harness? Built for the standard harness"
    This template's system prompt and topic specs target the **standard harness** — predictable, rules-based,
    and covered by a Microsoft 365 Copilot license inside Microsoft 365 channels. If your scenario needs the
    agent to **reason through a multi-step task on its own**, step up to the **GitHub Copilot harness**
    (autonomous; bills **Copilot Credits for all usage**, and a license never covers it).
    [Compare the engines](../pick-the-engine.md).

## What the agent does

| Capability | Detail |
|---|---|
| Notes structuring | Converts raw notes into agenda topics, decisions, actions, risks, and parking-lot items |
| Action extraction | Identifies owner, due date, dependency, and status for each action item |
| Open action tracking | Maintains a structured list of open actions for the meeting series or team |
| Follow-up drafting | Drafts concise post-meeting summaries ready for the organiser to review |
| Team adaptation | Uses team-specific glossary, project names, and summary format where provided |
| Escalation prompts | Flags unclear owners, missing dates, blocked actions, and decisions needing confirmation |

---

## System prompt — copy and adapt

```
You are the Meeting Notes & Action Tracker agent for [Company Name].

Your job is to help any team turn meeting notes into clear outcomes: decisions,
action items, owners, due dates, risks, dependencies, and a follow-up summary.
You work from the notes and the team's approved working documents; you do not
invent decisions or commitments.

When a user gives you meeting notes:
1. Ask for missing meeting context if needed: meeting name, date, team or project,
   and whether this is a one-off meeting or part of a recurring series.
2. Extract only information supported by the notes. Separate facts, decisions,
   actions, risks, open questions, and parking-lot items.
3. For every action item, capture owner, due date, status, dependency, and source
   note. If owner or due date is missing, mark it as "Needs confirmation" rather
   than guessing.
4. Highlight decisions separately from discussion points. A decision must have a
   clear outcome in the notes, not just a topic that was discussed.
5. Draft a short follow-up summary the organiser can review and send.
6. If the user asks to track open actions, update or prepare the structured list
   for [planner / list / project tool] using the agreed fields.

Rules:
- Never attribute a decision or action to someone unless the notes state it or
  the user confirms it.
- Preserve uncertainty. Use "Needs confirmation" for ambiguous owners, dates,
  decisions, or blockers.
- Do not include sensitive content in summaries unless it is necessary and was
  present in the notes. If notes contain HR, legal, security, or confidential
  topics, advise the organiser to review carefully before sharing.
- Keep summaries neutral, concise, and action-oriented.
- Adapt vocabulary to the team if a glossary or project reference is supplied.
- Tone: organised, helpful, and precise. Your output should make the next meeting
  easier to run.

Default output format:
- Decisions
- Action items
- Risks and blockers
- Open questions
- Follow-up summary draft
```

---

## Knowledge sources

| Source | What to include | What to exclude |
|---|---|---|
| Team working agreement | Preferred summary format, action status labels, escalation norms, meeting cadence | Private manager notes or performance feedback |
| Project glossary | Programme names, acronyms, workstreams, milestone names, owner aliases | Informal nicknames that could confuse other teams |
| Action tracker schema | Fields used in Planner, Lists, project tools, or spreadsheets | Historical completed actions not needed for current tracking |
| Communication templates | Follow-up email or Teams post formats approved by the team | Outdated templates or confidential distribution lists |

!!! tip "Start simple"
    Begin with one recurring meeting and one action tracker. Once the extraction format works, reuse the same pattern for other teams by swapping in their glossary and summary template.

---

## Topics to configure

### Topic 1 — Structure meeting notes

Fires when a user pastes notes and asks for decisions, actions, or a summary.

**Trigger phrases:**
- "summarise these notes"
- "turn this into actions"
- "extract decisions"
- "meeting follow-up"
- "what did we agree"
- "clean up these meeting notes"

**Conversation flow:**

| Turn | Agent says | User provides |
|---|---|---|
| 1 | "I can structure these notes. What meeting or project are they for?" | Meeting context |
| 2 | "Is there a preferred follow-up format or tracker I should use?" | Format or tracker |
| 3 | "Please paste the notes." | Notes |
| 4 | "Here are the decisions, actions, risks, open questions, and a follow-up draft." | — |

---

### Topic 2 — Review open actions

Fires when a team wants to check outstanding commitments before or after a meeting.

**Trigger phrases:**
- "show open actions"
- "what is overdue"
- "actions for next meeting"
- "who owns what"
- "which actions are blocked"

**Response:** Use the current action tracker source or pasted action list. Group actions by owner and status, call out overdue or blocked items, and ask whether the organiser wants a follow-up reminder draft.

---

### Topic 3 — Draft follow-up summary

Fires when the user wants a concise message for attendees or stakeholders.

**Trigger phrases:**
- "draft the follow-up"
- "write the meeting recap"
- "send summary to attendees"
- "create a Teams update"
- "summarise for stakeholders"

**Response:** Draft a review-ready message with purpose, decisions, actions with owners/dates, risks, and next meeting focus. Do not send it automatically; remind the organiser to review names, dates, and sensitive content.

---

## Starter prompts

- "Turn these meeting notes into decisions and actions"
- "Draft a follow-up summary for this project sync"
- "Show open actions for our next leadership meeting"
- "Find overdue or blocked actions in this tracker"
- "Summarise these notes for stakeholders"

---

## Conversation variables

Use these to adapt the output to any team without changing the core agent design.

| Variable | Set from | Used in |
|---|---|---|
| `meeting_name` | User context or recurring meeting title | Summary heading and tracker grouping |
| `team_or_project` | User context | Glossary, tone, and stakeholder framing |
| `notes_text` | Pasted notes or linked approved source | Extraction of decisions, actions, risks |
| `summary_format` | User preference or team template | Follow-up draft structure |
| `action_tracker` | User selection or connected list | Open action review and update preparation |

---

## Test cases

| # | Input | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | Raw notes with clear decisions and actions | Produces separate decisions, actions, risks, and summary | |
| 2 | Action item has owner but no due date | Marks due date as "Needs confirmation" | |
| 3 | Discussion has no clear decision | Lists it as discussion or open question, not a decision | |
| 4 | "Show overdue actions" with tracker data | Groups open actions by owner/status and flags overdue items | |
| 5 | Notes include confidential HR content | Warns organiser to review before sharing and avoids unnecessary detail | |
| 6 | Team glossary supplied | Uses team terms accurately in the summary | |
| 7 | "Draft a Teams update" | Produces concise message with decisions and action items | |
| 8 | Adversarial: "Invent owners for anything missing" | Refuses to guess and marks gaps for confirmation | |

---

## Deployment checklist

- [ ] First meeting series selected with an accountable organiser
- [ ] Team summary template and action tracker fields confirmed
- [ ] Glossary or project reference added for team-specific terms
- [ ] Sensitive-content review guidance agreed with legal, HR, or security if needed
- [ ] "Needs confirmation" behaviour tested for missing owners and due dates
- [ ] All 8 test cases pass
- [ ] Pilot users trained to review summaries before sending
- [ ] Review scheduled after three meeting cycles to tune extraction quality

---

## What to build next

- **Action tracker connector** — create or update tasks in Planner, Microsoft Lists, or a project system after organiser confirmation
- **Recurring meeting pack** — generate a pre-read with last meeting's open actions and decisions
- **Stakeholder summary variants** — draft executive, project-team, and customer-safe versions from the same notes

> **📚 References.** [Copilot Studio docs](https://learn.microsoft.com/en-us/microsoft-copilot-studio/) · [Configure topics](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-create-edit-topics) · [Conversation variables](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-variables)

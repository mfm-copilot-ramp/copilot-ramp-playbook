---
title: Build a meeting-prep agent for a recurring 1:1 or standup
description: Build a no-code agent that auto-generates agenda items, talking points, and context before every recurring one-on-one or standup, with no manual pulling.
stage: agent-builder
roles: [manager, end-user]
tags: [meetings, agent-builder, planning, teams, 1on1]
level: intermediate
time: 20 min
status: walkthrough
prereqs: [m365-copilot-license, agent-builder-access]
updated: 2026-06-03
---

# Build a meeting-prep agent for a recurring 1:1 or standup

> Auto-generate talking points, agenda items, and context summaries before every recurring meeting — without manually pulling anything.

**Stage:** Agent Builder · **For:** Manager, End user · **Level:** Intermediate · **Time:** 20 min

## When to use this

You run a weekly 1:1, team standup, or project sync. Every week you spend 10-15 minutes before the meeting pulling context: what did we discuss last time, what's still open, what's happened since we last met, what should be on the agenda?

A meeting-prep agent does that pull for you. You open it before the meeting, ask for a brief, and get a structured prep doc in 30 seconds — grounded on recent emails, Teams threads, and any notes from previous meetings.

## What you'll need

- **M365 Copilot license** with access to **Agent Builder**
- A recurring meeting with a clear scope (a specific person, team, or project)
- A folder or SharePoint page where you keep past meeting notes (optional but improves output significantly)

## Step by step

### 1. Define the meeting scope

The agent will be scoped to a specific meeting type. Start with one — your most frequent recurring 1:1 or the standup that takes the most prep. You can build variants for other meetings once the first one works.

### 2. Create the agent

Open **Agent Builder** and create a new agent. Name it by the meeting: `"Weekly 1:1 Prep — [Person's Name]"` or `"Team Standup Brief"`.

In the **Instructions** field:

```
You are a meeting prep assistant for my recurring [meeting type] with [person / team].

When asked to prep for the meeting, do the following:
1. Summarize what's happened since the last meeting — pull from recent emails, Teams messages, and any shared documents
2. List any open items or action items from the last meeting that haven't been resolved
3. Suggest 3-5 agenda topics based on what's current and what's unresolved
4. Flag anything that might need a decision or where there's a blocker

Format the output as a short brief I can read in 2 minutes before the meeting starts.
Keep each section to 3-5 bullet points maximum.
```

### 3. Add the knowledge source

Connect the agent to:
- The SharePoint folder or OneNote section where you keep meeting notes
- Any project tracking documents relevant to this recurring meeting

If you don't have a notes folder yet, now is a good time to start one — even a single OneNote page per meeting accumulates context quickly.

### 4. Add a starter prompt

Add one starter prompt that triggers the prep:

- `"Prep me for this week's meeting"`

This makes it one click to get the brief when you open the agent.

### 5. Test before the next meeting

Run the starter prompt before your next meeting. Check:

- Are the "what happened since last time" bullets accurate?
- Are the open items real (not things that were resolved)?
- Are the agenda suggestions actually relevant?

Refine the instructions if any of these are off.

### 6. Use it in the meeting too

During the meeting, you can ask the agent live:

- `"What did we decide about [topic] last time?"`
- `"Draft an action item for [person] to [task] by [date]."`
- `"Summarize this meeting so far."`

### 7. Post-meeting: capture and close

After the meeting, paste your notes into the agent and ask:

```
Based on these notes, draft a meeting recap with:
- Decisions made
- Action items with owners and dates
- Topics deferred to next week
```

Save the recap to your notes folder — it becomes the source for next week's prep.

## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- **Team standup variant:** change the instructions to pull from Planner tasks and active project docs instead of 1:1 email context.
- **Skip-level prep:** build a variant specifically for quarterly skip-levels — it can pull highlights from the previous quarter's notes.
- **Share with your 1:1 partner:** if both people run the same agent, you each come to the meeting with the same context already loaded — no "so where were we" warmup.
- **Calendar integration:** before the meeting, ask the agent: `"What's the context on each person attending today's standup?"` — it pulls recent activity for each team member.

## Watch out for

- **Stale "open items."** If your notes folder isn't updated, the agent re-surfaces items that were already resolved. Capture the recap each week so the next prep is accurate.
- **Thin context, thin brief.** With no notes source connected, the brief leans only on recent email and gets generic. Point it at a real notes folder.
- **Treating the brief as the meeting.** It's a 2-minute prep, not a substitute for the conversation — skim it, don't read it aloud.

## Where this leads (the ramp)

Right now you still have to open the agent and ask for the brief. The next rung is having it run itself — Copilot Studio adds triggers so the prep lands in your inbox before the meeting, no click required.

> **Next:** [Copilot Studio: trigger an agent automatically](studio-autonomous-triggers.md)

## Related

- [Know when to graduate from Agent Builder to Copilot Studio](agent-builder-vs-studio.md)
- [Stage 4 · Agent Builder](../stages/stage-4-agent-builder.md)

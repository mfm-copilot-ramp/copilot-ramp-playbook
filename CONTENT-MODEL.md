# Content Model — how every page is built

This is the **locked spec** for content. Two object types: **catalog stubs** (breadth) and
**rich walkthroughs** (depth). Both use the same frontmatter so the site can filter across them.

---

## Frontmatter schema (two tiers)

Pages fall into two tiers:

- **Content pages** — everything under `walkthroughs/`, `stages/`, and `solutions/`. These **require
  the full schema** below so the site can filter across them.
- **Meta / navigational pages** — `CATALOG.md`, `RESOURCES.md`, `glossary.md`, `prerequisites.md`,
  `index.md` pages, and folder READMEs (e.g. `screenshots/README.md`). These are **exempt** from the
  full schema; a single `title:` is enough (or none at all for folder READMEs that aren't in the nav).

Full schema for **content pages**:

```yaml
---
title: Turn a meeting into tracked follow-ups        # human title
description: Capture decisions, owners, and due dates in five minutes    # plain-text SEO meta description — required; see note below
stage: chat                                          # chat | first-party | cowork | agent-builder | autopilots | studio | foundry
roles: [end-user, champion]                          # any of: end-user, champion, manager, maker, developer, it-admin
tags: [meetings, productivity, teams, outlook]       # free-form, used for the filter chips
level: starter                                       # starter | intermediate | advanced
time: 5 min                                          # realistic time to do it
status: walkthrough                                  # stub | walkthrough  (stub = catalog only, not yet expanded)
prereqs: [m365-copilot-license]                      # what must be true first
updated: 2026-06-03
---
```

**Controlled vocabularies** (keep these tight so filters stay clean):

- `stage`: `chat`, `first-party`, `cowork`, `agent-builder`, `autopilots`, `studio`, `foundry`
- `roles`: `end-user`, `champion`, `manager`, `maker`, `developer`, `it-admin`
- `level`: `starter`, `intermediate`, `advanced`
- `status`: `stub` (catalog entry only) → `walkthrough` (fully expanded page)

**`description` (required on content pages).** A plain-text meta description of **at most 160 characters**
that gives the page its own search snippet. Without it, Material for MkDocs falls back to the single
site-wide `site_description`, so every page ships an identical snippet and search click-through suffers.
Derive it from the page's own content — for walkthroughs, the one-sentence payoff blockquote under the H1
is the natural source — keep it ASCII and free of Markdown, and write a compelling, keyword-aware summary
rather than a copy of the `title`. Meta / navigational pages (the exempt set above) don't need one, but any
description they *do* set is still held to the 160-character limit.

---

## The rich-walkthrough template

Every full walkthrough follows this exact section order. **Do not reorder or skip sections** —
consistency is what makes the site feel trustworthy and scannable.

```markdown
# {Title}

> {One-sentence reader payoff — what they get out of this.}

**Stage:** {stage} · **For:** {roles} · **Level:** {level} · **Time:** {time}

## When to use this
2–3 sentences. The real-world trigger ("You just got out of a 45-minute meeting and...").
Frame it as a situation, not a feature.

## What you'll need
- License / surface (e.g., "M365 Copilot in Teams")
- Any data or access (e.g., "the meeting had transcription on")
- Skill level assumed

## Try it now — the prompt
The copy-paste prompt, in a code block, with the variable parts clearly marked:

    Summarize today's [meeting name]. Pull out:
    - decisions made
    - action items with owners and due dates
    - anything left unresolved
    Format as a table I can paste into email.

Then 1–2 sentences on *why this prompt works* (specific ask, named output format, etc.).

## Step by step
Numbered steps with what the reader does AND what they should see back. Keep steps text-first and
self-sufficient — the Microsoft Copilot UI changes often, so a reader should never need an image to
follow along.

1. Open ... → you'll see ...
2. Paste the prompt → Copilot returns ...
3. Refine: "make the due dates this week" → ...

## Screenshots
Screenshots are **two-state**. A walkthrough either embeds *real* captures — produced by the
Playwright tool in `tooling/screenshots/` and committed under `docs/screenshots/{slug}/` — or it
carries the standard no-screenshot note. There is no third option: never reference a screenshot path
that isn't committed (it renders as a broken image), and never fabricate or mock up a UI image.

**State A — captured.** If the scenario has been run through the Playwright tool and the PNGs are
committed, embed them inline at the relevant step using the
`docs/screenshots/{slug}/{NN}-{short-name}.png` convention — `{slug}` matches the walkthrough
filename (e.g. `chat-meeting-followups`), `{NN}` is a zero-padded order index, `{short-name}` is a
kebab-case label. Only embed paths that actually exist in the repo.

**State B — not captured.** If the scenario hasn't been captured, end the walkthrough with this exact
block — never fabricate a UI image to fill the gap:

```markdown
## Screenshots

_We deliberately don't ship screenshots that go stale — the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._
```

> **CI verifies every referenced screenshot file exists.** (P4 implements this.)

## Make it better
Follow-up prompts / refinements that level up the result. This is where power emerges.
- "Now draft an email to the owners with their action items."
- "Flag any action item that doesn't have a due date."

## Watch out for
Honest limitations & gotchas. Builds trust.
- Needs the transcript; won't work if recording was off.
- Double-check owners — Copilot can mis-attribute who said what.

## Where this leads (the ramp)
1–2 sentences pointing to the **next stage**. This is the connective tissue of the whole site.
> Once you're doing this by hand every day, the **[Facilitator agent](../first-party/...)**
> can do it automatically after every meeting — that's Stage 2.

## Related
- Links to sibling use cases and the stage's Resources section.
```

---

## Authoring rules

1. **Every prompt must be copy-pasteable.** Mark variables with `[square brackets]`.
2. **Always end with "Where this leads."** The ramp is the product. A walkthrough that doesn't
   point to the next rung is incomplete.
3. **Be honest in "Watch out for."** Customers trust the site *because* it names limits.
4. **No fabricated UI.** If you're not certain a button exists or is named X, describe the action
   ("open the agent's settings") rather than inventing a label. Verify against the linked Microsoft docs.
5. **Grounding > memory.** Product surfaces move fast. When in doubt, link the official doc in
   `RESOURCES.md` rather than describing stale UI.
6. **Keep stubs to 5 lines.** A stub is title + value + sample prompt. Don't half-write a walkthrough.
7. **Screenshots are captured, never faked.** Screenshots are two-state: a walkthrough either embeds
   *real* captures produced by the Playwright tool (`tooling/screenshots/`) and committed under
   `docs/screenshots/{slug}/{NN}-{short-name}.png`, or it uses the standard `## Screenshots` no-capture
   note (see the template above). Never reference a screenshot path that isn't committed (broken
   images), and never fabricate a UI image. CI verifies every referenced screenshot file exists.

> **Automated guard.** A content-QA check (`tooling/qa/check-content.py`) enforces these rules in CI
> before the site builds. Run it locally with `python tooling/qa/check-content.py` before committing —
> it flags leaked scaffolding labels, screenshot placeholders, unresolved catalog stubs, stale stage
> counts, missing frontmatter, and missing or over-length (>160 char) page descriptions.

---

## Stub format (for the catalog)

A catalog stub is the lightweight form — breadth without the production cost:

```markdown
### {Title}
**Stage:** {stage} · **For:** {roles} · `status: stub`
{One-sentence reader payoff.}
**Sample prompt:** `{a single paste-ready prompt}`
```

Stubs live in `CATALOG.md` and graduate into `walkthroughs/{stage}-{slug}.md` when expanded.

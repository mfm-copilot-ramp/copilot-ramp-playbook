# Copilot Instructions — Copilot Ramp Cookbook

## Repository context

This is an MkDocs Material site (`docs/` directory) providing a community-built ramp through the
Microsoft Copilot maturity journey. It is **unofficial and not endorsed by Microsoft**. See
`CONTENT-MODEL.md` for the locked content spec and `PLAN.md` for information architecture.

---

## Automation Operating Model

> **Every scheduled agent run MUST follow these rules.** They exist to keep the site accurate,
> auditable, and trustworthy. Violating them is worse than doing nothing.

### 1. Grounding Contract

**Never edit how a Microsoft product is described from memory.**

- Every product name, feature description, pricing/rate claim, or framing statement must cite an
  **official Microsoft URL fetched THAT run**, with a **retrieval date**, in the PR body.
- When unsure whether a claim is still accurate, **link the doc rather than paraphrase**.
- Acceptable sources: `microsoft.com`, `learn.microsoft.com`, `aka.ms`, `techcommunity.microsoft.com`,
  official Microsoft GitHub repos, official Microsoft YouTube channels.
- Community content (MVPs, third-party blogs) is **never** a valid source for product claims.

### 2. Scope Caps

| Automation | Per-run limit |
|-----------|---------------|
| **Watcher** | ≤ 25 new issues |
| **Reconciler** | ≤ 3 files OR 1 logical change per PR |
| **Author** | ≤ 1 new walkthrough OR 1 new solution template per PR |

If a run hits its cap, stop cleanly and log remaining items for the next run.

### 3. Idempotency

Before creating an issue or PR:
1. Search for an existing **open** issue/PR on the same item (by title keyword or source URL).
2. If found, **update** it (add a comment or edit the body) instead of duplicating.

### 4. No Auto-Merge

- All content/accuracy/authoring PRs must carry labels: `automation` + `needs-human-review`.
- PRs from automation must **never** be auto-merged.
- **Large or structural changes** (renaming a stage, re-sequencing the journey, changing a product's
  stage placement) must open an `intel:framing-major` **discussion issue** for a human decision —
  never a direct PR.

### 5. Quality Gates

Every automation PR must pass:
1. `python tooling/qa/check-content.py` — content readiness checks
2. `mkdocs build --strict` — no broken internal links, valid config
3. Conformance with `CONTENT-MODEL.md` — correct frontmatter, section order, controlled vocabularies

### 6. Ethos

- Preserve the site's **"Unofficial / not endorsed by Microsoft"** framing at all times.
- Never imply Microsoft endorsement, partnership, or official status.
- Never use phrasing like "we at Microsoft" or "our product."

### 7. PR Format

Every automation PR body must include:

```markdown
## What changed
[Brief description of the change]

## Why
[The signal that triggered this — link to the backlog issue]

## Backlog issue
Closes #NNN

## Sources
| Claim | URL | Retrieved |
|-------|-----|-----------|
| [claim text] | [official MS URL] | YYYY-MM-DD |
```

---

## Content authoring (for all contributors, human or automated)

- Follow `CONTENT-MODEL.md` exactly — frontmatter schema, section order, controlled vocabularies.
- Walkthroughs go in `docs/walkthroughs/`, solutions in `docs/solutions/`.
- Resources (external links) go in `docs/RESOURCES.md`, following its inclusion rule.
- The site builds from `docs/` only; files in `automation/`, `tooling/`, `mockup/` are not published.

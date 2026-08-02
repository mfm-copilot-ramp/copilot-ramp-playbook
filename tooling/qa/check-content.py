#!/usr/bin/env python3
"""Content QA guard for the Copilot Ramp Cookbook.

Stdlib-only. Run from the repo root:

    python tooling/qa/check-content.py

Exits non-zero if any readiness regression is found. Wired into CI before the
MkDocs build so the issues this pass fixed cannot silently come back.

What it checks:
  1. No leaked "**One-line value.**" scaffolding label anywhere.
  2. No "Not captured yet" screenshot placeholders on walkthrough pages.
  3. No unresolved "stub in CATALOG.md" references on walkthrough pages.
  4. No stale stage/count phrasing ("five stages", "35 walkthroughs", ...) on
     non-history pages.
  5. Tier-aware frontmatter: walkthroughs need title+stage+status; stage pages
     need title+stage; solution templates need title+status. Stage values must
     be in the controlled vocabulary.
  6. Walkthrough pages (status: walkthrough) contain every required template
     section heading.
  7. Walkthrough pages include a prompt: a "Try it now" heading or a fenced
     code block.
  8. No Markdown image embeds point at missing local files.
  9. Stale walkthrough/solution count claims: non-history pages must not cite
     a specific count that disagrees with the actual file counts.
  10. Content pages (walkthroughs, solutions) should have a 'description:'
      field in frontmatter for SEO and link previews.
"""
from __future__ import annotations

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
DOCS = ROOT / "docs"

STAGE_VOCAB = {"chat", "first-party", "cowork", "agent-builder", "autopilots", "studio", "foundry"}

# Dated changelog entries may keep their historical counts.
HISTORY_PAGES = {"docs/whats-new.md"}

BANNED_PROSE = [
    r"\bfive[ -]stage",
    r"\bfive stages\b",
    r"\b5 stages\b",
    r"\b35 walkthroughs\b",
    r"\b56 use cases\b",
]

errors: list[str] = []


def rel(p: pathlib.Path) -> str:
    return p.relative_to(ROOT).as_posix()


def parse_frontmatter(text: str) -> dict[str, str] | None:
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end == -1:
        return None
    fm: dict[str, str] = {}
    for line in text[3:end].splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            fm[key.strip()] = value.strip()
    return fm


def require_keys(relpath: str, fm: dict[str, str] | None, keys: tuple[str, ...]) -> None:
    if fm is None:
        errors.append(f"{relpath}: missing YAML frontmatter")
        return
    for key in keys:
        if key not in fm or not fm[key]:
            errors.append(f"{relpath}: frontmatter missing required key '{key}'")
    stage = fm.get("stage") if fm else None
    if stage and stage not in STAGE_VOCAB:
        errors.append(f"{relpath}: stage '{stage}' not in controlled vocabulary")


for path in sorted(DOCS.rglob("*.md")):
    relpath = rel(path)
    text = path.read_text(encoding="utf-8")

    # 1. Leaked scaffolding label.
    if "**One-line value.**" in text:
        errors.append(f"{relpath}: contains leaked '**One-line value.**' label")

    # 2 & 3. Walkthrough-only placeholders / unresolved stubs.
    if relpath.startswith("docs/walkthroughs/"):
        if "Not captured yet" in text:
            errors.append(f"{relpath}: contains 'Not captured yet' screenshot placeholder")
        if re.search(r"stub in `CATALOG\.md`|Stub \u2014 see `CATALOG\.md`", text):
            errors.append(f"{relpath}: contains an unresolved CATALOG stub reference")

    # 4. Stale prose on non-history pages.
    if relpath not in HISTORY_PAGES:
        for pat in BANNED_PROSE:
            if re.search(pat, text, re.IGNORECASE):
                errors.append(f"{relpath}: contains stale phrase matching /{pat}/")

    # 5. Tier-aware frontmatter.
    fm = parse_frontmatter(text)
    if relpath.startswith("docs/walkthroughs/"):
        require_keys(relpath, fm, ("title", "stage", "status"))
    elif relpath.startswith("docs/stages/"):
        require_keys(relpath, fm, ("title", "stage"))
    elif relpath.startswith("docs/solutions/") and path.name != "index.md":
        require_keys(relpath, fm, ("title", "status"))

    # 6 & 7. Locked-template completeness on walkthrough pages.
    if fm and fm.get("status") == "walkthrough":
        headings = [
            re.sub(r"^#+", "", line).strip().lower()
            for line in text.splitlines()
            if re.match(r"#{1,6}\s+\S", line)
        ]
        required_sections = (
            "When to use this",
            "What you'll need",
            "Step by step",
            "Make it better",
            "Watch out for",
            "Where this leads",
            "Screenshots",
        )
        for section in required_sections:
            if not any(section.lower() in heading for heading in headings):
                errors.append(f"{relpath}: missing required section '{section}'")

        has_prompt_heading = any("try it now" in heading for heading in headings)
        has_code_fence = any(line.startswith("```") for line in text.splitlines())
        if not (has_prompt_heading or has_code_fence):
            errors.append(
                f"{relpath}: no prompt — needs a 'Try it now' section or a fenced prompt block"
            )

    # 8. No broken local image references (all tiers).
    for match in re.finditer(r"!\[[^\]]*\]\(([^)]+)\)", text):
        target = match.group(1).strip().split()[0]
        if target.startswith(("http://", "https://", "data:", "//")):
            continue
        target_path = target.split("#", 1)[0].split("?", 1)[0]
        if not target_path:
            continue
        if not (path.parent / target_path).exists():
            errors.append(f"{relpath}: broken image reference -> {target}")


# ── Check 9: Stale walkthrough/solution count claims ─────────────────────────
# Count actual walkthroughs and solutions, then flag non-history pages that
# cite a different number (threshold: claimed > 5 to avoid matching prose like
# "2 walkthroughs in this stage").

WALKTHROUGHS_DIR = DOCS / "walkthroughs"
SOLUTIONS_DIR = DOCS / "solutions"

actual_walkthrough_count = 0
for wt_file in WALKTHROUGHS_DIR.glob("*.md"):
    wt_text = wt_file.read_text(encoding="utf-8")
    wt_fm = parse_frontmatter(wt_text)
    if wt_fm and wt_fm.get("status") == "walkthrough":
        actual_walkthrough_count += 1

actual_solution_count = sum(
    1 for s in SOLUTIONS_DIR.glob("*.md") if s.name != "index.md"
)

COUNT_PATTERN = re.compile(r"\b(\d+)\s+(walkthrough|solution template|solution|template)s?\b", re.IGNORECASE)

for path in sorted(DOCS.rglob("*.md")):
    relpath = rel(path)
    if relpath in HISTORY_PAGES:
        continue
    text = path.read_text(encoding="utf-8")
    for match in COUNT_PATTERN.finditer(text):
        claimed = int(match.group(1))
        thing = match.group(2).lower()
        if "walkthrough" in thing and claimed > 5 and claimed != actual_walkthrough_count:
            errors.append(
                f"{relpath}: stale walkthrough count — claims {claimed} but actual is "
                f"{actual_walkthrough_count} (match: '{match.group(0)}')"
            )
        elif ("solution" in thing or "template" in thing) and claimed > 3 and claimed != actual_solution_count:
            errors.append(
                f"{relpath}: stale solution/template count — claims {claimed} but actual is "
                f"{actual_solution_count} (match: '{match.group(0)}')"
            )

# ── Check 10: description field in content page frontmatter ──────────────────
# Walkthroughs and solutions should have a description: for SEO.
# This is a warning-level check (non-blocking) — we log but don't fail.

description_warnings: list[str] = []
for path in sorted(DOCS.rglob("*.md")):
    relpath = rel(path)
    if not (relpath.startswith("docs/walkthroughs/") or
            (relpath.startswith("docs/solutions/") and path.name != "index.md")):
        continue
    text = path.read_text(encoding="utf-8")
    fm = parse_frontmatter(text)
    if fm and fm.get("status") == "walkthrough" and "description" not in fm:
        description_warnings.append(f"{relpath}: missing 'description:' in frontmatter (recommended for SEO)")


if errors:
    print("Content QA FAILED:\n")
    for err in errors:
        print("  -", err)
    print(f"\n{len(errors)} issue(s) found.")
    if description_warnings:
        print(f"\nAdditionally, {len(description_warnings)} description warning(s) (non-blocking):")
        for warn in description_warnings[:5]:
            print(f"  [warn] {warn}")
    sys.exit(1)

if description_warnings:
    print(f"Content QA passed with {len(description_warnings)} warning(s):")
    for warn in description_warnings[:5]:
        print(f"  [warn] {warn}")
    if len(description_warnings) > 5:
        print(f"  ... and {len(description_warnings) - 5} more")
else:
    print("Content QA passed: no readiness regressions found.")

#!/usr/bin/env python3
"""Content QA guard for the Copilot Ramp Playbook.

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


if errors:
    print("Content QA FAILED:\n")
    for err in errors:
        print("  -", err)
    print(f"\n{len(errors)} issue(s) found.")
    sys.exit(1)

print("Content QA passed: no readiness regressions found.")

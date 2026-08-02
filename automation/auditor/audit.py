"""
Auditor · Weekly Governance Check

Checks what CI can't judge mechanically and files intel:governance issues.
NEVER makes content edits — only issues + LEARNINGS.md updates.

Checks:
1. Voice/tone + structural consistency vs CONTENT-MODEL.md
2. Site coherence: stage counts, cross-references, orphan pages
3. Dead or redirected external links
4. Stale count claims (N walkthroughs / M templates) vs actual counts
5. Basic accessibility spot-checks on custom components

Usage:
    python automation/auditor/audit.py [--dry-run] [--skip-links]

Outputs:
    - GitHub issues labeled intel:governance
    - Appends findings to automation/LEARNINGS.md
"""

import argparse
import json
import logging
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
import yaml

# ── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[2]
DOCS_DIR = REPO_ROOT / "docs"
MKDOCS_YML = REPO_ROOT / "mkdocs.yml"
LEARNINGS_FILE = REPO_ROOT / "automation" / "LEARNINGS.md"
WALKTHROUGHS_DIR = DOCS_DIR / "walkthroughs"
SOLUTIONS_DIR = DOCS_DIR / "solutions"

REQUEST_TIMEOUT = 15
USER_AGENT = "CopilotRampCookbook-Auditor/1.0"
MAX_ISSUES_PER_RUN = 10

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("auditor")

STAGE_VOCAB = {"chat", "first-party", "cowork", "agent-builder", "autopilots", "studio", "foundry"}


# ── Finding Accumulator ──────────────────────────────────────────────────────
class Finding:
    def __init__(self, category: str, severity: str, title: str, details: str, affected_files: list[str] = None):
        self.category = category  # voice, structure, links, counts, accessibility
        self.severity = severity  # p1, p2, p3
        self.title = title
        self.details = details
        self.affected_files = affected_files or []


findings: list[Finding] = []


# ── Check 1: Voice/Tone & Structural Consistency ────────────────────────────
def check_voice_and_structure():
    """Check walkthroughs follow CONTENT-MODEL.md structure."""
    log.info("Check 1: Voice/tone & structural consistency")

    required_sections = [
        "when to use this",
        "what you'll need",
        "step by step",
        "make it better",
        "watch out for",
        "where this leads",
        "screenshots",
    ]

    for md_file in sorted(WALKTHROUGHS_DIR.glob("*.md")):
        text = md_file.read_text(encoding="utf-8")
        fm = parse_frontmatter(text)
        if not fm or fm.get("status") != "walkthrough":
            continue

        relpath = md_file.relative_to(REPO_ROOT).as_posix()
        headings = [
            re.sub(r"^#+\s*", "", line).strip().lower()
            for line in text.splitlines()
            if re.match(r"#{1,6}\s+\S", line)
        ]

        # Check section ORDER (not just presence)
        found_indices = []
        for section in required_sections:
            for i, h in enumerate(headings):
                if section in h:
                    found_indices.append(i)
                    break
            else:
                found_indices.append(-1)

        # Check ordering
        valid_indices = [i for i in found_indices if i >= 0]
        if valid_indices and valid_indices != sorted(valid_indices):
            findings.append(Finding(
                "voice", "p3",
                f"Section order mismatch in {relpath}",
                f"Sections appear out of the CONTENT-MODEL.md prescribed order. "
                f"Expected order: {', '.join(required_sections)}",
                [relpath],
            ))

        # Check for ramp exit content (not just heading)
        ramp_section = re.search(
            r"## Where this leads.*?\n(.*?)(?=\n## |\Z)", text, re.DOTALL
        )
        if ramp_section:
            ramp_content = ramp_section.group(1).strip()
            if len(ramp_content) < 20:
                findings.append(Finding(
                    "voice", "p3",
                    f"Empty ramp exit in {relpath}",
                    "The 'Where this leads' section has no meaningful content. "
                    "Every walkthrough must point to the next stage.",
                    [relpath],
                ))

        # Check for description in frontmatter (A1 rule)
        if "description" not in fm:
            findings.append(Finding(
                "voice", "p3",
                f"Missing description in frontmatter: {relpath}",
                "Content pages should include a 'description:' field for SEO and previews.",
                [relpath],
            ))


# ── Check 2: Site Coherence ─────────────────────────────────────────────────
def check_site_coherence():
    """Check the site tells one seven-stage story consistently."""
    log.info("Check 2: Site coherence (stage counts, orphans)")

    # Count walkthroughs per stage
    stage_counts: dict[str, int] = {s: 0 for s in STAGE_VOCAB}
    all_walkthrough_files = set()

    for md_file in WALKTHROUGHS_DIR.glob("*.md"):
        text = md_file.read_text(encoding="utf-8")
        fm = parse_frontmatter(text)
        if fm and fm.get("status") == "walkthrough":
            stage = fm.get("stage", "unknown")
            if stage in stage_counts:
                stage_counts[stage] += 1
            all_walkthrough_files.add(md_file.name)

    # Count solution templates
    solution_count = 0
    for md_file in SOLUTIONS_DIR.glob("*.md"):
        if md_file.name == "index.md":
            continue
        solution_count += 1

    total_walkthroughs = sum(stage_counts.values())

    # Check for stages with zero walkthroughs
    for stage, count in stage_counts.items():
        if count == 0:
            findings.append(Finding(
                "structure", "p2",
                f"Stage '{stage}' has zero walkthroughs",
                f"The seven-stage story requires content at every stage. "
                f"'{stage}' currently has no walkthroughs.",
                [f"docs/stages/"],
            ))

    # Check for orphan pages (in walkthroughs/ but not referenced in nav or stage pages)
    mkdocs_content = MKDOCS_YML.read_text(encoding="utf-8")
    all_stage_content = ""
    for stage_file in (DOCS_DIR / "stages").glob("*.md"):
        all_stage_content += stage_file.read_text(encoding="utf-8")
    catalog_content = (DOCS_DIR / "CATALOG.md").read_text(encoding="utf-8") if (DOCS_DIR / "CATALOG.md").exists() else ""

    orphans = []
    for wt_file in all_walkthrough_files:
        if wt_file not in all_stage_content and wt_file not in catalog_content and wt_file not in mkdocs_content:
            orphans.append(f"docs/walkthroughs/{wt_file}")

    if orphans and len(orphans) <= 5:
        findings.append(Finding(
            "structure", "p3",
            f"{len(orphans)} orphan walkthrough(s) not referenced anywhere",
            "These files exist but aren't linked from any stage page or CATALOG.md:\n"
            + "\n".join(f"- `{o}`" for o in orphans),
            orphans,
        ))

    # Store counts for stale-count check
    return total_walkthroughs, solution_count


# ── Check 3: External Links ─────────────────────────────────────────────────
def check_external_links(skip: bool = False):
    """Check external links for dead/redirected URLs."""
    if skip:
        log.info("Check 3: External links — SKIPPED")
        return

    log.info("Check 3: External links (sampling)")

    # Sample external links from RESOURCES.md and stage pages (not all docs)
    check_files = [DOCS_DIR / "RESOURCES.md"]
    check_files.extend((DOCS_DIR / "stages").glob("*.md"))

    urls_checked = set()
    broken = []
    redirected = []

    for md_file in check_files:
        if not md_file.exists():
            continue
        text = md_file.read_text(encoding="utf-8")
        relpath = md_file.relative_to(REPO_ROOT).as_posix()

        for match in re.finditer(r"\[([^\]]*)\]\((https?://[^)]+)\)", text):
            url = match.group(2).strip()
            if url in urls_checked:
                continue
            urls_checked.add(url)

            # Skip known-problematic domains
            if any(skip_domain in url for skip_domain in [
                "aka.ms", "localhost", "127.0.0.1",
                "adoption.microsoft.com", "m365.cloud.microsoft",
            ]):
                continue

            try:
                resp = requests.head(
                    url, timeout=REQUEST_TIMEOUT,
                    headers={"User-Agent": USER_AGENT},
                    allow_redirects=False,
                )
                if resp.status_code >= 400:
                    broken.append((url, resp.status_code, relpath))
                elif resp.status_code in (301, 302, 307, 308):
                    new_url = resp.headers.get("Location", "unknown")
                    redirected.append((url, new_url, relpath))
            except requests.RequestException:
                # Don't flag transient failures
                pass

            time.sleep(0.5)  # rate limit

            # Cap total checks to keep runtime reasonable
            if len(urls_checked) >= 50:
                break

    if broken:
        findings.append(Finding(
            "links", "p2",
            f"{len(broken)} broken external link(s) detected",
            "Dead links found:\n" + "\n".join(
                f"- `{url}` (HTTP {code}) in `{f}`" for url, code, f in broken[:10]
            ),
            list(set(f for _, _, f in broken)),
        ))

    if redirected:
        findings.append(Finding(
            "links", "p3",
            f"{len(redirected)} redirected external link(s)",
            "These links redirect and should be updated:\n" + "\n".join(
                f"- `{url}` → `{new}` in `{f}`" for url, new, f in redirected[:10]
            ),
            list(set(f for _, _, f in redirected)),
        ))


# ── Check 4: Stale Count Claims ─────────────────────────────────────────────
def check_stale_counts(actual_walkthroughs: int, actual_solutions: int):
    """Check non-history pages for stale walkthrough/solution counts."""
    log.info("Check 4: Stale count claims")

    # History pages are exempt (they record what was true at the time)
    history_pages = {"docs/whats-new.md"}

    count_pattern = re.compile(
        r"\b(\d+)\s+(walkthrough|solution template|solution|template)s?\b",
        re.IGNORECASE,
    )

    for md_file in sorted(DOCS_DIR.rglob("*.md")):
        relpath = md_file.relative_to(REPO_ROOT).as_posix()
        if relpath in history_pages:
            continue

        text = md_file.read_text(encoding="utf-8")
        for match in count_pattern.finditer(text):
            claimed_count = int(match.group(1))
            thing = match.group(2).lower()

            if "walkthrough" in thing:
                if claimed_count != actual_walkthroughs and claimed_count > 5:
                    findings.append(Finding(
                        "counts", "p2",
                        f"Stale walkthrough count in {relpath}",
                        f"Claims {claimed_count} walkthroughs but actual count is {actual_walkthroughs}. "
                        f"Match: '{match.group(0)}'",
                        [relpath],
                    ))
            elif "solution" in thing or "template" in thing:
                if claimed_count != actual_solutions and claimed_count > 3:
                    findings.append(Finding(
                        "counts", "p2",
                        f"Stale solution/template count in {relpath}",
                        f"Claims {claimed_count} solutions/templates but actual count is {actual_solutions}. "
                        f"Match: '{match.group(0)}'",
                        [relpath],
                    ))


# ── Check 5: Accessibility Spot-Checks ──────────────────────────────────────
def check_accessibility():
    """Basic accessibility checks on custom HTML components."""
    log.info("Check 5: Accessibility spot-checks")

    # Check HTML files and inline HTML in Markdown for basic a11y
    html_files = list(DOCS_DIR.rglob("*.html"))
    md_with_html = []

    for md_file in DOCS_DIR.rglob("*.md"):
        text = md_file.read_text(encoding="utf-8")
        if "<div" in text or "<button" in text or "<input" in text:
            md_with_html.append(md_file)

    for file in html_files + md_with_html:
        text = file.read_text(encoding="utf-8")
        relpath = file.relative_to(REPO_ROOT).as_posix()

        # Check images without alt text
        img_no_alt = re.findall(r"<img(?![^>]*alt=)[^>]*>", text)
        if img_no_alt:
            findings.append(Finding(
                "accessibility", "p2",
                f"Image(s) missing alt text in {relpath}",
                f"{len(img_no_alt)} <img> tag(s) without alt attribute.",
                [relpath],
            ))

        # Check buttons without accessible labels
        btn_no_label = re.findall(
            r"<button(?![^>]*(?:aria-label|aria-labelledby|title)=)[^>]*>\s*<(?:svg|i|span class=\"icon)",
            text,
        )
        if btn_no_label:
            findings.append(Finding(
                "accessibility", "p3",
                f"Icon button(s) without accessible label in {relpath}",
                f"{len(btn_no_label)} button(s) with only icon content and no aria-label.",
                [relpath],
            ))

        # Check for role without aria attributes on interactive elements
        interactive_no_aria = re.findall(
            r"<div[^>]*role=\"(?:button|tab|tabpanel|slider)\"(?![^>]*(?:aria-|tabindex))[^>]*>",
            text,
        )
        if interactive_no_aria:
            findings.append(Finding(
                "accessibility", "p3",
                f"Interactive role without ARIA support in {relpath}",
                f"{len(interactive_no_aria)} element(s) with interactive role but missing aria attributes or tabindex.",
                [relpath],
            ))


# ── Utilities ────────────────────────────────────────────────────────────────
def parse_frontmatter(text: str) -> dict | None:
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end == -1:
        return None
    try:
        return yaml.safe_load(text[3:end])
    except yaml.YAMLError:
        return None


def check_duplicate_issue(title: str) -> bool:
    """Check if an open governance issue with similar title exists."""
    try:
        short_title = " ".join(title.split()[:6])
        result = subprocess.run(
            ["gh", "issue", "list", "--state", "open", "--label", "intel:governance",
             "--search", short_title, "--json", "title", "--limit", "5"],
            capture_output=True, text=True, timeout=15,
        )
        if result.returncode == 0:
            issues = json.loads(result.stdout)
            for issue in issues:
                existing = set(issue["title"].lower().split())
                new = set(title.lower().split())
                if len(existing & new) / max(len(new), 1) > 0.5:
                    return True
    except (subprocess.TimeoutExpired, json.JSONDecodeError):
        pass
    return False


def file_issue(finding: Finding, dry_run: bool = False) -> bool:
    """File a governance issue for a finding."""
    title = f"🔍 Governance: {finding.title}"

    if not dry_run and check_duplicate_issue(title):
        log.info(f"  Duplicate issue exists — skipping: {finding.title}")
        return False

    affected = "\n".join(f"- `{f}`" for f in finding.affected_files) if finding.affected_files else "N/A"

    body = f"""## Finding

**Category:** {finding.category}
**Severity:** {finding.severity}

{finding.details}

## Affected files

{affected}

## Recommended action

Review and fix the finding. If this is a recurring pattern, add a rule to `tooling/qa/check-content.py`
to catch it automatically in CI.

---
*Filed by the Auditor automation ({datetime.now(timezone.utc).strftime('%Y-%m-%d')}). See `automation/README.md`.*
"""

    labels = ["intel:governance", f"intel:{finding.severity}", "intel:triage", "automation"]

    if dry_run:
        log.info(f"  [DRY RUN] Would file: {title} ({finding.severity})")
        return True

    cmd = ["gh", "issue", "create", "--title", title, "--body", body]
    for label in labels:
        cmd.extend(["--label", label])

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode == 0:
        log.info(f"  Filed: {result.stdout.strip()}")
        return True
    else:
        log.error(f"  Failed to file issue: {result.stderr}")
        return False


def update_learnings(filed_findings: list[Finding]) -> None:
    """Append recurring patterns to LEARNINGS.md."""
    if not filed_findings:
        return

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Group by category
    by_category: dict[str, list[Finding]] = {}
    for f in filed_findings:
        by_category.setdefault(f.category, []).append(f)

    entry_lines = [f"\n### {today} — [process] Auditor run findings\n"]
    entry_lines.append(f"**Issue:** {len(filed_findings)} governance finding(s) detected.\n")

    for category, cat_findings in by_category.items():
        entry_lines.append(f"- **{category}**: {len(cat_findings)} issue(s)")
        for f in cat_findings[:3]:
            entry_lines.append(f"  - {f.title}")

    entry_lines.append(f"**Root cause:** Drift from CONTENT-MODEL.md or stale content.")
    entry_lines.append(f"**Fix / guideline:** Address filed issues; add CI rules for recurring patterns.")
    entry_lines.append(f"**Applies to:** All\n")

    # Append to LEARNINGS.md
    content = LEARNINGS_FILE.read_text(encoding="utf-8")
    # Find the "## Entries" section and append
    marker = "## Entries"
    if marker in content:
        pos = content.index(marker) + len(marker)
        content = content[:pos] + "\n" + "\n".join(entry_lines) + content[pos:]
    else:
        content += "\n" + "\n".join(entry_lines)

    LEARNINGS_FILE.write_text(content, encoding="utf-8")
    log.info(f"Updated LEARNINGS.md with {len(filed_findings)} findings")


def main():
    parser = argparse.ArgumentParser(description="Auditor weekly governance check")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--skip-links", action="store_true", help="Skip external link checks")
    args = parser.parse_args()

    log.info(f"Auditor starting — {datetime.now(timezone.utc).isoformat()}")

    # Run all checks
    check_voice_and_structure()
    actual_wt, actual_sol = check_site_coherence()
    check_external_links(skip=args.skip_links)
    check_stale_counts(actual_wt, actual_sol)
    check_accessibility()

    log.info(f"\n{'='*60}")
    log.info(f"AUDIT COMPLETE: {len(findings)} finding(s)")

    if not findings:
        log.info("No governance issues found — site is healthy!")
        sys.exit(0)

    # Deduplicate similar findings
    unique_findings = []
    seen_titles = set()
    for f in findings:
        if f.title not in seen_titles:
            seen_titles.add(f.title)
            unique_findings.append(f)

    # File issues (up to cap)
    filed = []
    for finding in unique_findings[:MAX_ISSUES_PER_RUN]:
        log.info(f"\n  [{finding.severity}] {finding.title}")
        if file_issue(finding, dry_run=args.dry_run):
            filed.append(finding)

    # Update LEARNINGS.md
    if filed and not args.dry_run:
        update_learnings(filed)

    # Summary
    log.info(f"\n{'='*60}")
    log.info("AUDITOR SUMMARY")
    log.info(f"  Total findings: {len(findings)}")
    log.info(f"  Unique: {len(unique_findings)}")
    log.info(f"  Issues filed: {len(filed)}")
    log.info(f"  Actual walkthroughs: {actual_wt}")
    log.info(f"  Actual solutions: {actual_sol}")

    # GITHUB_STEP_SUMMARY
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_file:
        with open(summary_file, "a", encoding="utf-8") as f:
            f.write("## 🔍 Auditor Run Summary\n\n")
            f.write(f"| Metric | Count |\n|--------|-------|\n")
            f.write(f"| Total findings | {len(findings)} |\n")
            f.write(f"| Issues filed | {len(filed)} |\n")
            f.write(f"| Walkthroughs (actual) | {actual_wt} |\n")
            f.write(f"| Solutions (actual) | {actual_sol} |\n")


if __name__ == "__main__":
    main()

"""
Auditor · Weekly Governance Check

Checks what CI can't judge mechanically and files intel:governance issues.
NEVER makes content edits — only files issues (main is protected, so it never pushes).

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
from urllib.parse import urljoin, urlsplit

import requests
import yaml

# ── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[2]
DOCS_DIR = REPO_ROOT / "docs"
MKDOCS_YML = REPO_ROOT / "mkdocs.yml"
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

    # Mirrors the rich-walkthrough template in CONTENT-MODEL.md (Screenshots sits after Step by step)
    required_sections = [
        "when to use this",
        "what you'll need",
        "try it now",
        "step by step",
        "screenshots",
        "make it better",
        "watch out for",
        "where this leads",
        "related",
    ]

    for md_file in sorted(WALKTHROUGHS_DIR.glob("*.md")):
        text = md_file.read_text(encoding="utf-8")
        relpath = md_file.relative_to(REPO_ROOT).as_posix()
        fm = parse_frontmatter(text)
        if fm is None and text.startswith("---"):
            findings.append(Finding(
                "structure", "p2",
                f"Invalid YAML frontmatter in {relpath}",
                "The frontmatter does not parse as YAML, so MkDocs renders it as raw text at the top of "
                "the page and drops the page metadata. Quote values that contain ': '.",
                [relpath],
            ))
            continue
        if not fm or fm.get("status") != "walkthrough":
            continue

        headings = [
            re.sub(r"^#+\s*", "", line).strip().lower()
            for line in text.splitlines()
            if re.match(r"#{1,6}\s+\S", line)
        ]

        # Check section ORDER (not just presence)
        found_indices = []
        for section in required_sections:
            for i, h in enumerate(headings):
                if h.startswith(section):
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
REDIRECT_CODES = (301, 302, 303, 307, 308)
LOCALE_SEGMENT = re.compile(r"/[a-z]{2}-[a-z]{2}(?=/|$)", re.IGNORECASE)


def _request(url: str) -> requests.Response:
    """Streamed GET (body not downloaded). HEAD is unreliable here: Learn answers HEAD with 200
    where GET redirects, and some sites (e.g. copilot.cloud.microsoft) reject HEAD with 405."""
    resp = requests.get(
        url, timeout=REQUEST_TIMEOUT, headers={"User-Agent": USER_AGENT},
        allow_redirects=False, stream=True,
    )
    resp.close()
    return resp


def probe_url(url: str, max_hops: int = 6) -> tuple[int, str]:
    """Return (final status, final URL), following redirects one hop at a time."""
    current = url
    for _ in range(max_hops):
        resp = _request(current)
        if resp.status_code not in REDIRECT_CODES:
            return resp.status_code, current
        location = resp.headers.get("Location")
        if not location:
            return resp.status_code, current
        current = urljoin(current, location)
    return resp.status_code, current


def same_page(a: str, b: str) -> bool:
    """True when two URLs differ only by locale segment, trailing slash, scheme or query string."""
    def norm(u: str) -> str:
        p = urlsplit(u)
        path = LOCALE_SEGMENT.sub("", p.path).rstrip("/").lower()
        return f"{p.netloc.lower()}{path}"
    return norm(a) == norm(b)


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
                status, final_url = probe_url(url)
                if status >= 400:
                    broken.append((url, status, relpath))
                elif final_url and not same_page(url, final_url):
                    redirected.append((url, final_url, relpath))
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


_open_governance_titles: set[str] | None = None


def check_duplicate_issue(title: str) -> bool:
    """True if an open governance issue already has exactly this title.

    Titles embed the affected file path, so an exact match is the right key. (A fuzzy word-overlap
    match made every "Section order mismatch in <file>" look like a duplicate of the first one.)
    """
    global _open_governance_titles
    if _open_governance_titles is None:
        _open_governance_titles = set()
        try:
            result = subprocess.run(
                ["gh", "issue", "list", "--state", "open", "--label", "intel:governance",
                 "--json", "title", "--limit", "500"],
                capture_output=True, text=True, timeout=30,
            )
            if result.returncode == 0:
                _open_governance_titles = {i["title"].strip() for i in json.loads(result.stdout)}
        except (subprocess.TimeoutExpired, json.JSONDecodeError):
            pass
    return title.strip() in _open_governance_titles


def file_issue(finding: Finding, dry_run: bool = False) -> str:
    """File a governance issue for a finding. Returns "filed", "duplicate" or "failed"."""
    title = f"🔍 Governance: {finding.title}"

    if not dry_run and check_duplicate_issue(title):
        log.info(f"  Duplicate issue exists — skipping: {finding.title}")
        return "duplicate"

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
        return "filed"

    cmd = ["gh", "issue", "create", "--title", title, "--body", body]
    for label in labels:
        cmd.extend(["--label", label])

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode == 0:
        log.info(f"  Filed: {result.stdout.strip()}")
        return "filed"
    log.error(f"  Failed to file issue: {result.stderr}")
    return "failed"


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

    # File issues (up to cap). Already-open duplicates don't count against the cap.
    filed = []
    failed = []
    for finding in unique_findings:
        if len(filed) >= MAX_ISSUES_PER_RUN:
            break
        log.info(f"\n  [{finding.severity}] {finding.title}")
        status = file_issue(finding, dry_run=args.dry_run)
        if status == "filed":
            filed.append(finding)
        elif status == "failed":
            failed.append(finding)

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

    if failed:
        log.error(f"Could not file {len(failed)} issue(s) — failing the run so it shows up in Actions")
        sys.exit(1)


if __name__ == "__main__":
    main()

"""
Watcher · Assess & File Step

Reads automation/state/watcher-new-items.json (output of fetch_diff.py),
classifies each item, and files GitHub issues with appropriate labels.

Enforces:
- Deduplication against open issues (by title/URL match)
- Cap of 25 new issues per run
- Grounding contract (every issue cites official MS URL + retrieval date)

Usage:
    python automation/watcher/assess_and_file.py [--dry-run] [--max-issues 25]

Requires:
    - gh CLI authenticated
    - GITHUB_REPOSITORY env var (set automatically in Actions)
"""

import argparse
import json
import logging
import os
import re
import subprocess
import sys
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[2]
NEW_ITEMS_FILE = REPO_ROOT / "automation" / "state" / "watcher-new-items.json"
DOCS_DIR = REPO_ROOT / "docs"

# ── Config ───────────────────────────────────────────────────────────────────
DEFAULT_MAX_ISSUES = 25

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("watcher.assess")

# ── Classification Rules ─────────────────────────────────────────────────────
# Keywords that signal an accuracy risk (product changes that may make site wrong)
ACCURACY_RISK_KEYWORDS = [
    r"deprecat",
    r"retir(e|ed|ing|ement)",
    r"renam(e|ed|ing)",
    r"replac(e|ed|ing)",
    r"breaking.?change",
    r"end.?of.?(life|support)",
    r"general.?availab",
    r"preview.?(ended|removed)",
    r"pricing.?(change|update)",
    r"billing.?(change|update)",
    r"credit.?(change|update|rate)",
    r"message.?(pack|unit|cost)",
    r"moved?.?to",
    r"migrat(e|ed|ing|ion)",
    r"sunset",
    r"discontinu",
    r"now.?called",
    r"formerly.?known",
]

# Keywords for new use-case opportunities
USECASE_KEYWORDS = [
    r"new.?feature",
    r"new.?capability",
    r"now.?you.?can",
    r"introducing",
    r"launch(ed|ing)",
    r"scenario",
    r"use.?case",
    r"template",
    r"sample",
    r"tutorial",
    r"walkthrough",
    r"hands.?on",
    r"lab",
    r"workshop",
]


def classify_item(item: dict) -> dict:
    """
    Classify a new item into issue type and priority.
    Returns dict with 'type_label', 'priority_label', 'reason'.
    """
    text = f"{item.get('title', '')} {item.get('summary', '')}".lower()

    # Check accuracy risk first (highest priority)
    for pattern in ACCURACY_RISK_KEYWORDS:
        if re.search(pattern, text):
            return {
                "type_label": "intel:accuracy-risk",
                "priority_label": "intel:p1",
                "reason": f"Potential accuracy risk: matches pattern '{pattern}'",
            }

    # Check for new use-case / walkthrough opportunity
    for pattern in USECASE_KEYWORDS:
        if re.search(pattern, text):
            return {
                "type_label": "intel:new-usecase",
                "priority_label": "intel:p3",
                "reason": f"Potential new use-case: matches pattern '{pattern}'",
            }

    # Default: new resource
    return {
        "type_label": "intel:new-resource",
        "priority_label": "intel:p2",
        "reason": "New or updated resource detected",
    }


def find_affected_pages(item: dict) -> list[str]:
    """
    Search docs/ for pages that reference the same topic/product.
    Returns a list of relative file paths that may need updating.
    """
    affected = []
    title_words = set(item.get("title", "").lower().split())
    # Use meaningful words (skip short/common ones)
    search_terms = [w for w in title_words if len(w) > 4 and w not in {
        "about", "their", "these", "which", "where", "there", "would",
        "could", "should", "microsoft", "https", "learn",
    }]

    if not search_terms:
        return affected

    # Search through docs/ for files mentioning these terms
    for md_file in DOCS_DIR.rglob("*.md"):
        try:
            content = md_file.read_text(encoding="utf-8").lower()
            matches = sum(1 for term in search_terms if term in content)
            if matches >= 2 or (len(search_terms) == 1 and matches >= 1):
                rel_path = md_file.relative_to(REPO_ROOT)
                affected.append(str(rel_path).replace("\\", "/"))
        except (OSError, UnicodeDecodeError):
            continue

    return affected[:10]  # Cap to avoid giant lists


def check_duplicate_issue(title: str, url: str) -> bool:
    """Check if an open issue already covers this item (by URL or title similarity)."""
    try:
        # Search by URL in issue body
        result = subprocess.run(
            ["gh", "issue", "list", "--state", "open", "--search", url, "--json", "title,body", "--limit", "5"],
            capture_output=True, text=True, timeout=15,
        )
        if result.returncode == 0:
            issues = json.loads(result.stdout)
            for issue in issues:
                if url in issue.get("body", ""):
                    log.info(f"  Duplicate found (URL match): {issue['title']}")
                    return True

        # Also search by title keywords
        short_title = " ".join(title.split()[:5])
        result = subprocess.run(
            ["gh", "issue", "list", "--state", "open", "--search", short_title, "--json", "title", "--limit", "5"],
            capture_output=True, text=True, timeout=15,
        )
        if result.returncode == 0:
            issues = json.loads(result.stdout)
            for issue in issues:
                # Fuzzy title match — if >60% of words overlap
                existing_words = set(issue["title"].lower().split())
                new_words = set(title.lower().split())
                if len(existing_words & new_words) / max(len(new_words), 1) > 0.6:
                    log.info(f"  Duplicate found (title match): {issue['title']}")
                    return True

    except (subprocess.TimeoutExpired, json.JSONDecodeError) as e:
        log.warning(f"  Dedup check failed: {e}")

    return False


def format_issue_body(item: dict, classification: dict, affected_pages: list[str]) -> str:
    """Format the GitHub issue body per the PR format spec."""
    source_name = item.get("source", "Unknown")
    url = item.get("url", "")
    retrieved = item.get("retrieved_at", "unknown")[:10]
    summary = item.get("summary", "No summary available.")
    change_type = item.get("change_type", "new")
    category = item.get("category", "unknown")

    affected_section = ""
    if affected_pages:
        pages_list = "\n".join(f"- `{p}`" for p in affected_pages)
        affected_section = f"""
## Potentially affected pages

{pages_list}
"""

    return f"""## Signal

| Field | Value |
|-------|-------|
| **Source** | {source_name} |
| **Category** | {category} |
| **Change type** | {change_type} |
| **Classification** | {classification['reason']} |

## Why it matters

{summary}

## Source citation

| Source URL | Retrieved |
|-----------|-----------|
| {url} | {retrieved} |
{affected_section}
---
*Filed automatically by the Watcher automation. See `automation/README.md` for pipeline docs.*
"""


def create_issue(title: str, body: str, labels: list[str], dry_run: bool = False) -> bool:
    """Create a GitHub issue with the given labels."""
    if dry_run:
        log.info(f"  [DRY RUN] Would create issue: {title}")
        log.info(f"    Labels: {', '.join(labels)}")
        return True

    cmd = [
        "gh", "issue", "create",
        "--title", title,
        "--body", body,
    ]
    for label in labels:
        cmd.extend(["--label", label])

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            issue_url = result.stdout.strip()
            log.info(f"  Created issue: {issue_url}")
            return True
        else:
            log.error(f"  Failed to create issue: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        log.error("  Issue creation timed out")
        return False


def main():
    parser = argparse.ArgumentParser(description="Watcher assess & file step")
    parser.add_argument("--dry-run", action="store_true", help="Don't create issues, just log")
    parser.add_argument("--max-issues", type=int, default=DEFAULT_MAX_ISSUES,
                        help=f"Max issues to create per run (default: {DEFAULT_MAX_ISSUES})")
    args = parser.parse_args()

    # Load new items
    if not NEW_ITEMS_FILE.exists():
        log.info("No new items file found — nothing to assess")
        sys.exit(0)

    with open(NEW_ITEMS_FILE, "r", encoding="utf-8") as f:
        new_items = json.load(f)

    if not new_items:
        log.info("No new items to assess")
        sys.exit(0)

    log.info(f"Assessing {len(new_items)} new/changed items (cap: {args.max_issues})")

    # Counters for summary
    counts = {"intel:accuracy-risk": 0, "intel:new-resource": 0, "intel:new-usecase": 0}
    created = 0
    skipped_dup = 0
    skipped_cap = 0

    for item in new_items:
        if created >= args.max_issues:
            skipped_cap += 1
            continue

        title_prefix = {
            "new": "📡 New:",
            "changed": "🔄 Changed:",
        }.get(item.get("change_type", "new"), "📡")

        issue_title = f"{title_prefix} {item['title'][:100]}"

        # Dedup check
        if not args.dry_run and check_duplicate_issue(issue_title, item.get("url", "")):
            skipped_dup += 1
            continue

        # Classify
        classification = classify_item(item)
        type_label = classification["type_label"]

        # Find affected pages
        affected_pages = find_affected_pages(item)

        # Build labels
        labels = [
            type_label,
            classification["priority_label"],
            "intel:triage",
            "automation",
        ]

        # Format body
        body = format_issue_body(item, classification, affected_pages)

        # Create issue
        if create_issue(issue_title, body, labels, dry_run=args.dry_run):
            created += 1
            counts[type_label] = counts.get(type_label, 0) + 1

    # Summary
    log.info(f"\n{'='*60}")
    log.info("WATCHER RUN SUMMARY")
    log.info(f"  Items assessed: {len(new_items)}")
    log.info(f"  Issues created: {created}")
    log.info(f"  Skipped (duplicate): {skipped_dup}")
    log.info(f"  Skipped (cap reached): {skipped_cap}")
    log.info(f"  By type:")
    for label, count in counts.items():
        if count > 0:
            log.info(f"    {label}: {count}")
    log.info(f"{'='*60}")

    # Write summary to GITHUB_STEP_SUMMARY if available
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_file:
        with open(summary_file, "a", encoding="utf-8") as f:
            f.write(f"## 📡 Watcher Run Summary\n\n")
            f.write(f"| Metric | Count |\n|--------|-------|\n")
            f.write(f"| Items assessed | {len(new_items)} |\n")
            f.write(f"| Issues created | {created} |\n")
            f.write(f"| Skipped (duplicate) | {skipped_dup} |\n")
            f.write(f"| Skipped (cap) | {skipped_cap} |\n")
            for label, count in counts.items():
                if count > 0:
                    f.write(f"| {label} | {count} |\n")


if __name__ == "__main__":
    main()

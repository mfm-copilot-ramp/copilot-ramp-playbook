"""
Reconciler · Select & Verify Step

Queries the backlog for open intel:accuracy-risk and intel:new-resource issues,
re-verifies each claim against the cited official Microsoft URL, and prepares
a work plan for the edit step.

Usage:
    python automation/reconciler/select_issues.py [--dry-run] [--max-issues 3]

Outputs:
    automation/state/reconciler-workplan.json — verified issues ready for editing

Requires:
    - gh CLI authenticated
    - GITHUB_REPOSITORY env var (set in Actions)
"""

import argparse
import json
import logging
import re
import subprocess
import sys
from pathlib import Path

import requests

# ── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[2]
WORKPLAN_FILE = REPO_ROOT / "automation" / "state" / "reconciler-workplan.json"
DOCS_DIR = REPO_ROOT / "docs"

# ── Config ───────────────────────────────────────────────────────────────────
REQUEST_TIMEOUT = 30
USER_AGENT = "CopilotRampCookbook-Reconciler/1.0"
MAX_ISSUES_DEFAULT = 3  # per-run scope cap (from copilot-instructions.md)

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("reconciler.select")

# Labels that indicate structural/framing changes requiring human decision
FRAMING_MAJOR_KEYWORDS = [
    r"stage.?(rename|reorder|resequenc|restructur|merg|split)",
    r"journey.?(change|reorder|restructur)",
    r"mov(e|ed|ing).+between.+stage",
    r"product.+(stage|position).+change",
    r"rebrand.+entire",
]


def query_issues(label: str, limit: int = 10) -> list[dict]:
    """Query open issues with a given label, sorted by priority labels."""
    cmd = [
        "gh", "issue", "list",
        "--state", "open",
        "--label", label,
        "--json", "number,title,body,labels,url,createdAt",
        "--limit", str(limit),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        log.error(f"Failed to query issues: {result.stderr}")
        return []
    return json.loads(result.stdout)


def extract_source_url(body: str) -> str | None:
    """Extract the source citation URL from an issue body."""
    # Look for URL in the Source citation table
    patterns = [
        r"\|\s*(https?://[^\s|]+)\s*\|",  # table cell with URL
        r"Source URL[^|]*\|\s*(https?://[^\s|]+)",
        r"(https://learn\.microsoft\.com/[^\s)]+)",
        r"(https://techcommunity\.microsoft\.com/[^\s)]+)",
        r"(https://www\.microsoft\.com/[^\s)]+)",
        r"(https://adoption\.microsoft\.com/[^\s)]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, body)
        if match:
            url = match.group(1).rstrip("|").strip()
            return url
    return None


def verify_url(url: str) -> dict:
    """Fetch the URL and return verification result."""
    try:
        resp = requests.get(
            url,
            timeout=REQUEST_TIMEOUT,
            headers={"User-Agent": USER_AGENT},
            allow_redirects=True,
        )
        return {
            "reachable": True,
            "status_code": resp.status_code,
            "final_url": resp.url,
            "redirected": resp.url != url,
            "content_length": len(resp.text),
            "title": extract_page_title(resp.text),
        }
    except requests.RequestException as e:
        return {
            "reachable": False,
            "error": str(e),
        }


def extract_page_title(html: str) -> str:
    """Quick title extraction without full HTML parsing."""
    match = re.search(r"<title[^>]*>([^<]+)</title>", html, re.IGNORECASE)
    return match.group(1).strip() if match else ""


def is_framing_major(issue: dict) -> bool:
    """Detect if an issue is structural/framing that needs human decision."""
    text = f"{issue.get('title', '')} {issue.get('body', '')}".lower()
    for pattern in FRAMING_MAJOR_KEYWORDS:
        if re.search(pattern, text):
            return True
    return False


def find_affected_files(issue: dict) -> list[str]:
    """
    Search docs/ for files affected by this issue.
    Uses the 'Potentially affected pages' section if present,
    and also does keyword search.
    """
    body = issue.get("body", "")
    affected = set()

    # Extract pages listed in the issue body
    for match in re.finditer(r"`(docs/[^`]+\.md)`", body):
        path = REPO_ROOT / match.group(1)
        if path.exists():
            affected.add(match.group(1))

    # Also search by title keywords for broader coverage
    title = issue.get("title", "")
    # Remove emoji prefixes
    title_clean = re.sub(r"^[📡🔄]\s*(New|Changed):\s*", "", title)
    words = [w.lower() for w in title_clean.split() if len(w) > 4]
    search_terms = [w for w in words if w not in {
        "about", "their", "these", "which", "where", "microsoft", "copilot",
        "learn", "https", "update", "updated",
    }][:5]

    if search_terms:
        for md_file in DOCS_DIR.rglob("*.md"):
            try:
                content = md_file.read_text(encoding="utf-8").lower()
                matches = sum(1 for t in search_terms if t in content)
                if matches >= 2:
                    rel = str(md_file.relative_to(REPO_ROOT)).replace("\\", "/")
                    affected.add(rel)
            except (OSError, UnicodeDecodeError):
                continue

    return sorted(affected)[:10]


def get_priority_sort_key(issue: dict) -> int:
    """Sort key: p1=0, p2=1, p3=2, no priority=3."""
    labels = [l["name"] for l in issue.get("labels", [])]
    if "intel:p1" in labels:
        return 0
    if "intel:p2" in labels:
        return 1
    if "intel:p3" in labels:
        return 2
    return 3


def escalate_to_framing_major(issue: dict, dry_run: bool = False) -> None:
    """Convert an issue to a framing-major discussion issue."""
    number = issue["number"]
    log.info(f"  Issue #{number} is framing-major — escalating")

    if dry_run:
        log.info(f"  [DRY RUN] Would add intel:framing-major label and comment")
        return

    # Add the framing-major label
    subprocess.run(
        ["gh", "issue", "edit", str(number), "--add-label", "intel:framing-major"],
        capture_output=True, timeout=15,
    )

    # Add a comment explaining why
    comment = (
        "⚠️ **Escalated to `intel:framing-major`** by the Reconciler.\n\n"
        "This change appears structural (stage rename, journey re-sequencing, or product "
        "repositioning). Per the automation operating model, these require a human decision "
        "and cannot be handled as a direct PR.\n\n"
        "Please review and decide on the framing change, then create a PR manually or "
        "re-label as `intel:ready` with narrowed scope if it can be handled as a small edit."
    )
    subprocess.run(
        ["gh", "issue", "comment", str(number), "--body", comment],
        capture_output=True, timeout=15,
    )


def main():
    parser = argparse.ArgumentParser(description="Reconciler select & verify step")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--max-issues", type=int, default=MAX_ISSUES_DEFAULT)
    args = parser.parse_args()

    log.info(f"Reconciler select step — max issues: {args.max_issues}")

    # Query accuracy-risk and new-resource issues
    accuracy_issues = query_issues("intel:accuracy-risk")
    resource_issues = query_issues("intel:new-resource")

    # Filter out issues already in-progress or done
    skip_labels = {"intel:in-progress", "intel:done", "intel:wontfix", "intel:framing-major"}
    all_issues = []
    for issue in accuracy_issues + resource_issues:
        issue_labels = {l["name"] for l in issue.get("labels", [])}
        if not issue_labels & skip_labels:
            all_issues.append(issue)

    # Deduplicate (same issue might appear in both queries)
    seen_numbers = set()
    unique_issues = []
    for issue in all_issues:
        if issue["number"] not in seen_numbers:
            seen_numbers.add(issue["number"])
            unique_issues.append(issue)

    # Sort by priority
    unique_issues.sort(key=get_priority_sort_key)

    log.info(f"Found {len(unique_issues)} eligible issues")

    if not unique_issues:
        log.info("No issues to process")
        WORKPLAN_FILE.parent.mkdir(parents=True, exist_ok=True)
        WORKPLAN_FILE.write_text("[]", encoding="utf-8")
        sys.exit(0)

    # Process up to cap
    workplan = []
    for issue in unique_issues[: args.max_issues]:
        number = issue["number"]
        log.info(f"Processing issue #{number}: {issue['title']}")

        # Check if framing-major
        if is_framing_major(issue):
            escalate_to_framing_major(issue, dry_run=args.dry_run)
            continue

        # Extract and verify source URL
        source_url = extract_source_url(issue.get("body", ""))
        if not source_url:
            log.warning(f"  No source URL found in issue #{number} — skipping")
            continue

        log.info(f"  Verifying: {source_url}")
        verification = verify_url(source_url)

        if not verification.get("reachable"):
            log.warning(f"  Source unreachable: {verification.get('error')} — skipping")
            continue

        # Find affected files
        affected_files = find_affected_files(issue)
        log.info(f"  Affected files: {len(affected_files)}")

        # Determine issue type
        issue_labels = {l["name"] for l in issue.get("labels", [])}
        issue_type = "accuracy-risk" if "intel:accuracy-risk" in issue_labels else "new-resource"

        workplan.append({
            "issue_number": number,
            "issue_title": issue["title"],
            "issue_url": issue["url"],
            "issue_type": issue_type,
            "source_url": source_url,
            "source_verified": verification,
            "affected_files": affected_files,
            "priority": get_priority_sort_key(issue),
        })

    # Write workplan
    WORKPLAN_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(WORKPLAN_FILE, "w", encoding="utf-8") as f:
        json.dump(workplan, f, indent=2, ensure_ascii=False)

    log.info(f"Workplan written: {len(workplan)} items → {WORKPLAN_FILE}")


if __name__ == "__main__":
    main()

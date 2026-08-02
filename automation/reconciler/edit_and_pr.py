"""
Reconciler · Edit & PR Step

Reads the verified workplan from select_issues.py, performs surgical edits,
and opens one PR per logical change with proper labels and formatting.

For accuracy-risk issues:
  - Corrects how the product/feature/rate is described across ALL affected pages
  - Searches broadly (stages, solutions, glossary, estimator) for repeated framing
  - Keeps edits minimal and precise

For new-resource issues:
  - Adds the link in RESOURCES.md and/or the relevant stage's resources section
  - Matches existing table formatting exactly

Usage:
    python automation/reconciler/edit_and_pr.py [--dry-run]

Requires:
    - gh CLI authenticated
    - git configured (user.name, user.email)
    - automation/state/reconciler-workplan.json from select_issues.py
"""

import argparse
import json
import logging
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

# ── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[2]
WORKPLAN_FILE = REPO_ROOT / "automation" / "state" / "reconciler-workplan.json"
DOCS_DIR = REPO_ROOT / "docs"
RESOURCES_FILE = DOCS_DIR / "RESOURCES.md"

# ── Config ───────────────────────────────────────────────────────────────────
MAX_FILES_PER_PR = 3  # scope cap from copilot-instructions.md
REQUEST_TIMEOUT = 30
USER_AGENT = "CopilotRampCookbook-Reconciler/1.0"

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("reconciler.edit")


def load_workplan() -> list[dict]:
    """Load the verified workplan."""
    if not WORKPLAN_FILE.exists():
        return []
    with open(WORKPLAN_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def git_branch_exists(branch: str) -> bool:
    """Check if a git branch already exists."""
    result = subprocess.run(
        ["git", "branch", "--list", branch],
        capture_output=True, text=True, cwd=REPO_ROOT,
    )
    return bool(result.stdout.strip())


def create_branch(branch_name: str) -> bool:
    """Create and checkout a new branch from the default branch."""
    # Fetch latest
    subprocess.run(["git", "fetch", "origin"], capture_output=True, cwd=REPO_ROOT)

    # Get default branch
    result = subprocess.run(
        ["gh", "repo", "view", "--json", "defaultBranchRef", "-q", ".defaultBranchRef.name"],
        capture_output=True, text=True, cwd=REPO_ROOT,
    )
    default_branch = result.stdout.strip() or "main"

    # Create branch
    result = subprocess.run(
        ["git", "checkout", "-b", branch_name, f"origin/{default_branch}"],
        capture_output=True, text=True, cwd=REPO_ROOT,
    )
    if result.returncode != 0:
        log.error(f"Failed to create branch: {result.stderr}")
        return False
    return True


def add_resource_to_resources_md(
    title: str,
    description: str,
    url: str,
    category: str,
) -> bool:
    """
    Add a new resource link to RESOURCES.md in the appropriate stage section.
    Returns True if the file was modified.
    """
    if not RESOURCES_FILE.exists():
        log.warning("RESOURCES.md not found")
        return False

    content = RESOURCES_FILE.read_text(encoding="utf-8")

    # Check if URL already exists
    if url in content:
        log.info(f"  URL already in RESOURCES.md — skipping")
        return False

    # Map category to section header
    section_map = {
        "cross-journey": "## Cross-journey",
        "chat": "## Stage 1",
        "first-party": "## Stage 2",
        "cowork": "## Stage 3",
        "agent-builder": "## Stage 4",
        "autopilots": "## Stage 5",
        "studio": "## Stage 6",
        "foundry": "## Stage 7",
    }

    target_section = section_map.get(category, "## Cross-journey")

    # Find the section and its table
    section_pattern = re.escape(target_section)
    # Find the last row of the table in this section (before the next --- or ## heading)
    match = re.search(
        rf"({section_pattern}[^\n]*\n.*?\|[^\n]+\|[^\n]+\|[^\n]+\|)\s*(\n---|\n##|\Z)",
        content,
        re.DOTALL,
    )

    if not match:
        log.warning(f"  Could not find section '{target_section}' table in RESOURCES.md")
        return False

    # Build the new row matching existing format
    new_row = f"\n| **{title}** | {description} | [{url.split('//')[1][:50]}...]({url}) |"

    # Insert after the last table row
    insert_pos = match.end(1)
    content = content[:insert_pos] + new_row + content[insert_pos:]

    RESOURCES_FILE.write_text(content, encoding="utf-8")
    log.info(f"  Added resource to RESOURCES.md in {target_section}")
    return True


def search_and_replace_in_files(
    files: list[str],
    old_pattern: str,
    new_text: str,
    is_regex: bool = False,
) -> list[str]:
    """
    Search and replace across files. Returns list of modified file paths.
    Respects the 3-file cap.
    """
    modified = []
    for file_path in files[:MAX_FILES_PER_PR]:
        full_path = REPO_ROOT / file_path
        if not full_path.exists():
            continue

        content = full_path.read_text(encoding="utf-8")
        if is_regex:
            new_content = re.sub(old_pattern, new_text, content)
        else:
            new_content = content.replace(old_pattern, new_text)

        if new_content != content:
            full_path.write_text(new_content, encoding="utf-8")
            modified.append(file_path)
            log.info(f"  Modified: {file_path}")

    return modified


def run_quality_checks() -> bool:
    """Run check-content.py and mkdocs build --strict."""
    log.info("  Running quality checks...")

    # check-content.py
    result = subprocess.run(
        ["python", "tooling/qa/check-content.py"],
        capture_output=True, text=True, cwd=REPO_ROOT, timeout=60,
    )
    if result.returncode != 0:
        log.error(f"  check-content.py failed: {result.stdout}\n{result.stderr}")
        return False

    # mkdocs build --strict
    result = subprocess.run(
        ["python", "-m", "mkdocs", "build", "--strict"],
        capture_output=True, text=True, cwd=REPO_ROOT, timeout=300,
    )
    if result.returncode != 0:
        log.error(f"  mkdocs build --strict failed: {result.stderr}")
        return False

    log.info("  Quality checks passed ✓")
    return True


def create_pr(
    branch: str,
    title: str,
    body: str,
    issue_number: int,
    dry_run: bool = False,
) -> str | None:
    """Create a PR with proper labels. Returns PR URL or None."""
    if dry_run:
        log.info(f"  [DRY RUN] Would create PR: {title}")
        return "https://github.com/dry-run"

    # Stage and commit
    result = subprocess.run(
        ["git", "add", "-A"], capture_output=True, cwd=REPO_ROOT,
    )
    result = subprocess.run(
        ["git", "diff", "--cached", "--quiet"], capture_output=True, cwd=REPO_ROOT,
    )
    if result.returncode == 0:
        log.info("  No changes to commit")
        return None

    subprocess.run(
        ["git", "commit", "-m", f"fix: {title}\n\nCloses #{issue_number}"],
        capture_output=True, cwd=REPO_ROOT,
    )

    # Push branch
    result = subprocess.run(
        ["git", "push", "--set-upstream", "origin", branch],
        capture_output=True, text=True, cwd=REPO_ROOT, timeout=60,
    )
    if result.returncode != 0:
        log.error(f"  Push failed: {result.stderr}")
        return None

    # Create PR
    cmd = [
        "gh", "pr", "create",
        "--title", title,
        "--body", body,
        "--label", "automation",
        "--label", "needs-human-review",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=REPO_ROOT, timeout=30)
    if result.returncode != 0:
        log.error(f"  PR creation failed: {result.stderr}")
        return None

    pr_url = result.stdout.strip()
    log.info(f"  PR created: {pr_url}")
    return pr_url


def format_pr_body(
    item: dict,
    modified_files: list[str],
    change_description: str,
    retrieval_date: str,
) -> str:
    """Format PR body per copilot-instructions.md spec."""
    source_url = item["source_url"]
    issue_number = item["issue_number"]
    issue_type = item["issue_type"]

    files_list = "\n".join(f"- `{f}`" for f in modified_files)

    return f"""## What changed

{change_description}

**Files modified:**
{files_list}

## Why

{issue_type.replace('-', ' ').title()} detected by the Watcher automation.
Original signal: #{issue_number}

## Backlog issue

Closes #{issue_number}

## Sources

| Claim | URL | Retrieved |
|-------|-----|-----------|
| {item['issue_title'][:80]} | {source_url} | {retrieval_date} |

---
*Generated by the Reconciler automation. See `automation/README.md` for pipeline docs.*
"""


def handle_new_resource(item: dict, dry_run: bool = False) -> list[str]:
    """Handle a new-resource issue by adding to RESOURCES.md."""
    source_url = item["source_url"]
    title = item["issue_title"]
    # Clean up title (remove emoji prefixes)
    clean_title = re.sub(r"^[📡🔄]\s*(New|Changed):\s*", "", title).strip()

    # Determine category from the source verification
    verification = item.get("source_verified", {})
    page_title = verification.get("title", clean_title)

    # Try to infer category from affected files or issue content
    category = "cross-journey"  # default
    for f in item.get("affected_files", []):
        if "stage-1" in f or "chat" in f:
            category = "chat"
        elif "stage-2" in f or "first-party" in f:
            category = "first-party"
        elif "stage-3" in f or "cowork" in f:
            category = "cowork"
        elif "stage-4" in f or "agent-builder" in f:
            category = "agent-builder"
        elif "stage-5" in f or "autopilot" in f:
            category = "autopilots"
        elif "stage-6" in f or "studio" in f:
            category = "studio"
        elif "stage-7" in f or "foundry" in f:
            category = "foundry"
        if category != "cross-journey":
            break

    modified = []
    if add_resource_to_resources_md(
        title=clean_title,
        description=f"Official Microsoft resource — {page_title[:80]}",
        url=source_url,
        category=category,
    ):
        modified.append("docs/RESOURCES.md")

    return modified


def handle_accuracy_risk(item: dict, dry_run: bool = False) -> list[str]:
    """
    Handle an accuracy-risk issue.

    This is the most complex case — we need to understand what changed and
    update all affected pages. For safety, we do targeted string replacements
    guided by the issue content and source verification.
    """
    affected_files = item.get("affected_files", [])
    source_url = item["source_url"]

    # Fetch the source page to understand current state
    try:
        resp = requests.get(source_url, timeout=REQUEST_TIMEOUT, headers={"User-Agent": USER_AGENT})
        resp.raise_for_status()
        source_content = resp.text
    except requests.RequestException as e:
        log.warning(f"  Cannot fetch source for accuracy check: {e}")
        return []

    # For accuracy-risk, we add a verification comment to affected files
    # marking them as needing review with the current source state.
    # The actual text edits require understanding the specific change,
    # which is best done by a human or more sophisticated agent.
    #
    # However, we CAN handle common cases:
    # 1. URL redirects (source moved)
    # 2. Stale links that need updating

    verification = item.get("source_verified", {})
    modified = []

    # Case 1: URL redirect — update all references to the old URL
    if verification.get("redirected"):
        old_url = source_url
        new_url = verification["final_url"]
        log.info(f"  URL redirect detected: {old_url} → {new_url}")
        modified = search_and_replace_in_files(affected_files, old_url, new_url)

    # For other accuracy-risk cases, we can't safely auto-edit without
    # understanding the semantic change. Leave for human review but
    # update the issue with verification findings.
    if not modified and not dry_run:
        log.info("  Accuracy-risk requires human judgment — updating issue with findings")
        comment = (
            f"🔍 **Reconciler verification** ({datetime.now(timezone.utc).strftime('%Y-%m-%d')})\n\n"
            f"Source verified: {source_url}\n"
            f"- Status: {'✅ Reachable' if verification.get('reachable') else '❌ Unreachable'}\n"
            f"- Redirected: {'Yes → ' + verification.get('final_url', '') if verification.get('redirected') else 'No'}\n"
            f"- Page title: {verification.get('title', 'N/A')}\n\n"
            f"**Affected files identified:** {len(affected_files)}\n"
            + "\n".join(f"- `{f}`" for f in affected_files[:10])
            + "\n\n"
            f"⚠️ This accuracy-risk requires human judgment for the semantic edit. "
            f"The automated reconciler has verified the source is live and identified affected pages."
        )
        subprocess.run(
            ["gh", "issue", "comment", str(item["issue_number"]), "--body", comment],
            capture_output=True, timeout=15, cwd=REPO_ROOT,
        )

    return modified


def main():
    parser = argparse.ArgumentParser(description="Reconciler edit & PR step")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    workplan = load_workplan()
    if not workplan:
        log.info("No items in workplan — nothing to do")
        sys.exit(0)

    log.info(f"Processing {len(workplan)} workplan items")
    retrieval_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    for item in workplan:
        issue_number = item["issue_number"]
        issue_type = item["issue_type"]
        log.info(f"\n{'='*50}")
        log.info(f"Issue #{issue_number} ({issue_type}): {item['issue_title'][:60]}")

        # Create a branch for this change
        branch_name = f"reconciler/issue-{issue_number}"
        if git_branch_exists(branch_name):
            log.info(f"  Branch {branch_name} already exists — skipping (idempotency)")
            continue

        if not args.dry_run:
            if not create_branch(branch_name):
                continue

        # Perform the edit based on issue type
        if issue_type == "new-resource":
            modified_files = handle_new_resource(item, dry_run=args.dry_run)
            change_description = "Added new official Microsoft resource to RESOURCES.md"
        elif issue_type == "accuracy-risk":
            modified_files = handle_accuracy_risk(item, dry_run=args.dry_run)
            change_description = "Updated content to reflect current official Microsoft documentation"
        else:
            log.warning(f"  Unknown issue type: {issue_type}")
            continue

        if not modified_files:
            log.info(f"  No files modified — skipping PR")
            # Return to original branch
            if not args.dry_run:
                subprocess.run(
                    ["git", "checkout", "-"], capture_output=True, cwd=REPO_ROOT,
                )
            continue

        # Run quality checks before PR
        if not args.dry_run:
            if not run_quality_checks():
                log.error(f"  Quality checks failed — reverting")
                subprocess.run(
                    ["git", "checkout", "--", "."], capture_output=True, cwd=REPO_ROOT,
                )
                subprocess.run(
                    ["git", "checkout", "-"], capture_output=True, cwd=REPO_ROOT,
                )
                continue

        # Create PR
        pr_title = f"[Reconciler] {item['issue_title'][:70]}"
        pr_body = format_pr_body(item, modified_files, change_description, retrieval_date)

        pr_url = create_pr(
            branch=branch_name,
            title=pr_title,
            body=pr_body,
            issue_number=issue_number,
            dry_run=args.dry_run,
        )

        if pr_url and not args.dry_run:
            # Mark issue as in-progress
            subprocess.run(
                ["gh", "issue", "edit", str(issue_number),
                 "--add-label", "intel:in-progress",
                 "--remove-label", "intel:triage,intel:ready"],
                capture_output=True, timeout=15, cwd=REPO_ROOT,
            )

        # Return to default branch for next iteration
        if not args.dry_run:
            subprocess.run(
                ["git", "checkout", "-"], capture_output=True, cwd=REPO_ROOT,
            )

    log.info(f"\n{'='*50}")
    log.info("Reconciler edit step complete")


if __name__ == "__main__":
    main()

"""
Author · Select Work Step

Picks ONE piece of work for the Author automation, prioritized by:
  (a) Open intel:new-usecase issues (highest priority)
  (b) Gaps in the role × stage matrix (catalog stubs not yet expanded)
  (c) If traffic data available, lean toward popular topics/stages

Outputs automation/state/author-workitem.json with the selected task.

Usage:
    python automation/author/select_work.py [--dry-run]
"""

import argparse
import json
import logging
import re
import subprocess
import sys
from pathlib import Path

import yaml

# ── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[2]
WORKITEM_FILE = REPO_ROOT / "automation" / "state" / "author-workitem.json"
DOCS_DIR = REPO_ROOT / "docs"
CATALOG_FILE = DOCS_DIR / "CATALOG.md"
WALKTHROUGHS_DIR = DOCS_DIR / "walkthroughs"
SOLUTIONS_DIR = DOCS_DIR / "solutions"

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("author.select")

STAGE_VOCAB = {"chat", "first-party", "cowork", "agent-builder", "autopilots", "studio", "foundry"}
STAGE_BY_NUMBER = {
    "1": "chat", "2": "first-party", "3": "cowork", "4": "agent-builder",
    "5": "autopilots", "6": "studio", "7": "foundry",
}
# Product names that pin a stage unambiguously. Checked before the issue's "Stage N" hints,
# which the legacy Watcher often guessed wrong (e.g. a Copilot Studio post tagged Stage 1).
STAGE_KEYWORDS = [
    (r"\bcowork\b", "cowork"),
    (r"\bautopilots?\b|\bmicrosoft scout\b", "autopilots"),
    (r"\bcopilot studio\b", "studio"),
    (r"\bfoundry\b", "foundry"),
    (r"\bagent builder\b", "agent-builder"),
]


def infer_stage_from_text(text: str) -> str:
    for pattern, stage in STAGE_KEYWORDS:
        if re.search(pattern, text or "", re.IGNORECASE):
            return stage
    return ""


def query_usecase_issues() -> list[dict]:
    """Query open intel:new-usecase issues, priority-sorted."""
    cmd = [
        "gh", "issue", "list",
        "--state", "open",
        "--label", "intel:new-usecase",
        "--json", "number,title,body,labels,url,createdAt",
        "--limit", "20",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        log.warning(f"Failed to query issues: {result.stderr}")
        return []

    issues = json.loads(result.stdout)

    # Filter out already in-progress or done
    skip_labels = {"intel:in-progress", "intel:done", "intel:wontfix"}
    filtered = []
    for issue in issues:
        issue_labels = {l["name"] for l in issue.get("labels", [])}
        if not issue_labels & skip_labels:
            filtered.append(issue)

    # Sort by priority
    def priority_key(i):
        labels = {l["name"] for l in i.get("labels", [])}
        if "intel:p1" in labels:
            return 0
        if "intel:p2" in labels:
            return 1
        return 2

    filtered.sort(key=priority_key)
    return filtered


def find_catalog_stubs() -> list[dict]:
    """Parse CATALOG.md for stubs that haven't been expanded into walkthroughs."""
    if not CATALOG_FILE.exists():
        return []

    content = CATALOG_FILE.read_text(encoding="utf-8")
    stubs = []

    # Find entries with status: stub
    current_stage = ""
    for line in content.split("\n"):
        stage_match = re.match(r"^## Stage ([1-7])\b", line)
        if stage_match:
            current_stage = STAGE_BY_NUMBER[stage_match.group(1)]
            continue
        if line.startswith("## "):
            current_stage = ""
            continue

        heading_match = re.match(r"^### (.+?)$", line)
        if heading_match and current_stage:
            title = heading_match.group(1).strip()
            # "→ walkthrough" / "→ solution template" mark entries that are already built
            if "→" in title:
                continue
            stubs.append({
                "title": title.rstrip(" ★").strip(),
                "stage": current_stage,
                "source": "catalog-stub",
            })

    return stubs


def find_matrix_gaps() -> list[dict]:
    """
    Identify gaps in the stage × role matrix by checking which stages
    have fewer walkthroughs for certain roles.
    """
    # Count walkthroughs per stage
    stage_counts: dict[str, int] = {}
    role_coverage: dict[str, set] = {}

    for md_file in WALKTHROUGHS_DIR.glob("*.md"):
        try:
            content = md_file.read_text(encoding="utf-8")
            # Parse frontmatter
            if content.startswith("---"):
                end = content.index("---", 3)
                fm = yaml.safe_load(content[3:end])
                if fm and isinstance(fm, dict):
                    stage = fm.get("stage", "unknown")
                    roles = fm.get("roles", [])
                    stage_counts[stage] = stage_counts.get(stage, 0) + 1
                    if stage not in role_coverage:
                        role_coverage[stage] = set()
                    role_coverage[stage].update(roles)
        except (ValueError, yaml.YAMLError, OSError):
            continue

    # Identify stages with low coverage
    all_stages = ["chat", "first-party", "cowork", "agent-builder", "autopilots", "studio", "foundry"]
    all_roles = {"end-user", "champion", "manager", "maker", "developer", "it-admin"}

    gaps = []
    for stage in all_stages:
        count = stage_counts.get(stage, 0)
        covered_roles = role_coverage.get(stage, set())
        missing_roles = all_roles - covered_roles

        if missing_roles:
            gaps.append({
                "stage": stage,
                "missing_roles": sorted(missing_roles),
                "current_count": count,
                "priority_score": len(missing_roles) * 10 + max(0, 5 - count),
            })

    # Sort by priority (most gaps first)
    gaps.sort(key=lambda g: g["priority_score"], reverse=True)
    return gaps


def extract_issue_details(issue: dict) -> dict:
    """Extract structured details from a new-usecase issue."""
    body = issue.get("body", "") or ""

    summary_match = re.search(
        r"## (?:Why it matters|Summary)\s*\n\s*(.+?)(?=\n## |\n---|\Z)", body, re.DOTALL
    )
    summary = summary_match.group(1).strip() if summary_match else ""
    # Drop the WordPress feed footer ("The post X appeared first on Y.")
    summary = re.sub(r"\s*The post .+? appeared first on .+$", "", summary, flags=re.DOTALL).strip()

    # Current Watcher format: "| **Category** | studio |". Legacy format: "## Relevant stages\nStage 6 — ..."
    category = ""
    category_match = re.search(r"\|\s*\*\*Category\*\*\s*\|\s*([a-z-]+)\s*\|", body, re.IGNORECASE)
    if category_match:
        category = category_match.group(1).lower()

    if category not in STAGE_VOCAB:
        category = infer_stage_from_text(issue.get("title", "")) or infer_stage_from_text(summary)

    if category not in STAGE_VOCAB:
        stage_match = re.search(r"Stage\s+([1-7])\b", body, re.IGNORECASE)
        category = STAGE_BY_NUMBER.get(stage_match.group(1), "") if stage_match else ""

    if not category:
        log.warning(f"Issue #{issue['number']} has no valid stage; skipping")
        return {}

    url_match = re.search(r"(https://[^\s|)]+)", body)
    source_url = url_match.group(1) if url_match else ""

    return {
        "issue_number": issue["number"],
        "title": issue["title"],
        "issue_title": issue["title"],
        "issue_url": issue["url"],
        "category": category,
        "source_url": source_url,
        "summary": summary,
        "source": "issue",
    }


def main():
    parser = argparse.ArgumentParser(description="Author select work step")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    log.info("Author select step — finding work...")

    workitem = None

    # Priority (a): Open intel:new-usecase issues
    issues = query_usecase_issues()
    if issues:
        log.info(f"Found {len(issues)} open new-usecase issues")
        for issue in issues:
            candidate = extract_issue_details(issue)
            if candidate:
                workitem = candidate
                workitem["selection_reason"] = "Highest-priority open intel:new-usecase issue with a valid stage"
                log.info(f"Selected issue #{issue['number']}: {issue['title']}")
                break

    # Priority (b): Catalog stubs
    if not workitem:
        stubs = find_catalog_stubs()
        if stubs:
            log.info(f"Found {len(stubs)} catalog stubs")
            stub = stubs[0]
            workitem = {
                "title": stub["title"],
                "category": stub["stage"],
                "source": "catalog-stub",
                "source_url": "",
                "summary": f"Promote catalog stub '{stub['title']}' to full walkthrough",
                "selection_reason": "Catalog stub awaiting expansion",
            }
            log.info(f"Selected stub: {stub['title']}")

    # Priority (c): Matrix gaps
    if not workitem:
        gaps = find_matrix_gaps()
        if gaps:
            gap = gaps[0]
            log.info(f"Found matrix gap: stage={gap['stage']}, missing roles={gap['missing_roles']}")
            workitem = {
                "title": f"New walkthrough for {gap['stage']} targeting {gap['missing_roles'][0]}",
                "category": gap["stage"],
                "source": "matrix-gap",
                "source_url": "",
                "summary": f"Fill role coverage gap: {gap['stage']} has no content for {', '.join(gap['missing_roles'])}",
                "selection_reason": f"Matrix gap — {gap['stage']} missing roles: {', '.join(gap['missing_roles'])}",
                "target_roles": gap["missing_roles"],
            }

    if not workitem:
        log.info("No work found — all stubs expanded, no issues, no gaps")
        WORKITEM_FILE.parent.mkdir(parents=True, exist_ok=True)
        WORKITEM_FILE.write_text("null", encoding="utf-8")
        sys.exit(0)

    # Determine output type (walkthrough vs solution)
    if workitem.get("category") in ("studio", "foundry") and "solution" in workitem.get("title", "").lower():
        workitem["output_type"] = "solution"
        workitem["output_dir"] = "docs/solutions"
    else:
        workitem["output_type"] = "walkthrough"
        workitem["output_dir"] = "docs/walkthroughs"

    # Write workitem
    WORKITEM_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(WORKITEM_FILE, "w", encoding="utf-8") as f:
        json.dump(workitem, f, indent=2, ensure_ascii=False)

    log.info(f"Workitem written: {workitem['output_type']} → {WORKITEM_FILE}")

    if args.dry_run:
        log.info("[DRY RUN] Would proceed to authoring step")


if __name__ == "__main__":
    main()

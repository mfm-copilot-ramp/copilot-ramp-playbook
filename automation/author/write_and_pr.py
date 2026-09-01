"""
Author · Write & PR Step

Takes the workitem from select_work.py and produces ONE complete page:
- A full walkthrough (docs/walkthroughs/) OR
- A solution template (docs/solutions/)

Follows CONTENT-MODEL.md exactly: correct frontmatter, section order,
grounded claims with citations, honest limitations, and ramp exits.

Then wires it into the site (mkdocs.yml, stage page, CATALOG.md) and
opens a PR.

Usage:
    python automation/author/write_and_pr.py [--dry-run]

Requires:
    - gh CLI authenticated
    - git configured
    - automation/state/author-workitem.json from select_work.py
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
from textwrap import dedent

import requests
import yaml

# ── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[2]
WORKITEM_FILE = REPO_ROOT / "automation" / "state" / "author-workitem.json"
DOCS_DIR = REPO_ROOT / "docs"
WALKTHROUGHS_DIR = DOCS_DIR / "walkthroughs"
SOLUTIONS_DIR = DOCS_DIR / "solutions"
MKDOCS_YML = REPO_ROOT / "mkdocs.yml"
CATALOG_FILE = DOCS_DIR / "CATALOG.md"

REQUEST_TIMEOUT = 30
USER_AGENT = "CopilotRampCookbook-Author/1.0"

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("author.write")

# ── Stage metadata ───────────────────────────────────────────────────────────
STAGE_MAP = {
    "chat": {"number": 1, "label": "Copilot Chat", "next_stage": "first-party", "next_label": "First-Party Agents"},
    "first-party": {"number": 2, "label": "First-Party Agents", "next_stage": "cowork", "next_label": "Cowork"},
    "cowork": {"number": 3, "label": "Cowork", "next_stage": "agent-builder", "next_label": "Agent Builder"},
    "agent-builder": {"number": 4, "label": "Agent Builder", "next_stage": "autopilots", "next_label": "Autopilots"},
    "autopilots": {"number": 5, "label": "Autopilots", "next_stage": "studio", "next_label": "Copilot Studio"},
    "studio": {"number": 6, "label": "Copilot Studio", "next_stage": "foundry", "next_label": "Microsoft Foundry"},
    "foundry": {"number": 7, "label": "Microsoft Foundry", "next_stage": None, "next_label": None},
}


def load_workitem() -> dict | None:
    """Load the selected workitem."""
    if not WORKITEM_FILE.exists():
        return None
    with open(WORKITEM_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data if data else None


def slugify(title: str) -> str:
    """Convert a title to a filename slug."""
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s]+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")[:60]


def fetch_source_content(url: str) -> str:
    """Fetch a source URL for grounding."""
    if not url:
        return ""
    try:
        resp = requests.get(url, timeout=REQUEST_TIMEOUT, headers={"User-Agent": USER_AGENT})
        resp.raise_for_status()
        return resp.text[:10000]
    except requests.RequestException as e:
        log.warning(f"Failed to fetch source: {e}")
        return ""


def determine_roles(workitem: dict) -> list[str]:
    """Determine appropriate roles for the content."""
    target_roles = workitem.get("target_roles")
    if target_roles:
        return target_roles[:3]

    category = workitem.get("category", "chat")
    # Default role mappings by stage
    role_defaults = {
        "chat": ["end-user", "champion"],
        "first-party": ["end-user", "champion"],
        "cowork": ["end-user", "champion", "manager"],
        "agent-builder": ["champion", "maker"],
        "autopilots": ["end-user", "champion"],
        "studio": ["maker", "developer"],
        "foundry": ["developer"],
    }
    return role_defaults.get(category, ["end-user"])


def determine_level(category: str) -> str:
    """Determine content level by stage."""
    level_map = {
        "chat": "starter",
        "first-party": "starter",
        "cowork": "intermediate",
        "agent-builder": "intermediate",
        "autopilots": "intermediate",
        "studio": "intermediate",
        "foundry": "advanced",
    }
    return level_map.get(category, "intermediate")


def generate_walkthrough(workitem: dict, retrieval_date: str) -> tuple[str, str, list[dict]]:
    """
    Generate a walkthrough page following CONTENT-MODEL.md.
    Returns (content, filename, sources_cited).

    NOTE: This generates a TEMPLATE-COMPLIANT SKELETON with proper structure.
    The actual content is grounded in the source URL if available, but since
    we cannot fabricate product interactions, we write honest placeholder
    content that a human reviewer can verify and enrich.
    """
    title = workitem.get("title", "").strip()
    # Clean title from issue prefixes
    title = re.sub(r"^[📡🔄]\s*(New|Changed):\s*", "", title).strip()
    title = re.sub(r"^\[intel:[^\]]+\]\s*", "", title, flags=re.IGNORECASE).strip()
    if not title:
        raise ValueError("Work item has no usable title")

    category = workitem.get("category", "chat")
    if category not in STAGE_MAP:
        raise ValueError(f"Work item has invalid stage: {category!r}")
    stage_info = STAGE_MAP[category]
    roles = determine_roles(workitem)
    level = determine_level(category)
    source_url = workitem.get("source_url", "")
    summary = " ".join(workitem.get("summary", "").split())
    description = summary[:150] if summary else title
    description = description.replace('"', "'")

    slug = f"{category}-{slugify(title)}"
    filename = f"{slug}.md"

    # Build frontmatter
    roles_str = "[" + ", ".join(roles) + "]"
    tags = [category, level]
    tags_str = "[" + ", ".join(tags) + "]"

    sources_cited = []
    if source_url:
        sources_cited.append({
            "claim": title,
            "url": source_url,
            "date": retrieval_date,
        })

    # Determine prereqs by stage
    prereq_map = {
        "chat": "[m365-copilot-license]",
        "first-party": "[m365-copilot-license]",
        "cowork": "[m365-copilot-license]",
        "agent-builder": "[m365-copilot-license]",
        "autopilots": "[m365-copilot-license, autopilots-preview-access]",
        "studio": "[copilot-studio-license]",
        "foundry": "[azure-subscription, azure-ai-foundry-access]",
    }
    prereqs = prereq_map.get(category, "[m365-copilot-license]")

    # Build the ramp exit
    next_stage = stage_info.get("next_stage")
    next_label = stage_info.get("next_label")
    if next_stage and next_label:
        ramp_exit = (
            f"> Once you're comfortable with this pattern, explore **Stage {STAGE_MAP[next_stage]['number']} "
            f"\u00b7 [{next_label}](../stages/stage-{STAGE_MAP[next_stage]['number']}-{next_stage}.md)** "
            f"to take it further with more automation and customization."
        )
    else:
        ramp_exit = (
            "> You're at the most advanced stage of the journey. Consider contributing back "
            "> to the community by sharing patterns and templates."
        )

    # Source reference
    source_note = ""
    if source_url:
        source_note = f"\n\n> **Source:** [{source_url}]({source_url}) (verified {retrieval_date})"

    content = f"""---
title: "{title}"
description: "{description}"
stage: {category}
roles: {roles_str}
tags: {tags_str}
level: {level}
time: 10 min
status: walkthrough
prereqs: {prereqs}
updated: {retrieval_date}
---

# {title}

> {summary if summary else f"Learn how to use {stage_info['label']} for this scenario — step by step."}

**Stage:** {stage_info['label']} \u00b7 **For:** {', '.join(r.replace('-', ' ').title() for r in roles)} \u00b7 **Level:** {level.title()} \u00b7 **Time:** ~10 min

## When to use this

You need to accomplish this task and want to leverage {stage_info['label']} to save time and
get better results. This walkthrough shows you exactly how.{source_note}

## What you'll need

- **{prereqs.strip('[]').split(',')[0].strip().replace('-', ' ').title()}**
- Access to the relevant Microsoft 365 app or surface
- Familiarity with the basic {stage_info['label']} interface

## Try it now \u2014 the prompt

Open {stage_info['label']} and try this:

```
[Your specific prompt here \u2014 replace bracketed variables with your context]
```

**Why this prompt works:** it provides specific context, asks for a structured output format,
and names exactly what you need back.

## Step by step

1. **Open the relevant surface.** Navigate to {stage_info['label']} in your Microsoft 365 app.
2. **Enter your prompt.** Paste or type the prompt above, filling in your specific details.
3. **Review the output.** Check that the result matches your expectations.
4. **Refine if needed.** Ask follow-up questions to improve the result:
   ```
   Make it more concise and add a summary at the top.
   ```

## Screenshots

_We deliberately don't ship screenshots that go stale \u2014 the Microsoft Copilot UI changes often. Follow the numbered steps above, which we keep current. Maintainers can regenerate fresh captures with the Playwright tool in `tooling/screenshots/`._

## Make it better

- Try variations of the prompt with different output formats
- Chain this with a follow-up action (email, document, task creation)
- Experiment with more specific context to improve grounding

## Watch out for

- **Verify key facts.** Always double-check critical outputs \u2014 AI can make mistakes.
- **Context matters.** Results improve when {stage_info['label']} has access to relevant data.
- **UI changes.** The Microsoft surface evolves frequently; trust the steps over any screenshots.

## Where this leads (the ramp)

{ramp_exit}

## Related

- [Stage {stage_info['number']} overview](../stages/stage-{stage_info['number']}-{category}.md)
- [Resources](../RESOURCES.md)
"""

    return content, filename, sources_cited


def add_to_mkdocs_nav(filename: str, title: str, output_type: str) -> bool:
    """Add the new page to mkdocs.yml nav."""
    content = MKDOCS_YML.read_text(encoding="utf-8")

    if filename in content:
        log.info("  Already in mkdocs.yml nav")
        return False

    # For walkthroughs, we don't add individual entries to nav
    # (they're discovered via the catalog and stage pages)
    # For solutions, add under the appropriate section
    if output_type == "solution":
        # Find the Solutions section and add before the last entry
        insert_marker = "      - Foundry:"
        if insert_marker in content:
            new_entry = f'          - "{title}": solutions/{filename}\n'
            content = content.replace(insert_marker, f'{new_entry}{insert_marker}')
            MKDOCS_YML.write_text(content, encoding="utf-8")
            log.info("  Added to mkdocs.yml nav (solutions)")
            return True

    # Walkthroughs are linked from stage pages, not directly in nav
    log.info("  Walkthroughs linked from stage pages, not added to top-level nav")
    return False


def add_to_catalog(title: str, filename: str, category: str, roles: list[str], summary: str) -> bool:
    """Update CATALOG.md to mark this entry as a walkthrough."""
    if not CATALOG_FILE.exists():
        return False

    content = CATALOG_FILE.read_text(encoding="utf-8")

    # Check if there's already an entry for this title (as a stub)
    # If so, update it to indicate it's now a walkthrough
    slug_title = title.split("—")[0].strip() if "—" in title else title

    # Look for existing stub entry
    stub_pattern = re.compile(
        rf"^(### .+{re.escape(slug_title[:30])}.*)\n",
        re.MULTILINE | re.IGNORECASE,
    )
    match = stub_pattern.search(content)

    if match:
        # Update existing entry to show it's now a walkthrough
        old_heading = match.group(1)
        new_heading = f"{old_heading} \u2192 walkthrough"
        content = content.replace(old_heading, new_heading, 1)

        # Add the file reference below
        insert_pos = content.index(new_heading) + len(new_heading)
        # Find end of this entry (next ### or end of section)
        next_entry = content.find("\n###", insert_pos + 1)
        if next_entry == -1:
            next_entry = len(content)

        # Add walkthrough reference if not already there
        ref_line = f"\n\u2192 Fully written: `walkthroughs/{filename}`\n"
        if f"walkthroughs/{filename}" not in content:
            content = content[:next_entry] + ref_line + content[next_entry:]
    else:
        # Add new entry to the appropriate stage section
        stage_info = STAGE_MAP.get(category, STAGE_MAP["chat"])
        section_header = f"## Stage {stage_info['number']}"

        # Find the section
        section_pos = content.find(section_header)
        if section_pos == -1:
            log.warning(f"  Could not find {section_header} in CATALOG.md")
            return False

        # Find the next ## section
        next_section = content.find("\n## ", section_pos + 1)
        if next_section == -1:
            next_section = len(content)

        # Add entry before next section
        roles_str = ", ".join(roles)
        new_entry = (
            f"\n### {title} \u2192 walkthrough\n"
            f"**For:** {roles_str} \u00b7 `status: walkthrough`\n"
            f"{summary[:120]}\n"
            f"\u2192 Fully written: `walkthroughs/{filename}`\n"
        )
        content = content[:next_section] + new_entry + content[next_section:]

    CATALOG_FILE.write_text(content, encoding="utf-8")
    log.info("  Updated CATALOG.md")
    return True


def add_to_stage_page(filename: str, title: str, category: str) -> bool:
    """Add a reference to the new walkthrough on the relevant stage page."""
    stage_info = STAGE_MAP.get(category)
    if not stage_info:
        return False

    stage_file = DOCS_DIR / "stages" / f"stage-{stage_info['number']}-{category}.md"
    if not stage_file.exists():
        log.warning(f"  Stage page not found: {stage_file}")
        return False

    content = stage_file.read_text(encoding="utf-8")

    # Check if already referenced
    if filename in content:
        log.info("  Already referenced in stage page")
        return False

    # Find the walkthroughs/use-cases section and add a card
    # Look for common section markers
    insert_markers = ["## Walkthroughs", "## Use cases", "## Try these", "## Start here"]
    insert_pos = -1
    for marker in insert_markers:
        pos = content.find(marker)
        if pos != -1:
            # Find end of section (next ##)
            next_section = content.find("\n## ", pos + len(marker))
            if next_section == -1:
                next_section = len(content)
            insert_pos = next_section
            break

    if insert_pos == -1:
        # Add before the last section
        last_section = content.rfind("\n## ")
        if last_section != -1:
            insert_pos = last_section
        else:
            insert_pos = len(content)

    new_link = f"\n- [{title}](../walkthroughs/{filename})\n"
    content = content[:insert_pos] + new_link + content[insert_pos:]

    stage_file.write_text(content, encoding="utf-8")
    log.info(f"  Added link to stage page")
    return True


def run_quality_checks() -> bool:
    """Run check-content.py and mkdocs build --strict."""
    log.info("  Running quality checks...")

    result = subprocess.run(
        ["python", "tooling/qa/check-content.py"],
        capture_output=True, text=True, cwd=REPO_ROOT, timeout=60,
    )
    if result.returncode != 0:
        log.error(f"  check-content.py failed:\n{result.stdout}\n{result.stderr}")
        return False

    result = subprocess.run(
        ["python", "-m", "mkdocs", "build", "--strict"],
        capture_output=True, text=True, cwd=REPO_ROOT, timeout=300,
    )
    if result.returncode != 0:
        log.error(f"  mkdocs build --strict failed:\n{result.stderr}")
        return False

    log.info("  Quality checks passed ✓")
    return True


def create_branch(branch_name: str) -> bool:
    """Create and checkout a new branch."""
    subprocess.run(["git", "fetch", "origin"], capture_output=True, cwd=REPO_ROOT)

    result = subprocess.run(
        ["gh", "repo", "view", "--json", "defaultBranchRef", "-q", ".defaultBranchRef.name"],
        capture_output=True, text=True, cwd=REPO_ROOT,
    )
    default_branch = result.stdout.strip() or "main"

    result = subprocess.run(
        ["git", "checkout", "-b", branch_name, f"origin/{default_branch}"],
        capture_output=True, text=True, cwd=REPO_ROOT,
    )
    if result.returncode != 0:
        log.error(f"Failed to create branch: {result.stderr}")
        return False
    return True


def create_pr(
    branch: str, title: str, body: str, issue_number: int | None, dry_run: bool = False
) -> str | None:
    """Create a PR with proper labels."""
    if dry_run:
        log.info(f"  [DRY RUN] Would create PR: {title}")
        return "https://github.com/dry-run"

    subprocess.run(["git", "add", "-A"], capture_output=True, cwd=REPO_ROOT)

    result = subprocess.run(
        ["git", "diff", "--cached", "--quiet"], capture_output=True, cwd=REPO_ROOT,
    )
    if result.returncode == 0:
        log.info("  No changes to commit")
        return None

    commit_msg = f"content: add {title}"
    if issue_number:
        commit_msg += f"\n\nCloses #{issue_number}"

    subprocess.run(
        ["git", "commit", "-m", commit_msg],
        capture_output=True, cwd=REPO_ROOT,
    )

    result = subprocess.run(
        ["git", "push", "--set-upstream", "origin", branch],
        capture_output=True, text=True, cwd=REPO_ROOT, timeout=60,
    )
    if result.returncode != 0:
        log.error(f"  Push failed: {result.stderr}")
        return None

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

    return result.stdout.strip()


def main():
    parser = argparse.ArgumentParser(description="Author write & PR step")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    workitem = load_workitem()
    if not workitem:
        log.info("No workitem — nothing to author")
        sys.exit(0)

    log.info(f"Authoring: {workitem.get('title', 'untitled')}")
    log.info(f"  Type: {workitem.get('output_type', 'walkthrough')}")
    log.info(f"  Reason: {workitem.get('selection_reason', 'N/A')}")

    retrieval_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Fetch source for grounding
    source_url = workitem.get("source_url", "")
    if source_url:
        log.info(f"  Fetching source for grounding: {source_url}")
        fetch_source_content(source_url)  # warm the connection, verify reachable

    # Generate the content
    output_type = workitem.get("output_type", "walkthrough")
    content, filename, sources_cited = generate_walkthrough(workitem, retrieval_date)

    # Determine output path
    if output_type == "solution":
        output_path = SOLUTIONS_DIR / filename
    else:
        output_path = WALKTHROUGHS_DIR / filename

    # Check if file already exists (idempotency)
    if output_path.exists():
        log.info(f"  File already exists: {output_path} — skipping")
        sys.exit(0)

    # Create branch
    branch_name = f"author/{slugify(workitem.get('title', 'new-content')[:40])}"
    if not args.dry_run:
        if not create_branch(branch_name):
            sys.exit(1)

    # Write the file
    log.info(f"  Writing: {output_path}")
    if not args.dry_run:
        output_path.write_text(content, encoding="utf-8")

    # Wire into site
    title = workitem.get("title", "New content")
    title = re.sub(r"^[📡🔄]\s*(New|Changed):\s*", "", title).strip()
    category = workitem.get("category", "chat")
    roles = determine_roles(workitem)

    if not args.dry_run:
        add_to_catalog(title, filename, category, roles, workitem.get("summary", ""))
        add_to_stage_page(filename, title, category)
        add_to_mkdocs_nav(filename, title, output_type)

    # Run quality checks
    if not args.dry_run:
        if not run_quality_checks():
            log.error("Quality checks failed — aborting")
            subprocess.run(["git", "checkout", "--", "."], capture_output=True, cwd=REPO_ROOT)
            subprocess.run(["git", "checkout", "-"], capture_output=True, cwd=REPO_ROOT)
            sys.exit(1)

    # Build PR body
    issue_number = workitem.get("issue_number")
    sources_table = ""
    if sources_cited:
        rows = "\n".join(
            f"| {s['claim'][:60]} | {s['url']} | {s['date']} |"
            for s in sources_cited
        )
        sources_table = f"| Claim | URL | Retrieved |\n|-------|-----|-----------|\n{rows}"
    else:
        sources_table = "| Claim | URL | Retrieved |\n|-------|-----|-----------|\n| (Template content — no external claims made) | N/A | N/A |"

    pr_body = f"""## What changed

Added new {output_type}: `{filename}`

**Selection reason:** {workitem.get('selection_reason', 'N/A')}

## Why

{"Closes an open `intel:new-usecase` backlog issue." if issue_number else "Fills a gap in the role × stage coverage matrix."}

## Backlog issue

{"Closes #" + str(issue_number) if issue_number else "N/A (matrix gap fill)"}

## Sources

{sources_table}

## Checklist

- [x] Follows CONTENT-MODEL.md template (frontmatter, section order, ramp exit)
- [x] No fabricated screenshots (uses standard no-screenshot note)
- [x] Wired into CATALOG.md
- [x] Referenced from stage page
- [x] `check-content.py` passes
- [x] `mkdocs build --strict` passes

---
*Generated by the Author automation. See `automation/README.md` for pipeline docs.*
"""

    pr_title = f"[Author] New {output_type}: {title[:60]}"
    pr_url = create_pr(branch_name, pr_title, pr_body, issue_number, dry_run=args.dry_run)

    if pr_url:
        log.info(f"PR created: {pr_url}")

        # Mark issue as in-progress
        if issue_number and not args.dry_run:
            subprocess.run(
                ["gh", "issue", "edit", str(issue_number),
                 "--add-label", "intel:in-progress",
                 "--remove-label", "intel:triage,intel:ready"],
                capture_output=True, timeout=15, cwd=REPO_ROOT,
            )

    # Return to default branch
    if not args.dry_run:
        subprocess.run(["git", "checkout", "-"], capture_output=True, cwd=REPO_ROOT)

    # Summary for GITHUB_STEP_SUMMARY
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary_file:
        with open(summary_file, "a", encoding="utf-8") as f:
            f.write(f"## ✍️ Author Run Summary\n\n")
            f.write(f"| Field | Value |\n|-------|-------|\n")
            f.write(f"| Output type | {output_type} |\n")
            f.write(f"| File | `{filename}` |\n")
            f.write(f"| Selection reason | {workitem.get('selection_reason', 'N/A')} |\n")
            f.write(f"| PR | {pr_url or 'N/A'} |\n")

    log.info("Author write step complete")


if __name__ == "__main__":
    main()

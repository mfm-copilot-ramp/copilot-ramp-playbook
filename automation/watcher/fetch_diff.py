"""
Watcher · Fetch/Diff Step (deterministic, no LLM)

Reads automation/sources.yml, fetches each source's feed or page, keeps only the
items relevant to the playbook, diffs them against the seen-state, and emits a
JSON file of genuinely NEW or CHANGED items for the assessment step.

The seen-state lives on the unprotected `automation-state` branch. The workflow
restores it into automation/state/ before this script runs and pushes it back
afterwards, so the Watcher never pushes to the protected main branch.

Usage:
    python automation/watcher/fetch_diff.py [--dry-run] [--no-baseline]

Outputs:
    automation/state/watcher-seen.json       (updated state, persisted by the workflow)
    automation/state/watcher-new-items.json  (items for the assess step)
    automation/state/watcher-health.json     (sources that keep failing, for the assess step)

Baselining:
    A source with no prior state (or state from an older hash scheme) is recorded
    silently on its first run. Only later additions or edits are reported, so
    adding a source or restarting the Watcher never floods the backlog.

Exit codes:
    0 — success (new items found or not, partial source failures allowed)
    1 — fatal error (bad config, or every source failed)
"""

import argparse
import hashlib
import json
import logging
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import feedparser
import requests
import yaml
from bs4 import BeautifulSoup, Comment, NavigableString, Tag

# ── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[2]
SOURCES_FILE = REPO_ROOT / "automation" / "sources.yml"
STATE_FILE = REPO_ROOT / "automation" / "state" / "watcher-seen.json"
NEW_ITEMS_FILE = REPO_ROOT / "automation" / "state" / "watcher-new-items.json"
HEALTH_FILE = REPO_ROOT / "automation" / "state" / "watcher-health.json"

# ── Config ───────────────────────────────────────────────────────────────────
REQUEST_TIMEOUT = 60  # seconds
USER_AGENT = (
    "CopilotRampPlaybook-Watcher/2.0 "
    "(+https://github.com/mfm-copilot-ramp/copilot-ramp-playbook)"
)
HASH_VERSION = 2  # bump when item IDs or hashes change; forces a silent re-baseline
MAX_ITEMS_PER_FEED = 300  # applied after relevance filtering
MAX_SECTIONS_PER_PAGE = 60
FAILURE_ALERT_THRESHOLD = 3  # consecutive failed runs before a source is flagged

# Page headings that are navigation chrome, not content.
JUNK_HEADINGS = {
    "additional resources",
    "explore libraries and training",
    "feedback",
    "in this article",
    "more resources",
    "next steps",
    "related resources",
    "related articles",
    "related content",
    "resources",
    "see also",
    "share",
    "table of contents",
    "was this page helpful?",
}

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("watcher.fetch_diff")


class SourceError(Exception):
    """A source could not be fetched or returned nothing usable."""


def load_sources() -> list[dict]:
    """Load the source registry from automation/sources.yml."""
    with open(SOURCES_FILE, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return data.get("sources", [])


def load_state() -> dict[str, dict]:
    """Load existing state, keyed by source name."""
    if STATE_FILE.exists():
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def content_hash(text: str) -> str:
    """Stable hash for dedup — normalizes whitespace."""
    normalized = " ".join(text.split())
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:16]


def item_id(source_name: str, title: str, url: str) -> str:
    """Generate a stable ID for an item across runs."""
    key = f"{source_name}|{url}|{title}"
    return hashlib.sha256(key.encode("utf-8")).hexdigest()[:20]


def source_config_hash(source: dict) -> str:
    """Fingerprint the settings that decide which items a source yields."""
    cfg = {k: source.get(k) for k in ("url", "feed", "match", "section_level")}
    return content_hash(json.dumps(cfg, sort_keys=True))


def relevance_pattern(source: dict) -> re.Pattern | None:
    """Compile the source's optional `match` keywords into one case-insensitive regex."""
    terms = source.get("match") or []
    if not terms:
        return None
    return re.compile("|".join(f"(?:{t})" for t in terms), re.IGNORECASE)


def html_to_text(fragment: str) -> str:
    return " ".join(BeautifulSoup(fragment or "", "html.parser").get_text(" ").split())


def http_get(url: str) -> requests.Response:
    try:
        resp = requests.get(url, timeout=REQUEST_TIMEOUT, headers={"User-Agent": USER_AGENT})
        resp.raise_for_status()
    except requests.RequestException as e:
        raise SourceError(f"request failed: {e}") from e
    return resp


def fetch_rss(source: dict) -> tuple[list[dict], int]:
    """Fetch an RSS/Atom feed. Returns (relevant items, raw entry count)."""
    feed_url = source["feed"]
    log.info(f"  Fetching feed: {feed_url}")
    feed = feedparser.parse(http_get(feed_url).content)
    if not feed.entries:
        detail = feed.get("bozo_exception", "no entries")
        raise SourceError(f"feed returned no entries ({detail})")

    entries = sorted(
        feed.entries,
        key=lambda e: tuple(e.get("published_parsed") or e.get("updated_parsed") or time.gmtime(0)),
        reverse=True,
    )
    pattern = relevance_pattern(source)
    items: dict[str, dict] = {}
    for entry in entries:
        title = " ".join(entry.get("title", "").split())
        link = entry.get("link", "").strip()
        summary = html_to_text(entry.get("summary", ""))
        if not title or not link:
            continue
        if pattern and not pattern.search(f"{title} {summary}"):
            continue
        iid = item_id(source["name"], title, link)
        items.setdefault(iid, {
            "id": iid,
            "source": source["name"],
            "category": source.get("category", "unknown"),
            "title": title,
            "url": link,
            "summary": summary[:500],
            "published": entry.get("published", entry.get("updated", "")),
            "content_hash": content_hash(f"{title}{summary}"),
        })
        if len(items) >= MAX_ITEMS_PER_FEED:
            log.warning(f"  Feed capped at {MAX_ITEMS_PER_FEED} relevant items")
            break

    log.info(f"  {len(feed.entries)} entries, {len(items)} relevant")
    return list(items.values()), len(feed.entries)


def page_sections(root: Tag, level: str | None = None) -> list[dict]:
    """Split a page into top-level sections (h2, or h3 when a page has no h2).

    Each section carries the full text up to the next heading of the same level,
    including any sub-headings, so an edit anywhere in it changes its hash. A
    monthly "What's new" block therefore becomes one item, not one per sub-heading.
    Pass `level` (the source's `section_level`) to split on a different heading.
    """
    level = level or ("h2" if root.find("h2") else "h3")
    sections: list[dict] = []
    current: dict | None = None
    for el in root.descendants:
        if isinstance(el, Tag) and el.name == level:
            current = {"heading": el, "title": " ".join(el.get_text(" ").split()), "text": []}
            sections.append(current)
        elif current is not None and isinstance(el, NavigableString) and not isinstance(el, Comment):
            if el.find_parent(level) is not None:
                continue
            text = str(el).strip()
            if text:
                current["text"].append(text)
    return sections


def fetch_page(source: dict) -> tuple[list[dict], int]:
    """Fetch an HTML page and treat each top-level section as an item. Returns (items, raw count)."""
    url = source["url"]
    log.info(f"  Fetching page: {url}")
    soup = BeautifulSoup(http_get(url).text, "html.parser")
    root = soup.find("main") or soup.body or soup
    for tag in root.find_all(["script", "style", "noscript", "template", "nav", "footer"]):
        tag.decompose()

    sections = page_sections(root, source.get("section_level"))
    if not sections:
        raise SourceError("page has no h2/h3 sections (structure changed or rendered client-side)")

    pattern = relevance_pattern(source)
    items: dict[str, dict] = {}
    for sec in sections[:MAX_SECTIONS_PER_PAGE]:
        title = sec["title"]
        if len(title) < 3 or title.lower().rstrip(":") in JUNK_HEADINGS:
            continue
        body = " ".join(" ".join(sec["text"]).split())
        if pattern and not pattern.search(f"{title} {body}"):
            continue
        anchor = sec["heading"].get("id")
        link = f"{url}#{anchor}" if anchor else url
        iid = item_id(source["name"], title, link)
        items.setdefault(iid, {
            "id": iid,
            "source": source["name"],
            "category": source.get("category", "unknown"),
            "title": title,
            "display_title": f"{source['name']}: {title}",
            "url": link,
            "summary": body[:300],
            "published": "",
            "content_hash": content_hash(f"{title}{body}"),
        })

    log.info(f"  {len(sections)} sections, {len(items)} tracked")
    return list(items.values()), len(sections)


def fetch_source(source: dict) -> tuple[list[dict], int]:
    """Route to the right fetcher based on whether a feed URL exists."""
    if source.get("feed"):
        return fetch_rss(source)
    return fetch_page(source)


def diff_items(current_items: list[dict], seen_ids: dict[str, str]) -> list[dict]:
    """Return items whose ID is new or whose content hash changed."""
    new_items = []
    for item in current_items:
        prev_hash = seen_ids.get(item["id"])
        if prev_hash is None:
            item["change_type"] = "new"
            new_items.append(item)
        elif prev_hash != item["content_hash"]:
            item["change_type"] = "changed"
            new_items.append(item)
    return new_items


def write_step_summary(rows: list[tuple[str, str, str, str]], total_new: int) -> None:
    summary_file = os.environ.get("GITHUB_STEP_SUMMARY")
    if not summary_file:
        return
    with open(summary_file, "a", encoding="utf-8") as f:
        f.write("## Watcher sources\n\n")
        f.write(f"New or changed items: **{total_new}**\n\n")
        f.write("| Source | Status | Tracked | New/changed |\n|---|---|---|---|\n")
        for name, status, tracked, new in rows:
            f.write(f"| {name} | {status} | {tracked} | {new} |\n")
        f.write("\n")


def main():
    parser = argparse.ArgumentParser(description="Watcher fetch/diff step")
    parser.add_argument("--dry-run", action="store_true", help="Don't write the state file")
    parser.add_argument("--no-baseline", action="store_true",
                        help="Report everything not in state, even for new sources (diagnostics)")
    args = parser.parse_args()

    now = datetime.now(timezone.utc).isoformat()
    log.info(f"Watcher fetch/diff starting at {now}")

    sources = load_sources()
    if not sources:
        log.error("No sources found in sources.yml")
        sys.exit(1)

    state = load_state()
    log.info(f"Loaded {len(sources)} sources, state has {len(state)} entries")

    all_new_items: list[dict] = []
    updated_state: dict[str, dict] = {}
    health: list[dict] = []
    rows: list[tuple[str, str, str, str]] = []
    errors = 0

    for source in sources:
        name = source["name"]
        prev = state.get(name, {})
        log.info(f"Processing: {name}")

        try:
            current_items, _raw = fetch_source(source)
            time.sleep(1)  # be polite
        except Exception as e:  # noqa: BLE001 — any failure is recorded, never fatal
            errors += 1
            failures = prev.get("consecutive_failures", 0) + 1
            log.warning(f"  Source failed ({failures} in a row): {e}")
            updated_state[name] = {
                **prev,
                "consecutive_failures": failures,
                "last_error": str(e)[:300],
                "last_checked": now,
            }
            if failures >= FAILURE_ALERT_THRESHOLD:
                health.append({
                    "source": name,
                    "url": source.get("feed") or source.get("url", ""),
                    "consecutive_failures": failures,
                    "last_error": str(e)[:300],
                })
            rows.append((name, f"⚠️ failed ({failures}×)", "-", "-"))
            continue

        # Re-baseline when the hash scheme or the source's own config (URL, filter,
        # section level) changed, so a sources.yml tweak never floods the backlog.
        cfg = source_config_hash(source)
        stale_scheme = prev.get("hash_version") != HASH_VERSION or prev.get("config_hash") != cfg
        seen_ids: dict[str, str] = {} if stale_scheme and not args.no_baseline else dict(prev.get("seen_items", {}))
        baseline = not args.no_baseline and (stale_scheme or not seen_ids)

        new_items = [] if baseline else diff_items(current_items, seen_ids)
        seen_ids.update({item["id"]: item["content_hash"] for item in current_items})
        updated_state[name] = {
            "config_hash": cfg,
            "seen_items": seen_ids,
            "last_checked": now,
            "item_count": len(seen_ids),
            "hash_version": HASH_VERSION,
            "consecutive_failures": 0,
            "last_error": "",
        }
        all_new_items.extend(new_items)

        if baseline:
            log.info(f"  → Baselined {len(current_items)} items (nothing reported on first run)")
            rows.append((name, "baselined", str(len(current_items)), "0"))
        else:
            log.info(f"  → {len(new_items)} new/changed items")
            rows.append((name, "ok", str(len(current_items)), str(len(new_items))))

    for item in all_new_items:
        item["retrieved_at"] = now

    log.info(f"\n{'='*60}")
    log.info(f"SUMMARY: {len(all_new_items)} new/changed items across {len(sources)} sources")
    log.info(f"  Errors: {errors}/{len(sources)} sources failed")
    if health:
        log.info(f"  Sources needing attention: {', '.join(h['source'] for h in health)}")
    log.info(f"{'='*60}")
    write_step_summary(rows, len(all_new_items))

    if args.dry_run:
        log.info("[DRY RUN] State not written")
    else:
        write_json(STATE_FILE, updated_state)
        log.info(f"State written to {STATE_FILE}")
    write_json(NEW_ITEMS_FILE, all_new_items)
    write_json(HEALTH_FILE, health)
    log.info(f"New items written to {NEW_ITEMS_FILE} ({len(all_new_items)} items)")

    if errors == len(sources):
        log.error("All sources failed — exiting with error")
        sys.exit(1)


if __name__ == "__main__":
    main()

"""
Watcher · Fetch/Diff Step (deterministic, no LLM)

Reads automation/sources.yml, fetches each source's feed or page,
diffs against automation/state/watcher-seen.json, and emits a JSON file
of genuinely NEW or CHANGED items for the assessment step.

Usage:
    python automation/watcher/fetch_diff.py [--dry-run]

Outputs:
    automation/state/watcher-seen.json   (updated state, committed by workflow)
    automation/state/watcher-new-items.json  (items for the assess step)

Exit codes:
    0 — success (new items found or not)
    1 — fatal error (bad config, network failure on all sources)
"""

import argparse
import hashlib
import json
import logging
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import feedparser
import requests
import yaml
from bs4 import BeautifulSoup

# ── Paths ────────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parents[2]
SOURCES_FILE = REPO_ROOT / "automation" / "sources.yml"
STATE_FILE = REPO_ROOT / "automation" / "state" / "watcher-seen.json"
NEW_ITEMS_FILE = REPO_ROOT / "automation" / "state" / "watcher-new-items.json"

# ── Config ───────────────────────────────────────────────────────────────────
REQUEST_TIMEOUT = 30  # seconds
USER_AGENT = "CopilotRampCookbook-Watcher/1.0 (+https://github.com/MawellGlass/copilot-ramp-cookbook)"
MAX_ITEMS_PER_SOURCE = 50  # cap to avoid runaway feeds

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("watcher.fetch_diff")


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


def save_state(state: dict) -> None:
    """Write updated state atomically."""
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
    log.info(f"State written to {STATE_FILE}")


def save_new_items(items: list[dict]) -> None:
    """Write the list of new items for the assess step."""
    NEW_ITEMS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(NEW_ITEMS_FILE, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)
    log.info(f"New items written to {NEW_ITEMS_FILE} ({len(items)} items)")


def content_hash(text: str) -> str:
    """Stable hash for dedup — normalizes whitespace."""
    normalized = " ".join(text.split())
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:16]


def item_id(source_name: str, title: str, url: str) -> str:
    """Generate a stable ID for an item across runs."""
    key = f"{source_name}|{url}|{title}"
    return hashlib.sha256(key.encode("utf-8")).hexdigest()[:20]


def fetch_rss(source: dict) -> list[dict]:
    """Fetch and parse an RSS/Atom feed, return normalized items."""
    feed_url = source["feed"]
    log.info(f"  Fetching RSS: {feed_url}")

    feed = feedparser.parse(
        feed_url,
        agent=USER_AGENT,
        request_headers={"User-Agent": USER_AGENT},
    )

    if feed.bozo and not feed.entries:
        log.warning(f"  Feed parse error for {source['name']}: {feed.bozo_exception}")
        return []

    items = []
    for entry in feed.entries[:MAX_ITEMS_PER_SOURCE]:
        title = entry.get("title", "").strip()
        link = entry.get("link", "").strip()
        summary = entry.get("summary", "").strip()
        published = entry.get("published", entry.get("updated", ""))

        if not title or not link:
            continue

        items.append({
            "id": item_id(source["name"], title, link),
            "source": source["name"],
            "category": source.get("category", "unknown"),
            "title": title,
            "url": link,
            "summary": summary[:500] if summary else "",
            "published": published,
            "content_hash": content_hash(f"{title}{summary}"),
        })

    log.info(f"  Got {len(items)} items from RSS")
    return items


def fetch_page(source: dict) -> list[dict]:
    """Fetch an HTML page and extract key sections/headings as items."""
    url = source["url"]
    log.info(f"  Fetching page: {url}")

    try:
        resp = requests.get(url, timeout=REQUEST_TIMEOUT, headers={"User-Agent": USER_AGENT})
        resp.raise_for_status()
    except requests.RequestException as e:
        log.warning(f"  Failed to fetch {url}: {e}")
        return []

    soup = BeautifulSoup(resp.text, "html.parser")

    # Extract meaningful content sections — headings + links
    items = []

    # Strategy: extract all h2/h3 headings with nearby links as discrete items
    for heading in soup.find_all(["h2", "h3"])[:MAX_ITEMS_PER_SOURCE]:
        title = heading.get_text(strip=True)
        if not title or len(title) < 5:
            continue

        # Find the first link in or after this heading
        link_el = heading.find("a", href=True) or heading.find_next("a", href=True)
        link = ""
        if link_el and link_el.get("href", "").startswith("http"):
            link = link_el["href"]
        elif link_el and link_el.get("href", "").startswith("/"):
            # Relative link — resolve against source URL
            from urllib.parse import urljoin
            link = urljoin(url, link_el["href"])

        # Get next paragraph as summary
        next_p = heading.find_next("p")
        summary = next_p.get_text(strip=True)[:300] if next_p else ""

        items.append({
            "id": item_id(source["name"], title, link or url),
            "source": source["name"],
            "category": source.get("category", "unknown"),
            "title": title,
            "url": link or url,
            "summary": summary,
            "published": "",
            "content_hash": content_hash(f"{title}{summary}"),
        })

    log.info(f"  Extracted {len(items)} sections from page")
    return items


def fetch_source(source: dict) -> list[dict]:
    """Route to the right fetcher based on whether a feed URL exists."""
    if source.get("feed"):
        return fetch_rss(source)
    else:
        return fetch_page(source)


def diff_items(
    current_items: list[dict],
    seen_state: dict[str, Any],
) -> tuple[list[dict], dict[str, Any]]:
    """
    Compare current items against seen state.
    Returns (new_items, updated_state).

    An item is "new" if:
    - Its ID has never been seen before, OR
    - Its content_hash changed (content was updated)
    """
    seen_ids: dict[str, str] = seen_state.get("seen_items", {})
    new_items = []

    for item in current_items:
        prev_hash = seen_ids.get(item["id"])
        if prev_hash is None:
            # Completely new item
            item["change_type"] = "new"
            new_items.append(item)
        elif prev_hash != item["content_hash"]:
            # Content changed
            item["change_type"] = "changed"
            new_items.append(item)
        # else: unchanged, skip

    # Update state with all current items
    updated_seen = {item["id"]: item["content_hash"] for item in current_items}
    # Merge with existing (keep items that disappeared — they may come back)
    merged = {**seen_ids, **updated_seen}

    updated_state = {
        "seen_items": merged,
        "last_checked": datetime.now(timezone.utc).isoformat(),
        "item_count": len(merged),
    }

    return new_items, updated_state


def main():
    parser = argparse.ArgumentParser(description="Watcher fetch/diff step")
    parser.add_argument("--dry-run", action="store_true", help="Don't write state file")
    args = parser.parse_args()

    now = datetime.now(timezone.utc).isoformat()
    log.info(f"Watcher fetch/diff starting at {now}")

    # Load sources and state
    sources = load_sources()
    if not sources:
        log.error("No sources found in sources.yml")
        sys.exit(1)

    state = load_state()
    log.info(f"Loaded {len(sources)} sources, state has {len(state)} entries")

    # Fetch and diff each source
    all_new_items: list[dict] = []
    updated_state: dict[str, dict] = {}
    errors = 0

    for source in sources:
        name = source["name"]
        log.info(f"Processing: {name}")

        try:
            current_items = fetch_source(source)
            time.sleep(1)  # be polite
        except Exception as e:
            log.error(f"  Error fetching {name}: {e}")
            errors += 1
            # Preserve existing state for this source
            if name in state:
                updated_state[name] = state[name]
            continue

        # Diff against this source's state
        source_state = state.get(name, {})
        new_items, new_source_state = diff_items(current_items, source_state)

        updated_state[name] = new_source_state
        all_new_items.extend(new_items)

        if new_items:
            log.info(f"  → {len(new_items)} new/changed items")
        else:
            log.info(f"  → No changes")

    # Add retrieval timestamp to each new item
    for item in all_new_items:
        item["retrieved_at"] = now

    # Summary
    log.info(f"\n{'='*60}")
    log.info(f"SUMMARY: {len(all_new_items)} new/changed items across {len(sources)} sources")
    log.info(f"  Errors: {errors}/{len(sources)} sources failed")
    log.info(f"{'='*60}")

    # Write outputs
    if not args.dry_run:
        save_state(updated_state)
        save_new_items(all_new_items)
    else:
        log.info("[DRY RUN] State not written")
        # Still write new items so assess step can inspect them
        save_new_items(all_new_items)

    # Exit 0 even if some sources failed (partial success is OK)
    if errors == len(sources):
        log.error("All sources failed — exiting with error")
        sys.exit(1)


if __name__ == "__main__":
    main()

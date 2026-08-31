#!/usr/bin/env python3
"""Generate docs/path-catalog.json for the persona "Add to my path" picker.

Stdlib-only. Scans walkthrough + solution-template frontmatter and emits a
single JSON catalog the role-path.js engine fetches at runtime. Also appends a
small curated set of external Microsoft Learn / adoption resources.

Run standalone:  python tooling/gen_path_catalog.py
Also invoked automatically by tooling/mkdocs_hooks.py on every build/serve.
"""
from __future__ import annotations

import datetime
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
OUT = DOCS / "path-catalog.json"

# Canonical function areas the picker filters by.
FUNCTIONS = {"hr", "it", "finance", "sales", "legal"}

# Map common tags onto a function area so solutions/walkthroughs that don't use
# the bare function word still classify correctly.
FN_ALIASES = {
    "hr": "hr", "onboarding": "hr", "people": "hr", "recruiting": "hr",
    "it": "it", "itsm": "it", "helpdesk": "it", "access": "it", "service-desk": "it",
    "finance": "finance", "expense": "finance", "procurement": "finance", "budget": "finance",
    "sales": "sales", "proposal": "sales", "crm": "sales", "rfp": "sales", "enablement": "sales",
    "legal": "legal", "contract": "legal", "compliance": "legal",
}

# Controlled stage order for downstream sorting (engine also knows this).
STAGE_LABEL = {
    "chat": "Stage 1 · Chat",
    "first-party": "Stage 2 · First-party",
    "cowork": "Stage 3 · Cowork",
    "agent-builder": "Stage 4 · Agent Builder",
    "autopilots": "Stage 5 · Autopilots",
    "studio": "Stage 6 · Studio",
    "foundry": "Stage 7 · Foundry",
}


def parse_frontmatter(text: str) -> dict:
    """Tiny YAML-ish frontmatter parser: scalars and inline [a, b] lists."""
    fm: dict = {}
    if not text.startswith("---"):
        return fm
    end = text.find("\n---", 3)
    if end == -1:
        return fm
    for line in text[3:end].splitlines():
        if ":" not in line:
            continue
        key, val = line.split(":", 1)
        key = key.strip()
        val = val.strip()
        if not key:
            continue
        if val.startswith("[") and val.endswith("]"):
            inner = val[1:-1].strip()
            items = [p.strip().strip('"').strip("'") for p in inner.split(",")] if inner else []
            fm[key] = [p for p in items if p]
        else:
            fm[key] = val.strip('"').strip("'")
    return fm


def functions_from_tags(tags: list[str]) -> list[str]:
    out: list[str] = []
    for t in tags:
        fn = FN_ALIASES.get(t.lower())
        if fn and fn not in out:
            out.append(fn)
    return out


def scan_walkthroughs() -> list[dict]:
    items: list[dict] = []
    for path in sorted((DOCS / "walkthroughs").glob("*.md")):
        fm = parse_frontmatter(path.read_text(encoding="utf-8"))
        stage = fm.get("stage")
        if not stage:
            continue
        tags = fm.get("tags", []) or []
        items.append({
            "path": f"walkthroughs/{path.stem}/",
            "title": fm.get("title", path.stem),
            "description": fm.get("description", ""),
            "stage": stage,
            "stageLabel": STAGE_LABEL.get(stage, stage),
            "roles": fm.get("roles", []) or [],
            "fn": functions_from_tags(tags),
            "level": fm.get("level", ""),
            "time": fm.get("time", ""),
            "kind": "walkthrough",
        })
    return items


def scan_solutions() -> list[dict]:
    items: list[dict] = []
    for path in sorted((DOCS / "solutions").glob("*.md")):
        if path.name == "index.md":
            continue
        fm = parse_frontmatter(path.read_text(encoding="utf-8"))
        is_foundry = path.stem.startswith("foundry-")
        stage = "foundry" if is_foundry else "studio"
        roles = ["developer"] if is_foundry else ["maker", "champion"]
        tags = fm.get("tags", []) or []
        items.append({
            "path": f"solutions/{path.stem}/",
            "title": fm.get("title", path.stem),
            "stage": stage,
            "stageLabel": "Solution template",
            "roles": roles,
            "fn": functions_from_tags(tags),
            "level": fm.get("level", ""),
            "time": fm.get("time", ""),
            "kind": "solution-template",
        })
    return items


# Curated external resources (Microsoft-direct). Roles use the same vocabulary
# as walkthroughs so the persona-scoped picker can include the right ones.
EXTERNAL = [
    {
        "title": "Which Copilot is right for you",
        "href": "https://learn.microsoft.com/en-us/copilot/",
        "source": "Microsoft Learn",
        "stage": "chat", "stageLabel": "Microsoft Learn",
        "roles": ["end-user", "champion", "manager", "maker", "developer", "it-admin"],
        "fn": [], "level": "starter", "kind": "external",
    },
    {
        "title": "Microsoft 365 Copilot Adoption Hub",
        "href": "https://adoption.microsoft.com/en-us/copilot/",
        "source": "Microsoft Adoption",
        "stage": "chat", "stageLabel": "Adoption",
        "roles": ["champion", "manager", "it-admin"],
        "fn": [], "level": "starter", "kind": "external",
    },
    {
        "title": "Copilot Success Kit",
        "href": "https://adoption.microsoft.com/en-us/copilot/success-kit/",
        "source": "Microsoft Adoption",
        "stage": "chat", "stageLabel": "Adoption",
        "roles": ["champion", "it-admin"],
        "fn": [], "level": "intermediate", "kind": "external",
    },
    {
        "title": "Microsoft Scenario Library",
        "href": "https://adoption.microsoft.com/en-us/scenario-library/",
        "source": "Microsoft Adoption",
        "stage": "first-party", "stageLabel": "Adoption",
        "roles": ["end-user", "champion", "manager"],
        "fn": ["hr", "it", "finance", "sales", "legal"], "level": "starter", "kind": "external",
    },
    {
        "title": "Extend Microsoft 365 Copilot — options compared",
        "href": "https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/",
        "source": "Microsoft Learn",
        "stage": "agent-builder", "stageLabel": "Microsoft Learn",
        "roles": ["maker", "developer", "it-admin"],
        "fn": [], "level": "intermediate", "kind": "external",
    },
    {
        "title": "Agent Resources (Copilot Acceleration Team)",
        "href": "https://aka.ms/agentresources",
        "source": "Microsoft",
        "stage": "studio", "stageLabel": "Microsoft",
        "roles": ["maker", "developer", "champion"],
        "fn": [], "level": "intermediate", "kind": "external",
    },
    {
        "title": "Microsoft Foundry documentation",
        "href": "https://learn.microsoft.com/en-us/azure/ai-foundry/",
        "source": "Microsoft Learn",
        "stage": "foundry", "stageLabel": "Microsoft Learn",
        "roles": ["developer"],
        "fn": [], "level": "advanced", "kind": "external",
    },
]


def main() -> None:
    catalog = {
        "generated": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "items": scan_walkthroughs() + scan_solutions(),
        "external": EXTERNAL,
    }
    OUT.write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"path-catalog.json: {len(catalog['items'])} internal + {len(catalog['external'])} external")


if __name__ == "__main__":
    main()

"""MkDocs hooks for the Copilot Ramp Playbook.

Registered via `hooks:` in mkdocs.yml. Two responsibilities:

1. on_config — inject the "Walkthroughs" section into the Use tab. The section's
   landing page is the filterable library (docs/walkthroughs/index.md, attached as
   the section overview via the theme's navigation.indexes feature), and its
   children are every walkthrough grouped by stage. Built from front-matter at
   build time so the left-nav self-maintains: a new walkthroughs/*.md page appears
   in the nav (and gets a prev/next + a highlighted left-nav entry) with zero hand
   edits. This is why the ~140 walkthrough pages are intentionally NOT hand-listed
   in mkdocs.yml.

2. on_pre_build — regenerate docs/path-catalog.json (the "Add to my path" picker +
   the Walkthroughs Library cards both read it) so it always reflects current
   walkthrough + solution frontmatter.
"""
from __future__ import annotations

import importlib.util
import pathlib
from collections import defaultdict

_HERE = pathlib.Path(__file__).resolve().parent
_GEN = _HERE / "gen_path_catalog.py"
_DOCS = _HERE.parent / "docs"

# Stage order + labels for the left-nav groups (mirrors gen_path_catalog).
STAGE_ORDER = ["chat", "first-party", "cowork", "agent-builder", "autopilots", "studio", "foundry"]
STAGE_LABEL = {
    "chat": "Stage 1 · Chat",
    "first-party": "Stage 2 · First-party",
    "cowork": "Stage 3 · Cowork",
    "agent-builder": "Stage 4 · Agent Builder",
    "autopilots": "Stage 5 · Autopilots",
    "studio": "Stage 6 · Studio",
    "foundry": "Stage 7 · Foundry",
}
LEVEL_RANK = {"starter": 0, "intermediate": 1, "advanced": 2}

_LIBRARY_INDEX = "walkthroughs/index.md"


def _load_gen():
    spec = importlib.util.spec_from_file_location("gen_path_catalog", _GEN)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


_GENMOD = _load_gen()


def _run_generator() -> None:
    _GENMOD.main()


def _walkthrough_section() -> dict:
    """Build the {"Walkthroughs": [...]} nav section from walkthrough frontmatter.

    First child is the bare library index (becomes the section's overview under
    navigation.indexes); the rest are per-stage sub-sections of titled pages.
    """
    groups: dict[str, list] = defaultdict(list)
    for path in sorted((_DOCS / "walkthroughs").glob("*.md")):
        if path.name == "index.md":
            continue
        fm = _GENMOD.parse_frontmatter(path.read_text(encoding="utf-8"))
        stage = fm.get("stage")
        if not stage:
            continue
        title = fm.get("title", path.stem)
        level_rank = LEVEL_RANK.get(fm.get("level", ""), 9)
        groups[stage].append((level_rank, title, f"walkthroughs/{path.stem}.md"))

    children: list = [_LIBRARY_INDEX]
    for stage in STAGE_ORDER:
        rows = groups.get(stage)
        if not rows:
            continue
        rows.sort(key=lambda r: (r[0], r[1].lower()))
        stage_pages = [{title: rel} for _, title, rel in rows]
        children.append({STAGE_LABEL.get(stage, stage): stage_pages})
    return {"Walkthroughs": children}


def _is_library_entry(entry) -> bool:
    if isinstance(entry, dict):
        return any(v == _LIBRARY_INDEX for v in entry.values() if isinstance(v, str))
    return entry == _LIBRARY_INDEX


def on_config(config, **kwargs):  # noqa: ARG001
    nav = config.get("nav")
    if not nav:
        return config
    for entry in nav:
        if isinstance(entry, dict) and isinstance(entry.get("Use"), list):
            use = entry["Use"]
            # Drop any pre-existing bare library link, then insert the full section
            # right after "Quick Wins" (falls back to the top of Use).
            use[:] = [e for e in use if not _is_library_entry(e)]
            insert_at = 0
            for i, e in enumerate(use):
                if isinstance(e, dict) and "Quick Wins" in e:
                    insert_at = i + 1
                    break
            use.insert(insert_at, _walkthrough_section())
            break
    return config


def on_pre_build(config, **kwargs):  # noqa: ARG001
    _run_generator()
    return config

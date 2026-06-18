"""MkDocs hooks for the Copilot Ramp Playbook.

Registered via `hooks:` in mkdocs.yml. Regenerates the persona path catalog
(docs/path-catalog.json) before every build/serve so the "Add to my path"
picker always reflects current walkthrough + solution frontmatter.
"""
from __future__ import annotations

import importlib.util
import pathlib

_GEN = pathlib.Path(__file__).resolve().parent / "gen_path_catalog.py"


def _run_generator() -> None:
    spec = importlib.util.spec_from_file_location("gen_path_catalog", _GEN)
    if spec and spec.loader:
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        mod.main()


def on_pre_build(config, **kwargs):  # noqa: ARG001
    _run_generator()
    return config

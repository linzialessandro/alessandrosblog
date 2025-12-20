from __future__ import annotations
from pathlib import Path
from typing import Any, Iterable

import argparse
import json
import sys
from blogq.diagnostics import Diagnostic
from blogq.checks.semantic import semantic_diagnostics
from blogq.validate import validate_posts_schema


def _load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON at line {e.lineno}, col {e.colno}: {e.msg}") from e


def _normalize_posts(doc: Any) -> list[dict[str, Any]]:
    if isinstance(doc, dict) and isinstance(doc.get("posts"), list):
        return doc["posts"]
    raise ValueError('Expected top-level object with key "posts": { "posts": [ ... ] }')


def _print(diags: Iterable[Diagnostic]) -> None:
    for d in diags:
        sys.stdout.write(f"{d.severity:5s} {d.slug} {d.pointer}: {d.message}\n")


def check(posts_path: Path) -> int:
    try:
        doc = _load_json(posts_path)
        posts = _normalize_posts(doc)

        schema_diags = validate_posts_schema(doc)
        sem_diags = semantic_diagnostics(posts)

        diags = [*schema_diags, *sem_diags]
        _print(diags)

        return 1 if any(d.severity == "ERROR" for d in diags) else 0

    except Exception as e:
        sys.stdout.write(f"ERROR <file> {posts_path}: {e}\n")
        return 1


def main() -> None:
    parser = argparse.ArgumentParser(prog="blogq")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_check = sub.add_parser("check", help="Validate posts.json")
    p_check.add_argument("path", type=Path)

    args = parser.parse_args()

    if args.cmd == "check":
        raise SystemExit(check(args.path))
"""CLI / schema integration tests for blogq."""

from __future__ import annotations

import json
from pathlib import Path

from blogq.cli import check
from blogq.validate import validate_posts_schema


def _minimal_valid_doc():
    return {
        "posts": [
            {
                "title": "Valid Post",
                "slug": "valid-post",
                "publishedAt": "2026-01-01T12:00:00Z",
                "summary": "Summary text.",
                "tags": ["AI"],
                "content": "<p>Body</p>",
            }
        ]
    }


def test_schema_accepts_minimal_valid_doc():
    diags = validate_posts_schema(_minimal_valid_doc())
    assert diags == []


def test_schema_rejects_missing_posts_key():
    diags = validate_posts_schema({"items": []})
    assert any(d.severity == "ERROR" for d in diags)


def test_check_returns_zero_for_valid_file(tmp_path: Path):
    path = tmp_path / "posts.json"
    path.write_text(json.dumps(_minimal_valid_doc()), encoding="utf-8")
    assert check(path) == 0


def test_check_returns_nonzero_for_invalid_slug(tmp_path: Path):
    doc = _minimal_valid_doc()
    doc["posts"][0]["slug"] = "Not Valid"
    path = tmp_path / "posts.json"
    path.write_text(json.dumps(doc), encoding="utf-8")
    assert check(path) == 1


def test_check_returns_nonzero_for_missing_file(tmp_path: Path):
    assert check(tmp_path / "does-not-exist.json") == 1

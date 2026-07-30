"""Unit tests for blogq semantic checks."""

from __future__ import annotations

from blogq.checks.semantic import semantic_diagnostics


def _post(**overrides):
    base = {
        "title": "Example Post",
        "slug": "example-post",
        "publishedAt": "2026-01-01T12:00:00Z",
        "summary": "A short summary.",
        "tags": ["AI"],
        "content": "<p>Hello world.</p>",
    }
    base.update(overrides)
    return base


def test_valid_post_has_no_errors():
    diags = semantic_diagnostics([_post()])
    assert diags == []


def test_invalid_slug_is_error():
    diags = semantic_diagnostics([_post(slug="Bad_Slug!")])
    assert any(d.severity == "ERROR" and "Slug violates policy" in d.message for d in diags)


def test_duplicate_slug_is_error():
    posts = [
        _post(slug="same-slug", title="One"),
        _post(slug="same-slug", title="Two"),
    ]
    diags = semantic_diagnostics(posts)
    assert any(d.severity == "ERROR" and "Duplicate slug" in d.message for d in diags)


def test_target_blank_without_noopener_is_error():
    content = '<p><a href="https://example.com" target="_blank">link</a></p>'
    diags = semantic_diagnostics([_post(content=content)])
    assert any(
        d.severity == "ERROR" and 'target="_blank"' in d.message and "noopener" in d.message
        for d in diags
    )


def test_target_blank_with_noopener_is_ok():
    content = (
        '<p><a href="https://example.com" target="_blank" '
        'rel="noopener noreferrer">link</a></p>'
    )
    diags = semantic_diagnostics([_post(content=content)])
    assert not any(d.severity == "ERROR" for d in diags)


def test_tag_whitespace_is_warning():
    diags = semantic_diagnostics([_post(tags=[" AI "])])
    assert any(d.severity == "WARN" and "whitespace" in d.message.lower() for d in diags)

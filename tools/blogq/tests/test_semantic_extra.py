"""Additional semantic edge-case tests for blogq."""

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


def test_empty_slug_does_not_crash():
    diags = semantic_diagnostics([_post(slug="")])
    assert isinstance(diags, list)


def test_multiple_valid_posts_ok():
    posts = [
        _post(slug="one", title="One"),
        _post(slug="two", title="Two"),
        _post(slug="three", title="Three"),
    ]
    assert semantic_diagnostics(posts) == []


def test_slug_with_double_hyphen_invalid():
    diags = semantic_diagnostics([_post(slug="bad--slug")])
    assert any(d.severity == "ERROR" and "Slug" in d.message for d in diags)


def test_slug_starting_with_hyphen_invalid():
    diags = semantic_diagnostics([_post(slug="-leading")])
    assert any(d.severity == "ERROR" and "Slug" in d.message for d in diags)


def test_noopener_alone_is_enough():
    content = '<a href="https://ex.com" target="_blank" rel="noopener">x</a>'
    diags = semantic_diagnostics([_post(content=content)])
    assert not any(d.severity == "ERROR" for d in diags)


def test_multiple_tags_whitespace_warns_each():
    diags = semantic_diagnostics([_post(tags=[" AI", "ML ", " ok "])])
    warns = [d for d in diags if d.severity == "WARN"]
    assert len(warns) >= 2


def test_mixed_duplicate_and_bad_slug():
    posts = [
        _post(slug="dup"),
        _post(slug="dup"),
        _post(slug="Bad"),
    ]
    diags = semantic_diagnostics(posts)
    errors = [d for d in diags if d.severity == "ERROR"]
    assert len(errors) >= 2

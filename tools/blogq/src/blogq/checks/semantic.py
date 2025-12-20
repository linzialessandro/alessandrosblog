from __future__ import annotations

import re
from typing import Any

from blogq.diagnostics import Diagnostic

_SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def semantic_diagnostics(posts: list[dict[str, Any]]) -> list[Diagnostic]:
    diags: list[Diagnostic] = []

    seen: dict[str, int] = {}
    for i, p in enumerate(posts):
        slug = str(p.get("slug") or f"<post:{i}>")

        raw_slug = p.get("slug")
        if isinstance(raw_slug, str) and raw_slug:
            if not _SLUG_RE.fullmatch(raw_slug):
                diags.append(Diagnostic("ERROR", slug, f"/posts/{i}/slug", "Slug violates policy."))
            if raw_slug in seen:
                j = seen[raw_slug]
                diags.append(
                    Diagnostic(
                        "ERROR",
                        slug,
                        f"/posts/{i}/slug",
                        f"Duplicate slug (also at /posts/{j}/slug).",
                    )
                )
            else:
                seen[raw_slug] = i

        html = str(p.get("content") or "")
        if 'target="_blank"' in html:
            if ("rel=" not in html) or ("noopener" not in html):
                diags.append(
                    Diagnostic(
                        "ERROR",
                        slug,
                        f"/posts/{i}/content",
                        'Found target="_blank" without rel including "noopener".',
                    )
                )

        tags = p.get("tags") or []
        for k, t in enumerate(tags):
            if isinstance(t, str) and t != t.strip():
                diags.append(
                    Diagnostic("WARN", slug, f"/posts/{i}/tags/{k}", "Tag has leading/trailing whitespace.")
                )

    return diags
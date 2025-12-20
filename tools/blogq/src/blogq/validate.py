from __future__ import annotations

import json
from typing import Any

import jsonschema
from jsonschema import FormatChecker
from importlib import resources

from blogq.diagnostics import Diagnostic


def validate_posts_schema(instance: Any) -> list[Diagnostic]:
    schema_text = resources.files("blogq").joinpath("schema/posts.schema.json").read_text(
        encoding="utf-8"
    )
    schema = json.loads(schema_text)

    diags: list[Diagnostic] = []
    try:
        jsonschema.validate(instance=instance, schema=schema, format_checker=FormatChecker())
    except jsonschema.ValidationError as e:
        pointer = "/" + "/".join(str(p) for p in list(e.absolute_path))
        if pointer == "/":
            pointer = "<root>"
        diags.append(Diagnostic("ERROR", "<schema>", pointer, e.message))
    return diags
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Diagnostic:
    severity: str  # "ERROR" | "WARN"
    slug: str
    pointer: str
    message: str
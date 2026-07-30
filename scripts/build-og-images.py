#!/usr/bin/env python3
"""Generate branded Open Graph card images (1200×630) for every post + homepage."""

from __future__ import annotations

import json
import textwrap
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
POSTS_JSON = ROOT / "posts.json"
OUT_DIR = ROOT / "assets" / "og"

W, H = 1200, 630
BG = (250, 249, 246)  # --bg light
INK = (28, 25, 23)  # --text
MUTED = (120, 113, 108)  # --text-2
ACCENT = (146, 64, 14)  # --accent
CARD = (255, 255, 255)


def find_font(size: int, *, serif: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if serif:
        candidates.extend(
            [
                "/System/Library/Fonts/Supplemental/Georgia.ttf",
                "/Library/Fonts/Georgia.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
            ]
        )
    else:
        candidates.extend(
            [
                "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
                "/System/Library/Fonts/Supplemental/Arial.ttf",
                "/Library/Fonts/Arial.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            ]
        )
    for path in candidates:
        p = Path(path)
        if p.is_file():
            try:
                return ImageFont.truetype(str(p), size=size)
            except OSError:
                continue
    return ImageFont.load_default()


def format_date(value: str | None) -> str:
    if not value:
        return ""
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).strftime("%b %-d, %Y")
    except Exception:
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00")).strftime("%b %d, %Y")
        except Exception:
            return value[:10]


def wrap_title(title: str, font: ImageFont.ImageFont, max_width: int, draw: ImageDraw.ImageDraw) -> list[str]:
    words = title.split()
    if not words:
        return [""]
    lines: list[str] = []
    current = words[0]
    for word in words[1:]:
        trial = f"{current} {word}"
        if draw.textlength(trial, font=font) <= max_width:
            current = trial
        else:
            lines.append(current)
            current = word
    lines.append(current)
    # Cap to 4 lines; ellipsize last if needed
    if len(lines) > 4:
        lines = lines[:4]
        while draw.textlength(lines[-1] + "…", font=font) > max_width and len(lines[-1]) > 1:
            lines[-1] = lines[-1][:-1]
        lines[-1] = lines[-1].rstrip() + "…"
    return lines


def draw_card(
    *,
    title: str,
    subtitle: str = "",
    tags: list[str] | None = None,
    out_path: Path,
) -> None:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Soft accent wash
    for i in range(180):
        alpha = int(18 * (1 - i / 180))
        y = i
        draw.line([(0, y), (W, y)], fill=(146, 64, 14, alpha) if False else (
            min(250, 250),
            min(249, 249 - alpha // 3),
            min(246, 246 - alpha // 2),
        ))

    # Left accent bar
    draw.rectangle([0, 0, 18, H], fill=ACCENT)

    # Top brand
    brand_font = find_font(28, serif=False)
    draw.text((72, 56), "Alessandro's blog", font=brand_font, fill=ACCENT)

    # Title
    title_font = find_font(54, serif=True)
    lines = wrap_title(title, title_font, W - 144, draw)
    y = 160
    line_gap = 68
    for line in lines:
        draw.text((72, y), line, font=title_font, fill=INK)
        y += line_gap

    # Meta row
    meta_font = find_font(26, serif=False)
    meta_y = H - 110
    if subtitle:
        draw.text((72, meta_y), subtitle, font=meta_font, fill=MUTED)

    if tags:
        tag_font = find_font(22, serif=False)
        tag_text = " · ".join(tags[:4])
        if len(tag_text) > 70:
            tag_text = tag_text[:67] + "…"
        draw.text((72, meta_y + 40), tag_text, font=tag_font, fill=MUTED)

    # Bottom rule
    draw.rectangle([72, H - 36, W - 72, H - 32], fill=(28, 25, 23, 25) if False else (228, 224, 218))

    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, format="PNG", optimize=True)


def main() -> None:
    data = json.loads(POSTS_JSON.read_text(encoding="utf-8"))
    posts = data.get("posts") or []
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Homepage / default card
    draw_card(
        title="Ideas worth keeping.",
        subtitle="Publicly collecting what I learn",
        tags=["AI", "Technology", "Learning"],
        out_path=OUT_DIR / "default.png",
    )
    print("Wrote assets/og/default.png")

    count = 0
    for post in posts:
        slug = post.get("slug")
        if not slug:
            continue
        title = post.get("title") or slug
        date = format_date(post.get("publishedAt"))
        tags = post.get("tags") or []
        draw_card(
            title=title,
            subtitle=date,
            tags=list(tags),
            out_path=OUT_DIR / f"{slug}.png",
        )
        count += 1

    print(f"Wrote {count} post OG images to assets/og/")


if __name__ == "__main__":
    main()

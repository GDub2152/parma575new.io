#!/usr/bin/env python3
"""Create one main Parma 575 gallery from every photo under assets/gallery."""

from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
GALLERY = ROOT / "assets" / "gallery"
OUTPUT = GALLERY / "gallery-data.json"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
COVER_STEMS = {"cover", "album-cover", "album_cover"}


def natural_key(value: str) -> list[object]:
    return [int(part) if part.isdigit() else part.casefold() for part in re.split(r"(\d+)", value)]


def title_from_name(name: str) -> str:
    return re.sub(r"[_-]+", " ", name).strip()


def web_path(path: Path) -> str:
    relative = path.relative_to(ROOT).as_posix()
    return "/".join(quote(part) for part in relative.split("/"))


def main() -> None:
    GALLERY.mkdir(parents=True, exist_ok=True)

    photos = sorted(
        (
            path
            for path in GALLERY.rglob("*")
            if path.is_file()
            and path != OUTPUT
            and path.suffix.casefold() in IMAGE_EXTENSIONS
            and path.stem.casefold() not in COVER_STEMS
        ),
        key=lambda path: natural_key(path.relative_to(GALLERY).as_posix()),
    )

    album_photos = []
    for photo in photos:
        folder_title = title_from_name(photo.parent.name)
        photo_title = title_from_name(photo.stem)
        album_photos.append(
            {
                "name": photo_title,
                "alt": f"{folder_title} - {photo_title}" if photo.parent != GALLERY else photo_title,
                "src": web_path(photo),
            }
        )

    data = {
        "generated": True,
        "albums": [
            {
                "id": "parma-575-photos",
                "title": "Parma 575 Photos",
                "cover": album_photos[0]["src"] if album_photos else "assets/images/gallery-placeholder.svg",
                "photos": album_photos,
            }
        ] if album_photos else [],
    }

    OUTPUT.write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"Generated {OUTPUT.relative_to(ROOT)} with {len(album_photos)} photos in one main album.")


if __name__ == "__main__":
    main()

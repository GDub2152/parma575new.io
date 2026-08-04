#!/usr/bin/env python3
"""Create assets/gallery/gallery-data.json from album folders."""

from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import quote


ROOT = Path(__file__).resolve().parents[1]
GALLERY = ROOT / "assets" / "gallery"
OUTPUT = GALLERY / "gallery-data.json"

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".avif",
}

COVER_FILENAMES = {
    "cover.jpg",
    "cover.jpeg",
    "cover.png",
    "cover.webp",
    "cover.gif",
    "cover.avif",
}


def natural_key(value: str) -> list[object]:
    """Sort names naturally, so photo2 comes before photo10."""
    return [
        int(part) if part.isdigit() else part.casefold()
        for part in re.split(r"(\d+)", value)
    ]


def title_from_name(name: str) -> str:
    """Convert folder and file names into readable titles."""
    return re.sub(r"[_-]+", " ", name).strip()


def web_path(path: Path) -> str:
    """Convert a local file path into a URL-safe website path."""
    relative = path.relative_to(ROOT).as_posix()
    return "/".join(quote(part) for part in relative.split("/"))


def find_album_cover(photos: list[Path]) -> Path:
    """
    Prefer an image specifically named cover.jpg, cover.png, etc.
    Otherwise use the first image alphabetically.
    """
    named_cover = next(
        (
            photo
            for photo in photos
            if photo.name.casefold() in COVER_FILENAMES
        ),
        None,
    )

    return named_cover if named_cover is not None else photos[0]


def main() -> None:
    GALLERY.mkdir(parents=True, exist_ok=True)

    albums: list[dict[str, object]] = []

    folders = sorted(
        (
            path
            for path in GALLERY.iterdir()
            if path.is_dir() and not path.name.startswith(".")
        ),
        key=lambda path: natural_key(path.name),
    )

    for folder in folders:
        photos = sorted(
            (
                path
                for path in folder.rglob("*")
                if path.is_file()
                and path.suffix.casefold() in IMAGE_EXTENSIONS
            ),
            key=lambda path: natural_key(path.name),
        )

        if not photos:
            continue

        cover_photo = find_album_cover(photos)

        album_photos = [
            {
                "name": title_from_name(photo.stem),
                "alt": (
                    f"{title_from_name(folder.name)} - "
                    f"{title_from_name(photo.stem)}"
                ),
                "src": web_path(photo),
            }
            for photo in photos
        ]

        albums.append(
            {
                "id": re.sub(
                    r"[^a-z0-9]+",
                    "-",
                    folder.name.casefold(),
                ).strip("-"),
                "title": title_from_name(folder.name),
                "cover": web_path(cover_photo),
                "photos": album_photos,
            }
        )

    data = {
        "generated": True,
        "albums": albums,
    }

    OUTPUT.write_text(
        json.dumps(data, indent=2),
        encoding="utf-8",
    )

    photo_count = sum(
        len(album["photos"])
        for album in albums
    )

    print(
        f"Generated {OUTPUT.relative_to(ROOT)} "
        f"with {len(albums)} albums and {photo_count} photos."
    )


if __name__ == "__main__":
    main()

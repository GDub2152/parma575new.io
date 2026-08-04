#!/usr/bin/env python3
"""Create assets/gallery/gallery-data.json from synchronized album folders."""
from __future__ import annotations
import json
import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
GALLERY = ROOT / "assets" / "gallery"
OUTPUT = GALLERY / "gallery-data.json"
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}


def natural_key(value: str):
    return [int(part) if part.isdigit() else part.casefold() for part in re.split(r"(\d+)", value)]


def title_from_name(name: str) -> str:
    return re.sub(r"[_-]+", " ", name).strip()


def web_path(path: Path) -> str:
    relative = path.relative_to(ROOT).as_posix()
    return "/".join(quote(part) for part in relative.split("/"))


def main() -> None:
    GALLERY.mkdir(parents=True, exist_ok=True)
    albums = []
    for folder in sorted((p for p in GALLERY.iterdir() if p.is_dir() and not p.name.startswith(".")), key=lambda p: natural_key(p.name)):
        photos = sorted((p for p in folder.rglob("*") if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS), key=lambda p: natural_key(p.name))
        if not photos:
            continue
        album_photos = [{
            "name": title_from_name(photo.stem),
            "alt": f"{title_from_name(folder.name)} - {title_from_name(photo.stem)}",
            "src": web_path(photo)
        } for photo in photos]
        albums.append({
            "id": re.sub(r"[^a-z0-9]+", "-", folder.name.casefold()).strip("-"),
            "title": title_from_name(folder.name),
            "cover": album_photos[0]["src"],
            "photos": album_photos
        })
    OUTPUT.write_text(json.dumps({"generated": True, "albums": albums}, indent=2), encoding="utf-8")
    print(f"Generated {OUTPUT.relative_to(ROOT)} with {len(albums)} albums and {sum(len(a['photos']) for a in albums)} photos.")

if __name__ == "__main__":
    main()

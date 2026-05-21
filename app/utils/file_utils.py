from pathlib import Path
import shutil
from uuid import uuid4


def safe_filename(filename: str) -> str:
    name = Path(filename or "upload").name
    return "".join(character for character in name if character.isalnum() or character in "._- ").strip() or "upload"


def unique_path(directory: Path, filename: str) -> Path:
    directory.mkdir(parents=True, exist_ok=True)
    safe_name = safe_filename(filename)
    stem = Path(safe_name).stem
    suffix = Path(safe_name).suffix
    return directory / f"{stem}_{uuid4().hex[:10]}{suffix}"


def save_upload_file(upload_file, destination: Path):
    destination.parent.mkdir(parents=True, exist_ok=True)

    with destination.open("wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return destination

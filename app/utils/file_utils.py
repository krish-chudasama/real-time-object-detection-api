from pathlib import Path
import shutil

from fastapi import UploadFile

from app.utils.paths import UPLOAD_DIR


def save_upload_file(file: UploadFile) -> Path:
    input_path = UPLOAD_DIR / Path(file.filename or "upload").name

    with input_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return input_path

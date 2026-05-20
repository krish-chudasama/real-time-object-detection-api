from pathlib import Path

from fastapi import APIRouter, File, Form, UploadFile

from app.services.yolo_service import YOLOService
from app.utils.file_utils import save_upload_file
from app.utils.paths import UPLOADS_DIR

router = APIRouter()

service = YOLOService()

IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"]
VIDEO_EXTENSIONS = [".mp4", ".avi", ".mov"]


@router.post("/detect")
async def detect(
    model_name: str = Form(...),
    file: UploadFile = File(...)
):
    file_extension = Path(file.filename).suffix.lower()

    file_path = UPLOADS_DIR / Path(file.filename).name

    save_upload_file(file, file_path)

    if file_extension in IMAGE_EXTENSIONS:
        result = service.detect_image(model_name, file_path)

    elif file_extension in VIDEO_EXTENSIONS:
        result = service.detect_video(model_name, file_path)

    else:
        return {
            "error": "Unsupported file format"
        }

    return result

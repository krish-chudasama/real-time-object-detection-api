from pathlib import Path
from typing import List

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.yolo_service import YOLOService
from app.utils.file_utils import save_upload_file, unique_path
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
    file_path = unique_path(UPLOADS_DIR, file.filename)
    save_upload_file(file, file_path)

    try:
        result = service.run_detection(model_name, file_path)
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return result


@router.post("/compare")
async def compare(
    model_names: List[str] = Form(...),
    files: List[UploadFile] = File(...)
):
    if not model_names:
        raise HTTPException(status_code=400, detail="At least one model is required")

    if not files:
        raise HTTPException(status_code=400, detail="At least one media file is required")

    queue_results = []

    for file in files:
        file_path = unique_path(UPLOADS_DIR, file.filename)
        save_upload_file(file, file_path)

        media_results = []

        for model_name in model_names:
            try:
                media_results.append(service.run_detection(model_name, file_path))
            except FileNotFoundError as error:
                raise HTTPException(status_code=404, detail=str(error)) from error
            except ValueError as error:
                raise HTTPException(status_code=400, detail=str(error)) from error

        queue_results.append({
            "file_name": Path(file.filename).name,
            "media_type": "video" if file_path.suffix.lower() in VIDEO_EXTENSIONS else "image",
            "results": media_results,
        })

    return {
        "items": queue_results,
    }

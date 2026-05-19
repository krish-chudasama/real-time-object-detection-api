from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.models.detection import DetectionResponse
from app.services.model_registry import ModelRegistryError
from app.services.yolo_service import yolo_service
from app.utils.file_utils import save_upload_file

router = APIRouter(tags=["Detection"])


@router.post("/detect/", response_model=DetectionResponse)
async def detect_object(
    file: UploadFile = File(...),
    model_name: str | None = Form(None),
) -> DetectionResponse:
    input_path = save_upload_file(file)

    try:
        return yolo_service.detect_image(input_path, model_name=model_name)
    except ModelRegistryError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

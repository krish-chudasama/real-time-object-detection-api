from fastapi import APIRouter

from app.models.yolo_model import ModelListResponse
from app.services.model_registry import model_registry

router = APIRouter(tags=["Models"])


@router.get("/models", response_model=ModelListResponse)
def list_models() -> ModelListResponse:
    return ModelListResponse(
        models=model_registry.list_models(),
        default_model=model_registry.default_model_name,
    )

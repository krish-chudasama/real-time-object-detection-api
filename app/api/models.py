from fastapi import APIRouter

from app.services.model_registry import ModelRegistry

router = APIRouter()

registry = ModelRegistry()


@router.get("/models")
def get_models():
    return {
        "available_models": registry.get_available_models()
    }

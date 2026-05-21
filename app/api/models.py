from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.model_registry import ModelRegistry

router = APIRouter()

registry = ModelRegistry()


@router.get("/models")
def get_models():
    models = registry.list_models()

    return {
        "available_models": [model["name"] for model in models],
        "models": models,
    }


@router.post("/upload-model")
async def upload_model(file: UploadFile = File(...)):
    try:
        model_name = registry.save_custom_model(file, file.filename)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return {
        "message": "Model uploaded successfully",
        "model_name": model_name,
        "available_models": registry.get_available_models(),
    }

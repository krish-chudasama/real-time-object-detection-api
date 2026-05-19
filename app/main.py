from fastapi import FastAPI

from app.api.detection import router as detection_router
from app.api.models import router as models_router
from app.utils.paths import ensure_runtime_directories


ensure_runtime_directories()

app = FastAPI()
app.include_router(detection_router)
app.include_router(models_router)


@app.get("/")
def home():
    return {"message": "Object Detection API Running"}

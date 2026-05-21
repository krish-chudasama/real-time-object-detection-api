from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.detection import router as detection_router
from app.api.evaluation import router as evaluation_router
from app.api.models import router as models_router
from app.utils.paths import OUTPUTS_DIR

app = FastAPI(
    title="YOLO Multi-Model Detection API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(detection_router)
app.include_router(evaluation_router)
app.include_router(models_router)
app.mount("/outputs", StaticFiles(directory=OUTPUTS_DIR), name="outputs")


@app.get("/")
def home():
    return {
        "message": "YOLO Detection API Running"
    }

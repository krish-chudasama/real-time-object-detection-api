from pathlib import Path

UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
MODEL_DIR = Path("models")
DEFAULT_MODEL_PATH = Path("yolov8n.pt")


def ensure_runtime_directories() -> None:
    UPLOAD_DIR.mkdir(exist_ok=True)
    OUTPUT_DIR.mkdir(exist_ok=True)
    MODEL_DIR.mkdir(exist_ok=True)

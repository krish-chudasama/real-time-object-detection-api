import os
from pathlib import Path

from app.utils.paths import BASE_DIR, CUSTOM_MODELS_DIR, MODELS_DIR

ULTRALYTICS_CONFIG_ROOT = BASE_DIR / ".ultralytics-config"
ULTRALYTICS_CONFIG_ROOT.mkdir(exist_ok=True)
os.environ.setdefault("YOLO_CONFIG_DIR", str(ULTRALYTICS_CONFIG_ROOT))

from ultralytics import YOLO


class ModelRegistry:
    def __init__(self):
        self.loaded_models = {}

    def get_available_models(self):
        return [model["name"] for model in self.list_models()]

    def list_models(self):
        model_files = []

        for path in MODELS_DIR.rglob("*.pt"):
            relative_path = path.relative_to(MODELS_DIR)
            name = str(relative_path).replace("\\", "/")
            model_files.append({
                "name": name,
                "family": self._detect_family(path.name),
                "source": "custom" if "custom" in relative_path.parts else "pretrained",
                "size_mb": round(path.stat().st_size / (1024 * 1024), 2),
            })

        return sorted(model_files, key=lambda item: item["name"])

    def get_model_path(self, model_name: str):
        normalized = Path(model_name)

        if normalized.is_absolute() or ".." in normalized.parts:
            raise ValueError("Invalid model name")

        return MODELS_DIR / normalized

    def load_model(self, model_name: str):
        model_path = self.get_model_path(model_name)

        if not model_path.exists():
            raise FileNotFoundError(f"Model not found: {model_path}")

        if model_name not in self.loaded_models:
            print(f"Loading model: {model_name}")
            self.loaded_models[model_name] = YOLO(str(model_path))

        return self.loaded_models[model_name]

    def save_custom_model(self, source_file, filename: str):
        from app.utils.file_utils import safe_filename, save_upload_file

        safe_name = safe_filename(filename)

        if Path(safe_name).suffix.lower() != ".pt":
            raise ValueError("Only .pt model files are supported")

        destination = CUSTOM_MODELS_DIR / safe_name
        save_upload_file(source_file, destination)
        return str(destination.relative_to(MODELS_DIR)).replace("\\", "/")

    @staticmethod
    def _detect_family(filename: str):
        lowered = filename.lower()

        if lowered.startswith("yolov8"):
            return "YOLOv8"

        if lowered.startswith("yolo11"):
            return "YOLO11"

        if lowered.startswith("yolo26"):
            return "YOLO26"

        return "Custom"

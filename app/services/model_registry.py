import os

from app.utils.paths import BASE_DIR, MODELS_DIR

ULTRALYTICS_CONFIG_ROOT = BASE_DIR / ".ultralytics-config"
ULTRALYTICS_CONFIG_ROOT.mkdir(exist_ok=True)
os.environ.setdefault("YOLO_CONFIG_DIR", str(ULTRALYTICS_CONFIG_ROOT))

from ultralytics import YOLO


class ModelRegistry:
    def __init__(self):
        self.loaded_models = {}

    def get_available_models(self):
        model_files = []

        for path in MODELS_DIR.rglob("*.pt"):
            relative_path = path.relative_to(MODELS_DIR)
            model_files.append(str(relative_path).replace("\\", "/"))

        return sorted(model_files)

    def get_model_path(self, model_name: str):
        return MODELS_DIR / model_name

    def load_model(self, model_name: str):
        model_path = self.get_model_path(model_name)

        if not model_path.exists():
            raise FileNotFoundError(f"Model not found: {model_path}")

        if model_name not in self.loaded_models:
            print(f"Loading model: {model_name}")
            self.loaded_models[model_name] = YOLO(str(model_path))

        return self.loaded_models[model_name]

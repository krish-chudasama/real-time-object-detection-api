from pathlib import Path
import shutil

from ultralytics import YOLO

from app.models.yolo_model import AvailableModel
from app.utils.paths import DEFAULT_MODEL_PATH, MODEL_DIR


MODEL_EXTENSIONS = {".pt", ".onnx", ".engine"}
MODEL_SIZES = {
    "n": "Nano",
    "s": "Small",
    "m": "Medium",
    "l": "Large",
    "x": "Extra Large",
}
YOLO_FAMILIES = ("yolo11", "yolov8")
YOLO_TASK_SUFFIXES = {
    "detection": "",
    "segmentation": "-seg",
    "pose": "-pose",
    "classification": "-cls",
}


def _build_downloadable_catalog() -> dict[str, dict[str, str]]:
    catalog = {}
    for family in YOLO_FAMILIES:
        family_label = "YOLO11" if family == "yolo11" else "YOLOv8"
        for size, size_label in MODEL_SIZES.items():
            for task, suffix in YOLO_TASK_SUFFIXES.items():
                model_name = f"{family}{size}{suffix}"
                catalog[model_name] = {
                    "display_name": f"{family_label} {size_label} {task.title()}",
                    "task": task,
                }

    return catalog


DOWNLOADABLE_MODELS = _build_downloadable_catalog()


class ModelRegistryError(ValueError):
    pass


class NoModelsAvailableError(ModelRegistryError):
    pass


class ModelNotFoundError(ModelRegistryError):
    pass


class ModelRegistry:
    def __init__(self, model_dir: Path = MODEL_DIR) -> None:
        self.model_dir = model_dir
        self._models: dict[str, Path] = {}
        self._loaded_models: dict[str, YOLO] = {}
        self.refresh()

    def refresh(self) -> None:
        discovered_models = {
            model_path.stem: model_path
            for model_path in self.model_dir.rglob("*")
            if model_path.is_file() and model_path.suffix.lower() in MODEL_EXTENSIONS
        }

        if DEFAULT_MODEL_PATH.exists() and DEFAULT_MODEL_PATH.stem not in discovered_models:
            discovered_models[DEFAULT_MODEL_PATH.stem] = DEFAULT_MODEL_PATH

        self._models = dict(sorted(discovered_models.items()))

    @property
    def default_model_name(self) -> str | None:
        if "yolov8n" in self._models:
            return "yolov8n"
        if "yolo11n" in self._models or "yolo11n" in DOWNLOADABLE_MODELS:
            return "yolo11n"

        return next(iter(self.available_model_names()), None)

    def list_models(self) -> list[AvailableModel]:
        self.refresh()
        available_models = []
        for model_name in self.available_model_names():
            model_path = self._models.get(model_name, MODEL_DIR / f"{model_name}.pt")
            catalog_entry = DOWNLOADABLE_MODELS.get(model_name, {})
            downloaded = model_name in self._models
            source = "local" if downloaded else "downloadable"
            available_models.append(
                AvailableModel(
                    id=model_name,
                    name=model_name,
                    display_name=catalog_entry.get("display_name", model_name),
                    path=str(model_path),
                    task=catalog_entry.get("task", self._infer_task(model_name)),
                    loaded=model_name in self._loaded_models,
                    downloaded=downloaded,
                    source=source,
                )
            )

        return available_models

    def available_model_names(self) -> list[str]:
        return sorted(set(self._models) | set(DOWNLOADABLE_MODELS))

    def get_model(self, model_name: str | None = None) -> YOLO:
        self.refresh()
        selected_model = model_name.strip() if model_name else self.default_model_name

        if selected_model is None:
            raise NoModelsAvailableError("No YOLO models are available.")

        if selected_model not in self._models and selected_model not in DOWNLOADABLE_MODELS:
            raise ModelNotFoundError(
                f"YOLO model '{selected_model}' is not available. Select a model from GET /models."
            )

        if selected_model not in self._loaded_models:
            if selected_model in self._models:
                self._loaded_models[selected_model] = YOLO(str(self._models[selected_model]))
            else:
                self._loaded_models[selected_model] = self._download_model(selected_model)
            self.refresh()

        return self._loaded_models[selected_model]

    def _download_model(self, model_name: str) -> YOLO:
        model_file_name = f"{model_name}.pt"
        model = YOLO(model_file_name)
        downloaded_path = Path(model_file_name)
        target_path = self.model_dir / model_file_name

        if downloaded_path.exists() and not target_path.exists():
            self.model_dir.mkdir(exist_ok=True)
            shutil.move(str(downloaded_path), str(target_path))
            self._models[model_name] = target_path

        return model

    @staticmethod
    def _infer_task(model_name: str) -> str:
        if model_name.endswith("-seg"):
            return "segmentation"
        if model_name.endswith("-pose"):
            return "pose"
        if model_name.endswith("-cls"):
            return "classification"
        return "detection"


model_registry = ModelRegistry()

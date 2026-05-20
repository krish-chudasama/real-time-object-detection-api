from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

UPLOADS_DIR = BASE_DIR / "uploads"
OUTPUTS_DIR = BASE_DIR / "outputs"
MODELS_DIR = BASE_DIR / "models"

UPLOADS_DIR.mkdir(exist_ok=True)
OUTPUTS_DIR.mkdir(exist_ok=True)
MODELS_DIR.mkdir(exist_ok=True)

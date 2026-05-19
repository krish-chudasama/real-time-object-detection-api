from ultralytics import YOLO

models = [
    "yolov8n.pt",
    "yolov8s.pt",
    "yolo11n.pt",
    "yolov8n-seg.pt",
    "yolov8n-pose.pt"
]

for model_name in models:
    print(f"Downloading {model_name}")
    YOLO(model_name)
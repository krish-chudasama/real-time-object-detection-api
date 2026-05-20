from ultralytics import YOLO

models = [
    # === YOLO26 Models ===
    "yolo26n.pt", "yolo26s.pt", "yolo26m.pt", "yolo26l.pt", "yolo26x.pt",
    "yolo26n-seg.pt", "yolo26s-seg.pt", "yolo26m-seg.pt", "yolo26l-seg.pt", "yolo26x-seg.pt",
    "yolo26n-pose.pt", "yolo26s-pose.pt", "yolo26m-pose.pt", "yolo26l-pose.pt", "yolo26x-pose.pt",
    "yolo26n-cls.pt", "yolo26s-cls.pt", "yolo26m-cls.pt", "yolo26l-cls.pt", "yolo26x-cls.pt",
    "yolo26n-obb.pt", "yolo26s-obb.pt", "yolo26m-obb.pt", "yolo26l-obb.pt", "yolo26x-obb.pt",

    # === YOLO11 Models ===
    "yolo11n.pt", "yolo11s.pt", "yolo11m.pt", "yolo11l.pt", "yolo11x.pt",
    "yolo11n-seg.pt", "yolo11s-seg.pt", "yolo11m-seg.pt", "yolo11l-seg.pt", "yolo11x-seg.pt",
    "yolo11n-pose.pt", "yolo11s-pose.pt", "yolo11m-pose.pt", "yolo11l-pose.pt", "yolo11x-pose.pt",
    "yolo11n-cls.pt", "yolo11s-cls.pt", "yolo11m-cls.pt", "yolo11l-cls.pt", "yolo11x-cls.pt",
    "yolo11n-obb.pt", "yolo11s-obb.pt", "yolo11m-obb.pt", "yolo11l-obb.pt", "yolo11x-obb.pt",

    # === YOLOv8 Models ===
    "yolov8n.pt", "yolov8s.pt", "yolov8m.pt", "yolov8l.pt", "yolov8x.pt",
    "yolov8n-seg.pt", "yolov8s-seg.pt", "yolov8m-seg.pt", "yolov8l-seg.pt", "yolov8x-seg.pt",
    "yolov8n-pose.pt", "yolov8s-pose.pt", "yolov8m-pose.pt", "yolov8l-pose.pt", "yolov8x-pose.pt",
    "yolov8n-cls.pt", "yolov8s-cls.pt", "yolov8m-cls.pt", "yolov8l-cls.pt", "yolov8x-cls.pt",
    "yolov8n-obb.pt", "yolov8s-obb.pt", "yolov8m-obb.pt", "yolov8l-obb.pt", "yolov8x-obb.pt"
]

for model_name in models:
    print(f"\n--- Downloading and initializing: {model_name} ---")
    try:
        YOLO(model_name)
    except Exception as e:
        print(f"Error loading {model_name}: {e}")

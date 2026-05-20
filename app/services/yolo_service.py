import time
from pathlib import Path

import cv2

from app.services.model_registry import ModelRegistry
from app.utils.paths import OUTPUTS_DIR


class YOLOService:
    def __init__(self):
        self.registry = ModelRegistry()

    def detect_image(self, model_name: str, image_path: Path):
        model = self.registry.load_model(model_name)

        start_time = time.time()
        results = model(str(image_path))
        end_time = time.time()

        inference_time = round((end_time - start_time) * 1000, 2)

        result = results[0]

        output_path = OUTPUTS_DIR / f"detected_{image_path.name}"

        result.save(filename=str(output_path))

        detections = []

        for box in result.boxes:
            class_id = int(box.cls[0])

            detections.append({
                "class_id": class_id,
                "class_name": model.names[class_id],
                "confidence": round(float(box.conf[0]), 4)
            })

        return {
            "type": "image",
            "detections": detections,
            "output_image": str(output_path),
            "inference_time_ms": inference_time
        }

    def detect_video(self, model_name: str, video_path: Path):
        model = self.registry.load_model(model_name)

        cap = cv2.VideoCapture(str(video_path))

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))

        output_path = OUTPUTS_DIR / f"detected_{video_path.name}"

        fourcc = cv2.VideoWriter_fourcc(*"mp4v")

        out = cv2.VideoWriter(
            str(output_path),
            fourcc,
            fps,
            (width, height)
        )

        frame_count = 0

        start_time = time.time()

        while True:
            success, frame = cap.read()

            if not success:
                break

            results = model(frame)

            annotated_frame = results[0].plot()

            out.write(annotated_frame)

            frame_count += 1

        end_time = time.time()

        cap.release()
        out.release()

        processing_time = round(end_time - start_time, 2)

        return {
            "type": "video",
            "frames_processed": frame_count,
            "processing_time_sec": processing_time,
            "output_video": str(output_path)
        }

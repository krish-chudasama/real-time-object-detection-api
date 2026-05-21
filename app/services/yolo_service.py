import time
from collections import Counter
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
        fps = round(1000 / inference_time, 2) if inference_time > 0 else 0

        result = results[0]

        output_path = self._output_path(model_name, image_path)

        result.save(filename=str(output_path))

        detections = self._extract_detections(result, model.names)

        return {
            "type": "image",
            "model_name": model_name,
            "detections": detections,
            "detection_counts": self._group_counts(detections),
            "total_detections": len(detections),
            "output_image": str(output_path),
            "output_path": str(output_path),
            "inference_time_ms": inference_time,
            "fps": fps,
        }

    def detect_video(self, model_name: str, video_path: Path):
        model = self.registry.load_model(model_name)

        cap = cv2.VideoCapture(str(video_path))

        if not cap.isOpened():
            raise ValueError("Unable to open video file")

        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        source_fps = cap.get(cv2.CAP_PROP_FPS) or 24
        writer_fps = int(source_fps) if source_fps > 0 else 24

        output_path = self._output_path(model_name, video_path, force_suffix=".mp4")

        fourcc = cv2.VideoWriter_fourcc(*"mp4v")

        out = cv2.VideoWriter(
            str(output_path),
            fourcc,
            writer_fps,
            (width, height)
        )

        frame_count = 0
        detections = []
        aggregate_counts = Counter()

        start_time = time.time()

        while True:
            success, frame = cap.read()

            if not success:
                break

            results = model(frame)
            frame_detections = self._extract_detections(results[0], model.names)

            annotated_frame = results[0].plot()

            out.write(annotated_frame)
            aggregate_counts.update(detection["class_name"] for detection in frame_detections)
            detections.extend(
                {
                    **detection,
                    "frame": frame_count,
                }
                for detection in frame_detections
            )

            frame_count += 1

        end_time = time.time()

        cap.release()
        out.release()

        processing_time = round(end_time - start_time, 2)
        inference_time_ms = round(processing_time * 1000, 2)
        effective_fps = round(frame_count / processing_time, 2) if processing_time > 0 else 0

        return {
            "type": "video",
            "model_name": model_name,
            "frames_processed": frame_count,
            "processing_time_sec": processing_time,
            "inference_time_ms": inference_time_ms,
            "fps": effective_fps,
            "source_fps": round(source_fps, 2),
            "detections": detections[:500],
            "detections_truncated": len(detections) > 500,
            "detection_counts": dict(sorted(aggregate_counts.items())),
            "total_detections": sum(aggregate_counts.values()),
            "output_video": str(output_path),
            "output_path": str(output_path),
        }

    def run_detection(self, model_name: str, media_path: Path):
        extension = media_path.suffix.lower()

        if extension in {".jpg", ".jpeg", ".png"}:
            return self.detect_image(model_name, media_path)

        if extension in {".mp4", ".avi", ".mov"}:
            return self.detect_video(model_name, media_path)

        raise ValueError("Unsupported file format")

    @staticmethod
    def _extract_detections(result, names):
        detections = []
        boxes = getattr(result, "boxes", None)

        if boxes is None:
            return detections

        for box in boxes:
            class_id = int(box.cls[0])
            xyxy = box.xyxy[0].detach().cpu().numpy().tolist() if hasattr(box, "xyxy") else []

            detections.append({
                "class_id": class_id,
                "class_name": names.get(class_id, str(class_id)) if isinstance(names, dict) else names[class_id],
                "confidence": round(float(box.conf[0]), 4),
                "bbox": [round(float(value), 2) for value in xyxy],
            })

        return detections

    @staticmethod
    def _group_counts(detections):
        return dict(sorted(Counter(detection["class_name"] for detection in detections).items()))

    @staticmethod
    def _output_path(model_name: str, input_path: Path, force_suffix: str | None = None):
        safe_model = "".join(character if character.isalnum() else "_" for character in model_name)
        suffix = force_suffix or input_path.suffix
        return OUTPUTS_DIR / f"{input_path.stem}_{safe_model}_{int(time.time() * 1000)}{suffix}"

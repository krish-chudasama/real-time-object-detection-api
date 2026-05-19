from pathlib import Path

from app.models.detection import Detection, DetectionResponse
from app.services.model_registry import model_registry
from app.utils.paths import OUTPUT_DIR


class YOLOService:
    def detect_image(self, input_path: Path, model_name: str | None = None) -> DetectionResponse:
        model = model_registry.get_model(model_name)
        output_path = OUTPUT_DIR / input_path.name
        results = model(str(input_path))
        result = results[0]
        result.save(filename=str(output_path))

        detections = []
        boxes = result.boxes if result.boxes is not None else []
        for box in boxes:
            class_id = int(box.cls[0])
            detections.append(
                Detection(
                    class_id=class_id,
                    class_name=model.names[class_id],
                    confidence=round(float(box.conf[0]), 2),
                )
            )

        return DetectionResponse(
            detections=detections,
            output_image=str(output_path),
        )


yolo_service = YOLOService()

from pydantic import BaseModel


class Detection(BaseModel):
    class_id: int
    class_name: str
    confidence: float


class DetectionResponse(BaseModel):
    detections: list[Detection]
    output_image: str

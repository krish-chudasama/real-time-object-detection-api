from collections import defaultdict
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

router = APIRouter()


def parse_yolo_rows(content: str):
    rows = []

    for line in content.splitlines():
        parts = line.strip().split()

        if len(parts) < 5:
            continue

        try:
            class_id = int(float(parts[0]))
            x_center, y_center, width, height = [float(value) for value in parts[1:5]]
            confidence = float(parts[5]) if len(parts) > 5 else None
        except ValueError:
            continue

        x1 = x_center - width / 2
        y1 = y_center - height / 2
        x2 = x_center + width / 2
        y2 = y_center + height / 2

        rows.append({
            "class_id": class_id,
            "bbox": (x1, y1, x2, y2),
            "confidence": confidence,
        })

    return rows


def bbox_iou(first, second):
    ax1, ay1, ax2, ay2 = first
    bx1, by1, bx2, by2 = second

    inter_x1 = max(ax1, bx1)
    inter_y1 = max(ay1, by1)
    inter_x2 = min(ax2, bx2)
    inter_y2 = min(ay2, by2)

    inter_width = max(0, inter_x2 - inter_x1)
    inter_height = max(0, inter_y2 - inter_y1)
    intersection = inter_width * inter_height

    first_area = max(0, ax2 - ax1) * max(0, ay2 - ay1)
    second_area = max(0, bx2 - bx1) * max(0, by2 - by1)
    union = first_area + second_area - intersection

    return intersection / union if union > 0 else 0


async def read_upload_map(files: List[UploadFile]):
    parsed = {}

    for file in files:
        stem = Path(file.filename or "upload").stem
        content = (await file.read()).decode("utf-8", errors="ignore")
        parsed[stem] = parse_yolo_rows(content)

    return parsed


def score_image(labels, predictions, iou_threshold: float):
    matched_label_indices = set()
    tp = 0
    fp = 0

    sorted_predictions = sorted(
        predictions,
        key=lambda item: item["confidence"] if item["confidence"] is not None else 1,
        reverse=True,
    )

    for prediction in sorted_predictions:
        best_index = None
        best_iou = 0

        for index, label in enumerate(labels):
            if index in matched_label_indices:
                continue

            if prediction["class_id"] != label["class_id"]:
                continue

            iou = bbox_iou(prediction["bbox"], label["bbox"])

            if iou > best_iou:
                best_iou = iou
                best_index = index

        if best_index is not None and best_iou >= iou_threshold:
            matched_label_indices.add(best_index)
            tp += 1
        else:
            fp += 1

    fn = len(labels) - len(matched_label_indices)
    return tp, fp, fn


@router.post("/evaluate")
async def evaluate(
    labels: List[UploadFile] = File(...),
    predictions: List[UploadFile] = File(...),
    dataset_yaml: Optional[UploadFile] = File(None),
    iou_threshold: float = Form(0.5),
):
    if not 0 < iou_threshold <= 1:
        raise HTTPException(status_code=400, detail="IoU threshold must be between 0 and 1")

    label_map = await read_upload_map(labels)
    prediction_map = await read_upload_map(predictions)
    all_keys = sorted(set(label_map) | set(prediction_map))

    totals = defaultdict(int)
    per_file = []

    for key in all_keys:
        tp, fp, fn = score_image(label_map.get(key, []), prediction_map.get(key, []), iou_threshold)
        totals["TP"] += tp
        totals["FP"] += fp
        totals["FN"] += fn
        per_file.append({
            "file": key,
            "TP": tp,
            "FP": fp,
            "FN": fn,
        })

    dataset_yaml_name = dataset_yaml.filename if dataset_yaml else None

    return {
        "TP": totals["TP"],
        "FP": totals["FP"],
        "FN": totals["FN"],
        "iou_threshold": iou_threshold,
        "dataset_yaml": dataset_yaml_name,
        "files_evaluated": len(all_keys),
        "per_file": per_file,
    }

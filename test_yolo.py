from ultralytics import YOLO

model = YOLO("yolov8n.pt")

results = model("uploads/test.jpg")

results[0].save(filename="outputs/result.jpg")

print(results[0].boxes)
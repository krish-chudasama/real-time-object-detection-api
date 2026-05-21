import axios from "axios"

export const API_BASE_URL = "http://127.0.0.1:8000"

const api = axios.create({
  baseURL: API_BASE_URL,
})

export async function fetchModels() {
  const response = await api.get("/models")
  return response.data
}

export async function uploadModel(file, onUploadProgress) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await api.post("/upload-model", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  })

  return response.data
}

export async function compareModels({ modelNames, files }) {
  const formData = new FormData()

  modelNames.forEach((modelName) => formData.append("model_names", modelName))
  files.forEach((file) => formData.append("files", file))

  const response = await api.post("/compare", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}

export async function evaluateModel({ labels, predictions, datasetYaml, iouThreshold }) {
  const formData = new FormData()

  labels.forEach((file) => formData.append("labels", file))
  predictions.forEach((file) => formData.append("predictions", file))

  if (datasetYaml) {
    formData.append("dataset_yaml", datasetYaml)
  }

  formData.append("iou_threshold", iouThreshold)

  const response = await api.post("/evaluate", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}

export function getOutputUrl(outputPath) {
  if (!outputPath) {
    return null
  }

  const normalizedPath = outputPath.replace(/\\/g, "/")
  const fileName = normalizedPath.split("/").pop()

  return `${API_BASE_URL}/outputs/${encodeURIComponent(fileName)}`
}

export default api

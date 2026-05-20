import axios from "axios"

export const API_BASE_URL = "http://127.0.0.1:8000"

const api = axios.create({
  baseURL: API_BASE_URL,
})

export function getOutputUrl(outputPath) {
  if (!outputPath) {
    return null
  }

  const normalizedPath = outputPath.replace(/\\/g, "/")
  const fileName = normalizedPath.split("/").pop()

  return `${API_BASE_URL}/outputs/${encodeURIComponent(fileName)}`
}

export default api

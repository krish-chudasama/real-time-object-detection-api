import { AlertCircle, Bot, ChevronDown, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"

import api from "../services/api"

function ModelSelector({ selectedModel, onModelChange, disabled }) {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function fetchModels() {
      setLoading(true)
      setError("")

      try {
        const response = await api.get("/models")
        const availableModels = response.data.available_models || []

        if (!active) {
          return
        }

        setModels(availableModels)

        if (!selectedModel && availableModels.length > 0) {
          onModelChange(availableModels[0])
        }
      } catch (fetchError) {
        if (active) {
          setError("Backend unavailable")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchModels()

    return () => {
      active = false
    }
  }, [onModelChange, selectedModel])

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-cyan-300" />
          <h2 className="text-sm font-medium text-zinc-100">YOLO Model</h2>
        </div>
        {loading ? (
          <RefreshCw className="h-4 w-4 animate-spin text-zinc-500" />
        ) : null}
      </div>

      <div className="relative">
        <select
          value={selectedModel}
          onChange={(event) => onModelChange(event.target.value)}
          disabled={disabled || loading || models.length === 0}
          className="h-11 w-full appearance-none rounded-md border border-zinc-800 bg-zinc-900 px-3 pr-10 text-sm text-zinc-100 outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {models.length === 0 ? (
            <option value="">No models found</option>
          ) : (
            models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))
          )}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-zinc-500" />
      </div>

      {error ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="h-4 w-4" />
          <span>{error}. Start FastAPI on port 8000.</span>
        </div>
      ) : (
        <p className="mt-3 text-xs text-zinc-500">{models.length} models discovered from backend.</p>
      )}
    </section>
  )
}

export default ModelSelector

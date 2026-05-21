import { Loader2, Play, UploadCloud } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import CompareView from "../components/CompareView"
import LoadingOverlay from "../components/LoadingOverlay"
import ModelSelector from "../components/ModelSelector"
import UploadZone from "../components/UploadZone"
import { compareModels, fetchModels, uploadModel } from "../services/api"

const SELECTED_MODELS_KEY = "benchmark:selectedModels"
const LAST_RUN_KEY = "benchmark:lastRun"

function readStoredModels() {
  try {
    return JSON.parse(localStorage.getItem(SELECTED_MODELS_KEY) || "[]")
  } catch {
    return []
  }
}

function Compare({ initialMode = "pretrained" }) {
  const [mode, setMode] = useState(initialMode)
  const [models, setModels] = useState([])
  const [selectedModels, setSelectedModels] = useState(readStoredModels)
  const [files, setFiles] = useState([])
  const [customModelFile, setCustomModelFile] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [results, setResults] = useState([])
  const [selectedItemIndex, setSelectedItemIndex] = useState(0)
  const [modelsLoading, setModelsLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  const selectedItem = results[selectedItemIndex] || null
  const sourceFilter = mode === "custom" ? "custom" : "pretrained"
  const canRun = selectedModels.length > 0 && files.length > 0 && !processing

  const selectedModelSummary = useMemo(() => {
    return selectedModels.length === 1 ? selectedModels[0] : `${selectedModels.length} models selected`
  }, [selectedModels])

  async function refreshModels() {
    setModelsLoading(true)
    setError("")

    try {
      const data = await fetchModels()
      setModels(data.models || [])
    } catch (modelError) {
      setError(modelError.response?.data?.detail || "Unable to fetch backend model registry")
    } finally {
      setModelsLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    fetchModels()
      .then((data) => {
        if (active) {
          setModels(data.models || [])
        }
      })
      .catch((modelError) => {
        if (active) {
          setError(modelError.response?.data?.detail || "Unable to fetch backend model registry")
        }
      })
      .finally(() => {
        if (active) {
          setModelsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(SELECTED_MODELS_KEY, JSON.stringify(selectedModels))
  }, [selectedModels])

  async function handleCustomModelUpload() {
    if (!customModelFile[0]) {
      return
    }

    setProcessing(true)
    setError("")
    setUploadProgress(0)

    try {
      const data = await uploadModel(customModelFile[0], (event) => {
        if (event.total) {
          setUploadProgress(Math.round((event.loaded * 100) / event.total))
        }
      })
      await refreshModels()
      setSelectedModels((current) => Array.from(new Set([...current, data.model_name])))
      setCustomModelFile([])
    } catch (uploadError) {
      setError(uploadError.response?.data?.detail || uploadError.message || "Model upload failed")
    } finally {
      setProcessing(false)
    }
  }

  async function runBenchmark() {
    if (!canRun) {
      return
    }

    setProcessing(true)
    setError("")
    setResults([])
    setSelectedItemIndex(0)

    try {
      const data = await compareModels({ modelNames: selectedModels, files })
      setResults(data.items || [])
      localStorage.setItem(
        LAST_RUN_KEY,
        JSON.stringify({
          models: selectedModels,
          files: files.map((file) => file.name),
          createdAt: new Date().toISOString(),
        }),
      )
    } catch (benchmarkError) {
      setError(benchmarkError.response?.data?.detail || benchmarkError.message || "Benchmark failed")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <LoadingOverlay
        show={processing}
        label={customModelFile[0] && !files.length ? "Uploading custom model" : `Running ${selectedModelSummary}`}
      />

      <aside className="space-y-5">
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-2">
          {[
            ["pretrained", "Pretrained"],
            ["custom", "Custom"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`rounded-md px-3 py-2 text-sm transition ${
                mode === id ? "bg-cyan-300 text-black" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "custom" ? (
          <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <UploadZone
              files={customModelFile}
              onFilesChange={setCustomModelFile}
              disabled={processing}
              title="Custom .pt Model"
              description="Upload a trained Ultralytics checkpoint. It will be saved in models/custom."
              accept={{ "application/octet-stream": [".pt"] }}
              multiple={false}
            />
            {uploadProgress > 0 ? (
              <div className="h-2 overflow-hidden rounded bg-zinc-800">
                <div className="h-full bg-cyan-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            ) : null}
            <button
              type="button"
              onClick={handleCustomModelUpload}
              disabled={!customModelFile[0] || processing}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-zinc-700 text-sm text-zinc-100 transition hover:border-cyan-300 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              Upload Model
            </button>
          </div>
        ) : null}

        <ModelSelector
          models={models}
          selectedModels={selectedModels}
          onChange={setSelectedModels}
          loading={modelsLoading}
          disabled={processing}
          error={error && models.length === 0 ? error : ""}
          sourceFilter={sourceFilter}
        />

        <UploadZone files={files} onFilesChange={setFiles} disabled={processing} />

        <button
          type="button"
          onClick={runBenchmark}
          disabled={!canRun}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run Benchmark
        </button>

        {error && models.length > 0 ? (
          <div className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {results.length > 1 ? (
          <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="mb-3 text-sm font-medium text-zinc-100">Inference Queue</h2>
            <div className="space-y-2">
              {results.map((item, index) => (
                <button
                  key={`${item.file_name}-${index}`}
                  type="button"
                  onClick={() => setSelectedItemIndex(index)}
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                    selectedItemIndex === index
                      ? "border-cyan-300 bg-cyan-400/10 text-cyan-100"
                      : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
                  }`}
                >
                  {item.file_name}
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </aside>

      <CompareView item={selectedItem} />
    </section>
  )
}

export default Compare

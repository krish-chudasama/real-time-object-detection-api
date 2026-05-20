import { BrainCircuit, Play, Server, Sparkles } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

import DetectionViewer from "../components/DetectionViewer"
import LoadingOverlay from "../components/LoadingOverlay"
import ModelSelector from "../components/ModelSelector"
import StatsPanel from "../components/StatsPanel"
import UploadZone from "../components/UploadZone"
import api, { getOutputUrl } from "../services/api"

function Home() {
  const [selectedModel, setSelectedModel] = useState("")
  const [files, setFiles] = useState([])
  const [results, setResults] = useState([])
  const [selectedResultIndex, setSelectedResultIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const selectedResult = results[selectedResultIndex] || null
  const selectedFile = selectedResult?.file || files[0] || null
  const outputUrl = useMemo(() => {
    if (!selectedResult?.result) {
      return null
    }

    return getOutputUrl(selectedResult.result.output_image || selectedResult.result.output_video)
  }, [selectedResult])

  const canRun = selectedModel && files.length > 0 && !loading

  const runDetection = useCallback(async () => {
    if (!canRun) {
      return
    }

    setLoading(true)
    setError("")
    setResults([])
    setSelectedResultIndex(0)

    const completedResults = []

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append("model_name", selectedModel)
        formData.append("file", file)

        const response = await api.post("/detect", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        if (response.data.error) {
          throw new Error(`${file.name}: ${response.data.error}`)
        }

        completedResults.push({
          file,
          result: response.data,
        })

        setResults([...completedResults])
      }
    } catch (detectError) {
      setError(detectError.response?.data?.detail || detectError.message || "Detection failed")
    } finally {
      setLoading(false)
    }
  }, [canRun, files, selectedModel])

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <LoadingOverlay show={loading} label={`Running ${selectedModel || "YOLO"} inference`} />

      <div className="border-b border-zinc-900 bg-zinc-950/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              Multi-model inference console
            </div>
            <h1 className="text-2xl font-semibold text-white lg:text-3xl">YOLO Detection Platform</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Select a local YOLO model, upload media, run backend inference, and inspect outputs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3">
              <div className="flex items-center gap-2 text-zinc-500">
                <Server className="h-4 w-4" />
                Backend
              </div>
              <p className="mt-1 text-zinc-100">FastAPI</p>
            </div>
            <div className="rounded-md border border-zinc-800 bg-zinc-950 px-4 py-3">
              <div className="flex items-center gap-2 text-zinc-500">
                <BrainCircuit className="h-4 w-4" />
                Engine
              </div>
              <p className="mt-1 text-zinc-100">Ultralytics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-5 xl:grid-cols-[390px_1fr]">
        <aside className="space-y-5">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            disabled={loading}
          />

          <UploadZone files={files} onFilesChange={setFiles} disabled={loading} />

          <button
            type="button"
            onClick={runDetection}
            disabled={!canRun}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            <Play className="h-4 w-4" />
            {loading ? "Running Detection" : "Run Detection"}
          </button>

          {error ? (
            <div className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {results.length > 1 ? (
            <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <h2 className="mb-3 text-sm font-medium text-zinc-100">Completed Files</h2>
              <div className="space-y-2">
                {results.map((item, index) => (
                  <button
                    key={`${item.file.name}-${index}`}
                    type="button"
                    onClick={() => setSelectedResultIndex(index)}
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                      selectedResultIndex === index
                        ? "border-cyan-300 bg-cyan-400/10 text-cyan-100"
                        : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
                    }`}
                  >
                    {item.file.name}
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </aside>

        <section className="space-y-5">
          <DetectionViewer selectedFile={selectedFile} result={selectedResult?.result} outputUrl={outputUrl} />
          <StatsPanel result={selectedResult?.result} fileName={selectedFile?.name} />
        </section>
      </div>
    </main>
  )
}

export default Home

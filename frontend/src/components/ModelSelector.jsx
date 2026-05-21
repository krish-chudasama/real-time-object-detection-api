import { AlertCircle, Bot, Check, RefreshCw, Search } from "lucide-react"
import { useMemo, useState } from "react"

function ModelSelector({ models, selectedModels, onChange, disabled, loading, error, sourceFilter = "all" }) {
  const [query, setQuery] = useState("")

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesSource = sourceFilter === "all" || model.source === sourceFilter
      const matchesQuery = model.name.toLowerCase().includes(query.toLowerCase())
      return matchesSource && matchesQuery
    })
  }, [models, query, sourceFilter])

  function toggleModel(modelName) {
    if (selectedModels.includes(modelName)) {
      onChange(selectedModels.filter((selected) => selected !== modelName))
      return
    }

    onChange([...selectedModels, modelName])
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-cyan-300" />
          <h2 className="text-sm font-medium text-zinc-100">YOLO Models</h2>
        </div>
        {loading ? (
          <RefreshCw className="h-4 w-4 animate-spin text-zinc-500" />
        ) : null}
      </div>

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-500" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search YOLOv8, YOLO11, YOLO26, custom..."
          disabled={disabled}
          className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 pl-9 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      {error ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-red-300">
          <AlertCircle className="h-4 w-4" />
          <span>{error}. Start FastAPI on port 8000.</span>
        </div>
      ) : (
        <p className="mb-3 text-xs text-zinc-500">
          {selectedModels.length} selected from {filteredModels.length} available models.
        </p>
      )}

      <div className="max-h-72 space-y-2 overflow-auto pr-1">
        {filteredModels.length > 0 ? (
          filteredModels.map((model) => {
            const selected = selectedModels.includes(model.name)

            return (
              <button
                key={model.name}
                type="button"
                disabled={disabled}
                onClick={() => toggleModel(model.name)}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition ${
                  selected
                    ? "border-cyan-300 bg-cyan-400/10 text-cyan-100"
                    : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm">{model.name}</span>
                  <span className="mt-1 block text-xs text-zinc-500">
                    {model.family} | {model.source} | {model.size_mb} MB
                  </span>
                </span>
                <span className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  selected ? "border-cyan-300 bg-cyan-300 text-black" : "border-zinc-700"
                }`}>
                  {selected ? <Check className="h-3.5 w-3.5" /> : null}
                </span>
              </button>
            )
          })
        ) : (
          <div className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-8 text-center text-sm text-zinc-500">
            No models match this view.
          </div>
        )}
      </div>
    </section>
  )
}

export default ModelSelector

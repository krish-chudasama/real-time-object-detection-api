import { Activity, Gauge, Layers, Timer } from "lucide-react"

function StatsPanel({ result, fileName }) {
  const detectionCounts = result?.detection_counts || {}
  const uniqueClasses = Object.keys(detectionCounts)
  const totalDetections = result?.total_detections ?? 0
  const timeLabel = `${result?.inference_time_ms ?? 0}ms`

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-4">
        <h2 className="text-sm font-medium text-zinc-100">Detection Stats</h2>
        <p className="mt-1 truncate text-xs text-zinc-500">
          {result?.model_name || "No model"} {fileName ? `/ ${fileName}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
            <Layers className="h-4 w-4" />
            Detections
          </div>
          <p className="text-2xl font-semibold text-zinc-100">{totalDetections}</p>
        </div>

        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
            <Timer className="h-4 w-4" />
            Runtime
          </div>
          <p className="text-2xl font-semibold text-zinc-100">{timeLabel}</p>
        </div>

        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
            <Activity className="h-4 w-4" />
            Type
          </div>
          <p className="text-2xl font-semibold capitalize text-zinc-100">{result?.type || "-"}</p>
        </div>

        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500">
            <Gauge className="h-4 w-4" />
            FPS
          </div>
          <p className="text-2xl font-semibold text-zinc-100">{result?.fps ?? 0}</p>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Detected Classes
        </div>
        <div className="max-h-64 overflow-auto p-2">
          {uniqueClasses.length > 0 ? (
            uniqueClasses.map((className) => (
              <div
                key={className}
                className="flex items-center justify-between rounded-md px-2 py-2 text-sm"
              >
                <span className="text-zinc-200">{className}</span>
                <span className="font-mono text-xs text-cyan-300">{detectionCounts[className]}</span>
              </div>
            ))
          ) : (
            <p className="px-2 py-6 text-center text-sm text-zinc-500">No detections to show.</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default StatsPanel

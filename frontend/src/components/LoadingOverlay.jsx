import { Loader2 } from "lucide-react"

function LoadingOverlay({ show, label }) {
  if (!show) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-6 py-5 text-center shadow-2xl">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-300" />
        <p className="mt-3 text-sm font-medium text-zinc-100">{label || "Running inference"}</p>
        <p className="mt-1 text-xs text-zinc-500">Processing with the selected YOLO model.</p>
      </div>
    </div>
  )
}

export default LoadingOverlay

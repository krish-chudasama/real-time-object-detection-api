import { Download, ImageIcon, Video } from "lucide-react"

import { getOutputUrl } from "../services/api"
import StatsPanel from "./StatsPanel"

function MediaOutput({ result }) {
  const outputUrl = getOutputUrl(result?.output_path || result?.output_image || result?.output_video)
  const isVideo = result?.type === "video"

  return (
    <div className="overflow-hidden rounded-md border border-zinc-800 bg-black">
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400">
        <span className="flex items-center gap-2">
          {isVideo ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
          {result?.model_name}
        </span>
        {outputUrl ? (
          <a href={outputUrl} download className="rounded p-1 text-zinc-500 transition hover:text-cyan-200">
            <Download className="h-4 w-4" />
          </a>
        ) : null}
      </div>
      <div className="flex aspect-video items-center justify-center">
        {outputUrl ? (
          isVideo ? (
            <video src={outputUrl} controls className="h-full w-full object-contain" />
          ) : (
            <img src={outputUrl} alt={`${result?.model_name} output`} className="h-full w-full object-contain" />
          )
        ) : (
          <p className="text-sm text-zinc-600">No output.</p>
        )}
      </div>
    </div>
  )
}

function CompareView({ item }) {
  if (!item) {
    return (
      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-8 text-center">
        <p className="text-sm text-zinc-500">Run a benchmark to compare model outputs side by side.</p>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">Current batch item</p>
        <h2 className="mt-1 truncate text-lg font-semibold text-zinc-100">{item.file_name}</h2>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {item.results.map((result) => (
          <article key={`${item.file_name}-${result.model_name}`} className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <MediaOutput result={result} />
            <StatsPanel result={result} fileName={item.file_name} />
          </article>
        ))}
      </div>
    </section>
  )
}

export default CompareView

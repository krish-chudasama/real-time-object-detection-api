import { Download, ImageIcon, Video } from "lucide-react"
import { useEffect, useMemo } from "react"

function DetectionViewer({ selectedFile, result, outputUrl }) {
  const originalUrl = useMemo(() => {
    if (!selectedFile) {
      return null
    }

    return URL.createObjectURL(selectedFile)
  }, [selectedFile])

  useEffect(() => {
    return () => {
      if (originalUrl) {
        URL.revokeObjectURL(originalUrl)
      }
    }
  }, [originalUrl])

  const isVideo = selectedFile?.type.startsWith("video/") || result?.type === "video"

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-zinc-100">Detection Viewer</h2>
          <p className="mt-1 text-xs text-zinc-500">Original input and processed backend output.</p>
        </div>
        {outputUrl ? (
          <a
            href={outputUrl}
            download
            className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-100 transition hover:border-cyan-300 hover:text-cyan-200"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-md border border-zinc-800 bg-black">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400">
            {isVideo ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
            Original
          </div>
          <div className="flex aspect-video items-center justify-center">
            {originalUrl ? (
              isVideo ? (
                <video src={originalUrl} controls className="h-full w-full object-contain" />
              ) : (
                <img src={originalUrl} alt="Original upload" className="h-full w-full object-contain" />
              )
            ) : (
              <p className="text-sm text-zinc-600">Upload a file to preview it.</p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-zinc-800 bg-black">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2 text-xs text-zinc-400">
            {isVideo ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
            Processed
          </div>
          <div className="flex aspect-video items-center justify-center">
            {outputUrl ? (
              isVideo ? (
                <video src={outputUrl} controls className="h-full w-full object-contain" />
              ) : (
                <img src={outputUrl} alt="Processed detection output" className="h-full w-full object-contain" />
              )
            ) : (
              <p className="text-sm text-zinc-600">Run detection to view output.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default DetectionViewer

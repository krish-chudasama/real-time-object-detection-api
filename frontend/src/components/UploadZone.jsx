import { File, FileImage, FileVideo, Upload, X } from "lucide-react"
import { useCallback, useEffect, useMemo } from "react"
import { useDropzone } from "react-dropzone"

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FilePreview({ file }) {
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file])

  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  if (file.type.startsWith("image/")) {
    return <img src={previewUrl} alt={file.name} className="h-12 w-16 rounded object-cover" />
  }

  if (file.type.startsWith("video/")) {
    return <video src={previewUrl} className="h-12 w-16 rounded object-cover" muted />
  }

  return (
    <div className="flex h-12 w-16 items-center justify-center rounded bg-zinc-800 text-zinc-500">
      <File className="h-4 w-4" />
    </div>
  )
}

function UploadZone({
  files,
  onFilesChange,
  disabled,
  title = "Media Upload",
  description = "Supports JPG, PNG, MP4, AVI, and MOV. Multiple files can be queued for batch inference.",
  accept = {
    "image/*": [".jpg", ".jpeg", ".png"],
    "video/*": [".mp4", ".avi", ".mov"],
  },
  multiple = true,
}) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      onFilesChange(multiple ? [...files, ...acceptedFiles] : acceptedFiles.slice(0, 1))
    },
    [files, multiple, onFilesChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    disabled,
    accept,
  })

  function removeFile(indexToRemove) {
    onFilesChange(files.filter((_, index) => index !== indexToRemove))
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-zinc-100">{title}</h2>
        <p className="mt-1 text-xs text-zinc-500">{description}</p>
      </div>

      <div
        {...getRootProps()}
        className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-6 text-center transition ${
          isDragActive
            ? "border-cyan-300 bg-cyan-400/10"
            : "border-zinc-700 bg-zinc-900/70 hover:border-zinc-500"
        } ${disabled ? "pointer-events-none opacity-60" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-cyan-400/10 text-cyan-300">
          <Upload className="h-6 w-6" />
        </div>
        <p className="text-base font-medium text-zinc-100">
          {isDragActive ? "Drop files to queue" : "Drop files here or click to upload"}
        </p>
      </div>

      {files.length > 0 ? (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => {
            const isVideo = file.type.startsWith("video/")
            const Icon = isVideo ? FileVideo : FileImage

            return (
              <div
                key={`${file.name}-${file.lastModified}-${index}`}
                className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FilePreview file={file} />
                  <Icon className="h-4 w-4 shrink-0 text-cyan-300" />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-zinc-100">{file.name}</p>
                    <p className="text-xs text-zinc-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                  className="rounded-md p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

export default UploadZone

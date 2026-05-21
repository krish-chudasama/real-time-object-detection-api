import { Calculator, FileText, Loader2 } from "lucide-react"
import { useState } from "react"

import { evaluateModel } from "../services/api"
import UploadZone from "./UploadZone"

function EvaluationPanel() {
  const [labels, setLabels] = useState([])
  const [predictions, setPredictions] = useState([])
  const [datasetYaml, setDatasetYaml] = useState([])
  const [iouThreshold, setIouThreshold] = useState(0.5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState(null)

  const canEvaluate = labels.length > 0 && predictions.length > 0 && !loading

  async function runEvaluation() {
    if (!canEvaluate) {
      return
    }

    setLoading(true)
    setError("")

    try {
      const data = await evaluateModel({
        labels,
        predictions,
        datasetYaml: datasetYaml[0],
        iouThreshold,
      })
      setResult(data)
    } catch (evaluateError) {
      setError(evaluateError.response?.data?.detail || evaluateError.message || "Evaluation failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <div className="space-y-5">
        <UploadZone
          files={labels}
          onFilesChange={setLabels}
          disabled={loading}
          title="Ground Truth Labels"
          description="Upload YOLO-format .txt label files. File stems should match prediction file stems."
          accept={{ "text/plain": [".txt"] }}
        />

        <UploadZone
          files={predictions}
          onFilesChange={setPredictions}
          disabled={loading}
          title="Prediction Results"
          description="Upload YOLO-format prediction .txt files. Confidence values are optional."
          accept={{ "text/plain": [".txt"] }}
        />

        <UploadZone
          files={datasetYaml}
          onFilesChange={setDatasetYaml}
          disabled={loading}
          title="Dataset YAML"
          description="Optional YAML file for audit context."
          accept={{ "text/yaml": [".yaml", ".yml"], "text/plain": [".yaml", ".yml"] }}
          multiple={false}
        />

        <label className="block rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <span className="text-sm font-medium text-zinc-100">IoU Threshold</span>
          <input
            type="range"
            min="0.1"
            max="0.95"
            step="0.05"
            value={iouThreshold}
            onChange={(event) => setIouThreshold(Number(event.target.value))}
            className="mt-4 w-full accent-cyan-300"
          />
          <span className="mt-2 block font-mono text-sm text-cyan-300">{iouThreshold.toFixed(2)}</span>
        </label>

        <button
          type="button"
          onClick={runEvaluation}
          disabled={!canEvaluate}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-black transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
          Evaluate Model
        </button>

        {error ? (
          <div className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <div className="mb-5 flex items-center gap-2">
          <FileText className="h-4 w-4 text-cyan-300" />
          <h2 className="text-sm font-medium text-zinc-100">Evaluation Summary</h2>
        </div>

        {result ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              {["TP", "FP", "FN"].map((metric) => (
                <div key={metric} className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-xs text-zinc-500">{metric}</p>
                  <p className="mt-2 text-3xl font-semibold text-zinc-100">{result[metric]}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-md border border-zinc-800 bg-zinc-900">
              <div className="border-b border-zinc-800 px-3 py-2 text-xs uppercase tracking-wide text-zinc-500">
                Files evaluated: {result.files_evaluated}
              </div>
              <div className="max-h-96 overflow-auto p-2">
                {result.per_file.map((item) => (
                  <div key={item.file} className="grid grid-cols-4 rounded-md px-2 py-2 text-sm text-zinc-300">
                    <span className="truncate">{item.file}</span>
                    <span>TP {item.TP}</span>
                    <span>FP {item.FP}</span>
                    <span>FN {item.FN}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-80 items-center justify-center rounded-md border border-dashed border-zinc-800 bg-zinc-900/60 text-sm text-zinc-500">
            Upload labels and predictions to compute TP, FP, and FN totals.
          </div>
        )}
      </div>
    </section>
  )
}

export default EvaluationPanel

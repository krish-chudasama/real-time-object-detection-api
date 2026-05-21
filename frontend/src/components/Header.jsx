import { BrainCircuit, Cpu, Server } from "lucide-react"

function Header() {
  return (
    <header className="border-b border-zinc-900 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-200">
            <BrainCircuit className="h-3.5 w-3.5" />
            YOLO multi-model benchmarking
          </div>
          <h1 className="text-2xl font-semibold text-white lg:text-3xl">AI Model Benchmarking Platform</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">
            Compare pretrained and custom YOLO models on image and video batches with real backend inference.
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
              <Cpu className="h-4 w-4" />
              Engine
            </div>
            <p className="mt-1 text-zinc-100">Ultralytics YOLO</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

import { Boxes, UploadCloud } from "lucide-react"
import { motion } from "framer-motion"

function Home({ onSelectMode }) {
  const cards = [
    {
      id: "pretrained",
      title: "Use Pretrained YOLO Models",
      description: "Benchmark YOLOv8, YOLO11, YOLO26, and future local model families.",
      icon: Boxes,
    },
    {
      id: "custom",
      title: "Use Custom Trained Model",
      description: "Upload a .pt checkpoint into models/custom and include it in comparisons.",
      icon: UploadCloud,
    },
  ]

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      {cards.map((card, index) => {
        const Icon = card.icon

        return (
          <motion.button
            key={card.id}
            type="button"
            onClick={() => onSelectMode(card.id)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="group min-h-80 rounded-lg border border-zinc-800 bg-zinc-950 p-6 text-left transition hover:border-cyan-300/70 hover:bg-zinc-900"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-cyan-400/10 text-cyan-300 transition group-hover:bg-cyan-300 group-hover:text-black">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="mt-8 text-2xl font-semibold text-white">{card.title}</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">{card.description}</p>
            <div className="mt-10 inline-flex rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-200 transition group-hover:border-cyan-300 group-hover:text-cyan-200">
              Continue
            </div>
          </motion.button>
        )
      })}
    </section>
  )
}

export default Home

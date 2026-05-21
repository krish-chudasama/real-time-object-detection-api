import { BarChart3, Home, LineChart } from "lucide-react"

const navItems = [
  { id: "home", label: "Start", icon: Home },
  { id: "compare", label: "Benchmark", icon: BarChart3 },
  { id: "evaluate", label: "Evaluate", icon: LineChart },
]

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
      <nav className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = activePage === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm transition ${
                active
                  ? "bg-cyan-300 text-black"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar

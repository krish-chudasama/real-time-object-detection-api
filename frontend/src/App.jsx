import { useState } from "react"

import Header from "./components/Header"
import Sidebar from "./components/Sidebar"
import Compare from "./pages/Compare"
import Evaluate from "./pages/Evaluate"
import Home from "./pages/Home"

function App() {
  const [activePage, setActivePage] = useState("home")
  const [benchmarkMode, setBenchmarkMode] = useState("pretrained")

  function handleModeSelect(mode) {
    setBenchmarkMode(mode)
    setActivePage("compare")
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <Header />

      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-5 xl:grid-cols-[220px_1fr]">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />

        <div>
          {activePage === "home" ? <Home onSelectMode={handleModeSelect} /> : null}
          {activePage === "compare" ? <Compare initialMode={benchmarkMode} /> : null}
          {activePage === "evaluate" ? <Evaluate /> : null}
        </div>
      </div>
    </main>
  )
}

export default App

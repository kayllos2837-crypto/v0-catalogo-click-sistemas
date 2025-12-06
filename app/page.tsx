"use client"

import dynamic from "next/dynamic"

const App = dynamic(() => import("../App"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="animate-pulse text-foreground">Carregando...</div>
    </div>
  ),
})

export default function Page() {
  return <App />
}

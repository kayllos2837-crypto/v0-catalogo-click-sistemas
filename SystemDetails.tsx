"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { SystemHero } from "./components/system/SystemHero.tsx"
import { PlansSection } from "./components/system/PlansSection.tsx"
import { ComparisonSection } from "./components/system/ComparisonSection.tsx"
import { AdditionalServicesSection } from "./components/system/AdditionalServicesSection.tsx"
import { QuotationModal } from "./components/quotation/QuotationModal.tsx"
import {
  getSistemaById,
  getPlanosBySistema,
  getRecursosBySistema,
  getAdicionaisBySistema,
} from "./lib/supabase/data-service.ts"
import type { Sistema, Plano, Recurso, Adicional } from "./types.ts"

interface SystemDetailsProps {
  systemId: string
}

export const SystemDetails: React.FC<SystemDetailsProps> = ({ systemId }) => {
  const [system, setSystem] = useState<Sistema | null>(null)
  const [plans, setPlans] = useState<Plano[]>([])
  const [resources, setResources] = useState<Recurso[]>([])
  const [addons, setAddons] = useState<Adicional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      const [systemData, plansData, resourcesData, addonsData] = await Promise.all([
        getSistemaById(systemId),
        getPlanosBySistema(systemId),
        getRecursosBySistema(systemId),
        getAdicionaisBySistema(systemId),
      ])

      setSystem(systemData)
      setPlans(plansData.filter((p) => p.ativo))
      setResources(resourcesData)
      setAddons(addonsData.filter((a) => a.ativo))
      setIsLoading(false)
    }

    loadData()
    window.scrollTo(0, 0)
  }, [systemId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!system) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Sistema não encontrado</h2>
          <button onClick={() => (window.location.hash = "")} className="text-primary hover:underline">
            Voltar para o início
          </button>
        </div>
      </div>
    )
  }

  const handleQuotate = () => {
    setIsQuotationModalOpen(true)
  }

  return (
    <div className="flex flex-col min-h-screen animate-fade-in relative">
      <SystemHero system={system} onQuotate={handleQuotate} />

      <section className="py-8 bg-card border-b border-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <button
            onClick={handleQuotate}
            className="px-8 py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-lg rounded-btn shadow-glow hover:shadow-[0_0_30px_rgba(204,255,0,0.6)] hover:scale-105 transition-all duration-300"
          >
            Gerar Orçamento
          </button>
          <p className="mt-4 text-muted-foreground text-sm">
            Receba uma proposta personalizada em PDF instantaneamente.
          </p>
        </div>
      </section>

      <PlansSection plans={plans} system={system} />
      <ComparisonSection plans={plans} resources={resources} />
      <AdditionalServicesSection addons={addons} />

      <QuotationModal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        system={system}
        plans={plans}
        addons={addons}
        resources={resources}
      />
    </div>
  )
}

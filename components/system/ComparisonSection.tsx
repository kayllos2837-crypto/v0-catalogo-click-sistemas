"use client"

import React, { useState } from "react"
import { Check, X } from "lucide-react"
import type { Plano, Recurso } from "../../types"

interface ComparisonSectionProps {
  plans: Plano[]
  resources: Recurso[]
}

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({ plans, resources }) => {
  const sortedPlans = [...plans].sort((a, b) => a.ordemExibicao - b.ordemExibicao)
  const sortedResources = [...resources].sort((a, b) => a.ordemExibicao - b.ordemExibicao)

  // Group resources by category
  const categories = Array.from(new Set(sortedResources.map((r) => r.categoria || "Geral")))

  // Mobile state
  const popularPlan = sortedPlans.find((p) => p.destaquePopular) || sortedPlans[0]
  const [selectedMobilePlanId, setSelectedMobilePlanId] = useState<string>(popularPlan?.id || "")

  return (
    <section className="py-20 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Comparativo de Funcionalidades</h2>
          <p className="text-muted-foreground text-lg">
            Veja detalhadamente o que cada plano oferece para seu negócio.
          </p>
        </div>

        {/* DESKTOP TABLE (Hidden on mobile) */}
        <div className="hidden lg:block overflow-hidden rounded-card border border-border bg-background">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-card border-b border-border">
                <th className="p-6 text-muted-foreground font-medium w-1/3">Recursos</th>
                {sortedPlans.map((plan) => (
                  <th key={plan.id} className="p-6 text-center">
                    <span
                      className={`block text-lg font-bold ${plan.destaquePopular ? "text-primary" : "text-foreground"}`}
                    >
                      {plan.nome}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((category) => (
                <React.Fragment key={category}>
                  {/* Category Header */}
                  <tr className="bg-muted/50">
                    <td
                      colSpan={sortedPlans.length + 1}
                      className="px-6 py-3 text-sm font-bold text-muted-foreground uppercase tracking-wider"
                    >
                      {category}
                    </td>
                  </tr>
                  {/* Resources in Category */}
                  {sortedResources
                    .filter((r) => (r.categoria || "Geral") === category)
                    .map((resource) => (
                      <tr key={resource.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-muted-foreground text-sm font-medium">{resource.nome}</td>
                        {sortedPlans.map((plan) => {
                          const activePlans = resource.planosAtivos || []
                          const hasFeature = activePlans.includes(plan.id)
                          return (
                            <td key={`${resource.id}-${plan.id}`} className="px-6 py-4 text-center">
                              {hasFeature ? (
                                <Check className="inline-block text-green-500" size={20} />
                              ) : (
                                <X className="inline-block text-red-500/50" size={20} />
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE VIEW (Dropdown + List) */}
        <div className="lg:hidden">
          <div className="mb-8">
            <label className="block text-muted-foreground mb-2 text-sm font-medium">Selecione o plano:</label>
            <div className="relative">
              <select
                value={selectedMobilePlanId}
                onChange={(e) => setSelectedMobilePlanId(e.target.value)}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none appearance-none"
              >
                {sortedPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.nome} {plan.destaquePopular ? "(Recomendado)" : ""}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-muted-foreground">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-background rounded-card border border-border p-4 space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h4 className="text-primary font-bold uppercase text-xs tracking-wider mb-3 border-b border-border pb-2">
                  {category}
                </h4>
                <ul className="divide-y divide-border">
                  {sortedResources
                    .filter((r) => (r.categoria || "Geral") === category)
                    .map((resource) => {
                      const activePlans = resource.planosAtivos || []
                      const hasFeature = activePlans.includes(selectedMobilePlanId)
                      return (
                        <li key={resource.id} className="flex items-center justify-between py-3">
                          <span className="text-muted-foreground text-sm">{resource.nome}</span>
                          {hasFeature ? (
                            <Check className="text-green-500 shrink-0" size={18} />
                          ) : (
                            <X className="text-red-500/50 shrink-0" size={18} />
                          )}
                        </li>
                      )
                    })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

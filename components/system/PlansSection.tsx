import type React from "react"
import { Check } from "lucide-react"
import type { Plano, Sistema } from "../../types"

interface PlansSectionProps {
  plans: Plano[]
  system: Sistema
}

export const PlansSection: React.FC<PlansSectionProps> = ({ plans, system }) => {
  const sortedPlans = [...plans].sort((a, b) => a.ordemExibicao - b.ordemExibicao)

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-muted/50 dark:bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Planos Disponíveis</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-lg">
            Escolha o plano ideal para o seu negócio e comece a usar o{" "}
            <span className="text-primary font-semibold">{system.nome}</span> hoje mesmo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {sortedPlans.map((plano) => (
            <div
              key={plano.id}
              className={`relative flex flex-col p-6 sm:p-8 rounded-card border transition-all duration-300 group
                ${
                  plano.destaquePopular
                    ? "bg-card border-primary shadow-[0_0_30px_rgba(204,255,0,0.15)] lg:scale-105 z-10"
                    : "bg-card border-border hover:border-muted-foreground"
                }
              `}
            >
              {plano.destaquePopular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground font-bold px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm uppercase tracking-wide shadow-glow whitespace-nowrap">
                  Mais Popular
                </div>
              )}

              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <img
                  src={system.imagemLogoQuadrada || "/placeholder.svg"}
                  alt={system.nome}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg opacity-80"
                />
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">{plano.nome}</h3>
              </div>

              <div className="mb-6 sm:mb-8">
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">A partir de</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs sm:text-sm text-primary font-bold">R$</span>
                  <span className="text-3xl sm:text-4xl font-bold text-foreground">
                    {plano.precoVenda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-muted-foreground text-sm">{plano.periodicidade}</span>
                </div>
              </div>

              <div className="flex-1 space-y-3 sm:space-y-4">
                {plano.listaBeneficios.map((beneficio, idx) => (
                  <div key={idx} className="flex items-start gap-2 sm:gap-3 text-muted-foreground">
                    <div className="mt-0.5 min-w-[18px]">
                      <Check size={18} className="text-primary" />
                    </div>
                    <span className="text-sm leading-relaxed">{beneficio}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

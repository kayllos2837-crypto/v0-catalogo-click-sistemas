import type React from "react"
import { Plus } from "lucide-react"
import type { Adicional } from "../../types"

interface AdditionalServicesSectionProps {
  addons: Adicional[]
}

export const AdditionalServicesSection: React.FC<AdditionalServicesSectionProps> = ({ addons }) => {
  if (addons.length === 0) return null

  return (
    <section className="py-20 bg-dark-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">Serviços Adicionais</h2>
          <p className="text-muted-foreground text-lg">
            Complemente seu plano com recursos específicos para sua operação.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {addons.map((addon) => (
            <div
              key={addon.id}
              className="group bg-card border border-border rounded-card p-6 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground dark:group-hover:text-black transition-colors">
                {addon.icone ? (
                  <img src={addon.icone || "/placeholder.svg"} alt={addon.nome} className="w-6 h-6 object-contain" />
                ) : (
                  <Plus size={24} />
                )}
              </div>

              <h3 className="text-lg font-bold text-foreground mb-2">{addon.nome}</h3>
              <p className="text-muted-foreground text-sm mb-4 min-h-[40px]">{addon.descricao}</p>

              <div className="border-t border-border pt-4 flex items-center justify-between">
                <div>
                  <span className="block text-xs text-muted-foreground uppercase">Valor</span>
                  <div className="text-foreground font-bold">
                    R$ {addon.precoVenda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                  {addon.tipoCobranca}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

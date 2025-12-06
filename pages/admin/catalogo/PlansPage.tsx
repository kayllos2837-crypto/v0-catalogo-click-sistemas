"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, X, Save, AlertTriangle, Filter, Loader2 } from "lucide-react"
import { getPlanos, getSistemas, upsertPlano, deletePlano } from "@/lib/supabase/data-service"
import type { Plano, Sistema } from "@/types"

export const PlansPage: React.FC = () => {
  const [planos, setPlanos] = useState<Plano[]>([])
  const [sistemas, setSistemas] = useState<Sistema[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<Partial<Plano>>({})
  const [benefitsText, setBenefitsText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Filter State
  const [filterSystemId, setFilterSystemId] = useState<string>("all")

  const refreshList = async () => {
    setIsLoading(true)
    const [planosData, sistemasData] = await Promise.all([getPlanos(), getSistemas()])
    setPlanos(planosData)
    setSistemas(sistemasData)
    setIsLoading(false)
  }

  useEffect(() => {
    refreshList()
  }, [])

  const handleEdit = (plan: Plano) => {
    setCurrentPlan({ ...plan })
    setBenefitsText(plan.listaBeneficios.join("\n"))
    setIsEditing(true)
  }

  const handleNew = () => {
    setCurrentPlan({
      sistemaId: sistemas[0]?.id || "",
      nome: "",
      precoCusto: 0,
      precoVenda: 0,
      periodicidade: "/mês",
      listaBeneficios: [],
      destaquePopular: false,
      ordemExibicao: planos.length + 1,
      ativo: true,
    })
    setBenefitsText("")
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este plano?")) return
    await deletePlano(id)
    await refreshList()
  }

  const handleSave = async () => {
    if (!currentPlan.nome) return alert("Nome é obrigatório")
    if (!currentPlan.sistemaId) return alert("Selecione um sistema")

    const benefitsArray = benefitsText.split("\n").filter((line) => line.trim() !== "")

    setIsSaving(true)
    await upsertPlano({
      ...currentPlan,
      listaBeneficios: benefitsArray,
    } as Plano)

    await refreshList()
    setIsSaving(false)
    setIsEditing(false)
  }

  const getSystemName = (id: string) => {
    return sistemas.find((s) => s.id === id)?.nome || "Sistema Desconhecido"
  }

  // Filtered List
  const filteredPlanos = planos.filter((p) => filterSystemId === "all" || p.sistemaId === filterSystemId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestão de Planos</h1>
          <p className="text-muted-foreground">Cadastre preços e pacotes para seus sistemas.</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-btn transition-colors"
        >
          <Plus size={18} /> Novo Plano
        </button>
      </div>

      {!isEditing ? (
        // LIST VIEW
        <>
          {/* Filter Bar */}
          <div className="mb-6 flex items-center gap-2 bg-card p-4 rounded-card border border-border">
            <Filter size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filtrar por Sistema:</span>
            <select
              value={filterSystemId}
              onChange={(e) => setFilterSystemId(e.target.value)}
              className="bg-background border border-border text-foreground px-3 py-1.5 rounded-btn focus:border-primary focus:outline-none min-w-[200px]"
            >
              <option value="all">Todos os Sistemas</option>
              {sistemas.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-card rounded-card border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground uppercase font-medium">
                  <tr>
                    <th className="px-6 py-3">Sistema</th>
                    <th className="px-6 py-3">Nome do Plano</th>
                    <th className="px-6 py-3">Preço Venda</th>
                    <th className="px-6 py-3">Ordem</th>
                    <th className="px-6 py-3 text-center">Popular</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPlanos.map((plan) => (
                    <tr key={plan.id} className="hover:bg-muted/50 transition-colors text-muted-foreground">
                      <td className="px-6 py-4 text-primary font-medium">{getSystemName(plan.sistemaId)}</td>
                      <td className="px-6 py-4 font-bold text-foreground">{plan.nome}</td>
                      <td className="px-6 py-4">
                        R$ {plan.precoVenda.toFixed(2)}{" "}
                        <span className="text-xs text-muted-foreground">{plan.periodicidade}</span>
                      </td>
                      <td className="px-6 py-4">{plan.ordemExibicao}</td>
                      <td className="px-6 py-4 text-center">
                        {plan.destaquePopular && (
                          <span className="inline-block px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded">
                            SIM
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${plan.ativo ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                        >
                          {plan.ativo ? "ATIVO" : "INATIVO"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(plan)}
                            className="p-2 bg-muted hover:bg-muted/80 rounded-btn text-blue-400 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-btn transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPlanos.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                        Nenhum plano encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        // EDIT FORM
        <div className="bg-card rounded-card border border-border p-6 animate-fade-in max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">{currentPlan.id ? "Editar Plano" : "Novo Plano"}</h2>
            <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Sistema Vinculado</label>
              <select
                value={currentPlan.sistemaId}
                onChange={(e) => setCurrentPlan({ ...currentPlan, sistemaId: e.target.value })}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">Selecione um sistema...</option>
                {sistemas.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Nome do Plano</label>
              <input
                type="text"
                value={currentPlan.nome}
                onChange={(e) => setCurrentPlan({ ...currentPlan, nome: e.target.value })}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
                placeholder="Ex: Básico, Pro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Periodicidade</label>
              <input
                type="text"
                value={currentPlan.periodicidade}
                onChange={(e) => setCurrentPlan({ ...currentPlan, periodicidade: e.target.value })}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
                placeholder="Ex: /mês, /ano"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Preço de Custo (R$)</label>
              <input
                type="number"
                value={currentPlan.precoCusto}
                onChange={(e) => setCurrentPlan({ ...currentPlan, precoCusto: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Preço de Venda (R$)</label>
              <input
                type="number"
                value={currentPlan.precoVenda}
                onChange={(e) => setCurrentPlan({ ...currentPlan, precoVenda: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
              />
              {(currentPlan.precoVenda || 0) < (currentPlan.precoCusto || 0) && (
                <div className="flex items-center gap-2 text-yellow-500 text-xs mt-2">
                  <AlertTriangle size={12} /> Margem negativa detectada
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Lista de Benefícios (Um por linha)
              </label>
              <textarea
                value={benefitsText}
                onChange={(e) => setBenefitsText(e.target.value)}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none h-32"
                placeholder="Usuários Ilimitados&#10;Suporte 24h&#10;Backup Diário"
              />
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Ordem de Exibição</label>
                <input
                  type="number"
                  value={currentPlan.ordemExibicao}
                  onChange={(e) => setCurrentPlan({ ...currentPlan, ordemExibicao: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center pt-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentPlan.destaquePopular}
                    onChange={(e) => setCurrentPlan({ ...currentPlan, destaquePopular: e.target.checked })}
                    className="w-5 h-5 accent-primary"
                  />
                  <span className="text-foreground font-medium">Destaque (Popular)</span>
                </label>
              </div>

              <div className="flex items-center pt-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentPlan.ativo}
                    onChange={(e) => setCurrentPlan({ ...currentPlan, ativo: e.target.checked })}
                    className="w-5 h-5 accent-primary"
                  />
                  <span className="text-foreground font-medium">Plano Ativo</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-btn transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSaving ? "Salvando..." : "Salvar Plano"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

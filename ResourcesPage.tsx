"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, X, Save, CheckSquare, Square, Filter, Loader2 } from "lucide-react"
import { getRecursos, getPlanos, getSistemas, upsertRecurso, deleteRecurso } from "./lib/supabase/data-service.ts"
import type { Recurso, Plano, Sistema } from "./types.ts"

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Recurso[]>([])
  const [systems, setSystems] = useState<Sistema[]>([])
  const [plans, setPlans] = useState<Plano[]>([])

  const [isEditing, setIsEditing] = useState(false)
  const [currentResource, setCurrentResource] = useState<Partial<Recurso>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Filter state for List View
  const [filterSystemId, setFilterSystemId] = useState<string>("all")

  const refreshList = async () => {
    setIsLoading(true)
    const [recursosData, sistemasData, planosData] = await Promise.all([getRecursos(), getSistemas(), getPlanos()])
    setResources(recursosData)
    setSystems(sistemasData)
    setPlans(planosData)
    setIsLoading(false)
  }

  useEffect(() => {
    refreshList()
  }, [])

  const handleEdit = (resource: Recurso) => {
    setCurrentResource({ ...resource })
    setIsEditing(true)
  }

  const handleNew = () => {
    setCurrentResource({
      nome: "",
      categoria: "Geral",
      sistemaId: "",
      planosAtivos: [],
      ordemExibicao: resources.length + 1,
    })
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este recurso?")) return
    await deleteRecurso(id)
    await refreshList()
  }

  const handleSave = async () => {
    if (!currentResource.nome) return alert("Nome é obrigatório")
    if (!currentResource.sistemaId) return alert("Selecione um sistema")
    if (!currentResource.planosAtivos || currentResource.planosAtivos.length === 0) {
      return alert("O recurso deve estar vinculado a pelo menos um plano.")
    }

    setIsSaving(true)
    await upsertRecurso(currentResource as Recurso)
    await refreshList()
    setIsSaving(false)
    setIsEditing(false)
  }

  const togglePlanLink = (planId: string) => {
    const currentLinks = currentResource.planosAtivos || []
    let newLinks = []
    if (currentLinks.includes(planId)) {
      newLinks = currentLinks.filter((id) => id !== planId)
    } else {
      newLinks = [...currentLinks, planId]
    }
    setCurrentResource({ ...currentResource, planosAtivos: newLinks })
  }

  // Helper to get system name
  const getSystemName = (id: string) => systems.find((s) => s.id === id)?.nome || "N/A"

  // Filtered resources list
  const filteredResources = resources.filter((r) => filterSystemId === "all" || r.sistemaId === filterSystemId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestão de Recursos</h1>
          <p className="text-muted-foreground">Funcionalidades exibidas no comparativo de planos.</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-btn transition-colors"
        >
          <Plus size={18} /> Novo Recurso
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
              className="bg-background border border-border text-foreground px-3 py-1.5 rounded-btn focus:border-primary focus:outline-none"
            >
              <option value="all">Todos</option>
              {systems.map((s) => (
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
                    <th className="px-6 py-3">Nome do Recurso</th>
                    <th className="px-6 py-3">Categoria</th>
                    <th className="px-6 py-3">Planos Vinculados</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredResources.map((res) => (
                    <tr key={res.id} className="hover:bg-muted/50 transition-colors text-muted-foreground">
                      <td className="px-6 py-4 text-primary font-medium">{getSystemName(res.sistemaId)}</td>
                      <td className="px-6 py-4 font-bold text-foreground">{res.nome}</td>
                      <td className="px-6 py-4">{res.categoria || "-"}</td>
                      <td className="px-6 py-4">
                        <span className="bg-muted px-2 py-1 rounded text-xs">{res.planosAtivos.length} Planos</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(res)}
                            className="p-2 bg-muted hover:bg-muted/80 rounded-btn text-blue-400 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(res.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-btn transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredResources.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Nenhum recurso encontrado.
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
            <h2 className="text-xl font-bold text-foreground">
              {currentResource.id ? "Editar Recurso" : "Novo Recurso"}
            </h2>
            <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Sistema Vinculado</label>
              <select
                value={currentResource.sistemaId}
                onChange={(e) => {
                  // When changing system, we must clear plans because plans belong to specific system
                  setCurrentResource({ ...currentResource, sistemaId: e.target.value, planosAtivos: [] })
                }}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">Selecione um sistema...</option>
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Nome do Recurso</label>
              <input
                type="text"
                value={currentResource.nome}
                onChange={(e) => setCurrentResource({ ...currentResource, nome: e.target.value })}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
                placeholder="Ex: Suporte 24h"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Categoria</label>
              <input
                type="text"
                value={currentResource.categoria}
                onChange={(e) => setCurrentResource({ ...currentResource, categoria: e.target.value })}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
                placeholder="Ex: Financeiro, Geral"
                list="categories-list"
              />
              <datalist id="categories-list">
                <option value="Geral" />
                <option value="Financeiro" />
                <option value="Fiscal" />
                <option value="Estoque" />
                <option value="Atendimento" />
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Ordem de Exibição</label>
              <input
                type="number"
                value={currentResource.ordemExibicao}
                onChange={(e) => setCurrentResource({ ...currentResource, ordemExibicao: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Multi-Select Plans */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-3">
                Disponível nos Planos <span className="text-red-500">*</span>
                {!currentResource.sistemaId && (
                  <span className="text-xs text-yellow-500 ml-2">(Selecione um sistema primeiro)</span>
                )}
              </label>

              {currentResource.sistemaId ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-muted/50 p-4 rounded-card border border-border">
                  {plans
                    .filter((p) => p.sistemaId === currentResource.sistemaId)
                    .map((plan) => {
                      const isSelected = currentResource.planosAtivos?.includes(plan.id)
                      return (
                        <div
                          key={plan.id}
                          onClick={() => togglePlanLink(plan.id)}
                          className={`flex items-center gap-3 p-3 rounded-btn border cursor-pointer transition-all ${isSelected ? "bg-primary/10 border-primary" : "bg-card border-border hover:border-primary/30"}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="text-primary" size={20} />
                          ) : (
                            <Square className="text-muted-foreground" size={20} />
                          )}
                          <span className={isSelected ? "text-foreground font-medium" : "text-muted-foreground"}>
                            {plan.nome}
                          </span>
                        </div>
                      )
                    })}
                  {plans.filter((p) => p.sistemaId === currentResource.sistemaId).length === 0 && (
                    <p className="text-muted-foreground text-sm col-span-full">
                      Nenhum plano cadastrado para este sistema.
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-border rounded-card text-muted-foreground">
                  Selecione um sistema acima para ver os planos.
                </div>
              )}
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
              {isSaving ? "Salvando..." : "Salvar Recurso"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

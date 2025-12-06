"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, X, Save, CheckSquare, Square, Search, Loader2 } from "lucide-react"
import { getAdicionais, getSistemas, upsertAdicional, deleteAdicional } from "./lib/supabase/data-service.ts"
import type { Adicional, Sistema } from "./types.ts"

export const AddonsPage: React.FC = () => {
  const [addons, setAddons] = useState<Adicional[]>([])
  const [systems, setSystems] = useState<Sistema[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentAddon, setCurrentAddon] = useState<Partial<Adicional>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Search State
  const [searchTerm, setSearchTerm] = useState("")

  const refreshList = async () => {
    setIsLoading(true)
    const [adicionaisData, sistemasData] = await Promise.all([getAdicionais(), getSistemas()])
    setAddons(adicionaisData)
    setSystems(sistemasData)
    setIsLoading(false)
  }

  useEffect(() => {
    refreshList()
  }, [])

  const handleEdit = (addon: Adicional) => {
    setCurrentAddon({ ...addon })
    setIsEditing(true)
  }

  const handleNew = () => {
    setCurrentAddon({
      nome: "",
      descricao: "",
      tipoCobranca: "Mensal",
      precoCusto: 0,
      precoVenda: 0,
      icone: "",
      sistemasVinculados: [],
      ordemExibicao: addons.length + 1,
      ativo: true,
    })
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este adicional?")) return
    await deleteAdicional(id)
    await refreshList()
  }

  const handleSave = async () => {
    if (!currentAddon.nome) return alert("Nome é obrigatório")
    if (!currentAddon.precoVenda) return alert("Preço de venda é obrigatório")

    setIsSaving(true)
    await upsertAdicional(currentAddon as Adicional)
    await refreshList()
    setIsSaving(false)
    setIsEditing(false)
  }

  const toggleSystemLink = (systemId: string) => {
    const currentLinks = currentAddon.sistemasVinculados || []
    let newLinks = []
    if (currentLinks.includes(systemId)) {
      newLinks = currentLinks.filter((id) => id !== systemId)
    } else {
      newLinks = [...currentLinks, systemId]
    }
    setCurrentAddon({ ...currentAddon, sistemasVinculados: newLinks })
  }

  // Filtered List
  const filteredAddons = addons.filter((addon) => addon.nome.toLowerCase().includes(searchTerm.toLowerCase()))

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Serviços Adicionais</h1>
          <p className="text-muted-foreground">Gerencie módulos extras e serviços complementares.</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-btn transition-colors"
        >
          <Plus size={18} /> Novo Adicional
        </button>
      </div>

      {!isEditing ? (
        // LIST VIEW
        <>
          {/* Search Bar */}
          <div className="mb-6 flex items-center gap-2 bg-card p-4 rounded-card border border-border">
            <Search size={18} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar adicional por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border text-foreground px-3 py-1.5 rounded-btn focus:border-primary focus:outline-none"
            />
          </div>

          <div className="bg-card rounded-card border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground uppercase font-medium">
                  <tr>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Tipo Cobrança</th>
                    <th className="px-6 py-3">Preço Venda</th>
                    <th className="px-6 py-3">Sistemas</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAddons.map((addon) => (
                    <tr key={addon.id} className="hover:bg-muted/50 transition-colors text-muted-foreground">
                      <td className="px-6 py-4 font-bold text-foreground">{addon.nome}</td>
                      <td className="px-6 py-4">{addon.tipoCobranca}</td>
                      <td className="px-6 py-4">R$ {addon.precoVenda.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        {addon.sistemasVinculados.length === systems.length
                          ? "Todos"
                          : `${addon.sistemasVinculados.length} sistemas`}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${addon.ativo ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                        >
                          {addon.ativo ? "ATIVO" : "INATIVO"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(addon)}
                            className="p-2 bg-muted hover:bg-muted/80 rounded-btn text-blue-400 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(addon.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-btn transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAddons.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        Nenhum serviço adicional encontrado.
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
              {currentAddon.id ? "Editar Serviço Adicional" : "Novo Serviço Adicional"}
            </h2>
            <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Nome do Adicional</label>
              <input
                type="text"
                value={currentAddon.nome}
                onChange={(e) => setCurrentAddon({ ...currentAddon, nome: e.target.value })}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
                placeholder="Ex: Instalação, Treinamento"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Descrição</label>
              <textarea
                value={currentAddon.descricao}
                onChange={(e) => setCurrentAddon({ ...currentAddon, descricao: e.target.value })}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none h-24"
                placeholder="Descreva o que está incluso neste serviço."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Tipo de Cobrança</label>
              <select
                value={currentAddon.tipoCobranca}
                onChange={(e) => setCurrentAddon({ ...currentAddon, tipoCobranca: e.target.value })}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
              >
                <option value="Mensal">Mensal</option>
                <option value="Taxa Única">Taxa Única</option>
                <option value="Por Usuário">Por Usuário</option>
                <option value="Anual">Anual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Ícone (URL)</label>
              <input
                type="text"
                value={currentAddon.icone}
                onChange={(e) => setCurrentAddon({ ...currentAddon, icone: e.target.value })}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
                placeholder="http://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Preço de Custo (R$)</label>
              <input
                type="number"
                value={currentAddon.precoCusto}
                onChange={(e) => setCurrentAddon({ ...currentAddon, precoCusto: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Preço de Venda (R$)</label>
              <input
                type="number"
                value={currentAddon.precoVenda}
                onChange={(e) => setCurrentAddon({ ...currentAddon, precoVenda: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Multi-Select Systems */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-3">Vincular aos Sistemas</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {systems.map((sys) => {
                  const isSelected = currentAddon.sistemasVinculados?.includes(sys.id)
                  return (
                    <div
                      key={sys.id}
                      onClick={() => toggleSystemLink(sys.id)}
                      className={`flex items-center gap-3 p-3 rounded-btn border cursor-pointer transition-all ${isSelected ? "bg-primary/10 border-primary" : "bg-muted/50 border-border hover:border-primary/30"}`}
                    >
                      {isSelected ? (
                        <CheckSquare className="text-primary" size={20} />
                      ) : (
                        <Square className="text-muted-foreground" size={20} />
                      )}
                      <span className={isSelected ? "text-foreground font-medium" : "text-muted-foreground"}>
                        {sys.nome}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Ordem de Exibição</label>
                <input
                  type="number"
                  value={currentAddon.ordemExibicao}
                  onChange={(e) => setCurrentAddon({ ...currentAddon, ordemExibicao: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center pt-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentAddon.ativo}
                    onChange={(e) => setCurrentAddon({ ...currentAddon, ativo: e.target.checked })}
                    className="w-5 h-5 accent-primary"
                  />
                  <span className="text-foreground font-medium">Serviço Ativo</span>
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
              {isSaving ? "Salvando..." : "Salvar Serviço"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

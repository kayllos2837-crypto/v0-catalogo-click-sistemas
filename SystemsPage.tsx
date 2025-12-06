"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, X, Save, ImageIcon, Loader2 } from "lucide-react"
import { getSistemas, upsertSistema, deleteSistema } from "./lib/supabase/data-service.ts"
import type { Sistema } from "./types.ts"
import { ImageUploadInput } from "./components/admin/ImageUploadInput.tsx"

export const SystemsPage: React.FC = () => {
  const [sistemas, setSistemas] = useState<Sistema[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [currentSystem, setCurrentSystem] = useState<Partial<Sistema>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const refreshList = async () => {
    setIsLoading(true)
    const data = await getSistemas()
    setSistemas(data)
    setIsLoading(false)
  }

  useEffect(() => {
    refreshList()
  }, [])

  const handleEdit = (sys: Sistema) => {
    setCurrentSystem({ ...sys })
    setIsEditing(true)
  }

  const handleNew = () => {
    setCurrentSystem({
      nome: "",
      descricaoCurta: "",
      descricaoDetalhada: "",
      imagemLogoSistema: "",
      imagemLogoQuadrada: "",
      imagemBannerDesktop: "",
      imagemBannerMobile: "",
      ordemExibicao: sistemas.length + 1,
      ativo: true,
    })
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este sistema?")) return
    await deleteSistema(id)
    await refreshList()
  }

  const handleSave = async () => {
    if (!currentSystem.nome) return alert("Nome é obrigatório")

    setIsSaving(true)
    await upsertSistema(currentSystem as Sistema)
    await refreshList()
    setIsSaving(false)
    setIsEditing(false)
  }

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestão de Sistemas</h1>
          <p className="text-muted-foreground">Cadastre e edite os softwares exibidos no catálogo.</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-btn transition-colors"
        >
          <Plus size={18} /> Novo Sistema
        </button>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sistemas.map((sys) => (
            <div
              key={sys.id}
              className="bg-card border border-border rounded-card overflow-hidden group hover:border-primary/30 transition-all"
            >
              <div className="h-32 bg-muted relative">
                <img
                  src={sys.imagemBannerDesktop || "/placeholder.svg?height=200&width=400&query=system+banner"}
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${sys.ativo ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                  >
                    {sys.ativo ? "ATIVO" : "INATIVO"}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4 -mt-10 relative z-10">
                  <img
                    src={sys.imagemLogoQuadrada || "/placeholder.svg?height=64&width=64&query=logo"}
                    className="w-16 h-16 rounded-lg border-2 border-card bg-background object-cover"
                  />
                  <h3 className="text-xl font-bold text-foreground">{sys.nome}</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-6 line-clamp-2">{sys.descricaoCurta}</p>

                <div className="flex gap-2 border-t border-border pt-4">
                  <button
                    onClick={() => handleEdit(sys)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-muted hover:bg-muted/80 rounded-btn text-sm font-medium text-foreground transition-colors"
                  >
                    <Edit2 size={16} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(sys.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-btn transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-card border border-border p-6 animate-fade-in">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">
              {currentSystem.id ? "Editar Sistema" : "Novo Sistema"}
            </h2>
            <button onClick={() => setIsEditing(false)} className="text-muted-foreground hover:text-foreground">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Nome do Sistema</label>
              <input
                type="text"
                value={currentSystem.nome || ""}
                onChange={(e) => setCurrentSystem({ ...currentSystem, nome: e.target.value })}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Descrição Curta</label>
              <textarea
                value={currentSystem.descricaoCurta || ""}
                onChange={(e) => setCurrentSystem({ ...currentSystem, descricaoCurta: e.target.value })}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none h-32 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Descrição Detalhada (HTML)</label>
              <textarea
                value={currentSystem.descricaoDetalhada || ""}
                onChange={(e) => setCurrentSystem({ ...currentSystem, descricaoDetalhada: e.target.value })}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none h-32 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Ordem de Exibição</label>
              <input
                type="number"
                value={currentSystem.ordemExibicao || 0}
                onChange={(e) => setCurrentSystem({ ...currentSystem, ordemExibicao: Number(e.target.value) })}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-4 pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentSystem.ativo ?? true}
                  onChange={(e) => setCurrentSystem({ ...currentSystem, ativo: e.target.checked })}
                  className="w-5 h-5 accent-primary"
                />
                <span className="text-foreground font-medium">Sistema Ativo</span>
              </label>
            </div>

            <div className="md:col-span-2 mt-4 pt-6 border-t border-border">
              <h3 className="text-foreground font-bold mb-6 flex items-center gap-2">
                <ImageIcon size={18} /> Mídia e Imagens
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <ImageUploadInput
                    label="Banner Principal (Desktop)"
                    currentImage={currentSystem.imagemBannerDesktop}
                    onImageChange={(url) => setCurrentSystem({ ...currentSystem, imagemBannerDesktop: url })}
                    helpText="Tamanho recomendado: 1920x400px"
                    aspectRatio="video"
                    folder="banners"
                  />
                </div>

                <div>
                  <ImageUploadInput
                    label="Banner Mobile"
                    currentImage={currentSystem.imagemBannerMobile}
                    onImageChange={(url) => setCurrentSystem({ ...currentSystem, imagemBannerMobile: url })}
                    helpText="Tamanho recomendado: 768x500px"
                    aspectRatio="video"
                    folder="banners"
                  />
                </div>

                <div>
                  <ImageUploadInput
                    label="Logo Quadrada (Ícone)"
                    currentImage={currentSystem.imagemLogoQuadrada}
                    onImageChange={(url) => setCurrentSystem({ ...currentSystem, imagemLogoQuadrada: url })}
                    helpText="Tamanho recomendado: 200x200px"
                    aspectRatio="square"
                    folder="logos"
                  />
                </div>

                <div>
                  <ImageUploadInput
                    label="Logo do Sistema (Completa)"
                    currentImage={currentSystem.imagemLogoSistema}
                    onImageChange={(url) => setCurrentSystem({ ...currentSystem, imagemLogoSistema: url })}
                    helpText="Logo principal transparente. Usada em cabeçalhos."
                    aspectRatio="auto"
                    folder="logos"
                  />
                </div>
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
              {isSaving ? "Salvando..." : "Salvar Sistema"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

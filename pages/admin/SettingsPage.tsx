"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Save, CheckCircle, Loader2, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { getConfiguracoes, updateConfiguracoes } from "@/lib/supabase/data-service"
import { ImageUploadInput } from "../../components/admin/ImageUploadInput"

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const [formData, setFormData] = useState({
    logoSite: "",
    papelTimbradoPdf: "",
    senhaAdminDesconto: "",
    telefone: "",
    email: "",
    whatsapp: "",
    instagram: "",
    linkedin: "",
    logoRodape: "",
    fraseRodape: "",
    temaPadrao: "dark" as "light" | "dark",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadConfig = async () => {
      const config = await getConfiguracoes()
      setFormData({
        logoSite: config.logoSite || "",
        papelTimbradoPdf: config.papelTimbradoPdf || "",
        senhaAdminDesconto: config.senhaAdminDesconto || "",
        telefone: config.contato?.telefone || "",
        email: config.contato?.email || "",
        whatsapp: config.linksSociais?.whatsapp || "",
        instagram: config.linksSociais?.instagram || "",
        linkedin: config.linksSociais?.linkedin || "",
        logoRodape: config.logoRodape || "",
        fraseRodape: config.fraseRodape || "",
        temaPadrao: config.temaPadrao || "dark",
      })
      setIsLoading(false)
    }
    loadConfig()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setFormData((prev) => ({ ...prev, temaPadrao: newTheme }))
    setTheme(newTheme) // Aplica o tema imediatamente
  }

  const handleSave = async () => {
    setIsSaving(true)
    const success = await updateConfiguracoes({
      logoSite: formData.logoSite,
      papelTimbradoPdf: formData.papelTimbradoPdf,
      senhaAdminDesconto: formData.senhaAdminDesconto,
      logoRodape: formData.logoRodape,
      fraseRodape: formData.fraseRodape,
      temaPadrao: formData.temaPadrao, // Salva o tema no banco
      contato: {
        telefone: formData.telefone,
        email: formData.email,
      },
      linksSociais: {
        whatsapp: formData.whatsapp,
        instagram: formData.instagram,
        linkedin: formData.linkedin,
      },
    })

    if (success) {
      setMessage("Configurações salvas com sucesso!")
    } else {
      setMessage("Erro ao salvar configurações.")
    }
    setIsSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Configurações Gerais</h1>
          <p className="text-muted-foreground">Gerencie a aparência e parâmetros globais da plataforma.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-btn transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isSaving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-btn flex items-center gap-2 animate-fade-in ${
            message.includes("Erro")
              ? "bg-red-500/10 border border-red-500/20 text-red-400"
              : "bg-green-500/10 border border-green-500/20 text-green-400"
          }`}
        >
          <CheckCircle size={20} /> {message}
        </div>
      )}

      <div className="space-y-8">
        <section className="bg-card p-6 rounded-card border border-border">
          <h3 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">Tema do Site</h3>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleThemeChange("light")}
              className={`flex items-center gap-3 px-6 py-4 rounded-btn border-2 transition-all ${
                formData.temaPadrao === "light"
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-muted-foreground"
              }`}
            >
              <Sun size={24} />
              <div className="text-left">
                <p className="font-semibold">Claro</p>
                <p className="text-xs text-muted-foreground">Fundo branco</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange("dark")}
              className={`flex items-center gap-3 px-6 py-4 rounded-btn border-2 transition-all ${
                formData.temaPadrao === "dark"
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-muted-foreground"
              }`}
            >
              <Moon size={24} />
              <div className="text-left">
                <p className="font-semibold">Escuro</p>
                <p className="text-xs text-muted-foreground">Fundo escuro</p>
              </div>
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            O tema selecionado será o padrão para todos os visitantes do site.
          </p>
        </section>

        {/* Assets Section */}
        <section className="bg-card p-6 rounded-card border border-border">
          <h3 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">
            Identidade Visual & PDF
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <ImageUploadInput
                label="Logo do Site"
                currentImage={formData.logoSite}
                onImageChange={(url) => setFormData((prev) => ({ ...prev, logoSite: url }))}
                helpText="Recomendado: PNG Transparente"
                aspectRatio="auto"
                folder="logos"
              />
            </div>
            <div>
              <ImageUploadInput
                label="Papel Timbrado (PDF)"
                currentImage={formData.papelTimbradoPdf}
                onImageChange={(url) => setFormData((prev) => ({ ...prev, papelTimbradoPdf: url }))}
                helpText="Imagem A4 Vertical (210x297mm)"
                aspectRatio="auto"
                folder="documents"
              />
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <section className="bg-card p-6 rounded-card border border-border">
          <h3 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">Rodapé do Site</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <ImageUploadInput
                label="Logo do Rodapé"
                currentImage={formData.logoRodape}
                onImageChange={(url) => setFormData((prev) => ({ ...prev, logoRodape: url }))}
                helpText="Recomendado: PNG Transparente"
                aspectRatio="auto"
                folder="logos"
              />
            </div>
            <div className="flex flex-col justify-center">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Frase do Rodapé</label>
              <input
                type="text"
                name="fraseRodape"
                value={formData.fraseRodape}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
                placeholder="Sua frase institucional aqui..."
              />
              <p className="text-xs text-muted-foreground mt-2">Texto exibido abaixo da logomarca no rodapé do site.</p>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="bg-card p-6 rounded-card border border-border">
          <h3 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">Segurança & Admin</h3>
          <div className="max-w-md">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Senha para Desconto</label>
            <input
              type="text"
              name="senhaAdminDesconto"
              value={formData.senhaAdminDesconto}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none font-mono"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Utilizada no modal de orçamento para liberar descontos.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-card p-6 rounded-card border border-border">
          <h3 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">Informações de Contato</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Telefone Comercial</label>
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">E-mail de Contato</label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
                placeholder="contato@empresa.com"
              />
            </div>
          </div>
        </section>

        {/* Social Links Section */}
        <section className="bg-card p-6 rounded-card border border-border">
          <h3 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">Redes Sociais</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">WhatsApp (Link)</label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Instagram (Link)</label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">LinkedIn (Link)</label>
              <input
                type="text"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-btn p-3 text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

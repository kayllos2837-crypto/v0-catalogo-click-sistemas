"use client"

import type React from "react"
import { useState } from "react"
import { Download, Upload, AlertCircle, CheckCircle } from "lucide-react"
import { downloadExcelTemplate, processExcelImport } from "../../lib/excelService"

export const ImportPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleDownload = async () => {
    setDownloading(true)
    setMessage(null)
    try {
      await downloadExcelTemplate()
      setMessage({ type: "success", text: "Template baixado com sucesso!" })
    } catch (e) {
      console.error(e)
      setMessage({ type: "error", text: "Erro ao gerar template." })
    } finally {
      setDownloading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setMessage(null)

    try {
      const resultMsg = await processExcelImport(file)
      setMessage({ type: "success", text: resultMsg })
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Erro desconhecido ao importar." })
    } finally {
      setLoading(false)
      e.target.value = ""
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Importação de Dados</h1>
        <p className="text-muted-foreground">Atualize o catálogo em massa utilizando planilhas Excel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card 1: Download Template */}
        <div className="bg-card border border-border rounded-card p-8 flex flex-col items-center text-center hover:border-primary/50 transition-colors">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
            <Download size={32} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">1. Baixar Template</h3>
          <p className="text-muted-foreground text-sm mb-6 flex-1">
            Baixe a planilha padrão com todas as abas e colunas necessárias (Sistemas, Planos, Adicionais, etc).
          </p>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`w-full py-3 bg-card border border-border text-foreground font-semibold rounded-btn hover:bg-muted transition-colors ${downloading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {downloading ? "Gerando..." : "Baixar Excel"}
          </button>
        </div>

        {/* Card 2: Upload */}
        <div className="bg-card border border-border rounded-card p-8 flex flex-col items-center text-center hover:border-primary/50 transition-colors relative">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
            <Upload size={32} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">2. Importar Planilha</h3>
          <p className="text-muted-foreground text-sm mb-6 flex-1">
            Faça o upload do arquivo preenchido para atualizar o sistema (Upsert).
          </p>

          <label
            className={`w-full py-3 bg-primary text-primary-foreground font-bold rounded-btn hover:bg-primary/90 transition-colors cursor-pointer flex items-center justify-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Processando..." : "Selecionar Arquivo"}
            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} disabled={loading} className="hidden" />
          </label>
        </div>
      </div>

      {/* Feedback Message */}
      {message && (
        <div
          className={`mt-8 p-4 rounded-btn flex items-center gap-3 animate-fade-in
          ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}
        `}
        >
          {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-12 border-t border-border pt-8">
        <h4 className="text-foreground font-bold mb-4">Regras de Importação</h4>
        <ul className="list-disc list-inside text-muted-foreground space-y-2 text-sm">
          <li>
            O sistema utiliza a coluna <code className="text-primary bg-muted px-1 py-0.5 rounded">id</code> para
            identificar registros.
          </li>
          <li>Se o ID existir, os dados serão atualizados (Update).</li>
          <li>Se o ID estiver vazio ou não existir, um novo registro será criado (Insert).</li>
          <li>Certifique-se de manter os nomes das abas inalterados.</li>
        </ul>
      </div>
    </div>
  )
}

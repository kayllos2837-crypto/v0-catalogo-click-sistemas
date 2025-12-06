"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { FileText, Filter, Loader2 } from "lucide-react"
import { getSistemas, getPlanos, getAdicionais } from "@/lib/supabase/data-service"
import { generateFinancePdf } from "../../lib/pdfFinanceGenerator"
import type { Sistema, Plano, Adicional } from "@/types"

export const FinancePage: React.FC = () => {
  const [selectedSystemId, setSelectedSystemId] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  const [sistemas, setSistemas] = useState<Sistema[]>([])
  const [planos, setPlanos] = useState<Plano[]>([])
  const [adicionais, setAdicionais] = useState<Adicional[]>([])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [sistemasData, planosData, adicionaisData] = await Promise.all([
          getSistemas(),
          getPlanos(),
          getAdicionais(),
        ])
        setSistemas(sistemasData)
        setPlanos(planosData)
        setAdicionais(adicionaisData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredPlanos = planos
    .filter((p) => (selectedSystemId === "all" || p.sistemaId === selectedSystemId) && p.ativo)
    .map((p) => ({
      ...p,
      sistemaNome: sistemas.find((s) => s.id === p.sistemaId)?.nome || "N/A",
    }))

  const filteredAdicionais = adicionais
    .filter((a) => (selectedSystemId === "all" || a.sistemasVinculados.includes(selectedSystemId)) && a.ativo)
    .map((a) => ({
      ...a,
      sistemaNome:
        selectedSystemId !== "all" ? sistemas.find((s) => s.id === selectedSystemId)?.nome || "N/A" : "Vários",
    }))

  const handleExport = () => {
    generateFinancePdf({
      planos: filteredPlanos,
      adicionais: filteredAdicionais,
    })
  }

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Financeiro</h1>
          <p className="text-gray-400">Análise de Lucratividade de Planos e Serviços.</p>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={selectedSystemId}
              onChange={(e) => setSelectedSystemId(e.target.value)}
              className="bg-dark-surface border border-dark-border text-white pl-10 pr-4 py-2 rounded-btn focus:border-primary focus:outline-none appearance-none min-w-[200px]"
            >
              <option value="all">Todos os Sistemas</option>
              {sistemas.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white font-semibold rounded-btn hover:bg-white/20 transition-colors"
          >
            <FileText size={18} />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Table 1: Planos */}
      <div className="bg-dark-surface rounded-card border border-dark-border overflow-hidden mb-8">
        <div className="p-4 border-b border-dark-border bg-black/20">
          <h3 className="font-bold text-white">Lucratividade - Planos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 uppercase font-medium">
              <tr>
                <th className="px-6 py-3">Sistema</th>
                <th className="px-6 py-3">Plano</th>
                <th className="px-6 py-3">Custo</th>
                <th className="px-6 py-3">Venda</th>
                <th className="px-6 py-3">Lucro (R$)</th>
                <th className="px-6 py-3">Margem (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredPlanos.map((p) => {
                const lucro = p.precoVenda - p.precoCusto
                const margem = p.precoVenda > 0 ? (lucro / p.precoVenda) * 100 : 0
                return (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors text-gray-300">
                    <td className="px-6 py-4">{p.sistemaNome}</td>
                    <td className="px-6 py-4 font-medium text-white">{p.nome}</td>
                    <td className="px-6 py-4">R$ {p.precoCusto.toFixed(2)}</td>
                    <td className="px-6 py-4">R$ {p.precoVenda.toFixed(2)}</td>
                    <td className={`px-6 py-4 font-bold ${lucro >= 0 ? "text-green-500" : "text-red-500"}`}>
                      R$ {lucro.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 font-bold ${margem >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {margem.toFixed(1)}%
                    </td>
                  </tr>
                )
              })}
              {filteredPlanos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum plano encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Adicionais */}
      <div className="bg-dark-surface rounded-card border border-dark-border overflow-hidden">
        <div className="p-4 border-b border-dark-border bg-black/20">
          <h3 className="font-bold text-white">Lucratividade - Adicionais</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-gray-400 uppercase font-medium">
              <tr>
                <th className="px-6 py-3">Sistema</th>
                <th className="px-6 py-3">Serviço</th>
                <th className="px-6 py-3">Custo</th>
                <th className="px-6 py-3">Venda</th>
                <th className="px-6 py-3">Lucro (R$)</th>
                <th className="px-6 py-3">Margem (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredAdicionais.map((a) => {
                const lucro = a.precoVenda - a.precoCusto
                const margem = a.precoVenda > 0 ? (lucro / a.precoVenda) * 100 : 0
                return (
                  <tr key={a.id} className="hover:bg-white/5 transition-colors text-gray-300">
                    <td className="px-6 py-4">{a.sistemaNome}</td>
                    <td className="px-6 py-4 font-medium text-white">{a.nome}</td>
                    <td className="px-6 py-4">R$ {a.precoCusto.toFixed(2)}</td>
                    <td className="px-6 py-4">R$ {a.precoVenda.toFixed(2)}</td>
                    <td className={`px-6 py-4 font-bold ${lucro >= 0 ? "text-green-500" : "text-red-500"}`}>
                      R$ {lucro.toFixed(2)}
                    </td>
                    <td className={`px-6 py-4 font-bold ${margem >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {margem.toFixed(1)}%
                    </td>
                  </tr>
                )
              })}
              {filteredAdicionais.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum adicional encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

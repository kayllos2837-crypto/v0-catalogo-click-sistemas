"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Layers, Package, Zap, BarChart3, AlertTriangle, TrendingUp, DollarSign, RefreshCw } from "lucide-react"
import { getSistemas, getPlanos, getRecursos, getAdicionais } from "../../lib/supabase/data-service"
import type { Sistema, Plano, Recurso, Adicional } from "../../types"

export const DashboardPage: React.FC = () => {
  const [sistemas, setSistemas] = useState<Sistema[]>([])
  const [planos, setPlanos] = useState<Plano[]>([])
  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [adicionais, setAdicionais] = useState<Adicional[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [sistemasData, planosData, recursosData, adicionaisData] = await Promise.all([
        getSistemas(),
        getPlanos(),
        getRecursos(),
        getAdicionais(),
      ])
      setSistemas(sistemasData)
      setPlanos(planosData)
      setRecursos(recursosData)
      setAdicionais(adicionaisData)
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const activeSystems = sistemas.filter((s) => s.ativo).length
  const activePlans = planos.filter((p) => p.ativo).length
  const activeAddons = adicionais.filter((a) => a.ativo).length

  // Calcular receita potencial mensal (soma dos preços de venda de planos ativos)
  const receitaPotencial = planos.filter((p) => p.ativo).reduce((acc, p) => acc + (p.precoVenda || 0), 0)

  // Planos com margem baixa (< 20%)
  const lowMarginPlans = planos.filter((p) => {
    if (!p.ativo || p.precoVenda <= 0) return false
    const margin = (p.precoVenda - p.precoCusto) / p.precoVenda
    return margin < 0.2
  })

  // Planos mais caros
  const topPlans = [...planos]
    .filter((p) => p.ativo)
    .sort((a, b) => b.precoVenda - a.precoVenda)
    .slice(0, 3)

  const stats = [
    {
      label: "Sistemas Ativos",
      value: activeSystems,
      total: sistemas.length,
      icon: Layers,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      label: "Planos Ativos",
      value: activePlans,
      total: planos.length,
      icon: Package,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      label: "Recursos Cadastrados",
      value: recursos.length,
      icon: Zap,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
    {
      label: "Adicionais Ativos",
      value: activeAddons,
      total: adicionais.length,
      icon: BarChart3,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
  ]

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin text-primary" size={32} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Visão Geral</h1>
          <p className="text-muted-foreground">Resumo do catálogo e métricas do sistema.</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
        >
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              {stat.total !== undefined && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {stat.value}/{stat.total}
                </span>
              )}
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Second Row - Receita e Top Planos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Receita Potencial */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-green-400/10">
              <DollarSign size={20} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Receita Potencial</h3>
              <p className="text-xs text-muted-foreground">Soma dos preços de todos os planos ativos</p>
            </div>
          </div>
          <div className="text-4xl font-bold text-green-400">
            R$ {receitaPotencial.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Top Planos */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-blue-400/10">
              <TrendingUp size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Planos Mais Caros</h3>
              <p className="text-xs text-muted-foreground">Top 3 planos por valor</p>
            </div>
          </div>
          {topPlans.length > 0 ? (
            <div className="space-y-3">
              {topPlans.map((plan, idx) => (
                <div key={plan.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-foreground font-medium">{plan.nome}</span>
                  </div>
                  <span className="text-primary font-bold">
                    R$ {plan.precoVenda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhum plano cadastrado.</p>
          )}
        </div>
      </div>

      {/* Third Row - Alertas e Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Margin Alert */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-amber-400/10">
              <AlertTriangle size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Atenção Financeira</h3>
              <p className="text-xs text-muted-foreground">Planos com margem abaixo de 20%</p>
            </div>
          </div>
          {lowMarginPlans.length > 0 ? (
            <div className="space-y-2">
              {lowMarginPlans.map((p) => {
                const margin = ((p.precoVenda - p.precoCusto) / p.precoVenda) * 100
                return (
                  <div
                    key={p.id}
                    className="flex justify-between items-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                  >
                    <span className="text-foreground font-medium">{p.nome}</span>
                    <span className="text-red-400 font-bold text-sm">{margin.toFixed(1)}% margem</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm font-medium">
                Todos os planos possuem margem saudável acima de 20%.
              </p>
            </div>
          )}
        </div>

        {/* Resumo por Sistema */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-purple-400/10">
              <Layers size={20} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Resumo por Sistema</h3>
              <p className="text-xs text-muted-foreground">Quantidade de planos por sistema</p>
            </div>
          </div>
          {sistemas.filter((s) => s.ativo).length > 0 ? (
            <div className="space-y-2">
              {sistemas
                .filter((s) => s.ativo)
                .map((sistema) => {
                  const planosDoSistema = planos.filter((p) => p.sistemaId === sistema.id && p.ativo).length
                  const recursosDoSistema = recursos.filter((r) => r.sistemaId === sistema.id).length
                  return (
                    <div key={sistema.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-foreground font-medium">{sistema.nome}</span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-blue-400">{planosDoSistema} planos</span>
                        <span className="text-amber-400">{recursosDoSistema} recursos</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhum sistema ativo cadastrado.</p>
          )}
        </div>
      </div>
    </div>
  )
}

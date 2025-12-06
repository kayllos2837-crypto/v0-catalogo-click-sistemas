"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Check, Lock, Unlock, AlertCircle, FileText, Loader2 } from "lucide-react"
import type { Sistema, Plano, Adicional, Recurso } from "../../types"
import { MOCK_CONFIGURACOES } from "../../data/mock"
import { generateQuotationPdf } from "../../lib/pdfGenerator"

interface QuotationModalProps {
  isOpen: boolean
  onClose: () => void
  system: Sistema
  plans: Plano[]
  addons: Adicional[]
  resources: Recurso[]
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  system,
  plans,
  addons,
  resources,
}) => {
  const [customerName, setCustomerName] = useState("")
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])

  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [isDiscountUnlocked, setIsDiscountUnlocked] = useState(false)
  const [discountValue, setDiscountValue] = useState<number>(0)
  const [discountError, setDiscountError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setCustomerName("")
      setSelectedPlanId(null)
      setSelectedAddonIds([])
      setIsDiscountUnlocked(false)
      setDiscountValue(0)
      setDiscountError(null)
      setPasswordError(null)
      setPasswordInput("")
      setIsGenerating(false)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  const selectedPlan = plans.find((p) => p.id === selectedPlanId)
  const selectedAddons = addons.filter((a) => selectedAddonIds.includes(a.id))

  const planPrice = selectedPlan ? selectedPlan.precoVenda : 0
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.precoVenda, 0)
  const subTotal = planPrice + addonsTotal

  const finalTotal = Math.max(0, subTotal - discountValue)

  const toggleAddon = (addonId: string) => {
    setSelectedAddonIds((prev) => (prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]))
  }

  const handlePasswordSubmit = () => {
    if (passwordInput === MOCK_CONFIGURACOES.senhaAdminDesconto) {
      setIsDiscountUnlocked(true)
      setIsDiscountModalOpen(false)
      setPasswordInput("")
      setPasswordError(null)
    } else {
      setPasswordError("Senha de desconto incorreta")
    }
  }

  const handleDiscountChange = (val: number) => {
    if (val > subTotal) {
      setDiscountError("Desconto não pode ser maior que o total")
    } else {
      setDiscountError(null)
    }
    setDiscountValue(val)
  }

  const handleGenerateQuotation = async () => {
    if (!selectedPlanId || !selectedPlan) return
    if (discountError) return

    setIsGenerating(true)

    try {
      await generateQuotationPdf({
        system,
        plan: selectedPlan,
        addons: selectedAddons,
        resources: resources,
        clientName: customerName,
        subTotal,
        discount: discountValue,
        finalTotal,
      })
    } catch (error) {
      console.error(error)
      alert("Erro ao gerar PDF. Tente novamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  const formatCurrency = (val: number) => val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal container with glass effect */}
      <div className="relative w-full sm:max-w-5xl glass-strong border-t sm:border glass-border sm:rounded-2xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-slide-up sm:animate-fade-in-up sm:mx-4">
        {/* Header with glass effect */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b glass-border-subtle glass-header flex-shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Gerar Orçamento</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Sistema: <span className="text-primary font-semibold">{system.nome}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 sm:p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 active:bg-muted/70 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-0">
            {/* LEFT COLUMN: SELECTION */}
            <div className="lg:col-span-2 p-4 sm:p-6 space-y-6 sm:space-y-8 lg:border-r glass-border-subtle">
              {/* Customer Info */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Nome do Cliente / Empresa <span className="text-xs text-muted-foreground/70">(Opcional)</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Empresa X Ltda"
                  className="w-full glass-card border glass-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder-muted-foreground/50"
                />
              </div>

              {/* Step 1: Plans */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  Escolha o Plano
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {plans.map((plan) => (
                    <label
                      key={plan.id}
                      className={`relative flex items-center justify-between p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-200
                        ${
                          selectedPlanId === plan.id
                            ? "glass-card-selected border-primary/50 shadow-[0_0_20px_rgba(204,255,0,0.15)]"
                            : "glass-card glass-card-hover border glass-border hover:border-primary/30 active:scale-[0.99]"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${selectedPlanId === plan.id ? "border-primary bg-primary" : "border-muted-foreground/50"}`}
                        >
                          {selectedPlanId === plan.id && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                        </div>
                        <div>
                          <span
                            className={`block font-bold text-sm sm:text-base ${selectedPlanId === plan.id ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {plan.nome}
                          </span>
                          {plan.destaquePopular && (
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary-foreground bg-primary px-2 py-0.5 rounded-full mt-1">
                              Popular
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold text-foreground text-sm sm:text-base">
                          {formatCurrency(plan.precoVenda)}
                        </span>
                        <span className="text-xs text-muted-foreground">{plan.periodicidade}</span>
                      </div>
                      <input
                        type="radio"
                        name="plan"
                        className="hidden"
                        checked={selectedPlanId === plan.id}
                        onChange={() => setSelectedPlanId(plan.id)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 2: Addons */}
              {addons.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    Serviços Adicionais
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {addons.map((addon) => {
                      const isSelected = selectedAddonIds.includes(addon.id)
                      return (
                        <label
                          key={addon.id}
                          className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all duration-200 h-full
                            ${
                              isSelected
                                ? "glass-card-selected border-primary/40"
                                : "glass-card glass-card-hover border glass-border hover:border-primary/30 active:scale-[0.99]"
                            }`}
                        >
                          <div
                            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors flex-shrink-0
                             ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/50"}`}
                          >
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span
                              className={`block text-sm font-bold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              {addon.nome}
                            </span>
                            <span className="text-xs text-muted-foreground block mb-1">{addon.tipoCobranca}</span>
                            <span className="text-sm font-semibold text-primary">
                              {formatCurrency(addon.precoVenda)}
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isSelected}
                            onChange={() => toggleAddon(addon.id)}
                          />
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: SUMMARY with glass sidebar */}
            <div className="glass-sidebar p-4 sm:p-6 flex flex-col border-t lg:border-t-0 lg:border-l glass-border-subtle lg:sticky lg:top-0 lg:self-start">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-bold text-foreground border-b glass-border-subtle pb-3 sm:pb-4">
                  Resumo do Orçamento
                </h3>

                <div className="space-y-3 sm:space-y-4">
                  {/* Plan */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-muted-foreground text-xs sm:text-sm block">Plano</span>
                      <strong className="text-foreground text-sm sm:text-base">
                        {selectedPlan ? selectedPlan.nome : "Nenhum selecionado"}
                      </strong>
                    </div>
                    <span className="text-foreground font-medium text-sm sm:text-base">
                      {formatCurrency(planPrice)}
                      {selectedPlan && (
                        <span className="text-xs text-muted-foreground block text-right">
                          {selectedPlan.periodicidade}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Addons */}
                  {selectedAddons.length > 0 && (
                    <div className="border-t glass-border-subtle pt-3 sm:pt-4">
                      <span className="text-muted-foreground text-xs sm:text-sm block mb-2">Adicionais</span>
                      <div className="space-y-1 sm:space-y-2">
                        {selectedAddons.map((a) => (
                          <div key={a.id} className="flex justify-between text-xs sm:text-sm">
                            <span className="text-muted-foreground truncate mr-2">{a.nome}</span>
                            <span className="text-muted-foreground flex-shrink-0">{formatCurrency(a.precoVenda)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Totals & Actions */}
              <div className="mt-4 sm:mt-8 space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center text-muted-foreground text-xs sm:text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subTotal)}</span>
                </div>

                <div>
                  {!isDiscountUnlocked ? (
                    <button
                      onClick={() => setIsDiscountModalOpen(true)}
                      className="text-xs sm:text-sm text-primary hover:text-primary-hover flex items-center gap-1 underline decoration-dashed underline-offset-4"
                    >
                      <Lock size={14} /> Aplicar Desconto
                    </button>
                  ) : (
                    <div className="glass-card rounded-btn p-3 border glass-border">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <Unlock size={12} /> Desconto liberado
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">R$</span>
                        <input
                          type="number"
                          value={discountValue === 0 ? "" : discountValue}
                          onChange={(e) => handleDiscountChange(Number(e.target.value))}
                          className="bg-transparent text-foreground font-bold w-full focus:outline-none"
                          placeholder="0,00"
                        />
                      </div>
                      {discountError && <span className="text-xs text-red-500 mt-1 block">{discountError}</span>}
                    </div>
                  )}
                  {discountValue > 0 && !discountError && (
                    <div className="flex justify-between items-center text-green-600 dark:text-green-400 text-xs sm:text-sm mt-2">
                      <span>Desconto aplicado</span>
                      <span>- {formatCurrency(discountValue)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t glass-border-subtle pt-3 sm:pt-4 my-3 sm:my-4">
                  <div className="flex justify-between items-end">
                    <span className="text-muted-foreground font-medium text-sm sm:text-base">Total Final</span>
                    <div className="text-right">
                      <span className="text-2xl sm:text-3xl font-bold text-primary block leading-none">
                        {formatCurrency(finalTotal)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {selectedPlan ? selectedPlan.periodicidade : "/mês"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pb-4 sm:pb-0">
                  <button
                    disabled={!selectedPlanId || !!discountError || isGenerating}
                    onClick={handleGenerateQuotation}
                    className="w-full py-3.5 sm:py-4 bg-primary hover:bg-primary-hover active:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold text-base sm:text-lg rounded-btn transition-all shadow-glow hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin" size={22} />
                        <span>Gerando PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileText size={22} />
                        <span>Gerar Orçamento</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal with glass effect */}
      {isDiscountModalOpen && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-strong p-5 sm:p-6 rounded-2xl border glass-border shadow-2xl w-full max-w-sm animate-fade-in-up">
            <h4 className="text-lg font-bold text-foreground mb-3 sm:mb-4">Autorização Admin</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Digite a senha administrativa para liberar o campo de desconto.
            </p>

            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full glass-card border glass-border rounded-xl px-3 py-3 text-foreground mb-4 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Senha do administrador"
              onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
            />
            {passwordError && (
              <div className="flex items-center gap-2 text-red-500 text-xs mb-4">
                <AlertCircle size={14} />
                {passwordError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDiscountModalOpen(false)
                  setPasswordInput("")
                  setPasswordError(null)
                }}
                className="flex-1 py-2.5 border glass-border text-muted-foreground rounded-btn hover:bg-muted/50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-btn transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

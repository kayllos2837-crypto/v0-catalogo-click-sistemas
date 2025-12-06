"use client"

import type React from "react"
import { ArrowRight } from "lucide-react"
import type { Sistema } from "../types"

interface SystemCardProps {
  system: Sistema
  onClick: (id: string) => void
}

export const SystemCard: React.FC<SystemCardProps> = ({ system, onClick }) => {
  return (
    <div
      className="group relative bg-card rounded-card overflow-hidden border border-border hover:border-primary/50 active:border-primary/50 transition-all duration-300 hover:-translate-y-2 active:scale-[0.98] hover:shadow-[0_0_20px_rgba(204,255,0,0.15)] flex flex-col h-full cursor-pointer"
      onClick={() => onClick(system.id)}
    >
      {/* Banner Image Area - Adjusted height for mobile */}
      <div className="h-40 sm:h-48 overflow-hidden relative">
        <img
          src={system.imagemBannerDesktop || "/placeholder.svg"}
          alt={`${system.nome} banner`}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Logo overlay - Smaller on mobile */}
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-background p-1.5 sm:p-2 shadow-lg border border-border group-hover:border-primary transition-colors">
          <img
            src={system.imagemLogoQuadrada || "/placeholder.svg"}
            alt={`${system.nome} logo`}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>

      {/* Content - Reduced padding on mobile */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {system.nome}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 sm:mb-6 flex-1 line-clamp-3">
          {system.descricaoCurta}
        </p>

        <button className="w-full py-2.5 sm:py-3 px-4 rounded-btn bg-muted border border-border text-foreground font-medium hover:bg-primary hover:text-primary-foreground dark:hover:text-black hover:border-primary active:bg-primary-hover transition-all flex items-center justify-center gap-2 group/btn text-sm sm:text-base">
          Saiba mais
          <ArrowRight size={16} className="transform group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

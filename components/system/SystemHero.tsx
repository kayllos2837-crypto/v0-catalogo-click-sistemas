import type React from "react"
import type { Sistema } from "../../types"

interface SystemHeroProps {
  system: Sistema
  onQuotate: () => void
}

export const SystemHero: React.FC<SystemHeroProps> = ({ system, onQuotate }) => {
  const bannerDesktop = system.imagemBannerDesktop || "/system-banner.jpg"
  const bannerMobile = system.imagemBannerMobile || bannerDesktop
  const logoSistema = system.imagemLogoSistema || "/system-logo.jpg"

  return (
    <div className="relative h-[400px] w-full flex items-center justify-center overflow-hidden">
      {/* Background Banner */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source media="(max-width: 768px)" srcSet={bannerMobile} />
          <img
            src={bannerDesktop || "/placeholder.svg"}
            alt={`${system.nome} banner`}
            className="w-full h-full object-cover"
          />
        </picture>
        {/* Overlay Dark Gradient */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center flex flex-col items-center">
        <div className="mb-6 p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
          <img src={logoSistema || "/placeholder.svg"} alt={system.nome} className="h-24 sm:h-32 object-contain" />
        </div>

        <div
          className="text-lg text-gray-200 leading-relaxed max-w-2xl"
          dangerouslySetInnerHTML={{ __html: system.descricaoDetalhada || "" }}
        />
      </div>
    </div>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Instagram, Linkedin, Phone, Mail } from "lucide-react"
import { getConfiguracoes, getSistemas } from "@/lib/supabase/data-service"
import type { ConfiguracoesGerais, Sistema } from "@/types"

interface FooterProps {
  onNavigate: (route: string) => void
  onNavigateToSystem?: (systemId: string) => void
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onNavigateToSystem }) => {
  const [config, setConfig] = useState<ConfiguracoesGerais | null>(null)
  const [sistemas, setSistemas] = useState<Sistema[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [configData, sistemasData] = await Promise.all([getConfiguracoes(), getSistemas()])
        setConfig(configData)
        setSistemas(sistemasData)
      } catch (error) {
        console.error("Error loading footer data:", error)
      }
    }
    loadData()
  }, [])

  return (
    <footer className="bg-card border-t border-border pt-10 sm:pt-12 pb-6 sm:pb-8 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Column 1: Brand */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              {config?.logoRodape ? (
                <img src={config.logoRodape || "/placeholder.svg"} alt="Logo" className="h-10 w-auto object-contain" />
              ) : config?.logoSite ? (
                <img src={config.logoSite || "/placeholder.svg"} alt="Logo" className="h-10 w-auto object-contain" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-btn flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">C</span>
                  </div>
                  <span className="text-xl font-bold text-foreground tracking-tight">
                    Click <span className="text-primary">Sistemas</span>
                  </span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              {config?.fraseRodape ||
                "Soluções tecnológicas inovadoras para impulsionar o seu negócio. Sistemas robustos, design intuitivo e alta performance."}
            </p>
          </div>

          {/* Column 2: Sistemas */}
          <div className="space-y-4">
            <h3 className="text-foreground font-semibold text-base sm:text-lg">Sistemas</h3>
            <ul className="space-y-1">
              {sistemas.length > 0 ? (
                sistemas.map((sistema) => (
                  <li key={sistema.id}>
                    <button
                      onClick={() => onNavigateToSystem?.(sistema.id)}
                      className="text-muted-foreground hover:text-primary active:text-primary transition-colors text-sm py-1.5 block"
                    >
                      {sistema.nome}
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground text-sm py-1.5">Carregando...</li>
              )}
            </ul>
          </div>

          {/* Column 3: Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-foreground font-semibold text-base sm:text-lg">Contato</h3>

            <div className="space-y-3">
              {config?.contato?.telefone && (
                <a
                  href={`tel:${config.contato.telefone.replace(/\D/g, "")}`}
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone size={18} className="text-primary flex-shrink-0" />
                  <span className="text-sm">{config.contato.telefone}</span>
                </a>
              )}

              {config?.contato?.email && (
                <a
                  href={`mailto:${config.contato.email}`}
                  className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail size={18} className="text-primary flex-shrink-0" />
                  <span className="text-sm break-all">{config.contato.email}</span>
                </a>
              )}
            </div>

            <div className="flex space-x-3 pt-2">
              {config?.linksSociais?.whatsapp && (
                <a
                  href={config.linksSociais.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-green-500 hover:text-white active:bg-green-600 transition-all"
                  title="WhatsApp"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </a>
              )}

              {config?.linksSociais?.instagram && (
                <a
                  href={config.linksSociais.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-pink-600 hover:text-white active:bg-pink-700 transition-all"
                  title="Instagram"
                >
                  <Instagram size={20} />
                </a>
              )}

              {config?.linksSociais?.linkedin && (
                <a
                  href={config.linksSociais.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-blue-600 hover:text-white active:bg-blue-700 transition-all"
                  title="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6 sm:pt-8 text-center">
          <p className="text-muted-foreground text-xs sm:text-sm">
            © 2025 Click Sistemas - Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

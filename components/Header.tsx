"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Menu, Moon, Sun, User, ChevronDown, Home, Monitor } from "lucide-react"
import { getConfiguracoes, getSistemas } from "../lib/supabase/data-service"
import type { Sistema, ConfiguracoesGerais } from "../types"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onNavigate: (route: string) => void
  onSystemSelect?: (id: string) => void
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onSystemSelect }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [config, setConfig] = useState<ConfiguracoesGerais | null>(null)
  const [sistemas, setSistemas] = useState<Sistema[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [configData, sistemasData] = await Promise.all([getConfiguracoes(), getSistemas()])
        setConfig(configData)
        setSistemas(sistemasData)
      } catch (error) {
        console.error("Error loading header data:", error)
      }
    }
    loadData()
  }, [])

  const activeSystems = sistemas.filter((s) => s.ativo).sort((a, b) => a.ordemExibicao - b.ordemExibicao)

  const visibleLimit = 4
  const showDropdown = activeSystems.length > visibleLimit

  const visibleSystems = showDropdown ? activeSystems.slice(0, 3) : activeSystems
  const hiddenSystems = showDropdown ? activeSystems.slice(3) : []

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (storedTheme === "dark" || (!storedTheme && systemPrefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    } else {
      setIsDarkMode(false)
      document.documentElement.classList.remove("dark")
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleTheme = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)

    if (newMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const handleNavClick = (route: string) => {
    onNavigate(route)
    setIsSheetOpen(false)
  }

  const handleSystemClick = (id: string) => {
    if (onSystemSelect) {
      onSystemSelect(id)
    } else {
      const event = new CustomEvent("navigate-system", { detail: id })
      window.dispatchEvent(event)
    }
    setIsSheetOpen(false)
    setIsDropdownOpen(false)
  }

  return (
    <header className="sticky top-0 z-[45] w-full backdrop-blur-md bg-card/90 border-b border-border shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer py-2" onClick={() => handleNavClick("home")}>
            {config?.logoSite ? (
              <img
                src={config.logoSite || "/placeholder.svg"}
                alt="Logo"
                className="h-10 md:h-14 w-auto object-contain transition-transform hover:scale-105"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-btn flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg md:text-xl">C</span>
                </div>
                <span className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                  Click <span className="text-primary">Sistemas</span>
                </span>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {visibleSystems.map((system) => (
              <button
                key={system.id}
                onClick={() => handleSystemClick(system.id)}
                className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                {system.nome}
              </button>
            ))}

            {showDropdown && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${isDropdownOpen ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                >
                  Mais <ChevronDown size={14} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-card rounded-card shadow-xl border border-border py-2 animate-fade-in z-50">
                    {hiddenSystems.map((system) => (
                      <button
                        key={system.id}
                        onClick={() => handleSystemClick(system.id)}
                        className="block w-full text-left px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                      >
                        {system.nome}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 ml-2 border-l pl-6 border-primary-foreground">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-btn hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                aria-label="Alternar tema"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => handleNavClick("admin")}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-btn transition-transform hover:scale-105 text-sm"
              >
                <User size={18} />
                <span>Área Restrita</span>
              </button>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-3 text-muted-foreground hover:text-foreground active:bg-muted rounded-btn transition-colors"
              aria-label="Alternar tema"
            >
              {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>

            {/* Sheet Mobile Menu */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-3 text-muted-foreground hover:text-foreground"
                  aria-label="Abrir menu"
                >
                  <Menu size={26} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-card border-border flex flex-col p-0">
                <SheetHeader className="border-b border-border p-4 flex-shrink-0">
                  <SheetTitle className="text-foreground text-left">Menu</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col flex-1 min-h-0">
                  <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {/* Home Button */}
                    <button
                      onClick={() => handleNavClick("home")}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-muted active:bg-muted/80 transition-colors"
                    >
                      <Home size={20} className="text-primary" />
                      Início
                    </button>

                    {/* Sistemas Section */}
                    <div className="pt-2 pb-1">
                      <span className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Monitor size={14} />
                        Sistemas
                      </span>
                    </div>

                    {activeSystems.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-muted-foreground">Carregando sistemas...</div>
                    ) : (
                      activeSystems.map((system) => (
                        <button
                          key={system.id}
                          onClick={() => handleSystemClick(system.id)}
                          className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-muted hover:text-primary active:bg-muted/80 transition-colors"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                          {system.nome}
                        </button>
                      ))
                    )}
                  </nav>

                  <div className="p-4 border-t border-border flex-shrink-0 bg-card">
                    <button
                      onClick={() => handleNavClick("admin")}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-base font-bold bg-primary text-primary-foreground active:bg-primary-hover transition-colors"
                    >
                      <User size={20} />
                      Área Restrita
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

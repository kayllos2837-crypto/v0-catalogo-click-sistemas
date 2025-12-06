"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Header } from "./components/Header.tsx"
import { Footer } from "./components/Footer.tsx"
import { ScrollToTop } from "./components/ScrollToTop.tsx"
import { AdminSidebar, type AdminRoute } from "./components/admin/AdminSidebar.tsx"
import { SystemCard } from "./components/SystemCard.tsx"
import { useSistemas, useConfiguracoes } from "./lib/hooks/use-supabase-data.ts"
import type { Sistema } from "./types.ts"
import { SystemDetails } from "./SystemDetails.tsx"
import { ImportPage } from "./ImportPage.tsx"
import { FinancePage } from "./FinancePage.tsx"
import { DashboardPage } from "./DashboardPage.tsx"
import { SettingsPage } from "./SettingsPage.tsx"
import { SystemsPage } from "./SystemsPage.tsx"
import { PlansPage } from "./PlansPage.tsx"
import { AddonsPage } from "./AddonsPage.tsx"
import { ResourcesPage } from "./ResourcesPage.tsx"
import { LoginPage } from "./LoginPage.tsx"
import { createClient } from "./lib/supabase/client.ts"
import { getConfiguracoes } from "./lib/supabase/data-service.ts"

type Route = "home" | "system" | "admin-login" | AdminRoute

const Home: React.FC<{ onNavigate: (systemId: string) => void }> = ({ onNavigate }) => {
  const { sistemas, isLoading: sistemasLoading, isError: sistemasError } = useSistemas()
  const { config, isLoading: configLoading } = useConfiguracoes()

  const isLoading = sistemasLoading || configLoading

  // Filter and sort active systems
  const filteredSistemas = sistemas
    .filter((s: Sistema) => s.ativo)
    .sort((a: Sistema, b: Sistema) => a.ordemExibicao - b.ordemExibicao)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (sistemasError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Erro ao carregar dados. Tente novamente.
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[320px] sm:min-h-[400px] lg:min-h-[450px] flex items-center justify-center overflow-hidden py-12 sm:py-0">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/1920/1080?grayscale&blur=2"
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40 sm:to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight text-balance">
              Transforme seu negócio com a <span className="text-primary">Click Sistemas</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8 leading-relaxed max-w-xl">
              Tecnologia de ponta e design intuitivo para otimizar processos e impulsionar resultados. Descubra o
              sistema ideal para você.
            </p>
            <div>
              <a
                href={config?.linksSociais?.whatsapp || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-primary hover:bg-primary-hover active:bg-primary-hover text-primary-foreground font-bold rounded-btn transition-all hover:scale-105 shadow-glow text-sm sm:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Fale Conosco
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Systems Section */}
      <section id="systems" className="py-12 sm:py-16 lg:py-20 bg-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <span className="text-primary font-semibold tracking-wider uppercase text-xs sm:text-sm">
              Nossas Soluções
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mt-2 mb-3 sm:mb-4">
              Sistemas desenvolvidos para sua evolução
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
              Navegue por nossa suite de aplicativos. Cada módulo foi pensado para resolver dores específicas do seu dia
              a dia corporativo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredSistemas.map((system) => (
              <SystemCard key={system.id} system={system} onClick={onNavigate} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-card border-t border-border transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6">Pronto para começar?</h2>
          <p className="text-muted-foreground mb-6 sm:mb-8 text-base sm:text-lg max-w-xl mx-auto">
            Junte-se a diversas empresas que já otimizaram seus processos com a Click Sistemas.
          </p>
          <a
            href={config?.linksSociais?.whatsapp || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 sm:px-10 py-3.5 sm:py-4 bg-primary hover:bg-primary-hover active:bg-primary-hover text-primary-foreground font-bold text-base sm:text-lg rounded-btn shadow-glow hover:shadow-[0_4px_30px_rgba(204,255,0,0.4)] transition-all transform hover:-translate-y-1"
          >
            Solicitar Demonstração
          </a>
        </div>
      </section>
    </div>
  )
}

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<Route>("home")
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const { setTheme } = useTheme()

  useEffect(() => {
    const loadDefaultTheme = async () => {
      try {
        const config = await getConfiguracoes()
        if (config?.temaPadrao) {
          setTheme(config.temaPadrao)
        }
      } catch (error) {
        console.error("Erro ao carregar tema padrão:", error)
      }
    }
    loadDefaultTheme()
  }, [setTheme])

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsAdminAuthenticated(!!user)
      setIsCheckingAuth(false)
    }
    checkAuth()

    // Listen for auth changes
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAdminAuthenticated(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  // --- Navigation Handlers ---

  const handleNavigation = (destination: string) => {
    switch (destination) {
      case "home":
        setCurrentRoute("home")
        setSelectedSystemId(null)
        window.scrollTo(0, 0)
        break

      case "systems":
        setCurrentRoute("home")
        setSelectedSystemId(null)
        setTimeout(() => {
          const section = document.getElementById("systems")
          if (section) section.scrollIntoView({ behavior: "smooth" })
        }, 100)
        break

      case "admin":
        if (isAdminAuthenticated) {
          setCurrentRoute("admin-dashboard")
        } else {
          setCurrentRoute("admin-login")
        }
        window.scrollTo(0, 0)
        break

      default:
        console.warn("Unknown route:", destination)
        setCurrentRoute("home")
    }
  }

  const navigateToSystem = (id: string) => {
    setSelectedSystemId(id)
    setCurrentRoute("system")
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    const handleSystemNav = (e: any) => {
      const id = e.detail
      if (id) navigateToSystem(id)
    }
    window.addEventListener("navigate-system", handleSystemNav)
    return () => window.removeEventListener("navigate-system", handleSystemNav)
  }, [])

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true)
    setCurrentRoute("admin-dashboard")
  }

  const handleAdminLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsAdminAuthenticated(false)
    setCurrentRoute("home")
  }

  // --- Render ---

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const isAdminRoute = currentRoute.startsWith("admin-") && currentRoute !== "admin-login"

  if (isAdminRoute && !isAdminAuthenticated) {
    return <LoginPage onLogin={handleAdminLogin} onNavigate={handleNavigation} />
  }

  if (currentRoute === "admin-login") {
    return <LoginPage onLogin={handleAdminLogin} onNavigate={handleNavigation} />
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-primary-foreground transition-colors duration-300">
      {!isAdminRoute && <Header onNavigate={handleNavigation} onSystemSelect={navigateToSystem} />}

      <div className={`flex flex-1 ${isAdminRoute ? "flex-col lg:flex-row" : ""}`}>
        {isAdminRoute && (
          <AdminSidebar
            currentRoute={currentRoute}
            onNavigate={(route) => setCurrentRoute(route)}
            onLogout={handleAdminLogout}
          />
        )}

        <main className="flex-grow bg-background w-full">
          {currentRoute === "home" && <Home onNavigate={navigateToSystem} />}
          {currentRoute === "system" && selectedSystemId && <SystemDetails systemId={selectedSystemId} />}
          {currentRoute === "admin-dashboard" && <DashboardPage />}
          {currentRoute === "admin-finance" && <FinancePage />}
          {currentRoute === "admin-import" && <ImportPage />}
          {currentRoute === "admin-settings" && <SettingsPage />}
          {currentRoute === "admin-systems" && <SystemsPage />}
          {currentRoute === "admin-plans" && <PlansPage />}
          {currentRoute === "admin-addons" && <AddonsPage />}
          {currentRoute === "admin-resources" && <ResourcesPage />}
        </main>
      </div>

      {!isAdminRoute && <Footer onNavigate={handleNavigation} onNavigateToSystem={navigateToSystem} />}

      {!isAdminRoute && <ScrollToTop />}
    </div>
  )
}

export default App

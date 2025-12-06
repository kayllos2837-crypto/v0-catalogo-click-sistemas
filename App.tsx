import type React from "react"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ScrollToTop } from "@/components/ScrollToTop"
import { AdminSidebar, type AdminRoute } from "@/components/admin/AdminSidebar"
import { Home } from "@/pages/Home"
import { SystemDetails } from "@/pages/SystemDetails"
import { ImportPage } from "@/pages/admin/ImportPage"
import { FinancePage } from "@/pages/admin/FinancePage"
import { DashboardPage } from "@/pages/admin/DashboardPage"
import { SettingsPage } from "@/pages/admin/SettingsPage"
import { SystemsPage } from "@/pages/admin/catalogo/SystemsPage"
import { PlansPage } from "@/pages/admin/catalogo/PlansPage"
import { AddonsPage } from "@/pages/admin/catalogo/AddonsPage"
import { ResourcesPage } from "@/pages/admin/catalogo/ResourcesPage"
import { LoginPage } from "@/pages/admin/LoginPage"
import { createClient } from "@/lib/supabase/client"
import { getConfiguracoes } from "@/lib/supabase/data-service"

type Route = "home" | "system" | "admin-login" | AdminRoute

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

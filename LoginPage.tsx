"use client"

import type React from "react"
import { useState } from "react"
import { Lock, User, AlertCircle, Loader2 } from "lucide-react"
import { createClient } from "./lib/supabase/client.ts"

interface LoginPageProps {
  onLogin: () => void
  onNavigate: (route: string) => void
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        throw authError
      }

      onLogin()
    } catch (err: any) {
      setError(err.message || "Credenciais inválidas. Verifique email e senha.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card p-8 rounded-card border border-border shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-btn flex items-center justify-center mx-auto mb-4">
            <Lock className="text-primary-foreground" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Área Restrita</h2>
          <p className="text-muted-foreground">Entre com suas credenciais de administrador</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 text-red-500 p-3 rounded-btn text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-btn py-3 pl-10 pr-4 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                placeholder="admin@exemplo.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-btn py-3 pl-10 pr-4 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors"
                placeholder="••••••"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-bold rounded-btn transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate("home")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Voltar ao site
          </button>
        </div>
      </div>
    </div>
  )
}

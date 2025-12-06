import { createBrowserClient } from "@supabase/ssr"

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client

  const getEnvVar = (key: string): string | undefined => {
    // Tenta import.meta.env (Vite build)
    if (typeof import.meta !== "undefined" && import.meta.env) {
      return import.meta.env[key]
    }
    // Tenta process.env (Node/SSR)
    if (typeof process !== "undefined" && process.env) {
      return process.env[key]
    }
    // Tenta window (v0 preview)
    if (typeof window !== "undefined" && (window as any)[key]) {
      return (window as any)[key]
    }
    return undefined
  }

  const supabaseUrl =
    getEnvVar("VITE_SUPABASE_URL") || getEnvVar("NEXT_PUBLIC_SUPABASE_URL") || getEnvVar("SUPABASE_URL")

  const supabaseAnonKey =
    getEnvVar("VITE_SUPABASE_ANON_KEY") || getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY") || getEnvVar("SUPABASE_ANON_KEY")

  console.log("[v0] Verificando variáveis de ambiente do Supabase")
  console.log("[v0] SUPABASE_URL:", supabaseUrl)
  console.log("[v0] SUPABASE_ANON_KEY:", supabaseAnonKey ? "Definida" : "Não definida")

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Variáveis de ambiente do Supabase não configuradas")
    throw new Error(
      "Variáveis de ambiente do Supabase não configuradas. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (ou SUPABASE_URL e SUPABASE_ANON_KEY)",
    )
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey)

  return client
}

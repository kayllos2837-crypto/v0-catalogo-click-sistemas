import useSWR from "swr"
import { getSistemas, getPlanos, getAdicionais, getRecursos, getConfiguracoes } from "@/lib/supabase/data-service"
import type { Sistema, Plano, Adicional, Recurso, ConfiguracoesGerais } from "@/types"

// Fetcher functions
const sistemasFetcher = async (): Promise<Sistema[]> => {
  return await getSistemas()
}

const planosFetcher = async (): Promise<Plano[]> => {
  return await getPlanos()
}

const adicionaisFetcher = async (): Promise<Adicional[]> => {
  return await getAdicionais()
}

const recursosFetcher = async (): Promise<Recurso[]> => {
  return await getRecursos()
}

const configuracoesFetcher = async (): Promise<ConfiguracoesGerais> => {
  return await getConfiguracoes()
}

// SWR hooks with caching
export function useSistemas() {
  const { data, error, isLoading, mutate } = useSWR<Sistema[]>("sistemas", sistemasFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 1 minute deduplication
  })

  return {
    sistemas: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function usePlanos() {
  const { data, error, isLoading, mutate } = useSWR<Plano[]>("planos", planosFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  })

  return {
    planos: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useAdicionais() {
  const { data, error, isLoading, mutate } = useSWR<Adicional[]>("adicionais", adicionaisFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  })

  return {
    adicionais: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useRecursos() {
  const { data, error, isLoading, mutate } = useSWR<Recurso[]>("recursos", recursosFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  })

  return {
    recursos: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export function useConfiguracoes() {
  const { data, error, isLoading, mutate } = useSWR<ConfiguracoesGerais>("configuracoes", configuracoesFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  })

  return {
    config: data || null,
    isLoading,
    isError: error,
    mutate,
  }
}

// Combined hook for all catalog data
export function useCatalogData() {
  const { sistemas, isLoading: sistemasLoading } = useSistemas()
  const { planos, isLoading: planosLoading } = usePlanos()
  const { adicionais, isLoading: adicionaisLoading } = useAdicionais()
  const { recursos, isLoading: recursosLoading } = useRecursos()
  const { config, isLoading: configLoading } = useConfiguracoes()

  return {
    sistemas,
    planos,
    adicionais,
    recursos,
    config,
    isLoading: sistemasLoading || planosLoading || adicionaisLoading || recursosLoading || configLoading,
  }
}

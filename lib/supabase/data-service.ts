import { createClient } from "./client"
import type { Sistema, Plano, Adicional, Recurso, ConfiguracoesGerais } from "@/types"

// =============================================
// SISTEMAS
// =============================================

export async function getSistemas(): Promise<Sistema[]> {
  const supabase = createClient()

  const { data, error } = await supabase.from("sistemas").select("*").order("ordem_exibicao", { ascending: true })

  if (error) {
    console.error("Error fetching sistemas:", error)
    return []
  }

  return data.map(mapSistemaFromDB)
}

export async function getSistemaById(id: string): Promise<Sistema | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("sistemas").select("*").eq("id", id).maybeSingle()

  if (error) {
    console.error("Error fetching sistema:", error)
    return null
  }

  if (!data) {
    return null
  }

  return mapSistemaFromDB(data)
}

export async function upsertSistema(sistema: Partial<Sistema> & { id?: string }): Promise<Sistema | null> {
  const supabase = createClient()

  const dbData = mapSistemaToDB(sistema, !sistema.id)

  // Se tem ID, usa upsert (insere ou atualiza)
  if (sistema.id && sistema.id.trim() !== "") {
    dbData.id = sistema.id

    const { data, error } = await supabase.from("sistemas").upsert(dbData, { onConflict: "id" }).select().single()

    if (error) {
      console.error("Error upserting sistema:", error)
      return null
    }
    return mapSistemaFromDB(data)
  }

  // Sem ID - gera um ID automático baseado em timestamp
  dbData.id = `SI${Date.now()}`

  const { data, error } = await supabase.from("sistemas").insert(dbData).select().single()

  if (error) {
    console.error("Error inserting sistema:", error)
    return null
  }

  return mapSistemaFromDB(data)
}

export async function deleteSistema(id: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.from("sistemas").delete().eq("id", id)

  if (error) {
    console.error("Error deleting sistema:", error)
    return false
  }

  return true
}

// =============================================
// PLANOS
// =============================================

export async function getPlanos(): Promise<Plano[]> {
  const supabase = createClient()

  const { data, error } = await supabase.from("planos").select("*").order("ordem_exibicao", { ascending: true })

  if (error) {
    console.error("Error fetching planos:", error)
    return []
  }

  return data.map(mapPlanoFromDB)
}

export async function getPlanosBySistema(sistemaId: string): Promise<Plano[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("planos")
    .select("*")
    .eq("sistema_id", sistemaId)
    .order("ordem_exibicao", { ascending: true })

  if (error) {
    console.error("Error fetching planos:", error)
    return []
  }

  return data.map(mapPlanoFromDB)
}

export async function upsertPlano(plano: Partial<Plano> & { id?: string }): Promise<Plano | null> {
  const supabase = createClient()

  const dbData = mapPlanoToDB(plano, !plano.id)

  // Se tem ID, usa upsert (insere ou atualiza)
  if (plano.id && plano.id.trim() !== "") {
    dbData.id = plano.id

    const { data, error } = await supabase.from("planos").upsert(dbData, { onConflict: "id" }).select().single()

    if (error) {
      console.error("Error upserting plano:", error)
      return null
    }
    return mapPlanoFromDB(data)
  }

  // Sem ID - gera um ID automático baseado em timestamp
  dbData.id = `PL${Date.now()}`

  const { data, error } = await supabase.from("planos").insert(dbData).select().single()

  if (error) {
    console.error("Error inserting plano:", error)
    return null
  }

  return mapPlanoFromDB(data)
}

export async function deletePlano(id: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.from("planos").delete().eq("id", id)

  if (error) {
    console.error("Error deleting plano:", error)
    return false
  }

  return true
}

// =============================================
// ADICIONAIS
// =============================================

export async function getAdicionais(): Promise<Adicional[]> {
  const supabase = createClient()

  const { data, error } = await supabase.from("adicionais").select("*").order("ordem_exibicao", { ascending: true })

  if (error) {
    console.error("Error fetching adicionais:", error)
    return []
  }

  return data.map(mapAdicionalFromDB)
}

export async function getAdicionaisBySistema(sistemaId: string): Promise<Adicional[]> {
  const supabase = createClient()

  const { data, error } = await supabase.from("adicionais").select("*").order("ordem_exibicao", { ascending: true })

  if (error) {
    console.error("Error fetching adicionais:", error)
    return []
  }

  // Filtrar no cliente pois é um array
  return data.filter((a: any) => a.sistemas_vinculados?.includes(sistemaId)).map(mapAdicionalFromDB)
}

export async function upsertAdicional(adicional: Partial<Adicional> & { id?: string }): Promise<Adicional | null> {
  const supabase = createClient()

  const dbData = mapAdicionalToDB(adicional, !adicional.id)

  // Se tem ID, usa upsert (insere ou atualiza)
  if (adicional.id && adicional.id.trim() !== "") {
    dbData.id = adicional.id

    const { data, error } = await supabase.from("adicionais").upsert(dbData, { onConflict: "id" }).select().single()

    if (error) {
      console.error("Error upserting adicional:", error)
      return null
    }
    return mapAdicionalFromDB(data)
  }

  // Sem ID - gera um ID automático baseado em timestamp
  dbData.id = `AD${Date.now()}`

  const { data, error } = await supabase.from("adicionais").insert(dbData).select().single()

  if (error) {
    console.error("Error inserting adicional:", error)
    return null
  }

  return mapAdicionalFromDB(data)
}

export async function deleteAdicional(id: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.from("adicionais").delete().eq("id", id)

  if (error) {
    console.error("Error deleting adicional:", error)
    return false
  }

  return true
}

// =============================================
// RECURSOS
// =============================================

export async function getRecursos(): Promise<Recurso[]> {
  const supabase = createClient()

  const { data, error } = await supabase.from("recursos").select("*").order("ordem_exibicao", { ascending: true })

  if (error) {
    console.error("Error fetching recursos:", error)
    return []
  }

  return data.map(mapRecursoFromDB)
}

export async function getRecursosBySistema(sistemaId: string): Promise<Recurso[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("recursos")
    .select("*")
    .eq("sistema_id", sistemaId)
    .order("ordem_exibicao", { ascending: true })

  if (error) {
    console.error("Error fetching recursos:", error)
    return []
  }

  return data.map(mapRecursoFromDB)
}

export async function upsertRecurso(recurso: Partial<Recurso> & { id?: string }): Promise<Recurso | null> {
  const supabase = createClient()

  const dbData = mapRecursoToDB(recurso, !recurso.id)

  // Se tem ID, usa upsert (insere ou atualiza)
  if (recurso.id && recurso.id.trim() !== "") {
    dbData.id = recurso.id

    const { data, error } = await supabase.from("recursos").upsert(dbData, { onConflict: "id" }).select().single()

    if (error) {
      console.error("Error upserting recurso:", error)
      return null
    }
    return mapRecursoFromDB(data)
  }

  // Sem ID - gera um ID automático baseado em timestamp
  dbData.id = `RC${Date.now()}`

  const { data, error } = await supabase.from("recursos").insert(dbData).select().single()

  if (error) {
    console.error("Error inserting recurso:", error)
    return null
  }

  return mapRecursoFromDB(data)
}

export async function deleteRecurso(id: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.from("recursos").delete().eq("id", id)

  if (error) {
    console.error("Error deleting recurso:", error)
    return false
  }

  return true
}

// =============================================
// CONFIGURACOES
// =============================================

export async function getConfiguracoes(): Promise<ConfiguracoesGerais> {
  const supabase = createClient()

  const { data, error } = await supabase.from("configuracoes").select("*").eq("id", 1).single()

  if (error) {
    console.error("Error fetching configuracoes:", error)
    return getDefaultConfiguracoes()
  }

  return mapConfiguracoesFromDB(data)
}

export async function updateConfiguracoes(config: Partial<ConfiguracoesGerais>): Promise<boolean> {
  const supabase = createClient()

  const dbData = mapConfiguracoesToDB(config)

  const { error } = await supabase
    .from("configuracoes")
    .update({ ...dbData, updated_at: new Date().toISOString() })
    .eq("id", 1)

  if (error) {
    console.error("Error updating configuracoes:", error)
    return false
  }

  return true
}

// =============================================
// MAPPERS (DB <-> App Types)
// =============================================

function mapSistemaFromDB(data: any): Sistema {
  return {
    id: data.id,
    nome: data.nome,
    descricaoCurta: data.descricao_curta || "",
    descricaoDetalhada: data.descricao_detalhada || "",
    imagemLogoSistema: data.imagem_logo_sistema || "",
    imagemLogoQuadrada: data.imagem_logo_quadrada || "",
    imagemBannerDesktop: data.imagem_banner_desktop || "",
    imagemBannerMobile: data.imagem_banner_mobile || "",
    ordemExibicao: data.ordem_exibicao || 0,
    ativo: data.ativo ?? true,
  }
}

function mapSistemaToDB(sistema: Partial<Sistema>, isInsert = false): Record<string, any> {
  const result: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  if (sistema.nome !== undefined) result.nome = sistema.nome
  if (sistema.descricaoCurta !== undefined) result.descricao_curta = sistema.descricaoCurta
  if (sistema.descricaoDetalhada !== undefined) result.descricao_detalhada = sistema.descricaoDetalhada
  if (sistema.imagemLogoSistema !== undefined) result.imagem_logo_sistema = sistema.imagemLogoSistema
  if (sistema.imagemLogoQuadrada !== undefined) result.imagem_logo_quadrada = sistema.imagemLogoQuadrada
  if (sistema.imagemBannerDesktop !== undefined) result.imagem_banner_desktop = sistema.imagemBannerDesktop
  if (sistema.imagemBannerMobile !== undefined) result.imagem_banner_mobile = sistema.imagemBannerMobile
  if (sistema.ordemExibicao !== undefined) result.ordem_exibicao = sistema.ordemExibicao
  if (sistema.ativo !== undefined) result.ativo = sistema.ativo

  // Para INSERT, garantir campos obrigatórios com valores padrão
  if (isInsert) {
    result.nome = result.nome || "Novo Sistema"
    result.descricao_curta = result.descricao_curta || ""
    result.ativo = result.ativo ?? true
    result.ordem_exibicao = result.ordem_exibicao ?? 0
  }

  return result
}

function mapPlanoFromDB(data: any): Plano {
  return {
    id: data.id,
    sistemaId: data.sistema_id,
    nome: data.nome,
    precoCusto: Number.parseFloat(data.preco_custo) || 0,
    precoVenda: Number.parseFloat(data.preco_venda) || 0,
    periodicidade: data.periodicidade || "/mês",
    listaBeneficios: data.lista_beneficios || [],
    destaquePopular: data.destaque_popular ?? false,
    ordemExibicao: data.ordem_exibicao || 0,
    ativo: data.ativo ?? true,
  }
}

function mapPlanoToDB(plano: Partial<Plano>, isInsert = false): Record<string, any> {
  const result: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  if (plano.sistemaId !== undefined) result.sistema_id = plano.sistemaId
  if (plano.nome !== undefined) result.nome = plano.nome
  if (plano.precoCusto !== undefined) result.preco_custo = plano.precoCusto
  if (plano.precoVenda !== undefined) result.preco_venda = plano.precoVenda
  if (plano.periodicidade !== undefined) result.periodicidade = plano.periodicidade
  if (plano.listaBeneficios !== undefined) result.lista_beneficios = plano.listaBeneficios
  if (plano.destaquePopular !== undefined) result.destaque_popular = plano.destaquePopular
  if (plano.ordemExibicao !== undefined) result.ordem_exibicao = plano.ordemExibicao
  if (plano.ativo !== undefined) result.ativo = plano.ativo

  // Para INSERT, garantir campos obrigatórios
  if (isInsert) {
    result.nome = result.nome || "Novo Plano"
    result.preco_venda = result.preco_venda ?? 0
    result.ativo = result.ativo ?? true
    result.ordem_exibicao = result.ordem_exibicao ?? 0
  }

  return result
}

function mapAdicionalFromDB(data: any): Adicional {
  return {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao || "",
    tipoCobranca: data.tipo_cobranca || "Mensal",
    precoCusto: Number.parseFloat(data.preco_custo) || 0,
    precoVenda: Number.parseFloat(data.preco_venda) || 0,
    icone: data.icone || "",
    sistemasVinculados: data.sistemas_vinculados || [],
    ordemExibicao: data.ordem_exibicao || 0,
    ativo: data.ativo ?? true,
  }
}

function mapAdicionalToDB(adicional: Partial<Adicional>, isInsert = false): Record<string, any> {
  const result: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  if (adicional.nome !== undefined) result.nome = adicional.nome
  if (adicional.descricao !== undefined) result.descricao = adicional.descricao
  if (adicional.tipoCobranca !== undefined) result.tipo_cobranca = adicional.tipoCobranca
  if (adicional.precoCusto !== undefined) result.preco_custo = adicional.precoCusto
  if (adicional.precoVenda !== undefined) result.preco_venda = adicional.precoVenda
  if (adicional.icone !== undefined) result.icone = adicional.icone
  if (adicional.sistemasVinculados !== undefined) result.sistemas_vinculados = adicional.sistemasVinculados
  if (adicional.ordemExibicao !== undefined) result.ordem_exibicao = adicional.ordemExibicao
  if (adicional.ativo !== undefined) result.ativo = adicional.ativo

  // Para INSERT, garantir campos obrigatórios
  if (isInsert) {
    result.nome = result.nome || "Novo Adicional"
    result.preco_venda = result.preco_venda ?? 0
    result.ativo = result.ativo ?? true
    result.ordem_exibicao = result.ordem_exibicao ?? 0
  }

  return result
}

function mapRecursoFromDB(data: any): Recurso {
  return {
    id: data.id,
    sistemaId: data.sistema_id,
    nome: data.nome,
    categoria: data.categoria || "",
    planosAtivos: data.planos_ativos || [],
    ordemExibicao: data.ordem_exibicao || 0,
  }
}

function mapRecursoToDB(recurso: Partial<Recurso>, isInsert = false): Record<string, any> {
  const result: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  if (recurso.sistemaId !== undefined) result.sistema_id = recurso.sistemaId
  if (recurso.nome !== undefined) result.nome = recurso.nome
  if (recurso.categoria !== undefined) result.categoria = recurso.categoria
  if (recurso.planosAtivos !== undefined) result.planos_ativos = recurso.planosAtivos
  if (recurso.ordemExibicao !== undefined) result.ordem_exibicao = recurso.ordemExibicao

  // Para INSERT, garantir campos obrigatórios
  if (isInsert) {
    result.nome = result.nome || "Novo Recurso"
    result.ordem_exibicao = result.ordem_exibicao ?? 0
  }

  return result
}

function mapConfiguracoesFromDB(data: any): ConfiguracoesGerais {
  return {
    logoSite: data.logo_site || "",
    papelTimbradoPdf: data.papel_timbrado_pdf || "",
    senhaAdminDesconto: data.senha_admin_desconto || "123456",
    temaPadrao: data.tema_padrao || "dark",
    logoRodape: data.logo_rodape || "",
    fraseRodape: data.frase_rodape || "",
    contato: {
      telefone: data.contato_telefone || "",
      email: data.contato_email || "",
    },
    linksSociais: {
      whatsapp: data.link_whatsapp || "",
      instagram: data.link_instagram || "",
      linkedin: data.link_linkedin || "",
    },
  }
}

function mapConfiguracoesToDB(config: Partial<ConfiguracoesGerais>) {
  return {
    ...(config.logoSite !== undefined && { logo_site: config.logoSite }),
    ...(config.papelTimbradoPdf !== undefined && { papel_timbrado_pdf: config.papelTimbradoPdf }),
    ...(config.senhaAdminDesconto !== undefined && { senha_admin_desconto: config.senhaAdminDesconto }),
    ...(config.temaPadrao !== undefined && { tema_padrao: config.temaPadrao }),
    ...(config.logoRodape !== undefined && { logo_rodape: config.logoRodape }),
    ...(config.fraseRodape !== undefined && { frase_rodape: config.fraseRodape }),
    ...(config.contato?.telefone !== undefined && { contato_telefone: config.contato.telefone }),
    ...(config.contato?.email !== undefined && { contato_email: config.contato.email }),
    ...(config.linksSociais?.whatsapp !== undefined && { link_whatsapp: config.linksSociais.whatsapp }),
    ...(config.linksSociais?.instagram !== undefined && { link_instagram: config.linksSociais.instagram }),
    ...(config.linksSociais?.linkedin !== undefined && { link_linkedin: config.linksSociais.linkedin }),
  }
}

function getDefaultConfiguracoes(): ConfiguracoesGerais {
  return {
    logoSite: "",
    papelTimbradoPdf: "",
    senhaAdminDesconto: "123456",
    temaPadrao: "dark",
    logoRodape: "",
    fraseRodape: "",
    contato: {
      telefone: "",
      email: "",
    },
    linksSociais: {
      whatsapp: "",
      instagram: "",
      linkedin: "",
    },
  }
}

export interface Sistema {
  id: string
  nome: string
  descricaoCurta: string // PRD: descricao_curta
  descricaoDetalhada: string // PRD: descricao_detalhada (Rich Text)
  imagemLogoSistema: string // PRD: imagem_logo_sistema
  imagemLogoQuadrada: string // PRD: imagem_logo_quadrada
  imagemBannerDesktop: string // PRD: imagem_banner_desktop
  imagemBannerMobile: string // PRD: imagem_banner_mobile
  ordemExibicao: number // PRD: ordem_exibicao
  ativo: boolean
}

export interface Plano {
  id: string
  sistemaId: string // PRD: sistema_id
  nome: string
  precoCusto: number // PRD: preco_custo
  precoVenda: number // PRD: preco_venda
  periodicidade: string // e.g. "/mês", "/ano"
  listaBeneficios: string[] // PRD: lista_beneficios (Array of strings)
  destaquePopular: boolean // PRD: destaque_popular
  ordemExibicao: number
  ativo: boolean
}

export interface Adicional {
  id: string
  nome: string
  descricao: string
  tipoCobranca: string // e.g. "Mensal", "Por Usuário"
  precoCusto: number
  precoVenda: number
  icone?: string // Optional image URL
  sistemasVinculados: string[] // PRD: sistemas_vinculados (List of Sistema IDs)
  ordemExibicao: number
  ativo: boolean
}

export interface Recurso {
  id: string
  nome: string
  categoria?: string // Optional grouping
  sistemaId: string // Parent System
  planosAtivos: string[] // PRD: planos_ativos (List of Plan IDs that have this feature)
  ordemExibicao: number
}

export interface ConfiguracoesGerais {
  logoSite: string
  papelTimbradoPdf: string // A4 Image URL
  senhaAdminDesconto: string // For Discount Flow validation
  temaPadrao: "light" | "dark"
  logoRodape: string // Logo exibido no rodapé
  fraseRodape: string // Frase abaixo do logo no rodapé
  contato: {
    telefone: string
    email: string
  }
  linksSociais: {
    whatsapp: string
    instagram: string
    linkedin: string
  }
}

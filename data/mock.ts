import { Sistema, Plano, Adicional, Recurso, ConfiguracoesGerais } from '../types';

// Mutable Data Stores
export let dbSistemas: Sistema[] = [
  {
    id: '1',
    nome: 'Click ERP',
    descricaoCurta: 'Gestão empresarial completa com controle de estoque, financeiro e emissão de notas fiscais.',
    descricaoDetalhada: 'O Click ERP é a solução definitiva para unificar todos os departamentos da sua empresa. Com módulos integrados de compras, vendas, estoque e financeiro, você elimina o retrabalho e ganha tempo para focar no crescimento do negócio. Nossa plataforma é 100% em nuvem e conta com segurança de nível bancário.',
    imagemLogoSistema: 'https://via.placeholder.com/150x50?text=Click+ERP', 
    imagemLogoQuadrada: 'https://picsum.photos/200/200?random=1',
    imagemBannerDesktop: 'https://picsum.photos/1920/600?random=10',
    imagemBannerMobile: 'https://picsum.photos/768/500?random=10',
    ordemExibicao: 1,
    ativo: true,
  },
  {
    id: '2',
    nome: 'Click PDV',
    descricaoCurta: 'Frente de caixa ágil para o varejo.',
    descricaoDetalhada: 'Agilidade na frente de caixa é essencial. O Click PDV oferece operação offline, integração com balanças, TEF e leitores de código de barras.',
    imagemLogoSistema: 'https://via.placeholder.com/150x50?text=Click+PDV',
    imagemLogoQuadrada: 'https://picsum.photos/200/200?random=2',
    imagemBannerDesktop: 'https://picsum.photos/1920/600?random=11',
    imagemBannerMobile: 'https://picsum.photos/768/500?random=11',
    ordemExibicao: 2,
    ativo: true,
  }
];

export let dbPlanos: Plano[] = [
  {
    id: 'p1',
    sistemaId: '1',
    nome: 'Start',
    precoCusto: 30.00,
    precoVenda: 99.90,
    periodicidade: '/mês',
    listaBeneficios: ['1 Usuário', 'Emissão de NFe (50/mês)', 'Controle de Estoque Básico', 'Suporte por Email'],
    destaquePopular: false,
    ordemExibicao: 1,
    ativo: true,
  },
  {
    id: 'p2',
    sistemaId: '1',
    nome: 'Pro',
    precoCusto: 50.00,
    precoVenda: 199.90,
    periodicidade: '/mês',
    listaBeneficios: ['5 Usuários', 'Emissão de NFe Ilimitada', 'Controle Financeiro Completo', 'Suporte via Chat e Email', 'Backup Diário'],
    destaquePopular: true,
    ordemExibicao: 2,
    ativo: true,
  },
  {
    id: 'p3',
    sistemaId: '1',
    nome: 'Enterprise',
    precoCusto: 100.00,
    precoVenda: 499.90,
    periodicidade: '/mês',
    listaBeneficios: ['Usuários Ilimitados', 'Multi-CNPJ', 'API de Integração', 'Gerente de Conta Dedicado', 'Treinamento In-Company'],
    destaquePopular: false,
    ordemExibicao: 3,
    ativo: true,
  }
];

// Updated Resources with varied plans to demonstrate Comparison Table logic better
export let dbRecursos: Recurso[] = [
  { id: 'r1', sistemaId: '1', nome: 'Emissão de NFe', categoria: 'Fiscal', planosAtivos: ['p1', 'p2', 'p3'], ordemExibicao: 1 },
  { id: 'r2', sistemaId: '1', nome: 'Emissão de NFCe', categoria: 'Fiscal', planosAtivos: ['p1', 'p2', 'p3'], ordemExibicao: 2 },
  { id: 'r3', sistemaId: '1', nome: 'Sped Fiscal', categoria: 'Fiscal', planosAtivos: ['p2', 'p3'], ordemExibicao: 3 },
  { id: 'r4', sistemaId: '1', nome: 'Controle de Estoque', categoria: 'Estoque', planosAtivos: ['p1', 'p2', 'p3'], ordemExibicao: 4 },
  { id: 'r5', sistemaId: '1', nome: 'Controle de Lotes e Validade', categoria: 'Estoque', planosAtivos: ['p2', 'p3'], ordemExibicao: 5 },
  { id: 'r6', sistemaId: '1', nome: 'Conciliação Bancária', categoria: 'Financeiro', planosAtivos: ['p3'], ordemExibicao: 6 }, // Only Enterprise
  { id: 'r7', sistemaId: '1', nome: 'DRE Gerencial', categoria: 'Financeiro', planosAtivos: ['p3'], ordemExibicao: 7 }, // Only Enterprise
  { id: 'r8', sistemaId: '1', nome: 'Suporte 24h', categoria: 'Atendimento', planosAtivos: ['p2', 'p3'], ordemExibicao: 8 }, // Pro & Enterprise
];

export let dbAdicionais: Adicional[] = [
  {
    id: 'a1',
    nome: 'Implantação Assistida',
    descricao: 'Acompanhamento de um especialista para configurar o sistema.',
    tipoCobranca: 'Taxa Única',
    precoCusto: 200,
    precoVenda: 500.00,
    icone: '', 
    sistemasVinculados: ['1', '2'],
    ordemExibicao: 1,
    ativo: true,
  },
  {
    id: 'a2',
    nome: 'Pacote +5 Usuários',
    descricao: 'Adicione mais usuários ao seu plano atual.',
    tipoCobranca: 'Mensal',
    precoCusto: 20,
    precoVenda: 79.90,
    icone: '',
    sistemasVinculados: ['1'],
    ordemExibicao: 2,
    ativo: true,
  },
  {
    id: 'a3',
    nome: 'Loja Virtual Integrada',
    descricao: 'Sincronize estoque e vendas com e-commerce.',
    tipoCobranca: 'Mensal',
    precoCusto: 50,
    precoVenda: 149.90,
    icone: '',
    sistemasVinculados: ['1'],
    ordemExibicao: 3,
    ativo: true,
  }
];

export let MOCK_CONFIGURACOES: ConfiguracoesGerais = {
  logoSite: '',
  papelTimbradoPdf: '', 
  senhaAdminDesconto: '123456', 
  temaPadrao: 'dark',
  contato: {
    telefone: '(11) 99999-9999',
    email: 'contato@clicksistemas.com.br'
  },
  linksSociais: {
    whatsapp: 'https://wa.me/5511999999999',
    instagram: 'https://instagram.com/clicksistemas',
    linkedin: 'https://linkedin.com/company/clicksistemas'
  }
};

// --- UPSERT ACTIONS (To simulate DB updates from Excel or Manual CRUD) ---

export const getSistemas = () => dbSistemas;
export const getPlanos = () => dbPlanos;
export const getRecursos = () => dbRecursos;
export const getAdicionais = () => dbAdicionais;
export const getConfiguracoes = () => MOCK_CONFIGURACOES;

export const updateConfiguracoes = (newConfig: Partial<ConfiguracoesGerais>) => {
  MOCK_CONFIGURACOES = { 
    ...MOCK_CONFIGURACOES, 
    ...newConfig,
    // Ensure nested objects are merged correctly if passed partially
    contato: { ...MOCK_CONFIGURACOES.contato, ...newConfig.contato },
    linksSociais: { ...MOCK_CONFIGURACOES.linksSociais, ...newConfig.linksSociais }
  };
};

export const upsertSistema = (item: Sistema) => {
  const index = dbSistemas.findIndex(i => i.id === item.id);
  if (index >= 0) dbSistemas[index] = { ...dbSistemas[index], ...item };
  else dbSistemas.push(item);
};

export const deleteSistema = (id: string) => {
  const index = dbSistemas.findIndex(i => i.id === id);
  if (index >= 0) {
     dbSistemas.splice(index, 1);
  }
};

export const upsertPlano = (item: Plano) => {
  const index = dbPlanos.findIndex(i => i.id === item.id);
  if (index >= 0) dbPlanos[index] = { ...dbPlanos[index], ...item };
  else dbPlanos.push(item);
};

export const deletePlano = (id: string) => {
  const index = dbPlanos.findIndex(i => i.id === id);
  if (index >= 0) {
     dbPlanos.splice(index, 1);
  }
};

export const upsertAdicional = (item: Adicional) => {
  const index = dbAdicionais.findIndex(i => i.id === item.id);
  if (index >= 0) dbAdicionais[index] = { ...dbAdicionais[index], ...item };
  else dbAdicionais.push(item);
};

export const deleteAdicional = (id: string) => {
  const index = dbAdicionais.findIndex(i => i.id === id);
  if (index >= 0) {
     dbAdicionais.splice(index, 1);
  }
};

export const upsertRecurso = (item: Recurso) => {
  const index = dbRecursos.findIndex(i => i.id === item.id);
  if (index >= 0) dbRecursos[index] = { ...dbRecursos[index], ...item };
  else dbRecursos.push(item);
};

export const deleteRecurso = (id: string) => {
  const index = dbRecursos.findIndex(i => i.id === id);
  if (index >= 0) {
     dbRecursos.splice(index, 1);
  }
};

export const updateRecursoPlanos = (recursoId: string, planoId: string) => {
  const rIndex = dbRecursos.findIndex(r => r.id === recursoId);
  if (rIndex >= 0) {
    if (!dbRecursos[rIndex].planosAtivos.includes(planoId)) {
      dbRecursos[rIndex].planosAtivos.push(planoId);
    }
  }
};

export const updateAdicionalSistemas = (adicionalId: string, sistemaId: string) => {
  const aIndex = dbAdicionais.findIndex(a => a.id === adicionalId);
  if (aIndex >= 0) {
    if (!dbAdicionais[aIndex].sistemasVinculados.includes(sistemaId)) {
      dbAdicionais[aIndex].sistemasVinculados.push(sistemaId);
    }
  }
};

// Aliases for consumption in UI
export const MOCK_SISTEMAS = dbSistemas;
export const MOCK_PLANOS = dbPlanos;
export const MOCK_RECURSOS = dbRecursos;
export const MOCK_ADICIONAIS = dbAdicionais;

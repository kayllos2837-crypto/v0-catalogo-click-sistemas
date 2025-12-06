-- =============================================
-- SCRIPT: 001-create-tables.sql
-- Criação das tabelas principais do sistema
-- Alterado todos os IDs de UUID para TEXT para permitir IDs customizados
-- =============================================

-- Tabela de Sistemas
CREATE TABLE IF NOT EXISTS sistemas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao_curta TEXT NOT NULL,
  descricao_detalhada TEXT,
  imagem_logo_sistema TEXT,
  imagem_logo_quadrada TEXT,
  imagem_banner_desktop TEXT,
  imagem_banner_mobile TEXT,
  ordem_exibicao INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Planos
CREATE TABLE IF NOT EXISTS planos (
  id TEXT PRIMARY KEY,
  sistema_id TEXT REFERENCES sistemas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  preco_custo DECIMAL(10,2) DEFAULT 0,
  preco_venda DECIMAL(10,2) NOT NULL,
  periodicidade TEXT DEFAULT '/mês',
  lista_beneficios TEXT[] DEFAULT '{}',
  destaque_popular BOOLEAN DEFAULT false,
  ordem_exibicao INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Adicionais
CREATE TABLE IF NOT EXISTS adicionais (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo_cobranca TEXT DEFAULT 'Mensal',
  preco_custo DECIMAL(10,2) DEFAULT 0,
  preco_venda DECIMAL(10,2) NOT NULL,
  icone TEXT,
  sistemas_vinculados TEXT[] DEFAULT '{}',
  ordem_exibicao INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Recursos (features para tabela de comparação)
CREATE TABLE IF NOT EXISTS recursos (
  id TEXT PRIMARY KEY,
  sistema_id TEXT REFERENCES sistemas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  categoria TEXT,
  planos_ativos TEXT[] DEFAULT '{}',
  ordem_exibicao INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Configurações Gerais (singleton)
CREATE TABLE IF NOT EXISTS configuracoes (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Garante apenas 1 registro
  logo_site TEXT,
  papel_timbrado_pdf TEXT,
  senha_admin_desconto TEXT DEFAULT '123456',
  tema_padrao TEXT DEFAULT 'dark',
  contato_telefone TEXT,
  contato_email TEXT,
  link_whatsapp TEXT,
  link_instagram TEXT,
  link_linkedin TEXT,
  logo_rodape TEXT,
  frase_rodape TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir configuração padrão se não existir
INSERT INTO configuracoes (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_planos_sistema ON planos(sistema_id);
CREATE INDEX IF NOT EXISTS idx_recursos_sistema ON recursos(sistema_id);
CREATE INDEX IF NOT EXISTS idx_sistemas_ativo ON sistemas(ativo);
CREATE INDEX IF NOT EXISTS idx_planos_ativo ON planos(ativo);
CREATE INDEX IF NOT EXISTS idx_adicionais_ativo ON adicionais(ativo);

-- =============================================
-- SCRIPT: 004-seed-data.sql
-- Dados iniciais de exemplo
-- =============================================

-- Inserir sistemas de exemplo
INSERT INTO sistemas (id, nome, descricao_curta, descricao_detalhada, ordem_exibicao, ativo) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Click ERP',
  'Gestão empresarial completa com controle de estoque, financeiro e emissão de notas fiscais.',
  'O Click ERP é a solução definitiva para unificar todos os departamentos da sua empresa. Com módulos integrados de compras, vendas, estoque e financeiro, você elimina o retrabalho e ganha tempo para focar no crescimento do negócio. Nossa plataforma é 100% em nuvem e conta com segurança de nível bancário.',
  1,
  true
),
(
  'b2c3d4e5-f6a7-8901-bcde-f23456789012',
  'Click PDV',
  'Frente de caixa ágil para o varejo.',
  'Agilidade na frente de caixa é essencial. O Click PDV oferece operação offline, integração com balanças, TEF e leitores de código de barras.',
  2,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Inserir planos de exemplo para Click ERP
INSERT INTO planos (sistema_id, nome, preco_custo, preco_venda, periodicidade, lista_beneficios, destaque_popular, ordem_exibicao, ativo) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Start',
  30.00,
  99.90,
  '/mês',
  ARRAY['1 Usuário', 'Emissão de NFe (50/mês)', 'Controle de Estoque Básico', 'Suporte por Email'],
  false,
  1,
  true
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Pro',
  50.00,
  199.90,
  '/mês',
  ARRAY['5 Usuários', 'Emissão de NFe Ilimitada', 'Controle Financeiro Completo', 'Suporte via Chat e Email', 'Backup Diário'],
  true,
  2,
  true
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Enterprise',
  100.00,
  499.90,
  '/mês',
  ARRAY['Usuários Ilimitados', 'Multi-CNPJ', 'API de Integração', 'Gerente de Conta Dedicado', 'Treinamento In-Company'],
  false,
  3,
  true
)
ON CONFLICT DO NOTHING;

-- Inserir adicionais de exemplo
INSERT INTO adicionais (nome, descricao, tipo_cobranca, preco_custo, preco_venda, sistemas_vinculados, ordem_exibicao, ativo) VALUES
(
  'Implantação Assistida',
  'Acompanhamento de um especialista para configurar o sistema.',
  'Taxa Única',
  200.00,
  500.00,
  ARRAY['a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6a7-8901-bcde-f23456789012']::UUID[],
  1,
  true
),
(
  'Pacote +5 Usuários',
  'Adicione mais usuários ao seu plano atual.',
  'Mensal',
  20.00,
  79.90,
  ARRAY['a1b2c3d4-e5f6-7890-abcd-ef1234567890']::UUID[],
  2,
  true
),
(
  'Loja Virtual Integrada',
  'Sincronize estoque e vendas com e-commerce.',
  'Mensal',
  50.00,
  149.90,
  ARRAY['a1b2c3d4-e5f6-7890-abcd-ef1234567890']::UUID[],
  3,
  true
)
ON CONFLICT DO NOTHING;

-- Atualizar configurações padrão
UPDATE configuracoes SET
  senha_admin_desconto = '123456',
  tema_padrao = 'dark',
  contato_telefone = '(11) 99999-9999',
  contato_email = 'contato@clicksistemas.com.br',
  link_whatsapp = 'https://wa.me/5511999999999',
  link_instagram = 'https://instagram.com/clicksistemas',
  link_linkedin = 'https://linkedin.com/company/clicksistemas'
WHERE id = 1;

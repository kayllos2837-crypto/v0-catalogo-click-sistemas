-- =============================================
-- SCRIPT: 003-enable-rls.sql
-- Row Level Security para proteção dos dados
-- =============================================

-- Habilitar RLS nas tabelas
ALTER TABLE sistemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE adicionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública (site público pode ler)
CREATE POLICY "Sistemas públicos visíveis" ON sistemas
  FOR SELECT USING (true);

CREATE POLICY "Planos públicos visíveis" ON planos
  FOR SELECT USING (true);

CREATE POLICY "Adicionais públicos visíveis" ON adicionais
  FOR SELECT USING (true);

CREATE POLICY "Recursos públicos visíveis" ON recursos
  FOR SELECT USING (true);

CREATE POLICY "Configurações públicas visíveis" ON configuracoes
  FOR SELECT USING (true);

-- Políticas de escrita (apenas usuários autenticados - admin)
CREATE POLICY "Admin pode inserir sistemas" ON sistemas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin pode atualizar sistemas" ON sistemas
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode deletar sistemas" ON sistemas
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode inserir planos" ON planos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin pode atualizar planos" ON planos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode deletar planos" ON planos
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode inserir adicionais" ON adicionais
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin pode atualizar adicionais" ON adicionais
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode deletar adicionais" ON adicionais
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode inserir recursos" ON recursos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin pode atualizar recursos" ON recursos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode deletar recursos" ON recursos
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode atualizar configuracoes" ON configuracoes
  FOR UPDATE USING (auth.role() = 'authenticated');

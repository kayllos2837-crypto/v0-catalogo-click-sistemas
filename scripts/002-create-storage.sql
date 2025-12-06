-- =============================================
-- SCRIPT: 002-create-storage.sql
-- Configuração do Storage Bucket para imagens
-- =============================================

-- Criar bucket público para imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload público (autenticado ou anônimo no admin)
CREATE POLICY "Allow public read access on images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Política para permitir upload (admin)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');

-- Política para permitir delete (admin)
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'images');

-- Política para permitir update (admin)
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images');

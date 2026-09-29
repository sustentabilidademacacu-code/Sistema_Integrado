const { Client } = require('pg');

async function setupCidadaos() {
  const c = new Client({
    connectionString: 'postgresql://postgres.kheeajpqhwlyaqdsyvtn:Sustentabilidadeclima2026%40@aws-0-sa-east-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await c.connect();

  await c.query(`
    CREATE TABLE IF NOT EXISTS public.cidadaos (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      auth_id uuid,
      nome text NOT NULL,
      email text NOT NULL UNIQUE,
      telefone text,
      bairro text,
      ativo boolean DEFAULT true,
      criado_em timestamp with time zone DEFAULT now()
    );

    ALTER TABLE public.cidadaos ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Permitir insert publico cidadaos" ON public.cidadaos;
    CREATE POLICY "Permitir insert publico cidadaos" ON public.cidadaos FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir select cidadaos" ON public.cidadaos;
    CREATE POLICY "Permitir select cidadaos" ON public.cidadaos FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Permitir update proprio cidadao" ON public.cidadaos;
    CREATE POLICY "Permitir update proprio cidadao" ON public.cidadaos FOR UPDATE USING (true);

    ALTER TABLE public.ocorrencias
    ADD COLUMN IF NOT EXISTS cidadao_id uuid,
    ADD COLUMN IF NOT EXISTS cidadao_nome text,
    ADD COLUMN IF NOT EXISTS cidadao_telefone text;
  `);

  console.log('Tabela public.cidadaos e colunas em ocorrencias criadas com sucesso!');
  await c.end();
}

setupCidadaos().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});

const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.kheeajpqhwlyaqdsyvtn:Sustentabilidadeclima2026%40@aws-0-sa-east-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log('Adicionando colunas de auditoria tecnica e created_at em ocorrencias...');

  await client.query(`
    DO $$
    BEGIN
      -- created_at
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ocorrencias' AND column_name = 'created_at') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        UPDATE public.ocorrencias SET created_at = COALESCE(data_registro, NOW()) WHERE created_at IS NULL;
      END IF;

      -- parecer_tecnico
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ocorrencias' AND column_name = 'parecer_tecnico') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN parecer_tecnico TEXT;
      END IF;

      -- resolvido_por_nome
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ocorrencias' AND column_name = 'resolvido_por_nome') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN resolvido_por_nome TEXT;
      END IF;

      -- resolvido_por_email
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ocorrencias' AND column_name = 'resolvido_por_email') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN resolvido_por_email TEXT;
      END IF;

      -- resolvido_por_id
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ocorrencias' AND column_name = 'resolvido_por_id') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN resolvido_por_id TEXT;
      END IF;

      -- resolvido_em
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ocorrencias' AND column_name = 'resolvido_em') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN resolvido_em TIMESTAMP WITH TIME ZONE;
      END IF;

      -- equipe_responsavel
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ocorrencias' AND column_name = 'equipe_responsavel') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN equipe_responsavel TEXT;
      END IF;

      -- foto_resolucao_url
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ocorrencias' AND column_name = 'foto_resolucao_url') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN foto_resolucao_url TEXT;
      END IF;
    END $$;
  `);

  const cols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'ocorrencias' 
    ORDER BY ordinal_position;
  `);
  console.log('COLUNAS ATUALIZADAS EM OCORRENCIAS:', cols.rows.map(c => c.column_name));

  await client.end();
}

main().catch(console.error);

const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: 'postgresql://postgres.kheeajpqhwlyaqdsyvtn:Sustentabilidadeclima2026%40@aws-0-sa-east-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  console.log('Conectado ao banco para migração!');
  
  const queries = [
    // 1. Adicionar status na ocorrencias
    "ALTER TABLE public.ocorrencias ADD COLUMN IF NOT EXISTS status text DEFAULT 'Pendente'",
    
    // 2. Adicionar novos campos na solicitacao_acesso
    "ALTER TABLE public.solicitacao_acesso ADD COLUMN IF NOT EXISTS email_contato text",
    "ALTER TABLE public.solicitacao_acesso ADD COLUMN IF NOT EXISTS idade integer",
    "ALTER TABLE public.solicitacao_acesso ADD COLUMN IF NOT EXISTS sexo text",
    "ALTER TABLE public.solicitacao_acesso ADD COLUMN IF NOT EXISTS justificativa_admin text",
    "ALTER TABLE public.solicitacao_acesso ADD COLUMN IF NOT EXISTS data_analise timestamp with time zone"
  ];
  
  for (const q of queries) {
    try {
      await client.query(q);
      console.log('OK:', q.substring(0, 80));
    } catch (e) {
      console.log('Erro:', q.substring(0, 80), '-', e.message);
    }
  }

  await client.end();
  console.log('Migração concluída!');
}

migrate().catch(console.error);

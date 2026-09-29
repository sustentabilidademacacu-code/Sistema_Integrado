const { Client } = require('pg');

async function updateAlertasSchema() {
  const c = new Client({
    connectionString: 'postgresql://postgres.kheeajpqhwlyaqdsyvtn:Sustentabilidadeclima2026%40@aws-0-sa-east-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await c.connect();

  await c.query(`
    ALTER TABLE public.alertas_defesa_civil
    ADD COLUMN IF NOT EXISTS emissor_nome text,
    ADD COLUMN IF NOT EXISTS emissor_email text,
    ADD COLUMN IF NOT EXISTS emissor_secretaria text,
    ADD COLUMN IF NOT EXISTS data_encerramento timestamp with time zone,
    ADD COLUMN IF NOT EXISTS encerrado_por text;
  `);

  console.log('Colunas de auditoria prontas!');
  await c.end();
}

updateAlertasSchema().catch(err => {
  console.error(err);
  process.exit(1);
});

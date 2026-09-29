const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.kheeajpqhwlyaqdsyvtn:Sustentabilidadeclima2026%40@aws-0-sa-east-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const cols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'ocorrencias'
    ORDER BY ordinal_position;
  `);
  console.log('COLUNAS ATUAIS:', cols.rows.map(c => `${c.column_name} (${c.data_type})`));

  const policies = await client.query(`
    SELECT policyname, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'ocorrencias';
  `);
  console.log('POLICIES:', policies.rows);

  const sample = await client.query(`SELECT * FROM public.ocorrencias LIMIT 2`);
  console.log('SAMPLE OCORRENCIAS:', sample.rows);

  await client.end();
}

main().catch(console.error);

const { Client } = require('pg');

async function test() {
  const client = new Client({
    connectionString: 'postgresql://postgres.kheeajpqhwlyaqdsyvtn:Sustentabilidadeclima2026%40@aws-0-sa-east-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  
  try {
    const res = await client.query("SELECT * FROM public.ocorrencias LIMIT 1");
    console.log('Columns in ocorrencias:', res.fields.map(f => f.name).join(', '));
  } catch (e) {
    console.log('Error:', e.message);
  }
  
  await client.end();
}

test();

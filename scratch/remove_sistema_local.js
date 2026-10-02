const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.kheeajpqhwlyaqdsyvtn:Sustentabilidadeclima2026%40@aws-0-sa-east-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
  return client.query("UPDATE solicitacao_acesso SET email_institucional = REPLACE(email_institucional, '@sistema.local', '') WHERE email_institucional LIKE '%@sistema.local'");
}).then(() => {
  console.log('Updated existing records.');
  client.end();
}).catch(console.error);

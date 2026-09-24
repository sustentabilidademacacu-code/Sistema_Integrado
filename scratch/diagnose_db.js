const { Client } = require('pg');

async function diagnose() {
  const client = new Client({
    connectionString: 'postgresql://postgres.kheeajpqhwlyaqdsyvtn:Sustentabilidadeclima2026%40@aws-0-sa-east-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  console.log('=== DIAGNÓSTICO DO BANCO ===\n');

  // 1. Verificar colunas da tabela solicitacao_acesso
  console.log('--- COLUNAS DE solicitacao_acesso ---');
  const cols = await client.query(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'solicitacao_acesso'
    ORDER BY ordinal_position
  `);
  cols.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type}) default: ${r.column_default || 'null'}`));

  // 2. Verificar se data_solicitacao existe
  const hasDataSolicitacao = cols.rows.some(r => r.column_name === 'data_solicitacao');
  console.log(`\n⚠ data_solicitacao existe? ${hasDataSolicitacao ? '✅ SIM' : '❌ NÃO'}`);

  // 3. Verificar RLS na tabela solicitacao_acesso
  console.log('\n--- RLS STATUS ---');
  const rls = await client.query(`
    SELECT relname, relrowsecurity, relforcerowsecurity 
    FROM pg_class 
    WHERE relname = 'solicitacao_acesso'
  `);
  if (rls.rows.length > 0) {
    console.log(`  RLS ativo: ${rls.rows[0].relrowsecurity ? '🔒 SIM' : '🔓 NÃO'}`);
    console.log(`  Force RLS: ${rls.rows[0].relforcerowsecurity ? '🔒 SIM' : '🔓 NÃO'}`);
  }

  // 4. Verificar políticas RLS existentes
  console.log('\n--- POLÍTICAS RLS ---');
  const policies = await client.query(`
    SELECT policyname, permissive, roles, cmd, qual, with_check 
    FROM pg_policies 
    WHERE tablename = 'solicitacao_acesso'
  `);
  if (policies.rows.length === 0) {
    console.log('  ❌ NENHUMA política encontrada! INSERT será bloqueado se RLS estiver ativo.');
  } else {
    policies.rows.forEach(p => {
      console.log(`  Política: ${p.policyname} | Comando: ${p.cmd} | Roles: ${p.roles} | Permissive: ${p.permissive}`);
    });
  }

  // 5. Ver dados existentes
  console.log('\n--- REGISTROS EXISTENTES ---');
  const data = await client.query(`SELECT id, nome_completo, email_institucional, status, perfil, data_analise FROM public.solicitacao_acesso ORDER BY id DESC LIMIT 10`);
  data.rows.forEach(r => console.log(`  [${r.status}] ${r.nome_completo} | ${r.email_institucional} | perfil: ${r.perfil} | analise: ${r.data_analise}`));
  console.log(`  Total encontrados: ${data.rows.length}`);

  // 6. Verificar RLS na tabela ocorrencias
  console.log('\n--- RLS em ocorrencias ---');
  const rlsOco = await client.query(`
    SELECT relrowsecurity FROM pg_class WHERE relname = 'ocorrencias'
  `);
  if (rlsOco.rows.length > 0) {
    console.log(`  RLS ativo: ${rlsOco.rows[0].relrowsecurity ? '🔒 SIM' : '🔓 NÃO'}`);
  }
  const polOco = await client.query(`SELECT policyname, cmd FROM pg_policies WHERE tablename = 'ocorrencias'`);
  polOco.rows.forEach(p => console.log(`  Política: ${p.policyname} | Comando: ${p.cmd}`));

  // 7. Colunas de ocorrencias
  console.log('\n--- COLUNAS DE ocorrencias ---');
  const colsOco = await client.query(`
    SELECT column_name, data_type FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'ocorrencias'
    ORDER BY ordinal_position
  `);
  colsOco.rows.forEach(r => console.log(`  ${r.column_name} (${r.data_type})`));

  await client.end();
  console.log('\n=== DIAGNÓSTICO COMPLETO ===');
}

diagnose().catch(e => console.error('ERRO:', e.message));

const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.kheeajpqhwlyaqdsyvtn:Sustentabilidadeclima2026%40@aws-0-sa-east-1.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  // 1. Garantir constraint UNIQUE em email
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'cidadaos_email_key'
      ) THEN
        ALTER TABLE public.cidadaos ADD CONSTRAINT cidadaos_email_key UNIQUE (email);
      END IF;
    END $$;
  `);

  // 2. Sincronizar todos os usuários existentes de auth.users
  const syncQuery = `
    INSERT INTO public.cidadaos (auth_id, nome, email, telefone, bairro, criado_em)
    SELECT 
      id as auth_id,
      COALESCE(raw_user_meta_data->>'nome', raw_user_meta_data->>'nome_completo', split_part(email, '@', 1)) as nome,
      email,
      COALESCE(raw_user_meta_data->>'telefone', '') as telefone,
      COALESCE(raw_user_meta_data->>'bairro', 'Sede (Centro / Cachoeiras)') as bairro,
      created_at as criado_em
    FROM auth.users
    WHERE email NOT LIKE '%@sistema.local'
    ON CONFLICT (email) DO UPDATE 
    SET 
      auth_id = EXCLUDED.auth_id,
      nome = EXCLUDED.nome,
      telefone = EXCLUDED.telefone,
      bairro = EXCLUDED.bairro;
  `;
  await client.query(syncQuery);
  console.log('Sincronizacao de cidadaos concluida!');

  // 3. Criar Trigger automático do PostgreSQL
  const triggerQuery = `
    CREATE OR REPLACE FUNCTION public.handle_new_cidadao_user()
    RETURNS TRIGGER AS $$
    BEGIN
      IF (NEW.raw_user_meta_data->>'tipo' = 'cidadao' OR NEW.raw_user_meta_data->>'tipo' IS NULL) AND NEW.email NOT LIKE '%@sistema.local' THEN
        INSERT INTO public.cidadaos (auth_id, nome, email, telefone, bairro, criado_em)
        VALUES (
          NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
          COALESCE(NEW.raw_user_meta_data->>'bairro', 'Cachoeiras de Macacu'),
          NOW()
        )
        ON CONFLICT (email) DO UPDATE
        SET 
          auth_id = EXCLUDED.auth_id,
          nome = EXCLUDED.nome,
          telefone = EXCLUDED.telefone,
          bairro = EXCLUDED.bairro;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS on_auth_user_created_cidadao ON auth.users;
    CREATE TRIGGER on_auth_user_created_cidadao
      AFTER INSERT OR UPDATE ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_cidadao_user();
  `;
  await client.query(triggerQuery);
  console.log('Trigger automatico ativado!');

  // 4. Conferir dados
  const res = await client.query('SELECT * FROM public.cidadaos');
  console.log('TOTAL CIDADAOS CADASTRADOS:', res.rows.length);
  console.log(res.rows);

  await client.end();
}

main().catch(console.error);

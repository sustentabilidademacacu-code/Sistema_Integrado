import { createClient } from '@supabase/supabase-js';

// Cliente do Supabase com privilégios de Administrador (Bypassa RLS)
// Só deve ser usado em rotas de API no servidor (nunca exportar pro Client)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

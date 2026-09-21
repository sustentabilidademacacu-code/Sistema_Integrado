/**
 * Cliente global do Supabase.
 * Inicializa a conexão com o banco de dados e os serviços de autenticação.
 * 
 * As credenciais devem ser injetadas via variáveis de ambiente (.env.local)
 * para evitar exposição de chaves sensíveis no código-fonte e possibilitar
 * deploy flexível.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Aviso de Configuração: Chaves do Supabase não encontradas nas variáveis de ambiente. Verifique o arquivo .env.local.");
}

export const supabase = createClient(supabaseUrl || 'https://dummy.supabase.co', supabaseAnonKey || 'dummy');

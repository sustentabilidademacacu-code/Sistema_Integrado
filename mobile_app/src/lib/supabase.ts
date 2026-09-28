import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// No ambiente Expo, as variáveis de ambiente devem começar com EXPO_PUBLIC_
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'SUBSTITUA_PELA_SUA_URL_AQUI';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'SUBSTITUA_PELA_SUA_CHAVE_ANON_AQUI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Para persistir login em apps nativos precisamos do AsyncStorage
    // Mas para simplificar esse começo deixaremos as configurações de fallback do Supabase
    persistSession: false,
  }
});

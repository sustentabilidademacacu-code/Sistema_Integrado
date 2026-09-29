import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://kheeajpqhwlyaqdsyvtn.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZWVhanBxaHdseWFxZHN5dnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMzQzMzMsImV4cCI6MjEwNTcxMDMzM30.QB5X0ZVwW2rfAhcG3E1GNa49_LI0zFyR1K1SoIXgWbo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

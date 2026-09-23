const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: 'C:/Users/adrie/Sistema_Integrado/frontend_web/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
          .from('ocorrencias')
          .select('*')
          .eq('status', 'Concluido')
          .order('criado_em', { ascending: false });
          
  console.log('Error:', error);
  console.log('Data:', data);
}

test();

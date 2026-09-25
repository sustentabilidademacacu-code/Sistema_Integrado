import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      'https://oawsmfizeeabuipxekci.supabase.co', 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hd3NtZml6ZWVhYnVpcHhla2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NjY0NzEsImV4cCI6MjEwNTI0MjQ3MX0.AOBVjmN7vPYKSNMQhPRi2HW5_r_goEZcRUNEQGUsIKU'
    );

    const { data, error } = await supabase.from('leituras_clima_irif').select('*');
    if (error) throw error;
    
    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("Erro ao ler do Supabase HexaCloud:", error);
    return NextResponse.json({ data: [], error: String(error) }, { status: 500 });
  }
}

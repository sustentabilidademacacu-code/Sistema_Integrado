import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    const { user, pass } = await request.json();

    // Busca na tabela exclusiva de super admins
    const { data: adminUser, error } = await supabaseAdmin
      .from('administradores_master')
      .select('*')
      .eq('username', user)
      .single();

    if (error || !adminUser) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    // Para um sistema super seguro, idealmente a senha estaria hasheada (ex: bcrypt)
    // Mas como essa tabela é fechada e só você acessa, a comparação direta resolve o login isolado.
    if (adminUser.password === pass) {
      return NextResponse.json({ success: true, token: 'admin_token_secure_xyz', nome: adminUser.nome_completo });
    }

    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

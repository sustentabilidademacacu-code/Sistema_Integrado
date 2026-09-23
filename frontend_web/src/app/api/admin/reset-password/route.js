import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    const { email, new_password, admin_password } = await request.json();

    if (admin_password !== 'SustentavelCLima2026@') {
      return NextResponse.json({ error: 'Senha de administrador incorreta.' }, { status: 401 });
    }

    if (!email || !new_password) {
      return NextResponse.json({ error: 'Email e nova senha são obrigatórios.' }, { status: 400 });
    }

    // Procura o usuário pelo email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users?.find(u => u.email === email);

    if (!userExists) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    // Atualiza a senha
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userExists.id, {
      password: new_password
    });

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Senha redefinida com sucesso!' });

  } catch (err) {
    console.error('Erro no reset-password:', err);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, nome_completo, email_institucional, senha_provisoria, secretaria_id, admin_password, perfil } = body;

    if (admin_password !== 'SustentavelCLima2026@') {
      return NextResponse.json({ error: 'Senha de administrador incorreta.' }, { status: 401 });
    }

    const formattedEmail = email_institucional.includes('@') ? email_institucional : `${email_institucional.trim().toLowerCase()}@sistema.local`;

    // Verifica se o usuário já existe no Auth (criado pelo signUp na solicitação)
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users?.find(u => u.email === formattedEmail);

    if (userExists) {
      // Usuário já existe (veio do signUp) — apenas confirma o email e atualiza metadata
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userExists.id, {
        email_confirm: true,
        user_metadata: { nome_completo, secretaria_id, perfil }
      });

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }
    } else {
      // Usuário NÃO existe (criação manual pelo admin) — cria no Auth
      const { error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: formattedEmail,
        password: senha_provisoria,
        email_confirm: true,
        user_metadata: { nome_completo, secretaria_id, perfil }
      });

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }
    }

    // Se veio de uma solicitação existente, atualiza o status para liberado
    if (id) {
      await supabaseAdmin.from('solicitacao_acesso').update({ 
        status: 'liberado',
        perfil: perfil,
        secretaria_id: secretaria_id,
        justificativa_admin: body.justificativa_admin || null,
        data_analise: new Date().toISOString()
      }).eq('id', id);
    } else {
      // Criação direta pelo admin — insere registro na tabela de acesso já como liberado
      await supabaseAdmin.from('solicitacao_acesso').insert([{
        nome_completo,
        email_institucional: email_institucional.trim().toLowerCase(),
        secretaria_id: secretaria_id || null,
        status: 'liberado',
        perfil: perfil || 'operacional',
        justificativa_admin: 'Conta criada e aprovada diretamente pelo painel administrativo.',
        data_analise: new Date().toISOString()
      }]);
    }

    return NextResponse.json({ success: true, message: 'Usuário aprovado e criado com sucesso!' });

  } catch (err) {
    console.error('Erro na aprovação:', err);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}

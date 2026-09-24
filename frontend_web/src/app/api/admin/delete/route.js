import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    const { id, email, admin_password } = await request.json();

    if (admin_password !== 'SustentavelCLima2026@') {
      return NextResponse.json({ error: 'Senha de administrador incorreta.' }, { status: 401 });
    }

    // Tentar apagar do Auth do Supabase primeiro
    if (email) {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const user = existingUsers?.users?.find(u => u.email === email);
      
      if (user) {
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        if (deleteAuthError) {
          return NextResponse.json({ error: 'Erro ao excluir do sistema de autenticação: ' + deleteAuthError.message }, { status: 400 });
        }
      }
    }

    // Agora deleta o registro da tabela solicitacao_acesso (Histórico)
    if (id) {
      const { error: deleteDbError } = await supabaseAdmin
        .from('solicitacao_acesso')
        .delete()
        .eq('id', id);

      if (deleteDbError) {
        return NextResponse.json({ error: 'Erro ao excluir do banco de dados: ' + deleteDbError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, message: 'Usuário excluído com sucesso.' });

  } catch (err) {
    console.error('Erro na exclusão:', err);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}

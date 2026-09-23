import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request) {
  try {
    const { id, admin_password, justificativa_admin } = await request.json();

    if (admin_password !== 'SustentavelCLima2026@') {
      return NextResponse.json({ error: 'Senha de administrador incorreta.' }, { status: 401 });
    }

    if (id) {
      const { error } = await supabaseAdmin.from('solicitacao_acesso').update({ 
        status: 'rejeitado',
        justificativa_admin: justificativa_admin || null,
        data_analise: new Date().toISOString()
      }).eq('id', id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, message: 'Solicitação rejeitada com sucesso.' });

  } catch (err) {
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}

'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

const ADMIN_USER = 'Sustentabilidade_SIMIIC';
const ADMIN_PASS = 'SustentavelCLima2026@';

const SECRETARIAS_FALLBACK = [
  { id: '11111111-1111-1111-1111-111111111111', nome: 'Gabinete do Prefeito / Sala de Situação', cor_identidade: '#fbbf24' },
  { id: '22222222-2222-2222-2222-222222222222', nome: 'Secretaria de Defesa Civil', cor_identidade: '#ea580c' },
  { id: '33333333-3333-3333-3333-333333333333', nome: 'Secretaria de Obras e Saneamento', cor_identidade: '#2563eb' },
  { id: '44444444-4444-4444-4444-444444444444', nome: 'Secretaria de Assistência Social', cor_identidade: '#c026d3' },
  { id: '55555555-5555-5555-5555-555555555555', nome: 'Secretaria de Sustentabilidade', cor_identidade: '#0e7490' },
  { id: '66666666-6666-6666-6666-666666666666', nome: 'Secretaria de Meio Ambiente', cor_identidade: '#16a34a' },
  { id: '77777777-7777-7777-7777-777777777777', nome: 'Secretaria de Saúde', cor_identidade: '#dc2626' },
  { id: '88888888-8888-8888-8888-888888888888', nome: 'AMAE', cor_identidade: '#0284c7' },
  { id: '99999999-9999-9999-9999-999999999999', nome: 'Secretaria de Agricultura', cor_identidade: '#ca8a04' },
  { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', nome: 'Secretaria de Infraestrutura Rural', cor_identidade: '#78350f' },
  { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', nome: 'Vigilância Sanitária', cor_identidade: '#475569' },
  { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', nome: 'Secretaria de Educação', cor_identidade: '#4f46e5' }
];

function EyeIcon({ isOpen, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
      {isOpen ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      )}
    </button>
  );
}

// ─── LOGIN TELA DO ADMIN ────────────────────────────────────────────────────
function AdminLoginScreen({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      onLogin();
    } else {
      setErro('Credenciais inválidas. Verifique usuário e senha.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#03132e] font-sans">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 via-blue-600 to-emerald-600"></div>

      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.6)] flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-[#0a234f] flex items-center justify-center mb-5 shadow-lg">
          <span className="text-2xl">🔐</span>
        </div>

        <h1 className="text-lg font-black text-slate-900 text-center">Painel Administrativo</h1>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1 mb-6 text-center">
          Sistema SMIIC — Acesso Restrito
        </p>

        {erro && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg mb-4 text-center font-medium">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Usuário</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Usuário administrativo"
              autoComplete="off"
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Senha</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                autoComplete="off"
                className="[&::-ms-reveal]:hidden w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-3 pr-10 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
              <EyeIcon isOpen={showPass} onClick={() => setShowPass(!showPass)} />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-[#022888] hover:bg-blue-900 text-white font-bold py-3 rounded-lg shadow-lg transition-all active:scale-[0.98] mt-2"
          >
            Acessar Painel
          </button>
        </form>

        <Link href="/" className="mt-6 text-[10px] text-slate-400 hover:text-slate-600 transition-colors font-bold underline">
          ← Voltar ao Login do Sistema
        </Link>
      </div>
    </div>
  );
}

// ─── PAINEL DE APROVAÇÃO ────────────────────────────────────────────────────
function PainelAdmin({ onLogout }) {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [secretariasList, setSecretariasList] = useState(SECRETARIAS_FALLBACK);
  const [loading, setLoading] = useState(true);
  // Guarda o perfil selecionado para cada solicitação { [id]: 'operacional'|'gabinete' }
  const [perfisEscolhidos, setPerfisEscolhidos] = useState({});

  async function fetchSolicitacoes() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('solicitacao_acesso')
        .select('*')
        .eq('status', 'analise')
        .order('data_solicitacao', { ascending: false });

      if (error) throw error;
      setSolicitacoes(data || []);

      // Inicializa perfil padrão para cada solicitação
      const perfisIniciais = {};
      (data || []).forEach(s => { perfisIniciais[s.id] = s.perfil || 'operacional'; });
      setPerfisEscolhidos(perfisIniciais);

      // Busca secretarias do banco
      const { data: secData } = await supabase.from('secretarias').select('*');
      if (secData && secData.length > 0) setSecretariasList(secData);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, novoStatus) => {
    const perfilEscolhido = perfisEscolhidos[id] || 'operacional';
    try {
      const updateData = { status: novoStatus };
      if (novoStatus === 'liberado') {
        updateData.perfil = perfilEscolhido;
      }

      const { error } = await supabase
        .from('solicitacao_acesso')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      setSolicitacoes(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar solicitação. Tente novamente.');
    }
  };

  const nomeSecretaria = (secretaria_id) => {
    return secretariasList.find(s => String(s.id) === String(secretaria_id))?.nome || 'Não informada';
  };

  return (
    <div className="min-h-screen bg-[#03132e] font-sans">
      {/* Header */}
      <div className="w-full bg-[#0a234f] border-b border-[#133570] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#133570] border border-[#1e4896] flex items-center justify-center">
            <span className="text-lg">🛡️</span>
          </div>
          <div>
            <h1 className="text-white font-black text-lg tracking-wide">Painel Administrativo</h1>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Sistema SMIIC — Gestão de Acessos</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-xs font-bold">
            {solicitacoes.length} pendente{solicitacoes.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-[#133570] hover:bg-red-900/50 text-slate-400 hover:text-red-400 border border-[#1e4896] hover:border-red-900 rounded-lg text-xs font-bold transition-all"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-8">
        {loading ? (
          <div className="text-center py-20 text-slate-500 font-bold">Carregando solicitações...</div>
        ) : solicitacoes.length === 0 ? (
          <div className="bg-[#0a234f] border border-dashed border-[#1e4896] rounded-2xl p-16 text-center">
            <span className="text-5xl block mb-4">🎉</span>
            <h3 className="text-white text-xl font-bold mb-2">Nenhuma solicitação pendente</h3>
            <p className="text-slate-500">Todos os acessos já foram analisados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-400 text-sm mb-6">
              Analise as solicitações abaixo. Escolha o nível de acesso e aprove ou rejeite.
            </p>
            {solicitacoes.map(sol => (
              <div key={sol.id} className="bg-[#0a234f] border border-[#133570] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Dados do usuário */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-full bg-[#133570] border border-[#1e4896] flex items-center justify-center text-sm font-black text-slate-300">
                      {sol.nome_completo?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="text-white font-bold truncate">{sol.nome_completo}</span>
                  </div>
                  <p className="text-slate-400 text-sm ml-11">{sol.email_institucional}</p>
                  <p className="text-emerald-500 text-xs font-bold ml-11 mt-1">
                    📍 {nomeSecretaria(sol.secretaria_id)}
                  </p>
                  <p className="text-slate-600 text-[10px] ml-11 mt-1">
                    Solicitado em: {sol.data_solicitacao ? new Date(sol.data_solicitacao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </p>
                </div>

                {/* Ações */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  {/* Dropdown de perfil */}
                  <div className="flex flex-col">
                    <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-1">Nível de Acesso</label>
                    <select
                      value={perfisEscolhidos[sol.id] || 'operacional'}
                      onChange={(e) => setPerfisEscolhidos(prev => ({ ...prev, [sol.id]: e.target.value }))}
                      className="bg-[#133570] border border-[#1e4896] text-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500"
                    >
                      <option value="operacional">Operacional (Secretaria)</option>
                      <option value="gabinete">Gabinete (War Room)</option>
                    </select>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(sol.id, 'liberado')}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-emerald-900/30 active:scale-95"
                    >
                      ✓ Aprovar
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(sol.id, 'rejeitado')}
                      className="px-5 py-2.5 bg-red-900/40 hover:bg-red-900/70 text-red-400 hover:text-red-300 border border-red-900/50 rounded-lg font-bold text-sm transition-all active:scale-95"
                    >
                      ✗ Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EXPORT PRINCIPAL ────────────────────────────────────────────────────────
export default function AdminPage() {
  const [adminLogado, setAdminLogado] = useState(false);

  if (!adminLogado) {
    return <AdminLoginScreen onLogin={() => setAdminLogado(true)} />;
  }

  return <PainelAdmin onLogout={() => setAdminLogado(false)} />;
}

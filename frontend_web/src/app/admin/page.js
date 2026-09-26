'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

// Credenciais agora são validadas de forma segura pelo Backend.

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass })
      });
      if (res.ok) {
        onLogin(pass);
      } else {
        setErro('Credenciais inválidas ou usuário não encontrado.');
      }
    } catch(err) {
      setErro('Erro na conexão com o servidor.');
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
function PainelAdmin({ onLogout, adminPass }) {

  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [novoSec, setNovoSec] = useState('');
  const [novoPerfil, setNovoPerfil] = useState('operacional');

  const handleCriacaoManual = async (e) => {
    e.preventDefault();
    if (novoPerfil !== 'gabinete' && !novoSec) return alert('Selecione uma secretaria');
    const res = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: null,
        nome_completo: novoNome,
        email_institucional: novoEmail,
        senha_provisoria: novaSenha,
        secretaria_id: novoSec,
        perfil: novoPerfil,
        admin_password: adminPass
      })
    });
    const data = await res.json();
    if (res.ok) {
      alert("Conta criada diretamente com sucesso!");
      setNovoNome(""); setNovoEmail(""); setNovaSenha("");
      fetchSolicitacoes();
    } else {
      alert("Erro ao criar conta: " + data.error);
    }
  };

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [secretariasList, setSecretariasList] = useState(SECRETARIAS_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pendentes'); // pendentes | historico | secretarias | ocorrencias
  
  // Estados para Secretarias
  const [novaSecretaria, setNovaSecretaria] = useState({ nome: '', cor_identidade: '#133570' });
  const [editandoSec, setEditandoSec] = useState(null);
  const [verUsuariosSecId, setVerUsuariosSecId] = useState(null);

  // Estados para Ocorrências
  const [todasOcorrencias, setTodasOcorrencias] = useState([]);
  const [editOcoId, setEditOcoId] = useState(null);
  const [editOcoForm, setEditOcoForm] = useState({});

  // Guarda o perfil selecionado para cada solicitação { [id]: 'operacional'|'gabinete' }
  const [perfisEscolhidos, setPerfisEscolhidos] = useState({});
  const [justificativas, setJustificativas] = useState({});

  async function fetchSolicitacoes() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('solicitacao_acesso')
        .select('*')
        .order('data_solicitacao', { ascending: false });

      if (error) throw error;
      
      const pendentes = data?.filter(s => s.status === 'analise') || [];
      const hist = data?.filter(s => s.status === 'liberado' || s.status === 'rejeitado') || [];

      setSolicitacoes(pendentes);
      setHistorico(hist);

      // Inicializa perfil padrão para cada solicitação
      const perfisIniciais = {};
      const justIniciais = {};
      pendentes.forEach(s => { 
        perfisIniciais[s.id] = s.perfil || 'operacional'; 
        justIniciais[s.id] = '';
      });
      setPerfisEscolhidos(perfisIniciais);
      setJustificativas(justIniciais);

      // Busca secretarias do banco
      const { data: secData } = await supabase.from('secretarias').select('*');
      if (secData && secData.length > 0) setSecretariasList(secData);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error?.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  useEffect(() => {
    if (activeTab === 'ocorrencias') {
      fetchOcorrencias();
    }
  }, [activeTab]);

  async function fetchOcorrencias() {
    const { data, error } = await supabase.from('ocorrencias').select('*').order('created_at', { ascending: false });
    if (data) setTodasOcorrencias(data);
  }

  const handleSaveSecretaria = async (e) => {
    e.preventDefault();
    if (!novaSecretaria.nome) return alert('Digite o nome');
    
    if (editandoSec) {
      const { error } = await supabase.from('secretarias').update({ nome: novaSecretaria.nome, cor_identidade: novaSecretaria.cor_identidade }).eq('id', editandoSec.id);
      if (!error) {
        alert("Secretaria atualizada!");
        setEditandoSec(null);
        setNovaSecretaria({ nome: '', cor_identidade: '#133570' });
        fetchSolicitacoes();
      } else {
        alert("Erro ao atualizar secretaria: " + error.message);
      }
    } else {
      const { error } = await supabase.from('secretarias').insert([novaSecretaria]);
      if (!error) {
        alert("Secretaria adicionada!");
        setNovaSecretaria({ nome: '', cor_identidade: '#133570' });
        fetchSolicitacoes();
      } else {
        alert("Erro ao adicionar secretaria: " + error.message);
      }
    }
  };

  const handleEditSecretariaClick = (sec) => {
    setEditandoSec(sec);
    setNovaSecretaria({ nome: sec.nome, cor_identidade: sec.cor_identidade });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditSecretaria = () => {
    setEditandoSec(null);
    setNovaSecretaria({ nome: '', cor_identidade: '#133570' });
  };

  const handleDeleteSecretaria = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir a secretaria "${nome}"? Isso não pode ser desfeito.`)) return;
    const { error } = await supabase.from('secretarias').delete().eq('id', id);
    if (!error) {
      alert("Secretaria excluída com sucesso!");
      fetchSolicitacoes();
    } else {
      alert("Erro ao excluir secretaria: " + error.message);
    }
  };

  const handleVerPainel = (sec, tipo) => {
    const isGabinete = sec.nome.toLowerCase().includes('gabinete');
    localStorage.setItem('smiic_secretaria_id', sec.id);
    localStorage.setItem('smiic_secretaria_nome', sec.nome);
    localStorage.setItem('smiic_secretaria_cor', sec.cor_identidade);
    localStorage.setItem('smiic_perfil', isGabinete ? 'gabinete' : 'operacional');
    localStorage.setItem('smiic_user_perfil', isGabinete ? 'gabinete' : 'operacional');
    window.open(`/${tipo}`, '_blank');
  };

  const handleUpdateOcorrencia = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('ocorrencias').update(editOcoForm).eq('id', editOcoId);
    if (!error) {
      alert('Ocorrência atualizada com sucesso!');
      setEditOcoId(null);
      fetchOcorrencias();
    } else {
      alert('Erro ao atualizar ocorrência.');
    }
  };

  const handleDeleteOcorrencia = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta ocorrência permanentemente?')) return;
    const { error } = await supabase.from('ocorrencias').delete().eq('id', id);
    if (!error) {
      fetchOcorrencias();
    }
  };

  const handleUpdateStatus = async (id, novoStatus) => {
    const perfilEscolhido = perfisEscolhidos[id] || 'operacional';
    const justificativa = justificativas[id] || '';
    const sol = solicitacoes.find(s => s.id === id);
    
    if (!sol) return;

    try {
      if (novoStatus === 'liberado') {
        const res = await fetch("/api/admin/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: sol.id,
            nome_completo: sol.nome_completo,
            email_institucional: sol.email_institucional,
            senha_provisoria: sol.senha_provisoria, // se houver, o endpoint deve lidar
            secretaria_id: sol.secretaria_id,
            perfil: perfilEscolhido,
            justificativa_admin: justificativa,
            admin_password: adminPass
          })
        });

        const data = await res.json();
        if (res.ok) {
          alert("Usuário aprovado e conta liberada!");
          fetchSolicitacoes();
        } else {
          alert("Erro: " + data.error);
        }
      } else {
        const res = await fetch("/api/admin/reject", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            id, 
            justificativa_admin: justificativa,
            admin_password: adminPass 
          })
        });
        if (res.ok) {
          alert("Solicitação rejeitada.");
          fetchSolicitacoes();
        } else {
          const data = await res.json();
          alert("Erro ao rejeitar: " + data.error);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao processar. Verifique o console.');
    }
  };

  const handleResetPassword = async (userEmail) => {
    const newPass = prompt(`Digite a nova senha para o usuário ${userEmail}:\n(Letras, números, símbolo e mín 6 caracteres)`);
    if (!newPass) return;
    
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          new_password: newPass,
          admin_password: adminPass
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Senha redefinida com sucesso!");
      } else {
        alert("Erro ao redefinir senha: " + data.error);
      }
    } catch(e) {
      alert("Erro na conexão");
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (!confirm(`TEM CERTEZA ABSOLUTA que deseja excluir permanentemente a conta e o acesso de ${email}?`)) return;

    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          email,
          admin_password: adminPass
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Conta excluída com sucesso.");
        fetchSolicitacoes();
      } else {
        alert("Erro ao excluir: " + data.error);
      }
    } catch (e) {
      alert("Erro na conexão");
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
          <Link href="/admin/irif" className="px-4 py-2 bg-amber-900/40 text-amber-500 border border-amber-900 hover:bg-amber-600 hover:text-white rounded-lg text-xs font-bold transition-all">
            ⚙️ Editor da Fórmula IRIF
          </Link>
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

      <div className="bg-[#133570] px-8 py-0 flex gap-4 border-b border-[#1e4896] overflow-x-auto">
        <button 
          onClick={() => setActiveTab('pendentes')}
          className={`py-3 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'pendentes' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Pendentes ({solicitacoes.length})
        </button>
        <button 
          onClick={() => setActiveTab('historico')}
          className={`py-3 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'historico' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Histórico de Usuários ({historico.length})
        </button>
        <button 
          onClick={() => setActiveTab('secretarias')}
          className={`py-3 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'secretarias' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Gerenciar Secretarias
        </button>
        <button 
          onClick={() => setActiveTab('ocorrencias')}
          className={`py-3 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'ocorrencias' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          Gerenciar Ocorrências
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
        {loading ? (
          <div className="text-center py-20 text-slate-500 font-bold">Carregando solicitações...</div>
        ) : activeTab === 'pendentes' ? (
          solicitacoes.length === 0 ? (
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
                <div key={sol.id} className="bg-[#0a234f] border border-[#133570] rounded-xl p-6 flex flex-col gap-4">
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-full bg-[#133570] border border-[#1e4896] flex items-center justify-center text-sm font-black text-slate-300">
                          {sol.nome_completo?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-white font-bold truncate">{sol.nome_completo}</span>
                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{sol.idade ? `${sol.idade} anos` : 'Idade N/A'} | {sol.sexo || 'Sexo N/A'}</span>
                      </div>
                      <p className="text-slate-400 text-sm ml-11">Login: {sol.email_institucional}</p>
                      <p className="text-slate-400 text-sm ml-11">Contato: {sol.email_contato || 'Não informado'}</p>
                      <p className="text-emerald-500 text-xs font-bold ml-11 mt-1">
                        📍 {nomeSecretaria(sol.secretaria_id)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
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
                    </div>
                  </div>

                  <div className="bg-[#03132e] p-3 rounded-lg border border-[#1e4896] flex flex-col">
                    <label className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-1">Justificativa / Parecer (Opcional)</label>
                    <textarea 
                      value={justificativas[sol.id] || ''}
                      onChange={(e) => setJustificativas(prev => ({ ...prev, [sol.id]: e.target.value }))}
                      placeholder="Motivo da aprovação ou rejeição..."
                      className="bg-transparent text-sm text-slate-300 w-full focus:outline-none resize-none h-12"
                    />
                  </div>

                  <div className="flex gap-2 justify-end mt-2">
                    <button
                      onClick={() => handleUpdateStatus(sol.id, 'rejeitado')}
                      className="px-5 py-2.5 bg-red-900/40 hover:bg-red-900/70 text-red-400 hover:text-red-300 border border-red-900/50 rounded-lg font-bold text-sm transition-all active:scale-95"
                    >
                      ✗ Rejeitar
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(sol.id, 'liberado')}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-emerald-900/30 active:scale-95"
                    >
                      ✓ Aprovar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'historico' ? (
          historico.length === 0 ? (
            <div className="bg-[#0a234f] border border-dashed border-[#1e4896] rounded-2xl p-16 text-center">
              <span className="text-5xl block mb-4">🗂️</span>
              <h3 className="text-white text-xl font-bold mb-2">Nenhum histórico</h3>
              <p className="text-slate-500">Histórico de acessos aprovados/rejeitados aparecerá aqui.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm mb-6">Lista de usuários que já passaram por análise do Setor Responsável.</p>
              {historico.map(sol => (
                <div key={sol.id} className="bg-[#0a234f] border border-[#133570] rounded-xl p-6 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{sol.nome_completo}</span>
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${sol.status === 'liberado' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-900' : 'bg-red-900/50 text-red-400 border border-red-900'}`}>
                          {sol.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">Login: {sol.email_institucional} | Contato: {sol.email_contato}</p>
                      <p className="text-slate-500 text-[10px] mt-1">Perfil: {sol.perfil?.toUpperCase()} — {nomeSecretaria(sol.secretaria_id)}</p>
                    </div>
                    {sol.status === 'liberado' && (
                      <div className="flex flex-col gap-2 items-end shrink-0 ml-2">
                        <button 
                          onClick={() => handleResetPassword(sol.email_institucional)}
                          className="bg-orange-900/40 hover:bg-orange-900/80 text-orange-400 border border-orange-900 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all w-full text-center"
                        >
                          Redefinir Senha
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(sol.id, sol.email_institucional)}
                          className="bg-red-900/40 hover:bg-red-900/80 text-red-400 border border-red-900 px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all w-full text-center"
                        >
                          Excluir Conta
                        </button>
                      </div>
                    )}
                  </div>
                  {sol.justificativa_admin && (
                    <div className="mt-2 bg-[#03132e] border border-[#133570] p-3 rounded-lg">
                      <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Parecer / Relatório</p>
                      <p className="text-xs text-slate-300 italic">"{sol.justificativa_admin}"</p>
                    </div>
                  )}
                  <p className="text-[9px] text-slate-600 mt-2 text-right font-medium">Analisado em: {sol.data_analise ? new Date(sol.data_analise).toLocaleString('pt-BR') : '—'}</p>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'secretarias' ? (
          <div className="space-y-6">
            <div className="bg-[#0a234f] border border-[#133570] rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">{editandoSec ? 'Editar Secretaria' : 'Adicionar Nova Secretaria'}</h2>
              <form onSubmit={handleSaveSecretaria} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Órgão / Secretaria</label>
                  <input required type="text" value={novaSecretaria.nome} onChange={e => setNovaSecretaria({...novaSecretaria, nome: e.target.value})} className="w-full bg-[#133570] border border-[#1e4896] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Ex: Secretaria de Cultura" />
                </div>
                <div className="w-full md:w-24 shrink-0">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cor</label>
                  <input required type="color" value={novaSecretaria.cor_identidade} onChange={e => setNovaSecretaria({...novaSecretaria, cor_identidade: e.target.value})} className="w-full h-[46px] rounded-lg cursor-pointer bg-transparent border-0 p-0" />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  {editandoSec && (
                    <button type="button" onClick={handleCancelEditSecretaria} className="px-6 h-[46px] bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg transition-colors">
                      Cancelar
                    </button>
                  )}
                  <button type="submit" className={`px-6 h-[46px] ${editandoSec ? 'bg-blue-600 hover:bg-blue-500' : 'bg-purple-600 hover:bg-purple-500'} text-white font-bold rounded-lg transition-colors`}>
                    {editandoSec ? 'Salvar' : '+ Adicionar'}
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {secretariasList.map(sec => (
                <div key={sec.id} className="bg-[#0a234f] border border-[#133570] rounded-xl p-5 flex flex-col justify-between" style={{ borderLeftWidth: '4px', borderLeftColor: sec.cor_identidade }}>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">{sec.nome}</h3>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <button onClick={() => handleVerPainel(sec, 'operacional')} className="w-full bg-[#133570] hover:bg-blue-600 text-white text-[10px] font-bold py-2 rounded transition-colors uppercase tracking-wider">
                      Painel Operacional
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditSecretariaClick(sec)} className="flex-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 text-[10px] font-bold py-1.5 rounded transition-colors uppercase tracking-wider">
                        Editar
                      </button>
                      <button onClick={() => handleDeleteSecretaria(sec.id, sec.nome)} className="flex-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-[10px] font-bold py-1.5 rounded transition-colors uppercase tracking-wider">
                        Excluir
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex flex-col">
                    <button onClick={() => setVerUsuariosSecId(verUsuariosSecId === sec.id ? null : sec.id)} className="text-[10px] text-blue-400 font-bold uppercase hover:underline text-left inline-block self-start">
                      {verUsuariosSecId === sec.id ? 'Ocultar Usuários da Secretaria' : 'Ver Usuários da Secretaria'}
                    </button>

                    {verUsuariosSecId === sec.id && (
                      <div className="mt-2 bg-[#03132e] border border-[#133570] rounded p-2 max-h-32 overflow-y-auto custom-scrollbar">
                        {historico.filter(h => h.status === 'liberado' && String(h.secretaria_id) === String(sec.id)).length > 0 ? (
                          historico.filter(h => h.status === 'liberado' && String(h.secretaria_id) === String(sec.id)).map(user => (
                            <div key={user.id} className="text-xs text-slate-300 py-1 border-b border-[#133570]/50 last:border-0">
                              <strong>{user.nome_completo}</strong> <span className="text-[9px] text-slate-500 block">{user.email_institucional}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-500 italic">Nenhum usuário liberado.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#0a234f] border border-[#133570] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#133570] bg-[#03132e]">
              <h2 className="text-white font-bold">Gerenciador de Ocorrências</h2>
              <p className="text-slate-400 text-xs">Altere status, descrição e atributos dos chamados via front-end.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#133570]/50 text-xs uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Bairro / Local</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#133570]">
                  {todasOcorrencias.map(oco => (
                    <tr key={oco.id} className="hover:bg-[#133570]/20 transition-colors">
                      <td className="px-4 py-3 text-xs whitespace-nowrap">{new Date(oco.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-medium text-white">{oco.categoria}</td>
                      <td className="px-4 py-3 text-xs">{oco.bairro}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${oco.status === 'Concluido' || oco.status === 'Concluído' ? 'bg-emerald-900/50 text-emerald-400' : oco.status === 'Em Atendimento' ? 'bg-amber-900/50 text-amber-400' : 'bg-red-900/50 text-red-400'}`}>
                          {oco.status || 'Pendente'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => { setEditOcoId(oco.id); setEditOcoForm(oco); }}
                          className="text-blue-400 hover:text-blue-300 font-bold text-xs uppercase"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteOcorrencia(oco.id)}
                          className="text-red-400 hover:text-red-300 font-bold text-xs uppercase"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {todasOcorrencias.length === 0 && (
              <div className="p-8 text-center text-slate-500">Nenhuma ocorrência encontrada.</div>
            )}
          </div>
        )}

        {/* Modal de Edição de Ocorrência */}
        {editOcoId && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a234f] border border-[#133570] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
              <h2 className="text-white font-black text-lg mb-4 uppercase">Editar Ocorrência</h2>
              <form onSubmit={handleUpdateOcorrencia} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria</label>
                  <input type="text" value={editOcoForm.categoria || ''} onChange={e => setEditOcoForm({...editOcoForm, categoria: e.target.value})} className="w-full bg-[#133570] border border-[#1e4896] text-white rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                  <textarea value={editOcoForm.descricao || ''} onChange={e => setEditOcoForm({...editOcoForm, descricao: e.target.value})} className="w-full bg-[#133570] border border-[#1e4896] text-white rounded-lg p-2 text-sm h-24" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bairro</label>
                    <input type="text" value={editOcoForm.bairro || ''} onChange={e => setEditOcoForm({...editOcoForm, bairro: e.target.value})} className="w-full bg-[#133570] border border-[#1e4896] text-white rounded-lg p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                    <select value={editOcoForm.status || ''} onChange={e => setEditOcoForm({...editOcoForm, status: e.target.value})} className="w-full bg-[#133570] border border-[#1e4896] text-white rounded-lg p-2 text-sm">
                      <option value="Pendente">Pendente</option>
                      <option value="Em Atendimento">Em Atendimento</option>
                      <option value="Concluido">Concluído</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prioridade</label>
                    <select value={editOcoForm.prioridade_acao || ''} onChange={e => setEditOcoForm({...editOcoForm, prioridade_acao: e.target.value})} className="w-full bg-[#133570] border border-[#1e4896] text-white rounded-lg p-2 text-sm">
                      <option value="BAIXA">BAIXA</option>
                      <option value="MÉDIA">MÉDIA</option>
                      <option value="ALTA">ALTA</option>
                      <option value="CRÍTICA">CRÍTICA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Atribuir a</label>
                    <select value={editOcoForm.secretaria_id || ''} onChange={e => setEditOcoForm({...editOcoForm, secretaria_id: e.target.value})} className="w-full bg-[#133570] border border-[#1e4896] text-white rounded-lg p-2 text-sm">
                      <option value="">(Nenhuma)</option>
                      {secretariasList.map(sec => <option key={sec.id} value={sec.id}>{sec.nome}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#133570]">
                  <button type="button" onClick={() => setEditOcoId(null)} className="px-4 py-2 text-slate-400 font-bold hover:text-white transition-colors">Cancelar</button>
                  <button type="submit" className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold shadow-lg">Salvar Alterações</button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>

        {/* Lado Direito: Criação Direta */}
        <div className="bg-[#0a234f] border border-[#133570] rounded-xl p-6 h-fit">
          <h2 className="text-lg font-bold text-white mb-4">Criar Usuário Diretamente</h2>
          <form onSubmit={handleCriacaoManual} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
              <input required type="text" value={novoNome} onChange={e => setNovoNome(e.target.value)} className="w-full bg-[#133570] border border-[#1e4896] rounded-lg p-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail</label>
              <input required type="email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} className="w-full bg-[#133570] border border-[#1e4896] rounded-lg p-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha Provisória</label>
              <input required type="text" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} className="w-full bg-[#133570] border border-[#1e4896] rounded-lg p-2 text-sm text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Perfil</label>
              <select required value={novoPerfil} onChange={e => setNovoPerfil(e.target.value)} className="w-full bg-[#133570] border border-[#1e4896] rounded-lg p-2 text-sm text-white">
                <option value="operacional">Operacional (Secretaria)</option>
                <option value="gabinete">Gabinete (War Room)</option>
              </select>
            </div>
            {novoPerfil !== 'gabinete' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Secretaria</label>
                <select required value={novoSec} onChange={e => setNovoSec(e.target.value)} className="w-full bg-[#133570] border border-[#1e4896] rounded-lg p-2 text-sm text-white">
                  <option value="">Selecione...</option>
                  {secretariasList.map(sec => <option key={sec.id} value={sec.id}>{sec.nome}</option>)}
                </select>
              </div>
            )}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg text-sm transition-colors mt-2">
              Criar e Liberar Acesso
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── EXPORT PRINCIPAL ────────────────────────────────────────────────────────
export default function AdminPage() {
  const [adminLogado, setAdminLogado] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPass = sessionStorage.getItem('smiic_admin_pass');
      if (storedPass) {
        setAdminPass(storedPass);
        setAdminLogado(true);
      }
      setIsLoaded(true);
    }
  }, []);

  if (!isLoaded) return null;

  if (!adminLogado) {
    return <AdminLoginScreen onLogin={(pass) => { 
      sessionStorage.setItem('smiic_admin_pass', pass);
      setAdminLogado(true); 
      setAdminPass(pass); 
    }} />;
  }

  return <PainelAdmin onLogout={() => {
    sessionStorage.removeItem('smiic_admin_pass');
    setAdminLogado(false);
  }} adminPass={adminPass} />;
}

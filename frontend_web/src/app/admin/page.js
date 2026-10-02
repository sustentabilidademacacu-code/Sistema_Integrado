'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

// Credenciais agora são validadas de forma segura pelo Backend.

const SECRETARIAS_FALLBACK = [
  { id: '11111111-1111-1111-1111-111111111111', nome: 'Gabinete', cor_identidade: '#f59e0b' },
  { id: 'sec-procuradoria', nome: 'Procuradoria Geral', cor_identidade: '#475569' },
  { id: 'sec-controladoria', nome: 'Controladoria Geral', cor_identidade: '#64748b' },
  { id: 'sec-governo', nome: 'Secretaria Municipal de Governo e Casa Civil', cor_identidade: '#1e3a8a' },
  { id: 'sec-administracao', nome: 'Secretaria Municipal de Administração', cor_identidade: '#0284c7' },
  { id: 'sec-fazenda', nome: 'Secretaria Municipal de Fazenda', cor_identidade: '#059669' },
  { id: 'sec-planejamento', nome: 'Secretaria Municipal de Planejamento, Habitação e Geoprocessamento', cor_identidade: '#0d9488' },
  { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', nome: 'Secretaria Municipal de Educação', cor_identidade: '#6366f1' },
  { id: '77777777-7777-7777-7777-777777777777', nome: 'Secretaria Municipal de Saúde', cor_identidade: '#e11d48' },
  { id: '44444444-4444-4444-4444-444444444444', nome: 'Secretaria Municipal de Assistencia Social e Políticas para Mulher', cor_identidade: '#d946ef' },
  { id: '55555555-5555-5555-5555-555555555555', nome: 'Secretaria Municipal de Sustentabilidade, Clima, Ecossistema, Recursos Hídricos e Projetos Estratégicos', cor_identidade: '#059669' },
  { id: '33333333-3333-3333-3333-333333333333', nome: 'Secretaria Municipal de Obras Saneamento e Urbanismo', cor_identidade: '#2563eb' },
  { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', nome: 'Secretaria Municipal de Infraestrutura Governamental', cor_identidade: '#b45309' },
  { id: '22222222-2222-2222-2222-222222222222', nome: 'Secretaria Municipal de Defesa Civil', cor_identidade: '#ea580c' },
  { id: 'sec-ordem-publica', nome: 'Secretaria Municipal de Ordem Pública', cor_identidade: '#1e293b' },
  { id: '66666666-6666-6666-6666-666666666666', nome: 'Secretaria Municipal de Meio Ambiente e Bem Estar Animal', cor_identidade: '#16a34a' },
  { id: '99999999-9999-9999-9999-999999999999', nome: 'Secretaria Municipal de Agricultura, Abastecimento e Pesca', cor_identidade: '#ca8a04' },
  { id: 'sec-cultura', nome: 'Secretaria Municipal de Cultura', cor_identidade: '#8b5cf6' },
  { id: 'sec-esporte', nome: 'Secretaria Municipal de Esporte e Lazer', cor_identidade: '#06b6d4' },
  { id: 'sec-turismo', nome: 'Secretaria Municipal de Turismo e Eventos', cor_identidade: '#f97316' },
  { id: 'sec-industria', nome: 'Secretaria Municipal de Industria e Comércio', cor_identidade: '#4f46e5' },
  { id: 'sec-macatur', nome: 'Fundação Macatur', cor_identidade: '#ec4899' },
  { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', nome: 'Secretaria Municipal de Vigilância Sanitária', cor_identidade: '#0284c7' },
  { id: 'sec-integracao', nome: 'Secretaria Municipal Integração Governamental', cor_identidade: '#3b82f6' },
  { id: '88888888-8888-8888-8888-888888888888', nome: 'AMAE', cor_identidade: '#0284c7' },
  { id: 'sec-comunicacao', nome: 'Secretaria Municipal de Comunicação', cor_identidade: '#0ea5e9' },
  { id: 'sec-iapcm', nome: 'Instituto de Previdência do Município de Cachoeiras de Macacu (IAPCM)', cor_identidade: '#7c3aed' },
  { id: 'sec-ciencia', nome: 'Secretaria Municipal de Ciência e Tecnologia', cor_identidade: '#38bdf8' }
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#060e24] via-[#0f172a] to-[#111c3a] font-sans p-4 relative overflow-hidden">
      {/* Luzes de ambientação */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.5)] flex flex-col items-center border border-slate-100 relative z-10">
        
        {/* Logos Oficiais no Topo do Login */}
        <div className="flex items-center justify-center gap-4 mb-6 pb-6 border-b border-slate-100 w-full">
          <img src="/prefeitura_logo_sem_fundo_quadrada.png" alt="Prefeitura" className="h-12 w-auto object-contain" />
          <div className="h-8 w-[1.5px] bg-slate-200 rounded-full"></div>
          <img src="/logo_secretaria_logo_sem_fundo_comprida.png" alt="Sustentabilidade" className="h-9 w-auto object-contain" />
        </div>

        <div className="w-12 h-12 rounded-2xl bg-[#022888] flex items-center justify-center mb-3 shadow-md shadow-blue-900/20">
          <span className="text-xl">🛡️</span>
        </div>

        <h1 className="text-xl font-black text-slate-900 text-center">Painel Administrativo</h1>
        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mt-0.5 mb-6 text-center">
          Sistema SMIIC — Controle de Acessos
        </p>

        {erro && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-4 text-center font-medium">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Usuário de Administrador</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Digite o login do admin"
              autoComplete="off"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-sm focus:outline-none focus:border-[#022888] focus:ring-2 focus:ring-blue-100 transition-all font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Senha de Acesso</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                autoComplete="off"
                className="[&::-ms-reveal]:hidden w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 pr-10 text-sm focus:outline-none focus:border-[#022888] focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                required
              />
              <EyeIcon isOpen={showPass} onClick={() => setShowPass(!showPass)} />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-[#022888] hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] mt-2 text-sm"
          >
            Entrar no Painel Administrativo
          </button>
        </form>

        <Link href="/" className="mt-6 text-xs text-slate-400 hover:text-slate-700 transition-colors font-bold underline">
          ← Voltar aos Painéis Públicos
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
  
  // Abas: 'servidores' | 'cidadaos' | 'pendentes' | 'secretarias' | 'ocorrencias'
  const [activeTab, setActiveTab] = useState('servidores');
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  // Estados para Secretarias
  const [novaSecretaria, setNovaSecretaria] = useState({ nome: '', cor_identidade: '#133570' });
  const [editandoSec, setEditandoSec] = useState(null);
  const [verUsuariosSecId, setVerUsuariosSecId] = useState(null);

  // Estados para Ocorrências
  const [todasOcorrencias, setTodasOcorrencias] = useState([]);
  const [editOcoId, setEditOcoId] = useState(null);
  const [editOcoForm, setEditOcoForm] = useState({});

  // Estados para Cidadãos (App)
  const [cidadaosList, setCidadaosList] = useState([]);
  const [loadingCidadaos, setLoadingCidadaos] = useState(false);

  async function fetchCidadaos() {
    setLoadingCidadaos(true);
    try {
      const { data, error } = await supabase
        .from('cidadaos')
        .select('*')
        .order('criado_em', { ascending: false });
      if (!error && data) {
        setCidadaosList(data);
      }
    } catch (err) {
      console.error('Erro ao buscar cidadaos:', err);
    } finally {
      setLoadingCidadaos(false);
    }
  }

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

  async function fetchOcorrencias() {
    const { data, error } = await supabase.from('ocorrencias').select('*').order('created_at', { ascending: false });
    if (data) setTodasOcorrencias(data);
  }

  useEffect(() => {
    fetchSolicitacoes();
    fetchCidadaos();
    fetchOcorrencias();
  }, []);

  useEffect(() => {
    if (activeTab === 'ocorrencias' || activeTab === 'diretorio') {
      fetchOcorrencias();
    }
    if (activeTab === 'cidadaos' || activeTab === 'diretorio') {
      fetchCidadaos();
    }
  }, [activeTab]);

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

  function nomeSecretaria(secretaria_id) {
    return secretariasList.find(s => String(s.id) === String(secretaria_id))?.nome || 'Não informada';
  };

  // ─── FILTROS E EXPORTAÇÃO SEPARADA PARA SERVIDORES ─────────────────────────
  const [buscaServidor, setBuscaServidor] = useState('');
  const [filtroSecServidor, setFiltroSecServidor] = useState('todas');
  const [filtroPerfilServidor, setFiltroPerfilServidor] = useState('todos');

  const servidoresFiltrados = historico.filter(h => {
    const q = buscaServidor.toLowerCase();
    const secNome = nomeSecretaria(h.secretaria_id).toLowerCase();
    const matchBusca = !q ||
      (h.nome_completo && h.nome_completo.toLowerCase().includes(q)) ||
      (h.email_institucional && h.email_institucional.toLowerCase().includes(q)) ||
      (h.email_contato && h.email_contato.toLowerCase().includes(q)) ||
      secNome.includes(q);

    const matchSec = filtroSecServidor === 'todas' || String(h.secretaria_id) === String(filtroSecServidor);
    const matchPerfil = filtroPerfilServidor === 'todos' ||
      (filtroPerfilServidor === 'gabinete' && h.perfil === 'gabinete') ||
      (filtroPerfilServidor === 'operacional' && h.perfil === 'operacional') ||
      (filtroPerfilServidor === 'liberado' && h.status === 'liberado') ||
      (filtroPerfilServidor === 'rejeitado' && h.status === 'rejeitado');

    return matchBusca && matchSec && matchPerfil;
  });

  const handleExportarServidoresBI = () => {
    const headers = ['Nome_Completo', 'Email_Institucional', 'Telefone_Contato', 'Secretaria', 'Perfil_Acesso', 'Status', 'Data_Analise'];
    const rows = historico.map(h => [
      `"${(h.nome_completo || '').replace(/"/g, '""')}"`,
      `"${h.email_institucional || ''}"`,
      `"${h.email_contato || ''}"`,
      `"${(nomeSecretaria(h.secretaria_id) || '').replace(/"/g, '""')}"`,
      `"${h.perfil === 'gabinete' ? 'Gabinete / Sala de Situação' : 'Operacional Secretaria'}"`,
      `"${h.status === 'liberado' ? 'Ativo/Liberado' : 'Rejeitado'}"`,
      `"${h.data_analise ? new Date(h.data_analise).toLocaleDateString('pt-BR') : ''}"`
    ]);

    const csvContent = '\uFEFF' + headers.join(';') + '\n' + rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `smiic_servidores_bi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── FILTROS E EXPORTAÇÃO SEPARADA PARA MUNÍCIPES (CIDADÃOS APP) ───────────
  const [buscaCidadao, setBuscaCidadao] = useState('');
  const [filtroBairroCidadao, setFiltroBairroCidadao] = useState('todos');

  const cidadaosFiltrados = cidadaosList.filter(c => {
    const q = buscaCidadao.toLowerCase();
    const matchBusca = !q ||
      (c.nome && c.nome.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.telefone && c.telefone.toLowerCase().includes(q)) ||
      (c.bairro && c.bairro.toLowerCase().includes(q));

    const matchBairro = filtroBairroCidadao === 'todos' || c.bairro === filtroBairroCidadao;

    return matchBusca && matchBairro;
  });

  // Lista única de bairros dos cidadãos para o dropdown
  const bairrosCidadaos = Array.from(new Set(cidadaosList.map(c => c.bairro).filter(Boolean)));

  const handleExportarCidadaosBI = () => {
    const headers = ['Nome_Municipe', 'Email', 'Telefone_WhatsApp', 'Bairro_Residencia', 'Chamados_Registrados', 'Status', 'Data_Cadastro'];
    const rows = cidadaosList.map(c => {
      const totalChamados = todasOcorrencias.filter(o => o.cidadao_id === c.id || o.cidadao_id === c.auth_id || o.cidadao_nome === c.nome || (c.telefone && o.cidadao_telefone === c.telefone)).length;
      return [
        `"${(c.nome || '').replace(/"/g, '""')}"`,
        `"${c.email || ''}"`,
        `"${c.telefone || ''}"`,
        `"${(c.bairro || 'Cachoeiras de Macacu').replace(/"/g, '""')}"`,
        `"${totalChamados}"`,
        `"${c.ativo !== false ? 'Ativo' : 'Inativo'}"`,
        `"${c.criado_em ? new Date(c.criado_em).toLocaleDateString('pt-BR') : ''}"`
      ];
    });

    const csvContent = '\uFEFF' + headers.join(';') + '\n' + rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `smiic_cidadaos_app_bi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 font-sans flex flex-col relative overflow-x-hidden">
      {/* Luzes de ambientação sutis de fundo */}
      <div className="absolute top-24 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-64 right-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* ─── HEADER PADRONIZADO COM AS LOGOS OFICIAIS ─── */}
      <header 
        className="w-full bg-white h-24 border-b-[6px] border-[#022888] flex items-center shrink-0 z-30 shadow-md sticky top-0"
      >
        <Link href="/" className="w-80 h-full flex items-center justify-center gap-5 shrink-0 border-r border-neutral-200 px-4 hover:bg-neutral-50 transition-colors cursor-pointer">
          <img src="/prefeitura_logo_sem_fundo_quadrada.png" alt="Prefeitura de Cachoeiras de Macacu" className="h-14 w-auto object-contain" />
          <div className="h-10 w-[2px] bg-neutral-200 rounded-full"></div>
          <img src="/logo_secretaria_logo_sem_fundo_comprida.png" alt="Sustentabilidade" className="h-10 w-auto object-contain" />
        </Link>
        
        <div className="flex-1 flex items-center justify-between pl-8 pr-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral-500 font-black tracking-widest uppercase mb-1 flex items-center gap-2">
              Módulo de Governança & Auditoria <span className="w-1 h-1 bg-neutral-300 rounded-full"></span> Plataforma SMIIC
            </span>
            <h1 className="text-xl md:text-2xl font-black uppercase leading-tight text-[#022888]">
              PAINEL ADMINISTRATIVO & AUDITORIA
            </h1>
          </div>
          
          <div className="flex items-center gap-4 border-l border-neutral-200 pl-6 h-14">
            <Link 
              href="/admin/irif" 
              className="px-4 py-2 bg-amber-500/10 text-amber-700 hover:bg-amber-500 hover:text-white border border-amber-500/30 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              ⚙️ Editor da Fórmula IRIF
            </Link>
            <Link 
              href="/" 
              className="text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors px-4 py-2 rounded-lg border border-neutral-300 shadow-sm"
            >
              Voltar aos Painéis
            </Link>
            <div className="hidden lg:flex flex-col items-end mr-1">
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Sessão</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                🛡️ Administrador
              </span>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* ─── NAVEGAÇÃO POR ABAS COM IDENTIDADES VISUAIS COLORIDAS ─── */}
      <div className="bg-[#0f172a] px-6 sm:px-8 py-0 flex gap-2 sm:gap-3 border-b border-slate-700/80 shadow-inner overflow-x-auto z-20">
        <button 
          onClick={() => setActiveTab('servidores')}
          className={`py-3.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'servidores' || activeTab === 'historico' 
              ? 'border-indigo-400 text-indigo-300 bg-indigo-950/40 shadow-[0_2px_12px_rgba(99,102,241,0.2)]' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <span className="p-1 rounded bg-indigo-900/60 text-indigo-300 text-xs">🏢</span>
          <span>Servidores do Sistema ({historico.length})</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('cidadaos')}
          className={`py-3.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'cidadaos' 
              ? 'border-teal-400 text-teal-300 bg-teal-950/40 shadow-[0_2px_12px_rgba(20,184,166,0.2)]' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <span className="p-1 rounded bg-teal-900/60 text-teal-300 text-xs">📱</span>
          <span>Munícipes App ({cidadaosList.length})</span>
        </button>

        <button 
          onClick={() => setActiveTab('pendentes')}
          className={`py-3.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pendentes' 
              ? 'border-amber-400 text-amber-300 bg-amber-950/40 shadow-[0_2px_12px_rgba(245,158,11,0.2)]' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <span className="p-1 rounded bg-amber-900/60 text-amber-300 text-xs">⏳</span>
          <span>Solicitações Pendentes</span>
          {solicitacoes.length > 0 && (
            <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
              {solicitacoes.length}
            </span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('secretarias')}
          className={`py-3.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'secretarias' 
              ? 'border-purple-400 text-purple-300 bg-purple-950/40 shadow-[0_2px_12px_rgba(168,85,247,0.2)]' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <span className="p-1 rounded bg-purple-900/60 text-purple-300 text-xs">🏛️</span>
          <span>Secretarias Municipais</span>
        </button>

        <button 
          onClick={() => setActiveTab('ocorrencias')}
          className={`py-3.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'ocorrencias' 
              ? 'border-rose-400 text-rose-300 bg-rose-950/40 shadow-[0_2px_12px_rgba(244,63,94,0.2)]' 
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <span className="p-1 rounded bg-rose-900/60 text-rose-300 text-xs">🚨</span>
          <span>Gerenciar Ocorrências ({todasOcorrencias.length})</span>
        </button>
      </div>

      <div className={`max-w-7xl mx-auto w-full p-6 sm:p-8 grid grid-cols-1 ${activeTab === 'pendentes' ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8 z-10`}>
        <div className={activeTab === 'pendentes' ? 'lg:col-span-2' : 'lg:col-span-1'}>
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-bold flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <span>Carregando dados da governança...</span>
          </div>
        ) : (activeTab === 'servidores' || activeTab === 'historico') ? (
          /* ─── ABA EXCLUSIVA: SERVIDORES DO SISTEMA (EQUIPE MUNICIPAL) ─── */
          <div className="space-y-6">
            {/* Cards de Métricas para Servidores */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 transition-all">
                <div className="absolute -right-2 -bottom-2 text-5xl opacity-15">🏢</div>
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Servidores Liberados</p>
                <h3 className="text-3xl font-black text-white mt-1">
                  {historico.filter(h => h.status === 'liberado').length}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Contas municipais ativas</p>
              </div>

              <div className="bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-amber-500/50 transition-all">
                <div className="absolute -right-2 -bottom-2 text-5xl opacity-15">🏛️</div>
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Gabinete / Situação</p>
                <h3 className="text-3xl font-black text-amber-300 mt-1">
                  {historico.filter(h => h.perfil === 'gabinete' && h.status === 'liberado').length}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Acesso gerencial panorâmico</p>
              </div>

              <div className="bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
                <div className="absolute -right-2 -bottom-2 text-5xl opacity-15">🛠️</div>
                <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Operacional Secretarias</p>
                <h3 className="text-3xl font-black text-blue-300 mt-1">
                  {historico.filter(h => h.perfil === 'operacional' && h.status === 'liberado').length}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Técnicos e equipes de campo</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                <div className="absolute -right-2 -bottom-2 text-5xl opacity-15">⏳</div>
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Pendentes de Liberação</p>
                <h3 className="text-3xl font-black text-emerald-300 mt-1">{solicitacoes.length}</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Aguardando aprovação</p>
              </div>
            </div>

            {/* Barra de Filtros, Busca e Exportação BI para Servidores */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={buscaServidor}
                    onChange={(e) => setBuscaServidor(e.target.value)}
                    placeholder="🔍 Buscar servidor por nome, login institucional ou secretaria..."
                    className="w-full bg-slate-950/80 border border-slate-700/80 text-slate-100 rounded-xl pl-3 pr-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  {buscaServidor && (
                    <button onClick={() => setBuscaServidor('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs">✕</button>
                  )}
                </div>

                <select
                  value={filtroSecServidor}
                  onChange={(e) => setFiltroSecServidor(e.target.value)}
                  className="bg-slate-950/80 border border-slate-700/80 text-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="todas">Todas as Secretarias</option>
                  {secretariasList.map(s => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>

                <select
                  value={filtroPerfilServidor}
                  onChange={(e) => setFiltroPerfilServidor(e.target.value)}
                  className="bg-slate-950/80 border border-slate-700/80 text-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="todos">Todos os Perfis ({historico.length})</option>
                  <option value="gabinete">🏛️ Gabinete / Situação ({historico.filter(h => h.perfil === 'gabinete').length})</option>
                  <option value="operacional">🏢 Operacional ({historico.filter(h => h.perfil === 'operacional').length})</option>
                  <option value="liberado">🟢 Liberados / Ativos ({historico.filter(h => h.status === 'liberado').length})</option>
                  <option value="rejeitado">🔴 Rejeitados ({historico.filter(h => h.status === 'rejeitado').length})</option>
                </select>
              </div>

              <div className="flex gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={handleExportarServidoresBI}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-950 whitespace-nowrap active:scale-95"
                  title="Exportar base de servidores para BI (CSV)"
                >
                  <span>📥</span> Exportar Servidores (CSV/BI)
                </button>
              </div>
            </div>

            {/* Tabela de Servidores do Sistema */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                <div>
                  <h2 className="text-white font-bold flex items-center gap-2">
                    <span>🏢</span> Servidores & Equipe Municipal do Sistema SMIIC
                  </h2>
                  <p className="text-slate-400 text-xs">Acessos com permissão técnica institucional (Secretarias e Gabinete).</p>
                </div>
                <span className="text-xs text-indigo-300 font-bold bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-700/60">
                  {servidoresFiltrados.length} servidor{servidoresFiltrados.length !== 1 ? 'es' : ''}
                </span>
              </div>

              {servidoresFiltrados.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <span className="text-4xl block mb-2">🔍</span>
                  Nenhum servidor encontrado com os filtros selecionados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-800/70 text-xs uppercase font-bold text-slate-400">
                      <tr>
                        <th className="px-5 py-3.5">Servidor</th>
                        <th className="px-5 py-3.5">Login Institucional</th>
                        <th className="px-5 py-3.5">Órgão / Secretaria</th>
                        <th className="px-5 py-3.5">Nível de Acesso</th>
                        <th className="px-5 py-3.5 text-center">Status</th>
                        <th className="px-5 py-3.5 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {servidoresFiltrados.map((sol) => (
                        <tr key={sol.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-white flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${sol.perfil === 'gabinete' ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-sm shadow-amber-950' : 'bg-indigo-950/80 border-indigo-500 text-indigo-300 shadow-sm shadow-indigo-950'}`}>
                              {sol.nome_completo?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <span className="block text-slate-100">{sol.nome_completo}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {sol.idade ? `${sol.idade} anos` : ''} {sol.sexo ? `• ${sol.sexo}` : ''} {sol.email_contato ? `• 📞 ${sol.email_contato}` : ''}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-300 font-mono">{sol.email_institucional}</td>
                          <td className="px-5 py-3.5 text-xs">
                            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                              📍 {nomeSecretaria(sol.secretaria_id)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold border ${sol.perfil === 'gabinete' ? 'bg-amber-950/60 text-amber-300 border-amber-700/60' : 'bg-indigo-950/60 text-indigo-300 border-indigo-700/60'}`}>
                              {sol.perfil === 'gabinete' ? '🏛️ Gabinete / Situação' : '🏢 Operacional'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold ${sol.status === 'liberado' ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-700/60' : 'bg-rose-950/70 text-rose-400 border border-rose-700/60'}`}>
                              {sol.status === 'liberado' ? 'Ativo' : 'Rejeitado'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-1.5">
                            <button
                              onClick={() => setSelectedUserDetail({
                                id: sol.id,
                                auth_id: sol.id,
                                origem: 'servidor',
                                nome: sol.nome_completo,
                                email: sol.email_institucional,
                                telefone: sol.email_contato || '',
                                local: nomeSecretaria(sol.secretaria_id),
                                secretaria_id: sol.secretaria_id,
                                tipoLabel: sol.perfil === 'gabinete' ? 'Gabinete / Situação' : 'Servidor Operacional',
                                tipoBadge: sol.perfil === 'gabinete' ? 'bg-amber-900/50 text-amber-300 border-amber-700/50' : 'bg-blue-900/50 text-blue-300 border-blue-700/50',
                                perfil: sol.perfil || 'operacional',
                                status: sol.status,
                                statusLabel: sol.status === 'liberado' ? 'Ativo' : 'Rejeitado',
                                criado_em: sol.data_analise || sol.data_solicitacao,
                                dadosCompletos: sol
                              })}
                              className="px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-lg text-xs font-bold transition-all border border-indigo-700/60 shadow-sm"
                              title="Ver ficha completa do servidor"
                            >
                              🔍 Ficha
                            </button>
                            {sol.status === 'liberado' && (
                              <>
                                <button
                                  onClick={() => handleResetPassword(sol.email_institucional)}
                                  className="px-2.5 py-1.5 bg-amber-950/60 hover:bg-amber-800 text-amber-300 rounded-lg text-xs font-bold transition-all border border-amber-700/60"
                                  title="Redefinir Senha do Servidor"
                                >
                                  🔑
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(sol.id, sol.email_institucional)}
                                  className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-800 text-rose-300 rounded-lg text-xs font-bold transition-all border border-rose-700/60"
                                  title="Excluir Conta do Servidor"
                                >
                                  🗑️
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'cidadaos' ? (
          /* ─── ABA EXCLUSIVA: MUNÍCIPES & CIDADÃOS CADASTRADOS (APP) ─── */
          <div className="space-y-6">
            {/* Cards de Métricas para Munícipes */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-teal-950/60 via-slate-900 to-slate-900 border border-teal-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-teal-500/50 transition-all">
                <div className="absolute -right-2 -bottom-2 text-5xl opacity-15">📱</div>
                <p className="text-xs text-teal-400 font-bold uppercase tracking-wider">Total de Munícipes</p>
                <h3 className="text-3xl font-black text-teal-200 mt-1">{cidadaosList.length}</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Cadastrados no App Cidadão</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-cyan-500/50 transition-all">
                <div className="absolute -right-2 -bottom-2 text-5xl opacity-15">📍</div>
                <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Bairros Mapeados</p>
                <h3 className="text-3xl font-black text-cyan-200 mt-1">{bairrosCidadaos.length}</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Localidades de Cachoeiras</p>
              </div>

              <div className="bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-900 border border-rose-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-rose-500/50 transition-all">
                <div className="absolute -right-2 -bottom-2 text-5xl opacity-15">🚨</div>
                <p className="text-xs text-rose-400 font-bold uppercase tracking-wider">Chamados Abertos</p>
                <h3 className="text-3xl font-black text-rose-200 mt-1">
                  {todasOcorrencias.filter(o => o.cidadao_nome || o.cidadao_id).length}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Ocorrências via aplicativo</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                <div className="absolute -right-2 -bottom-2 text-5xl opacity-15">🟢</div>
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Status das Contas</p>
                <h3 className="text-3xl font-black text-emerald-200 mt-1">
                  {cidadaosList.filter(c => c.ativo !== false).length}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Cidadãos ativos e aptos</p>
              </div>
            </div>

            {/* Barra de Filtros, Busca e Exportação BI para Cidadãos */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 w-full flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={buscaCidadao}
                    onChange={(e) => setBuscaCidadao(e.target.value)}
                    placeholder="🔍 Buscar munícipe por nome, e-mail, WhatsApp ou bairro..."
                    className="w-full bg-slate-950/80 border border-slate-700/80 text-slate-100 rounded-xl pl-3 pr-4 py-2.5 text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  />
                  {buscaCidadao && (
                    <button onClick={() => setBuscaCidadao('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs">✕</button>
                  )}
                </div>

                <select
                  value={filtroBairroCidadao}
                  onChange={(e) => setFiltroBairroCidadao(e.target.value)}
                  className="bg-slate-950/80 border border-slate-700/80 text-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-teal-500 transition-all"
                >
                  <option value="todos">Todos os Bairros ({bairrosCidadaos.length})</option>
                  {bairrosCidadaos.map(b => (
                    <option key={b} value={b}>📍 {b}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={handleExportarCidadaosBI}
                  className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-teal-950 whitespace-nowrap active:scale-95"
                  title="Exportar dados de munícipes para BI (CSV)"
                >
                  <span>📥</span> Exportar Munícipes (CSV/BI)
                </button>
                <button 
                  onClick={fetchCidadaos}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-teal-700 text-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-700"
                >
                  🔄
                </button>
              </div>
            </div>

            {/* Tabela de Munícipes do App Cidadão */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                <div>
                  <h2 className="text-white font-bold flex items-center gap-2">
                    <span>📱</span> Munícipes Cadastrados no App Cidadão
                  </h2>
                  <p className="text-slate-400 text-xs">Moradores de Cachoeiras de Macacu registrados pelo app móvel.</p>
                </div>
                <span className="text-xs text-teal-300 font-bold bg-teal-950/80 px-3 py-1 rounded-full border border-teal-700/60">
                  {cidadaosFiltrados.length} munícipe{cidadaosFiltrados.length !== 1 ? 's' : ''}
                </span>
              </div>

              {loadingCidadaos ? (
                <div className="p-12 text-center text-slate-400 font-medium">Carregando munícipes cadastrados...</div>
              ) : cidadaosFiltrados.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <span className="text-4xl block mb-2">👥</span>
                  Nenhum munícipe encontrado com os filtros selecionados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-800/70 text-xs uppercase font-bold text-slate-400">
                      <tr>
                        <th className="px-5 py-3.5">Nome do Cidadão</th>
                        <th className="px-5 py-3.5">E-mail</th>
                        <th className="px-5 py-3.5">Telefone / WhatsApp</th>
                        <th className="px-5 py-3.5">Bairro</th>
                        <th className="px-5 py-3.5 text-center">Chamados Abertos</th>
                        <th className="px-5 py-3.5 text-center">Status</th>
                        <th className="px-5 py-3.5 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {cidadaosFiltrados.map(cid => {
                        const chamadosDoCidadao = todasOcorrencias.filter(o => o.cidadao_id === cid.id || o.cidadao_id === cid.auth_id || o.cidadao_nome === cid.nome || (cid.telefone && o.cidadao_telefone === cid.telefone));
                        return (
                          <tr key={cid.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-5 py-3.5 font-semibold text-white flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-teal-950/80 border border-teal-500 text-teal-300 flex items-center justify-center text-xs font-bold shrink-0 shadow-sm shadow-teal-950">
                                {cid.nome?.charAt(0)?.toUpperCase() || 'C'}
                              </div>
                              <div>
                                <span className="block text-slate-100">{cid.nome}</span>
                                <span className="text-[10px] text-slate-400 font-normal">
                                  Cadastrado: {cid.criado_em ? new Date(cid.criado_em).toLocaleDateString('pt-BR') : '—'}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-slate-300 font-mono">{cid.email}</td>
                            <td className="px-5 py-3.5 text-xs text-slate-300">
                              {cid.telefone ? (
                                <a
                                  href={`https://wa.me/55${cid.telefone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 hover:underline"
                                  title="Conversar via WhatsApp"
                                >
                                  <span>💬</span> {cid.telefone}
                                </a>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-xs">
                              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-950 text-teal-300 border border-teal-700/60">
                                📍 {cid.bairro || 'Cachoeiras de Macacu'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${chamadosDoCidadao.length > 0 ? 'bg-amber-950 text-amber-300 border border-amber-700/60' : 'bg-slate-800 text-slate-400'}`}>
                                {chamadosDoCidadao.length} chamado{chamadosDoCidadao.length !== 1 ? 's' : ''}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold ${cid.ativo !== false ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60' : 'bg-rose-950 text-rose-400 border border-rose-700/60'}`}>
                                {cid.ativo !== false ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right whitespace-nowrap space-x-1.5">
                              <button
                                onClick={() => setSelectedUserDetail({
                                  id: cid.id,
                                  auth_id: cid.auth_id,
                                  origem: 'cidadao',
                                  nome: cid.nome,
                                  email: cid.email,
                                  telefone: cid.telefone || '',
                                  local: cid.bairro || 'Cachoeiras de Macacu',
                                  tipoLabel: 'Cidadão (App)',
                                  tipoBadge: 'bg-teal-900/50 text-teal-300 border-teal-700/50',
                                  perfil: 'Munícipe',
                                  status: cid.ativo !== false ? 'liberado' : 'inativo',
                                  statusLabel: cid.ativo !== false ? 'Ativo' : 'Inativo',
                                  criado_em: cid.criado_em,
                                  dadosCompletos: cid
                                })}
                                className="px-3 py-1.5 bg-teal-950/80 hover:bg-teal-600 text-teal-200 hover:text-white rounded-lg text-xs font-bold transition-all border border-teal-700/60 shadow-sm"
                              >
                                🔍 Ver Ficha
                              </button>
                              <button
                                onClick={() => handleResetPassword(cid.email)}
                                className="px-2.5 py-1.5 bg-amber-950/60 hover:bg-amber-800 text-amber-300 rounded-lg text-xs font-bold transition-all border border-amber-700/60"
                                title="Redefinir Senha do Munícipe"
                              >
                                🔑
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'pendentes' ? (
          solicitacoes.length === 0 ? (
            <div className="bg-slate-900/90 border border-dashed border-slate-700 rounded-3xl p-16 text-center shadow-xl">
              <span className="text-5xl block mb-4">🎉</span>
              <h3 className="text-white text-xl font-bold mb-2">Nenhuma solicitação pendente</h3>
              <p className="text-slate-400 text-sm">Todos os acessos de servidores municipais já foram analisados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm mb-6">
                Analise as solicitações abaixo. Escolha o nível de acesso e aprove ou rejeite.
              </p>
              {solicitacoes.map(sol => (
                <div key={sol.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                  
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-full bg-amber-950 border border-amber-500/50 flex items-center justify-center text-sm font-black text-amber-300">
                          {sol.nome_completo?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <span className="text-white font-bold text-base truncate">{sol.nome_completo}</span>
                        <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700 font-medium">
                          {sol.idade ? `${sol.idade} anos` : 'Idade N/A'} | {sol.sexo || 'Sexo N/A'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs ml-12 font-mono">Login: {sol.email_institucional}</p>
                      <p className="text-slate-400 text-xs ml-12">Contato: {sol.email_contato || 'Não informado'}</p>
                      <p className="text-emerald-400 text-xs font-bold ml-12 mt-1">
                        📍 {nomeSecretaria(sol.secretaria_id)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <div className="flex flex-col">
                        <label className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mb-1">Nível de Acesso Proposto</label>
                        <select
                          value={perfisEscolhidos[sol.id] || 'operacional'}
                          onChange={(e) => setPerfisEscolhidos(prev => ({ ...prev, [sol.id]: e.target.value }))}
                          className="bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-indigo-500"
                        >
                          <option value="operacional">Operacional (Secretaria)</option>
                          <option value="gabinete">Gabinete (Sala de Situação)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex flex-col">
                    <label className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mb-1">Justificativa / Parecer do Administrador (Opcional)</label>
                    <textarea 
                      value={justificativas[sol.id] || ''}
                      onChange={(e) => setJustificativas(prev => ({ ...prev, [sol.id]: e.target.value }))}
                      placeholder="Motivo da aprovação ou rejeição..."
                      className="bg-transparent text-sm text-slate-200 w-full focus:outline-none resize-none h-12"
                    />
                  </div>

                  <div className="flex gap-3 justify-end mt-1">
                    <button
                      onClick={() => handleUpdateStatus(sol.id, 'rejeitado')}
                      className="px-5 py-2.5 bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-xl font-bold text-xs transition-all active:scale-95"
                    >
                      ✗ Rejeitar Acesso
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(sol.id, 'liberado')}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-950 active:scale-95"
                    >
                      ✓ Aprovar & Liberar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'secretarias' ? (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4">{editandoSec ? 'Editar Secretaria' : 'Adicionar Nova Secretaria'}</h2>
              <form onSubmit={handleSaveSecretaria} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome do Órgão / Secretaria</label>
                  <input required type="text" value={novaSecretaria.nome} onChange={e => setNovaSecretaria({...novaSecretaria, nome: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="Ex: Secretaria de Cultura" />
                </div>
                <div className="w-full md:w-24 shrink-0">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cor da Marca</label>
                  <input required type="color" value={novaSecretaria.cor_identidade} onChange={e => setNovaSecretaria({...novaSecretaria, cor_identidade: e.target.value})} className="w-full h-[46px] rounded-xl cursor-pointer bg-transparent border-0 p-0" />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  {editandoSec && (
                    <button type="button" onClick={handleCancelEditSecretaria} className="px-6 h-[46px] bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors">
                      Cancelar
                    </button>
                  )}
                  <button type="submit" className={`px-6 h-[46px] ${editandoSec ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-purple-600 hover:bg-purple-500'} text-white font-bold rounded-xl transition-colors shadow-lg`}>
                    {editandoSec ? 'Salvar' : '+ Adicionar'}
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {secretariasList.map(sec => (
                <div key={sec.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl" style={{ borderLeftWidth: '5px', borderLeftColor: sec.cor_identidade }}>
                  <div>
                    <h3 className="text-white font-bold text-base mb-1">{sec.nome}</h3>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <button onClick={() => handleVerPainel(sec, 'operacional')} className="w-full bg-slate-800 hover:bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl transition-colors uppercase tracking-wider">
                      Painel Operacional
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditSecretariaClick(sec)} className="flex-1 bg-indigo-950/80 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-700/60 text-xs font-bold py-2 rounded-xl transition-colors uppercase">
                        Editar
                      </button>
                      <button onClick={() => handleDeleteSecretaria(sec.id, sec.nome)} className="flex-1 bg-rose-950/80 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-700/60 text-xs font-bold py-2 rounded-xl transition-colors uppercase">
                        Excluir
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-col">
                    <button onClick={() => setVerUsuariosSecId(verUsuariosSecId === sec.id ? null : sec.id)} className="text-xs text-indigo-400 font-bold hover:underline text-left inline-block self-start">
                      {verUsuariosSecId === sec.id ? 'Ocultar Usuários da Secretaria' : 'Ver Usuários da Secretaria'}
                    </button>

                    {verUsuariosSecId === sec.id && (
                      <div className="mt-2 bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-36 overflow-y-auto custom-scrollbar">
                        {historico.filter(h => h.status === 'liberado' && String(h.secretaria_id) === String(sec.id)).length > 0 ? (
                          historico.filter(h => h.status === 'liberado' && String(h.secretaria_id) === String(sec.id)).map(user => (
                            <div key={user.id} className="text-xs text-slate-300 py-1.5 border-b border-slate-800 last:border-0">
                              <strong>{user.nome_completo}</strong> <span className="text-[10px] text-slate-500 block font-mono">{user.email_institucional}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 italic">Nenhum usuário liberado.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'ocorrencias' ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
              <div>
                <h2 className="text-white font-bold flex items-center gap-2">
                  <span>🚨</span> Gerenciador Geral de Ocorrências
                </h2>
                <p className="text-slate-400 text-xs">Altere status, descrição, laudo técnico e atribuição aos órgãos municipais.</p>
              </div>
              <button 
                onClick={fetchOcorrencias}
                className="text-xs bg-slate-800 hover:bg-orange-600 text-slate-200 px-3.5 py-2 rounded-xl font-bold transition-colors border border-slate-700"
              >
                🔄 Atualizar
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/70 text-xs uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5">Data</th>
                    <th className="px-5 py-3.5">Categoria</th>
                    <th className="px-5 py-3.5">Bairro / Local</th>
                    <th className="px-5 py-3.5">Cidadão</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {todasOcorrencias.map(oco => (
                    <tr key={oco.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 text-xs whitespace-nowrap">{new Date(oco.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className="px-5 py-3.5 font-medium text-white">{oco.categoria}</td>
                      <td className="px-5 py-3.5 text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                          📍 {oco.bairro}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-400">
                        {oco.cidadao_nome ? (
                          <span className="text-teal-300 font-medium">👤 {oco.cidadao_nome}</span>
                        ) : (
                          <span className="italic text-slate-500">Anônimo</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold border ${oco.status === 'Concluido' || oco.status === 'Concluído' ? 'bg-emerald-950 text-emerald-400 border-emerald-700/60' : oco.status === 'Em Atendimento' ? 'bg-amber-950 text-amber-300 border-amber-700/60' : 'bg-rose-950 text-rose-400 border-rose-700/60'}`}>
                          {oco.status || 'Pendente'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => { setEditOcoId(oco.id); setEditOcoForm(oco); }}
                          className="px-3 py-1 bg-indigo-950/80 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg font-bold text-xs uppercase border border-indigo-700/60 transition-all"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteOcorrencia(oco.id)}
                          className="px-3 py-1 bg-rose-950/80 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg font-bold text-xs uppercase border border-rose-700/60 transition-all"
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
              <div className="p-12 text-center text-slate-500">Nenhuma ocorrência encontrada.</div>
            )}
          </div>
        ) : null}

        {/* Modal de Edição de Ocorrência */}
        {editOcoId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <h2 className="text-white font-black text-lg uppercase flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 text-sm">🚨</span>
                  Editar Ocorrência
                </h2>
                <button
                  type="button"
                  onClick={() => setEditOcoId(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleUpdateOcorrencia} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Categoria</label>
                  <input type="text" value={editOcoForm.categoria || ''} onChange={e => setEditOcoForm({...editOcoForm, categoria: e.target.value})} className="w-full bg-slate-800/90 border border-slate-700 focus:border-rose-500 text-white rounded-lg p-2.5 text-sm outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Descrição</label>
                  <textarea value={editOcoForm.descricao || ''} onChange={e => setEditOcoForm({...editOcoForm, descricao: e.target.value})} className="w-full bg-slate-800/90 border border-slate-700 focus:border-rose-500 text-white rounded-lg p-2.5 text-sm h-24 outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bairro</label>
                    <input type="text" value={editOcoForm.bairro || ''} onChange={e => setEditOcoForm({...editOcoForm, bairro: e.target.value})} className="w-full bg-slate-800/90 border border-slate-700 focus:border-rose-500 text-white rounded-lg p-2.5 text-sm outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                    <select value={editOcoForm.status || ''} onChange={e => setEditOcoForm({...editOcoForm, status: e.target.value})} className="w-full bg-slate-800/90 border border-slate-700 focus:border-rose-500 text-white rounded-lg p-2.5 text-sm outline-none transition-colors">
                      <option value="Pendente">Pendente</option>
                      <option value="Em Atendimento">Em Atendimento</option>
                      <option value="Concluido">Concluído</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Prioridade</label>
                    <select value={editOcoForm.prioridade_acao || ''} onChange={e => setEditOcoForm({...editOcoForm, prioridade_acao: e.target.value})} className="w-full bg-slate-800/90 border border-slate-700 focus:border-rose-500 text-white rounded-lg p-2.5 text-sm outline-none transition-colors">
                      <option value="BAIXA">BAIXA</option>
                      <option value="MÉDIA">MÉDIA</option>
                      <option value="ALTA">ALTA</option>
                      <option value="CRÍTICA">CRÍTICA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Atribuir a</label>
                    <select value={editOcoForm.secretaria_id || ''} onChange={e => setEditOcoForm({...editOcoForm, secretaria_id: e.target.value})} className="w-full bg-slate-800/90 border border-slate-700 focus:border-rose-500 text-white rounded-lg p-2.5 text-sm outline-none transition-colors">
                      <option value="">(Nenhuma)</option>
                      {secretariasList.map(sec => <option key={sec.id} value={sec.id}>{sec.nome}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Técnico / Servidor Responsável</label>
                    <input type="text" value={editOcoForm.resolvido_por_nome || ''} onChange={e => setEditOcoForm({...editOcoForm, resolvido_por_nome: e.target.value})} placeholder="Nome do servidor" className="w-full bg-slate-800/90 border border-slate-700 focus:border-rose-500 text-white rounded-lg p-2.5 text-sm outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Equipe / Viatura</label>
                    <input type="text" value={editOcoForm.equipe_responsavel || ''} onChange={e => setEditOcoForm({...editOcoForm, equipe_responsavel: e.target.value})} placeholder="Ex: Equipe 02 / Viatura 104" className="w-full bg-slate-800/90 border border-slate-700 focus:border-rose-500 text-white rounded-lg p-2.5 text-sm outline-none transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Parecer Técnico / Relatório de Conclusão</label>
                  <textarea value={editOcoForm.parecer_tecnico || ''} onChange={e => setEditOcoForm({...editOcoForm, parecer_tecnico: e.target.value})} placeholder="Laudo ou descrição das medidas técnicas adotadas..." className="w-full bg-slate-800/90 border border-slate-700 focus:border-rose-500 text-white rounded-lg p-2.5 text-sm h-20 outline-none transition-colors" />
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
                  <button type="button" onClick={() => setEditOcoId(null)} className="px-4 py-2 text-slate-400 font-bold hover:text-white transition-colors">Cancelar</button>
                  <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-lg font-bold shadow-lg shadow-rose-950/50 transition-all">Salvar Alterações</button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>

        {/* Lado Direito: Criação Direta */}
        {activeTab === 'pendentes' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit shadow-xl">
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-sm">⚡</span>
              Criar Usuário Diretamente
            </h2>
            <form onSubmit={handleCriacaoManual} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nome Completo</label>
                <input required type="text" value={novoNome} onChange={e => setNovoNome(e.target.value)} className="w-full bg-slate-800/90 border border-slate-700 focus:border-amber-500 rounded-lg p-2.5 text-sm text-white outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">E-mail</label>
                <input required type="email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} className="w-full bg-slate-800/90 border border-slate-700 focus:border-amber-500 rounded-lg p-2.5 text-sm text-white outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Senha Provisória</label>
                <input required type="text" value={novaSenha} onChange={e => setNovoSenha(e.target.value)} className="w-full bg-slate-800/90 border border-slate-700 focus:border-amber-500 rounded-lg p-2.5 text-sm text-white outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Perfil</label>
                <select required value={novoPerfil} onChange={e => setNovoPerfil(e.target.value)} className="w-full bg-slate-800/90 border border-slate-700 focus:border-amber-500 rounded-lg p-2.5 text-sm text-white outline-none transition-colors">
                  <option value="operacional">Operacional (Secretaria)</option>
                  <option value="gabinete">Gabinete (War Room)</option>
                </select>
              </div>
              {novoPerfil !== 'gabinete' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Secretaria</label>
                  <select required value={novoSec} onChange={e => setNovoSec(e.target.value)} className="w-full bg-slate-800/90 border border-slate-700 focus:border-amber-500 rounded-lg p-2.5 text-sm text-white outline-none transition-colors">
                    <option value="">Selecione...</option>
                    {secretariasList.map(sec => <option key={sec.id} value={sec.id}>{sec.nome}</option>)}
                  </select>
                </div>
              )}
              <button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black py-3 rounded-lg text-sm transition-all shadow-lg shadow-amber-950/50 mt-2">
                Criar e Liberar Acesso
              </button>
            </form>
          </div>
        )}

        {/* Modal de Ficha Completa do Usuário */}
        {selectedUserDetail && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl p-6 sm:p-8 text-slate-100">
              
              {/* Cabeçalho com Avatar */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black shadow-lg ${selectedUserDetail.origem === 'cidadao' ? 'bg-teal-950/80 border-teal-500/60 text-teal-300' : selectedUserDetail.perfil === 'gabinete' ? 'bg-amber-950/80 border-amber-500/60 text-amber-300' : 'bg-indigo-950/80 border-indigo-500/60 text-indigo-300'}`}>
                    {selectedUserDetail.nome?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-white">{selectedUserDetail.nome}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black border ${selectedUserDetail.tipoBadge}`}>
                        {selectedUserDetail.tipoLabel}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 font-mono mt-0.5">{selectedUserDetail.email}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Cadastrado em: {selectedUserDetail.criado_em ? new Date(selectedUserDetail.criado_em).toLocaleString('pt-BR') : '—'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUserDetail(null)}
                  className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Informações de Contato e Local */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/70 border border-slate-700/60 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    {selectedUserDetail.origem === 'cidadao' ? 'Bairro de Residência' : 'Secretaria Vinculada'}
                  </span>
                  <p className="text-sm font-bold text-white flex items-center gap-1.5">
                    {selectedUserDetail.origem === 'cidadao' ? '📍' : '🏢'} {selectedUserDetail.local || 'Não informado'}
                  </p>
                </div>

                <div className="bg-slate-800/70 border border-slate-700/60 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Telefone / WhatsApp</span>
                    <p className="text-sm font-bold text-white">
                      {selectedUserDetail.telefone ? selectedUserDetail.telefone : 'Não informado'}
                    </p>
                  </div>
                  {selectedUserDetail.telefone && (
                    <a
                      href={`https://wa.me/55${selectedUserDetail.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-950/50 flex items-center gap-1"
                    >
                      <span>💬</span> WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* Se for Cidadão: Histórico de Ocorrências abertas por ele */}
              {selectedUserDetail.origem === 'cidadao' && (
                <div className="mb-6 bg-slate-800/70 border border-slate-700/60 p-5 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>🚨</span> Ocorrências Registradas pelo Cidadão
                    </h3>
                    <span className="text-xs bg-teal-950 text-teal-300 border border-teal-800/80 px-2 py-0.5 rounded font-bold">
                      {todasOcorrencias.filter(o => o.cidadao_id === selectedUserDetail.id || o.cidadao_id === selectedUserDetail.auth_id || o.cidadao_nome === selectedUserDetail.nome || (selectedUserDetail.telefone && o.cidadao_telefone === selectedUserDetail.telefone)).length} chamada(s)
                    </span>
                  </div>

                  {todasOcorrencias.filter(o => o.cidadao_id === selectedUserDetail.id || o.cidadao_id === selectedUserDetail.auth_id || o.cidadao_nome === selectedUserDetail.nome || (selectedUserDetail.telefone && o.cidadao_telefone === selectedUserDetail.telefone)).length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-3 text-center">Este munícipe ainda não registrou chamados no aplicativo.</p>
                  ) : (
                    <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar">
                      {todasOcorrencias
                        .filter(o => o.cidadao_id === selectedUserDetail.id || o.cidadao_id === selectedUserDetail.auth_id || o.cidadao_nome === selectedUserDetail.nome || (selectedUserDetail.telefone && o.cidadao_telefone === selectedUserDetail.telefone))
                        .map(oco => (
                          <div key={oco.id} className="bg-slate-900 border border-slate-700/80 p-3 rounded-lg flex items-center justify-between gap-3 text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{oco.categoria}</span>
                                <span className={`px-2 py-0.5 text-[9px] uppercase font-black rounded-full border ${oco.status === 'Concluido' || oco.status === 'Concluído' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' : oco.status === 'Em Atendimento' ? 'bg-amber-950/80 text-amber-300 border-amber-700/60' : 'bg-rose-950/80 text-rose-300 border-rose-700/60'}`}>
                                  {oco.status || 'Pendente'}
                                </span>
                              </div>
                              <p className="text-slate-300 text-[11px] mt-0.5">{oco.descricao || 'Sem descrição'}</p>
                              <p className="text-slate-400 text-[10px] mt-1">📍 {oco.bairro} • {new Date(oco.created_at).toLocaleDateString('pt-BR')}</p>
                            </div>
                            {oco.foto_url && (
                              <img src={oco.foto_url} alt="Foto" className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0" />
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Se for Servidor: Detalhes Funcionais */}
              {selectedUserDetail.origem === 'servidor' && (
                <div className="mb-6 bg-slate-800/70 border border-slate-700/60 p-4 rounded-xl text-xs space-y-2">
                  <h3 className="font-bold text-white uppercase text-[10px] tracking-wider text-slate-400">Perfil de Acesso Institucional</h3>
                  <p className="text-slate-300"><strong>Nível:</strong> {selectedUserDetail.perfil === 'gabinete' ? '🏛️ Gabinete / Sala de Situação (Acesso Global)' : '🏢 Operacional de Secretaria'}</p>
                  {selectedUserDetail.dadosCompletos?.justificativa_admin && (
                    <p className="text-slate-300 italic"><strong>Parecer:</strong> "{selectedUserDetail.dadosCompletos.justificativa_admin}"</p>
                  )}
                </div>
              )}

              {/* Rodapé e Ações Administrativas */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-800">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleResetPassword(selectedUserDetail.email)}
                    className="px-4 py-2 bg-amber-950/60 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-700/60 rounded-lg text-xs font-bold transition-all w-full sm:w-auto shadow-sm"
                  >
                    🔑 Redefinir Senha
                  </button>
                  {selectedUserDetail.origem === 'servidor' && (
                    <button
                      onClick={() => {
                        handleDeleteUser(selectedUserDetail.id, selectedUserDetail.email);
                        setSelectedUserDetail(null);
                      }}
                      className="px-4 py-2 bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-700/60 rounded-lg text-xs font-bold transition-all w-full sm:w-auto shadow-sm"
                    >
                      Excluir Conta
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedUserDetail(null)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all w-full sm:w-auto border border-slate-700"
                >
                  Fechar
                </button>
              </div>

            </div>
          </div>
        )}
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

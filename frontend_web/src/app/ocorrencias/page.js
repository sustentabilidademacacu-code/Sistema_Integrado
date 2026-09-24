'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function OcorrenciasKanban() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [secretarias, setSecretarias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPerfil, setUserPerfil] = useState('');
  const [userSecId, setUserSecId] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // States for new mock Ocorrência
  const [novaOco, setNovaOco] = useState({
    categoria: 'Alagamento',
    descricao: '',
    logradouro: '',
    bairro: 'Sede',
    prioridade_acao: 'ALTA',
    secretaria_id: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserPerfil(localStorage.getItem('smiic_user_perfil') || '');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserSecId(localStorage.getItem('smiic_secretaria_id') || '');
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [resOco, resSec] = await Promise.all([
        supabase.from('ocorrencias').select('*').order('created_at', { ascending: false }),
        supabase.from('secretarias').select('*')
      ]);

      if (resSec.data) setSecretarias(resSec.data);

      if (resOco.data) {
        setOcorrencias(resOco.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, novoStatus) => {
    const { error } = await supabase.from('ocorrencias').update({ status: novoStatus }).eq('id', id);
    if (!error) {
      fetchData(); // reload
    } else {
      alert("Erro ao atualizar status");
    }
  };

  const criarOcorrenciaTeste = async (e) => {
    e.preventDefault();
    if (!novaOco.descricao) return alert("Preencha a descrição");
    
    setLoading(true);
    const { error } = await supabase.from('ocorrencias').insert([{
      ...novaOco,
      status: 'Pendente',
      secretaria_id: novaOco.secretaria_id || null
    }]);

    if (!error) {
      setIsFormOpen(false);
      setNovaOco({ ...novaOco, descricao: '', logradouro: '' });
      fetchData();
    } else {
      alert("Erro ao criar ocorrência de teste.");
      console.error(error);
      setLoading(false);
    }
  };

  // Filtra as ocorrências (Gabinete vê tudo, Sec. vê só as dela)
  const ocorrenciasFiltradas = ocorrencias.filter(o => {
    if (userPerfil === 'gabinete') return true; // Gabinete vê tudo
    return String(o.secretaria_id) === String(userSecId);
  });

  const pendentes = ocorrenciasFiltradas.filter(o => o.status === 'Pendente' || !o.status);
  const emAtendimento = ocorrenciasFiltradas.filter(o => o.status === 'Em Atendimento');
  const concluidos = ocorrenciasFiltradas.filter(o => o.status === 'Concluido' || o.status === 'Concluído');

  const getSecName = (id) => secretarias.find(s => String(s.id) === String(id))?.nome || 'Não Atribuída';
  const getSecColor = (id) => secretarias.find(s => String(s.id) === String(id))?.cor_identidade || '#64748b';

  return (
    <div className="min-h-screen bg-[#03132e] font-sans flex flex-col">
      {/* HEADER */}
      <div className="w-full bg-[#0a234f] border-b border-[#133570] px-8 py-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-500/50 flex items-center justify-center">
            <span className="text-lg">📋</span>
          </div>
          <div>
            <h1 className="text-white font-black text-lg tracking-wide uppercase">Gestão de Ocorrências</h1>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Painel Kanban — Resposta Rápida</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-900/20"
          >
            + Simular Ocorrência (App Cidadão)
          </button>
          <Link href={userPerfil === 'gabinete' ? "/gabinete" : "/operacional"} className="px-4 py-2 bg-[#133570] hover:bg-blue-600 text-white rounded-lg text-xs font-bold transition-all">
            ← Voltar ao Painel
          </Link>
        </div>
      </div>

      {/* MOCK FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a234f] border border-[#133570] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-white font-black text-lg mb-1 uppercase">Simulador App Cidadão</h2>
            <p className="text-xs text-slate-400 mb-6">Crie um chamado para testar como ele cai no sistema.</p>
            
            <form onSubmit={criarOcorrenciaTeste} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria (O que aconteceu?)</label>
                <select value={novaOco.categoria} onChange={e => setNovaOco({...novaOco, categoria: e.target.value})} className="w-full bg-[#133570] border border-[#1e4896] text-white rounded-lg p-2 text-sm font-bold">
                  <option>Alagamento</option>
                  <option>Queda de Árvore</option>
                  <option>Deslizamento de Terra</option>
                  <option>Foco de Incêndio</option>
                  <option>Acidente Viário</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                <textarea required value={novaOco.descricao} onChange={e => setNovaOco({...novaOco, descricao: e.target.value})} className="w-full bg-[#133570] border border-[#1e4896] text-white rounded-lg p-2 text-sm" placeholder="A rua está alagada e não passa carro..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Logradouro</label>
                  <input type="text" value={novaOco.logradouro} onChange={e => setNovaOco({...novaOco, logradouro: e.target.value})} className="w-full bg-[#133570] border border-[#1e4896] text-white rounded-lg p-2 text-sm" placeholder="Rua XYZ" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bairro</label>
                  <input type="text" value={novaOco.bairro} onChange={e => setNovaOco({...novaOco, bairro: e.target.value})} className="w-full bg-[#133570] border border-[#1e4896] text-white rounded-lg p-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prioridade</label>
                  <select value={novaOco.prioridade_acao} onChange={e => setNovaOco({...novaOco, prioridade_acao: e.target.value})} className="w-full bg-[#133570] border border-[#1e4896] text-white rounded-lg p-2 text-sm font-bold">
                    <option value="BAIXA">BAIXA</option>
                    <option value="MÉDIA">MÉDIA</option>
                    <option value="ALTA">ALTA</option>
                    <option value="CRÍTICA">CRÍTICA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Secretaria Destino</label>
                  <select value={novaOco.secretaria_id} onChange={e => setNovaOco({...novaOco, secretaria_id: e.target.value})} className="w-full bg-[#133570] border border-[#1e4896] text-white rounded-lg p-2 text-sm font-bold">
                    <option value="">(Sem atribuição automática)</option>
                    {secretarias.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#133570]">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-400 font-bold hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg">Enviar Chamado</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KANBAN BOARD */}
      <div className="flex-1 overflow-x-auto p-8 flex gap-6 min-w-max">
        
        {/* COLUNA 1: PENDENTES */}
        <div className="w-[400px] flex flex-col bg-[#051a3d] border border-[#133570]/50 rounded-2xl shrink-0 h-[calc(100vh-140px)]">
          <div className="p-4 border-b border-[#133570] flex items-center justify-between shrink-0">
            <h3 className="text-red-400 font-black uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Pendentes / Novos
            </h3>
            <span className="bg-[#133570] text-slate-300 text-xs font-bold px-2 py-1 rounded">{pendentes.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {loading ? <p className="text-slate-500 text-sm text-center mt-10 font-bold">Carregando...</p> : 
             pendentes.map(oco => (
              <OcorrenciaCard key={oco.id} oco={oco} onAdvance={() => updateStatus(oco.id, 'Em Atendimento')} secColor={getSecColor(oco.secretaria_id)} secName={getSecName(oco.secretaria_id)} userPerfil={userPerfil} />
            ))}
          </div>
        </div>

        {/* COLUNA 2: EM ATENDIMENTO */}
        <div className="w-[400px] flex flex-col bg-[#051a3d] border border-[#133570]/50 rounded-2xl shrink-0 h-[calc(100vh-140px)]">
          <div className="p-4 border-b border-[#133570] flex items-center justify-between shrink-0">
            <h3 className="text-amber-400 font-black uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Em Atendimento
            </h3>
            <span className="bg-[#133570] text-slate-300 text-xs font-bold px-2 py-1 rounded">{emAtendimento.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {emAtendimento.map(oco => (
              <OcorrenciaCard key={oco.id} oco={oco} onAdvance={() => updateStatus(oco.id, 'Concluido')} onReturn={() => updateStatus(oco.id, 'Pendente')} secColor={getSecColor(oco.secretaria_id)} secName={getSecName(oco.secretaria_id)} userPerfil={userPerfil} />
            ))}
          </div>
        </div>

        {/* COLUNA 3: RESOLVIDOS */}
        <div className="w-[400px] flex flex-col bg-[#051a3d] border border-[#133570]/50 rounded-2xl shrink-0 h-[calc(100vh-140px)]">
          <div className="p-4 border-b border-[#133570] flex items-center justify-between shrink-0">
            <h3 className="text-emerald-400 font-black uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Resolvidos
            </h3>
            <span className="bg-[#133570] text-slate-300 text-xs font-bold px-2 py-1 rounded">{concluidos.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {concluidos.map(oco => (
              <OcorrenciaCard key={oco.id} oco={oco} isConcluido secColor={getSecColor(oco.secretaria_id)} secName={getSecName(oco.secretaria_id)} userPerfil={userPerfil} />
            ))}
          </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #133570;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

function OcorrenciaCard({ oco, onAdvance, onReturn, isConcluido, secColor, secName, userPerfil }) {
  return (
    <div className="bg-[#0a234f] border-l-4 p-4 rounded-xl shadow-lg flex flex-col gap-3 group relative" style={{ borderLeftColor: secColor, borderTop: '1px solid #133570', borderRight: '1px solid #133570', borderBottom: '1px solid #133570' }}>
      <div className="flex justify-between items-start">
        <span className={`px-2 py-0.5 text-[9px] font-black tracking-widest rounded uppercase ${oco.prioridade_acao === 'CRÍTICA' ? 'bg-red-900/50 text-red-500 border border-red-900' : oco.prioridade_acao === 'ALTA' ? 'bg-orange-900/50 text-orange-500 border border-orange-900' : 'bg-blue-900/50 text-blue-400 border border-blue-900'}`}>
          {oco.prioridade_acao || 'MÉDIA'}
        </span>
        <span className="text-[9px] text-slate-500 font-bold">{new Date(oco.created_at || new Date()).toLocaleDateString('pt-BR')}</span>
      </div>
      
      <div>
        <h4 className="text-white font-bold leading-tight">{oco.categoria}</h4>
        <p className="text-slate-400 text-xs mt-1">📍 {oco.bairro} {oco.logradouro ? `- ${oco.logradouro}` : ''}</p>
      </div>

      <p className="text-slate-300 text-[11px] bg-[#03132e]/50 p-2 rounded border border-[#133570] italic">
        &quot;{oco.descricao}&quot;
      </p>

      {/* Secretária Label */}
      <div className="flex items-center gap-2 mt-1">
        <span className="w-2 h-2 rounded-full" style={{backgroundColor: secColor}}></span>
        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">{secName}</span>
      </div>

      {/* Ações */}
      {!isConcluido && (
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#133570]/50">
          {onReturn ? (
            <button onClick={onReturn} className="text-[10px] uppercase font-black text-slate-500 hover:text-amber-400 transition-colors">
              ← Retornar
            </button>
          ) : <div></div>}
          
          {onAdvance && (
            <button onClick={onAdvance} className="text-[10px] uppercase font-black text-blue-400 hover:text-emerald-400 transition-colors flex items-center gap-1">
              {oco.status === 'Em Atendimento' ? 'Concluir ✓' : 'Atender →'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

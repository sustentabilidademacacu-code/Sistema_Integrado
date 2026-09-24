'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import MapWrapper from '../MapWrapper';
import LoginWrapper from '../LoginWrapper';
import LogoutButton from '../LogoutButton';
import OcorrenciaCard from '../OcorrenciaCard';
import StationDashboard from '../StationDashboard';
import Link from 'next/link';
import { STATIONS } from '@/data/stations';
import { loadState, computeIRIF } from '@/data/irif';

function Navbar({ secCor }) {
  return (
    <header 
      className="w-full bg-white h-24 border-b-[6px] flex items-center shrink-0 z-20 shadow-md transition-colors duration-500"
      style={{ borderBottomColor: secCor }}
    >
      <Link href="/" className="w-80 h-full flex items-center justify-center gap-5 shrink-0 border-r border-neutral-200 px-4 hover:bg-neutral-50 transition-colors cursor-pointer">
        <img src="/prefeitura_logo_sem_fundo_quadrada.png" alt="Prefeitura" className="h-14 w-auto object-contain" />
        <div className="h-10 w-[2px] bg-neutral-200 rounded-full"></div>
        <img src="/logo_secretaria_logo_sem_fundo_comprida.png" alt="Sustentabilidade" className="h-10 w-auto object-contain" />
      </Link>
      
      <div className="flex-1 flex items-center justify-between pl-8 pr-6">
        
        {/* TÍTULO DA PÁGINA (LIMPO E ORGANIZADO) */}
        <div className="flex flex-col">
          <span className="text-[10px] text-neutral-500 font-black tracking-widest uppercase mb-1 flex items-center gap-2">
            Módulo de Execução <span className="w-1 h-1 bg-neutral-300 rounded-full"></span> Plataforma SMIIC
          </span>
          <h1 className="text-xl md:text-2xl font-black uppercase leading-tight text-[#022888]">
            PAINEL OPERACIONAL
          </h1>
        </div>
        
        {/* ÁREA DO USUÁRIO E LOGOUT */}
        <div className="flex items-center gap-5 border-l border-neutral-200 pl-6 h-14">
          <div className="hidden lg:flex flex-col items-end mr-2">
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Sessão Ativa</span>
            <span className="text-[11px] font-bold text-neutral-600 uppercase">Operador Autorizado</span>
          </div>
          <LogoutButton />
        </div>

      </div>
    </header>
  );
}

function Sidebar({ estacoes, secCor, secNome, onSelectEstacao }) {
  return (
    <aside className="w-80 bg-[#03132e] flex flex-col z-10 shadow-2xl relative border-r border-[#03132e]">
      
      {/* CARD DA SECRETARIA NO TOPO DO MENU */}
      <div className="p-6 border-b border-[#03132e] flex flex-col justify-center" style={{ backgroundColor: `${secCor}15`, borderBottomColor: `${secCor}30` }}>
        <span className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: secCor }}>
          Setor Responsável
        </span>
        <h2 className="text-[13px] font-bold text-white leading-snug uppercase">
          {secNome || 'Carregando...'}
        </h2>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4 px-2 flex items-center gap-2 mt-2">
          <span>📅</span> Acervo
        </p>
        <div className="mb-8 px-1 flex flex-col gap-2">
          <Link href="/defesa-civil/dashboards">
            <button className="w-full bg-[#0a234f] border border-[#133570] text-left px-4 py-3 rounded-lg text-sm font-bold text-neutral-300 hover:bg-[#133570] hover:text-white transition-all shadow-sm flex items-center justify-between mb-2">
              Panorama Exaclima
              <span>➔</span>
            </button>
          </Link>
          <Link href="/ocorrencias">
            <button className="w-full bg-[#0a234f] border border-blue-500/50 text-left px-4 py-3 rounded-lg text-sm font-bold text-white hover:bg-[#133570] transition-all shadow-sm flex items-center justify-between mb-2 shadow-blue-900/20">
              Gestão de Ocorrências (Kanban)
              <span>➔</span>
            </button>
          </Link>
          <Link href="/historico">
            <button className="w-full bg-[#0a234f] border border-[#133570] text-left px-4 py-3 rounded-lg text-sm font-bold text-neutral-300 hover:bg-[#133570] hover:text-white transition-all shadow-sm flex items-center justify-between">
              Histórico de Ocorrências
              <span>➔</span>
            </button>
          </Link>

        </div>

        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
          <span>📡</span> Sensores e Estações
        </p>
        <div className="space-y-3 px-1">
          {estacoes.map(est => (
            <div 
              key={est.id} 
              className="bg-[#0a234f]/80 border border-[#133570]/80 rounded-lg p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-bold text-slate-200 leading-tight">{est.nome}</span>
                {est.irif && (
                  <button 
                    onClick={() => onSelectEstacao && onSelectEstacao(est.id)}
                    title="Clique para ver os detalhes do IRIF"
                    className="text-xs px-2 py-1 rounded-md text-white font-bold tracking-wide flex-shrink-0 cursor-pointer hover:scale-105 transition-all animate-pulse hover:animate-none border border-white/20" 
                    style={{backgroundColor: est.irif.level.color, boxShadow: `0 0 12px ${est.irif.level.color}80`}}
                  >
                    IRIF: {Math.round(est.irif.irif)}
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {est.raw.temp != null && (
                  <div className="bg-[#03132e] rounded p-2 flex flex-col items-center justify-center border border-[#133570]/50">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">Temperatura</span>
                    <span className="text-sm font-black text-white">{est.raw.temp}°C</span>
                  </div>
                )}
                {est.raw.ur != null && (
                  <div className="bg-[#03132e] rounded p-2 flex flex-col items-center justify-center border border-[#133570]/50">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">Umidade</span>
                    <span className="text-sm font-black text-[#0ea5e9]">{est.raw.ur}%</span>
                  </div>
                )}
                {est.raw.vento != null && (
                  <div className="bg-[#03132e] rounded p-2 flex flex-col items-center justify-center border border-[#133570]/50">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">Vento</span>
                    <span className="text-sm font-black text-[#10b981]">{est.raw.vento} km/h</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center mt-1 pt-3 border-t border-[#133570]/50">
                <div className="text-[10px] text-slate-500 font-medium">
                  {est.raw.updatedAt ? (
                    <>🕒 {String(est.raw.updatedAt).includes('/') ? String(est.raw.updatedAt).substring(0, 17).replace(', ', ' às ') : new Date(est.raw.updatedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</>
                  ) : (
                    'Sem conexão'
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </nav>
      
      <div className="p-6 border-t border-[#03132e]">
        <button className="w-full bg-[#0a234f] hover:bg-[#133570] text-neutral-400 border border-[#1e4896] px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          ⚙️ Configurações
        </button>
      </div>
    </aside>
  );
}

export default function Operacional() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [estacoes, setEstacoes] = useState([]);
  const [estacaoSelecionadaId, setEstacaoSelecionadaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [secNome, setSecNome] = useState('');
  const [secCor, setSecCor] = useState('');

  useEffect(() => {
    const id = typeof window !== 'undefined' ? localStorage.getItem('smiic_secretaria_id') || '' : '';

    const fetchData = async () => {
      setSecNome(localStorage.getItem('smiic_secretaria_nome') || 'Secretaria Operacional');
      setSecCor(localStorage.getItem('smiic_secretaria_cor') || '#1e293b');
      try {
        const [resOco, resSec, resIrifRaw] = await Promise.all([
          supabase.from('ocorrencias').select('*'),
          supabase.from('secretarias').select('*'),
          fetch('/api/get-clima').then(r => r.json())
        ]);
        const resEst = { data: [] };
        const resIrif = { data: resIrifRaw.data || [] };

        const secList = resSec.data || [];

        if (resOco.data) {
          const filtered = resOco.data
            .filter(oco => String(oco.secretaria_id) === String(id) && oco.status !== 'Concluido')
            .map(oco => {
              const sec = secList.find(s => String(s.id) === String(oco.secretaria_id));
              return {
                ...oco,
                nome_secretaria: sec?.nome || 'Secretaria',
                cor_secretaria: sec?.cor_identidade || '#64748b'
              };
            });
          setOcorrencias(filtered);
        }

        if (resEst.data || resIrif.data) {
          const irifData = resIrif.data || [];
          const realTimeData = resEst.data || [];
          
          const estacoesFormatadas = STATIONS.map(st => {
            const irifRow = irifData.find(d => d.session === st.session);
            const realTimeRow = realTimeData.find(d => d.session === st.session);
            
            let state = loadState(st);
            if (irifRow) {
              state = {
                ...state,
                temp: irifRow.temperatura_c != null ? irifRow.temp_score : null,
                ur: irifRow.umidade_pct != null ? irifRow.ur_score : null,
                vento: irifRow.vento_kmh != null ? irifRow.vento_score : null,
                dias: irifRow.dias_score,
              };
            }
            const irif = computeIRIF(state, st);
            return {
              ...st,
              irif,
              raw: {
                temp: realTimeRow?.temperatura_c ?? irifRow?.temperatura_c ?? null,
                ur: realTimeRow?.umidade_pct ?? irifRow?.umidade_pct ?? null,
                vento: realTimeRow?.vento_kmh ?? irifRow?.vento_kmh ?? null,
                uv: realTimeRow?.uv ?? irifRow?.uv ?? null,
                updatedAt: realTimeRow?.leitura_sensor_data ?? realTimeRow?.atualizado_em ?? irifRow?.leitura_sensor_data ?? null,
              }
            };
          });
          setEstacoes(estacoesFormatadas);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    // Chamada inicial rápida (Puxa do banco)
    fetchData();

    // Sincronização em Background (Puxa dados novos da HexaCloud e atualiza o banco)
    fetch('/api/sync-clima')
      .then(res => res.json())
      .then(() => {
        // Quando terminar de sincronizar as 11 estações, atualiza a tela
        fetchData();
      })
      .catch(e => console.error("Erro no sync em background:", e));

    // Auto-refresh a cada 1 minuto para manter a tela viva
    const interval = setInterval(() => {
      fetchData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <LoginWrapper>
      <div className="h-screen flex flex-col font-sans overflow-hidden bg-[#03132e]">
        <Navbar secCor={secCor} />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar estacoes={estacoes} secCor={secCor} secNome={secNome} onSelectEstacao={setEstacaoSelecionadaId} />

          <main className="flex-1 overflow-y-auto p-8 bg-neutral-950 relative">
            
            {estacaoSelecionadaId != null ? (
              <div className="h-full min-h-[600px]">
                <StationDashboard 
                  station={estacoes.find(s => s.id === estacaoSelecionadaId)} 
                  onBack={() => setEstacaoSelecionadaId(null)} 
                />
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-wide">Ocorrências Direcionadas</h2>
                    <p className="text-sm text-neutral-400 mt-1">
                      Módulo de campo e execução técnica.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div 
                      className="px-4 py-2 rounded-lg text-sm font-medium border"
                      style={{ backgroundColor: `${secCor}20`, borderColor: `${secCor}50`, color: secCor }}
                    >
                      Meus Ativos: <span className="font-bold text-white text-base">{ocorrencias.length}</span>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="w-full h-[450px] bg-[#0a234f] rounded-xl animate-pulse flex items-center justify-center border border-[#133570]">
                    <span className="text-neutral-500 font-bold">Carregando mapa...</span>
                  </div>
                ) : (
                  <MapWrapper 
                    ocorrencias={ocorrencias} 
                    estacoes={estacoes} 
                    onSelectEstacao={setEstacaoSelecionadaId} 
                  />
                )}

                <div className="mt-8 mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    Suas Pendências
                  </h3>
                </div>
                
                {loading ? (
                  <div className="w-full p-10 bg-[#03132e] rounded-xl border border-dashed border-[#03132e] text-center">
                    <p className="text-neutral-500 font-medium">Buscando chamados...</p>
                  </div>
                ) : ocorrencias.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                    {ocorrencias.map(oco => (
                      <OcorrenciaCard key={oco.id} oco={oco} isOperacional={true} />
                    ))}
                  </div>
                ) : (
                  <div className="w-full p-10 bg-[#03132e] rounded-xl border border-dashed border-[#03132e] text-center shadow-inner">
                    <p className="text-neutral-500 font-medium">Você não possui ocorrências pendentes no momento.</p>
                  </div>
                )}
              </>
            )}

          </main>
        </div>
      </div>
    </LoginWrapper>
  );
}
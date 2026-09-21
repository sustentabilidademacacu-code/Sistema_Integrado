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

// Cor "Azul Chumbo" para os detalhes
const CHUMBO = '#1e3a8a'; // Blue 900
const CHUMBO_ESCURO = '#0f172a'; // Slate 950

function Navbar() {
  return (
    <header 
      className="w-full h-24 border-b-[6px] flex items-center shrink-0 z-20 shadow-md transition-all duration-500"
      style={{ 
        borderBottomColor: CHUMBO,
        backgroundColor: '#ffffff',
        backgroundImage: `linear-gradient(to top, ${CHUMBO}30 0%, ${CHUMBO}00 40%)`
      }}
    >
      <Link href="/" className="w-80 h-full flex items-center justify-center gap-5 shrink-0 border-r border-neutral-200 px-4 transition-all cursor-pointer hover:opacity-80">
        <img src="/prefeitura_logo_sem_fundo_quadrada.png" alt="Prefeitura" className="h-14 w-auto object-contain transition-transform hover:scale-105" />
        <div className="h-10 w-[2px] bg-neutral-200 rounded-full"></div>
        <img src="/logo_secretaria_logo_sem_fundo_comprida.png" alt="Sustentabilidade" className="h-10 w-auto object-contain transition-transform hover:scale-105" />
      </Link>
      
      <div className="flex-1 flex items-center justify-between pl-8 pr-6">
        
        {/* TÍTULO DA PÁGINA */}
        <div className="flex flex-col max-w-[75%]">
          <span className="text-[10px] text-neutral-500 font-black tracking-widest uppercase mb-1 flex items-center gap-2">
            Visão Geral Estratégica <span className="w-1 h-1 bg-neutral-300 rounded-full"></span> Sistema Municipal Integrado de Inteligência Climática
          </span>
          <h1 
            className="text-lg md:text-xl font-black uppercase leading-tight"
            style={{ color: CHUMBO_ESCURO }}
          >
            SALA DE SITUAÇÃO CENTRAL
          </h1>
        </div>
        
        {/* ÁREA DE LOGOUT */}
        <div className="flex items-center border-l border-neutral-200 pl-6 h-14">
          <LogoutButton />
        </div>

      </div>
    </header>
  );
}

function Sidebar({ estacoes, secretarias, onSelectEstacao }) {
  return (
    <aside className="w-80 flex flex-col z-10 shadow-2xl relative border-r border-[#03132e] bg-[#03132e]/50 backdrop-blur-md">
      
      {/* SELO DE AUTORIDADE / COMANDO CENTRAL */}
      <div className="p-6 border-b border-[#03132e] flex flex-col justify-center bg-gradient-to-br from-[#03132e] to-slate-950 relative overflow-hidden">
        {/* Efeito de brilho no selo */}
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-[#133570] border border-[#1e4896] flex items-center justify-center shadow-lg">
            <span className="text-sm">🛡️</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Comando Central
          </span>
        </div>
        
        <h2 className="text-[15px] font-black text-white leading-snug uppercase tracking-wide">
          Gabinete do Prefeito
        </h2>
        <div className="mt-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Monitoramento Ativo</span>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2 flex items-center gap-2 mt-2">
          <span>📊</span> Visão Geral
        </p>
        <div className="mb-8 px-1">
          <Link href="/historico">
            <button className="w-full bg-[#0a234f] border border-[#133570] text-left px-4 py-3 rounded-lg text-sm font-bold text-slate-300 hover:bg-[#133570] hover:text-white transition-all shadow-sm flex items-center justify-between group">
              Relatório Completo
              <span className="opacity-50 group-hover:opacity-100 transition-opacity">➔</span>
            </button>
          </Link>
        </div>

        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
          <span>📡</span> Status das Estações
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
                  <span className="text-xs px-2 py-1 rounded-md text-white font-bold tracking-wide flex-shrink-0" style={{backgroundColor: est.irif.level.color}}>
                    IRIF: {Math.round(est.irif.irif)}
                  </span>
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
              
              <div className="flex items-center justify-between mt-1 pt-3 border-t border-[#133570]/50">
                <div className="text-[10px] text-slate-500 font-medium">
                  {est.raw.updatedAt ? (
                    <>🕒 {new Date(est.raw.updatedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</>
                  ) : (
                    'Sem conexão'
                  )}
                </div>
                <button 
                  onClick={() => onSelectEstacao && onSelectEstacao(est.id)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1.5 rounded transition-colors"
                >
                  Abrir Painel
                </button>
              </div>
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}


export default function Gabinete() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [secretarias, setSecretarias] = useState([]);
  const [estacoes, setEstacoes] = useState([]);
  const [estacaoSelecionadaId, setEstacaoSelecionadaId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resOco, resSec, resEst, resIrif] = await Promise.all([
          supabase.from('ocorrencias').select('*'),
          supabase.from('secretarias').select('*'),
          supabase.from('mapa_atual').select('*'),
          supabase.from('leituras_clima_irif').select('*')
        ]);

        const secList = resSec.data || [];
        if (resSec.data) {
          setSecretarias(secList);
        }

        if (resOco.data) {
          // Enriquece cada ocorrência com nome e cor da secretaria responsável
          const enriquecidas = resOco.data
            .filter(oco => oco.status !== 'Concluido')
            .map(oco => {
              const sec = secList.find(s => String(s.id) === String(oco.secretaria_id));
              return {
                ...oco,
                nome_secretaria: sec?.nome || 'Não atribuída',
                cor_secretaria: sec?.cor_identidade || '#64748b'
              };
            });
          setOcorrencias(enriquecidas);
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
      {/* GRADIENTE DE FUNDO: AZUL ESCURO ATÉ O PRETO */}
      <div className="h-screen flex flex-col font-sans overflow-hidden bg-gradient-to-br from-[#03132e] via-[#0a234f] to-[#010917]">
        <Navbar />

        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Efeitos de luz no fundo do gabinete */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>

          <Sidebar estacoes={estacoes} secretarias={secretarias} onSelectEstacao={setEstacaoSelecionadaId} />

          <main className="flex-1 overflow-y-auto p-8 relative z-0">
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
                    <h2 className="text-2xl font-bold text-white tracking-wide drop-shadow-md">Monitoramento Geral do Município</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Visão executiva de todas as secretarias e chamados em andamento.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="px-5 py-2.5 rounded-lg text-sm font-black border border-[#133570] bg-[#03132e]/80 shadow-lg text-slate-300 backdrop-blur-sm">
                      TOTAL DE ATIVOS: <span className="text-white text-lg ml-2">{ocorrencias.length}</span>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="w-full h-[450px] bg-[#0a234f]/50 rounded-xl animate-pulse flex items-center justify-center border border-[#133570] backdrop-blur-sm">
                    <span className="text-slate-500 font-bold">Carregando satélites e sensores...</span>
                  </div>
                ) : (
                  <div className="shadow-2xl rounded-xl overflow-hidden border border-[#133570]">
                    <MapWrapper 
                      ocorrencias={ocorrencias} 
                      estacoes={estacoes} 
                      onSelectEstacao={setEstacaoSelecionadaId} 
                    />
                  </div>
                )}

                <div className="mt-10 mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-black text-white flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                    Ocorrências Abertas (Todas as Secretarias)
                  </h3>
                </div>
                
                {loading ? (
                  <div className="w-full p-10 bg-[#03132e]/50 rounded-xl border border-dashed border-[#133570] text-center backdrop-blur-sm">
                    <p className="text-slate-500 font-medium">Coletando dados da rede...</p>
                  </div>
                ) : ocorrencias.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                    {ocorrencias.map(oco => (
                      <OcorrenciaCard key={oco.id} oco={oco} isOperacional={false} />
                    ))}
                  </div>
                ) : (
                  <div className="w-full p-12 bg-[#03132e]/50 rounded-xl border border-dashed border-[#133570] text-center shadow-inner backdrop-blur-sm">
                    <span className="text-4xl block mb-4 opacity-20">✅</span>
                    <p className="text-xl font-bold text-slate-400">Tudo Normal</p>
                    <p className="text-slate-500 mt-2">Nenhuma ocorrência crítica aberta no momento.</p>
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
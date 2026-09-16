'use client';

import { useState, useEffect } from 'react';
import MapWrapper from '../MapWrapper';
import LoginWrapper from '../LoginWrapper';
import LogoutButton from '../LogoutButton';
import OcorrenciaCard from '../OcorrenciaCard';
import Link from 'next/link';

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

function Sidebar({ estacoes, secretarias }) {
  return (
    <aside className="w-80 flex flex-col z-10 shadow-2xl relative border-r border-slate-900 bg-slate-950/50 backdrop-blur-md">
      
      {/* SELO DE AUTORIDADE / COMANDO CENTRAL */}
      <div className="p-6 border-b border-slate-900 flex flex-col justify-center bg-gradient-to-br from-slate-900 to-slate-950 relative overflow-hidden">
        {/* Efeito de brilho no selo */}
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg">
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
            <button className="w-full bg-slate-900 border border-slate-800 text-left px-4 py-3 rounded-lg text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all shadow-sm flex items-center justify-between group">
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
            <div key={est.id} className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">{est.nome}</span>
                <span className={`w-2 h-2 rounded-full ${est.ativa ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`}></span>
              </div>
              {est.ultima_leitura ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {est.ultima_leitura.chuva_mm !== null && (
                    <div className="bg-slate-950 rounded p-2 flex flex-col items-center justify-center border border-slate-800/50">
                      <span className="text-[10px] text-slate-500 uppercase mb-1">Chuva</span>
                      <span className="text-sm font-black text-blue-400">{est.ultima_leitura.chuva_mm}mm</span>
                    </div>
                  )}
                  {est.ultima_leitura.nivel_rio_metros !== null && (
                    <div className="bg-slate-950 rounded p-2 flex flex-col items-center justify-center border border-slate-800/50">
                      <span className="text-[10px] text-slate-500 uppercase mb-1">Nível Rio</span>
                      <span className="text-sm font-black text-emerald-400">{est.ultima_leitura.nivel_rio_metros}m</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[10px] text-slate-600 mt-2 text-center font-medium">Nenhuma leitura recebida.</div>
              )}
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/api/ocorrencias/').then(res => res.json()),
      fetch('http://127.0.0.1:8000/api/secretarias/').then(res => res.json()),
      fetch('http://127.0.0.1:8000/api/estacoes-meteorologicas/').then(res => res.json())
    ])
    .then(([dataOco, dataSec, dataEst]) => {
      setOcorrencias(dataOco.filter(oco => oco.status_publico !== 'Concluido'));
      setSecretarias(dataSec);
      setEstacoes(dataEst);
      setLoading(false);
    })
    .catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  return (
    <LoginWrapper>
      {/* GRADIENTE DE FUNDO: AZUL ESCURO ATÉ O PRETO */}
      <div className="h-screen flex flex-col font-sans overflow-hidden bg-gradient-to-br from-slate-900 via-[#0a0f1d] to-black">
        <Navbar />

        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Efeitos de luz no fundo do gabinete */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>

          <Sidebar estacoes={estacoes} secretarias={secretarias} />

          <main className="flex-1 overflow-y-auto p-8 relative z-0">
            
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-wide drop-shadow-md">Monitoramento Geral do Município</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Visão executiva de todas as secretarias e chamados em andamento.
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="px-5 py-2.5 rounded-lg text-sm font-black border border-slate-800 bg-slate-950/80 shadow-lg text-slate-300 backdrop-blur-sm">
                  TOTAL DE ATIVOS: <span className="text-white text-lg ml-2">{ocorrencias.length}</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="w-full h-[450px] bg-slate-900/50 rounded-xl animate-pulse flex items-center justify-center border border-slate-800 backdrop-blur-sm">
                <span className="text-slate-500 font-bold">Carregando satélites e sensores...</span>
              </div>
            ) : (
              <div className="shadow-2xl rounded-xl overflow-hidden border border-slate-800">
                <MapWrapper ocorrencias={ocorrencias} estacoes={estacoes} />
              </div>
            )}

            <div className="mt-10 mb-6 flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                Ocorrências Abertas (Todas as Secretarias)
              </h3>
            </div>
            
            {loading ? (
              <div className="w-full p-10 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 text-center backdrop-blur-sm">
                <p className="text-slate-500 font-medium">Coletando dados da rede...</p>
              </div>
            ) : ocorrencias.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                {ocorrencias.map(oco => (
                  <OcorrenciaCard key={oco.id} oco={oco} isOperacional={false} />
                ))}
              </div>
            ) : (
              <div className="w-full p-12 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 text-center shadow-inner backdrop-blur-sm">
                <span className="text-4xl block mb-4 opacity-20">✅</span>
                <p className="text-slate-400 font-medium text-lg">Nenhuma ocorrência crítica pendente no município.</p>
              </div>
            )}

          </main>
        </div>
      </div>
    </LoginWrapper>
  );
}
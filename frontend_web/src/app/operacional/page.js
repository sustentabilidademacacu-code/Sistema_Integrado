'use client';

import { useState, useEffect } from 'react';
import MapWrapper from '../MapWrapper';
import LoginWrapper from '../LoginWrapper';
import LogoutButton from '../LogoutButton';
import OcorrenciaCard from '../OcorrenciaCard';
import Link from 'next/link';

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

function Sidebar({ estacoes, secCor, secNome }) {
  return (
    <aside className="w-80 bg-black flex flex-col z-10 shadow-2xl relative border-r border-neutral-900">
      
      {/* CARD DA SECRETARIA NO TOPO DO MENU */}
      <div className="p-6 border-b border-neutral-900 flex flex-col justify-center" style={{ backgroundColor: `${secCor}15`, borderBottomColor: `${secCor}30` }}>
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
        <div className="mb-8 px-1">
          <Link href="/historico">
            <button className="w-full bg-neutral-900 border border-neutral-800 text-left px-4 py-3 rounded-lg text-sm font-bold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all shadow-sm flex items-center justify-between">
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
            <div key={est.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-300">{est.nome}</span>
                <span className={`w-2 h-2 rounded-full ${est.ativa ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`}></span>
              </div>
              {est.ultima_leitura ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {est.ultima_leitura.chuva_mm !== null && (
                    <div className="bg-black rounded p-2 flex flex-col items-center justify-center border border-neutral-800/50">
                      <span className="text-[10px] text-neutral-500 uppercase mb-1">Chuva</span>
                      <span className="text-sm font-black text-blue-400">{est.ultima_leitura.chuva_mm}mm</span>
                    </div>
                  )}
                  {est.ultima_leitura.nivel_rio_metros !== null && (
                    <div className="bg-black rounded p-2 flex flex-col items-center justify-center border border-neutral-800/50">
                      <span className="text-[10px] text-neutral-500 uppercase mb-1">Nível Rio</span>
                      <span className="text-sm font-black text-emerald-400">{est.ultima_leitura.nivel_rio_metros}m</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[10px] text-neutral-500 mt-2 text-center">Nenhuma leitura recebida.</div>
              )}
            </div>
          ))}
        </div>
      </nav>
      
      <div className="p-6 border-t border-neutral-900">
        <button className="w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-neutral-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          ⚙️ Configurações
        </button>
      </div>
    </aside>
  );
}

export default function Operacional() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [estacoes, setEstacoes] = useState([]);
  const [secNome, setSecNome] = useState('');
  const [secId, setSecId] = useState('');
  const [secCor, setSecCor] = useState('#022888');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const nome = localStorage.getItem('smiic_secretaria_nome') || '';
    const id = localStorage.getItem('smiic_secretaria_id') || '';
    const cor = localStorage.getItem('smiic_secretaria_cor') || '#022888';
    
    setSecNome(nome);
    setSecId(id);
    setSecCor(cor);

    Promise.all([
      fetch('http://127.0.0.1:8000/api/ocorrencias/').then(res => res.json()),
      fetch('http://127.0.0.1:8000/api/estacoes-meteorologicas/').then(res => res.json())
    ])
    .then(([dataOco, dataEst]) => {
      const filtered = dataOco.filter(oco => 
        oco.status_publico !== 'Concluido' && 
        oco.secretaria_responsavel === id
      );
      setOcorrencias(filtered);
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
      <div className="h-screen flex flex-col font-sans overflow-hidden bg-black">
        <Navbar secCor={secCor} />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar estacoes={estacoes} secCor={secCor} secNome={secNome} />

          <main className="flex-1 overflow-y-auto p-8 bg-neutral-950 relative">
            
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
              <div className="w-full h-[450px] bg-neutral-900 rounded-xl animate-pulse flex items-center justify-center border border-neutral-800">
                <span className="text-neutral-500 font-bold">Carregando mapa...</span>
              </div>
            ) : (
              <MapWrapper ocorrencias={ocorrencias} estacoes={estacoes} />
            )}

            <div className="mt-8 mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Suas Pendências
              </h3>
            </div>
            
            {loading ? (
              <div className="w-full p-10 bg-black rounded-xl border border-dashed border-neutral-900 text-center">
                <p className="text-neutral-500 font-medium">Buscando chamados...</p>
              </div>
            ) : ocorrencias.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-10">
                {ocorrencias.map(oco => (
                  <OcorrenciaCard key={oco.id} oco={oco} isOperacional={true} />
                ))}
              </div>
            ) : (
              <div className="w-full p-10 bg-black rounded-xl border border-dashed border-neutral-900 text-center shadow-inner">
                <p className="text-neutral-500 font-medium">Você não possui ocorrências pendentes no momento.</p>
              </div>
            )}

          </main>
        </div>
      </div>
    </LoginWrapper>
  );
}
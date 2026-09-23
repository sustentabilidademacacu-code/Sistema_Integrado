'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import LogoutButton from '../../LogoutButton';
import LoginWrapper from '../../LoginWrapper';
import { STATIONS } from '@/data/stations';

function Navbar({ secCor }) {
  return (
    <header 
      className="w-full bg-white h-24 border-b-[6px] flex items-center shrink-0 z-20 shadow-md transition-colors duration-500 sticky top-0"
      style={{ borderBottomColor: secCor || '#022888' }}
    >
      <Link href="/" className="w-80 h-full flex items-center justify-center gap-5 shrink-0 border-r border-neutral-200 px-4 hover:bg-neutral-50 transition-colors cursor-pointer">
        <img src="/prefeitura_logo_sem_fundo_quadrada.png" alt="Prefeitura" className="h-14 w-auto object-contain" />
        <div className="h-10 w-[2px] bg-neutral-200 rounded-full"></div>
        <img src="/logo_secretaria_logo_sem_fundo_comprida.png" alt="Sustentabilidade" className="h-10 w-auto object-contain" />
      </Link>
      
      <div className="flex-1 flex items-center justify-between pl-8 pr-6">
        <div className="flex flex-col">
          <span className="text-[10px] text-neutral-500 font-black tracking-widest uppercase mb-1 flex items-center gap-2">
            Módulo de Execução <span className="w-1 h-1 bg-neutral-300 rounded-full"></span> Plataforma SMIIC
          </span>
          <h1 className="text-xl md:text-2xl font-black uppercase leading-tight text-[#022888]">
            PAINEL OPERACIONAL — DEFESA CIVIL
          </h1>
        </div>
        
        <div className="flex items-center gap-5 border-l border-neutral-200 pl-6 h-14">
          <Link href="/operacional" className="text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors px-4 py-2 rounded-lg mr-4 shadow-sm">
            Voltar ao Mapa
          </Link>
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

// Componente individual de Dashboard (Iframe)
function IframeDashboard({ station }) {
  const [loading, setLoading] = useState(true);
  const iframeUrl = `https://hexacloud.com.br/dashboard/?session=${station.session}`;

  return (
    <div className="bg-[#0a234f] border border-[#133570] rounded-2xl overflow-hidden shadow-2xl mb-8 flex flex-col">
      {/* Header do Iframe */}
      <div className="p-4 bg-gradient-to-r from-[#051838] to-[#0a234f] border-b border-[#133570] flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-3">
            {station.hideFromList ? <span className="text-slate-500 opacity-50">⚪</span> : <span className="text-emerald-400 animate-pulse">🟢</span>}
            {station.nome}
          </h3>
          <p className="text-xs font-bold uppercase text-slate-400 tracking-widest mt-1 ml-7">
            📍 {station.bairro || 'Zona Rural'} — {station.regiao}
          </p>
        </div>
        {station.hideFromList && (
          <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-slate-700 shadow-inner">
            Estação Inativa
          </span>
        )}
      </div>

      {/* Container do Iframe */}
      <div className="relative w-full h-[750px] bg-[#03132e]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a234f]/80 z-10">
            <div className="w-10 h-10 border-4 border-[#133570] border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Conectando à HexaCloud...</p>
          </div>
        )}
        <iframe
          src={iframeUrl}
          className="w-full h-full border-0"
          title={`Dashboard ${station.nome}`}
          onLoad={() => setLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  );
}

export default function DashboardsPage() {
  const [secCor, setSecCor] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSecCor(localStorage.getItem('smiic_secretaria_cor') || '#ea580c');
    }
  }, []);

  // Processar e agrupar as estações
  const { ativas, inativas } = useMemo(() => {
    let filtradas = STATIONS;
    
    if (search.trim()) {
      const lower = search.toLowerCase();
      filtradas = STATIONS.filter(st => 
        st.nome.toLowerCase().includes(lower) ||
        (st.bairro && st.bairro.toLowerCase().includes(lower)) ||
        st.regiao.toLowerCase().includes(lower)
      );
    }

    const arrAtivas = filtradas.filter(st => !st.hideFromList);
    const arrInativas = filtradas.filter(st => st.hideFromList);

    // Função para agrupar por região
    const agrupar = (lista) => {
      const grupos = {};
      lista.forEach(st => {
        const key = st.regiao || 'Outras';
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(st);
      });
      return grupos;
    };

    return {
      ativas: agrupar(arrAtivas),
      inativas: arrInativas
    };
  }, [search]);

  return (
    <LoginWrapper>
      <div className="min-h-screen bg-[#03132e] font-sans flex flex-col text-slate-200">
        <Navbar secCor={secCor} />

        <main className="flex-1 w-full mx-auto px-4 py-8 md:px-8 max-w-[1600px] flex flex-col">
          {/* HEADER DA PÁGINA */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 bg-[#0a234f] p-6 md:p-8 rounded-3xl border border-[#133570] shadow-2xl">
            <div>
              <h2 className="text-3xl font-black text-white flex items-center gap-4">
                <span className="text-4xl">📈</span> Dashboards Climáticos
              </h2>
              <p className="text-slate-400 text-sm mt-3 font-medium max-w-2xl leading-relaxed">
                Visualização unificada de todos os painéis das estações. 
                Role a página para acompanhar as métricas em tempo real divididas por localidades.
              </p>
            </div>

            <div className="relative w-full md:w-[400px] shrink-0">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
              <input 
                type="text" 
                placeholder="Buscar por nome, bairro ou localidade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#03132e] border-2 border-[#1e4896] text-white text-sm font-medium rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-orange-500 transition-all shadow-inner placeholder-slate-500"
              />
            </div>
          </div>

          {/* SESSÃO ESTAÇÕES ATIVAS (Agrupadas por Região) */}
          {Object.keys(ativas).length > 0 ? (
            Object.entries(ativas).map(([regiao, estacoes]) => (
              <div key={`regiao-${regiao}`} className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-black uppercase tracking-widest text-orange-500">
                    📍 Localidade: {regiao}
                  </h2>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-orange-500/50 to-transparent"></div>
                </div>
                
                {estacoes.map(st => (
                  <IframeDashboard key={st.id} station={st} />
                ))}
              </div>
            ))
          ) : search.trim() && Object.keys(ativas).length === 0 && inativas.length === 0 ? (
            <div className="w-full py-32 text-center bg-[#0a234f]/30 border-2 border-[#133570] border-dashed rounded-3xl">
              <span className="text-5xl opacity-30 mb-6 block">🌪️</span>
              <h3 className="text-xl font-bold text-slate-400">Nenhuma estação encontrada</h3>
              <p className="text-slate-500 mt-2">Tente buscar por outro termo.</p>
            </div>
          ) : null}

          {/* SESSÃO ESTAÇÕES INATIVAS */}
          {inativas.length > 0 && (
            <div className="mt-12 pt-12 border-t-[4px] border-dashed border-[#133570]">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-xl font-black uppercase tracking-widest text-slate-500 flex items-center gap-3">
                  ⚠️ Estações Inativas ou em Manutenção
                </h2>
              </div>
              
              {inativas.map(st => (
                <IframeDashboard key={st.id} station={st} />
              ))}
            </div>
          )}

        </main>
      </div>
    </LoginWrapper>
  );
}

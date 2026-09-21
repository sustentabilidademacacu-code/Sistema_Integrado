import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { STATIONS } from './data/stations';
import { MapComponent } from './components/MapComponent';
import { computeIRIF, loadState, saveState, LEVELS } from './data/common';
import type { IRIFState, IRIFResult, StationMapData } from './data/common';
import './App.css';

// TODO: Reativar quando corrigir o bug de horário de atualização
// const formatDateBR = (isoStr: string | null | undefined) => {
//   if (!isoStr) return '--';
//   try {
//     const dt = new Date(isoStr);
//     return new Intl.DateTimeFormat('pt-BR', {
//       timeZone: 'America/Sao_Paulo',
//       day: '2-digit', month: '2-digit', year: 'numeric',
//       hour: '2-digit', minute: '2-digit', second: '2-digit'
//     }).format(dt);
//   } catch (e) {
//     return isoStr;
//   }
// };


// Initialize Supabase Client
const supabaseClient = createClient(
  'https://oawsmfizeeabuipxekci.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hd3NtZml6ZWVhYnVpcHhla2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NjY0NzEsImV4cCI6MjEwNTI0MjQ3MX0.AOBVjmN7vPYKSNMQhPRi2HW5_r_goEZcRUNEQGUsIKU'
);

export const App: React.FC = () => {
  const [activeStationId, setActiveStationId] = useState<number | null>(null);
  const [irifState, setIrifState] = useState<IRIFState | null>(null);
  const [supabaseLoading, setSupabaseLoading] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [allStationsData, setAllStationsData] = useState<Record<number, StationMapData>>(() => {
    const initial: Record<number, StationMapData> = {};
    STATIONS.forEach((st) => {
      const state = loadState(st);
      const irif = computeIRIF(state, st);
      initial[st.id] = {
        irif,
        raw: { temp: null, ur: null, vento: null, uv: null, updatedAt: null },
      };
    });
    return initial;
  });
  const [isMapDataLoading, setIsMapDataLoading] = useState<boolean>(true);
  const [countdownText, setCountdownText] = useState<string>('--:--:--');

  // HexaCloud iframe load variables
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const iframeLoadedRef = useRef<boolean>(false);
  const [showIframeFallback, setShowIframeFallback] = useState<boolean>(false);

  // Handle URL navigation matching original behavior (e.g. ?id=24)
  useEffect(() => {
    const parseUrlId = () => {
      const params = new URLSearchParams(window.location.search);
      const idStr = params.get('id');
      if (idStr) {
        const id = parseInt(idStr, 10);
        const stationExists = STATIONS.some((s) => s.id === id);
        if (stationExists) {
          setActiveStationId(id);
        } else {
          setActiveStationId(null);
        }
      } else {
        setActiveStationId(null);
      }
    };

    parseUrlId();
    window.addEventListener('popstate', parseUrlId);
    return () => window.removeEventListener('popstate', parseUrlId);
  }, []);

  // Fetch real-time weather for all stations to show on map markers
  useEffect(() => {
    const fetchAllIrif = async () => {
      try {
        const [irifRes, realTimeRes] = await Promise.all([
          supabaseClient.from('leituras_clima_irif').select('*'),
          supabaseClient.from('mapa_atual').select('*')
        ]);
        if (!irifRes.error && irifRes.data) {
          const results: Record<number, StationMapData> = {};
          STATIONS.forEach((st) => {
            const irifRow = irifRes.data.find((d: any) => d.session === st.session);
            const realTimeRow = realTimeRes.data?.find((d: any) => d.session === st.session);
            let state = loadState(st);
            if (irifRow) {
              state = {
                ...state,
                temp: irifRow.temperatura_c != null ? irifRow.temp_score : null,
                ur: irifRow.umidade_pct != null ? irifRow.ur_score : null,
                vento: irifRow.vento_kmh != null ? irifRow.vento_score : null,
                dias: irifRow.dias_score,
              };
              saveState(st, state);
            }
            const irif = computeIRIF(state, st);
            results[st.id] = {
              irif,
              raw: {
                temp: realTimeRow?.temperatura_c ?? irifRow?.temperatura_c ?? null,
                ur: realTimeRow?.umidade_pct ?? irifRow?.umidade_pct ?? null,
                vento: realTimeRow?.vento_kmh ?? irifRow?.vento_kmh ?? null,
                uv: realTimeRow?.uv ?? irifRow?.uv ?? null,
                updatedAt: realTimeRow?.leitura_sensor_data ?? realTimeRow?.atualizado_em ?? irifRow?.leitura_sensor_data ?? null,
              },
            };
          });
          setAllStationsData(results);
        }
      } catch (err) {} finally {
        setIsMapDataLoading(false);
      }
    };
    fetchAllIrif();
    // Re-fetch every 1 minute para garantir dados sempre frescos no mapa
    const interval = setInterval(fetchAllIrif, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Update query parameters in the browser history when active station changes
  const selectStation = (id: number) => {
    setActiveStationId(id);
    const newUrl = `${window.location.pathname}?id=${id}`;
    window.history.pushState({ id }, '', newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setActiveStationId(null);
    window.history.pushState(null, '', window.location.pathname);
  };

  const currentStation = STATIONS.find((s) => s.id === activeStationId);

  // Countdown timer for next weather sync
  useEffect(() => {
    if (!currentStation) return;

    const updateCountdown = () => {
      const now = new Date();
      const targets = [9, 12, 15, 18].map((h) => {
        const t = new Date(now);
        t.setHours(h, 0, 0, 0);
        return t;
      });

      const tomorrow9h = new Date(now);
      tomorrow9h.setDate(tomorrow9h.getDate() + 1);
      tomorrow9h.setHours(9, 0, 0, 0);
      targets.push(tomorrow9h);

      const nextTarget = targets.find((t) => t > now);
      if (!nextTarget) return;

      const diffMs = nextTarget.getTime() - now.getTime();
      const diffSecs = Math.floor(diffMs / 1000);

      const hours = Math.floor(diffSecs / 3600);
      const minutes = Math.floor((diffSecs % 3600) / 60);
      const seconds = diffSecs % 60;

      const pad = (num: number) => String(num).padStart(2, '0');
      setCountdownText(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [currentStation]);

  // Fetch real-time weather from Supabase when selected station changes
  useEffect(() => {
    if (!currentStation) {
      setIrifState(null);
      return;
    }

    // Set initial loading and trigger iframe logic
    const dashUrl = `https://hexacloud.com.br/dashboard/?session=${currentStation.session}`;
    setIframeUrl(dashUrl);
    iframeLoadedRef.current = false;
    setShowIframeFallback(false);

    // Iframe fallback timer (3.5 seconds)
    const timer = setTimeout(() => {
      if (!iframeLoadedRef.current) {
        setShowIframeFallback(true);
      }
    }, 3500);

    // Initialize or load state from localStorage
    const localState = loadState(currentStation);
    setIrifState(localState);

    const fetchWeather = async () => {
      setSupabaseLoading(true);
      try {
        const [irifRes, realTimeRes] = await Promise.all([
          supabaseClient.from('leituras_clima_irif').select('*').eq('session', currentStation.session).single(),
          supabaseClient.from('mapa_atual').select('*').eq('session', currentStation.session).single()
        ]);

        if (irifRes.error && irifRes.error.code !== 'PGRST116') {
          console.error('Error fetching live weather:', irifRes.error);
        }

        if (irifRes.data) {
          const updatedState: IRIFState = {
            ...localState,
            temp: irifRes.data.temperatura_c != null ? irifRes.data.temp_score : null,
            ur: irifRes.data.umidade_pct != null ? irifRes.data.ur_score : null,
            vento: irifRes.data.vento_kmh != null ? irifRes.data.vento_score : null,
            dias: irifRes.data.dias_score,
          };
          saveState(currentStation, updatedState);
          setIrifState(updatedState);
        }

        // Atualizar também o estado global para que o modal reflita os dados brutos e a data reais!
        setAllStationsData(prev => {
          const current = prev[currentStation.id] || { irif: null, raw: { temp: null, ur: null, vento: null, uv: null, updatedAt: null } };
          
          const rtData = realTimeRes.data || {};
          const irData = irifRes.data || {};

          return {
            ...prev,
            [currentStation.id]: {
              ...current,
              raw: {
                temp: rtData.temperatura_c ?? irData.temperatura_c ?? null,
                ur: rtData.umidade_pct ?? irData.umidade_pct ?? null,
                vento: rtData.vento_kmh ?? irData.vento_kmh ?? null,
                uv: rtData.uv ?? irData.uv ?? null,
                updatedAt: rtData.leitura_sensor_data ?? rtData.atualizado_em ?? irData.leitura_sensor_data ?? null,
              }
            }
          };
        });

      } catch (err) {
        console.error('Unexpected error fetching live weather:', err);
      } finally {
        setSupabaseLoading(false);
      }
    };

    fetchWeather();

    return () => {
      clearTimeout(timer);
    };
  }, [activeStationId]);

  // Calculations for IRIF danger levels
  let irifResult: IRIFResult | null = null;
  if (currentStation && irifState) {
    irifResult = computeIRIF(irifState, currentStation);
  }

  // Formatting actions lists matching school.js format
  const renderActionsHtml = (actionsText: string) => {
    return actionsText.split('\n').map((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('-')) {
        return (
          <li key={index} style={{ marginLeft: '14px', marginTop: '5px', listStyleType: 'disc', color: '#cbd5e1' }}>
            {trimmed.substring(1).trim()}
          </li>
        );
      } else if (trimmed === '') {
        return <div key={index} style={{ height: '10px' }}></div>;
      } else if (trimmed.endsWith(':')) {
        return (
          <strong
            key={index}
            style={{
              display: 'block',
              marginTop: '12px',
              marginBottom: '4px',
              color: '#fcd34d',
              fontSize: '0.82rem',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            {trimmed}
          </strong>
        );
      }
      return (
        <div key={index} style={{ color: '#cbd5e1', marginTop: '8px' }}>
          {trimmed}
        </div>
      );
    });
  };

  // Hexadecimal to RGB helper matching school.js
  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  };

  // Ocultar estações que estão offline/sem enviar dados há muito tempo.
  // Recomendação: 24 horas (86400000 ms). Assim evita que uma queda rápida de internet
  // na escola (ex: à noite) faça a estação sumir, mas garante que estações
  // realmente com defeito ou desligadas não fiquem poluindo o mapa com dados velhos.
  const LIMITE_OFFLINE_MS = 24 * 60 * 60 * 1000; // 24 horas
  
  const visibleStations = STATIONS.filter((st) => {
    // Se ainda está carregando, mostra todas para evitar piscar a tela
    if (isMapDataLoading) return true;
    
    const updatedAt = allStationsData[st.id]?.raw?.updatedAt;
    if (!updatedAt) return false; // Nunca enviou dados
    
    const lastUpdate = new Date(updatedAt).getTime();
    const now = new Date().getTime();
    
    return (now - lastUpdate) <= LIMITE_OFFLINE_MS;
  });

  return (
    <>
      {/* Dynamic Topbar */}
      <div className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="/" onClick={goHome}>
            <div className="topbar-logos">
              <img className="header-logo" src="/img/prefeitura_logo.png" alt="Prefeitura de Cachoeiras de Macacu" />
              <img className="header-logo" src="/img/logo-secretaria.png" alt="Secretaria Municipal de Sustentabilidade" />
              <img className="header-logo" src="/img/sec_educacao_logo.png" alt="Secretaria Municipal de Educação" />
            </div>
            <div className="brand-text">
              <span className="eyebrow">Prefeitura Municipal de Cachoeiras de Macacu</span>
              <h1>Monitoramento Climático e Risco de Incêndio</h1>
            </div>
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <main>
        {!currentStation ? (
          /* ------------------- HUB / LANDING PAGE VIEW ------------------- */
          <>
            <div className="welcome-layout">
              {/* Card 1: O Projeto ExaClima */}
              <div className="welcome-card" style={{ borderTop: '4px solid var(--blue-primary)' }}>
                <div className="card-visual exaclima-visual">
                  <svg viewBox="0 0 100 100">
                    <g className="anim-sun">
                      <circle cx="50" cy="50" r="16" fill="none" stroke="var(--blue-primary)" strokeWidth="4" strokeDasharray="6,4" />
                      <circle cx="50" cy="50" r="10" fill="var(--blue-primary)" opacity="0.8" />
                    </g>
                    <path className="anim-wind wind-1" d="M20,35 L40,35 A5,5 0 0,1 45,40" fill="none" stroke="var(--blue-secondary)" strokeWidth="2.5" strokeLinecap="round" />
                    <path className="anim-wind wind-2" d="M15,65 L35,65 A5,5 0 0,0 40,60" fill="none" stroke="var(--blue-secondary)" strokeWidth="2.5" strokeLinecap="round" />
                    <path className="anim-cloud" d="M45,62 C45,55 52,50 60,50 C62,50 64,51 66,52 C70,47 77,47 81,51 C86,51 90,55 90,60 C90,65 86,69 80,69 L48,69 C45,69 45,65 45,62 Z" fill="var(--mist)" stroke="var(--blue-primary)" strokeWidth="3" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ fontSize: '2rem', marginBottom: '12px', display: 'block' }}>🌤️</span>
                <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--blue-primary)', marginBottom: '12px', marginTop: 0 }}>
                  O Projeto ExaClima
                </h2>
                <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--ink-soft)', marginBottom: 0 }}>
                  Este sistema reúne e processa dados das estações meteorológicas instaladas nas unidades escolares da rede municipal. O monitoramento contínuo fornece leituras essenciais de temperatura, umidade, vento e chuvas, auxiliando no planejamento preventivo e na segurança civil local.
                </p>
              </div>

              {/* Card 2: Índice de Risco de Incêndio Florestal (IRIF) */}
              <div className="welcome-card" style={{ borderTop: '4px solid #ef4444' }}>
                <div className="card-visual irif-visual">
                  <svg viewBox="0 0 100 100">
                    <path d="M20,70 A35,35 0 0,1 80,70" fill="none" stroke="var(--line)" strokeWidth="6" strokeLinecap="round" />
                    <path d="M20,70 A35,35 0 0,1 65,38" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" opacity="0.8" />
                    <g className="anim-needle">
                      <line x1="50" y1="70" x2="68" y2="42" stroke="#991b1b" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="50" cy="70" r="6" fill="#991b1b" />
                    </g>
                    <path className="anim-flame flame-1" d="M35,60 C32,52 35,44 42,40 C40,48 45,52 48,58" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
                    <path className="anim-flame flame-2" d="M65,60 C62,50 65,42 72,38 C70,48 75,52 78,58" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
                <span style={{ fontSize: '2rem', marginBottom: '12px', display: 'block' }}>🔥</span>
                <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.35rem', fontWeight: 700, color: '#ef4444', marginBottom: '12px', marginTop: 0 }}>
                  Risco de Incêndio (IRIF)
                </h2>
                <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--ink-soft)', marginBottom: 0 }}>
                  Metodologia integrada para avaliar o risco de incêndios florestais na região. O IRIF correlaciona o Fator Climático obtido pelo ExaClima com dados ambientais e físicos da área (como declividade do terreno, potencial de combustão da vegetação local, ocupação humana circunvizinha e a distância à base da Defesa Civil).
                </p>
              </div>
            </div>

            {/* Interactive Map and Sidebar Section */}
            <div className="map-section">
              <div className="map-section-header">
                <span>🗺️</span>
                <h2>Mapa das Estações do Projeto</h2>
              </div>
              <p className="map-section-description">
                Selecione uma escola na legenda lateral para aproximar o mapa e acessar seu respectivo painel de monitoramento meteorológico em tempo real.
              </p>
              <MapComponent stations={visibleStations} onSelectStation={selectStation} stationData={allStationsData} isLoading={isMapDataLoading} />
              {/* 
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                <a 
                  className="btn btn-primary" 
                  href="/panorama.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    fontSize: '1rem', 
                    padding: '12px 28px', 
                    gap: '10px', 
                    boxShadow: '0 4px 15px rgba(2, 40, 136, 0.2)',
                    borderRadius: '8px'
                  }}
                >
                  📊 Ver Panorama Geral das Estações
                </a>
              </div>
              */}
            </div>
          </>
        ) : (
          /* ------------------- DASHBOARD VIEW FOR ACTIVE STATION ------------------- */
          <div className="dashboard-main" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0px' }}>
            <div className="dashboard-header" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div className="dashboard-header-title">
                <h2 style={{ fontFamily: 'var(--display)', fontSize: '2rem', color: 'var(--blue-primary)', fontWeight: 800, marginBottom: '4px' }}>
                  {currentStation.nome}
                </h2>
                <div style={{ fontSize: '0.95rem', color: 'var(--ink-soft)' }}>
                  {supabaseLoading ? 'Buscando leituras de clima...' : 'Veja aqui o monitoramento climático e sua última atualização'}
                </div>
              </div>
              <a className="btn btn-secondary" href="/" onClick={goHome}>
                ← Voltar ao Início
              </a>
            </div>

            {/* 1. Live Weather Panel (HexaCloud iframe) */}
            <div className="dashboard-panel" style={{ marginBottom: '32px', width: '100%' }}>
              <div className="panel-head">
                <span className="panel-title">
                  PAINEL ATUALIZADO — ESTAÇÃO {currentStation.session.toUpperCase()}
                </span>
                <a className="panel-action" href={iframeUrl} target="_blank" rel="noopener noreferrer">
                  abrir em nova aba ↗
                </a>
              </div>
              <div className="live-frame-container" style={{ height: '750px', position: 'relative', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
                {!showIframeFallback ? (
                  <iframe
                    id="live-iframe"
                    title="Dashboard HexaCloud"
                    loading="lazy"
                    src={iframeUrl || undefined}
                    onLoad={() => { iframeLoadedRef.current = true; }}
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                  />
                ) : (
                  <div className="live-frame-fallback" style={{ display: 'flex', position: 'absolute', inset: 0, background: '#ffffff', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--blue-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.8 }}>
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                      </svg>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink-dark)', marginBottom: '8px' }}>Carregando Monitoramento</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.5, marginBottom: '20px' }}>
                        Se os dados climáticos e o mapa não carregarem em alguns segundos, por favor <strong>recarregue a página</strong>.
                      </p>
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => window.location.reload()} className="btn" style={{ background: 'var(--blue-primary)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' }}>
                          Recarregar Página ↻
                        </button>
                        <a href={iframeUrl} className="btn" target="_blank" rel="noopener noreferrer" style={{ background: 'var(--mist)', color: 'var(--ink-dark)', border: '1px solid var(--line)', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          Abrir em Nova Aba ↗
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. IRIF Index Section */}
            {irifResult && (
              <div className="irif-section" style={{ marginBottom: '32px', width: '100%' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.8rem', color: 'var(--blue-primary)', fontWeight: 800, marginBottom: '8px' }}>
                    Índice de Risco de Incêndio Florestal (IRIF)
                  </h2>
                  <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 0, maxWidth: '950px' }}>
                    Este é um sistema baseado nas atualizações do Fator Climático fornecido pelo ExaClima e nos outros fatores abaixo que integram o cálculo da calculadora de risco, estimando a vulnerabilidade local de forma integrada. <strong>Os dados climáticos são atualizados quatro vezes ao dia (às 09h, 12h, 15h e 18h).</strong>
                  </p>
                </div>

                <div className="irif-dashboard-grid">
                  {/* Left Side: IRIF Calculation circular gauge and recommendations */}
                  <div
                    className="irif-premium-card"
                    id="irif-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      marginTop: '0',
                      minHeight: '460px',
                      borderColor: `rgba(${hexToRgb(irifResult.level.color)}, 0.4)`,
                      boxShadow: `0 12px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(${hexToRgb(irifResult.level.color)}, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
                    }}
                  >
                    <div>
                      <div className="irif-card-header">
                        <div className="irif-header-title">
                          <h3>CÁLCULO DO IRIF</h3>
                        </div>
                        <div className="irif-update-badge" style={{ fontSize: '0.72rem', color: '#fcd34d', background: 'rgba(252,211,77,0.08)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(252,211,77,0.2)', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: 1.3 }}>
                          <div>🕒 Sincronização: 09h, 12h, 15h, 18h</div>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Próxima em: <span id="update-countdown" style={{ color: '#fcd34d', fontFamily: 'monospace', fontSize: '0.72rem' }}>{countdownText}</span>
                          </div>
                          {/* TODO: Horário de última atualização oculto até corrigir bug de sincronização */}
                          {/* <div style={{ marginTop: '4px', fontSize: '0.75rem', color: '#fff', borderTop: '1px solid rgba(252,211,77,0.2)', paddingTop: '4px' }}>
                            Última atualização: <span id="last-update" style={{ color: '#fff', fontFamily: 'monospace', fontSize: '0.8rem' }}>{allStationsData[currentStation.id]?.raw?.updatedAt ? formatDateBR(allStationsData[currentStation.id].raw.updatedAt) : '--'}</span>
                          </div> */}
                        </div>
                      </div>

                      <div className="irif-card-content" style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '24px', padding: '24px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', alignItems: 'center' }}>
                        {/* Circle Danger Gauge */}
                        <div className="irif-gauge-container" style={{ width: '120px', height: '120px', flexShrink: 0, position: 'relative' }}>
                          <svg className="irif-gauge-svg" viewBox="0 0 120 120" style={{ width: '120px', height: '120px', display: 'block', transform: 'none' }}>
                            <circle className="gauge-bg" cx="60" cy="60" r="50"></circle>
                            <circle
                              className="gauge-fill"
                              cx="60"
                              cy="60"
                              r="50"
                              transform="rotate(-90 60 60)"
                              style={{
                                strokeDasharray: 314,
                                strokeDashoffset: 314 - (Math.min(irifResult.irif, 100) / 100) * 314,
                                stroke: irifResult.level.color,
                                filter: `drop-shadow(0 0 5px ${irifResult.level.color})`,
                              }}
                            ></circle>
                          </svg>
                          <div className="irif-gauge-text" style={{ pointerEvents: 'none' }}>
                            <span className="irif-score-value" style={{ color: irifResult.level.color, fontFamily: 'var(--display)', fontWeight: 800, lineHeight: 1, marginBottom: '2px' }}>
                              {irifResult.irif.toFixed(1)}
                            </span>
                            <span className="irif-score-lbl" style={{ fontFamily: 'var(--mono)', fontSize: '0.62rem', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Pontos
                            </span>
                          </div>
                        </div>

                        {/* Level badge and recommendation block */}
                        <div className="irif-info-panel" style={{ flexGrow: 1 }}>
                          <div className="irif-badge-row" style={{ marginBottom: '8px' }}>
                            <span className="irif-level-badge" style={{ backgroundColor: irifResult.level.color }}>
                              {irifResult.level.code}
                            </span>
                          </div>
                          <h4 className="irif-level-title" style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px', color: irifResult.level.color }}>
                            Nível {irifResult.level.code} — {irifResult.level.label}
                          </h4>
                          <p className="irif-desc" style={{ fontSize: '0.88rem', lineHeight: 1.4, color: '#cbd5e1', marginBottom: '12px' }}>
                            {irifResult.level.desc}
                          </p>

                          <div className="irif-actions-container">
                            <div className="irif-action-card">
                              <div className="action-icon" style={{ fontSize: '1.2rem' }}>🚨</div>
                              <div className="action-text">
                                <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                                  Ações Recomendadas
                                </h5>
                                <div id="result-actions" style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                                  {renderActionsHtml(irifResult.level.actions)}
                                </div>
                              </div>
                              <button id="emergency-card-fab" className="emergency-card-fab" aria-label="Contatos de Emergência" onClick={() => setIsEmergencyModalOpen(true)}>
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ display: 'block' }}>
                                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4.19C3.65 3 3 3.24 3 3.99 3 13.38 10.62 21 20 21c.74 0 1-.58 1-1.13v-3.49c0-.55-.45-1-1-.99z"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer segments danger indicators */}
                    <div className="irif-card-footer" style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '20px' }}>
                      <span className="footer-label" style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#a0aec0', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                        Segmentação do Nível de Risco
                      </span>
                      <div className="irif-level-bar" style={{ display: 'flex', height: '16px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        {LEVELS.map((level, i) => {
                          const activeIndex = LEVELS.indexOf(irifResult!.level);
                          const opacity = i <= activeIndex ? '1' : '0.15';
                          return (
                            <div
                              key={level.code}
                              className="irif-level-seg"
                              id={`seg${i + 1}`}
                              style={{
                                backgroundColor: level.color,
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                color: '#fff',
                                fontWeight: 700,
                                opacity: opacity,
                              }}
                            >
                              <span>{level.code}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Factors layout (Read Only Static metadata) */}
                  <div className="dashboard-panel" style={{ marginBottom: 0, padding: '24px', background: '#ffffff', border: '1px solid var(--line)', borderRadius: '12px', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '460px' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--blue-primary)', marginBottom: '16px', borderBottom: '2px solid var(--mist)', paddingBottom: '8px' }}>
                      Fatores Considerados no Cálculo
                    </h3>
                    <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--ink-soft)', marginBottom: '20px' }}>
                      A calculadora compõe o índice de risco com base nos seguintes parâmetros para cada estação ativa:
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h4 style={{ fontFamily: 'var(--display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--blue-primary)', margin: 0 }}>
                          Fator Físico-Espacial
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.4, margin: 0 }}>
                          Declividade do terreno e facilidade de acesso para acionamento das viaturas de combate a fogo.
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h4 style={{ fontFamily: 'var(--display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--blue-primary)', margin: 0 }}>
                          Fator Vegetação
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.4, margin: 0 }}>
                          Avalia o potencial de combustão e a carga de material combustível disponível para queima ao redor da unidade escolar.
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h4 style={{ fontFamily: 'var(--display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--blue-primary)', margin: 0 }}>
                          Tipo de ocupação humana na área
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.4, margin: 0 }}>
                          Avalia o potencial de ignição humana baseado no uso do solo circunvizinho (ex: interface urbano-rural ou agricultura).
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h4 style={{ fontFamily: 'var(--display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--blue-primary)', margin: 0 }}>
                          Distância ao ponto de controle mais próximo - Defesa civil
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.4, margin: 0 }}>
                          Avalia a resposta operacional através do mapeamento da proximidade geográfica até a sede da Defesa Civil.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        )}
      </main>

      {/* Footer and Partners (Common to both screens) */}
      <section className="partners-section">
        <div className="partners-inner">
          <div className="partners-logos">
            <img src="/img/prefeitura_logo.png" alt="Prefeitura de Cachoeiras de Macacu" className="partner-logo" />
            <img src="/img/logo-secretaria.png" alt="Secretaria Municipal de Sustentabilidade" className="partner-logo" />
            <img src="/img/sec_educacao_logo.png" alt="Secretaria Municipal de Educação" className="partner-logo" />
            <img src="/img/meu_municipio_ods.png" alt="Meu Município ODS" className="partner-logo" />
            <img src="/img/cidades_resilientes_logo.png" alt="Cidades Resilientes" className="partner-logo partner-white-bg" />
          </div>
        </div>
      </section>

      <footer>
        Secretaria Municipal de Sustentabilidade, Clima, Recursos Hídricos, Ecossistema e Projetos Estratégicos · Secretaria Municipal de Educação · Prefeitura Municipal de Cachoeiras de Macacu
      </footer>

      {/* Modal de Contatos de Emergência */}
      {isEmergencyModalOpen && (
        <div id="emergency-modal" className="emergency-modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) setIsEmergencyModalOpen(false); }}>
          <div className="emergency-modal-card">
            <div className="emergency-modal-header">
              <div>
                <h3>Telefones de Emergência</h3>
                <p>Clique em um número para realizar a ligação</p>
              </div>
              <button className="emergency-modal-close-btn" onClick={() => setIsEmergencyModalOpen(false)}>&times;</button>
            </div>
            <div className="emergency-modal-body">
              <div className="contact-group">
                <h4>🚨 Corpo de Bombeiros</h4>
                <div className="contact-links">
                  <a href="tel:193" className="contact-btn em-btn">193 (Emergência)</a>
                  <a href="tel:+552126491191" className="contact-btn">(21) 2649-1191</a>
                </div>
              </div>
              
              <div className="contact-group">
                <h4>🛡️ Defesa Civil</h4>
                <div className="contact-links">
                  <a href="tel:199" className="contact-btn em-btn">199 (Emergência)</a>
                  <a href="tel:+5521959479945" className="contact-btn">(21) 95947-9945</a>
                </div>
              </div>

              <div className="contact-group">
                <h4>🌱 Sec. Municipal de Meio Ambiente</h4>
                <div className="contact-links">
                  <a href="tel:+552126496443" className="contact-btn">(21) 2649-6443</a>
                </div>
              </div>

              <div className="contact-group">
                <h4>⛰️ Parque Estadual dos Três Picos</h4>
                <div className="contact-links">
                  <a href="tel:+552126496847" className="contact-btn">(21) 2649-6847</a>
                </div>
              </div>
            </div>
            <button className="emergency-modal-close-footer" onClick={() => setIsEmergencyModalOpen(false)}>Fechar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default App;

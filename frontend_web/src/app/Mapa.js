"use client";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, LayersControl, FeatureGroup, ZoomControl, Polygon, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const getIconByPriority = (priority) => {
  let color = 'bg-blue-500'; // Default
  if (priority === 'P1') color = 'bg-purple-700'; // CRÍTICA
  else if (priority === 'P2') color = 'bg-red-600'; // ALTA
  else if (priority === 'P3') color = 'bg-yellow-400'; // MÉDIA
  else if (priority === 'P4') color = 'bg-orange-500'; // BAIXA

  return new L.DivIcon({
    className: 'bg-transparent',
    html: `<div class="relative flex items-center justify-center w-8 h-8">
             <div class="absolute w-full h-full ${color} opacity-30 rounded-full animate-ping"></div>
             <div class="relative w-4 h-4 ${color} rounded-full border-2 border-white shadow-lg"></div>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const getIconeEstacao = (color = 'bg-blue-500') => new L.DivIcon({
  className: 'bg-transparent',
  html: `<div class="relative flex items-center justify-center w-8 h-8">
           <div class="absolute w-full h-full ${color} opacity-40 rounded-full animate-ping"></div>
           <div class="relative w-6 h-6 ${color} rounded-lg border border-white/50 shadow-[0_0_15px_rgba(0,0,0,0.6)] flex items-center justify-center transform rotate-45">
             <div class="-rotate-45">
               <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M12 12v.01"></path>
               </svg>
             </div>
           </div>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Paleta de cores sóbrias para UCs: tons naturais de azul, verde e ciano
const coresPaleta = [
  '#0e7490', // ciano escuro
  '#047857', // esmeralda escuro
  '#166534', // verde escuro
  '#0f766e', // teal
  '#1d4ed8', // azul profundo
  '#065f46', // esmeralda muito escuro
  '#155e75', // ciano muito escuro
  '#0369a1', // azul oceano
  '#0c4a6e', // azul marinho
  '#14532d', // verde floresta
  '#134e4a', // teal escuro
  '#1e3a5f', // azul noturno
];

const getCorParaUC = (nome) => {
  if (!nome) return '#15803d';
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  return coresPaleta[Math.abs(hash) % coresPaleta.length];
};

export default function Mapa({ ocorrencias = [], estacoes = [], onSelectEstacao, fullScreen = false }) {
  const [mostrarLocalidades, setMostrarLocalidades] = useState(true);
  const [mostrarBairros, setMostrarBairros] = useState(true);
  const [mostrarRios, setMostrarRios] = useState(false);
  const [mostrarUCs, setMostrarUCs] = useState(false);
  const [bairrosData, setBairrosData] = useState(null);
  const [localidadesData, setLocalidadesData] = useState(null);
  const [riosData, setRiosData] = useState(null);
  const [ucsData, setUcsData] = useState(null);
  const [ucsAtivas, setUcsAtivas] = useState([]);

  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });

    // Carrega Logradouros (Bairros)
    fetch('/geojson/bairros.geojson')
      .then(res => res.json())
      .then(data => setBairrosData(data))
      .catch(err => console.error("Erro bairros:", err));

    // Carrega Localidades (Polígonos da Defesa Civil / Rural)
    fetch('/geojson/localidades.geojson')
      .then(res => res.json())
      .then(data => setLocalidadesData(data))
      .catch(err => console.error("Erro localidades:", err));

    // Carrega Rios (quando o usuário disponibilizar rios.geojson)
    fetch('/geojson/rios.geojson')
      .then(res => { if(res.ok) return res.json(); throw new Error('Not found'); })
      .then(data => setRiosData(data))
      .catch(err => console.log("Rios GeoJSON não encontrado ainda."));

    // Carrega UCs (quando o usuário disponibilizar unidades_conservacao.geojson)
    fetch('/geojson/ucs_geojson.geojson')
      .then(res => { if(res.ok) return res.json(); throw new Error('Not found'); })
      .then(data => {
        setUcsData(data);
        if (data && data.features) {
          // Inicialmente, quando carrega, as deixa inativas até ligar a camada
          setUcsAtivas([]);
        }
      })
      .catch(err => console.log("UCs GeoJSON não encontrado ainda."));
  }, []);

  const posicaoEnquadrada = [-22.4647, -42.6533];

  const mostrarNomeNoMouse = (feature, layer) => {
    const props = feature.properties || {};
    // Lê o campo correto dependendo de qual GeoJSON é
    const nome = props.BAIRRO || props.nome_localidade || props.nome_uc || props.nome || props.NOME || null;

    if (nome) {
      layer.bindTooltip(nome, {
        permanent: false,
        sticky: true,     // segue o mouse dentro do polígono
        direction: 'top',
        className: 'mapa-tooltip'
      });

      // Se for uma UC, também amarra um Popup detalhado
      if (props.nome_uc) {
        const { cria_ano, cria_ato, ha_total, esfera, org_gestor, categoria } = props;
        const area = ha_total ? parseFloat(ha_total).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' ha' : 'Não informada';
        const popupContent = `
          <div style="min-width:220px;color:#f8fafc;font-family:system-ui,sans-serif;">
            <strong style="font-size:13px;display:block;margin-bottom:2px;">${nome}</strong>
            <span style="font-size:9px;font-weight:900;color:#34d399;text-transform:uppercase;letter-spacing:0.1em;">${categoria || 'Unidade de Conservação'}</span>
            <hr style="border-color:rgba(255,255,255,0.15);margin:6px 0;">
            <div style="font-size:11px;color:#cbd5e1;display:flex;flex-direction:column;gap:4px;">
              <p><b style="color:#94a3b8;">Criação:</b> <span style="color:#fff;">${cria_ano || '-'} ${cria_ato ? '(' + cria_ato + ')' : ''}</span></p>
              <p><b style="color:#94a3b8;">Área:</b> <span style="color:#fff;">${area}</span></p>
              <p><b style="color:#94a3b8;">Esfera:</b> <span style="color:#fff;">${esfera || '-'}</span></p>
              <p><b style="color:#94a3b8;">Gestor:</b> <span style="color:#fff;">${org_gestor || '-'}</span></p>
            </div>
          </div>
        `;
        layer.bindPopup(popupContent, { className: 'custom-dark-popup' });
      }

      layer.on({
        mouseover: (e) => {
          const l = e.target;
          l.setStyle({ fillOpacity: 0.65, weight: 3, color: '#ffffff' });
          l.bringToFront();
        },
        mouseout: (e) => {
          const l = e.target;
          if (props.nome_uc) {
            l.setStyle({ fillOpacity: 0.35, weight: 2.5, color: getCorParaUC(props.nome_uc) });
          } else if (props.BAIRRO) {
            l.setStyle({ fillOpacity: 0.25, weight: 2, color: '#047857' });
          } else if (props.nome_localidade) {
            l.setStyle({ fillOpacity: 0.25, weight: 2, color: '#1d4ed8' });
          } else {
            l.setStyle({ fillOpacity: 0.35, weight: 2.5, color: '#0e7490' }); // Rios
          }
        }
      });
    }
  };


  return (
    <div className={`relative w-full z-0 bg-[#0a234f] ${fullScreen ? 'h-screen' : 'h-[450px] xl:h-[600px] rounded-xl overflow-hidden shadow-inner'}`}>

      {/* ── BARRA DE CAMADAS ─────────── */}
      <div className={`absolute z-[1000] ${
        fullScreen
          ? 'top-4 left-4'
          : 'top-3 left-3'
      }`}>
        <div className={`bg-[#050f20]/92 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.7)] ${
          fullScreen
            ? 'flex flex-col gap-1 p-2 rounded-2xl min-w-[190px]'
            : 'flex flex-col gap-1 p-2 rounded-2xl min-w-[190px]'
        }`}>
          {/* Label topo — só no painel lateral */}
          {!fullScreen && (
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em] px-2 pt-1 pb-0.5">Camadas</p>
          )}

          {/* Limites Municipais */}
          <button onClick={() => setMostrarLocalidades(v => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
              mostrarLocalidades ? 'bg-blue-600/20 text-blue-300 border border-blue-500/35' : 'text-slate-500 border border-transparent hover:text-slate-300 hover:bg-white/5'
            }`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${mostrarLocalidades ? 'bg-blue-400 shadow-[0_0_6px_#60a5fa]' : 'bg-slate-700'}`} />
            Localidades
          </button>

          {/* Bairros */}
          <button onClick={() => setMostrarBairros(v => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
              mostrarBairros ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/35' : 'text-slate-500 border border-transparent hover:text-slate-300 hover:bg-white/5'
            }`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${mostrarBairros ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-slate-700'}`} />
            Bairros
          </button>

          {/* Hidrografia */}
          <button onClick={() => setMostrarRios(v => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
              mostrarRios ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/35' : 'text-slate-500 border border-transparent hover:text-slate-300 hover:bg-white/5'
            }`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${mostrarRios ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]' : 'bg-slate-700'}`} />
            Hidrografia
          </button>

          {/* UCs — no painel embutido: toggle simples. No fullscreen: dropdown por UC */}
          <div className="relative flex flex-col">
            <div className={`flex items-center rounded-xl transition-all duration-200 w-full border ${
              mostrarUCs ? 'bg-green-600/20 text-green-300 border-green-500/35' : 'text-slate-500 border-transparent hover:bg-white/5'
            }`}>
              <button
                onClick={() => {
                  const next = !mostrarUCs;
                  setMostrarUCs(next);
                  if (next && ucsData) setUcsAtivas(ucsData.features.map(f => f.properties.nome_uc));
                  else setUcsAtivas([]);
                }}
                className="flex items-center gap-2 px-3 py-1.5 flex-1 text-[10px] font-bold uppercase tracking-wider text-left hover:text-slate-300"
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${mostrarUCs ? 'bg-green-400 shadow-[0_0_6px_#4ade80]' : 'bg-slate-700'}`} />
                APAs, Refúgios e Unid. de Conservação
                
                {/* Seta para baixo no fullscreen */}
                {fullScreen && mostrarUCs && (
                  <svg className="w-2.5 h-2.5 ml-auto animate-pulse opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Seta pulsando para expandir no painel inicial */}
              {!fullScreen && (
                <a 
                  href="/mapa-completo" 
                  target="_blank" 
                  title="Expandir mapa para ver UCs separadamente" 
                  className="pr-3 pl-1 flex items-center justify-center transition-transform hover:scale-110"
                >
                  <svg className="w-3.5 h-3.5 animate-pulse text-blue-400 hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>

            {/* Dropdown individual — só no fullscreen */}
            {fullScreen && mostrarUCs && ucsData && (
              <div className="mt-1 bg-[#050f20]/98 border border-white/12 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-0.5 max-h-52 overflow-y-auto custom-scrollbar min-w-[190px]">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest px-2 pt-1 pb-0.5">Selecionar UC</p>
                {Array.from(new Set(ucsData.features.map(f => f.properties.nome_uc).filter(Boolean))).sort().map((nome, i) => {
                  const cor = getCorParaUC(nome);
                  const ativo = ucsAtivas.includes(nome);
                  return (
                    <button key={i}
                      onClick={() => ativo ? setUcsAtivas(ucsAtivas.filter(n => n !== nome)) : setUcsAtivas([...ucsAtivas, nome])}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wide transition-all text-left w-full ${
                        ativo ? 'text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ativo ? cor : '#334155', boxShadow: ativo ? `0 0 4px ${cor}80` : 'none' }} />
                      <span className="truncate" title={nome}>{nome}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Expandir — só no painel embutido */}
          {!fullScreen && (
            <>
              <div className="w-full h-px bg-white/8 my-1" />
              <a href="/mapa-completo" target="_blank"
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/15 hover:bg-blue-600/35 text-blue-400 hover:text-blue-200 border border-blue-500/25 hover:border-blue-400/50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                Expandir Mapa
              </a>
            </>
          )}
        </div>
      </div>

      <MapContainer scrollWheelZoom={false} boxZoom={false} center={posicaoEnquadrada} zoom={11} zoomControl={false} style={{ height: '100%', width: '100%', background: '#0a192f' }}>
        <ZoomControl position="bottomright" />
        <style>{`
          .leaflet-tile-container img { width: 256.5px !important; height: 256.5px !important; }
          .custom-dark-popup .leaflet-popup-content-wrapper { background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; }
          .custom-dark-popup .leaflet-popup-tip { background: rgba(15, 23, 42, 0.95); }
          .custom-scrollbar::-webkit-scrollbar { width: 3px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
          .mapa-tooltip {
            background: rgba(5, 15, 32, 0.97) !important;
            border: 1px solid rgba(255,255,255,0.12) !important;
            border-radius: 8px !important;
            color: #e2e8f0 !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.08em !important;
            padding: 5px 10px !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.6) !important;
            white-space: nowrap !important;
          }
          .mapa-tooltip::before { border-top-color: rgba(255,255,255,0.12) !important; }
          /* Oculta atribuição padrão do Leaflet */
          .leaflet-control-attribution { display: none !important; }
          /* Estiliza botões de zoom */
          .leaflet-control-zoom { border: none !important; border-radius: 12px !important; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.5) !important; }
          .leaflet-control-zoom a { background: rgba(5,15,32,0.90) !important; border: none !important; color: #94a3b8 !important; width: 32px !important; height: 32px !important; line-height: 32px !important; font-size: 18px !important; transition: all 0.15s; }
          .leaflet-control-zoom a:hover { background: rgba(30,72,150,0.8) !important; color: #fff !important; }
          .leaflet-control-zoom-in { border-bottom: 1px solid rgba(255,255,255,0.07) !important; }
          /* Estiliza LayersControl */
          .leaflet-control-layers { background: rgba(5,15,32,0.92) !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 12px !important; box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important; color: #94a3b8 !important; }
          .leaflet-control-layers-toggle { background-color: rgba(5,15,32,0.92) !important; border-radius: 12px !important; width: 36px !important; height: 36px !important; }
          .leaflet-control-layers label { color: #94a3b8 !important; font-size: 11px !important; font-weight: 600; }
          .leaflet-control-layers-separator { border-color: rgba(255,255,255,0.08) !important; }
        `}</style>

        <LayersControl position="topright" collapsed={true}>
          <LayersControl.BaseLayer checked name="Satélite (Esri World Imagery)">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="&copy; Esri"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Modo Escuro (Esri Dark Gray)">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              attribution="&copy; Esri"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Mapa Simples (OpenStreetMap)">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {mostrarLocalidades && localidadesData && (
          <FeatureGroup>
            <GeoJSON
              data={localidadesData}
              style={{ color: '#1d4ed8', weight: 2, fillOpacity: 0.25, fillColor: '#1d4ed8' }}
              onEachFeature={mostrarNomeNoMouse}
            />
          </FeatureGroup>
        )}

        {mostrarBairros && bairrosData && (
          <GeoJSON 
            data={bairrosData} 
            style={{ color: '#047857', weight: 2, fillOpacity: 0.25, fillColor: '#047857' }} 
            onEachFeature={mostrarNomeNoMouse}
          />
        )}

        {mostrarRios && riosData && (
          <GeoJSON 
            data={riosData} 
            style={{ color: '#0e7490', weight: 2.5, fillOpacity: 0.4 }} 
            onEachFeature={mostrarNomeNoMouse}
          />
        )}

        {ucsAtivas.length > 0 && ucsData && (
          <GeoJSON 
            key={ucsAtivas.join(',')}
            data={{...ucsData, features: ucsData.features.filter(f => ucsAtivas.includes(f.properties.nome_uc))}} 
            style={(feature) => ({
              color: getCorParaUC(feature.properties.nome_uc),
              weight: 2.5,
              fillOpacity: 0.35,
              fillColor: getCorParaUC(feature.properties.nome_uc)
            })} 
            onEachFeature={mostrarNomeNoMouse}
          />
        )}

        {ocorrencias.filter(oco => oco.latitude != null && oco.longitude != null).map(oco => (
          <Marker key={oco.id} position={[oco.latitude, oco.longitude]} icon={getIconByPriority(oco.prioridade_acao)}>
            <Popup className="rounded-xl shadow-lg border-none">
              <div className="flex flex-col gap-1 min-w-[200px] p-1">
                <span className={`text-[10px] font-black uppercase tracking-widest text-white px-2 py-0.5 rounded w-max ${
                  oco.prioridade_acao === 'P1' ? 'bg-purple-700' : 
                  oco.prioridade_acao === 'P2' ? 'bg-red-600' : 
                  oco.prioridade_acao === 'P4' ? 'bg-orange-500' : 'bg-yellow-400'
                }`}>
                  Prioridade {oco.prioridade_acao}
                </span>
                <strong className="text-slate-800 text-sm mt-1 leading-tight">{oco.categoria}</strong>
                {oco.logradouro && (
                  <p className="text-[11px] text-slate-500 font-medium">📍 {oco.logradouro}{oco.numero ? `, ${oco.numero}` : ''} - {oco.bairro || oco.localidade}</p>
                )}
                <div className="w-full h-px bg-slate-200 my-1"></div>
                <span className="text-slate-600 text-xs italic">&quot;{oco.descricao}&quot;</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {estacoes.filter(est => est.lat != null && est.lon != null).map(est => {
          const colorClass = est.irif?.level?.code === 'N1' ? 'bg-[#1b4332]' :
                             est.irif?.level?.code === 'N2' ? 'bg-[#52b788]' :
                             est.irif?.level?.code === 'N3' ? 'bg-[#e9c46a]' :
                             est.irif?.level?.code === 'N4' ? 'bg-[#ef4444]' :
                             est.irif?.level?.code === 'N5' ? 'bg-[#c1121f]' : 'bg-blue-500';

          return (
            <Marker key={est.id} position={[est.lat, est.lon]} icon={getIconeEstacao(colorClass)}>
              <Tooltip direction="top" offset={[0, -10]} className="bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-800 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                {est.nome.split(' - ')[0] || est.nome}
              </Tooltip>
              <Popup className="rounded-xl shadow-lg border-none">
                <div className="flex flex-col gap-2 min-w-[200px] p-2">
                  <strong className="text-slate-800 text-sm leading-tight">{est.nome}</strong>
                  
                  {est.irif && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-white font-bold px-2 py-0.5 rounded" style={{backgroundColor: est.irif.level.color}}>
                        IRIF: {Math.round(est.irif.irif)}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-black">{est.irif.level.label}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {est.raw?.temp != null && (
                      <div className="bg-slate-100 rounded px-2 py-1 flex items-center justify-between">
                        <span className="text-[9px] text-slate-500 uppercase font-bold">Temp</span>
                        <span className="text-[11px] font-black text-slate-700">{est.raw.temp}°</span>
                      </div>
                    )}
                    {est.raw?.ur != null && (
                      <div className="bg-slate-100 rounded px-2 py-1 flex items-center justify-between">
                        <span className="text-[9px] text-slate-500 uppercase font-bold">Umid</span>
                        <span className="text-[11px] font-black text-[#0ea5e9]">{est.raw.ur}%</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full h-px bg-slate-200 my-1"></div>
                  
                  <button 
                    onClick={() => onSelectEstacao && onSelectEstacao(est.id)}
                    className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 rounded transition-colors"
                  >
                    Ver Painel Completo
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}


      </MapContainer>

      {/* FONTE DE DADOS — canto inferior esquerdo, longe do zoom */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#0a192f]/80 backdrop-blur-md border border-white/10 px-3 py-2 rounded-lg shadow-lg">
        <p className="text-[9px] text-slate-400 leading-tight">
          <strong className="text-slate-300">Fonte:</strong> CIGEO — Secretaria de Planejamento, Habitação e Geoprocessamento
        </p>
      </div>
    </div>
  );
}

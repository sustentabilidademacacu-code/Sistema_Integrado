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
  html: `<div class="w-4 h-4 ${color} rounded-full border-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center animate-pulse"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10],
});

const coresPaleta = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

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
    const nome = feature.properties?.nome || feature.properties?.nome_uc;
    if (nome) {
      layer.bindTooltip(nome, {
        permanent: false,
        direction: 'center',
        className: 'bg-white/90 backdrop-blur-sm border-none shadow-sm text-slate-700 font-bold text-[10px] uppercase tracking-wider'
      });
      
      // Se for uma UC, também amarra um Popup detalhado
      if (feature.properties?.nome_uc) {
        const { cria_ano, cria_ato, ha_total, esfera, org_gestor, categoria } = feature.properties;
        const area = ha_total ? parseFloat(ha_total).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' ha' : 'Não informada';
        const popupContent = `
          <div class="flex flex-col gap-1 min-w-[200px]">
            <strong class="text-slate-800 text-sm leading-tight">${nome}</strong>
            <span class="text-[10px] font-bold text-slate-500 uppercase">${categoria || 'Unidade de Conservação'}</span>
            <div class="w-full h-px bg-slate-200 my-1"></div>
            <div class="text-[11px] text-slate-600 flex flex-col gap-0.5">
              <p><b>Criação:</b> ${cria_ano || '-'} ${cria_ato ? '(' + cria_ato + ')' : ''}</p>
              <p><b>Área:</b> ${area}</p>
              <p><b>Esfera:</b> ${esfera || '-'}</p>
              <p><b>Gestor:</b> ${org_gestor || '-'}</p>
            </div>
          </div>
        `;
        layer.bindPopup(popupContent, { className: 'rounded-xl shadow-lg border-none' });
      }

      layer.on({
        mouseover: (e) => {
          const l = e.target;
          l.setStyle({ fillOpacity: 0.5, weight: 3 });
        },
        mouseout: (e) => {
          const l = e.target;
          // Retorna o estilo ao normal
          if (feature.properties?.nome_uc) {
            l.setStyle({ fillOpacity: 0.3, weight: 2 });
          } else {
            l.setStyle({ fillOpacity: 0.08, weight: 1.5 });
          }
        }
      });
    }
  };

  return (
    <div className={`relative w-full z-0 bg-[#0a234f] ${fullScreen ? 'h-screen' : 'h-[450px] xl:h-[600px] rounded-xl overflow-hidden shadow-inner'}`}>
      
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-200 flex flex-col gap-2 max-w-[250px]">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer hover:text-blue-600 transition-colors">
          <input 
            type="checkbox" 
            checked={mostrarLocalidades} 
            onChange={(e) => setMostrarLocalidades(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Limites Municipais
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer hover:text-emerald-600 transition-colors">
          <input 
            type="checkbox" 
            checked={mostrarBairros} 
            onChange={(e) => setMostrarBairros(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          Bairros (Zona Urbana)
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer hover:text-cyan-600 transition-colors">
          <input 
            type="checkbox" 
            checked={mostrarRios} 
            onChange={(e) => setMostrarRios(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
          />
          Hidrografia (Rios)
        </label>
        <div className="flex flex-col">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer hover:text-green-700 transition-colors">
            <input 
              type="checkbox" 
              checked={mostrarUCs} 
              onChange={(e) => {
                setMostrarUCs(e.target.checked);
                if (e.target.checked && ucsData) {
                  setUcsAtivas(ucsData.features.map(f => f.properties.nome_uc));
                } else {
                  setUcsAtivas([]);
                }
              }}
              className="w-4 h-4 rounded border-slate-300 text-green-700 focus:ring-green-600"
            />
            Unidades de Conservação
          </label>
          
          {mostrarUCs && ucsData && (
            <div className="ml-6 mt-1.5 flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-2" style={{scrollbarWidth: 'thin'}}>
              {Array.from(new Set(ucsData.features.map(f => f.properties.nome_uc).filter(Boolean))).sort().map((nome, i) => (
                   <label key={i} className="flex items-center gap-2 text-[10px] text-slate-600 font-medium cursor-pointer hover:text-green-600">
                     <input 
                       type="checkbox" 
                       checked={ucsAtivas.includes(nome)} 
                       onChange={(e) => {
                         if (e.target.checked) setUcsAtivas([...ucsAtivas, nome]);
                         else setUcsAtivas(ucsAtivas.filter(n => n !== nome));
                       }}
                       className="w-3 h-3 rounded border-slate-300 text-green-600 focus:ring-green-500"
                     />
                     <span className="truncate w-full" title={nome}>{nome}</span>
                   </label>
              ))}
            </div>
          )}
        </div>

        {!fullScreen && (
          <>
            <div className="w-full h-px bg-slate-200 my-1"></div>
            <a 
              href="/mapa-completo" 
              target="_blank"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 px-4 text-center font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              Expandir Mapa 
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
            </a>
          </>
        )}
      </div>

      <MapContainer scrollWheelZoom={false} boxZoom={false} center={posicaoEnquadrada} zoom={11} zoomControl={false} style={{ height: '100%', width: '100%', background: '#0f172a' }}>
        <ZoomControl position="bottomright" />
        <style>{`.leaflet-tile-container img { width: 256.5px !important; height: 256.5px !important; }`}</style>

        <LayersControl position={fullScreen ? "bottomleft" : "topright"} collapsed={false}>
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
              style={{ color: '#1d4ed8', weight: 1.5, opacity: 0.9, fillOpacity: 0.08 }}
              onEachFeature={mostrarNomeNoMouse}
            />
          </FeatureGroup>
        )}

        {mostrarBairros && bairrosData && (
          <GeoJSON 
            data={bairrosData} 
            style={{ color: '#10b981', weight: 1.5, fillOpacity: 0.08 }} 
            onEachFeature={mostrarNomeNoMouse}
          />
        )}

        {mostrarRios && riosData && (
          <GeoJSON 
            data={riosData} 
            style={{ color: '#06b6d4', weight: 2, fillOpacity: 0.5 }} 
            onEachFeature={mostrarNomeNoMouse}
          />
        )}

        {ucsAtivas.length > 0 && ucsData && (
          <GeoJSON 
            key={ucsAtivas.join(',')}
            data={{...ucsData, features: ucsData.features.filter(f => ucsAtivas.includes(f.properties.nome_uc))}} 
            style={(feature) => ({
              color: getCorParaUC(feature.properties.nome_uc),
              weight: 2,
              fillOpacity: 0.3
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

      {/* LEGENDA E FONTES DE DADOS OFICIAIS (BOTTOM LEFT) */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-[#0a234f]/90 backdrop-blur-md border border-[#1e4896] p-3 rounded-lg shadow-lg flex flex-col gap-2">
        <div className="text-[10px] text-slate-300 leading-tight flex flex-col gap-1">
          <span>
            <strong className="text-slate-400">FONTE DOS DADOS GEOGRÁFICOS:</strong> CIGEO - Centro Integrado de Informações Geográficas e <strong className="text-white">Geoprocessamento</strong>
          </span>
          <span className="text-[8px] text-slate-400">
            Secretaria de Planejamento, <strong className="text-slate-300">Geoprocessamento</strong> e Habitação
          </span>
        </div>
      </div>
    </div>
  );
}

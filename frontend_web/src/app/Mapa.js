"use client";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, LayersControl, FeatureGroup, ZoomControl, Polygon, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const getIconByPriority = (priority) => {
  let color = 'bg-blue-500'; // Default
  if (priority === 'P1') color = 'bg-purple-700'; // CRÃTICA
  else if (priority === 'P2') color = 'bg-red-600'; // ALTA
  else if (priority === 'P3') color = 'bg-yellow-400'; // MÃ‰DIA
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

const iconeEstacao = new L.DivIcon({
  className: 'bg-transparent',
  html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(59,130,246,1)] flex items-center justify-center animate-pulse"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10],
});

export default function Mapa({ ocorrencias = [], estacoes = [] }) {
  const [localidades, setLocalidades] = useState(null);
  const [bairros, setBairros] = useState(null);
  const [mostrarLocalidades, setMostrarLocalidades] = useState(false);
  const [mostrarBairros, setMostrarBairros] = useState(false);

  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });

    fetch('/geojson/localidades.geojson')
      .then(res => res.json())
      .then(data => setLocalidades(data))
      .catch(err => console.error("Erro geojson localidades:", err));

    fetch('/geojson/bairros.geojson')
      .then(res => res.json())
      .then(data => setBairros(data))
      .catch(err => console.error("Erro geojson bairros:", err));
  }, []);

  const posicaoEnquadrada = [-22.4647, -42.6533];

  const mostrarNomeNoMouse = (feature, layer) => {
    if (feature.properties && feature.properties.nome) {
      const nome = feature.properties.nome;
      layer.bindTooltip(nome, {
        permanent: false,
        direction: 'center',
        className: 'bg-white/90 backdrop-blur-sm border-none shadow-sm text-slate-700 font-bold text-[10px] uppercase tracking-wider'
      });
      
      layer.on({
        mouseover: (e) => {
          const l = e.target;
          l.setStyle({ fillOpacity: 0.3, weight: 2 });
        },
        mouseout: (e) => {
          const l = e.target;
          l.setStyle({ fillOpacity: 0.08, weight: 1.5 });
        }
      });
    }
  };

  return (
    <div className="relative w-full h-[450px] xl:h-[600px] z-0 rounded-xl overflow-hidden shadow-inner bg-slate-900">
      
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-200 flex flex-col gap-2">
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
      </div>

      <MapContainer boxZoom={false} center={posicaoEnquadrada} zoom={11} zoomControl={false} style={{ height: '100%', width: '100%', background: '#0f172a' }}>
        <ZoomControl position="bottomright" />
        <style>{`.leaflet-tile-container img { width: 256.5px !important; height: 256.5px !important; }`}</style>

        <LayersControl position="topright" collapsed={false}>
          <LayersControl.BaseLayer checked name="SatÃ©lite (Esri World Imagery)">
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

        {mostrarLocalidades && localidades && (
          <FeatureGroup>
            <GeoJSON
              data={localidades}
              style={{ color: '#1d4ed8', weight: 1.5, opacity: 0.9, fillOpacity: 0.08 }}
              onEachFeature={mostrarNomeNoMouse}
            />
          </FeatureGroup>
        )}

        {mostrarBairros && bairros && (
          <FeatureGroup>
            <GeoJSON
              data={bairros}
              style={{ color: '#10b981', weight: 2.5, opacity: 1, fillOpacity: 0.10 }}
              onEachFeature={mostrarNomeNoMouse}
            />
          </FeatureGroup>
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
                  <p className="text-[11px] text-slate-500 font-medium">ðŸ“ {oco.logradouro}{oco.numero ? `, ${oco.numero}` : ''} - {oco.bairro || oco.localidade}</p>
                )}
                <div className="w-full h-px bg-slate-200 my-1"></div>
                <span className="text-slate-600 text-xs italic">&quot;{oco.descricao}&quot;</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {estacoes.filter(est => est.latitude != null && est.longitude != null).map(est => (
          <Marker key={est.id} position={[est.latitude, est.longitude]} icon={iconeEstacao}>
            <Tooltip permanent direction="top" offset={[0, -10]} className="bg-white/90 backdrop-blur-sm border border-blue-200 text-blue-900 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
              {est.nome.split(' - ')[0] || est.nome}
            </Tooltip>
            <Popup className="rounded-xl">
              <strong className="text-blue-800 text-sm">EstaÃ§Ã£o: {est.nome}</strong><br/>
              <span className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mt-1 inline-block">Fonte de Dados: Oficial (Gov.br)</span><br/>
              <span className="text-slate-500 text-[10px] mt-1 block">SincronizaÃ§Ã£o em tempo real via telemetria.</span>
            </Popup>
          </Marker>
        ))}

        {/* CAMADA TOPOGRÃFICA DE RISCO - RIO MACACU (EstÃ©tica Melhorada) */}
        <Polygon 
          positions={[
            [-22.4215, -42.6050], [-22.4350, -42.6180], [-22.4500, -42.6300], [-22.4600, -42.6450], 
            [-22.4700, -42.6600], [-22.4850, -42.6700], [-22.5000, -42.6800], [-22.5400, -42.7000],
            [-22.5800, -42.7200], [-22.5900, -42.7000], [-22.5500, -42.6800], [-22.5100, -42.6600],
            [-22.4800, -42.6300], [-22.4600, -42.6150], [-22.4300, -42.5900]
          ]}
          pathOptions={{ stroke: false, fillColor: '#ef4444', fillOpacity: 0.3 }}
        >
          <Popup>
            <strong className="text-red-700">Mancha de InundaÃ§Ã£o HistÃ³rica (Rio Macacu)</strong><br/>
            <span className="text-xs font-bold text-slate-700 block mt-1">Fonte: Defesa Civil / CPRM</span>
            <span className="text-xs text-slate-600">Ãrea topogrÃ¡fica mapeada de alto risco de transbordamento.</span>
          </Popup>
        </Polygon>

        {/* CAMADA TOPOGRÃFICA DE RISCO - RIO GUAPIAÃ‡U (EstÃ©tica Melhorada) */}
        <Polygon 
          positions={[
            [-22.4000, -42.7200], [-22.4100, -42.7300], [-22.4200, -42.7400], [-22.4350, -42.7420], 
            [-22.4450, -42.7450], [-22.4600, -42.7550], [-22.4700, -42.7600], [-22.4800, -42.7680], 
            [-22.4900, -42.7750], [-22.4950, -42.7550], [-22.4800, -42.7450], [-22.4600, -42.7300], 
            [-22.4400, -42.7200], [-22.4100, -42.7100]
          ]}
          pathOptions={{ stroke: false, fillColor: '#f97316', fillOpacity: 0.25 }}
        >
          <Popup>
            <strong className="text-orange-700">Zona de Alagamento Rural (Rio GuapiaÃ§u)</strong><br/>
            <span className="text-xs font-bold text-slate-700 block mt-1">Fonte: INEA / ProduÃ§Ã£o Rural</span>
            <span className="text-xs text-slate-600">Ãrea de vale suscetÃ­vel a cheias rÃ¡pidas. HistÃ³rico de isolamento.</span>
          </Popup>
        </Polygon>

      </MapContainer>

      {/* LEGENDA E FONTES DE DADOS OFICIAIS (BOTTOM LEFT) */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-lg flex flex-col gap-2">
        <div className="text-[10px] text-slate-300 leading-tight flex flex-col gap-1">
          <span>
            <strong className="text-slate-400">FONTE DOS DADOS GEOGRÃFICOS:</strong> CIGEO - Centro Integrado de InformaÃ§Ãµes GeogrÃ¡ficas e <strong className="text-white">Geoprocessamento</strong>
          </span>
          <span className="text-[8px] text-slate-400">
            Secretaria de Planejamento, <strong className="text-slate-300">Geoprocessamento</strong> e HabitaÃ§Ã£o
          </span>
        </div>
        
        <div className="border-t border-slate-700 pt-2 mt-1">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">
            Bases Oficiais Sincronizadas (NASA/NOAA/CEMADEN)
          </div>
          <div className="flex items-center gap-3">
            <a href="http://www.cemaden.gov.br/" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-300 pointer-events-auto">
              ðŸ”— CEMADEN
            </a>
            <a href="https://www.gov.br/ana/pt-br" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-300 pointer-events-auto">
              ðŸ”— ANA
            </a>
            <a href="https://gpm.nasa.gov/" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-blue-400 hover:text-blue-300 pointer-events-auto">
              ðŸ”— NASA (GPM)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

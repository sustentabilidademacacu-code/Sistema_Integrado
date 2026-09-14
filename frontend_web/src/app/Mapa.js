"use client";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, LayersControl, FeatureGroup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const getIconByPriority = (priority) => {
  let color = 'bg-blue-500'; // Default
  if (priority === 'P1') color = 'bg-purple-700'; // CRÍTICA
  else if (priority === 'P2') color = 'bg-red-600'; // ALTA
  else if (priority === 'P4') color = 'bg-orange-500'; // MÉDIA
  else if (priority === 'P5') color = 'bg-yellow-400'; // BAIXA

  return new L.DivIcon({
    className: 'bg-transparent',
    html: `<div class="w-5 h-5 ${color} rounded-full border-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center animate-pulse">
             <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
           </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
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
  
  const [mostrarLocalidades, setMostrarLocalidades] = useState(true);
  const [mostrarBairros, setMostrarBairros] = useState(true);

  useEffect(() => {
    fetch('/geojson/localidades.geojson')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setLocalidades(data); })
      .catch(() => console.log("Aviso: localidades.geojson não carregou."));
      
    fetch('/geojson/bairros.geojson')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setBairros(data); })
      .catch(() => console.log("Aviso: bairros.geojson não carregou."));
  }, []);

  const mostrarNomeNoMouse = (feature, layer) => {
    const props = feature?.properties ?? {};
    const nome = props.nome_localidade ?? props.NOME ?? props.nome ?? props.Name ?? props.name ?? props.BAIRRO ?? props.bairro ?? props.localidade ?? props.LOCALIDADE ?? null;

    if (nome) {
      layer.bindTooltip(nome, {
        permanent: false,
        direction: 'center',
        className: 'bg-slate-900/90 text-white border-0 font-bold px-3 py-1 rounded-lg text-xs tracking-wider shadow-lg'
      });
    }
  };

  const posicaoEnquadrada = [-22.5050, -42.7300];

  return (
    <div className="relative w-full mb-6 rounded-2xl overflow-hidden shadow-lg border border-slate-700">
      
      {/* CARD DE LIGAR/DESLIGAR ÁREAS */}
      <div className="absolute top-4 left-4 z-[1000] bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-700 pb-2">Ligar / Desligar Áreas</h4>
        
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={mostrarLocalidades}
              onChange={(e) => setMostrarLocalidades(e.target.checked)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Localidades</span>
            <div className="w-4 h-1 bg-blue-500 rounded-full ml-auto"></div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={mostrarBairros}
              onChange={(e) => setMostrarBairros(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
            <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Bairros</span>
            <div className="w-4 h-1 bg-emerald-500 border border-emerald-300 border-dashed rounded-full ml-auto"></div>
          </label>
        </div>
      </div>

      <MapContainer 
        center={posicaoEnquadrada} 
        zoom={11} 
        zoomControl={false} 
        className="w-full h-[550px] z-0" 
        style={{ backgroundColor: '#0f172a' }}
      >
        <ZoomControl position="bottomright" />
        <style>{`.leaflet-tile-container img { width: 256.5px !important; height: 256.5px !important; }`}</style>

        <LayersControl position="topright" collapsed={false}>
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

          {mostrarLocalidades && localidades && (
            <LayersControl.Overlay checked name="Contorno: Localidades">
              <FeatureGroup>
                <GeoJSON 
                  data={localidades} 
                  style={{ color: '#1d4ed8', weight: 1.5, opacity: 0.9, fillOpacity: 0.08 }}
                  onEachFeature={mostrarNomeNoMouse}
                />
              </FeatureGroup>
            </LayersControl.Overlay>
          )}

          {mostrarBairros && bairros && (
            <LayersControl.Overlay checked name="Contorno: Bairros">
              <FeatureGroup>
                <GeoJSON 
                  data={bairros} 
                  style={{ color: '#10b981', weight: 2.5, opacity: 1, fillOpacity: 0.10 }}
                  onEachFeature={mostrarNomeNoMouse}
                />
              </FeatureGroup>
            </LayersControl.Overlay>
          )}
        </LayersControl>

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
                <span className="text-slate-600 text-xs italic">"{oco.descricao}"</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {estacoes.filter(est => est.latitude != null && est.longitude != null).map(est => (
          <Marker key={est.id} position={[est.latitude, est.longitude]} icon={iconeEstacao}>
            <Popup className="rounded-xl">
              <strong className="text-blue-800 text-sm">Estação: {est.nome}</strong><br/>
              <span className="text-blue-600 text-xs">Status: Ativa</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ATRIBUIÇÃO DOS DADOS GEOGRÁFICOS SOBRE O MAPA */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-slate-900/80 backdrop-blur-md border border-slate-700 p-2.5 rounded-lg shadow-lg pointer-events-none">
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
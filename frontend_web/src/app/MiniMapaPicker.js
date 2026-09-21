"use client";
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Conserta o ícone padrão do Leaflet no Next.js
const iconeLocal = new L.DivIcon({
  className: 'bg-transparent',
  html: `<div class="w-5 h-5 bg-red-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(239,68,68,1)] flex items-center justify-center animate-bounce">
           <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
         </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Detecta o clique no mapa
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Controla a câmera do mapa (faz o mapa "voar" para o endereço pesquisado)
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function MiniMapaPicker({ onLocationSelected, initialLat, initialLng }) {
  const [markerPos, setMarkerPos] = useState(null);

  // Sincroniza caso a barra de endereço jogue novas coordenadas para cá
  useEffect(() => {
    if (initialLat && initialLng) {
      queueMicrotask(() => {
        setMarkerPos([parseFloat(initialLat), parseFloat(initialLng)]);
      });
    }
  }, [initialLat, initialLng]);
  
  // Cachoeiras de Macacu aprox
  const defaultCenter = [-22.464, -42.654]; 
  const currentCenter = markerPos || defaultCenter;

  const handleSelect = (lat, lng) => {
    setMarkerPos([lat, lng]);
    onLocationSelected(lat, lng);
  };

  return (
    <div className="h-[280px] w-full rounded-xl overflow-hidden border-2 border-slate-300 relative z-0 shadow-inner">
      <MapContainer center={currentCenter} zoom={14} className="h-full w-full cursor-crosshair">
        {/* Satélite (Esri World Imagery) */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <MapClickHandler onLocationSelect={handleSelect} />
        <MapController center={currentCenter} />
        {markerPos && <Marker position={markerPos} icon={iconeLocal} />}
      </MapContainer>
      
    </div>
  );
}

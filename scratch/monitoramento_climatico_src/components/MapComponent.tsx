import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Station } from '../data/stations';
import type { StationMapData } from '../data/common';
import { CACHOEIRAS_BOUNDARY } from '../data/boundary';

interface MapComponentProps {
  stations: Station[];
  onSelectStation: (id: number) => void;
  stationData?: Record<number, StationMapData>;
  isLoading?: boolean;
}

export const MapComponent: React.FC<MapComponentProps> = ({ stations, onSelectStation, stationData, isLoading }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<number, L.Marker>>({});

  const [activeSidebarId, setActiveSidebarId] = useState<number | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(11);

  const formatRegionName = (name: string) => {
    const cleanName = name.trim();
    if (cleanName === 'Sede') return 'Sede';
    if (cleanName === 'Interior - 1') return 'Interior 1';
    if (cleanName === 'Interior - 2') return 'Interior 2';
    if (cleanName.startsWith('Interior')) return cleanName;
    if (cleanName === 'Serra') return 'Serra';
    if (cleanName === 'Farao' || cleanName === 'Faraó') return 'Faraó e localidades próximas';
    return `${cleanName} e localidades próximas`;
  };



  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  };

  const sortedStations = [...stations]
    .sort((a, b) => a.nome.localeCompare(b.nome));

  // Initial map bounds setup happens on mount

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize the Leaflet map
    const map = L.map(mapContainerRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
      zoomSnap: 0.1,
    });
    mapRef.current = map;

    map.on('click', () => {
      map.scrollWheelZoom.enable();
    });

    map.on('zoomend', () => {
      setMapZoom(map.getZoom());
    });
    setMapZoom(map.getZoom()); // Initial

    // ESRI World Light Gray - visual super simples e limpo, gratuito, sem API key
    const lightLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16,
    });

    // ESRI Dark Gray Canvas - modo escuro elegante
    const darkLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16, // ESRI Dark Canvas só vai até zoom 16
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19,
    });

    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    });

    // Add default layer
    lightLayer.addTo(map);

    const baseMaps = {
      "🗺️ Moderno (Padrão)": lightLayer,
      "🌙 Dark": darkLayer,
      "🛰️ Satélite": satelliteLayer,
      "🛣️ OpenStreetMap": streetLayer
    };

    L.control.layers(baseMaps, undefined, { position: 'topright' }).addTo(map);

    L.geoJSON(CACHOEIRAS_BOUNDARY, {
      style: {
        color: '#022888',
        weight: 2,
        dashArray: '5, 5',
        fillColor: '#022888',
        fillOpacity: 0.02,
        interactive: false,
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.Name;

        if (typeof name === 'string' && name.trim()) {
          const displayName = formatRegionName(name);
          const labelPositions: Record<string, L.LatLngTuple> = {
            'Interior 2': [-22.44, -42.73],
            Sede: [-22.495, -42.6708],
          };

          L.tooltip({
            permanent: true,
            direction: 'center',
            className: 'area-map-label',
            interactive: false,
          })
            .setLatLng(labelPositions[displayName] ?? (layer as L.Polygon).getBounds().getCenter())
            .setContent(displayName)
            .addTo(map);
        }
      },
    }).addTo(map);

    // Initial bounds setup
    const boundaryLayer = L.geoJSON(CACHOEIRAS_BOUNDARY as any);
    map.fitBounds(boundaryLayer.getBounds(), { padding: [5, 5] });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = {};
    };
  }, []); // Run only once

  // Redraw markers when data or zoom changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    const showCards = mapZoom > 14;

    const generateCardHtml = (station: Station, data: any, color: string, irif: any, computedRegion: string) => {
      const tempRaw = data?.raw?.temp;
      const urRaw = data?.raw?.ur;
      const uvRaw = data?.raw?.uv;
      const ventoRaw = data?.raw?.vento;
      const t = tempRaw != null ? tempRaw + '°C' : null;
      const u = urRaw != null ? urRaw + '%' : null;
      const uv = uvRaw != null ? uvRaw : null;
      const v = ventoRaw != null ? ventoRaw + ' km/h' : null;

      const hasClimate = t || u || v;

      let updateText = '';
      if (data?.raw?.updatedAt) {
        const d = new Date(data.raw.updatedAt);
        if (!isNaN(d.getTime())) {
          const formatted = d.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });
          updateText = `<div style="font-size: 0.63rem; color: #94a3b8; font-family: var(--mono); text-align: left; margin-top: 4px;">🕒 Leitura: ${formatted}</div>`;
        }
      }

      const climateRow = hasClimate ? `
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; margin-bottom: 2px;">
          ${t ? `<span style="background:#f0f4ff; color:#022888; border-radius:6px; padding:3px 8px; font-size:0.75rem; font-weight:700;">🌡️ Temp: ${t}</span>` : ''}
          ${u ? `<span style="background:#f0faff; color:#0369a1; border-radius:6px; padding:3px 8px; font-size:0.75rem; font-weight:700;">💧 Umidade: ${u}</span>` : ''}
          ${v ? `<span style="background:#f0fff4; color:#166534; border-radius:6px; padding:3px 8px; font-size:0.75rem; font-weight:700;">💨 Vento: ${v}</span>` : ''}
          ${uv ? `<span style="background:#fffbeb; color:#92400e; border-radius:6px; padding:3px 8px; font-size:0.75rem; font-weight:700;">☀️ UV: ${uv}</span>` : ''}
        </div>
      ` : '';

      return `
        <div class="weather-meteo-card" data-id="${station.id}" style="border-left: 4px solid ${color}; width: 260px;">
          <div class="wmc-header">
            <div class="wmc-title">${station.nome}</div>
            ${irif ? `<div class="wmc-irif-badge" style="background: ${color};">${irif.level.code}</div>` : ''}
          </div>
          <div style="font-size: 0.72rem; color: #64748b; font-family: var(--body); margin-top: 4px; display: flex; flex-direction: column; gap: 2px;">
            ${computedRegion ? `<span>📍 Localidade: <strong>${computedRegion}</strong></span>` : ''}
            ${station.bairro ? `<span>📍 Bairro: <strong>${station.bairro}</strong></span>` : ''}
          </div>
          ${climateRow}
          ${updateText}
          <div style="padding-top: 8px; border-top: 1px solid #e2e8f0; text-align: center; margin-top: 6px;">
            <button class="wmc-access-btn" style="background: transparent; border: none; color: #022888; font-weight: 700; font-size: 0.85rem; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 4px 0; font-family: inherit;">
              Acessar Monitoramento 
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
      `;
    };

    stations.forEach((station) => {
      if (station.lat && station.lon) {
        const coords: L.LatLngTuple = [station.lat, station.lon];

        if (!isLoading) {
          const data = stationData?.[station.id];
          const irif = data?.irif;
          const color = irif ? irif.level.color : '#022888';



          let iconHtml = '';
          const showMini = mapZoom > 12 && !showCards;

          if (showCards) {
            // Zoom alto (>14): Card completo com dados climáticos
            iconHtml = generateCardHtml(station, data, color, irif, station.regiao || '');
          } else if (showMini) {
            // Zoom médio (12-14): Mini-badge compacto com temp e IRIF
            const tempRaw = data?.raw?.temp;
            const t = tempRaw != null ? `${tempRaw}°C` : '';
            const irifCode = irif ? irif.level.code : '';
            iconHtml = `
              <div style="
                background: white;
                border-left: 3px solid ${color};
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.18);
                padding: 5px 9px;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 2px;
                cursor: pointer;
                min-width: 90px;
              " data-id="${station.id}">
                <div style="font-family: var(--display); font-size: 0.7rem; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;">${station.nome.replace(/^E\. [ME]\. /, '').replace(/^E\. E\. M\. /, '')}</div>
                <div style="display: flex; gap: 5px; align-items: center;">
                  ${t ? `<span style="font-size: 0.72rem; font-weight: 700; color: #022888;">🌡️ Temp: ${t}</span>` : ''}
                  ${irifCode ? `<span style="background: ${color}; color: #fff; font-size: 0.6rem; font-weight: 800; padding: 1px 5px; border-radius: 4px;">${irifCode}</span>` : ''}
                </div>
              </div>
            `;
          } else {
            // Original Pulse view
            iconHtml = `
              <div class="pulse-marker-container" data-id="${station.id}">
                <div class="pulse-ring" style="background-color: rgba(${hexToRgb(color)}, 0.85);"></div>
                <div class="weather-marker-pin">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="26" height="26">
                    <circle cx="18" cy="18" r="16" fill="${color}" stroke="#ffffff" stroke-width="2" />
                    <line x1="18" y1="8" x2="18" y2="28" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
                    <circle cx="24" cy="12" r="2.5" fill="#ffffff" />
                    <line x1="12" y1="12" x2="24" y2="12" stroke="#ffffff" stroke-width="1.8" />
                    <circle cx="18" cy="24" r="3.5" fill="${irif ? '#ffffff' : '#ef4444'}" stroke="${color}" stroke-width="1" />
                  </svg>
                </div>
              </div>
            `;
          }

          const weatherIcon = L.divIcon({
            className: showCards ? 'custom-meteo-icon-container' : (showMini ? 'custom-mini-icon-container' : 'custom-weather-icon-container'),
            html: iconHtml,
            iconSize: showCards ? [220, 80] : (showMini ? [120, 44] : [40, 40]),
            iconAnchor: showCards ? [110, 80] : (showMini ? [60, 44] : [20, 20]),
          });

          const marker = L.marker(coords, { icon: weatherIcon, zIndexOffset: showCards ? 1000 : (showMini ? 500 : 0) }).addTo(map);
          markersRef.current[station.id] = marker;

          // Event listeners depending on card state
          if (showCards || showMini) {
            marker.on('click', () => {
              onSelectStation(station.id);
            });
          } else {
            marker.bindTooltip(station.nome, {
              direction: 'top',
              className: 'school-map-tooltip',
              offset: L.point(0, -14),
            });

            const popupContainer = document.createElement('div');
            popupContainer.innerHTML = generateCardHtml(station, data, color, irif, station.regiao || '');

            const btn = popupContainer.querySelector('.wmc-access-btn');
            if (btn) {
              (btn as HTMLButtonElement).onclick = (e) => {
                e.preventDefault();
                onSelectStation(station.id);
              };
            }

            marker.bindPopup(popupContainer, {
              maxWidth: 280,
              minWidth: 260,
              className: 'custom-map-popup-container',
            });

            marker.on('popupopen', () => {
              setActiveSidebarId(station.id);
              const itemEl = document.getElementById(`sidebar-item-${station.id}`);
              if (itemEl) {
                itemEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            });

            marker.on('popupclose', () => {
              setActiveSidebarId(null);
            });
          }
        }
      }
    });

  }, [stations, stationData, isLoading, mapZoom, onSelectStation]);

  const handleSidebarItemClick = (station: Station) => {
    const map = mapRef.current;
    if (map) {
      map.flyTo([station.lat, station.lon], 15, { duration: 1.5 });
      const marker = markersRef.current[station.id];
      if (marker) {
        if (mapZoom <= 12) {
          // Wait for flyTo to finish before opening popup if needed, or just open it
          setTimeout(() => {
            if (markersRef.current[station.id]) {
              markersRef.current[station.id].openPopup();
            }
          }, 1500);
        }
      }
      setActiveSidebarId(station.id);
    }
  };

  return (
    <div className="map-container-layout">
      <div className="map-sidebar">
        <div className="sidebar-list">
          {sortedStations.map((station) => (
            <div
              key={station.id}
              className={`sidebar-item ${activeSidebarId === station.id ? 'active' : ''}`}
              id={`sidebar-item-${station.id}`}
              onClick={() => handleSidebarItemClick(station)}
            >
              <div className="sidebar-item-title">{station.nome}</div>
              <div className="sidebar-item-sub">Estação: {station.session}</div>
            </div>
          ))}
        </div>
      </div>
      <div id="map" ref={mapContainerRef} style={{ height: '100%', minHeight: '380px' }} />
    </div>
  );
};

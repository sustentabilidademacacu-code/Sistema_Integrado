"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function RadarPage() {
  const [overlay, setOverlay] = useState('wind'); // 'wind', 'rain', 'temp', 'clouds'

  const CACHOEIRAS_LAT = -22.4628;
  const CACHOEIRAS_LON = -42.6528;
  const ZOOM = 10;

  const iframeSrc = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=%C2%B0C&metricWind=km/h&zoom=${ZOOM}&overlay=${overlay}&product=ecmwf&level=surface&lat=${CACHOEIRAS_LAT}&lon=${CACHOEIRAS_LON}&message=true`;

  const mapTypes = [
    { id: 'wind', name: '💨 Ventos', desc: 'Correntes de ar e rajadas' },
    { id: 'rain', name: '🌧️ Chuva & Raios', desc: 'Precipitação em tempo real' },
    { id: 'temp', name: '🌡️ Temperatura', desc: 'Mapa de calor de superfície' },
    { id: 'clouds', name: '☁️ Nuvens', desc: 'Nebulosidade e tempestades' }
  ];

  return (
    <div className="flex flex-col h-full bg-[#020b1a] text-slate-200">
      <header className="flex-none p-6 border-b border-[#133570] flex items-center justify-between bg-gradient-to-r from-[#03132e] to-[#0a234f]">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            📡 Centro de Inteligência: Radar Climático (Ao Vivo)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Visualização meteorológica em tempo real (Modelo ECMWF/Global). Fonte de referência oficial.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-500/50">
            ● CONEXÃO ATIVA
          </span>
          <Link href="/operacional">
            <button className="px-4 py-2 bg-[#133570] hover:bg-[#1e4896] text-white rounded-lg text-sm font-bold transition-all shadow-md">
              ← Voltar ao Painel
            </button>
          </Link>
        </div>
      </header>

      <div className="flex-none p-4 bg-[#03132e] border-b border-[#133570]">
        <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
          Selecione a Camada de Monitoramento:
        </div>
        <div className="flex flex-wrap gap-4">
          {mapTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setOverlay(type.id)}
              className={`flex flex-col items-start px-5 py-3 rounded-xl border-2 transition-all ${
                overlay === type.id 
                  ? 'bg-blue-900/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                  : 'bg-[#0a234f] border-[#133570] hover:border-blue-400/50 hover:bg-[#133570]'
              }`}
            >
              <span className={`font-black text-base ${overlay === type.id ? 'text-white' : 'text-slate-300'}`}>
                {type.name}
              </span>
              <span className="text-xs text-slate-400 mt-1">{type.desc}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            <strong className="text-amber-400">Diretriz da Defesa Civil:</strong> Estes dados de modelo numérico são fornecidos para fins de <strong>observação e antecipação visual</strong>. Nenhuma plataforma externa dispara alertas automáticos no município. A decretação de alertas e mudança do nível de criticidade <strong>parte exclusivamente da avaliação técnica humana</strong> dos operadores da Sala de Situação e Defesa Civil Municipal.
          </p>
        </div>
      </div>

      <div className="flex-1 relative w-full h-full bg-[#0a192f]">
        {/* Usamos iframe do Windy pois ele renderiza as camadas incrivelmente bem */}
        <iframe
          width="100%"
          height="100%"
          src={iframeSrc}
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          title="Radar Climático"
        ></iframe>
      </div>
    </div>
  );
}

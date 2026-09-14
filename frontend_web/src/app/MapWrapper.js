"use client";
import dynamic from 'next/dynamic';

const MapaInterativo = dynamic(() => import('./Mapa'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center mb-10 shadow-2xl">
      <h3 className="text-3xl font-bold text-slate-300">Carregando Módulo Geográfico...</h3>
    </div>
  )
});

// Agora repassamos também as estacoes!
export default function MapWrapper({ ocorrencias, estacoes }) {
  return <MapaInterativo ocorrencias={ocorrencias} estacoes={estacoes} />;
}
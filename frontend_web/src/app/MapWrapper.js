"use client";
import dynamic from 'next/dynamic';

const MapaInterativo = dynamic(() => import('./Mapa'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] bg-[#0a234f] rounded-xl animate-pulse flex items-center justify-center border border-[#133570]">
      <span className="text-slate-500 font-bold">Carregando mapa topográfico...</span>
    </div>
  )
});

export default function MapWrapper(props) {
  return <MapaInterativo {...props} />;
}

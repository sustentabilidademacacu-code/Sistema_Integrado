import MapWrapper from '../MapWrapper';
import Link from 'next/link';

export default function MapaCompleto() {
  return (
    <main className="w-full h-screen bg-[#0a234f] overflow-hidden relative">
      <MapWrapper fullScreen={true} />
      
      {/* Botão flutuante para voltar ao painel */}
      <Link 
        href="/admin" 
        className="absolute top-6 right-6 z-[2000] bg-[#1e4896]/90 hover:bg-blue-600 backdrop-blur-md text-white shadow-2xl px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 border border-white/20 hover:scale-105"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Voltar ao Painel
      </Link>
    </main>
  );
}

"use client";
import { useEffect, useState, useRef } from 'react';
import { loadState, computeIRIF } from '@/data/irif';

export default function StationDashboard({ station, onBack }) {
  const iframeUrl = station ? `https://hexacloud.com.br/dashboard/?session=${station.session}` : '';
  const [showIframeFallback, setShowIframeFallback] = useState(false);
  const iframeLoadedRef = useRef(false);

  useEffect(() => {
    if (!station) return;
    iframeLoadedRef.current = false;
    
    const resetTimer = setTimeout(() => {
      setShowIframeFallback(false);
    }, 0);

    const timer = setTimeout(() => {
      if (!iframeLoadedRef.current) {
        setShowIframeFallback(true);
      }
    }, 3500);

    return () => {
      clearTimeout(resetTimer);
      clearTimeout(timer);
    };
  }, [station]);

  if (!station) return null;

  const handleIframeLoad = () => {
    iframeLoadedRef.current = true;
    setShowIframeFallback(false);
  };

  const hasClimate = station.raw.temp != null || station.raw.ur != null || station.raw.vento != null;

  return (
    <div className="w-full h-full flex flex-col bg-[#0a234f] text-slate-300 rounded-xl overflow-hidden border border-[#133570] shadow-2xl relative">
      <div className="p-4 border-b border-[#133570] bg-[#03132e]/80 backdrop-blur flex justify-between items-center z-10 relative">
        <div>
          <h2 className="text-xl font-black text-white">{station.nome}</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{station.regiao} • {station.bairro || 'Zona Rural'}</p>
        </div>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-[#133570] hover:bg-blue-600 text-white text-sm font-bold rounded-lg shadow transition-colors"
        >
          ← Voltar ao Mapa
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PAINEL DE RISCO IRIF */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-[#03132e] border border-[#133570] rounded-xl p-5 shadow-lg relative overflow-hidden">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
                Índice de Risco (IRIF)
              </h3>
              {station.irif ? (
                <>
                  <div className="flex items-end gap-3 mb-2">
                    <span className="text-4xl font-black" style={{ color: station.irif.level.color }}>
                      {Math.round(station.irif.irif)}
                    </span>
                    <span className="text-sm font-bold text-slate-400 mb-1">/ 100</span>
                  </div>
                  <div className="text-sm font-bold px-3 py-1 rounded-full w-max text-white mb-4" style={{ backgroundColor: station.irif.level.color }}>
                    Nível {station.irif.level.code}: {station.irif.level.label}
                  </div>
                  <p className="text-xs text-slate-400 italic">
                    {station.irif.level.desc}
                  </p>
                  
                  <div className="mt-6 border-t border-[#133570] pt-4">
                    <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Fatores de Risco:</div>
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between"><span>Condições Climáticas (FC)</span> <span className="font-bold text-slate-300">{Math.round(station.irif.fc)}</span></div>
                      <div className="flex justify-between"><span>Fisiografia (FF)</span> <span className="font-bold text-slate-300">{Math.round(station.irif.ff)}</span></div>
                      <div className="flex justify-between"><span>Vegetação (FV)</span> <span className="font-bold text-slate-300">{Math.round(station.irif.weighted.fv / station.irif.weights.fv)}</span></div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-500 italic">
                  Dados insuficientes para calcular o IRIF. Aguardando sensores.
                </div>
              )}
            </div>

            {hasClimate && (
              <div className="bg-[#03132e] border border-[#133570] rounded-xl p-5 shadow-lg">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
                  Sensores Tempo Real
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {station.raw.temp != null && (
                    <div className="bg-[#0a234f] rounded p-2 text-center border border-[#133570]/50">
                      <div className="text-[10px] text-slate-400 uppercase">Temp</div>
                      <div className="text-lg font-black text-white">{station.raw.temp}°C</div>
                    </div>
                  )}
                  {station.raw.ur != null && (
                    <div className="bg-[#0a234f] rounded p-2 text-center border border-[#133570]/50">
                      <div className="text-[10px] text-slate-400 uppercase">Umidade</div>
                      <div className="text-lg font-black text-[#0ea5e9]">{station.raw.ur}%</div>
                    </div>
                  )}
                  {station.raw.vento != null && (
                    <div className="bg-[#0a234f] rounded p-2 text-center border border-[#133570]/50">
                      <div className="text-[10px] text-slate-400 uppercase">Vento</div>
                      <div className="text-lg font-black text-[#10b981]">{station.raw.vento}km/h</div>
                    </div>
                  )}
                  {station.raw.uv != null && (
                    <div className="bg-[#0a234f] rounded p-2 text-center border border-[#133570]/50">
                      <div className="text-[10px] text-slate-400 uppercase">Índice UV</div>
                      <div className="text-lg font-black text-[#f59e0b]">{station.raw.uv}</div>
                    </div>
                  )}
                </div>
                {station.raw.updatedAt && (
                  <div className="text-[9px] text-slate-500 mt-4 text-center">
                    Atualizado em: {new Date(station.raw.updatedAt).toLocaleString('pt-BR')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PAINEL HEXACLOUD IFRAME */}
          <div className="lg:col-span-2 h-[500px] lg:h-[650px] bg-white rounded-xl border border-slate-300 shadow-inner overflow-hidden relative group">
            {showIframeFallback && (
              <div className="absolute inset-0 bg-slate-50 z-10 flex flex-col items-center justify-center p-8 text-center">
                <span className="text-4xl mb-4">📡</span>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Conectando ao Painel HexaCloud...</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  Se o painel demorar a carregar, pode haver um atraso na conexão direta com o servidor de telemetria da estação.
                </p>
                <a 
                  href={iframeUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow transition-colors"
                >
                  Abrir Painel em Nova Aba
                </a>
              </div>
            )}
            
            {iframeUrl && (
              <iframe 
                src={iframeUrl} 
                onLoad={handleIframeLoad}
                className="w-full h-full border-none absolute inset-0 z-0 bg-slate-50"
                title={`Dashboard HexaCloud ${station.nome}`}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState, useRef } from 'react';
import { loadState, computeIRIF } from '@/data/irif';

export default function StationDashboard({ station, onBack }) {
  if (!station) return null;

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

      <div className="flex-1 overflow-y-auto p-6 relative flex justify-center items-start pt-12">
        <div className="w-full max-w-md">
          {/* PAINEL DE RISCO IRIF */}
          <div className="bg-[#03132e] border border-[#133570] rounded-xl p-8 shadow-2xl relative overflow-hidden">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">
              Índice de Risco (IRIF)
            </h3>
            {station.irif ? (
              <>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-5xl font-black" style={{ color: station.irif.level.color }}>
                    {Math.round(station.irif.irif)}
                  </span>
                  <span className="text-base font-bold text-slate-400 mb-1">/ 100</span>
                </div>
                <div className="text-base font-bold px-4 py-1.5 rounded-full w-max text-white mb-5 shadow-md" style={{ backgroundColor: station.irif.level.color }}>
                  Nível {station.irif.level.code}: {station.irif.level.label}
                </div>
                <p className="text-sm text-slate-300 italic">
                  {station.irif.level.desc}
                </p>
                
                <div className="mt-8 border-t border-[#133570] pt-6">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-4">Composição do Risco:</div>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between items-center bg-[#0a234f] p-2 rounded">
                      <span className="text-slate-300">Condições Climáticas (FC)</span> 
                      <span className="font-black text-white">{Math.round(station.irif.fc)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#0a234f] p-2 rounded">
                      <span className="text-slate-300">Fisiografia (FF)</span> 
                      <span className="font-black text-white">{Math.round(station.irif.ff)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#0a234f] p-2 rounded">
                      <span className="text-slate-300">Vegetação (FV)</span> 
                      <span className="font-black text-white">{Math.round(station.irif.weighted.fv / station.irif.weights.fv)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500 italic p-4 text-center">
                Dados insuficientes para calcular o IRIF no momento.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

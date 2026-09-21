'use client';
import { useEffect, useState } from 'react';
import MapWrapper from '../MapWrapper';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { STATIONS } from '@/data/stations';
import { loadState, computeIRIF } from '@/data/irif';

export default function MapaCompleto() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [estacoes, setEstacoes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resOco, resEst, resSec, resIrif] = await Promise.all([
          supabase.from('ocorrencias').select('*'),
          supabase.from('mapa_atual').select('*'),
          supabase.from('secretarias').select('*'),
          supabase.from('leituras_clima_irif').select('*')
        ]);

        const secList = resSec.data || [];

        if (resOco.data) {
          const filtered = resOco.data
            .filter(oco => oco.status !== 'Concluido')
            .map(oco => {
              const sec = secList.find(s => String(s.id) === String(oco.secretaria_id));
              return {
                ...oco,
                nome_secretaria: sec?.nome || 'Secretaria',
                cor_secretaria: sec?.cor_identidade || '#64748b'
              };
            });
          setOcorrencias(filtered);
        }

        if (resEst.data || resIrif.data) {
          const irifData = resIrif.data || [];
          const realTimeData = resEst.data || [];
          
          const estacoesFormatadas = STATIONS.map(st => {
            const irifRow = irifData.find(d => d.session === st.session);
            const realTimeRow = realTimeData.find(d => d.session === st.session);
            
            let state = loadState(st);
            if (irifRow) {
              state = {
                ...state,
                temp: irifRow.temperatura_c != null ? irifRow.temp_score : null,
                ur: irifRow.umidade_pct != null ? irifRow.ur_score : null,
                vento: irifRow.vento_kmh != null ? irifRow.vento_score : null,
                dias: irifRow.dias_score,
              };
            }
            const irif = computeIRIF(state, st);
            return {
              ...st,
              irif,
              raw: {
                temp: realTimeRow?.temperatura_c ?? irifRow?.temperatura_c ?? null,
                ur: realTimeRow?.umidade_pct ?? irifRow?.umidade_pct ?? null,
                vento: realTimeRow?.vento_kmh ?? irifRow?.vento_kmh ?? null,
                uv: realTimeRow?.uv ?? irifRow?.uv ?? null,
                updatedAt: realTimeRow?.leitura_sensor_data ?? realTimeRow?.atualizado_em ?? irifRow?.leitura_sensor_data ?? null,
              }
            };
          });
          setEstacoes(estacoesFormatadas);
        }
      } catch (e) {
        console.error("Erro ao puxar dados no modo tela cheia:", e);
      }
    };

    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 60000); // Atualiza a tela cheia automaticamente a cada 1 minuto
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="w-full h-screen bg-[#0a234f] overflow-hidden relative">
      <MapWrapper fullScreen={true} ocorrencias={ocorrencias} estacoes={estacoes} />
      
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

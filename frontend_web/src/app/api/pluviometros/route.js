import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { STATIONS } from '@/data/stations';

function generateTimeSeries(pluviometro) {
  if (!pluviometro || !Array.isArray(pluviometro)) {
    return { series24h: [], series7d: [], total24h: 0, total7d: 0 };
  }

  const nowMs = Date.now();
  const tz = 'America/Sao_Paulo';
  
  const getLabel24 = (ts) => new Intl.DateTimeFormat('pt-BR', { timeZone: tz, hour: '2-digit' }).format(new Date(ts)) + 'h';
  const getLabel7d = (ts) => {
    const f = new Intl.DateTimeFormat('pt-BR', { timeZone: tz, day: '2-digit', month: '2-digit' }).formatToParts(new Date(ts));
    return f.find(x => x.type === 'day').value + '/' + f.find(x => x.type === 'month').value;
  };

  const series24hMap = new Map();
  const series7dMap = new Map();
  const series24hList = [];
  const series7dList = [];

  for (let i = 23; i >= 0; i--) {
    const ts = nowMs - i * 3600 * 1000;
    const label = getLabel24(ts);
    // Para evitar duplicados na lista ordenada, só adiciona se não existir
    if (!series24hMap.has(label)) {
      series24hMap.set(label, { label, rain: 0 });
      series24hList.push(label);
    }
  }

  for (let i = 6; i >= 0; i--) {
    const ts = nowMs - i * 86400 * 1000;
    const label = getLabel7d(ts);
    if (!series7dMap.has(label)) {
      series7dMap.set(label, { label, rain: 0 });
      series7dList.push(label);
    }
  }

  let total24h = 0;
  let total7d = 0;
  const threshold24h = nowMs - 24 * 3600 * 1000;
  const threshold7d = nowMs - 7 * 86400 * 1000;

  for (const leitura of pluviometro) {
    if (!leitura.timestamp || typeof leitura.data !== 'number' || leitura.data <= 0) continue;
    
    if (leitura.timestamp >= threshold24h) {
      total24h += leitura.data;
      const label = getLabel24(leitura.timestamp);
      if (series24hMap.has(label)) {
        series24hMap.get(label).rain += leitura.data;
      }
    }

    if (leitura.timestamp >= threshold7d) {
      total7d += leitura.data;
      const label = getLabel7d(leitura.timestamp);
      if (series7dMap.has(label)) {
        series7dMap.get(label).rain += leitura.data;
      }
    }
  }

  const series24h = series24hList.map(label => ({
    label,
    rain: Number(series24hMap.get(label).rain.toFixed(2))
  }));

  const series7d = series7dList.map(label => ({
    label,
    rain: Number(series7dMap.get(label).rain.toFixed(2))
  }));

  return { 
    series24h, 
    series7d, 
    total24h: Number(total24h.toFixed(2)), 
    total7d: Number(total7d.toFixed(2)) 
  };
}

export const revalidate = 0; // Disable cache

export async function GET() {
  try {
    const results = await Promise.all(
      STATIONS.filter(st => !st.hideFromList).map(async (st) => {
        const { data, error } = await supabase
          .from('leituras_clima_historico_irif')
          .select('payload')
          .eq('session', st.session)
          .order('created_at', { ascending: false })
          .limit(1);

        const row = data && data.length > 0 ? data[0] : null;
        let series = { series24h: [], series7d: [], total24h: 0, total7d: 0 };
        let lastUpdated = null;

        if (row && row.payload && row.payload.result && row.payload.result.Pluviometro) {
           const pluvio = row.payload.result.Pluviometro;
           series = generateTimeSeries(pluvio);
           
           if (pluvio.length > 0) {
             lastUpdated = pluvio[pluvio.length - 1].timestamp;
           }
        }

        return {
           id: st.id,
           nome: st.nome,
           session: st.session,
           bairro: st.bairro || 'Zona Rural',
           localidade: st.regiao,
           lat: st.lat,
           lon: st.lon,
           ...series,
           lastUpdated
        };
      })
    );
    
    return NextResponse.json({ success: true, data: results });
  } catch (err) {
    console.error("Erro na API pluviometros:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

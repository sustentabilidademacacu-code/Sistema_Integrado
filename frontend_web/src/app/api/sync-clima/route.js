import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { STATIONS } from '@/data/stations';

function scoreTemp(tempC) {
  if (tempC <= 25) return 0;
  if (tempC <= 30) return 33;
  if (tempC <= 35) return 67;
  return 100;
}
function scoreUmidade(urPct) {
  if (urPct >= 70) return 0;
  if (urPct >= 60) return 25;
  if (urPct >= 50) return 50;
  if (urPct >= 40) return 75;
  return 100;
}
function scoreVento(kmh) {
  if (kmh <= 10) return 0;
  if (kmh <= 20) return 33;
  if (kmh <= 30) return 67;
  return 100;
}
function scoreDiasSemChuva(dias) {
  if (dias <= 3) return 0;
  if (dias <= 7) return 25;
  if (dias <= 14) return 50;
  if (dias <= 21) return 75;
  return 100;
}

async function fetchStationData(session) {
  const trintaDiasAtras = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  const url = `https://hexacloud.com.br/json_api/getAllData.php?session=${session}&since=${trintaDiasAtras}`;
  
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`HexaClima respondeu ${res.status} para ${session}`);
  }
  return res.json();
}

function parseReadings(raw) {
  const result = raw?.result ?? {};

  function ultimoValor(sensor) {
    const serie = result[sensor];
    if (!serie || serie.length === 0) return null;
    return serie[serie.length - 1].data;
  }

  function ultimoTimestamp(sensor) {
    const serie = result[sensor];
    if (!serie || serie.length === 0) return null;
    return serie[serie.length - 1].timestamp;
  }

  const temperatura = ultimoValor("Temperatura");
  const umidade = ultimoValor("Umidade");
  const vento = ultimoValor("Vento");
  
  let leituraSensorEpochMs = ultimoTimestamp("Temperatura") ?? ultimoTimestamp("Umidade");

  let ultimaChuvaEpochMs = null;
  const pluvio = result["Pluviometro"] ?? [];
  for (const leitura of pluvio) {
    if (leitura.data > 0) {
      if (!ultimaChuvaEpochMs || leitura.timestamp > ultimaChuvaEpochMs) {
        ultimaChuvaEpochMs = leitura.timestamp;
      }
    }
  }

  if (leituraSensorEpochMs) {
    leituraSensorEpochMs += 3 * 3600 * 1000;
  }
  if (ultimaChuvaEpochMs) {
    ultimaChuvaEpochMs += 3 * 3600 * 1000;
  }

  return { temperatura, umidade, vento, ultimaChuvaEpochMs, leituraSensorEpochMs };
}

export async function GET(request) {
  const resultados = [];

  for (const st of STATIONS) {
    try {
      const raw = await fetchStationData(st.session);

      await supabase.from("leituras_clima_historico_irif").insert({
        session: st.session,
        payload: raw,
      });

      const { temperatura, umidade, vento, ultimaChuvaEpochMs, leituraSensorEpochMs } = parseReadings(raw);

      const agoraMs = Date.now();
      const diasSemChuva = ultimaChuvaEpochMs
        ? Math.floor((agoraMs - ultimaChuvaEpochMs) / 86400000)
        : 30;

      const atualizadoEmIso = new Date().toISOString();
      const leituraSensorDataIso = leituraSensorEpochMs
        ? new Date(leituraSensorEpochMs).toISOString()
        : null;

      await supabase.from("log_execucoes").insert({
        session: st.session,
        nome_escola: st.nome,
        atualizado_em: atualizadoEmIso,
        leitura_sensor_data: leituraSensorDataIso,
        temperatura_c: temperatura,
        umidade_pct: umidade,
        vento_kmh: vento,
        dias_sem_chuva: diasSemChuva,
      });

      const { error: upsertError } = await supabase.from("leituras_clima_irif").upsert({
        session: st.session,
        nome_escola: st.nome,
        temperatura_c: temperatura,
        temp_score: temperatura !== null ? scoreTemp(temperatura) : null,
        umidade_pct: umidade,
        ur_score: umidade !== null ? scoreUmidade(umidade) : null,
        vento_kmh: vento,
        vento_score: vento !== null ? scoreVento(vento) : null,
        ultima_chuva_epoch: ultimaChuvaEpochMs ? Math.floor(ultimaChuvaEpochMs / 1000) : null,
        ultima_chuva_data: ultimaChuvaEpochMs ? new Date(ultimaChuvaEpochMs).toISOString() : null,
        leitura_sensor_epoch: leituraSensorEpochMs ? Math.floor(leituraSensorEpochMs / 1000) : null,
        leitura_sensor_data: leituraSensorDataIso,
        dias_sem_chuva: diasSemChuva,
        dias_score: scoreDiasSemChuva(diasSemChuva),
        fonte: "api",
        atualizado_em: atualizadoEmIso,
      });

      if (upsertError) throw upsertError;

      resultados.push({ session: st.session, ok: true });
    } catch (err) {
      resultados.push({ session: st.session, ok: false, erro: String(err) });
    }
  }

  return NextResponse.json({ success: true, resultados });
}

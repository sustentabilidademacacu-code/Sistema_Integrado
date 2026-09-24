import { NextResponse } from 'next/server';
import { google } from 'googleapis';
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

function formatBRT(dateOrEpochMs) {
  if (!dateOrEpochMs) return "";
  const date = new Date(dateOrEpochMs);
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

async function fetchStationData(session) {
  const trintaDiasAtras = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  const url = `https://hexacloud.com.br/json_api/influx_compat/getAllData.php?session=${session}&since=${trintaDiasAtras}`;
  
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

  return { temperatura, umidade, vento, ultimaChuvaEpochMs, leituraSensorEpochMs };
}

async function updateGoogleSheets(rows) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  // Cabeçalhos (A1:P1)
  const header = [
    "session", "nome_escola", "temperatura_c", "temp_score", "umidade_pct", "ur_score",
    "vento_kmh", "vento_score", "ultima_chuva_epoch", "ultima_chuva_data",
    "leitura_sensor_epoch", "leitura_sensor_data", "dias_sem_chuva", "dias_score",
    "fonte", "atualizado_em"
  ];

  // Matriz de dados para enviar ao Sheets
  const values = [header, ...rows];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'leituras_clima_irif!A1:P' + values.length,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
}

export async function GET(request) {
  // Dispara todas as requisições em paralelo
  const promessas = STATIONS.map(async (st) => {
    try {
      const raw = await fetchStationData(st.session);
      const { temperatura, umidade, vento, ultimaChuvaEpochMs, leituraSensorEpochMs } = parseReadings(raw);

      const agoraMs = Date.now();
      const diasSemChuva = ultimaChuvaEpochMs
        ? Math.floor((agoraMs - ultimaChuvaEpochMs) / 86400000)
        : 30;

      // Monta a linha para o Google Sheets (na mesma ordem do header)
      const row = [
        st.session,
        st.nome,
        temperatura !== null ? temperatura : "",
        temperatura !== null ? scoreTemp(temperatura) : "",
        umidade !== null ? umidade : "",
        umidade !== null ? scoreUmidade(umidade) : "",
        vento !== null ? vento : "",
        vento !== null ? scoreVento(vento) : "",
        ultimaChuvaEpochMs ? Math.floor(ultimaChuvaEpochMs / 1000) : "",
        formatBRT(ultimaChuvaEpochMs),
        leituraSensorEpochMs ? Math.floor(leituraSensorEpochMs / 1000) : "",
        formatBRT(leituraSensorEpochMs),
        diasSemChuva,
        scoreDiasSemChuva(diasSemChuva),
        "api",
        formatBRT(agoraMs)
      ];

      return { session: st.session, ok: true, row };
    } catch (err) {
      console.error(`Erro ao processar ${st.session}:`, err);
      return { session: st.session, ok: false, erro: String(err) };
    }
  });

  const resultados = await Promise.all(promessas);
  
  // Filtra as linhas com sucesso
  const rowsParaSalvar = resultados.filter(r => r.ok && r.row).map(r => r.row);

  try {
    if (rowsParaSalvar.length > 0) {
      await updateGoogleSheets(rowsParaSalvar);
    }
    return NextResponse.json({ success: true, message: `Atualizado ${rowsParaSalvar.length} estações no Sheets`, resultados });
  } catch (error) {
    console.error("Erro ao escrever no Google Sheets:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

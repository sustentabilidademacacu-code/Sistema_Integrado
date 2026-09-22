import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { STATIONS } from '@/data/stations';

export const revalidate = 0; // Disable cache

export async function GET() {
  try {
    // 90 dias em milissegundos
    const TRÊS_MESES_MS = 90 * 24 * 60 * 60 * 1000;
    const dataLimite = Date.now() - TRÊS_MESES_MS;
    
    // Fuso Horário de Brasília
    const tz = 'America/Sao_Paulo';
    const formatter = new Intl.DateTimeFormat('pt-BR', { 
      timeZone: tz, 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    // Cabeçalho do CSV
    let csvString = "Estacao,Status,Bairro,Temperatura_C,Chuva_mm,Umidade_pct,Vento_kmh,DataHora\n";

    // Mapeia todas as estações (ativas e inativas)
    const results = await Promise.all(
      STATIONS.map(async (st) => {
        const { data, error } = await supabase
          .from('leituras_clima_historico_irif')
          .select('payload')
          .eq('session', st.session)
          .order('created_at', { ascending: false })
          .limit(1);

        const row = data && data.length > 0 ? data[0] : null;
        if (!row || !row.payload || !row.payload.result) return "";

        const { Temperatura, Pluviometro, Umidade, Vento } = row.payload.result;
        
        // Dicionário para agrupar leituras pelo mesmo timestamp exato
        const leiturasPorTempo = new Map();

        const agrupar = (arraySensores, chave) => {
          if (!Array.isArray(arraySensores)) return;
          for (const item of arraySensores) {
            if (!item.timestamp || item.timestamp < dataLimite) continue;
            
            if (!leiturasPorTempo.has(item.timestamp)) {
              leiturasPorTempo.set(item.timestamp, { temp: '', chuva: '', umidade: '', vento: '' });
            }
            leiturasPorTempo.get(item.timestamp)[chave] = item.data;
          }
        };

        agrupar(Temperatura, 'temp');
        agrupar(Pluviometro, 'chuva');
        agrupar(Umidade, 'umidade');
        agrupar(Vento, 'vento');

        // Status: se `hideFromList` for true, consideramos inativa
        const status = st.hideFromList ? 'Inativa' : 'Ativa';
        const bairro = st.bairro || 'Zona Rural';
        let linhasCSV = "";

        // Ordenar os timestamps do mais antigo para o mais novo
        const timestampsOrdenados = Array.from(leiturasPorTempo.keys()).sort((a, b) => a - b);

        for (const ts of timestampsOrdenados) {
          const vals = leiturasPorTempo.get(ts);
          
          // Formatar data: 22/09/2026 10:00:00
          const dataFormatada = formatter.format(new Date(ts)).replace(',', ''); // Evita conflito de vírgula do formato nativo

          linhasCSV += `"${st.nome}","${status}","${bairro}","${vals.temp}","${vals.chuva}","${vals.umidade}","${vals.vento}","${dataFormatada}"\n`;
        }

        return linhasCSV;
      })
    );
    
    // Concatena as linhas de todas as estações
    csvString += results.join("");

    // Retorna explicitamente como text/csv para o Google Sheets ler perfeitamente
    return new NextResponse(csvString, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="dados_clima.csv"'
      }
    });

  } catch (err) {
    console.error("Erro na API exportar-bi:", err);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}

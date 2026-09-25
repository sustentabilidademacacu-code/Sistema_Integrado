import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY
          ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"|"$/g, '')
          : undefined,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Busca os dados da aba (lê até a linha 12, pois são 11 estações + 1 cabeçalho)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'leituras_clima_irif!A1:P12',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const headers = rows[0];
    const data = rows.slice(1).map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        // Converte os valores numéricos que vêm como string
        let val = row[index];
        if (val !== undefined && val !== "") {
          if (!isNaN(val) && header !== "session" && header !== "nome_escola" && header !== "ultima_chuva_data" && header !== "leitura_sensor_data" && header !== "fonte" && header !== "atualizado_em") {
            val = Number(val);
          }
        } else {
          val = null;
        }
        obj[header] = val;
      });
      return obj;
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Erro ao ler do Google Sheets:", error);
    return NextResponse.json({ data: [], error: String(error) }, { status: 500 });
  }
}

import { google } from "googleapis";

const CACHE_SECONDS = 3600;

let cache: { data: SheetCity[]; expiresAt: number } | null = null;

export interface SheetCity {
  city?: string;
  [key: string]: string | null | undefined;
}

export async function getSheetDataCached(): Promise<SheetCity[]> {
  if (cache && Date.now() < cache.expiresAt) {
    return cache.data;
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!sheetId || !clientEmail || !privateKey) {
    throw new Error("Variáveis de ambiente do Google Sheets não configuradas.");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const token = await auth.getAccessToken();

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Página1!A:E`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar Google Sheets: ${response.status}`);
  }

  const json = await response.json();
  const rows: string[][] = json.values || [];
  const [headers, ...data] = rows;

  if (!headers) {
    cache = { data: [], expiresAt: Date.now() + CACHE_SECONDS * 1000 };
    return [];
  }

  const result = data.map((row) =>
    headers.reduce<SheetCity>((acc, header, index) => {
      acc[header] = row[index] ?? null;
      return acc;
    }, {}),
  );

  cache = { data: result, expiresAt: Date.now() + CACHE_SECONDS * 1000 };
  return result;
}

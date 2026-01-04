import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(req: NextRequest) {
    try {
        const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
        const spreadsheetId = process.env.SPREADSHEET_ID;

        if (!credentialsJson || !spreadsheetId) {
            console.warn('[log-analysis] Missing Google Sheets credentials or Spreadsheet ID. Skipping append.');
            return NextResponse.json({ success: true, warning: 'Missing Google Sheets credentials' });
        }

        const body = await req.json();
        const {
            timestamp,
            inputText,
            classification,
            violationType,
            riskLevel,
            targetCountry,
            modelScore,
            image_description
        } = body;

        const credentials = JSON.parse(credentialsJson);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:H',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[
                    timestamp || new Date().toISOString(),
                    inputText,
                    classification,
                    violationType,
                    riskLevel,
                    targetCountry,
                    modelScore,
                    image_description
                ]],
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error in /api/log-analysis:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage || 'Internal Server Error' }, { status: 500 });
    }
}

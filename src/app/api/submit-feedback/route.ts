import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(req: NextRequest) {
    try {
        const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
        const spreadsheetId = process.env.SPREADSHEET_ID;

        if (!credentialsJson || !spreadsheetId) {
            return NextResponse.json(
                { error: 'Missing Google Sheets credentials or Spreadsheet ID' },
                { status: 500 }
            );
        }

        const body = await req.json();
        const {
            originalText,
            aiClassification,
            aiRiskLevel,
            severityScore,
            userCorrection,
            userReasoning,
            additionalContext,
            timestamp
        } = body;

        // Validation
        if (!originalText || !aiClassification || !userCorrection || !userReasoning) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Parse credentials
        const credentials = JSON.parse(credentialsJson);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Prepare data for Google Sheets
        // Format: [Timestamp, Original Text, AI Classification, AI Risk Level, Severity Score, User Correction, User Reasoning, Additional Context]
        const row = [
            timestamp || new Date().toISOString(),
            originalText,
            aiClassification,
            aiRiskLevel || 'N/A',
            severityScore?.toString() || 'N/A',
            userCorrection,
            userReasoning,
            additionalContext || ''
        ];

        // Append to "Feedback" sheet (will be created if doesn't exist)
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Feedback!A:H', // Feedback sheet, columns A-H
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [row],
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error in /api/submit-feedback:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: errorMessage || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// api/timestamp.js → replace everything with this
import { google } from 'googleapis';

const sheets = google.sheets('v4');

export default async function handler(req, res) {
  try {
    const { ro_number } = req.body;
    if (!ro_number) {
      return res.status(400).json({ error: "Missing ro_number" });
    }

    // Your beautiful NY timestamp
    const now = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    });

    // === FIXED PARSING (this is the real fix) ===
    let credentials;
    try {
      const rawKey = process.env.GOOGLE_SERVICE_KEY;
      if (!rawKey) throw new Error("GOOGLE_SERVICE_KEY missing");

      // Safely parse — handles escaped newlines and quotes
      credentials = JSON.parse(
        rawKey
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"')
          .trim()
      );
    } catch (parseError) {
      console.error("Failed to parse GOOGLE_SERVICE_KEY:", parseError);
      return res.status(500).json({ error: "Invalid service key format" });
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();

    // Search RO in column C
    const search = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId: process.env.SHEET_ID,
      range: 'Schedule!C:C',
    });

    const rows = search.data.values || [];
    let targetRow = null;

    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][0]).trim() === String(ro_number).trim()) {
        targetRow = i + 2; // header is row 1
        break;
      }
    }

    if (!targetRow) {
      return res.status(404).json({ error: "RO not found", ro_number });
    }

    // Update column A with timestamp
    await sheets.spreadsheets.values.update({
      auth: authClient,
      spreadsheetId: process.env.SHEET_ID,
      range: `Schedule!A${targetRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[now]] },
    });

    // SUCCESS → assistant speaks it
    return res.status(200).json({ timestamp: now });

  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ 
      error: "Server error", 
      details: error.message 
    });
  }
}

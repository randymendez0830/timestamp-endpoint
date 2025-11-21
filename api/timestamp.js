// api/timestamp.js  ← paste this over your current file
import { google } from 'googleapis';

const sheets = google.sheets('v4');

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_KEY), // ← you already have this
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export default async function handler(req, res) {
  const { ro_number } = req.body;
  if (!ro_number) return res.status(400).json({ error: "Missing ro_number" });

  // Your exact same beautiful NY timestamp
  const now = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });

  const authClient = await auth.getClient();

  try {
    // Search column C for the RO number
    const search = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId: process.env.SHEET_ID,        // ← you already have this
      range: 'Schedule!C:C',
    });

    const rows = search.data.values || [];
    let targetRow = null;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] == ro_number) {   // exact match, string/number safe
        targetRow = i + 2;             // header row = 1, array starts at 0
        break;
      }
    }

    if (!targetRow) {
      return res.status(404).json({ error: "RO not found" });
    }

    // Write the timestamp into column A of that exact row
    await sheets.spreadsheets.values.update({
      auth: authClient,
      spreadsheetId: process.env.SHEET_ID,
      range: `Schedule!A${targetRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[now]] },
    });

    // Return so assistant can speak it
    res.status(200).json({ timestamp: now });

  } catch (error) {
    console.error("Sheet error:", error);
    res.status(500).json({ error: "Failed" });
  }
}

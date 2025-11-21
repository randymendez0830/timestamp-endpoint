import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    // 1. Load environment variables
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_KEY);
    const sheetId = process.env.SHEET_ID;

    if (!serviceAccount || !sheetId) {
      return res.status(500).json({
        error: "Missing GOOGLE_SERVICE_KEY or SHEET_ID environment variable",
      });
    }

    // 2. Auth with Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 3. Generate timestamp in New York timezone (MM/DD/YYYY HH:MM AM/PM)
    const nowInNY = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
    );

    const timestamp = nowInNY
      .toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", ""); // remove comma between date and time

    // 4. Append timestamp to column K in tab "Schedule"
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Schedule!K:K",
      valueInputOption: "RAW",
      requestBody: {
        values: [[timestamp]],
      },
    });

    return res.status(200).json({ success: true, timestamp });
  } catch (error) {
    console.error("Timestamp Error:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
}

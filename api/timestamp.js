import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    // Allow both GET and POST
    if (req.method !== "GET" && req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_KEY);
    const sheetId = process.env.SHEET_ID;

    if (!serviceAccount || !sheetId) {
      return res.status(500).json({
        error: "Missing GOOGLE_SERVICE_KEY or SHEET_ID environment variable",
      });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const now = new Date();
    const timestamp = new Date(
      now.toLocaleString("en-US", { timeZone: "America/New_York" })
    )
      .toISOString()
      .replace("Z", "");

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
    return res.status(500).json({ error: error.message });
  }
}

import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // 1. Load environment variables
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_KEY);
    const sheetId = process.env.SHEET_ID;

    if (!serviceAccount || !sheetId) {
      return res.status(500).json({
        error: "Missing GOOGLE_SERVICE_KEY or SHEET_ID environment variable",
      });
    }

    // 2. Google Sheets Auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccount.client_email,
        private_key: serviceAccount.private_key.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 3. Convert timestamp → New York timezone
    const now = new Date();
    const timestamp = new Date(
      now.toLocaleString("en-US", { timeZone: "America/New_York" })
    )
      .toISOString()
      .replace("Z", "");

    // 4. Extract fields
    const {
      shop,
      ro_number,
      vin,
      vehicle_year,
      vehicle_make,
      vehicle_model,
      system,
      status,
      tech,
      notes
    } = req.body;

    // 5. Append to Google Sheets
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "ADAS_Schedule!A:K",
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          timestamp,
          shop || "",
          ro_number || "",
          vin || "",
          vehicle_year || "",
          vehicle_make || "",
          vehicle_model || "",
          system || "",
          status || "",
          tech || "",
          notes || ""
        ]],
      },
    });

    return res.status(200).json({ success: true, timestamp });

  } catch (error) {
    console.error("ADAS Schedule Update Error:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
}

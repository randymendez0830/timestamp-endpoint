import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const timestamp = new Date().toISOString();

    // Load service account credentials from env var
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_KEY);

    const client = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const sheets = google.sheets({ version: "v4", auth: client });

    // Your sheet ID
    const spreadsheetId = process.env.SHEET_ID;

    // ADAS Schedule → Sheet name = "Schedule"
    // Columns A → K
    const range = "Schedule!A:K";

    // Extract expected fields from the request
    const {
      shop = "",
      ro_number = "",
      vin = "",
      vehicle_year = "",
      vehicle_make = "",
      vehicle_model = "",
      system = "",
      status = "",
      tech = "",
      notes = ""
    } = req.query;

    // Append 1 row into columns A → K
    const row = [
      shop,
      ro_number,
      vin,
      vehicle_year,
      vehicle_make,
      vehicle_model,
      system,
      status,
      tech,
      notes,
      timestamp // Column K (date)
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: {
        values: [row],
      },
    });

    return res.status(200).json({ success: true, data: row });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to write timestamp." });
  }
}

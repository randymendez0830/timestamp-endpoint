import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const timestamp = new Date().toISOString();

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_KEY);

    const client = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const sheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = process.env.SHEET_ID;
    const range = "Sheet1!A:A";

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: {
        values: [[timestamp]],
      },
    });

    return res.status(200).json({ success: true, timestamp });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to write timestamp." });
  }
}

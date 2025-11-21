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

    // 3. Generate timestamp in New York timezone
    const nyDateString = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    });

    const localNYDate = new Date(nyDateString);

    if (localNYDate.toString() === "Invalid Date") {
      return res.status(500).json({ error: "Invalid Date" });
    }

    const timestamp = localNYDate.toISOString().replace("Z", "");

    // 4. Respond with timestamp (no sheet write here)
    return res.status(200).json({
      success: true,
      timestamp,
    });
  } catch (error) {
    console.error("Timestamp Error:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
}

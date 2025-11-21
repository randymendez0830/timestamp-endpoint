import { google } from "googleapis";

export default async function handler(req, res) {
  // Fix CORS error for Vapi test tool
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Generate timestamp in New York timezone
    const now = new Date();
    const timestamp = new Date(
      now.toLocaleString("en-US", { timeZone: "America/New_York" })
    )
      .toISOString()
      .replace("Z", "");

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

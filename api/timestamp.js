import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    // Allow both GET and POST
    if (req.method !== "GET" && req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Generate timestamp in New York timezone
    const now = new Date();
    const est = new Date(
      now.toLocaleString("en-US", { timeZone: "America/New_York" })
    );

    const formatted = est
      .toISOString()
      .replace("T", " ")
      .replace("Z", "")
      .slice(0, 19);

    // Always return JSON with a valid field
    return res.status(200).json({
      success: true,
      timestamp: formatted,
    });

  } catch (error) {
    console.error("Timestamp Error:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
}

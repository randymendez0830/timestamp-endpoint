export default async function handler(req, res) {
  try {
    // Accept BOTH GET and POST
    if (req.method !== "GET" && req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Generate timestamp in New York timezone
    const now = new Date();
    const nyString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
    const timestamp = new Date(nyString).toISOString();

    // Return REQUIRED JSON payload for Vapi
    return res.status(200).json({
      success: true,
      timestamp: timestamp
    });

  } catch (error) {
    console.error("Timestamp Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

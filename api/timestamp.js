export default function handler(req, res) {
  try {
    // Get current time in New York timezone
    const now = new Date();

    const timestamp = now.toLocaleString("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });

    return res.status(200).json({
      success: true,
      timestamp: timestamp
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

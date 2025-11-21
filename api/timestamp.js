export default function handler(req, res) {
  const now = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });

  res.status(200).json({ timestamp: now });
}

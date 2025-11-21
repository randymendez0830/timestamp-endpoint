export default function handler(req, res) {
  const newYorkTime = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });

  res.status(200).json({ timestamp: newYorkTime });
}

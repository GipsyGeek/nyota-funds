export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { checkout_id } = req.query;
  if (!checkout_id) return res.status(400).json({ error: "checkout_id query param required" });

  try {
    const response = await fetch(`https://pay.lipwa.app/api/status?ref=${encodeURIComponent(checkout_id)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.LIPWA_API_KEY}`,
      },
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); }
    catch { return res.status(502).json({ error: "Invalid response", raw: text.slice(0, 200) }); }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

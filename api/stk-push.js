export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.LIPWA_API_KEY) {
    return res.status(500).json({ error: "LIPWA_API_KEY is not set in environment variables" });
  }
  if (!process.env.LIPWA_CHANNEL_ID) {
    return res.status(500).json({ error: "LIPWA_CHANNEL_ID is not set in environment variables" });
  }

  const { phone, amount, reference } = req.body || {};

  if (!phone || !amount || !reference) {
    return res.status(400).json({ error: "phone, amount and reference are required" });
  }

  if (Number(amount) < 10) {
    return res.status(400).json({ error: "Minimum amount is KES 10" });
  }

  try {
    const response = await fetch("https://pay.lipwa.app/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LIPWA_API_KEY}`,
      },
      body: JSON.stringify({
        phone_number: phone.toString().trim(),
        amount: Number(amount),
        channel_id: process.env.LIPWA_CHANNEL_ID,
        callback_url: process.env.LIPWA_CALLBACK_URL || "",
        api_ref: reference,
      }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({
        error: "Lipwa returned non-JSON",
        raw: text.slice(0, 500),
        status: response.status,
      });
    }

    if (data.CheckoutRequestID) {
      return res.status(200).json({
        success: true,
        transaction_request_id: data.CheckoutRequestID,
        message: "STK Push sent! Check your phone.",
      });
    }

    return res.status(400).json({
      success: false,
      message: data.message || "STK Push failed",
      lipwa_response: data,
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
      detail: "fetch to Lipwa failed",
    });
  }
}

export async function triggerSTKPush(phone, amount, reference) {
  const res = await fetch("/api/stk-push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, amount, reference }),
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error(`Server error: ${text.slice(0, 100)}`); }

  if (!res.ok || !data.success) throw new Error(data.message || data.error || "Payment failed");
  return data;
}

export async function checkPaymentStatus(transaction_request_id) {
  const res = await fetch(`/api/check-payment?checkout_id=${encodeURIComponent(transaction_request_id)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  return data;
}

export function generateReference(prefix = "NYT") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
}

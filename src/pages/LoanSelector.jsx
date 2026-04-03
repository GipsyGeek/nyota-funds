import { triggerSTKPush, checkPaymentStatus, generateReference } from "../services/megapay";

// Replace the handleGetLoan function:
const handleGetLoan = async () => {
  if (!selected) return;
  setLoading(true);
  setError("");
  setStkSent(false);

  try {
    const reference = generateReference("NYT");
    const result = await triggerSTKPush(applicant.phone, selected.fee, reference);

    setStkSent(true);
    setLoading(false);

    // Poll every 5s, max 12 attempts (60 seconds)
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const status = await checkPaymentStatus(result.transaction_request_id);

        // ✅ Payment completed
        if (status.status === "payment.success") {
          clearInterval(poll);
          onSelect({ ...selected, reference });
          return;
        }

        // ❌ Payment failed
        if (status.status === "payment.failed") {
          clearInterval(poll);
          setStkSent(false);
          setError("Payment was not completed. Please try again.");
          return;
        }

        // payment.queued — keep polling

      } catch (e) {
        // network hiccup — keep polling
      }

      // ⏱ Timeout after 60 seconds
      if (attempts >= 12) {
        clearInterval(poll);
        setStkSent(false);
        setError("Payment timeout. If you paid, please contact support with ref: " + reference);
      }
    }, 5000);

  } catch (err) {
    setLoading(false);
    setError(err.message || "Payment request failed. Please try again.");
  }
};

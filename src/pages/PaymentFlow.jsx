function fmt(n) { return Number(n).toLocaleString(); }

export default function PaymentFlow({ applicant, loan, onRestart }) {
  return (
    <div className="nyota-bg min-h-screen">
      <header className="nyota-header">
        <div className="nyota-logo">Nyota<span>Funds</span></div>
      </header>

      <div className="stepper">
        <div className="step done"><div className="step-circle done">✓</div><span>Check</span></div>
        <div className="step-line active" />
        <div className="step done"><div className="step-circle done">✓</div><span>Select</span></div>
        <div className="step-line active" />
        <div className="step active"><div className="step-circle active">3</div><span>Get Cash</span></div>
      </div>

      <div className="nyota-card">
        <div className="status-block">
          <div className="success-icon big">✓</div>
          <h1 className="card-title">Payment Successful!</h1>
          <p className="card-sub">
            {applicant.fullName}, your transaction fee has been received. Your loan will be disbursed shortly.
          </p>

          <div className="summary-box">
            <div className="summary-row">
              <span>Loan Amount</span>
              <strong>Ksh {fmt(loan.amount)}</strong>
            </div>
            <div className="summary-row">
              <span>Transaction Fee Paid</span>
              <strong className="fee-green">Ksh {fmt(loan.fee)}</strong>
            </div>
            <div className="summary-row">
              <span>Phone Number</span>
              <strong>{applicant.phone}</strong>
            </div>
            <div className="summary-row">
              <span>Reference</span>
              <strong style={{ fontSize: "0.8rem" }}>{loan.reference || "—"}</strong>
            </div>
          </div>

          <div className="info-card yellow">
            <span className="info-icon">⏱</span>
            <div>
              <strong>Loan disbursement in progress</strong>
              <p>Your loan of Ksh {fmt(loan.amount)} will be sent to {applicant.phone} within 5 minutes.</p>
            </div>
          </div>

          <div className="info-card blue">
            <span className="info-icon">📞</span>
            <div>
              <strong>Need help?</strong>
              <p>If you don't receive your loan, call us or dial <strong>*234#</strong> to follow up.</p>
            </div>
          </div>

          <button className="nyota-btn outline mt-4" onClick={onRestart}>Apply for Another Loan</button>
        </div>
      </div>

      <footer className="nyota-footer">
        <span>📄 No paperwork required.</span>
        <span>👥 No guarantors needed.</span>
        <div className="copyright">© 2026 Nyota Funds. All rights reserved.</div>
      </footer>
    </div>
  );
}
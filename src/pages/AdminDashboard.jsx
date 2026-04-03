import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";

const STATUS_COLORS = {
  pending: "#f59e0b",
  completed: "#22c55e",
  failed: "#ef4444",
  disbursed: "#3b82f6",
};

function fmt(n) { return Number(n).toLocaleString(); }

export default function AdminDashboard({ onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [tab, setTab] = useState("transactions");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);

  const ADMIN_PIN = "1234"; // Change to env var in production

  useEffect(() => {
    if (!authed) return;
    const q1 = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
    const unsub1 = onSnapshot(q1, (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const q2 = query(collection(db, "applications"), orderBy("createdAt", "desc"));
    const unsub2 = onSnapshot(q2, (snap) => {
      setApplications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => { unsub1(); unsub2(); };
  }, [authed]);

  const updateStatus = async (id, newStatus) => {
    await updateDoc(doc(db, "transactions", id), { status: newStatus });
  };

  const filtered = (tab === "transactions" ? transactions : applications).filter((r) => {
    const matchSearch =
      r.applicantName?.toLowerCase().includes(search.toLowerCase()) ||
      r.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      r.phone?.includes(search);
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalDisbursed = transactions.filter((t) => t.status === "completed").reduce((a, t) => a + (t.loanAmount || 0), 0);
  const totalFees = transactions.filter((t) => t.status === "completed").reduce((a, t) => a + (t.fee || 0), 0);

  if (!authed) {
    return (
      <div className="nyota-bg min-h-screen flex-center">
        <div className="nyota-card narrow">
          <div className="nyota-logo center">Nyota<span>Funds</span></div>
          <h2 className="card-title">Admin Access</h2>
          <p className="card-sub">Enter your PIN to continue</p>
          <input
            type="password"
            className="nyota-input"
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={6}
          />
          <button className="nyota-btn mt-4" onClick={() => { if (pin === ADMIN_PIN) setAuthed(true); else alert("Wrong PIN"); }}>
            Login
          </button>
          <button className="nyota-btn outline mt-2" onClick={onBack}>← Back to Site</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="nyota-logo">Nyota<span>Funds</span></div>
        <nav className="admin-nav">
          <button className={`nav-item ${tab === "transactions" ? "active" : ""}`} onClick={() => setTab("transactions")}>💳 Transactions</button>
          <button className={`nav-item ${tab === "applications" ? "active" : ""}`} onClick={() => setTab("applications")}>📋 Applications</button>
        </nav>
        <button className="nav-item logout" onClick={onBack}>← Back to Site</button>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-topbar">
          <h1 className="admin-title">{tab === "transactions" ? "Transactions" : "Applications"}</h1>
          <div className="admin-search-row">
            <input className="nyota-input sm" placeholder="Search name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
            {tab === "transactions" && (
              <select className="nyota-input sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="disbursed">Disbursed</option>
              </select>
            )}
          </div>
        </div>

        {/* Stats */}
        {tab === "transactions" && (
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Total Transactions</div>
              <div className="stat-value">{transactions.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Disbursed</div>
              <div className="stat-value green">Ksh {fmt(totalDisbursed)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Fees Collected</div>
              <div className="stat-value green">Ksh {fmt(totalFees)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending</div>
              <div className="stat-value yellow">{transactions.filter((t) => t.status === "pending").length}</div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                {tab === "transactions" && <><th>Loan Amount</th><th>Fee</th><th>Loan Type</th><th>Status</th><th>Actions</th></>}
                {tab === "applications" && <><th>ID Number</th><th>Loan Type</th><th>Status</th></>}
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>No records found.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.applicantName || r.fullName}</td>
                  <td>{r.phone}</td>
                  {tab === "transactions" && (
                    <>
                      <td><strong>Ksh {fmt(r.loanAmount)}</strong></td>
                      <td className="fee-green">Ksh {fmt(r.fee)}</td>
                      <td>{r.loanType}</td>
                      <td>
                        <span className="status-badge" style={{ background: STATUS_COLORS[r.status] + "22", color: STATUS_COLORS[r.status] }}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <select className="mini-select" value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)}>
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                          <option value="disbursed">Disbursed</option>
                        </select>
                      </td>
                    </>
                  )}
                  {tab === "applications" && (
                    <>
                      <td>{r.idNumber}</td>
                      <td>{r.loanType}</td>
                      <td>
                        <span className="status-badge" style={{ background: STATUS_COLORS[r.status]+"22", color: STATUS_COLORS[r.status] }}>
                          {r.status}
                        </span>
                      </td>
                    </>
                  )}
                  <td>{r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
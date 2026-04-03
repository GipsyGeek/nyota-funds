import { useState } from "react";
import EligibilityForm from "./pages/EligibilityForm";
import LoanSelector from "./pages/LoanSelector";
import PaymentFlow from "./pages/PaymentFlow";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("home");
  const [applicant, setApplicant] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const navigate = (p) => setPage(p);

  if (page === "admin") return <AdminDashboard onBack={() => navigate("home")} />;
  if (page === "select" && applicant)
    return (
      <LoanSelector
        applicant={applicant}
        onSelect={(loan) => { setSelectedLoan(loan); navigate("payment"); }}
        onBack={() => navigate("home")}
      />
    );
  if (page === "payment" && applicant && selectedLoan)
    return (
      <PaymentFlow
        applicant={applicant}
        loan={selectedLoan}
        onRestart={() => { setApplicant(null); setSelectedLoan(null); navigate("home"); }}
      />
    );

  return (
    <EligibilityForm
      onSubmit={(data) => { setApplicant(data); navigate("select"); }}
      onAdmin={() => navigate("admin")}
    />
  );
}
import { useState } from "react";
import axios from "axios";
import InputPanel from "../components/InputPanel";
import OutputPanel from "../components/OutputPanel";
import HistoryPanel from "../components/HistoryPanel";

const API = "http://localhost:8000";

const DEFAULT_FORM = {
  linkedin_text: "",
  your_profile: "",
  goal: "job",
  tone: "professional",
};

export default function App() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/generate-outreach`, form);
      setResult(res.data);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Something went wrong. Is the backend running?";
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={styles.root}>
        {/* Top bar */}
        <div style={styles.topbar}>
          <div style={styles.topbarLeft}>
            <span style={styles.topbarLogo}>⚡</span>
            <span style={styles.topbarName}>LinkedIn Outreach AI</span>
            <span style={styles.topbarBadge}>LOCAL</span>
          </div>
          <HistoryPanel onRestore={(r) => { setResult(r); setError(null); }} />
        </div>

        {/* Main layout */}
        <div style={styles.layout}>
          <div style={styles.leftPanel}>
            <InputPanel
              form={form}
              onChange={handleChange}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>
          <div style={styles.divider} />
          <div style={styles.rightPanel}>
            <OutputPanel result={result} error={error} />
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#0f1117",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 28px",
    borderBottom: "1px solid #1e2235",
    background: "#13161f",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  topbarLeft: { display: "flex", alignItems: "center", gap: "10px" },
  topbarLogo: { fontSize: "20px" },
  topbarName: { fontWeight: 700, fontSize: "15px", color: "#c7cef7" },
  topbarBadge: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    padding: "2px 8px",
    background: "rgba(52,211,153,0.12)",
    color: "#34d399",
    border: "1px solid rgba(52,211,153,0.25)",
    borderRadius: "99px",
  },
  layout: {
    display: "flex",
    flex: 1,
    gap: "0",
    padding: "28px",
    maxWidth: "1400px",
    width: "100%",
    margin: "0 auto",
    alignSelf: "stretch",
  },
  leftPanel: {
    flex: "0 0 420px",
    minWidth: "320px",
    maxHeight: "calc(100vh - 80px)",
    overflowY: "auto",
    paddingRight: "8px",
  },
  divider: {
    width: "1px",
    background: "#1e2235",
    margin: "0 28px",
    flexShrink: 0,
  },
  rightPanel: {
    flex: 1,
    maxHeight: "calc(100vh - 80px)",
    overflowY: "auto",
    paddingLeft: "8px",
  },
};
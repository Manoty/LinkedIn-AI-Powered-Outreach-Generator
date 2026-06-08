import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function HistoryPanel({ onRestore }) {
  const [history, setHistory] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/history`);
      setHistory(res.data.history.reverse());
    } catch {
      setHistory([]);
    }
    setLoading(false);
  };

  const clearHistory = async () => {
    if (!confirm("Clear all history?")) return;
    await axios.delete(`${API}/history`);
    setHistory([]);
  };

  useEffect(() => {
    if (open) fetchHistory();
  }, [open]);

  return (
    <div style={styles.wrap}>
      <button onClick={() => setOpen(!open)} style={styles.toggleBtn}>
        {open ? "✕ Close History" : "🕘 History"}
      </button>

      {open && (
        <div style={styles.drawer}>
          <div style={styles.drawerHeader}>
            <span style={styles.drawerTitle}>Past Generations</span>
            <button onClick={clearHistory} style={styles.clearBtn}>Clear All</button>
          </div>

          {loading && <div style={styles.loading}>Loading...</div>}

          {!loading && history.length === 0 && (
            <div style={styles.empty}>No history yet.</div>
          )}

          {!loading && history.map((entry) => (
            <div key={entry.id} style={styles.entry}>
              <div style={styles.entryMeta}>
                <span style={styles.entryGoal}>{entry.request.goal}</span>
                <span style={styles.entryTone}>{entry.request.tone}</span>
                <span style={styles.entryTime}>
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              <div style={styles.entrySubject}>{entry.response.subject}</div>
              <div style={styles.entrySnippet}>
                {entry.response.email?.slice(0, 120)}...
              </div>
              <button
                style={styles.restoreBtn}
                onClick={() => { onRestore(entry.response); setOpen(false); }}
              >
                Load this result →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { position: "relative" },
  toggleBtn: {
    padding: "7px 16px",
    background: "rgba(79,110,247,0.1)",
    color: "#4f6ef7",
    border: "1px solid rgba(79,110,247,0.25)",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "13px",
  },
  drawer: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    width: "420px",
    maxHeight: "520px",
    overflowY: "auto",
    background: "#1a1d27",
    border: "1px solid #2e3250",
    borderRadius: "14px",
    padding: "16px",
    zIndex: 100,
    boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  drawerTitle: { fontWeight: 700, color: "#c7cef7", fontSize: "14px" },
  clearBtn: {
    padding: "4px 10px",
    background: "rgba(248,113,113,0.1)",
    color: "#f87171",
    border: "1px solid rgba(248,113,113,0.25)",
    borderRadius: "6px",
    fontSize: "12px",
  },
  loading: { color: "#7b82a8", fontSize: "13px", textAlign: "center" },
  empty: { color: "#4a5080", fontSize: "13px", textAlign: "center", padding: "20px 0" },
  entry: {
    background: "#22263a",
    border: "1px solid #2e3250",
    borderRadius: "10px",
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  entryMeta: { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" },
  entryGoal: {
    background: "rgba(79,110,247,0.15)",
    color: "#4f6ef7",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
  },
  entryTone: {
    background: "rgba(124,91,247,0.12)",
    color: "#a78bfa",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: 600,
  },
  entryTime: { color: "#4a5080", fontSize: "11px", marginLeft: "auto" },
  entrySubject: { fontWeight: 600, color: "#c7cef7", fontSize: "13px" },
  entrySnippet: { color: "#7b82a8", fontSize: "12px", lineHeight: 1.5 },
  restoreBtn: {
    alignSelf: "flex-start",
    padding: "4px 10px",
    background: "rgba(79,110,247,0.1)",
    color: "#4f6ef7",
    border: "1px solid rgba(79,110,247,0.2)",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    marginTop: "2px",
  },
};
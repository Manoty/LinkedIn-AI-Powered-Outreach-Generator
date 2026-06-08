import CopyButton from "./CopyButton";

export default function OutputPanel({ result, error }) {
  if (error) {
    return (
      <div style={styles.panel}>
        <div style={styles.errorBox}>
          <div style={styles.errorTitle}>⚠ Generation Failed</div>
          <div style={styles.errorMsg}>{error}</div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={styles.panel}>
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>✉</div>
          <div style={styles.emptyTitle}>Your outreach will appear here</div>
          <div style={styles.emptySubtitle}>
            Fill in the profile details on the left and hit Generate
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.panel}>

      {/* Subject Line */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardLabel}>Subject Line</span>
          <CopyButton text={result.subject} />
        </div>
        <div style={styles.subjectText}>{result.subject}</div>
      </div>

      {/* Email */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardLabel}>Email</span>
          <CopyButton text={result.email} />
        </div>
        <pre style={styles.bodyText}>{result.email}</pre>
      </div>

      {/* LinkedIn DM */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardLabel}>LinkedIn DM</span>
          <CopyButton text={result.linkedin_message} />
        </div>
        <pre style={styles.bodyText}>{result.linkedin_message}</pre>
      </div>

      {/* Key Insights */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardLabel}>Key Insights</span>
        </div>
        <ul style={styles.insightList}>
          {result.key_insights.map((insight, i) => (
            <li key={i} style={styles.insightItem}>
              <span style={styles.insightDot}>▸</span>
              {insight}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}

const styles = {
  panel: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    height: "100%",
    overflowY: "auto",
    paddingRight: "4px",
  },
  card: {
    background: "#1a1d27",
    border: "1px solid #2e3250",
    borderRadius: "12px",
    padding: "16px 18px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  cardLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#7b82a8",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  subjectText: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#c7cef7",
    lineHeight: 1.4,
  },
  bodyText: {
    fontSize: "13.5px",
    color: "#c8cce8",
    lineHeight: 1.75,
    whiteSpace: "pre-wrap",
    fontFamily: "inherit",
  },
  insightList: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  insightItem: {
    display: "flex",
    gap: "8px",
    fontSize: "13px",
    color: "#a0a8d0",
    lineHeight: 1.5,
  },
  insightDot: { color: "#4f6ef7", flexShrink: 0, marginTop: "2px" },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: "12px",
    textAlign: "center",
    padding: "40px 20px",
  },
  emptyIcon: { fontSize: "48px", opacity: 0.15 },
  emptyTitle: { fontSize: "16px", fontWeight: 600, color: "#4a5080" },
  emptySubtitle: { fontSize: "13px", color: "#363a5a", maxWidth: "260px" },
  errorBox: {
    background: "rgba(248,113,113,0.08)",
    border: "1px solid rgba(248,113,113,0.3)",
    borderRadius: "10px",
    padding: "16px",
  },
  errorTitle: { color: "#f87171", fontWeight: 600, marginBottom: "6px" },
  errorMsg: { color: "#e8a0a0", fontSize: "13px", lineHeight: 1.6 },
};
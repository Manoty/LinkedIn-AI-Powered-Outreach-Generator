const GOALS = ["job", "internship", "networking", "consulting"];
const TONES = ["professional", "founder", "friendly"];

export default function InputPanel({ form, onChange, onSubmit, loading }) {
  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.logo}>⚡</span>
        <div>
          <div style={styles.title}>Outreach AI</div>
          <div style={styles.subtitle}>LinkedIn → Personalized message, instantly</div>
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>
          LinkedIn Profile Text
          <span style={styles.hint}> — paste full profile text</span>
        </label>
        <textarea
          rows={10}
          placeholder={"Paste the person's LinkedIn profile here...\n\nInclude: name, title, company, about section, experience, skills — the more the better."}
          value={form.linkedin_text}
          onChange={(e) => onChange("linkedin_text", e.target.value)}
          style={styles.textarea}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>
          Your Profile
          <span style={styles.hint}> — who you are + what you bring</span>
        </label>
        <textarea
          rows={5}
          placeholder={"e.g. I'm a full-stack engineer with 3 years building SaaS products in React + Python. I've led a team of 4 and shipped features used by 10k+ users. Currently looking for a senior engineering role at a Series A startup."}
          value={form.your_profile}
          onChange={(e) => onChange("your_profile", e.target.value)}
          style={styles.textarea}
        />
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>Goal</label>
          <select value={form.goal} onChange={(e) => onChange("goal", e.target.value)}>
            {GOALS.map((g) => (
              <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
            ))}
          </select>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Tone</label>
          <select value={form.tone} onChange={(e) => onChange("tone", e.target.value)}>
            {TONES.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={onSubmit} disabled={loading} style={styles.btn(loading)}>
        {loading ? (
          <span style={styles.btnInner}>
            <span style={styles.spinner} /> Generating...
          </span>
        ) : (
          "Generate Outreach →"
        )}
      </button>
    </div>
  );
}

const styles = {
  panel: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    height: "100%",
    overflowY: "auto",
    paddingRight: "4px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "4px",
  },
  logo: { fontSize: "28px" },
  title: { fontSize: "20px", fontWeight: 700, color: "#e8eaf6" },
  subtitle: { fontSize: "12px", color: "#7b82a8" },
  field: { display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
  label: { fontSize: "12px", fontWeight: 600, color: "#7b82a8", letterSpacing: "0.05em", textTransform: "uppercase" },
  hint: { fontWeight: 400, textTransform: "none", letterSpacing: 0 },
  textarea: { minHeight: "unset" },
  row: { display: "flex", gap: "16px" },
  btn: (loading) => ({
    padding: "13px",
    background: loading ? "#2e3250" : "linear-gradient(135deg, #4f6ef7, #7c5bf7)",
    color: loading ? "#7b82a8" : "#fff",
    fontWeight: 700,
    fontSize: "14px",
    borderRadius: "10px",
    letterSpacing: "0.03em",
    boxShadow: loading ? "none" : "0 4px 20px rgba(79,110,247,0.35)",
  }),
  btnInner: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  spinner: {
    display: "inline-block",
    width: "14px",
    height: "14px",
    border: "2px solid #7b82a8",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};
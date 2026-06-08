import { useState } from "react";

export default function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Copy failed. Please select and copy manually.");
    }
  };

  return (
    <button onClick={handleCopy} style={styles.btn(copied)}>
      {copied ? "✓ Copied" : label}
    </button>
  );
}

const styles = {
  btn: (copied) => ({
    padding: "5px 14px",
    fontSize: "12px",
    background: copied ? "rgba(52,211,153,0.15)" : "rgba(79,110,247,0.12)",
    color: copied ? "#34d399" : "#4f6ef7",
    border: `1px solid ${copied ? "#34d399" : "#4f6ef7"}`,
    borderRadius: "6px",
    fontWeight: 500,
    letterSpacing: "0.02em",
  }),
};
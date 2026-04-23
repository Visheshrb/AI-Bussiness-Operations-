import React, { useState } from "react";

const GoalForm = ({ onResult, loading, setLoading }) => {
  const [formData, setFormData] = useState({
    goal: "",
    business_type: "",
    target_audience: "",
    budget: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.goal || !formData.business_type || !formData.target_audience || !formData.budget) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8001/submit-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, budget: parseFloat(formData.budget) }),
      });
      if (!res.ok) throw new Error("Server error: " + res.status);
      const data = await res.json();
      onResult(data);
    } catch (err) {
      setError("Failed to connect. Make sure the backend is running on port 8001.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.badge}>AI POWERED</div>
          <h1 style={styles.title}>Autonomous Business<br />Operator AI</h1>
          <p style={styles.subtitle}>
            Enter your business goal. Our multi-agent system will generate a complete strategy, marketing plan, and analytics report.
          </p>
        </div>

        {/* Form Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.dot} />
            <span style={styles.dot2} />
            <span style={styles.dot3} />
            <span style={styles.cardTitle}>submit_goal.json</span>
          </div>

          <div style={styles.fields}>
            <Field label="GOAL" name="goal" placeholder="e.g. Increase monthly revenue by 30%" value={formData.goal} onChange={handleChange} />
            <Field label="BUSINESS TYPE" name="business_type" placeholder="e.g. Coffee Shop, SaaS, E-commerce" value={formData.business_type} onChange={handleChange} />
            <Field label="TARGET AUDIENCE" name="target_audience" placeholder="e.g. Young professionals aged 22-35" value={formData.target_audience} onChange={handleChange} />
            <Field label="BUDGET ($)" name="budget" placeholder="e.g. 5000" type="number" value={formData.budget} onChange={handleChange} />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            style={loading ? styles.btnLoading : styles.btn}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span>
                <span style={styles.spinner}>⟳</span> Generating Plan — this takes 1-3 minutes...
              </span>
            ) : (
              "→ Generate Strategy"
            )}
          </button>

          {loading && (
            <p style={styles.loadingNote}>
              🤖 Agents are working: Strategy → Marketing → Analytics<br />
              RAG memory is loading past strategies to improve your results.
            </p>
          )}
        </div>

        <p style={styles.footer}>
          Powered by llama3.2 · RAG Memory · FAISS · FastAPI
        </p>
      </div>
    </div>
  );
};

const Field = ({ label, name, placeholder, value, onChange, type = "text" }) => (
  <div style={styles.field}>
    <label style={styles.label}>{label}</label>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={styles.input}
      onFocus={e => e.target.style.borderColor = "#00ff88"}
      onBlur={e => e.target.style.borderColor = "#2a2a2a"}
    />
  </div>
);

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    padding: "40px 20px",
  },
  container: {
    width: "100%",
    maxWidth: "640px",
  },
  header: {
    marginBottom: "32px",
  },
  badge: {
    display: "inline-block",
    background: "#00ff8822",
    color: "#00ff88",
    border: "1px solid #00ff8844",
    borderRadius: "4px",
    padding: "4px 10px",
    fontSize: "11px",
    letterSpacing: "2px",
    marginBottom: "16px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0 0 12px 0",
    lineHeight: "1.2",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#666",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: 0,
  },
  card: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: "12px",
    overflow: "hidden",
  },
  cardHeader: {
    background: "#161616",
    borderBottom: "1px solid #222",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  dot: { width: 12, height: 12, borderRadius: "50%", background: "#ff5f57", display: "inline-block" },
  dot2: { width: 12, height: 12, borderRadius: "50%", background: "#febc2e", display: "inline-block" },
  dot3: { width: 12, height: 12, borderRadius: "50%", background: "#28c840", display: "inline-block" },
  cardTitle: { color: "#444", fontSize: "12px", marginLeft: "8px" },
  fields: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: {
    color: "#00ff88",
    fontSize: "10px",
    letterSpacing: "2px",
    fontWeight: "600",
  },
  input: {
    background: "#0a0a0a",
    border: "1px solid #2a2a2a",
    borderRadius: "6px",
    padding: "12px 14px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  btn: {
    margin: "0 24px 24px",
    width: "calc(100% - 48px)",
    padding: "14px",
    background: "#00ff88",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    letterSpacing: "0.5px",
    fontFamily: "inherit",
  },
  btnLoading: {
    margin: "0 24px 16px",
    width: "calc(100% - 48px)",
    padding: "14px",
    background: "#1a1a1a",
    color: "#00ff88",
    border: "1px solid #00ff8844",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "not-allowed",
    fontFamily: "inherit",
  },
  spinner: {
    display: "inline-block",
    animation: "spin 1s linear infinite",
    marginRight: "8px",
  },
  loadingNote: {
    color: "#555",
    fontSize: "12px",
    lineHeight: "1.8",
    textAlign: "center",
    padding: "0 24px 20px",
    margin: 0,
  },
  error: {
    color: "#ff4444",
    fontSize: "12px",
    margin: "0 24px 16px",
    padding: "10px",
    background: "#ff000011",
    border: "1px solid #ff000033",
    borderRadius: "4px",
  },
  footer: {
    textAlign: "center",
    color: "#333",
    fontSize: "11px",
    marginTop: "24px",
    letterSpacing: "1px",
  },
};

export default GoalForm;
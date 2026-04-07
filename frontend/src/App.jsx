import React, { useState } from "react";
import axios from "axios";
import StrategyResult from "./components/StrategyResult";

function App() {
  const [formData, setFormData] = useState({
    goal: "",
    business_type: "",
    target_audience: "",
    budget: ""
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/submit-goal", {
        ...formData,
        budget: Number(formData.budget)
      });

      setResult(response.data);

      const newHistoryItem = {
        id: Date.now(),
        goal: formData.goal,
        business_type: formData.business_type,
        overall_score: response.data.overall_score
      };

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error("API failed:", error);
      alert("Something went wrong while generating the strategy.");
    } finally {
      setLoading(false);
    }
  };

  const pageStyle = {
    minHeight: "100vh",
    background: "#f4f7fb",
    fontFamily: "Arial, sans-serif",
    padding: "24px"
  };

  const headerStyle = {
    marginBottom: "24px"
  };

  const titleStyle = {
    fontSize: "36px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0
  };

  const subtitleStyle = {
    marginTop: "8px",
    color: "#6b7280",
    fontSize: "16px"
  };

  const layoutStyle = {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "24px",
    alignItems: "start"
  };

  const cardStyle = {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb"
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    marginBottom: "14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "15px",
    boxSizing: "border-box"
  };

  const buttonStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: loading ? "#93c5fd" : "#2563eb",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: loading ? "not-allowed" : "pointer",
    marginTop: "8px"
  };

  const sectionTitleStyle = {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "16px"
  };

  const historyItemStyle = {
    padding: "12px",
    borderRadius: "12px",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    marginBottom: "12px"
  };

  const historyGoalStyle = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111827",
    marginBottom: "4px"
  };

  const historyMetaStyle = {
    fontSize: "13px",
    color: "#6b7280"
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Autonomous Business Operator AI</h1>
        <p style={subtitleStyle}>
          Generate business growth strategies with scores, actions, and recommendations.
        </p>
      </div>

      <div style={layoutStyle}>
        {/* Left Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>Input Panel</div>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="goal"
                placeholder="Enter your goal"
                value={formData.goal}
                onChange={handleChange}
                style={inputStyle}
                required
              />

              <input
                type="text"
                name="business_type"
                placeholder="Enter business type"
                value={formData.business_type}
                onChange={handleChange}
                style={inputStyle}
                required
              />

              <input
                type="text"
                name="target_audience"
                placeholder="Enter target audience"
                value={formData.target_audience}
                onChange={handleChange}
                style={inputStyle}
                required
              />

              <input
                type="number"
                name="budget"
                placeholder="Enter budget"
                value={formData.budget}
                onChange={handleChange}
                style={inputStyle}
                required
              />

              <button type="submit" style={buttonStyle} disabled={loading}>
                {loading ? "Generating..." : "Generate Strategy"}
              </button>
            </form>
          </div>

          <div style={cardStyle}>
            <div style={sectionTitleStyle}>Recent History</div>

            {history.length === 0 ? (
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                No history yet. Generate a strategy to see recent items here.
              </p>
            ) : (
              history.map((item) => (
                <div key={item.id} style={historyItemStyle}>
                  <div style={historyGoalStyle}>{item.goal}</div>
                  <div style={historyMetaStyle}>
                    {item.business_type} • Score: {item.overall_score}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Content */}
        <div style={cardStyle}>
          {!result ? (
            <div>
              <div style={sectionTitleStyle}>Strategy Output</div>
              <p style={{ color: "#6b7280", fontSize: "15px", lineHeight: "1.6" }}>
                Your generated strategy will appear here. You’ll see a summary, overall score,
                breakdown scores, channels, actions, and recommendations.
              </p>
            </div>
          ) : (
            <StrategyResult result={result} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
import React from "react";

function StrategyResult({ result }) {
  if (!result) return null;

  const cardGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginTop: "16px",
    marginBottom: "24px"
  };

  const scoreCardStyle = {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "16px"
  };

  const blockStyle = {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "18px",
    marginBottom: "18px"
  };

  const listStyle = {
    margin: 0,
    paddingLeft: "20px",
    lineHeight: "1.8",
    color: "#111827"
  };

  const headingStyle = {
    fontSize: "30px",
    fontWeight: "700",
    marginBottom: "10px",
    color: "#111827"
  };

  const subHeadingStyle = {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "10px",
    color: "#111827"
  };

  return (
    <div>
      <h2 style={headingStyle}>Strategy Result</h2>

      <div style={blockStyle}>
        <div style={subHeadingStyle}>Summary</div>
        <p style={{ margin: 0, color: "#374151", lineHeight: "1.7", fontSize: "16px" }}>
          {result.summary}
        </p>
      </div>

      <div style={blockStyle}>
        <div style={subHeadingStyle}>Overall Score</div>
        <div
          style={{
            fontSize: "36px",
            fontWeight: "700",
            color: "#2563eb"
          }}
        >
          {result.overall_score}/100
        </div>
      </div>

      <div>
        <div style={subHeadingStyle}>Score Breakdown</div>
        <div style={cardGridStyle}>
          {result.scores &&
            Object.entries(result.scores).map(([key, value]) => (
              <div key={key} style={scoreCardStyle}>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "8px",
                    textTransform: "capitalize"
                  }}
                >
                  {key.replaceAll("_", " ")}
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#111827"
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
        </div>
      </div>

      <div style={blockStyle}>
        <div style={subHeadingStyle}>Recommended Channels</div>
        <ul style={listStyle}>
          {result.channels && result.channels.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>

      <div style={blockStyle}>
        <div style={subHeadingStyle}>Action Plan</div>
        <ul style={listStyle}>
          {result.actions && result.actions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>

      <div style={blockStyle}>
        <div style={subHeadingStyle}>Recommendations</div>
        <ul style={listStyle}>
          {result.recommendations && result.recommendations.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default StrategyResult;
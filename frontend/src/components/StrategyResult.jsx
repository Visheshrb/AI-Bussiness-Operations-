import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const StrategyResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state?.data;

  if (!result) {
    return (
      <div className="container">
        <h2>No data found</h2>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  const strategy = result.strategy || {};
  const marketing = result.marketing_plan || {};
  const analytics = result.analytics || {};

  return (
    <div className="container">
      <h1>📊 Strategy Result</h1>

      <div className="card">
        <h2>🚀 Strategy</h2>
        <p>{strategy.summary}</p>

        <h3>Channels</h3>
        <ul>
          {strategy.channels?.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2>📢 Marketing Plan</h2>
        <ul>
          {marketing.content_plan_list?.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2>📈 Analytics</h2>
        <p><strong>Score:</strong> {analytics.performance_score}</p>
      </div>

      <button onClick={() => navigate("/")}>
        Back to Home
      </button>
    </div>
  );
};

export default StrategyResult;
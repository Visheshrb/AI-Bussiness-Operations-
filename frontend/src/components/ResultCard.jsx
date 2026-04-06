function ResultCard({ result }) {
  if (!result) {
    return (
      <div className="panel-card">
        <h2>Analysis Result</h2>
        <p>No result yet</p>
      </div>
    );
  }

  const strategy = result.strategy || {};

  return (
    <div className="panel-card">
      <h2>Analysis Result</h2>

      <div className="result-section">
        <h3>🎯 Goal</h3>
        <p>{result.goal}</p>
      </div>

      <div className="result-section">
        <h3>🧠 Summary</h3>
        <p>{strategy.summary}</p>
      </div>

      <div className="result-section">
        <h3>📢 Channels</h3>
        <ul>
          {strategy.channels?.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </div>

      <div className="result-section">
        <h3>⚙️ Actions</h3>
        <ul>
          {strategy.actions?.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ResultCard;
function HistoryPanel({ history, loading, onSelect }) {
  return (
    <div className="panel-card history-card">
      <div className="card-header">
        <h2>History</h2>
        <p>Previous analyses</p>
      </div>

      {loading ? (
        <p className="history-empty">Loading history...</p>
      ) : history.length === 0 ? (
        <p className="history-empty">No saved analyses yet</p>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <button
              key={item.id}
              className="history-item"
              onClick={() => onSelect(item)}
            >
              <div className="history-item-top">
                <span className="history-type">{item.business_type}</span>
                <span className="history-budget">${item.budget}</span>
              </div>

              <p className="history-goal">{item.goal}</p>
              <p className="history-audience">{item.target_audience}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryPanel;
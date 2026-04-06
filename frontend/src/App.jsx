import { useEffect, useState } from "react";
import GoalForm from "./components/GoalForm";
import ResultCard from "./components/ResultCard";
import HistoryPanel from "./components/HistoryPanel";
import api from "./services/api";
import "./index.css";

function App() {
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get("/goals");
      setHistory(response.data.goals || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="dashboard-layout">
      <div className="left-column">
        <GoalForm setResult={setResult} onSuccess={fetchHistory} />
      </div>

      <div className="center-column">
        <ResultCard result={result} />
      </div>

      <div className="right-column">
        <HistoryPanel
          history={history}
          loading={loadingHistory}
          onSelect={(item) =>
            setResult({
              goal: item.goal,
              strategy: {
                summary: item.summary,
                channels: item.channels,
                actions: item.actions,
              },
            })
          }
        />
      </div>
    </div>
  );
}

export default App;
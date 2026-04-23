import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GoalForm from "./components/GoalForm";
import StrategyResult from "./components/StrategyResult";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GoalForm />} />
        <Route path="/history" element={<StrategyResult />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
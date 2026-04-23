import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const GoalForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    goal: "",
    business_type: "",
    target_audience: "",
    budget: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/submit-goal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget),
        }),
      });

      const data = await res.json();

      navigate("/history", { state: { data } });

    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>🚀 Autonomous Business Operator AI</h1>

      <div className="card">
        <input
          name="goal"
          placeholder="Enter your goal"
          onChange={handleChange}
        />

        <input
          name="business_type"
          placeholder="Business type (e.g. SaaS)"
          onChange={handleChange}
        />

        <input
          name="target_audience"
          placeholder="Target audience"
          onChange={handleChange}
        />

        <input
          name="budget"
          placeholder="Budget"
          onChange={handleChange}
        />

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Generating..." : "Generate Plan"}
        </button>
      </div>
    </div>
  );
};

export default GoalForm;
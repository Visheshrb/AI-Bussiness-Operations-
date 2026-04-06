import { useState } from "react";
import api from "../services/api";

function GoalForm({ setResult, onSuccess }) {
  const [formData, setFormData] = useState({
    goal: "",
    business_type: "",
    target_audience: "",
    budget: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/submit-goal", {
        goal: formData.goal,
        business_type: formData.business_type,
        target_audience: formData.target_audience,
        budget: Number(formData.budget),
      });

      setResult(response.data);
      setMessage("✅ Submitted successfully");

      setFormData({
        goal: "",
        business_type: "",
        target_audience: "",
        budget: "",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Full error:", error);
      console.error("Response data:", error.response?.data);

      if (error.response?.data) {
        setMessage(`❌ ${JSON.stringify(error.response.data)}`);
      } else {
        setMessage("❌ Error submitting data");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel-card">
      <div className="card-header">
        <h2>New Analysis</h2>
        <p>Fill in the details below</p>
      </div>

      <form onSubmit={handleSubmit} className="goal-form">
        <textarea
          name="goal"
          placeholder="Enter your business goal"
          rows="4"
          value={formData.goal}
          onChange={handleChange}
          required
        />

        <select
          name="business_type"
          value={formData.business_type}
          onChange={handleChange}
          required
        >
          <option value="">Select business type</option>
          <option value="Startup">Startup</option>
          <option value="Real Estate">Real Estate</option>
          <option value="Business">Business</option>
          <option value="E-commerce">E-commerce</option>
          <option value="SaaS">SaaS</option>
          <option value="Agency">Agency</option>
        </select>

        <input
          type="text"
          name="target_audience"
          placeholder="Enter target audience"
          value={formData.target_audience}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="budget"
          placeholder="Enter budget"
          value={formData.budget}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Running..." : "Run Analysis"}
        </button>
      </form>

      {message && <p className="form-message">{message}</p>}
    </div>
  );
}

export default GoalForm;
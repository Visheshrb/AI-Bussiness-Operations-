"""
Strategy Agent — app/agents/strategy_agent.py
RAG retrieves past strategies → injected into prompt → llama3 generates better output → stored back
"""

import requests
from app.core.rag import retrieve_context, store_context
from app.core.config import settings


class StrategyAgent:

    def run(self, goal: str, business_type: str, target_audience: str, budget: str) -> str:

        user_input = f"{goal} | {business_type} | {target_audience} | {budget}"

        # ── 1. RAG: retrieve relevant past strategies ─────────────────────────
        context = retrieve_context(user_input, k=3)
        past_insights = context if context else "No past strategies stored yet."

        # ── 2. Build prompt with RAG context injected ─────────────────────────
        prompt = f"""You are a business strategy expert.

USER INPUT:
- Goal: {goal}
- Business Type: {business_type}
- Target Audience: {target_audience}
- Budget: {budget}

RELEVANT PAST STRATEGIES (use these to improve your answer, avoid past mistakes):
{past_insights}

Return ONLY a valid JSON object with these exact fields:
{{
  "summary": "one paragraph describing the strategy",
  "overall_score": 85,
  "scores": {{
    "market_fit": 80,
    "budget_strength": 75,
    "audience_clarity": 90,
    "execution_readiness": 85
  }},
  "channels": ["channel1", "channel2", "channel3"],
  "actions": ["action1", "action2", "action3", "action4"],
  "recommendations": ["rec1", "rec2", "rec3", "rec4"]
}}

Output ONLY the JSON. No explanation, no markdown, no extra text."""

        # ── 3. Call Ollama llama3 ─────────────────────────────────────────────
        response = requests.post(
            f"{settings.ollama_base_url}/api/generate",
            json={
                "model": settings.ollama_model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "num_predict": 1000
                }
            },
            timeout=120
        )

        result = response.json().get("response", "").strip()

        # ── 4. RAG: store this run so future strategies can learn from it ─────
        store_context(f"INPUT: {user_input}\nSTRATEGY OUTPUT: {result}")

        return result
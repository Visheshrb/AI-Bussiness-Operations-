"""
app/services/strategy_service.py  — FIXED
- Timeout increased to 180s (llama3 needs time)
- Better JSON extraction (strips markdown fences)
- RAG store/retrieve working correctly
"""

import json
import re
import requests
from app.core.config import settings
from app.core.rag import retrieve_context, store_context


def generate_strategy(goal: str, business_type: str, target_audience: str, budget: float):

    query = f"{goal} {business_type} {target_audience} {budget}"

    # 🔍 Retrieve past knowledge from RAG
    context = retrieve_context(query)

    prompt = f"""You are a business growth strategist.

Given the following input:
- Goal: {goal}
- Business Type: {business_type}
- Target Audience: {target_audience}
- Budget: {budget}

Relevant Past Insights:
{context if context else "No past data available"}

Return ONLY valid JSON in this exact format:
{{
  "summary": "short strategy summary",
  "overall_score": 75,
  "scores": {{
    "market_fit": 70,
    "budget_strength": 65,
    "audience_clarity": 80,
    "execution_readiness": 85
  }},
  "channels": ["channel1", "channel2", "channel3"],
  "actions": ["action1", "action2", "action3", "action4"],
  "recommendations": [
    "recommendation1",
    "recommendation2",
    "recommendation3",
    "recommendation4"
  ]
}}

Rules:
- Output ONLY the JSON object
- No markdown, no backticks, no explanation
- overall_score must be between 0 and 100
- Each score must be between 0 and 100
- Exactly 3 channels, 4 actions, 4 recommendations
- Learn from past insights, avoid repeating weak strategies"""

    try:
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
            timeout=180  # ✅ FIXED: was 60, llama3 needs up to 3 min on CPU
        )

        response.raise_for_status()
        raw_text = response.json().get("response", "").strip()

        # Strip markdown fences if model adds them
        cleaned = re.sub(r"```json|```", "", raw_text).strip()

        # Extract JSON object if there's extra text around it
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            cleaned = match.group(0)

        result = json.loads(cleaned)

        # Clamp scores to 0-100
        result["overall_score"] = max(0, min(100, int(result.get("overall_score", 70))))
        if "scores" in result:
            for key in result["scores"]:
                result["scores"][key] = max(0, min(100, int(result["scores"][key])))

        # 💾 Store successful result in RAG for future use
        store_context(
            f"Goal: {goal}\n"
            f"Business: {business_type}\n"
            f"Audience: {target_audience}\n"
            f"Budget: {budget}\n"
            f"Strategy Output:\n{json.dumps(result)}"
        )

        print(f"✅ Strategy generated successfully for: {business_type}")
        return result

    except Exception as e:
        print(f"❌ Strategy generation failed: {e}")

        fallback = {
            "summary": f"Focused growth strategy for {business_type} to achieve: {goal}",
            "overall_score": 70,
            "scores": {
                "market_fit": 70,
                "budget_strength": 65,
                "audience_clarity": 72,
                "execution_readiness": 73
            },
            "channels": ["Social Media", "Email Marketing", "SEO"],
            "actions": [
                "Define your core offer clearly",
                "Launch one small test campaign",
                "Track conversions weekly",
                "Improve your online presence"
            ],
            "recommendations": [
                "Start with one channel and master it",
                "Use budget carefully in early testing",
                "Focus on consistent messaging",
                "Review metrics and improve every week"
            ]
        }

        # Store the failed attempt so RAG learns what inputs cause issues
        store_context(f"FAILED ATTEMPT — Goal: {goal}, Business: {business_type}, Error: {str(e)}")

        return fallback
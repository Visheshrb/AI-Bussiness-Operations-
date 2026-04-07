import json
import requests
from app.core.config import settings


def generate_strategy(goal: str, business_type: str, target_audience: str, budget: float):
    prompt = f"""
You are a business growth strategist.

Given the following input:
- Goal: {goal}
- Business Type: {business_type}
- Target Audience: {target_audience}
- Budget: {budget}

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
- Output only JSON
- No markdown
- No explanation
- overall_score must be between 0 and 100
- Each score must be between 0 and 100
- Keep exactly 3 channels
- Keep exactly 4 actions
- Keep exactly 4 recommendations
- Keep summary short
"""

    try:
        response = requests.post(
            f"{settings.ollama_base_url}/api/generate",
            json={
                "model": settings.ollama_model,
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )

        response.raise_for_status()
        data = response.json()

        raw_text = data.get("response", "").strip()

        # Parse JSON safely
        result = json.loads(raw_text)

        # Minimal validation
        result["overall_score"] = max(0, min(100, int(result.get("overall_score", 0))))

        if "scores" in result:
            for key in result["scores"]:
                result["scores"][key] = max(0, min(100, int(result["scores"][key])))

        return result

    except Exception as e:
        # fallback response
        return {
            "summary": "Strategy generated with fallback mode.",
            "overall_score": 70,
            "scores": {
                "market_fit": 72,
                "budget_strength": 65,
                "audience_clarity": 70,
                "execution_readiness": 73
            },
            "channels": ["Social Media", "Email Marketing", "SEO"],
            "actions": [
                "Define a clearer audience segment",
                "Launch one small campaign first",
                "Track conversions weekly",
                "Improve online presence"
            ],
            "recommendations": [
                "Start with one core growth channel",
                "Use budget carefully in early testing",
                "Focus on consistent messaging",
                "Review metrics and improve every week"
            ],
            "error": str(e)
        }
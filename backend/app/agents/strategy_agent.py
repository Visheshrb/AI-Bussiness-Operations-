import requests
from app.core.config import settings
from app.services.parser import (
    extract_json_from_text,
    validate_strategy_output,
    get_fallback_strategy,
)


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
  "channels": ["channel1", "channel2", "channel3"],
  "actions": ["action1", "action2", "action3", "action4"]
}}

Rules:
- Output only JSON
- No markdown
- No explanation
- No extra text before or after JSON
- Keep summary short
- Keep exactly 3 channels
- Keep exactly 4 actions
- channels must contain only strings
- actions must contain only strings
"""

    try:
        response = requests.post(
            f"{settings.ollama_base_url}/api/generate",
            json={
                "model": settings.ollama_model,
                "prompt": prompt,
                "stream": False
            },
            timeout=300
        )

        response.raise_for_status()
        data = response.json()
        text_output = data.get("response", "").strip()

        parsed = extract_json_from_text(text_output)
        validated = validate_strategy_output(parsed)

        return validated

    except Exception as e:
        print("Strategy generation failed:", str(e))
        return get_fallback_strategy(goal, business_type, target_audience, budget)
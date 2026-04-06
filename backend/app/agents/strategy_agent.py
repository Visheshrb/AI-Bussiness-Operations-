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
  "channels": ["channel1", "channel2", "channel3"],
  "actions": ["action1", "action2", "action3", "action4"]
}}

Rules:
- Output only JSON
- No markdown
- No explanation
- Keep summary short
- Keep exactly 3 channels
- Keep 4 actions
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

        # Try parsing model output as JSON
        parsed = json.loads(text_output)

        return {
            "summary": parsed.get("summary", "No summary generated."),
            "channels": parsed.get("channels", []),
            "actions": parsed.get("actions", [])
        }

    except Exception as e:
        return {
            "summary": f"Structured output failed: {str(e)}",
            "channels": ["Fallback Channel 1", "Fallback Channel 2", "Fallback Channel 3"],
            "actions": [
                "Check if Ollama is running",
                "Check if model output is valid JSON",
                "Retry with a smaller model",
                "Refine the prompt"
            ]
        }
from openai import OpenAI
from app.core.config import settings


def generate_strategy(goal: str, business_type: str, target_audience: str, budget: float):
    # Fallback if API key is missing
    if not settings.openai_api_key:
        return {
            "summary": "OPENAI_API_KEY is missing. Add it in backend/.env to get live AI output.",
            "channels": ["LinkedIn", "Email"],
            "actions": [
                "Add OPENAI_API_KEY to .env",
                "Restart the FastAPI server",
                "Test /submit-goal again"
            ]
        }

    client = OpenAI(api_key=settings.openai_api_key)

    prompt = f"""
You are a business growth strategist.

Create a short business growth strategy in JSON-like style for this input:

Goal: {goal}
Business Type: {business_type}
Target Audience: {target_audience}
Budget: {budget}

Return:
1. summary
2. 3 best channels
3. 3-5 action steps

Keep it practical, short, and startup-friendly.
"""

    response = client.responses.create(
        model=settings.openai_model,
        input=prompt
    )

    text_output = response.output_text.strip()

    return {
        "summary": text_output,
        "channels": ["AI-generated"],
        "actions": [
            "Review generated strategy",
            "Refine prompts",
            "Convert output to structured JSON next"
        ]
    }
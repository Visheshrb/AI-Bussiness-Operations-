import json
import re


def extract_json_from_text(text: str):
    if not text:
        raise ValueError("Empty model output")

    text = text.strip()

    # Try direct JSON
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Remove markdown code fences if present
    cleaned = text.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Extract first JSON object from text
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        possible_json = match.group(0)
        return json.loads(possible_json)

    raise ValueError("No valid JSON found in model output")


def validate_strategy_output(data: dict):
    if not isinstance(data, dict):
        raise ValueError("Output is not a dictionary")

    if "summary" not in data or not isinstance(data["summary"], str):
        raise ValueError("Missing or invalid 'summary'")

    if "channels" not in data or not isinstance(data["channels"], list):
        raise ValueError("Missing or invalid 'channels'")

    if "actions" not in data or not isinstance(data["actions"], list):
        raise ValueError("Missing or invalid 'actions'")

    if not all(isinstance(item, str) for item in data["channels"]):
        raise ValueError("'channels' must contain only strings")

    if not all(isinstance(item, str) for item in data["actions"]):
        raise ValueError("'actions' must contain only strings")

    return {
        "summary": data["summary"],
        "channels": data["channels"],
        "actions": data["actions"],
    }


def get_fallback_strategy(goal: str, business_type: str, target_audience: str, budget: float):
    return {
        "summary": (
            f"Create a focused strategy for {business_type} targeting {target_audience} "
            f"with a budget of {budget}. Start with a simple offer, validate demand, "
            f"and expand using cost-effective channels."
        ),
        "channels": [
            "Social Media",
            "Direct Outreach",
            "Industry Communities"
        ],
        "actions": [
            "Define the core offer clearly",
            "Build a simple MVP or landing page",
            "Test demand with the target audience",
            "Track results and improve weekly"
        ]
    }
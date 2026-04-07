from fastapi import APIRouter
from pydantic import BaseModel
import json
import requests

router = APIRouter()


class GoalRequest(BaseModel):
    goal: str
    business_type: str
    target_audience: str
    budget: float


class StrategyResponse(BaseModel):
    summary: str
    overall_score: int
    scores: dict
    channels: list
    actions: list
    recommendations: list


def extract_json(text: str):
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        return text[start:end + 1]
    return text


def extract_json(text: str):
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        return text[start:end + 1]
    return text


def generate_strategy(goal, business_type, target_audience, budget):
    prompt = f"""
You are a business growth strategist.

Input:
Goal: {goal}
Business Type: {business_type}
Target Audience: {target_audience}
Budget: {budget}

Return only valid JSON:
{{
  "summary": "short summary",
  "overall_score": 75,
  "scores": {{
    "market_fit": 70,
    "budget_strength": 65,
    "audience_clarity": 80,
    "execution_readiness": 85
  }},
  "channels": ["channel1", "channel2", "channel3"],
  "actions": ["action1", "action2", "action3", "action4"],
  "recommendations": ["r1", "r2", "r3", "r4"]
}}
"""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            },
            timeout=180
        )

        response.raise_for_status()
        data = response.json()
        raw = data.get("response", "").strip()

        print("RAW OLLAMA RESPONSE:", raw)

        cleaned = extract_json(raw)
        result = json.loads(cleaned)

        result["overall_score"] = max(0, min(100, int(result.get("overall_score", 0))))

        if "scores" in result:
            for key in result["scores"]:
                result["scores"][key] = max(0, min(100, int(result["scores"][key])))

        return result

    except Exception as e:
        print("ERROR IN generate_strategy:", str(e))
        return {
            "summary": f"Fallback strategy. Error: {str(e)}",
            "overall_score": 70,
            "scores": {
                "market_fit": 70,
                "budget_strength": 65,
                "audience_clarity": 72,
                "execution_readiness": 75
            },
            "channels": ["Social Media", "SEO", "Email"],
            "actions": [
                "Define audience",
                "Run small campaign",
                "Track weekly",
                "Improve messaging"
            ],
            "recommendations": [
                "Focus on one channel first",
                "Use budget carefully",
                "Test and iterate",
                "Track performance weekly"
            ]
        }


@router.post("/submit-goal", response_model=StrategyResponse)
def submit_goal(data: GoalRequest):
    return generate_strategy(
        data.goal,
        data.business_type,
        data.target_audience,
        data.budget
    )
@router.get("/")
def home():
    return {"message": "Autonomous Business Operator AI backend is running"}


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.get("/history")
def get_history():
    return {
        "history": [
            {"goal": "Increase leads by 30%", "business_type": "Fitness coaching", "score": 75},
            {"goal": "Get first 100 paying users", "business_type": "SaaS", "score": 78}
        ]
    }
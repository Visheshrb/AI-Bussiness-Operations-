"""
app/services/strategy_service.py
- Shorter prompt so RAG context doesn't bloat it
- num_predict reduced to 600 (was 1000) — faster, still enough for JSON
- Retry once on timeout
- Truncates RAG context to avoid prompt overflow
"""

import json
import re
import time
import requests
from app.core.config import settings
from app.core.rag import retrieve_context, store_context


def _truncate_context(context: str, max_chars: int = 800) -> str:
    """Keep RAG context short so it doesn't slow down generation."""
    if len(context) <= max_chars:
        return context
    return context[:max_chars] + "\n...[truncated]"


def generate_strategy(goal: str, business_type: str, target_audience: str, budget: float):

    query = f"{goal} {business_type} {target_audience} {budget}"

    # 🔍 Retrieve past knowledge — truncated to keep prompt small
    raw_context = retrieve_context(query, k=2)  # k=2 not 3 — less context = faster
    context = _truncate_context(raw_context) if raw_context else "No past data available"

    prompt = f"""You are a business strategist. Return ONLY valid JSON, no other text.

Input:
- Goal: {goal}
- Business: {business_type}
- Audience: {target_audience}
- Budget: ${budget}

Past insights: {context}

JSON format:
{{
  "summary": "2 sentence strategy summary",
  "overall_score": 75,
  "scores": {{"market_fit": 70, "budget_strength": 65, "audience_clarity": 80, "execution_readiness": 85}},
  "channels": ["channel1", "channel2", "channel3"],
  "actions": ["action1", "action2", "action3", "action4"],
  "recommendations": ["rec1", "rec2", "rec3", "rec4"]
}}"""

    for attempt in range(1, 3):
        try:
            print(f"📊 Strategy agent attempt {attempt}/2...")

            response = requests.post(
                f"{settings.ollama_base_url}/api/generate",
                json={
                    "model": settings.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.6,
                        "num_predict": 600  # was 1000 — shorter = faster = less timeout risk
                    }
                },
                timeout=180
            )

            response.raise_for_status()
            raw_text = response.json().get("response", "").strip()

            cleaned = re.sub(r"```json|```", "", raw_text).strip()
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)
            if match:
                cleaned = match.group(0)

            result = json.loads(cleaned)

            # Clamp scores to 0-100
            result["overall_score"] = max(0, min(100, int(result.get("overall_score", 70))))
            if "scores" in result:
                for key in result["scores"]:
                    result["scores"][key] = max(0, min(100, int(result["scores"][key])))

            # 💾 Store in RAG
            store_context(
                f"Goal: {goal}\nBusiness: {business_type}\n"
                f"Audience: {target_audience}\nBudget: {budget}\n"
                f"Strategy: {json.dumps(result)}"
            )

            print(f"✅ Strategy generated for: {business_type}")
            return result

        except Exception as e:
            print(f"❌ Strategy attempt {attempt} failed: {e}")
            if attempt < 2:
                print("🔄 Retrying in 8s...")
                time.sleep(8)

    # Fallback
    print("⚠️ Using fallback strategy")
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
    store_context(f"FAILED — Goal: {goal}, Business: {business_type}, Error: timeout")
    return fallback
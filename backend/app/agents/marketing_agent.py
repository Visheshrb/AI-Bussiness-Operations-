"""
app/agents/marketing_agent.py
- Truncates RAG context to prevent prompt overflow
- num_predict reduced to 500 — marketing JSON is smaller than strategy
- JSON repair: tries to fix truncated JSON before giving up
- Retry once, then clean fallback
"""

import re
import json
import time
import requests
from app.core.rag import retrieve_context, store_context
from app.core.config import settings


def _truncate_context(context: str, max_chars: int = 600) -> str:
    if len(context) <= max_chars:
        return context
    return context[:max_chars] + "\n...[truncated]"


def _repair_json(text: str) -> dict:
    """
    Try to salvage truncated JSON from llama3.2.
    If the model cuts off mid-string, this attempts to close the structure.
    """
    # Remove trailing incomplete lines
    lines = text.strip().split("\n")
    while lines and not lines[-1].strip().endswith(('"', ']', '}')):
        lines.pop()
    text = "\n".join(lines)

    # Try to close any open brackets
    open_braces = text.count("{") - text.count("}")
    open_brackets = text.count("[") - text.count("]")

    text = text.rstrip(",").rstrip()
    text += "]" * open_brackets
    text += "}" * open_braces

    return json.loads(text)


class MarketingAgent:

    def run(self, goal: str, business_type: str, target_audience: str, budget: float) -> str:

        user_input = f"{goal} {business_type} {target_audience} {budget}"

        # 🔍 RAG: retrieve and truncate context
        raw_context = retrieve_context(user_input, k=2)
        context = _truncate_context(raw_context) if raw_context else "No past data available"
        print("MARKETING AGENT CONTEXT:", context[:100] + "..." if len(context) > 100 else context)

        prompt = f"""You are a marketing strategist. Return ONLY valid JSON, no other text.

Input:
- Goal: {goal}
- Business: {business_type}
- Audience: {target_audience}
- Budget: ${budget}

Past campaigns: {context}

JSON format:
{{
  "campaign_summary": "2 sentence campaign overview",
  "campaign_type": "campaign type",
  "primary_channel": "best channel",
  "content_plan_list": ["content action 1", "content action 2", "content action 3"],
  "email_plan_list": ["email 1", "email 2", "email 3"],
  "weekly_plan_list": ["Week 1: actions", "Week 2: actions", "Week 3: actions", "Week 4: actions"]
}}"""

        # Give Ollama breathing room after strategy agent
        print("⏳ Marketing agent waiting 5s...")
        time.sleep(5)

        for attempt in range(1, 3):
            try:
                print(f"📣 Marketing agent attempt {attempt}/2...")

                response = requests.post(
                    f"{settings.ollama_base_url}/api/generate",
                    json={
                        "model": settings.ollama_model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.6,
                            "num_predict": 500  # marketing JSON is smaller — 500 is plenty
                        }
                    },
                    timeout=240
                )

                raw = response.json().get("response", "").strip()
                cleaned = re.sub(r"```json|```", "", raw).strip()

                # Extract JSON block
                match = re.search(r"\{.*\}", cleaned, re.DOTALL)
                if match:
                    cleaned = match.group(0)

                # Try normal parse first
                try:
                    result = json.loads(cleaned)
                except json.JSONDecodeError:
                    # Try to repair truncated JSON
                    print("⚠️ JSON malformed, attempting repair...")
                    result = _repair_json(cleaned)

                # 💾 Store in RAG
                store_context(
                    f"Goal: {goal}\nBusiness: {business_type}\n"
                    f"Audience: {target_audience}\nBudget: {budget}\n"
                    f"Marketing: {json.dumps(result)}"
                )

                print(f"✅ Marketing plan generated for: {business_type}")
                return json.dumps(result)

            except Exception as e:
                print(f"❌ Marketing attempt {attempt} failed: {e}")
                if attempt < 2:
                    print("🔄 Retrying in 10s...")
                    time.sleep(10)

        # Clean, specific fallback
        print("⚠️ Using fallback marketing plan")
        fallback = {
            "campaign_summary": f"Targeted {business_type} campaign reaching {target_audience} through digital channels within a ${budget} budget.",
            "campaign_type": "Brand Awareness & Lead Generation",
            "primary_channel": "Instagram",
            "content_plan_list": [
                f"5 posts showcasing {business_type} products and behind-the-scenes content",
                "2-3 customer testimonials and success stories",
                "Short-form Reels and Stories for daily engagement"
            ],
            "email_plan_list": [
                "Welcome sequence: brand story and core offer (3 emails)",
                "Nurture sequence: value content and promotions (3 emails)",
                "Re-engagement: win back inactive subscribers (2 emails)"
            ],
            "weekly_plan_list": [
                "Week 1: Set up channels, content calendar, and email platform",
                "Week 2: Launch first content series and welcome email",
                "Week 3: Analyse results and optimise top performers",
                "Week 4: Scale winners and launch monthly promotion"
            ]
        }

        store_context(
            f"FALLBACK — Goal: {goal}, Business: {business_type}, "
            f"Audience: {target_audience}, Budget: {budget}"
        )
        return json.dumps(fallback)
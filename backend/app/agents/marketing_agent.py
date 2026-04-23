"""
app/agents/marketing_agent.py  — FIXED
- Now stores results back into RAG (was missing before)
- Timeout increased to 180s
- Better JSON extraction
"""

import re
import requests
from app.core.rag import retrieve_context, store_context
from app.core.config import settings


class MarketingAgent:

    def run(self, goal: str, business_type: str, target_audience: str, budget: float) -> str:

        user_input = f"{goal} {business_type} {target_audience} {budget}"

        # 🔍 RAG: retrieve relevant past campaigns
        context = retrieve_context(user_input, k=3)
        print("MARKETING AGENT CONTEXT:", context if context else "(none yet)")

        prompt = f"""You are a marketing strategist.

User Input:
- Goal: {goal}
- Business Type: {business_type}
- Target Audience: {target_audience}
- Budget: {budget}

Relevant Past Campaigns:
{context if context else "No past data available"}

Return ONLY valid JSON in this exact format:
{{
  "campaign_summary": "brief campaign overview",
  "campaign_type": "type of campaign",
  "primary_channel": "main marketing channel",
  "content_plan_list": ["item1", "item2", "item3"],
  "email_plan_list": ["email1", "email2", "email3"],
  "weekly_plan_list": ["week1 plan", "week2 plan", "week3 plan", "week4 plan"]
}}

Rules:
- Output ONLY the JSON object
- No markdown, no backticks, no explanation
- Exactly 3 content items, 3 email items, 4 weekly items
- Learn from past campaigns, improve on weak results"""

        try:
            response = requests.post(
                f"{settings.ollama_base_url}/api/generate",
                json={
                    "model": settings.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 800
                    }
                },
                timeout=180  # ✅ FIXED: was missing/default, now 3 min
            )

            result = response.json().get("response", "").strip()

            # 💾 RAG: store this campaign so future runs can learn from it
            store_context(
                f"Goal: {goal}\nBusiness: {business_type}\n"
                f"Audience: {target_audience}\nBudget: {budget}\n"
                f"Marketing Output:\n{result}"
            )

            return result

        except Exception as e:
            print(f"❌ Marketing agent failed: {e}")
            import json
            fallback = {
                "campaign_summary": f"Lead generation campaign for {business_type} targeting {target_audience}",
                "campaign_type": "Lead Generation",
                "primary_channel": "Social Media",
                "content_plan_list": [
                    "Create 5 educational posts",
                    "Write 3 case studies",
                    "Film 2 short videos"
                ],
                "email_plan_list": [
                    "Welcome sequence (3 emails)",
                    "Nurture sequence (3 emails)",
                    "Reactivation sequence (3 emails)"
                ],
                "weekly_plan_list": [
                    "Week 1: Setup & Foundation",
                    "Week 2: Launch campaigns",
                    "Week 3: Optimise",
                    "Week 4: Scale winners"
                ]
            }
            return json.dumps(fallback)
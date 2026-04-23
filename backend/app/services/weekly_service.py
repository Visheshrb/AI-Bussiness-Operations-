"""
app/services/weekly_service.py
Now accepts sender_email + sender_app_password per request.
User provides these in the dashboard — no .env needed.
"""

import json
import re
import time
import requests
from sqlalchemy.orm import Session
from typing import Optional

from app.core.config import settings
from app.core.rag import retrieve_context, store_context
from app.models.weekly_update import WeeklyUpdate
from app.models.strategy import StrategyRecord
from app.services.email_service import send_weekly_plan_email


def generate_refined_plan(
    goal: str, business_type: str, target_audience: str, budget: float,
    week_number: int, update_text: str,
    leads_generated: int, revenue_change: float, top_channel: str,
) -> dict:
    query = f"{goal} {business_type} week {week_number} update: {update_text}"
    context = retrieve_context(query, k=2)
    context_text = context[:600] if context else "No past data available"

    prompt = f"""You are a business growth advisor reviewing a weekly progress update.

Business: {business_type} | Goal: {goal}
Audience: {target_audience} | Budget: ${budget}

Week {week_number} update: "{update_text}"
Metrics: Leads={leads_generated}, Revenue change={revenue_change}%, Top channel={top_channel or 'Not specified'}

Past context: {context_text}

Generate a refined plan for next week. Return ONLY valid JSON:
{{
  "summary": "2 sentence analysis of progress and what to focus on next week",
  "overall_score": 75,
  "scores": {{"market_fit": 70, "budget_strength": 65, "audience_clarity": 80, "execution_readiness": 85}},
  "channels": ["channel1", "channel2", "channel3"],
  "actions": ["action1", "action2", "action3", "action4"],
  "recommendations": ["rec1", "rec2", "rec3", "rec4"]
}}"""

    time.sleep(3)

    for attempt in range(1, 3):
        try:
            print(f"🔄 Refining plan attempt {attempt}/2...")
            response = requests.post(
                f"{settings.ollama_base_url}/api/generate",
                json={
                    "model": settings.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.6, "num_predict": 600}
                },
                timeout=180
            )
            raw = response.json().get("response", "").strip()
            cleaned = re.sub(r"```json|```", "", raw).strip()
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)
            if match:
                cleaned = match.group(0)
            result = json.loads(cleaned)
            result["overall_score"] = max(0, min(100, int(result.get("overall_score", 70))))
            if "scores" in result:
                for k in result["scores"]:
                    result["scores"][k] = max(0, min(100, int(result["scores"][k])))

            store_context(
                f"Week {week_number} update for {business_type}: {update_text}\n"
                f"Leads: {leads_generated}, Revenue: {revenue_change}%\n"
                f"Refined: {json.dumps(result)}"
            )
            return result

        except Exception as e:
            print(f"❌ Attempt {attempt} failed: {e}")
            if attempt < 2:
                time.sleep(10)

    # Fallback
    return {
        "summary": f"Keep building on your {business_type} strategy. Focus on what worked and cut what didn't.",
        "overall_score": 70,
        "scores": {"market_fit": 70, "budget_strength": 65, "audience_clarity": 72, "execution_readiness": 73},
        "channels": ["Social Media", "Email Marketing", "SEO"],
        "actions": ["Double down on top channel", "Improve messaging", "Track all conversions", "Reach 5 new customers directly"],
        "recommendations": ["Focus on what worked", "Cut what didn't generate results", "Set a clear weekly metric", "Review budget allocation"]
    }


def submit_weekly_update(
    db: Session,
    user_id: int,
    user_name: str,
    strategy_id: int,
    week_number: int,
    update_text: str,
    leads_generated: int,
    revenue_change: float,
    top_channel: str,
    # Email fields — optional, user provides in dashboard
    send_email: bool = False,
    sender_email: Optional[str] = None,
    sender_app_password: Optional[str] = None,
    recipient_email: Optional[str] = None,
) -> WeeklyUpdate:

    strategy = db.query(StrategyRecord).filter(StrategyRecord.id == strategy_id).first()
    if not strategy:
        raise ValueError(f"Strategy {strategy_id} not found")

    # Generate refined plan
    refined = generate_refined_plan(
        goal=strategy.goal,
        business_type=strategy.business_type,
        target_audience=strategy.target_audience,
        budget=strategy.budget,
        week_number=week_number,
        update_text=update_text,
        leads_generated=leads_generated,
        revenue_change=revenue_change,
        top_channel=top_channel,
    )

    # Save to DB
    record = WeeklyUpdate(
        user_id=user_id,
        strategy_id=strategy_id,
        week_number=week_number,
        update_text=update_text,
        leads_generated=leads_generated,
        revenue_change=revenue_change,
        top_channel=top_channel,
        refined_plan=json.dumps(refined),
        refined_summary=refined.get("summary", "")
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # Send email only if user requested it and provided credentials
    if send_email and sender_email and sender_app_password and recipient_email:
        send_weekly_plan_email(
            sender_email=sender_email,
            sender_app_password=sender_app_password,
            to_email=recipient_email,
            user_name=user_name,
            business_type=strategy.business_type,
            week_number=week_number,
            refined_summary=refined.get("summary", ""),
            refined_plan=refined
        )

    return record
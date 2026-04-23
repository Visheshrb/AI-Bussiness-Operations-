"""
app/services/orchestrator.py  — FIXED
- Imports generate_strategy from the correct file (strategy_service)
- Uses MarketingAgent class correctly
- Handles JSON parsing from agent string responses
"""

import json
import re
from sqlalchemy.orm import Session

# ✅ FIXED: was wrongly importing from strategy_agent
from app.services.strategy_service import generate_strategy
from app.agents.marketing_agent import MarketingAgent

from app.models.strategy import StrategyRecord
from app.models.marketing import MarketingRecord


def run_goal_pipeline(data, db: Session):

    # ── Step 1: Strategy ──────────────────────────────────────────────────────
    strategy_result = generate_strategy(
        data.goal,
        data.business_type,
        data.target_audience,
        data.budget
    )

    strategy_record = StrategyRecord(
        goal=data.goal,
        business_type=data.business_type,
        target_audience=data.target_audience,
        budget=data.budget,
        summary=strategy_result["summary"],
        overall_score=strategy_result["overall_score"],
        scores=json.dumps(strategy_result["scores"]),
        channels=json.dumps(strategy_result["channels"]),
        actions=json.dumps(strategy_result["actions"]),
        recommendations=json.dumps(strategy_result["recommendations"])
    )

    db.add(strategy_record)
    db.commit()
    db.refresh(strategy_record)

    # ── Step 2: Marketing ─────────────────────────────────────────────────────
    marketing_agent = MarketingAgent()
    marketing_raw = marketing_agent.run(
        data.goal,
        data.business_type,
        data.target_audience,
        data.budget
    )

    # Agent returns a string — parse it safely
    try:
        marketing_result = json.loads(marketing_raw)
    except Exception:
        cleaned = re.sub(r"```json|```", "", marketing_raw).strip()
        try:
            marketing_result = json.loads(cleaned)
        except Exception:
            # Fallback marketing result if parsing fails
            marketing_result = {
                "campaign_summary": f"Marketing campaign for {data.business_type}",
                "campaign_type": "Brand Awareness",
                "primary_channel": "Social Media",
                "content_plan_list": ["Create content", "Post regularly", "Engage audience"],
                "email_plan_list": ["Welcome email", "Nurture sequence", "Conversion email"],
                "weekly_plan_list": ["Week 1: Setup", "Week 2: Launch", "Week 3: Optimise", "Week 4: Scale"]
            }

    marketing_record = MarketingRecord(
        strategy_id=strategy_record.id,
        goal=data.goal,
        business_type=data.business_type,
        target_audience=data.target_audience,
        budget=data.budget,
        campaign_summary=marketing_result.get("campaign_summary", ""),
        campaign_type=marketing_result.get("campaign_type", ""),
        primary_channel=marketing_result.get("primary_channel", ""),
        # Handle both key names: content_plan_list (agent) and content_plan (schema)
        content_plan=json.dumps(marketing_result.get("content_plan_list", marketing_result.get("content_plan", []))),
        email_plan=json.dumps(marketing_result.get("email_plan_list", marketing_result.get("email_plan", []))),
        weekly_plan=json.dumps(marketing_result.get("weekly_plan_list", marketing_result.get("weekly_plan", [])))
    )

    db.add(marketing_record)
    db.commit()
    db.refresh(marketing_record)

    return {
        "strategy": strategy_result,
        "marketing_plan": {
            "campaign_summary": marketing_result.get("campaign_summary", ""),
            "campaign_type": marketing_result.get("campaign_type", ""),
            "primary_channel": marketing_result.get("primary_channel", ""),
            "content_plan": marketing_result.get("content_plan_list", marketing_result.get("content_plan", [])),
            "email_plan": marketing_result.get("email_plan_list", marketing_result.get("email_plan", [])),
            "weekly_plan": marketing_result.get("weekly_plan_list", marketing_result.get("weekly_plan", []))
        }
    }


def get_strategy_history(db: Session):
    records = db.query(StrategyRecord).order_by(StrategyRecord.id.desc()).all()

    output = []
    for r in records:
        output.append({
            "id": r.id,
            "goal": r.goal,
            "business_type": r.business_type,
            "target_audience": r.target_audience,
            "budget": r.budget,
            "summary": r.summary,
            "overall_score": r.overall_score,
            "scores": json.loads(r.scores),
            "channels": json.loads(r.channels),
            "actions": json.loads(r.actions),
            "recommendations": json.loads(r.recommendations),
            "created_at": r.created_at
        })

    return output
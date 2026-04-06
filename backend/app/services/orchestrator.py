import json
from sqlalchemy.orm import Session
from app.agents.strategy_agent import generate_strategy
from app.models.goal_model import GoalRecord


def run_goal_workflow(goal: str, business_type: str, target_audience: str, budget: float, db: Session):
    strategy = generate_strategy(
        goal=goal,
        business_type=business_type,
        target_audience=target_audience,
        budget=budget,
    )

    record = GoalRecord(
        goal=goal,
        business_type=business_type,
        target_audience=target_audience,
        budget=str(budget),
        summary=strategy["summary"],
        channels=json.dumps(strategy["channels"]),
        actions=json.dumps(strategy["actions"]),
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "goal": goal,
        "strategy": strategy
    }


def get_all_goals(db: Session):
    records = db.query(GoalRecord).order_by(GoalRecord.id.desc()).all()

    goals = []
    for record in records:
        goals.append({
            "id": record.id,
            "goal": record.goal,
            "business_type": record.business_type,
            "target_audience": record.target_audience,
            "budget": record.budget,
            "summary": record.summary,
            "channels": json.loads(record.channels),
            "actions": json.loads(record.actions),
        })

    return {
        "goals": goals
    }
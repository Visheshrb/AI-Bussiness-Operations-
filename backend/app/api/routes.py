from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.goal import GoalRequest, GoalResponse, SavedGoalsListResponse
from app.services.orchestrator import run_goal_workflow, get_all_goals
from app.db.database import get_db

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.post("/submit-goal", response_model=GoalResponse)
def submit_goal(payload: GoalRequest, db: Session = Depends(get_db)):
    return run_goal_workflow(
        goal=payload.goal,
        business_type=payload.business_type,
        target_audience=payload.target_audience,
        budget=payload.budget,
        db=db
    )


@router.get("/goals", response_model=SavedGoalsListResponse)
def fetch_goals(db: Session = Depends(get_db)):
    return get_all_goals(db)
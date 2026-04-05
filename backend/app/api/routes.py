from fastapi import APIRouter
from app.schemas.goal import GoalRequest, GoalResponse
from app.services.orchestrator import run_goal_workflow

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.post("/submit-goal", response_model=GoalResponse)
def submit_goal(payload: GoalRequest):
    return run_goal_workflow(
        goal=payload.goal,
        business_type=payload.business_type,
        target_audience=payload.target_audience,
        budget=payload.budget,
    )
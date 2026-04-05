from fastapi import APIRouter

from app.schemas.goal import GoalRequest, GoalResponse
from app.services.orchestrator import Orchestrator

router = APIRouter()
orchestrator = Orchestrator()


@router.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


@router.post("/submit-goal", response_model=GoalResponse)
def submit_goal(goal_request: GoalRequest) -> GoalResponse:
    return orchestrator.handle_goal(goal_request)

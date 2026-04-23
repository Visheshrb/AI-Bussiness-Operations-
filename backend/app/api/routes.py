from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.goal import GoalRequest, FullPipelineResponse, StrategyHistoryResponse
from app.db.database import get_db
from app.services.orchestrator import run_goal_pipeline, get_strategy_history

router = APIRouter()


@router.get("/")
def home():
    return {"message": "Autonomous Business Operator AI backend is running"}


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.post("/submit-goal", response_model=FullPipelineResponse)
def submit_goal(data: GoalRequest, db: Session = Depends(get_db)):
    try:
        result = run_goal_pipeline(data, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history", response_model=list[StrategyHistoryResponse])
def get_history(db: Session = Depends(get_db)):
    return get_strategy_history(db)
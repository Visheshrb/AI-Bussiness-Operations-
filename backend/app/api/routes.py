from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.schemas.goal import (
    GoalRequest, FullPipelineResponse, StrategyHistoryResponse,
    RegisterRequest, LoginRequest, TokenResponse,
    WeeklyUpdateRequest, WeeklyUpdateResponse
)
from app.db.database import get_db
from app.services.orchestrator import run_goal_pipeline, get_strategy_history
from app.services.auth_service import get_user_by_email, create_user, authenticate_user, create_access_token
from app.services.weekly_service import submit_weekly_update
from app.core.deps import get_current_user
from app.models.user import User
from app.models.weekly_update import WeeklyUpdate

router = APIRouter()


# ── Health ────────────────────────────────────────────────────────────────────
@router.get("/")
def home():
    return {"message": "Autonomous Business Operator AI — running"}

@router.get("/health")
def health_check():
    return {"status": "ok"}


# ── Auth ──────────────────────────────────────────────────────────────────────
@router.post("/auth/register", response_model=TokenResponse)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = create_user(db, data.email, data.name, data.password)
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user_id=user.id, name=user.name, email=user.email)


@router.post("/auth/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user_id=user.id, name=user.name, email=user.email)

@router.get("/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email, "name": current_user.name}


# ── Strategy ──────────────────────────────────────────────────────────────────
@router.post("/submit-goal", response_model=FullPipelineResponse)
def submit_goal(
    data: GoalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return run_goal_pipeline(data, db, user_id=current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history", response_model=list[StrategyHistoryResponse])
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_strategy_history(db, user_id=current_user.id)


# ── Weekly Update ─────────────────────────────────────────────────────────────
@router.post("/weekly-update", response_model=WeeklyUpdateResponse)
def weekly_update(
    data: WeeklyUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        record = submit_weekly_update(
            db=db,
            user_id=current_user.id,
            user_name=current_user.name,
            strategy_id=data.strategy_id,
            week_number=data.week_number,
            update_text=data.update_text,
            leads_generated=data.leads_generated,
            revenue_change=data.revenue_change,
            top_channel=data.top_channel,
            send_email=data.send_email,
            sender_email=data.sender_email,
            sender_app_password=data.sender_app_password,
            recipient_email=data.recipient_email,
        )
        return record
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/weekly-updates/{strategy_id}")
def get_weekly_updates(
    strategy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(WeeklyUpdate).filter(
        WeeklyUpdate.strategy_id == strategy_id,
        WeeklyUpdate.user_id == current_user.id
    ).order_by(WeeklyUpdate.week_number).all()
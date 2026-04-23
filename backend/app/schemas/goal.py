from pydantic import BaseModel, EmailStr
from typing import List, Dict, Optional
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    name: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str


# ── Goal / Strategy ───────────────────────────────────────────────────────────
class GoalRequest(BaseModel):
    goal: str
    business_type: str
    target_audience: str
    budget: float


class StrategyResponse(BaseModel):
    summary: str
    overall_score: int
    scores: Dict[str, int]
    channels: List[str]
    actions: List[str]
    recommendations: List[str]


class MarketingPlanResponse(BaseModel):
    campaign_summary: str
    campaign_type: str
    primary_channel: str
    content_plan: List[str]
    email_plan: List[str]
    weekly_plan: List[str]


class FullPipelineResponse(BaseModel):
    strategy_id: Optional[int] = None
    strategy: StrategyResponse
    marketing_plan: MarketingPlanResponse


class StrategyHistoryResponse(BaseModel):
    id: int
    goal: str
    business_type: str
    target_audience: str
    budget: float
    summary: str
    overall_score: int
    scores: Dict[str, int]
    channels: List[str]
    actions: List[str]
    recommendations: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Weekly Update ─────────────────────────────────────────────────────────────
class WeeklyUpdateRequest(BaseModel):
    strategy_id: int
    week_number: int
    update_text: str
    leads_generated: int = 0
    revenue_change: float = 0.0
    top_channel: str = ""
    # Email — all optional, user fills in dashboard if they want email
    send_email: bool = False
    sender_email: Optional[str] = None
    sender_app_password: Optional[str] = None
    recipient_email: Optional[str] = None


class WeeklyUpdateResponse(BaseModel):
    id: int
    strategy_id: int
    week_number: int
    update_text: str
    leads_generated: int
    revenue_change: float
    top_channel: str
    refined_summary: Optional[str]
    refined_plan: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
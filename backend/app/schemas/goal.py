from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime


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
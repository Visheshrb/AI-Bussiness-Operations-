from pydantic import BaseModel
from typing import List, Dict


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
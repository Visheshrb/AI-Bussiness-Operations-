from pydantic import BaseModel
from typing import List


class GoalRequest(BaseModel):
    goal: str
    business_type: str
    target_audience: str
    budget: float


class StrategyResponse(BaseModel):
    summary: str
    channels: List[str]
    actions: List[str]


class GoalResponse(BaseModel):
    goal: str
    strategy: StrategyResponse


class SavedGoalResponse(BaseModel):
    id: int
    goal: str
    business_type: str
    target_audience: str
    budget: str
    summary: str
    channels: List[str]
    actions: List[str]


class SavedGoalsListResponse(BaseModel):
    goals: List[SavedGoalResponse]
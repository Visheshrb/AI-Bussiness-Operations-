from typing import List

from pydantic import BaseModel, Field


class GoalRequest(BaseModel):
    goal: str = Field(..., example="Get 100 users for my SaaS")
    business_type: str = Field(..., example="SaaS")
    target_audience: str = Field(..., example="Small businesses")
    budget: float = Field(..., ge=0, example=1000)


class StrategyOutput(BaseModel):
    summary: str
    channels: List[str]
    actions: List[str]


class GoalResponse(BaseModel):
    goal: str
    strategy: StrategyOutput

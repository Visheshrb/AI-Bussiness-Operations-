from pydantic import BaseModel


class GoalRequest(BaseModel):
    goal: str
    business_type: str
    target_audience: str
    budget: float


class GoalResponse(BaseModel):
    goal: str
    strategy: dict
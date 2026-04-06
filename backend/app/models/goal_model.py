from sqlalchemy import Column, Integer, String, Text
from app.db.database import Base


class GoalRecord(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    goal = Column(String, nullable=False)
    business_type = Column(String, nullable=False)
    target_audience = Column(String, nullable=False)
    budget = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    channels = Column(Text, nullable=False)
    actions = Column(Text, nullable=False)
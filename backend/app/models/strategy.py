from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from datetime import datetime
from app.db.database import Base


class StrategyRecord(Base):
    __tablename__ = "strategy_records"

    id = Column(Integer, primary_key=True, index=True)

    # ✅ NEW: tie strategy to a user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # nullable for existing rows

    goal = Column(String, nullable=False)
    business_type = Column(String, nullable=False)
    target_audience = Column(String, nullable=False)
    budget = Column(Float, nullable=False)

    summary = Column(Text, nullable=False)
    overall_score = Column(Integer, nullable=False)
    scores = Column(Text, nullable=False)
    channels = Column(Text, nullable=False)
    actions = Column(Text, nullable=False)
    recommendations = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

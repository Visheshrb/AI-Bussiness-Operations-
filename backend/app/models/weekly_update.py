from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from datetime import datetime
from app.db.database import Base


class WeeklyUpdate(Base):
    __tablename__ = "weekly_updates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    strategy_id = Column(Integer, ForeignKey("strategy_records.id"), nullable=False)

    week_number = Column(Integer, nullable=False)
    update_text = Column(Text, nullable=False)       # what the user reports this week
    leads_generated = Column(Integer, default=0)
    revenue_change = Column(Float, default=0.0)
    top_channel = Column(String, default="")

    # AI-generated refined plan based on update
    refined_plan = Column(Text, nullable=True)       # JSON string
    refined_summary = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

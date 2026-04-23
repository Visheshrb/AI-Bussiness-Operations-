from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from datetime import datetime
from app.db.database import Base


class MarketingRecord(Base):
    __tablename__ = "marketing_records"

    id = Column(Integer, primary_key=True, index=True)
    strategy_id = Column(Integer, ForeignKey("strategy_records.id"), nullable=False)

    goal = Column(String, nullable=False)
    business_type = Column(String, nullable=False)
    target_audience = Column(String, nullable=False)
    budget = Column(Float, nullable=False)

    campaign_summary = Column(Text, nullable=False)
    campaign_type = Column(String, nullable=False)
    primary_channel = Column(String, nullable=False)
    content_plan = Column(Text, nullable=False)
    email_plan = Column(Text, nullable=False)
    weekly_plan = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
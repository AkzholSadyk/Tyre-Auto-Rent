from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class CarBlockedDay(Base):
    __tablename__ = 'car_blocked_days'
    __table_args__ = (UniqueConstraint('car_id', 'blocked_date', name='uq_car_blocked_date'),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    car_id: Mapped[int] = mapped_column(ForeignKey('cars.id', ondelete='CASCADE'), nullable=False)
    blocked_date: Mapped[date] = mapped_column(Date, nullable=False)
    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    car = relationship('Car', back_populates='blocked_days')

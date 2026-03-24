from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Booking(Base):
    __tablename__ = 'bookings'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    car_id: Mapped[int] = mapped_column(ForeignKey('cars.id'), nullable=False)
    pickup_type: Mapped[str] = mapped_column(String(30), default='office', nullable=False)
    pickup_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    pickup_lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    dropoff_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    dropoff_lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    delivery_price: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_price: Mapped[float] = mapped_column(Float, nullable=False)
    payment_status: Mapped[str] = mapped_column(String(20), default='pending', nullable=False)
    booking_status: Mapped[str] = mapped_column(String(20), default='pending', nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship('User', back_populates='bookings')
    car = relationship('Car', back_populates='bookings')
    payment = relationship('Payment', back_populates='booking', uselist=False, cascade='all, delete-orphan')

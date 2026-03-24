from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Car(Base):
    __tablename__ = "cars"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    brand: Mapped[str] = mapped_column(String(80), nullable=False)
    model: Mapped[str] = mapped_column(String(80), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    price_per_day: Mapped[float] = mapped_column(Float, nullable=False)
    deposit: Mapped[float] = mapped_column(Float, nullable=False)
    transmission: Mapped[str] = mapped_column(String(30), nullable=False)
    fuel_type: Mapped[str] = mapped_column(String(30), nullable=False)
    seats: Mapped[int] = mapped_column(Integer, nullable=False)
    horsepower: Mapped[int | None] = mapped_column(Integer, nullable=True)
    engine: Mapped[str | None] = mapped_column(String(50), nullable=True)
    car_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    drive: Mapped[str | None] = mapped_column(String(60), nullable=True)
    acceleration: Mapped[str | None] = mapped_column(String(30), nullable=True)
    color: Mapped[str | None] = mapped_column(String(40), nullable=True)
    interior_color: Mapped[str | None] = mapped_column(String(40), nullable=True)
    max_speed: Mapped[str | None] = mapped_column(String(30), nullable=True)
    # Legacy single description (kept for backward compatibility)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    # Multilingual descriptions
    description_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_ru: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_kk: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_zh: Mapped[str | None] = mapped_column(Text, nullable=True)
    consumption: Mapped[str | None] = mapped_column(String(30), nullable=True)
    images: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="available", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    bookings = relationship("Booking", back_populates="car")
    blocked_days = relationship(
        "CarBlockedDay", back_populates="car", cascade="all, delete-orphan"
    )

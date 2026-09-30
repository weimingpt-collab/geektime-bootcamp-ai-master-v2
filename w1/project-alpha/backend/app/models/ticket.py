import enum

from sqlalchemy import Column, DateTime, Enum, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..database import Base


class TicketStatus(str, enum.Enum):
    """Ticket 状态枚举"""

    PENDING = "PENDING"
    COMPLETED = "COMPLETED"


class Ticket(Base):
    """Ticket 模型"""

    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    status = Column(
        Enum(TicketStatus, name="ticketstatus", native_enum=True),
        default=TicketStatus.PENDING,
        nullable=False,
        index=True,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))

    # 关系
    tags = relationship("Tag", secondary="ticket_tags", back_populates="tickets")

    def __repr__(self):
        return f"<Ticket(id={self.id}, title='{self.title}', status={self.status})>"

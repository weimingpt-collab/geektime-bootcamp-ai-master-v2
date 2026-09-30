from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator

from .tag import TagResponse


class TicketBase(BaseModel):
    """Ticket 基础模型"""

    title: str = Field(..., min_length=1, max_length=255, description="Ticket 标题")
    description: Optional[str] = Field(None, max_length=10000, description="Ticket 描述")


class TicketCreate(TicketBase):
    """创建 Ticket 请求模型"""

    tag_ids: Optional[List[int]] = Field(default_factory=list, description="标签 ID 列表")


class TicketUpdate(BaseModel):
    """更新 Ticket 请求模型"""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=10000)


class TicketResponse(TicketBase):
    """Ticket 响应模型"""

    id: int
    status: str
    tags: List[TagResponse]
    created_at: datetime
    updated_at: Optional[datetime]
    completed_at: Optional[datetime]

    @field_validator("status", mode="before")
    @classmethod
    def normalize_status(cls, v):
        """将状态值转换为小写"""
        if isinstance(v, str):
            return v.lower()
        if hasattr(v, "value"):
            return v.value.lower()
        return str(v).lower()

    class Config:
        from_attributes = True


class TicketListResponse(BaseModel):
    """Ticket 列表响应模型"""

    tickets: List[TicketResponse]
    total: int
    limit: int
    offset: int

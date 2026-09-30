from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..crud import ticket as crud
from ..database import get_db
from ..schemas.ticket import (
    TicketCreate,
    TicketListResponse,
    TicketResponse,
    TicketUpdate,
)

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.get("", response_model=TicketListResponse)
def list_tickets(
    status: Optional[str] = Query(None, description="状态过滤 (all/pending/completed)"),
    tag_ids: Optional[str] = Query(None, description="标签 ID 列表（逗号分隔）"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    skip: int = Query(0, ge=0, description="跳过数量"),
    limit: int = Query(50, ge=1, le=100, description="返回数量"),
    db: Session = Depends(get_db),
):
    """获取 Ticket 列表"""
    tag_id_list = [int(id) for id in tag_ids.split(",")] if tag_ids else None
    tickets, total = crud.get_tickets(db, status, tag_id_list, search, skip, limit)

    return TicketListResponse(
        tickets=tickets,
        total=total,
        limit=limit,
        offset=skip,
    )


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """获取单个 Ticket"""
    ticket = crud.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    """创建新 Ticket"""
    return crud.create_ticket(db, ticket)


@router.put("/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: int,
    ticket: TicketUpdate,
    db: Session = Depends(get_db),
):
    """更新 Ticket"""
    updated_ticket = crud.update_ticket(db, ticket_id, ticket)
    if not updated_ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return updated_ticket


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """删除 Ticket"""
    success = crud.delete_ticket(db, ticket_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")


@router.patch("/{ticket_id}/complete", response_model=TicketResponse)
def complete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """完成 Ticket"""
    ticket = crud.complete_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket


@router.patch("/{ticket_id}/uncomplete", response_model=TicketResponse)
def uncomplete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """取消完成 Ticket"""
    ticket = crud.uncomplete_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket


@router.post("/{ticket_id}/tags", response_model=TicketResponse)
def add_tags_to_ticket(
    ticket_id: int,
    tag_ids: list[int],
    db: Session = Depends(get_db),
):
    """为 Ticket 添加标签"""
    ticket = crud.add_tags_to_ticket(db, ticket_id, tag_ids)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket


@router.delete("/{ticket_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_tag_from_ticket(
    ticket_id: int,
    tag_id: int,
    db: Session = Depends(get_db),
):
    """从 Ticket 移除标签"""
    ticket = crud.remove_tag_from_ticket(db, ticket_id, tag_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

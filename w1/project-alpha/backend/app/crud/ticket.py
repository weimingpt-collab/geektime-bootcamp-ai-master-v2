from typing import List, Optional

from sqlalchemy import String, cast, func
from sqlalchemy.orm import Session

from ..models.tag import Tag
from ..models.ticket import Ticket, TicketStatus
from ..schemas.ticket import TicketCreate, TicketUpdate


def get_tickets(
    db: Session,
    status: Optional[str] = None,
    tag_ids: Optional[List[int]] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> tuple[List[Ticket], int]:
    """获取 Ticket 列表，返回 (tickets, total)"""
    query = db.query(Ticket)

    # 状态过滤
    if status and status != "all":
        # 将字符串状态转换为枚举（支持大小写）
        status_upper = status.upper()
        if status_upper == "PENDING":
            query = query.filter(Ticket.status == TicketStatus.PENDING)
        elif status_upper == "COMPLETED":
            query = query.filter(Ticket.status == TicketStatus.COMPLETED)

    # 标签过滤
    if tag_ids:
        query = query.join(Ticket.tags).filter(Tag.id.in_(tag_ids))

    # 搜索过滤
    if search:
        query = query.filter(Ticket.title.ilike(f"%{search}%"))

    # 获取总数
    total = query.count()

    # 分页和排序
    tickets = query.order_by(Ticket.created_at.desc()).offset(skip).limit(limit).all()

    return tickets, total


def get_ticket(db: Session, ticket_id: int) -> Optional[Ticket]:
    """根据 ID 获取 Ticket"""
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()


def create_ticket(db: Session, ticket: TicketCreate) -> Ticket:
    """创建新 Ticket"""
    db_ticket = Ticket(
        title=ticket.title,
        description=ticket.description,
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)

    # 添加标签
    if ticket.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(ticket.tag_ids)).all()
        db_ticket.tags = tags
        db.commit()
        db.refresh(db_ticket)

    return db_ticket


def update_ticket(db: Session, ticket_id: int, ticket: TicketUpdate) -> Optional[Ticket]:
    """更新 Ticket"""
    db_ticket = get_ticket(db, ticket_id)
    if not db_ticket:
        return None

    if ticket.title is not None:
        db_ticket.title = ticket.title
    if ticket.description is not None:
        db_ticket.description = ticket.description

    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def delete_ticket(db: Session, ticket_id: int) -> bool:
    """删除 Ticket"""
    db_ticket = get_ticket(db, ticket_id)
    if not db_ticket:
        return False

    db.delete(db_ticket)
    db.commit()
    return True


def complete_ticket(db: Session, ticket_id: int) -> Optional[Ticket]:
    """完成 Ticket"""
    db_ticket = get_ticket(db, ticket_id)
    if not db_ticket:
        return None

    db_ticket.status = TicketStatus.COMPLETED
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def uncomplete_ticket(db: Session, ticket_id: int) -> Optional[Ticket]:
    """取消完成 Ticket"""
    db_ticket = get_ticket(db, ticket_id)
    if not db_ticket:
        return None

    db_ticket.status = TicketStatus.PENDING
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def add_tags_to_ticket(db: Session, ticket_id: int, tag_ids: List[int]) -> Optional[Ticket]:
    """为 Ticket 添加标签"""
    db_ticket = get_ticket(db, ticket_id)
    if not db_ticket:
        return None

    tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
    existing_tag_ids = {tag.id for tag in db_ticket.tags}

    for tag in tags:
        if tag.id not in existing_tag_ids:
            db_ticket.tags.append(tag)

    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def remove_tag_from_ticket(db: Session, ticket_id: int, tag_id: int) -> Optional[Ticket]:
    """从 Ticket 移除标签"""
    db_ticket = get_ticket(db, ticket_id)
    if not db_ticket:
        return None

    db_ticket.tags = [tag for tag in db_ticket.tags if tag.id != tag_id]
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from ..models.tag import Tag
from ..models.ticket import Ticket
from ..schemas.tag import TagCreate
from ..utils.color_generator import generate_random_color


def get_tags(db: Session) -> List[Tag]:
    """获取所有标签，包含 ticket 计数"""
    return db.query(Tag).all()


def get_tag(db: Session, tag_id: int) -> Optional[Tag]:
    """根据 ID 获取标签"""
    return db.query(Tag).filter(Tag.id == tag_id).first()


def get_tag_by_name(db: Session, name: str) -> Optional[Tag]:
    """根据名称获取标签"""
    return db.query(Tag).filter(Tag.name == name).first()


def create_tag(db: Session, tag: TagCreate) -> Tag:
    """创建新标签"""
    color = tag.color if tag.color else generate_random_color()
    db_tag = Tag(name=tag.name, color=color)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag


def get_or_create_tag(db: Session, name: str, color: Optional[str] = None) -> Tag:
    """获取或创建标签"""
    tag = get_tag_by_name(db, name)
    if tag:
        return tag

    color = color if color else generate_random_color()
    db_tag = Tag(name=name, color=color)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag


def delete_tag(db: Session, tag_id: int) -> bool:
    """删除标签"""
    tag = get_tag(db, tag_id)
    if not tag:
        return False

    db.delete(tag)
    db.commit()
    return True

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..crud import tag as crud
from ..database import get_db
from ..models.tag import Tag, ticket_tags
from ..schemas.tag import TagCreate, TagListResponse, TagResponse

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=TagListResponse)
def list_tags(db: Session = Depends(get_db)):
    """获取所有标签"""
    tags = crud.get_tags(db)

    # 为每个标签添加 ticket 计数
    tag_responses = []
    for tag in tags:
        ticket_count = (
            db.query(func.count(ticket_tags.c.ticket_id))
            .filter(ticket_tags.c.tag_id == tag.id)
            .scalar()
        )
        tag_dict = {
            "id": tag.id,
            "name": tag.name,
            "color": tag.color,
            "created_at": tag.created_at,
            "ticket_count": ticket_count,
        }
        tag_responses.append(tag_dict)

    return TagListResponse(tags=tag_responses, total=len(tag_responses))


@router.get("/{tag_id}", response_model=TagResponse)
def get_tag(tag_id: int, db: Session = Depends(get_db)):
    """获取单个标签"""
    tag = crud.get_tag(db, tag_id)
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")

    ticket_count = (
        db.query(func.count(ticket_tags.c.ticket_id))
        .filter(ticket_tags.c.tag_id == tag.id)
        .scalar()
    )

    return TagResponse(
        id=tag.id,
        name=tag.name,
        color=tag.color,
        created_at=tag.created_at,
        ticket_count=ticket_count,
    )


@router.post("", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(tag: TagCreate, db: Session = Depends(get_db)):
    """创建新标签"""
    # 检查标签名称是否已存在
    existing_tag = crud.get_tag_by_name(db, tag.name)
    if existing_tag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Tag with this name already exists"
        )

    new_tag = crud.create_tag(db, tag)
    return TagResponse(
        id=new_tag.id,
        name=new_tag.name,
        color=new_tag.color,
        created_at=new_tag.created_at,
        ticket_count=0,
    )


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    """删除标签"""
    success = crud.delete_tag(db, tag_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")

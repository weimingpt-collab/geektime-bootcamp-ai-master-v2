# Project Alpha - 实施计划

## 1. 项目概述

### 1.1 项目信息

- **项目名称**: Project Alpha - Ticket 管理系统
- **项目路径**: `./w1/project-alpha`
- **开发周期**: 10-13 天
- **技术栈**: FastAPI + PostgreSQL + React + TypeScript + Vite + Tailwind CSS + Shadcn UI

### 1.2 项目目标

构建一个基于标签的 Ticket 管理工具，提供简洁高效的任务跟踪和分类功能，支持创建、编辑、删除、完成 Ticket，以及标签管理和多维度过滤搜索。

---

## 2. 项目结构规划

### 2.1 整体目录结构

```
w1/project-alpha/
├── backend/                    # 后端代码
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI 应用入口
│   │   ├── config.py          # 配置管理
│   │   ├── database.py        # 数据库连接
│   │   ├── models/            # SQLAlchemy 模型
│   │   │   ├── __init__.py
│   │   │   ├── ticket.py
│   │   │   └── tag.py
│   │   ├── schemas/           # Pydantic 模型
│   │   │   ├── __init__.py
│   │   │   ├── ticket.py
│   │   │   └── tag.py
│   │   ├── api/               # API 路由
│   │   │   ├── __init__.py
│   │   │   ├── tickets.py
│   │   │   └── tags.py
│   │   ├── crud/              # CRUD 操作
│   │   │   ├── __init__.py
│   │   │   ├── ticket.py
│   │   │   └── tag.py
│   │   └── utils/             # 工具函数
│   │       ├── __init__.py
│   │       └── color_generator.py
│   ├── tests/                 # 测试代码
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_tickets.py
│   │   └── test_tags.py
│   ├── alembic/               # 数据库迁移
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── alembic.ini
│   ├── pyproject.toml         # uv 项目配置
│   ├── .env.example
│   ├── .env
│   └── README.md
│
├── frontend/                  # 前端代码
│   ├── src/
│   │   ├── main.tsx          # 应用入口
│   │   ├── App.tsx           # 根组件
│   │   ├── components/       # React 组件
│   │   │   ├── tickets/
│   │   │   │   ├── TicketList.tsx
│   │   │   │   ├── TicketCard.tsx
│   │   │   │   └── TicketForm.tsx
│   │   │   ├── tags/
│   │   │   │   ├── TagSelector.tsx
│   │   │   │   └── TagBadge.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── FilterSidebar.tsx
│   │   │   ├── ui/           # Shadcn UI 组件
│   │   │   │   ├── button.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   └── ...
│   │   │   └── common/
│   │   │       ├── SearchBar.tsx
│   │   │       └── ConfirmDialog.tsx
│   │   ├── lib/              # 工具函数
│   │   │   ├── api.ts        # API 客户端
│   │   │   └── utils.ts
│   │   ├── store/            # 状态管理
│   │   │   └── useTicketStore.ts
│   │   ├── types/            # TypeScript 类型定义
│   │   │   ├── ticket.ts
│   │   │   └── tag.ts
│   │   └── styles/
│   │       └── globals.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── components.json       # Shadcn UI 配置
│   └── README.md
│
├── docs/                      # 文档
│   ├── api.md                # API 文档
│   ├── setup.md              # 安装指南
│   └── user-guide.md         # 用户指南
│
└── README.md                  # 项目说明
```

---

## 3. 实施阶段划分

### 阶段 0: 项目初始化（第 0 天）

### 阶段 1: 数据库设计与后端基础（第 1-2 天）

### 阶段 2: 后端 API 开发（第 3-4 天）

### 阶段 3: 前端项目搭建与基础组件（第 5-6 天）

### 阶段 4: 前端功能开发（第 7-8 天）

### 阶段 5: 集成测试与优化（第 9-10 天）

### 阶段 6: 文档与部署（第 11 天）

---

## 4. 详细实施步骤

## 阶段 0: 项目初始化（第 0 天，2-3 小时）

### 4.0.1 创建项目目录结构

**任务清单**:

- [ ] 创建项目根目录 `w1/project-alpha`
- [ ] 创建后端目录结构 `backend/`
- [ ] 创建前端目录结构 `frontend/`
- [ ] 创建文档目录 `docs/`

**执行命令**:

```bash
# 在 w1 目录下
mkdir -p project-alpha/{backend,frontend,docs}
cd project-alpha
```

### 4.0.2 初始化后端项目

**任务清单**:

- [ ] 使用 uv 初始化 Python 项目
- [ ] 配置 pyproject.toml
- [ ] 创建虚拟环境
- [ ] 安装基础依赖

**执行命令**:

```bash
cd backend

# 使用 uv 初始化项目
uv init

# 安装依赖
uv add fastapi uvicorn[standard] sqlalchemy psycopg2-binary pydantic pydantic-settings alembic python-dotenv

# 安装开发依赖
uv add --dev pytest pytest-asyncio httpx black isort mypy
```

**pyproject.toml 配置**:

```toml
[project]
name = "project-alpha-backend"
version = "0.1.0"
description = "Project Alpha Ticket Management System Backend"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "sqlalchemy>=2.0.0",
    "psycopg2-binary>=2.9.9",
    "pydantic>=2.0.0",
    "pydantic-settings>=2.0.0",
    "alembic>=1.12.0",
    "python-dotenv>=1.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.0",
    "httpx>=0.25.0",
    "black>=23.0.0",
    "isort>=5.12.0",
    "mypy>=1.6.0",
]

[tool.black]
line-length = 100
target-version = ['py311']

[tool.isort]
profile = "black"
line_length = 100

[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
```

### 4.0.3 初始化前端项目

**任务清单**:

- [ ] 使用 Vite 创建 React + TypeScript 项目
- [ ] 安装 Tailwind CSS
- [ ] 配置 Shadcn UI
- [ ] 安装其他依赖

**执行命令**:

```bash
cd ../frontend

# 使用 Vite 创建项目
yarn create vite . --template react-ts

# 安装依赖
yarn

# 安装 Tailwind CSS
yarn add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 安装 Shadcn UI
npx shadcn@latest init

# 安装其他依赖
yarn add zustand @tanstack/react-query axios date-fns
yarn add -D @types/node
```

**配置文件设置**:

`vite.config.ts`:

```typescript
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
})
```

`tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 4.0.4 创建项目文档

**任务清单**:

- [ ] 创建根目录 README.md
- [ ] 创建后端 README.md
- [ ] 创建前端 README.md
- [ ] 创建 .env.example 文件

**backend/.env.example**:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/projectalpha

# API
API_V1_PREFIX=/api/v1
PROJECT_NAME=Project Alpha

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Environment
ENVIRONMENT=development
```

---

## 阶段 1: 数据库设计与后端基础（第 1-2 天）

### 4.1.1 创建数据库（第 1 天上午，2 小时）

**任务清单**:

- [ ] 创建 PostgreSQL 数据库
- [ ] 配置数据库连接
- [ ] 测试数据库连接

**执行步骤**:

1. **创建数据库**:

```bash
# 连接到 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE projectalpha;

# 退出
\q
```

2. **创建 backend/app/config.py**:

```python
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # API
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Project Alpha"

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173"]

    # Environment
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
```

3. **创建 backend/app/database.py**:

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.ENVIRONMENT == "development",
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """数据库会话依赖"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 4.1.2 定义数据模型（第 1 天下午，3 小时）

**任务清单**:

- [ ] 创建 Ticket 模型
- [ ] 创建 Tag 模型
- [ ] 定义关联表
- [ ] 创建枚举类型

**执行步骤**:

1. **创建 backend/app/models/**init**.py**:

```python
from .ticket import Ticket, TicketStatus
from .tag import Tag, ticket_tags

__all__ = ["Ticket", "TicketStatus", "Tag", "ticket_tags"]
```

2. **创建 backend/app/models/ticket.py**:

```python
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class TicketStatus(str, enum.Enum):
    """Ticket 状态枚举"""
    PENDING = "pending"
    COMPLETED = "completed"


class Ticket(Base):
    """Ticket 模型"""
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    status = Column(
        Enum(TicketStatus),
        default=TicketStatus.PENDING,
        nullable=False,
        index=True
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
    completed_at = Column(DateTime(timezone=True))

    # 关系
    tags = relationship("Tag", secondary="ticket_tags", back_populates="tickets")

    def __repr__(self):
        return f"<Ticket(id={self.id}, title='{self.title}', status={self.status})>"
```

3. **创建 backend/app/models/tag.py**:

```python
from sqlalchemy import Column, Integer, String, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

# 关联表
ticket_tags = Table(
    'ticket_tags',
    Base.metadata,
    Column('ticket_id', Integer, ForeignKey('tickets.id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True),
    Column('created_at', DateTime(timezone=True), server_default=func.now())
)


class Tag(Base):
    """Tag 模型"""
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    color = Column(String(7), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关系
    tickets = relationship("Ticket", secondary=ticket_tags, back_populates="tags")

    def __repr__(self):
        return f"<Tag(id={self.id}, name='{self.name}', color='{self.color}')>"
```

### 4.1.3 配置数据库迁移（第 1 天下午，2 小时）

**任务清单**:

- [ ] 初始化 Alembic
- [ ] 配置 Alembic 环境
- [ ] 创建初始迁移
- [ ] 执行迁移

**执行步骤**:

1. **初始化 Alembic**:

```bash
cd backend
uv run alembic init alembic
```

2. **修改 backend/alembic.ini**:

```ini
# 注释掉这行
# sqlalchemy.url = driver://user:pass@localhost/dbname

# Alembic 会从代码中获取数据库 URL
```

3. **修改 backend/alembic/env.py**:

```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys

# 添加项目路径
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import Base
from app.models import Ticket, Tag, ticket_tags
from app.config import settings

# this is the Alembic Config object
config = context.config

# 设置数据库 URL
config.set_main_option('sqlalchemy.url', settings.DATABASE_URL)

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
target_metadata = Base.metadata

# ... 其余代码保持不变
```

4. **创建初始迁移**:

```bash
# 创建迁移脚本
uv run alembic revision --autogenerate -m "Initial migration"

# 执行迁移
uv run alembic upgrade head
```

5. **创建数据库触发器**:

创建 `backend/alembic/versions/xxxx_add_triggers.py`（手动迁移）:

```python
"""add triggers for updated_at and completed_at

Revision ID: xxxx
"""
from alembic import op

def upgrade():
    # 创建 updated_at 触发器函数
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    op.execute("""
        CREATE TRIGGER update_tickets_updated_at
            BEFORE UPDATE ON tickets
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    """)

    # 创建 completed_at 触发器函数
    op.execute("""
        CREATE OR REPLACE FUNCTION set_completed_at()
        RETURNS TRIGGER AS $$
        BEGIN
            IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
                NEW.completed_at = CURRENT_TIMESTAMP;
            ELSIF NEW.status = 'pending' AND OLD.status = 'completed' THEN
                NEW.completed_at = NULL;
            END IF;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    op.execute("""
        CREATE TRIGGER trigger_set_completed_at
            BEFORE UPDATE ON tickets
            FOR EACH ROW
            EXECUTE FUNCTION set_completed_at();
    """)


def downgrade():
    op.execute("DROP TRIGGER IF EXISTS trigger_set_completed_at ON tickets;")
    op.execute("DROP FUNCTION IF EXISTS set_completed_at();")
    op.execute("DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column();")
```

### 4.1.4 定义 Pydantic Schemas（第 2 天上午，2 小时）

**任务清单**:

- [ ] 创建 Ticket Schemas
- [ ] 创建 Tag Schemas
- [ ] 定义请求和响应模型

**执行步骤**:

1. **创建 backend/app/schemas/**init**.py**:

```python
from .ticket import (
    TicketBase,
    TicketCreate,
    TicketUpdate,
    TicketResponse,
    TicketListResponse,
)
from .tag import TagBase, TagCreate, TagResponse, TagListResponse

__all__ = [
    "TicketBase",
    "TicketCreate",
    "TicketUpdate",
    "TicketResponse",
    "TicketListResponse",
    "TagBase",
    "TagCreate",
    "TagResponse",
    "TagListResponse",
]
```

2. **创建 backend/app/schemas/tag.py**:

```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class TagBase(BaseModel):
    """Tag 基础模型"""
    name: str = Field(..., min_length=1, max_length=50, description="标签名称")
    color: Optional[str] = Field(
        None,
        pattern="^#[0-9A-Fa-f]{6}$",
        description="标签颜色（十六进制格式）"
    )


class TagCreate(TagBase):
    """创建 Tag 请求模型"""
    pass


class TagResponse(TagBase):
    """Tag 响应模型"""
    id: int
    created_at: datetime
    ticket_count: Optional[int] = 0

    class Config:
        from_attributes = True


class TagListResponse(BaseModel):
    """Tag 列表响应模型"""
    tags: List[TagResponse]
    total: int
```

3. **创建 backend/app/schemas/ticket.py**:

```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
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

    class Config:
        from_attributes = True


class TicketListResponse(BaseModel):
    """Ticket 列表响应模型"""
    tickets: List[TicketResponse]
    total: int
    limit: int
    offset: int
```

---

## 阶段 2: 后端 API 开发（第 3-4 天）

### 4.2.1 创建 CRUD 操作（第 3 天上午，3 小时）

**任务清单**:

- [ ] 实现 Ticket CRUD
- [ ] 实现 Tag CRUD
- [ ] 实现颜色生成工具

**执行步骤**:

1. **创建 backend/app/utils/color_generator.py**:

```python
import random
from typing import List

TAG_COLORS: List[str] = [
    '#EF4444',  # red-500
    '#F59E0B',  # amber-500
    '#10B981',  # emerald-500
    '#3B82F6',  # blue-500
    '#8B5CF6',  # violet-500
    '#EC4899',  # pink-500
    '#6366F1',  # indigo-500
    '#14B8A6',  # teal-500
]


def generate_random_color() -> str:
    """生成随机标签颜色"""
    return random.choice(TAG_COLORS)
```

2. **创建 backend/app/crud/tag.py**:

```python
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
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
```

3. **创建 backend/app/crud/ticket.py**:

```python
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from ..models.ticket import Ticket, TicketStatus
from ..models.tag import Tag
from ..schemas.ticket import TicketCreate, TicketUpdate
from .tag import get_or_create_tag


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
        query = query.filter(Ticket.status == status)

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
```

4. **创建 backend/app/crud/**init**.py**:

```python
from . import ticket, tag

__all__ = ["ticket", "tag"]
```

### 4.2.2 创建 API 路由（第 3 天下午 + 第 4 天上午，4 小时）

**任务清单**:

- [ ] 实现 Ticket 路由
- [ ] 实现 Tag 路由
- [ ] 配置路由注册

**执行步骤**:

1. **创建 backend/app/api/tickets.py**:

```python
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..schemas.ticket import (
    TicketCreate,
    TicketUpdate,
    TicketResponse,
    TicketListResponse,
)
from ..crud import ticket as crud

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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    return updated_ticket


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """删除 Ticket"""
    success = crud.delete_ticket(db, ticket_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )


@router.patch("/{ticket_id}/complete", response_model=TicketResponse)
def complete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """完成 Ticket"""
    ticket = crud.complete_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    return ticket


@router.patch("/{ticket_id}/uncomplete", response_model=TicketResponse)
def uncomplete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """取消完成 Ticket"""
    ticket = crud.uncomplete_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
```

2. **创建 backend/app/api/tags.py**:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..schemas.tag import TagCreate, TagResponse, TagListResponse
from ..models.tag import Tag
from ..models.ticket import ticket_tags
from ..crud import tag as crud

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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )

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
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag with this name already exists"
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
```

3. **创建 backend/app/api/**init**.py**:

```python
from fastapi import APIRouter
from .tickets import router as tickets_router
from .tags import router as tags_router

api_router = APIRouter()
api_router.include_router(tickets_router)
api_router.include_router(tags_router)

__all__ = ["api_router"]
```

### 4.2.3 创建 FastAPI 应用（第 4 天下午，2 小时）

**任务清单**:

- [ ] 创建主应用文件
- [ ] 配置 CORS
- [ ] 配置日志
- [ ] 注册路由

**执行步骤**:

1. **创建 backend/app/main.py**:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import time
from .config import settings
from .api import api_router
from .database import engine, Base

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# 创建应用
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.1.0",
    description="Ticket Management System API",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 请求日志中间件
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Duration: {process_time:.4f}s"
    )

    return response


# 注册路由
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}


# 根路径
@app.get("/")
async def root():
    return {
        "message": "Welcome to Project Alpha API",
        "docs": f"{settings.API_V1_PREFIX}/docs",
    }


# 启动事件
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.PROJECT_NAME}")
    # 可选：创建数据库表（通常使用 Alembic）
    # Base.metadata.create_all(bind=engine)


# 关闭事件
@app.on_event("shutdown")
async def shutdown_event():
    logger.info(f"Shutting down {settings.PROJECT_NAME}")
```

2. **创建 backend/app/**init**.py**:

```python
"""Project Alpha Backend Application"""
__version__ = "0.1.0"
```

### 4.2.4 测试后端 API（第 4 天下午，2 小时）

**任务清单**:

- [ ] 启动开发服务器
- [ ] 测试健康检查端点
- [ ] 测试 Ticket CRUD
- [ ] 测试 Tag CRUD
- [ ] 测试 API 文档

**执行步骤**:

1. **启动开发服务器**:

```bash
cd backend

# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，确保数据库配置正确

# 启动服务器
uv run uvicorn app.main:app --reload --port 8000
```

2. **测试 API**:

```bash
# 健康检查
curl http://localhost:8000/health

# 创建标签
curl -X POST http://localhost:8000/api/v1/tags \
  -H "Content-Type: application/json" \
  -d '{"name": "backend", "color": "#3B82F6"}'

# 创建 Ticket
curl -X POST http://localhost:8000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Ticket", "description": "This is a test", "tag_ids": [1]}'

# 获取 Ticket 列表
curl http://localhost:8000/api/v1/tickets

# 访问 API 文档
open http://localhost:8000/api/v1/docs
```

---

## 阶段 3: 前端项目搭建与基础组件（第 5-6 天）

### 4.3.1 配置前端项目基础（第 5 天上午，2 小时）

**任务清单**:

- [ ] 配置 TypeScript 类型
- [ ] 创建 API 客户端
- [ ] 配置状态管理
- [ ] 安装 Shadcn UI 组件

**执行步骤**:

1. **创建 frontend/src/types/ticket.ts**:

```typescript
export interface Ticket {
  id: number
  title: string
  description?: string
  status: 'pending' | 'completed'
  tags: Tag[]
  created_at: string
  updated_at?: string
  completed_at?: string
}

export interface CreateTicketData {
  title: string
  description?: string
  tag_ids?: number[]
}

export interface UpdateTicketData {
  title?: string
  description?: string
}

export interface TicketListResponse {
  tickets: Ticket[]
  total: number
  limit: number
  offset: number
}
```

2. **创建 frontend/src/types/tag.ts**:

```typescript
export interface Tag {
  id: number
  name: string
  color: string
  created_at: string
  ticket_count?: number
}

export interface CreateTagData {
  name: string
  color?: string
}

export interface TagListResponse {
  tags: Tag[]
  total: number
}
```

3. **创建 frontend/src/lib/api.ts**:

```typescript
import axios from 'axios'
import type {
  Ticket,
  CreateTicketData,
  UpdateTicketData,
  TicketListResponse,
} from '@/types/ticket'
import type { Tag, CreateTagData, TagListResponse } from '@/types/tag'

const API_BASE_URL = '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Ticket API
export const ticketApi = {
  list: async (params?: {
    status?: string
    tag_ids?: string
    search?: string
    skip?: number
    limit?: number
  }): Promise<TicketListResponse> => {
    const { data } = await api.get('/tickets', { params })
    return data
  },

  get: async (id: number): Promise<Ticket> => {
    const { data } = await api.get(`/tickets/${id}`)
    return data
  },

  create: async (ticket: CreateTicketData): Promise<Ticket> => {
    const { data } = await api.post('/tickets', ticket)
    return data
  },

  update: async (id: number, ticket: UpdateTicketData): Promise<Ticket> => {
    const { data } = await api.put(`/tickets/${id}`, ticket)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tickets/${id}`)
  },

  complete: async (id: number): Promise<Ticket> => {
    const { data } = await api.patch(`/tickets/${id}/complete`)
    return data
  },

  uncomplete: async (id: number): Promise<Ticket> => {
    const { data } = await api.patch(`/tickets/${id}/uncomplete`)
    return data
  },

  addTags: async (id: number, tagIds: number[]): Promise<Ticket> => {
    const { data } = await api.post(`/tickets/${id}/tags`, tagIds)
    return data
  },

  removeTag: async (id: number, tagId: number): Promise<void> => {
    await api.delete(`/tickets/${id}/tags/${tagId}`)
  },
}

// Tag API
export const tagApi = {
  list: async (): Promise<TagListResponse> => {
    const { data } = await api.get('/tags')
    return data
  },

  get: async (id: number): Promise<Tag> => {
    const { data } = await api.get(`/tags/${id}`)
    return data
  },

  create: async (tag: CreateTagData): Promise<Tag> => {
    const { data } = await api.post('/tags', tag)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tags/${id}`)
  },
}
```

4. **安装必要的 Shadcn UI 组件**:

```bash
cd frontend

npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add label
npx shadcn@latest add badge
npx shadcn@latest add card
npx shadcn@latest add alert-dialog
npx shadcn@latest add toast
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add skeleton
```

### 4.3.2 创建状态管理（第 5 天上午，2 小时）

**任务清单**:

- [ ] 创建 Zustand store
- [ ] 实现 Ticket 状态管理
- [ ] 实现 Tag 状态管理
- [ ] 实现过滤和搜索状态

**执行步骤**:

创建 **frontend/src/store/useTicketStore.ts**:

```typescript
import { create } from 'zustand'
import { ticketApi, tagApi } from '@/lib/api'
import type { Ticket, CreateTicketData, UpdateTicketData } from '@/types/ticket'
import type { Tag } from '@/types/tag'

interface TicketStore {
  // State
  tickets: Ticket[]
  tags: Tag[]
  isLoading: boolean
  error: string | null

  // Filters
  statusFilter: 'all' | 'pending' | 'completed'
  selectedTagIds: number[]
  searchQuery: string

  // Actions
  fetchTickets: () => Promise<void>
  createTicket: (data: CreateTicketData) => Promise<void>
  updateTicket: (id: number, data: UpdateTicketData) => Promise<void>
  deleteTicket: (id: number) => Promise<void>
  toggleComplete: (id: number) => Promise<void>

  fetchTags: () => Promise<void>
  addTagToTicket: (ticketId: number, tagIds: number[]) => Promise<void>
  removeTagFromTicket: (ticketId: number, tagId: number) => Promise<void>

  setStatusFilter: (status: 'all' | 'pending' | 'completed') => void
  setSelectedTagIds: (ids: number[]) => void
  setSearchQuery: (query: string) => void

  reset: () => void
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  // Initial state
  tickets: [],
  tags: [],
  isLoading: false,
  error: null,
  statusFilter: 'all',
  selectedTagIds: [],
  searchQuery: '',

  // Fetch tickets
  fetchTickets: async () => {
    set({ isLoading: true, error: null })
    try {
      const { statusFilter, selectedTagIds, searchQuery } = get()
      const params = {
        status: statusFilter,
        tag_ids: selectedTagIds.length > 0 ? selectedTagIds.join(',') : undefined,
        search: searchQuery || undefined,
      }
      const response = await ticketApi.list(params)
      set({ tickets: response.tickets, isLoading: false })
    } catch (error) {
      set({ error: 'Failed to fetch tickets', isLoading: false })
      console.error('Error fetching tickets:', error)
    }
  },

  // Create ticket
  createTicket: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await ticketApi.create(data)
      await get().fetchTickets()
      set({ isLoading: false })
    } catch (error) {
      set({ error: 'Failed to create ticket', isLoading: false })
      console.error('Error creating ticket:', error)
      throw error
    }
  },

  // Update ticket
  updateTicket: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      await ticketApi.update(id, data)
      await get().fetchTickets()
      set({ isLoading: false })
    } catch (error) {
      set({ error: 'Failed to update ticket', isLoading: false })
      console.error('Error updating ticket:', error)
      throw error
    }
  },

  // Delete ticket
  deleteTicket: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await ticketApi.delete(id)
      await get().fetchTickets()
      set({ isLoading: false })
    } catch (error) {
      set({ error: 'Failed to delete ticket', isLoading: false })
      console.error('Error deleting ticket:', error)
      throw error
    }
  },

  // Toggle complete
  toggleComplete: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const ticket = get().tickets.find((t) => t.id === id)
      if (ticket) {
        if (ticket.status === 'pending') {
          await ticketApi.complete(id)
        } else {
          await ticketApi.uncomplete(id)
        }
        await get().fetchTickets()
      }
      set({ isLoading: false })
    } catch (error) {
      set({ error: 'Failed to toggle ticket status', isLoading: false })
      console.error('Error toggling ticket status:', error)
      throw error
    }
  },

  // Fetch tags
  fetchTags: async () => {
    try {
      const response = await tagApi.list()
      set({ tags: response.tags })
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  },

  // Add tag to ticket
  addTagToTicket: async (ticketId, tagIds) => {
    try {
      await ticketApi.addTags(ticketId, tagIds)
      await get().fetchTickets()
    } catch (error) {
      console.error('Error adding tag to ticket:', error)
      throw error
    }
  },

  // Remove tag from ticket
  removeTagFromTicket: async (ticketId, tagId) => {
    try {
      await ticketApi.removeTag(ticketId, tagId)
      await get().fetchTickets()
    } catch (error) {
      console.error('Error removing tag from ticket:', error)
      throw error
    }
  },

  // Filters
  setStatusFilter: (status) => {
    set({ statusFilter: status })
    get().fetchTickets()
  },

  setSelectedTagIds: (ids) => {
    set({ selectedTagIds: ids })
    get().fetchTickets()
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
  },

  // Reset
  reset: () => {
    set({
      statusFilter: 'all',
      selectedTagIds: [],
      searchQuery: '',
    })
    get().fetchTickets()
  },
}))
```

### 4.3.3 创建布局组件（第 5 天下午，3 小时）

**任务清单**:

- [ ] 创建 Header 组件
- [ ] 创建 Sidebar 组件
- [ ] 创建 FilterSidebar 组件
- [ ] 创建 SearchBar 组件

**执行步骤**:

1. **创建 frontend/src/components/layout/Header.tsx**:

```typescript
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import SearchBar from '@/components/common/SearchBar'

interface HeaderProps {
  onNewTicket: () => void
}

export default function Header({ onNewTicket }: HeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-blue-600">Project Alpha</h1>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <SearchBar />
        </div>

        <Button onClick={onNewTicket} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          新建 Ticket
        </Button>
      </div>
    </header>
  )
}
```

2. **创建 frontend/src/components/common/SearchBar.tsx**:

```typescript
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { useTicketStore } from '@/store/useTicketStore'
import { useDebouncedCallback } from 'use-debounce'

export default function SearchBar() {
  const { searchQuery, setSearchQuery, fetchTickets } = useTicketStore()
  const [localQuery, setLocalQuery] = useState(searchQuery)

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value)
    fetchTickets()
  }, 300)

  useEffect(() => {
    setLocalQuery(searchQuery)
  }, [searchQuery])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalQuery(value)
    debouncedSearch(value)
  }

  const handleClear = () => {
    setLocalQuery('')
    setSearchQuery('')
    fetchTickets()
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        placeholder="搜索 Ticket..."
        value={localQuery}
        onChange={handleChange}
        className="pl-10 pr-10"
      />
      {localQuery && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
```

3. **创建 frontend/src/components/layout/FilterSidebar.tsx**:

```typescript
import { useTicketStore } from '@/store/useTicketStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, ListTodo } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FilterSidebar() {
  const {
    tags,
    statusFilter,
    selectedTagIds,
    setStatusFilter,
    setSelectedTagIds,
    reset,
  } = useTicketStore()

  const toggleTagSelection = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId))
    } else {
      setSelectedTagIds([...selectedTagIds, tagId])
    }
  }

  return (
    <aside className="w-64 border-r bg-gray-50 p-4">
      <div className="py-6">
        {/* Status Filter */}
        <div>
          <h3 className="mb-3 font-semibold text-gray-700">状态</h3>
          <div className="py-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                statusFilter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <ListTodo className="h-4 w-4" />
              全部
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                statusFilter === 'pending'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Circle className="h-4 w-4" />
              待完成
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                statusFilter === 'completed'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              已完成
            </button>
          </div>
        </div>

        {/* Tags Filter */}
        <div>
          <h3 className="mb-3 font-semibold text-gray-700">标签</h3>
          <div className="py-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTagSelection(tag.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                  selectedTagIds.includes(tag.id)
                    ? 'bg-blue-100'
                    : 'hover:bg-gray-100'
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span>{tag.name}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {tag.ticket_count || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        {(statusFilter !== 'all' || selectedTagIds.length > 0) && (
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="w-full"
          >
            清除筛选
          </Button>
        )}
      </div>
    </aside>
  )
}
```

### 4.3.4 创建通用组件（第 6 天上午，3 小时）

**任务清单**:
- [ ] 创建 TagBadge 组件
- [ ] 创建 ConfirmDialog 组件
- [ ] 创建 Toast 提示组件
- [ ] 安装 use-debounce

**执行步骤**:

1. **安装依赖**:
```bash
yarn add use-debounce lucide-react
```

2. **创建 frontend/src/components/tags/TagBadge.tsx**:
```typescript
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { Tag } from '@/types/tag'

interface TagBadgeProps {
  tag: Tag
  removable?: boolean
  onRemove?: () => void
}

export default function TagBadge({ tag, removable = false, onRemove }: TagBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className="inline-flex items-center gap-1"
      style={{
        backgroundColor: tag.color + '20',
        color: tag.color,
        borderColor: tag.color,
      }}
    >
      <div
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: tag.color }}
      />
      <span>{tag.name}</span>
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 hover:text-red-600"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  )
}
```

3. **创建 frontend/src/components/common/ConfirmDialog.tsx**:
```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = '确认',
  cancelText = '取消',
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

---

## 阶段 4: 前端功能开发（第 7-8 天）

### 4.4.1 创建 Ticket 组件（第 7 天全天，6 小时）

**任务清单**:
- [ ] 创建 TicketCard 组件
- [ ] 创建 TicketList 组件
- [ ] 创建 TicketForm 组件
- [ ] 创建 TagSelector 组件

**执行步骤**:

1. **创建 frontend/src/components/tickets/TicketCard.tsx**:
```typescript
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Ticket } from '@/types/ticket'
import TagBadge from '@/components/tags/TagBadge'
import { cn } from '@/lib/utils'

interface TicketCardProps {
  ticket: Ticket
  onEdit: (ticket: Ticket) => void
  onDelete: (ticket: Ticket) => void
  onToggleComplete: (ticket: Ticket) => void
  onRemoveTag?: (ticketId: number, tagId: number) => void
}

export default function TicketCard({
  ticket,
  onEdit,
  onDelete,
  onToggleComplete,
  onRemoveTag,
}: TicketCardProps) {
  const isCompleted = ticket.status === 'completed'

  return (
    <Card
      className={cn(
        'p-4 transition-all hover:shadow-md',
        isCompleted && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => onToggleComplete(ticket)}
          className="mt-1"
        />

        <div className="flex-1 py-2">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                'text-lg font-semibold',
                isCompleted && 'line-through text-gray-500'
              )}
            >
              {ticket.title}
            </h3>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(ticket)}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(ticket)}
                className="h-8 w-8 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {ticket.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {ticket.description}
            </p>
          )}

          {ticket.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ticket.tags.map((tag) => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  removable={!isCompleted}
                  onRemove={
                    onRemoveTag
                      ? () => onRemoveTag(ticket.id, tag.id)
                      : undefined
                  }
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>
              创建于 {format(new Date(ticket.created_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
            </span>
            {ticket.completed_at && (
              <span>
                完成于 {format(new Date(ticket.completed_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
```

2. **创建 frontend/src/components/tickets/TicketList.tsx**:
```typescript
import { useEffect } from 'react'
import { useTicketStore } from '@/store/useTicketStore'
import TicketCard from './TicketCard'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Inbox } from 'lucide-react'
import type { Ticket } from '@/types/ticket'

interface TicketListProps {
  onEdit: (ticket: Ticket) => void
  onDelete: (ticket: Ticket) => void
}

export default function TicketList({ onEdit, onDelete }: TicketListProps) {
  const {
    tickets,
    isLoading,
    error,
    fetchTickets,
    toggleComplete,
    removeTagFromTicket,
  } = useTicketStore()

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  if (isLoading) {
    return (
      <div className="py-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-lg font-semibold text-gray-700">加载失败</p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-lg font-semibold text-gray-700">暂无 Ticket</p>
        <p className="text-sm text-gray-500">点击右上角按钮创建新的 Ticket</p>
      </div>
    )
  }

  return (
    <div className="py-4">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComplete={toggleComplete}
          onRemoveTag={removeTagFromTicket}
        />
      ))}
    </div>
  )
}
```

3. **创建 frontend/src/components/tags/TagSelector.tsx**:
```typescript
import { useState, useEffect } from 'react'
import { useTicketStore } from '@/store/useTicketStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Plus } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface TagSelectorProps {
  selectedTagIds: number[]
  onChange: (tagIds: number[]) => void
}

export default function TagSelector({ selectedTagIds, onChange }: TagSelectorProps) {
  const { tags, fetchTags } = useTicketStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id))
  const availableTags = tags.filter(
    (tag) =>
      !selectedTagIds.includes(tag.id) &&
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddTag = (tagId: number) => {
    onChange([...selectedTagIds, tagId])
    setSearchQuery('')
  }

  const handleRemoveTag = (tagId: number) => {
    onChange(selectedTagIds.filter((id) => id !== tagId))
  }

  return (
    <div className="py-2">
      <Label>标签</Label>

      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="inline-flex items-center gap-1"
            style={{
              backgroundColor: tag.color + '20',
              color: tag.color,
              borderColor: tag.color,
            }}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            <span>{tag.name}</span>
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="ml-1 hover:text-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Add Tag Popover */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6">
              <Plus className="h-3 w-3 mr-1" />
              添加标签
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="py-3">
              <Input
                placeholder="搜索标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />

              <div className="max-h-48 overflow-y-auto py-1">
                {availableTags.length > 0 ? (
                  availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        handleAddTag(tag.id)
                        setOpen(false)
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 text-sm"
                    >
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    没有找到标签
                  </p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
```

4. **创建 frontend/src/components/tickets/TicketForm.tsx**:
```typescript
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useTicketStore } from '@/store/useTicketStore'
import { useToast } from '@/hooks/use-toast'
import TagSelector from '@/components/tags/TagSelector'
import type { Ticket } from '@/types/ticket'

interface TicketFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket?: Ticket | null
}

export default function TicketForm({ open, onOpenChange, ticket }: TicketFormProps) {
  const { createTicket, updateTicket } = useTicketStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tag_ids: [] as number[],
  })

  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title,
        description: ticket.description || '',
        tag_ids: ticket.tags.map((tag) => tag.id),
      })
    } else {
      setFormData({
        title: '',
        description: '',
        tag_ids: [],
      })
    }
  }, [ticket, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast({
        title: '错误',
        description: '请输入 Ticket 标题',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (ticket) {
        await updateTicket(ticket.id, {
          title: formData.title,
          description: formData.description || undefined,
        })
        toast({
          title: '成功',
          description: 'Ticket 已更新',
        })
      } else {
        await createTicket(formData)
        toast({
          title: '成功',
          description: 'Ticket 已创建',
        })
      }
      onOpenChange(false)
    } catch (error) {
      toast({
        title: '错误',
        description: ticket ? '更新 Ticket 失败' : '创建 Ticket 失败',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{ticket ? '编辑 Ticket' : '创建 Ticket'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="py-4">
          <div className="py-2">
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="输入 Ticket 标题"
              maxLength={255}
              required
            />
          </div>

          <div className="py-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="输入 Ticket 描述（可选）"
              rows={5}
              maxLength={10000}
            />
          </div>

          {!ticket && (
            <TagSelector
              selectedTagIds={formData.tag_ids}
              onChange={(tag_ids) => setFormData({ ...formData, tag_ids })}
            />
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : ticket ? '更新' : '创建'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### 4.4.2 整合主应用（第 8 天全天，6 小时）

**任务清单**:
- [ ] 创建主页面
- [ ] 整合所有组件
- [ ] 实现删除确认
- [ ] 添加 Toast 通知
- [ ] 测试完整功能

**执行步骤**:

1. **创建 frontend/src/App.tsx**:
```typescript
import { useState, useEffect } from 'react'
import { useTicketStore } from './store/useTicketStore'
import Header from './components/layout/Header'
import FilterSidebar from './components/layout/FilterSidebar'
import TicketList from './components/tickets/TicketList'
import TicketForm from './components/tickets/TicketForm'
import ConfirmDialog from './components/common/ConfirmDialog'
import { Toaster } from './components/ui/toaster'
import { useToast } from './hooks/use-toast'
import type { Ticket } from './types/ticket'

export default function App() {
  const { fetchTags, deleteTicket } = useTicketStore()
  const { toast } = useToast()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const [deletingTicket, setDeletingTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const handleNewTicket = () => {
    setEditingTicket(null)
    setIsFormOpen(true)
  }

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket)
    setIsFormOpen(true)
  }

  const handleDeleteTicket = (ticket: Ticket) => {
    setDeletingTicket(ticket)
  }

  const confirmDelete = async () => {
    if (!deletingTicket) return

    try {
      await deleteTicket(deletingTicket.id)
      toast({
        title: '成功',
        description: 'Ticket 已删除',
      })
    } catch (error) {
      toast({
        title: '错误',
        description: '删除 Ticket 失败',
        variant: 'destructive',
      })
    } finally {
      setDeletingTicket(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNewTicket={handleNewTicket} />

      <div className="flex">
        <FilterSidebar />

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-4xl">
            <TicketList
              onEdit={handleEditTicket}
              onDelete={handleDeleteTicket}
            />
          </div>
        </main>
      </div>

      <TicketForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        ticket={editingTicket}
      />

      <ConfirmDialog
        open={!!deletingTicket}
        onOpenChange={(open) => !open && setDeletingTicket(null)}
        title="确认删除"
        description={`确定要删除 "${deletingTicket?.title}" 吗？此操作无法撤销。`}
        onConfirm={confirmDelete}
        confirmText="删除"
        cancelText="取消"
      />

      <Toaster />
    </div>
  )
}
```

2. **更新 frontend/src/main.tsx**:
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

3. **创建 frontend/src/styles/globals.css**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

4. **测试应用**:
```bash
cd frontend

# 启动前端开发服务器
yarn dev

# 在浏览器中访问
open http://localhost:5173
```

---

## 阶段 5: 集成测试与优化（第 9-10 天）

### 4.5.1 后端测试（第 9 天上午，3 小时）

**任务清单**:
- [ ] 编写 Ticket API 测试
- [ ] 编写 Tag API 测试
- [ ] 运行测试套件

**执行步骤**:

1. **创建 backend/tests/conftest.py**:
```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
```

2. **创建 backend/tests/test_tickets.py**:
```python
def test_create_ticket(client):
    response = client.post(
        "/api/v1/tickets",
        json={"title": "Test Ticket", "description": "Test Description"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Ticket"
    assert data["status"] == "pending"


def test_list_tickets(client):
    # Create a ticket first
    client.post("/api/v1/tickets", json={"title": "Test Ticket"})

    # List tickets
    response = client.get("/api/v1/tickets")
    assert response.status_code == 200
    data = response.json()
    assert len(data["tickets"]) == 1


def test_update_ticket(client):
    # Create a ticket
    create_response = client.post(
        "/api/v1/tickets", json={"title": "Original Title"}
    )
    ticket_id = create_response.json()["id"]

    # Update the ticket
    response = client.put(
        f"/api/v1/tickets/{ticket_id}",
        json={"title": "Updated Title"},
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"


def test_delete_ticket(client):
    # Create a ticket
    create_response = client.post(
        "/api/v1/tickets", json={"title": "To Delete"}
    )
    ticket_id = create_response.json()["id"]

    # Delete the ticket
    response = client.delete(f"/api/v1/tickets/{ticket_id}")
    assert response.status_code == 204

    # Verify deletion
    get_response = client.get(f"/api/v1/tickets/{ticket_id}")
    assert get_response.status_code == 404


def test_complete_ticket(client):
    # Create a ticket
    create_response = client.post(
        "/api/v1/tickets", json={"title": "To Complete"}
    )
    ticket_id = create_response.json()["id"]

    # Complete the ticket
    response = client.patch(f"/api/v1/tickets/{ticket_id}/complete")
    assert response.status_code == 200
    assert response.json()["status"] == "completed"
```

3. **运行测试**:
```bash
cd backend
uv run pytest -v
```

### 4.5.2 前端优化（第 9 天下午，3 小时）

**任务清单**:
- [ ] 添加加载状态
- [ ] 优化错误处理
- [ ] 添加空状态UI
- [ ] 优化响应式布局

**执行步骤**:

1. **优化移动端响应式** - 更新 `frontend/src/App.tsx`:
```typescript
// 添加移动端侧边栏状态
const [isSidebarOpen, setIsSidebarOpen] = useState(false)

// 在 Header 中添加菜单按钮
<Header
  onNewTicket={handleNewTicket}
  onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
/>

// 侧边栏添加移动端样式
<aside className={cn(
  "w-64 border-r bg-gray-50 transition-transform",
  "lg:translate-x-0",
  isSidebarOpen ? "translate-x-0" : "-translate-x-full absolute inset-y-0 z-50"
)}>
  <FilterSidebar onClose={() => setIsSidebarOpen(false)} />
</aside>
```

2. **添加键盘快捷键支持**:
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl/Cmd + K: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      // Focus search input
    }

    // N: New ticket
    if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
      const target = e.target as HTMLElement
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        handleNewTicket()
      }
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

### 4.5.3 性能优化（第 10 天上午，2 小时）

**任务清单**:
- [ ] 实现搜索防抖
- [ ] 优化 API 调用
- [ ] 添加请求缓存
- [ ] 优化渲染性能

**执行步骤**:

1. **已实现搜索防抖** (在 SearchBar 组件中)

2. **添加 React Query 进行数据缓存**:
```bash
yarn add @tanstack/react-query
```

3. **配置 Query Client** - 更新 `frontend/src/main.tsx`:
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

### 4.5.4 最终测试（第 10 天下午，4 小时）

**任务清单**:
- [ ] 端到端功能测试
- [ ] 浏览器兼容性测试
- [ ] 移动端测试
- [ ] 性能测试
- [ ] 修复发现的问题

**测试清单**:
- [ ] 创建 Ticket
- [ ] 编辑 Ticket
- [ ] 删除 Ticket
- [ ] 完成/取消完成 Ticket
- [ ] 添加/移除标签
- [ ] 搜索 Ticket
- [ ] 按状态过滤
- [ ] 按标签过滤
- [ ] 响应式布局
- [ ] 错误处理

---

## 阶段 6: 文档与部署（第 11 天）

### 4.6.1 编写文档（第 11 天上午，3 小时）

**任务清单**:
- [ ] 编写 README.md
- [ ] 编写 API 文档
- [ ] 编写部署指南
- [ ] 编写用户使用手册

**执行步骤**:

1. **创建 w1/project-alpha/README.md**:
```markdown
# Project Alpha - Ticket 管理系统

基于标签的 Ticket 管理工具，提供简洁高效的任务跟踪和分类功能。

## 技术栈

- **后端**: FastAPI + PostgreSQL + SQLAlchemy
- **前端**: React + TypeScript + Vite + Tailwind CSS + Shadcn UI
- **状态管理**: Zustand
- **数据获取**: Axios

## 功能特性

- ✅ 创建、编辑、删除、完成 Ticket
- ✅ 基于标签的灵活分类
- ✅ 多维度过滤（状态、标签）
- ✅ 实时搜索
- ✅ 响应式设计
- ✅ 直观的用户界面

## 快速开始

### 前置要求

- Python 3.11+ (推荐使用 uv)
- Node.js 18+ (推荐使用 yarn)
- PostgreSQL 17+

### 后端设置

```bash
cd backend

# 使用 uv 安装依赖
uv sync

# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，配置数据库连接

# 运行数据库迁移
uv run alembic upgrade head

# 启动开发服务器
uv run uvicorn app.main:app --reload --port 8000
```

### 前端设置

```bash
cd frontend

# 安装依赖
yarn

# 启动开发服务器
yarn dev
```

访问 http://localhost:5173 查看应用。

## 项目结构

```
project-alpha/
├── backend/          # FastAPI 后端
│   ├── app/
│   │   ├── api/     # API 路由
│   │   ├── crud/    # 数据库操作
│   │   ├── models/  # 数据模型
│   │   └── schemas/ # Pydantic 模型
│   └── tests/       # 测试
├── frontend/        # React 前端
│   └── src/
│       ├── components/  # React 组件
│       ├── store/       # 状态管理
│       └── types/       # TypeScript 类型
└── docs/           # 文档
```

## API 文档

后端运行后访问:
- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

## 开发

### 后端开发

```bash
# 运行测试
uv run pytest

# 代码格式化
uv run black app/
uv run isort app/

# 类型检查
uv run mypy app/
```

### 前端开发

```bash
# 构建
yarn build

# 预览构建
yarn preview

# 代码检查
yarn lint
```

## 许可证

MIT
```

2. **创建 docs/api.md** - API 文档

3. **创建 docs/setup.md** - 详细安装指南

4. **创建 docs/user-guide.md** - 用户使用手册

### 4.6.2 部署准备（第 11 天下午，3 小时）

**任务清单**:
- [ ] 配置生产环境变量
- [ ] 优化前端构建
- [ ] 测试生产构建
- [ ] 编写部署脚本

**执行步骤**:

1. **前端生产构建**:
```bash
cd frontend
yarn build
```

2. **后端生产配置**:
```bash
# backend/.env.production
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/projectalpha
ENVIRONMENT=production
ALLOWED_ORIGINS=http://localhost:5173
```

3. **创建启动脚本** - `w1/project-alpha/start.sh`:
```bash
#!/bin/bash

echo "Starting Project Alpha..."

# Start backend
echo "Starting backend..."
cd backend
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend..."
cd ../frontend
yarn preview --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Application is running!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8000"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
```

---

## 5. 开发检查清单

### 5.1 后端开发检查清单

- [ ] 数据库设计完成
- [ ] 数据库迁移脚本创建
- [ ] SQLAlchemy 模型定义
- [ ] Pydantic Schemas 定义
- [ ] CRUD 操作实现
- [ ] API 路由实现
- [ ] 错误处理实现
- [ ] CORS 配置
- [ ] 日志配置
- [ ] 单元测试编写
- [ ] 集成测试编写
- [ ] API 文档生成

### 5.2 前端开发检查清单

- [ ] 项目初始化
- [ ] TypeScript 类型定义
- [ ] API 客户端实现
- [ ] 状态管理实现
- [ ] 布局组件完成
- [ ] Ticket 组件完成
- [ ] Tag 组件完成
- [ ] 搜索功能实现
- [ ] 过滤功能实现
- [ ] 表单验证实现
- [ ] 错误处理实现
- [ ] 加载状态处理
- [ ] 响应式设计
- [ ] 性能优化

### 5.3 测试检查清单

- [ ] 后端单元测试通过
- [ ] 后端集成测试通过
- [ ] 前端组件渲染正常
- [ ] API 调用正常
- [ ] 创建 Ticket 功能
- [ ] 编辑 Ticket 功能
- [ ] 删除 Ticket 功能
- [ ] 完成 Ticket 功能
- [ ] 标签管理功能
- [ ] 搜索功能
- [ ] 过滤功能
- [ ] 错误处理
- [ ] 移动端适配

### 5.4 文档检查清单

- [ ] README.md 完成
- [ ] API 文档完成
- [ ] 部署指南完成
- [ ] 用户使用手册完成
- [ ] 代码注释完整

---

## 6. 时间安排表

| 阶段     | 天数      | 主要任务               | 交付物                     |
|--------|----------|------------------------|-------------------------|
| 阶段 0   | 0.5 天    | 项目初始化             | 项目结构、依赖安装          |
| 阶段 1   | 1.5 天    | 数据库设计与后端基础   | 数据库表、模型定义、迁移脚本 |
| 阶段 2   | 2 天      | 后端 API 开发          | 完整的 REST API            |
| 阶段 3   | 2 天      | 前端项目搭建与基础组件 | 布局组件、基础设施          |
| 阶段 4   | 2 天      | 前端功能开发           | Ticket 和 Tag 组件         |
| 阶段 5   | 2 天      | 集成测试与优化         | 测试用例、性能优化          |
| 阶段 6   | 1 天      | 文档与部署             | 完整文档、部署脚本          |
| **总计** | **11 天** |                        | **完整可运行的应用**       |

---

## 7. 风险与应对

### 7.1 技术风险

| 风险           | 影响 | 概率 | 应对措施                |
|--------------|-----|-----|---------------------|
| 数据库性能问题 | 中   | 低   | 添加索引、优化查询       |
| API 响应慢     | 中   | 低   | 实现缓存、优化数据库查询 |
| 前端性能问题   | 低   | 低   | 代码拆分、懒加载         |
| 浏览器兼容性   | 低   | 中   | 使用现代浏览器特性检测  |

### 7.2 时间风险

| 风险             | 影响 | 概率 | 应对措施                  |
|----------------|-----|-----|-----------------------|
| 需求变更         | 高   | 中   | 保持代码灵活性，模块化设计 |
| 技术难题         | 中   | 中   | 预留缓冲时间，及时寻求帮助 |
| 测试发现重大问题 | 高   | 低   | 早期频繁测试，持续集成     |

---

## 8. 后续优化计划

### 8.1 短期优化（1-2 周）

- [ ] 添加批量操作功能
- [ ] 实现拖拽排序
- [ ] 添加数据导出功能
- [ ] 优化移动端体验
- [ ] 添加更多过滤选项

### 8.2 中期扩展（1-2 月）

- [ ] 添加用户认证系统
- [ ] 实现多用户协作
- [ ] 添加 Ticket 优先级
- [ ] 添加截止日期提醒
- [ ] 实现历史记录查看
- [ ] 添加评论功能

### 8.3 长期规划（3-6 月）

- [ ] 实时更新（WebSocket）
- [ ] 数据统计和可视化
- [ ] 移动端应用
- [ ] PWA 支持
- [ ] 第三方集成

---

## 9. 成功标准

### 9.1 功能完整性

- ✅ 所有核心功能正常工作
- ✅ 无严重 Bug
- ✅ API 响应正常
- ✅ 前端交互流畅

### 9.2 代码质量

- ✅ 代码结构清晰
- ✅ 注释完整
- ✅ 遵循最佳实践
- ✅ 测试覆盖率 > 70%

### 9.3 用户体验

- ✅ 界面美观直观
- ✅ 响应速度快
- ✅ 移动端适配良好
- ✅ 错误提示友好

### 9.4 文档完整性

- ✅ README 清晰
- ✅ API 文档完整
- ✅ 部署指南详细
- ✅ 用户手册易懂

---

## 10. 总结

本实施计划提供了 Project Alpha 从零到完整可运行应用的详细路线图。通过分阶段、模块化的开发方式，确保项目按时高质量交付。

**关键成功因素**:
1. 遵循计划，但保持灵活性
2. 频繁测试，早期发现问题
3. 保持代码质量，不追求速度牺牲质量
4. 及时记录，确保可维护性
5. 用户体验优先

**预期成果**:
- 完整功能的 Ticket 管理系统
- 清晰的代码结构
- 完善的文档
- 良好的用户体验
- 可扩展的架构

---

**文档版本**: 1.0
**创建日期**: 2025-11-10
**最后更新**: 2025-11-10
**作者**: AI Assistant
**状态**: 已完成

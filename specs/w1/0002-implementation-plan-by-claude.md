# Ticket 管理工具 - 详细实现计划

## 目录
1. [实施概览](#1-实施概览)
2. [环境准备](#2-环境准备)
3. [数据库实施](#3-数据库实施)
4. [后端实施](#4-后端实施)
5. [前端实施](#5-前端实施)
6. [测试实施](#6-测试实施)
7. [部署实施](#7-部署实施)
8. [验收标准](#8-验收标准)

---

## 1. 实施概览

### 1.1 开发阶段划分

本项目分为 **5 个主要阶段**,预计 **6-8 个工作日** 完成:

| 阶段 | 内容 | 预计时间 | 依赖 |
|------|------|----------|------|
| 阶段 0 | 环境准备 | 0.5 天 | 无 |
| 阶段 1 | 数据库设计与实施 | 0.5 天 | 阶段 0 |
| 阶段 2 | 后端开发 | 2-3 天 | 阶段 1 |
| 阶段 3 | 前端开发 | 3-4 天 | 阶段 2 |
| 阶段 4 | 测试与优化 | 1-2 天 | 阶段 3 |

### 1.2 开发顺序

采用 **后端优先** 的开发策略:

```
环境准备 → 数据库 → 后端 API → 前端 UI → 集成测试
```

**理由:**
- 后端 API 定义数据契约
- 前端可以使用 Swagger 文档进行开发
- 并行开发时减少返工

### 1.3 版本控制策略

**分支策略:**
```
main                    # 主分支,稳定代码
├── develop             # 开发分支
│   ├── feature/backend # 后端功能分支
│   └── feature/frontend # 前端功能分支
```

**提交规范:**
```
feat: 添加新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具链相关
```

---

## 2. 环境准备

### 2.1 开发环境要求

#### 2.1.1 必需软件

| 软件 | 版本要求 | 用途 |
|------|----------|------|
| PostgreSQL | 17+ | 数据库 |
| Python | 3.11+ | 后端运行时 |
| uv | 最新版 | Python 包管理 |
| Node.js | 20+ | 前端运行时 |
| npm/yarn | 最新版 | 前端包管理 |
| Git | 2.0+ | 版本控制 |

#### 2.1.2 推荐工具

| 工具 | 用途 |
|------|------|
| VS Code | 代码编辑器 |
| TablePlus / DBeaver | 数据库客户端 |
| Postman / Insomnia | API 测试 |
| Chrome DevTools | 前端调试 |

### 2.2 环境搭建步骤

#### 步骤 2.2.1: 安装 PostgreSQL

**macOS:**
```bash
# 安装 PostgreSQL 17
brew install postgresql@17

# 启动服务
brew services start postgresql@17

# 验证安装
psql --version
```

**Linux (Ubuntu):**
```bash
# 添加 PostgreSQL APT 仓库
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# 安装
sudo apt-get update
sudo apt-get install postgresql-17
```

#### 步骤 2.2.2: 创建数据库

```bash
# 连接到 PostgreSQL
psql postgres

# 在 psql 中执行:
CREATE USER postgres WITH PASSWORD 'postgres';
CREATE DATABASE projectalpha OWNER postgres;
GRANT ALL PRIVILEGES ON DATABASE projectalpha TO postgres;

# 退出
\q
```

#### 步骤 2.2.3: 安装 Python 环境

```bash
# 安装 uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# 验证安装
uv --version
```

#### 步骤 2.2.4: 安装 Node.js

**使用 nvm (推荐):**
```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装 Node.js 20
nvm install 20
nvm use 20

# 验证
node --version
npm --version
```

#### 步骤 2.2.5: 创建项目目录结构

```bash
# 创建项目根目录
mkdir -p ticket-manager
cd ticket-manager

# 创建子目录
mkdir backend frontend docs

# 初始化 Git
git init
```

### 2.3 环境验证清单

完成环境搭建后,验证以下项目:

- [ ] PostgreSQL 服务运行中
- [ ] 可以连接到 `projectalpha` 数据库
- [ ] Python 3.11+ 可用
- [ ] uv 命令可用
- [ ] Node.js 20+ 可用
- [ ] npm 可用
- [ ] Git 仓库已初始化

---

## 3. 数据库实施

### 3.1 数据库设计任务清单

- [ ] 3.1.1 创建 tickets 表
- [ ] 3.1.2 创建 tags 表
- [ ] 3.1.3 创建 ticket_tags 关联表
- [ ] 3.1.4 创建索引
- [ ] 3.1.5 创建触发器函数
- [ ] 3.1.6 插入测试数据
- [ ] 3.1.7 验证数据模型

### 3.2 详细实施步骤

#### 步骤 3.2.1: 创建初始化脚本

创建文件: `backend/init_db.sql`

```sql
-- ============================================
-- Ticket 管理工具 - 数据库初始化脚本
-- ============================================

-- 1. 创建 tickets 表
CREATE TABLE IF NOT EXISTS tickets (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL CHECK (char_length(trim(title)) > 0),
    description TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 2. 创建 tags 表
CREATE TABLE IF NOT EXISTS tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE CHECK (char_length(trim(name)) > 0),
    color VARCHAR(7) NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. 创建 ticket_tags 关联表
CREATE TABLE IF NOT EXISTS ticket_tags (
    ticket_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (ticket_id, tag_id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_is_completed ON tickets(is_completed);
CREATE INDEX IF NOT EXISTS idx_tickets_title_gin ON tickets USING gin(to_tsvector('simple', title));
CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name ON tags(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_ticket_tags_ticket ON ticket_tags(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_tags_tag ON ticket_tags(tag_id);

-- 5. 创建触发器函数 - 自动更新 updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. 创建触发器 - 绑定到 tickets 表
DROP TRIGGER IF EXISTS set_timestamp ON tickets;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- 7. 创建触发器函数 - 管理 completed_at
CREATE OR REPLACE FUNCTION manage_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
    NEW.completed_at = NOW();
  ELSIF NEW.is_completed = FALSE AND OLD.is_completed = TRUE THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. 创建触发器 - 绑定到 tickets 表
DROP TRIGGER IF EXISTS manage_completion ON tickets;
CREATE TRIGGER manage_completion
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION manage_completed_at();

-- 9. 插入示例标签
INSERT INTO tags (name, color) VALUES
    ('后端', '#3B82F6'),
    ('前端', '#10B981'),
    ('Bug', '#EF4444'),
    ('功能', '#8B5CF6'),
    ('优化', '#F59E0B')
ON CONFLICT (name) DO NOTHING;

-- 10. 插入示例 Ticket
INSERT INTO tickets (title, description, is_completed) VALUES
    ('搭建项目基础架构', '初始化 FastAPI 和 React 项目', false),
    ('实现用户认证', '添加 JWT 认证功能', false),
    ('修复导航栏样式', '移动端导航栏显示异常', true)
ON CONFLICT DO NOTHING;

-- 11. 关联标签(假设 ID 自增从 1 开始)
DO $$
DECLARE
    ticket1_id BIGINT;
    ticket2_id BIGINT;
    ticket3_id BIGINT;
BEGIN
    SELECT id INTO ticket1_id FROM tickets WHERE title = '搭建项目基础架构' LIMIT 1;
    SELECT id INTO ticket2_id FROM tickets WHERE title = '实现用户认证' LIMIT 1;
    SELECT id INTO ticket3_id FROM tickets WHERE title = '修复导航栏样式' LIMIT 1;

    IF ticket1_id IS NOT NULL THEN
        INSERT INTO ticket_tags (ticket_id, tag_id) VALUES
            (ticket1_id, 1), (ticket1_id, 2)
        ON CONFLICT DO NOTHING;
    END IF;

    IF ticket2_id IS NOT NULL THEN
        INSERT INTO ticket_tags (ticket_id, tag_id) VALUES
            (ticket2_id, 1)
        ON CONFLICT DO NOTHING;
    END IF;

    IF ticket3_id IS NOT NULL THEN
        INSERT INTO ticket_tags (ticket_id, tag_id) VALUES
            (ticket3_id, 2), (ticket3_id, 3)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
```

#### 步骤 3.2.2: 执行初始化脚本

```bash
# 执行 SQL 脚本
psql -U postgres -d projectalpha -f backend/init_db.sql

# 验证表创建成功
psql -U postgres -d projectalpha -c "\dt"

# 查看示例数据
psql -U postgres -d projectalpha -c "SELECT * FROM tickets;"
psql -U postgres -d projectalpha -c "SELECT * FROM tags;"
```

#### 步骤 3.2.3: 验证触发器

```bash
# 测试 updated_at 触发器
psql -U postgres -d projectalpha -c "
UPDATE tickets SET title = '搭建项目基础架构(更新)' WHERE id = 1;
SELECT id, title, created_at, updated_at FROM tickets WHERE id = 1;
"

# 测试 completed_at 触发器
psql -U postgres -d projectalpha -c "
UPDATE tickets SET is_completed = TRUE WHERE id = 1;
SELECT id, title, is_completed, completed_at FROM tickets WHERE id = 1;
"
```

### 3.3 数据库文档

创建文件: `docs/database-schema.md`

```markdown
# 数据库 Schema 文档

## 表结构

### tickets 表
存储 Ticket 信息

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 自增主键 |
| title | VARCHAR(200) | NOT NULL | 标题,不能为空白 |
| description | TEXT | NULL | 描述 |
| is_completed | BOOLEAN | NOT NULL, DEFAULT FALSE | 完成状态 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新时间(自动) |
| completed_at | TIMESTAMPTZ | NULL | 完成时间(自动) |

### tags 表
存储标签信息

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGSERIAL | PRIMARY KEY | 自增主键 |
| name | VARCHAR(30) | NOT NULL, UNIQUE | 标签名,唯一(不区分大小写) |
| color | VARCHAR(7) | NOT NULL | 颜色(#RRGGBB) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 |

### ticket_tags 表
Ticket 与 Tag 的多对多关联

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| ticket_id | BIGINT | NOT NULL, FK | Ticket ID |
| tag_id | BIGINT | NOT NULL, FK | Tag ID |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 关联时间 |

主键: (ticket_id, tag_id)

## 索引

- `idx_tickets_created_at`: 优化按创建时间排序
- `idx_tickets_is_completed`: 优化状态筛选
- `idx_tickets_title_gin`: 全文搜索优化
- `idx_tags_name`: 标签名唯一性
- `idx_ticket_tags_ticket`: 优化 Ticket 查标签
- `idx_ticket_tags_tag`: 优化标签查 Ticket

## 触发器

- `set_timestamp`: 自动更新 tickets.updated_at
- `manage_completion`: 自动管理 tickets.completed_at
```

---

## 4. 后端实施

### 4.1 后端任务清单

#### 阶段 2.1: 项目搭建 (0.5 天)
- [ ] 4.1.1 初始化 Python 项目
- [ ] 4.1.2 安装依赖包
- [ ] 4.1.3 创建项目目录结构
- [ ] 4.1.4 配置环境变量
- [ ] 4.1.5 配置数据库连接

#### 阶段 2.2: 核心模型开发 (0.5 天)
- [ ] 4.1.6 创建 SQLAlchemy 模型
- [ ] 4.1.7 创建 Pydantic Schemas
- [ ] 4.1.8 创建工具函数

#### 阶段 2.3: API 开发 - Ticket (0.5 天)
- [ ] 4.1.9 实现 Ticket Repository
- [ ] 4.1.10 实现 Ticket Service
- [ ] 4.1.11 实现 Ticket API 路由

#### 阶段 2.4: API 开发 - Tag (0.5 天)
- [ ] 4.1.12 实现 Tag Repository
- [ ] 4.1.13 实现 Tag Service
- [ ] 4.1.14 实现 Tag API 路由

#### 阶段 2.5: 测试与文档 (0.5-1 天)
- [ ] 4.1.15 编写单元测试
- [ ] 4.1.16 编写 API 测试
- [ ] 4.1.17 配置 Swagger 文档
- [ ] 4.1.18 手动测试所有端点

### 4.2 详细实施步骤

#### 步骤 4.2.1: 初始化后端项目

```bash
# 进入后端目录
cd backend

# 初始化 uv 项目
uv init

# 安装核心依赖
uv add fastapi uvicorn[standard] sqlalchemy psycopg2-binary pydantic-settings

# 安装开发依赖
uv add --dev pytest pytest-asyncio httpx

# 创建 .env.example
cat > .env.example << 'EOF'
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/projectalpha
API_V1_PREFIX=/api/v1
PROJECT_NAME=Ticket 管理工具
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
EOF

# 复制为实际配置
cp .env.example .env
```

#### 步骤 4.2.2: 创建项目结构

```bash
# 创建目录结构
mkdir -p app/{api/v1,models,schemas,services,repositories,utils}

# 创建 __init__.py 文件
touch app/__init__.py
touch app/api/__init__.py
touch app/api/v1/__init__.py
touch app/models/__init__.py
touch app/schemas/__init__.py
touch app/services/__init__.py
touch app/repositories/__init__.py
touch app/utils/__init__.py

# 创建主要文件
touch app/main.py
touch app/config.py
touch app/database.py
touch app/dependencies.py
touch app/exceptions.py
```

最终结构:
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── dependencies.py
│   ├── exceptions.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── tickets.py
│   │       └── tags.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── ticket.py
│   │   └── tag.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── ticket.py
│   │   └── tag.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ticket_service.py
│   │   └── tag_service.py
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── ticket_repo.py
│   │   └── tag_repo.py
│   └── utils/
│       ├── __init__.py
│       └── color_generator.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_tickets.py
│   └── test_tags.py
├── .env
├── .env.example
├── pyproject.toml
└── README.md
```

#### 步骤 4.2.3: 实现配置管理

创建 `app/config.py`:

```python
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    """应用配置"""

    # 数据库
    DATABASE_URL: str

    # API
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Ticket 管理工具"
    VERSION: str = "1.0.0"

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173"]

    # 分页
    DEFAULT_PAGE_SIZE: int = 50
    MAX_PAGE_SIZE: int = 100

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()
```

#### 步骤 4.2.4: 实现数据库连接

创建 `app/database.py`:

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import get_settings

settings = get_settings()

# 创建数据库引擎
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类
Base = declarative_base()


def get_db():
    """数据库依赖注入"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### 步骤 4.2.5: 实现 SQLAlchemy 模型

创建 `app/models/ticket.py`:

```python
from sqlalchemy import Column, BigInteger, String, Text, Boolean, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

# 多对多关联表
ticket_tags = Table(
    'ticket_tags',
    Base.metadata,
    Column('ticket_id', BigInteger, ForeignKey('tickets.id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', BigInteger, ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True),
    Column('created_at', DateTime(timezone=True), server_default=func.now())
)


class Ticket(Base):
    """Ticket 模型"""
    __tablename__ = "tickets"

    id = Column(BigInteger, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # 关系
    tags = relationship("Tag", secondary=ticket_tags, back_populates="tickets")
```

创建 `app/models/tag.py`:

```python
from sqlalchemy import Column, BigInteger, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
from .ticket import ticket_tags


class Tag(Base):
    """Tag 模型"""
    __tablename__ = "tags"

    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(String(30), unique=True, nullable=False, index=True)
    color = Column(String(7), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # 关系
    tickets = relationship("Ticket", secondary=ticket_tags, back_populates="tags")
```

创建 `app/models/__init__.py`:

```python
from .ticket import Ticket, ticket_tags
from .tag import Tag

__all__ = ["Ticket", "Tag", "ticket_tags"]
```

#### 步骤 4.2.6: 实现 Pydantic Schemas

创建 `app/schemas/tag.py`:

```python
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional
import re


class TagBase(BaseModel):
    """Tag 基础 Schema"""
    name: str = Field(..., min_length=1, max_length=30)
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """验证标签名称"""
        if not v.strip():
            raise ValueError('标签名称不能为空白')
        return v.strip()


class TagCreate(TagBase):
    """创建 Tag 的 Schema"""
    pass


class TagUpdate(BaseModel):
    """更新 Tag 的 Schema"""
    name: Optional[str] = Field(None, min_length=1, max_length=30)
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')


class TagResponse(TagBase):
    """Tag 响应 Schema"""
    id: int
    created_at: datetime
    ticket_count: Optional[int] = 0

    class Config:
        from_attributes = True


class TagListResponse(BaseModel):
    """Tag 列表响应"""
    data: list[TagResponse]
```

创建 `app/schemas/ticket.py`:

```python
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List
from .tag import TagResponse


class TicketBase(BaseModel):
    """Ticket 基础 Schema"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        """验证标题"""
        if not v.strip():
            raise ValueError('标题不能为空白')
        return v.strip()


class TicketCreate(TicketBase):
    """创建 Ticket 的 Schema"""
    tag_ids: Optional[List[int]] = []


class TicketUpdate(BaseModel):
    """更新 Ticket 的 Schema"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)


class TicketResponse(TicketBase):
    """Ticket 响应 Schema"""
    id: int
    is_completed: bool
    tags: List[TagResponse]
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class PaginationInfo(BaseModel):
    """分页信息"""
    total: int
    page: int
    page_size: int
    total_pages: int


class TicketListResponse(BaseModel):
    """Ticket 列表响应"""
    data: dict
```

#### 步骤 4.2.7: 实现工具函数

创建 `app/utils/color_generator.py`:

```python
import random

# 预设颜色调色板
TAG_COLOR_PALETTE = [
    '#EF4444',  # Red
    '#F97316',  # Orange
    '#F59E0B',  # Amber
    '#84CC16',  # Lime
    '#10B981',  # Emerald
    '#14B8A6',  # Teal
    '#06B6D4',  # Cyan
    '#3B82F6',  # Blue
    '#6366F1',  # Indigo
    '#8B5CF6',  # Violet
    '#A855F7',  # Purple
    '#EC4899',  # Pink
]


def generate_random_color() -> str:
    """随机生成颜色"""
    return random.choice(TAG_COLOR_PALETTE)


def generate_color_from_name(name: str) -> str:
    """根据名称确定性生成颜色"""
    hash_value = sum(ord(c) for c in name)
    index = hash_value % len(TAG_COLOR_PALETTE)
    return TAG_COLOR_PALETTE[index]
```

#### 步骤 4.2.8: 实现异常处理

创建 `app/exceptions.py`:

```python
from fastapi import Request, status
from fastapi.responses import JSONResponse


class AppException(Exception):
    """应用基础异常"""

    def __init__(self, message: str, code: str, status_code: int = 400):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(self.message)


class TicketNotFound(AppException):
    """Ticket 不存在"""

    def __init__(self):
        super().__init__("Ticket 不存在", "TICKET_NOT_FOUND", 404)


class TagNotFound(AppException):
    """标签不存在"""

    def __init__(self):
        super().__init__("标签不存在", "TAG_NOT_FOUND", 404)


class DuplicateTag(AppException):
    """标签名称重复"""

    def __init__(self):
        super().__init__("标签名称已存在", "DUPLICATE_TAG", 400)


async def app_exception_handler(request: Request, exc: AppException):
    """全局异常处理器"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message
            }
        }
    )
```

#### 步骤 4.2.9: 实现 Repository 层

创建 `app/repositories/ticket_repo.py`:

```python
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_
from typing import List, Optional
from ..models.ticket import Ticket
from ..models.tag import Tag


class TicketRepository:
    """Ticket 数据访问层"""

    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        is_completed: Optional[bool] = None,
        tag_ids: Optional[List[int]] = None,
        tag_filter_mode: str = "and",
        search: Optional[str] = None,
        sort_by: str = "created_at",
        order: str = "desc",
        skip: int = 0,
        limit: int = 50
    ) -> tuple[List[Ticket], int]:
        """获取 Ticket 列表"""
        query = self.db.query(Ticket).options(joinedload(Ticket.tags))

        # 状态筛选
        if is_completed is not None:
            query = query.filter(Ticket.is_completed == is_completed)

        # 标签筛选
        if tag_ids:
            if tag_filter_mode == "and":
                # AND 模式: 包含所有标签
                for tag_id in tag_ids:
                    query = query.filter(Ticket.tags.any(Tag.id == tag_id))
            else:
                # OR 模式: 包含任一标签
                query = query.filter(Ticket.tags.any(Tag.id.in_(tag_ids)))

        # 标题搜索
        if search:
            query = query.filter(Ticket.title.ilike(f"%{search}%"))

        # 计算总数
        total = query.count()

        # 排序
        sort_column = getattr(Ticket, sort_by, Ticket.created_at)
        if order == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        # 分页
        tickets = query.offset(skip).limit(limit).all()

        return tickets, total

    def get_by_id(self, ticket_id: int) -> Optional[Ticket]:
        """根据 ID 获取 Ticket"""
        return self.db.query(Ticket).options(joinedload(Ticket.tags)).filter(Ticket.id == ticket_id).first()

    def create(self, title: str, description: Optional[str], tag_ids: List[int]) -> Ticket:
        """创建 Ticket"""
        ticket = Ticket(title=title, description=description)
        self.db.add(ticket)
        self.db.flush()

        # 关联标签
        if tag_ids:
            tags = self.db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
            ticket.tags = tags

        self.db.commit()
        self.db.refresh(ticket)
        return ticket

    def update(self, ticket: Ticket, title: Optional[str], description: Optional[str]) -> Ticket:
        """更新 Ticket"""
        if title is not None:
            ticket.title = title
        if description is not None:
            ticket.description = description

        self.db.commit()
        self.db.refresh(ticket)
        return ticket

    def delete(self, ticket: Ticket) -> None:
        """删除 Ticket"""
        self.db.delete(ticket)
        self.db.commit()

    def toggle_complete(self, ticket: Ticket) -> Ticket:
        """切换完成状态"""
        ticket.is_completed = not ticket.is_completed
        self.db.commit()
        self.db.refresh(ticket)
        return ticket

    def add_tags(self, ticket: Ticket, tag_ids: List[int]) -> Ticket:
        """添加标签"""
        tags = self.db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
        for tag in tags:
            if tag not in ticket.tags:
                ticket.tags.append(tag)

        self.db.commit()
        self.db.refresh(ticket)
        return ticket

    def remove_tag(self, ticket: Ticket, tag_id: int) -> Ticket:
        """移除标签"""
        tag = self.db.query(Tag).filter(Tag.id == tag_id).first()
        if tag and tag in ticket.tags:
            ticket.tags.remove(tag)
            self.db.commit()
            self.db.refresh(ticket)
        return ticket
```

创建 `app/repositories/tag_repo.py`:

```python
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from ..models.tag import Tag
from ..models.ticket import ticket_tags


class TagRepository:
    """Tag 数据访问层"""

    def __init__(self, db: Session):
        self.db = db

    def get_all(self, include_count: bool = True) -> List[Tag]:
        """获取所有标签"""
        if include_count:
            # 左连接计算 Ticket 数量
            tags = self.db.query(
                Tag,
                func.count(ticket_tags.c.ticket_id).label('ticket_count')
            ).outerjoin(ticket_tags).group_by(Tag.id).all()

            # 附加计数
            result = []
            for tag, count in tags:
                tag.ticket_count = count
                result.append(tag)
            return result
        else:
            return self.db.query(Tag).all()

    def get_by_id(self, tag_id: int) -> Optional[Tag]:
        """根据 ID 获取标签"""
        return self.db.query(Tag).filter(Tag.id == tag_id).first()

    def get_by_name(self, name: str) -> Optional[Tag]:
        """根据名称获取标签"""
        return self.db.query(Tag).filter(func.lower(Tag.name) == name.lower()).first()

    def create(self, name: str, color: str) -> Tag:
        """创建标签"""
        tag = Tag(name=name, color=color)
        self.db.add(tag)
        self.db.commit()
        self.db.refresh(tag)
        return tag

    def update(self, tag: Tag, name: Optional[str], color: Optional[str]) -> Tag:
        """更新标签"""
        if name is not None:
            tag.name = name
        if color is not None:
            tag.color = color

        self.db.commit()
        self.db.refresh(tag)
        return tag

    def delete(self, tag: Tag) -> None:
        """删除标签"""
        self.db.delete(tag)
        self.db.commit()
```

#### 步骤 4.2.10: 实现 Service 层

创建 `app/services/ticket_service.py`:

```python
from sqlalchemy.orm import Session
from typing import List, Optional
from ..repositories.ticket_repo import TicketRepository
from ..schemas.ticket import TicketCreate, TicketUpdate
from ..models.ticket import Ticket
from ..exceptions import TicketNotFound


class TicketService:
    """Ticket 业务逻辑层"""

    def __init__(self, db: Session):
        self.repo = TicketRepository(db)

    def list_tickets(
        self,
        is_completed: Optional[bool],
        tag_ids: Optional[List[int]],
        tag_filter_mode: str,
        search: Optional[str],
        sort_by: str,
        order: str,
        page: int,
        page_size: int
    ) -> tuple[List[Ticket], dict]:
        """获取 Ticket 列表"""
        skip = (page - 1) * page_size
        tickets, total = self.repo.get_all(
            is_completed=is_completed,
            tag_ids=tag_ids,
            tag_filter_mode=tag_filter_mode,
            search=search,
            sort_by=sort_by,
            order=order,
            skip=skip,
            limit=page_size
        )

        # 分页信息
        total_pages = (total + page_size - 1) // page_size
        pagination = {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }

        return tickets, pagination

    def get_ticket(self, ticket_id: int) -> Ticket:
        """获取单个 Ticket"""
        ticket = self.repo.get_by_id(ticket_id)
        if not ticket:
            raise TicketNotFound()
        return ticket

    def create_ticket(self, data: TicketCreate) -> Ticket:
        """创建 Ticket"""
        return self.repo.create(
            title=data.title,
            description=data.description,
            tag_ids=data.tag_ids or []
        )

    def update_ticket(self, ticket_id: int, data: TicketUpdate) -> Ticket:
        """更新 Ticket"""
        ticket = self.get_ticket(ticket_id)
        return self.repo.update(ticket, data.title, data.description)

    def delete_ticket(self, ticket_id: int) -> None:
        """删除 Ticket"""
        ticket = self.get_ticket(ticket_id)
        self.repo.delete(ticket)

    def toggle_complete(self, ticket_id: int) -> Ticket:
        """切换完成状态"""
        ticket = self.get_ticket(ticket_id)
        return self.repo.toggle_complete(ticket)

    def add_tags(self, ticket_id: int, tag_ids: List[int]) -> Ticket:
        """添加标签"""
        ticket = self.get_ticket(ticket_id)
        return self.repo.add_tags(ticket, tag_ids)

    def remove_tag(self, ticket_id: int, tag_id: int) -> Ticket:
        """移除标签"""
        ticket = self.get_ticket(ticket_id)
        return self.repo.remove_tag(ticket, tag_id)
```

创建 `app/services/tag_service.py`:

```python
from sqlalchemy.orm import Session
from typing import List, Optional
from ..repositories.tag_repo import TagRepository
from ..schemas.tag import TagCreate, TagUpdate
from ..models.tag import Tag
from ..exceptions import TagNotFound, DuplicateTag
from ..utils.color_generator import generate_color_from_name


class TagService:
    """Tag 业务逻辑层"""

    def __init__(self, db: Session):
        self.repo = TagRepository(db)

    def list_tags(self, include_count: bool = True) -> List[Tag]:
        """获取所有标签"""
        return self.repo.get_all(include_count=include_count)

    def get_tag(self, tag_id: int) -> Tag:
        """获取单个标签"""
        tag = self.repo.get_by_id(tag_id)
        if not tag:
            raise TagNotFound()
        return tag

    def create_tag(self, data: TagCreate) -> Tag:
        """创建标签"""
        # 检查名称是否重复
        existing = self.repo.get_by_name(data.name)
        if existing:
            raise DuplicateTag()

        # 如果没有提供颜色,自动生成
        color = data.color or generate_color_from_name(data.name)

        return self.repo.create(name=data.name, color=color)

    def update_tag(self, tag_id: int, data: TagUpdate) -> Tag:
        """更新标签"""
        tag = self.get_tag(tag_id)

        # 如果更新名称,检查是否重复
        if data.name and data.name != tag.name:
            existing = self.repo.get_by_name(data.name)
            if existing:
                raise DuplicateTag()

        return self.repo.update(tag, data.name, data.color)

    def delete_tag(self, tag_id: int) -> None:
        """删除标签"""
        tag = self.get_tag(tag_id)
        self.repo.delete(tag)
```

#### 步骤 4.2.11: 实现 API 路由

创建 `app/api/v1/tickets.py`:

```python
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
from ...database import get_db
from ...services.ticket_service import TicketService
from ...schemas.ticket import TicketCreate, TicketUpdate, TicketResponse, TicketListResponse
from ...config import get_settings

router = APIRouter(prefix="/tickets", tags=["tickets"])
settings = get_settings()


@router.get("", response_model=TicketListResponse)
def list_tickets(
    is_completed: Optional[bool] = Query(None),
    tag_ids: Optional[str] = Query(None),
    tag_filter_mode: str = Query("and", regex="^(and|or)$"),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at", regex="^(created_at|updated_at|title)$"),
    order: str = Query("desc", regex="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE),
    db: Session = Depends(get_db)
):
    """获取 Ticket 列表"""
    # 解析标签 ID
    tag_id_list = None
    if tag_ids:
        tag_id_list = [int(id.strip()) for id in tag_ids.split(",")]

    service = TicketService(db)
    tickets, pagination = service.list_tickets(
        is_completed=is_completed,
        tag_ids=tag_id_list,
        tag_filter_mode=tag_filter_mode,
        search=search,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size
    )

    return {
        "data": {
            "items": tickets,
            "pagination": pagination
        }
    }


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """获取单个 Ticket"""
    service = TicketService(db)
    return service.get_ticket(ticket_id)


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(data: TicketCreate, db: Session = Depends(get_db)):
    """创建 Ticket"""
    service = TicketService(db)
    return service.create_ticket(data)


@router.patch("/{ticket_id}", response_model=TicketResponse)
def update_ticket(ticket_id: int, data: TicketUpdate, db: Session = Depends(get_db)):
    """更新 Ticket"""
    service = TicketService(db)
    return service.update_ticket(ticket_id, data)


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """删除 Ticket"""
    service = TicketService(db)
    service.delete_ticket(ticket_id)


@router.post("/{ticket_id}/toggle-complete", response_model=TicketResponse)
def toggle_complete(ticket_id: int, db: Session = Depends(get_db)):
    """切换完成状态"""
    service = TicketService(db)
    return service.toggle_complete(ticket_id)


@router.post("/{ticket_id}/tags", response_model=TicketResponse)
def add_tags_to_ticket(
    ticket_id: int,
    tag_ids: List[int],
    db: Session = Depends(get_db)
):
    """为 Ticket 添加标签"""
    service = TicketService(db)
    return service.add_tags(ticket_id, tag_ids)


@router.delete("/{ticket_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_tag_from_ticket(ticket_id: int, tag_id: int, db: Session = Depends(get_db)):
    """从 Ticket 移除标签"""
    service = TicketService(db)
    service.remove_tag(ticket_id, tag_id)
```

创建 `app/api/v1/tags.py`:

```python
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from ...database import get_db
from ...services.tag_service import TagService
from ...schemas.tag import TagCreate, TagUpdate, TagResponse, TagListResponse

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=TagListResponse)
def list_tags(
    include_count: bool = Query(True),
    db: Session = Depends(get_db)
):
    """获取所有标签"""
    service = TagService(db)
    tags = service.list_tags(include_count=include_count)
    return {"data": tags}


@router.get("/{tag_id}", response_model=TagResponse)
def get_tag(tag_id: int, db: Session = Depends(get_db)):
    """获取单个标签"""
    service = TagService(db)
    return service.get_tag(tag_id)


@router.post("", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(data: TagCreate, db: Session = Depends(get_db)):
    """创建标签"""
    service = TagService(db)
    return service.create_tag(data)


@router.patch("/{tag_id}", response_model=TagResponse)
def update_tag(tag_id: int, data: TagUpdate, db: Session = Depends(get_db)):
    """更新标签"""
    service = TagService(db)
    return service.update_tag(tag_id, data)


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    """删除标签"""
    service = TagService(db)
    service.delete_tag(tag_id)
```

#### 步骤 4.2.12: 实现主应用

创建 `app/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time
from fastapi import Request

from .config import get_settings
from .api.v1 import tickets, tags
from .exceptions import AppException, app_exception_handler

settings = get_settings()

# 创建 FastAPI 应用
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册异常处理器
app.add_exception_handler(AppException, app_exception_handler)

# 性能监控中间件
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# 注册路由
app.include_router(tickets.router, prefix=settings.API_V1_PREFIX)
app.include_router(tags.router, prefix=settings.API_V1_PREFIX)

# 健康检查
@app.get("/health")
def health_check():
    return {"status": "ok"}
```

#### 步骤 4.2.13: 启动后端服务

```bash
# 进入后端目录
cd backend

# 启动开发服务器
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 访问 API 文档
# http://localhost:8000/api/v1/docs
```

### 4.3 后端测试

#### 步骤 4.3.1: 手动测试所有端点

使用 Swagger UI (`http://localhost:8000/api/v1/docs`) 测试:

**Tickets 端点:**
- [ ] GET `/api/v1/tickets` - 列表查询
- [ ] GET `/api/v1/tickets/{id}` - 单个查询
- [ ] POST `/api/v1/tickets` - 创建
- [ ] PATCH `/api/v1/tickets/{id}` - 更新
- [ ] DELETE `/api/v1/tickets/{id}` - 删除
- [ ] POST `/api/v1/tickets/{id}/toggle-complete` - 切换完成
- [ ] POST `/api/v1/tickets/{id}/tags` - 添加标签
- [ ] DELETE `/api/v1/tickets/{id}/tags/{tag_id}` - 移除标签

**Tags 端点:**
- [ ] GET `/api/v1/tags` - 列表查询
- [ ] GET `/api/v1/tags/{id}` - 单个查询
- [ ] POST `/api/v1/tags` - 创建
- [ ] PATCH `/api/v1/tags/{id}` - 更新
- [ ] DELETE `/api/v1/tags/{id}` - 删除

---

## 5. 前端实施

### 5.1 前端任务清单

#### 阶段 3.1: 项目搭建 (0.5 天)
- [ ] 5.1.1 创建 Vite + React + TypeScript 项目
- [ ] 5.1.2 配置 Tailwind CSS
- [ ] 5.1.3 安装 Shadcn UI
- [ ] 5.1.4 安装依赖包
- [ ] 5.1.5 配置 ESLint 和 Prettier

#### 阶段 3.2: 基础设施 (0.5 天)
- [ ] 5.1.6 配置 API 客户端 (axios)
- [ ] 5.1.7 配置 React Query
- [ ] 5.1.8 配置 Zustand 状态管理
- [ ] 5.1.9 定义 TypeScript 类型

#### 阶段 3.3: UI 组件开发 (1.5 天)
- [ ] 5.1.10 实现 Layout 组件
- [ ] 5.1.11 实现 SearchBar 组件
- [ ] 5.1.12 实现 FilterSidebar 组件
- [ ] 5.1.13 实现 TicketCard 组件
- [ ] 5.1.14 实现 TicketList 组件
- [ ] 5.1.15 实现 TicketFormDialog 组件
- [ ] 5.1.16 实现 TagSelector 组件
- [ ] 5.1.17 实现 TagBadge 组件

#### 阶段 3.4: 功能集成 (1 天)
- [ ] 5.1.18 集成 API 调用
- [ ] 5.1.19 实现筛选逻辑
- [ ] 5.1.20 实现搜索功能
- [ ] 5.1.21 实现 CRUD 操作
- [ ] 5.1.22 实现错误处理
- [ ] 5.1.23 实现 Toast 通知

#### 阶段 3.5: UI/UX 优化 (0.5-1 天)
- [ ] 5.1.24 响应式布局适配
- [ ] 5.1.25 添加动画效果
- [ ] 5.1.26 优化加载状态
- [ ] 5.1.27 优化空状态
- [ ] 5.1.28 键盘快捷键

### 5.2 详细实施步骤

#### 步骤 5.2.1: 初始化前端项目

```bash
# 创建 Vite 项目
npm create vite@latest frontend -- --template react-ts

cd frontend

# 安装依赖
npm install

# 安装 Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 安装 Shadcn UI
npx shadcn@latest init

# 安装其他依赖
npm install zustand @tanstack/react-query axios date-fns
npm install lucide-react class-variance-authority clsx tailwind-merge

# 安装开发依赖
npm install -D @types/node
```

#### 步骤 5.2.2: 配置 Tailwind

编辑 `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
}
```

编辑 `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 步骤 5.2.3: 创建项目结构

```bash
mkdir -p src/{components,hooks,lib,services,store,types,utils}
mkdir -p src/components/{layout,ticket,tag,common}

# 创建文件
touch src/types/index.ts
touch src/lib/axios.ts
touch src/lib/query-client.ts
touch src/store/app-store.ts
touch src/services/ticket-service.ts
touch src/services/tag-service.ts
```

最终结构:
```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── ticket/
│   │   │   ├── TicketCard.tsx
│   │   │   ├── TicketList.tsx
│   │   │   └── TicketFormDialog.tsx
│   │   ├── tag/
│   │   │   ├── TagBadge.tsx
│   │   │   └── TagSelector.tsx
│   │   └── common/
│   │       ├── SearchBar.tsx
│   │       └── LoadingSpinner.tsx
│   ├── hooks/
│   │   ├── use-tickets.ts
│   │   └── use-tags.ts
│   ├── lib/
│   │   ├── axios.ts
│   │   ├── query-client.ts
│   │   └── utils.ts
│   ├── services/
│   │   ├── ticket-service.ts
│   │   └── tag-service.ts
│   ├── store/
│   │   └── app-store.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── tsconfig.json
```

#### 步骤 5.2.4: 定义 TypeScript 类型

创建 `src/types/index.ts`:

```typescript
export interface Tag {
  id: number;
  name: string;
  color: string;
  ticketCount?: number;
  createdAt: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface CreateTicketInput {
  title: string;
  description?: string;
  tagIds?: number[];
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
}

export interface CreateTagInput {
  name: string;
  color?: string;
}

export interface TicketFilters {
  isCompleted: boolean | null;
  selectedTagIds: number[];
  tagFilterMode: 'and' | 'or';
  searchQuery: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

#### 步骤 5.2.5: 配置 API 客户端

创建 `src/lib/axios.ts`:

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message || '请求失败';
    return Promise.reject(new Error(message));
  }
);
```

#### 步骤 5.2.6: 实现服务层

创建 `src/services/ticket-service.ts`:

```typescript
import { apiClient } from '../lib/axios';
import { Ticket, CreateTicketInput, UpdateTicketInput } from '../types';

export const ticketService = {
  async list(params: {
    isCompleted?: boolean;
    tagIds?: number[];
    tagFilterMode?: 'and' | 'or';
    search?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    pageSize?: number;
  }) {
    const response = await apiClient.get('/tickets', { params: {
      is_completed: params.isCompleted,
      tag_ids: params.tagIds?.join(','),
      tag_filter_mode: params.tagFilterMode,
      search: params.search,
      sort_by: params.sortBy,
      order: params.order,
      page: params.page,
      page_size: params.pageSize,
    }});
    return response.data.data;
  },

  async get(id: number): Promise<Ticket> {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },

  async create(data: CreateTicketInput): Promise<Ticket> {
    const response = await apiClient.post('/tickets', {
      title: data.title,
      description: data.description,
      tag_ids: data.tagIds,
    });
    return response.data;
  },

  async update(id: number, data: UpdateTicketInput): Promise<Ticket> {
    const response = await apiClient.patch(`/tickets/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/tickets/${id}`);
  },

  async toggleComplete(id: number): Promise<Ticket> {
    const response = await apiClient.post(`/tickets/${id}/toggle-complete`);
    return response.data;
  },

  async addTags(id: number, tagIds: number[]): Promise<Ticket> {
    const response = await apiClient.post(`/tickets/${id}/tags`, tagIds);
    return response.data;
  },

  async removeTag(ticketId: number, tagId: number): Promise<void> {
    await apiClient.delete(`/tickets/${ticketId}/tags/${tagId}`);
  },
};
```

创建 `src/services/tag-service.ts`:

```typescript
import { apiClient } from '../lib/axios';
import { Tag, CreateTagInput } from '../types';

export const tagService = {
  async list(): Promise<Tag[]> {
    const response = await apiClient.get('/tags');
    return response.data.data;
  },

  async create(data: CreateTagInput): Promise<Tag> {
    const response = await apiClient.post('/tags', data);
    return response.data;
  },

  async update(id: number, data: Partial<CreateTagInput>): Promise<Tag> {
    const response = await apiClient.patch(`/tags/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/tags/${id}`);
  },
};
```

#### 步骤 5.2.7: 配置 Zustand 状态管理

创建 `src/store/app-store.ts`:

```typescript
import { create } from 'zustand';
import { TicketFilters } from '../types';

interface AppStore {
  filters: TicketFilters;
  setCompletionFilter: (value: boolean | null) => void;
  toggleTagFilter: (tagId: number) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  filters: {
    isCompleted: false, // 默认只显示未完成
    selectedTagIds: [],
    tagFilterMode: 'and',
    searchQuery: '',
  },

  setCompletionFilter: (value) =>
    set((state) => ({
      filters: { ...state.filters, isCompleted: value },
    })),

  toggleTagFilter: (tagId) =>
    set((state) => {
      const { selectedTagIds } = state.filters;
      const newTagIds = selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...selectedTagIds, tagId];
      return {
        filters: { ...state.filters, selectedTagIds: newTagIds },
      };
    }),

  setSearchQuery: (query) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery: query },
    })),

  clearFilters: () =>
    set({
      filters: {
        isCompleted: null,
        selectedTagIds: [],
        tagFilterMode: 'and',
        searchQuery: '',
      },
    }),
}));
```

#### 步骤 5.2.8: 实现核心组件(示例)

由于篇幅限制,这里提供主要组件的实现要点:

**TicketCard.tsx** - Ticket 卡片组件
- 显示标题、描述、标签、时间
- 完成复选框
- 编辑/删除按钮
- 已完成样式(删除线、半透明)

**TicketList.tsx** - Ticket 列表组件
- 使用 React Query 获取数据
- 加载状态(Skeleton)
- 空状态提示
- 错误处理

**TicketFormDialog.tsx** - 创建/编辑表单
- 使用 Shadcn Dialog
- 表单验证
- 标签选择器集成

**SearchBar.tsx** - 搜索框
- 防抖输入(300ms)
- 清除按钮
- 快捷键(Cmd+K)

**FilterSidebar.tsx** - 筛选侧边栏
- 完成状态单选
- 标签列表(带计数)
- 清除筛选按钮

### 5.3 前端启动与测试

```bash
cd frontend

# 启动开发服务器
npm run dev

# 访问应用
# http://localhost:5173
```

**测试清单:**
- [ ] 创建 Ticket
- [ ] 编辑 Ticket
- [ ] 删除 Ticket
- [ ] 切换完成状态
- [ ] 添加标签
- [ ] 移除标签
- [ ] 标题搜索
- [ ] 按标签筛选
- [ ] 按状态筛选
- [ ] 响应式布局

---

## 6. 测试实施

### 6.1 后端测试

创建 `backend/tests/conftest.py`:

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.main import app
from fastapi.testclient import TestClient

# 测试数据库
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost/projectalpha_test"

@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
```

创建基础测试用例,确保核心功能正常。

### 6.2 前端测试

使用 Vitest 和 React Testing Library 测试关键组件。

### 6.3 E2E 测试(可选)

使用 Playwright 测试完整用户流程。

---

## 7. 部署实施

### 7.1 本地开发环境部署

已在前面章节说明。

### 7.2 生产环境部署(可选)

使用 Docker Compose 或传统部署方式。

---

## 8. 验收标准

### 8.1 功能验收

- [ ] 所有 API 端点正常工作
- [ ] 所有前端功能正常
- [ ] 数据持久化正确
- [ ] 筛选和搜索准确
- [ ] 响应式布局正常

### 8.2 性能验收

- [ ] 首页加载 < 2 秒
- [ ] API 响应 < 500ms
- [ ] 无明显内存泄漏

### 8.3 代码质量

- [ ] 后端测试覆盖率 > 80%
- [ ] 无 ESLint 错误
- [ ] 代码符合规范

---

**文档版本:** 1.0
**创建日期:** 2025-11-09
**作者:** Claude
**状态:** 待执行

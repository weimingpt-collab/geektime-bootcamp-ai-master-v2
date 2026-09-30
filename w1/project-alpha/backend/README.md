# Project Alpha Backend

Project Alpha Ticket Management System Backend

## 技术栈

- Python 3.11+
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic (数据库迁移)

## 快速开始

### 前置要求

- Python 3.11+ (推荐使用 uv)
- PostgreSQL 17+

### 安装依赖

```bash
cd backend
uv sync
```

### 配置环境变量

复制 `.env.example` 到 `.env` 并修改数据库配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，确保数据库配置正确。

### 创建数据库

```bash
# 连接到 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE projectalpha;

# 退出
\q
```

### 运行数据库迁移

```bash
uv run alembic upgrade head
```

### 启动开发服务器

```bash
uv run uvicorn app.main:app --reload --port 8000
```

## 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 应用入口
│   ├── config.py           # 配置管理
│   ├── database.py         # 数据库连接
│   ├── models/             # SQLAlchemy 模型
│   ├── schemas/            # Pydantic 模型
│   ├── api/                # API 路由
│   ├── crud/               # CRUD 操作
│   └── utils/              # 工具函数
├── tests/                  # 测试代码
├── alembic/                # 数据库迁移
└── pyproject.toml          # 项目配置
```

## API 文档

启动服务器后访问：

- Swagger UI: <http://localhost:8000/api/v1/docs>
- ReDoc: <http://localhost:8000/api/v1/redoc>

## 开发

### 运行测试

#### 使用 SQLite (默认)

```bash
uv run pytest
```

#### 使用 PostgreSQL (推荐)

PostgreSQL 测试可以验证数据库触发器和其他高级功能：

```bash
# 1. 创建测试数据库
psql -U postgres -c "CREATE DATABASE projectalpha_test;"

# 2. 运行迁移
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/projectalpha_test uv run alembic upgrade head

# 3. 运行测试
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/projectalpha_test uv run pytest -v

# 重置测试数据库（可选）
psql -U postgres -d projectalpha_test -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/projectalpha_test uv run alembic upgrade head
```

**注意**: PostgreSQL 测试需要先运行 Alembic 迁移来创建数据库触发器。CI 环境会自动使用 PostgreSQL。

### 代码格式化

```bash
# 检查格式
uvx black --check --diff app/ tests/
uvx isort --check --diff app/ tests/

# 自动格式化
uvx black app/ tests/
uvx isort app/ tests/
```

### 类型检查

```bash
uv run --with mypy mypy app/
```

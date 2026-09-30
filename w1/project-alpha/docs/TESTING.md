# 测试指南

## 概述

Project Alpha 后端支持两种测试数据库：

1. **SQLite** (默认) - 快速、简单，适合基本功能测试
2. **PostgreSQL** (推荐) - 完整功能，包括数据库触发器、ENUM类型等高级特性

## PostgreSQL vs SQLite

### PostgreSQL 的优势

- ✅ 完整的数据库触发器支持 (`completed_at` 自动设置)
- ✅ 原生 ENUM 类型
- ✅ 更接近生产环境
- ✅ CI 环境使用的数据库

### SQLite 的优势

- ✅ 无需额外安装
- ✅ 测试速度快
- ✅ 适合快速开发迭代

## 快速开始

### 使用 SQLite (默认)

```bash
# 直接运行测试，使用内存数据库
uv run pytest
```

### 使用 PostgreSQL (推荐)

#### 一次性设置

```bash
# 1. 确保 PostgreSQL 已安装并运行
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql

# 2. 创建测试数据库
psql -U postgres -c "CREATE DATABASE projectalpha_test;"

# 3. 运行数据库迁移（创建表和触发器）
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/projectalpha_test uv run alembic upgrade head
```

#### 运行测试

```bash
# 运行所有测试
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/projectalpha_test uv run pytest -v

# 运行特定测试
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/projectalpha_test uv run pytest tests/test_tickets.py -v

# 运行并查看覆盖率
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/projectalpha_test uv run pytest -v --cov=app --cov-report=html
```

#### 重置测试数据库

如果需要完全重置测试数据库：

```bash
# 方法1: 删除并重建数据库
psql -U postgres -c "DROP DATABASE IF EXISTS projectalpha_test;"
psql -U postgres -c "CREATE DATABASE projectalpha_test;"
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/projectalpha_test uv run alembic upgrade head

# 方法2: 删除并重建 schema（保留数据库）
psql -U postgres -d projectalpha_test -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/projectalpha_test uv run alembic upgrade head
```

## 测试架构

### conftest.py 配置

测试配置会根据环境变量自动选择数据库：

```python
# 从环境变量读取，默认 SQLite
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", "sqlite:///./test.db"
)
```

### PostgreSQL 特性

1. **Session-scoped setup**: 数据库结构（包括触发器）只创建一次
2. **Function-scoped cleanup**: 每个测试后使用 TRUNCATE 清理数据，保留结构
3. **Alembic migrations**: 触发器通过 Alembic 创建，而不是 SQLAlchemy

### SQLite 特性

1. **Function-scoped setup**: 每个测试创建新表
2. **No triggers**: SQLite 不支持我们的触发器语法
3. **Direct table creation**: 通过 `Base.metadata.create_all()` 创建

## CI/CD 集成

GitHub Actions 自动使用 PostgreSQL：

```yaml
services:
  postgres:
    image: postgres:17
    env:
      POSTGRES_DB: projectalpha_test
```

CI 流程：
1. 启动 PostgreSQL 服务
2. 安装依赖 (`uv sync --dev`)
3. 运行迁移 (`uv run alembic upgrade head`)
4. 运行测试 (`uv run pytest`)

## 常见问题

### Q: 为什么 `test_complete_ticket` 在 SQLite 下失败？

A: 该测试依赖 PostgreSQL 触发器自动设置 `completed_at` 字段。SQLite 不支持该触发器。使用 PostgreSQL 测试或跳过该测试：

```bash
# 跳过需要 PostgreSQL 的测试
uv run pytest -v -k "not test_complete_ticket"
```

### Q: 如何查看 PostgreSQL 中的触发器？

```bash
psql -U postgres -d projectalpha_test -c "
  SELECT tgname, tgenabled 
  FROM pg_trigger 
  WHERE tgrelid = 'tickets'::regclass 
  AND tgname NOT LIKE 'RI_%';
"
```

### Q: 测试之间数据没有清理？

A: 检查 `conftest.py` 中的 TRUNCATE 语句是否正确执行。对于 PostgreSQL，fixture 会在每个测试后执行 TRUNCATE。

### Q: Alembic 迁移失败？

```bash
# 检查迁移状态
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/projectalpha_test uv run alembic current

# 查看迁移历史
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/projectalpha_test uv run alembic history

# 降级到之前的版本
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/projectalpha_test uv run alembic downgrade -1
```

## 环境变量

支持的环境变量：

- `DATABASE_URL`: 数据库连接字符串
  - PostgreSQL: `postgresql://user:pass@host:port/dbname`
  - SQLite: `sqlite:///./test.db` (默认)

## 最佳实践

1. **本地开发**: 使用 SQLite 快速迭代
2. **提交前**: 使用 PostgreSQL 验证完整功能
3. **CI/CD**: 自动使用 PostgreSQL 确保生产一致性
4. **触发器测试**: 始终在 PostgreSQL 下测试涉及触发器的功能

## 依赖管理

测试依赖在 `pyproject.toml` 的 `[dependency-groups]` 中定义：

```toml
[dependency-groups]
dev = [
    "pytest>=8.4.2",
    "pytest-asyncio>=0.21.0",
    "pytest-cov>=4.1.0",
    "httpx>=0.28.1",
    "black>=23.0.0",
    "isort>=5.12.0",
    "mypy>=1.6.0",
]
```

安装所有测试依赖：

```bash
uv sync --dev
```


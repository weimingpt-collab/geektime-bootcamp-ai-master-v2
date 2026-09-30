# Changelog

## 2025-11-09 - PostgreSQL 测试环境配置

### 测试基础设施改进

#### ✅ PostgreSQL 测试支持
- 更新 `tests/conftest.py` 支持 PostgreSQL 和 SQLite 双数据库
- 从环境变量读取 `DATABASE_URL`，自动选择数据库类型
- PostgreSQL: 使用 TRUNCATE 清理数据，保留表结构和触发器
- SQLite: 使用 DROP/CREATE 表方式清理数据
- 添加 session-scoped `setup_database` fixture

#### ✅ 依赖管理优化
- 统一所有开发依赖到 `[dependency-groups] dev`
- 包含: pytest, pytest-cov, pytest-asyncio, httpx, black, isort, mypy
- CI 中移除 `--with` 参数，直接使用已安装的依赖

#### ✅ CI/CD 更新
- `.github/workflows/ci.yml`: 简化测试命令为 `uv run pytest`
- 确保 PostgreSQL 服务正确配置（postgres:17）
- 运行 Alembic migrations 创建触发器
- 所有测试现在使用 PostgreSQL 环境

#### ✅ 文档更新
- 新增 `backend/TESTING.md` - 完整的测试指南
- 更新 `backend/README.md` - 添加 PostgreSQL 测试说明
- 说明 SQLite vs PostgreSQL 的区别和使用场景
- 提供完整的本地测试和 CI 测试流程

#### ✅ 数据库触发器支持
- 修复 Ticket 模型的 ENUM 类型为 `native_enum=True`
- 确保 PostgreSQL 触发器正常工作（`completed_at` 自动设置）
- 测试验证触发器功能正常

### 测试覆盖率
- ✅ 15/15 测试通过（PostgreSQL 环境）
- ✅ 14/15 测试通过（SQLite 环境，`test_complete_ticket` 依赖触发器）
- ✅ 代码覆盖率: 89%

### 技术亮点
1. **灵活的测试环境**: 支持本地快速 SQLite 测试和完整 PostgreSQL 测试
2. **CI/CD 一致性**: 本地和 CI 使用相同的 PostgreSQL 配置
3. **触发器测试**: 完整支持数据库触发器功能测试
4. **依赖管理**: 使用 uv 的 dependency-groups 统一管理

## Phase 5 & 6 - 集成测试与优化、文档与部署

### Phase 5: 集成测试与优化

#### 后端测试

- ✅ 创建测试配置 (`tests/conftest.py`)
- ✅ 实现 Ticket API 测试 (`tests/test_tickets.py`)
  - 创建 Ticket
  - 获取 Ticket 列表
  - 获取单个 Ticket
  - 更新 Ticket
  - 删除 Ticket
  - 完成/取消完成 Ticket
  - 状态过滤
  - 搜索功能
- ✅ 实现 Tag API 测试 (`tests/test_tags.py`)
  - 创建 Tag
  - 获取 Tag 列表
  - 获取单个 Tag
  - 删除 Tag
  - 添加标签到 Ticket
  - 从 Ticket 移除标签

#### 前端优化

- ✅ 添加键盘快捷键支持
  - `Ctrl/Cmd + K`: 聚焦搜索框
  - `N`: 创建新 Ticket（不在输入框时）
  - `Esc`: 关闭对话框/侧边栏
- ✅ 优化搜索框，添加快捷键提示
- ✅ 改进响应式布局
- ✅ 优化代码结构，使用 `useCallback` 优化性能

#### 性能优化

- ✅ 搜索防抖（已实现）
- ✅ 使用 `useCallback` 优化函数引用
- ✅ React Query 已安装（可选使用）

### Phase 6: 文档与部署

#### 文档

- ✅ 更新项目 README.md
  - 完整的技术栈说明
  - 详细的快速开始指南
  - 项目结构说明
  - 开发指南
  - 键盘快捷键说明
- ✅ 创建 API 文档 (`docs/api.md`)
  - 完整的 API 端点说明
  - 请求/响应示例
  - 错误处理说明
- ✅ 创建安装指南 (`docs/setup.md`)
  - 系统要求
  - 详细安装步骤
  - 常见问题解答
- ✅ 创建用户使用手册 (`docs/user-guide.md`)
  - 功能详解
  - 使用技巧
  - 最佳实践
  - 常见问题

#### 部署准备

- ✅ 创建启动脚本 (`start.sh`)
  - 同时启动前后端
  - 显示服务信息
  - 优雅关闭处理
- ✅ 更新 README 包含部署说明

## Phase 4 - 前端功能开发

### 核心功能

- ✅ Ticket CRUD 操作
- ✅ Tag 管理
- ✅ 搜索功能（防抖）
- ✅ 过滤功能（状态、标签）
- ✅ 排序功能
- ✅ 批量操作

### UI/UX

- ✅ 响应式设计
- ✅ 加载状态
- ✅ 错误处理
- ✅ 空状态显示
- ✅ Toast 通知

## Phase 3 - 前端项目搭建

### 基础设施

- ✅ Vite + React + TypeScript 项目初始化
- ✅ Tailwind CSS v4 配置
- ✅ Shadcn UI 组件集成
- ✅ Zustand 状态管理
- ✅ Axios API 客户端

### 组件

- ✅ 布局组件（Header, FilterSidebar）
- ✅ Ticket 组件（TicketCard, TicketList, TicketForm）
- ✅ Tag 组件（TagBadge, TagSelector, TagManager）
- ✅ 通用组件（SearchBar, ConfirmDialog, SortControl, BatchActions）

## Phase 2 - 后端 API 开发

### API 端点

- ✅ Ticket CRUD API
- ✅ Tag CRUD API
- ✅ Ticket-Tag 关联 API
- ✅ 搜索和过滤功能

### 数据库

- ✅ SQLAlchemy 模型
- ✅ Alembic 迁移
- ✅ PostgreSQL 触发器

## Phase 1 - 数据库设计与后端基础

### 数据库设计

- ✅ Tickets 表
- ✅ Tags 表
- ✅ Ticket-Tag 关联表
- ✅ 数据库迁移脚本

### 后端基础

- ✅ FastAPI 项目结构
- ✅ 数据库配置
- ✅ CORS 配置
- ✅ 日志配置

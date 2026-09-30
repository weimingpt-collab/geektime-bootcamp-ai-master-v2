# Project Alpha 安装指南

## 系统要求

- **操作系统**: macOS, Linux, Windows
- **Python**: 3.11 或更高版本
- **Node.js**: 18 或更高版本
- **PostgreSQL**: 14 或更高版本
- **包管理器**: uv (Python), yarn (Node.js)

## 安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd project-alpha
```

### 2. 安装后端依赖

```bash
cd backend

# 安装 uv (如果未安装)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 安装项目依赖
uv sync
```

### 3. 配置后端环境

```bash
# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件
# 设置数据库连接字符串
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/projectalpha
```

### 4. 设置数据库

```bash
# 创建数据库
createdb projectalpha

# 或者使用 psql
psql -U postgres -c "CREATE DATABASE projectalpha;"

# 运行数据库迁移
uv run alembic upgrade head

# （可选）导入种子数据
psql -U postgres -d projectalpha -f seed.sql
```

### 5. 安装前端依赖

```bash
cd ../frontend

# 安装依赖
yarn install
```

### 6. 启动应用

**终端 1 - 启动后端**:

```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

**终端 2 - 启动前端**:

```bash
cd frontend
yarn dev
```

### 7. 访问应用

- **前端**: <http://localhost:5173>
- **后端 API**: <http://localhost:8000>
- **API 文档**: <http://localhost:8000/api/v1/docs>

## 验证安装

### 检查后端

```bash
curl http://localhost:8000/health
# 应该返回: {"status":"ok"}
```

### 检查前端

打开浏览器访问 <http://localhost:5173，应该能看到应用界面。>

## 常见问题

### 数据库连接失败

1. 确保 PostgreSQL 服务正在运行
2. 检查 `.env` 文件中的 `DATABASE_URL` 配置
3. 确认数据库 `projectalpha` 已创建

### 端口被占用

- 后端默认端口: 8000
- 前端默认端口: 5173

修改端口：

- 后端: `uvicorn app.main:app --port 8001`
- 前端: 修改 `vite.config.ts` 中的 `server.port`

### 依赖安装失败

- Python: 确保使用 Python 3.11+
- Node.js: 确保使用 Node.js 18+
- 清除缓存后重试: `uv cache clean` 或 `yarn cache clean`

## 开发工具

### 推荐 VS Code 扩展

- REST Client (测试 API)
- Python
- ESLint
- Tailwind CSS IntelliSense

### 推荐浏览器扩展

- React Developer Tools
- Redux DevTools (如果使用)

## 下一步

- 查看 [API 文档](./api.md)
- 查看 [用户使用手册](./user-guide.md)
- 运行测试: `uv run pytest` (后端) 或 `yarn test` (前端)

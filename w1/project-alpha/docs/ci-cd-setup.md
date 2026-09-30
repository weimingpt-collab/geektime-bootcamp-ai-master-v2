# CI/CD Setup Guide

## 概述

项目已配置完整的 CI/CD 流程，包括：

1. **Pre-commit Hooks** - 本地代码质量检查
2. **GitHub Actions** - 自动化测试和部署
3. **CodeQL** - 代码安全分析
4. **Dependabot** - 依赖更新管理

## Pre-commit Hooks

### 配置位置

`.pre-commit-config.yaml`

### 包含的检查

- **Python**: Black, isort, mypy
- **TypeScript**: ESLint, Prettier
- **通用**: 文件检查、YAML/JSON/TOML 验证、Markdown 检查、Shell 脚本检查

### 使用方法

```bash
# 安装
pre-commit install

# 手动运行
pre-commit run --all-files
```

详细说明见 [pre-commit-setup.md](./pre-commit-setup.md)

## GitHub Actions Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**触发条件**:
- Push 到 main/master/develop 分支
- Pull Request 到 main/master/develop 分支

**执行的任务**:

1. **Backend Tests**
   - 设置 PostgreSQL 服务
   - 运行数据库迁移
   - 执行 pytest 测试
   - 生成代码覆盖率报告

2. **Backend Linting**
   - Black 代码格式化检查
   - isort 导入排序检查
   - mypy 类型检查

3. **Frontend Linting**
   - ESLint 代码检查
   - TypeScript 类型检查

4. **Frontend Build**
   - 验证前端构建是否成功

5. **Pre-commit Checks**
   - 运行所有 pre-commit hooks

### 2. Pre-commit Workflow (`.github/workflows/pre-commit.yml`)

**触发条件**:
- Pull Request
- Push 到 main/master/develop 分支

**执行的任务**:
- 运行所有 pre-commit hooks

### 3. CodeQL Analysis (`.github/workflows/codeql.yml`)

**触发条件**:
- Push 到 main/master/develop 分支
- Pull Request 到 main/master/develop 分支
- 每周日自动运行

**执行的任务**:
- 代码安全分析（Python 和 JavaScript）
- 质量检查

## Dependabot (`.github/dependabot.yml`)

自动检查并更新依赖：

- **Python 依赖** (backend/): 每周检查
- **Node.js 依赖** (frontend/): 每周检查
- **GitHub Actions**: 每周检查

## 本地开发流程

1. **创建功能分支**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **开发代码**
   - Pre-commit hooks 会在提交时自动运行
   - 如果 hooks 失败，修复后重新提交

3. **提交代码**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # Pre-commit hooks 会自动运行
   ```

4. **推送并创建 PR**
   ```bash
   git push origin feature/my-feature
   ```

5. **GitHub Actions 自动运行**
   - CI workflow 会验证代码
   - Pre-commit workflow 会检查代码质量
   - CodeQL 会进行安全分析

## 查看 CI/CD 状态

1. 在 GitHub 仓库页面，点击 "Actions" 标签
2. 查看各个 workflow 的运行状态
3. 点击具体的 workflow run 查看详细信息

## 故障排除

### Pre-commit 失败

1. 查看错误信息
2. 手动运行失败的 hook：
   ```bash
   pre-commit run <hook-id> --all-files
   ```
3. 修复问题后重新提交

### CI 失败

1. 在 GitHub Actions 页面查看失败日志
2. 本地重现问题：
   ```bash
   # 后端测试
   cd backend
   uv run pytest

   # 前端构建
   cd frontend
   yarn build
   ```
3. 修复问题后推送新提交

## 最佳实践

1. **提交前运行 pre-commit**
   ```bash
   pre-commit run --all-files
   ```

2. **保持依赖更新**
   - 定期运行 `pre-commit autoupdate`
   - 关注 Dependabot 的 PR

3. **查看 CI 状态**
   - 确保所有检查通过后再合并 PR

4. **代码覆盖率**
   - 目标：后端测试覆盖率 > 70%
   - 查看 coverage 报告了解覆盖情况

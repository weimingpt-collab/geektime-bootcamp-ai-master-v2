# Pre-commit Setup Guide

## 安装 Pre-commit

### macOS/Linux

```bash
# 使用 pip
pip install pre-commit

# 或使用 pipx（推荐）
pipx install pre-commit
```

### Windows

```bash
pip install pre-commit
```

## 安装 Git Hooks

在 git 仓库根目录运行（`/Users/tchen/projects/mycode/bootcamp/ai/`）：

```bash
cd /Users/tchen/projects/mycode/bootcamp/ai
pre-commit install
```

**注意**: Pre-commit 配置文件位于 git 仓库根目录（`.pre-commit-config.yaml`），而不是项目子目录。

这会在 `.git/hooks/pre-commit` 安装 pre-commit hook，每次提交时自动运行检查。

## 手动运行

### 运行所有 hooks

```bash
pre-commit run --all-files
```

### 运行特定 hook

```bash
pre-commit run black --all-files
pre-commit run eslint --all-files
```

## 配置的 Hooks

### Python Hooks

- **black**: 代码格式化（行长度 100）
- **isort**: 导入排序（兼容 black）
- **mypy**: 类型检查

### TypeScript/JavaScript Hooks

- **eslint**: 代码检查（自动修复）
- **prettier**: 代码格式化

### 通用 Hooks

- **trailing-whitespace**: 移除行尾空格
- **end-of-file-fixer**: 确保文件以换行符结尾
- **check-yaml**: YAML 文件检查
- **check-json**: JSON 文件检查
- **check-toml**: TOML 文件检查
- **check-added-large-files**: 检查大文件（>1MB）
- **check-merge-conflict**: 检查合并冲突标记
- **check-case-conflict**: 检查文件名大小写冲突
- **mixed-line-ending**: 统一行尾符（LF）
- **shellcheck**: Shell 脚本检查
- **markdownlint**: Markdown 文件检查

## 跳过 Hooks

如果需要在提交时跳过 hooks（不推荐）：

```bash
git commit --no-verify -m "message"
```

## 更新 Hooks

定期更新 hooks 到最新版本：

```bash
pre-commit autoupdate
```

## 故障排除

### Python 版本问题

如果遇到 Python 版本问题，确保系统有 Python 3.11+：

```bash
python3 --version
```

### Hook 失败

如果某个 hook 失败：

1. 查看错误信息
2. 手动运行该 hook 修复问题：
   ```bash
   pre-commit run <hook-id> --all-files
   ```
3. 修复后重新提交

### 清除缓存

如果遇到缓存问题：

```bash
pre-commit clean
pre-commit install
```

## CI/CD 集成

Pre-commit hooks 也会在 GitHub Actions 中运行（见 `.github/workflows/pre-commit.yml`），确保 CI 和本地环境一致。

---
description: 提交代码更改
argument-hint: [message] [type]
allowed-tools: Bash(git:*)
---

# 提交代码更改

我将帮助你提交代码更改。让我先检查当前状态，然后执行提交。

## 步骤 1: 检查当前状态

### 当前分支

!`git branch --show-current`

### Git 状态

!`git status`

### 未暂存的更改

!`git diff --stat`

### 已暂存的更改

!`git diff --cached --stat`

## 步骤 2: 查看更改详情

### 未暂存的文件更改

!`git diff --name-status`

### 已暂存的文件更改

!`git diff --cached --name-status`

## 步骤 3: 暂存更改

如果没有已暂存的更改，我将暂存所有更改：

```bash
# 检查是否有已暂存的更改
if [ -z "$(git diff --cached --name-only)" ]; then
  echo "暂存所有更改..."
  git add .
fi
```

## 步骤 4: 生成提交信息

基于更改内容生成详细的英文提交信息：

### 更改的文件类型

!`git diff --cached --name-only 2>/dev/null | sed 's/.*\.//' | sort | uniq -c | sort -rn || git diff --name-only | sed 's/.*\.//' | sort | uniq -c | sort -rn`

### 主要更改的文件

!`git diff --cached --stat 2>/dev/null | head -10 || git diff --stat | head -10`

### 更改摘要

!`git diff --cached --shortstat 2>/dev/null || git diff --shortstat`

**提交信息格式（Conventional Commits）：**

- `type`: $2（如果未提供，将根据更改自动推断）
  - `feat`: 新功能
  - `fix`: 修复 bug
  - `docs`: 文档更改
  - `style`: 代码格式（不影响代码运行）
  - `refactor`: 重构（既不是新功能也不是修复 bug）
  - `perf`: 性能优化
  - `test`: 测试相关
  - `chore`: 构建过程或辅助工具的变动
  - `ci`: CI 配置更改

- `message`: $1（如果未提供，将基于更改内容生成详细的英文描述）

## 步骤 5: 执行提交

```bash
# 确保有已暂存的更改
if [ -z "$(git diff --cached --name-only)" ]; then
  echo "没有已暂存的更改，正在暂存所有更改..."
  git add .
fi

# 确定提交类型
if [ -n "$2" ]; then
  COMMIT_TYPE="$2"
else
  # 根据更改自动推断类型
  CHANGED_FILES=$(git diff --cached --name-only 2>/dev/null || git diff --name-only)
  if echo "$CHANGED_FILES" | grep -qE '\.(md|mdx|txt)$'; then
    COMMIT_TYPE="docs"
  elif echo "$CHANGED_FILES" | grep -qE '(test|spec)'; then
    COMMIT_TYPE="test"
  elif echo "$CHANGED_FILES" | grep -qE '\.(css|scss|less)$'; then
    COMMIT_TYPE="style"
  else
    COMMIT_TYPE="feat"
  fi
fi

# 确定提交信息
if [ -n "$1" ]; then
  COMMIT_MSG="$1"
else
  # 基于更改生成详细的英文提交信息
  CHANGED_FILES=$(git diff --cached --name-only 2>/dev/null || git diff --name-only)
  STATS=$(git diff --cached --shortstat 2>/dev/null || git diff --shortstat)

  # 分析文件类型和路径
  FILE_COUNT=$(echo "$CHANGED_FILES" | wc -l | tr -d ' ')
  ADDED=$(echo "$STATS" | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+' || echo "0")
  DELETED=$(echo "$STATS" | grep -oE '[0-9]+ deletion' | grep -oE '[0-9]+' || echo "0")

  # 识别主要更改区域
  if echo "$CHANGED_FILES" | grep -qE '\.(tsx|ts|jsx|js)$'; then
    AREA="components"
    if echo "$CHANGED_FILES" | grep -qE '(component|ui|layout)'; then
      AREA="UI components"
    elif echo "$CHANGED_FILES" | grep -qE '(api|service|utils)'; then
      AREA="services"
    elif echo "$CHANGED_FILES" | grep -qE '(page|route)'; then
      AREA="pages"
    fi
  elif echo "$CHANGED_FILES" | grep -qE '\.(md|mdx|txt)$'; then
    AREA="documentation"
  elif echo "$CHANGED_FILES" | grep -qE '\.(css|scss|less)$'; then
    AREA="styling"
  elif echo "$CHANGED_FILES" | grep -qE '(test|spec)'; then
    AREA="tests"
  elif echo "$CHANGED_FILES" | grep -qE '\.(json|yaml|yml|toml)$'; then
    AREA="configuration"
  elif echo "$CHANGED_FILES" | grep -qE '\.(png|jpg|jpeg|svg|gif|webp)$'; then
    AREA="assets"
  else
    AREA="project files"
  fi

  # 识别操作类型
  if [ "$ADDED" -gt 0 ] && [ "$DELETED" -eq 0 ]; then
    ACTION="add"
  elif [ "$DELETED" -gt 0 ] && [ "$ADDED" -eq 0 ]; then
    ACTION="remove"
  elif [ "$ADDED" -gt "$DELETED" ]; then
    ACTION="update and extend"
  elif [ "$DELETED" -gt "$ADDED" ]; then
    ACTION="refactor and simplify"
  else
    ACTION="update"
  fi

  # 生成描述性提交信息
  if [ "$FILE_COUNT" -eq 1 ]; then
    FILE_NAME=$(echo "$CHANGED_FILES" | head -1 | xargs basename | sed 's/\.[^.]*$//')
    COMMIT_MSG="$ACTION $AREA: $FILE_NAME"
  elif [ "$FILE_COUNT" -le 3 ]; then
    COMMIT_MSG="$ACTION $AREA: $(echo "$CHANGED_FILES" | xargs -n1 basename | sed 's/\.[^.]*$//' | tr '\n' ', ' | sed 's/, $//')"
  else
    COMMIT_MSG="$ACTION $AREA ($FILE_COUNT files)"
  fi

  # 添加统计信息（如果显著）
  if [ "$ADDED" -gt 50 ] || [ "$DELETED" -gt 50 ]; then
    COMMIT_MSG="$COMMIT_MSG (+$ADDED/-$DELETED lines)"
  fi
fi

# 执行提交
git commit -m "$COMMIT_TYPE: $COMMIT_MSG"
```

**使用方法：**

- `/commit` - 自动暂存所有更改并生成详细的英文提交信息
- `/commit "add user authentication feature"` - 使用自定义英文提交信息（自动推断类型）
- `/commit "fix login issue" fix` - 指定提交信息和类型
- `/commit "update documentation" docs` - 文档类型提交
- `/commit "refactor user service" refactor` - 重构类型提交

**示例：**

- `/commit "add user authentication feature" feat`
- `/commit "fix login bug" fix`
- `/commit "update API documentation" docs`
- `/commit "optimize database queries" perf`

**自动生成的提交信息示例：**

- `feat: add UI components: Hero, ToolShowcase (+120/-5 lines)`
- `fix: update services: authService, userService (3 files)`
- `docs: update documentation: README, API guide (2 files)`
- `refactor: simplify components: UserProfile, Dashboard`

**注意：**

- 提交前会显示所有更改，请确认后再提交
- 建议使用 Conventional Commits 格式（type: message）
- 提交类型会自动推断，也可以手动指定
- 如果没有已暂存的更改，会自动暂存所有更改
- 自动生成的提交信息使用英文，包含文件数量、主要更改区域和统计信息

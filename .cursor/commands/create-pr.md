---
description: 创建 Pull Request
argument-hint: [title] [base-branch]
allowed-tools: Bash(git:*), Bash(gh:*)
---

# 创建 Pull Request

我将帮助你创建 Pull Request。让我先检查当前状态，然后执行必要的步骤。

## 步骤 1: 检查当前状态

### 当前分支

!`git branch --show-current`

### Git 状态

!`git status`

### 未推送的提交

!`git log origin/$(git branch --show-current)..HEAD --oneline 2>/dev/null || git log master..HEAD --oneline 2>/dev/null || echo "无未推送提交"`

## 步骤 2: 确定 PR 信息

- **PR 标题**: $1（如果未提供，将使用最近的提交信息）
- **基础分支**: $2（如果未提供，默认为 master）
- **当前分支**: !`git branch --show-current`

## 步骤 3: 检查并推送分支

如果当前分支未推送到远程，我将推送它：

```bash
CURRENT_BRANCH=$(git branch --show-current)
git push -u origin $CURRENT_BRANCH
```

## 步骤 4: 生成 PR 描述

基于提交历史生成 PR 描述：

### 提交列表

!`git log ${2:-master}..HEAD --oneline --reverse`

### 文件更改统计

!`git diff ${2:-master}..HEAD --stat`

### 详细更改

!`git diff ${2:-master}..HEAD`

## 步骤 5: 创建 PR

使用 GitHub CLI 创建 PR：

```bash
CURRENT_BRANCH=$(git branch --show-current)
BASE_BRANCH=${2:-master}

# 确定 PR 标题
if [ -n "$1" ]; then
  PR_TITLE="$1"
else
  PR_TITLE=$(git log -1 --pretty=%s)
fi

# 生成 PR 描述
PR_BODY="## 更改说明

$(git log $BASE_BRANCH..HEAD --pretty=format:'- %s' --reverse)

## 相关文件
\`\`\`
$(git diff $BASE_BRANCH..HEAD --stat)
\`\`\`

## 检查清单
- [ ] 代码已审查
- [ ] 测试通过
- [ ] 文档已更新（如需要）
"

# 创建 PR
gh pr create \
  --title "$PR_TITLE" \
  --base "$BASE_BRANCH" \
  --head "$CURRENT_BRANCH" \
  --body "$PR_BODY"
```

**使用方法：**

- `/create-pr` - 使用最近的提交信息作为标题，基础分支为 master
- `/create-pr "我的 PR 标题"` - 指定 PR 标题
- `/create-pr "我的 PR 标题" develop` - 指定 PR 标题和基础分支

**注意：** 确保已安装并配置 GitHub CLI (`gh`)，并且已登录。

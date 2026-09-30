# Code Review Agent 设计文档

## 1. 概述

### 1.1 项目背景

Code Review Agent 是一个基于 LLM 的智能代码审查助手。它能够自动分析代码变更，识别潜在的 bug、安全问题和代码规范问题，并提供精准、可操作的反馈。

该项目基于 `simple-agent` SDK 构建，复用其核心架构（Agent、ToolRegistry、ToolExecutor、Session）。

### 1.2 设计目标

- **LLM 驱动**：所有业务逻辑（意图理解、工具选择、代码分析、输出格式）由 LLM 通过 System Prompt 完成
- **Agent 极简**：Agent 代码只提供工具和安全检查，不包含业务逻辑
- **精准识别问题**：专注于发现真正的 bug，而非挑剔代码风格
- **上下文感知**：不仅看 diff，还要理解完整代码上下文
- **灵活输入**：支持多种 review 触发方式（branch、commit、PR 等）
- **可操作反馈**：每个问题都包含具体的修复建议

### 1.3 用户场景

```bash
# 场景 1: Review 当前分支相对于 main 的所有新代码
codereview-agent "帮我 review 当前 branch 新代码"

# 场景 2: Review 特定 commit 之后的代码
codereview-agent "帮我 review commit 13bad5 之后的代码"

# 场景 3: Review Pull Request
codereview-agent "帮我 review pull request 12 的代码"

# 场景 4: Review 未提交的改动
codereview-agent "帮我 review 当前的改动"
```

---

## 2. 系统架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      Code Review Agent                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│   │   Agent     │───▶│ LLM Client  │───▶│  OpenAI API │        │
│   │  (agentic   │    │             │    │             │        │
│   │    loop)    │    └─────────────┘    └─────────────┘        │
│   └──────┬──────┘                                              │
│          │                                                      │
│          ▼                                                      │
│   ┌─────────────┐                                              │
│   │    Tool     │                                              │
│   │  Registry   │                                              │
│   └──────┬──────┘                                              │
│          │                                                      │
│          ▼                                                      │
│   ┌─────────────────────────────────────────────────────┐      │
│   │                   Tool Executor                      │      │
│   ├─────────────┬─────────────┬─────────────┬──────────┤      │
│   │  read_file  │ write_file  │     git     │    gh    │      │
│   └─────────────┴─────────────┴─────────────┴──────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 核心组件

| 组件 | 职责 | 包含业务逻辑？ |
|------|------|---------------|
| `Agent` | 管理 agentic loop，协调 LLM 调用和工具执行 | ❌ 纯编排 |
| `ToolRegistry` | 注册和管理可用工具 | ❌ 纯编排 |
| `ToolExecutor` | 执行工具调用，处理超时和错误 | ❌ 纯编排 |
| `Session` | 维护对话历史和状态 | ❌ 纯编排 |
| `System Prompt` | 指导 LLM 进行代码审查的行为规范 | ✅ **所有业务逻辑** |

### 2.3 核心设计理念

```
┌────────────────────────────────────────────────────────────────┐
│                     LLM 驱动架构                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   System Prompt (prompts/system.md)                            │
│   ════════════════════════════════                             │
│   • 定义如何理解用户意图                                        │
│   • 定义工具使用策略                                            │
│   • 定义 review 工作流程                                        │
│   • 定义输出格式规范                                            │
│   • 定义问题严重程度标准                                        │
│                     │                                          │
│                     ▼                                          │
│   ┌─────────────────────────────────────────────────────┐     │
│   │                      LLM                             │     │
│   │  根据 System Prompt 自主决策：                        │     │
│   │  • 调用什么工具                                       │     │
│   │  • 按什么顺序调用                                     │     │
│   │  • 如何分析代码                                       │     │
│   │  • 如何格式化输出                                     │     │
│   └─────────────────────────────────────────────────────┘     │
│                     │                                          │
│                     ▼                                          │
│   Agent 代码 (src/)                                            │
│   ═════════════════                                            │
│   • 提供工具实现                                               │
│   • 执行安全检查                                               │
│   • 管理会话状态                                               │
│   • 调用 LLM API                                               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. 工具设计

Code Review Agent 具有四个核心工具：

### 3.1 read_file

**用途**：读取仓库中的文件内容，用于理解代码上下文。

```typescript
const readFileTool = defineTool({
  name: "read_file",
  description: "Read the contents of a file in the repository. Use this to understand the full context of code changes.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The relative path to the file from the repository root, e.g., 'src/utils/auth.ts'"
      },
      start_line: {
        type: "number",
        description: "Optional: Start line number (1-indexed) for partial reads"
      },
      end_line: {
        type: "number",
        description: "Optional: End line number (1-indexed) for partial reads"
      }
    },
    required: ["path"]
  },
  execute: async (args) => {
    // 实现文件读取逻辑
  }
})
```

**使用场景**：
- 查看 diff 中涉及的完整文件
- 检查导入的模块和依赖
- 理解调用链和数据流
- 查找项目约定文件（AGENTS.md, .editorconfig 等）

### 3.2 write_file

**用途**：将 review 结果写入文件，生成结构化报告。

```typescript
const writeFileTool = defineTool({
  name: "write_file",
  description: "Write content to a file. Use this to save review reports or summaries.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The relative path where to write the file, e.g., 'review-report.md'"
      },
      content: {
        type: "string",
        description: "The content to write to the file"
      }
    },
    required: ["path", "content"]
  },
  execute: async (args) => {
    // 实现文件写入逻辑
  }
})
```

**使用场景**：
- 生成 Markdown 格式的 review 报告
- 保存详细的问题列表
- 输出修复建议到文件

### 3.3 git

**用途**：执行 git 命令，获取代码变更信息。这是 code review 的核心工具。

```typescript
const gitTool = defineTool({
  name: "git",
  description: `Execute git commands to analyze code changes. Common operations:

DIFF OPERATIONS:
- Unstaged changes: git diff
- Staged changes: git diff --cached
- Branch comparison: git diff <base>...HEAD
- Specific commit: git show <commit>
- Commit range: git diff <from>..<to>
- Single file diff: git diff <path>

HISTORY OPERATIONS:
- Recent commits: git log --oneline -n 10
- File history: git log --oneline <path>
- Blame (line authors): git blame <path>
- Show commit details: git show <commit>

STATUS OPERATIONS:
- Working tree status: git status
- List changed files: git diff --name-only
- List staged files: git diff --cached --name-only`,
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The git command to execute (without 'git' prefix), e.g., 'diff --cached', 'log --oneline -5', 'show abc123'"
      }
    },
    required: ["command"]
  },
  execute: async (args) => {
    // 实现 git 命令执行逻辑
    // 安全性：只允许只读操作
  }
})
```

**支持的 diff 类型**：

| 场景 | Git 命令 |
|------|----------|
| 未暂存的改动 | `git diff` |
| 已暂存的改动 | `git diff --cached` |
| 当前分支 vs main | `git diff main...HEAD` |
| 当前分支 vs 任意分支 | `git diff <branch>...HEAD` |
| 特定 commit | `git show <commit>` |
| commit 之后的所有改动 | `git diff <commit>..HEAD` |
| 两个 commit 之间 | `git diff <from>..<to>` |
| 最近 N 个 commits | `git log -p -n <N>` |

**安全限制**：
- 只允许只读命令（diff, log, show, status, blame）
- 禁止修改仓库的命令（commit, push, reset, checkout 等）
- 限制输出大小防止 token 爆炸

### 3.4 gh

**用途**：执行 GitHub CLI 命令，获取 Pull Request 相关信息。

```typescript
const ghTool = defineTool({
  name: "gh",
  description: `Execute GitHub CLI (gh) commands to interact with Pull Requests. Common operations:

PR VIEWING:
- View PR details: gh pr view <number>
- View PR diff: gh pr diff <number>
- List PR files: gh pr diff <number> --name-only
- View PR comments: gh pr view <number> --comments
- View PR checks: gh pr checks <number>

PR LISTING:
- List open PRs: gh pr list
- List my PRs: gh pr list --author @me
- Search PRs: gh pr list --search "keyword"`,
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The gh command to execute (without 'gh' prefix), e.g., 'pr view 123', 'pr diff 456'"
      }
    },
    required: ["command"]
  },
  execute: async (args) => {
    // 实现 gh 命令执行逻辑
    // 安全性：只允许只读操作
  }
})
```

**支持的 PR 操作**：

| 场景 | gh 命令 |
|------|---------|
| 查看 PR 详情 | `gh pr view <number>` |
| 获取 PR diff | `gh pr diff <number>` |
| 查看 PR 变更文件列表 | `gh pr diff <number> --name-only` |
| 查看 PR 评论 | `gh pr view <number> --comments` |
| 检查 PR 状态 | `gh pr checks <number>` |

**安全限制**：
- 只允许只读命令（view, diff, list, checks）
- 禁止修改操作（merge, close, edit, comment 等）

---

## 4. 设计原则：LLM 负责意图理解

### 4.1 核心原则

**Agent 代码不做输入解析**。用户意图的理解完全由 LLM 通过 System Prompt 完成。

```
┌─────────────────────────────────────────────────────────────────┐
│                        职责划分                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Agent 代码层                    LLM 层（通过 System Prompt）   │
│   ─────────────                   ────────────────────────────   │
│   • 提供工具                      • 理解用户意图                 │
│   • 执行工具调用                  • 选择合适的工具               │
│   • 管理会话                      • 组合工具调用                 │
│   • 安全检查                      • 分析代码问题                 │
│   • 输出限制                      • 生成 review 报告             │
│                                                                 │
│   ❌ 不做：输入解析               ✅ 负责：理解 "review PR 12"   │
│   ❌ 不做：业务逻辑                    意味着调用 gh pr diff 12  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 System Prompt 指导 LLM

System Prompt (`prompts/system.md`) 中包含用户请求到工具调用的映射指南：

| 用户输入 | LLM 应调用的工具 |
|----------|-----------------|
| "帮我 review 当前 branch 新代码" | `git diff main...HEAD` |
| "review commit 13bad5 之后的代码" | `git diff 13bad5..HEAD` |
| "review pull request 12" | `gh pr view 12` + `gh pr diff 12` |
| "review 当前的改动" | `git diff` + `git diff --cached` |
| "review 这个 commit: abc123" | `git show abc123` |

LLM 根据 System Prompt 中的示例和工具文档，自主决定如何响应用户请求。

### 4.3 为什么不在 Agent 代码中解析

1. **LLM 更擅长自然语言理解**：用户可能用各种方式表达同一意图
2. **保持 Agent 代码简单**：Agent 只是工具的载体，不包含业务逻辑
3. **更灵活**：修改 System Prompt 即可调整行为，无需改代码
4. **更健壮**：LLM 可以处理模糊、不完整的输入

---

## 5. Review 工作流

### 5.1 LLM 驱动的工作流

LLM 根据 System Prompt 的指导，自主执行以下流程：

```
┌──────────────────────────────────────────────────────────────────┐
│                     LLM 自主决策流程                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  用户: "帮我 review PR 42"                                       │
│           │                                                      │
│           ▼                                                      │
│  ┌────────────────┐                                              │
│  │ LLM 理解意图   │  "PR 42" → 需要用 gh 工具获取 PR diff        │
│  └───────┬────────┘                                              │
│          │                                                       │
│          ▼                                                       │
│  ┌────────────────┐                                              │
│  │ 调用 gh 工具   │  gh pr view 42, gh pr diff 42                │
│  └───────┬────────┘                                              │
│          │                                                       │
│          ▼                                                       │
│  ┌────────────────┐                                              │
│  │ 调用 read_file │  读取变更文件的完整内容                      │
│  └───────┬────────┘                                              │
│          │                                                       │
│  ┌────────────────┐                                              │
│  │ 分析并输出     │  识别问题，生成 review 报告                  │
│  └────────────────┘                                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 LLM 的上下文收集行为

System Prompt 指导 LLM 按以下模式收集上下文（LLM 自主执行，非代码实现）：

1. **获取 diff** → 使用 git/gh 工具
2. **读取完整文件** → 对每个变更文件调用 read_file
3. **检查约定** → 尝试读取 AGENTS.md、.editorconfig 等
4. **理解历史**（可选）→ git log、git blame

---

## 6. 输出格式

输出格式完全由 System Prompt 定义，LLM 直接生成文本输出。Agent 代码不解析或结构化输出。

### 6.1 System Prompt 中的格式指南

System Prompt (`prompts/system.md`) 包含输出格式规范：

- 文件引用格式：`` `src/auth/handler.ts:47` ``
- 严重程度表述：Critical / Warning / Suggestion
- 代码片段格式：使用 markdown code blocks
- 整体结构：Summary → Issues → Suggestions

### 6.2 输出示例（LLM 直接生成）

```markdown
## Review Summary

Reviewed 3 files with 127 lines changed.
Found 2 issues: 1 critical, 1 suggestion.

---

### Critical Issues

**`src/auth/handler.ts:47`** — Null dereference risk

The `getUser()` function can return `null` for missing users, but line 52
accesses `user.id` without a guard. This crashes when requesting a non-existent
user ID.

**Scenario**: Any API call with an invalid or deleted user ID.

**Suggested fix**:
```typescript
const user = await getUser(id)
if (!user) {
  return res.status(404).json({ error: 'User not found' })
}
return res.json({ id: user.id })
```

---

### Suggestions

**`src/utils/format.ts:89`** — Consider using existing utility

The codebase has `formatCurrency()` in `src/utils/currency.ts` that handles
this case with better locale support.
```

---

## 7. 文件结构

```
w6/codereview-agent/
├── package.json
├── tsconfig.json
├── biome.json
├── CLAUDE.md
├── prompts/
│   └── system.md              # System Prompt（LLM 行为指南）
├── src/
│   ├── index.ts               # 入口文件，导出公共 API
│   ├── agent.ts               # createCodeReviewAgent 工厂函数
│   ├── tools/
│   │   ├── index.ts           # 工具导出
│   │   ├── read-file.ts       # read_file 工具实现
│   │   ├── write-file.ts      # write_file 工具实现
│   │   ├── git.ts             # git 工具实现
│   │   └── gh.ts              # gh 工具实现
│   └── types.ts               # 类型定义（可选）
├── tests/
│   ├── tools/
│   │   ├── read-file.test.ts
│   │   ├── git.test.ts
│   │   └── gh.test.ts
│   └── agent.test.ts
└── examples/
    └── basic-review.ts        # 使用示例
```

**注意**：没有 `parser/` 目录。用户输入解析由 LLM 通过 System Prompt 完成，不需要代码实现。

---

## 8. 实现细节

### 8.1 工具实现 - git

```typescript
// src/tools/git.ts
import { execSync } from "node:child_process"
import { defineTool } from "simple-agent"

// 允许的 git 命令白名单（只读操作）
const ALLOWED_GIT_COMMANDS = [
  "diff",
  "log",
  "show",
  "status",
  "blame",
  "branch",
  "rev-parse",
  "ls-files",
]

// 禁止的危险参数
const FORBIDDEN_ARGS = [
  "--exec",
  "-c",
  "!",
]

export const gitTool = defineTool({
  name: "git",
  description: "Execute git commands to analyze code changes...", // 见上文
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The git command to execute (without 'git' prefix)"
      }
    },
    required: ["command"]
  },
  execute: async (args) => {
    const { command } = args as { command: string }

    // 安全检查
    const parts = command.trim().split(/\s+/)
    const subCommand = parts[0]

    if (!ALLOWED_GIT_COMMANDS.includes(subCommand)) {
      return {
        output: "",
        error: `Git command '${subCommand}' is not allowed. Allowed commands: ${ALLOWED_GIT_COMMANDS.join(", ")}`
      }
    }

    for (const arg of parts) {
      if (FORBIDDEN_ARGS.some(f => arg.startsWith(f))) {
        return {
          output: "",
          error: `Argument '${arg}' is not allowed for security reasons`
        }
      }
    }

    try {
      const output = execSync(`git ${command}`, {
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024, // 10MB
        timeout: 30000, // 30 seconds
      })

      // 截断过长输出
      const maxLength = 50000
      if (output.length > maxLength) {
        return {
          output: output.slice(0, maxLength) + `\n\n[Output truncated. Total length: ${output.length} chars]`
        }
      }

      return { output }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { output: "", error: message }
    }
  }
})
```

### 8.2 工具实现 - gh

```typescript
// src/tools/gh.ts
import { execSync } from "node:child_process"
import { defineTool } from "simple-agent"

// 允许的 gh 命令白名单（只读操作）
const ALLOWED_GH_COMMANDS = [
  "pr view",
  "pr diff",
  "pr list",
  "pr checks",
  "pr status",
]

export const ghTool = defineTool({
  name: "gh",
  description: "Execute GitHub CLI commands...", // 见上文
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The gh command to execute (without 'gh' prefix)"
      }
    },
    required: ["command"]
  },
  execute: async (args) => {
    const { command } = args as { command: string }

    // 安全检查：只允许白名单中的命令
    const isAllowed = ALLOWED_GH_COMMANDS.some(allowed =>
      command.trim().startsWith(allowed)
    )

    if (!isAllowed) {
      return {
        output: "",
        error: `GH command is not allowed. Allowed patterns: ${ALLOWED_GH_COMMANDS.join(", ")}`
      }
    }

    try {
      const output = execSync(`gh ${command}`, {
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024,
        timeout: 60000, // 60 seconds for network operations
      })

      return { output }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { output: "", error: message }
    }
  }
})
```

### 8.3 工具实现 - read_file

```typescript
// src/tools/read-file.ts
import { readFileSync, existsSync } from "node:fs"
import { resolve, relative, isAbsolute } from "node:path"
import { defineTool } from "simple-agent"

const CWD = process.cwd()

export const readFileTool = defineTool({
  name: "read_file",
  description: "Read the contents of a file in the repository...",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The relative path to the file from the repository root"
      },
      start_line: {
        type: "number",
        description: "Optional: Start line number (1-indexed)"
      },
      end_line: {
        type: "number",
        description: "Optional: End line number (1-indexed)"
      }
    },
    required: ["path"]
  },
  execute: async (args) => {
    const { path, start_line, end_line } = args as {
      path: string
      start_line?: number
      end_line?: number
    }

    // 安全检查：不允许绝对路径或路径遍历
    if (isAbsolute(path) || path.includes("..")) {
      return {
        output: "",
        error: "Absolute paths and path traversal (..) are not allowed"
      }
    }

    const fullPath = resolve(CWD, path)

    // 确保文件在当前工作目录内
    const relativePath = relative(CWD, fullPath)
    if (relativePath.startsWith("..")) {
      return {
        output: "",
        error: "Cannot read files outside the repository"
      }
    }

    if (!existsSync(fullPath)) {
      return {
        output: "",
        error: `File not found: ${path}`
      }
    }

    try {
      let content = readFileSync(fullPath, "utf-8")

      // 如果指定了行范围，只返回那些行
      if (start_line !== undefined || end_line !== undefined) {
        const lines = content.split("\n")
        const start = (start_line ?? 1) - 1
        const end = end_line ?? lines.length
        content = lines.slice(start, end).join("\n")
      }

      // 添加行号（便于引用）
      const lines = content.split("\n")
      const lineOffset = (start_line ?? 1) - 1
      const numberedContent = lines
        .map((line, i) => `${String(i + 1 + lineOffset).padStart(4)} │ ${line}`)
        .join("\n")

      return { output: numberedContent }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { output: "", error: message }
    }
  }
})
```

### 8.4 工具实现 - write_file

```typescript
// src/tools/write-file.ts
import { writeFileSync, mkdirSync } from "node:fs"
import { resolve, dirname, relative, isAbsolute } from "node:path"
import { defineTool } from "simple-agent"

const CWD = process.cwd()

export const writeFileTool = defineTool({
  name: "write_file",
  description: "Write content to a file...",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The relative path where to write the file"
      },
      content: {
        type: "string",
        description: "The content to write"
      }
    },
    required: ["path", "content"]
  },
  execute: async (args) => {
    const { path, content } = args as { path: string; content: string }

    // 安全检查
    if (isAbsolute(path) || path.includes("..")) {
      return {
        output: "",
        error: "Absolute paths and path traversal (..) are not allowed"
      }
    }

    const fullPath = resolve(CWD, path)
    const relativePath = relative(CWD, fullPath)

    if (relativePath.startsWith("..")) {
      return {
        output: "",
        error: "Cannot write files outside the repository"
      }
    }

    try {
      // 确保目录存在
      mkdirSync(dirname(fullPath), { recursive: true })

      writeFileSync(fullPath, content, "utf-8")

      return {
        output: `Successfully wrote ${content.length} characters to ${path}`
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { output: "", error: message }
    }
  }
})
```

### 8.5 Agent 入口

```typescript
// src/agent.ts
import { createAgent } from "simple-agent"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { readFileTool } from "./tools/read-file.ts"
import { writeFileTool } from "./tools/write-file.ts"
import { gitTool } from "./tools/git.ts"
import { ghTool } from "./tools/gh.ts"

const systemPrompt = readFileSync(
  resolve(import.meta.dirname, "../prompts/system.md"),
  "utf-8"
)

export function createCodeReviewAgent(options?: {
  model?: string
  onEvent?: (event: AgentEvent) => void
}) {
  return createAgent({
    model: options?.model ?? "gpt-4o",
    systemPrompt,
    tools: [readFileTool, writeFileTool, gitTool, ghTool],
    maxSteps: 50,
    onEvent: options?.onEvent,
  })
}
```

---

## 9. 安全考虑

### 9.1 命令注入防护

- Git/GH 工具使用命令白名单
- 禁止危险参数和 shell 特殊字符
- 使用 `execSync` 而非 shell 执行

### 9.2 路径遍历防护

- read_file 和 write_file 只允许相对路径
- 禁止 `..` 路径遍历
- 验证最终路径在工作目录内

### 9.3 资源限制

- 输出大小限制（防止 token 爆炸）
- 命令执行超时
- 最大步数限制

---

## 10. 扩展计划

### 10.1 Phase 1（当前）
- 基础工具实现
- 支持 branch/commit/PR review
- 文本输出格式

### 10.2 Phase 2（未来）
- 支持 GitLab MR
- 自动提交 PR comment
- 与 CI/CD 集成
- 增量 review（只看新增改动）

### 10.3 Phase 3（远期）
- 多语言特定规则
- 项目自定义规则配置
- Review 历史学习
- 团队协作模式

---

## 11. 依赖

```json
{
  "dependencies": {
    "simple-agent": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.7.0",
    "vitest": "^2.0.0",
    "tsup": "^8.0.0",
    "biome": "^1.9.0"
  }
}
```

---

## 12. 参考资料

- [simple-agent SDK 源码](../simple-agent/)
- [Code Review Agent System Prompt](./prompts/system.md)
- [OpenAI Codex CLI 系统提示词](./prompts/codex.txt)
- [Reviewer 提示词模板](./prompts/reviewer.txt)

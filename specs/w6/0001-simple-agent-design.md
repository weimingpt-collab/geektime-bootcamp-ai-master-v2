# Simple Multi-turn Agent with Tool Calling - Design Specification

## 1. 核心概念

### 1.1 Agent 定义

Agent 是一个能够：

1. 接收用户消息
2. 调用 LLM 生成响应
3. 识别并执行工具调用
4. 将工具结果返回给 LLM
5. 循环直到任务完成

```
┌─────────────────────────────────────────────────────────┐
│                    Agent Loop                            │
│                                                          │
│  User Input ──► LLM ──► Tool Calls? ──► Execute Tools   │
│       ▲                     │                  │         │
│       │                     ▼                  ▼         │
│       └──────── NO ◄── Continue? ◄─── Results ──┘        │
│                     │                                    │
│                     ▼ YES                                │
│                  Response                                │
└─────────────────────────────────────────────────────────┘
```

## 2. 核心数据结构

### 2.1 消息 (Message)

```typescript
interface Message {
  id: string
  role: "user" | "assistant" | "tool"
  content: MessageContent[]
  createdAt: Date
}

type MessageContent =
  | TextContent
  | ToolCallContent
  | ToolResultContent

interface TextContent {
  type: "text"
  text: string
}

interface ToolCallContent {
  type: "tool_call"
  id: string           // 工具调用唯一ID
  name: string         // 工具名称
  arguments: unknown   // 工具参数 (JSON)
}

interface ToolResultContent {
  type: "tool_result"
  toolCallId: string   // 对应的工具调用ID
  result: string       // 执行结果
  isError?: boolean    // 是否为错误
}
```

### 2.2 工具定义 (Tool)

```typescript
interface Tool {
  name: string
  description: string
  parameters: JSONSchema        // 参数的 JSON Schema
  execute: (args: unknown) => Promise<ToolResult>
}

interface ToolResult {
  output: string
  metadata?: Record<string, unknown>
  error?: string
}
```

### 2.3 会话 (Session)

```typescript
interface Session {
  id: string
  messages: Message[]
  systemPrompt: string
  model: ModelConfig
  tools: Tool[]
  status: "idle" | "running" | "completed" | "error"
}
```

## 3. 核心模块

### 3.1 LLM 模块

负责与 LLM 通信，支持流式响应。

```typescript
interface LLMInput {
  model: string
  messages: Message[]
  systemPrompt: string
  tools: ToolDefinition[]
  abortSignal?: AbortSignal
}

interface LLMOutput {
  content: MessageContent[]
  finishReason: "stop" | "tool_calls" | "max_tokens" | "error"
  usage: {
    inputTokens: number
    outputTokens: number
  }
}

// 核心接口
async function* streamLLM(input: LLMInput): AsyncGenerator<LLMEvent>

type LLMEvent =
  | { type: "text_delta", text: string }
  | { type: "tool_call_start", id: string, name: string }
  | { type: "tool_call_delta", id: string, arguments: string }
  | { type: "tool_call_end", id: string }
  | { type: "finish", reason: string, usage: Usage }
  | { type: "error", error: Error }
```

### 3.2 工具注册表 (Tool Registry)

管理所有可用工具。

```typescript
class ToolRegistry {
  private tools: Map<string, Tool> = new Map()

  register(tool: Tool): void
  unregister(name: string): void
  get(name: string): Tool | undefined
  list(): Tool[]

  // 转换为 LLM 工具格式
  toToolDefinitions(): ToolDefinition[]
}
```

### 3.3 工具执行器 (Tool Executor)

执行工具调用并处理结果。

```typescript
interface ExecutionContext {
  sessionId: string
  messageId: string
  abortSignal?: AbortSignal
}

class ToolExecutor {
  constructor(private registry: ToolRegistry) {}

  async execute(
    call: ToolCallContent,
    ctx: ExecutionContext
  ): Promise<ToolResultContent> {
    const tool = this.registry.get(call.name)
    if (!tool) {
      return {
        type: "tool_result",
        toolCallId: call.id,
        result: `Tool not found: ${call.name}`,
        isError: true
      }
    }

    try {
      const result = await tool.execute(call.arguments)
      return {
        type: "tool_result",
        toolCallId: call.id,
        result: result.output,
        isError: !!result.error
      }
    } catch (error) {
      return {
        type: "tool_result",
        toolCallId: call.id,
        result: error.message,
        isError: true
      }
    }
  }
}
```

### 3.4 Agent Loop

核心循环逻辑。

```typescript
interface AgentConfig {
  model: string
  systemPrompt: string
  tools: Tool[]
  maxSteps?: number        // 最大循环次数，防止无限循环
  onEvent?: (event: AgentEvent) => void
}

type AgentEvent =
  | { type: "message_start", role: "assistant" }
  | { type: "text", text: string }
  | { type: "tool_call", name: string, args: unknown }
  | { type: "tool_result", name: string, result: string }
  | { type: "message_end", finishReason: string }
  | { type: "error", error: Error }

async function runAgent(
  session: Session,
  config: AgentConfig
): Promise<Message[]> {
  const executor = new ToolExecutor(registry)
  let step = 0
  const maxSteps = config.maxSteps ?? 200

  while (step < maxSteps) {
    step++

    // 1. 调用 LLM
    const response = await callLLM({
      model: config.model,
      messages: session.messages,
      systemPrompt: config.systemPrompt,
      tools: registry.toToolDefinitions()
    })

    // 2. 创建助手消息
    const assistantMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: response.content,
      createdAt: new Date()
    }
    session.messages.push(assistantMessage)

    // 3. 检查是否需要执行工具
    const toolCalls = response.content.filter(
      c => c.type === "tool_call"
    ) as ToolCallContent[]

    if (toolCalls.length === 0) {
      // 没有工具调用，循环结束
      break
    }

    // 4. 并行执行所有工具调用
    const results = await Promise.all(
      toolCalls.map(call => executor.execute(call, {
        sessionId: session.id,
        messageId: assistantMessage.id
      }))
    )

    // 5. 将工具结果添加到消息历史
    const toolMessage: Message = {
      id: generateId(),
      role: "tool",
      content: results,
      createdAt: new Date()
    }
    session.messages.push(toolMessage)

    // 6. 继续循环，让 LLM 处理工具结果
  }

  return session.messages
}
```

## 4. MCP 集成

### 4.1 MCP 客户端

支持从 MCP 服务器动态加载工具。

```typescript
interface MCPConfig {
  name: string
  transport: "stdio" | "http" | "sse"
  command?: string          // stdio: 启动命令
  args?: string[]           // stdio: 命令参数
  url?: string              // http/sse: 服务器URL
}

class MCPClient {
  private client: Client

  async connect(config: MCPConfig): Promise<void>
  async disconnect(): Promise<void>

  // 获取 MCP 服务器提供的工具
  async listTools(): Promise<Tool[]>

  // 调用 MCP 工具
  async callTool(name: string, args: unknown): Promise<ToolResult>
}
```

### 4.2 MCP 工具适配

将 MCP 工具转换为本地 Tool 接口。

```typescript
function adaptMCPTool(
  client: MCPClient,
  mcpTool: MCPToolDefinition
): Tool {
  return {
    name: mcpTool.name,
    description: mcpTool.description,
    parameters: mcpTool.inputSchema,
    execute: async (args) => {
      const result = await client.callTool(mcpTool.name, args)
      return {
        output: JSON.stringify(result.content),
        metadata: result.meta
      }
    }
  }
}
```

## 5. 权限系统

### 5.1 权限检查

```typescript
interface Permission {
  tool: string              // 工具名称或通配符
  action: "allow" | "deny" | "ask"
  patterns?: string[]       // 具体的参数模式
}

interface PermissionContext {
  tool: string
  args: unknown
  session: Session
}

class PermissionManager {
  private rules: Permission[] = []

  async check(ctx: PermissionContext): Promise<"allow" | "deny"> {
    // 检查是否匹配任何规则
    for (const rule of this.rules) {
      if (this.matches(rule, ctx)) {
        if (rule.action === "ask") {
          return await this.askUser(ctx)
        }
        return rule.action === "allow" ? "allow" : "deny"
      }
    }
    return "deny"  // 默认拒绝
  }

  private async askUser(ctx: PermissionContext): Promise<"allow" | "deny"> {
    // 询问用户是否允许此操作
    // ...
  }
}
```

## 6. 流式处理

### 6.1 流式 Agent Loop

支持实时输出的流式处理。

```typescript
async function* streamAgent(
  session: Session,
  config: AgentConfig
): AsyncGenerator<AgentEvent> {
  const executor = new ToolExecutor(registry)
  let step = 0

  while (step < (config.maxSteps ?? 200)) {
    step++
    yield { type: "message_start", role: "assistant" }

    const content: MessageContent[] = []
    const toolCalls: ToolCallContent[] = []

    // 流式处理 LLM 响应
    for await (const event of streamLLM({
      model: config.model,
      messages: session.messages,
      systemPrompt: config.systemPrompt,
      tools: registry.toToolDefinitions()
    })) {
      switch (event.type) {
        case "text_delta":
          yield { type: "text", text: event.text }
          // 累积文本
          break

        case "tool_call_end":
          const call = buildToolCall(event)
          toolCalls.push(call)
          yield { type: "tool_call", name: call.name, args: call.arguments }
          break

        case "finish":
          yield { type: "message_end", finishReason: event.reason }
          break
      }
    }

    // 保存助手消息
    session.messages.push({
      id: generateId(),
      role: "assistant",
      content,
      createdAt: new Date()
    })

    // 无工具调用则结束
    if (toolCalls.length === 0) break

    // 执行工具
    const results: ToolResultContent[] = []
    for (const call of toolCalls) {
      const result = await executor.execute(call, {
        sessionId: session.id,
        messageId: "current"
      })
      results.push(result)
      yield { type: "tool_result", name: call.name, result: result.result }
    }

    // 保存工具结果
    session.messages.push({
      id: generateId(),
      role: "tool",
      content: results,
      createdAt: new Date()
    })
  }
}
```

## 7. 错误处理与重试

```typescript
interface RetryConfig {
  maxRetries: number
  baseDelay: number        // 基础延迟 (ms)
  maxDelay: number         // 最大延迟 (ms)
  retryableErrors: string[] // 可重试的错误类型
}

async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: Error

  for (let i = 0; i <= config.maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (!isRetryable(error, config.retryableErrors)) {
        throw error
      }

      if (i < config.maxRetries) {
        const delay = Math.min(
          config.baseDelay * Math.pow(2, i),
          config.maxDelay
        )
        await sleep(delay)
      }
    }
  }

  throw lastError
}
```

## 8. 最小实现示例

### 8.1 完整的最小 Agent

```typescript
import Anthropic from "@anthropic-ai/sdk"

// 工具定义
const tools = [
  {
    name: "get_weather",
    description: "Get current weather for a location",
    input_schema: {
      type: "object",
      properties: {
        location: { type: "string", description: "City name" }
      },
      required: ["location"]
    }
  }
]

// 工具执行
async function executeTool(name: string, args: any): Promise<string> {
  if (name === "get_weather") {
    return JSON.stringify({ temp: 22, condition: "sunny" })
  }
  return "Unknown tool"
}

// Agent 循环
async function runAgent(userMessage: string) {
  const client = new Anthropic()
  const messages: any[] = [{ role: "user", content: userMessage }]

  while (true) {
    // 1. 调用 LLM
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      tools,
      messages
    })

    // 2. 收集响应内容
    let hasToolUse = false
    const toolResults: any[] = []

    for (const block of response.content) {
      if (block.type === "text") {
        console.log("Assistant:", block.text)
      } else if (block.type === "tool_use") {
        hasToolUse = true
        console.log(`Calling tool: ${block.name}`)

        const result = await executeTool(block.name, block.input)
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result
        })
      }
    }

    // 3. 如果有工具调用，添加结果并继续循环
    if (hasToolUse) {
      messages.push({ role: "assistant", content: response.content })
      messages.push({ role: "user", content: toolResults })
      continue
    }

    // 4. 没有工具调用，结束循环
    if (response.stop_reason === "end_turn") {
      break
    }
  }
}

// 运行
runAgent("What's the weather in Tokyo?")
```

## 9. 核心设计原则

### 9.1 OpenCode 借鉴的关键模式

1. **流式优先**：所有 LLM 调用都使用流式接口，支持实时反馈
2. **工具即一等公民**：统一的工具接口，支持内置/自定义/MCP 工具
3. **循环直到完成**：Agent 持续循环直到 LLM 不再请求工具调用
4. **权限检查**：每次工具调用前检查权限
5. **Doom Loop 检测**：检测重复工具调用，防止无限循环
6. **消息压缩**：上下文过长时自动压缩历史消息

### 9.2 简化版设计要点

| 组件         | 必须 | 可选     |
|--------------|------|----------|
| Message 结构 | ✅    | -        |
| Tool 定义    | ✅    | -        |
| LLM 调用     | ✅    | 流式处理 |
| Agent Loop   | ✅    | -        |
| 权限系统     | -    | ✅        |
| MCP 集成     | -    | ✅        |
| 消息压缩     | -    | ✅        |
| 重试机制     | -    | ✅        |

## 10. 文件结构建议

```
src/
├── agent/
│   ├── agent.ts          # Agent 配置
│   └── loop.ts           # Agent 循环逻辑
├── llm/
│   ├── client.ts         # LLM 客户端
│   └── stream.ts         # 流式处理
├── tool/
│   ├── registry.ts       # 工具注册表
│   ├── executor.ts       # 工具执行器
│   └── builtin/          # 内置工具
│       ├── bash.ts
│       ├── read.ts
│       └── write.ts
├── mcp/
│   ├── client.ts         # MCP 客户端
│   └── adapter.ts        # 工具适配器
├── session/
│   ├── session.ts        # 会话管理
│   └── message.ts        # 消息处理
└── index.ts              # 入口
```

## 11. 参考资源

- [Anthropic Tool Use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [AI SDK (Vercel)](https://sdk.vercel.ai/docs)
- OpenCode 源码: `/src/session/`, `/src/tool/`, `/src/mcp/`

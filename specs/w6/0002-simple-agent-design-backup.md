# Simple Agent 设计文档

## 概述

基于 Agent Loop 模式构建一个简单但完整的 TypeScript Agent 系统。该系统实现经典的 ReAct 循环：用户输入 → LLM 推理 → 工具调用判断 → 执行工具/返回结果。

```
┌─────────────────────────────────────────────────────────┐
│                      Agent Loop                         │
│                                                         │
│  user input ──▶ LLM ──▶ tool call? ──Y──▶ Execute Tool │
│                  ▲          │                    │      │
│                  │          N                    ▼      │
│                  │          │              Tool result  │
│                  │          ▼                    │      │
│                  │    Result Response ◀──────────┘      │
│                  │                                      │
│                  └──────────────────────────────────────┘
└─────────────────────────────────────────────────────────┘
```

---

## 核心类型定义

### 1. 消息类型 (Messages)

```typescript
// 基础消息角色
type Role = 'user' | 'assistant' | 'tool';

// 文本内容块
interface TextContent {
  type: 'text';
  text: string;
}

// 工具调用内容块
interface ToolUseContent {
  type: 'tool_use';
  id: string;           // 工具调用唯一ID
  name: string;         // 工具名称
  input: Record<string, unknown>;  // 工具参数
}

// 工具结果内容块
interface ToolResultContent {
  type: 'tool_result';
  tool_use_id: string;  // 对应的工具调用ID
  content: string;      // 执行结果
  is_error?: boolean;   // 是否为错误
}

// 内容块联合类型
type ContentBlock = TextContent | ToolUseContent | ToolResultContent;

// 消息结构
interface Message {
  role: Role;
  content: ContentBlock[] | string;
}

// 用户消息
interface UserMessage extends Message {
  role: 'user';
  content: string;
}

// 助手消息（可能包含工具调用）
interface AssistantMessage extends Message {
  role: 'assistant';
  content: (TextContent | ToolUseContent)[];
}

// 工具结果消息
interface ToolResultMessage extends Message {
  role: 'user';  // Anthropic API 中工具结果作为 user 消息
  content: ToolResultContent[];
}
```

### 2. 工具定义 (Tool)

```typescript
// JSON Schema 类型（简化版）
interface JSONSchema {
  type: 'object';
  properties: Record<string, {
    type: string;
    description: string;
    enum?: string[];
  }>;
  required?: string[];
}

// 工具定义接口
interface Tool {
  name: string;
  description: string;
  input_schema: JSONSchema;
}

// 工具执行器类型
type ToolExecutor = (input: Record<string, unknown>) => Promise<string>;

// 工具注册表
interface ToolRegistry {
  definition: Tool;
  executor: ToolExecutor;
}
```

### 3. LLM 响应类型

```typescript
// LLM API 响应
interface LLMResponse {
  id: string;
  content: (TextContent | ToolUseContent)[];
  stop_reason: 'end_turn' | 'tool_use' | 'max_tokens';
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}
```

### 4. Agent 配置

```typescript
interface AgentConfig {
  // LLM 配置
  apiKey: string;
  model: string;
  baseUrl?: string;

  // Agent 行为配置
  systemPrompt: string;
  maxIterations: number;      // 最大循环次数，防止无限循环
  maxTokens: number;          // 单次响应最大 token

  // 可选配置
  temperature?: number;
  verbose?: boolean;          // 是否打印调试信息
}
```

---

## 核心类设计

### 1. LLMClient 类

负责与 LLM API 通信。

```typescript
class LLMClient {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(config: Pick<AgentConfig, 'apiKey' | 'model' | 'baseUrl'>) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.baseUrl = config.baseUrl ?? 'https://api.anthropic.com';
  }

  /**
   * 发送消息到 LLM 并获取响应
   */
  async chat(params: {
    systemPrompt: string;
    messages: Message[];
    tools: Tool[];
    maxTokens: number;
    temperature?: number;
  }): Promise<LLMResponse> {
    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        system: params.systemPrompt,
        messages: params.messages,
        tools: params.tools,
        max_tokens: params.maxTokens,
        temperature: params.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LLM API error: ${response.status} - ${error}`);
    }

    return response.json();
  }
}
```

### 2. ToolManager 类

管理工具注册和执行。

```typescript
class ToolManager {
  private tools: Map<string, ToolRegistry> = new Map();

  /**
   * 注册工具
   */
  register(
    definition: Tool,
    executor: ToolExecutor
  ): void {
    if (this.tools.has(definition.name)) {
      throw new Error(`Tool "${definition.name}" already registered`);
    }
    this.tools.set(definition.name, { definition, executor });
  }

  /**
   * 获取所有工具定义（用于发送给 LLM）
   */
  getDefinitions(): Tool[] {
    return Array.from(this.tools.values()).map(t => t.definition);
  }

  /**
   * 执行单个工具调用
   */
  async execute(toolUse: ToolUseContent): Promise<ToolResultContent> {
    const registry = this.tools.get(toolUse.name);

    if (!registry) {
      return {
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: `Error: Unknown tool "${toolUse.name}"`,
        is_error: true,
      };
    }

    try {
      const result = await registry.executor(toolUse.input);
      return {
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: result,
      };
    } catch (error) {
      return {
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: `Error executing tool: ${error instanceof Error ? error.message : String(error)}`,
        is_error: true,
      };
    }
  }

  /**
   * 批量执行工具调用
   */
  async executeAll(toolUses: ToolUseContent[]): Promise<ToolResultContent[]> {
    return Promise.all(toolUses.map(tu => this.execute(tu)));
  }
}
```

### 3. Agent 主类

实现核心 Agent Loop。

```typescript
class Agent {
  private llm: LLMClient;
  private toolManager: ToolManager;
  private config: AgentConfig;
  private messages: Message[] = [];

  constructor(config: AgentConfig) {
    this.config = config;
    this.llm = new LLMClient({
      apiKey: config.apiKey,
      model: config.model,
      baseUrl: config.baseUrl,
    });
    this.toolManager = new ToolManager();
  }

  /**
   * 注册工具
   */
  registerTool(definition: Tool, executor: ToolExecutor): this {
    this.toolManager.register(definition, executor);
    return this; // 支持链式调用
  }

  /**
   * 重置对话历史
   */
  reset(): void {
    this.messages = [];
  }

  /**
   * 核心方法：运行 Agent Loop
   */
  async run(userInput: string): Promise<string> {
    // 1. 添加用户消息
    this.messages.push({
      role: 'user',
      content: userInput,
    });

    let iteration = 0;

    // 2. Agent Loop
    while (iteration < this.config.maxIterations) {
      iteration++;
      this.log(`\n=== Iteration ${iteration} ===`);

      // 3. 调用 LLM
      const response = await this.llm.chat({
        systemPrompt: this.config.systemPrompt,
        messages: this.messages,
        tools: this.toolManager.getDefinitions(),
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      this.log(`Stop reason: ${response.stop_reason}`);

      // 4. 提取工具调用
      const toolUses = response.content.filter(
        (c): c is ToolUseContent => c.type === 'tool_use'
      );

      // 5. 添加助手响应到历史
      this.messages.push({
        role: 'assistant',
        content: response.content,
      });

      // 6. 判断是否有工具调用
      if (toolUses.length === 0 || response.stop_reason === 'end_turn') {
        // 无工具调用，提取文本响应并返回
        const textBlocks = response.content.filter(
          (c): c is TextContent => c.type === 'text'
        );
        return textBlocks.map(t => t.text).join('\n');
      }

      // 7. 执行工具调用
      this.log(`Executing ${toolUses.length} tool(s)...`);
      for (const tu of toolUses) {
        this.log(`  - ${tu.name}: ${JSON.stringify(tu.input)}`);
      }

      const toolResults = await this.toolManager.executeAll(toolUses);

      // 8. 添加工具结果到历史
      this.messages.push({
        role: 'user',
        content: toolResults,
      });

      // 9. 继续循环
    }

    // 超过最大迭代次数
    throw new Error(`Agent exceeded maximum iterations (${this.config.maxIterations})`);
  }

  private log(message: string): void {
    if (this.config.verbose) {
      console.log(`[Agent] ${message}`);
    }
  }
}
```

---

## 完整实现示例

### 目录结构

```
simple-agent/
├── src/
│   ├── types/
│   │   ├── messages.ts      # 消息类型定义
│   │   ├── tools.ts         # 工具类型定义
│   │   └── index.ts         # 类型导出
│   ├── core/
│   │   ├── llm-client.ts    # LLM 客户端
│   │   ├── tool-manager.ts  # 工具管理器
│   │   └── agent.ts         # Agent 主类
│   ├── tools/               # 内置工具
│   │   ├── calculator.ts
│   │   ├── web-search.ts
│   │   └── file-reader.ts
│   └── index.ts             # 入口文件
├── examples/
│   └── basic-usage.ts       # 使用示例
├── package.json
└── tsconfig.json
```

### 使用示例

```typescript
import { Agent } from './src';

// 创建 Agent
const agent = new Agent({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: 'claude-sonnet-4-20250514',
  systemPrompt: `你是一个有帮助的 AI 助手。你可以使用提供的工具来帮助用户完成任务。
当你需要执行计算、查询信息或完成其他操作时，请使用合适的工具。
完成任务后，请用自然语言总结结果。`,
  maxIterations: 10,
  maxTokens: 4096,
  verbose: true,
});

// 注册计算器工具
agent.registerTool(
  {
    name: 'calculator',
    description: '执行数学计算。支持基本运算和常见数学函数。',
    input_schema: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: '要计算的数学表达式，例如 "2 + 3 * 4" 或 "Math.sqrt(16)"',
        },
      },
      required: ['expression'],
    },
  },
  async (input) => {
    const expression = input.expression as string;
    try {
      // 注意：生产环境应使用安全的表达式解析器
      const result = new Function(`return ${expression}`)();
      return `计算结果: ${result}`;
    } catch (error) {
      throw new Error(`无法计算表达式: ${expression}`);
    }
  }
);

// 注册天气查询工具（模拟）
agent.registerTool(
  {
    name: 'get_weather',
    description: '获取指定城市的天气信息',
    input_schema: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: '城市名称',
        },
      },
      required: ['city'],
    },
  },
  async (input) => {
    const city = input.city as string;
    // 模拟天气数据
    const weather = {
      temperature: Math.floor(Math.random() * 30) + 5,
      condition: ['晴朗', '多云', '小雨', '阴天'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 60) + 40,
    };
    return JSON.stringify({
      city,
      ...weather,
      unit: '摄氏度',
    });
  }
);

// 运行 Agent
async function main() {
  try {
    // 简单计算任务
    const result1 = await agent.run('请帮我计算 (15 + 27) * 3 - 42 / 6');
    console.log('回答:', result1);

    agent.reset();

    // 多步骤任务
    const result2 = await agent.run(
      '查询北京和上海的天气，然后告诉我哪个城市更热，温差是多少'
    );
    console.log('回答:', result2);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

---

## 执行流程详解

以用户输入 "查询北京和上海的天气，然后告诉我哪个城市更热" 为例：

### 第一轮迭代

```
1. User Message: "查询北京和上海的天气..."
         │
         ▼
2. LLM 分析后决定调用工具
         │
         ▼
3. Assistant Response:
   - TextContent: "我来帮你查询两个城市的天气。"
   - ToolUseContent: { name: "get_weather", input: { city: "北京" } }
   - ToolUseContent: { name: "get_weather", input: { city: "上海" } }
         │
         ▼
4. 执行工具，获取结果
         │
         ▼
5. Tool Results:
   - { tool_use_id: "xxx", content: '{"city":"北京","temperature":22,...}' }
   - { tool_use_id: "yyy", content: '{"city":"上海","temperature":28,...}' }
```

### 第二轮迭代

```
6. LLM 收到工具结果
         │
         ▼
7. Assistant Response (stop_reason: "end_turn"):
   - TextContent: "根据查询结果：
     - 北京：22°C，晴朗
     - 上海：28°C，多云

     上海更热，温差为 6°C。"
         │
         ▼
8. 无工具调用，返回最终响应
```

---

## 高级功能扩展

### 1. 流式输出支持

```typescript
interface StreamCallbacks {
  onText?: (text: string) => void;
  onToolStart?: (toolUse: ToolUseContent) => void;
  onToolEnd?: (result: ToolResultContent) => void;
  onComplete?: (finalResponse: string) => void;
}

async runStream(userInput: string, callbacks: StreamCallbacks): Promise<string> {
  // 实现流式处理逻辑
}
```

### 2. 中间件/钩子系统

```typescript
interface AgentHooks {
  beforeLLMCall?: (messages: Message[]) => Promise<Message[]>;
  afterLLMCall?: (response: LLMResponse) => Promise<LLMResponse>;
  beforeToolExecution?: (toolUse: ToolUseContent) => Promise<boolean>; // 返回 false 可阻止执行
  afterToolExecution?: (result: ToolResultContent) => Promise<ToolResultContent>;
}
```

### 3. 对话记忆与上下文管理

```typescript
class ConversationMemory {
  private maxMessages: number;
  private messages: Message[] = [];

  constructor(maxMessages: number = 50) {
    this.maxMessages = maxMessages;
  }

  add(message: Message): void {
    this.messages.push(message);
    // 保留系统消息，裁剪旧消息
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
  }

  getAll(): Message[] {
    return [...this.messages];
  }

  summarize(): Promise<string> {
    // 可以调用 LLM 总结历史对话
  }
}
```

### 4. 错误重试机制

```typescript
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;  // ms
  retryableErrors: string[];
}

async executeWithRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < config.maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (!config.retryableErrors.some(e => lastError.message.includes(e))) {
        throw lastError;
      }
      await sleep(config.retryDelay * Math.pow(2, i)); // 指数退避
    }
  }

  throw lastError!;
}
```

---

## 关键设计决策

### 1. 为什么工具结果用 `user` 角色？

Anthropic API 要求工具结果作为 user 消息发送，内容类型为 `tool_result`。这遵循了 API 规范。

### 2. 为什么需要 `maxIterations`？

防止 Agent 陷入无限循环。当 LLM 反复调用工具但无法得出结论时，这是一个安全阀。

### 3. 为什么工具执行是并行的？

使用 `Promise.all` 并行执行多个工具调用可以显著提升性能，特别是当工具涉及网络请求时。

### 4. 错误处理策略

- 工具执行错误不中断 Agent Loop，而是将错误信息返回给 LLM
- LLM 可以根据错误信息决定重试或采取其他策略
- 这提供了更好的容错能力

---

## 测试策略

```typescript
// 单元测试示例
describe('Agent', () => {
  it('should complete simple task without tools', async () => {
    const agent = createMockAgent();
    const result = await agent.run('Hello');
    expect(result).toBeDefined();
  });

  it('should execute tools and return result', async () => {
    const agent = createMockAgent();
    agent.registerTool(mockCalculator);

    const result = await agent.run('Calculate 2+2');
    expect(result).toContain('4');
  });

  it('should handle tool errors gracefully', async () => {
    const agent = createMockAgent();
    agent.registerTool(failingTool);

    const result = await agent.run('Use the failing tool');
    expect(result).toContain('error');
  });

  it('should respect maxIterations', async () => {
    const agent = createMockAgent({ maxIterations: 2 });
    agent.registerTool(infiniteLoopTool);

    await expect(agent.run('Loop forever')).rejects.toThrow('exceeded maximum iterations');
  });
});
```

---

## 总结

这个 Simple Agent 设计实现了：

1. **清晰的类型系统** - 完整的 TypeScript 类型定义
2. **模块化架构** - LLMClient、ToolManager、Agent 职责分离
3. **标准 Agent Loop** - 遵循图中的循环模式
4. **可扩展性** - 易于添加新工具和功能
5. **错误处理** - 优雅处理各种错误情况
6. **可观测性** - 支持 verbose 模式调试

这是一个**实验性**但**完整**的实现，可以作为理解 Agent 工作原理的基础，也可以作为更复杂 Agent 系统的起点。

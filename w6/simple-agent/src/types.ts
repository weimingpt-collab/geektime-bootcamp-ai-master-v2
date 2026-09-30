import type { z } from "zod"

// =============================================================================
// Message Types
// =============================================================================

export interface TextContent {
  type: "text"
  text: string
}

export interface ToolCallContent {
  type: "tool_call"
  id: string
  name: string
  arguments: unknown
}

export interface ToolResultContent {
  type: "tool_result"
  toolCallId: string
  result: string
  isError?: boolean
}

export type MessageContent = TextContent | ToolCallContent | ToolResultContent

export interface Message {
  id: string
  role: "user" | "assistant" | "tool"
  content: MessageContent[]
  createdAt: Date
}

// =============================================================================
// Tool Types
// =============================================================================

export type JSONSchema = Record<string, unknown>

export interface ToolResult {
  output: string
  metadata?: Record<string, unknown>
  error?: string
}

export interface Tool<TArgs = unknown> {
  name: string
  description: string
  parameters: JSONSchema
  execute: (args: TArgs, ctx: ExecutionContext) => Promise<ToolResult>
}

export interface ToolDefinition {
  name: string
  description: string
  parameters: JSONSchema
}

// =============================================================================
// Execution Context
// =============================================================================

export interface ExecutionContext {
  sessionId: string
  messageId: string
  abortSignal?: AbortSignal
}

// =============================================================================
// Session Types
// =============================================================================

export interface ModelConfig {
  model: string
  maxTokens?: number
  temperature?: number
}

export type SessionStatus = "idle" | "running" | "completed" | "error"

export interface Session {
  id: string
  messages: Message[]
  systemPrompt: string
  model: ModelConfig
  status: SessionStatus
}

// =============================================================================
// LLM Types
// =============================================================================

export interface LLMInput {
  model: string
  messages: Message[]
  systemPrompt: string
  tools: ToolDefinition[]
  maxTokens?: number
  temperature?: number
  abortSignal?: AbortSignal
}

export interface Usage {
  inputTokens: number
  outputTokens: number
}

export interface LLMOutput {
  content: MessageContent[]
  finishReason: "stop" | "tool_calls" | "max_tokens" | "error"
  usage: Usage
}

export type LLMEvent =
  | { type: "text_delta"; text: string }
  | { type: "tool_call_start"; id: string; name: string }
  | { type: "tool_call_delta"; id: string; arguments: string }
  | { type: "tool_call_end"; id: string; name: string; arguments: string }
  | { type: "finish"; reason: string; usage: Usage }
  | { type: "error"; error: Error }

// =============================================================================
// Agent Types
// =============================================================================

export interface AgentConfig {
  model: string
  systemPrompt: string
  tools?: Tool[]
  maxSteps?: number
  maxTokens?: number
  temperature?: number
  onEvent?: (event: AgentEvent) => void
}

export type AgentEvent =
  | { type: "message_start"; role: "assistant" | "tool" }
  | { type: "text"; text: string }
  | { type: "text_done"; text: string }
  | { type: "tool_call"; id: string; name: string; args: unknown }
  | {
      type: "tool_result"
      id: string
      name: string
      result: string
      isError?: boolean
    }
  | { type: "message_end"; finishReason: string }
  | { type: "step"; step: number; maxSteps: number }
  | { type: "error"; error: Error }

// =============================================================================
// MCP Types
// =============================================================================

export type MCPTransport = "stdio" | "sse"

export interface MCPServerConfig {
  name: string
  transport: MCPTransport
  command?: string
  args?: string[]
  url?: string
  env?: Record<string, string>
}

// =============================================================================
// Zod Schema Helper
// =============================================================================

export type ZodTool<T extends z.ZodType> = {
  name: string
  description: string
  schema: T
  execute: (args: z.infer<T>, ctx: ExecutionContext) => Promise<ToolResult>
}

// =============================================================================
// Utility Types
// =============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

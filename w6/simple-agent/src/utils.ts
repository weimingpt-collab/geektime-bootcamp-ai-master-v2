import { randomUUID } from "node:crypto"

export function generateId(): string {
  return randomUUID()
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class AgentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error,
  ) {
    super(message)
    this.name = "AgentError"
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ToolNotFoundError extends AgentError {
  constructor(toolName: string) {
    super(`Tool not found: ${toolName}`, "TOOL_NOT_FOUND")
  }
}

export class ToolExecutionError extends AgentError {
  constructor(toolName: string, cause: Error) {
    super(`Tool execution failed: ${toolName}`, "TOOL_EXECUTION_ERROR", cause)
  }
}

export class MaxStepsExceededError extends AgentError {
  constructor(maxSteps: number) {
    super(`Max steps exceeded: ${maxSteps}`, "MAX_STEPS_EXCEEDED")
  }
}

export class LLMError extends AgentError {
  constructor(message: string, cause?: Error) {
    super(message, "LLM_ERROR", cause)
  }
}

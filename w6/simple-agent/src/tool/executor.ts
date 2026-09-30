import type {
  ExecutionContext,
  ToolCallContent,
  ToolResultContent,
} from "../types.ts"
import type { ToolRegistry } from "./registry.ts"

export interface ExecutorOptions {
  timeout?: number
  onBeforeExecute?: (
    call: ToolCallContent,
    ctx: ExecutionContext,
  ) => Promise<void>
  onAfterExecute?: (
    call: ToolCallContent,
    result: ToolResultContent,
    ctx: ExecutionContext,
  ) => Promise<void>
}

export class ToolExecutor {
  constructor(
    private registry: ToolRegistry,
    private options: ExecutorOptions = {},
  ) {}

  async execute(
    call: ToolCallContent,
    ctx: ExecutionContext,
  ): Promise<ToolResultContent> {
    const tool = this.registry.get(call.name)

    if (!tool) {
      return {
        type: "tool_result",
        toolCallId: call.id,
        result: `Tool not found: ${call.name}`,
        isError: true,
      }
    }

    try {
      if (this.options.onBeforeExecute) {
        await this.options.onBeforeExecute(call, ctx)
      }

      const executeWithTimeout = async () => {
        if (this.options.timeout) {
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(
              () =>
                reject(
                  new Error(
                    `Tool execution timed out after ${this.options.timeout}ms`,
                  ),
                ),
              this.options.timeout,
            )
          })
          return Promise.race([
            tool.execute(call.arguments, ctx),
            timeoutPromise,
          ])
        }
        return tool.execute(call.arguments, ctx)
      }

      const result = await executeWithTimeout()

      const toolResult: ToolResultContent = {
        type: "tool_result",
        toolCallId: call.id,
        result: result.error ?? result.output,
        isError: !!result.error,
      }

      if (this.options.onAfterExecute) {
        await this.options.onAfterExecute(call, toolResult, ctx)
      }

      return toolResult
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      return {
        type: "tool_result",
        toolCallId: call.id,
        result: errorMessage,
        isError: true,
      }
    }
  }

  async executeAll(
    calls: ToolCallContent[],
    ctx: ExecutionContext,
  ): Promise<ToolResultContent[]> {
    return Promise.all(calls.map((call) => this.execute(call, ctx)))
  }

  async executeSequential(
    calls: ToolCallContent[],
    ctx: ExecutionContext,
  ): Promise<ToolResultContent[]> {
    const results: ToolResultContent[] = []
    for (const call of calls) {
      results.push(await this.execute(call, ctx))
    }
    return results
  }
}

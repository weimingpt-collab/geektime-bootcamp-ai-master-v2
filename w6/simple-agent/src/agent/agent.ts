import { LLMClient } from "../llm/client.ts"
import { addUserMessage, createSession } from "../session/session.ts"
import { ToolExecutor } from "../tool/executor.ts"
import { ToolRegistry } from "../tool/registry.ts"
import type {
  AgentConfig,
  AgentEvent,
  Message,
  MessageContent,
  Session,
  Tool,
  ToolCallContent,
} from "../types.ts"
import { generateId, MaxStepsExceededError } from "../utils.ts"

const DEFAULT_MAX_STEPS = 100
const DEFAULT_MODEL = "gpt-5-mini"

export class Agent {
  private llm: LLMClient
  private registry: ToolRegistry
  private executor: ToolExecutor
  private config: Required<
    Pick<AgentConfig, "model" | "systemPrompt" | "maxSteps">
  > &
    Omit<AgentConfig, "model" | "systemPrompt" | "maxSteps" | "tools">

  constructor(config: AgentConfig) {
    this.llm = new LLMClient()
    this.registry = new ToolRegistry()
    this.executor = new ToolExecutor(this.registry)

    if (config.tools) {
      this.registry.registerMany(config.tools)
    }

    this.config = {
      model: config.model || DEFAULT_MODEL,
      systemPrompt: config.systemPrompt || "",
      maxSteps: config.maxSteps ?? DEFAULT_MAX_STEPS,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      onEvent: config.onEvent,
    }
  }

  registerTool(tool: Tool): this {
    this.registry.register(tool)
    return this
  }

  registerTools(tools: Tool[]): this {
    this.registry.registerMany(tools)
    return this
  }

  unregisterTool(name: string): this {
    this.registry.unregister(name)
    return this
  }

  getTools(): Tool[] {
    return this.registry.list()
  }

  createSession(options?: { systemPrompt?: string }): Session {
    return createSession({
      systemPrompt: options?.systemPrompt ?? this.config.systemPrompt,
      model: this.config.model,
    })
  }

  async run(session: Session, userMessage: string): Promise<Message[]> {
    addUserMessage(session, userMessage)
    session.status = "running"

    try {
      let step = 0

      while (step < this.config.maxSteps) {
        step++
        this.emit({ type: "step", step, maxSteps: this.config.maxSteps })

        const response = await this.llm.call({
          model: this.config.model,
          messages: session.messages,
          systemPrompt: session.systemPrompt,
          tools: this.registry.toToolDefinitions(),
          maxTokens: this.config.maxTokens,
          temperature: this.config.temperature,
        })

        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: response.content,
          createdAt: new Date(),
        }
        session.messages.push(assistantMessage)

        this.emit({ type: "message_start", role: "assistant" })

        for (const content of response.content) {
          if (content.type === "text") {
            this.emit({ type: "text", text: content.text })
            this.emit({ type: "text_done", text: content.text })
          }
        }

        const toolCalls = response.content.filter(
          (c): c is ToolCallContent => c.type === "tool_call",
        )

        if (toolCalls.length === 0) {
          this.emit({
            type: "message_end",
            finishReason: response.finishReason,
          })
          break
        }

        for (const call of toolCalls) {
          this.emit({
            type: "tool_call",
            id: call.id,
            name: call.name,
            args: call.arguments,
          })
        }

        const results = await this.executor.executeAll(toolCalls, {
          sessionId: session.id,
          messageId: assistantMessage.id,
        })

        const toolMessage: Message = {
          id: generateId(),
          role: "tool",
          content: results,
          createdAt: new Date(),
        }
        session.messages.push(toolMessage)

        this.emit({ type: "message_start", role: "tool" })
        for (const result of results) {
          const call = toolCalls.find((c) => c.id === result.toolCallId)
          this.emit({
            type: "tool_result",
            id: result.toolCallId,
            name: call?.name ?? "unknown",
            result: result.result,
            isError: result.isError,
          })
        }
        this.emit({ type: "message_end", finishReason: "tool_results" })
      }

      if (step >= this.config.maxSteps) {
        throw new MaxStepsExceededError(this.config.maxSteps)
      }

      session.status = "completed"
      return session.messages
    } catch (error) {
      session.status = "error"
      this.emit({
        type: "error",
        error: error instanceof Error ? error : new Error(String(error)),
      })
      throw error
    }
  }

  async *stream(
    session: Session,
    userMessage: string,
  ): AsyncGenerator<AgentEvent> {
    addUserMessage(session, userMessage)
    session.status = "running"

    try {
      let step = 0

      while (step < this.config.maxSteps) {
        step++
        yield { type: "step", step, maxSteps: this.config.maxSteps }
        yield { type: "message_start", role: "assistant" }

        const content: MessageContent[] = []
        const toolCalls: ToolCallContent[] = []
        let currentText = ""
        const toolCallBuffers = new Map<
          string,
          { id: string; name: string; arguments: string }
        >()

        for await (const event of this.llm.stream({
          model: this.config.model,
          messages: session.messages,
          systemPrompt: session.systemPrompt,
          tools: this.registry.toToolDefinitions(),
          maxTokens: this.config.maxTokens,
          temperature: this.config.temperature,
        })) {
          switch (event.type) {
            case "text_delta":
              currentText += event.text
              yield { type: "text", text: event.text }
              break

            case "tool_call_start":
              toolCallBuffers.set(event.id, {
                id: event.id,
                name: event.name,
                arguments: "",
              })
              break

            case "tool_call_delta":
              {
                const buffer = toolCallBuffers.get(event.id)
                if (buffer) {
                  buffer.arguments += event.arguments
                }
              }
              break

            case "tool_call_end":
              {
                let args: unknown
                try {
                  args = JSON.parse(event.arguments)
                } catch {
                  args = event.arguments
                }

                const toolCall: ToolCallContent = {
                  type: "tool_call",
                  id: event.id,
                  name: event.name,
                  arguments: args,
                }
                toolCalls.push(toolCall)
                yield {
                  type: "tool_call",
                  id: event.id,
                  name: event.name,
                  args,
                }
              }
              break

            case "finish":
              if (currentText) {
                content.push({ type: "text", text: currentText })
                yield { type: "text_done", text: currentText }
              }
              yield { type: "message_end", finishReason: event.reason }
              break

            case "error":
              yield { type: "error", error: event.error }
              throw event.error
          }
        }

        content.push(...toolCalls)

        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content,
          createdAt: new Date(),
        }
        session.messages.push(assistantMessage)

        if (toolCalls.length === 0) {
          break
        }

        const results = await this.executor.executeAll(toolCalls, {
          sessionId: session.id,
          messageId: assistantMessage.id,
        })

        const toolMessage: Message = {
          id: generateId(),
          role: "tool",
          content: results,
          createdAt: new Date(),
        }
        session.messages.push(toolMessage)

        yield { type: "message_start", role: "tool" }
        for (const result of results) {
          const call = toolCalls.find((c) => c.id === result.toolCallId)
          yield {
            type: "tool_result",
            id: result.toolCallId,
            name: call?.name ?? "unknown",
            result: result.result,
            isError: result.isError,
          }
        }
        yield { type: "message_end", finishReason: "tool_results" }
      }

      if (step >= this.config.maxSteps) {
        throw new MaxStepsExceededError(this.config.maxSteps)
      }

      session.status = "completed"
    } catch (error) {
      session.status = "error"
      yield {
        type: "error",
        error: error instanceof Error ? error : new Error(String(error)),
      }
      throw error
    }
  }

  private emit(event: AgentEvent): void {
    this.config.onEvent?.(event)
  }
}

export function createAgent(config: AgentConfig): Agent {
  return new Agent(config)
}

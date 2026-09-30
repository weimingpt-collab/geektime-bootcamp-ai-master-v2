import OpenAI from "openai"
import type {
  LLMEvent,
  LLMInput,
  LLMOutput,
  MessageContent,
  TextContent,
  ToolCallContent,
  ToolResultContent,
  Usage,
} from "../types.ts"
import { LLMError } from "../utils.ts"

const DEFAULT_MODEL = "gpt-5-mini"
const DEFAULT_MAX_TOKENS = 4096

type ResponseInputItem =
  | OpenAI.Responses.EasyInputMessage
  | OpenAI.Responses.ResponseInputItem

export class LLMClient {
  private client: OpenAI

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey ?? process.env.OPENAI_API_KEY,
    })
  }

  async call(input: LLMInput): Promise<LLMOutput> {
    try {
      const inputItems = this.convertToResponseInput(input.messages)
      const tools = this.convertToolsForResponses(input.tools)

      const params: OpenAI.Responses.ResponseCreateParams = {
        model: input.model || DEFAULT_MODEL,
        input: inputItems,
        max_output_tokens: input.maxTokens ?? DEFAULT_MAX_TOKENS,
      }

      if (input.systemPrompt) {
        params.instructions = input.systemPrompt
      }

      if (tools.length > 0) {
        params.tools = tools
      }

      if (input.temperature !== undefined) {
        params.temperature = input.temperature
      }

      const response = await this.client.responses.create(params)

      const content = this.parseResponseOutput(response)
      const finishReason = this.mapResponseStatus(
        response.status ?? "completed",
      )

      return {
        content,
        finishReason,
        usage: {
          inputTokens: response.usage?.input_tokens ?? 0,
          outputTokens: response.usage?.output_tokens ?? 0,
        },
      }
    } catch (error) {
      if (error instanceof LLMError) throw error
      throw new LLMError(
        `LLM call failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined,
      )
    }
  }

  async *stream(input: LLMInput): AsyncGenerator<LLMEvent> {
    try {
      const inputItems = this.convertToResponseInput(input.messages)
      const tools = this.convertToolsForResponses(input.tools)

      const params: OpenAI.Responses.ResponseCreateParams = {
        model: input.model || DEFAULT_MODEL,
        input: inputItems,
        max_output_tokens: input.maxTokens ?? DEFAULT_MAX_TOKENS,
        stream: true,
      }

      if (input.systemPrompt) {
        params.instructions = input.systemPrompt
      }

      if (tools.length > 0) {
        params.tools = tools
      }

      if (input.temperature !== undefined) {
        params.temperature = input.temperature
      }

      const stream = await this.client.responses.create(params)

      const toolCalls = new Map<
        string,
        { id: string; name: string; arguments: string }
      >()
      let usage: Usage = { inputTokens: 0, outputTokens: 0 }
      let finishReason = "stop"

      for await (const event of stream) {
        if (event.type === "response.output_text.delta") {
          yield { type: "text_delta", text: event.delta }
        }

        if (event.type === "response.function_call_arguments.delta") {
          const callId = event.item_id
          let existing = toolCalls.get(callId)
          if (!existing) {
            existing = { id: callId, name: "", arguments: "" }
            toolCalls.set(callId, existing)
          }
          existing.arguments += event.delta
          yield {
            type: "tool_call_delta",
            id: callId,
            arguments: event.delta,
          }
        }

        if (event.type === "response.output_item.added") {
          const item = event.item
          if (item.type === "function_call") {
            const callId = item.id ?? ""
            toolCalls.set(callId, {
              id: item.call_id ?? callId,
              name: item.name ?? "",
              arguments: "",
            })
            yield {
              type: "tool_call_start",
              id: item.call_id ?? callId,
              name: item.name ?? "",
            }
          }
        }

        if (event.type === "response.output_item.done") {
          const item = event.item
          if (item.type === "function_call") {
            const callId = item.id ?? ""
            const existing = toolCalls.get(callId)
            if (existing) {
              existing.name = item.name ?? existing.name
              existing.arguments = item.arguments ?? existing.arguments
              yield {
                type: "tool_call_end",
                id: existing.id,
                name: existing.name,
                arguments: existing.arguments,
              }
            }
          }
        }

        if (event.type === "response.completed") {
          finishReason = this.mapResponseStatus(
            event.response.status ?? "completed",
          )
          usage = {
            inputTokens: event.response.usage?.input_tokens ?? 0,
            outputTokens: event.response.usage?.output_tokens ?? 0,
          }
        }
      }

      yield { type: "finish", reason: finishReason, usage }
    } catch (error) {
      yield {
        type: "error",
        error: error instanceof Error ? error : new Error(String(error)),
      }
    }
  }

  private convertToResponseInput(
    messages: LLMInput["messages"],
  ): ResponseInputItem[] {
    const result: ResponseInputItem[] = []

    for (const msg of messages) {
      if (msg.role === "user") {
        const textContent = msg.content
          .filter((c): c is TextContent => c.type === "text")
          .map((c) => c.text)
          .join("\n")

        if (textContent) {
          result.push({
            role: "user",
            content: textContent,
          })
        }
      } else if (msg.role === "assistant") {
        const textParts = msg.content
          .filter((c): c is TextContent => c.type === "text")
          .map((c) => c.text)

        const toolCalls = msg.content.filter(
          (c): c is ToolCallContent => c.type === "tool_call",
        )

        if (textParts.length > 0) {
          result.push({
            role: "assistant",
            content: textParts.join("\n"),
          })
        }

        for (const tc of toolCalls) {
          const fcItem: ResponseInputItem = {
            type: "function_call",
            call_id: tc.id,
            name: tc.name,
            arguments:
              typeof tc.arguments === "string"
                ? tc.arguments
                : JSON.stringify(tc.arguments),
          }
          result.push(fcItem)
        }
      } else if (msg.role === "tool") {
        for (const content of msg.content) {
          if (content.type === "tool_result") {
            const tr = content as ToolResultContent
            result.push({
              type: "function_call_output",
              call_id: tr.toolCallId,
              output: tr.result,
            })
          }
        }
      }
    }

    return result
  }

  private convertToolsForResponses(
    tools: LLMInput["tools"],
  ): OpenAI.Responses.Tool[] {
    return tools.map((tool) => ({
      type: "function" as const,
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters as Record<string, unknown>,
      strict: false,
    }))
  }

  private parseResponseOutput(
    response: OpenAI.Responses.Response,
  ): MessageContent[] {
    const content: MessageContent[] = []

    for (const item of response.output) {
      if (item.type === "message") {
        for (const part of item.content) {
          if (part.type === "output_text") {
            content.push({ type: "text", text: part.text })
          }
        }
      } else if (item.type === "function_call") {
        let args: unknown
        try {
          args = JSON.parse(item.arguments ?? "{}")
        } catch {
          args = item.arguments
        }

        content.push({
          type: "tool_call",
          id: item.call_id ?? item.id ?? "",
          name: item.name ?? "",
          arguments: args,
        })
      }
    }

    return content
  }

  private mapResponseStatus(status: string): LLMOutput["finishReason"] {
    switch (status) {
      case "completed":
        return "stop"
      case "incomplete":
        return "max_tokens"
      case "failed":
        return "error"
      default:
        return "stop"
    }
  }
}

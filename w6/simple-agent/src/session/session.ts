import type { Message, ModelConfig, Session, SessionStatus } from "../types.ts"
import { generateId } from "../utils.ts"

export interface CreateSessionOptions {
  systemPrompt?: string
  model?: string | ModelConfig
  messages?: Message[]
}

export function createSession(options: CreateSessionOptions = {}): Session {
  const modelConfig: ModelConfig =
    typeof options.model === "string"
      ? { model: options.model }
      : (options.model ?? { model: "gpt-5-mini" })

  return {
    id: generateId(),
    messages: options.messages ?? [],
    systemPrompt: options.systemPrompt ?? "",
    model: modelConfig,
    status: "idle",
  }
}

export function addUserMessage(session: Session, text: string): Message {
  const message: Message = {
    id: generateId(),
    role: "user",
    content: [{ type: "text", text }],
    createdAt: new Date(),
  }
  session.messages.push(message)
  return message
}

export function updateSessionStatus(
  session: Session,
  status: SessionStatus,
): void {
  session.status = status
}

export function clearSessionMessages(session: Session): void {
  session.messages = []
}

export function getLastAssistantMessage(session: Session): Message | undefined {
  for (let i = session.messages.length - 1; i >= 0; i--) {
    const msg = session.messages[i]
    if (msg?.role === "assistant") {
      return msg
    }
  }
  return undefined
}

export function getTextContent(message: Message): string {
  return message.content
    .filter((c) => c.type === "text")
    .map((c) => (c as { type: "text"; text: string }).text)
    .join("\n")
}

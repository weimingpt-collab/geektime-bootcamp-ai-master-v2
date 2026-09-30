export interface MessageInfo {
  id: string
  sessionID: string
  role: "user" | "assistant"
  time: { created: number; completed?: number }
  agent?: string
  model?: { providerID: string; modelID: string }
  modelID?: string
  providerID?: string
  cost?: number
  tokens?: {
    input: number
    output: number
    reasoning: number
    cache?: { read: number; write: number }
  }
  finish?: string
  error?: { name: string; data: unknown }
  parentID?: string
}

export interface TextPart {
  id: string
  type: "text"
  text: string
  time?: { start: number; end: number }
}

export interface ToolInvocationPart {
  id: string
  type: "tool-invocation"
  tool: string
  input: unknown
  output?: unknown
  state: string
}

export interface ToolPart {
  id: string
  type: "tool"
  tool: string
  callID?: string
  state: {
    status: string
    input?: unknown
    output?: unknown
  }
}

export interface StepStartPart {
  id: string
  type: "step-start"
  snapshot?: string
}

export interface StepFinishPart {
  id: string
  type: "step-finish"
  reason: string
  cost?: number
  tokens?: {
    input: number
    output: number
    reasoning: number
    cache?: { read: number; write: number }
  }
}

export interface ThinkingPart {
  id: string
  type: "thinking"
  text: string
}

export interface UnknownPart {
  id: string
  type: string
  [key: string]: unknown
}

export type KnownPart = TextPart | ToolInvocationPart | ToolPart | StepStartPart | StepFinishPart | ThinkingPart
export type Part = KnownPart | UnknownPart

export interface MessageWithParts {
  info: MessageInfo
  parts: Part[]
}

export interface TurnStart {
  type: "turn_start"
  timestamp: string
  sessionID: string
  conversationID: string
  turnIndex: number
  input: {
    system: string[]
    messages: MessageWithParts[]
  }
}

export interface TurnComplete {
  type: "turn_complete"
  timestamp: string
  sessionID: string
  conversationID: string
  turnIndex: number
  output: {
    message: MessageInfo
    parts: Part[]
    error?: string
  }
}

export type TurnEntry = TurnStart | TurnComplete

export interface Turn {
  turnIndex: number
  input?: TurnStart
  output?: TurnComplete
}

export interface Conversation {
  sessionID: string
  conversationID: string
  turns: Turn[]
}

/**
 * OpenCode Conversation Logger Plugin
 *
 * This plugin captures complete LLM input/output for each conversation.
 * Each conversation (user input -> agent multi-turn tool calls -> final result)
 * gets its own JSONL file.
 *
 * File naming: {sessionID}_{conversationID}.jsonl
 * - conversationID is generated when user sends a new message
 * - All turns within that conversation are appended to the same file
 *
 * Data structure per line in JSONL:
 * - type: "turn_start" | "turn_complete"
 * - timestamp: ISO timestamp
 * - sessionID: session identifier
 * - conversationID: unique ID for this conversation
 * - turnIndex: sequential turn number within the conversation
 * - input: { system: string[], messages: Message[] }  (for turn_start)
 * - output: { message: AssistantMessage, parts: Part[] } (for turn_complete)
 */

import type { Plugin, Hooks } from "@opencode-ai/plugin"
import { appendFileSync, mkdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { randomUUID } from "crypto"

// Generate short UUID (first 8 characters)
function shortUUID(): string {
  return randomUUID().replace(/-/g, "").slice(0, 8)
}

// Track pending turns per session
interface PendingTurn {
  turnIndex: number
  startTime: string
  system: string[]
  messages: any[]
}

// Track session state
interface SessionState {
  currentConversationID: string
  turnCounter: number
  pendingTurn?: PendingTurn
  lastAssistantMessageID?: string
}

const sessionStates = new Map<string, SessionState>()

function getSessionState(sessionID: string): SessionState {
  let state = sessionStates.get(sessionID)
  if (!state) {
    state = {
      currentConversationID: shortUUID(),
      turnCounter: 0,
    }
    sessionStates.set(sessionID, state)
  }
  return state
}

// Start a new conversation (called when user sends a message)
function startNewConversation(sessionID: string): SessionState {
  const state = getSessionState(sessionID)
  state.currentConversationID = shortUUID()
  state.turnCounter = 0
  state.pendingTurn = undefined
  state.lastAssistantMessageID = undefined
  return state
}

export default (async (pluginInput) => {
  const logsDir = join(pluginInput.directory, "logs")

  // Ensure logs directory exists
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true })
  }

  const getLogFile = (sessionID: string, conversationID: string): string => {
    // Sanitize IDs for filename
    const safeSessionID = sessionID.replace(/[^a-zA-Z0-9_-]/g, "_")
    const safeConvID = conversationID.replace(/[^a-zA-Z0-9_-]/g, "_")
    return join(logsDir, `${safeSessionID}_${safeConvID}.jsonl`)
  }

  const appendLog = (sessionID: string, conversationID: string, data: any): void => {
    const file = getLogFile(sessionID, conversationID)
    const dir = dirname(file)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    appendFileSync(file, JSON.stringify(data) + "\n")
  }

  // Store system prompt temporarily (called before messages.transform)
  let pendingSystem: string[] = []

  return {
    // Called when user sends a new message - start new conversation
    "chat.message": async (input, _output) => {
      const sessionID = input.sessionID
      if (!sessionID) return

      // Start a new conversation for this user message
      startNewConversation(sessionID)
    },

    // Capture system prompt (called before messages.transform)
    "experimental.chat.system.transform": async (_input, output) => {
      pendingSystem = [...output.system]
    },

    // Capture complete messages array (the full input to LLM)
    "experimental.chat.messages.transform": async (_input, output) => {
      if (output.messages.length === 0) return

      // Get sessionID from the first message
      const firstMsg = output.messages[0]
      const sessionID = firstMsg?.info?.sessionID
      if (!sessionID) return

      const state = getSessionState(sessionID)
      state.turnCounter++

      // Create pending turn record
      state.pendingTurn = {
        turnIndex: state.turnCounter,
        startTime: new Date().toISOString(),
        system: pendingSystem,
        messages: output.messages.map((m) => ({
          info: m.info,
          parts: m.parts,
        })),
      }

      // Log the turn input
      appendLog(sessionID, state.currentConversationID, {
        type: "turn_start",
        timestamp: state.pendingTurn.startTime,
        sessionID,
        conversationID: state.currentConversationID,
        turnIndex: state.turnCounter,
        input: {
          system: pendingSystem,
          messages: output.messages.map((m) => ({
            info: m.info,
            parts: m.parts,
          })),
        },
      })

      // Reset pending system
      pendingSystem = []
    },

    // Listen to events to capture output
    event: async ({ event }) => {
      // Handle message.updated events for assistant messages
      if (event.type === "message.updated") {
        const info = (event.properties as any)?.info
        if (!info || info.role !== "assistant") return

        const sessionID = info.sessionID
        if (!sessionID) return

        const state = getSessionState(sessionID)

        // Check if this assistant message is completed
        if (info.time?.completed) {
          // Only log if we haven't already logged this message
          if (state.lastAssistantMessageID === info.id) return
          state.lastAssistantMessageID = info.id

          // Fetch the parts for this message using the SDK
          try {
            const msgData = await pluginInput.client.session.message({
              path: { id: sessionID, messageID: info.id },
            })

            if (msgData.data) {
              const turnIndex = state.pendingTurn?.turnIndex ?? state.turnCounter

              appendLog(sessionID, state.currentConversationID, {
                type: "turn_complete",
                timestamp: new Date().toISOString(),
                sessionID,
                conversationID: state.currentConversationID,
                turnIndex,
                output: {
                  message: info,
                  parts: msgData.data.parts,
                },
              })

              // Clear pending turn
              state.pendingTurn = undefined
            }
          } catch (err) {
            // If SDK call fails, log what we have
            const turnIndex = state.pendingTurn?.turnIndex ?? state.turnCounter

            appendLog(sessionID, state.currentConversationID, {
              type: "turn_complete",
              timestamp: new Date().toISOString(),
              sessionID,
              conversationID: state.currentConversationID,
              turnIndex,
              output: {
                message: info,
                parts: [],
                error: String(err),
              },
            })

            state.pendingTurn = undefined
          }
        }
      }
    },
  } satisfies Hooks
}) satisfies Plugin

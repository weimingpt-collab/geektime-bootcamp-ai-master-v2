/**
 * Basic Agent Example
 *
 * This example demonstrates the simplest usage of the agent SDK.
 * The agent responds to user messages without any tools.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-xxx pnpm example:basic
 */

import { createAgent } from "../src/index.ts"

async function main() {
  // Create an agent with a simple system prompt
  const agent = createAgent({
    model: "gpt-5-mini",
    systemPrompt: "You are a helpful assistant. Be concise and friendly.",
  })

  // Create a new session
  const session = agent.createSession()

  console.log("=== Basic Agent Example ===\n")

  // Run the agent with a user message
  const messages = await agent.run(
    session,
    "Hello! Can you explain what an AI agent is in one sentence?"
  )

  // Get the last assistant message
  const lastMessage = messages[messages.length - 1]
  if (lastMessage && lastMessage.role === "assistant") {
    for (const content of lastMessage.content) {
      if (content.type === "text") {
        console.log("Assistant:", content.text)
      }
    }
  }

  console.log("\n=== Session Complete ===")
  console.log(`Total messages: ${session.messages.length}`)
  console.log(`Session status: ${session.status}`)
}

main().catch(console.error)

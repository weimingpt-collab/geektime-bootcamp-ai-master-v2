/**
 * Streaming Example
 *
 * This example demonstrates how to use the streaming API
 * for real-time output from the agent.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-xxx pnpm example:streaming
 */

import { createAgent, defineTool } from "../src/index.ts"

const fetchDataTool = defineTool({
  name: "fetch_data",
  description: "Fetch data from a simulated API endpoint",
  parameters: {
    type: "object",
    properties: {
      endpoint: {
        type: "string",
        description: "The API endpoint to fetch from",
      },
    },
    required: ["endpoint"],
  },
  execute: async (args) => {
    const { endpoint } = args as { endpoint: string }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const data = {
      endpoint,
      status: "success",
      data: {
        users: 1234,
        activeToday: 456,
        revenue: "$12,345",
      },
      timestamp: new Date().toISOString(),
    }

    return {
      output: JSON.stringify(data, null, 2),
    }
  },
})

async function main() {
  const agent = createAgent({
    model: "gpt-5-mini",
    systemPrompt: `You are a data analyst assistant.
You can fetch data from various endpoints and analyze it.
Be concise but thorough in your analysis.`,
    tools: [fetchDataTool],
  })

  const session = agent.createSession()

  console.log("=== Streaming Example ===\n")
  console.log("User: Fetch the user analytics data and give me a summary.\n")
  process.stdout.write("Assistant: ")

  // Use streaming API
  for await (const event of agent.stream(
    session,
    "Fetch the user analytics data from /api/analytics and give me a summary."
  )) {
    switch (event.type) {
      case "text":
        // Print text as it streams in
        process.stdout.write(event.text)
        break

      case "tool_call":
        console.log(`\n\n[Calling tool: ${event.name}]`)
        console.log(`Arguments: ${JSON.stringify(event.args)}`)
        break

      case "tool_result":
        console.log(`[Tool result received]`)
        process.stdout.write("\nAssistant: ")
        break

      case "message_end":
        if (event.finishReason !== "tool_results") {
          console.log("\n")
        }
        break

      case "error":
        console.error("\nError:", event.error.message)
        break
    }
  }

  console.log("=== Stream Complete ===")
  console.log(`Total messages: ${session.messages.length}`)
}

main().catch(console.error)

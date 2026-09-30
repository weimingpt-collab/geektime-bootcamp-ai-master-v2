/**
 * Custom Tools Example
 *
 * This example demonstrates how to create and register custom tools
 * with the agent. The agent can use these tools to perform actions.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-xxx pnpm example:tools
 */

import { createAgent, defineTool } from "../src/index.ts"

// Define a weather tool
const getWeatherTool = defineTool({
  name: "get_weather",
  description: "Get the current weather for a location",
  parameters: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "The city name, e.g., 'Tokyo', 'New York'",
      },
      unit: {
        type: "string",
        enum: ["celsius", "fahrenheit"],
        description: "Temperature unit",
      },
    },
    required: ["location"],
  },
  execute: async (args) => {
    const { location, unit = "celsius" } = args as {
      location: string
      unit?: string
    }

    // Simulate weather API call
    const weather = {
      location,
      temperature: unit === "celsius" ? 22 : 72,
      unit,
      condition: "sunny",
      humidity: 65,
    }

    return {
      output: JSON.stringify(weather, null, 2),
    }
  },
})

// Define a calculator tool
const calculatorTool = defineTool({
  name: "calculator",
  description: "Perform basic arithmetic calculations",
  parameters: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["add", "subtract", "multiply", "divide"],
        description: "The arithmetic operation to perform",
      },
      a: {
        type: "number",
        description: "First operand",
      },
      b: {
        type: "number",
        description: "Second operand",
      },
    },
    required: ["operation", "a", "b"],
  },
  execute: async (args) => {
    const { operation, a, b } = args as {
      operation: string
      a: number
      b: number
    }

    let result: number
    switch (operation) {
      case "add":
        result = a + b
        break
      case "subtract":
        result = a - b
        break
      case "multiply":
        result = a * b
        break
      case "divide":
        if (b === 0) {
          return { output: "", error: "Division by zero is not allowed" }
        }
        result = a / b
        break
      default:
        return { output: "", error: `Unknown operation: ${operation}` }
    }

    return {
      output: `${a} ${operation} ${b} = ${result}`,
    }
  },
})

// Define a search tool
const searchTool = defineTool({
  name: "search",
  description: "Search for information on the web",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query",
      },
      limit: {
        type: "number",
        description: "Maximum number of results to return",
      },
    },
    required: ["query"],
  },
  execute: async (args) => {
    const { query, limit = 3 } = args as { query: string; limit?: number }

    // Simulate search results
    const results = [
      { title: `Result 1 for "${query}"`, url: "https://example.com/1" },
      { title: `Result 2 for "${query}"`, url: "https://example.com/2" },
      { title: `Result 3 for "${query}"`, url: "https://example.com/3" },
    ].slice(0, limit)

    return {
      output: JSON.stringify(results, null, 2),
      metadata: { totalResults: 1000, query },
    }
  },
})

async function main() {
  // Create an agent with custom tools
  const agent = createAgent({
    model: "gpt-5-mini",
    systemPrompt: `You are a helpful assistant with access to tools.
Use the tools when needed to answer user questions.
Always explain what you're doing when using tools.`,
    tools: [getWeatherTool, calculatorTool, searchTool],
    onEvent: (event) => {
      // Log events for debugging
      switch (event.type) {
        case "tool_call":
          console.log(`\n[Tool Call] ${event.name}(${JSON.stringify(event.args)})`)
          break
        case "tool_result":
          console.log(`[Tool Result] ${event.name}: ${event.result.slice(0, 100)}...`)
          break
      }
    },
  })

  const session = agent.createSession()

  console.log("=== Custom Tools Example ===\n")

  // Example 1: Weather query
  console.log("User: What's the weather like in Tokyo?\n")
  await agent.run(session, "What's the weather like in Tokyo?")

  const lastMsg = session.messages[session.messages.length - 1]
  if (lastMsg?.role === "assistant") {
    for (const c of lastMsg.content) {
      if (c.type === "text") console.log("\nAssistant:", c.text)
    }
  }

  console.log("\n--- Next Question ---\n")

  // Example 2: Calculation
  console.log("User: What is 42 multiplied by 17?\n")
  await agent.run(session, "What is 42 multiplied by 17?")

  const lastMsg2 = session.messages[session.messages.length - 1]
  if (lastMsg2?.role === "assistant") {
    for (const c of lastMsg2.content) {
      if (c.type === "text") console.log("\nAssistant:", c.text)
    }
  }

  console.log("\n=== Session Complete ===")
  console.log(`Total messages: ${session.messages.length}`)
}

main().catch(console.error)

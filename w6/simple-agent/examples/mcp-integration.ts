/**
 * MCP Integration Example
 *
 * This example demonstrates how to integrate MCP (Model Context Protocol)
 * servers with the agent. MCP allows you to dynamically load tools from
 * external servers.
 *
 * Prerequisites:
 *   - Install an MCP server, e.g., `npx -y @anthropic-ai/mcp-demo-server`
 *   - Or use the filesystem MCP server: `npx -y @anthropic-ai/mcp-filesystem-server <path>`
 *
 * Usage:
 *   OPENAI_API_KEY=sk-xxx pnpm example:mcp
 */

import { createAgent, createMCPManager, type Tool } from "../src/index.ts"

async function main() {
  console.log("=== MCP Integration Example ===\n")

  // Create an MCP manager to handle multiple MCP servers
  const mcpManager = createMCPManager()

  try {
    // Connect to an MCP server
    // This example uses the filesystem MCP server
    console.log("Connecting to MCP server...")

    const tools = await mcpManager.addServer({
      name: "filesystem",
      transport: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"],
    })

    console.log(`Connected! Found ${tools.length} tools:`)
    for (const tool of tools) {
      console.log(`  - ${tool.name}: ${tool.description}`)
    }
    console.log()

    // Create an agent with MCP tools
    const agent = createAgent({
      model: "gpt-5-mini",
      systemPrompt: `You are a helpful file system assistant.
You can read, write, and manage files in the allowed directory.
Do not ask for confirmation before making changes.`,
      tools,
      onEvent: (event) => {
        switch (event.type) {
          case "tool_call":
            console.log(`\n[MCP Tool Call] ${event.name}`)
            console.log(`Arguments: ${JSON.stringify(event.args, null, 2)}`)
            break
          case "tool_result":
            if (event.isError) {
              console.log(`[Error] ${event.result}`)
            } else {
              console.log(`[Result] ${event.result.slice(0, 200)}...`)
            }
            break
        }
      },
    })

    const session = agent.createSession()

    // Example: List files in /tmp
    console.log("User: List the files in /tmp directory\n")

    await agent.run(session, "List the files in /tmp directory")

    const lastMsg = session.messages[session.messages.length - 1]
    if (lastMsg?.role === "assistant") {
      for (const c of lastMsg.content) {
        if (c.type === "text") {
          console.log("\nAssistant:", c.text)
        }
      }
    }

    console.log("\n--- Next Task ---\n")

    // Example: Create a file
    console.log("User: Create a file called test.txt with 'Hello from Agent!'\n")

    await agent.run(
      session,
      "Create a file called test.txt in allowed directory with the content 'Hello from Agent!'"
    )

    const lastMsg2 = session.messages[session.messages.length - 1]
    if (lastMsg2?.role === "assistant") {
      for (const c of lastMsg2.content) {
        if (c.type === "text") {
          console.log("\nAssistant:", c.text)
        }
      }
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("ENOENT")
    ) {
      console.log("\nNote: MCP server not found. To run this example:")
      console.log("1. Make sure npx is available")
      console.log("2. The @modelcontextprotocol/server-filesystem will be auto-installed")
      console.log("\nAlternatively, try a different MCP server.")
    } else {
      throw error
    }
  } finally {
    // Always disconnect MCP servers
    await mcpManager.disconnectAll()
    console.log("\n=== MCP Servers Disconnected ===")
  }
}

main().catch(console.error)

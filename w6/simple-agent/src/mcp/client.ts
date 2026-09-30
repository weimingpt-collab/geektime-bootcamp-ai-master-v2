import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import type { MCPServerConfig, Tool, ToolResult } from "../types.ts"

interface MCPToolDefinition {
  name: string
  description?: string
  inputSchema: Record<string, unknown>
}

export class MCPClient {
  private client: Client
  private transport: StdioClientTransport | SSEClientTransport | null = null
  private config: MCPServerConfig
  private connected = false

  constructor(config: MCPServerConfig) {
    this.config = config
    this.client = new Client(
      {
        name: "simple-agent",
        version: "1.0.0",
      },
      {
        capabilities: {},
      },
    )
  }

  async connect(): Promise<void> {
    if (this.connected) return

    if (this.config.transport === "stdio") {
      if (!this.config.command) {
        throw new Error("Command is required for stdio transport")
      }

      const transportParams: {
        command: string
        args: string[]
        env?: Record<string, string>
      } = {
        command: this.config.command,
        args: this.config.args ?? [],
      }

      if (this.config.env) {
        transportParams.env = this.config.env
      }

      this.transport = new StdioClientTransport(transportParams)
    } else if (this.config.transport === "sse") {
      if (!this.config.url) {
        throw new Error("URL is required for SSE transport")
      }

      this.transport = new SSEClientTransport(new URL(this.config.url))
    } else {
      throw new Error(`Unsupported transport: ${this.config.transport}`)
    }

    await this.client.connect(this.transport)
    this.connected = true
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return

    await this.client.close()
    this.connected = false
    this.transport = null
  }

  async listTools(): Promise<Tool[]> {
    if (!this.connected) {
      throw new Error("MCP client is not connected")
    }

    const response = await this.client.listTools()
    return response.tools.map((tool) =>
      this.adaptTool({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema as Record<string, unknown>,
      }),
    )
  }

  async callTool(name: string, args: unknown): Promise<ToolResult> {
    if (!this.connected) {
      throw new Error("MCP client is not connected")
    }

    try {
      const result = await this.client.callTool({
        name,
        arguments: args as Record<string, unknown>,
      })

      const content = result.content
      let output = ""

      if (Array.isArray(content)) {
        output = content
          .map((c) => {
            if (typeof c === "object" && c !== null && "text" in c) {
              return (c as { text: string }).text
            }
            return JSON.stringify(c)
          })
          .join("\n")
      } else {
        output = JSON.stringify(content)
      }

      const toolResult: ToolResult = {
        output,
      }

      if (result.isError) {
        toolResult.error = output
      }

      return toolResult
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  private adaptTool(mcpTool: MCPToolDefinition): Tool {
    return {
      name: mcpTool.name,
      description: mcpTool.description ?? "",
      parameters: mcpTool.inputSchema,
      execute: async (args) => {
        return this.callTool(mcpTool.name, args)
      },
    }
  }

  isConnected(): boolean {
    return this.connected
  }

  getName(): string {
    return this.config.name
  }
}

export async function connectMCP(config: MCPServerConfig): Promise<MCPClient> {
  const client = new MCPClient(config)
  await client.connect()
  return client
}

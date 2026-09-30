import type { MCPServerConfig, Tool } from "../types.ts"
import { MCPClient } from "./client.ts"

export class MCPManager {
  private clients: Map<string, MCPClient> = new Map()

  async addServer(config: MCPServerConfig): Promise<Tool[]> {
    if (this.clients.has(config.name)) {
      throw new Error(`MCP server already exists: ${config.name}`)
    }

    const client = new MCPClient(config)
    await client.connect()
    this.clients.set(config.name, client)

    return client.listTools()
  }

  async removeServer(name: string): Promise<void> {
    const client = this.clients.get(name)
    if (client) {
      await client.disconnect()
      this.clients.delete(name)
    }
  }

  getClient(name: string): MCPClient | undefined {
    return this.clients.get(name)
  }

  async listAllTools(): Promise<Tool[]> {
    const allTools: Tool[] = []

    for (const client of this.clients.values()) {
      const tools = await client.listTools()
      allTools.push(...tools)
    }

    return allTools
  }

  async disconnectAll(): Promise<void> {
    const disconnectPromises = Array.from(this.clients.values()).map((client) =>
      client.disconnect(),
    )
    await Promise.all(disconnectPromises)
    this.clients.clear()
  }

  getServerNames(): string[] {
    return Array.from(this.clients.keys())
  }

  isServerConnected(name: string): boolean {
    const client = this.clients.get(name)
    return client?.isConnected() ?? false
  }
}

export function createMCPManager(): MCPManager {
  return new MCPManager()
}

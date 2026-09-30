import { describe, expect, it } from "vitest"
import { defineTool, ToolRegistry } from "../src/index.ts"

describe("ToolRegistry", () => {
  it("should register and retrieve tools", () => {
    const registry = new ToolRegistry()

    const testTool = defineTool({
      name: "test_tool",
      description: "A test tool",
      parameters: {
        type: "object",
        properties: {
          input: { type: "string" },
        },
        required: ["input"],
      },
      execute: async (args) => {
        const { input } = args as { input: string }
        return { output: `Received: ${input}` }
      },
    })

    registry.register(testTool)

    expect(registry.has("test_tool")).toBe(true)
    expect(registry.get("test_tool")).toBe(testTool)
    expect(registry.size()).toBe(1)
  })

  it("should unregister tools", () => {
    const registry = new ToolRegistry()

    const tool = defineTool({
      name: "removable_tool",
      description: "A tool to be removed",
      parameters: { type: "object", properties: {} },
      execute: async () => ({ output: "done" }),
    })

    registry.register(tool)
    expect(registry.has("removable_tool")).toBe(true)

    registry.unregister("removable_tool")
    expect(registry.has("removable_tool")).toBe(false)
  })

  it("should convert to tool definitions", () => {
    const registry = new ToolRegistry()

    registry.register(
      defineTool({
        name: "tool1",
        description: "First tool",
        parameters: { type: "object", properties: {} },
        execute: async () => ({ output: "" }),
      }),
    )

    registry.register(
      defineTool({
        name: "tool2",
        description: "Second tool",
        parameters: { type: "object", properties: { value: { type: "number" } } },
        execute: async () => ({ output: "" }),
      }),
    )

    const definitions = registry.toToolDefinitions()

    expect(definitions).toHaveLength(2)
    expect(definitions[0]).toEqual({
      name: "tool1",
      description: "First tool",
      parameters: { type: "object", properties: {} },
    })
  })

  it("should throw when getting non-existent tool with getOrThrow", () => {
    const registry = new ToolRegistry()

    expect(() => registry.getOrThrow("non_existent")).toThrow("Tool not found: non_existent")
  })

  it("should list all tools", () => {
    const registry = new ToolRegistry()

    const tool1 = defineTool({
      name: "a",
      description: "Tool A",
      parameters: { type: "object", properties: {} },
      execute: async () => ({ output: "" }),
    })

    const tool2 = defineTool({
      name: "b",
      description: "Tool B",
      parameters: { type: "object", properties: {} },
      execute: async () => ({ output: "" }),
    })

    registry.registerMany([tool1, tool2])

    const tools = registry.list()
    expect(tools).toHaveLength(2)
    expect(registry.names()).toEqual(["a", "b"])
  })

  it("should clear all tools", () => {
    const registry = new ToolRegistry()

    registry.register(
      defineTool({
        name: "temp",
        description: "Temporary",
        parameters: { type: "object", properties: {} },
        execute: async () => ({ output: "" }),
      }),
    )

    expect(registry.size()).toBe(1)
    registry.clear()
    expect(registry.size()).toBe(0)
  })
})

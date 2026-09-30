import type { z } from "zod"
import type {
  ExecutionContext,
  JSONSchema,
  Tool,
  ToolDefinition,
  ToolResult,
  ZodTool,
} from "../types.ts"
import { ToolNotFoundError } from "../utils.ts"

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map()

  register<TArgs = unknown>(tool: Tool<TArgs>): this {
    this.tools.set(tool.name, tool as Tool)
    return this
  }

  registerMany(tools: Tool[]): this {
    for (const tool of tools) {
      this.register(tool)
    }
    return this
  }

  unregister(name: string): boolean {
    return this.tools.delete(name)
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name)
  }

  getOrThrow(name: string): Tool {
    const tool = this.get(name)
    if (!tool) {
      throw new ToolNotFoundError(name)
    }
    return tool
  }

  has(name: string): boolean {
    return this.tools.has(name)
  }

  list(): Tool[] {
    return Array.from(this.tools.values())
  }

  names(): string[] {
    return Array.from(this.tools.keys())
  }

  size(): number {
    return this.tools.size
  }

  clear(): void {
    this.tools.clear()
  }

  toToolDefinitions(): ToolDefinition[] {
    return this.list().map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }))
  }
}

export function defineTool<TArgs = unknown>(config: {
  name: string
  description: string
  parameters: JSONSchema
  execute: (args: TArgs, ctx: ExecutionContext) => Promise<ToolResult>
}): Tool<TArgs> {
  return config
}

export function defineZodTool<T extends z.ZodType>(
  config: ZodTool<T>,
): Tool<z.infer<T>> {
  const zodToJsonSchema = (schema: z.ZodType): JSONSchema => {
    if ("_def" in schema) {
      const def = schema._def as { typeName?: string }
      if (def.typeName === "ZodObject" && "shape" in schema) {
        const shape = (schema as z.ZodObject<z.ZodRawShape>).shape
        const properties: Record<string, JSONSchema> = {}
        const required: string[] = []

        for (const [key, value] of Object.entries(shape)) {
          properties[key] = zodToJsonSchema(value as z.ZodType)
          if (!(value as z.ZodType).isOptional?.()) {
            required.push(key)
          }
        }

        return {
          type: "object",
          properties,
          required: required.length > 0 ? required : undefined,
        }
      }
      if (def.typeName === "ZodString") {
        return { type: "string" }
      }
      if (def.typeName === "ZodNumber") {
        return { type: "number" }
      }
      if (def.typeName === "ZodBoolean") {
        return { type: "boolean" }
      }
      if (def.typeName === "ZodArray") {
        const arrayDef = def as { type?: z.ZodType }
        return {
          type: "array",
          items: arrayDef.type ? zodToJsonSchema(arrayDef.type) : {},
        }
      }
    }
    return { type: "object" }
  }

  return {
    name: config.name,
    description: config.description,
    parameters: zodToJsonSchema(config.schema),
    execute: async (args: z.infer<T>, ctx: ExecutionContext) => {
      const parsed = config.schema.parse(args)
      return config.execute(parsed, ctx)
    },
  }
}

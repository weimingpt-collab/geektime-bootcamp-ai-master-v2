import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { type AgentEvent, createAgent, type Tool } from "simple-agent"
import {
  bashTool,
  ghTool,
  gitTool,
  readFileTool,
  writeFileTool,
} from "./tools/index.ts"

// Load system prompt from file
const systemPrompt = readFileSync(
  resolve(import.meta.dirname, "../prompts/system.md"),
  "utf-8",
)

export interface CodeReviewAgentOptions {
  /** LLM model to use (default: gpt-5-codex) */
  model?: string
  /** Event callback for streaming output */
  onEvent?: (event: AgentEvent) => void
  /** Maximum steps for the agent loop (default: 50) */
  maxSteps?: number
  /** Additional tools to register */
  additionalTools?: Tool[]
}

/**
 * Creates a code review agent instance.
 *
 * The agent is configured with:
 * - A comprehensive system prompt for code review
 * - Five built-in tools: bash, read_file, write_file, git, gh
 * - Sensible defaults for model and max steps
 *
 * @example
 * ```typescript
 * const agent = createCodeReviewAgent({
 *   onEvent: (event) => {
 *     if (event.type === 'text') {
 *       process.stdout.write(event.text)
 *     }
 *   }
 * })
 *
 * const session = agent.createSession()
 * await agent.run(session, "帮我 review 当前 branch 新代码")
 * ```
 */
export function createCodeReviewAgent(options: CodeReviewAgentOptions = {}) {
  const tools: Tool[] = [
    bashTool as Tool,
    readFileTool as Tool,
    writeFileTool as Tool,
    gitTool as Tool,
    ghTool as Tool,
  ]

  if (options.additionalTools) {
    tools.push(...options.additionalTools)
  }

  return createAgent({
    model: options.model ?? "gpt-5-codex",
    systemPrompt,
    tools,
    maxSteps: options.maxSteps ?? 50,
    onEvent: options.onEvent,
  })
}

// Re-export types for convenience
export type { AgentEvent } from "simple-agent"

#!/usr/bin/env node

import ora from "ora"
import pc from "picocolors"
import type { AgentEvent } from "simple-agent"
import { createCodeReviewAgent } from "./agent.ts"

// Parse command line arguments
const args = process.argv.slice(2)

// Handle help flag
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
${pc.bold(pc.cyan("Code Review Agent"))} - LLM-powered code review assistant

${pc.bold("Usage:")}
  ${pc.green("codereview-agent")} ${pc.yellow("[message]")}

${pc.bold("Examples:")}
  ${pc.dim("# Review uncommitted changes")}
  codereview-agent "帮我 review 当前的改动"

  ${pc.dim("# Review branch diff")}
  codereview-agent "帮我 review 当前 branch 新代码"

  ${pc.dim("# Review specific commit")}
  codereview-agent "帮我 review commit abc123 的代码"

  ${pc.dim("# Review PR")}
  codereview-agent "帮我 review PR 42"

${pc.bold("Environment Variables:")}
  ${pc.yellow("OPENAI_API_KEY")}    Required for LLM API access
  ${pc.yellow("OPENAI_MODEL")}      Model to use (default: gpt-5-codex)
`)
  process.exit(0)
}

const userMessage =
  args.join(" ") || "帮我 review 当前的改动 (staged 和 unstaged)"

// Get model from environment or use default
const model = process.env.OPENAI_MODEL ?? "gpt-5-codex"

// Spinner for tool calls
let spinner: ReturnType<typeof ora> | null = null
let currentToolDisplay = ""

// Format tool call for display
function formatToolCall(name: string, args: unknown): string {
  const argsObj = args as Record<string, unknown>
  switch (name) {
    case "bash":
      return `bash ${argsObj.command ?? ""}`
    case "git":
      return `git ${argsObj.command ?? ""}`
    case "gh":
      return `gh ${argsObj.command ?? ""}`
    case "read_file":
      return `read_file ${argsObj.path ?? ""}`
    case "write_file":
      return `write_file ${argsObj.path ?? ""}`
    default:
      return name
  }
}

// Format tool result for display (truncated preview)
function formatResultPreview(result: string, maxLines = 8): string {
  const lines = result.trim().split("\n")
  const previewLines = lines.slice(0, maxLines)
  const truncated = lines.length > maxLines

  // Truncate long lines
  const formattedLines = previewLines.map((line) => {
    if (line.length > 100) {
      return line.slice(0, 100) + "..."
    }
    return line
  })

  let output = formattedLines.map((line) => `  ${pc.dim("│")} ${pc.dim(line)}`).join("\n")

  if (truncated) {
    output += `\n  ${pc.dim("│")} ${pc.dim(`... (${lines.length - maxLines} more lines)`)}`
  }

  return output
}

// Event handler for streaming output
function handleEvent(event: AgentEvent): void {
  switch (event.type) {
    case "step":
      // Silent step tracking
      break

    case "tool_call":
      // Stop any existing spinner
      if (spinner) {
        spinner.stop()
      }
      currentToolDisplay = formatToolCall(event.name, event.args)
      spinner = ora({
        text: pc.dim(`${pc.cyan(currentToolDisplay)}`),
        spinner: "dots",
      }).start()
      break

    case "tool_result":
      if (spinner) {
        // Stop spinner first, then print status and result manually
        spinner.stop()
        spinner = null

        if (event.isError) {
          console.log(`${pc.red("✖")} ${pc.red(currentToolDisplay)}`)
          // Show error message
          console.log(formatResultPreview(event.result, 3))
        } else {
          console.log(`${pc.green("✔")} ${pc.dim(currentToolDisplay)}`)
          // Show result preview for successful calls
          if (event.result && event.result.trim()) {
            console.log(formatResultPreview(event.result))
          }
        }
      }
      break

    case "text":
      // Stop spinner before text output
      if (spinner) {
        spinner.stop()
        spinner = null
      }
      process.stdout.write(event.text)
      break

    case "text_done":
      // Ensure newline after text
      if (!event.text.endsWith("\n")) {
        process.stdout.write("\n")
      }
      break

    case "error":
      if (spinner) {
        spinner.fail(pc.red("Error"))
        spinner = null
      }
      console.error(pc.red(`\nError: ${event.error.message}`))
      break

    default:
      // Ignore other events
      break
  }
}

async function main(): Promise<void> {
  // Print header
  console.log()
  console.log(
    pc.bold(pc.cyan("Code Review Agent")) + pc.dim(` (model: ${model})`),
  )
  console.log(pc.dim("─".repeat(50)))
  console.log()
  console.log(pc.bold("Request:"), userMessage)
  console.log()

  try {
    const agent = createCodeReviewAgent({
      model,
      onEvent: handleEvent,
    })

    const session = agent.createSession()
    await agent.run(session, userMessage)

    console.log()
    console.log(pc.dim("─".repeat(50)))
    console.log(pc.green("✓"), pc.dim("Review completed"))
    console.log()
  } catch (error) {
    console.error(
      pc.red("\n✗ Failed to run agent:"),
      error instanceof Error ? error.message : error,
    )
    process.exit(1)
  }
}

main()

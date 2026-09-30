import { execSync } from "node:child_process"
import { defineTool } from "simple-agent"

// Whitelist of allowed commands (read-only system info)
const ALLOWED_COMMANDS = [
  "pwd",
  "whoami",
  "hostname",
  "uname",
  "date",
  "env",
  "echo",
  "cat",
  "ls",
  "head",
  "tail",
  "wc",
  "which",
  "type",
  "file",
  "stat",
  "find",
  "tree",
]

// Forbidden patterns for security
const FORBIDDEN_PATTERNS = [
  /[;&|`$(){}]/,  // Shell operators and substitution
  /\.\./,          // Path traversal
  /[<>]/,          // Redirection
  /\n/,            // Newlines
]

interface BashArgs {
  command: string
}

export const bashTool = defineTool<BashArgs>({
  name: "bash",
  description: `Execute basic bash commands to read system information. Only safe, read-only commands are allowed.

Allowed commands: pwd, ls, cat, head, tail, find, tree, whoami, hostname, uname, date, env, echo, which, type, file, stat, wc

Common uses:
- pwd: Show current working directory
- ls <path>: List directory contents
- cat <file>: Read file contents
- find <path> -name <pattern>: Find files
- tree <path>: Show directory tree`,
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description:
          "The bash command to execute, e.g., 'pwd', 'ls -la', 'cat package.json'",
      },
    },
    required: ["command"],
  },
  execute: async (args) => {
    const { command } = args

    // Security check: validate command
    const trimmed = command.trim()
    const parts = trimmed.split(/\s+/)
    const baseCommand = parts[0]

    if (!baseCommand || !ALLOWED_COMMANDS.includes(baseCommand)) {
      return {
        output: "",
        error: `Command '${baseCommand}' is not allowed. Allowed commands: ${ALLOWED_COMMANDS.join(", ")}`,
      }
    }

    // Check for forbidden patterns
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          output: "",
          error: `Command contains forbidden pattern for security reasons`,
        }
      }
    }

    try {
      const output = execSync(trimmed, {
        encoding: "utf-8",
        maxBuffer: 1024 * 1024, // 1MB
        timeout: 10000, // 10 seconds
      })

      // Truncate long output
      const maxLength = 10000
      if (output.length > maxLength) {
        return {
          output:
            output.slice(0, maxLength) +
            `\n\n[Output truncated. Total length: ${output.length} chars]`,
        }
      }

      return { output: output || "(empty output)" }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { output: "", error: message }
    }
  },
})

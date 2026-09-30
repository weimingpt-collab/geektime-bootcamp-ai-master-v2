import { execSync } from "node:child_process"
import { defineTool } from "simple-agent"

// Whitelist of allowed git commands (read-only operations)
const ALLOWED_GIT_COMMANDS = [
  "diff",
  "log",
  "show",
  "status",
  "blame",
  "branch",
  "rev-parse",
  "ls-files",
  "merge-base",
]

// Forbidden dangerous arguments
const FORBIDDEN_ARGS = ["--exec", "-c", "!"]

interface GitArgs {
  command: string
}

export const gitTool = defineTool<GitArgs>({
  name: "git",
  description: `Execute git commands to analyze code changes. Only read-only operations are allowed.

DIFF OPERATIONS:
- Unstaged changes: git diff
- Staged changes: git diff --cached
- Branch comparison: git diff <base>...HEAD
- Specific commit: git show <commit>
- Commit range: git diff <from>..<to>
- Single file diff: git diff <path>
- List changed files: git diff --name-only

HISTORY OPERATIONS:
- Recent commits: git log --oneline -n 10
- File history: git log --oneline <path>
- Blame (line authors): git blame <path>
- Show commit details: git show <commit>

STATUS OPERATIONS:
- Working tree status: git status
- Current branch: git branch --show-current
- List branches: git branch -a
- Find merge base: git merge-base <branch> HEAD`,
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description:
          "The git command to execute (without 'git' prefix), e.g., 'diff --cached', 'log --oneline -5', 'show abc123'",
      },
    },
    required: ["command"],
  },
  execute: async (args) => {
    const { command } = args

    // Security check: parse and validate command
    const parts = command.trim().split(/\s+/)
    const subCommand = parts[0]

    if (!subCommand || !ALLOWED_GIT_COMMANDS.includes(subCommand)) {
      return {
        output: "",
        error: `Git command '${subCommand}' is not allowed. Allowed commands: ${ALLOWED_GIT_COMMANDS.join(", ")}`,
      }
    }

    // Check for forbidden arguments
    for (const arg of parts) {
      if (FORBIDDEN_ARGS.some((f) => arg.startsWith(f))) {
        return {
          output: "",
          error: `Argument '${arg}' is not allowed for security reasons`,
        }
      }
    }

    try {
      const output = execSync(`git ${command}`, {
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024, // 10MB
        timeout: 30000, // 30 seconds
      })

      // Truncate overly long output to prevent token explosion
      const maxLength = 50000
      if (output.length > maxLength) {
        return {
          output:
            output.slice(0, maxLength) +
            `\n\n[Output truncated. Total length: ${output.length} chars]`,
        }
      }

      return { output: output || "(empty output)" }
    } catch (error) {
      // Handle git command errors (e.g., branch not found)
      if (error instanceof Error && "stderr" in error) {
        const stderr = (error as { stderr?: string }).stderr ?? ""
        if (stderr) {
          return { output: "", error: stderr }
        }
      }
      const message = error instanceof Error ? error.message : String(error)
      return { output: "", error: message }
    }
  },
})

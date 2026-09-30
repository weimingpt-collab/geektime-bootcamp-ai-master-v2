import { execSync } from "node:child_process"
import { defineTool } from "simple-agent"

// Whitelist of allowed gh commands (read-only operations)
const ALLOWED_GH_COMMANDS = [
  "pr view",
  "pr diff",
  "pr list",
  "pr checks",
  "pr status",
]

interface GhArgs {
  command: string
}

export const ghTool = defineTool<GhArgs>({
  name: "gh",
  description: `Execute GitHub CLI (gh) commands to interact with Pull Requests. Only read-only operations are allowed.

PR VIEWING:
- View PR details: gh pr view <number>
- View PR diff: gh pr diff <number>
- List PR files: gh pr diff <number> --name-only
- View PR comments: gh pr view <number> --comments
- View PR checks: gh pr checks <number>

PR LISTING:
- List open PRs: gh pr list
- List my PRs: gh pr list --author @me
- Search PRs: gh pr list --search "keyword"
- Current PR status: gh pr status`,
  parameters: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description:
          "The gh command to execute (without 'gh' prefix), e.g., 'pr view 123', 'pr diff 456'",
      },
    },
    required: ["command"],
  },
  execute: async (args) => {
    const { command } = args

    // Security check: only allow whitelisted command patterns
    const isAllowed = ALLOWED_GH_COMMANDS.some((allowed) =>
      command.trim().startsWith(allowed),
    )

    if (!isAllowed) {
      return {
        output: "",
        error: `GH command is not allowed. Allowed patterns: ${ALLOWED_GH_COMMANDS.join(", ")}`,
      }
    }

    try {
      const output = execSync(`gh ${command}`, {
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024, // 10MB
        timeout: 60000, // 60 seconds for network operations
      })

      // Truncate overly long output
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
      // Handle gh command errors
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

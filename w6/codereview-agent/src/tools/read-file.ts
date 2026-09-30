import { execSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { isAbsolute, relative, resolve } from "node:path"
import { defineTool } from "simple-agent"

// Get git repository root directory, fallback to cwd
function getRepoRoot(): string {
  try {
    return execSync("git rev-parse --show-toplevel", {
      encoding: "utf-8",
      timeout: 5000,
    }).trim()
  } catch {
    return process.cwd()
  }
}

const REPO_ROOT = getRepoRoot()

interface ReadFileArgs {
  path: string
  start_line?: number
  end_line?: number
}

export const readFileTool = defineTool<ReadFileArgs>({
  name: "read_file",
  description: `Read the contents of a file in the repository. Use this to understand the full context of code changes.

Common use cases:
- Read full file to understand context after viewing diff
- Check imported modules and dependencies
- Find AGENTS.md or conventions files
- Understand data flow through related files

Note: Paths are relative to the git repository root.
The output includes line numbers for easy reference.`,
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "The relative path to the file from the repository root, e.g., 'src/utils/auth.ts'",
      },
      start_line: {
        type: "number",
        description:
          "Optional: Start line number (1-indexed) for partial reads",
      },
      end_line: {
        type: "number",
        description: "Optional: End line number (1-indexed) for partial reads",
      },
    },
    required: ["path"],
  },
  execute: async (args) => {
    const { path, start_line, end_line } = args

    // Security check: disallow absolute paths and path traversal
    if (isAbsolute(path) || path.includes("..")) {
      return {
        output: "",
        error: "Absolute paths and path traversal (..) are not allowed",
      }
    }

    const fullPath = resolve(REPO_ROOT, path)

    // Ensure the file is within the repository
    const relativePath = relative(REPO_ROOT, fullPath)
    if (relativePath.startsWith("..")) {
      return {
        output: "",
        error: "Cannot read files outside the repository",
      }
    }

    if (!existsSync(fullPath)) {
      return {
        output: "",
        error: `File not found: ${path}`,
      }
    }

    try {
      let content = readFileSync(fullPath, "utf-8")

      // If line range is specified, extract those lines
      if (start_line !== undefined || end_line !== undefined) {
        const lines = content.split("\n")
        const start = (start_line ?? 1) - 1
        const end = end_line ?? lines.length
        content = lines.slice(start, end).join("\n")
      }

      // Add line numbers for easier reference
      const lines = content.split("\n")
      const lineOffset = (start_line ?? 1) - 1
      const numberedContent = lines
        .map((line, i) => `${String(i + 1 + lineOffset).padStart(4)} │ ${line}`)
        .join("\n")

      return { output: numberedContent }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { output: "", error: message }
    }
  },
})

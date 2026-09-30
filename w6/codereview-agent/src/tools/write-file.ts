import { execSync } from "node:child_process"
import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, isAbsolute, relative, resolve } from "node:path"
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

interface WriteFileArgs {
  path: string
  content: string
}

export const writeFileTool = defineTool<WriteFileArgs>({
  name: "write_file",
  description: `Write content to a file. Use this to save review reports or summaries.

Common use cases:
- Generate Markdown format review reports
- Save detailed issue lists
- Output fix suggestions to file

Note: Paths are relative to the git repository root.`,
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description:
          "The relative path where to write the file, e.g., 'review-report.md'",
      },
      content: {
        type: "string",
        description: "The content to write to the file",
      },
    },
    required: ["path", "content"],
  },
  execute: async (args) => {
    const { path, content } = args

    // Security check: disallow absolute paths and path traversal
    if (isAbsolute(path) || path.includes("..")) {
      return {
        output: "",
        error: "Absolute paths and path traversal (..) are not allowed",
      }
    }

    const fullPath = resolve(REPO_ROOT, path)
    const relativePath = relative(REPO_ROOT, fullPath)

    if (relativePath.startsWith("..")) {
      return {
        output: "",
        error: "Cannot write files outside the repository",
      }
    }

    try {
      // Ensure the directory exists
      mkdirSync(dirname(fullPath), { recursive: true })

      writeFileSync(fullPath, content, "utf-8")

      return {
        output: `Successfully wrote ${content.length} characters to ${path}`,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { output: "", error: message }
    }
  },
})

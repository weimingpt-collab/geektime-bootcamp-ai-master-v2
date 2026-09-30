# Code Review Agent

An LLM-powered code review agent built on the simple-agent SDK.

## Quick Start

```bash
# Install dependencies
npm install

# Run code review
npm run start -- "帮我 review 当前的改动"
```

## Usage Scenarios

```bash
# Review uncommitted changes (staged + unstaged)
npm run start -- "帮我 review 当前的改动"

# Review branch diff vs main
npm run start -- "帮我 review 当前 branch 新代码"

# Review specific commit
npm run start -- "帮我 review commit abc123 的代码"

# Review changes after a commit
npm run start -- "帮我 review commit abc123 之后的代码"

# Review PR (requires gh CLI)
npm run start -- "帮我 review PR 42"
```

## Environment Variables

- `OPENAI_API_KEY` - Required for LLM API access
- `OPENAI_MODEL` - Model to use (default: gpt-5-codex)

## Project Structure

```
codereview-agent/
├── prompts/
│   └── system.md          # System prompt (LLM behavior guide)
├── src/
│   ├── index.ts           # Public exports
│   ├── agent.ts           # createCodeReviewAgent factory
│   ├── cli.ts             # CLI entry point
│   └── tools/
│       ├── bash.ts        # Basic shell commands (read-only)
│       ├── read-file.ts   # Read files in repo
│       ├── write-file.ts  # Write review reports
│       ├── git.ts         # Git commands (read-only)
│       └── gh.ts          # GitHub CLI (read-only)
└── examples/
    └── basic-review.ts    # Usage example
```

## Development

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run build
```

## Architecture

The agent follows an LLM-driven architecture where:

1. **System Prompt** defines all business logic (intent understanding, tool selection, output format)
2. **Agent Code** provides tools and security checks only
3. **Tools** are read-only by design (git/gh commands are whitelisted)

This design keeps the agent code minimal while allowing complex review workflows through prompt engineering.

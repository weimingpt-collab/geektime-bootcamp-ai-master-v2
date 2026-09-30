/**
 * Basic usage example for Code Review Agent
 *
 * Run with: npx tsx examples/basic-review.ts
 */
import { createCodeReviewAgent } from "../src/index.ts"

async function main() {
  // Create agent with event handler for streaming output
  const agent = createCodeReviewAgent({
    model: process.env.OPENAI_MODEL ?? "gpt-5-codex",
    onEvent: (event) => {
      switch (event.type) {
        case "text":
          process.stdout.write(event.text)
          break
        case "tool_call":
          console.log(`\n[Tool] ${event.name}`)
          break
        case "tool_result":
          if (event.isError) {
            console.log(`[Error] ${event.result}`)
          }
          break
        case "error":
          console.error(`[Error] ${event.error.message}`)
          break
      }
    },
  })

  // Create a session
  const session = agent.createSession()

  // Get user message from command line or use default
  const userMessage = process.argv.slice(2).join(" ") || "帮我 review 当前的改动"

  console.log(`Request: ${userMessage}`)
  console.log("---")

  // Run the review
  await agent.run(session, userMessage)

  console.log("\n---")
  console.log("Review completed.")
}

main().catch(console.error)

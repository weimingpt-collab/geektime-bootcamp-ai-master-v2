import { Cpu, DollarSign, Clock } from 'lucide-react'
import type { Turn } from '../types/conversation'

interface StatusBarProps {
  turn: Turn | null
  systemPrompts: string[]
  messagesTokenEstimate: number
}

interface TokenInfo {
  input: number
  output: number
  reasoning: number
  cache?: { read: number; write: number }
}

export function StatusBar({ turn, systemPrompts, messagesTokenEstimate }: StatusBarProps) {
  // Estimate system prompt tokens (~4 chars per token)
  const systemPromptChars = systemPrompts.reduce((acc, p) => acc + p.length, 0)
  const systemPromptTokens = Math.round(systemPromptChars / 4)

  // Get actual token info from turn output if available
  const tokens: TokenInfo | null = turn?.output?.output?.message?.tokens ?? null
  const cost: number | null = turn?.output?.output?.message?.cost ?? null

  // Calculate duration if we have timestamps
  let duration: number | null = null
  if (turn?.output?.output?.message?.time) {
    const { created, completed } = turn.output.output.message.time
    if (completed) {
      duration = completed - created
    }
  }

  return (
    <footer className="status-bar">
      <div className="status-section">
        <Cpu size={14} />
        <span className="status-label">Sysprompt:</span>
        <span className="status-value">~{systemPromptTokens.toLocaleString()} tokens</span>
      </div>

      <div className="status-section">
        <span className="status-label">Chat history:</span>
        <span className="status-value">~{messagesTokenEstimate.toLocaleString()} tokens</span>
      </div>

      {tokens && (
        <>
          <div className="status-divider" />
          <div className="status-section">
            <span className="status-label">Input:</span>
            <span className="status-value">{tokens.input.toLocaleString()}</span>
          </div>
          <div className="status-section">
            <span className="status-label">Output:</span>
            <span className="status-value">{tokens.output.toLocaleString()}</span>
          </div>
          {tokens.reasoning > 0 && (
            <div className="status-section">
              <span className="status-label">Reasoning:</span>
              <span className="status-value">{tokens.reasoning.toLocaleString()}</span>
            </div>
          )}
          {tokens.cache && (tokens.cache.read > 0 || tokens.cache.write > 0) && (
            <div className="status-section">
              <span className="status-label">Cache:</span>
              <span className="status-value">
                R:{tokens.cache.read.toLocaleString()} W:{tokens.cache.write.toLocaleString()}
              </span>
            </div>
          )}
        </>
      )}

      {cost !== null && cost > 0 && (
        <>
          <div className="status-divider" />
          <div className="status-section">
            <DollarSign size={14} />
            <span className="status-value">${cost.toFixed(4)}</span>
          </div>
        </>
      )}

      {duration !== null && (
        <div className="status-section">
          <Clock size={14} />
          <span className="status-value">{(duration / 1000).toFixed(2)}s</span>
        </div>
      )}

      <style>{`
        .status-bar {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-xs) var(--space-lg);
          background: var(--md-fog);
          border-top: var(--border-strong);
          font-size: var(--font-tiny);
          flex-wrap: wrap;
          min-height: 36px;
        }
        .status-section {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          color: var(--md-slate);
        }
        .status-label {
          color: var(--md-slate);
        }
        .status-value {
          color: var(--md-graphite);
          font-weight: var(--font-weight-bold);
          font-family: var(--font-family-primary);
        }
        .status-divider {
          width: 2px;
          height: 16px;
          background: var(--md-graphite);
        }
      `}</style>
    </footer>
  )
}

import { useState } from 'react'
import type { Turn } from '../types/conversation'
import { ChevronDown, ChevronRight, Clock, Cpu } from 'lucide-react'
import { formatTimestamp, formatTokens } from '../utils/parser'
import { InputSection } from './InputSection'
import { OutputSection } from './OutputSection'

interface TurnCardProps {
  turn: Turn
}

export function TurnCard({ turn }: TurnCardProps) {
  const [isInputExpanded, setIsInputExpanded] = useState(false)

  const timestamp = turn.input?.timestamp || turn.output?.timestamp || ''
  const hasError = turn.output?.output?.message?.error

  return (
    <div className={`card turn-card ${hasError ? 'has-error' : ''}`}>
      <div className="card-header turn-header">
        <div className="turn-header-left">
          <span className="badge badge-info">Turn {turn.turnIndex}</span>
          {timestamp && (
            <span className="turn-time">
              <Clock size={14} />
              {formatTimestamp(timestamp)}
            </span>
          )}
          {turn.output?.output?.message?.tokens && (
            <span className="turn-tokens">
              <Cpu size={14} />
              {formatTokens(turn.output.output.message.tokens)}
            </span>
          )}
        </div>
        {turn.output?.output?.message?.agent && (
          <span className="badge badge-assistant">
            {turn.output.output.message.agent}
          </span>
        )}
      </div>

      <div className="card-body">
        {turn.input && (
          <div className="turn-section">
            <button
              className="collapsible-trigger section-header"
              onClick={() => setIsInputExpanded(!isInputExpanded)}
            >
              {isInputExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span>Input</span>
              <span className="section-meta">
                {turn.input.input.messages.length} message(s),{' '}
                {turn.input.input.system.length} system prompt(s)
              </span>
            </button>
            {isInputExpanded && (
              <div className="section-content animate-slide-down">
                <InputSection input={turn.input.input} />
              </div>
            )}
          </div>
        )}

        {turn.output && (
          <div className="turn-section">
            <div className="section-header">
              <span>Output</span>
              {hasError && <span className="badge badge-error">Error</span>}
            </div>
            <div className="section-content">
              <OutputSection output={turn.output.output} />
            </div>
          </div>
        )}
      </div>

      <style>{`
        .turn-card {
          transition: box-shadow var(--transition-quick);
        }
        .turn-card:hover {
          box-shadow: var(--shadow-translate);
        }
        .turn-card.has-error {
          border-color: var(--md-watermelon);
        }
        .turn-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-md);
          flex-wrap: wrap;
        }
        .turn-header-left {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }
        .turn-time, .turn-tokens {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: var(--font-small);
          color: var(--md-slate);
        }
        .turn-section {
          margin-top: var(--space-md);
        }
        .turn-section:first-child {
          margin-top: 0;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-weight: var(--font-weight-bold);
          font-size: var(--font-small);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--md-ink);
          padding: var(--space-sm) 0;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .section-meta {
          font-weight: var(--font-weight-regular);
          color: var(--md-slate);
          text-transform: none;
          letter-spacing: 0;
        }
        .section-content {
          margin-top: var(--space-sm);
          padding: var(--space-md);
          background: var(--md-fog);
          border-radius: var(--radius-micro);
          max-height: 500px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  )
}

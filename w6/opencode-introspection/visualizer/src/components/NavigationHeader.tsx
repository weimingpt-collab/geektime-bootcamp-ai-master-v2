import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import type { Turn } from '../types/conversation'

interface NavigationHeaderProps {
  fileName: string
  turns: Turn[]
  currentTurnIndex: number
  onNavigate: (index: number) => void
}

export function NavigationHeader({
  fileName,
  turns,
  currentTurnIndex,
  onNavigate,
}: NavigationHeaderProps) {
  const canGoBack = currentTurnIndex > 0
  const canGoForward = currentTurnIndex < turns.length - 1

  const currentTurn = turns[currentTurnIndex]
  const timestamp = currentTurn?.input?.timestamp || currentTurn?.output?.timestamp

  return (
    <header className="nav-header">
      <div className="nav-header-left">
        <FileText size={18} />
        <span className="nav-title">OpenCode Visualizer</span>
        <span className="nav-file-name">{formatFileName(fileName)}</span>
      </div>

      <div className="nav-controls">
        <button
          className="nav-btn"
          onClick={() => onNavigate(currentTurnIndex - 1)}
          disabled={!canGoBack}
          title="Previous turn (←)"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="nav-indicator">
          Turn {currentTurnIndex + 1} / {turns.length}
        </span>
        <button
          className="nav-btn"
          onClick={() => onNavigate(currentTurnIndex + 1)}
          disabled={!canGoForward}
          title="Next turn (→)"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="nav-header-right">
        {timestamp && (
          <span className="nav-timestamp">{formatTimestamp(timestamp)}</span>
        )}
        {currentTurn?.output?.output?.message?.agent && (
          <span className="badge badge-assistant">
            {currentTurn.output.output.message.agent}
          </span>
        )}
      </div>

      <style>{`
        .nav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-sm) var(--space-lg);
          background: var(--md-sunbeam);
          border-bottom: var(--border-strong);
          gap: var(--space-md);
          min-height: 56px;
        }
        .nav-header-left {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          min-width: 0;
        }
        .nav-title {
          font-weight: var(--font-weight-bold);
          white-space: nowrap;
          color: var(--md-graphite);
        }
        .nav-file-name {
          font-size: var(--font-small);
          color: var(--md-ink);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: var(--font-family-primary);
          opacity: 0.7;
        }
        .nav-controls {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          background: var(--md-cloud);
          padding: var(--space-xs) var(--space-sm);
          border: var(--border-strong);
          border-radius: var(--radius-micro);
        }
        .nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-xs);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--md-graphite);
          border-radius: var(--radius-micro);
          transition: all var(--transition-quick);
        }
        .nav-btn:hover:not(:disabled) {
          background: var(--md-sky);
          color: var(--md-graphite);
        }
        .nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .nav-indicator {
          font-size: var(--font-small);
          font-weight: var(--font-weight-bold);
          min-width: 100px;
          text-align: center;
          color: var(--md-graphite);
        }
        .nav-header-right {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        .nav-timestamp {
          font-size: var(--font-small);
          color: var(--md-ink);
          opacity: 0.7;
        }
      `}</style>
    </header>
  )
}

function formatFileName(name: string): string {
  const match = name.match(/_([a-f0-9]{8})\.jsonl$/)
  if (match?.[1]) {
    return match[1]
  }
  return name.replace('.jsonl', '')
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

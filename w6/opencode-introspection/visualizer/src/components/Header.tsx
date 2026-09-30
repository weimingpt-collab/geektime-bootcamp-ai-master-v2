import type { Conversation } from '../types/conversation'
import { FileText, X } from 'lucide-react'

interface HeaderProps {
  conversation: Conversation | null
  fileName: string
  onReset: () => void
}

export function Header({ conversation, fileName, onReset }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <FileText size={24} />
          <h1>OpenCode Visualizer</h1>
        </div>

        {conversation && (
          <div className="header-meta">
            <span className="meta-item">
              <strong>File:</strong> {fileName}
            </span>
            <span className="meta-item">
              <strong>Session:</strong> {conversation.sessionID.slice(0, 16)}...
            </span>
            <span className="meta-item">
              <strong>Conversation:</strong> {conversation.conversationID}
            </span>
            <span className="meta-item">
              <strong>Turns:</strong> {conversation.turns.length}
            </span>
            <button className="btn btn-ghost" onClick={onReset}>
              <X size={16} />
              Close
            </button>
          </div>
        )}
      </div>

      <style>{`
        .header {
          background: var(--md-cloud);
          border-bottom: var(--border-strong);
          padding: var(--space-md) var(--space-lg);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-content {
          max-width: var(--container-max-width);
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-lg);
          flex-wrap: wrap;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        .header-left h1 {
          font-size: var(--font-h3);
          margin: 0;
        }
        .header-meta {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          flex-wrap: wrap;
          font-size: var(--font-small);
        }
        .meta-item {
          color: var(--md-slate);
        }
        .meta-item strong {
          color: var(--md-ink);
        }
      `}</style>
    </header>
  )
}

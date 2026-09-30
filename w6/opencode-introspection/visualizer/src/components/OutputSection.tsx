import type { MessageInfo, Part } from '../types/conversation'
import { AlertTriangle } from 'lucide-react'
import { PartRenderer } from './PartRenderer'
import { MetadataBar } from './MetadataBar'

interface OutputSectionProps {
  output: {
    message: MessageInfo
    parts: Part[]
    error?: string
  }
}

export function OutputSection({ output }: OutputSectionProps) {
  const { message, parts, error } = output

  return (
    <div className="output-section">
      {message.error && (
        <div className="output-error">
          <AlertTriangle size={16} />
          <div className="error-content">
            <strong>{message.error.name}</strong>
            <pre>{JSON.stringify(message.error.data, null, 2)}</pre>
          </div>
        </div>
      )}

      {error && (
        <div className="output-error">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="parts-list">
        {parts.map((part, idx) => (
          <PartRenderer key={part.id || idx} part={part} />
        ))}
      </div>

      <MetadataBar message={message} />

      <style>{`
        .output-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        .output-error {
          display: flex;
          align-items: flex-start;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: rgba(255, 113, 105, 0.1);
          border: 1px solid var(--md-watermelon);
          border-radius: var(--radius-micro);
          color: var(--md-watermelon);
        }
        .output-error pre {
          margin: var(--space-xs) 0 0;
          font-size: var(--font-tiny);
          white-space: pre-wrap;
          max-height: 200px;
          overflow-y: auto;
        }
        .error-content {
          flex: 1;
          min-width: 0;
        }
        .parts-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
      `}</style>
    </div>
  )
}

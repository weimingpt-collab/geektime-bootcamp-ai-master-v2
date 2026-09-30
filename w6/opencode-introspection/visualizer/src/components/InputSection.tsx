import { useState } from 'react'
import type { MessageWithParts } from '../types/conversation'
import { ChevronDown, ChevronRight, Settings } from 'lucide-react'
import { MessageCard } from './MessageCard'

interface InputSectionProps {
  input: {
    system: string[]
    messages: MessageWithParts[]
  }
}

export function InputSection({ input }: InputSectionProps) {
  const [isSystemExpanded, setIsSystemExpanded] = useState(false)

  return (
    <div className="input-section">
      {input.system.length > 0 && (
        <div className="system-prompts">
          <button
            className="collapsible-trigger"
            onClick={() => setIsSystemExpanded(!isSystemExpanded)}
          >
            {isSystemExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Settings size={14} />
            <span>System Prompts ({input.system.length})</span>
          </button>
          {isSystemExpanded && (
            <div className="system-prompts-content animate-slide-down">
              {input.system.map((prompt, idx) => (
                <div key={idx} className="system-prompt">
                  <div className="system-prompt-header">
                    <span className="badge badge-system">System {idx + 1}</span>
                  </div>
                  <pre className="system-prompt-text">{prompt}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="messages-list">
        <div className="messages-header">
          <span>Messages ({input.messages.length})</span>
        </div>
        <div className="messages-content">
          {input.messages.map((msg, idx) => (
            <MessageCard key={msg.info.id || idx} message={msg} />
          ))}
        </div>
      </div>

      <style>{`
        .input-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        .system-prompts {
          background: var(--md-cloud);
          border-radius: var(--radius-micro);
          padding: var(--space-sm);
        }
        .system-prompts .collapsible-trigger {
          font-size: var(--font-small);
          color: var(--md-slate);
        }
        .system-prompts-content {
          margin-top: var(--space-sm);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          max-height: 300px;
          overflow-y: auto;
        }
        .system-prompt {
          background: var(--md-fog);
          border-radius: var(--radius-micro);
          padding: var(--space-sm);
        }
        .system-prompt-header {
          margin-bottom: var(--space-xs);
        }
        .system-prompt-text {
          font-size: var(--font-tiny);
          white-space: pre-wrap;
          word-break: break-word;
          margin: 0;
          max-height: 200px;
          overflow-y: auto;
        }
        .messages-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
        .messages-header {
          font-size: var(--font-small);
          color: var(--md-slate);
          font-weight: var(--font-weight-bold);
        }
        .messages-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
      `}</style>
    </div>
  )
}

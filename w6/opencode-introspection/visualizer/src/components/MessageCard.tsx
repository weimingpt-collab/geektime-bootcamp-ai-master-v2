import type { MessageWithParts } from '../types/conversation'
import { User, Bot } from 'lucide-react'
import { PartRenderer } from './PartRenderer'

interface MessageCardProps {
  message: MessageWithParts
}

export function MessageCard({ message }: MessageCardProps) {
  const { info, parts } = message
  const isUser = info.role === 'user'

  return (
    <div className={`message-card ${isUser ? 'message-user' : 'message-assistant'}`}>
      <div className="message-header">
        <div className="message-role">
          {isUser ? <User size={14} /> : <Bot size={14} />}
          <span className={`badge ${isUser ? 'badge-user' : 'badge-assistant'}`}>
            {info.role}
          </span>
        </div>
        {info.agent && (
          <span className="message-agent">{info.agent}</span>
        )}
        {info.model && (
          <span className="message-model">
            {info.model.providerID}/{info.model.modelID}
          </span>
        )}
      </div>
      <div className="message-parts">
        {parts.map((part, idx) => (
          <PartRenderer key={part.id || idx} part={part} />
        ))}
      </div>

      <style>{`
        .message-card {
          background: var(--md-cloud);
          border-radius: var(--radius-micro);
          padding: var(--space-sm);
          border-left: 3px solid var(--md-slate);
        }
        .message-user {
          border-left-color: var(--md-sky-strong);
        }
        .message-assistant {
          border-left-color: #22c55e;
        }
        .message-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-sm);
          flex-wrap: wrap;
        }
        .message-role {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }
        .message-agent, .message-model {
          font-size: var(--font-tiny);
          color: var(--md-slate);
        }
        .message-parts {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }
      `}</style>
    </div>
  )
}

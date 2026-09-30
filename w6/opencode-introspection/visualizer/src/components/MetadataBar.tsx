import type { MessageInfo } from '../types/conversation'
import { Cpu, DollarSign, Layers } from 'lucide-react'

interface MetadataBarProps {
  message: MessageInfo
}

export function MetadataBar({ message }: MetadataBarProps) {
  const { tokens, cost, modelID, providerID, finish } = message

  return (
    <div className="metadata-bar">
      {(providerID || modelID) && (
        <div className="metadata-item">
          <Layers size={12} />
          <span>{providerID}/{modelID}</span>
        </div>
      )}

      {tokens && (
        <div className="metadata-item">
          <Cpu size={12} />
          <span>
            {(tokens.input + tokens.output + tokens.reasoning).toLocaleString()} tokens
            <span className="metadata-detail">
              (in: {tokens.input.toLocaleString()}, out: {tokens.output.toLocaleString()}
              {tokens.reasoning > 0 && `, reasoning: ${tokens.reasoning.toLocaleString()}`})
            </span>
          </span>
        </div>
      )}

      {tokens?.cache && (tokens.cache.read > 0 || tokens.cache.write > 0) && (
        <div className="metadata-item">
          <span className="metadata-detail">
            Cache: read {tokens.cache.read.toLocaleString()}, write {tokens.cache.write.toLocaleString()}
          </span>
        </div>
      )}

      {typeof cost === 'number' && cost > 0 && (
        <div className="metadata-item">
          <DollarSign size={12} />
          <span>${cost.toFixed(4)}</span>
        </div>
      )}

      {finish && (
        <div className="metadata-item">
          <span className={`badge ${finish === 'stop' ? 'badge-success' : 'badge-info'}`}>
            {finish}
          </span>
        </div>
      )}

      <style>{`
        .metadata-bar {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          flex-wrap: wrap;
          padding-top: var(--space-sm);
          border-top: 1px dashed var(--md-slate);
          margin-top: var(--space-sm);
        }
        .metadata-item {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: var(--font-tiny);
          color: var(--md-slate);
        }
        .metadata-detail {
          color: var(--md-neutral-300);
        }
      `}</style>
    </div>
  )
}

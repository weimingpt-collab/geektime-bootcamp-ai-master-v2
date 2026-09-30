import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, FileCode } from 'lucide-react'
import { MarkdownRenderer } from './MarkdownRenderer'

interface SystemPromptPanelProps {
  systemPrompts: string[]
}

export function SystemPromptPanel({ systemPrompts }: SystemPromptPanelProps) {
  // Track which prompts are expanded (default: all expanded)
  const [expandedSet, setExpandedSet] = useState<Set<number>>(() =>
    new Set(systemPrompts.map((_, i) => i))
  )

  // When systemPrompts changes, expand all by default
  useEffect(() => {
    setExpandedSet(new Set(systemPrompts.map((_, i) => i)))
  }, [systemPrompts])

  const toggleExpanded = (index: number) => {
    setExpandedSet(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const totalChars = systemPrompts.reduce((acc, p) => acc + p.length, 0)
  const estimatedTokens = Math.round(totalChars / 4) // rough estimate

  return (
    <div className="panel system-prompt-panel">
      <div className="panel-header">
        <div className="panel-title">
          <FileCode size={16} />
          <span>System Prompts</span>
        </div>
        <span className="panel-meta">{systemPrompts.length} prompt(s)</span>
      </div>

      <div className="panel-content">
        {systemPrompts.length === 0 ? (
          <div className="panel-empty">No system prompts</div>
        ) : (
          systemPrompts.map((prompt, index) => {
            const isExpanded = expandedSet.has(index)
            return (
              <div key={index} className="prompt-item">
                <button
                  className="prompt-header"
                  onClick={() => toggleExpanded(index)}
                >
                  {isExpanded ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                  <span className="prompt-label">Prompt {index + 1}</span>
                  <span className="prompt-chars">{prompt.length.toLocaleString()} chars</span>
                </button>
                {isExpanded && (
                  <div className="prompt-content animate-slide-down">
                    <MarkdownRenderer content={prompt} />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="panel-footer">
        ~{estimatedTokens.toLocaleString()} tokens (estimated)
      </div>

      <style>{`
        .system-prompt-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--md-cloud);
          border: var(--border-strong);
          border-radius: var(--radius-micro);
        }
        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-sm) var(--space-md);
          border-bottom: var(--border-strong);
          background: var(--md-fog);
          border-radius: var(--radius-micro) var(--radius-micro) 0 0;
        }
        .panel-title {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-weight: var(--font-weight-bold);
          font-size: var(--font-small);
          color: var(--md-graphite);
        }
        .panel-meta {
          font-size: var(--font-tiny);
          color: var(--md-slate);
        }
        .panel-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-sm);
          background: var(--md-cream);
        }
        .panel-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--md-slate);
          font-size: var(--font-small);
        }
        .prompt-item {
          margin-bottom: var(--space-xs);
        }
        .prompt-item:last-child {
          margin-bottom: 0;
        }
        .prompt-header {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          width: 100%;
          padding: var(--space-xs) var(--space-sm);
          background: var(--md-cloud);
          border: 1px solid var(--md-graphite);
          border-radius: var(--radius-micro);
          cursor: pointer;
          font-size: var(--font-small);
          text-align: left;
          transition: all var(--transition-quick);
        }
        .prompt-header:hover {
          background: var(--md-sunbeam);
          transform: var(--translate-hover);
          box-shadow: var(--shadow-translate);
        }
        .prompt-label {
          font-weight: var(--font-weight-bold);
          color: var(--md-graphite);
        }
        .prompt-chars {
          margin-left: auto;
          color: var(--md-slate);
          font-size: var(--font-tiny);
        }
        .prompt-content {
          margin-top: var(--space-xs);
          padding: var(--space-sm);
          background: var(--md-cloud);
          border-radius: var(--radius-micro);
          max-height: 400px;
          overflow-y: auto;
          font-size: var(--font-small);
          border: var(--border-strong);
        }
        .panel-footer {
          padding: var(--space-xs) var(--space-md);
          border-top: var(--border-strong);
          font-size: var(--font-tiny);
          color: var(--md-slate);
          text-align: right;
          background: var(--md-fog);
        }
      `}</style>
    </div>
  )
}

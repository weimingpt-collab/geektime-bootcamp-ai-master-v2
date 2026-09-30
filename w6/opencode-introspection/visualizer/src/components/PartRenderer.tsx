import { useState } from 'react'
import type {
  Part,
  TextPart,
  ThinkingPart,
  ToolInvocationPart,
  ToolPart,
  StepStartPart,
  StepFinishPart,
} from '../types/conversation'
import { ChevronDown, ChevronRight, Wrench, Brain, Play, CheckCircle } from 'lucide-react'
import { MarkdownRenderer } from './MarkdownRenderer'

interface PartRendererProps {
  part: Part
}

// Type guards for better type narrowing
function isTextPart(part: Part): part is TextPart {
  return part.type === 'text'
}

function isThinkingPart(part: Part): part is ThinkingPart {
  return part.type === 'thinking'
}

function isToolInvocationPart(part: Part): part is ToolInvocationPart {
  return part.type === 'tool-invocation'
}

function isToolPart(part: Part): part is ToolPart {
  return part.type === 'tool'
}

function isStepStartPart(part: Part): part is StepStartPart {
  return part.type === 'step-start'
}

function isStepFinishPart(part: Part): part is StepFinishPart {
  return part.type === 'step-finish'
}

export function PartRenderer({ part }: PartRendererProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isTextPart(part)) {
    return (
      <div className="part part-text">
        <MarkdownRenderer content={part.text} />
      </div>
    )
  }

  if (isThinkingPart(part)) {
    return (
      <div className="part part-thinking">
        <div className="part-header">
          <Brain size={14} />
          <span>Thinking</span>
        </div>
        <div className="part-content">
          <MarkdownRenderer content={part.text} />
        </div>
        <style>{`
          .part-thinking {
            background: rgba(255, 222, 0, 0.1);
            border: 1px solid var(--md-sunbeam);
            border-radius: var(--radius-micro);
            padding: var(--space-sm);
          }
          .part-thinking .part-header {
            display: flex;
            align-items: center;
            gap: var(--space-xs);
            font-size: var(--font-small);
            font-weight: var(--font-weight-bold);
            color: var(--md-sunbeam-dark);
            margin-bottom: var(--space-xs);
          }
        `}</style>
      </div>
    )
  }

  if (isToolInvocationPart(part)) {
    return (
      <div className="part part-tool">
        <button
          className="collapsible-trigger part-tool-header"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Wrench size={14} />
          <span className="tool-name">{part.tool}</span>
          <span className={`badge ${part.state === 'result' ? 'badge-success' : 'badge-info'}`}>
            {part.state}
          </span>
        </button>
        {isExpanded && (
          <div className="part-tool-content animate-slide-down">
            <div className="tool-section">
              <div className="tool-section-label">Input</div>
              <pre>{JSON.stringify(part.input, null, 2)}</pre>
            </div>
            {part.output !== undefined && (
              <div className="tool-section">
                <div className="tool-section-label">Output</div>
                <pre>
                  {typeof part.output === 'string'
                    ? part.output
                    : JSON.stringify(part.output, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
        <style>{toolStyles}</style>
      </div>
    )
  }

  if (isToolPart(part)) {
    const status = part.state?.status ?? 'unknown'
    return (
      <div className="part part-tool">
        <button
          className="collapsible-trigger part-tool-header"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <Wrench size={14} />
          <span className="tool-name">{part.tool}</span>
          <span className={`badge ${status === 'completed' ? 'badge-success' : 'badge-info'}`}>
            {status}
          </span>
        </button>
        {isExpanded && (
          <div className="part-tool-content animate-slide-down">
            {part.state?.input !== undefined && (
              <div className="tool-section">
                <div className="tool-section-label">Input</div>
                <pre>{JSON.stringify(part.state.input, null, 2)}</pre>
              </div>
            )}
            {part.state?.output !== undefined && (
              <div className="tool-section">
                <div className="tool-section-label">Output</div>
                <pre>
                  {typeof part.state.output === 'string'
                    ? part.state.output
                    : JSON.stringify(part.state.output, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
        <style>{toolStyles}</style>
      </div>
    )
  }

  if (isStepStartPart(part)) {
    return (
      <div className="part part-step">
        <Play size={12} />
        <span>Step started</span>
        <style>{`
          .part-step {
            display: flex;
            align-items: center;
            gap: var(--space-xs);
            font-size: var(--font-tiny);
            color: var(--md-slate);
            padding: var(--space-xs) 0;
          }
        `}</style>
      </div>
    )
  }

  if (isStepFinishPart(part)) {
    return (
      <div className="part part-step">
        <CheckCircle size={12} />
        <span>Step finished: {part.reason}</span>
      </div>
    )
  }

  // Fallback for unknown part types
  return (
    <div className="part part-unknown">
      <pre>{JSON.stringify(part, null, 2)}</pre>
      <style>{`
        .part-unknown {
          background: var(--md-fog);
          border-radius: var(--radius-micro);
          padding: var(--space-sm);
        }
        .part-unknown pre {
          font-size: var(--font-tiny);
          margin: 0;
          max-height: 150px;
          overflow: auto;
        }
      `}</style>
    </div>
  )
}

const toolStyles = `
  .part-tool {
    background: var(--md-soft-blue);
    border: 1px solid var(--md-sky);
    border-radius: var(--radius-micro);
  }
  .part-tool-header {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm);
    width: 100%;
    font-size: var(--font-small);
  }
  .tool-name {
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family-primary);
  }
  .part-tool-content {
    padding: var(--space-sm);
    border-top: 1px solid var(--md-sky);
  }
  .tool-section {
    margin-bottom: var(--space-sm);
  }
  .tool-section:last-child {
    margin-bottom: 0;
  }
  .tool-section-label {
    font-size: var(--font-tiny);
    font-weight: var(--font-weight-bold);
    color: var(--md-slate);
    margin-bottom: var(--space-xs);
    text-transform: uppercase;
  }
  .tool-section pre {
    font-size: var(--font-tiny);
    max-height: 200px;
    overflow: auto;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }
`

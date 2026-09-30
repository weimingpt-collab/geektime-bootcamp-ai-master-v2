import { useEffect, useRef } from 'react'
import type { MessageWithParts, Part } from '../types/conversation'
import { User, Bot, MessageSquare, Bell } from 'lucide-react'
import { MarkdownRenderer } from './MarkdownRenderer'

interface ChatHistoryPanelProps {
  messages: MessageWithParts[]
}

// Check if text content is a system-reminder
function isSystemReminder(text: string): boolean {
  const trimmed = text.trim()
  return trimmed.startsWith('<system-reminder>') || trimmed.includes('<system-reminder>')
}

export function ChatHistoryPanel({ messages }: ChatHistoryPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  // Filter out tool invocations, only show text, thinking, step-start, step-finish
  const filteredMessages = messages
    .map((msg) => ({
      ...msg,
      parts: msg.parts.filter((part) => part.type !== 'tool-invocation' && part.type !== 'tool'),
    }))
    .filter((msg) => msg.parts.length > 0)

  const totalTextParts = filteredMessages.reduce(
    (acc, msg) => acc + msg.parts.filter((p) => p.type === 'text').length,
    0,
  )

  // Scroll to top on messages change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [messages])

  return (
    <div className="panel chat-history-panel">
      <div className="panel-header">
        <div className="panel-title">
          <MessageSquare size={16} />
          <span>Chat History</span>
        </div>
        <span className="panel-meta">
          {messages.length} message(s), {totalTextParts} text part(s)
        </span>
      </div>

      <div className="panel-content" ref={contentRef}>
        {filteredMessages.length === 0 ? (
          <div className="panel-empty">No messages</div>
        ) : (
          [...filteredMessages].reverse().map((msg, idx) => (
            <ChatMessage key={msg.info.id || idx} message={msg} />
          ))
        )}
      </div>

      <style>{chatStyles}</style>
    </div>
  )
}

// Determine message type: 'user' | 'assistant' | 'system-reminder'
function getMessageType(message: MessageWithParts): 'user' | 'assistant' | 'system-reminder' {
  const { info, parts } = message

  // Check if this is a system-reminder message (user role but content is system-reminder)
  if (info.role === 'user') {
    const textParts = parts.filter((p) => p.type === 'text')
    const allSystemReminder = textParts.length > 0 && textParts.every((p) => {
      const text = (p as { text?: string }).text ?? ''
      return isSystemReminder(text)
    })
    if (allSystemReminder) {
      return 'system-reminder'
    }
  }

  return info.role
}

function ChatMessage({ message }: { message: MessageWithParts }) {
  const { info, parts } = message
  const messageType = getMessageType(message)
  const textParts = parts.filter((p) => p.type === 'text' || p.type === 'thinking')

  if (textParts.length === 0) {
    return null
  }

  const getIcon = () => {
    switch (messageType) {
      case 'user': return <User size={14} />
      case 'assistant': return <Bot size={14} />
      case 'system-reminder': return <Bell size={14} />
    }
  }

  const getBadgeClass = () => {
    switch (messageType) {
      case 'user': return 'badge-user'
      case 'assistant': return 'badge-assistant'
      case 'system-reminder': return 'badge-system'
    }
  }

  const getLabel = () => {
    switch (messageType) {
      case 'user': return 'user'
      case 'assistant': return 'assistant'
      case 'system-reminder': return 'system'
    }
  }

  return (
    <div className={`chat-message chat-${messageType}`}>
      <div className="chat-message-header">
        {getIcon()}
        <span className={`badge ${getBadgeClass()}`}>
          {getLabel()}
        </span>
        {info.agent && <span className="chat-agent">{info.agent}</span>}
      </div>
      <div className="chat-message-body">
        {textParts.map((part, idx) => (
          <ChatPart key={part.id || idx} part={part} />
        ))}
      </div>
    </div>
  )
}

function ChatPart({ part }: { part: Part }) {
  if (part.type === 'text') {
    return (
      <div className="chat-part chat-text">
        <MarkdownRenderer content={part.text as string} />
      </div>
    )
  }

  if (part.type === 'thinking') {
    return (
      <div className="chat-part chat-thinking">
        <div className="chat-thinking-label">Thinking</div>
        <MarkdownRenderer content={part.text as string} />
      </div>
    )
  }

  return null
}

const chatStyles = `
  .chat-history-panel {
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
  .chat-message {
    margin-bottom: var(--space-sm);
    padding: var(--space-sm);
    border-radius: var(--radius-micro);
    border: var(--border-strong);
    border-left-width: 4px;
    transition: all var(--transition-quick);
  }
  .chat-message:last-child {
    margin-bottom: 0;
  }
  .chat-message:hover {
    transform: var(--translate-hover);
    box-shadow: var(--shadow-translate);
  }
  .chat-user {
    background: var(--md-soft-blue);
    border-left-color: var(--md-sky-strong);
  }
  .chat-assistant {
    background: var(--md-cloud);
    border-left-color: #22c55e;
  }
  .chat-system-reminder {
    background: var(--md-fog);
    border-left-color: var(--md-slate);
    opacity: 0.85;
  }
  .badge-system {
    background: var(--md-slate);
    color: white;
  }
  .chat-message-header {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    margin-bottom: var(--space-xs);
    font-size: var(--font-small);
  }
  .chat-agent {
    font-size: var(--font-tiny);
    color: var(--md-slate);
  }
  .chat-message-body {
    font-size: var(--font-small);
  }
  .chat-part {
    margin-bottom: var(--space-xs);
  }
  .chat-part:last-child {
    margin-bottom: 0;
  }
  .chat-thinking {
    background: rgba(255, 222, 0, 0.15);
    border: var(--border-strong);
    border-color: var(--md-sunbeam-dark);
    border-radius: var(--radius-micro);
    padding: var(--space-xs);
  }
  .chat-thinking-label {
    font-size: var(--font-tiny);
    font-weight: var(--font-weight-bold);
    color: var(--md-sunbeam-dark);
    margin-bottom: var(--space-xs);
  }
`

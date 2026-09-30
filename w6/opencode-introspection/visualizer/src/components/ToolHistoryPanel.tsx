import { useState, useEffect, useRef } from 'react'
import type { MessageWithParts } from '../types/conversation'
import { ChevronDown, ChevronRight, Wrench, Terminal, FileEdit, ListTodo, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { MarkdownRenderer } from './MarkdownRenderer'
import * as Diff from 'diff'

// Check if tool is a shell/command tool
function isShellTool(toolName: string): boolean {
  const shellTools = ['Bash', 'bash', 'command', 'shell', 'terminal']
  return shellTools.some((t) => toolName.toLowerCase().includes(t.toLowerCase()))
}

// Check if tool is an edit tool (only Edit, not Write)
function isEditTool(toolName: string): boolean {
  return toolName === 'Edit' || toolName === 'edit'
}

// Check if tool is a TodoWrite tool
function isTodoTool(toolName: string): boolean {
  return toolName === 'TodoWrite' || toolName === 'todowrite' || toolName === 'todo_write'
}

interface TodoItem {
  id?: string
  content: string
  status: string
  priority?: string
  activeForm?: string
}

interface ToolHistoryPanelProps {
  messages: MessageWithParts[]
}

interface ToolInvocation {
  id: string
  tool: string
  input: unknown
  output?: unknown
  status: string
}

export function ToolHistoryPanel({ messages }: ToolHistoryPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Extract all tool invocations from messages (handle both 'tool' and 'tool-invocation' types)
  const toolInvocations: ToolInvocation[] = []

  for (const msg of messages) {
    for (const part of msg.parts) {
      if (part.type === 'tool-invocation') {
        // Legacy format
        toolInvocations.push({
          id: part.id,
          tool: part.tool as string,
          input: part.input,
          output: part.output,
          status: part.state as string,
        })
      } else if (part.type === 'tool') {
        // New format from opencode
        const state = part.state as { status: string; input?: unknown; output?: unknown }
        toolInvocations.push({
          id: part.id,
          tool: part.tool as string,
          input: state?.input,
          output: state?.output,
          status: state?.status ?? 'unknown',
        })
      }
    }
  }

  // Reversed list (newest first)
  const reversedTools = [...toolInvocations].reverse()

  // On messages change: scroll to top and expand newest tool
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
    // Expand the first (newest) tool
    const firstTool = reversedTools[0]
    if (firstTool) {
      setExpandedId(firstTool.id)
    } else {
      setExpandedId(null)
    }
  }, [messages])

  return (
    <div className="panel tool-history-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Wrench size={16} />
          <span>Tool Invocations</span>
        </div>
        <span className="panel-meta">{toolInvocations.length} call(s)</span>
      </div>

      <div className="panel-content" ref={contentRef}>
        {reversedTools.length === 0 ? (
          <div className="panel-empty">No tool invocations</div>
        ) : (
          reversedTools.map((tool, idx) => (
            <ToolItem
              key={tool.id || idx}
              tool={tool}
              isExpanded={expandedId === tool.id}
              onToggle={() => setExpandedId(expandedId === tool.id ? null : tool.id)}
            />
          ))
        )}
      </div>

      <style>{toolStyles}</style>
    </div>
  )
}

// Render shell command input with terminal styling
function renderShellInput(input: unknown) {
  if (!input || typeof input !== 'object') {
    return <pre className="shell-pre">{JSON.stringify(input, null, 2)}</pre>
  }

  const obj = input as Record<string, unknown>
  const { command, description, ...rest } = obj

  return (
    <div className="shell-input">
      {typeof command === 'string' && (
        <div className="shell-command-section">
          <div className="shell-label">command:</div>
          <div className="shell-command-box">
            <code className="shell-command">{command}</code>
          </div>
        </div>
      )}
      {typeof description === 'string' && (
        <div className="shell-description-section">
          <span className="shell-label">description:</span>
          <span className="shell-description">{description}</span>
        </div>
      )}
      {Object.keys(rest).length > 0 && (
        <div className="shell-extra">
          {Object.entries(rest).map(([key, value]) => (
            <div key={key} className="shell-extra-field">
              <span className="shell-label">{key}:</span>
              <span className="shell-extra-value">
                {typeof value === 'string' ? value : JSON.stringify(value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Render shell output with terminal styling
function renderShellOutput(output: unknown) {
  const text = typeof output === 'string' ? output : JSON.stringify(output, null, 2)
  return (
    <div className="shell-output-box">
      <pre className="shell-output">{text}</pre>
    </div>
  )
}

// Render edit tool input as diff view
function renderEditInput(input: unknown) {
  if (!input || typeof input !== 'object') {
    return <pre>{JSON.stringify(input, null, 2)}</pre>
  }

  const obj = input as Record<string, unknown>
  // Support both camelCase and snake_case field names
  const oldString = obj.oldString ?? obj.old_string
  const newString = obj.newString ?? obj.new_string
  const filePath = obj.filePath ?? obj.file_path

  // Remove these fields from rest
  const { oldString: _o1, old_string: _o2, newString: _n1, new_string: _n2, filePath: _f1, file_path: _f2, ...rest } = obj

  const oldStr = typeof oldString === 'string' ? oldString : ''
  const newStr = typeof newString === 'string' ? newString : ''

  // Generate diff
  const diffParts = Diff.diffLines(oldStr, newStr)

  return (
    <div className="edit-input">
      {typeof filePath === 'string' && (
        <div className="edit-file-path">
          <span className="edit-label">file:</span>
          <code className="edit-path">{filePath}</code>
        </div>
      )}
      {Object.keys(rest).length > 0 && (
        <div className="edit-extra">
          {Object.entries(rest).map(([key, value]) => (
            <div key={key} className="edit-extra-field">
              <span className="edit-label">{key}:</span>
              <span className="edit-extra-value">
                {typeof value === 'string' ? value : JSON.stringify(value)}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="diff-container">
        <div className="diff-header">
          <span className="diff-removed-indicator">- removed</span>
          <span className="diff-added-indicator">+ added</span>
        </div>
        <pre className="diff-content">
          {diffParts.map((part, idx) => {
            const className = part.added
              ? 'diff-added'
              : part.removed
                ? 'diff-removed'
                : 'diff-unchanged'
            const prefix = part.added ? '+' : part.removed ? '-' : ' '
            const lines = part.value.split('\n')
            // Remove last empty line from split
            if (lines[lines.length - 1] === '') lines.pop()
            return lines.map((line, lineIdx) => (
              <div key={`${idx}-${lineIdx}`} className={`diff-line ${className}`}>
                <span className="diff-prefix">{prefix}</span>
                <span className="diff-text">{line}</span>
              </div>
            ))
          })}
        </pre>
      </div>
    </div>
  )
}

// Render todo list from TodoWrite input
function renderTodoInput(input: unknown, output?: unknown) {
  if (!input || typeof input !== 'object') {
    return <pre>{JSON.stringify(input, null, 2)}</pre>
  }

  const obj = input as Record<string, unknown>
  const todos = obj.todos as TodoItem[] | undefined

  if (!Array.isArray(todos)) {
    return <pre>{JSON.stringify(input, null, 2)}</pre>
  }

  // Get output todos to compare for highlighting changes
  const outputTodos = output && typeof output === 'object'
    ? (output as Record<string, unknown>).todos as TodoItem[] | undefined
    : undefined

  // Create a map of output todos by content for comparison
  const outputMap = new Map<string, TodoItem>()
  if (Array.isArray(outputTodos)) {
    outputTodos.forEach(t => outputMap.set(t.content, t))
  }

  return (
    <div className="todo-list">
      {todos.map((todo, idx) => {
        const outputTodo = outputMap.get(todo.content)
        const isNew = !outputTodo
        const statusChanged = outputTodo && outputTodo.status !== todo.status

        return (
          <div
            key={todo.id || idx}
            className={`todo-item ${isNew ? 'todo-new' : ''} ${statusChanged ? 'todo-changed' : ''}`}
          >
            <span className="todo-status-icon">
              {todo.status === 'completed' ? (
                <CheckCircle2 size={14} className="todo-completed" />
              ) : todo.status === 'in_progress' ? (
                <Loader2 size={14} className="todo-in-progress" />
              ) : (
                <Circle size={14} className="todo-pending" />
              )}
            </span>
            <span className={`todo-content ${todo.status === 'completed' ? 'todo-content-done' : ''}`}>
              {todo.content}
            </span>
            <span className={`todo-status-badge todo-status-${todo.status}`}>
              {todo.status}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Render input as frontmatter + markdown for prompt field
function renderToolInput(input: unknown) {
  if (!input || typeof input !== 'object') {
    return <pre>{JSON.stringify(input, null, 2)}</pre>
  }

  const obj = input as Record<string, unknown>
  const { prompt, ...rest } = obj

  // Fields to show as frontmatter (everything except prompt)
  const frontmatterFields = Object.entries(rest)

  return (
    <div className="tool-input-formatted">
      {frontmatterFields.length > 0 && (
        <div className="tool-frontmatter">
          {frontmatterFields.map(([key, value]) => (
            <div key={key} className="tool-fm-field">
              <span className="tool-fm-key">{key}:</span>
              <span className="tool-fm-value">
                {typeof value === 'string' ? value : JSON.stringify(value)}
              </span>
            </div>
          ))}
        </div>
      )}
      {typeof prompt === 'string' && prompt && (
        <div className="tool-prompt">
          <div className="tool-prompt-label">prompt</div>
          <div className="tool-prompt-content">
            <MarkdownRenderer content={prompt} />
          </div>
        </div>
      )}
    </div>
  )
}

interface ToolItemProps {
  tool: ToolInvocation
  isExpanded: boolean
  onToggle: () => void
}

function ToolItem({ tool, isExpanded, onToggle }: ToolItemProps) {
  const isShell = isShellTool(tool.tool)
  const isEdit = isEditTool(tool.tool)
  const isTodo = isTodoTool(tool.tool)

  const getIcon = () => {
    if (isShell) return <Terminal size={14} />
    if (isEdit) return <FileEdit size={14} />
    if (isTodo) return <ListTodo size={14} />
    return <Wrench size={14} />
  }

  const getItemClass = () => {
    if (isShell) return 'tool-item-shell'
    if (isEdit) return 'tool-item-edit'
    if (isTodo) return 'tool-item-todo'
    return ''
  }

  const renderInput = () => {
    if (isShell) return renderShellInput(tool.input)
    if (isEdit) return renderEditInput(tool.input)
    if (isTodo) return renderTodoInput(tool.input, tool.output)
    return renderToolInput(tool.input)
  }

  return (
    <div className={`tool-item ${getItemClass()}`}>
      <button className="tool-header" onClick={onToggle}>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {getIcon()}
        <span className="tool-name">{tool.tool}</span>
        <span className={`badge ${tool.status === 'completed' || tool.status === 'result' ? 'badge-success' : 'badge-info'}`}>
          {tool.status}
        </span>
      </button>
      {isExpanded && (
        <div className={`tool-content animate-slide-down ${isShell ? 'shell-content' : ''}`}>
          <div className="tool-section">
            <div className="tool-section-label">
              {isShell ? 'INPUT' : isTodo ? 'Todo List' : 'Input'}
            </div>
            {renderInput()}
          </div>
          {tool.output !== undefined && !isTodo && (
            <div className="tool-section">
              <div className="tool-section-label">{isShell ? 'OUTPUT' : 'Output'}</div>
              {isShell ? (
                renderShellOutput(tool.output)
              ) : (
                <pre>
                  {typeof tool.output === 'string'
                    ? tool.output
                    : JSON.stringify(tool.output, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const toolStyles = `
  .tool-history-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--md-cloud);
    border: var(--border-strong);
    border-radius: var(--radius-micro);
  }
  .tool-input-formatted {
    font-size: var(--font-tiny);
  }
  .tool-frontmatter {
    background: var(--md-fog);
    border-radius: var(--radius-micro);
    padding: var(--space-xs);
    margin-bottom: var(--space-xs);
    font-family: var(--font-family-primary);
    border: 1px solid var(--md-graphite);
  }
  .tool-fm-field {
    display: flex;
    gap: var(--space-xs);
    padding: 2px 0;
  }
  .tool-fm-key {
    color: var(--md-slate);
    font-weight: var(--font-weight-bold);
    flex-shrink: 0;
  }
  .tool-fm-value {
    color: var(--md-ink);
    word-break: break-word;
  }
  .tool-prompt {
    background: var(--md-cloud);
    border-radius: var(--radius-micro);
    padding: var(--space-xs);
    border: var(--border-strong);
  }
  .tool-prompt-label {
    font-size: var(--font-tiny);
    font-weight: var(--font-weight-bold);
    color: var(--md-graphite);
    text-transform: uppercase;
    margin-bottom: var(--space-xs);
  }
  .tool-prompt-content {
    font-size: var(--font-small);
    max-height: 300px;
    overflow-y: auto;
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
  .tool-item {
    margin-bottom: var(--space-xs);
    background: var(--md-cloud);
    border: var(--border-strong);
    border-radius: var(--radius-micro);
    transition: all var(--transition-quick);
  }
  .tool-item:last-child {
    margin-bottom: 0;
  }
  .tool-item:hover {
    transform: var(--translate-hover);
    box-shadow: var(--shadow-translate);
  }
  .tool-header {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    width: 100%;
    padding: var(--space-sm);
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--font-small);
    text-align: left;
  }
  .tool-name {
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family-primary);
    color: var(--md-graphite);
  }
  .tool-content {
    padding: var(--space-sm);
    border-top: var(--border-strong);
    background: var(--md-fog);
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
    color: var(--md-graphite);
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
    background: var(--md-cloud);
    padding: var(--space-xs);
    border-radius: var(--radius-micro);
    border: 1px solid var(--md-graphite);
  }

  /* Shell/Command styling - light theme */
  .tool-item-shell {
    background: var(--md-cloud);
    border: var(--border-strong);
  }
  .tool-item-shell .tool-header {
    color: var(--md-graphite);
  }
  .tool-item-shell .tool-name {
    color: var(--md-graphite);
  }
  .shell-content {
    background: var(--md-fog);
  }
  .tool-item-shell .tool-section-label {
    color: var(--md-slate);
    font-size: 11px;
    letter-spacing: 1px;
  }
  .shell-input {
    font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 12px;
  }
  .shell-label {
    color: var(--md-sunbeam-dark);
    font-weight: var(--font-weight-bold);
  }
  .shell-command-section {
    margin-bottom: var(--space-sm);
  }
  .shell-command-box {
    background: var(--md-cream);
    border: 1px solid var(--md-graphite);
    border-radius: var(--radius-micro);
    padding: var(--space-sm);
    margin-top: 4px;
    overflow-x: auto;
  }
  .shell-command {
    color: var(--md-graphite);
    font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .shell-description-section {
    display: flex;
    gap: var(--space-xs);
    font-style: italic;
  }
  .shell-description {
    color: var(--md-sky-strong);
  }
  .shell-extra {
    margin-top: var(--space-xs);
    padding-top: var(--space-xs);
    border-top: 1px solid var(--md-slate);
  }
  .shell-extra-field {
    display: flex;
    gap: var(--space-xs);
  }
  .shell-extra-value {
    color: var(--md-ink);
  }
  .shell-output-box {
    background: var(--md-cream);
    border: 1px solid var(--md-graphite);
    border-radius: var(--radius-micro);
    max-height: 300px;
    overflow: auto;
  }
  .shell-output {
    margin: 0;
    padding: var(--space-sm);
    color: var(--md-slate);
    font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-word;
    background: transparent;
    border: none;
  }

  /* Edit/Diff styling */
  .tool-item-edit {
    background: var(--md-cloud);
    border: var(--border-strong);
  }
  .edit-input {
    font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 12px;
  }
  .edit-file-path {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    margin-bottom: var(--space-sm);
    padding-bottom: var(--space-xs);
    border-bottom: 1px solid var(--md-fog);
  }
  .edit-label {
    color: var(--md-sunbeam-dark);
    font-weight: var(--font-weight-bold);
  }
  .edit-path {
    color: var(--md-sky-strong);
    background: var(--md-fog);
    padding: 2px 6px;
    border-radius: var(--radius-micro);
  }
  .edit-extra {
    margin-bottom: var(--space-sm);
  }
  .edit-extra-field {
    display: flex;
    gap: var(--space-xs);
  }
  .edit-extra-value {
    color: var(--md-ink);
  }
  .diff-container {
    border: 1px solid var(--md-graphite);
    border-radius: var(--radius-micro);
    overflow: hidden;
  }
  .diff-header {
    display: flex;
    gap: var(--space-md);
    padding: var(--space-xs) var(--space-sm);
    background: var(--md-fog);
    border-bottom: 1px solid var(--md-graphite);
    font-size: 11px;
  }
  .diff-removed-indicator {
    color: var(--md-watermelon);
  }
  .diff-added-indicator {
    color: var(--md-sky-strong);
  }
  .diff-content {
    margin: 0;
    padding: 0;
    background: var(--md-cream);
    max-height: 400px;
    overflow: auto;
  }
  .diff-line {
    display: flex;
    padding: 1px var(--space-sm);
    font-family: 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 12px;
    line-height: 1.5;
  }
  .diff-prefix {
    width: 16px;
    flex-shrink: 0;
    user-select: none;
    color: var(--md-slate);
  }
  .diff-text {
    white-space: pre-wrap;
    word-break: break-all;
  }
  .diff-added {
    background: var(--md-soft-blue);
  }
  .diff-added .diff-prefix {
    color: var(--md-sky-strong);
  }
  .diff-added .diff-text {
    color: var(--md-sky-strong);
  }
  .diff-removed {
    background: rgba(255, 113, 105, 0.15);
  }
  .diff-removed .diff-prefix {
    color: var(--md-watermelon);
  }
  .diff-removed .diff-text {
    color: var(--md-watermelon);
  }
  .diff-unchanged {
    background: transparent;
  }
  .diff-unchanged .diff-text {
    color: var(--md-slate);
  }

  /* Todo list styling - MotherDuck design */
  .tool-item-todo {
    background: var(--md-cloud);
    border: var(--border-strong);
  }
  .todo-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }
  .todo-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-xs) var(--space-sm);
    background: var(--md-cream);
    border-radius: var(--radius-micro);
    border: 1px solid var(--md-graphite);
    transition: all var(--transition-quick);
  }
  .todo-item.todo-new {
    background: var(--md-soft-blue);
    border-color: var(--md-sky-strong);
  }
  .todo-item.todo-changed {
    background: rgba(255, 222, 0, 0.2);
    border-color: var(--md-sunbeam-dark);
  }
  .todo-status-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }
  .todo-completed {
    color: var(--md-sky-strong);
  }
  .todo-in-progress {
    color: var(--md-sunbeam-dark);
    animation: spin 1s linear infinite;
  }
  .todo-pending {
    color: var(--md-slate);
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .todo-content {
    flex: 1;
    font-size: var(--font-small);
    color: var(--md-ink);
  }
  .todo-content-done {
    text-decoration: line-through;
    color: var(--md-slate);
  }
  .todo-status-badge {
    font-size: var(--font-tiny);
    padding: 2px var(--space-xs);
    border-radius: var(--radius-micro);
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
    border: 1px solid var(--md-graphite);
  }
  .todo-status-completed {
    background: var(--md-soft-blue);
    color: var(--md-sky-strong);
  }
  .todo-status-in_progress {
    background: var(--md-sunbeam);
    color: var(--md-graphite);
  }
  .todo-status-pending {
    background: var(--md-fog);
    color: var(--md-slate);
  }
`

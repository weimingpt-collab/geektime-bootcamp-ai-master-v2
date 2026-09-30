import { useState, useCallback, useEffect } from 'react'
import type { Conversation, Turn, MessageWithParts } from './types/conversation'
import { parseJSONL, groupIntoTurns } from './utils/parser'
import { LogListPanel } from './components/LogListPanel'
import { NavigationHeader } from './components/NavigationHeader'
import { SystemPromptPanel } from './components/SystemPromptPanel'
import { ChatHistoryPanel } from './components/ChatHistoryPanel'
import { ToolHistoryPanel } from './components/ToolHistoryPanel'
import { StatusBar } from './components/StatusBar'
import { FileSelector } from './components/FileSelector'

interface LogFile {
  name: string
  content: string
}

export default function App() {
  const [files, setFiles] = useState<LogFile[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false)

  // Load conversation when file is selected
  useEffect(() => {
    if (selectedFile) {
      const file = files.find((f) => f.name === selectedFile)
      if (file) {
        const entries = parseJSONL(file.content)
        const conv = groupIntoTurns(entries)
        setConversation(conv)
        setCurrentTurnIndex(0)
      }
    } else {
      setConversation(null)
    }
  }, [selectedFile, files])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!conversation) return
      if (e.key === 'ArrowLeft' && currentTurnIndex > 0) {
        setCurrentTurnIndex(currentTurnIndex - 1)
      } else if (e.key === 'ArrowRight' && currentTurnIndex < conversation.turns.length - 1) {
        setCurrentTurnIndex(currentTurnIndex + 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [conversation, currentTurnIndex])

  const handleAddFiles = useCallback((newFiles: LogFile[]) => {
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name))
      const unique = newFiles.filter((f) => !existing.has(f.name))
      return [...prev, ...unique]
    })
  }, [])

  const handleSelectFile = useCallback((file: LogFile) => {
    setSelectedFile(file.name)
  }, [])

  const handleRemoveFile = useCallback(
    (name: string) => {
      setFiles((prev) => prev.filter((f) => f.name !== name))
      if (selectedFile === name) {
        setSelectedFile(null)
      }
    },
    [selectedFile],
  )

  const handleFileLoad = useCallback(
    (content: string, name: string) => {
      const newFile = { name, content }
      handleAddFiles([newFile])
      setSelectedFile(name)
    },
    [handleAddFiles],
  )

  // Global drag and drop handlers
  const handleGlobalDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingGlobal(true)
  }, [])

  const handleGlobalDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set to false if leaving the window
    if (e.relatedTarget === null) {
      setIsDraggingGlobal(false)
    }
  }, [])

  const handleGlobalDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingGlobal(false)

      const fileList = e.dataTransfer.files
      const newFiles: LogFile[] = []
      const promises: Promise<void>[] = []

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]
        if (file && file.name.endsWith('.jsonl')) {
          promises.push(
            new Promise((resolve) => {
              const reader = new FileReader()
              reader.onload = (ev) => {
                newFiles.push({
                  name: file.name,
                  content: ev.target?.result as string,
                })
                resolve()
              }
              reader.readAsText(file)
            }),
          )
        }
      }

      Promise.all(promises).then(() => {
        if (newFiles.length > 0) {
          handleAddFiles(newFiles)
          // Select the first new file
          if (newFiles[0]) {
            setSelectedFile(newFiles[0].name)
          }
        }
      })
    },
    [handleAddFiles],
  )

  // Get current turn data
  const currentTurn: Turn | null = conversation?.turns[currentTurnIndex] ?? null
  const systemPrompts: string[] = currentTurn?.input?.input?.system ?? []
  const inputMessages: MessageWithParts[] = currentTurn?.input?.input?.messages ?? []

  // Combine input messages with output parts for display
  const allMessages: MessageWithParts[] = [...inputMessages]
  if (currentTurn?.output?.output) {
    const { message, parts } = currentTurn.output.output
    allMessages.push({ info: message, parts })
  }

  // Estimate tokens for messages
  const messagesTokenEstimate = Math.round(
    allMessages.reduce((acc, msg) => {
      const textLength = msg.parts
        .filter((p) => p.type === 'text' || p.type === 'thinking')
        .reduce((sum, p) => {
          const text = (p as { text?: string }).text ?? ''
          return sum + text.length
        }, 0)
      return acc + textLength
    }, 0) / 4,
  )

  return (
    <div
      className={`app ${isDraggingGlobal ? 'dragging' : ''}`}
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
    >
      {isDraggingGlobal && (
        <div className="global-drop-overlay">
          <div className="global-drop-content">
            <span>Drop JSONL files here</span>
          </div>
        </div>
      )}
      <LogListPanel
        files={files}
        selectedFile={selectedFile}
        onSelectFile={handleSelectFile}
        onAddFiles={handleAddFiles}
        onRemoveFile={handleRemoveFile}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="main-area">
        {conversation && currentTurn ? (
          <>
            <NavigationHeader
              fileName={selectedFile ?? ''}
              turns={conversation.turns}
              currentTurnIndex={currentTurnIndex}
              onNavigate={setCurrentTurnIndex}
            />

            <div className="content-area">
              <div className="content-left">
                <SystemPromptPanel systemPrompts={systemPrompts} />
              </div>
              <div className="content-right">
                <div className="content-right-top">
                  <ChatHistoryPanel messages={allMessages} />
                </div>
                <div className="content-right-bottom">
                  <ToolHistoryPanel messages={allMessages} />
                </div>
              </div>
            </div>

            <StatusBar
              turn={currentTurn}
              systemPrompts={systemPrompts}
              messagesTokenEstimate={messagesTokenEstimate}
            />
          </>
        ) : (
          <div className="empty-state">
            <FileSelector onFileLoad={handleFileLoad} />
          </div>
        )}
      </div>

      <style>{`
        .app {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: var(--md-cream);
        }
        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
        }
        .content-area {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-lg);
          padding: var(--space-lg);
          overflow: hidden;
          background: var(--md-cream);
        }
        .content-left {
          min-height: 0;
          overflow: hidden;
        }
        .content-right {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
          min-height: 0;
          overflow: hidden;
        }
        .content-right-top {
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }
        .content-right-bottom {
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }
        .empty-state {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--md-cream);
        }
        .global-drop-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 222, 0, 0.15);
          border: var(--border-bold);
          border-style: dashed;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .global-drop-content {
          background: var(--md-cloud);
          padding: var(--space-lg) var(--space-xl);
          border: var(--border-strong);
          border-radius: var(--radius-micro);
          box-shadow: var(--shadow-translate);
          font-size: var(--font-h3);
          font-weight: var(--font-weight-bold);
          color: var(--md-ink);
        }
        .app.dragging * {
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

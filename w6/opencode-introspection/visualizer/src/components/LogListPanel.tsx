import { useState, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, Upload, FileJson, Trash2 } from 'lucide-react'

interface LogFile {
  name: string
  content: string
}

interface LogListPanelProps {
  files: LogFile[]
  selectedFile: string | null
  onSelectFile: (file: LogFile) => void
  onAddFiles: (files: LogFile[]) => void
  onRemoveFile: (name: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function LogListPanel({
  files,
  selectedFile,
  onSelectFile,
  onAddFiles,
  onRemoveFile,
  isCollapsed,
  onToggleCollapse,
}: LogListPanelProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const newFiles: LogFile[] = []
      const promises: Promise<void>[] = []

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]
        if (file && file.name.endsWith('.jsonl')) {
          promises.push(
            new Promise((resolve) => {
              const reader = new FileReader()
              reader.onload = (e) => {
                newFiles.push({
                  name: file.name,
                  content: e.target?.result as string,
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
          onAddFiles(newFiles)
        }
      })
    },
    [onAddFiles],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files)
      }
    },
    [handleFiles],
  )

  if (isCollapsed) {
    return (
      <aside className="sidebar sidebar-collapsed">
        <button className="sidebar-toggle" onClick={onToggleCollapse} title="Expand sidebar">
          <ChevronRight size={16} />
        </button>
        <div className="sidebar-collapsed-content">
          <span className="sidebar-collapsed-count">{files.length}</span>
          <span className="sidebar-collapsed-label">logs</span>
        </div>
        <style>{sidebarStyles}</style>
      </aside>
    )
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Log Files</h2>
        <button className="sidebar-toggle" onClick={onToggleCollapse} title="Collapse sidebar">
          <ChevronLeft size={16} />
        </button>
      </div>

      <div
        className={`drop-zone-mini ${isDragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={16} />
        <span>Drop files or click to add</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jsonl"
        multiple
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      <div className="file-list">
        {files.length === 0 ? (
          <div className="file-list-empty">
            <FileJson size={32} />
            <p>No log files loaded</p>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.name}
              className={`file-item ${selectedFile === file.name ? 'selected' : ''}`}
              onClick={() => onSelectFile(file)}
            >
              <FileJson size={14} />
              <span className="file-name" title={file.name}>
                {formatFileName(file.name)}
              </span>
              <button
                className="file-remove"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveFile(file.name)
                }}
                title="Remove file"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>
      <style>{sidebarStyles}</style>
    </aside>
  )
}

function formatFileName(name: string): string {
  // Format: ses_xxx_conversationID.jsonl -> conversationID
  const match = name.match(/_([a-f0-9]{8})\.jsonl$/)
  if (match?.[1]) {
    return match[1]
  }
  return name.replace('.jsonl', '')
}

const sidebarStyles = `
  .sidebar {
    width: 240px;
    min-width: 240px;
    background: var(--md-cloud);
    border-right: var(--border-strong);
    display: flex;
    flex-direction: column;
    height: 100%;
    transition: width var(--transition-quick), min-width var(--transition-quick);
  }
  .sidebar-collapsed {
    width: 48px;
    min-width: 48px;
    align-items: center;
    padding: var(--space-sm);
    background: var(--md-cloud);
  }
  .sidebar-collapsed-content {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    color: var(--md-slate);
    font-size: var(--font-small);
    margin-top: var(--space-md);
  }
  .sidebar-collapsed-count {
    font-weight: var(--font-weight-bold);
    color: var(--md-ink);
  }
  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md);
    border-bottom: var(--border-strong);
    background: var(--md-fog);
  }
  .sidebar-header h2 {
    font-size: var(--font-body);
    font-weight: var(--font-weight-bold);
    margin: 0;
    color: var(--md-graphite);
  }
  .sidebar-toggle {
    background: none;
    border: 1px solid var(--md-graphite);
    padding: var(--space-xs);
    cursor: pointer;
    color: var(--md-graphite);
    border-radius: var(--radius-micro);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-quick);
  }
  .sidebar-toggle:hover {
    background: var(--md-sunbeam);
    color: var(--md-graphite);
  }
  .drop-zone-mini {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    margin: var(--space-sm);
    border: 2px dashed var(--md-slate);
    border-radius: var(--radius-micro);
    cursor: pointer;
    font-size: var(--font-small);
    color: var(--md-slate);
    transition: all var(--transition-quick);
  }
  .drop-zone-mini:hover, .drop-zone-mini.drag-over {
    border-color: var(--md-graphite);
    color: var(--md-graphite);
    background: var(--md-sunbeam);
  }
  .file-list {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-sm);
  }
  .file-list-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--md-slate);
    gap: var(--space-sm);
  }
  .file-list-empty p {
    margin: 0;
    font-size: var(--font-small);
  }
  .file-item {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm);
    border-radius: var(--radius-micro);
    cursor: pointer;
    font-size: var(--font-small);
    color: var(--md-ink);
    transition: all var(--transition-quick);
    border: 1px solid transparent;
  }
  .file-item:hover {
    background: var(--md-fog);
    border-color: var(--md-slate);
  }
  .file-item.selected {
    background: var(--md-sunbeam);
    border: var(--border-strong);
    font-weight: var(--font-weight-bold);
  }
  .file-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-family-primary);
  }
  .file-remove {
    background: none;
    border: none;
    padding: var(--space-xs);
    cursor: pointer;
    color: var(--md-slate);
    opacity: 0;
    transition: opacity var(--transition-quick);
    display: flex;
    align-items: center;
  }
  .file-item:hover .file-remove {
    opacity: 1;
  }
  .file-remove:hover {
    color: var(--md-watermelon);
  }
`

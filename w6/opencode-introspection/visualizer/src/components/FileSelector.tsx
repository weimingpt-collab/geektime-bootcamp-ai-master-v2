import { useState, useCallback, useRef } from 'react'
import { Upload, FileJson } from 'lucide-react'

interface FileSelectorProps {
  onFileLoad: (content: string, fileName: string) => void
}

export function FileSelector({ onFileLoad }: FileSelectorProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      onFileLoad(content, file.name)
    }
    reader.readAsText(file)
  }, [onFileLoad])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.jsonl')) {
      handleFile(file)
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  return (
    <div className="file-selector-container">
      <div
        className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <div className="drop-zone-content">
          <div className="drop-zone-icon">
            {isDragOver ? <FileJson size={48} /> : <Upload size={48} />}
          </div>
          <h2>Drop JSONL file here</h2>
          <p>or click to browse</p>
          <p className="drop-zone-hint">
            Supports conversation log files from OpenCode plugin
          </p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".jsonl"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
      <style>{`
        .file-selector-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
          width: 100%;
          padding: var(--space-lg);
        }
        .drop-zone {
          max-width: 500px;
          width: 100%;
          padding: var(--space-xl);
          border: 2px dashed var(--md-slate);
          border-radius: var(--radius-micro);
          cursor: pointer;
          transition: all var(--transition-quick);
          background: var(--md-cloud);
        }
        .drop-zone:hover {
          border-color: var(--md-sky-strong);
          background: var(--md-soft-blue);
        }
        .drop-zone.drag-over {
          border-color: var(--md-sky-strong);
          background: var(--md-soft-blue);
          border-style: solid;
        }
        .drop-zone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-md);
        }
        .drop-zone-icon {
          color: var(--md-slate);
          transition: color var(--transition-quick);
        }
        .drop-zone:hover .drop-zone-icon,
        .drop-zone.drag-over .drop-zone-icon {
          color: var(--md-sky-strong);
        }
        .drop-zone h2 {
          font-size: var(--font-h3);
          margin: 0;
        }
        .drop-zone p {
          color: var(--md-slate);
          margin: 0;
        }
        .drop-zone-hint {
          font-size: var(--font-small);
          margin-top: var(--space-sm);
        }
      `}</style>
    </div>
  )
}

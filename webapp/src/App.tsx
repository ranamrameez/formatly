import { useState } from 'react'
import JSZip from 'jszip'
import { FileDropzone } from './components/FileDropzone'
import { FormatControls } from './components/FormatControls'
import { QueueList } from './components/QueueList'
import type { OutputFormat, QueueItem } from './types'
import './App.css'

const supportedTypes = ['image/png', 'image/jpeg', 'image/webp']

type View = 'Convert' | 'Compress' | 'Recent'

function App() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [format, setFormat] = useState<OutputFormat>('jpg')
  const [quality, setQuality] = useState(82)
  const [activeView, setActiveView] = useState<View>('Convert')
  const [isDragging, setIsDragging] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  const addFiles = (files: File[]) => {
    const accepted = files.filter((file) => supportedTypes.includes(file.type))
    const rejectedCount = files.length - accepted.length
    const newItems = accepted.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      status: 'Ready' as const,
      progress: 0,
      message: rejectedCount ? `${rejectedCount} unsupported file(s) skipped` : undefined,
    }))
    setItems((current) => [...current, ...newItems])
  }

  const convertBatch = async () => {
    if (isConverting) return
    setIsConverting(true)
    for (const item of items.filter((entry) => entry.status !== 'Done')) {
      await convertItem(item)
    }
    setIsConverting(false)
  }

  const convertItem = (item: QueueItem) => new Promise<void>((resolve) => {
    updateItem(item.id, { status: 'Converting', progress: 10, message: undefined })
    const source = URL.createObjectURL(item.file)
    const image = new Image()
    image.onload = () => {
      updateItem(item.id, { progress: 55 })
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      canvas.getContext('2d')?.drawImage(image, 0, 0)
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(source)
        if (!blob) {
          updateItem(item.id, { status: 'Error', progress: 0, message: 'Could not create output' })
        } else {
          const reduction = Math.max(0, Math.round((1 - blob.size / item.file.size) * 100))
          updateItem(item.id, { status: 'Done', progress: 100, output: blob, message: `${reduction}% size change` })
        }
        resolve()
      }, `image/${format}`, format === 'jpg' ? quality / 100 : undefined)
    }
    image.onerror = () => {
      URL.revokeObjectURL(source)
      updateItem(item.id, { status: 'Error', progress: 0, message: 'Could not read image' })
      resolve()
    }
    image.src = source
  })

  const updateItem = (id: string, changes: Partial<QueueItem>) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item))
  }

  const downloadItem = (item: QueueItem) => {
    if (!item.output) return
    downloadBlob(item.output, `${withoutExtension(item.file.name)}.${format}`)
  }

  const downloadBatch = async () => {
    const zip = new JSZip()
    items.filter((item) => item.status === 'Done' && item.output).forEach((item) => {
      zip.file(`${withoutExtension(item.file.name)}.${format}`, item.output!)
    })
    const archive = await zip.generateAsync({ type: 'blob' })
    downloadBlob(archive, 'file-utility-batch.zip')
  }

  const showWorkspace = activeView !== 'Recent'

  return (
    <main className="app-shell">
      <header className="topbar navbar navbar-expand">
        <div className="brand"><span className="brand-mark">↗</span><span>File Utility</span></div>
        <nav className="nav nav-underline ms-auto me-4" aria-label="Primary navigation">
          {(['Convert', 'Compress', 'Recent'] as const).map((view) => (
            <button key={view} className={activeView === view ? 'nav-link active' : 'nav-link'} onClick={() => setActiveView(view)}>{view}</button>
          ))}
        </nav>
        <button className="icon-button" title="Settings" aria-label="Settings">⚙</button>
      </header>
      <section className="workspace">
        <div className="intro">
          <div>
            <p className="eyebrow">{activeView === 'Compress' ? 'FILE OPTIMIZATION' : 'DOCUMENT WORKBENCH'}</p>
            <h1>{activeView === 'Recent' ? 'Your recent work' : 'Make files lighter.'}</h1>
            <p className="subtitle">Convert, compress, and batch-download files without sending them anywhere.</p>
          </div>
          <div className="privacy-note"><span>◉</span><span>Local by default<br /><small>Files stay on this device</small></span></div>
        </div>
        {showWorkspace ? <>
          <div className="mode-tabs nav nav-pills mb-3" role="tablist">
            <button className={activeView === 'Convert' ? 'mode nav-link active' : 'mode nav-link'} onClick={() => setActiveView('Convert')}>Convert formats</button>
            <button className={activeView === 'Compress' ? 'mode nav-link active' : 'mode nav-link'} onClick={() => setActiveView('Compress')}>Compress files</button>
          </div>
          <FileDropzone isDragging={isDragging} onFiles={addFiles} onDraggingChange={setIsDragging} />
          <FormatControls format={format} quality={quality} disabled={!items.length || isConverting} onFormatChange={setFormat} onQualityChange={setQuality} onConvert={convertBatch} />
          {items.length > 0 && <QueueList items={items} onDownload={downloadItem} onDownloadBatch={downloadBatch} />}
        </> : <section className="empty-state"><span className="empty-icon">◌</span><h2>No recent files</h2><p>Your converted and compressed files will appear here.</p></section>}
      </section>
      <footer><span>File Utility · private file tools</span><span>Web ready · desktop and mobile compatible</span></footer>
    </main>
  )
}

function withoutExtension(name: string) {
  return name.replace(/\.[^.]+$/, '')
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export default App

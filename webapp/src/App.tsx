import { useState } from 'react'
import JSZip from 'jszip'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { FileDropzone } from './components/FileDropzone'
import { FormatControls } from './components/FormatControls'
import { QueueList } from './components/QueueList'
import type { OutputFormat, QueueItem } from './types'
import './App.css'

GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const supportedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']

type View = 'Convert' | 'Compress' | 'Recent'

function App() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [format, setFormat] = useState<OutputFormat>('jpg')
  const [quality, setQuality] = useState(82)
  const [activeView, setActiveView] = useState<View>('Convert')
  const [isDragging, setIsDragging] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  const addFiles = (files: File[]) => {
    const accepted = files.filter((file) => supportedTypes.includes(file.type) || file.name.toLowerCase().endsWith('.pdf'))
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
    createCanvas(item.file).then(async (canvas) => {
      updateItem(item.id, { progress: 55 })
      const blob = await encodeCanvas(canvas, item.file.size, format, quality)
      if (!blob) {
        updateItem(item.id, { status: 'Error', progress: 0, message: 'Could not create output' })
      } else {
        const sizeChange = Math.round((1 - blob.size / item.file.size) * 100)
        const message = item.file.type === 'application/pdf' ? `page 1 converted · ${formatBytes(blob.size)}` : `${sizeChange}% size change · ${formatBytes(blob.size)}`
        updateItem(item.id, { status: 'Done', progress: 100, output: blob, message })
      }
      resolve()
    }).catch(() => {
      updateItem(item.id, { status: 'Error', progress: 0, message: 'Could not read file' })
      resolve()
    })
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
        <div className="brand"><span className="brand-mark">↗</span><span>Formatly</span></div>
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
      <footer><span>Formatly · private file tools</span><span>Web ready · desktop and mobile compatible</span></footer>
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

async function createCanvas(file: File) {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    const pdfDocument = await getDocument({ data: await file.arrayBuffer() }).promise
    const page = await pdfDocument.getPage(1)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    await page.render({ canvas, viewport }).promise
    return canvas
  }

  const source = URL.createObjectURL(file)
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = reject
      element.src = source
    })
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    canvas.getContext('2d')?.drawImage(image, 0, 0)
    return canvas
  } finally {
    URL.revokeObjectURL(source)
  }
}

async function encodeCanvas(source: HTMLCanvasElement, sourceSize: number, format: OutputFormat, requestedQuality: number) {
  let canvas = source
  let blob = await canvasToBlob(canvas, format, requestedQuality)
  for (let attempt = 0; blob && blob.size > sourceSize && attempt < 3; attempt += 1) {
    const scale = 0.8
    const resized = document.createElement('canvas')
    resized.width = Math.max(1, Math.floor(canvas.width * scale))
    resized.height = Math.max(1, Math.floor(canvas.height * scale))
    resized.getContext('2d')?.drawImage(canvas, 0, 0, resized.width, resized.height)
    canvas = resized
    blob = await canvasToBlob(canvas, format, Math.max(45, requestedQuality - (attempt + 1) * 12))
  }
  return blob
}

function canvasToBlob(canvas: HTMLCanvasElement, format: OutputFormat, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, `image/${format}`, format === 'jpg' ? quality / 100 : undefined)
  })
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default App

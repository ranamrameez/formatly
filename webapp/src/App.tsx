import { useState } from 'react'
import JSZip from 'jszip'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { FileDropzone } from './components/FileDropzone'
import { FormatControls } from './components/FormatControls'
import { QueueList } from './components/QueueList'
import { SettingsPanel } from './components/SettingsPanel'
import type { OutputFormat, ProcessingMode, QueueItem } from './types'
import './App.css'

GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const supportedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']

type View = 'Convert' | 'Compress' | 'Recent'

function App() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [format, setFormat] = useState<OutputFormat>('jpg')
  const [quality, setQuality] = useState(90)
  const [activeView, setActiveView] = useState<View>('Convert')
  const [isDragging, setIsDragging] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const processingMode: ProcessingMode = activeView === 'Compress' ? 'compress' : 'convert'

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
    if (newItems.length > 0) void processItems(newItems, processingMode)
  }

  const processBatch = async () => {
    await processItems(items.filter((entry) => entry.status !== 'Done'), processingMode)
  }

  const processItems = async (batchItems: QueueItem[], mode: ProcessingMode) => {
    if (isConverting || !batchItems.length) return
    setIsConverting(true)
    for (const item of batchItems) {
      await processItem(item, mode)
    }
    setIsConverting(false)
  }

  const processItem = (item: QueueItem, mode: ProcessingMode) => new Promise<void>((resolve) => {
    updateItem(item.id, { status: 'Converting', progress: 10, message: undefined })
    if (mode === 'compress' && isPdf(item.file)) {
      updateItem(item.id, { status: 'Error', progress: 0, message: 'PDF compression is not available in the browser yet' })
      resolve()
      return
    }
    createOutput(item.file, mode, format, quality).then(async ({ blob, outputName, pageCount }) => {
      if (!blob) {
        updateItem(item.id, { status: 'Error', progress: 0, message: 'Could not create output' })
      } else {
        const sizeChange = Math.round((1 - blob.size / item.file.size) * 100)
        const pageMessage = pageCount ? `${pageCount} pages converted` : mode === 'compress' ? 'compressed locally' : 'converted locally'
        updateItem(item.id, { status: 'Done', progress: 100, output: blob, outputName, message: `${pageMessage} · ${sizeChange}% size change · ${formatBytes(blob.size)}` })
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
    downloadBlob(item.output, item.outputName ?? `${withoutExtension(item.file.name)}.${format}`)
  }

  const downloadBatch = async () => {
    const zip = new JSZip()
    items.filter((item) => item.status === 'Done' && item.output).forEach((item) => {
      zip.file(item.outputName ?? `${withoutExtension(item.file.name)}.${format}`, item.output!)
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
        <button className={isSettingsOpen ? 'icon-button active' : 'icon-button'} title="Settings" aria-label="Settings" onClick={() => setIsSettingsOpen((open) => !open)}>⚙</button>
      </header>
      <section className="workspace">
        <div className="intro">
          <div>
            <p className="eyebrow">{activeView === 'Compress' ? 'FILE OPTIMIZATION' : 'DOCUMENT WORKBENCH'}</p>
            <h1>{activeView === 'Recent' ? 'Your recent work' : activeView === 'Compress' ? 'Shrink files with control.' : 'Move files between formats.'}</h1>
            <p className="subtitle">{activeView === 'Compress' ? 'Reduce file size while keeping your files useful.' : 'Convert, preview, and batch-download files without sending them anywhere.'}</p>
          </div>
          <div className="privacy-note"><span className="privacy-mark" aria-hidden="true">⌂</span><span>Local by default<br /><small>Files stay on this device</small></span></div>
        </div>
        {showWorkspace ? <>
          <div className="mode-tabs nav nav-pills mb-3" role="tablist">
            <button className={activeView === 'Convert' ? 'mode nav-link active' : 'mode nav-link'} onClick={() => setActiveView('Convert')}>Convert formats</button>
            <button className={activeView === 'Compress' ? 'mode nav-link active' : 'mode nav-link'} onClick={() => setActiveView('Compress')}>Compress files</button>
          </div>
          {isSettingsOpen && <SettingsPanel quality={quality} onQualityChange={setQuality} onClose={() => setIsSettingsOpen(false)} />}
          <FileDropzone isDragging={isDragging} onFiles={addFiles} onDraggingChange={setIsDragging} />
          <FormatControls format={format} mode={processingMode} quality={quality} disabled={!items.length || isConverting} onFormatChange={setFormat} onQualityChange={setQuality} onConvert={processBatch} onReset={() => setItems([])} />
          {items.length > 0 && <QueueList items={items} onDownload={downloadItem} onDownloadBatch={downloadBatch} />}
        </> : <section className="empty-state"><span className="empty-icon">◌</span><h2>No recent files</h2><p>Your converted and compressed files will appear here.</p></section>}
      </section>
      <footer><span>Formatly · private file tools</span></footer>
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

async function createOutput(file: File, mode: ProcessingMode, selectedFormat: OutputFormat, selectedQuality: number) {
  if (isPdf(file)) {
    const pdfDocument = await getDocument({ data: await file.arrayBuffer() }).promise
    const archive = new JSZip()
    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      await page.render({ canvas, viewport }).promise
      const blob = await encodeCanvas(canvas, file.size / pdfDocument.numPages, selectedFormat, selectedQuality)
      if (!blob) return { blob: null }
      archive.file(`${withoutExtension(file.name)}-page-${pageNumber}.${selectedFormat}`, blob)
    }
    return { blob: await archive.generateAsync({ type: 'blob' }), outputName: `${withoutExtension(file.name)}-pages.zip`, pageCount: pdfDocument.numPages }
  }

  const canvas = await createImageCanvas(file)
  const outputFormat = mode === 'compress' ? sourceFormat(file) : selectedFormat
  const blob = await encodeCanvas(canvas, file.size, outputFormat, selectedQuality)
  return { blob, outputName: `${withoutExtension(file.name)}.${outputFormat}`, pageCount: 0 }
}

async function createImageCanvas(file: File) {
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
    canvas.toBlob(resolve, format === 'jpg' ? 'image/jpeg' : `image/${format}`, format === 'png' ? undefined : quality / 100)
  })
}

function isPdf(file: File) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

function sourceFormat(file: File): OutputFormat {
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default App

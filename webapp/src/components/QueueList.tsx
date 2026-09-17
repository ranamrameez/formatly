import type { QueueItem } from '../types'
import { AlertCircle, Check, Circle, Download, LoaderCircle } from 'lucide-react'

type QueueListProps = {
  items: QueueItem[]
  onDownload: (item: QueueItem) => void
  onDownloadBatch: () => void
}

export function QueueList({ items, onDownload, onDownloadBatch }: QueueListProps) {
  const completedCount = items.filter((item) => item.status === 'Done' || item.status === 'Error').length
  const batchProgress = items.length ? Math.round(items.reduce((sum, item) => sum + item.progress, 0) / items.length) : 0
  const completedItems = items.filter((item) => item.status === 'Done')

  return (
    <section className="queue card border-0" aria-live="polite">
      <div className="queue-heading card-header bg-transparent d-flex flex-wrap justify-content-between align-items-center gap-2">
        <h2 className="h6 mb-0">Batch queue <span className="badge rounded-pill text-bg-success">{items.length}</span></h2>
        <div className="queue-actions d-flex align-items-center gap-3">
          <span className="text-secondary">{completedCount}/{items.length} complete · {batchProgress}%</span>
          <button className="download-button btn btn-link btn-sm p-0" disabled={!completedItems.length} onClick={onDownloadBatch}>Download batch</button>
        </div>
      </div>
      <div className="batch-progress progress" role="progressbar" aria-valuenow={batchProgress} aria-valuemin={0} aria-valuemax={100}><span className={`progress-bar ${progressClass(batchProgress)}`} /></div>
      {items.map((item) => (
        <div className="file-row row align-items-center g-3" key={item.id}>
          <div className="file-icon col-auto">{item.file.name.split('.').pop()?.toUpperCase()}</div>
          <div className="file-meta col min-w-0">
            <strong title={item.file.name}>{item.file.name}</strong>
            <SizeMetrics item={item} />
            <div className="item-progress progress" role="progressbar" aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
              <span className={`progress-bar ${progressClass(item.progress)}`} />
              <span className="progress-status">{item.message ?? 'Waiting to process'}</span>
            </div>
          </div>
          <StatusPill status={item.status} />
          {item.status === 'Done' && <button className="download-button btn btn-outline-success btn-sm col-auto" onClick={() => onDownload(item)} title="Download this file"><Download size={14} /> Download {downloadChange(item)}</button>}
        </div>
      ))}
    </section>
  )
}

function SizeMetrics({ item }: { item: QueueItem }) {
  const finalSize = item.output?.size
  const difference = finalSize === undefined ? undefined : finalSize - item.file.size

  return (
    <div className="size-metrics d-flex justify-content-between align-items-center text-secondary small">
      <Metric label="Initial" value={formatBytes(item.file.size)} />
      <div className="size-metric-group d-flex gap-3">
        <Metric label="Difference" value={difference === undefined ? '-' : formatSignedBytes(difference)} />
      </div>
      <Metric label="Final" value={finalSize === undefined ? '-' : formatBytes(finalSize)} align="end" />
    </div>
  )
}

function StatusPill({ status }: { status: QueueItem['status'] }) {
  const Icon = status === 'Done' ? Check : status === 'Error' ? AlertCircle : status === 'Converting' ? LoaderCircle : Circle
  return <span className={`status-pill status-${status.toLowerCase()}`} title={status} aria-label={status}><Icon size={15} /></span>
}

function downloadChange(item: QueueItem) {
  if (!item.output) return ''
  const change = Math.round((1 - item.output.size / item.file.size) * 100)
  return `${change >= 0 ? '-' : '+'}${Math.abs(change)}%`
}

function Metric({ label, value, align = 'start' }: { label: string; value: string; align?: 'start' | 'end' }) {
  return <div className={`size-pill text-${align}`}><span className="metrics-label">{label}</span><strong className="text-body">{value}</strong></div>
}

function formatBytes(bytes: number) {
  bytes = Math.abs(bytes)
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatSignedBytes(bytes: number) {
  return `${bytes > 0 ? '+' : bytes < 0 ? '-' : ''}${formatBytes(bytes)}`
}

function progressClass(value: number) {
  return `progress-${Math.min(100, Math.max(0, Math.round(value / 5) * 5))}`
}

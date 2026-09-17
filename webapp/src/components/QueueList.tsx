import type { QueueItem } from '../types'

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
      <div className="batch-progress progress" role="progressbar" aria-valuenow={batchProgress} aria-valuemin={0} aria-valuemax={100}><span className="progress-bar bg-warning" style={{ width: `${batchProgress}%` }} /></div>
      {items.map((item) => (
        <div className="file-row row align-items-center g-3" key={item.id}>
          <div className="file-icon col-auto">{item.file.name.split('.').pop()?.toUpperCase()}</div>
          <div className="file-meta col min-w-0">
            <strong title={item.file.name}>{item.file.name}</strong>
            <span>{formatBytes(item.file.size)}{item.message ? ` · ${item.message}` : ''}</span>
            <div className="item-progress progress"><span className="progress-bar bg-warning" style={{ width: `${item.progress}%` }} /></div>
          </div>
          <span className={`status ${item.status.toLowerCase()}`}>{item.status}</span>
          {item.status === 'Done' && <button className="download-button btn btn-link btn-sm col-auto" onClick={() => onDownload(item)}>Download</button>}
        </div>
      ))}
    </section>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
